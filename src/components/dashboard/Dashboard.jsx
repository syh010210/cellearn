export default function Dashboard({ lessons, progress, quizWrongMap, practiceWrongMap }) {
  const done = lessons.filter((l) => progress[l.id]?.done).length;
  const total = lessons.length;
  const totalQ = lessons.reduce((s, l) => s + l.quiz.length, 0);
  const correct = lessons.reduce((s, l) => s + (progress[l.id]?.score || 0), 0);
  const quizWrong = Object.values(quizWrongMap).flat().length;
  const practiceWrong = Object.values(practiceWrongMap).flat().length;

  const stats = [
    { label: "완료 차시", value: `${done} / ${total}`, color: "#3b82f6" },
    { label: "퀴즈 정답", value: `${correct} / ${totalQ}`, color: "#22c55e" },
    { label: "퀴즈 오답", value: quizWrong, color: "#ef4444" },
    { label: "실습 오답 셀", value: practiceWrong, color: "#f59e0b" },
  ];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>📊 나의 학습 현황</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#1e293b", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#1e293b", borderRadius: 12, padding: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>차시별 진도</div>
        {lessons.map((l) => (
          <div key={l.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, color: "#94a3b8" }}>
              <span>{l.id}. {l.title}</span>
              <span>{progress[l.id]?.done ? `퀴즈 ${progress[l.id].score}/${l.quiz.length}` : "미완료"}</span>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 6, height: 8 }}>
              <div
                style={{ background: progress[l.id]?.done ? "#22c55e" : "#334155", width: progress[l.id]?.done ? "100%" : "0%", height: "100%", borderRadius: 6, transition: "width 0.5s" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
