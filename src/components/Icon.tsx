// Figma에서 내려받은 SVG 원본을 사용합니다. 각 SVG의 고유 크기는 그대로 둡니다.
// 바깥 슬롯 크기만 바꾸어 24px/32px 아이콘의 배치를 재현합니다.
const iconFiles = {
  home: 'dc0f4',
  explore: 'bf36b',
  saved: '8db13',
  profile: 'b5c29',
  child: '17381',
  childCircle: 'ec2c7',
  bell: 'a41cc',
  cart: 'ef429',
  chevron: 'fdd3e',
  back: '6944d',
  search: '040d3',
  heart: '1150c',
  heartFilled: 'b4ac9',
  help: '35c72',
  settings: 'fc259',
  down: '65b89',
  close: 'b88c6',
  closeWhite: '1cca9',
  plus: 'd6a42',
  check: 'dc9ad',
  edit: 'bf1fb',
  trash: 'd2fcb',
  share: 'dc2cb',
  eye: 'ee11d',
  print: '97213',
  download: '5f70b',
  fullscreen: '22b18',
  zoomIn: 'e6739',
  zoomOut: '02520',
} as const;

export type IconName = keyof typeof iconFiles;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <span
      className={`icon icon--${name}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={`/assets/${iconFiles[name]}.svg`}
        alt=""
        style={
          ['back', 'chevron', 'down', 'closeWhite'].includes(name)
            ? { transform: `scale(${size / 24})` }
            : undefined
        }
      />
    </span>
  );
}
