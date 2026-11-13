import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { Icon } from '../components/Icon';
import { ScreenHeader } from '../components/ScreenHeader';
import { WireDialog } from '../components/WireDialog';
import type { CatalogProps } from './HomePage';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildrenContext';
import { apiRequest } from '../lib/api';
import type { Activity, Paginated } from '../types';
import { LoginPrompt } from './ConnectedPages';

export function SavedPage({ activities, savedIds, onToggle }: CatalogProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState('favorites');
  const [editing, setEditing] = useState(false);
  const [purchases, setPurchases] = useState<Activity[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const saved = activities.filter((activity) => savedIds.includes(activity.id));
  useEffect(() => {
    if (user && tab === 'purchases')
      apiRequest<Paginated<Activity>>('/purchases/activities?page_size=100')
        .then((page) => setPurchases(page.results))
        .catch((cause: Error) => setError(cause.message));
  }, [user?.id, tab]);
  const items = tab === 'favorites' ? saved : purchases;
  return (
    <div
      className={`page-content ${editing ? 'saved-page--editing' : ''}`}
      data-figma-node={
        editing ? '133:4786' : items.length ? '117:999' : '117:1098'
      }
    >
      <header className="page-header">
        <h1>저장</h1>
        <div className="header-actions">
          {saved.length > 0 && tab === 'favorites' && (
            <button
              className="text-button"
              onClick={() => {
                setSelected(saved.map((item) => item.id));
                setEditing(!editing);
              }}
            >
              {editing ? '완료' : '편집'}
            </button>
          )}
          <Link className="icon-button" to="/cart" aria-label="장바구니">
            <Icon name="cart" />
          </Link>
        </div>
      </header>
      <div className="tabs" aria-label="저장 목록 종류">
        {[
          ['favorites', '저장한 활동지'],
          ['purchases', '구매한 활동지'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'is-selected' : ''}
            aria-pressed={tab === value}
            onClick={() => {
              setTab(value);
              setEditing(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        <div className="activity-grid">
          {items.map((activity) => (
            <div className="saved-card-wrap" key={activity.id}>
              <ActivityCard
                activity={activity}
                saved={savedIds.includes(activity.id)}
                onToggle={onToggle}
                showSave={!editing}
              />
              {editing && (
                <input
                  className="saved-card-check"
                  aria-label={`${activity.title} 선택`}
                  type="checkbox"
                  checked={selected.includes(activity.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, activity.id]
                        : selected.filter((id) => id !== activity.id),
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="wire-empty wire-empty--search">
          <div className="empty-circle" />
          <h2>
            {tab === 'favorites'
              ? '저장한 활동지가 없어요'
              : '구매한 활동지가 없어요'}
          </h2>
          <p>
            {tab === 'favorites'
              ? '마음에 드는 활동지의 하트를 눌러보세요.'
              : '구매한 활동지가 여기에 표시돼요.'}
          </p>
        </div>
      )}
      {editing && (
        <div className="saved-edit-actions">
          <button
            className="button"
            onClick={() => setSelected(saved.map((item) => item.id))}
          >
            전체 선택
          </button>
          <button
            className="button button--primary"
            disabled={!selected.length}
            onClick={() => setRemoveConfirm(true)}
          >
            {selected.length}개 빼기
          </button>
        </div>
      )}
      {removeConfirm && (
        <WireDialog
          title="저장 해제"
          onClose={() => {
            if (!busy) setRemoveConfirm(false);
          }}
        >
          <h2>저장을 해제할까요?</h2>
          <div className="dialog-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => setRemoveConfirm(false)}
            >
              취소
            </button>
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void (async () => {
                  for (const id of selected) await onToggle(id);
                  setRemoveConfirm(false);
                  setEditing(false);
                })()
                  .catch((cause: Error) => setError(cause.message))
                  .finally(() => setBusy(false));
              }}
            >
              해제
            </button>
          </div>
        </WireDialog>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const { children } = useChildren();
  const child = children.find((item) => item.id === user?.active_child_id);
  return (
    <div className="profile-page" data-figma-node="118:1014">
      <div className="profile-top">
        <header className="page-header">
          <h1>내 정보</h1>
          <div className="header-actions">
            <Link className="icon-button" to="/notifications" aria-label="알림">
              <Icon name="bell" />
            </Link>
            <Link className="icon-button" to="/settings" aria-label="설정">
              <Icon name="settings" />
            </Link>
          </div>
        </header>
        <div className="profile-summary">
          <div className="profile-avatar" />
          <div>
            <h2>
              {user
                ? `${user.name || '회원'} ${user.nickname || '보호자'}`
                : '로그인해 주세요'}
            </h2>
            <Link className="button" to={user ? '/profile/edit' : '/login'}>
              {user ? '프로필 편집하기' : '로그인'}
            </Link>
          </div>
        </div>
      </div>
      <Link className="menu-row menu-row--highlight" to="/badges">
        <strong>
          {child ? `${child.name}의` : '우리 아이의'} 만세도감 보러가기
        </strong>
        <Icon name="chevron" />
      </Link>
      <div className="profile-menu">
        {[
          ['/children', '나의 아이 정보'],
          ['/records', '활동 기록'],
          ['/orders', '결제 내역'],
          ['/cards', '결제 카드 관리'],
          ['/support', '고객센터'],
        ].map(([path, label]) => (
          <Link className="menu-row" key={path} to={path}>
            {label}
            <Icon name="chevron" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProfileEditPage() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [salutation, setSalutation] = useState(user?.nickname || '어머님');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim(), nickname: salutation }),
      });
      await reload();
      navigate('/profile');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="screen" onSubmit={save} data-figma-node="118:1112">
      <ScreenHeader title="프로필 편집" backTo="/profile" />
      {!user ? (
        <LoginPrompt />
      ) : (
        <>
          <div className="screen-content form-stack">
            <div className="profile-edit-photo">
              <div className="profile-avatar" />
              <button
                className="text-button"
                type="button"
                onClick={() => setPhoto(true)}
              >
                사진 변경
              </button>
            </div>
            <label className="wire-field">
              이름
              <input
                required
                value={name}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <h2 className="wire-subtitle">호칭</h2>
            <div className="chips">
              {['어머님', '아버님', '보호자'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`chip ${salutation === value ? 'is-selected' : ''}`}
                  aria-pressed={salutation === value}
                  onClick={() => setSalutation(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="screen-actions">
            <button
              className="button button--primary"
              disabled={busy || !name.trim()}
            >
              저장하기
            </button>
          </div>
        </>
      )}
      {photo && (
        <WireDialog
          title="프로필 사진 변경"
          sheet
          onClose={() => setPhoto(false)}
        >
          <h2>프로필 사진 변경</h2>
          <p>사진 업로드 API가 연결되면 사용할 수 있어요.</p>
          <button
            type="button"
            className="button"
            onClick={() => setPhoto(false)}
          >
            닫기
          </button>
        </WireDialog>
      )}
    </form>
  );
}

export function BadgesPage() {
  const { user } = useAuth();
  const { children } = useChildren();
  const child = children.find((item) => item.id === user?.active_child_id);
  const [help, setHelp] = useState(false);
  return (
    <div className="screen" data-figma-node="124:3533">
      <ScreenHeader
        title="만세도감"
        backTo="/profile"
        right={
          <button
            className="icon-button"
            aria-label="도감 안내"
            onClick={() => setHelp(true)}
          >
            <Icon name="help" />
          </button>
        }
      />
      {child ? (
        <div className="badge-content">
          <h2>{child.name}의 대표배지</h2>
          <p>
            아직 획득한 반짝배지가 없어요.
            <br />
            ‘반짝배지’만 대표배지로 설정할 수 있어요.
          </p>
          <div className="badge-circle" />
          <div className="badge-grid">
            {Array.from({ length: 15 }, (_, index) => (
              <div className="badge-item" key={index}>
                <div className="badge-circle" />
                <span>???</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="screen-content screen-content--center">
            <div className="empty-circle" />
            <h2>아이를 등록하면 도감이 열려요</h2>
          </div>
          <div className="screen-actions">
            <Link
              className="button button--primary"
              to={user ? '/children/new' : '/login'}
            >
              아이 등록하기
            </Link>
          </div>
        </>
      )}
      {help && (
        <WireDialog title="만세도감 안내" onClose={() => setHelp(false)}>
          <h2>만세도감이 뭐에요?</h2>
          <p>
            리뷰를 쓰면 배지를 모을 수 있어요.
            <br />
            ‘반짝배지’만 대표배지로 설정할 수 있어요.
          </p>
          <button
            className="button button--accent"
            onClick={() => setHelp(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}
