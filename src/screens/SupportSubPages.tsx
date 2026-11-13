import { useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchField } from '../components/SearchField';
import { WireDialog } from '../components/WireDialog';
import { Icon } from '../components/Icon';

export function FAQPage() {
  const [category, setCategory] = useState('전체');
  const [expanded, setExpanded] = useState(0);
  const questions = [
    '활동지는 어떻게 출력하나요?',
    '구매한 활동지는 어디서 보나요?',
    '몇 개월까지 이용할 수 있나요?',
    '리뷰는 어디서 쓰나요?',
    '결제를 취소하고 싶어요',
  ];
  return (
    <div className="screen" data-figma-node="118:1409">
      <ScreenHeader title="자주 묻는 질문" backTo="/support" />
      <div className="screen-content">
        <div className="chips">
          {['전체', '활동지', '결제', '계정'].map((value) => (
            <button
              key={value}
              className={`chip ${category === value ? 'is-selected' : ''}`}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="faq-list">
          {questions.map((question, index) => (
            <section key={question}>
              <button
                className="menu-row"
                aria-expanded={expanded === index}
                onClick={() => setExpanded(expanded === index ? -1 : index)}
              >
                {question}
                <Icon name={expanded === index ? 'down' : 'chevron'} />
              </button>
              {expanded === index && (
                <p className="faq-answer">
                  {index === 0
                    ? '구매한 활동지를 내려받아 A4로 출력하면 돼요. 저장 탭에서 다시 볼 수 있어요.'
                    : index === 1
                      ? '저장 탭의 구매한 활동지에서 확인할 수 있어요.'
                      : index === 2
                        ? '12개월(만 1세)~72개월(만 5세)까지 이용할 수 있어요.'
                        : index === 3
                          ? '구매 내역에서 리뷰를 작성할 수 있어요.'
                          : '결제 내역에서 취소 가능 여부를 확인해 주세요.'}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
      <div className="screen-actions">
        <Link className="button" to="/support/inquiries/new">
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}

export function InquiryPage() {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notice, setNotice] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form
      className="screen"
      data-figma-node="124:4742"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(true);
      }}
    >
      <ScreenHeader title="1:1 문의" backTo="/support" />
      <div className="screen-content form-stack">
        <h2 className="wire-subtitle">문의 유형</h2>
        <div className="chips">
          {['활동지', '결제·환불', '계정', '기타'].map((value) => (
            <button
              key={value}
              type="button"
              className={`chip ${category === value ? 'is-selected' : ''}`}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="wire-field">
          제목
          <input
            value={title}
            required
            maxLength={100}
            placeholder="제목을 입력해 주세요"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="wire-field">
          내용
          <textarea
            value={content}
            required
            maxLength={500}
            placeholder="문의 내용을 입력해 주세요"
            onChange={(event) => setContent(event.target.value)}
          />
        </label>
        <p className="character-count">{content.length} / 500</p>
        <div className="photo-inputs">
          {files.map((file, index) => (
            <button
              key={`${file.name}-${index}`}
              type="button"
              className="photo-placeholder"
              aria-label={`${file.name} 제거`}
              onClick={() => setFiles(files.filter((_, key) => key !== index))}
            >
              {file.name}
              <Icon name="close" size={16} />
            </button>
          ))}
          {files.length < 3 && (
            <label className="photo-add" aria-label="문의 사진 추가">
              <Icon name="plus" />
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  setFiles(
                    [...files, ...Array.from(event.target.files || [])].slice(
                      0,
                      3,
                    ),
                  );
                  event.target.value = '';
                }}
              />
            </label>
          )}
        </div>
        <p className="wire-note">사진은 3장까지 올릴 수 있어요.</p>
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={!category || !title.trim() || !content.trim()}
        >
          문의하기
        </button>
      </div>
      {notice && (
        <WireDialog title="문의 접수 안내" onClose={() => setNotice(false)}>
          <p>
            문의 접수 API가 아직 연결되지 않았어요. 문의가 전송되지 않았습니다.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </form>
  );
}

export function InquiryHistoryPage() {
  return (
    <div className="screen" data-figma-node="124:4832">
      <ScreenHeader title="문의 내역" backTo="/support" />
      <div className="screen-content screen-content--center">
        <div className="empty-circle" />
        <h2>문의 내역이 없어요</h2>
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/support/inquiries/new">
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}

export function NoticesPage() {
  return (
    <div className="screen" data-figma-node="124:4897">
      <ScreenHeader title="공지사항" backTo="/support" />
      <div className="screen-content">
        {[1, 2].map((id) => (
          <Link className="notice-card" to={`/notices/${id}`} key={id}>
            <small>0000.00.00</small>
            <span>공지 제목</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TextDocumentPage() {
  const { type } = useParams();
  const { pathname } = useLocation();
  const notice = pathname.startsWith('/notices/');
  const title = notice
    ? '공지사항'
    : (
        {
          terms: '서비스 이용약관',
          privacy: '개인정보 처리방침',
          marketing: '마케팅 정보 수신 동의',
          refund: '환불 정책',
        } as Record<string, string>
      )[type || 'terms'] || '서비스 이용약관';
  return (
    <div className="screen" data-figma-node={notice ? '124:4918' : '124:5062'}>
      <ScreenHeader title={title} backTo={notice ? '/notices' : '/settings'} />
      <div className="screen-content">
        <h2>{notice ? '공지 제목' : title}</h2>
        <small className="wire-note">{notice ? '' : '시행일 '}0000.00.00</small>
        <div className="document-skeleton">
          {Array.from({ length: notice ? 5 : 8 }, (_, index) => (
            <span className="skeleton-line" key={index} />
          ))}
        </div>
        {notice && (
          <div className="section-heading">
            <Link className="text-button" to="/notices/1">
              이전 글
            </Link>
            <Link className="text-button" to="/notices/2">
              다음 글
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const [tab, setTab] = useState('공지');
  return (
    <div className="screen" data-figma-node="118:1603">
      <ScreenHeader title="알림센터" />
      <div className="screen-content">
        <div className="tabs">
          {['공지', '이벤트'].map((value) => (
            <button
              key={value}
              className={tab === value ? 'is-selected' : ''}
              onClick={() => setTab(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="wire-empty wire-empty--search">
          <div className="empty-circle" />
          <h2>새로운 알림이 없어요</h2>
        </div>
      </div>
    </div>
  );
}

export function AccountFormPage({
  kind,
}: {
  kind: 'card' | 'password' | 'phone' | 'reset';
}) {
  const data = {
    card: {
      id: '118:1373',
      title: '카드 추가',
      action: '등록하기',
      fields: [
        ['카드 번호', '0000 0000 0000 0000'],
        ['유효기간', 'MM/YY'],
        ['비밀번호 앞 2자리', '••'],
        ['생년월일 또는 사업자번호', 'YYMMDD'],
      ],
    },
    password: {
      id: '124:4216',
      title: '비밀번호 변경',
      action: '변경하기',
      fields: [
        ['현재 비밀번호', '현재 비밀번호 입력'],
        ['새 비밀번호', '영문, 숫자 포함 8자 이상'],
        ['새 비밀번호 확인', '비밀번호 다시 입력'],
      ],
    },
    phone: {
      id: '124:4169',
      title: '휴대전화 번호 변경',
      action: '인증번호 받기',
      fields: [
        ['현재 번호', '010-0000-0000'],
        ['새 번호', '010-0000-0000'],
      ],
    },
    reset: {
      id: '122:1611',
      title: '비밀번호 찾기',
      action: '재설정 링크 받기',
      fields: [['이메일', 'example@email.com']],
    },
  }[kind];
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    setNotice(true);
  }
  // 카드 원문은 서버로 보내거나 저장하지 않습니다. PG 토큰화 연동 전의 화면입니다.
  return (
    <form
      className={`screen account-form--${kind}`}
      data-figma-node={data.id}
      onSubmit={submit}
    >
      <ScreenHeader
        title={data.title}
        backTo={
          kind === 'card' ? '/cards' : kind === 'reset' ? '/login' : '/settings'
        }
      />
      <div className="screen-content form-stack">
        {kind === 'reset' && <h2>가입한 이메일을 입력해 주세요</h2>}
        {data.fields.map(([label, placeholder]) => (
          <label className="wire-field" key={label}>
            <span>{label}</span>
            <span className={kind === 'password' ? 'wire-field__password' : ''}>
              <input
                autoComplete="off"
                value={values[label] || ''}
                required
                type={
                  kind === 'password' && !visible[label]
                    ? 'password'
                    : kind === 'reset'
                      ? 'email'
                      : 'text'
                }
                placeholder={placeholder}
                maxLength={kind === 'card' ? 24 : 128}
                onChange={(event) =>
                  setValues({ ...values, [label]: event.target.value })
                }
              />
              {kind === 'password' && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${label} 표시`}
                  onClick={() =>
                    setVisible({ ...visible, [label]: !visible[label] })
                  }
                >
                  <Icon name="eye" />
                </button>
              )}
            </span>
          </label>
        ))}
        {kind === 'card' && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            결제 카드 등록에 동의합니다.
          </label>
        )}
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={
            data.fields.some(([label]) => !values[label]?.trim()) ||
            (kind === 'card' && !agreed)
          }
        >
          {data.action}
        </button>
      </div>
      {notice && (
        <WireDialog title="기능 연결 안내" onClose={() => setNotice(false)}>
          <p>
            이 기능의 API는 아직 연결되지 않았어요. 변경되거나 전송된 내용은
            없습니다.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </form>
  );
}

export function FAQSearchField() {
  const [query, setQuery] = useState('');
  return <SearchField initialValue={query} onSubmit={setQuery} />;
}
