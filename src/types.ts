// 서버 응답과 화면 모델은 구분합니다. 미확정 API 필드를 화면 전체에 퍼뜨리지 않습니다.
export interface Activity {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  price: number;
  duration: number;
  difficulty: 'easy' | 'normal';
  ageYears: number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
