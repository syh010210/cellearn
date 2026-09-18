-- SQL Editor에서 사람이 실행. supabase db push 사용 금지.
-- =============================================================
--  마이그레이션: 수강권 회수(revoke) 기록용 컬럼
--   enrollments.revoked_at — 관리자가 수강권을 회수(valid_to=now)한 시각.
--   회수 여부를 관리자 화면에서 구분해 보여주기 위함(만료와 구분).
--  멱등(idempotent). 기존 행은 건드리지 않는다(회수는 admin-student Edge Function이 수행).
-- =============================================================
alter table if exists public.enrollments
  add column if not exists revoked_at timestamptz;
