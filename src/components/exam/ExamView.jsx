import { useState, useEffect } from "react";
import { Target, CheckCircle2, Lock } from "lucide-react";
import { CALC_SUBTYPES, EXAM_SECTIONS, calcAvailableSubtypes, pickCalc, BASIC3_SUBTYPES, basic3AvailableSubtypes, pickBasic3, ANALYSIS_SUBTYPES, analysisAvailableSubtypes, pickAnalysis, sectionReady, pickSection } from "../../data/examBank";
import { assembleBasic2 } from "../../utils/basic2Assembler";
import { UI } from "../../theme";
import ExamPanel from "./ExamPanel";

// 실전 모드 — 컴활 2급 실기 모의고사. 구성 화면(유형 선택) → 응시 화면(ExamPanel).
export default function ExamView() {
  const calcSubs = calcAvailableSubtypes();
  const basic3Subs = basic3AvailableSubtypes();
  const basic2Ready = sectionReady("기본2");
  const [inc2, setInc2] = useState(basic2Ready); // 기본작업-2 포함
  const [selected, setSelected] = useState([]); // 계산 유형(빈 배열=전체)
  const [count, setCount] = useState(5);
  const [inc3, setInc3] = useState(true); // 기본작업-3 포함
  const [sub3, setSub3] = useState("condformat"); // 기본작업-3 유형
  const analysisSubs = analysisAvailableSubtypes();
  const [anaSel, setAnaSel] = useState([]); // 분석작업 유형(최대 2)
  const [incMacro, setIncMacro] = useState(true);
  const [incChart, setIncChart] = useState(true);
  const macroReady = sectionReady("매크로");
  const chartReady = sectionReady("차트");

  const toggleAna = (k) => setAnaSel((s) => (s.includes(k) ? s.filter((x) => x !== k) : s.length >= 2 ? s : [...s, k]));
  const [problems, setProblems] = useState(null); // 확정된 문제 세트(응시 화면 진입)
  const [label, setLabel] = useState("");
  const [seed, setSeed] = useState(null); // 기본2 조립 시드

  // 진행/채점 중이던 응시가 있으면 마운트 시 세트를 복원해 ExamPanel 로 바로 들어간다.
  useEffect(() => {
    try {
      const cur = localStorage.getItem("exam:current");
      if (!cur) return;
      const a = JSON.parse(localStorage.getItem(`exam:attempt:${cur}`) || "null");
      if (a?.problem_set?.length) { setProblems(a.problem_set); setLabel(a.label || ""); setSeed(a.seed || null); }
    } catch { /* 무시 */ }
  }, []);

  const toggle = (k) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  function compose() {
    const s = (crypto?.randomUUID?.() || String(Date.now())).slice(0, 8); // 기본2 조립 시드
    const set = [];
    if (inc2 && basic2Ready) set.push(assembleBasic2(s)); // 시드 고정 조립 출제
    if (inc3) { const b3 = pickBasic3(sub3); if (b3) set.push(b3); }
    set.push(...pickCalc(selected, count));
    if (anaSel.length) set.push(...pickAnalysis(anaSel));
    if (incMacro && macroReady) { const m = pickSection("매크로", "매크로작업"); if (m) set.push(m); }
    if (incChart && chartReady) { const c = pickSection("차트", "차트작업"); if (c) set.push(c); }
    if (set.length === 0) return;
    setSeed(s);
    setLabel(new Date().toISOString().slice(0, 10));
    setProblems(set);
  }

  const chip = (active) => ({
    padding: "7px 14px", borderRadius: UI.rPill, fontSize: 13, fontWeight: active ? 700 : 500,
    cursor: "pointer", fontFamily: UI.font,
    background: active ? UI.teal : UI.surface, color: active ? "#fff" : UI.mut,
    border: `1px solid ${active ? UI.teal : UI.line}`,
  });
  const card = { background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 22, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <Target size={15} strokeWidth={2} /> 실전 모드
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: UI.ink }}>실전 모의고사</h2>

      {problems ? (
        <ExamPanel problems={problems} label={label} seed={seed} onReset={() => { setProblems(null); setSeed(null); }} />
      ) : (
        <>
          <p style={{ color: UI.mut, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
            출제할 작업을 고른 뒤 응시를 시작하면, 시험지 파일을 내려받아 풀고 완성 파일을 업로드해 <b style={{ color: UI.ink }}>항목별로 채점</b>합니다.
          </p>

          {/* 기본작업-2 구성 */}
          <div style={card}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: basic2Ready ? "pointer" : "not-allowed", opacity: basic2Ready ? 1 : 0.5 }}>
              <input type="checkbox" checked={inc2 && basic2Ready} disabled={!basic2Ready} onChange={(e) => setInc2(e.target.checked)} />
              <span style={{ fontWeight: 700, color: UI.ink }}>기본작업-2 포함</span>
              <span style={{ fontSize: 12, color: UI.mut }}>(셀 서식 · 항목별 실채점)</span>
            </label>
          </div>

          {/* 기본작업-3 구성 */}
          <div style={card}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
              <input type="checkbox" checked={inc3} onChange={(e) => setInc3(e.target.checked)} />
              <span style={{ fontWeight: 700, color: UI.ink }}>기본작업-3 포함</span>
              <span style={{ fontSize: 12, color: UI.mut }}>(조건부 서식 · 파일 업로드 실채점)</span>
            </label>
            {inc3 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {BASIC3_SUBTYPES.map((s) => {
                  const avail = basic3Subs.find((a) => a.key === s.key)?.ready;
                  return (
                    <button key={s.key} onClick={() => avail && setSub3(s.key)} disabled={!avail}
                      title={avail ? "" : "문제 준비 중"}
                      style={{ ...chip(sub3 === s.key && avail), opacity: avail ? 1 : 0.45, cursor: avail ? "pointer" : "not-allowed" }}>
                      {s.label}{!avail && " ·준비중"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 계산작업 구성 */}
          <div style={card}>
            <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 4 }}>계산작업 — 함수 유형 선택</div>
            <div style={{ fontSize: 12.5, color: UI.mut, marginBottom: 12 }}>원하는 함수 유형만 골라 출제할 수 있어요. (선택 안 하면 전체에서 무작위)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CALC_SUBTYPES.map((s) => {
                const avail = calcSubs.some((a) => a.key === s.key);
                return (
                  <button key={s.key} onClick={() => avail && toggle(s.key)} disabled={!avail}
                    title={avail ? "" : "문제 준비 중"}
                    style={{ ...chip(selected.includes(s.key)), opacity: avail ? 1 : 0.45, cursor: avail ? "pointer" : "not-allowed" }}>
                    {s.label}{!avail && " ·준비중"}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: UI.ink }}>문항 수</span>
              {[3, 5].map((n) => <button key={n} onClick={() => setCount(n)} style={chip(count === n)}>{n}</button>)}
            </div>
          </div>

          {/* 분석작업 구성 (택2) */}
          <div style={card}>
            <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 4 }}>분석작업 — 유형 2개 선택</div>
            <div style={{ fontSize: 12.5, color: UI.mut, marginBottom: 12 }}>선택한 2개가 분석작업-1 · 2로 출제됩니다. (미선택 시 분석작업 제외)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ANALYSIS_SUBTYPES.map((s) => {
                const avail = analysisSubs.find((a) => a.key === s.key)?.ready;
                const on = anaSel.includes(s.key);
                return (
                  <button key={s.key} onClick={() => avail && toggleAna(s.key)} disabled={!avail}
                    title={avail ? "" : "문제 준비 중"}
                    style={{ ...chip(on), opacity: avail ? 1 : 0.45, cursor: avail ? "pointer" : "not-allowed" }}>
                    {s.label}{on ? ` (${anaSel.indexOf(s.key) + 1})` : ""}{!avail && " ·준비중"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 매크로 / 차트 */}
          <div style={card}>
            <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 10 }}>매크로 · 차트</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: macroReady ? 1 : 0.5 }}>
              <input type="checkbox" checked={incMacro && macroReady} disabled={!macroReady} onChange={(e) => setIncMacro(e.target.checked)} />
              <span>매크로작업 포함 <span style={{ fontSize: 12, color: UI.mut }}>(.xlsm 저장 · 제출)</span></span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, opacity: chartReady ? 1 : 0.5 }}>
              <input type="checkbox" checked={incChart && chartReady} disabled={!chartReady} onChange={(e) => setIncChart(e.target.checked)} />
              <span>차트작업 포함 <span style={{ fontSize: 12, color: UI.mut }}>(차트 종류 검사)</span></span>
            </label>
          </div>

          <button onClick={compose}
            style={{ width: "100%", background: UI.teal, color: "#fff", border: "none", padding: "13px 20px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: UI.font, marginBottom: 16 }}>
            이 구성으로 응시 준비
          </button>

          {/* 전체 시험지 구성 로드맵 */}
          <div style={{ ...card, background: UI.bg }}>
            <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 4 }}>전체 시험지 구성</div>
            <div style={{ fontSize: 12.5, color: UI.mut, marginBottom: 12 }}>실제 2급 시험지는 아래 8개 작업으로 구성됩니다. 순차 오픈 중.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXAM_SECTIONS.map((s) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: s.ready ? UI.ink : UI.faint }}>
                  {s.ready ? <CheckCircle2 size={15} strokeWidth={2} color={UI.correct} /> : <Lock size={14} strokeWidth={1.5} />}
                  {s.label}{!s.ready && <span style={{ marginLeft: "auto", fontSize: 11 }}>준비 중</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
