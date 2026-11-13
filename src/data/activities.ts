import type { Activity } from '../types';

// 화면 검토용 데이터입니다. 구매 권한·배지·로그인을 가짜로 생성하지 않습니다.
export const sampleActivities: Activity[] = [
  {
    id: 101,
    title: '내가 만드는 날씨달력',
    subtitle: '관찰&정서',
    category: '그림/색칠',
    price: 1900,
    duration: 10,
    difficulty: 'easy',
    ageYears: 3,
  },
  {
    id: 102,
    title: '점, 선, 면을 그려봐',
    subtitle: '신체&인지',
    category: '그림/색칠',
    price: 990,
    duration: 10,
    difficulty: 'easy',
    ageYears: 2,
  },
  {
    id: 103,
    title: '종이로 만드는 공룡 친구',
    subtitle: '만들기&탐구',
    category: '만들기',
    price: 1900,
    duration: 20,
    difficulty: 'normal',
    ageYears: 4,
  },
  {
    id: 104,
    title: '동물 친구와 한글 놀이',
    subtitle: '언어&인지',
    category: '한글',
    price: 990,
    duration: 10,
    difficulty: 'easy',
    ageYears: 3,
  },
];

export const categories = [
  '전체',
  '그림/색칠',
  '만들기',
  '한글',
  '숫자',
  '역할',
  '영어',
  '음악',
  '체육',
  'AI, 코딩',
];
export const trendingKeywords = [
  '공룡',
  '동물',
  '자동차',
  '중장비',
  '역할놀이',
  '우주',
  '색칠놀이',
  '한글',
  '숫자',
  '가게놀이',
];
