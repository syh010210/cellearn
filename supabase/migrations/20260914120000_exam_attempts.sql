-- SQL Editor에서 사람이 실행. supabase db push 사용 금지.
-- =============================================================
--  마이그레이션: exam_attempts (실전 모의고사 응시 기록)
--  schema.sql 의 해당 부분과 내용이 동일하다. 멱등(idempotent) —
--  이미 있으면 아무것도 바뀌지 않고, 없으면 만들어진다.
--  응시 기록은 불변: update/delete 정책을 두지 않는다(수정·삭제 불가).
-- =============================================================

-- grade_level enum (schema.sql 에 이미 있음. 없을 때만 생성 — 멱등)
do $$ begin
  create type grade_level as enum ('1급', '2급');
exception when duplicate_object then null; end $$;

-- ── exam_attempts : 응시 1회 = 1행 ─────────────────────────────
create table if not exists public.exam_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  grade        grade_level not null default '2급',
  seed         text not null,                 -- 문제 id 목록(조립기 전까지) / 시드
  config       jsonb not null default '{}',   -- 출제 구성(sections 등)
  problem_set  jsonb not null,                -- 출제된 문제 스냅샷
  items        jsonb not null,                -- 항목별 채점 결과(+깃발)
  correct      integer not null,
  total        integer not null,
  elapsed_ms   integer not null,
  overtime     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists exam_attempts_user_created_idx on public.exam_attempts(user_id, created_at desc);

-- ── RLS ───────────────────────────────────────────────────────
alter table public.exam_attempts enable row level security;

-- 관리자 판별 헬퍼 (schema.sql 과 동일 — 이미 있으면 교체)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- 정책: 본인 행만 select/insert. (update/delete 정책 없음 = 불변)
drop policy if exists exam_attempts_select_self on public.exam_attempts;
create policy exam_attempts_select_self on public.exam_attempts
  for select using (auth.uid() = user_id);

drop policy if exists exam_attempts_insert_self on public.exam_attempts;
create policy exam_attempts_insert_self on public.exam_attempts
  for insert with check (auth.uid() = user_id);

-- 관리자 전체 조회 (관리자 페이지에서 응시 기록 확인용)
drop policy if exists exam_attempts_admin_read on public.exam_attempts;
create policy exam_attempts_admin_read on public.exam_attempts
  for select using (public.is_admin());
