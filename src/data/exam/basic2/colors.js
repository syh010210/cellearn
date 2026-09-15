// 표준색 10개 (테마색은 tint 매핑이 불안정해 이번 범위 밖).
// 채점기와 템플릿이 같이 쓴다. 문장 표기는 '표준색 - 노랑' (하이픈 양쪽 공백).
export const STANDARD_COLORS = [
  { name: "진한 빨강", rgb: "C00000" },
  { name: "빨강", rgb: "FF0000" },
  { name: "주황", rgb: "FFC000" },
  { name: "노랑", rgb: "FFFF00" },
  { name: "연한 녹색", rgb: "92D050" },
  { name: "녹색", rgb: "00B050" },
  { name: "연한 파랑", rgb: "00B0F0" },
  { name: "파랑", rgb: "0070C0" },
  { name: "진한 파랑", rgb: "002060" },
  { name: "자주", rgb: "7030A0" },
];

// RGB 정규화: 대소문자·알파(ARGB 8자리) 무시 → 뒤 6자리.
export const normColor = (s) => String(s ?? "").toUpperCase().slice(-6);
export const colorEq = (a, b) => a != null && b != null && normColor(a) === normColor(b);

const byRgb = Object.fromEntries(STANDARD_COLORS.map((c) => [normColor(c.rgb), c.name]));
// rgb → "표준색 - 노랑" (표에 없으면 rgb 그대로)
export const colorLabel = (rgb) => { const n = byRgb[normColor(rgb)]; return n ? `표준색 - ${n}` : String(rgb); };
export const findColor = (rgb) => STANDARD_COLORS.find((c) => normColor(c.rgb) === normColor(rgb)) || null;
