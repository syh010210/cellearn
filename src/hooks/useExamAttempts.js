import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// 실전 모의고사 응시 기록 저장. useLearningData.js 와 같은 방식:
//  - 저장은 항상 localStorage 에 미러링(키: cellearn:{userId}:examAttempts) → 미로그인·오프라인·실패에도 남는다.
//  - Supabase insert 실패분은 재시도 큐(cellearn:{userId}:examPending)에 쌓아 다음 저장·flush 때 재시도.
//  - supabase 가 null(키 없음)이면 로컬만 남기고 에러 없이 진행.
// exam_attempts 는 불변(수정·삭제 없음)이라 upsert 가 아니라 insert 를 쓴다.

const hasLS = typeof localStorage !== "undefined";
const uidTag = (uid) => uid ?? "local";
const attemptsKey = (uid) => `cellearn:${uidTag(uid)}:examAttempts`;
const pendingKey = (uid) => `cellearn:${uidTag(uid)}:examPending`;

function lsGet(k) { if (!hasLS) return null; try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch { return null; } }
function lsSet(k, v) { if (!hasLS) return; try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 용량 초과 등 무시 */ } }

// snapshot → DB row(서버 저장 필드만; result 등 UI 전용 필드는 제외)
const toRow = (uid, s) => ({
  user_id: uid,
  grade: s.grade || "2급",
  seed: s.seed,
  config: s.config || {},
  problem_set: s.problem_set,
  items: s.items,
  correct: s.correct,
  total: s.total,
  elapsed_ms: s.elapsed_ms,
  overtime: !!s.overtime,
});

export function useExamAttempts() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [saveState, setSaveState] = useState(null); // null | "saving" | "saved" | "pending"

  // 실패해 큐에 쌓인 insert 재시도
  const flushPending = useCallback(async () => {
    const uid = userId;
    if (!supabase || !uid) return;
    const key = pendingKey(uid);
    const queue = lsGet(key) || [];
    if (!queue.length) return;
    const rest = [];
    for (const row of queue) { const { error } = await supabase.from("exam_attempts").insert(row); if (error) rest.push(row); }
    lsSet(key, rest);
  }, [userId]);

  // 채점 직후 호출. 반환: { ok }.
  const saveExamAttempt = useCallback(async (snapshot) => {
    const uid = userId;
    // 1) 로컬 미러(최근 50건) — 성공/실패/미로그인 무관하게 항상 남긴다.
    const mirror = lsGet(attemptsKey(uid)) || [];
    lsSet(attemptsKey(uid), [{ ...toRow(uid, snapshot), savedAt: new Date().toISOString() }, ...mirror].slice(0, 50));

    if (!supabase || !uid) { setSaveState("pending"); return { ok: false, reason: "local-only" }; }

    setSaveState("saving");
    const row = toRow(uid, snapshot);
    const { error } = await supabase.from("exam_attempts").insert(row);
    if (error) {
      const key = pendingKey(uid);
      lsSet(key, [...(lsGet(key) || []), row]); // 재시도 큐에 적재
      setSaveState("pending");
      return { ok: false, reason: error.message };
    }
    setSaveState("saved");
    return { ok: true };
  }, [userId]);

  return { saveExamAttempt, flushPending, saveState };
}
