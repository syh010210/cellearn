export default function Sidebar({ lessons, current, onSelect, progress, onDash, onWrong, wrongCount }) {
  return (
    <div style={{ width: 240, background: "#0f172a", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 16px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>📘 컴활 2급 실기</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        <button
          onClick={onDash}
          style={{ width: "100%", background: current === "dash" ? "#1e3a8a" : "transparent", border: "none", color: current === "dash" ? "#f1f5f9" : "#94a3b8", padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", marginBottom: 4, fontSize: 14, fontWeight: current === "dash" ? 700 : 400 }}
        >
          📊 대시보드
        </button>
        <button
          onClick={onWrong}
          style={{ width: "100%", background: current === "wrong" ? "#7f1d1d" : "transparent", border: "none", color: current === "wrong" ? "#fca5a5" : "#94a3b8", padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", marginBottom: 8, fontSize: 14 }}
        >
          ❌ 오답노트 {wrongCount > 0 ? `(${wrongCount})` : ""}
        </button>

        <div style={{ color: "#64748b", fontSize: 11, padding: "4px 12px", marginBottom: 4 }}>차시 목록</div>
        {lessons.map((l) => (
          <button
            key={l.id}
            onClick={() => onSelect(l.id)}
            style={{ width: "100%", background: current === l.id ? "#1e3a8a" : "transparent", border: "none", color: current === l.id ? "#f1f5f9" : "#94a3b8", padding: "10px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer", marginBottom: 4, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ color: progress[l.id]?.done ? "#22c55e" : "#334155", fontSize: 16 }}>
              {progress[l.id]?.done ? "✓" : "○"}
            </span>
            {l.id}. {l.shortTitle || l.title}
          </button>
        ))}
        {Array.from({ length: Math.max(0, 5 - lessons.length) }, (_, i) => lessons.length + i + 1).map((n) => (
          <div key={n} style={{ padding: "10px 12px", color: "#334155", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>○</span>{n}. 준비 중...
          </div>
        ))}
      </div>
    </div>
  );
}
