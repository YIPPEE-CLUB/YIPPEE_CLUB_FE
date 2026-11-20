import { apiRequest, type Tokens } from '../lib/api';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const post = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });

export function checkEmail(email: string) {
  return post<{ registered: boolean }>('/auth/identifiers/check', {
    identifier: normalizeEmail(email),
  });
}

export function sendSignupCode(email: string) {
  return post<{ verification_id: string; expires_in_seconds: number }>(
    '/auth/verification/send',
    { identifier: normalizeEmail(email), purpose: 'signup' },
  );
}

export function confirmSignupCode(verificationId: string, code: string) {
  return post<{ verification_token: string }>('/auth/verification/confirm', {
    verification_id: verificationId,
    code,
  });
}

export function login(email: string, password: string) {
  return post<Tokens>('/auth/login', {
    email: normalizeEmail(email),
    password,
  });
}

export function signup(
  email: string,
  password: string,
  proof: string,
  agreements: boolean[],
) {
  return post<Tokens>('/auth/signup', {
    identifier: normalizeEmail(email),
    password,
    verification_token: proof,
    agreements: {
      terms: agreements[0],
      privacy: agreements[1],
      age_over_14: agreements[2],
      marketing: agreements[3],
    },
  });
}
