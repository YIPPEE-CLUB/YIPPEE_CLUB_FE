import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '../lib/api';
import { requestPasswordReset, confirmPasswordReset } from './password-reset';
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
