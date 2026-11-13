# YIPPEE CLUB Frontend

YIPPEE CLUB 단체 프론트엔드 저장소입니다. React + Next.js App Router + TypeScript를 사용합니다.
백엔드는 별도 [YIPPEE_CLUB_BE](https://github.com/YIPPEE-CLUB/YIPPEE_CLUB_BE) 저장소에서 관리합니다.

## 브랜치

- `main`: 프로젝트 기본 설정 및 검증된 기준 코드
- `develop`: 개발 통합 브랜치. 최초에는 `main`과 동일합니다.
- `ui`: 기존 화면 이관 및 UI 개발. PR 대상은 `develop`입니다.
- 후속 기능은 `feature/기능명`, 수정은 `fix/수정명`으로 분기합니다.

`ui` → PR → `develop` → PR → `main` 순서로 통합합니다. 공용 브랜치에 강제 푸시하지 않습니다.
브랜치 보호 및 필수 리뷰 정책은 GitHub 저장소 설정에서 팀이 별도로 적용합니다.

## 실행

Node.js 22.12 이상 또는 24를 사용합니다.

```sh
npm ci
```

`.env.example`을 `.env.local`로 복사하고 백엔드 주소를 설정한 뒤 실행합니다.

```sh
npm run dev
```

접속 주소는 http://127.0.0.1:3000 입니다.
`NEXT_PUBLIC_API_BASE_URL` 기본값은 `/api/v1`이며 `/api/*`는 `API_PROXY_TARGET`으로 전달됩니다.
공개 환경변수에는 비밀번호나 비밀키를 넣지 않습니다. `.env.local`과 설치·빌드 결과는 커밋하지 않습니다.

## 검증

```sh
npm run format:check
npm test
npm run build
npm run typecheck
```

GitHub Actions에서 같은 검증을 수행합니다.

## UI 브랜치 구조와 이관 범위

기존 개인 저장소 `yupo5710/YIPPEE_CLUB`의 `02e5a11` 커밋에서 프론트 코드와 공개 에셋만 이관했습니다.
임시 Django 서버, 개인 환경변수, DB, 업로드, 설치 결과는 포함하지 않습니다.

```text
src/app/          Next.js 진입점·레이아웃
src/screens/        기존 기능별 화면
src/components/   공통 UI
src/context/      로그인·아이 상태
src/services/     API 응답 어댑터
src/lib/          HTTP·토큰·날짜 유틸리티
src/data/         화면 확인용 샘플
public/assets/    이미지·글꼴·라이선스
```

이번 이관은 기존 React Router를 유지하는 클라이언트 렌더링 방식입니다.
Next.js의 catch-all 경로가 모든 UI URL의 직접 접속·새로고침을 처리합니다.
화면별 App Router 전환, 서버 렌더링 및 화면별 메타데이터는 후속 작업입니다.
화면에 API 연동 코드가 있어도 실제 단체 백엔드와 계약 검증이 끝났다는 의미는 아닙니다.

기존 로컬 API 연결 기능: 가입·로그인·프로필·아이·활동지·찜·장바구니.
결제·환불·메일·PDF·사진 AI·배지 등은 미구현입니다. 일부 콘텐츠는 샘플입니다.
화면 확인만 할 때 `NEXT_PUBLIC_USE_MOCK_API=true`로 설정하면 활동지 목록에 샘플을 사용합니다.
이 옵션이 로그인 등 모든 API를 대체하지는 않습니다.
기존 Figma 대조 범위는 `FIGMA_REVIEW.md`를 참조합니다.

## 이관 검증 (2026-11-14)

- Next.js 16.4.6 프로덕션 빌드, TypeScript, Prettier 통과
- 기존 날짜 유틸리티 테스트 4개 통과
- Edge에서 `/`, `/activities`, `/search`, `/login` 직접 접속 확인
- 402px 화면 가로 넘침 없음, 한글 검색 제출·결과 URL·새로고침 유지 확인
- 브라우저 실행 오류 없음

브라우저 검증에서는 API를 빈 목록 응답으로 대체했습니다. 실제 단체 백엔드 연동·가입·결제 검증은 별도로 필요합니다.
