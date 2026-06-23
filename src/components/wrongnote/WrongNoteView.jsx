import { useState } from "react";

export default function WrongNoteView({ lessons, quizWrongMap, practiceWrongMap }) {
  const [show, setShow] = useState(null);

  const allPractice = lessons.flatMap((l) =>
    (practiceWrongMap[l.id] || []).map((p) => ({ lesson: l, p }))
  );
  const allQuiz = lessons
    .flatMap((l) =>
      (quizWrongMap[l.id] || []).map((qid) => ({ lesson: l, q: l.quiz.find((q) => q.id === qid) }))
    )
    .filter((x) => x.q);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>❌ 오답 노트</h2>

      {allPractice.length > 0 && (
        <>
          <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 12 }}>📂 엑셀 실습 오답</div>
          {allPractice.map(({ lesson: l, p }, i) => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 12, border: "1px solid #ef444466" }}>
              <div style={{ color: "#f87171", fontSize: 12, marginBottom: 6 }}>📘 {l.id}차시 · {l.title}</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{p.sheet} — {p.cell} 셀</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                <div>입력한 수식: <span style={{ color: "#f87171" }}>{p.studentFormula || "(없음)"}</span></div>
                <div>정답 수식: <span style={{ color: "#86efac" }}>{p.formula}</span></div>
              </div>
            </div>
          ))}
        </>
      )}

      {allQuiz.length > 0 && (
        <>
          <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 12, marginTop: 24 }}>📝 퀴즈 오답</div>
          {allQuiz.map(({ lesson: l, q }) => (
            <div key={`${l.id}-${q.id}`} style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginBottom: 12, border: "1px solid #ef444466" }}>
              <div style={{ color: "#f87171", fontSize: 12, marginBottom: 6 }}>📘 {l.id}차시 · {l.title}</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{q.question}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>
                정답: {["①", "②", "③", "④"][q.answer]} {q.options[q.answer]}
              </div>
              <button
                onClick={() => setShow(show === q.id ? null : q.id)}
                style={{ background: "#1e3a8a", border: "none", color: "#60a5fa", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                {show === q.id ? "풀이 닫기 ▲" : "풀이 보기 ▼"}
              </button>
              {show === q.id && (
                <div style={{ background: "#0f172a", borderRadius: 8, padding: 12, marginTop: 8, color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {allPractice.length === 0 && allQuiz.length === 0 && (
        <div style={{ color: "#64748b", textAlign: "center", marginTop: 60 }}>오답이 없어요! 🎉</div>
      )}
    </div>
  );
}
