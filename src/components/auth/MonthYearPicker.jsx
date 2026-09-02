import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { UI } from "../../theme";
import { S } from "./authStyles";

// 애플(iOS)식 년/월 휠 선택기.
// value/onChange 는 "YYYY-MM-01" 형식(일은 01 고정 — DB의 date 컬럼과 호환).
const ITEM_H = 40;
const VISIBLE = 5; // 홀수 — 가운데가 선택 위치
const PAD = ((VISIBLE - 1) / 2) * ITEM_H;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// 스크롤 위치를 항목에 스냅시키는 한 컬럼(년 또는 월)
function WheelColumn({ items, value, onPick, render }) {
  const ref = useRef(null);
  const settle = useRef(null);

  // 최초 표시 시 현재 선택값을 가운데로(즉시 이동) — 이후에는 스크롤/탭이 위치를 관리
  useLayoutEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = clamp(Math.round(el.scrollTop / ITEM_H), 0, items.length - 1);
      if (el.scrollTop !== idx * ITEM_H) el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
      if (items[idx] !== value) onPick(items[idx]);
    }, 90);
  };

  const pick = (it) => {
    const idx = items.indexOf(it);
    ref.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    onPick(it);
  };

  return (
    <div
      ref={ref}
      className="no-scrollbar"
      onScroll={onScroll}
      style={{ flex: 1, height: ITEM_H * VISIBLE, overflowY: "auto", scrollSnapType: "y mandatory", position: "relative", zIndex: 1 }}
    >
      <div style={{ height: PAD }} />
      {items.map((it) => {
        const sel = it === value;
        return (
          <div
            key={it}
            onClick={() => pick(it)}
            style={{
              height: ITEM_H, display: "flex", alignItems: "center", justifyContent: "center",
              scrollSnapAlign: "center", cursor: "pointer", userSelect: "none",
              fontSize: sel ? 20 : 16, fontWeight: sel ? 800 : 500,
              color: sel ? UI.teal : UI.faint, fontFamily: UI.font,
              transition: "color .12s, font-size .12s",
            }}
          >
            {render(it)}
          </div>
        );
      })}
      <div style={{ height: PAD }} />
    </div>
  );
}

export default function MonthYearPicker({ value, onChange, placeholder = "응시 예정 시기 선택" }) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const years = useMemo(() => Array.from({ length: 4 }, (_, i) => thisYear + i), [thisYear]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

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
              {/* 가운데 선택 밴드 — 상하 라인으로 선택 위치를 또렷하게 (iOS 스타일) */}
              <div style={{
                position: "absolute", left: 4, right: 4, top: PAD, height: ITEM_H, zIndex: 0,
                background: UI.tealSoft, borderTop: `1px solid ${UI.teal}`, borderBottom: `1px solid ${UI.teal}`,
                borderRadius: UI.rSm, pointerEvents: "none",
              }} />
              {/* 위/아래 페이드 마스크 (가운데 밴드는 가리지 않도록 높이 = 한 칸) */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: ITEM_H, background: `linear-gradient(${UI.surface}, transparent)`, pointerEvents: "none", zIndex: 2 }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: ITEM_H, background: `linear-gradient(transparent, ${UI.surface})`, pointerEvents: "none", zIndex: 2 }} />

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
