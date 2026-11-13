export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export interface Tokens {
  access_token: string;
  refresh_token: string;
}
const sessionKey = 'yippee.local.session';
const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1').replace(
  /\/$/,
  '',
);
let refreshing: Promise<Tokens> | null = null;

// 개발용 세션은 탭이 닫히면 없어집니다. 실서비스 토큰 저장 정책은 별도 확정합니다.
export function readTokens(): Tokens | null {
  try {
    return JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  } catch {
    return null;
  }
}
export function saveTokens(tokens: Tokens | null) {
  if (tokens) sessionStorage.setItem(sessionKey, JSON.stringify(tokens));
  else sessionStorage.removeItem(sessionKey);
}

async function renew(): Promise<Tokens> {
  if (!refreshing) {
    const previous = readTokens();
    refreshing = (async () => {
      try {
        if (!previous) throw new Error('로그인이 필요해요.');
        const response = await fetch(`${baseUrl}/auth/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: previous.refresh_token }),
        });
        if (!response.ok)
          throw new Error('로그인이 만료됐어요. 다시 로그인해 주세요.');
        const tokens: Tokens = await response.json();
        if (readTokens()?.refresh_token !== previous.refresh_token)
          throw new Error('세션이 변경됐어요.');
        saveTokens(tokens);
        return tokens;
      } catch (error) {
        if (readTokens()?.refresh_token === previous?.refresh_token) {
          saveTokens(null);
          window.dispatchEvent(new Event('yippee:session-expired'));
        }
        throw error;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const token = accessToken || readTokens()?.access_token;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = `${baseUrl}/${path.replace(/^\//, '')}`;
  let response = await fetch(url, { ...init, headers });
  // 만료 응답을 기준으로 갱신하므로 사용자 PC의 시간 차이에 의존하지 않습니다.
  if (response.status === 401 && token && !path.startsWith('/auth/')) {
    headers.set('Authorization', `Bearer ${(await renew()).access_token}`);
    response = await fetch(url, { ...init, headers });
  }
  if (response.status === 204) return undefined as T;
  const data = response.headers.get('content-type')?.includes('json')
    ? await response.json()
    : null;
  if (!response.ok) {
    const details = data?.details
      ? Object.values(data.details)
          .flat()
          .filter((value) => typeof value === 'string')
          .join(' ')
      : '';
    throw new ApiError(
      response.status,
      data?.code || 'REQUEST_FAILED',
      details || data?.message || '요청을 처리하지 못했어요.',
    );
  }
  if (data === null)
    throw new ApiError(
      response.status,
      'INVALID_RESPONSE',
      'API 응답을 확인해 주세요.',
    );
  return data as T;
}
