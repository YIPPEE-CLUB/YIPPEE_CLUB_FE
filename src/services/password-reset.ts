import { apiRequest } from '../lib/api';
export function requestPasswordReset(email: string) {
  return apiRequest('/auth/password/reset-request', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
}
export function confirmPasswordReset(resetToken: string, newPassword: string) {
  return apiRequest('/auth/password/reset-confirm', {
    method: 'POST',
    body: JSON.stringify({
      reset_token: resetToken,
      new_password: newPassword,
    }),
  });
}
