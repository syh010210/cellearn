import { useState } from "react";

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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ color: "#60a5fa", fontSize: 13, marginBottom: 4 }}>📝 복습 퀴즈</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        {lesson.title} — {lesson.quiz.length}문제
      </h2>

      {submitted && (
        <div
          style={{ background: score >= 8 ? "#064e3b" : "#7f1d1d", border: `1px solid ${score >= 8 ? "#22c55e" : "#ef4444"}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "center" }}
        >
          <div style={{ fontSize: 28, fontWeight: 800 }}>{score} / {lesson.quiz.length}</div>
          <div style={{ color: "#e2e8f0", marginTop: 4 }}>
            {score >= 8 ? "🎉 훌륭해요!" : "😅 틀린 문제를 오답노트에서 확인해보세요."}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {lesson.quiz.map((q, qi) => {
          const sel = answers[q.id];
          const isWrong = submitted && sel !== q.answer;
          return (
            <div
              key={q.id}
              style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: submitted ? `1px solid ${sel === q.answer ? "#22c55e" : "#ef4444"}` : "1px solid #334155" }}
            >
              <div style={{ fontWeight: 600, marginBottom: 14 }}>{qi + 1}. {q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const picked = sel === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && picked && oi !== q.answer;
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, border: `1px solid ${correct ? "#22c55e" : wrong ? "#ef4444" : picked ? "#3b82f6" : "#334155"}`, background: correct ? "#064e3b" : wrong ? "#7f1d1d" : picked ? "#1e3a8a" : "#0f172a", color: "#e2e8f0", cursor: submitted ? "default" : "pointer", fontSize: 14 }}
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
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        {!submitted ? (
          <button
            onClick={submit}
            disabled={Object.keys(answers).length < lesson.quiz.length}
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: Object.keys(answers).length < lesson.quiz.length ? "#334155" : "#2563eb", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            제출하기 ({Object.keys(answers).length}/{lesson.quiz.length})
          </button>
        ) : (
          <button
            onClick={() => onDone(score)}
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            ✅ 차시 완료
          </button>
        )}
      </div>
    </div>
  );
}
