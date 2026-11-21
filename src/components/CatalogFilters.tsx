import { useState } from 'react';
import { WireDialog } from './WireDialog';
import { Icon } from './Icon';
import { DevelopmentIcon, developmentDomains } from './DevelopmentIcon';
import type { Activity } from '../types';

export interface Filters {
  age: string;
  duration: string;
  difficulty: string;
  domain: string;
  price: string;
  sort: string;
}
export const defaultFilters: Filters = {
  age: '',
  duration: '',
  difficulty: '',
  domain: '',
  price: '',
  sort: 'latest',
};
const sortLabels: Record<string, string> = {
  latest: '최신순',
  price_asc: '낮은 가격순',
  price_desc: '높은 가격순',
};
const choices: Record<string, [string, string][]> = {
  domain: developmentDomains.map(({ value, label }) => [value, label]),
  age: [1, 2, 3, 4, 5].map((age) => [String(age), `만 ${age}세`]),
  duration: [
    ['5-10', '5-10분'],
    ['10-20', '10-20분'],
    ['20-plus', '20분 이상'],
  ],
  difficulty: [
    ['easy', '하'],
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
  domain: '발달영역',
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
        (category === '전체' ||
          (category === 'AI'
            ? item.isAiGenerated === true
            : (item.categoryNames || [item.category]).includes(category))) &&
        (!filters.age ||
          (item.ageMinMonths !== undefined && item.ageMaxMonths !== undefined
            ? item.ageMinMonths <= Number(filters.age) * 12 + 11 &&
              item.ageMaxMonths >= Number(filters.age) * 12
            : item.ageYears === Number(filters.age))) &&
        (!filters.duration ||
          (() => {
            const [low, high] =
              filters.duration === '20-plus'
                ? [20, 65535]
                : filters.duration.split('-').map(Number);
            return (
              (item.durationMin ?? item.duration) <= high &&
              (item.durationMax ?? item.duration) >= low
            );
          })()) &&
        (!filters.difficulty || item.difficulty === filters.difficulty) &&
        (!filters.domain ||
          !!item.developmentDomains?.includes(filters.domain)) &&
        (!filters.price || item.price <= Number(filters.price))
      );
    })
    .sort((a, b) =>
      filters.sort === 'price_asc'
        ? a.price - b.price
        : filters.sort === 'price_desc'
          ? b.price - a.price
          : 0,
    );
}

export function CatalogFilters({
  countLabel,
  filters,
  onChange,
  search = false,
  domainAvailable = true,
}: {
  countLabel: string;
  filters: Filters;
  onChange: (value: Filters) => void;
  search?: boolean;
  domainAvailable?: boolean;
}) {
  const [open, setOpen] = useState<keyof Filters | null>(null);
  const [draft, setDraft] = useState('');
  const keys: (keyof Filters)[] = [
    'age',
    'duration',
    search ? 'price' : 'domain',
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
        <WireDialog
          title={titles[open]}
          sheet
          className="catalog-filter-sheet"
          onClose={() => setOpen(null)}
        >
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
              {open === 'domain' && !domainAvailable && (
                <p className="wire-note" role="status">
                  발달영역 데이터 준비 중이에요. 아이콘은 미리 확인할 수 있어요.
                </p>
              )}
              <div
                className={open === 'domain' ? 'development-options' : 'chips'}
              >
                {choices[open].map(([value, label]) => (
                  <button
                    key={value}
                    className={`chip ${draft === value ? 'is-selected' : ''}`}
                    aria-pressed={draft === value}
                    onClick={() => setDraft(draft === value ? '' : value)}
                  >
                    {open === 'domain' &&
                      (() => {
                        const domain = developmentDomains.find(
                          (item) => item.value === value,
                        );
                        return domain ? (
                          <DevelopmentIcon
                            kind={domain.kind}
                            color={domain.color}
                          />
                        ) : null;
                      })()}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="dialog-actions">
                <button className="button" onClick={() => setDraft('')}>
                  초기화
                </button>
                <button
                  className="button button--accent"
                  disabled={open === 'domain' && !domainAvailable && !!draft}
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
