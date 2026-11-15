import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ReferenceHeader } from '../components/ReferenceHeader';
import { WireDialog } from '../components/WireDialog';
import { ActivityCard } from '../components/ActivityCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { TrendingKeywords, type CatalogProps } from './HomePage';
import type { Activity } from '../types';

export function OneClickOverlay({
  onClose,
  onFind,
}: {
  onClose: () => void;
  onFind: () => void;
}) {
  return (
    <WireDialog
      title="원클릭 맞춤형 놀이 찾기"
      className="oneclick-modal"
      onClose={onClose}
    >
      <button
        type="button"
        className="oneclick-modal__close"
        aria-label="맞춤 놀이 닫기"
        onClick={onClose}
      >
        <img src="/assets/b9fb0.svg" alt="" />
      </button>
      <button type="button" className="button button--primary" onClick={onFind}>
        활동안 찾기
      </button>
    </WireDialog>
  );
}

export function ReferenceRecommendationsPage(props: CatalogProps) {
  const navigate = useNavigate();
  const { user, requestLogin } = useAuth();
  const items = props.activities.filter((item) => item.location).slice(0, 2);
  const [notice, setNotice] = useState(false);
  return (
    <div className="reference-results" data-figma-node="86:2932">
      <div className="screen-content">
        <h1>원클릭 활동안 찾기 결과</h1>
        <p>
          바로시작할 수 있는 놀이활동 <strong>{items.length}개</strong> 있어요
        </p>
        <div className="activity-grid">
          {items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              saved={false}
              onToggle={props.onToggle}
            />
          ))}
        </div>
        {!items.length && <p>조건에 맞는 활동지가 없어요.</p>}
      </div>
      <div className="reference-results__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => navigate(-1)}
        >
          뒤로가기
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={() => (user ? setNotice(true) : requestLogin())}
        >
          원클릭 결제
        </button>
      </div>
      {notice && (
        <WireDialog title="결제 안내" onClose={() => setNotice(false)}>
          <p>결제 기능을 준비 중이에요.</p>
          <button
            type="button"
            className="button button--accent"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function ReferenceOrdersPage() {
  const [month, setMonth] = useState(() =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
    }).format(new Date()),
  );
  const [filter, setFilter] = useState(false);
  const [status, setStatus] = useState('전체');
  const [year, number] = month.includes('-')
    ? month.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];
  function shift(delta: number) {
    const date = new Date(year, number - 1 + delta, 1);
    setMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    );
  }
  return (
    <div className="screen reference-orders" data-figma-node="86:2189">
      <ReferenceHeader
        title="결제 내역"
        right={
          <button
            type="button"
            className="icon-button"
            aria-label="결제 내역 필터"
            onClick={() => setFilter(true)}
          >
            <Icon name="filter" size={20} />
          </button>
        }
      />
      <div className="screen-content">
        <div className="order-month">
          <button type="button" aria-label="이전 달" onClick={() => shift(-1)}>
            <Icon name="back" />
          </button>
          <strong>
            {year}년 {number}월
          </strong>
          <button type="button" aria-label="다음 달" onClick={() => shift(1)}>
            <Icon name="chevron" />
          </button>
        </div>
        <div className="order-total">
          <span>총 결제 금액</span>
          <strong>0원</strong>
        </div>
        <div className="orders-empty">
          <img src="/assets/orders-mascot.png" alt="노란 공룡" />
          <p>{number}월 수업 결제 내역이 없습니다.</p>
        </div>
      </div>
      {filter && (
        <WireDialog
          title="결제 내역 필터"
          sheet
          onClose={() => setFilter(false)}
        >
          <h2>결제 상태</h2>
          <div className="chips">
            {['전체', '결제 완료', '취소'].map((value) => (
              <button
                type="button"
                key={value}
                className={`chip ${status === value ? 'is-selected' : ''}`}
                onClick={() => setStatus(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="button button--accent"
            onClick={() => setFilter(false)}
          >
            적용하기
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function ReferenceCardsPage() {
  return (
    <div className="screen reference-cards" data-figma-node="86:2190">
      <ReferenceHeader title="결제 카드 관리" />
      <div className="screen-content">
        <Link className="reference-add-row" to="/cards/new">
          <Icon name="plus" />
          카드 추가
        </Link>
      </div>
      <aside className="reference-notes">
        <h2>안내 사항</h2>
        <ul>
          <li>결제 예정인 수업이 있는 경우 카드를 삭제할 수 없어요.</li>
          <li>
            카드를 삭제하고 싶으신 경우, 결제가 가능한 카드를 등록하여 결제
            예정인 수업을 모두 해당 카드로 변경해주세요.
          </li>
          <li>
            <strong className="npay">N pay</strong>를 선택하여 공구를 신청하신
            경우, 카드로 결제 수단 변경이 어려우니 공구 취소 후 다시 등록해
            주세요.
          </li>
        </ul>
      </aside>
    </div>
  );
}

export function ReferenceActivityTypesPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '그림/색칠';
  return (
    <div className="screen reference-types" data-figma-node="86:2218">
      <ScreenHeader title="활동 유형 안내" />
      <div className="reference-type-tabs">
        {[
          '그림/색칠',
          '만들기',
          '한글',
          '숫자',
          '역할',
          '영어',
          '음악',
          '체육',
        ].map((label) => (
          <button
            type="button"
            key={label}
            className={category === label ? 'is-selected' : ''}
            onClick={() => setParams({ category: label })}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="screen-content">
        <h2>무궁무진한 아이 맞춤 놀이!</h2>
        <p>
          아이의 연령·성향에 맞춰 가정 내 교구를 다양하게 활용하거나, 놀이터에서
          신나게 뛰어 놀아요.
        </p>
        <img
          className="reference-type-photo"
          src="/assets/activity-guide-photo.png"
          alt="공룡 모자를 만들며 함께 놀이하는 부모와 아이"
        />
        <h2>연령에 따라 이렇게 놀 수 있어요</h2>
        {[
          [
            '1~3세',
            [
              ['감각놀이', '종이찢기 놀이, 모래놀이, 식재료 탐색 놀이'],
              ['역할놀이', '가족놀이, 소꿉놀이'],
              [
                '말 놀이',
                '의성어, 의태어가 풍부한 책 또는 동요를 활용해 상호작용하기',
              ],
            ],
          ],
          [
            '4~6세',
            [
              ['창작놀이', '블록놀이, 종이 접기, 그림 그리기'],
              ['상상놀이 또는 게임', '보드게임, 수수께끼 맞추기'],
            ],
          ],
          [
            '7~9세',
            [
              ['보드게임', '게임 규칙 및 사회성 발달시키기'],
              ['만들기', '실뜨기, 십자수, 종이접기 등'],
              ['기계/제품 분해하고 조립하기', '과학적 원리 이해 및 추론 연습'],
            ],
          ],
        ].map(([age, rows]) => (
          <section className="reference-age-group" key={age as string}>
            <span>{age as string}</span>
            <ul>
              {(rows as string[][]).map(([label, copy]) => (
                <li key={label}>
                  <strong>{label}</strong> - {copy}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="screen-actions">
        <Link
          className="button button--accent"
          to={`/activities?category=${encodeURIComponent(category)}`}
        >
          돌봄 신청하기
        </Link>
      </div>
    </div>
  );
}

export function ReferenceAccountInfoPage({
  contract = false,
}: {
  contract?: boolean;
}) {
  const { user } = useAuth();
  return (
    <div className="screen">
      <ReferenceHeader
        title={contract ? '계약서 조회' : '계좌정보 조회'}
        backTo="/settings"
      />
      <div className="screen-content">
        <p>
          {contract
            ? '등록된 계약서가 없습니다.'
            : '등록된 계좌정보가 없습니다.'}
        </p>
        {!user && (
          <Link className="button button--accent" to="/login">
            로그인 할래요!
          </Link>
        )}
      </div>
    </div>
  );
}

export function ReferenceCatalogPage(
  props: CatalogProps & { items: Activity[] },
) {
  const navigate = useNavigate();
  const { user, requestLogin } = useAuth();
  const [category, setCategory] = useState('전체');
  const [filters, setFilters] = useState({ region: '', age: '', schedule: '' });
  const [sheet, setSheet] = useState<'region' | 'age' | 'schedule' | null>(
    null,
  );
  const [draft, setDraft] = useState('');
  const [finder, setFinder] = useState(false);
  const [page, setPage] = useState(1);
  const choices = {
    region: ['전체', '서울 중부', '서울 북부'],
    age: [
      '전체',
      '만 1세',
      '만 2세',
      '만 3세',
      '만 4세',
      '만 5세',
      '만 6세',
      '만 7세',
      '만 8세',
      '만 9세',
    ],
    schedule: ['전체', '평일', '주말'],
  };
  const labels = { region: '지역', age: '아이 나이', schedule: '일정' };
  const items = props.items.filter(
    (item) =>
      (category === '전체' ||
        category === '프리미엄' ||
        item.category === category) &&
      (!filters.region ||
        filters.region === '전체' ||
        item.location === filters.region) &&
      (!filters.age ||
        filters.age === '전체' ||
        item.ageYears === Number(filters.age.replace(/\D/g, ''))) &&
      filters.schedule !== '평일',
  );
  return (
    <div className="page-content reference-catalog" data-figma-node="86:2370">
      <h1>활동찾기</h1>
      <Link className="search-field search-entry" to="/search">
        <span>놀이 키워드를 입력해보세요.(자동차, 공룡)</span>
        <Icon name="search" />
      </Link>
      <div className="experience-categories">
        {[
          ['🪐', '전체'],
          ['⭐', '프리미엄'],
          ['🚀', '과학'],
          ['👴', '역사'],
        ].map(([emoji, label]) => (
          <button
            key={label}
            type="button"
            aria-pressed={category === label}
            onClick={() => {
              setCategory(label);
              setPage(1);
            }}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      <div className="filters">
        {(['region', 'age', 'schedule'] as const).map((key) => (
          <button
            className="filter-chip"
            key={key}
            type="button"
            onClick={() => {
              setSheet(key);
              setDraft(filters[key]);
            }}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {filters[key] || labels[key]} <Icon name="down" size={16} />
          </button>
        ))}
      </div>
      <div className="activity-grid">
        {[...items, ...items].map((activity, index) => (
          <ActivityCard
            key={`${activity.id}-${index}-${page}`}
            activity={activity}
            saved={false}
            onToggle={props.onToggle}
          />
        ))}
      </div>
      {!items.length && (
        <p className="wire-empty">조건에 맞는 활동지가 없어요.</p>
      )}
      <div className="catalog-pagination">
        {[1, 2, 3].map((value) => (
          <button
            key={value}
            type="button"
            aria-current={page === value ? 'page' : undefined}
            onClick={() => setPage(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <TrendingKeywords />
      <button
        type="button"
        className="button button--primary"
        onClick={() => (user ? setFinder(true) : requestLogin())}
      >
        원클릭 맞춤형 놀이 찾기
      </button>
      {sheet && (
        <WireDialog title={labels[sheet]} sheet onClose={() => setSheet(null)}>
          <h2>{labels[sheet]}</h2>
          <div className="chips">
            {choices[sheet].map((value) => (
              <button
                key={value}
                type="button"
                className={`chip ${draft === value ? 'is-selected' : ''}`}
                onClick={() => setDraft(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              className="button"
              onClick={() => setDraft('')}
            >
              초기화
            </button>
            <button
              type="button"
              className="button button--accent"
              onClick={() => {
                setFilters({ ...filters, [sheet]: draft });
                setSheet(null);
              }}
            >
              적용하기
            </button>
          </div>
        </WireDialog>
      )}
      {finder && (
        <OneClickOverlay
          onClose={() => setFinder(false)}
          onFind={() => navigate('/recommendations')}
        />
      )}
    </div>
  );
}
