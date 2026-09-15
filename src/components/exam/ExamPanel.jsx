import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Download, Upload, CheckCircle2, XCircle } from "lucide-react";
import { buildExamFile, examFileName } from "../../utils/examBuilder";
import { gradeExamFile } from "../../utils/examGrader";
import { useExamAttempts } from "../../hooks/useExamAttempts";
import { scrollExamTop } from "../../utils/examScroll";
import { armExamGuard, disarmExamGuard } from "../../utils/examGuard";
import { userKey } from "../../lib/userScope";
import { UI } from "../../theme";

// 실전 응시 화면 — 문제 세트가 정해진 뒤: 시작(다운로드+타이머) → 풀이 → 업로드 → 채점 → 결과.
// 폭은 상위 컨테이너를 따르고, 지문은 파일이 아니라 이 패널에 표시(채택한 결정 6·7).

const EXAM_MS = 40 * 60 * 1000; // 40분
// 실전 응시 로컬 키는 사용자별 스코프(cellearn:{uid}:exam:*). 로그인 전(uid 없음)이면 null → 건너뜀.
const curKey = () => userKey("exam:current");
const attKey = (id) => userKey(`exam:attempt:${id}`);
const BANNER_MIN_GAP = 220; // 문제 카드 오른쪽 여백이 이보다 좁으면 배너를 상단 가로로
const mmss = (ms) => {
  const s = Math.floor(Math.abs(ms) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// 지문 항목 키 (깃발·채점 매칭). basic2=문항 no, 계산/조작형=문제 단위(0).
const itemKey = (pid, no) => `${pid}:${no ?? 0}`;

// 시트 칩은 작업(section) 단위로 묶는다. (계산작업 5문제 → "계산작업" 칩 하나)
const SECTION_LABEL = { "기본2": "기본작업-2", "기본3": "기본작업-3", "계산": "계산작업", "분석": "분석작업", "매크로": "매크로작업", "차트": "차트작업" };

const DIFF_LABEL = { basic: "기본", hard: "어려움" };
export default function ExamPanel({ problems, label = "", seed = null, difficulty = "basic", onReset }) {
  const mono = { fontFamily: UI.mono };
  const [phase, setPhase] = useState("idle"); // idle | running | graded
  const [attemptId, setAttemptId] = useState(null);
  const [startedAt, setStartedAt] = useState(null); // 응시 시작 벽시계(Date.now). 저장하는 시간은 이것뿐.
  const [elapsedMs, setElapsedMs] = useState(0); // 표시용 파생값(= now - startedAt). running 중 1초마다 갱신, graded 시 고정.
  const [flags, setFlags] = useState({});
  const rootRef = useRef(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [confirm, setConfirm] = useState(null); // 업로드된 File(채점 확인 대기)
  const [saved, setSaved] = useState(false); // 서버 저장 성공 여부(결과 화면 표시용)
  const fileRef = useRef();
  const { saveExamAttempt } = useExamAttempts();

  // 타이머 배너 위치: 문제 카드 열의 오른쪽 끝과 뷰포트 오른쪽 끝 사이 여백의 정중앙에 배너 중심을 둔다.
  // 여백이 배너 폭(대략)보다 좁으면(<220px) 상단 가로 배너로 전환한다.
  const bannerRef = useRef(null);
  const [topBanner, setTopBanner] = useState(false); // true면 상단 가로 배너
  const [bannerLeft, setBannerLeft] = useState(null); // px, 세로(우측) 배너의 left. null이면 미측정(우측 16 fallback)
  const measureBanner = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const right = el.getBoundingClientRect().right; // 문제 카드 열의 오른쪽 끝
    const vw = window.innerWidth;
    const gap = vw - right;
    if (gap < BANNER_MIN_GAP) { setTopBanner(true); return; }
    const bw = bannerRef.current?.offsetWidth || 150;
    setTopBanner(false);
    setBannerLeft(right + gap / 2 - bw / 2); // 여백 정중앙 - 배너 절반
  }, []);
  useLayoutEffect(() => {
    measureBanner();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measureBanner);
      if (rootRef.current) ro.observe(rootRef.current);
      if (bannerRef.current) ro.observe(bannerRef.current); // 시간 글자 폭 변화(초과 표시 등) 반영
    }
    window.addEventListener("resize", measureBanner);
    return () => { ro?.disconnect(); window.removeEventListener("resize", measureBanner); };
  }, [measureBanner]);

  // 최신 값 참조(틱·정리 클로저용)
  const ref = useRef({});
  ref.current = { attemptId, startedAt, elapsedMs, flags, phase, problems, label, seed, difficulty };

  const persist = useCallback((over = {}) => {
    const c = ref.current;
    const id = over.attemptId ?? c.attemptId;
    if (!id) return;
    const data = {
      attemptId: id,
      phase: over.phase ?? c.phase,
      label: c.label,
      seed: c.seed,
      difficulty: c.difficulty,
      problemIds: c.problems.map((p) => p.id),
      problem_set: c.problems, // ExamView 가 마운트 시 응시 세트를 복원할 수 있게 스냅샷
      startedAt: over.startedAt ?? c.startedAt, // 경과는 저장하지 않는다 — 시작 시각만. 경과는 벽시계로 계산.
      flags: over.flags ?? c.flags,
    };
    if (over.graded) Object.assign(data, over.graded); // 채점 스냅샷(서버 saveExamAttempt 와 동일 데이터 + elapsed_ms)
    try {
      const ak = attKey(id), ck = curKey();
      if (ak && ck) { localStorage.setItem(ak, JSON.stringify(data)); localStorage.setItem(ck, id); }
    } catch { /* 저장 실패 무시 */ }
  }, []);

  // 마운트 시 저장된 응시 복원. 채점 완료(graded)만 복원한다. 진행 중(running)은 복원하지 않는다
  // — 새로고침·재접속 = 종료. (ExamView 가 마운트 시 running attempt 를 이미 삭제하므로 보통 여기
  // 남는 건 graded 뿐이지만, 방어적으로 running 은 무시한다.)
  useEffect(() => {
    try {
      const ck = curKey();
      const cur = ck ? localStorage.getItem(ck) : null;
      if (!cur) return;
      const ak = attKey(cur);
      const a = ak ? JSON.parse(localStorage.getItem(ak) || "null") : null;
      if (!a || a.phase !== "graded") return;
      setAttemptId(a.attemptId);
      setStartedAt(a.startedAt || null);
      setFlags(a.flags || {});
      setElapsedMs(a.elapsed_ms || 0); setResult(a.result || null); setSaved(!!a.saved); setPhase("graded");
    } catch { /* 무시 */ }
  }, []);

  // 1초 틱 — 경과는 벽시계(now - startedAt). 화면이 가려져도, 새로고침·탭 전환·최소화 중에도
  // 시간은 계속 흐른다. 탭이 백그라운드로 스로틀되어도 다시 활성화되면 벽시계라 자동으로 맞는다.
  useEffect(() => {
    if (phase !== "running" || !startedAt) return;
    const update = () => setElapsedMs(Date.now() - startedAt);
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [phase, startedAt]);

  // 창·탭 닫기·새로고침 = 종료. beforeunload 로 기본 확인창을 띄우고, 실제로 벗어나면(pagehide)
  // 진행 중 응시 스냅샷을 즉시 삭제한다. (다음 접속에서 ExamView 도 방어적으로 running 을 지운다.)
  useEffect(() => {
    if (phase !== "running") return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; return ""; };
    const onPageHide = () => {
      try {
        const id = ref.current.attemptId;
        const ak = id ? attKey(id) : null, ck = curKey();
        if (ak) localStorage.removeItem(ak);
        if (ck) localStorage.removeItem(ck);
      } catch { /* 무시 */ }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("pagehide", onPageHide);
    return () => { window.removeEventListener("beforeunload", onBeforeUnload); window.removeEventListener("pagehide", onPageHide); };
  }, [phase]);

  // 앱 내 이동 종료 확인용 가드 — 응시 중일 때만 무장. [종료] 시 실행할 정리(스냅샷 삭제)를 등록한다.
  useEffect(() => {
    if (phase !== "running") { disarmExamGuard(); return; }
    armExamGuard(() => {
      try {
        const id = ref.current.attemptId;
        const ak = id ? attKey(id) : null, ck = curKey();
        if (ak) localStorage.removeItem(ak);
        if (ck) localStorage.removeItem(ck);
      } catch { /* 무시 */ }
    });
    return () => disarmExamGuard();
  }, [phase]);

  const sections = [...new Set(problems.map((p) => p.section).filter(Boolean))];
  const shown = activeSection ? problems.filter((p) => p.section === activeSection) : problems;
  const flagCountFor = (section) => problems.filter((p) => !section || p.section === section)
    .reduce((n, p) => n + (p.items || [{ no: 0 }]).filter((it) => flags[itemKey(p.id, it.no)]).length, 0);
  const sectionLabelOf = (section) => SECTION_LABEL[section] || problems.find((p) => p.section === section)?.sheetName || section;

  function startExam() {
    const id = (crypto?.randomUUID?.() || String(Date.now()));
    const now = Date.now();
    setAttemptId(id); setStartedAt(now); setElapsedMs(0); setFlags({}); setResult(null); setPhase("running");
    persist({ attemptId: id, startedAt: now, flags: {}, phase: "running" });
    buildExamFile(problems, label, id);
    // 시험 시작(다운로드) 시에는 스크롤을 건드리지 않는다 — 사용자가 보던 위치 유지.
  }
  function redownload() { buildExamFile(problems, label, attemptId || ""); }
  function toggleFlag(key) { setFlags((f) => { const n = { ...f, [key]: !f[key] }; persist({ flags: n }); return n; }); }
  function onPick(e) { const f = e.target.files[0]; if (f) setConfirm(f); e.target.value = ""; }
  async function doGrade() {
    const f = confirm; setConfirm(null); if (!f) return;
    // 채점 시각 기준으로 경과를 확정(벽시계). 이후 틱은 phase!=="running" 이라 멈춘다.
    if (ref.current.startedAt) setElapsedMs(Date.now() - ref.current.startedAt);
    setChecking(true); setPhase("graded");
    scrollExamTop(rootRef.current);
    try {
      const res = await gradeExamFile(f, problems);
      setResult(res);
      const snap = buildAttemptSnapshot(res);
      persist({ phase: "graded", graded: { ...snap, saved: false } });
      const r = await saveExamAttempt(snap); // 서버 저장(미로그인·실패 시 로컬만)
      setSaved(!!r?.ok);
      persist({ phase: "graded", graded: { ...snap, saved: !!r?.ok } });
    } catch { alert("파일을 읽는 중 오류가 발생했습니다."); setResult(null); }
    setChecking(false);
  }

  // 채점 결과 스냅샷(서버 saveExamAttempt 와 동일 필드 + UI 복원용 result).
  function buildAttemptSnapshot(res) {
    const c = ref.current;
    const ps = c.problems;
    const elapsed = c.startedAt ? Date.now() - c.startedAt : 0; // 채점 시각 - 시작 시각(벽시계)
    const items = [];
    for (const p of ps) {
      const r = res.find((x) => x.id === p.id);
      if (!r) continue;
      for (const it of r.items || []) {
        const ok = it.ok ?? (it.status === "correct");
        items.push({ problemId: p.id, no: it.no ?? null, points: it.points ?? null, ok, earned: it.earned ?? (ok ? (it.points ?? 0) : 0), reasons: it.reasons ?? [], flagged: !!c.flags[itemKey(p.id, it.no ?? 0)] });
      }
    }
    return {
      seed: c.seed || ps.map((p) => p.id).join(","), // 기본2 조립 시드(있으면), 없으면 문제 id 목록
      config: { sections: [...new Set(ps.map((p) => p.section))], difficulty: c.difficulty },
      problem_set: ps,
      items,
      correct: items.filter((i) => i.ok).length,
      total: items.length,
      elapsed_ms: elapsed,
      overtime: elapsed > EXAM_MS,
      result: res, // 결과 화면 복원용
    };
  }
  function clearAttempt() { try { const ak = attemptId ? attKey(attemptId) : null, ck = curKey(); if (ak) localStorage.removeItem(ak); if (ck) localStorage.removeItem(ck); } catch { /* 무시 */ } disarmExamGuard(); setPhase("idle"); setAttemptId(null); setStartedAt(null); setElapsedMs(0); setFlags({}); setResult(null); setSaved(false); }
  function newAttempt() { clearAttempt(); scrollExamTop(rootRef.current); if (onReset) onReset(); } // 새 응시: 세트도 초기화(새 시드) + 최상단
  function replayAttempt() { clearAttempt(); scrollExamTop(rootRef.current); } // 같은 문제 다시 풀기: 같은 세트·시드 유지, 새 attempt + 최상단

  // ── 타이머 표시 ──
  const remaining = EXAM_MS - elapsedMs;
  const over = remaining < 0;
  const timerColor = over || remaining <= 300000 ? UI.wrong : remaining <= 600000 ? UI.warn : UI.ink;
  // 모노는 숫자·콜론(+부호)만: 초과 접미사 "초과"는 본문 글꼴로 분리
  const timerNum = phase === "idle" ? "40:00" : over ? `+${mmss(remaining)}` : mmss(remaining);

  // ── 스타일 ──
  const wrap = { fontFamily: UI.font, paddingTop: topBanner ? 44 : 0 }; // 상단 가로 배너일 때 그 높이만큼 여백
  const card = { background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 16, marginBottom: 12 };
  // 범위 표기: 글꼴은 본문 그대로, 연한 배경 + 좌우 여백만 (모노·자간 없음)
  // fontFamily:"inherit" 를 명시해 <code>/<span> 의 브라우저 기본 monospace 를 덮는다.
  const codeStyle = { fontFamily: "inherit", fontSize: 12.5, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rSm, padding: "1px 5px" };
  const exLine = { color: UI.mut, fontSize: 12.5, marginTop: 4 };
  const btn = (bg, fg) => ({ background: bg, color: fg, border: "none", borderRadius: UI.rMd, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: UI.font, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 });
  const flagBtn = (on) => ({ fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1px solid ${on ? UI.warn : UI.line}`, background: on ? UI.warn : UI.surface, color: on ? "#fff" : UI.faint, borderRadius: UI.rPill, padding: "2px 9px", fontFamily: UI.font, flexShrink: 0 });

  // 지문 본문: 복수 지시( "\n" 또는 " / " )는 문단 분리. [A1:H1] 코드체, [표시 예 …] 는 자기 문단 아래 줄로.
  function prose(text) {
    const paras = String(text).split(/\n|\s\/\s/).map((s) => s.trim()).filter(Boolean);
    return paras.map((para, pi) => {
      const [main, ...ex] = para.split(/(?=\[표시 예)/);
      const parts = main.split(/(\[[A-Za-z]+\d*(?::[A-Za-z]+\d*)?\])/g);
      return (
        <div key={pi} style={{ marginTop: pi ? 6 : 0 }}>
          <span style={{ lineHeight: 1.65 }}>
            {parts.map((p, i) => (/^\[[A-Za-z]/.test(p) ? <span key={i} style={codeStyle}>{p}</span> : <span key={i}>{p}</span>))}
          </span>
          {ex.map((e, i) => <div key={i} style={exLine}>{e}</div>)}
        </div>
      );
    });
  }
  // 계산작업 instruction: ▶ 줄·줄바꿈으로 분리
  function calcProse(instruction) {
    return String(instruction).split(/\n|(?=▶)/).map((ln, i) => <div key={i} style={{ lineHeight: 1.65, marginTop: i ? 4 : 0, color: ln.trim().startsWith("▶") ? UI.teal : UI.ink }}>{ln}</div>);
  }

  function resultFor(pid) { return result?.find((r) => r.id === pid); }

  // 문제 하나의 지문 + (채점 후) 결과
  function renderProblem(p) {
    const res = resultFor(p.id);
    const items = p.items; // basic2 형태(항목별) 또는 없음(계산/조작형)
    return (
      <div key={p.id} style={card}>
        <div style={{ fontWeight: 700, color: UI.ink, fontSize: 14, marginBottom: 4 }}>
          {p.sheetName}{p.title ? ` · ${p.title}` : ""}
        </div>
        {p.intro && <div style={{ color: UI.mut, fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>{p.intro}</div>}

        {items ? items.map((it) => {
          const key = itemKey(p.id, it.no);
          const graded = res?.items?.find((x) => x.no === it.no);
          const ok = graded?.ok;
          return (
            <div key={it.no} style={{ borderTop: `1px solid ${UI.line}`, padding: "9px 0" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: UI.faint, marginTop: 1, flexShrink: 0 }}>{it.no}.</span>
                <div style={{ flex: 1, fontSize: 13, color: UI.ink }}>{prose(it.text)}</div>
                {res
                  ? (ok ? <CheckCircle2 size={16} color={UI.correct} style={{ flexShrink: 0 }} /> : <XCircle size={16} color={UI.wrong} style={{ flexShrink: 0 }} />)
                  : <button style={flagBtn(flags[key])} onClick={() => toggleFlag(key)}>{flags[key] ? "표시됨" : "표시"}</button>}
                {res && flags[key] && <span title="표시함" style={{ ...flagBtn(true), padding: "1px 6px", pointerEvents: "none" }}>표시</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                {res && <span style={{ fontSize: 11.5, color: ok ? UI.correct : UI.wrong }}>{graded?.earned ?? 0}/{it.points}점</span>}
              </div>
              {res && !ok && graded?.reasons?.map((rs, i) => (
                <div key={i} style={{ fontSize: 12, color: UI.wrong, marginLeft: 20, marginTop: 2, lineHeight: 1.55 }}>{rs}</div>
              ))}
            </div>
          );
        }) : (
          // 계산/조작형: instruction + (채점 후) 셀 단위 결과
          <>
            {p.instruction && <div style={{ fontSize: 13, color: UI.ink }}>{calcProse(p.instruction)}</div>}
            {res?.items && (
              <div style={{ marginTop: 8 }}>
                {res.items.map((it, i) => (
                  <div key={i} style={{ fontSize: 12, color: UI.mut, display: "flex", gap: 6, alignItems: "flex-start", padding: "2px 0" }}>
                    {it.status === "correct" ? <CheckCircle2 size={13} color={UI.correct} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={13} color={UI.wrong} style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={codeStyle}>{it.cell}</span>
                    {it.status !== "correct" && <span>입력 <span style={{ color: UI.wrong }}>{it.studentFormula || "(없음)"}</span> · 정답 <span style={{ color: UI.correct }}>{it.formula}</span></span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── 총점(채점 후) ──
  const totalEarned = result ? result.reduce((s, r) => s + (r.earned ?? r.correct ?? 0), 0) : 0;
  const totalMax = result ? result.reduce((s, r) => s + (r.totalPoints ?? r.total ?? 0), 0) : 0;

  const totalFlags = flagCountFor(null);
  const fileName = examFileName(label);
  // 타이머 고정 배너: 여백이 충분하면 문제 카드 오른쪽 여백 정중앙(top 30vh)에, 좁으면 상단 가로.
  const banner = topBanner
    ? { position: "fixed", top: 0, left: 0, right: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "8px 12px", background: UI.surface, borderBottom: `1px solid ${UI.line}`, boxShadow: UI.shadow }
    : { position: "fixed", top: "30vh", left: bannerLeft != null ? bannerLeft : undefined, right: bannerLeft != null ? undefined : 16, zIndex: 40, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "16px 16px", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, boxShadow: UI.shadow };

  return (
    <div ref={rootRef} style={wrap}>
      {/* 타이머 고정 배너 (스크롤해도 보임) */}
      <div ref={bannerRef} style={banner}>
        <div style={{ fontSize: topBanner ? 18 : 34, fontWeight: 700, color: phase === "idle" ? UI.faint : timerColor }}>
          <span style={mono}>{timerNum}</span>{over && phase !== "idle" ? " 초과" : ""}
        </div>
        <div style={{ fontSize: 12, color: UI.mut }}>표시 {totalFlags}</div>
      </div>

      {/* 헤더: 회차 라벨 + 다운로드 영역(시작 전 시작 버튼 / 시작 후 파일명+다시받기) */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: UI.ink, fontSize: 14, marginBottom: 10 }}>
          실전 모의고사{label ? ` · ${label}` : ""}
          {problems.some((p) => p.section === "기본2") && <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: UI.teal }}>기본작업-2 {DIFF_LABEL[difficulty] || "기본"}</span>}
        </div>
        {phase === "idle" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: UI.faint }}>시험 시작을 누르면 파일이 내려받아집니다</span>
            <button style={{ ...btn(UI.teal, "#fff"), padding: "8px 12px", fontSize: 13, marginLeft: "auto" }} onClick={startExam}>
              <Download size={14} /> 시험 시작 (파일 다운로드)
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: UI.ink, fontWeight: 600, wordBreak: "break-all" }}>{fileName}</span>
            <button style={{ ...btn(UI.surface, UI.teal), border: `1px solid ${UI.line}`, padding: "8px 12px", fontSize: 13, marginLeft: "auto" }} onClick={redownload}>
              <Download size={14} /> 파일 다시 받기
            </button>
          </div>
        )}
      </div>

      {/* 시트 칩 (작업 단위) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {sections.map((s) => {
          const on = activeSection === s || (!activeSection && sections.length === 1);
          const fc = flagCountFor(s);
          return (
            <button key={s} onClick={() => setActiveSection(activeSection === s ? null : s)}
              style={{ fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "6px 11px", borderRadius: UI.rPill, border: `1px solid ${on ? UI.teal : UI.line}`, background: on ? UI.teal : UI.surface, color: on ? "#fff" : UI.mut, fontFamily: UI.font }}>
              {sectionLabelOf(s)}{fc ? ` (표시 ${fc})` : ""}
            </button>
          );
        })}
      </div>

      {/* 채점 결과 총점 */}
      {result && (
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: totalEarned === totalMax ? UI.correct : UI.warn }}>
            채점 결과 {totalEarned}/{totalMax}점
          </div>
          <div style={{ fontSize: 12.5, color: UI.mut, marginTop: 4 }}>
            소요 {mmss(elapsedMs)}{over ? ` · 초과 +${mmss(EXAM_MS - elapsedMs)}` : ""}
          </div>
          <div style={{ fontSize: 12, color: saved ? UI.correct : UI.warn, marginTop: 2 }}>
            {saved ? "저장됨" : "저장 대기 중"}
          </div>
        </div>
      )}

      {/* 지문 영역 */}
      {shown.map(renderProblem)}

      {/* 하단 버튼 (시작 버튼·파일 다시 받기는 상단 헤더로 이동) */}
      {phase === "running" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input ref={fileRef} type="file" accept=".xlsx,.xlsm" onChange={onPick} style={{ display: "none" }} />
          <button style={{ ...btn(UI.teal, "#fff"), width: "100%" }} onClick={() => fileRef.current.click()} disabled={checking}>
            <Upload size={16} /> {checking ? "채점 중..." : "완성 파일 업로드"}
          </button>
        </div>
      )}
      {phase === "graded" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button style={{ ...btn(UI.teal, "#fff"), width: "100%" }} onClick={replayAttempt}>같은 문제 다시 풀기</button>
          <button style={{ ...btn(UI.surface, UI.ink), width: "100%", border: `1px solid ${UI.line}` }} onClick={newAttempt}>새 응시</button>
        </div>
      )}

      {/* 업로드 확인 대화상자 */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,33,29,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ ...card, minWidth: 360, maxWidth: 400, margin: 16, boxShadow: UI.shadow }}>
            <div style={{ fontWeight: 700, color: UI.ink, fontSize: 15, marginBottom: 6 }}>시간을 멈추고 채점할까요?</div>
            <div style={{ color: UI.mut, fontSize: 13, marginBottom: 14 }}>채점하면 타이머가 종료됩니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...btn(UI.teal, "#fff"), flex: 1, whiteSpace: "nowrap" }} onClick={doGrade}>채점</button>
              <button style={{ ...btn(UI.surface, UI.mut), flex: 1, border: `1px solid ${UI.line}`, whiteSpace: "nowrap" }} onClick={() => setConfirm(null)}>계속 풀기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
