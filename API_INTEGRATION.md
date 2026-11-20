# MVP API 연동 — 2026-11-16

기준: origin/develop → feature/api-intergration. 백엔드 코드·DB는 변경하지 않음.

## 연결한 계약

- GET /activities: 전체 페이지 조회, 월령/소요시간 범위와 easy/hard 보존.
- GET /activity-categories: 정수 ID를 이름에 매핑. 다중 카테고리 필터 지원.
- GET /activities/{id}: 목록 로딩과 독립적으로 상세 조회. 실제 설명/이미지 표시.
- GET /activities/{id}/files/{image|pdf}: 상세 응답의 image/pdf URL 사용. PDF 링크는 새 탭에서 열거나 내려받고 브라우저 인쇄 사용. 서버는 Content-Disposition: attachment를 사용하므로 인라인 PDF 임베드는 하지 않음.
- GET /cart: 활동지 목록과 동일한 변환기 적용. 무료 활동지 보기로 이동.
- POST /auth/password/reset-request: {email}.
- POST /auth/password/reset-confirm: {reset_token,new_password}. 메일 링크의 #reset_token 값을 사용.
- 구매 목록 요청 제거. 무료 이용 안내 표시. 결제 API 추가 없음.

## 로컬 실행

프론트: npm ci 후 npm run dev. 기본 프록시 대상은 http://127.0.0.1:8000.
실제 API 로그인 검증 시 NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN=false, NEXT_PUBLIC_USE_MOCK_API=false로 실행한다.
미리보기 로그인은 샘플 데이터만 사용한다. 실제 API 검증과 구분한다.

백엔드: .venv/Scripts/python.exe 사용. 현재 설치된 인터프리터는 Python 3.14이며 프로젝트 기준은 3.12이다.
백엔드 .env, 실행 중인 MySQL, 기존 DB 준비 상태를 확인해야 실제 서버 검증이 가능하다.
이메일 재설정은 SMTP 및 PASSWORD_RESET_FRONTEND_URL=https://<frontend-host>/password/reset 설정이 필요하다.
.env.example의 값을 실제 운영 자격정보로 사용하지 않는다.

## 검증

- 프론트 타입 검사 통과.
- Vitest: 15개 통과. 필드 변환/다중 카테고리/연령·시간 범위/페이지네이션/직접 상세 조회/재설정 요청 계약·오류 전파 포함.
- Next.js 프로덕션 빌드 통과.
- 백엔드 offline preview check 및 DB 없는 테스트 34개 통과. 예시 환경값을 프로세스에만 설정했고 .env 생성/DB 연결/마이그레이션은 하지 않음.

## 남은 검증·범위

실제 MySQL 데이터로 목록→상세→이미지/PDF, 로그인→찜/장바구니, SMTP 메일→토큰 재설정의 종단 검증은 아직 수행하지 않음.
검색/필터는 모든 페이지를 로드한 목록에서 수행한다. 서버 검색 쿼리 직접 연동은 후속 작업이다.
인기/추천/리뷰/알림/기록/배지 및 선택한 아이 상태 GET 계약은 이번에 추가하지 않음.
실제 브라우저 화면 검증은 아직 수행하지 않음. UI 색상·스타일 파일은 변경하지 않음.
