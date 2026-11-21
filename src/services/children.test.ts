import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '../lib/api';
import {
  listChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  selectChild,
  childInputError,
  type ChildInput,
} from './children';

afterEach(() => vi.resetAllMocks());
const input: ChildInput = {
  name: '아이',
  birth_date: '2023-11-21',
  gender: '',
  interests: [2, 7],
};
const now = new Date('2026-11-20T15:00:00Z');

it('아이 목록은 페이지 번호 없이 results 배열을 읽는다', async () => {
  vi.mocked(apiRequest).mockResolvedValueOnce({
    results: [{ id: 1, ...input }],
  });
  await expect(listChildren()).resolves.toEqual([{ id: 1, ...input }]);
  expect(apiRequest).toHaveBeenCalledWith('/children', { signal: undefined });
});

it('직접 수정 진입은 목록 캐시 없이 상세 API를 조회한다', async () => {
  const controller = new AbortController();
  await getChild(3, controller.signal);
  expect(apiRequest).toHaveBeenCalledWith('/children/3', {
    signal: controller.signal,
  });
});

it('등록은 정수 카테고리와 비선택 성별을 전송한다', async () => {
  await createChild(input);
  expect(apiRequest).toHaveBeenCalledWith('/children', {
    method: 'POST',
    body: JSON.stringify(input),
  });
});

it('부분 수정에서 생략한 필드는 추가하지 않고 빈 관심사는 전송한다', async () => {
  await updateChild(3, { interests: [] });
  expect(apiRequest).toHaveBeenCalledWith('/children/3', {
    method: 'PATCH',
    body: JSON.stringify({ interests: [] }),
  });
});

it('삭제는 아이 ID로 요청하고 204 응답을 허용한다', async () => {
  vi.mocked(apiRequest).mockResolvedValueOnce(undefined);
  await expect(deleteChild(3)).resolves.toBeUndefined();
  expect(apiRequest).toHaveBeenCalledWith('/children/3', { method: 'DELETE' });
});

it('선택은 PUT 성공 응답의 active_child_id를 사용한다', async () => {
  vi.mocked(apiRequest).mockResolvedValueOnce({ active_child_id: 3 });
  await expect(selectChild(3)).resolves.toEqual({ active_child_id: 3 });
  expect(apiRequest).toHaveBeenCalledWith('/users/me/active-child', {
    method: 'PUT',
    body: JSON.stringify({ child_id: 3 }),
  });
});

it('없는 아이·타인 아이 오류를 성공으로 처리하지 않는다', async () => {
  vi.mocked(apiRequest).mockRejectedValueOnce(new Error('찾을 수 없어요.'));
  await expect(getChild(999)).rejects.toThrow('찾을 수 없어요.');
  vi.mocked(apiRequest).mockRejectedValueOnce(
    new Error('본인의 아이를 선택해 주세요.'),
  );
  await expect(selectChild(999)).rejects.toThrow('본인의 아이');
});

it.each(['2024-02-30', '2023-02-29', '2023-13-01', '2026-11-22'])(
  '유효하지 않거나 미래인 생년월일을 거부한다: %s',
  (birth_date) => {
    expect(childInputError({ ...input, birth_date }, true, now)).not.toBe('');
  },
);

it.each(['2025-11-21', '2020-11-21', '2020-10-22'])(
  '한국 날짜 기준 12~72개월 경계의 등록을 허용한다: %s',
  (birth_date) => {
    expect(childInputError({ ...input, birth_date }, true, now)).toBe('');
  },
);

it.each(['2025-11-22', '2020-10-21'])(
  '등록 월령 범위 밖은 거부한다: %s',
  (birth_date) => {
    expect(childInputError({ ...input, birth_date }, true, now)).not.toBe('');
  },
);

it('기존 아이가 나이가 들어도 정보 수정은 차단하지 않는다', () => {
  expect(
    childInputError({ ...input, birth_date: '2010-01-01' }, false, now),
  ).toBe('');
  expect(childInputError({ ...input, name: ' ' }, false, now)).toContain(
    '이름',
  );
});
