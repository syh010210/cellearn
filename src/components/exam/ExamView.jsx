import { useState } from "react";
import { Target, Shuffle, CheckCircle2, XCircle } from "lucide-react";
import MiniExcel from "../lesson/MiniExcel";
import { EXAM_PROBLEMS, availableTopics, pickProblems } from "../../data/examBank";
import { UI } from "../../theme";

// 실전 모드 — 주제를 골라 실제 시험 형식 문제를 원하는 만큼 생성해 푼다.
// 문제 뱅크(src/data/exam/*.json)가 채워질수록 다양해진다.
export default function ExamView() {
  const topics = availableTopics();
  const [selected, setSelected] = useState([]); // 주제 key 배열(빈 배열 = 전체)
  const [count, setCount] = useState(5);
  const [problems, setProblems] = useState(null);

  const toggle = (k) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const generate = () => setProblems(pickProblems(selected, count));

  const chip = (active) => ({
    padding: "7px 14px", borderRadius: UI.rPill, fontSize: 13, fontWeight: active ? 700 : 500,
    cursor: "pointer", fontFamily: UI.font,
    background: active ? UI.teal : UI.surface, color: active ? "#fff" : UI.mut,
    border: `1px solid ${active ? UI.teal : UI.line}`,
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <Target size={15} strokeWidth={2} /> 실전 모드
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: UI.ink }}>주제를 골라 실전 문제를 생성하세요</h2>
      <p style={{ color: UI.mut, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
        최근 기출 유형에서 원하는 주제의 문제를 원하는 만큼 만들어 풉니다. 시험 직전 감각 유지에 좋습니다.
      </p>

      {/* 설정 */}
      <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: UI.ink, marginBottom: 10 }}>주제 <span style={{ color: UI.faint, fontWeight: 500 }}>(선택 안 하면 전체)</span></div>
        {topics.length === 0 ? (
          <div style={{ color: UI.mut, fontSize: 14 }}>아직 등록된 문제가 없습니다. 문제 뱅크가 채워지면 여기에서 주제를 고를 수 있어요.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topics.map((t) => (
              <button key={t.key} onClick={() => toggle(t.key)} style={chip(selected.includes(t.key))}>{t.label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: UI.ink }}>문항 수</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[5, 10, 20].map((n) => (
              <button key={n} onClick={() => setCount(n)} style={chip(count === n)}>{n}</button>
            ))}
          </div>
          <button
            onClick={generate}
            disabled={EXAM_PROBLEMS.length === 0}
            style={{ marginLeft: "auto", background: EXAM_PROBLEMS.length ? UI.teal : "#cfd6d2", color: "#fff", border: "none", padding: "11px 20px", borderRadius: UI.rMd, fontSize: 14, fontWeight: 700, cursor: EXAM_PROBLEMS.length ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: UI.font }}
          >
            <Shuffle size={16} strokeWidth={2} /> {problems ? "다시 생성" : "문제 생성"}
          </button>
        </div>
      </div>

      {/* 생성된 문제 */}
      {problems && (
        <div className="cl-fade-up">
          {problems.length === 0 ? (
            <div style={{ color: UI.mut, fontSize: 14, textAlign: "center", padding: 24 }}>선택한 주제에 해당하는 문제가 아직 없습니다.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {problems.map((p, i) => (
                <div key={p.id || i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: UI.mono, fontSize: 12, color: UI.faint }}>{i + 1}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: UI.ink }}>{p.title}</span>
                    {p.difficulty && <span style={{ fontSize: 11, color: UI.mut, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rPill, padding: "2px 8px" }}>{p.difficulty}</span>}
                  </div>
                  {p.type === "quiz" ? <ExamQuiz p={p} /> : <MiniExcel practice={p.practice} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 객관식 실전 문제 — 선택 후 채점(정답·해설 공개)
function ExamQuiz({ p }) {
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 12, color: UI.ink }}>{p.question}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {p.options.map((opt, oi) => {
          const picked = sel === oi;
          const correct = checked && oi === p.answer;
          const wrong = checked && picked && oi !== p.answer;
          const bg = correct ? UI.limeSoft : wrong ? UI.redSoft : picked ? UI.tealSoft : UI.surface;
          const bc = correct ? UI.greenLine : wrong ? UI.redLine : picked ? UI.teal : UI.line;
          const tc = correct ? UI.correct : wrong ? UI.wrong : UI.ink;
          return (
            <button key={oi} disabled={checked} onClick={() => setSel(oi)}
              style={{ textAlign: "left", padding: "11px 14px", borderRadius: UI.rMd, border: `1px solid ${bc}`, background: bg, color: tc, cursor: checked ? "default" : "pointer", fontSize: 14, fontWeight: picked || correct ? 600 : 400, fontFamily: UI.font, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{["①", "②", "③", "④"][oi]}</span><span>{opt}</span>
              {correct && <CheckCircle2 size={15} strokeWidth={2} color={UI.correct} style={{ marginLeft: "auto" }} />}
              {wrong && <XCircle size={15} strokeWidth={2} color={UI.wrong} style={{ marginLeft: "auto" }} />}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button onClick={() => setChecked(true)} disabled={sel === null}
          style={{ width: "100%", marginTop: 14, padding: 11, borderRadius: UI.rMd, border: "none", background: sel === null ? "#cfd6d2" : UI.teal, color: "#fff", fontSize: 14, fontWeight: 700, cursor: sel === null ? "not-allowed" : "pointer" }}>
          채점하기
        </button>
      ) : (
        p.explanation && (
          <div style={{ marginTop: 12, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderLeft: `3px solid ${UI.teal}`, borderRadius: UI.rSm, padding: "10px 12px", fontSize: 13, color: UI.mut, lineHeight: 1.7 }}>
            <b style={{ color: UI.ink }}>풀이</b> · {p.explanation}
          </div>
        )
      )}
    </div>
  );
}
