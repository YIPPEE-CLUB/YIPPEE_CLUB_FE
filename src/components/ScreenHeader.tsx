import { useBack } from './NavigationHistory';
import { Icon } from './Icon';
import type { ReactNode } from 'react';

export function ScreenHeader({
  title,
  backTo = '/',
  onBack,
  right,
}: {
  title: string;
  backTo?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const back = useBack(backTo);
  return (
    <header className="screen-header">
      {onBack ? (
        <button
          type="button"
          className="icon-button"
          aria-label="뒤로가기"
          onClick={onBack}
        >
          <Icon name="back" size={32} />
        </button>
      ) : (
        <button
          type="button"
          className="icon-button"
          onClick={back}
          aria-label="뒤로가기"
        >
          <Icon name="back" size={32} />
        </button>
      )}
      <h1>{title}</h1>
      <div className="screen-header__right">{right}</div>
    </header>
  );
}
