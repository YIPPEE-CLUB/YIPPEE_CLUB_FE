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
