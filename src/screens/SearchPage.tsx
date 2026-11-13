import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { SearchField } from '../components/SearchField';
import {
  CatalogFilters,
  defaultFilters,
  filterActivities,
} from '../components/CatalogFilters';
import { ActivityCard } from '../components/ActivityCard';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import { useAuth } from '../context/AuthContext';
import { trendingKeywords } from '../data/activities';
import { TrendingKeywords, type CatalogProps } from './HomePage';

export function SearchPage({ activities, savedIds, onToggle }: CatalogProps) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const query = params.get('q') || '';
  const results = pathname === '/search/results';
  const [draft, setDraft] = useState(query);
  const [filters, setFilters] = useState(defaultFilters);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const historyKey = `yippee.recent-searches.${user?.id || 'guest'}`;
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(historyKey) || '[]',
      );
      return Array.isArray(stored)
        ? stored
            .filter((item): item is string => typeof item === 'string')
            .slice(0, 10)
        : [];
    } catch {
      return [];
    }
  });
  function saveHistory(items: string[]) {
    setHistory(items);
    try {
      localStorage.setItem(historyKey, JSON.stringify(items));
    } catch {
      /* 저장 공간이 부족해도 검색은 계속 사용할 수 있습니다. */
    }
  }
  function search(value: string) {
    const keyword = value.trim();
    if (!keyword) return;
    saveHistory(
      [keyword, ...history.filter((item) => item !== keyword)].slice(0, 10),
    );
    setFilters(defaultFilters);
    navigate(`/search/results?q=${encodeURIComponent(keyword)}`);
  }
  const filtered = filterActivities(activities, filters, query);
  const suggestions = Array.from(
    new Set([
      '자동차',
      '자동차 색칠놀이',
      '자동차 만들기',
      ...activities.map((item) => item.title),
      ...trendingKeywords,
    ]),
  )
    .filter((word) => draft.trim() && word.includes(draft.trim()))
    .slice(0, 5);
  const showSuggestions = !results && draft.trim().length > 0;

  return (
    <div
      className={`page-content search-page ${showSuggestions ? 'search-page--suggesting' : ''}`}
      data-figma-node={
        results
          ? filtered.length
            ? '117:713'
            : '117:771'
          : showSuggestions
            ? '123:2209'
            : '117:648'
      }
    >
      <header className="page-header">
        <h1>{results ? '검색 결과' : '검색'}</h1>
        <Link className="text-button" to="/activities">
          닫기
        </Link>
      </header>
      <SearchField
        key={`${pathname}:${query}`}
        initialValue={query}
        onDraftChange={setDraft}
        onSubmit={search}
        autoFocus={!results}
      />
      {results ? (
        filtered.length ? (
          <>
            <CatalogFilters
              countLabel={`검색 결과 ‘${query}’ 활동지 ${filtered.length}개`}
              filters={filters}
              onChange={setFilters}
              search
            />
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
          </>
        ) : (
          <div className="wire-empty wire-empty--search">
            <div className="empty-circle" />
            <h2>검색 결과가 없어요</h2>
            <p>다른 키워드로 찾아보세요.</p>
          </div>
        )
      ) : showSuggestions ? (
        <ul className="suggestion-list">
          {suggestions.map((word) => (
            <li key={word}>
              <button onClick={() => search(word)}>{word}</button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="section-heading">
            <h2 className="search-section-title">최근 검색어</h2>
            <button
              className="text-button"
              disabled={!history.length}
              onClick={() => setConfirmDelete(true)}
            >
              전체 삭제
            </button>
          </div>
          {history.length ? (
            <div className="chips recent-searches">
              {history.map((word) => (
                <div className="recent-chip" key={word}>
                  <button onClick={() => search(word)}>{word}</button>
                  <button
                    aria-label={`${word} 최근 검색어 삭제`}
                    onClick={() =>
                      saveHistory(history.filter((item) => item !== word))
                    }
                  >
                    <Icon name="closeWhite" size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="recent-empty">최근 검색어가 없어요.</p>
          )}
          <TrendingKeywords collapsible={false} onSearch={search} compact />
        </>
      )}
      {confirmDelete && (
        <WireDialog
          title="최근 검색어 전체 삭제"
          onClose={() => setConfirmDelete(false)}
        >
          <h2>최근 검색어를 모두 삭제할까요?</h2>
          <div className="dialog-actions">
            <button className="button" onClick={() => setConfirmDelete(false)}>
              취소
            </button>
            <button
              className="button button--primary"
              onClick={() => {
                saveHistory([]);
                setConfirmDelete(false);
              }}
            >
              삭제
            </button>
          </div>
        </WireDialog>
      )}
    </div>
  );
}
