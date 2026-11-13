import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Activity } from '../types';
import { trendingKeywords } from '../data/activities';
import { ActivityCard } from '../components/ActivityCard';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildrenContext';

export interface CatalogProps {
  activities: Activity[];
  savedIds: number[];
  onToggle: (id: number) => void | Promise<void>;
}

export function TrendingKeywords({
  collapsible = true,
  onSearch,
  compact = false,
}: {
  collapsible?: boolean;
  onSearch?: (value: string) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className={`section ${compact ? 'section--compact' : ''}`}>
      <h2>실시간 인기 검색어</h2>
      <div className="trending-box">
        <div className="section-heading">
          <small>오전 9시 업데이트</small>
          {collapsible && (
            <button
              className="text-button"
              aria-expanded={expanded}
              aria-controls="trending-list"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '접기' : '펼치기'}
            </button>
          )}
        </div>
        {expanded && (
          <ol id="trending-list" className="trending-list">
            {trendingKeywords.map((keyword, index) => (
              <li key={keyword}>
                {onSearch ? (
                  <button
                    className="trending-keyword"
                    onClick={() => onSearch(keyword)}
                  >
                    <span>{index + 1}</span>
                    {keyword}
                  </button>
                ) : (
                  <Link to={`/search/results?q=${encodeURIComponent(keyword)}`}>
                    <span>{index + 1}</span>
                    {keyword}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export function HomePage({ activities, savedIds, onToggle }: CatalogProps) {
  const { user } = useAuth();
  const { children } = useChildren();
  const child = children.find((item) => item.id === user?.active_child_id);
  return (
    <div
      className="home-page"
      data-figma-node={user ? (child ? '122:1781' : '122:1891') : '168:4872'}
    >
      <header className="home-header">
        <Link
          className="avatar-placeholder"
          to="/profile"
          aria-label="내 정보"
        />
        <h1>YIPPEE CLUB</h1>
        <div className="header-actions">
          <Link className="icon-button" to="/notifications" aria-label="알림">
            <Icon name="bell" />
          </Link>
          {user && (
            <Link className="icon-button" to="/cart" aria-label="장바구니">
              <Icon name="cart" />
            </Link>
          )}
        </div>
      </header>
      <div className="home-content">
        {user ? (
          <h2 className="home-greeting">
            {child ? (
              <>
                {child.name} 부모님,
                <br />
                오늘은 어떤 특별한 놀이를 해볼까요?
              </>
            ) : (
              <>
                아이를 등록하면
                <br />
                맞춤 놀이를 찾아드려요
              </>
            )}
          </h2>
        ) : (
          <h2 className="home-greeting">
            사랑하는 아이와 함께 집에서도,
            <br />
            지금 바로 놀이할 수 있어요!
          </h2>
        )}
        {user ? (
          child ? (
            <section className="home-category-panel">
              <div className="home-category-grid">
                {[
                  '그림/색칠',
                  '만들기',
                  '한글',
                  '숫자',
                  '역할',
                  '영어',
                  '음악',
                  '체육',
                ].map((category) => (
                  <Link
                    key={category}
                    to={`/activity-types?category=${encodeURIComponent(category)}`}
                  >
                    <span />
                    <small>{category}</small>
                  </Link>
                ))}
              </div>
              <Link className="button button--primary" to="/recommendations">
                원클릭 맞춤형 놀이 찾기
              </Link>
            </section>
          ) : (
            <section className="info-panel home-child-invite">
              <strong>우리 아이 정보를 저장해주세요.</strong>
              <Link className="button button--primary" to="/children/new">
                아이 등록하기
              </Link>
            </section>
          )
        ) : (
          <>
            <section className="intro-grid" aria-label="이용방법">
              <Link className="intro-card" to="/how-to">
                <small>이용방법</small>
                <strong>
                  YIPPEECLUB에
                  <br />
                  처음 오셨나요?
                </strong>
              </Link>
              <Link className="intro-card" to="/how-to">
                <small>이용방법</small>
                <strong>
                  즐겁게 놀이하면
                  <br />
                  쌓이는 활동배지
                </strong>
              </Link>
            </section>
            <Link className="button button--primary" to="/activities">
              오늘부터 놀이활동 시작하기
            </Link>
          </>
        )}
        <section className="section">
          <div className="section-heading">
            <h2>
              지금 가장
              <br />
              인기많은 활동지
            </h2>
            <Link className="text-link" to="/activities">
              전체보기 <Icon name="chevron" size={16} />
            </Link>
          </div>
          <div className="activity-grid">
            {activities.slice(0, 2).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                saved={savedIds.includes(activity.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
          {activities.length === 0 && (
            <p className="empty-state">아직 등록된 활동지가 없어요.</p>
          )}
        </section>
        <TrendingKeywords />
        <section className="section">
          <div className="section-heading">
            <h2>엄마아빠 가이드북</h2>
            <Link className="text-link" to="/guides">
              전체보기 <Icon name="chevron" size={16} />
            </Link>
          </div>
          {['낯가리는 아이', '약속하기 연습'].map((title, index) => (
            <Link className="guide-row" to={`/guides/${index + 1}`} key={title}>
              <span className="guide-row__thumbnail" />
              <span>{title}</span>
              <Icon name="chevron" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
