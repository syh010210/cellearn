import { useState, useEffect, useCallback } from "react";
import { userKey } from "../lib/userScope";

// 차시 내 학습 흐름(개념 통과 · 실습 완료) 상태.
// 이번 단계에선 localStorage 만 사용한다(서버 동기화는 별도 단계). useLearningData 패턴을 따르되 저장은 로컬만.
// 키: cellearn:{uid}:lesson:{id}:flow = { concepts: { [conceptIdx]: { passed, revealed } }, practiceDone, updatedAt }
// 로그인 전(uid 없음)에는 userKey 가 null → 읽지도 쓰지도 않는다.
const keyOf = (id) => (id == null ? null : userKey(`lesson:${id}:flow`));
const empty = () => ({ concepts: {}, practiceDone: false, updatedAt: 0 });

function load(id) {
  const k = keyOf(id);
  if (!k) return empty();
  try { const s = localStorage.getItem(k); if (s) return { ...empty(), ...JSON.parse(s) }; } catch { /* 무시 */ }
  return empty();
}

export function useLessonFlow(lessonId, uid) {
  const [flow, setFlow] = useState(() => load(lessonId));
  // 차시 또는 계정(uid)이 바뀌면 그 조합의 저장본으로 교체
  useEffect(() => { setFlow(load(lessonId)); }, [lessonId, uid]);

  const persist = useCallback((next) => {
    const k = keyOf(lessonId);
    if (k) { try { localStorage.setItem(k, JSON.stringify(next)); } catch { /* 무시 */ } }
    return next;
  }, [lessonId, uid]);

  // 개념 통과 기록. revealed=true 면 '정답 보기' 경로로 넘어간 것(오답노트 신호로 나중에 사용).
  const setConceptPassed = useCallback((idx, opts = {}) => {
    const revealed = !!opts.revealed;
    setFlow((prev) => {
      const cur = prev.concepts[idx] || {};
      if (cur.passed && (cur.revealed || !revealed)) return prev; // 변화 없음
      return persist({ ...prev, concepts: { ...prev.concepts, [idx]: { passed: true, revealed: !!cur.revealed || revealed } }, updatedAt: Date.now() });
    });
  }, [persist]);

  const setPracticeDone = useCallback(() => {
    setFlow((prev) => (prev.practiceDone ? prev : persist({ ...prev, practiceDone: true, updatedAt: Date.now() })));
  }, [persist]);

  return { flow, setConceptPassed, setPracticeDone };
}

// 개념 전부 통과 여부
export function allConceptsPassed(lesson, flow) {
  if (!lesson) return false;
  return lesson.concepts.every((_, i) => flow?.concepts?.[i]?.passed);
}
