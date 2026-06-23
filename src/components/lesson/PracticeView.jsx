import { useState, useRef } from "react";
import { generateExcel } from "../../utils/excelGenerator";
import { gradeExcel } from "../../utils/excelGrader";

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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ color: "#60a5fa", fontSize: 13, marginBottom: 4 }}>📂 엑셀 실습</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>엑셀 실습 파일</h2>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>① 실습 파일 다운로드</div>
        {["표1: 합계/평균 (상대 참조)", "표2: 비율 적용 (절대 참조)", "표3: 환율 변환 (절대 참조)"].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: "#22c55e" }}>✓</span>{t}
          </div>
        ))}
        <button
          onClick={() => generateExcel(lesson)}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#059669", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 12 }}
        >
          📥 엑셀 실습 파일 다운로드
        </button>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>② 실습 후 저장</div>
        <div style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.9 }}>
          1. 다운받은 파일을 엑셀로 열기<br />
          2. 각 시트의 안내에 따라 수식 입력<br />
          3. <strong style={{ color: "#f59e0b" }}>Ctrl+S</strong> 로 저장 (파일명 변경 금지)<br />
          4. 아래에서 파일 제출
        </div>
      </div>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>③ 완성 파일 제출 & 채점</div>
        <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFile} style={{ display: "none" }} />
        <button
          onClick={() => fileRef.current.click()}
          disabled={checking}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "2px dashed #334155", background: "#0f172a", color: "#60a5fa", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          {checking ? "채점 중..." : "📤 파일 업로드 & 채점하기"}
        </button>
      </div>

      {gradeResult && (
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, textAlign: "center", color: correctCount === total ? "#22c55e" : "#f59e0b" }}>
            채점 결과: {correctCount} / {total}
          </div>
          {gradeResult.map((r, i) => (
            <div
              key={i}
              style={{ background: "#0f172a", borderRadius: 10, padding: "12px 16px", marginBottom: 10, border: `1px solid ${r.status === "correct" ? "#22c55e44" : "#ef444444"}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: r.status !== "correct" ? 8 : 0 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>{r.sheet} · {r.cell}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.status === "correct" ? "#22c55e" : "#ef4444" }}>
                  {r.status === "correct" ? "✅ 정답" : r.status === "시트없음" ? "⚠️ 시트없음" : "❌ 오답"}
                </span>
              </div>
              {r.status !== "correct" && (
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  <div>입력한 수식: <span style={{ color: "#f87171" }}>{r.studentFormula || "(없음)"}</span></div>
                  <div>정답 수식: <span style={{ color: "#86efac" }}>{r.formula}</span></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploaded && (
        <button
          onClick={onNext}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          복습 퀴즈 풀기 →
        </button>
      )}
    </div>
  );
}
