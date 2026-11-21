import { useBack } from './NavigationHistory';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function ReferenceHeader({
  title,
  backTo = '/profile',
  onBack,
  right,
}: {
  title?: string;
  backTo?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const back = useBack(backTo);
  return (
    <header className="reference-header">
      <div className="reference-header__back">
        {onBack ? (
          <button
            type="button"
            className="icon-button"
            onClick={onBack}
            aria-label="뒤로가기"
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
      </div>
      {title && (
        <div className="section-heading">
          <h1>{title}</h1>
          {right}
        </div>
      )}
    </header>
  );
}
