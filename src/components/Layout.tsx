import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Icon, type IconName } from './Icon';
import { WireDialog } from './WireDialog';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildrenContext';
import { apiRequest } from '../lib/api';
import { childAgeLabel } from '../lib/date';

const navigation: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/activities', label: '활동찾기', icon: 'explore' },
  { path: '/children', label: '', icon: 'child' },
  { path: '/saved', label: '저장', icon: 'saved' },
  { path: '/profile', label: '내 정보', icon: 'profile' },
];

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, reload } = useAuth();
  const { children } = useChildren();
  const [switching, setSwitching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const activeChild = children.find(
    (child) => child.id === user?.active_child_id,
  );
  const hasNav = [
    '/',
    '/activities',
    '/search',
    '/search/results',
    '/saved',
    '/profile',
    '/guide',
    '/guides',
  ].includes(pathname);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!(document.activeElement instanceof HTMLInputElement))
      document.querySelector<HTMLElement>('#main-content')?.focus();
  }, [pathname]);
  return (
    <div className={`app-shell ${!hasNav ? 'app-shell--fullscreen' : ''}`}>
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      {hasNav && (
        <nav className="bottom-nav" aria-label="주요 메뉴">
          {navigation.map(({ path, label, icon }) =>
            icon === 'child' ? (
              <button
                key={path}
                className="nav-item nav-item--child"
                aria-label="아이 전환"
                onClick={() => {
                  if (!user) navigate('/login');
                  else {
                    setError('');
                    setSwitching(true);
                  }
                }}
              >
                <span className="nav-item__icon">
                  <Icon name="childCircle" size={52} />
                  <Icon name="child" size={44} />
                </span>
                <span>{activeChild?.name || ''}</span>
              </button>
            ) : (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `nav-item ${isActive || (path === '/activities' && pathname.startsWith('/search')) ? 'is-active' : ''}`
                }
              >
                <span className="nav-item__icon">
                  <Icon name={icon} size={32} />
                </span>
                <span>{label}</span>
              </NavLink>
            ),
          )}
        </nav>
      )}
      {switching && (
        <WireDialog title="아이 전환" sheet onClose={() => setSwitching(false)}>
          <div className="section-heading">
            <h2>어떤 아이와 놀까요?</h2>
            <button
              className="icon-button"
              aria-label="아이 전환 닫기"
              onClick={() => setSwitching(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {children.map((child) => (
            <button
              className="child-switch-row"
              key={child.id}
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void apiRequest('/users/me/active-child', {
                  method: 'PUT',
                  body: JSON.stringify({ child_id: child.id }),
                })
                  .then(reload)
                  .then(() => setSwitching(false))
                  .catch((cause: Error) => setError(cause.message))
                  .finally(() => setBusy(false));
              }}
            >
              <span className="child-switch-avatar" />
              <span>
                <strong>{child.name}</strong>
                <small>{childAgeLabel(child.birth_date)}</small>
              </span>
              {activeChild?.id === child.id && <Icon name="check" />}
            </button>
          ))}
          <Link
            className="child-switch-row"
            to="/children/new"
            onClick={() => setSwitching(false)}
          >
            <span className="child-switch-avatar" />
            <strong>아이 추가</strong>
            <Icon name="plus" />
          </Link>
        </WireDialog>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  back = false,
}: {
  title: string;
  back?: boolean;
}) {
  return (
    <header className="page-header">
      {back && (
        <Link className="icon-button" to="/" aria-label="홈으로 돌아가기">
          <Icon name="back" size={32} />
        </Link>
      )}
      <h1>{title}</h1>
      <div className="header-actions">
        <Link className="icon-button" to="/notifications" aria-label="알림">
          <Icon name="bell" />
        </Link>
        <Link className="icon-button" to="/cart" aria-label="장바구니">
          <Icon name="cart" />
        </Link>
      </div>
    </header>
  );
}
