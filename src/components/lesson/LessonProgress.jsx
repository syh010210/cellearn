import { CheckCircle2, Lock } from "lucide-react";
import { allConceptsPassed } from "../../hooks/useLessonFlow";
import { UI } from "../../theme";

// 차시 흐름 진행 표시줄: [개념 1] … [개념 N] → [실습] → [퀴즈]
// step: "concept" | "practice" | "quiz". conceptIdx: 개념 단계일 때 현재 개념.
// 통과한 단계 = 체크 + 클릭 가능, 현재 단계 = 강조, 잠긴 단계 = 흐림 + 클릭 불가.
export default function LessonProgress({ lesson, flow, step, conceptIdx = 0, unlockAll = false, showAdminBadge = false, onJump }) {
  const conceptsDone = allConceptsPassed(lesson, flow);
  const practiceDone = !!flow?.practiceDone;

  const segs = [
    ...lesson.concepts.map((_, i) => {
      const passed = !!flow?.concepts?.[i]?.passed;
      const current = step === "concept" && i === conceptIdx;
      return { key: `c${i}`, label: `개념 ${i + 1}`, passed, current, clickable: unlockAll || passed || current, jump: { step: "concept", idx: i } };
    }),
    (() => { const current = step === "practice"; return { key: "practice", label: "실습", passed: practiceDone, current, clickable: unlockAll || practiceDone || conceptsDone || current, jump: { step: "practice" }, arrow: true }; })(),
    (() => { const current = step === "quiz"; return { key: "quiz", label: "퀴즈", passed: false, current, clickable: unlockAll || practiceDone || current, jump: { step: "quiz" }, arrow: true }; })(),
  ];

  const chipStyle = (s) => ({
    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: UI.rPill,
    fontSize: 12.5, fontWeight: s.current ? 700 : 600, fontFamily: UI.font,
    background: s.current ? UI.teal : s.passed ? UI.limeSoft : UI.surface,
    color: s.current ? "#fff" : s.passed ? UI.teal : s.clickable ? UI.mut : UI.faint,
    border: `1px solid ${s.current ? UI.teal : s.passed ? UI.greenLine : UI.line}`,
    cursor: s.clickable ? "pointer" : "default", opacity: s.clickable || s.current ? 1 : 0.5,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
      {segs.map((s) => (
        <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {s.arrow && <span style={{ color: UI.faint, fontSize: 12 }}>→</span>}
          <button type="button" disabled={!s.clickable} onClick={() => { if (s.clickable) onJump?.(s.jump); }} style={chipStyle(s)}>
            {s.passed && !s.current && <CheckCircle2 size={13} strokeWidth={2} />}
            {!s.passed && !s.current && !s.clickable && <Lock size={12} strokeWidth={2} />}
            {s.label}
          </button>
        </span>
      ))}
      {showAdminBadge && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: UI.warn }}>관리자: 잠금 해제</span>}
    </div>
  );
}
