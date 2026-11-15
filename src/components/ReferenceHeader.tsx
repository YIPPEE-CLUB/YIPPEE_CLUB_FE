import { Link } from 'react-router-dom';
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
          <Link className="icon-button" to={backTo} aria-label="뒤로가기">
            <Icon name="back" size={32} />
          </Link>
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
