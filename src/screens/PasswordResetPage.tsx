import {
  requestPasswordReset,
  confirmPasswordReset,
  parseResetLink,
} from '../services/password-reset';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { passwordError } from '../services/profile';
import { ScreenHeader } from '../components/ScreenHeader';
import { readPreviewSession } from '../lib/preview-session';

export function PasswordResetPage() {
  const { hash } = useLocation();
  const [link, setLink] = useState<{
    mode: 'request' | 'confirm' | 'invalid';
    token: string;
  }>(() => parseResetLink(hash));
  const token = link.token;
  const setToken = (value: string) =>
    setLink((previous) => ({ ...previous, token: value }));
  const confirmMode = link.mode === 'confirm';
  const [invalid, setInvalid] = useState(link.mode === 'invalid');
  const { clearSession } = useAuth();
  const pending = useRef(false);
  useEffect(() => {
    if (hash && hash !== '#main-content') {
      const incoming = parseResetLink(hash);
      setLink(incoming);
      setInvalid(incoming.mode === 'invalid');
      setPassword('');
      setConfirm('');
      setMessage('');
      setError('');
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      );
    }
  }, [hash]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current || invalid || (confirmMode && !token)) return;
    setError('');
    setMessage('');
    if (readPreviewSession()) {
      setError('미리보기 로그아웃 후 실제 이메일로 진행해 주세요.');
      return;
    }
    const validation = confirmMode ? passwordError(password, confirm) : '';
    if (validation) {
      setError(validation);
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      if (token) await confirmPasswordReset(token, password);
      else await requestPasswordReset(email);
      if (token) {
        clearSession();
        setToken('');
        setPassword('');
        setConfirm('');
      }
      setMessage(
        token
          ? '비밀번호를 재설정했어요. 다시 로그인해 주세요.'
          : '가입된 이메일이면 재설정 안내가 발송됩니다. 메일함을 확인해 주세요.',
      );
    } catch (cause) {
      if (
        confirmMode &&
        cause instanceof ApiError &&
        cause.status === 400 &&
        (cause.details?.reset_token || cause.message.includes('재설정 토큰'))
      ) {
        setInvalid(true);
        setToken('');
      }
      setError((cause as Error).message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="screen account-form--reset" onSubmit={submit}>
      <ScreenHeader
        title={confirmMode ? '비밀번호 재설정' : '비밀번호 찾기'}
        backTo="/login"
      />
      <div className="screen-content form-stack">
        {invalid ? (
          <p role="alert">
            재설정 링크가 잘못되었거나 만료됐어요. 비밀번호 찾기에서 새 링크를
            요청해 주세요.
          </p>
        ) : message && confirmMode ? null : confirmMode ? (
          <>
            <label className="wire-field">
              새 비밀번호
              <input
                type="password"
                autoComplete="new-password"
                required
                disabled={busy}
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="wire-field">
              새 비밀번호 확인
              <input
                type="password"
                autoComplete="new-password"
                required
                disabled={busy}
                maxLength={128}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
          </>
        ) : (
          <label className="wire-field">
            가입한 이메일
            <input
              type="email"
              autoComplete="email"
              required
              disabled={busy}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        {confirmMode && message && <Link to="/login">로그인하기</Link>}
        {invalid && <Link to="/password/reset">새 재설정 링크 받기</Link>}
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={busy || invalid || !!(confirmMode && message)}
        >
          {busy
            ? '처리 중…'
            : confirmMode
              ? '비밀번호 재설정'
              : '재설정 링크 받기'}
        </button>
      </div>
    </form>
  );
}
