-- =============================================================
--  진단용 조회 — 오답노트/일차 클리어 저장 문제 점검
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행한다. (읽기 전용, 아무것도 바꾸지 않음)
--  대상 테이블: wrong_notes · day_clears · progress
-- =============================================================

-- ── 1) 테이블 존재 · RLS 활성 · 정책 목록 ────────────────────
--  exists       = 테이블 존재 여부
--  rls_enabled  = Row Level Security 켜짐 여부
--  policy_count = 정책 개수 / policies = "정책명 (명령)" 목록
select
  t.tbl                                                as "table",
  (to_regclass('public.' || t.tbl) is not null)        as exists,
  coalesce(c.relrowsecurity, false)                    as rls_enabled,
  coalesce(p.cnt, 0)                                   as policy_count,
  coalesce(p.names, '(없음)')                          as policies
from (values ('wrong_notes'), ('day_clears'), ('progress')) as t(tbl)
left join pg_class c
  on c.oid = to_regclass('public.' || t.tbl)
left join lateral (
  select
    count(*)                                                              as cnt,
    string_agg(policyname || ' (' || cmd || ')', ', ' order by policyname) as names
  from pg_policies
  where schemaname = 'public' and tablename = t.tbl
) p on true
order by t.tbl;

-- ── 2) 행 수 (전체) — 테이블이 없으면 "(테이블 없음)" 으로 표시하고 에러 없이 넘어감 ──
--  결과는 SQL Editor 하단 "Messages" 탭의 NOTICE 로 출력된다.
--  SQL Editor 세션에는 로그인 JWT 가 없어 auth.uid() = NULL 이므로 전체 행 수를 센다.
do $$
declare
  tbl text;
  n   bigint;
begin
  foreach tbl in array array['wrong_notes', 'day_clears', 'progress'] loop
    if to_regclass('public.' || tbl) is null then
      raise notice '% : (테이블 없음)', tbl;
    else
      execute format('select count(*) from public.%I', tbl) into n;
      raise notice '% : 전체 % 행', tbl, n;
    end if;
  end loop;
  raise notice 'auth.uid() = %  (SQL Editor 에서는 보통 NULL — 사용자별 확인은 아래 3) 쿼리 사용)', auth.uid();
end $$;

-- ── 3) 사용자별 행 수 (테이블이 존재할 때만 개별 실행) ──────────
--  특정 계정에 실제 데이터가 쌓였는지 확인용. 테이블이 없으면 에러가 나므로,
--  1) 결과에서 exists=true 인 테이블에 대해서만 아래 해당 줄을 실행한다.
-- select user_id, count(*) as rows from public.wrong_notes group by user_id order by rows desc limit 20;
-- select user_id, count(*) as rows from public.day_clears  group by user_id order by rows desc limit 20;
-- select user_id, count(*) as rows from public.progress    group by user_id order by rows desc limit 20;

-- 특정 이메일 계정의 저장 현황을 한 번에 보고 싶으면 (이메일만 바꿔서 실행):
-- with u as (select id from auth.users where email = 'someone@example.com')
-- select 'progress'    as kind, count(*) from public.progress    where user_id in (select id from u)
-- union all select 'wrong_notes', count(*) from public.wrong_notes where user_id in (select id from u)
-- union all select 'day_clears',  count(*) from public.day_clears  where user_id in (select id from u);
