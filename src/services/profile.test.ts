import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '../lib/api';
import {
  getProfile,
  updateProfile,
  changePassword,
  passwordError,
  mergeProfileUpdate,
} from './profile';

afterEach(() => vi.resetAllMocks());

it('프로필 조회는 BE 응답을 그대로 반환한다', async () => {
  const profile = {
    id: 1,
    email: 'user@example.com',
    name: '보호자',
    phone: '',
    nickname: '보호자',
    active_child_id: 7,
  };
  vi.mocked(apiRequest).mockResolvedValueOnce(profile);
  await expect(getProfile()).resolves.toEqual(profile);
  expect(apiRequest).toHaveBeenCalledWith('/users/me');
});

it('선택 아이가 없는 GET 응답도 null 그대로 보존한다', async () => {
  const profile = {
    id: 1,
    email: 'user@example.com',
    name: '',
    phone: '',
    nickname: '',
    active_child_id: null,
  };
  vi.mocked(apiRequest).mockResolvedValueOnce(profile);
  await expect(getProfile()).resolves.toEqual(profile);
});

it('선택 상태가 없는 PATCH 응답을 병합해도 선택 아이가 지워지지 않는다', () => {
  const current = {
    id: 1,
    email: 'user@example.com',
    name: '기존',
    phone: '',
    nickname: '기존 호칭',
    active_child_id: 7,
  };
  const patch = {
    id: 1,
    email: current.email,
    name: '변경',
    phone: '',
    nickname: '보호자',
  };
  expect(mergeProfileUpdate(current, patch)).toEqual({
    ...patch,
    active_child_id: 7,
  });
  expect(
    mergeProfileUpdate({ ...current, active_child_id: null }, patch)
      .active_child_id,
  ).toBeNull();
});

it('프로필 저장은 조회되지 않은 호칭을 기본값으로 덮어쓰지 않는다', async () => {
  await updateProfile(' 이름 ');
  expect(apiRequest).toHaveBeenCalledWith('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: '이름' }),
  });
});

it('지원하는 호칭은 사용자가 선택한 경우에만 전송한다', async () => {
  await updateProfile('이름', '보호자');
  expect(apiRequest).toHaveBeenCalledWith('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: '이름', nickname: '보호자' }),
  });
});

it('비밀번호 변경은 현재 비밀번호와 새 비밀번호의 공백을 보존한다', async () => {
  await changePassword(' current123 ', ' next1234 ');
  expect(apiRequest).toHaveBeenCalledWith('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({
      current_password: ' current123 ',
      new_password: ' next1234 ',
    }),
  });
});

it('현재 비밀번호 거부와 프로필 저장 오류를 성공으로 처리하지 않는다', async () => {
  vi.mocked(apiRequest).mockRejectedValueOnce(
    new Error('현재 비밀번호를 확인해 주세요.'),
  );
  await expect(changePassword('wrong', 'next1234')).rejects.toThrow(
    '현재 비밀번호',
  );
  vi.mocked(apiRequest).mockRejectedValueOnce(new Error('저장 실패'));
  await expect(updateProfile('이름')).rejects.toThrow('저장 실패');
});

it.each(['short1', 'abcdefgh', '12345678', 'a1' + 'x'.repeat(127)])(
  '비밀번호 정책 위반을 거부한다: %s',
  (password) => {
    expect(passwordError(password, password)).not.toBe('');
  },
);

it('확인 불일치를 거부하고 허용하는 비밀번호는 통과시킨다', () => {
  expect(passwordError('valid123', 'other123')).toContain('일치');
  expect(passwordError('valid123', 'valid123')).toBe('');
});
