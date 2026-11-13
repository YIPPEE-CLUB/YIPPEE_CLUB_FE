import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../data/activities';
import { ActivityCard } from '../components/ActivityCard';
import { PageHeader } from '../components/Layout';
import { Icon } from '../components/Icon';
import {
  CatalogFilters,
  defaultFilters,
  filterActivities,
} from '../components/CatalogFilters';
import { TrendingKeywords, type CatalogProps } from './HomePage';

export function ActivitiesPage({
  activities,
  savedIds,
  onToggle,
}: CatalogProps) {
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get('category') || '전체');
  const [filters, setFilters] = useState(defaultFilters);
  const filtered = filterActivities(activities, filters, '', category);

  return (
    <div className="page-content" data-figma-node="117:538">
      <PageHeader title="활동찾기" />
      {/* Figma처럼 검색창을 누르면 독립된 검색 입력 화면으로 이동합니다. */}
      <Link
        className="search-field search-entry"
        to="/search"
        aria-label="활동지 검색 열기"
      >
        <span>놀이 키워드를 입력해보세요.(자동차, 공룡)</span>
        <Icon name="search" />
      </Link>
      <div className="chips" aria-label="활동 카테고리">
        {categories.map((name) => (
          <button
            key={name}
            className={`chip ${category === name ? 'is-selected' : ''}`}
            aria-pressed={category === name}
            onClick={() => setCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <CatalogFilters
        countLabel={`활동지 ${filtered.length}개`}
        filters={filters}
        onChange={setFilters}
      />
      {filtered.length ? (
        <div className="activity-grid">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              saved={savedIds.includes(activity.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : (
        <div className="wire-empty">
          <div className="empty-circle" />
          <h2>조건에 맞는 활동지가 없어요</h2>
          <p>검색조건을 변경해 보세요.</p>
          <button
            className="text-button"
            onClick={() => {
              setCategory('전체');
              setFilters(defaultFilters);
            }}
          >
            검색조건 변경
          </button>
        </div>
      )}
      {filtered.length > 0 && <TrendingKeywords collapsible={false} />}
    </div>
  );
}
