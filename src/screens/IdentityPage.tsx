import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { WireDialog } from '../components/WireDialog';
import { Icon } from '../components/Icon';

export function IdentityPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [digit, setDigit] = useState('');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [carrier, setCarrier] = useState('');
  const [carrierSheet, setCarrierSheet] = useState(false);
  const [notice, setNotice] = useState(false);
  const ready =
    !!name.trim() &&
    /^\d{6}$/.test(birth) &&
    /^[1-8]$/.test(digit) &&
    /^01\d{8,9}$/.test(phone) &&
    !!carrier;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 2) setStep(step + 1);
    // 휴대전화 본인확인은 이메일 인증과 다른 계약입니다. 미연동 상태에서 인증 완료로 진행하지 않습니다.
    else setNotice(true);
  }
  return (
    <form
      className="screen"
      onSubmit={submit}
      data-figma-node={
        carrierSheet ? '168:5398' : ['168:5308', '168:5326', '168:5344'][step]
      }
    >
      <ScreenHeader
        title="회원가입"
        onBack={() => (step ? setStep(step - 1) : navigate('/login'))}
      />
      <div className="screen-content identity-content">
        <p className="identity-heading">
          아이와 부모님의 안전을 위해
          <br />
          <strong>본인인증</strong>을 진행할게요.
        </p>
        {step > 0 && (
          <label className="wire-field">
            이름
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력해 주세요."
              autoComplete="name"
              required
            />
          </label>
        )}
        {step === 2 && (
          <>
            <div className="wire-field">
              <span>주민등록번호</span>
              <div className="identity-birth">
                <input
                  aria-label="주민번호 앞자리"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="주민번호 앞자리"
                  maxLength={6}
                  value={birth}
                  onChange={(event) =>
                    setBirth(event.target.value.replace(/\D/g, ''))
                  }
                  required
                />
                <span>-</span>
                <input
                  type="password"
                  aria-label="주민번호 뒷자리 첫 숫자"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={1}
                  value={digit}
                  onChange={(event) =>
                    setDigit(event.target.value.replace(/[^1-8]/g, ''))
                  }
                  required
                />
                <span className="identity-mask" aria-hidden="true">
                  ●●●●●●
                </span>
              </div>
            </div>
            <div className="wire-field">
              <span>휴대전화 번호</span>
              <div className="carrier-options" aria-label="통신사">
                {['SKT', 'KT', 'LG U+', '알뜰폰'].map((label) => (
                  <button
                    type="button"
                    key={label}
                    aria-pressed={
                      label === '알뜰폰'
                        ? carrier.includes('알뜰폰')
                        : carrier === label
                    }
                    onClick={() =>
                      label === '알뜰폰'
                        ? setCarrierSheet(true)
                        : setCarrier(label)
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="identity-phone">
                <input
                  aria-label="휴대전화 번호"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="휴대전화 번호를 입력하세요."
                  value={phone}
                  maxLength={11}
                  onChange={(event) =>
                    setPhone(event.target.value.replace(/\D/g, ''))
                  }
                  required
                />
                <button
                  className="button"
                  type="button"
                  disabled={!ready}
                  onClick={() => setNotice(true)}
                >
                  인증요청
                </button>
              </div>
              {carrier.includes('알뜰폰') && <small>{carrier}</small>}
            </div>
          </>
        )}
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={step === 1 ? !name.trim() : step === 2 ? !ready : false}
        >
          {step === 0 ? '본인인증 하기' : '인증번호 받기'}
        </button>
      </div>
      {carrierSheet && (
        <WireDialog
          title="통신사 선택"
          sheet
          onClose={() => setCarrierSheet(false)}
        >
          <div className="section-heading">
            <h2>통신사를 선택하세요.</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="통신사 선택 닫기"
              onClick={() => setCarrierSheet(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="carrier-list">
            {['SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰'].map((label) => (
              <button
                type="button"
                key={label}
                onClick={() => {
                  setCarrier(label);
                  setCarrierSheet(false);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </WireDialog>
      )}
      {notice && (
        <WireDialog title="본인인증 안내" onClose={() => setNotice(false)}>
          <p>
            휴대전화 본인인증을 준비 중이에요. 지금은 이메일로 가입해 주세요.
          </p>
          <button
            type="button"
            className="button"
            onClick={() => setNotice(false)}
          >
            확인
          </button>
        </WireDialog>
      )}
    </form>
  );
}
