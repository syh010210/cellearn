import { LayoutDashboard, XCircle, CheckCircle2, Circle, Lock, ClipboardCheck } from "lucide-react";
import { DAYS, isDayComplete, isDayUnlocked, isDayCleared } from "../../data/days";
import { UI } from "../../theme";

export default function Sidebar({ lessons, current, onSelect, progress, dayClears, onDash, onWrong, wrongCount, onGate }) {
  const navBtn = (active, activeBg = UI.teal, activeColor = "#fff") => ({
    width: "100%",
    background: active ? activeBg : "transparent",
    border: "none",
    color: active ? activeColor : UI.mut,
    padding: "10px 12px",
    borderRadius: UI.rMd,
    textAlign: "left",
    cursor: "pointer",
    marginBottom: 4,
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    fontFamily: UI.font,
    display: "flex",
    alignItems: "center",
    gap: 9,
  });

  const byId = (id) => lessons.find((l) => l.id === id);

  return (
    <div style={{ width: 240, background: UI.surface, borderRight: `1px solid ${UI.line}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 18px", borderBottom: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: UI.teal, color: UI.lime, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, fontFamily: UI.mono }}>C</span>
        <span style={{ fontWeight: 700, fontSize: 15.5, color: UI.ink }}>컴활 2급 실기</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        <button onClick={onDash} style={navBtn(current === "dash")}>
          <LayoutDashboard size={17} strokeWidth={current === "dash" ? 2 : 1.5} /> 대시보드
        </button>
        <button onClick={onWrong} style={navBtn(current === "wrong", UI.redSoft, UI.red)}>
          <XCircle size={17} strokeWidth={current === "wrong" ? 2 : 1.5} /> 오답노트
          {wrongCount > 0 && (
            <span style={{ marginLeft: "auto", background: UI.redSoft, color: UI.red, fontFamily: UI.mono, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: UI.rPill, border: `1px solid ${UI.redLine}` }}>{wrongCount}</span>
          )}
        </button>

        {DAYS.map((d) => {
          const unlocked = isDayUnlocked(d.day, dayClears);
          const cleared = isDayCleared(d.day, dayClears);
          const complete = isDayComplete(d.day, progress);
          const gateActive = current === `gate-${d.day}`;
          return (
            <div key={d.day} style={{ marginTop: 12 }}>
              {/* 일차 헤더 */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 6px", color: UI.faint, fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>
                {cleared ? <CheckCircle2 size={13} strokeWidth={2} color={UI.correct} />
                  : !unlocked ? <Lock size={12} strokeWidth={2} color={UI.faint} />
                  : null}
                {d.day}일차
                <span style={{ color: "#cfd6d2", fontWeight: 500 }}>({d.lessons[0]}~{d.lessons[d.lessons.length - 1]}차시)</span>
              </div>

              {/* 차시들 */}
              {d.lessons.map((id) => {
                const l = byId(id);
                if (!l) return (
                  <div key={id} style={{ padding: "10px 12px", color: "#c2cac6", fontSize: 13, display: "flex", alignItems: "center", gap: 9 }}>
                    <Circle size={16} strokeWidth={1.5} color="#d3dad6" style={{ flexShrink: 0 }} />{id}. 준비 중...
                  </div>
                );
                const active = current === id;
                const done = progress[id]?.done;
                return (
                  <button key={id} onClick={() => onSelect(id)} style={{ ...navBtn(active), fontSize: 13, opacity: unlocked ? 1 : 0.55 }}>
                    {!unlocked
                      ? <Lock size={15} strokeWidth={1.5} color={active ? "#fff" : UI.faint} style={{ flexShrink: 0 }} />
                      : done
                      ? <CheckCircle2 size={16} strokeWidth={2} color={active ? "#fff" : UI.correct} style={{ flexShrink: 0 }} />
                      : <Circle size={16} strokeWidth={1.5} color={active ? UI.lime : "#cfd6d2"} style={{ flexShrink: 0 }} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id}. {l.shortTitle || l.title}</span>
                  </button>
                );
              })}

              {/* 마무리 시험 진입 (일차 100% + 아직 미클리어) */}
              {unlocked && complete && !cleared && (
                <button
                  onClick={() => onGate(d.day)}
                  style={{ ...navBtn(gateActive, UI.lime, UI.teal), fontSize: 12.5, fontWeight: 700, marginTop: 2, background: gateActive ? UI.lime : UI.limeSoft, color: UI.teal }}
                >
                  <ClipboardCheck size={15} strokeWidth={2} /> {d.day}일차 마무리 시험
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
