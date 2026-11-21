import { apiRequest } from '../lib/api';
import { formatBirthDate } from '../lib/date';

export interface Child {
  id: number;
  name: string;
  birth_date: string;
  gender: string;
  interests: number[];
}
export type ChildInput = Omit<Child, 'id'>;
export const listChildren = async (signal?: AbortSignal) =>
  (await apiRequest<{ results: Child[] }>('/children', { signal })).results;
export const getChild = (id: number, signal?: AbortSignal) =>
  apiRequest<Child>(`/children/${id}`, { signal });
export const createChild = (data: ChildInput) =>
  apiRequest<Child>('/children', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateChild = (id: number, data: Partial<ChildInput>) =>
  apiRequest<Child>(`/children/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteChild = (id: number) =>
  apiRequest<void>(`/children/${id}`, { method: 'DELETE' });
export const selectChild = (id: number) =>
  apiRequest<{ active_child_id: number }>('/users/me/active-child', {
    method: 'PUT',
    body: JSON.stringify({ child_id: id }),
  });

export function childInputError(
  data: ChildInput,
  creating: boolean,
  now = new Date(),
): string {
  if (!data.name.trim()) return '아이 이름을 입력해 주세요.';
  if (formatBirthDate(data.birth_date) === '날짜 확인 필요')
    return '생년월일을 확인해 주세요.';
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
  }).format(now);
  if (data.birth_date > today) return '미래의 생년월일은 사용할 수 없어요.';
  const [y, m, d] = today.split('-').map(Number);
  const [by, bm, bd] = data.birth_date.split('-').map(Number);
  const months = (y - by) * 12 + m - bm - (d < bd ? 1 : 0);
  if (creating && (months < 12 || months > 72))
    return '12개월~72개월의 아이를 등록해 주세요.';
  return '';
}
