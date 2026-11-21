import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChildren } from '../context/ChildrenContext';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import {
  getChild,
  childInputError,
  type ChildInput,
} from '../services/children';
import { listCategories, type Category } from '../services/activities';
import { LoginPrompt } from './ConnectedPages';
import { childAgeLabel } from '../lib/date';
import { ReferenceHeader } from '../components/ReferenceHeader';

export function ChildrenPage() {
  const { user } = useAuth();
  const { children, loading, error, reload, remove, activeChild, select } =
    useChildren();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  return (
    <div
      className="screen"
      data-figma-node={children.length ? '117:1240' : '124:3937'}
    >
      <ReferenceHeader title="아이 정보" backTo="/profile" />
      {!user ? (
        <LoginPrompt />
      ) : loading ? (
        <div className="screen-content">
          <p role="status">불러오는 중…</p>
        </div>
      ) : error ? (
        <div className="screen-content">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => void reload()}>
            다시 시도
          </button>
        </div>
      ) : children.length ? (
        <div className="screen-content">
          {children.map((child) => (
            <article className="child-info-card" key={child.id}>
              <div>
                <strong>{child.name}</strong>
                <small>
                  {child.birth_date.slice(0, 7).replace('-', '년 ')}월생 ·{' '}
                  {childAgeLabel(child.birth_date).split(' · ')[0]} ·{' '}
                  {child.gender === 'female'
                    ? '여아'
                    : child.gender === 'male'
                      ? '남아'
                      : ''}
                </small>
              </div>
              <button
                type="button"
                className="text-button"
                disabled={busy || activeChild?.id === child.id}
                onClick={() => {
                  setBusy(true);
                  setFailure('');
                  void select(child.id)
                    .catch((cause: Error) => setFailure(cause.message))
                    .finally(() => setBusy(false));
                }}
              >
                {activeChild?.id === child.id ? '선택됨' : '선택하기'}
              </button>
              <Link
                className="icon-button"
                to={`/children/${child.id}/edit`}
                aria-label={`${child.name} 정보 수정`}
              >
                <Icon name="edit" />
              </Link>
              <button
                className="icon-button"
                aria-label={`${child.name} 삭제`}
                onClick={() => setDeleting(child.id)}
              >
                <Icon name="trash" />
              </button>
            </article>
          ))}
          <Link className="child-info-card" to="/children/new">
            <Icon name="plus" />
            <strong>아이 추가</strong>
          </Link>
          <section className="child-info-notes">
            <h2>안내 사항</h2>
            <p>12개월(만 1세)~72개월(만 5세)까지 이용할 수 있어요.</p>
          </section>
          {(failure || error) && (
            <p className="form-error" role="alert">
              {failure || error}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="screen-content screen-content--center">
            <div className="empty-circle" />
            <h2>등록된 아이가 없어요</h2>
            <p>아이를 등록하면 맞춤 놀이를 찾아드려요.</p>
            {error && <p role="alert">{error}</p>}
          </div>
          <div className="screen-actions">
            <Link className="button button--primary" to="/children/new">
              아이 추가
            </Link>
          </div>
        </>
      )}
      {deleting !== null && (
        <WireDialog
          title="아이 삭제"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <h2>아이 정보를 삭제할까요?</h2>
          <p>해당 아이의 활동 기록도 함께 삭제돼요.</p>
          {failure && (
            <p className="form-error" role="alert">
              {failure}
            </p>
          )}
          <div className="dialog-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              취소
            </button>
            <button
              className="button button--primary"
              disabled={busy}
              onClick={() => {
                if (busy) return;
                setBusy(true);
                setFailure('');
                void remove(deleting)
                  .then(() => setDeleting(null))
                  .catch((cause: Error) => setFailure(cause.message))
                  .finally(() => setBusy(false));
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

export function ChildFormPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user, isPreview } = useAuth();
  const { save } = useChildren();
  const [detailLoading, setDetailLoading] = useState(!!childId);
  const [detailError, setDetailError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const [categoryError, setCategoryError] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(true);
  const pending = useRef(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [interests, setInterests] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [leave, setLeave] = useState(false);
  useEffect(() => {
    if (!childId) return;
    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError('');
    if (
      !(isPreview ? /^-?\d+$/.test(childId) : /^[1-9]\d*$/.test(childId)) ||
      !Number.isSafeInteger(Number(childId))
    ) {
      setDetailError('아이를 찾을 수 없어요.');
      setDetailLoading(false);
      return;
    }
    void getChild(Number(childId), controller.signal)
      .then((child) => {
        if (controller.signal.aborted) return;
        setName(child.name);
        setGender(child.gender);
        const [y, m, d] = child.birth_date.split('-');
        setYear(y);
        setMonth(m);
        setDay(d);
        setInterests(child.interests);
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setDetailError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [childId, attempt, isPreview]);
  useEffect(() => {
    const controller = new AbortController();
    setCategoryLoading(true);
    setCategoryError('');
    void listCategories(controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setCategories(rows);
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setCategoryError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoryLoading(false);
      });
    return () => controller.abort();
  }, [categoryAttempt]);
  const currentYear = Number(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
    }).format(new Date()),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (
      pending.current ||
      detailLoading ||
      detailError ||
      categoryLoading ||
      categoryError
    )
      return;
    const data: ChildInput = {
      name: name.trim(),
      gender,
      birth_date: `${year}-${month}-${day}`,
      interests,
    };
    const invalid = childInputError(data, !childId);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError('');
    if (!childId && step === 0) {
      setStep(1);
      return;
    }
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await save(data, childId ? Number(childId) : undefined);
      navigate('/children', { replace: true });
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="screen reference-child-form"
      onSubmit={submit}
      data-figma-node={childId ? '124:3956' : '117:1274'}
    >
      <ReferenceHeader
        title={childId ? '아이 정보 수정' : '아이 추가'}
        onBack={() => {
          if (!busy) {
            if (step) setStep(0);
            else setLeave(true);
          }
        }}
      />
      {!user ? (
        <LoginPrompt />
      ) : detailLoading ? (
        <p role="status">아이 정보를 불러오는 중…</p>
      ) : detailError ? (
        <div className="screen-content">
          <p role="alert">{detailError}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <>
          <div className="screen-content form-stack">
            {!childId && step === 0 && categoryError && (
              <div>
                <p role="alert">{categoryError}</p>
                <button
                  type="button"
                  onClick={() => setCategoryAttempt((value) => value + 1)}
                >
                  관심 카테고리 다시 불러오기
                </button>
              </div>
            )}
            {!childId && (
              <p className="child-steps">
                <span className={step === 0 ? 'is-current' : ''}>1</span> 아이
                정보 <span className={step === 1 ? 'is-current' : ''}>2</span>
                {step === 1 && ' 관심있는 놀이활동'}
              </p>
            )}
            <div className="child-basics" hidden={!childId && step === 1}>
              <div className="child-name-gender">
                <label className="wire-field">
                  <span>
                    아이 이름{!childId && <span className="required">*</span>}
                  </span>
                  <input
                    aria-label="아이 이름"
                    placeholder="실명"
                    required
                    maxLength={40}
                    disabled={busy}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="wire-field">
                  성별
                  <select
                    className="wire-select"
                    disabled={busy}
                    aria-label="성별"
                    value={gender}
                    onChange={(event) => setGender(event.target.value)}
                  >
                    <option value="">선택 안 함</option>
                    <option value="female">여아</option>
                    <option value="male">남아</option>
                  </select>
                </label>
              </div>
              <div className="wire-field">
                <span>
                  생년월일{!childId && <span className="required">*</span>}
                  {!childId && (
                    <small className="child-age-note">
                      12개월(만1세)~72개월(만5세)까지 이용가능
                    </small>
                  )}
                </span>
                <div className="date-selects">
                  <select
                    className="wire-select"
                    disabled={busy}
                    aria-label="생년월일 연도"
                    required
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                  >
                    <option value="">연도</option>
                    {[
                      ...new Set([
                        ...Array.from(
                          { length: 12 },
                          (_, index) => currentYear - index,
                        ),
                        ...(year ? [Number(year)] : []),
                      ]),
                    ]
                      .sort((a, b) => b - a)
                      .map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                  </select>
                  <select
                    className="wire-select"
                    disabled={busy}
                    aria-label="생년월일 월"
                    required
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                  >
                    <option value="">월</option>
                    {Array.from({ length: 12 }, (_, index) =>
                      String(index + 1).padStart(2, '0'),
                    ).map((value) => (
                      <option key={value} value={value}>
                        {Number(value)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="wire-select"
                    disabled={busy}
                    aria-label="생년월일 일"
                    required
                    value={day}
                    onChange={(event) => setDay(event.target.value)}
                  >
                    <option value="">일</option>
                    {Array.from(
                      {
                        length:
                          year && month
                            ? new Date(Number(year), Number(month), 0).getDate()
                            : 31,
                      },
                      (_, index) => String(index + 1).padStart(2, '0'),
                    ).map((value) => (
                      <option key={value} value={value}>
                        {Number(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {(childId || step === 1) && (
              <>
                <h2 className="wire-subtitle">관심있는 놀이활동</h2>
                {categoryLoading ? (
                  <p role="status">관심 카테고리를 불러오는 중…</p>
                ) : categoryError ? (
                  <div>
                    <p role="alert">{categoryError}</p>
                    <button
                      type="button"
                      onClick={() => setCategoryAttempt((value) => value + 1)}
                    >
                      다시 시도
                    </button>
                  </div>
                ) : categories.length ? (
                  <div className="chips">
                    {categories.map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        disabled={busy}
                        className={`chip ${interests.includes(category.id) ? 'is-selected' : ''}`}
                        aria-pressed={interests.includes(category.id)}
                        onClick={() =>
                          setInterests((previous) =>
                            previous.includes(category.id)
                              ? previous.filter((id) => id !== category.id)
                              : [...previous, category.id],
                          )
                        }
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>
                    선택할 관심 카테고리가 없어요. 관심사 없이 저장할 수 있어요.
                  </p>
                )}
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="screen-actions">
            <button
              className="button button--primary"
              disabled={
                busy ||
                categoryLoading ||
                !!categoryError ||
                !name.trim() ||
                !year ||
                !month ||
                !day
              }
            >
              {busy
                ? '저장 중…'
                : childId
                  ? '저장하기'
                  : step === 0
                    ? '다음'
                    : '등록하기'}
            </button>
          </div>
        </>
      )}
      {leave && (
        <WireDialog
          title="아이 입력 취소"
          className="leave-dialog"
          onClose={() => setLeave(false)}
        >
          <h2>입력을 취소하시겠어요?</h2>
          <p>
            이전 화면으로 돌아가면
            <br />
            입력 중인 아이 정보가 모두 사라져요.
          </p>
          <div className="dialog-actions">
            <button
              type="button"
              className="button"
              onClick={() => navigate('/children')}
            >
              뒤로 가기
            </button>
            <button
              type="button"
              className="button button--accent"
              onClick={() => setLeave(false)}
            >
              계속 입력하기
            </button>
          </div>
        </WireDialog>
      )}
    </form>
  );
}
