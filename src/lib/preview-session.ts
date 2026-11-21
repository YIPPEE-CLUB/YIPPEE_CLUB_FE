import { sampleActivities } from '../data/activities';
import type { User } from '../context/AuthContext';
import type { Child } from '../context/ChildrenContext';

// 화면 검토 전용 세션. 실제 인증 토큰을 만들거나 백엔드 권한을 부여하지 않습니다.
export const previewLoginEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN === 'true';
const key = 'yippee.preview.session';
interface PreviewSession {
  user: User;
  children: Child[];
  favorites: number[];
}
export function readPreviewSession(): PreviewSession | null {
  if (!previewLoginEnabled || typeof window === 'undefined') return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null');
    return value?.user?.id === -1 &&
      typeof value.user.email === 'string' &&
      Array.isArray(value.children) &&
      Array.isArray(value.favorites)
      ? value
      : null;
  } catch {
    return null;
  }
}
export function createPreviewSession(email: string): User {
  if (!previewLoginEnabled)
    throw new Error('가로그인은 개발 환경에서만 사용할 수 있어요.');
  const normalized = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    throw new Error('이메일 형식을 확인해 주세요.');
  const birth = new Date();
  const session: PreviewSession = {
    user: {
      id: -1,
      email: normalized,
      phone: '',
      name: normalized.split('@')[0],
      nickname: '부모님',
      active_child_id: -1,
    },
    children: [
      {
        id: -1,
        name: '도영이',
        birth_date: `${birth.getFullYear() - 3}-01-01`,
        gender: 'male',
        interests: [],
      },
    ],
    favorites: [],
  };
  sessionStorage.setItem(key, JSON.stringify(session));
  return session.user;
}
export function clearPreviewSession() {
  sessionStorage.removeItem(key);
}

export function previewRequest(
  session: PreviewSession,
  path: string,
  options: RequestInit,
): unknown {
  const route = path.split('?')[0].replace(/\/$/, '');
  const method = (options.method || 'GET').toUpperCase();
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
  const page = (results: unknown[]) => ({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
  const save = () => sessionStorage.setItem(key, JSON.stringify(session));
  if (route === '/users/me' && method === 'GET') return session.user;
  if (route === '/users/me' && method === 'PATCH') {
    session.user.name = body.name ?? session.user.name;
    session.user.nickname = body.nickname ?? session.user.nickname;
    save();
    const { id, email, phone, name, nickname } = session.user;
    return { id, email, phone, name, nickname };
  }
  if (route === '/users/me/active-child' && method === 'PUT') {
    if (!session.children.some((child) => child.id === body.child_id))
      throw new Error('아이를 찾을 수 없어요.');
    session.user.active_child_id = body.child_id;
    save();
    return { active_child_id: session.user.active_child_id };
  }
  if (route === '/children' && method === 'GET') return page(session.children);
  if (/^\/children\/-?\d+$/.test(route) && method === 'GET') {
    const child = session.children.find(
      (item) => item.id === Number(route.split('/').pop()),
    );
    if (!child) throw new Error('아이를 찾을 수 없어요.');
    return child;
  }
  if (route === '/activity-categories' && method === 'GET')
    return page(
      [
        'writing',
        'painting',
        'craft',
        'drawing',
        'dance',
        'gross_motor',
        'fine_motor',
        'reading',
        'shop',
        'role',
        'korean',
        'english',
        'number',
        'explore',
        'hanja',
      ].map((code, index) => ({ id: index + 1, code, name: code })),
    );
  if (
    (route === '/children' && method === 'POST') ||
    (/^\/children\/-?\d+$/.test(route) && method === 'PATCH')
  ) {
    const birth = new Date(`${body.birth_date}T00:00:00Z`);
    if (
      !body.name?.trim() ||
      Number.isNaN(birth.getTime()) ||
      birth.toISOString().slice(0, 10) !== body.birth_date
    )
      throw new Error('아이 이름과 생년월일을 확인해 주세요.');
    if (method === 'POST') {
      const child = {
        id: Date.now(),
        name: body.name,
        gender: body.gender,
        birth_date: body.birth_date,
        interests: body.interests || [],
      };
      session.children.push(child);
      save();
      return child;
    }
    const child = session.children.find(
      (child) => child.id === Number(route.split('/').pop()),
    );
    if (!child) throw new Error('아이를 찾을 수 없어요.');
    Object.assign(child, {
      name: body.name,
      gender: body.gender,
      birth_date: body.birth_date,
      interests: body.interests || [],
    });
    save();
    return child;
  }
  if (/^\/children\/-?\d+$/.test(route) && method === 'DELETE') {
    const id = Number(route.split('/').pop());
    session.children = session.children.filter((child) => child.id !== id);
    if (session.user.active_child_id === id)
      session.user.active_child_id = null;
    save();
    return undefined;
  }
  if (route === '/activities' && method === 'GET')
    return page(sampleActivities);
  if (route === '/favorites' && method === 'GET')
    return page(
      sampleActivities.filter((item) => session.favorites.includes(item.id)),
    );
  if (route === '/favorites' && method === 'POST') {
    if (!session.favorites.includes(body.activity_id))
      session.favorites.push(body.activity_id);
    save();
    return {};
  }
  if (route.startsWith('/favorites/') && method === 'DELETE') {
    session.favorites = session.favorites.filter(
      (id) => id !== Number(route.split('/').pop()),
    );
    save();
    return undefined;
  }
  if (route === '/purchases/activities' && method === 'GET') return page([]);
  if (route === '/cart' && method === 'GET') return { items: [] };
  // 가로그인 중 나머지 요청은 실제 서버로 전달하지 않습니다.
  throw new Error('가로그인에서는 이 기능을 사용할 수 없어요.');
}
