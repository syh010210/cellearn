import { createClient } from "@supabase/supabase-js";

// Vite 환경변수. .env(.local) 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 넣는다.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// REST 직접 호출(fetch)이 필요한 경우를 위해 노출한다 (예: 접속 기록 insert 의 Prefer 헤더 명시).
export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;

// 키가 아직 없어도 앱이 죽지 않도록 방어. 키가 없으면 supabase === null.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
