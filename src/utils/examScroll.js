// 실전 모드 스크롤 최상단.
// window.scrollTo 가 듣지 않는 이유: 실제 스크롤 컨테이너는 사이드바 레이아웃의 본문 영역
// (#main-content, overflow-y:auto)이지 window 가 아니다. 그래서 루트 엘리먼트에서 부모를
// 거슬러 올라가 overflow-y 가 auto/scroll 인 첫 요소를 찾아 scrollTop=0 한다. window.scrollTo 도
// 함께 호출한다. 찾은 컨테이너를 반환한다(디버깅·보고용).
export function scrollExamTop(rootEl) {
  let node = rootEl?.parentElement || null;
  let container = null;
  while (node && node !== document.body && node !== document.documentElement) {
    let oy = "";
    try { oy = getComputedStyle(node).overflowY; } catch { /* 무시 */ }
    if (oy === "auto" || oy === "scroll") { container = node; break; }
    node = node.parentElement;
  }
  if (container) container.scrollTop = 0;
  try { window.scrollTo(0, 0); } catch { /* 무시 */ }
  return container;
}
