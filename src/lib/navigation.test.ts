import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { backOffset, readNavigation, recordNavigation } from './navigation';

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());

it('홈에서 만세도감에 들어가면 홈으로 돌아간다', () => {
  recordNavigation(0, { key: 'home', path: '/' }, 'POP');
  recordNavigation(1, { key: 'badges', path: '/badges' }, 'PUSH');
  expect(
    backOffset(readNavigation(), 1, { key: 'badges', path: '/badges' }),
  ).toBe(-1);
});

it('마이페이지에서 진입한 만세도감은 마이페이지로 돌아간다', () => {
  recordNavigation(0, { key: 'profile', path: '/profile' }, 'POP');
  recordNavigation(1, { key: 'badges', path: '/badges' }, 'PUSH');
  expect(readNavigation()[0].path).toBe('/profile');
  expect(
    backOffset(readNavigation(), 1, { key: 'badges', path: '/badges' }),
  ).toBe(-1);
});

it('직접 접속·알 수 없는 이력·다른 탭의 키에는 기본 경로를 사용한다', () => {
  expect(backOffset({}, 0, { key: 'direct', path: '/badges' })).toBeNull();
  expect(backOffset({}, 5, { key: 'direct', path: '/badges' })).toBeNull();
  expect(
    backOffset({ 1: { key: 'other', path: '/badges' } }, 1, {
      key: 'current',
      path: '/badges',
    }),
  ).toBeNull();
});

it('저장 후 교체된 화면과 같은 이전 화면은 건너뛴다', () => {
  recordNavigation(0, { key: 'home', path: '/' }, 'POP');
  recordNavigation(1, { key: 'list', path: '/children' }, 'PUSH');
  recordNavigation(2, { key: 'form', path: '/children/new' }, 'PUSH');
  recordNavigation(2, { key: 'saved', path: '/children' }, 'REPLACE');
  expect(
    backOffset(readNavigation(), 2, { key: 'saved', path: '/children' }),
  ).toBe(-2);
});

it('검색 필터 쿼리를 포함한 이전 URL을 유지하고 새 분기에서는 앞으로 이력을 버린다', () => {
  recordNavigation(
    0,
    { key: 'search', path: '/activities?q=공룡&category=AI' },
    'POP',
  );
  recordNavigation(1, { key: 'detail', path: '/activities/1' }, 'PUSH');
  recordNavigation(2, { key: 'viewer', path: '/viewer/1' }, 'PUSH');
  recordNavigation(1, { key: 'new-detail', path: '/activities/2' }, 'PUSH');
  expect(readNavigation()[0].path).toBe('/activities?q=공룡&category=AI');
  expect(readNavigation()[2]).toBeUndefined();
});

it('외부 경로로 나가지 않으며 저장소 차단도 허용한다', () => {
  expect(
    backOffset(
      {
        0: { key: 'outside', path: '//example.com' },
        1: { key: 'current', path: '/badges' },
      },
      1,
      { key: 'current', path: '/badges' },
    ),
  ).toBeNull();
  vi.stubGlobal('sessionStorage', {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  });
  expect(readNavigation()).toEqual({});
  expect(() =>
    recordNavigation(0, { key: 'current', path: '/badges' }, 'POP'),
  ).not.toThrow();
});
