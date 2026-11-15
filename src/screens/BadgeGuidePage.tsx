import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';

const labels = ['활동지 놀이 완료', '리뷰 쓰기', '배지 획득!'];
const frameIds = ['122:2519', '192:4995', '192:5012'];
export function BadgeGuidePage() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(2);
      return;
    }
    const timer = setInterval(
      () => setStep((previous) => (previous + 1) % 3),
      2200,
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="screen" data-figma-node={frameIds[step]}>
      <ScreenHeader title="활동배지" />
      <div className="screen-content">
        <div
          className={`badge-stage badge-stage--${step}`}
          role="img"
          aria-label="활동지 놀이 완료, 리뷰 쓰기, 배지 획득 순서"
        >
          <div className="badge-stage__paper">
            <span />
            <span />
            <span />
          </div>
          <div className="badge-stage__review">
            <span>★★★★★</span>
            <i />
          </div>
          <img className="badge-stage__badge" src="/assets/a6485.svg" alt="" />
          <strong className="badge-stage__caption">{labels[step]}</strong>
        </div>
        <h2>즐겁게 놀이하면 쌓이는 활동배지</h2>
        <p className="body-copy">
          활동지로 놀이한 뒤 리뷰를 쓰면 배지를 받을 수 있어요. ‘반짝배지’는
          대표배지로 설정할 수 있어요.
        </p>
      </div>
      <div className="screen-actions">
        <Link className="button button--primary" to="/badges">
          만세도감 보기
        </Link>
      </div>
    </div>
  );
}
