// 앱 전역 UI 토큰 — 디자인 리뉴얼(docs/DESIGN_RENEWAL_SPEC.md) 반영.
// 단일 소스(single source of truth): LandingPage·authStyles·diagrams 등은 이 토큰을 import 해서 쓴다.
// 기존 키(bg/panel/mut/teal/green/red/amber…)는 하위호환을 위해 유지하되 값만 새 팔레트로 갱신했다.
const brandGreen = "#123a33";

export const UI = {
  // ── base
  bg: "#f2f4f2", // 오프화이트(중립)
  surface: "#ffffff", // 카드/표면
  panel: "#ffffff", // (호환) = surface
  panelAlt: "#f7f9f8",
  line: "#e3e8e5",
  gridline: "#eaefec", // ★ 셀그리드 텍스처용 (line보다 옅게)

  // ── ink
  ink: "#12211d",
  inkSoft: "#5c6b66",
  inkFaint: "#8b988f",
  mut: "#5c6b66", // (호환) = inkSoft
  faint: "#8b988f", // (호환) = inkFaint

  // ── brand
  teal: brandGreen, // 딥그린 — 브랜드/강조/CTA 기본
  tealCard: "#16443b",
  tealSoft: "#e8f0ec",
  greenDeep: "#0d2a25", // 푸터/다크 섹션 (블랙 섹션 폐지 후 일원화)
  invMut: "#9fb4ad", // 딥그린 위 보조 텍스트
  lime: "#c8f26a", // ★ 의미색: 정답/완료/하이라이트 전용
  limeSoft: "#eef9d8",

  // ── semantic (correct/wrong/warn = 기존 green/red/amber 키의 새 이름)
  correct: "#1f9d55", green: "#1f9d55", greenSoft: "#e7f6ec", greenLine: "#bfe6cd",
  wrong: "#d64545", red: "#d64545", redSoft: "#fbeaea", redLine: "#f2cccc",
  warn: "#c98a1a", amber: "#c98a1a",

  // ── radius 위계 (알약 폐지, 3단계)
  rLg: 16, // 대형 컨테이너/섹션 카드
  rMd: 10, // 일반 카드·입력·버튼
  rSm: 6,  // 코드 토큰형 칩
  rPill: 999, // 상태 뱃지/칩 전용 예외

  // ── shadow (기본 없음, sticky/모달만)
  shadow: "0 8px 24px rgba(18,33,29,0.08)",

  // ── type
  font: "'Pretendard','Noto Sans KR',system-ui,sans-serif",
  mono: "'JetBrains Mono','SFMono-Regular',Consolas,monospace", // 함수·수식·셀주소·숫자·금액 전용
};
