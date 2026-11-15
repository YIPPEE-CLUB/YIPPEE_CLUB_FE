import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import { ScreenHeader } from '../components/ScreenHeader';
import { WireDialog } from '../components/WireDialog';
import { Icon } from '../components/Icon';
import { ActivityCard } from '../components/ActivityCard';
import type { Activity } from '../types';
import type { CatalogProps } from './HomePage';

export function LoginPrompt() {
  return (
    <div className="screen-content screen-content--center">
      <h2>로그인이 필요해요</h2>
      <Link className="button button--primary" to="/login">
        로그인
      </Link>
    </div>
  );
}

export function CartPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (!user) {
      setLoading(false);
      return;
    }
    apiRequest<{ items: Activity[] }>('/cart', { signal: controller.signal })
      .then((cart) => {
        setItems(cart.items);
        setSelected(cart.items.map((item) => item.id));
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user?.id]);
  const total = items
    .filter((item) => selected.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
  async function remove() {
    setBusy(true);
    setError('');
    try {
      // 삭제를 순서대로 반영하고, 실패 시에도 서버의 현재 목록을 다시 조회합니다.
      for (const id of deleting)
        await apiRequest(`/cart/items/${id}`, { method: 'DELETE' });
      setDeleting([]);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      try {
        const cart = await apiRequest<{ items: Activity[] }>('/cart');
        setItems(cart.items);
        setSelected((ids) =>
          ids.filter((id) => cart.items.some((item) => item.id === id)),
        );
      } catch (cause) {
        setError((cause as Error).message);
      }
      setBusy(false);
    }
  }
  return (
    <div
      className="screen"
      data-figma-node={items.length ? '116:546' : '116:604'}
    >
      <ScreenHeader title="장바구니" backTo="/activities" />
      {!user ? (
        <LoginPrompt />
      ) : loading ? (
        <div className="screen-content">
          <p role="status">불러오는 중…</p>
        </div>
      ) : items.length ? (
        <>
          <div className="screen-content">
            <div className="section-heading">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selected.length === items.length}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked ? items.map((item) => item.id) : [],
                    )
                  }
                />
                전체 선택 ({selected.length}/{items.length})
              </label>
              <button
                className="text-button"
                disabled={!selected.length}
                onClick={() => setDeleting(selected)}
              >
                선택 삭제
              </button>
            </div>
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <input
                  aria-label={`${item.title} 선택`}
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id),
                    )
                  }
                />
                <Link className="cart-item__body" to={`/activities/${item.id}`}>
                  <span className="cart-item__thumb" />
                  <div className="cart-item__title">
                    [{item.subtitle}]<br />
                    {item.title}
                    <strong className="cart-item__price">
                      {item.price.toLocaleString('ko-KR')}원
                    </strong>
                  </div>
                </Link>
                <button
                  className="icon-button"
                  aria-label={`${item.title} 삭제`}
                  onClick={() => setDeleting([item.id])}
                >
                  <Icon name="close" />
                </button>
              </article>
            ))}
            <Link className="button button--small" to="/activities">
              활동지 더 보기
            </Link>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="screen-actions">
            <div className="cart-total">
              <span>총 결제 금액</span>
              <span>{total.toLocaleString('ko-KR')}원</span>
            </div>
            <button
              className="button button--primary"
              disabled={!selected.length}
              onClick={() =>
                navigate('/checkout', {
                  state: { activityIds: selected, total },
                })
              }
            >
              {total.toLocaleString('ko-KR')}원 결제하기
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="screen-content screen-content--center">
            <div className="empty-circle" />
            <h2>장바구니가 비어 있어요</h2>
            {error && <p role="alert">{error}</p>}
          </div>
          <div className="screen-actions">
            <Link className="button button--primary" to="/activities">
              활동지 보러가기
            </Link>
          </div>
        </>
      )}
      {deleting.length > 0 && (
        <WireDialog
          title="장바구니 삭제"
          onClose={() => {
            if (!busy) setDeleting([]);
          }}
        >
          <h2>선택한 활동지를 삭제할까요?</h2>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => setDeleting([])}
            >
              취소
            </button>
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => void remove()}
            >
              삭제
            </button>
          </div>
        </WireDialog>
      )}
    </div>
  );
}

