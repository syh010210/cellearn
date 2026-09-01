import { UI } from "../../theme";

// 브랜드 로고 — ref_image/brand_logo_ref.png 재현.
// 파란→초록 워드마크 "cellearn", 가운데 'll'은 셀/막대 그래프 모티프의 두 바.
// tone="color"(밝은 배경) | "light"(딥그린 등 어두운 배경).
export default function Logo({ size = 22, tone = "color" }) {
  const blue = "#2f86cf";
  const green = "#2fa96a";
  const barGrad = "linear-gradient(180deg, #2ba6a6 0%, #35b96b 100%)";
  const seg = tone === "light" ? "#ffffff" : null;

  const word = {
    display: "inline-flex", alignItems: "flex-end", gap: size * 0.02,
    fontFamily: UI.font, fontWeight: 800, fontSize: size, lineHeight: 1,
    letterSpacing: "-0.03em", userSelect: "none",
  };
  const bar = (hRatio) => ({
    display: "inline-block", width: size * 0.17, height: size * hRatio,
    borderRadius: size * 0.1, margin: `0 ${size * 0.035}px`,
    background: tone === "light" ? UI.lime : barGrad,
  });

  return (
    <span style={word} aria-label="cellearn" role="img">
      <span style={{ color: seg || blue }}>ce</span>
      <span style={bar(0.7)} />
      <span style={bar(0.92)} />
      <span style={{ color: seg || green }}>earn</span>
    </span>
  );
}
