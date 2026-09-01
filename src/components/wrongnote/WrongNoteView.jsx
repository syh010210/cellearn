import { useState } from "react";
import { UI } from "../../theme";

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

  const cardBase = { background: UI.panel, borderRadius: 14, padding: 20, marginBottom: 12, border: `1px solid ${UI.redLine}` };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: UI.ink }}>❌ 오답 노트</h2>

      {allPractice.length > 0 && (
        <>
          <div style={{ color: UI.amber, fontWeight: 800, marginBottom: 12 }}>📂 엑셀 실습 오답</div>
          {allPractice.map(({ lesson: l, p }, i) => (
            <div key={i} style={cardBase}>
              <div style={{ color: UI.red, fontSize: 12, marginBottom: 6 }}>📘 {l.id}차시 · {l.title}</div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: UI.ink }}>{p.sheet} — {p.cell} 셀</div>
              <div style={{ fontSize: 13, color: UI.mut }}>
                <div>입력한 수식: <span style={{ color: UI.red }}>{p.studentFormula || "(없음)"}</span></div>
                <div>정답 수식: <span style={{ color: UI.green }}>{p.formula}</span></div>
              </div>
            </div>
          ))}
        </>
      )}

      {allQuiz.length > 0 && (
        <>
          <div style={{ color: UI.amber, fontWeight: 800, marginBottom: 12, marginTop: 24 }}>📝 퀴즈 오답</div>
          {allQuiz.map(({ lesson: l, q }) => (
            <div key={`${l.id}-${q.id}`} style={cardBase}>
              <div style={{ color: UI.red, fontSize: 12, marginBottom: 6 }}>📘 {l.id}차시 · {l.title}</div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: UI.ink }}>{q.question}</div>
              <div style={{ color: UI.mut, fontSize: 13, marginBottom: 8 }}>
                정답: {["①", "②", "③", "④"][q.answer]} {q.options[q.answer]}
              </div>
              <button
                onClick={() => setShow(show === q.id ? null : q.id)}
                style={{ background: UI.tealSoft, border: "none", color: UI.teal, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              >
                {show === q.id ? "풀이 닫기 ▲" : "풀이 보기 ▼"}
              </button>
              {show === q.id && (
                <div style={{ background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: 10, padding: 12, marginTop: 8, color: UI.mut, fontSize: 13, lineHeight: 1.7 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {allPractice.length === 0 && allQuiz.length === 0 && (
        <div style={{ color: UI.faint, textAlign: "center", marginTop: 60 }}>오답이 없어요!</div>
      )}
    </div>
  );
}
