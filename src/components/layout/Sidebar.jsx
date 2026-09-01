import { UI } from "../../theme";

export default function Sidebar({ lessons, current, onSelect, progress, onDash, onWrong, wrongCount }) {
  const navBtn = (active, activeBg = UI.teal, activeColor = "#fff") => ({
    width: "100%",
    background: active ? activeBg : "transparent",
    border: "none",
    color: active ? activeColor : UI.mut,
    padding: "10px 12px",
    borderRadius: 10,
    textAlign: "left",
    cursor: "pointer",
    marginBottom: 4,
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    fontFamily: UI.font,
  });

  return (
    <div style={{ width: 240, background: UI.panel, borderRight: `1px solid ${UI.line}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 18px", borderBottom: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, background: UI.teal, color: UI.lime, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>C</span>
        <span style={{ fontWeight: 800, fontSize: 15.5, color: UI.ink }}>컴활 2급 실기</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        <button onClick={onDash} style={navBtn(current === "dash")}>📊 대시보드</button>
        <button onClick={onWrong} style={navBtn(current === "wrong", UI.redSoft, UI.red)}>
          ❌ 오답노트 {wrongCount > 0 ? `(${wrongCount})` : ""}
        </button>

        <div style={{ color: UI.faint, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, padding: "12px 12px 6px" }}>차시 목록</div>
        {lessons.map((l) => {
          const active = current === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l.id)}
              style={{ ...navBtn(active), fontSize: 13, display: "flex", alignItems: "center", gap: 9 }}
            >
              <span style={{ color: progress[l.id]?.done ? UI.green : (active ? UI.lime : "#cfd6d2"), fontSize: 15 }}>
                {progress[l.id]?.done ? "✓" : "○"}
              </span>
              {l.id}. {l.shortTitle || l.title}
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, 5 - lessons.length) }, (_, i) => lessons.length + i + 1).map((n) => (
          <div key={n} style={{ padding: "10px 12px", color: "#c2cac6", fontSize: 13, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 15 }}>○</span>{n}. 준비 중...
          </div>
        ))}
      </div>
    </div>
  );
}
