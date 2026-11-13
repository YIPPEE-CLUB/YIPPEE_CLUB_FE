import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { WireDialog } from '../components/WireDialog';
import { Icon } from '../components/Icon';

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  return (
    <div
      className="screen"
      data-figma-node={['122:1389', '122:1398', '122:1407'][step]}
    >
      <div className="onboarding-content">
        <Link className="text-button onboarding-skip" to="/login">
          건너뛰기
        </Link>
        <div className="onboarding-hero" />
        <h1>
          {step === 0 ? (
            <>
              우리 아이 맞춤 놀이를
              <br />
              원클릭으로 찾아요
            </>
          ) : step === 1 ? (
            <>
              프린트 한 장이면
              <br />
              놀이 준비 끝
            </>
          ) : (
            <>
              놀이 후 리뷰를 쓰면
              <br />
              배지를 획득해요
            </>
          )}
        </h1>
        <div className="onboarding-dots" aria-label={`${step + 1} / 3`}>
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              aria-label={`${index + 1}번 안내`}
              className={step === index ? 'is-selected' : ''}
              onClick={() => setStep(index)}
            />
          ))}
        </div>
      </div>
      <div className="screen-actions">
        {step === 2 ? (
          <Link className="button button--primary" to="/login">
            시작하기
          </Link>
        ) : (
          <button
            className="button button--primary"
            onClick={() => setStep(step + 1)}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
}

export function VersionPage() {
  return (
    <div className="screen" data-figma-node="124:4988">
      <ScreenHeader title="버전 정보" backTo="/settings" />
      <div className="screen-content version-content">
        <p>현재 버전 0.0.0</p>
        <p className="wire-note">최신 버전이에요.</p>
      </div>
      <div className="screen-actions">
        <button className="button button--primary" disabled>
          최신 버전으로 업데이트
        </button>
      </div>
    </div>
  );
}

export function LicensesPage() {
  const [selected, setSelected] = useState('');
  return (
    <div className="screen" data-figma-node="124:5003">
      <ScreenHeader title="오픈소스 라이선스" backTo="/settings" />
      <div className="screen-content support-rows">
        {['React', 'React Router', 'Lalezar'].map((name) => (
          <button
            className="menu-row"
            key={name}
            onClick={() => setSelected(name)}
          >
            {name}
            <Icon name="chevron" />
          </button>
        ))}
      </div>
      {selected && (
        <WireDialog title="라이선스" onClose={() => setSelected('')}>
          <h2>{selected}</h2>
          <p>
            {selected === 'Lalezar'
              ? 'SIL Open Font License 1.1'
              : 'MIT License'}
          </p>
          {selected === 'Lalezar' && (
            <a
              className="text-link"
              href="/assets/Lalezar-OFL.txt"
              target="_blank"
              rel="noreferrer"
            >
              라이선스 전문 보기
            </a>
          )}
          <button className="button" onClick={() => setSelected('')}>
            닫기
          </button>
        </WireDialog>
      )}
    </div>
  );
}

export function WithdrawPage() {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [notice, setNotice] = useState(false);
  return (
    <div className="screen" data-figma-node={step ? '124:4593' : '124:4564'}>
      <ScreenHeader title="회원탈퇴" backTo="/settings" />
      <div className="screen-content">
        <h2>
          {step ? '탈퇴 전에 확인해 주세요' : '탈퇴하는 이유를 알려주세요'}
        </h2>
        {step ? (
          <>
            <div className="info-panel">
              <div className="cart-total">
                <span>구매한 활동지</span>
                <span>0개</span>
              </div>
              <div className="cart-total" style={{ marginTop: 8 }}>
                <span>만세도감 배지</span>
                <span>0개</span>
              </div>
            </div>
            <p className="body-copy">
              탈퇴하면 구매한 활동지와 기록을 더 볼 수 없어요.
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              위 내용을 확인했어요.
            </label>
          </>
        ) : (
          <div className="sort-options">
            {[
              '이용할 활동지가 부족해요',
              '아이가 많이 컸어요',
              '앱 사용이 불편해요',
              '기타',
            ].map((value) => (
              <label key={value}>
                {value}
                <input
                  type="radio"
                  name="withdraw-reason"
                  checked={reason === value}
                  onChange={() => setReason(value)}
                />
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="screen-actions">
        <button
          className="button button--primary"
          disabled={step ? !agreed : !reason}
          onClick={() => (step ? setNotice(true) : setStep(1))}
        >
          {step ? '탈퇴하기' : '다음'}
        </button>
      </div>
      {notice && (
        <WireDialog title="회원탈퇴 안내" onClose={() => setNotice(false)}>
          <p>
            회원탈퇴 API는 아직 연결되지 않았어요. 계정이 삭제되지 않았습니다.
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

export function ReviewsPage() {
  const [sort, setSort] = useState('최신순');
  const [notice, setNotice] = useState('');
  return (
    <div className="screen" data-figma-node="123:2888">
      <ScreenHeader title="리뷰" backTo="/activities/101" />
      <div className="screen-content">
        <div className="info-panel">
          <h1 style={{ fontWeight: 600 }}>★ 0.0</h1>
          <p className="wire-note" style={{ marginTop: 8 }}>
            리뷰 0개
          </p>
        </div>
        <div className="section-heading">
          <button className="filter-chip">
            사진 리뷰만
            <Icon name="down" size={16} />
          </button>
          <button
            className="filter-chip"
            onClick={() => setSort(sort === '최신순' ? '인기순' : '최신순')}
          >
            {sort}
            <Icon name="down" size={16} />
          </button>
        </div>
        {['도영이네', '내 리뷰'].map((name) => (
          <div className="section" key={name}>
            <div className="section-heading">
              <strong>{name}</strong>
              <small style={{ color: '#747474' }}>★★★★★</small>
            </div>
            <span className="skeleton-line" />
            <span className="skeleton-line" />
            <div className="section-heading">
              <button
                className="text-button"
                onClick={() => setNotice('리뷰 API가 아직 연결되지 않았어요.')}
              >
                {name === '내 리뷰' ? '삭제' : '신고'}
              </button>
              <button
                className="button button--small"
                onClick={() => setNotice('리뷰 API가 아직 연결되지 않았어요.')}
              >
                도움돼요 0
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/orders">
          구매내역에서 리뷰 쓰기
        </Link>
      </div>
      {notice && (
        <WireDialog title="리뷰 안내" onClose={() => setNotice('')}>
          <p>{notice}</p>
          <button className="button" onClick={() => setNotice('')}>
            확인
          </button>
        </WireDialog>
      )}
    </div>
  );
}
