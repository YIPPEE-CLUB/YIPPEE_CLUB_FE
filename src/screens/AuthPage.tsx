import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { WireDialog } from '../components/WireDialog';
import { apiRequest, type Tokens } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  const { establish } = useAuth();
  const navigate = useNavigate();
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
    const issued = await apiRequest<{
      verification_id: string;
      expires_in_seconds: number;
      dev_code?: string;
    }>('/auth/verification/send', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, purpose: 'signup' }),
    });
    setVerificationId(issued.verification_id);
    setProof('');
    setExpiresAt(performance.now() + issued.expires_in_seconds * 1000);
    // 실제 메일 발송이 없는 로컬 서버에서만 개발 코드를 자동 입력합니다.
    setCode(import.meta.env.DEV && issued.dev_code ? issued.dev_code : '');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (step === 'entry') {
        const data = await apiRequest<{ registered: boolean }>(
          '/auth/identifiers/check',
          { method: 'POST', body: JSON.stringify({ identifier: email }) },
        );
        setStep(data.registered ? 'login' : 'terms');
      } else if (step === 'login') {
        await establish(
          await apiRequest<Tokens>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          }),
        );
        navigate('/');
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
          const verified = await apiRequest<{ verification_token: string }>(
            '/auth/verification/confirm',
            {
              method: 'POST',
              body: JSON.stringify({ verification_id: verificationId, code }),
            },
          );
          token = verified.verification_token;
          setProof(token);
        }
        await establish(
          await apiRequest<Tokens>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
              identifier: email,
              password,
              verification_token: token,
              agreements: { terms: agreements[0], privacy: agreements[1] },
            }),
          }),
        );
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
            ? /^\d{6}$/.test(code) && remaining > 0
            : !!password;
  function back() {
    setError('');
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
        <div className="auth-entry-content">
          <div className="auth-logo-placeholder" />
          <h1 className="brand-wordmark">YIPPEE CLUB</h1>
          <p>집에서도 신나게 놀이해요!</p>
          <div className="auth-entry-fields">
            <label className="wire-field">
              휴대전화 또는 이메일
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="휴대전화 번호 또는 이메일 입력"
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
            <div className="auth-or">
              <img src="/assets/39b7c.svg" alt="" />
              <span>또는</span>
              <img src="/assets/73078.svg" alt="" />
            </div>
            {['네이버', 'Apple', '카카오'].map((provider) => (
              <button
                type="button"
                className="button social-button"
                key={provider}
                onClick={() =>
                  setNotice(
                    '소셜 로그인은 아직 연결하지 않았어요. 이메일로 시작해 주세요.',
                  )
                }
              >
                <img src="/assets/1cf59.svg" alt="" />
                {provider}로 시작하기
              </button>
            ))}
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
