import { LayoutDashboard, XCircle, CheckCircle2, Circle } from "lucide-react";
import { UI } from "../../theme";

export default function Sidebar({ lessons, current, onSelect, progress, onDash, onWrong, wrongCount }) {
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

        <div style={{ color: UI.faint, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, padding: "12px 12px 6px" }}>차시 목록</div>
        {lessons.map((l) => {
          const active = current === l.id;
          const done = progress[l.id]?.done;
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              style={{ ...navBtn(active), fontSize: 13 }}
            >
              {done
                ? <CheckCircle2 size={16} strokeWidth={2} color={active ? "#fff" : UI.correct} style={{ flexShrink: 0 }} />
                : <Circle size={16} strokeWidth={1.5} color={active ? UI.lime : "#cfd6d2"} style={{ flexShrink: 0 }} />}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.id}. {l.shortTitle || l.title}</span>
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, 5 - lessons.length) }, (_, i) => lessons.length + i + 1).map((n) => (
          <div key={n} style={{ padding: "10px 12px", color: "#c2cac6", fontSize: 13, display: "flex", alignItems: "center", gap: 9 }}>
            <Circle size={16} strokeWidth={1.5} color="#d3dad6" style={{ flexShrink: 0 }} />{n}. 준비 중...
          </div>
        ))}
      </div>
    </div>
  );
}
