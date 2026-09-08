-- =============================================================
--  마이그레이션: visits (접속 현황 — 로그인 여부와 무관한 방문자 집계)
--  schema.sql 의 해당 부분과 내용이 동일하다. 멱등(idempotent).
--  적용: Supabase SQL Editor 에 붙여넣고 실행 (supabase db push 는 사용자가 판단).
-- =============================================================

-- ── visits : 방문자 접속 기록(방문자·날짜당 1행) ───────────────
create table if not exists public.visits (
  visitor_id    text not null,                                  -- 익명 방문자 식별자(localStorage)
  user_id       uuid references auth.users(id) on delete set null, -- 로그인 시 함께 기록(선택)
  visit_date    date not null,                                  -- KST 기준 방문일(클라이언트가 yyyy-mm-dd 로 계산)
  device        text,                                           -- 'mobile' | 'tablet' | 'desktop'
  os            text,                                           -- iOS | Android | Windows | Mac | 기타
  browser       text,                                           -- Chrome | Safari | Samsung | 기타
  source        text,                                           -- 유입 출처(utm_source / referrer 유추 / instagram 등)
  medium        text,                                           -- utm_medium ('paid' 등)
  campaign      text,                                           -- utm_campaign
  content       text,                                           -- utm_content
  referrer      text,                                           -- referrer 도메인(없으면 'direct')
  landing_path  text,                                           -- 첫 진입 경로
  created_at    timestamptz not null default now(),
  primary key (visitor_id, visit_date)
);
create index if not exists visits_date_idx on public.visits(visit_date);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.visits enable row level security;

-- 비로그인(anon) 방문자도 기록을 남기므로 INSERT 권한을 명시적으로 부여(멱등).
grant insert on public.visits to anon, authenticated;

-- 관리자 판별 헬퍼 (schema.sql 과 동일 — 이미 있으면 교체)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- insert: 비로그인(anon)·로그인(authenticated) 모두 허용.
--   단 user_id 는 비워두거나(null) 본인(auth.uid())이어야 한다.
drop policy if exists visits_insert on public.visits;
create policy visits_insert on public.visits
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- select: 관리자만 조회 가능
drop policy if exists visits_admin_read on public.visits;
create policy visits_admin_read on public.visits
  for select using (public.is_admin());

-- update/delete 정책은 두지 않는다 → RLS 기본 거부(수정·삭제 불가)
