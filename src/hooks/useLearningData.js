import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// 진도/오답을 계정(Supabase)에 저장·복원한다.
// - 로그인 시: DB에서 불러와 state 초기화
// - 변경 시: state 갱신 + DB upsert (실패해도 UI는 유지)
// - Supabase 미설정/비로그인: 메모리 상태로만 동작(기존과 동일)
export function useLearningData() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [progress, setProgress] = useState({});
  const [quizWrongMap, setQuizWrongMap] = useState({});
  const [practiceWrongMap, setPracticeWrongMap] = useState({});
  const [dayClears, setDayClears] = useState({}); // { [day]: true }

  // 로그인/로그아웃에 따라 로드 또는 초기화
  useEffect(() => {
    if (!supabase || !userId) {
      setProgress({}); setQuizWrongMap({}); setPracticeWrongMap({}); setDayClears({});
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: prog }, { data: notes }, { data: clears }] = await Promise.all([
        supabase.from("progress").select("lesson_id, done, score").eq("user_id", userId),
        supabase.from("wrong_notes").select("lesson_id, kind, payload").eq("user_id", userId),
        supabase.from("day_clears").select("day").eq("user_id", userId),
      ]);
      if (cancelled) return;
      const p = {};
      (prog ?? []).forEach((r) => { p[r.lesson_id] = { done: r.done, score: r.score }; });
      const qw = {}, pw = {};
      (notes ?? []).forEach((r) => {
        if (r.kind === "quiz") qw[r.lesson_id] = r.payload ?? [];
        else if (r.kind === "practice") pw[r.lesson_id] = r.payload ?? [];
      });
      const dc = {};
      (clears ?? []).forEach((r) => { dc[r.day] = true; });
      setProgress(p); setQuizWrongMap(qw); setPracticeWrongMap(pw); setDayClears(dc);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const upsertWrong = useCallback((lid, kind, payload) => {
    if (!supabase || !userId) return;
    supabase
      .from("wrong_notes")
      .upsert(
        { user_id: userId, lesson_id: lid, kind, payload, updated_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id,kind" },
      )
      .then(({ error }) => { if (error) console.error(`오답 저장 실패(${kind}):`, error.message); });
  }, [userId]);

  const saveQuizWrong = useCallback((lid, ids) => {
    setQuizWrongMap((m) => ({ ...m, [lid]: ids }));
    upsertWrong(lid, "quiz", ids);
  }, [upsertWrong]);

  const savePracticeWrong = useCallback((lid, items) => {
    setPracticeWrongMap((m) => ({ ...m, [lid]: items }));
    upsertWrong(lid, "practice", items);
  }, [upsertWrong]);

  const completeLesson = useCallback((lid, score) => {
    setProgress((p) => ({ ...p, [lid]: { done: true, score } }));
    if (supabase && userId) {
      supabase
        .from("progress")
        .upsert(
          { user_id: userId, lesson_id: lid, done: true, score, updated_at: new Date().toISOString() },
          { onConflict: "user_id,lesson_id" },
        )
        .then(({ error }) => { if (error) console.error("진도 저장 실패:", error.message); });
    }
  }, [userId]);

  // 일차 마무리 시험 통과 → 다음 일차 잠금 해제
  const clearDay = useCallback((day) => {
    setDayClears((m) => ({ ...m, [day]: true }));
    if (supabase && userId) {
      supabase
        .from("day_clears")
        .upsert(
          { user_id: userId, day, cleared_at: new Date().toISOString() },
          { onConflict: "user_id,day" },
        )
        .then(({ error }) => { if (error) console.error("일차 클리어 저장 실패:", error.message); });
    }
  }, [userId]);

  return { progress, quizWrongMap, practiceWrongMap, dayClears, saveQuizWrong, savePracticeWrong, completeLesson, clearDay };
}
