import { UI } from "../../theme";

// 인증 화면 공용 인라인 스타일 — 밝고 깔끔한 톤 (랜딩과 통일)
export const S = {
  wrap: { minHeight: "100vh", background: UI.bg, color: UI.ink, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px", fontFamily: UI.font },
  card: { width: "100%", maxWidth: 420, background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 34, boxShadow: UI.shadow },
  back: { background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "8px 15px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 },
  title: { fontSize: 23, fontWeight: 700, marginBottom: 4, color: UI.ink },
  sub: { fontSize: 13.5, color: UI.mut, marginBottom: 24 },
  label: { fontSize: 13, color: UI.mut, margin: "14px 0 6px", display: "block", fontWeight: 600 },
  input: { width: "100%", boxSizing: "border-box", background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, color: UI.ink, padding: "11px 12px", fontSize: 14, fontFamily: UI.font },
  primary: { width: "100%", marginTop: 22, background: UI.teal, color: "#fff", border: "none", padding: "13px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: UI.font },
  ghost: { background: "transparent", border: "none", color: UI.teal, cursor: "pointer", fontSize: 13, fontWeight: 700 },
  error: { background: UI.redSoft, border: `1px solid ${UI.redLine}`, color: UI.red, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginTop: 16 },
  ok: { background: UI.greenSoft, border: `1px solid ${UI.greenLine}`, color: UI.green, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginTop: 16 },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 8, marginTop: 12, fontSize: 13, color: UI.mut },
  banner: { background: "#fdf6e3", border: "1px solid #f0e2b6", color: "#8a6d1a", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginBottom: 18 },
};
