'use client';

import dynamic from 'next/dynamic';

// 브라우저 저장소와 기존 Router를 사용하는 UI는 브라우저에서 마운트합니다.
const Application = dynamic(() => import('../application'), {
  ssr: false,
  loading: () => <main aria-busy="true">불러오는 중…</main>,
});

export default function ClientApp() {
  return <Application />;
}
