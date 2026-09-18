-- SQL Editor에서 사람이 실행. supabase db push 사용 금지.
-- =============================================================
--  마이그레이션: 날짜 기반 일차 잠금 — 서버 시각 적용
--   1) day_clears.cleared_at 을 서버가 생성(default now()) — 클라이언트 값 신뢰 금지
--   2) server_now() RPC — 클라이언트가 기기 시계 대신 서버 시각을 받아 날짜 판정
--  멱등(idempotent). 기존 day_clears 행은 건드리지 않는다(update 없음).
-- =============================================================

-- 1) cleared_at 서버 생성 보장 (schema.sql 에 이미 default now() 이지만 재확인)
alter table if exists public.day_clears
  alter column cleared_at set default now();

-- 2) 서버 시각 RPC (KST 변환은 클라이언트에서). 읽기 전용·안전 → anon/authenticated 실행 허용.
create or replace function public.server_now()
returns timestamptz
language sql stable
as $$ select now(); $$;

grant execute on function public.server_now() to anon, authenticated;
