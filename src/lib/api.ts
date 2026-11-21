import { readPreviewSession, previewRequest } from './preview-session';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
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
let refreshingFor: string | null = null;

// 실제 인증 세션은 현재 탭에서만 유지합니다. 토큰은 로그에 출력하지 않습니다.
export function readTokens(): Tokens | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
    return value &&
      typeof value.access_token === 'string' &&
      value.access_token &&
      typeof value.refresh_token === 'string' &&
      value.refresh_token
      ? value
      : null;
  } catch {
    return null;
  }
}
export function saveTokens(tokens: Tokens | null) {
  if (tokens) sessionStorage.setItem(sessionKey, JSON.stringify(tokens));
  else sessionStorage.removeItem(sessionKey);
}

async function request(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    if (init.signal?.aborted) throw cause;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      '서버에 연결하지 못했어요. 네트워크 상태를 확인하고 다시 시도해 주세요.',
    );
  }
}

function expireSession(previous: Tokens) {
  if (readTokens()?.refresh_token !== previous.refresh_token) return;
  saveTokens(null);
  window.dispatchEvent(new Event('yippee:session-expired'));
}

async function renew(): Promise<Tokens> {
  const previous = readTokens();
  if (refreshing && previous?.refresh_token === refreshingFor)
    return refreshing;
  if (!previous)
    throw new ApiError(401, 'AUTHENTICATION_REQUIRED', '로그인이 필요해요.');
  const pending = (async () => {
    const response = await request(`${baseUrl}/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: previous.refresh_token }),
    });
    if (!response.ok) {
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        expireSession(previous);
        throw new ApiError(
          401,
          'AUTHENTICATION_REQUIRED',
          '로그인이 만료됐어요. 다시 로그인해 주세요.',
        );
      }
      throw new ApiError(
        response.status,
        'SERVICE_UNAVAILABLE',
        '일시적으로 로그인 상태를 확인하지 못했어요. 다시 시도해 주세요.',
      );
    }
    const tokens: Tokens = await response.json();
    if (!tokens.access_token || !tokens.refresh_token)
      throw new ApiError(502, 'INVALID_RESPONSE', '인증 응답을 확인해 주세요.');
    if (readTokens()?.refresh_token !== previous.refresh_token)
      throw new ApiError(
        401,
        'SESSION_CHANGED',
        '세션이 변경됐어요. 다시 시도해 주세요.',
      );
    saveTokens(tokens);
    return tokens;
  })();
  refreshing = pending;
  refreshingFor = previous.refresh_token;
  try {
    return await pending;
  } finally {
    if (refreshing === pending) {
      refreshing = null;
      refreshingFor = null;
    }
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const route = `/${path.replace(/^\//, '')}`;
  const publicAuth = route.startsWith('/auth/');
  const previous = readTokens();
  const preview = readPreviewSession();
  if (preview && !publicAuth) {
    if (options.signal?.aborted)
      throw new DOMException('Aborted', 'AbortError');
    return previewRequest(preview, path, options) as T;
  }
  const { accessToken, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  const token =
    accessToken || (!publicAuth ? previous?.access_token : undefined);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = `${baseUrl}/${path.replace(/^\//, '')}`;
  let response = await request(url, { ...init, headers });
  // 만료 응답을 기준으로 갱신하므로 사용자 PC의 시간 차이에 의존하지 않습니다.
  if (response.status === 401 && token && !publicAuth && previous) {
    const current = readTokens();
    if (current?.refresh_token !== previous.refresh_token)
      throw new ApiError(
        401,
        'SESSION_CHANGED',
        '세션이 변경됐어요. 다시 시도해 주세요.',
      );
    const renewed = current.access_token !== token ? current : await renew();
    headers.set('Authorization', `Bearer ${renewed.access_token}`);
    response = await request(url, { ...init, headers });
    if (response.status === 401) expireSession(renewed);
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
      data?.details,
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
