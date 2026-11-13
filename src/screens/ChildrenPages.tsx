import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useChildren } from '../context/ChildrenContext';
import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import { apiRequest } from '../lib/api';
import { LoginPrompt } from './ConnectedPages';
import { childAgeLabel } from '../lib/date';

interface Category {
  id: number;
  name: string;
  code: string;
}
const interestOptions = [
  ['writing', '글쓰기'],
  ['painting', '미술 놀이'],
  ['craft', '만들기'],
  ['drawing', '그림 그리기'],
  ['dance', '노래하고 춤추기'],
  ['gross_motor', '대근육'],
  ['fine_motor', '소근육'],
  ['reading', '책 읽기'],
  ['shop', '가게 놀이'],
  ['role', '역할 놀이'],
  ['korean', '한글'],
  ['english', '영어'],
  ['number', '수학'],
  ['explore', '탐구'],
  ['hanja', '한자'],
];

export function ChildrenPage() {
  const { user, reload: reloadUser } = useAuth();
  const { children, loading, error, reload } = useChildren();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  return (
    <div
      className="screen"
      data-figma-node={children.length ? '117:1240' : '124:3937'}
    >
      <ScreenHeader title="아이 정보" backTo="/profile" />
      {!user ? (
        <LoginPrompt />
      ) : loading ? (
        <div className="screen-content">
          <p role="status">불러오는 중…</p>
        </div>
      ) : children.length ? (
        <div className="screen-content">
          {children.map((child) => (
            <article className="child-info-card" key={child.id}>
              <div>
                <strong>{child.name}</strong>
                <small>{childAgeLabel(child.birth_date)}</small>
              </div>
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
                setBusy(true);
                void apiRequest(`/children/${deleting}`, { method: 'DELETE' })
                  .then(reload)
                  .then(reloadUser)
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
  const { user, reload: reloadUser } = useAuth();
  const { children, reload } = useChildren();
  const existing = children.find((child) => child.id === Number(childId));
  const [name, setName] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [interests, setInterests] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setGender(existing.gender);
      const parts = existing.birth_date.split('-');
      setYear(parts[0]);
      setMonth(parts[1]);
      setDay(parts[2]);
      setInterests(existing.interests);
    }
  }, [existing?.id]);
  useEffect(() => {
    void apiRequest<{ results: Category[] }>('/activity-categories')
      .then((data) => setCategories(data.results))
      .catch((cause: Error) => setError(cause.message));
  }, []);
  const currentYear = Number(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
    }).format(new Date()),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await apiRequest(childId ? `/children/${childId}` : '/children', {
        method: childId ? 'PATCH' : 'POST',
        body: JSON.stringify({
          name: name.trim(),
          gender,
          birth_date: `${year}-${month}-${day}`,
          interests,
        }),
      });
      await reload();
      await reloadUser();
      navigate('/children');
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="screen"
      onSubmit={submit}
      data-figma-node={childId ? '124:3956' : '117:1274'}
    >
      <ScreenHeader
        title={childId ? '아이 정보 수정' : '아이 추가'}
        backTo="/children"
      />
      {!user ? (
        <LoginPrompt />
      ) : (
        <>
          <div className="screen-content form-stack">
            {!childId && <p style={{ fontSize: 14 }}>1 / 2　아이 정보</p>}
            <label className="wire-field">
              <span>
                아이 이름{!childId && <span className="required">*</span>}
              </span>
              <input
                aria-label="아이 이름"
                placeholder="실명"
                required
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <h2 className="wire-subtitle">성별</h2>
            <div className="chips">
              {[
                ['female', '여아'],
                ['male', '남아'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`chip ${gender === value ? 'is-selected' : ''}`}
                  aria-pressed={gender === value}
                  onClick={() =>
                    setGender(gender === value ? 'unspecified' : value)
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="wire-field">
              <span>
                생년월일{!childId && <span className="required">*</span>}
              </span>
              <div className="date-selects">
                <select
                  className="wire-select"
                  aria-label="생년월일 연도"
                  required
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                >
                  <option value="">연도</option>
                  {Array.from(
                    { length: 12 },
                    (_, index) => currentYear - index,
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <select
                  className="wire-select"
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
                  aria-label="생년월일 일"
                  required
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                >
                  <option value="">일</option>
                  {Array.from({ length: 31 }, (_, index) =>
                    String(index + 1).padStart(2, '0'),
                  ).map((value) => (
                    <option key={value} value={value}>
                      {Number(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!childId && (
              <p className="wire-note">
                12개월(만 1세)~72개월(만 5세)까지 이용 가능
              </p>
            )}
            <h2 className="wire-subtitle">관심있는 놀이활동</h2>
            {[
              interestOptions.slice(0, 4),
              interestOptions.slice(4, 10),
              interestOptions.slice(10),
            ].map((group, groupIndex) => (
              <div className="chips" key={groupIndex}>
                {group.map(([code, label]) => {
                  const category = categories.find(
                    (item) => item.code === code,
                  );
                  const selected =
                    !!category && interests.includes(category.id);
                  return (
                    <button
                      type="button"
                      key={code}
                      disabled={!category}
                      className={`chip ${selected ? 'is-selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => {
                        if (category)
                          setInterests(
                            selected
                              ? interests.filter((id) => id !== category.id)
                              : [...interests, category.id],
                          );
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ))}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="screen-actions">
            <button
              className="button button--primary"
              disabled={busy || !name.trim() || !year || !month || !day}
            >
              {busy ? '저장 중…' : childId ? '저장하기' : '다음'}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
