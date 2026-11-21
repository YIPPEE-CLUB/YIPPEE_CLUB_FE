import { apiRequest } from '../lib/api';
export function parseResetLink(
  hash: string,
):
  | { mode: 'request'; token: '' }
  | { mode: 'confirm'; token: string }
  | { mode: 'invalid'; token: '' } {
  if (!hash || hash === '#' || hash === '#main-content')
    return { mode: 'request', token: '' };
  const values = new URLSearchParams(hash.replace(/^#/, '')).getAll(
    'reset_token',
  );
  if (values.length !== 1 || !values[0] || /\s/.test(values[0]))
    return { mode: 'invalid', token: '' };
  return { mode: 'confirm', token: values[0] };
}
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
