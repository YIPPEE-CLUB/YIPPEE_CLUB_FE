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
  it('아이 서비스의 등록·직접 조회·수정·선택·삭제를 실제 서버 없이 확인한다', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const preview = await import('./preview-session');
    const children = await import('../services/children');
    preview.createPreviewSession('preview@example.com');
    expect((await children.getChild(-1)).name).toBe('도영이');
    const created = await children.createChild({
      name: '새 아이',
      birth_date: '2023-01-01',
      gender: '',
      interests: [1],
    });
    await children.updateChild(created.id, {
      name: '수정한 아이',
      birth_date: '2023-01-01',
      gender: '',
      interests: [],
    });
    expect((await children.getChild(created.id)).interests).toEqual([]);
    expect((await children.selectChild(created.id)).active_child_id).toBe(
      created.id,
    );
    await children.deleteChild(created.id);
    expect(
      (await children.listChildren()).some((child) => child.id === created.id),
    ).toBe(false);
    await expect(children.getChild(created.id)).rejects.toThrow(
      '아이를 찾을 수 없어요.',
    );
    expect(fetch).not.toHaveBeenCalled();
  });
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
