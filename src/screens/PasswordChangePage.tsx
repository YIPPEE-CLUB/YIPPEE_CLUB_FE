import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { changePassword, passwordError } from '../services/profile';

export function PasswordChangePage() {
  const { isPreview, clearSession } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(['', '', '']);
  const [visible, setVisible] = useState([false, false, false]);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending.current) return;
    setError('');
    if (isPreview) {
      setError(
        '미리보기에서는 비밀번호를 변경할 수 없어요. 실제 계정으로 로그인해 주세요.',
      );
      return;
    }
    const validation = passwordError(values[1], values[2]);
    if (!values[0] || validation) {
      setError(validation || '현재 비밀번호를 입력해 주세요.');
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      await changePassword(values[0], values[1]);
      setValues(['', '', '']);
      clearSession();
      navigate('/login', {
        replace: true,
        state: {
          notice: '비밀번호를 변경했어요. 새 비밀번호로 다시 로그인해 주세요.',
        },
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : '비밀번호를 변경하지 못했어요.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="screen account-form--password"
      data-figma-node="124:4216"
      onSubmit={submit}
    >
      <ScreenHeader title="비밀번호 변경" backTo="/settings" />
      <div className="screen-content form-stack">
        {['현재 비밀번호', '새 비밀번호', '새 비밀번호 확인'].map(
          (label, index) => (
            <label className="wire-field" key={label}>
              <span>{label}</span>
              <span className="wire-field__password">
                <input
                  aria-label={label}
                  type={visible[index] ? 'text' : 'password'}
                  autoComplete={
                    index === 0 ? 'current-password' : 'new-password'
                  }
                  required
                  maxLength={128}
                  disabled={busy}
                  value={values[index]}
                  placeholder={index === 1 ? '영문, 숫자 포함 8자 이상' : label}
                  onChange={(event) =>
                    setValues(
                      values.map((value, key) =>
                        key === index ? event.target.value : value,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${label} ${visible[index] ? '숨기기' : '표시'}`}
                  onClick={() =>
                    setVisible(
                      visible.map((value, key) =>
                        key === index ? !value : value,
                      ),
                    )
                  }
                >
                  <Icon name="eye" />
                </button>
              </span>
            </label>
          ),
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
          disabled={busy || values.some((value) => !value)}
        >
          {busy ? '변경 중…' : '변경하기'}
        </button>
      </div>
    </form>
  );
}