export function ActivityDetailPage({
  activities,
  savedIds,
  onToggle,
}: CatalogProps) {
  const { activityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activity = activities.find((item) => item.id === Number(activityId));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [share, setShare] = useState(false);
  async function add() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      await apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ activity_id: Number(activityId) }),
      });
      setMessage('장바구니에 담았어요.');
    } catch (cause) {
      setMessage((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const price = activity?.price.toLocaleString('ko-KR');
  return (
    <div className="screen" data-figma-node="116:487">
      <ScreenHeader
        title="활동지 상세"
        backTo="/activities"
        right={
          <Link className="icon-button" to="/cart" aria-label="장바구니">
            <Icon name="cart" />
          </Link>
        }
      />
      {activity ? (
        <>
          <div className="detail-hero" />
          <div className="detail-content">
            <div className="detail-tags">
              <span className="tag">
                {activity.duration === 10 ? '5-10' : activity.duration}분
              </span>
              <span className="tag">만 {activity.ageYears}세</span>
              <span className="tag">
                난이도 {activity.difficulty === 'easy' ? '하' : '중'}
              </span>
            </div>
            <div className="section">
              <h2>
                [{activity.subtitle}] {activity.title}
              </h2>
              <div className="section-heading">
                <h2>{price}원</h2>
                <button
                  className="button square-button"
                  aria-label="활동지 공유"
                  onClick={() => setShare(true)}
                >
                  <Icon name="share" />
                </button>
              </div>
            </div>
            <p>오늘의 날씨를 관찰하고 말로 표현할 수 있어요.</p>
            <h3>발달 영역</h3>
            <div className="chips">
              <span className="chip">자연탐구</span>
              <span className="chip">의사소통</span>
            </div>
            <h3>준비물</h3>
            <p>연필, 지우개, 색연필, 사인펜</p>
            <div className="section-heading">
              <h3>활동 미리보기</h3>
              <Link className="text-link" to={`/viewer/${activity.id}`}>
                전체보기 <Icon name="chevron" size={16} />
              </Link>
            </div>
            <Link
              className="detail-previews"
              to={`/viewer/${activity.id}`}
              aria-label="활동지 미리보기"
            >
              <span />
              <span />
            </Link>
            <h3>엄마아빠 가이드</h3>
            <p>
              1. 오늘의 날씨를 관찰해요.
              <br />
              2. 날씨에 대해 이야기 나누면서 내 마음도 떠올려요.
              <br />
              3. 빈칸에 오늘의 날짜를 적어요.
              <br />
              4. 오늘의 날씨를 그리고 색칠하면 완성!
            </p>
            <div className="section-heading">
              <h3>리뷰 2개</h3>
              <Link
                className="text-link"
                to={`/activities/${activity.id}/reviews`}
              >
                전체보기 <Icon name="chevron" size={16} />
              </Link>
            </div>
            <div className="section" data-demo-content="figma-review">
              <div className="section-heading">
                <strong>도영이네</strong>
                <small>★★★★★</small>
              </div>
              <p>아이가 정말 좋아했어요. 날씨를 매일 관찰하게 됐어요.</p>
            </div>
            <div className="section-heading">
              <h3>이런 활동지는 어때요</h3>
              <Link className="text-link" to="/activities">
                전체보기 <Icon name="chevron" size={16} />
              </Link>
            </div>
            <div className="activity-grid">
              {activities
                .filter((item) => item.id !== activity.id)
                .slice(0, 2)
                .map((item) => (
                  <ActivityCard
                    key={item.id}
                    activity={item}
                    saved={savedIds.includes(item.id)}
                    onToggle={onToggle}
                  />
                ))}
            </div>
          </div>
          <div className="screen-actions">
            <div className="detail-buy-row">
              <button
                className="button square-button"
                aria-label={
                  savedIds.includes(activity.id)
                    ? '활동지 저장 해제'
                    : '활동지 저장'
                }
                onClick={() => onToggle(activity.id)}
              >
                <Icon
                  name={
                    savedIds.includes(activity.id) ? 'heartFilled' : 'heart'
                  }
                />
              </button>
              <button
                className="button"
                disabled={busy}
                onClick={() => void add()}
              >
                장바구니
              </button>
              <button
                className="button button--primary"
                onClick={() =>
                  user
                    ? navigate('/checkout', {
                        state: {
                          activityIds: [activity.id],
                          total: activity.price,
                        },
                      })
                    : navigate('/login')
                }
              >
                바로 구매
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="screen-content screen-content--center">
          <div className="empty-circle" />
          <h2>활동지를 찾을 수 없어요</h2>
        </div>
      )}
      {message && (
        <WireDialog title="활동지 안내" onClose={() => setMessage('')}>
          <p>{message}</p>
          <button
            className="button button--primary"
            onClick={() => setMessage('')}
          >
            확인
          </button>
        </WireDialog>
      )}
      {share && (
        <WireDialog title="활동지 공유" sheet onClose={() => setShare(false)}>
          <h2>활동지 공유</h2>
          <button
            className="button"
            onClick={() => {
              void navigator.clipboard
                .writeText(window.location.href)
                .then(() => {
                  setShare(false);
                  setMessage('링크를 복사했어요.');
                })
                .catch(() => setMessage('링크를 복사하지 못했어요.'));
            }}
          >
            링크 복사
          </button>
        </WireDialog>
      )}
    </div>
  );
}
