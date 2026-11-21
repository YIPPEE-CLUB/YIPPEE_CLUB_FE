import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '../lib/api';
import {
  requestPasswordReset,
  confirmPasswordReset,
  parseResetLink,
} from './password-reset';
afterEach(() => vi.resetAllMocks());
it('uses the email-only reset request contract', async () => {
  await requestPasswordReset(' user@example.com ');
  expect(apiRequest).toHaveBeenCalledWith('/auth/password/reset-request', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@example.com' }),
  });
});
it('sends the email-link token and new password using backend names', async () => {
  await confirmPasswordReset('link-token', 'newPassword123');
  expect(apiRequest).toHaveBeenCalledWith('/auth/password/reset-confirm', {
    method: 'POST',
    body: JSON.stringify({
      reset_token: 'link-token',
      new_password: 'newPassword123',
    }),
  });
});
it('propagates expired token errors without claiming success', async () => {
  vi.mocked(apiRequest).mockRejectedValueOnce(new Error('만료된 링크'));
  await expect(
    confirmPasswordReset('expired', 'newPassword123'),
  ).rejects.toThrow('만료된 링크');
});

it('이메일 링크 토큰은 한 번만 URL 디코딩한다', () => {
  expect(parseResetLink('#reset_token=token%252Bvalue')).toEqual({
    mode: 'confirm',
    token: 'token%2Bvalue',
  });
});

it.each([
  '#reset_token=',
  '#reset_token=a&reset_token=b',
  '#reset_token=two+words',
  '#other=value',
])('잘못되거나 중복된 링크로 재설정을 진행하지 않는다: %s', (hash) => {
  expect(parseResetLink(hash)).toEqual({ mode: 'invalid', token: '' });
});

it('토큰 없는 비밀번호 찾기 경로는 메일 요청 화면으로 연다', () => {
  expect(parseResetLink('')).toEqual({ mode: 'request', token: '' });
});
