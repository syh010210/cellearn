import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// 진도/오답을 계정(Supabase)에 저장·복원한다.
// - 저장은 항상 localStorage 에도 미러링한다(키: cellearn:{userId}:{맵이름}).
//   → Supabase 저장이 실패하거나 미설정이어도 새로고침 시 기록이 남는다.
// - 로드 시 Supabase 결과가 비어 있고 localStorage 에 값이 있으면 그 값을 쓰고
//   Supabase 에 다시 upsert 를 시도한다(진도/오답이 조용히 사라지지 않게).
// - upsert 실패는 localStorage 큐(cellearn:{userId}:pending)에 쌓아 다음 로드·저장 시 재시도.
// - 실패가 3회 이상 누적되면 saveError=true 로 알려 화면 상단 배너를 띄운다.

const MAP = { progress: "progress", quiz: "quizWrongMap", practice: "practiceWrongMap", clears: "dayClears", flow: "lessonFlow" };

// 차시 흐름(개념 통과·실습 완료) 병합: 통과 개념은 합집합, revealed 는 OR, practiceDone 은 OR.
const emptyFlow = () => ({ concepts: {}, practiceDone: false });
function mergeConcepts(a = {}, b = {}) {
  const out = {};
  for (const idx of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[idx] = { passed: !!(a[idx]?.passed || b[idx]?.passed), revealed: !!(a[idx]?.revealed || b[idx]?.revealed) };
  }
  return out;
}
function mergeFlow(a, b) {
  const x = a || emptyFlow(), y = b || emptyFlow();
  return { concepts: mergeConcepts(x.concepts, y.concepts), practiceDone: !!(x.practiceDone || y.practiceDone) };
}
// 구형식 per-lesson 키(cellearn:{uid}:lesson:{id}:flow) 를 훑어 {lid:{concepts,practiceDone}} 로 모은다.
function scanOldFlow(uid) {
  const out = {};
  if (!hasLS) return out;
  const prefix = `cellearn:${uid ?? "local"}:lesson:`;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(prefix) || !k.endsWith(":flow")) continue;
      const lid = k.slice(prefix.length, -":flow".length);
      const v = JSON.parse(localStorage.getItem(k) || "null");
      if (v) out[lid] = { concepts: v.concepts || {}, practiceDone: !!v.practiceDone };
    }
  } catch { /* 무시 */ }
  return out;
}

const hasLS = typeof localStorage !== "undefined";
const uidTag = (uid) => uid ?? "local";
const keyOf = (uid, name) => `cellearn:${uidTag(uid)}:${name}`;
const pendingKey = (uid) => `cellearn:${uidTag(uid)}:pending`;
const isEmpty = (o) => !o || Object.keys(o).length === 0;

function lsGet(uid, name) {
  if (!hasLS) return null;
  try { const s = localStorage.getItem(keyOf(uid, name)); return s ? JSON.parse(s) : null; }
  catch { return null; }
}
function lsSet(uid, name, value) {
  if (!hasLS) return;
  try { localStorage.setItem(keyOf(uid, name), JSON.stringify(value)); } catch { /* 용량 초과 등 무시 */ }
}
function loadPending(uid) {
  if (!hasLS) return [];
  try { const s = localStorage.getItem(pendingKey(uid)); return s ? JSON.parse(s) : []; } catch { return []; }
}
function savePending(uid, arr) {
  if (!hasLS) return;
  try { localStorage.setItem(pendingKey(uid), JSON.stringify(arr)); } catch { /* 무시 */ }
}
// 같은 key 는 최신 것으로 대체(차시·종류당 1건)
function enqueue(uid, desc) { savePending(uid, [...loadPending(uid).filter((e) => e.key !== desc.key), desc]); }
function dequeue(uid, key) { savePending(uid, loadPending(uid).filter((e) => e.key !== key)); }

