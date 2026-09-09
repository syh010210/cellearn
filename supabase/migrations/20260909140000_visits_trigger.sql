-- =============================================================
--  마이그레이션: visits — user_id 를 트리거로 채우고 insert 정책 단순화
--  (PostgREST 경로에서 anon insert 가 실패하던 문제 해결)
--  user_id 는 클라이언트가 보내지 않고, insert 시 트리거가 auth.uid()로 채운다.
--  insert 정책은 with check (true) 로 단순화(선택 정책은 그대로 관리자만).
--  ※ 이미 라이브에 적용됨. SQL Editor 에서 실행하는 멱등 SQL.
-- =============================================================

create or replace function public.visits_set_user_id()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  return new;
end $$;

drop trigger if exists visits_set_user_id on public.visits;
create trigger visits_set_user_id before insert on public.visits
  for each row execute function public.visits_set_user_id();

drop policy if exists visits_insert on public.visits;
create policy visits_insert on public.visits
  for insert to anon, authenticated with check (true);
