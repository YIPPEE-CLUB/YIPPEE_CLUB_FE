import { describe, expect, it } from 'vitest';
import { childAgeLabel, formatBirthDate, formatServerDateTime } from './date';

describe('배포 환경과 무관한 날짜 처리', () => {
  it('한국 날짜 기준 월령을 같은 순간의 UTC·한국 시간 표기에서 동일하게 계산한다', () => {
    expect(childAgeLabel('2021-05-01', new Date('2026-11-07T15:30:00Z'))).toBe(
      '만 5세 · 66~71개월',
    );
    expect(
      childAgeLabel('2021-05-01', new Date('2026-11-08T00:30:00+09:00')),
    ).toBe('만 5세 · 66~71개월');
  });
  it('UTC와 오프셋으로 표현된 같은 시각을 동일하게 표시한다', () => {
    expect(formatServerDateTime('2026-11-08T00:00:00Z')).toBe(
      formatServerDateTime('2026-11-08T09:00:00+09:00'),
    );
  });
  it('시간대가 없는 서버 시각을 임의로 해석하지 않는다', () => {
    expect(formatServerDateTime('2026-11-08T09:00:00')).toBe('시간 확인 필요');
  });
  it('생년월일을 시간대 변환 없이 표시한다', () => {
    expect(formatBirthDate('2022-05-01')).toBe('2022.05.01');
    expect(formatBirthDate('2022-02-30')).toBe('날짜 확인 필요');
  });
});