// upsert 서술자(descriptor) — 재시도 큐에도 그대로 저장된다.
const nowIso = () => new Date().toISOString();
const descProgress = (uid, lid, done, score) => ({ key: `progress:${lid}`, table: "progress", onConflict: "user_id,lesson_id", row: { user_id: uid, lesson_id: Number(lid), done, score, updated_at: nowIso() } });
const descWrong = (uid, lid, kind, payload) => ({ key: `${kind}:${lid}`, table: "wrong_notes", onConflict: "user_id,lesson_id,kind", row: { user_id: uid, lesson_id: Number(lid), kind, payload, updated_at: nowIso() } });
// cleared_at 은 서버가 생성(default now()) → 클라이언트는 보내지 않는다.
const descClear = (uid, day) => ({ key: `day:${day}`, table: "day_clears", onConflict: "user_id,day", row: { user_id: uid, day: Number(day) } });
// 개념 흐름 저장 — progress 의 concepts·practice_done 만 담는다(done·score 는 건드리지 않음).
const descFlow = (uid, lid, concepts, practiceDone) => ({ key: `flow:${lid}`, table: "progress", onConflict: "user_id,lesson_id", row: { user_id: uid, lesson_id: Number(lid), concepts, practice_done: !!practiceDone, updated_at: nowIso() } });

