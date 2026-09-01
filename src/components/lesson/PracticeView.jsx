import { useState, useRef } from "react";
import { generateExcel } from "../../utils/excelGenerator";
import { gradeExcel } from "../../utils/excelGrader";
import { UI } from "../../theme";

export default function PracticeView({ lesson, onNext, onWrong }) {
  const [gradeResult, setGradeResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setChecking(true);
    try {
      const results = await gradeExcel(file, lesson.practiceAnswers);
      const wrongItems = results.filter((r) => r.status !== "correct");
      onWrong(lesson.id, wrongItems);
      setGradeResult(results);
      setUploaded(true);
    } catch {
      alert("파일을 읽는 중 오류가 발생했어요.");
    }
    setChecking(false);
  }

  const correctCount = gradeResult ? gradeResult.filter((r) => r.status === "correct").length : 0;
  const total = lesson.practiceAnswers.length;
  const card = { background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 16, padding: 24, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>📂 엑셀 실습</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: UI.ink }}>엑셀 실습 파일</h2>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 12, color: UI.ink }}>① 실습 파일 다운로드</div>
        {[...new Set(lesson.practiceAnswers.map((a) => a.sheet))].map((sheet, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: UI.mut, fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: UI.green }}>✓</span>{sheet}
          </div>
        ))}
        <button
          onClick={() => generateExcel(lesson)}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: UI.teal, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 12 }}
        >
          📥 엑셀 실습 파일 다운로드
        </button>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 12, color: UI.ink }}>② 실습 후 저장</div>
        <div style={{ color: UI.mut, fontSize: 14, lineHeight: 1.9 }}>
          1. 다운받은 파일을 엑셀로 열기<br />
          2. 각 시트의 안내에 따라 수식 입력<br />
          3. <strong style={{ color: UI.ink }}>Ctrl+S</strong> 로 저장 (파일명 변경 금지)<br />
          4. 아래에서 파일 제출
        </div>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 12, color: UI.ink }}>③ 완성 파일 제출 & 채점</div>
        <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFile} style={{ display: "none" }} />
        <button
          onClick={() => fileRef.current.click()}
          disabled={checking}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: `2px dashed ${UI.line}`, background: UI.panelAlt, color: UI.teal, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          {checking ? "채점 중..." : "📤 파일 업로드 & 채점하기"}
        </button>
      </div>

      {gradeResult && (
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16, textAlign: "center", color: correctCount === total ? UI.green : UI.amber }}>
            채점 결과: {correctCount} / {total}
          </div>
          {gradeResult.map((r, i) => {
            const ok = r.status === "correct";
            return (
              <div
                key={i}
                style={{ background: ok ? UI.greenSoft : UI.redSoft, borderRadius: 12, padding: "12px 16px", marginBottom: 10, border: `1px solid ${ok ? UI.greenLine : UI.redLine}` }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ok ? 0 : 8 }}>
                  <span style={{ fontSize: 13, color: UI.mut }}>{r.sheet} · {r.cell}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: ok ? UI.green : UI.red }}>
                    {ok ? "✅ 정답" : r.status === "시트없음" ? "⚠️ 시트없음" : "❌ 오답"}
                  </span>
                </div>
                {!ok && (
                  <div style={{ fontSize: 12.5, color: UI.mut }}>
                    <div>입력한 수식: <span style={{ color: UI.red }}>{r.studentFormula || "(없음)"}</span></div>
                    <div>정답 수식: <span style={{ color: UI.green }}>{r.formula}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {uploaded && (
        <button
          onClick={onNext}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: UI.teal, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          복습 퀴즈 풀기 →
        </button>
      )}
    </div>
  );
}
