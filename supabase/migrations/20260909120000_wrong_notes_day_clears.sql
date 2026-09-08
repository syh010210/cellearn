-- =============================================================
--  마이그레이션: wrong_notes · day_clears (오답노트 / 일차 클리어)
--  schema.sql 의 해당 부분과 내용이 동일하다. 멱등(idempotent) —
--  이미 있으면 아무것도 바뀌지 않고, 없으면 만들어진다.
--  적용: Supabase SQL Editor 에 붙여넣고 실행 (supabase db push 는 사용자가 판단).
-- =============================================================

-- ── wrong_notes : 오답노트(퀴즈/실습) ─────────────────────────
create table if not exists public.wrong_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   integer not null,
  kind        text not null,          -- 'quiz' | 'practice'
  payload     jsonb not null,         -- 차시 오답 스냅샷(퀴즈=오답 id 배열 / 실습=오답 셀 배열)
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (user_id, lesson_id, kind)   -- 차시·종류당 1행 → 재제출 시 upsert로 교체
);
create index if not exists wrong_notes_user_idx on public.wrong_notes(user_id);

-- 기존 테이블에 유니크 제약이 없으면 추가 (upsert onConflict 에 필요)
do $$ begin
  alter table public.wrong_notes
    add constraint wrong_notes_user_lesson_kind_key unique (user_id, lesson_id, kind);
exception
  when duplicate_table then null;   -- 제약 이미 있음
  when duplicate_object then null;
end $$;

-- ── day_clears : 일차 마무리 시험 통과 기록(일차 게이팅) ────────
create table if not exists public.day_clears (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         integer not null,
  cleared_at  timestamptz not null default now(),
  primary key (user_id, day)
);

-- ── RLS 활성화 ───────────────────────────────────────────────
alter table public.wrong_notes enable row level security;
alter table public.day_clears  enable row level security;

-- 관리자 판별 헬퍼 (schema.sql 과 동일 — 이미 있으면 교체)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ── 정책: 본인 행만 select/insert/update/delete (for all = 4개 명령 모두) ──
drop policy if exists wrong_self on public.wrong_notes;
create policy wrong_self on public.wrong_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists day_clears_self on public.day_clears;
create policy day_clears_self on public.day_clears
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 관리자 전체 조회 (관리자 페이지에서 사용자 진도/오답 확인용) ──
drop policy if exists wrong_admin_read on public.wrong_notes;
create policy wrong_admin_read on public.wrong_notes
  for select using (public.is_admin());

drop policy if exists day_clears_admin_read on public.day_clears;
create policy day_clears_admin_read on public.day_clears
  for select using (public.is_admin());
