import {
  requestPasswordReset,
  confirmPasswordReset,
} from '../services/password-reset';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { saveTokens } from '../lib/api';
import { ScreenHeader } from '../components/ScreenHeader';
import { readPreviewSession } from '../lib/preview-session';

export function PasswordResetPage() {
  const { hash } = useLocation();
  const [token] = useState(
    () => new URLSearchParams(hash.replace(/^#/, '')).get('reset_token') || '',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    if (readPreviewSession()) {
      setError('미리보기 로그아웃 후 실제 이메일로 진행해 주세요.');
      return;
    }
    if (
      token &&
      (password !== confirm ||
        !/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password))
    ) {
      setError('영문·숫자 포함 8자 이상의 비밀번호를 동일하게 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      if (token) await confirmPasswordReset(token, password);
      else await requestPasswordReset(email);
      if (token) {
        saveTokens(null);
        window.dispatchEvent(new Event('yippee:session-expired'));
        setPassword('');
        setConfirm('');
      }
      setMessage(
        token
          ? '비밀번호를 재설정했어요. 다시 로그인해 주세요.'
          : '가입된 이메일이면 재설정 안내가 발송됩니다. 메일함을 확인해 주세요.',
      );
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="screen account-form--reset" onSubmit={submit}>
      <ScreenHeader
        title={token ? '비밀번호 재설정' : '비밀번호 찾기'}
        backTo="/login"
      />
      <div className="screen-content form-stack">
        {token ? (
          <>
            <label className="wire-field">
              새 비밀번호
              <input
                type="password"
                autoComplete="new-password"
                required
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
        {token && message && <Link to="/login">로그인하기</Link>}
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={busy || !!(token && message)}
        >
          {busy ? '처리 중…' : token ? '비밀번호 재설정' : '재설정 링크 받기'}
        </button>
      </div>
    </form>
  );
}
