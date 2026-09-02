import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { UI } from "../../theme";

export default function Dashboard({ lessons, progress, quizWrongMap, practiceWrongMap }) {
  const done = lessons.filter((l) => progress[l.id]?.done).length;
  const total = lessons.length;
  // 완료한 차시 기준 퀴즈 정답률(전체)
  const doneLessons = lessons.filter((l) => progress[l.id]?.done);
  const doneQ = doneLessons.reduce((s, l) => s + l.quiz.length, 0);
  const correct = doneLessons.reduce((s, l) => s + (progress[l.id]?.score || 0), 0);
  const quizRate = doneQ ? Math.round((correct / doneQ) * 100) : null;
  const quizWrong = Object.values(quizWrongMap).flat().length;
  const practiceWrong = Object.values(practiceWrongMap).flat().length;

  const stats = [
    { label: "완료 차시", value: `${done} / ${total}`, color: UI.teal },
    { label: "퀴즈 정답률", value: quizRate === null ? "—" : `${quizRate}%`, color: UI.green },
    { label: "퀴즈 오답", value: quizWrong, color: UI.red },
    { label: "실습 오답 셀", value: practiceWrong, color: UI.amber },
  ];

  const mono = { fontFamily: UI.mono };

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: UI.ink }}>차시별 진도 &amp; 정답률</div>
          <div style={{ fontSize: 12, color: UI.faint }}>진도율 · 퀴즈 정답률</div>
        </div>
        {lessons.map((l) => {
          const p = progress[l.id];
          const isDone = !!p?.done;
          const prog = isDone ? 100 : 0;
          const quizLen = l.quiz.length;
          const scoreRate = isDone && quizLen ? Math.round((p.score / quizLen) * 100) : null;
          const qWrong = (quizWrongMap[l.id] || []).length;
          const pWrong = (practiceWrongMap[l.id] || []).length;
          const weak = isDone && ((scoreRate !== null && scoreRate < 80) || qWrong > 0 || pWrong > 0);
          return (
            <div key={l.id} style={{ padding: "12px 0", borderTop: l.id === lessons[0].id ? "none" : `1px solid ${UI.gridline}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {isDone
                  ? <CheckCircle2 size={16} strokeWidth={2} color={UI.correct} style={{ flexShrink: 0 }} />
                  : <Circle size={16} strokeWidth={1.5} color="#cfd6d2" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 13.5, fontWeight: 600, color: isDone ? UI.ink : UI.mut, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.id}. {l.title}</span>
                {weak && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: UI.warn, fontSize: 11.5, fontWeight: 700, background: "#fbf1dd", border: `1px solid #f0dca8`, padding: "2px 8px", borderRadius: UI.rPill }}>
                    <AlertTriangle size={12} strokeWidth={2} /> 복습 필요
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: UI.mut, marginBottom: 4 }}>
                    <span>진도율</span><span style={{ ...mono, color: UI.ink }}>{prog}%</span>
                  </div>
                  <div style={{ height: 6, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rPill }}>
                    <div style={{ width: `${prog}%`, height: "100%", background: prog === 100 ? UI.lime : UI.teal, borderRadius: UI.rPill, transition: "width 0.6s cubic-bezier(.22,1,.36,1)" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: UI.mut, marginBottom: 4 }}>
                    <span>퀴즈 정답률</span>
                    {scoreRate === null ? (
                      <span style={{ color: UI.faint }}>학습 중</span>
                    ) : (
                      <span style={{ ...mono, color: weak ? UI.warn : UI.ink }}>
                        {scoreRate}%<span style={{ color: UI.faint }}> ({p.score}/{quizLen})</span>
                      </span>
                    )}
                  </div>
                  <div style={{ height: 6, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rPill }}>
                    <div style={{ width: `${scoreRate ?? 0}%`, height: "100%", background: scoreRate === null ? "transparent" : weak ? UI.warn : UI.correct, borderRadius: UI.rPill, transition: "width 0.6s cubic-bezier(.22,1,.36,1)" }} />
                  </div>
                  {(qWrong > 0 || pWrong > 0) && (
                    <div style={{ marginTop: 4, fontSize: 11, color: UI.faint }}>
                      {qWrong > 0 && <span>퀴즈 오답 <span style={mono}>{qWrong}</span></span>}
                      {qWrong > 0 && pWrong > 0 && " · "}
                      {pWrong > 0 && <span>실습 오답 <span style={mono}>{pWrong}</span></span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
