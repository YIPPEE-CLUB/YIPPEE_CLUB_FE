import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import {
  checkEmail,
  sendSignupCode,
  confirmSignupCode,
  login,
  signup,
} from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { previewLoginEnabled } from '../lib/preview-session';

type Step =
  'entry' | 'login' | 'terms' | 'password' | 'verification' | 'complete';
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="wire-field">
      <span>{label}</span>
      <span className="wire-field__password">
        <input
          aria-label={label}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={128}
          required
          autoComplete="off"
        />
        <button
          type="button"
          className="icon-button"
          aria-label={`${label} ${visible ? '숨기기' : '표시'}`}
          onClick={() => setVisible(!visible)}
        >
          <Icon name="eye" />
        </button>
      </span>
    </label>
  );
}

export function AuthPage() {
  const { establish, previewLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath: unknown = location.state?.from;
  const returnPath =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//') &&
    !requestedPath.startsWith('/login')
      ? requestedPath
      : '/';
  const [step, setStep] = useState<Step>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreements, setAgreements] = useState([false, false, false, false]);
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [remaining, setRemaining] = useState(180);
  const [proof, setProof] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setRemaining(
        Math.max(0, Math.ceil((expiresAt - performance.now()) / 1000)),
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);
  async function issueCode() {
    const issued = await sendSignupCode(email);
    setVerificationId(issued.verification_id);
    setProof('');
    setExpiresAt(performance.now() + issued.expires_in_seconds * 1000);
    setCode('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !valid) return;
    setBusy(true);
    setError('');
    try {
      if (step === 'entry') {
        const identifier = email.trim();
        if (/^01\d{8,9}$/.test(identifier.replace(/-/g, ''))) {
          throw new Error(
            '현재 이메일 가입만 지원해요. 이메일을 입력해 주세요.',
          );
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
          throw new Error('이메일을 확인해 주세요.');
        }
        if (previewLoginEnabled) {
          previewLogin(identifier);
          navigate(returnPath, { replace: true });
          return;
        }
        const data = await checkEmail(identifier);
        setEmail(identifier.toLowerCase());
        setStep(data.registered ? 'login' : 'terms');
      } else if (step === 'login') {
        await establish(await login(email, password));
        navigate(returnPath, { replace: true });
      } else if (step === 'terms') setStep('password');
      else if (step === 'password') {
        if (password !== confirm)
          throw new Error('비밀번호가 일치하지 않아요.');
        if (!/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password))
          throw new Error('영문과 숫자를 포함해 8자 이상 입력해 주세요.');
        await issueCode();
        setStep('verification');
      } else if (step === 'verification') {
        let token = proof;
        if (!token) {
          const verified = await confirmSignupCode(verificationId, code);
          token = verified.verification_token;
          setProof(token);
        }
        await establish(await signup(email, password, token, agreements));
        setStep('complete');
      }
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const valid =
    step === 'entry'
      ? !!email.trim()
      : step === 'terms'
        ? agreements.slice(0, 3).every(Boolean)
        : step === 'password'
          ? !!password && !!confirm
          : step === 'verification'
            ? !!proof || (/^\d{6}$/.test(code) && remaining > 0)
            : !!password;
  function back() {
    if (busy) return;
    setError('');
    setProof('');
    setStep(
      step === 'verification'
        ? 'password'
        : step === 'password'
          ? 'terms'
          : 'entry',
    );
  }
  const node = {
    entry: '122:1415',
    login: '122:1437',
    terms: '118:1666',
    password: '122:1586',
    verification: '191:4661',
    complete: '118:1749',
  }[step];
  return (
    <form
      className={`screen ${step === 'entry' ? 'auth-entry' : ''}`}
      onSubmit={submit}
      data-figma-node={node}
    >
      {step !== 'entry' && (
        <ScreenHeader
          title={step === 'login' ? '로그인' : '회원가입'}
          onBack={back}
        />
      )}
      {step === 'entry' ? (
        <div className="auth-entry-content reference-auth">
          <Link className="icon-button auth-back" to="/" aria-label="뒤로가기">
            <Icon name="back" size={32} />
          </Link>
          <div className="auth-intro">
            <div className="auth-logo-placeholder" />
            <p>YIPPEE CLUB과 함께 성장해요!</p>
          </div>
          <div className="auth-social-stack">
            {['카카오', 'Apple', '네이버'].map((provider) => (
              <button
                type="button"
                className={`button social-button social-button--${provider === '카카오' ? 'kakao' : provider === 'Apple' ? 'apple' : 'naver'}`}
                key={provider}
                onClick={() =>
                  setNotice(
                    '소셜 로그인은 아직 연결하지 않았어요. 이메일로 시작해 주세요.',
                  )
                }
              >
                {provider}로 시작하기
              </button>
            ))}
          </div>
          <div className="auth-or">
            <span>또는</span>
          </div>
          <div className="auth-entry-fields">
            <label className="wire-field">
              이메일
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="이메일 입력"
                autoComplete="email"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button--primary"
              disabled={busy || !valid}
            >
              시작하기
            </button>
            {previewLoginEnabled && (
              <p className="wire-note">
                화면 확인용 가로그인: 이메일만 입력하면 시작할 수 있어요.
              </p>
            )}
          </div>
        </div>
      ) : step === 'complete' ? (
        <>
          <div className="screen-content screen-content--center">
            <div className="empty-circle" />
            <h2>회원가입이 완료됐어요</h2>
            <p>아이와 함께 즐거운 놀이를 시작해 보세요.</p>
          </div>
          <div className="screen-actions">
            <Link className="button button--primary" to="/children/new">
              아이 등록하기
            </Link>
            <Link className="text-button" to="/">
              나중에 하기
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="screen-content form-stack">
            {step === 'login' && (
              <>
                <label className="wire-field">
                  이메일
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <PasswordField
                  label="비밀번호"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={setPassword}
                />
                <button
                  className="text-button"
                  type="button"
                  onClick={() => navigate('/password/reset')}
                >
                  비밀번호 찾기
                </button>
              </>
            )}
            {step === 'terms' && (
              <>
                <h2>약관에 동의해 주세요</h2>
                <label className="checkbox-label info-panel">
                  <input
                    type="checkbox"
                    checked={agreements.every(Boolean)}
                    onChange={(event) =>
                      setAgreements(agreements.map(() => event.target.checked))
                    }
                  />
                  <strong>전체 동의</strong>
                </label>
                {[
                  '[필수] 서비스 이용약관',
                  '[필수] 개인정보 수집·이용 동의',
                  '[필수] 만 14세 이상입니다',
                  '[선택] 혜택·이벤트 알림 수신',
                ].map((label, index) => (
                  <div className="agreement-row" key={label}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={agreements[index]}
                        onChange={(event) =>
                          setAgreements(
                            agreements.map((value, key) =>
                              key === index ? event.target.checked : value,
                            ),
                          )
                        }
                      />
                      {label}
                    </label>
                    {index !== 2 && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`${label} 보기`}
                        onClick={() =>
                          navigate(
                            index === 0
                              ? '/policies/terms'
                              : index === 1
                                ? '/policies/privacy'
                                : '/policies/marketing',
                          )
                        }
                      >
                        <Icon name="chevron" size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
            {step === 'password' && (
              <>
                <h2>비밀번호를 만들어 주세요</h2>
                <PasswordField
                  label="비밀번호"
                  placeholder="영문, 숫자 포함 8자 이상"
                  value={password}
                  onChange={setPassword}
                />
                <PasswordField
                  label="비밀번호 확인"
                  placeholder="비밀번호 다시 입력"
                  value={confirm}
                  onChange={setConfirm}
                />
              </>
            )}
            {step === 'verification' && (
              <>
                <label className="wire-field">
                  인증번호
                  <input
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="6자리 숫자"
                    autoComplete="one-time-code"
                  />
                </label>
                <div className="section-heading">
                  <p className="wire-note">
                    남은 시간{' '}
                    {String(Math.floor(remaining / 60)).padStart(2, '0')}:
                    {String(remaining % 60).padStart(2, '0')}
                  </p>
                  <button
                    className="text-button"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setBusy(true);
                      void issueCode()
                        .catch((cause: Error) => setError(cause.message))
                        .finally(() => setBusy(false));
                    }}
                  >
                    다시 받기
                  </button>
                </div>
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
              disabled={busy || !valid}
            >
              {busy
                ? '처리 중…'
                : step === 'login'
                  ? '로그인'
                  : step === 'verification'
                    ? '확인'
                    : '다음'}
            </button>
          </div>
        </>
      )}
      {notice && (
        <WireDialog title="로그인 안내" onClose={() => setNotice('')}>
          <h2>안내</h2>
          <p>{notice}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setNotice('')}
          >
            확인
          </button>
        </WireDialog>
      )}
    </form>
  );
}
