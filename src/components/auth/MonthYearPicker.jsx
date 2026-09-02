import { useState, useRef, useEffect, useCallback } from "react";
import { UI } from "../../theme";
import { S } from "./authStyles";

// 애플(iOS)식 년/월 휠 선택기.
// value/onChange 는 "YYYY-MM-01" 형식(일은 01 고정 — DB의 date 컬럼과 호환).
const ITEM_H = 40;
const VISIBLE = 5; // 홀수 — 가운데가 선택 위치

// 스크롤 위치를 항목 인덱스로 스냅시키는 한 컬럼(년 또는 월)
function WheelColumn({ items, value, onPick, render }) {
  const ref = useRef(null);
  const timer = useRef(null);
  const pad = ((VISIBLE - 1) / 2) * ITEM_H;

  // 외부 value 변경 시 해당 항목을 가운데로(즉시 이동)
  useEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H;
  }, [value, items]);

  const onScroll = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)));
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" }); // 스냅
      if (items[idx] !== value) onPick(items[idx]);
    }, 100);
  }, [items, value, onPick]);

  const pick = (it) => {
    onPick(it);
    const idx = items.indexOf(it);
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
  };

  return (
    <div
      ref={ref}
      className="no-scrollbar"
      onScroll={onScroll}
      style={{ flex: 1, height: ITEM_H * VISIBLE, overflowY: "auto", scrollSnapType: "y mandatory" }}
    >
      <div style={{ height: pad }} />
      {items.map((it) => {
        const sel = it === value;
        return (
          <div
            key={it}
            onClick={() => pick(it)}
            style={{
              height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
              scrollSnapAlign: "center", cursor: "pointer", userSelect: "none",
              fontSize: sel ? 19 : 16, fontWeight: sel ? 700 : 500,
              color: sel ? UI.ink : UI.faint, fontFamily: UI.font,
              transition: "color .15s, font-size .15s",
            }}
          >
            {render(it)}
          </div>
        );
      })}
      <div style={{ height: pad }} />
    </div>
  );
}

export default function MonthYearPicker({ value, onChange, placeholder = "응시 예정 시기 선택" }) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => thisYear + i); // 올해~+3년
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const parsed = value && value.length >= 7
    ? { y: +value.slice(0, 4), m: +value.slice(5, 7) }
    : null;

  const [open, setOpen] = useState(false);
  const [y, setY] = useState(parsed?.y ?? thisYear);
  const [m, setM] = useState(parsed?.m ?? now.getMonth() + 1);

  // 팝오버 열 때 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setY(parsed?.y ?? thisYear);
      setM(parsed?.m ?? now.getMonth() + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const confirm = () => { onChange(`${y}-${String(m).padStart(2, "0")}-01`); setOpen(false); };
  const clear = () => { onChange(""); setOpen(false); };

  const label = parsed ? `${parsed.y}년 ${parsed.m}월` : placeholder;

  // 입력창처럼 보이는 필드 버튼
  const field = {
    ...S.input,
    textAlign: "left", cursor: "pointer",
    color: parsed ? UI.ink : UI.faint,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  };

  return (
    <div style={{ position: "relative" }}>
      <button type="button" style={field} onClick={() => setOpen((o) => !o)}>
        <span>{label}</span>
        <span style={{ color: UI.faint, fontSize: 12 }}>▾</span>
      </button>

      {open && (
        <>
          {/* 바깥 클릭 시 닫힘 */}
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 41,
              background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg,
              boxShadow: UI.shadow, padding: 12,
            }}
          >
            <div style={{ position: "relative", display: "flex", gap: 8 }}>
              {/* 가운데 선택 하이라이트 밴드 */}
              <div style={{
                position: "absolute", left: 0, right: 0, top: ((VISIBLE - 1) / 2) * ITEM_H, height: ITEM_H,
                background: UI.tealSoft, borderRadius: UI.rMd, pointerEvents: "none",
              }} />
              {/* 위/아래 페이드 마스크 */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: ITEM_H * 1.5, background: `linear-gradient(${UI.surface}, transparent)`, pointerEvents: "none", zIndex: 2 }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: ITEM_H * 1.5, background: `linear-gradient(transparent, ${UI.surface})`, pointerEvents: "none", zIndex: 2 }} />

              <WheelColumn items={years} value={y} onPick={setY} render={(v) => `${v}년`} />
              <WheelColumn items={months} value={m} onPick={setM} render={(v) => `${v}월`} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" onClick={clear} style={{ flex: "0 0 auto", background: UI.panelAlt, border: `1px solid ${UI.line}`, color: UI.mut, padding: "9px 14px", borderRadius: UI.rMd, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: UI.font }}>미정</button>
              <button type="button" onClick={confirm} style={{ flex: 1, background: UI.teal, color: "#fff", border: "none", padding: "9px", borderRadius: UI.rMd, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: UI.font }}>확인</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
