const seoulDateTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'medium',
  timeStyle: 'short',
});

// API 시각은 UTC(Z) 또는 명시적 오프셋이 있어야 합니다. PC 시간대에 맡기지 않습니다.
export function formatServerDateTime(value: string): string {
  if (!/(Z|[+-]\d{2}:\d{2})$/i.test(value)) return '시간 확인 필요';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '시간 확인 필요'
    : seoulDateTime.format(date);
}

// 생년월일은 '시각'이 아닙니다. Date로 바꾸지 않아 하루가 밀리는 문제를 방지합니다.
export function formatBirthDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '날짜 확인 필요';
  const [, year, month, day] = match;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return '날짜 확인 필요';
  return `${year}.${month}.${day}`;
}

// 생년월일을 한국 날짜 기준 월령으로 계산합니다. UTC 자정 전후에도 기준이 같습니다.
export function childAgeLabel(birthDate: string, now = new Date()): string {
  if (formatBirthDate(birthDate) === '날짜 확인 필요') return '날짜 확인 필요';
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const [year, month, day] = birthDate.split('-').map(Number);
  const months = Math.max(
    0,
    (value('year') - year) * 12 +
      value('month') -
      month -
      (value('day') < day ? 1 : 0),
  );
  const lower = Math.floor(months / 6) * 6;
  return `만 ${Math.floor(months / 12)}세 · ${lower}~${lower + 5}개월`;
}
