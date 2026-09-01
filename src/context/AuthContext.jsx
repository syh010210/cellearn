import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // 로그인한 사용자의 profiles + 활성 수강권 로드
  const loadUserData = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      setEnrollments(null === userId ? [] : []);
      return;
    }
    const [{ data: prof }, { data: enr }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("enrollments").select("*").gt("valid_to", new Date().toISOString()),
    ]);
    setProfile(prof ?? null);
    setEnrollments(enr ?? []);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadUserData(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, sess) => {
      setSession(sess);
      if (sess?.user) await loadUserData(sess.user.id);
      else { setProfile(null); setEnrollments([]); }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserData]);

  const signUp = useCallback(async ({ email, password, name, phone, targetGrade, examDate, marketingAgree, termsAgree }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    return supabase.auth.signUp({
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
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: new Error("Supabase 미설정") };
    return supabase.auth.signInWithPassword({ email, password });
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
    loading, isSupabaseConfigured,
    user, session, profile, enrollments,
    isAuthed, isAdmin, hasActiveEnrollment, enrolledGrade,
    signUp, signIn, signOut,
    refresh: () => user && loadUserData(user.id),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
