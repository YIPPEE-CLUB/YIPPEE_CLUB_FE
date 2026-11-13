import { Link } from 'react-router-dom';
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
  return (
    <header className="screen-header">
      {onBack ? (
        <button className="icon-button" aria-label="뒤로가기" onClick={onBack}>
          <Icon name="back" size={32} />
        </button>
      ) : (
        <Link className="icon-button" to={backTo} aria-label="뒤로가기">
          <Icon name="back" size={32} />
        </Link>
      )}
      <h1>{title}</h1>
      <div className="screen-header__right">{right}</div>
    </header>
  );
}
