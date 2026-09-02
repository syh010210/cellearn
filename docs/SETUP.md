# 회원·결제 시스템 세팅 가이드

일주일 내 실서비스 목표. 아래 순서대로 진행하면 로그인 → 결제 → 실습 잠금 해제 → 관리자 조회까지 동작한다.

## 아키텍처 요약
- **인증·DB**: Supabase (Postgres + Auth + RLS + Edge Functions)
- **결제**: 포트원(PortOne) — 결제창은 브라우저, **검증은 서버(Edge Function)**
- **상품**: 급수별(1급/2급) 기간제 — 프로모션: 올해 말까지
- **관리자**: `profiles.role='admin'` 계정 → 앱 내 `/admin`(관리자 대시보드)

```
비회원 → 랜딩/커리큘럼/가격만
로그인O + 수강권X → 결제 화면(CheckoutView)
로그인O + 활성 수강권O → 학습·실습 전체
role=admin → 관리자 대시보드
```

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에서 프로젝트 생성(Region: Seoul 권장).
2. **SQL Editor** 에 `supabase/schema.sql` 전체를 붙여넣고 실행 → 테이블·트리거·RLS 생성.
3. **Settings > API** 에서 `Project URL` 과 `anon public` 키 복사.

## 2. 프론트 환경변수
`.env.example` 을 복사해 `.env` 생성 후 값 채우기:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PORTONE_STORE_ID=...
VITE_PORTONE_CHANNEL_KEY=...
```
> `.env` 는 git에 커밋되지 않는다(.gitignore 처리됨). `VITE_` 접두사가 붙은 값은 브라우저에 노출되므로 **비밀키를 넣지 말 것**.

`npm run dev` 로 실행하면 회원가입/로그인이 실제로 동작한다.

## 3. 관리자 계정 지정
관리자로 쓸 계정으로 먼저 회원가입 → Supabase SQL Editor에서:
```sql
update public.profiles set role = 'admin' where email = '본인관리자@메일';
```

## 4. 포트원(PortOne) 결제
1. https://portone.io 가입 → 상점(Store) 생성, 원하는 PG(카드/카카오페이/토스페이 등) 채널 연결.
2. **Store ID / Channel Key** 를 `.env` 의 `VITE_PORTONE_*` 에 넣기.
3. **API Secret** 은 브라우저에 노출하면 안 되므로 Supabase 시크릿에 등록:
   ```
   supabase secrets set PORTONE_API_SECRET=...
   ```
4. 브라우저 SDK(`@portone/browser-sdk`)는 이미 설치·연동되어 있음. `CheckoutView.jsx`가 키를 읽어 결제창을 띄운다.
   (상품 가격은 `CheckoutView.jsx`의 PRODUCTS와 `verify-payment/index.ts`의 PRICE를 **같은 값**으로 유지할 것.)
5. 검증 함수 배포:
   ```
   supabase functions deploy verify-payment
   ```
   결제 완료 → `verify-payment` 가 금액/상태 확인 → `payments`, `enrollments`(올해 말까지) 기록 → 실습 잠금 해제.

## 5. 배포
- 프론트: Vercel/Netlify에 배포하고 환경변수 등록.
- 포트원 결제 리디렉트/웹훅 URL을 배포 도메인 기준으로 설정.

## 현재 코드 상태(스켈레톤 vs 완성)
| 항목 | 상태 |
|---|---|
| Supabase 클라이언트/AuthContext | ✅ 완성 (키만 넣으면 동작) |
| 회원가입/로그인 UI | ✅ 완성 |
| 접근 게이팅(App.jsx) | ✅ 완성 |
| DB 스키마·RLS | ✅ 완성 (schema.sql 실행 필요) |
| 관리자 대시보드 | ✅ 조회 완성 (검색/엑셀내보내기 확장 여지) |
| 결제(CheckoutView) | ✅ PortOne 실호출 연동 완료 (`@portone/browser-sdk` 설치됨). `.env`의 VITE_PORTONE_* 키만 넣으면 결제창 동작 |
| 결제 검증(Edge Function) | ✅ 로직·CORS 완성 → **배포·시크릿 등록만 하면 동작** (아래 4번) |
| 진도/오답 DB 저장 | ✅ 완료 — 로그인 시 DB에서 복원, 변경 시 자동 저장(useLearningData). 비로그인/미설정 시 메모리 fallback |
