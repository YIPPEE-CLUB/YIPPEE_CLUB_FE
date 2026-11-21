import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ActivityCard } from './ActivityCard';
import {
  CatalogFilters,
  defaultFilters,
  filterActivities,
} from './CatalogFilters';
import { Icon } from './Icon';
import { TrendingKeywords, type CatalogProps } from '../screens/HomePage';
import { OneClickOverlay } from '../screens/ReferenceScreens';

export const CATALOG_PAGE_SIZE = 20;
export function ActivityCatalog({
  activities,
  savedIds,
  onToggle,
}: CatalogProps) {
  const navigate = useNavigate();
  const categoryTrack = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('category') || '전체';
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [finder, setFinder] = useState(false);
  const filtered = filterActivities(activities, filters, query, category);
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / CATALOG_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice(
    (currentPage - 1) * CATALOG_PAGE_SIZE,
    currentPage * CATALOG_PAGE_SIZE,
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPage(1);
  }
  function toggle(id: number) {
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }
  const categories = Array.from(
    new Set([
      '전체',
      'AI',
      ...activities.flatMap((item) => item.categoryNames || [item.category]),
    ]),
  );
  return (
    <div className="page-content reference-catalog activity-catalog">
      <h1>활동찾기</h1>
      <label className="search-field">
        <input
          aria-label="활동안 검색"
          placeholder="놀이 키워드를 입력해보세요.(자동차, 공룡)"
          value={query}
          onChange={(e) => update('q', e.target.value)}
        />
        <Icon name="search" />
      </label>
      <div className="category-scroller">
        <button
          type="button"
          className="category-scroll-button"
          aria-label="이전 카테고리 보기"
          onClick={() =>
            categoryTrack.current?.scrollBy({ left: -220, behavior: 'smooth' })
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div
          ref={categoryTrack}
          className="experience-categories"
          aria-label="활동 카테고리"
          tabIndex={0}
        >
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => {
                update('category', name);
              }}
            >
              <span>
                {name === '전체'
                  ? '🪐'
                  : name === 'AI'
                    ? '✨'
                    : name === '과학'
                      ? '🚀'
                      : name === '역사'
                        ? '👴'
                        : '🎨'}
              </span>
              {name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="category-scroll-button"
          aria-label="다음 카테고리 보기"
          onClick={() =>
            categoryTrack.current?.scrollBy({ left: 220, behavior: 'smooth' })
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m10 6 6 6-6 6" />
          </svg>
        </button>
      </div>
      <CatalogFilters
        domainAvailable={activities.some(
          (item) => item.developmentDomains?.length,
        )}
        countLabel={`활동안 ${filtered.length}개`}
        filters={filters}
        onChange={(value) => {
          setFilters(value);
          setPage(1);
        }}
      />
      {category === 'AI' &&
        !activities.some((item) => typeof item.isAiGenerated === 'boolean') && (
          <p className="wire-note" role="status">
            AI 제작 여부 데이터가 아직 연결되지 않았어요. 확인된 AI 활동지만 이
            목록에 표시됩니다.
          </p>
        )}
      <div className="activity-grid">
        {items.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            saved={savedIds.includes(activity.id)}
            onToggle={onToggle}
            selected={selected.includes(activity.id)}
            onSelect={toggle}
          />
        ))}
      </div>
      {!items.length && (
        <p className="wire-empty">
          조건에 맞는 활동안이 없어요. 검색어나 필터를 바꿔 주세요.
        </p>
      )}
      {totalPages > 1 && (
        <nav className="catalog-pagination" aria-label="활동안 페이지">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setPage(currentPage - 1);
              window.scrollTo(0, 0);
            }}
          >
            이전
          </button>
          <span aria-live="polite">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setPage(currentPage + 1);
              window.scrollTo(0, 0);
            }}
          >
            다음
          </button>
        </nav>
      )}
      <TrendingKeywords
        collapsible={false}
        onSearch={(value) => {
          update('q', value);
          window.scrollTo(0, 0);
        }}
      />
      <button
        type="button"
        className="button button--primary"
        onClick={() => setFinder(true)}
      >
        원클릭 맞춤형 놀이 찾기
      </button>
      {selected.length > 0 && (
        <div className="catalog-selection-bar">
          <span>{selected.length}개 선택</span>
          <button className="text-button" onClick={() => setSelected([])}>
            선택 해제
          </button>
          <button
            className="button button--primary"
            onClick={() =>
              navigate('/checkout', { state: { activityIds: selected } })
            }
          >
            선택 활동안 확인
          </button>
        </div>
      )}
      {finder && (
        <OneClickOverlay
          activities={activities}
          onClose={() => setFinder(false)}
          onFind={(playFilters) => {
            setFinder(false);
            navigate('/recommendations', { state: { playFilters } });
          }}
        />
      )}
    </div>
  );
}
