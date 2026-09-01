import { useState, useRef } from "react";
import { Target, Download, Upload, CheckCircle2, XCircle, Lock } from "lucide-react";
import { CALC_SUBTYPES, EXAM_SECTIONS, calcAvailableSubtypes, pickCalc } from "../../data/examBank";
import { buildExamFile } from "../../utils/examBuilder";
import { gradeExamFile } from "../../utils/examGrader";
import { UI } from "../../theme";

// 실전 모드 — 컴활 2급 실기 모의고사. (P1: 계산작업 실동작 — 시험지 .xlsx 다운로드 → 업로드 채점)
export default function ExamView() {
  const calcSubs = calcAvailableSubtypes();
  const [selected, setSelected] = useState([]); // 계산 유형(빈 배열=전체)
  const [count, setCount] = useState(5);
  const [problems, setProblems] = useState(null); // 생성된 시험지 문제 세트
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const fileRef = useRef();
  const mono = { fontFamily: UI.mono };

  const toggle = (k) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  function generate() {
    const set = pickCalc(selected, count);
    setProblems(set);
    setResult(null);
    buildExamFile(set, new Date().toISOString().slice(0, 10));
  }

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f || !problems) return;
    setChecking(true);
    try { setResult(await gradeExamFile(f, problems)); }
    catch { alert("파일을 읽는 중 오류가 발생했어요."); }
    setChecking(false);
  }

  const totalCorrect = result ? result.reduce((s, r) => s + r.correct, 0) : 0;
  const totalItems = result ? result.reduce((s, r) => s + r.total, 0) : 0;

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
      <p style={{ color: UI.mut, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
        실제 시험지 형식의 엑셀 파일을 내려받아 풀고, 완성 파일을 업로드하면 <b style={{ color: UI.ink }}>정답 수식 일치</b>로 채점합니다.
      </p>

      {/* 계산작업 구성 (P1 실동작) */}
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
          <button onClick={generate}
            style={{ marginLeft: "auto", background: UI.teal, color: "#fff", border: "none", padding: "11px 20px", borderRadius: UI.rMd, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: UI.font }}>
            <Download size={16} strokeWidth={2} /> {problems ? "다시 생성 & 다운로드" : "시험지 생성 & 다운로드"}
          </button>
        </div>
      </div>

      {/* 업로드 채점 */}
      {problems && (
        <div style={card} className="cl-fade-up">
          <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 10 }}>완성 파일 업로드 & 채점</div>
          <div style={{ fontSize: 12.5, color: UI.mut, marginBottom: 12, lineHeight: 1.7 }}>
            내려받은 파일의 각 시트(<span style={mono}>{problems.map((p) => p.sheetName).join(", ")}</span>)에서 정답 셀에 수식을 입력해 저장한 뒤 업로드하세요.
          </div>
          <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} disabled={checking}
            style={{ width: "100%", padding: 13, borderRadius: UI.rMd, border: `2px dashed ${UI.line}`, background: UI.panelAlt, color: UI.teal, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: UI.font }}>
            <Upload size={17} strokeWidth={2} /> {checking ? "채점 중..." : "파일 업로드 & 채점"}
          </button>

          {result && (
            <div className="cl-fade-up" style={{ marginTop: 16 }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, color: totalCorrect === totalItems ? UI.correct : UI.warn, marginBottom: 14 }}>
                채점 결과 <span style={mono}>{totalCorrect} / {totalItems}</span>
              </div>
              {result.map((r) => (
                <div key={r.id} style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "12px 14px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: UI.ink }}><span style={mono}>{r.sheetName}</span> · {r.title}</span>
                    <span style={{ ...mono, fontSize: 12.5, color: r.correct === r.total ? UI.correct : UI.warn }}>{r.correct}/{r.total}</span>
                  </div>
                  {r.items.map((it, i) => (
                    <div key={i} style={{ fontSize: 12, color: UI.mut, display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }}>
                      {it.status === "correct"
                        ? <CheckCircle2 size={14} strokeWidth={2} color={UI.correct} style={{ flexShrink: 0, marginTop: 2 }} />
                        : <XCircle size={14} strokeWidth={2} color={UI.wrong} style={{ flexShrink: 0, marginTop: 2 }} />}
                      <span style={mono}>{it.cell}</span>
                      {it.status !== "correct" && <span>입력 <span style={{ color: UI.wrong }}>{it.studentFormula || "(없음)"}</span> · 정답 <span style={{ color: UI.correct }}>{it.formula}</span></span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 전체 시험지 구성 로드맵 */}
      <div style={{ ...card, background: UI.bg }}>
        <div style={{ fontWeight: 700, color: UI.ink, marginBottom: 4 }}>전체 시험지 구성</div>
        <div style={{ fontSize: 12.5, color: UI.mut, marginBottom: 12 }}>실제 2급 시험지는 아래 8개 작업으로 구성됩니다. 계산작업부터 순차 오픈 중.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {EXAM_SECTIONS.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: s.ready ? UI.ink : UI.faint }}>
              {s.ready ? <CheckCircle2 size={15} strokeWidth={2} color={UI.correct} /> : <Lock size={14} strokeWidth={1.5} />}
              {s.label}{!s.ready && <span style={{ marginLeft: "auto", fontSize: 11 }}>준비 중</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
