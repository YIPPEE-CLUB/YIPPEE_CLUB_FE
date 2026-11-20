import { sampleActivities } from '../data/activities';
import { apiRequest } from '../lib/api';
import { readPreviewSession } from '../lib/preview-session';
import type { Activity, Paginated } from '../types';

export const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
export interface Category {
  id: number;
  name: string;
}
export interface ActivityResponse {
  id: number;
  title: string;
  price: number;
  description: string;
  age_min_months: number;
  age_max_months: number;
  duration_min: number;
  duration_max: number;
  difficulty: 'easy' | 'hard';
  categories: number[];
  image: string;
  pdf: string;
}
export function toActivity(
  item: ActivityResponse,
  categories: Category[],
): Activity {
  if (
    !Number.isInteger(item.id) ||
    typeof item.title !== 'string' ||
    typeof item.price !== 'number' ||
    !Array.isArray(item.categories) ||
    ![
      item.age_min_months,
      item.age_max_months,
      item.duration_min,
      item.duration_max,
    ].every(Number.isFinite) ||
    !['easy', 'hard'].includes(item.difficulty) ||
    typeof item.description !== 'string' ||
    typeof item.image !== 'string' ||
    typeof item.pdf !== 'string'
  ) {
    throw new Error('활동지 응답 형식이 맞지 않아요.');
  }
  const names = item.categories.map(
    (id) => categories.find((c) => c.id === id)?.name ?? `카테고리 ${id}`,
  );
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    subtitle: names.join(' · ') || '미분류',
    category: names[0] || '미분류',
    categoryIds: item.categories,
    categoryNames: names,
    description: item.description,
    thumbnail: item.image,
    pdf: item.pdf,
    ageYears: Math.floor(item.age_min_months / 12),
    ageMinMonths: item.age_min_months,
    ageMaxMonths: item.age_max_months,
    duration: item.duration_max,
    durationMin: item.duration_min,
    durationMax: item.duration_max,
    difficulty: item.difficulty,
  };
}
export async function listCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  return (
    await apiRequest<{ results: Category[] }>('/activity-categories', {
      signal,
    })
  ).results;
}
export async function listActivities(signal: AbortSignal): Promise<Activity[]> {
  if (isMockMode || readPreviewSession()) return sampleActivities;
  const categories = await listCategories(signal);
  const items: Activity[] = [];
  for (let number = 1; ; number++) {
    const page = await apiRequest<Paginated<ActivityResponse>>(
      `/activities?page_size=100&page=${number}`,
      { signal },
    );
    if (!Array.isArray(page.results))
      throw new Error('활동지 목록 응답 형식이 맞지 않아요.');
    items.push(...page.results.map((item) => toActivity(item, categories)));
    if (!page.next) return items;
  }
}
export async function getActivity(
  id: number,
  signal?: AbortSignal,
): Promise<Activity> {
  if (!Number.isSafeInteger(id) || id < 1)
    throw new Error('활동지 ID를 확인해 주세요.');
  if (isMockMode || readPreviewSession()) {
    const item = sampleActivities.find((item) => item.id === id);
    if (!item) throw new Error('활동지를 찾을 수 없어요.');
    return item;
  }
  const [item, categories] = await Promise.all([
    apiRequest<ActivityResponse>(`/activities/${id}`, { signal }),
    listCategories(signal),
  ]);
  return toActivity(item, categories);
}
export async function listCart(signal?: AbortSignal): Promise<Activity[]> {
  if (readPreviewSession()) return [];
  const [cart, categories] = await Promise.all([
    apiRequest<{ items: ActivityResponse[] }>('/cart', { signal }),
    listCategories(signal),
  ]);
  return cart.items.map((item) => toActivity(item, categories));
}
