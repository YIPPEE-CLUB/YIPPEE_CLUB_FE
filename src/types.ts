// 서버 응답과 화면 모델은 구분합니다. 미확정 API 필드를 화면 전체에 퍼뜨리지 않습니다.
export interface Activity {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  duration: number;
  difficulty: 'easy' | 'normal' | 'hard';
  categoryIds?: number[];
  categoryNames?: string[];
  description?: string;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  durationMin?: number;
  durationMax?: number;
  pdf?: string;
  materials?: string[];
  developmentDomains?: string[];
  // true/false는 제작 출처를 확인한 데이터에만 사용합니다. 미연결은 undefined입니다.
  isAiGenerated?: boolean;
  ageYears: number;
  thumbnail?: string;
  location?: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
