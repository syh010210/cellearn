import { useState } from "react";
import { PenLine } from "lucide-react";
import { UI } from "../../theme";

export default function QuizView({ lesson, onDone, onSaveWrong }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(null);
  const score = submitted ? lesson.quiz.filter((q) => answers[q.id] === q.answer).length : 0;

  function submit() {
    const wrong = lesson.quiz.filter((q) => answers[q.id] !== q.answer).map((q) => q.id);
    onSaveWrong(lesson.id, wrong);
    setSubmitted(true);
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount >= lesson.quiz.length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <PenLine size={15} strokeWidth={2} /> 복습 퀴즈
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: UI.ink }}>
        {lesson.title} — {lesson.quiz.length}문제
      </h2>

      {submitted && (
        <div style={{ background: score >= 8 ? UI.limeSoft : UI.redSoft, border: `1px solid ${score >= 8 ? UI.greenLine : UI.redLine}`, borderRadius: UI.rLg, padding: "18px 20px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 700, fontFamily: UI.mono, color: score >= 8 ? UI.correct : UI.wrong }}>{score} / {lesson.quiz.length}</div>
          <div style={{ color: UI.mut, marginTop: 4 }}>
            {score >= 8 ? "훌륭해요!" : "틀린 문제를 오답노트에서 확인해보세요."}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {lesson.quiz.map((q, qi) => {
          const sel = answers[q.id];
          const isWrong = submitted && sel !== q.answer;
          return (
            <div
              key={q.id}
              style={{ background: UI.panel, borderRadius: 16, padding: 20, border: `1px solid ${submitted ? (sel === q.answer ? UI.greenLine : UI.redLine) : UI.line}` }}
            >
              <div style={{ fontWeight: 700, marginBottom: 14, color: UI.ink }}>{qi + 1}. {q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const picked = sel === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && picked && oi !== q.answer;
                  const bg = correct ? UI.greenSoft : wrong ? UI.redSoft : picked ? UI.tealSoft : UI.panel;
                  const bc = correct ? UI.greenLine : wrong ? UI.redLine : picked ? UI.teal : UI.line;
                  const tc = correct ? UI.green : wrong ? UI.red : UI.ink;
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, border: `1px solid ${bc}`, background: bg, color: tc, cursor: submitted ? "default" : "pointer", fontSize: 14, fontWeight: picked || correct ? 600 : 400, fontFamily: UI.font }}
                    >
                      {["①", "②", "③", "④"][oi]} {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && isWrong && (
                <div style={{ marginTop: 12 }}>
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
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        {!submitted ? (
          <button
            onClick={submit}
            disabled={!allAnswered}
            style={{ width: "100%", padding: 14, borderRadius: UI.rMd, border: "none", background: allAnswered ? UI.teal : "#cfd6d2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: allAnswered ? "pointer" : "not-allowed" }}
          >
            제출하기 (<span style={{ fontFamily: UI.mono }}>{answeredCount}/{lesson.quiz.length}</span>)
          </button>
        ) : (
          <button
            onClick={() => onDone(score)}
            style={{ width: "100%", padding: 14, borderRadius: UI.rMd, border: "none", background: UI.lime, color: UI.teal, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            차시 완료
          </button>
        )}
      </div>
    </div>
  );
}
