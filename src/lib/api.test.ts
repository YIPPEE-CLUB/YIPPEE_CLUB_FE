import { afterEach, beforeEach, expect, it, vi } from 'vitest';

let api: typeof import('./api');
let fetcher: ReturnType<typeof vi.fn>;
const tokens = { access_token: 'old-access', refresh_token: 'refresh' };
const fresh = { access_token: 'new-access', refresh_token: 'refresh' };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN', 'false');
  const storage = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal('window', { dispatchEvent: vi.fn() });
  fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  api = await import('./api');
  api.saveTokens(tokens);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it('잘못된 저장 데이터는 인증 세션으로 사용하지 않는다', () => {
  sessionStorage.setItem('yippee.local.session', '{"access_token":1}');
  expect(api.readTokens()).toBeNull();
});

it('로그인 요청은 기존 토큰을 첨부하거나 갱신하지 않는다', async () => {
  fetcher.mockResolvedValue(json({ message: '로그인 실패' }, 401));
  await expect(
    api.apiRequest('auth/login', { method: 'POST', body: '{}' }),
  ).rejects.toMatchObject({ status: 401 });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][1].headers.has('Authorization')).toBe(false);
  expect(api.readTokens()).toEqual(tokens);
});

it('동시 인증 만료는 한 번만 갱신하고 각 요청을 재시도한다', async () => {
  let resolveRefresh!: (value: Response) => void;
  fetcher.mockImplementation((url: string, options: RequestInit) => {
    if (url.endsWith('/auth/token/refresh'))
      return new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      });
    return Promise.resolve(
      new Headers(options.headers).get('Authorization') === 'Bearer new-access'
        ? json({ ok: true })
        : json({}, 401),
    );
  });
  const requests = [api.apiRequest('/users/me'), api.apiRequest('/children')];
  await vi.waitFor(() => expect(resolveRefresh).toBeDefined());
  resolveRefresh(json(fresh));
  await expect(Promise.all(requests)).resolves.toEqual([
    { ok: true },
    { ok: true },
  ]);
  expect(
    fetcher.mock.calls.filter(([url]) => url.endsWith('/auth/token/refresh')),
  ).toHaveLength(1);
  expect(api.readTokens()).toEqual(fresh);
});

it('갱신 토큰 거부는 세션을 지우고 만료를 알린다', async () => {
  fetcher.mockResolvedValue(json({}, 401));
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({
    status: 401,
  });
  expect(api.readTokens()).toBeNull();
  expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
});

it('갱신 서버 오류는 재시도할 수 있도록 세션을 보존한다', async () => {
  fetcher
    .mockResolvedValueOnce(json({}, 401))
    .mockResolvedValueOnce(json({}, 503));
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({
    status: 503,
  });
  expect(api.readTokens()).toEqual(tokens);
  expect(window.dispatchEvent).not.toHaveBeenCalled();
});

it('갱신 중 로그아웃하면 늦은 응답이 세션을 되살리지 않는다', async () => {
  let resolveRefresh!: (value: Response) => void;
  fetcher.mockResolvedValueOnce(json({}, 401)).mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      }),
  );
  const request = api.apiRequest('/users/me');
  const rejected = expect(request).rejects.toMatchObject({
    code: 'SESSION_CHANGED',
  });
  await vi.waitFor(() => expect(resolveRefresh).toBeDefined());
  api.saveTokens(null);
  resolveRefresh(json(fresh));
  await rejected;
  expect(api.readTokens()).toBeNull();
});

it('재시도도 인증 거부이면 반복하지 않고 세션을 종료한다', async () => {
  fetcher
    .mockResolvedValueOnce(json({}, 401))
    .mockResolvedValueOnce(json(fresh))
    .mockResolvedValueOnce(json({}, 401));
  await expect(api.apiRequest('/users/me')).rejects.toMatchObject({
    status: 401,
  });
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(api.readTokens()).toBeNull();
});

it('서버 필드 오류와 요청 제한 메시지를 전달한다', async () => {
  fetcher.mockResolvedValue(
    json(
      {
        code: 'RATE_LIMITED',
        message: '잠시 후 다시 시도해 주세요.',
        details: { email: ['발송 횟수를 초과했어요.'] },
      },
      429,
    ),
  );
  await expect(
    api.apiRequest('/auth/verification/send', { method: 'POST', body: '{}' }),
  ).rejects.toMatchObject({
    status: 429,
    code: 'RATE_LIMITED',
    message: '발송 횟수를 초과했어요.',
  });
});
