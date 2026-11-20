import { useChildren } from '../context/ChildrenContext';
import {
  filterRecommendations,
  recommendActivities,
  type PlayFilters,
} from '../lib/recommendations';
import { ActivityCatalog } from '../components/ActivityCatalog';
import { useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ReferenceHeader } from '../components/ReferenceHeader';
import { WireDialog } from '../components/WireDialog';
import { ActivityCard } from '../components/ActivityCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { type CatalogProps } from './HomePage';
import type { Activity } from '../types';

export function OneClickOverlay({
  onClose,
  onFind,
  activities = [],
}: {
  onClose: () => void;
  onFind: (filters: PlayFilters) => void;
  activities?: Activity[];
}) {
  const { user } = useAuth();
  const { children } = useChildren();
  const child =
    children.find((item) => item.id === user?.active_child_id) || children[0];
  const [filters, setFilters] = useState<PlayFilters>({
    name: child?.name || '',
    age: '',
    materials: [],
    categories: [],
    domains: [],
  });
  const categories = Array.from(
    new Set(
      activities.flatMap((item) => item.categoryNames || [item.category]),
    ),
  );
  function toggle(key: 'materials' | 'categories' | 'domains', value: string) {
    setFilters((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
  }
  function group(
    key: 'materials' | 'categories' | 'domains',
    title: string,
    options: string[],
  ) {
    return (
      <fieldset className="finder-fieldset">
        <legend>{title}</legend>
        <div className="chips">
          {options.map((value) => (
            <button
              type="button"
              className={`chip ${filters[key].includes(value) ? 'is-selected' : ''}`}
              aria-pressed={filters[key].includes(value)}
              key={value}
              onClick={() => toggle(key, value)}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }
  return (
    <WireDialog
      title="원클릭 맞춤형 놀이 찾기"
      className="oneclick-modal oneclick-modal--filters"
      onClose={onClose}
    >
      <div className="finder-header">
        <h2>맞춤형 놀이 찾기</h2>
        <button
          type="button"
          className="oneclick-modal__close"
          aria-label="맞춤 놀이 닫기"
          onClick={onClose}
        >
          <span className="finder-close-glyph" aria-hidden="true" />
        </button>
      </div>
      <form
        className="finder-form"
        onSubmit={(event) => {
          event.preventDefault();
          onFind(filters);
        }}
      >
        <div className="finder-fields">
          <p>아이에게 맞는 놀이 조건을 골라 주세요.</p>
          <label className="wire-field">
            아이 이름
            <input
              value={filters.name}
              maxLength={40}
              placeholder="이름을 입력해 주세요"
              onChange={(event) =>
                setFilters({ ...filters, name: event.target.value })
              }
            />
          </label>
          <label className="wire-field">
            아이 나이
            <select
              value={filters.age}
              onChange={(event) =>
                setFilters({ ...filters, age: event.target.value })
              }
            >
              <option value="">
                {child ? '등록한 아이 월령 사용' : '전체 나이'}
              </option>
              {Array.from({ length: 10 }, (_, age) => (
                <option value={age} key={age}>
                  만 {age}세
                </option>
              ))}
            </select>
          </label>
          {group('materials', '가지고 있는 준비물', [
            '연필',
            '지우개',
            '색연필',
            '사인펜',
            '가위',
            '풀',
            '색종이',
            '클레이',
          ])}
          {group(
            'categories',
            '관심 카테고리',
            categories.length
              ? categories
              : [
                  '그림/색칠',
                  '만들기',
                  '한글',
                  '숫자',
                  '역할',
                  '영어',
                  '음악',
                  '체육',
                ],
          )}
          {group('domains', '원하는 발달 영역', [
            '신체운동·건강',
            '의사소통',
            '사회관계',
            '예술경험',
            '자연탐구',
          ])}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              setFilters({
                name: '',
                age: '',
                materials: [],
                categories: [],
                domains: [],
              })
            }
          >
            조건 초기화
          </button>
        </div>
        <div className="finder-submit">
          <button type="submit" className="button button--primary">
            활동안 찾기
          </button>
        </div>
      </form>
    </WireDialog>
  );
}

export function ReferenceRecommendationsPage(props: CatalogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { children } = useChildren();
  const child =
    children.find((item) => item.id === user?.active_child_id) || children[0];
  const { state } = useLocation();
  const filters = state?.playFilters as PlayFilters | undefined;
  const items = filters
    ? filterRecommendations(
        filters.age
          ? props.activities
          : recommendActivities(props.activities, child),
        filters,
      ).slice(0, 20)
    : recommendActivities(props.activities, child);
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <div className="reference-results" data-figma-node="86:2932">
      <div className="screen-content">
        <h1>원클릭 활동안 찾기 결과</h1>
        <p>
          바로시작할 수 있는 놀이활동 <strong>{items.length}개</strong> 있어요
        </p>
        <p className="recommendation-context">
          {filters
            ? `${filters.name || child?.name || '아이'}의 선택한 조건으로 골랐어요.`
            : child
              ? `${child.name}의 월령과 관심사를 기준으로 골랐어요.`
              : '아이를 등록하면 월령과 관심사에 맞춰 골라드려요.'}
        </p>
        {filters &&
          (filters.materials.length > 0 || filters.domains.length > 0) && (
            <p className="recommendation-context">
              준비물·발달 영역 정보가 등록된 활동안만 해당 조건에 표시됩니다.
            </p>
          )}
        <div className="activity-grid">
          {items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              saved={props.savedIds.includes(activity.id)}
              onToggle={props.onToggle}
              selected={selected.includes(activity.id)}
              onSelect={(id) =>
                setSelected((ids) =>
                  ids.includes(id)
                    ? ids.filter((value) => value !== id)
                    : [...ids, id],
                )
              }
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
          disabled={!selected.length}
          onClick={() =>
            navigate('/checkout', { state: { activityIds: selected } })
          }
        >
          원클릭 결제
        </button>
      </div>
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
          활동 찾기
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
  return <ActivityCatalog {...props} activities={props.items} />;
}
