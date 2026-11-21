import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActivityCard } from '../components/ActivityCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import type { CatalogProps } from './HomePage';

// 원본 리뷰 문구는 화면 확인용이며 실제 구매자의 리뷰로 사용하지 않습니다.
const reviewLabels = [
  '★★★★★  아이가 정말 좋아했어요',
  '★★★★☆  매일 날씨를 관찰해요',
  '★★★★★  좋아요',
];
const frameIds = ['117:853', '192:4817', '192:4921'];

export function PopularPage({ activities, savedIds, onToggle }: CatalogProps) {
  const items = activities.slice(0, 3);
  const [active, setActive] = useState(0);
  const [reviewsVisible, setReviewsVisible] = useState(true);
  const track = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function select(index: number) {
    const next = Math.max(0, Math.min(items.length - 1, index));
    if (next === active) return;
    setActive(next);
    setReviewsVisible(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setReviewsVisible(true), 180);
  }
  function move(index: number) {
    const first = track.current?.firstElementChild as HTMLElement | null;
    if (!first) return;
    const next = Math.max(0, Math.min(items.length - 1, index));
    track.current?.scrollTo({
      left: next * (first.offsetWidth + 20),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  return (
    <div className="popular-page" data-figma-node={frameIds[active]}>
      <ScreenHeader
        title="인기 활동지 TOP 3"
        right={
          <Link className="icon-button" to="/cart" aria-label="장바구니">
            <Icon name="cart" />
          </Link>
        }
      />
      {items.length ? (
        <>
          <div
            className={`popular-reviews ${reviewsVisible ? 'is-visible' : ''}`}
            aria-label="리뷰 미리보기"
          >
            {reviewLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>
          <div
            className="popular-carousel"
            aria-label="인기 활동지"
            aria-roledescription="캐러셀"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const next = Math.max(
                  0,
                  Math.min(
                    items.length - 1,
                    active + (event.key === 'ArrowRight' ? 1 : -1),
                  ),
                );
                move(next);
              }
            }}
          >
            <div
              ref={track}
              className="popular-track"
              onScroll={() => {
                const element = track.current;
                const first = element?.firstElementChild as HTMLElement | null;
                if (element && first)
                  select(
                    Math.round(element.scrollLeft / (first.offsetWidth + 20)),
                  );
              }}
            >
              {items.map((activity, index) => (
                <div
                  className="popular-slide"
                  key={activity.id}
                  role="group"
                  aria-roledescription="슬라이드"
                  aria-label={`${index + 1} / ${items.length}`}
                >
                  <ActivityCard
                    activity={activity}
                    saved={savedIds.includes(activity.id)}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
            <div className="popular-rank" aria-live="polite">
              <img src="/assets/6f48b.svg" alt="" />
              <strong>{active + 1}</strong>
            </div>
          </div>
          <div className="popular-controls" aria-label="인기 활동지 넘기기">
            <button
              type="button"
              aria-label="이전 인기 활동지"
              disabled={active === 0}
              onClick={() => move(active - 1)}
            >
              <span className="carousel-arrow--previous">
                <Icon name="chevron" size={18} />
              </span>
            </button>
            <span aria-live="polite">
              {active + 1} / {items.length}
            </span>
            <button
              type="button"
              aria-label="다음 인기 활동지"
              disabled={active >= items.length - 1}
              onClick={() => move(active + 1)}
            >
              <Icon name="chevron" size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="wire-empty">
          <h2>아직 등록된 활동지가 없어요.</h2>
          <Link className="button" to="/activities">
            활동지 보러가기
          </Link>
        </div>
      )}
    </div>
  );
}
