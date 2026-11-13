import { sampleActivities } from '../data/activities';
import { apiRequest } from '../lib/api';
import type { Activity, Paginated } from '../types';

export const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export async function listActivities(signal: AbortSignal): Promise<Activity[]> {
  if (isMockMode) return sampleActivities;

  // 목록 항목의 상세 계약은 아직 미확정입니다. 확정 후 이 어댑터만 수정합니다.
  // 현재는 필수 필드만 검증하고 화면에 필요한 부가 필드는 기본값으로 변환합니다.
  const page = await apiRequest<Paginated<Partial<Activity>>>(
    '/activities?page_size=100',
    { signal },
  );
  if (!Array.isArray(page.results))
    throw new Error('활동지 목록 응답 형식이 맞지 않아요.');

  return page.results.map((item) => {
    if (
      typeof item.id !== 'number' ||
      typeof item.title !== 'string' ||
      typeof item.price !== 'number'
    ) {
      throw new Error('활동지의 ID·제목·가격 응답을 확인해 주세요.');
    }
    return {
      id: item.id,
      title: item.title,
      price: item.price,
      subtitle: item.subtitle ?? '놀이 활동지',
      category: item.category ?? '미분류',
      duration: item.duration ?? 0,
      difficulty: item.difficulty ?? 'easy',
      ageYears: item.ageYears ?? 0,
    };
  });
}
