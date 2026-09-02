import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

// 단일 세션(공유 방지): 로그인 시 이 기기의 랜덤 토큰을 profiles.active_session에 기록하고
// 로컬에도 저장. 다른 기기가 로그인하면 값이 바뀌므로, 불일치가 감지되면 이 기기는 로그아웃한다.
const SESSION_KEY = "cl_active_session";
const newToken = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // 로그인 후 profiles·수강권 조회가 끝났는지 — 결제화면 깜빡임(레이스) 방지용
  const [dataReady, setDataReady] = useState(!isSupabaseConfigured);

  // 로그인한 사용자의 profiles + 활성 수강권 로드
  const loadUserData = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      setEnrollments([]);
      setDataReady(true);
      return;
    }
    const [{ data: prof }, { data: enr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("enrollments").select("*").gt("valid_to", new Date().toISOString()),
    ]);
    // 단일 세션 체크: DB의 active_session이 이 기기 토큰과 다르면 다른 기기가 로그인한 것 → 로그아웃
    const localTok = localStorage.getItem(SESSION_KEY);
    if (prof?.active_session && localTok && prof.active_session !== localTok) {
      await supabase.auth.signOut();
      return; // profile/enrollment 세팅하지 않음 (onAuthStateChange가 상태 정리)
    }
    setProfile(prof ?? null);
    setEnrollments(enr ?? []);
    setDataReady(true);
  }, []);

  // 이 기기를 활성 세션으로 등록 (명시적 로그인 성공 시에만 호출)
  const claimSession = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    const token = newToken();
    localStorage.setItem(SESSION_KEY, token);
    await supabase.from("profiles").update({ active_session: token }).eq("id", userId);
  }, []);

  // 페이지 로드 시 검사: DB active_session이 이 기기 토큰과 다르면 다른 기기가 로그인한 것 → 로그아웃
  const enforceSingleSession = useCallback(async (userId) => {
    if (!supabase || !userId) return true;
    const { data } = await supabase.from("profiles").select("active_session").eq("id", userId).single();
    const local = localStorage.getItem(SESSION_KEY);
    if (data?.active_session && local && data.active_session !== local) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        // 마운트 시 단일 세션 검사 — 다른 기기에 밀렸으면 여기서 로그아웃됨
        const ok = await enforceSingleSession(data.session.user.id);
        if (ok) await loadUserData(data.session.user.id);
        else setDataReady(true);
      } else setDataReady(true);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      setSession(sess);
      if (sess?.user) { setDataReady(false); await loadUserData(sess.user.id); }
      else { setProfile(null); setEnrollments([]); setDataReady(true); }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserData, enforceSingleSession]);

  // 실시간 단일 세션 감지: 다른 기기가 로그인해 active_session이 바뀌면 즉시 로그아웃
  // (profiles 테이블 Realtime 활성화 필요. 미활성 시 마운트 검사로 폴백)
  useEffect(() => {
    const uid = session?.user?.id;
    if (!supabase || !uid) return;
    const ch = supabase
      .channel(`session-${uid}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` }, (payload) => {
        const remote = payload.new?.active_session;
        const local = localStorage.getItem(SESSION_KEY);
        if (remote && local && remote !== local) supabase.auth.signOut();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session?.user?.id]);

  const signUp = useCallback(async ({ email, password, name, phone, targetGrade, examDate, marketingAgree, termsAgree }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, phone,
          target_grade: targetGrade,
          exam_date: examDate || null,
          marketing_agree: !!marketingAgree,
          terms_agree: !!termsAgree,
        },
      },
    });
    // 이메일 인증 off라 즉시 세션이 나온 경우 이 기기를 활성 세션으로 등록
    if (!res.error && res.data?.session && res.data?.user) await claimSession(res.data.user.id);
    return res;
  }, [claimSession]);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data?.user) await claimSession(res.data.user.id);
    return res;
  }, [claimSession]);

  // 이메일로 받은 6자리 코드로 가입 인증 → 성공 시 세션 발급(즉시 로그인)
  const verifySignupOtp = useCallback(async ({ email, token }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    const res = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "signup" });
    if (!res.error && res.data?.user) await claimSession(res.data.user.id);
    return res;
  }, [claimSession]);

  // 가입 인증 코드 재발송
  const resendSignupOtp = useCallback(async ({ email }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    return supabase.auth.resend({ type: "signup", email });
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null); setProfile(null); setEnrollments([]);
  }, []);

  const user = session?.user ?? null;
  const isAuthed = !!user;
  const isAdmin = profile?.role === "admin";
  const hasActiveEnrollment = (enrollments?.length ?? 0) > 0;
  const enrolledGrade = enrollments?.[0]?.grade ?? null;

  const value = {
    loading, dataReady, isSupabaseConfigured,
    user, session, profile, enrollments,
    isAuthed, isAdmin, hasActiveEnrollment, enrolledGrade,
    signUp, signIn, signOut, verifySignupOtp, resendSignupOtp,
    // 결제 직후처럼 세션이 방금 생긴 경우에도 확실히 반영되도록 현재 세션에서 user를 다시 조회
    refresh: async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (data?.user) await loadUserData(data.user.id);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
