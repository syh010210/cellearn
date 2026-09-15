import { useState, useEffect, useLayoutEffect } from "react";

// 미니 엑셀 따라 하기 오버레이. MiniExcel 안(position:relative 래퍼)에 렌더된다.
// 각 단계는 대상 요소(셀·입력줄·채우기 핸들·채점 버튼)를 하이라이트하고 말풍선 한 줄을 띄우며,
// 학생이 실제로 그 동작을 해야(event 로 감지) 다음 단계로 넘어간다. 버튼으로는 넘어갈 수 없다.
// props: steps[{target,text,match}], resolveTarget(target)->DOMEl, wrapperRef, event({e,seq}), onSkip, onComplete
export default function MiniExcelTutorial({ steps, resolveTarget, wrapperRef, event, onSkip, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[stepIdx];

  // 이벤트로 단계 진행 (matching 동작에서만)
  useEffect(() => {
    if (!event || !step) return;
    if (step.match(event.e)) {
      if (stepIdx + 1 >= steps.length) onComplete?.();
      else setStepIdx((i) => i + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // 대상 위치 측정 (스크롤·리사이즈·레이아웃 변화 추적)
  useLayoutEffect(() => {
    function measure() {
      const el = step && resolveTarget(step.target);
      const wrap = wrapperRef.current;
      if (!el || !wrap) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      setRect({ top: r.top - w.top, left: r.left - w.left, width: r.width, height: r.height });
    }
    measure();
    const onScroll = () => measure();
    window.addEventListener("resize", onScroll, true);
    window.addEventListener("scroll", onScroll, true);
    const id = setInterval(measure, 300);
    return () => { window.removeEventListener("resize", onScroll, true); window.removeEventListener("scroll", onScroll, true); clearInterval(id); };
  }, [stepIdx, step, resolveTarget, wrapperRef]);

  if (!step) return null;
  const TEAL = "#217346";
  return (
    <>
      {rect && (
        <div style={{ position: "absolute", top: rect.top - 3, left: rect.left - 3, width: rect.width + 6, height: rect.height + 6, border: `2px solid ${TEAL}`, borderRadius: 6, boxShadow: "0 0 0 9999px rgba(15,25,20,0.20)", pointerEvents: "none", zIndex: 40, transition: "top .12s, left .12s, width .12s, height .12s" }} />
      )}
      <div style={{ position: "absolute", top: rect ? rect.top + rect.height + 8 : 8, left: rect ? Math.max(0, rect.left) : 8, maxWidth: 300, background: "#1f2937", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 13px", borderRadius: 8, zIndex: 41, lineHeight: 1.5, boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>
        {step.text}
        <div style={{ fontSize: 11, color: "#a7b3ad", marginTop: 4 }}>{stepIdx + 1} / {steps.length}</div>
      </div>
      <button onClick={onSkip} style={{ position: "absolute", top: 6, right: 6, zIndex: 42, background: "rgba(255,255,255,0.92)", border: "1px solid #d0d0d0", color: "#666", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, cursor: "pointer" }}>건너뛰기</button>
    </>
  );
}
