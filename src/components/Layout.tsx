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
import { childAgeLabel } from '../lib/date';

const navigation: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: '홈', icon: 'home' },
  { path: '/activities', label: '활동찾기', icon: 'explore' },
  { path: '/children', label: '', icon: 'child' },
  { path: '/saved', label: '저장', icon: 'saved' },
  { path: '/profile', label: '내 정보', icon: 'profile' },
];

function fanPosition(index: number, count: number) {
  const angle = Math.PI - ((index + 0.5) * Math.PI) / count;
  return {
    left: `calc(50% + ${Math.cos(angle)} * var(--child-wheel-radius))`,
    bottom: `calc(60px + ${Math.sin(angle)} * var(--child-wheel-radius))`,
    animationDelay: `${index * 35}ms`,
  };
}
function fanSector(index: number, count: number) {
  const start = Math.PI - (index * Math.PI) / count;
  const end = Math.PI - ((index + 1) * Math.PI) / count;
  const point = (radius: number, angle: number) =>
    `${180 + radius * Math.cos(angle)},${180 - radius * Math.sin(angle)}`;
  return `M${point(172, start)} A172,172 0 0,1 ${point(172, end)} L${point(108, end)} A108,108 0 0,0 ${point(108, start)} Z`;
}

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loginNotice, loginPromptOpen, requestLogin, dismissLogin } =
    useAuth();
  const { children, activeChild, select } = useChildren();
  const [switching, setSwitching] = useState(false);
  const [childPage, setChildPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasNav = [
    '/',
    '/activities',
    '/activities/popular',
    '/recommendations',
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
                aria-expanded={switching}
                aria-haspopup="dialog"
                onClick={() => {
                  if (!user) requestLogin();
                  else {
                    setError('');
                    setChildPage(0);
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
                onClick={(event) => {
                  if (!user && ['/saved', '/profile'].includes(path)) {
                    event.preventDefault();
                    requestLogin();
                  }
                }}
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
        <WireDialog
          title="아이 전환"
          className="child-fan-dialog"
          onClose={() => setSwitching(false)}
        >
          <h2 className="child-fan-heading">어떤 아이와 놀까요?</h2>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <svg
            className="child-fan-wheel"
            viewBox="0 0 360 180"
            aria-hidden="true"
          >
            {Array.from(
              { length: Math.min(3, children.length - childPage * 3) + 1 },
              (_, index) => {
                const count = Math.min(3, children.length - childPage * 3) + 1;
                const selected =
                  children[childPage * 3 + index]?.id === activeChild?.id &&
                  index < count - 1;
                return (
                  <path
                    key={index}
                    d={fanSector(index, count)}
                    fill={selected ? '#ffe6a0' : '#f9fafb'}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              },
            )}
          </svg>
          <div className="child-fan-options">
            {children
              .slice(childPage * 3, childPage * 3 + 3)
              .map((child, index, shown) => (
                <button
                  className={`child-fan-item ${activeChild?.id === child.id ? 'is-selected' : ''}`}
                  style={fanPosition(index, shown.length + 1)}
                  aria-pressed={activeChild?.id === child.id}
                  title={`${child.name} · ${childAgeLabel(child.birth_date)}`}
                  key={child.id}
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    setError('');
                    void select(child.id)
                      .then(() => setSwitching(false))
                      .catch((cause: Error) => setError(cause.message))
                      .finally(() => setBusy(false));
                  }}
                >
                  <span className="child-fan-avatar">
                    <Icon name="child" size={34} />
                    {activeChild?.id === child.id && (
                      <span className="child-fan-check">
                        <Icon name="check" size={12} />
                      </span>
                    )}
                  </span>
                  <span>
                    <strong>{child.name}</strong>
                    <small>{childAgeLabel(child.birth_date)}</small>
                  </span>
                </button>
              ))}
            <Link
              className="child-fan-item child-fan-add"
              style={fanPosition(
                Math.min(3, children.length - childPage * 3),
                Math.min(3, children.length - childPage * 3) + 1,
              )}
              to="/children/new"
              onClick={() => setSwitching(false)}
            >
              <span className="child-fan-avatar">
                <Icon name="plus" size={28} />
              </span>
              <strong>아이 추가</strong>
            </Link>
          </div>
          {children.length > 3 && (
            <div className="child-fan-pages">
              <button
                disabled={childPage === 0 || busy}
                onClick={() => setChildPage((value) => value - 1)}
              >
                이전
              </button>
              <span>
                {childPage + 1} / {Math.ceil(children.length / 3)}
              </span>
              <button
                disabled={(childPage + 1) * 3 >= children.length || busy}
                onClick={() => setChildPage((value) => value + 1)}
              >
                다음
              </button>
            </div>
          )}
          <button
            className="child-fan-close"
            aria-label="아이 전환 닫기"
            onClick={() => setSwitching(false)}
          >
            <Icon name="close" size={28} />
          </button>
        </WireDialog>
      )}
      {loginPromptOpen && (
        <WireDialog
          title="로그인 안내"
          className="login-gate"
          onClose={dismissLogin}
        >
          <p>
            서비스 이용은 회원만 가능해요.
            <br />
            로그인/회원가입을 하시겠어요?
          </p>
          <div className="dialog-actions">
            <button type="button" className="button" onClick={dismissLogin}>
              그냥 둘러볼래요
            </button>
            <button
              type="button"
              className="button button--accent"
              onClick={() => {
                dismissLogin();
                navigate('/login');
              }}
            >
              로그인 할래요!
            </button>
          </div>
        </WireDialog>
      )}
      {user && loginNotice && pathname === '/' && (
        <div className="login-toast" role="status">
          <img src="/assets/6005d.svg" alt="" />
          로그인 되었습니다.
        </div>
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
