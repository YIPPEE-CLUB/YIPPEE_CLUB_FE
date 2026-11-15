import { useState } from 'react';
import { WireDialog } from './WireDialog';
import { Icon } from './Icon';
import type { Activity } from '../types';

export interface Filters {
  age: string;
  duration: string;
  difficulty: string;
  price: string;
  sort: string;
}
export const defaultFilters: Filters = {
  age: '',
  duration: '',
  difficulty: '',
  price: '',
  sort: 'popular',
};
const sortLabels: Record<string, string> = {
  popular: '인기순',
  latest: '최신순',
  price_asc: '낮은 가격순',
  price_desc: '높은 가격순',
};
const choices: Record<string, [string, string][]> = {
  age: [1, 2, 3, 4, 5].map((age) => [String(age), `만 ${age}세`]),
  duration: [
    ['5-10', '5-10분'],
    ['10-20', '10-20분'],
    ['20-plus', '20분 이상'],
  ],
  difficulty: [
    ['easy', '하'],
    ['normal', '중'],
    ['hard', '상'],
  ],
  price: [
    ['1000', '1,000원 이하'],
    ['2000', '2,000원 이하'],
    ['5000', '5,000원 이하'],
  ],
};
const titles: Record<string, string> = {
  age: '아이 나이',
  duration: '소요시간',
  difficulty: '난이도',
  price: '가격',
  sort: '정렬',
};

export function filterActivities(
  activities: Activity[],
  filters: Filters,
  query = '',
  category = '전체',
) {
  return activities
    .filter((item) => {
      return (
        `${item.title} ${item.subtitle}`.includes(query) &&
        (category === '전체' || item.category === category) &&
        (!filters.age || item.ageYears === Number(filters.age)) &&
        (!filters.duration ||
          (filters.duration === '5-10'
            ? item.duration <= 10
            : filters.duration === '10-20'
              ? item.duration > 10 && item.duration <= 20
              : item.duration > 20)) &&
        (!filters.difficulty || item.difficulty === filters.difficulty) &&
        (!filters.price || item.price <= Number(filters.price))
      );
    })
    .sort((a, b) =>
      filters.sort === 'price_asc'
        ? a.price - b.price
        : filters.sort === 'price_desc'
          ? b.price - a.price
          : filters.sort === 'latest'
            ? b.id - a.id
            : a.id - b.id,
    );
}

export function CatalogFilters({
  countLabel,
  filters,
  onChange,
  search = false,
}: {
  countLabel: string;
  filters: Filters;
  onChange: (value: Filters) => void;
  search?: boolean;
}) {
  const [open, setOpen] = useState<keyof Filters | null>(null);
  const [draft, setDraft] = useState('');
  const keys: (keyof Filters)[] = [
    'age',
    'duration',
    search ? 'price' : 'difficulty',
  ];
  function show(key: keyof Filters) {
    setDraft(filters[key]);
    setOpen(key);
  }
  return (
    <>
      <div className="section-heading">
        <span className="result-count">{countLabel}</span>
        <button className="filter-chip" onClick={() => show('sort')}>
          {sortLabels[filters.sort]}
          <Icon name="down" size={16} />
        </button>
      </div>
      <div className="filters">
        {keys.map((key) => (
          <button
            key={key}
            className={`filter-chip ${filters[key] ? 'is-applied' : ''}`}
            onClick={() => show(key)}
          >
            {choices[key]?.find(([value]) => value === filters[key])?.[1] ||
              titles[key]}
            <Icon name="down" size={16} />
          </button>
        ))}
      </div>
      {open && (
        <WireDialog title={titles[open]} sheet onClose={() => setOpen(null)}>
          {open === 'sort' ? (
            <>
              <div className="section-heading">
                <h2>정렬</h2>
                <button
                  className="icon-button"
                  aria-label="정렬 닫기"
                  onClick={() => setOpen(null)}
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="sort-options">
                {Object.entries(sortLabels).map(([value, label]) => (
                  <label key={value}>
                    {label}
                    <input
                      type="radio"
                      name="sort"
                      checked={filters.sort === value}
                      onChange={() => {
                        onChange({ ...filters, sort: value });
                        setOpen(null);
                      }}
                    />
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="filter-title">{titles[open]}</h2>
              <div className="chips">
                {choices[open].map(([value, label]) => (
                  <button
                    key={value}
                    className={`chip ${draft === value ? 'is-selected' : ''}`}
                    aria-pressed={draft === value}
                    onClick={() => setDraft(draft === value ? '' : value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="dialog-actions">
                <button className="button" onClick={() => setDraft('')}>
                  초기화
                </button>
                <button
                  className="button button--accent"
                  onClick={() => {
                    onChange({ ...filters, [open]: draft });
                    setOpen(null);
                  }}
                >
                  적용하기
                </button>
              </div>
            </>
          )}
        </WireDialog>
      )}
    </>
  );
}
