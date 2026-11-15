import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN', 'true');
  const values = new Map<string, string>();
  vi.stubGlobal('window', {});
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('개발용 가로그인', () => {
  it('이메일을 검증하고 탭 세션에 저장한 뒤 로그아웃으로 제거한다', async () => {
    const preview = await import('./preview-session');
    expect(() => preview.createPreviewSession('잘못된 주소')).toThrow();
    const user = preview.createPreviewSession(' preview@example.com ');
    expect(user.email).toBe('preview@example.com');
    expect(preview.readPreviewSession()?.user).toEqual(user);
    expect(preview.readPreviewSession()?.children[0].id).toBe(
      user.active_child_id,
    );
    preview.clearPreviewSession();
    expect(preview.readPreviewSession()).toBeNull();
  });
  it('프로덕션과 명시적으로 끈 개발 환경에서는 사용할 수 없다', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    let preview = await import('./preview-session');
    expect(preview.previewLoginEnabled).toBe(false);
    expect(() => preview.createPreviewSession('preview@example.com')).toThrow();
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN', 'false');
    preview = await import('./preview-session');
    expect(preview.previewLoginEnabled).toBe(false);
  });
  it('가로그인 요청은 서버에 보내지 않고 찜을 로컬에 반영한다', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const preview = await import('./preview-session');
    const { apiRequest } = await import('./api');
    preview.createPreviewSession('preview@example.com');
    await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ activity_id: 101 }),
    });
    expect(
      (await apiRequest<{ results: { id: number }[] }>('/favorites')).results[0]
        .id,
    ).toBe(101);
    await expect(apiRequest('/payments', { method: 'POST' })).rejects.toThrow(
      '가로그인',
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
