-- SQL Editor에서 사람이 실행. supabase db push 사용 금지.
-- =============================================================
--  마이그레이션: 개념 진행 상황(차시 내 흐름)을 progress 에 저장
--   concepts     — { "개념idx": { passed:bool, revealed:bool } } (개념 단위 통과)
--   practice_done — 실습 업로드 채점 1회 이상 완료 여부
--  멱등(idempotent). 기존 행은 건드리지 않는다(기본값으로 채워짐).
--  RLS: progress 는 기존 정책(progress_self 본인 CRUD, progress_admin_read 관리자 읽기) 그대로 사용 → 추가 없음.
-- =============================================================
alter table if exists public.progress
  add column if not exists concepts jsonb not null default '{}'::jsonb,
  add column if not exists practice_done boolean not null default false;
