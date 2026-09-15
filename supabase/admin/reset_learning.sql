-- =============================================================
--  학습 데이터 초기화 — 특정 계정의 진도/일차/오답/응시 기록만 삭제
--
--  ⚠ 이 파일은 SQL Editor 에서 "사람이" 직접 실행한다. (에이전트는 실행하지 않는다.)
--  ⚠ 실행 전, 해당 계정으로 로그인했던 브라우저의 localStorage 를 먼저 지울 것:
--        cellearn:*   ·   lesson:*   ·   tutorial:*
--     (useLearningData 가 진도/오답을 localStorage 에 미러링하고 실패 시 재시도 큐로
--      다시 올린다. 로컬 미러가 남아 있으면 새로고침 때 서버로 재업로드되어 초기화가 되돌아온다.
--      lesson:{id}:flow · tutorial:miniexcel:* 는 서버에 없고 로컬에만 있으므로 반드시 로컬에서 지운다.)
--
--  삭제 대상 : progress · day_clears · wrong_notes · exam_attempts  (이 계정 행만)
--  보존      : profiles · payments · enrollments  (건드리지 않음)
-- =============================================================

-- ── 대상 계정 : 아래 한 줄의 이메일만 바꾼다 ──
drop table if exists _reset_target;
create temporary table _reset_target as
  select id as user_id
  from auth.users
  where email = 'CHANGE_ME@example.com';

-- 대상 확인 (정확히 1행이어야 함. 0행이면 이메일 오타 → 아래 삭제는 모두 no-op 이라 안전)
select u.email, t.user_id
from _reset_target t
join auth.users u on u.id = t.user_id;

-- ── 삭제 전 행 수 ──
select 'progress'      as tbl, count(*) as before_rows from public.progress      where user_id in (select user_id from _reset_target)
union all
select 'day_clears'    as tbl, count(*)                from public.day_clears     where user_id in (select user_id from _reset_target)
union all
select 'wrong_notes'   as tbl, count(*)                from public.wrong_notes    where user_id in (select user_id from _reset_target)
union all
select 'exam_attempts' as tbl, count(*)                from public.exam_attempts  where user_id in (select user_id from _reset_target)
order by tbl;

-- ── 삭제 (이 계정 행만) ──
delete from public.progress      where user_id in (select user_id from _reset_target);
delete from public.day_clears    where user_id in (select user_id from _reset_target);
delete from public.wrong_notes   where user_id in (select user_id from _reset_target);
delete from public.exam_attempts where user_id in (select user_id from _reset_target);

-- ── 삭제 후 행 수 (모두 0 이어야 함) ──
select 'progress'      as tbl, count(*) as after_rows from public.progress      where user_id in (select user_id from _reset_target)
union all
select 'day_clears'    as tbl, count(*)               from public.day_clears     where user_id in (select user_id from _reset_target)
union all
select 'wrong_notes'   as tbl, count(*)               from public.wrong_notes    where user_id in (select user_id from _reset_target)
union all
select 'exam_attempts' as tbl, count(*)               from public.exam_attempts  where user_id in (select user_id from _reset_target)
order by tbl;

drop table if exists _reset_target;
