import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import { ActivityCard } from '../components/ActivityCard';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../context/ChildrenContext';
import { categories } from '../data/activities';
import type { CatalogProps } from './HomePage';

export function EmptyScreen({
  kind,
}: {
  kind:
    | 'orders'
    | 'records'
    | 'cards'
    | 'network'
    | 'server'
    | 'missing'
    | 'maintenance';
}) {
  const config = {
    orders: {
      node: '118:1282',
      title: '결제 내역',
      heading: '아직 결제 내역이 없어요',
      description: '결제한 활동지가 여기에 표시돼요.',
      button: '',
      to: '',
    },
    records: {
      node: '124:3394',
      title: '활동 기록',
      heading: '아직 활동 기록이 없어요',
      description: '활동을 마치면 여기에 쌓여요.',
      button: '활동지 보러가기',
      to: '/activities',
    },
    cards: {
      node: '124:4546',
      title: '결제 카드 관리',
      heading: '등록된 카드가 없어요',
      description: '',
      button: '카드 추가',
      to: '/cards/new',
    },
    network: {
      node: '124:5155',
      title: '',
      heading: '인터넷에 연결되어 있지 않아요',
      description: '연결을 확인하고 다시 시도해 주세요.',
      button: '다시 시도',
      to: '/',
    },
    server: {
      node: '124:5163',
      title: '',
      heading: '일시적인 오류가 생겼어요',
      description: '잠시 후 다시 시도해 주세요.',
      button: '다시 시도',
      to: '/',
    },
    missing: {
      node: '124:5171',
      title: '',
      heading: '페이지를 찾을 수 없어요',
      description: '주소가 바뀌었거나 삭제되었어요.',
      button: '홈으로',
      to: '/',
    },
    maintenance: {
      node: '124:5179',
      title: '',
      heading: '서비스 점검 중이에요',
      description: '0000.00.00 00:00 ~ 00:00',
      button: '',
      to: '/',
    },
  }[kind];
  return (
    <div
      className={`screen ${!config.title ? 'system-screen' : ''}`}
      data-figma-node={config.node}
    >
      {config.title && <ScreenHeader title={config.title} backTo="/profile" />}
      <div className="screen-content screen-content--center">
        <div className="empty-circle" />
        <h2>{config.heading}</h2>
        {config.description && <p>{config.description}</p>}
      </div>
      {config.button && (
        <div className="screen-actions">
          <Link className="button button--primary" to={config.to}>
            {config.button}
          </Link>
        </div>
      )}
    </div>
  );
}

