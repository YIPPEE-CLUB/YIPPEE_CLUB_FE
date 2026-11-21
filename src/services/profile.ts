import { apiRequest } from '../lib/api';

export interface Profile {
  id: number;
  email: string;
  name: string;
  phone: string;
  nickname: string;
}

export interface ProfileRead extends Profile {
  active_child_id: number | null;
}

// PATCH 응답에는 선택 상태가 없으므로 기존 선택을 유지합니다.
export function mergeProfileUpdate(
  current: ProfileRead,
  updated: Profile,
): ProfileRead {
  return { ...current, ...updated };
}

export function getProfile() {
  return apiRequest<ProfileRead>('/users/me');
}

export function updateProfile(name: string, nickname?: string) {
  return apiRequest<Profile>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({
      name: name.trim(),
      ...(nickname === undefined ? {} : { nickname }),
    }),
  });
}

export function passwordError(password: string, confirmation: string): string {
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password))
    return '영문·숫자를 포함해 8자 이상 128자 이하로 입력해 주세요.';
  return password !== confirmation ? '새 비밀번호가 일치하지 않아요.' : '';
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}
