import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../lib/api', () => ({ apiRequest: vi.fn() }));
import { apiRequest } from '../lib/api';
import {
  checkEmail,
  sendSignupCode,
  confirmSignupCode,
  login,
  signup,
} from './auth';

afterEach(() => vi.resetAllMocks());

it('가입 여부 확인은 정규화한 이메일 식별자를 전송한다', async () => {
  await checkEmail(' User@Example.com ');
  expect(apiRequest).toHaveBeenCalledWith('/auth/identifiers/check', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'user@example.com' }),
  });
});

it('가입 인증번호는 이메일과 가입 목적만 전송한다', async () => {
  await sendSignupCode(' User@Example.com ');
  expect(apiRequest).toHaveBeenCalledWith('/auth/verification/send', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'user@example.com', purpose: 'signup' }),
  });
});

it('인증번호 앞자리 0과 서버 인증 식별자를 보존한다', async () => {
  await confirmSignupCode('challenge', '012345');
  expect(apiRequest).toHaveBeenCalledWith('/auth/verification/confirm', {
    method: 'POST',
    body: JSON.stringify({ verification_id: 'challenge', code: '012345' }),
  });
});

it('가입은 이메일 인증 증빙과 사용자 동의 상태를 전달한다', async () => {
  await signup(' User@Example.com ', ' pass1234 ', 'proof', [
    true,
    true,
    true,
    false,
  ]);
  expect(apiRequest).toHaveBeenCalledWith('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      identifier: 'user@example.com',
      password: ' pass1234 ',
      verification_token: 'proof',
      agreements: {
        terms: true,
        privacy: true,
        age_over_14: true,
        marketing: false,
      },
    }),
  });
});

it('로그인은 비밀번호 공백을 보존하고 잘못된 비밀번호 오류를 전달한다', async () => {
  vi.mocked(apiRequest).mockRejectedValueOnce(
    new Error('이메일 또는 비밀번호를 확인해 주세요.'),
  );
  await expect(login(' User@Example.com ', ' pass1234 ')).rejects.toThrow(
    '이메일 또는 비밀번호',
  );
  expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@example.com', password: ' pass1234 ' }),
  });
});