export function HowToPage() {
  return (
    <div className="screen" data-figma-node="122:2483">
      <ScreenHeader title="이용방법" />
      <div className="screen-content how-to-list">
        {[
          '아이 정보를 등록해요',
          '마음에 드는 활동지를 찾아요',
          '프린트해서 마음껏 놀이해요',
          '리뷰를 쓰면 배지를 받아요',
        ].map((text, index) => (
          <div className="how-to-row" key={text}>
            <span />
            <div>
              <small>STEP {index + 1}</small>
              <strong>{text}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/activities">
          놀이활동 시작하기
        </Link>
      </div>
    </div>
  );
}

export function ActivityTypesPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '그림/색칠';
  const painting = category === '그림/색칠';
  return (
    <div className="screen" data-figma-node={painting ? '117:946' : '123:3082'}>
      <ScreenHeader title="활동 유형 안내" />
      <div className="screen-content">
        <div className="chips">
          {categories.slice(1, 9).map((name) => (
            <button
              className={`chip ${category === name ? 'is-selected' : ''}`}
              key={name}
              aria-pressed={category === name}
              onClick={() => setParams({ category: name })}
            >
              {name}
            </button>
          ))}
        </div>
        <h2>
          {painting
            ? '내 생각을 펼치는 알록달록 미술의 세계!'
            : `${category} 놀이`}
        </h2>
        {painting && (
          <p className="body-copy">
            그림으로 마음껏 표현하고 색칠도구를 다양하게 활용해요.
          </p>
        )}
        <div className="activity-type-hero" />
        <h2>연령에 따라 이렇게 놀 수 있어요</h2>
        {['만 1~2세', '만 3~4세', '만 5세'].map((age, index) => (
          <section className="age-guide" key={age}>
            <span className="tag">{age}</span>
            {painting ? (
              <>
                <p>
                  •{' '}
                  {
                    [
                      '도형 구별하기',
                      '두가지 색깔 섞어보기',
                      '이야기 짓고 나만의 책만들기 (상상해서 그리기)',
                    ][index]
                  }
                </p>
                <p>
                  •{' '}
                  {
                    [
                      '다양한 색깔 알아보기',
                      '보고 따라 그리기',
                      '구체적인 표정 묘사하기',
                    ][index]
                  }
                </p>
              </>
            ) : (
              <>
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </>
            )}
          </section>
        ))}
      </div>
      <div className="screen-actions">
        <Link
          className="button button--primary"
          to={`/activities?category=${encodeURIComponent(category)}`}
        >
          {painting ? '' : `${category} `}활동지 보러가기
        </Link>
      </div>
    </div>
  );
}

export function GuidesPage() {
  return (
    <div className="screen" data-figma-node="117:1137">
      <ScreenHeader title="부모님 가이드북" />
      <div className="screen-content">
        {['낯가리는 아이', '약속하기 연습'].map((title, index) => (
          <Link className="guide-row" key={title} to={`/guides/${index + 1}`}>
            <span className="guide-row__thumbnail" />
            <span>{title}</span>
          </Link>
        ))}
        <button
          className="button button--small"
          onClick={(event) => {
            event.currentTarget.disabled = true;
            event.currentTarget.textContent = '마지막 글이에요';
          }}
        >
          더보기
        </button>
      </div>
    </div>
  );
}

export function GuideDetailPage() {
  const { guideId } = useParams();
  const [notice, setNotice] = useState(false);
  return (
    <div className="screen" data-figma-node="117:1183">
      <ScreenHeader
        title="가이드북"
        backTo="/guides"
        right={
          <button
            className="icon-button"
            aria-label="가이드북 공유"
            onClick={() => setNotice(true)}
          >
            <Icon name="share" />
          </button>
        }
      />
      <div className="guide-detail-hero" />
      <div className="screen-content">
        <span className="tag guide-read-time">5분 읽기</span>
        <h1 className="guide-detail-title">
          {guideId === '2' ? '약속하기 연습' : '낯가리는 아이'}
        </h1>
        <div className="skeleton-paragraph">
          <span />
          <span />
          <span />
        </div>
        <h2>이렇게 도와주세요</h2>
        <div className="skeleton-paragraph">
          <span />
          <span />
          <span />
        </div>
        <div className="section-heading">
          <Link className="text-button" to="/guides/1">
            이전 글
          </Link>
          <Link className="text-button" to="/guides/2">
            다음 글
          </Link>
        </div>
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/activities">
          관련 활동지 보기
        </Link>
      </div>
      {notice && (
        <WireDialog title="가이드북 공유" onClose={() => setNotice(false)}>
          <h2>가이드북 공유</h2>
          <button
            className="button"
            onClick={() =>
              void navigator.clipboard
                .writeText(window.location.href)
                .then(() => setNotice(false))
            }
          >
            링크 복사
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="screen" data-figma-node="118:1475">
      <ScreenHeader title="설정" backTo="/profile" />
      <div className="screen-content settings-content">
        <h2 className="wire-subtitle">계정 정보</h2>
        <div className="settings-rows">
          <div className="settings-row">
            <span>이메일</span>
            <small>{user?.email || ''}</small>
          </div>
          {[
            ['/settings/phone', '휴대전화 번호 변경'],
            ['/settings/password', '비밀번호 변경'],
            ['/settings/notifications', '알림 설정'],
          ].map(([to, title]) => (
            <Link className="settings-row" to={to} key={to}>
              <span>{title}</span>
              <Icon name="chevron" />
            </Link>
          ))}
        </div>
        <h2 className="wire-subtitle">기타 정보</h2>
        <div className="settings-rows">
          <Link className="settings-row" to="/version">
            <span>버전 정보</span>
            <small>0.0.0</small>
          </Link>
          <Link className="settings-row" to="/licenses">
            <span>오픈소스 라이선스</span>
            <Icon name="chevron" />
          </Link>
        </div>
        <div className="settings-account-actions">
          <button className="text-button" onClick={() => setConfirm(true)}>
            로그아웃
          </button>
          <span>│</span>
          <Link className="text-button" to="/settings/withdraw">
            회원탈퇴
          </Link>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
      </div>
      {confirm && (
        <WireDialog title="로그아웃" onClose={() => setConfirm(false)}>
          <h2>로그아웃할까요?</h2>
          <div className="dialog-actions">
            <button className="button" onClick={() => setConfirm(false)}>
              취소
            </button>
            <button
              className="button button--primary"
              onClick={() =>
                void logout()
                  .then(() => navigate('/'))
                  .catch((cause: Error) => {
                    setError(cause.message);
                    setConfirm(false);
                  })
              }
            >
              로그아웃
            </button>
          </div>
        </WireDialog>
      )}
    </div>
  );
}

export function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState([true, true, false]);
  const [notice, setNotice] = useState(false);
  return (
    <div className="screen" data-figma-node="118:1546">
      <ScreenHeader title="알림 설정" backTo="/settings" />
      <div className="screen-content">
        {[
          ['새 놀이 추천', '아이에게 맞는 새 활동지를 알려드려요.'],
          ['활동 알림', '배지 획득과 활동 소식을 알려드려요.'],
          ['이벤트·혜택', '이벤트 소식을 알려드려요.'],
        ].map(([title, description], index) => (
          <div className="notification-setting" key={title}>
            <div>
              <p>{title}</p>
              <small>{description}</small>
            </div>
            <button
              className={`toggle ${enabled[index] ? 'is-on' : ''}`}
              role="switch"
              aria-label={title}
              aria-checked={enabled[index]}
              onClick={() => {
                setEnabled(
                  enabled.map((value, key) => (index === key ? !value : value)),
                );
                setNotice(true);
              }}
            >
              <span />
            </button>
          </div>
        ))}
      </div>
      {notice && (
        <WireDialog title="알림 설정 안내" onClose={() => setNotice(false)}>
          <p>
            현재는 화면에서만 변경돼요. 알림 설정 저장 API는 아직 연결되지
            않았어요.
          </p>
          <button
            className="button button--primary"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function SupportPage() {
  return (
    <div className="screen" data-figma-node="124:4633">
      <ScreenHeader title="고객센터" backTo="/profile" />
      <div className="screen-content support-rows">
        {[
          ['/support/faq', '자주 묻는 질문'],
          ['/support/inquiries/new', '1:1 문의'],
          ['/support/inquiries', '문의 내역'],
          ['/notices', '공지사항'],
        ].map(([path, title]) => (
          <Link className="menu-row" to={path} key={path}>
            {title}
            <Icon name="chevron" />
          </Link>
        ))}
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/support/inquiries/new">
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}

export function RecommendationsPage({
  activities,
  savedIds,
  onToggle,
}: CatalogProps) {
  const { user } = useAuth();
  const { children } = useChildren();
  const navigate = useNavigate();
  const [conditions, setConditions] = useState({
    childId: user?.active_child_id || children[0]?.id || 0,
    category: '그림/색칠',
    duration: '5-10분',
    place: '집 안',
  });
  const [materials, setMaterials] = useState(['연필', '색연필']);
  const [results, setResults] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const matches = activities.filter(
    (item) => item.category === conditions.category,
  );
  const items = matches.filter((item) => selected.includes(item.id));
  if (results)
    return (
      <div className="screen" data-figma-node="116:386">
        <div className="screen-content recommendation-results">
          <h1>원클릭 활동안 찾기 결과</h1>
          <p>바로 시작할 수 있는 놀이활동 {matches.length}개 있어요</p>
          <div className="activity-grid">
            {matches.map((item) => (
              <div className="recommendation-item" key={item.id}>
                <input
                  type="checkbox"
                  aria-label={`${item.title} 선택`}
                  checked={selected.includes(item.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id),
                    )
                  }
                />
                <ActivityCard
                  activity={item}
                  saved={savedIds.includes(item.id)}
                  onToggle={onToggle}
                />
              </div>
            ))}
          </div>
          {!matches.length && (
            <div className="wire-empty">
              <div className="empty-circle" />
              <h2>조건에 맞는 활동지가 없어요</h2>
            </div>
          )}
        </div>
        <div className="screen-actions">
          <div className="cart-total">
            <span>선택한 활동지 {items.length}개</span>
            <span>
              {items
                .reduce((sum, item) => sum + item.price, 0)
                .toLocaleString('ko-KR')}
              원
            </span>
          </div>
          <div className="dialog-actions">
            <button className="button" onClick={() => setResults(false)}>
              뒤로가기
            </button>
            <button
              className="button button--primary"
              disabled={busy || !items.length}
              onClick={() =>
                setNotice('장바구니는 각 활동지 상세에서 담을 수 있어요.')
              }
            >
              장바구니 담기
            </button>
          </div>
        </div>
        {notice && (
          <WireDialog title="놀이 찾기 안내" onClose={() => setNotice('')}>
            <p>{notice}</p>
            <button className="button" onClick={() => setNotice('')}>
              확인
            </button>
          </WireDialog>
        )}
      </div>
    );
  return (
    <div className="recommendation-backdrop" data-figma-node="116:321">
      <div className="recommendation-popup">
        <div className="section-heading">
          <h2>어떤 놀이를 찾을까요?</h2>
          <button
            className="icon-button"
            aria-label="맞춤 놀이 닫기"
            onClick={() => navigate('/')}
          >
            <Icon name="close" />
          </button>
        </div>
        <h3>누구와 놀까요?</h3>
        <div className="chips">
          {children.map((child) => (
            <button
              key={child.id}
              className={`chip ${conditions.childId === child.id ? 'is-selected' : ''}`}
              onClick={() =>
                setConditions({ ...conditions, childId: child.id })
              }
            >
              {child.name}
            </button>
          ))}
          <Link className="chip" to={user ? '/children/new' : '/login'}>
            + 아이 추가
          </Link>
        </div>
        <h3>놀이 유형</h3>
        <div className="chips">
          {categories.slice(1, 9).map((value) => (
            <button
              key={value}
              className={`chip ${conditions.category === value ? 'is-selected' : ''}`}
              onClick={() => setConditions({ ...conditions, category: value })}
            >
              {value}
            </button>
          ))}
        </div>
        <h3>소요시간</h3>
        <div className="chips">
          {['5-10분', '10-20분', '20분 이상'].map((value) => (
            <button
              key={value}
              className={`chip ${conditions.duration === value ? 'is-selected' : ''}`}
              onClick={() => setConditions({ ...conditions, duration: value })}
            >
              {value}
            </button>
          ))}
        </div>
        <h3>놀이 장소</h3>
        <div className="chips">
          {['집 안', '집 밖'].map((value) => (
            <button
              key={value}
              className={`chip ${conditions.place === value ? 'is-selected' : ''}`}
              onClick={() => setConditions({ ...conditions, place: value })}
            >
              {value}
            </button>
          ))}
        </div>
        <h3>집에 있는 준비물</h3>
        <div className="chips">
          {['연필', '지우개', '색연필', '사인펜', '가위', '풀'].map((value) => (
            <button
              key={value}
              className={`chip ${materials.includes(value) ? 'is-selected' : ''}`}
              onClick={() =>
                setMaterials(
                  materials.includes(value)
                    ? materials.filter((item) => item !== value)
                    : [...materials, value],
                )
              }
            >
              {value}
            </button>
          ))}
        </div>
        <div className="dialog-actions">
          <button
            className="button"
            onClick={() => {
              setMaterials([]);
              setConditions({
                childId: 0,
                category: '',
                duration: '',
                place: '',
              });
            }}
          >
            초기화
          </button>
          <button
            className="button button--accent"
            disabled={busy}
            onClick={() => {
              if (!conditions.childId) {
                setNotice('아이를 먼저 등록하고 선택해 주세요.');
                return;
              }
              setBusy(true);
              setSelected(matches.map((item) => item.id));
              setResults(true);
              setBusy(false);
            }}
          >
            활동안 찾기
          </button>
        </div>
      </div>
      {notice && (
        <WireDialog title="맞춤 놀이 안내" onClose={() => setNotice('')}>
          <p>{notice}</p>
          <button
            className="button button--accent"
            onClick={() => setNotice('')}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function ViewerPage() {
  const { activityId } = useParams();
  const [tab, setTab] = useState('activity');
  const [zoom, setZoom] = useState(1);
  const [notice, setNotice] = useState('');
  return (
    <div className="screen" data-figma-node="116:731">
      <ScreenHeader
        title="활동지 보기"
        backTo={`/activities/${activityId || 101}`}
      />
      <div className="screen-content viewer-content">
        <div className="tabs">
          <button
            className={tab === 'activity' ? 'is-selected' : ''}
            onClick={() => setTab('activity')}
          >
            활동지
          </button>
          <button
            className={tab === 'guide' ? 'is-selected' : ''}
            onClick={() => setTab('guide')}
          >
            활동 가이드
          </button>
        </div>
        <div className="viewer-paper-viewport">
          <div
            className="viewer-paper"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
        <div className="section-heading viewer-pagination">
          <span>이전</span>
          <span>1 / 1</span>
          <span>다음</span>
        </div>
        <div className="viewer-tools">
          <button
            className="button square-button"
            aria-label="축소"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <Icon name="zoomOut" />
          </button>
          <button
            className="button square-button"
            aria-label="확대"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <Icon name="zoomIn" />
          </button>
          <button
            className="button square-button"
            aria-label="전체화면"
            onClick={() =>
              void document
                .querySelector('.viewer-paper-viewport')
                ?.requestFullscreen()
                .catch(() => setNotice('전체화면을 지원하지 않는 환경이에요.'))
            }
          >
            <Icon name="fullscreen" />
          </button>
        </div>
        <div className="viewer-actions">
          <button
            onClick={() =>
              setNotice('구매한 PDF 내려받기 API가 아직 연결되지 않았어요.')
            }
          >
            <span className="button square-button">
              <Icon name="download" />
            </span>
            <small>내려받기</small>
          </button>
          <button
            onClick={() => setNotice('출력할 PDF가 준비되면 인쇄할 수 있어요.')}
          >
            <span className="button square-button">
              <Icon name="print" />
            </span>
            <small>인쇄하기</small>
          </button>
        </div>
      </div>
      {notice && (
        <WireDialog title="활동지 보기 안내" onClose={() => setNotice('')}>
          <p>{notice}</p>
          <button
            className="button button--primary"
            onClick={() => setNotice('')}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function CheckoutPage({
  activities,
}: {
  activities: CatalogProps['activities'];
}) {
  const { state } = useLocation();
  const ids: number[] = Array.isArray(state?.activityIds)
    ? state.activityIds.filter(
        (id: unknown): id is number => typeof id === 'number',
      )
    : [];
  const items = activities.filter((item) => ids.includes(item.id));
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const [agreed, setAgreed] = useState(false);
  const [method, setMethod] = useState('card');
  const [notice, setNotice] = useState(false);
  return (
    <div className="screen" data-figma-node="116:622">
      <ScreenHeader title="결제하기" backTo="/cart" />
      <div className="screen-content">
        <h2>주문 활동지 {items.length}개</h2>
        {items.map((item) => (
          <div className="cart-item__body" key={item.id}>
            <span className="cart-item__thumb" />
            <div className="cart-item__title">
              [{item.subtitle}]<br />
              {item.title}
              <strong className="cart-item__price">
                {item.price.toLocaleString('ko-KR')}원
              </strong>
            </div>
          </div>
        ))}
        <div className="section-heading">
          <h2>결제 수단</h2>
          <Link className="text-button" to="/cards/new">
            새 카드 등록
          </Link>
        </div>
        <div className="chips">
          {[
            ['card', '등록 카드'],
            ['simple', '간편결제'],
          ].map(([value, title]) => (
            <button
              key={value}
              className={`chip ${method === value ? 'is-selected' : ''}`}
              onClick={() => setMethod(value)}
            >
              {title}
            </button>
          ))}
        </div>
        <h2>결제 금액</h2>
        <div className="info-panel">
          <div className="cart-total">
            <span>활동지 금액</span>
            <span>{total.toLocaleString('ko-KR')}원</span>
          </div>
          <div className="cart-total" style={{ marginTop: 8 }}>
            <strong>최종 결제 금액</strong>
            <strong>{total.toLocaleString('ko-KR')}원</strong>
          </div>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          주문 내용을 확인했고 결제에 동의합니다.
        </label>
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={!agreed || !items.length}
          onClick={() => setNotice(true)}
        >
          {total.toLocaleString('ko-KR')}원 결제하기
        </button>
      </div>
      {notice && (
        <WireDialog title="결제 안내" onClose={() => setNotice(false)}>
          <h2>결제 기능 준비 중</h2>
          <p>실제 결제 API는 아직 연결되지 않았어요. 결제되지 않았습니다.</p>
          <button
            className="button button--primary"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}
