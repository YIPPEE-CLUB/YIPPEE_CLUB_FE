export const developmentDomains = [
  {
    value: '신체운동·건강',
    label: '신체·운동',
    kind: 'physical',
    color: '#80b58a',
  },
  { value: '사회관계', label: '사회성', kind: 'social', color: '#dc9399' },
  { value: '인지', label: '인지·사고', kind: 'cognitive', color: '#e3bd42' },
  { value: '의사소통', label: '언어·소통', kind: 'language', color: '#a18bb8' },
  { value: '정서', label: '정서·감정', kind: 'emotion', color: '#80a9da' },
] as const;

export function DevelopmentIcon({
  kind,
  color,
}: {
  kind: string;
  color: string;
}) {
  return (
    <svg
      className="development-icon"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ color }}
    >
      {kind === 'physical' && (
        <>
          <circle cx="32" cy="11" r="8" fill="currentColor" />
          <path
            d="M12 31c12 1 23 0 36-12M31 27v15M31 41 16 56M31 41l14 15"
            stroke="currentColor"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === 'social' && (
        <>
          <circle
            cx="20"
            cy="16"
            r="10"
            stroke="currentColor"
            strokeWidth="7"
          />
          <circle
            cx="44"
            cy="16"
            r="10"
            stroke="currentColor"
            strokeWidth="7"
          />
          <path
            d="M13 33 7 50M51 33l6 17M16 33l16 20 16-20"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === 'cognitive' && (
        <>
          <path
            d="M29 7c-8-6-18 2-16 10-9 0-13 12-7 18-7 9 0 19 9 19 1 8 10 10 14 4V7ZM35 7c8-6 18 2 16 10 9 0 13 12 7 18 7 9 0 19-9 19-1 8-10 10-14 4V7Z"
            fill="currentColor"
          />
          <path
            d="m17 14 5 8-7 8 6 9-5 8m31-33-5 8 7 8-6 9 5 8"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === 'language' && (
        <>
          <circle cx="32" cy="31" r="29" fill="currentColor" />
          <path
            d="M13 30c0-19 38-19 38 0 0 10-8 15-18 15h-8l-9 6 2-12c-3-2-5-5-5-9Z"
            fill="white"
          />
          {[23, 32, 41].map((cx) => (
            <circle key={cx} cx={cx} cy="30" r="2.6" fill="currentColor" />
          ))}
        </>
      )}
      {kind === 'emotion' && (
        <>
          <circle cx="32" cy="32" r="30" fill="currentColor" />
          <path
            d="M32 48S13 38 13 26c0-12 15-15 19-4 4-11 19-8 19 4 0 12-19 22-19 22Z"
            fill="white"
          />
        </>
      )}
    </svg>
  );
}
