-- =============================================================
--  컴활 실기 학습 플랫폼 — Supabase 스키마
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다.
--  (auth.users 는 Supabase가 기본 제공. 여기서는 그 위에 얹는다.)
-- =============================================================

-- ── 급수 enum ────────────────────────────────────────────────
do $$ begin
  create type grade_level as enum ('1급', '2급');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

-- ── 1) profiles : 회원 정보 (가입 시 받는 데이터) ──────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  phone         text,
  target_grade  grade_level,          -- 목표 급수
  exam_date     date,                 -- 응시 예정일
  marketing_agree boolean default false,
  terms_agree   boolean default false,
  role          text not null default 'user',   -- 'user' | 'admin'
  active_session text,                           -- 단일 세션(공유 방지): 현재 활성 기기 토큰
  created_at    timestamptz not null default now()
);

-- 기존 DB에 컬럼이 없으면 추가 (마이그레이션)
alter table public.profiles add column if not exists active_session text;

-- 단일 세션 실시간 감지를 위해 profiles를 Realtime publication에 추가 (이미 있으면 무시)
do $$ begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null; end $$;

-- ── 2) payments : 결제 원장(포트원 결제 기록) ──────────────────
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  grade         grade_level not null,
  amount        integer not null,               -- 결제 금액(원)
  status        payment_status not null default 'pending',
  provider      text not null default 'portone',
  payment_id    text,                           -- 포트원 paymentId
  tx_id         text,                           -- PG 거래번호
  raw           jsonb,                          -- 검증 응답 원본
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id);

-- ── 3) enrollments : 수강권(급수별 기간제 — 프로모션: 올해 말까지) ───────────────
create table if not exists public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  grade         grade_level not null,
  payment_id    uuid references public.payments(id) on delete set null,
  valid_from    timestamptz not null default now(),
  valid_to      timestamptz not null,           -- 결제 검증 시 구매 연도 12/31(KST)로 세팅
  created_at    timestamptz not null default now()
);
create index if not exists enrollments_user_idx on public.enrollments(user_id);

-- 활성 수강권 여부를 앱에서 쉽게 조회하는 뷰
create or replace view public.active_enrollments as
  select * from public.enrollments where valid_to > now();

-- ── 4) progress : 차시별 진도 ──────────────────────────────────
create table if not exists public.progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  lesson_id   integer not null,
  done        boolean not null default false,
  score       integer,
  updated_at  timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ── 4-1) day_clears : 일차 마무리 시험 통과 기록(일차 게이팅) ────
create table if not exists public.day_clears (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         integer not null,
  cleared_at  timestamptz not null default now(),
  primary key (user_id, day)
);

-- ── 5) wrong_notes : 오답노트(퀴즈/실습) ───────────────────────
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

-- =============================================================
--  가입 시 profiles 자동 생성 트리거
--  회원가입할 때 프론트가 넘긴 user_metadata 를 profiles 로 복사
-- =============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, phone, target_grade, exam_date, marketing_agree, terms_agree)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'target_grade')::grade_level,
    (new.raw_user_meta_data->>'exam_date')::date,
    coalesce((new.raw_user_meta_data->>'marketing_agree')::boolean, false),
    coalesce((new.raw_user_meta_data->>'terms_agree')::boolean, false)
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
--  RLS(Row Level Security) — "본인 데이터만" DB 레벨에서 강제
-- =============================================================
alter table public.profiles    enable row level security;
alter table public.payments    enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress    enable row level security;
alter table public.wrong_notes enable row level security;
alter table public.day_clears  enable row level security;

-- 관리자 판별 헬퍼
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles: 본인 조회/수정, 관리자 전체 조회
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id);

-- payments / enrollments: 본인 것만 조회. 쓰기는 서버(Edge Function, service_role)만.
drop policy if exists payments_self on public.payments;
create policy payments_self on public.payments
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists enrollments_self on public.enrollments;
create policy enrollments_self on public.enrollments
  for select using (auth.uid() = user_id or public.is_admin());

-- progress / wrong_notes: 본인 것 CRUD
drop policy if exists progress_self on public.progress;
create policy progress_self on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists wrong_self on public.wrong_notes;
create policy wrong_self on public.wrong_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 관리자 전체 조회(진도/오답노트) — 관리자 페이지에서 사용자 진도 확인용
drop policy if exists progress_admin_read on public.progress;
create policy progress_admin_read on public.progress
  for select using (public.is_admin());
drop policy if exists wrong_admin_read on public.wrong_notes;
create policy wrong_admin_read on public.wrong_notes
  for select using (public.is_admin());

-- day_clears: 본인 CRUD + 관리자 전체 조회
drop policy if exists day_clears_self on public.day_clears;
create policy day_clears_self on public.day_clears
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists day_clears_admin_read on public.day_clears;
create policy day_clears_admin_read on public.day_clears
  for select using (public.is_admin());

-- 관리자 지정(가입 후 1회 실행): 아래 이메일을 본인 관리자 계정으로 바꾼다.
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