export function useLearningData() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // 이벤트 핸들러/비동기 콜백에서 최신 userId 를 읽기 위한 미러 ref.
  // (렌더 중 직접 대입하지 않고 아래 effect 에서 갱신 — 사용자 전환 시 로드 effect 보다 먼저 갱신되도록 먼저 선언)
  const userIdRef = useRef(userId);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  const [progress, setProgressState] = useState({});
  const [quizWrongMap, setQuizWrongState] = useState({});
  const [practiceWrongMap, setPracticeWrongState] = useState({});
  const [dayClears, setDayClearsState] = useState({});
  const [lessonFlow, setLessonFlowState] = useState({}); // { lessonId: { concepts, practiceDone } }
  const [saveError, setSaveError] = useState(false);

  // 최신 맵을 동기적으로 읽어 next 를 계산하기 위한 미러 ref
  const progressRef = useRef({}), quizRef = useRef({}), practiceRef = useRef({}), clearsRef = useRef({}), flowRef = useRef({});
  const failuresRef = useRef(0);

  const bumpFailure = useCallback(() => {
    failuresRef.current += 1;
    if (failuresRef.current >= 3) setSaveError(true);
  }, []);

  // 상태 + ref + localStorage 를 한 번에 갱신
  const applyProgress = useCallback((v) => { progressRef.current = v; setProgressState(v); lsSet(userIdRef.current, MAP.progress, v); }, []);
  const applyQuiz = useCallback((v) => { quizRef.current = v; setQuizWrongState(v); lsSet(userIdRef.current, MAP.quiz, v); }, []);
  const applyPractice = useCallback((v) => { practiceRef.current = v; setPracticeWrongState(v); lsSet(userIdRef.current, MAP.practice, v); }, []);
  const applyClears = useCallback((v) => { clearsRef.current = v; setDayClearsState(v); lsSet(userIdRef.current, MAP.clears, v); }, []);
  const applyFlow = useCallback((v) => { flowRef.current = v; setLessonFlowState(v); lsSet(userIdRef.current, MAP.flow, v); }, []);

  // Supabase upsert 시도. 실패하면 큐에 넣고 실패 카운트 증가, 성공하면 해당 큐 제거.
  const trySync = useCallback(async (desc) => {
    const uid = userIdRef.current;
    if (!supabase || !uid) return;
    const { error } = await supabase.from(desc.table).upsert(desc.row, { onConflict: desc.onConflict });
    if (error) {
      console.error(`동기화 실패(${desc.table}):`, error.message);
      enqueue(uid, desc);
      bumpFailure();
    } else {
      dequeue(uid, desc.key);
    }
  }, [bumpFailure]);

  // 대기 큐 재시도
  const flushPending = useCallback(async () => {
    const uid = userIdRef.current;
    if (!supabase || !uid) return;
    for (const desc of loadPending(uid)) {
      const { error } = await supabase.from(desc.table).upsert(desc.row, { onConflict: desc.onConflict });
      if (error) { console.error(`재시도 실패(${desc.table}):`, error.message); bumpFailure(); }
      else dequeue(uid, desc.key);
    }
  }, [bumpFailure]);

  // 로그인/로그아웃에 따라 로드 또는 초기화
  useEffect(() => {
    const uid = userId;
    failuresRef.current = 0;
    setSaveError(false);

    // 1) localStorage 우선 하이드레이션(빠른 복원 · 오프라인 · 미로그인 fallback)
    const lsP = lsGet(uid, MAP.progress) || {};
    const lsQ = lsGet(uid, MAP.quiz) || {};
    const lsPr = lsGet(uid, MAP.practice) || {};
    const lsC = lsGet(uid, MAP.clears) || {};
    const lsF = lsGet(uid, MAP.flow) || {};
    applyProgress(lsP); applyQuiz(lsQ); applyPractice(lsPr); applyClears(lsC); applyFlow(lsF);

    if (!supabase || !uid) return;

    // 2) Supabase 로드 → 비어 있으면 localStorage 값을 쓰고 재-upsert
    let cancelled = false;
    (async () => {
      const [{ data: prog }, { data: notes }, { data: clears }] = await Promise.all([
        supabase.from("progress").select("lesson_id, done, score, concepts, practice_done").eq("user_id", uid),
        supabase.from("wrong_notes").select("lesson_id, kind, payload").eq("user_id", uid),
        supabase.from("day_clears").select("day, cleared_at").eq("user_id", uid),
      ]);
      if (cancelled) return;

      const p = {}, fmDb = {};
      (prog ?? []).forEach((r) => {
        p[r.lesson_id] = { done: r.done, score: r.score };
        fmDb[r.lesson_id] = { concepts: r.concepts || {}, practiceDone: !!r.practice_done };
      });
      const qw = {}, pw = {};
      (notes ?? []).forEach((r) => {
        if (r.kind === "quiz") qw[r.lesson_id] = r.payload ?? [];
        else if (r.kind === "practice") pw[r.lesson_id] = r.payload ?? [];
      });
      const dc = {};
      (clears ?? []).forEach((r) => { dc[r.day] = r.cleared_at || true; }); // 날짜 잠금 판정용 cleared_at 보존(없으면 true=구형식)

      // 진도
      if (!isEmpty(p)) applyProgress(p);
      else if (!isEmpty(lsP)) Object.keys(lsP).forEach((lid) => trySync(descProgress(uid, lid, lsP[lid].done, lsP[lid].score)));
      // 퀴즈 오답
      if (!isEmpty(qw)) applyQuiz(qw);
      else if (!isEmpty(lsQ)) Object.keys(lsQ).forEach((lid) => trySync(descWrong(uid, lid, "quiz", lsQ[lid])));
      // 실습 오답
      if (!isEmpty(pw)) applyPractice(pw);
      else if (!isEmpty(lsPr)) Object.keys(lsPr).forEach((lid) => trySync(descWrong(uid, lid, "practice", lsPr[lid])));
      // 일차 클리어
      if (!isEmpty(dc)) applyClears(dc);
      else if (!isEmpty(lsC)) Object.keys(lsC).forEach((day) => { if (lsC[day]) trySync(descClear(uid, day)); });

      // 개념 흐름: DB + 로컬(통합 미러 + 구형식 per-lesson 키) 병합(더 많이 진행된 쪽). 앞선 차시는 DB로 이관.
      const merged = { ...fmDb };
      const localAll = { ...scanOldFlow(uid) };
      for (const [lid, v] of Object.entries(lsF)) localAll[lid] = mergeFlow(localAll[lid], v);
      for (const [lid, lv] of Object.entries(localAll)) merged[lid] = mergeFlow(fmDb[lid], lv);
      applyFlow(merged);
      for (const [lid, mv] of Object.entries(merged)) {
        const dbv = fmDb[lid];
        if (JSON.stringify(mv) !== JSON.stringify(dbv || emptyFlow())) trySync(descFlow(uid, lid, mv.concepts, mv.practiceDone));
      }

      // 3) 이전에 실패했던 저장분 재시도
      await flushPending();
    })();
    return () => { cancelled = true; };
  }, [userId, applyProgress, applyQuiz, applyPractice, applyClears, applyFlow, trySync, flushPending]);

  const saveQuizWrong = useCallback((lid, ids) => {
    const next = { ...quizRef.current, [lid]: ids };
    applyQuiz(next);
    trySync(descWrong(userIdRef.current, lid, "quiz", ids));
  }, [applyQuiz, trySync]);

  // 오답 항목 고유 키 (업로드 채점 vs 미니 엑셀 채점 구분)
  const wrongKey = (it) => `${it.source || "upload"}:${it.conceptIdx ?? ""}:${it.practiceIdx ?? ""}:${it.cell}:${it.sheet || ""}`;

  // 업로드 채점: source 'mini' 항목은 보존하고 나머지(업로드)만 교체
  const savePracticeWrong = useCallback((lid, items) => {
    const mine = (practiceRef.current[lid] || []).filter((x) => x.source === "mini");
    const tagged = items.map((it) => ({ ...it, source: it.source || "upload" }));
    const arr = [...mine, ...tagged];
    applyPractice({ ...practiceRef.current, [lid]: arr });
    trySync(descWrong(userIdRef.current, lid, "practice", arr));
  }, [applyPractice, trySync]);

  // 미니 엑셀 오답 추가(같은 셀은 갱신)
  const addPracticeWrong = useCallback((lid, item) => {
    const cur = practiceRef.current[lid] || [];
    const k = wrongKey(item);
    const arr = [...cur.filter((x) => wrongKey(x) !== k), item];
    applyPractice({ ...practiceRef.current, [lid]: arr });
    trySync(descWrong(userIdRef.current, lid, "practice", arr));
  }, [applyPractice, trySync]);

  // 미니 엑셀 오답 해결(정답이 되면 제거)
  const resolvePracticeWrong = useCallback((lid, item) => {
    const cur = practiceRef.current[lid] || [];
    const k = wrongKey(item);
    const arr = cur.filter((x) => wrongKey(x) !== k);
    if (arr.length === cur.length) return;
    applyPractice({ ...practiceRef.current, [lid]: arr });
    trySync(descWrong(userIdRef.current, lid, "practice", arr));
  }, [applyPractice, trySync]);

  const completeLesson = useCallback((lid, score) => {
    applyProgress({ ...progressRef.current, [lid]: { done: true, score } });
    trySync(descProgress(userIdRef.current, lid, true, score));
  }, [applyProgress, trySync]);

  // 개념 통과 기록(차시별). concepts·practice_done 만 저장 → done·score 는 건드리지 않음.
  const setConceptPassed = useCallback((lid, idx, opts = {}) => {
    const cur = flowRef.current[lid] || emptyFlow();
    const c = cur.concepts[idx] || {};
    if (c.passed && (c.revealed || !opts.revealed)) return; // 변화 없음
    const nextConcepts = { ...cur.concepts, [idx]: { passed: true, revealed: !!c.revealed || !!opts.revealed } };
    const next = { concepts: nextConcepts, practiceDone: cur.practiceDone };
    applyFlow({ ...flowRef.current, [lid]: next });
    trySync(descFlow(userIdRef.current, lid, nextConcepts, next.practiceDone));
  }, [applyFlow, trySync]);

  // 실습 채점 완료 기록(차시별).
  const setPracticeDone = useCallback((lid) => {
    const cur = flowRef.current[lid] || emptyFlow();
    if (cur.practiceDone) return;
    const next = { concepts: cur.concepts, practiceDone: true };
    applyFlow({ ...flowRef.current, [lid]: next });
    trySync(descFlow(userIdRef.current, lid, cur.concepts, true));
  }, [applyFlow, trySync]);

  // 일차 마무리 시험 통과 → (다음 날) 잠금 해제. cleared_at 은 서버가 생성하므로 응답값으로 교체한다.
  //  낙관적으로 임시(device) 값을 넣고, 서버 응답의 cleared_at 으로 덮는다. 실패 시 재시도 큐로.
  const clearDay = useCallback(async (day) => {
    const uid = userIdRef.current;
    applyClears({ ...clearsRef.current, [day]: nowIso() }); // 임시(로드/응답 시 서버값으로 교체)
    if (!supabase || !uid) return;
    const { data, error } = await supabase
      .from("day_clears")
      .upsert({ user_id: uid, day: Number(day) }, { onConflict: "user_id,day" })
      .select("day, cleared_at")
      .single();
    if (error) { console.error("day_clears 저장 실패:", error.message); enqueue(uid, descClear(uid, day)); bumpFailure(); return; }
    if (data?.cleared_at) applyClears({ ...clearsRef.current, [day]: data.cleared_at }); // 서버 생성 cleared_at
  }, [applyClears, bumpFailure]);

  return { progress, quizWrongMap, practiceWrongMap, dayClears, lessonFlow, saveError, saveQuizWrong, savePracticeWrong, addPracticeWrong, resolvePracticeWrong, completeLesson, clearDay, setConceptPassed, setPracticeDone };
}
