import { UI } from "../../theme";

export default function Dashboard({ lessons, progress, quizWrongMap, practiceWrongMap }) {
  const done = lessons.filter((l) => progress[l.id]?.done).length;
  const total = lessons.length;
  const totalQ = lessons.reduce((s, l) => s + l.quiz.length, 0);
  const correct = lessons.reduce((s, l) => s + (progress[l.id]?.score || 0), 0);
  const quizWrong = Object.values(quizWrongMap).flat().length;
  const practiceWrong = Object.values(practiceWrongMap).flat().length;

  const stats = [
    { label: "완료 차시", value: `${done} / ${total}`, color: UI.teal },
    { label: "퀴즈 정답", value: `${correct} / ${totalQ}`, color: UI.green },
    { label: "퀴즈 오답", value: quizWrong, color: UI.red },
    { label: "실습 오답 셀", value: practiceWrong, color: UI.amber },
  ];

  return (
    <div className="cl-fade-up" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: UI.ink }}>나의 학습 현황</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: "22px 20px", textAlign: "center" }}>
            <div style={{ color: s.color, fontSize: 30, fontWeight: 700, fontFamily: UI.mono }}>{s.value}</div>
            <div style={{ color: UI.mut, fontSize: 13, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, color: UI.ink }}>차시별 진도</div>
        {lessons.map((l) => {
          const done = progress[l.id]?.done;
          return (
            <div key={l.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: UI.mut }}>
                <span>{l.id}. {l.title}</span>
                <span style={{ fontFamily: UI.mono }}>{done ? `퀴즈 ${progress[l.id].score}/${l.quiz.length}` : "미완료"}</span>
              </div>
              <div style={{ background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rPill, height: 8 }}>
                <div style={{ background: done ? UI.lime : "transparent", width: done ? "100%" : "0%", height: "100%", borderRadius: UI.rPill, transition: "width 0.6s cubic-bezier(.22,1,.36,1)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
