-- =============================================================
--  수강권 부여 — 특정 계정에 2급 수강권을 "오늘부터 1년" 부여 (멱등)
--
--  ⚠ 이 파일은 SQL Editor 에서 "사람이" 직접 실행한다. (에이전트는 실행하지 않는다.)
--  · enrollments 에만 쓴다. payments 에는 아무것도 넣지 않는다(무료/수동 부여).
--  · 이미 2급 수강권 행이 있으면 기간만 오늘~1년으로 갱신한다(재실행해도 행이 늘지 않음 = 멱등).
--  · 앱의 "수강 가능" 판정은 enrollments 에 valid_to > now() 행이 1개 이상 있으면 성립한다
--    (AuthContext.jsx:29,147 / App.jsx:51). role·payments 는 필요 없다.
--  · 부여 후 해당 계정은 재로그인 또는 새로고침해야 AuthContext 가 enrollments 를 다시 읽는다.
-- =============================================================

-- ── 대상 계정 : 아래 한 줄의 이메일만 바꾼다 ──
drop table if exists _grant_target;
create temporary table _grant_target as
  select id as user_id
  from auth.users
  where email = 'CHANGE_ME@example.com';

-- 대상 확인 (정확히 1행이어야 함)
select u.email, t.user_id
from _grant_target t
join auth.users u on u.id = t.user_id;

-- ── 부여 전 상태 ──
select id, grade, valid_from, valid_to, (valid_to > now()) as active
from public.enrollments
where user_id in (select user_id from _grant_target)
  and grade = '2급'::grade_level
order by valid_to desc;

-- ── 부여 : 기존 2급 행이 있으면 기간 갱신, 없으면 삽입 (멱등) ──
with upd as (
  update public.enrollments e
     set valid_from = now(),
         valid_to   = now() + interval '1 year'
   where e.user_id in (select user_id from _grant_target)
     and e.grade = '2급'::grade_level
  returning e.id
)
insert into public.enrollments (user_id, grade, valid_from, valid_to)
select t.user_id, '2급'::grade_level, now(), now() + interval '1 year'
from _grant_target t
where not exists (select 1 from upd);   -- 갱신된 행이 없을 때(=신규)만 삽입

-- ── 부여 후 상태 (active = true 여야 함) ──
select id, grade, valid_from, valid_to, (valid_to > now()) as active
from public.enrollments
where user_id in (select user_id from _grant_target)
  and grade = '2급'::grade_level
order by valid_to desc;

drop table if exists _grant_target;
