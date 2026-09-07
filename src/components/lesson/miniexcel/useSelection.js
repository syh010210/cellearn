import { useState, useRef } from "react";

// 선택(anchor/focus) 상태와 이동·범위 계산·이름 상자 이동을 담당하는 훅.
// ctx = MiniExcel이 매 렌더 Object.assign 으로 갱신하는 "안정된 의존성 객체".
// 핸들러는 이벤트 시점에 ctx에서 최신 값을 구조분해하므로, 훅 호출 순서나
// 스테일 클로저와 무관하게 항상 최신 cells/refs/함수를 읽는다(동작 보존).
export function useSelection(ctx) {
  // 선택은 anchor/focus 쌍으로 관리. 단일 선택이면 anchor===focus.
  const [selection, setSelection] = useState(null); // { anchor:{ri,ci}, focus:{ri,ci} } | null
  const selAnchorRef = useRef(null);

  // selection.focus 를 기존 'selected' 처럼 사용
  const selected = selection ? selection.focus : null;

  function clamp(ri, ci) {
    const { rowCount, colCount } = ctx;
    return { ri: Math.max(0, Math.min(rowCount - 1, ri)), ci: Math.max(0, Math.min(colCount - 1, ci)) };
  }

  function selBounds() {
    if (!selection) return null;
    const { anchor, focus } = selection;
    return {
      r1: Math.min(anchor.ri, focus.ri), c1: Math.min(anchor.ci, focus.ci),
      r2: Math.max(anchor.ri, focus.ri), c2: Math.max(anchor.ci, focus.ci),
    };
  }

  // ── 선택 조작 ──
  function selectSingle(ri, ci) {
    const { cells, setInputVal, editModeRef, pointRef } = ctx;
    const cell = { ri, ci };
    selAnchorRef.current = cell;
    setSelection({ anchor: cell, focus: cell });
    setInputVal(cells[ri][ci].editable ? (cells[ri][ci].input || "") : (String(cells[ri][ci].val ?? "")));
    editModeRef.current = "ready";
    pointRef.current = null;
  }

  function setFocusCell(ri, ci) {
    const { cells, setInputVal } = ctx;
    const anchor = selAnchorRef.current || { ri, ci };
    setSelection({ anchor, focus: { ri, ci } });
    setInputVal(cells[ri][ci].editable ? (cells[ri][ci].input || "") : (String(cells[ri][ci].val ?? "")));
  }

  function moveSelection(dr, dc, extend) {
    const { setGraded } = ctx;
    if (!selection) return;
    const cur = selection.focus;
    const { ri, ci } = clamp(cur.ri + dr, cur.ci + dc);
    if (extend) setFocusCell(ri, ci);
    else selectSingle(ri, ci);
    setGraded(false);
  }

  // ── 이름 상자 ──
  function commitNameBox() {
    const { nameBoxVal, setNameBoxEditing, cells, setInputVal, editModeRef, containerRef, parseRangeA1 } = ctx;
    const rng = parseRangeA1(nameBoxVal);
    setNameBoxEditing(false);
    if (!rng) return;
    const a = clamp(rng.r1, rng.c1);
    const f = clamp(rng.r2, rng.c2);
    selAnchorRef.current = a;
    setSelection({ anchor: a, focus: f });
    setInputVal(cells[f.ri]?.[f.ci]?.editable ? (cells[f.ri][f.ci].input || "") : String(cells[f.ri]?.[f.ci]?.val ?? ""));
    editModeRef.current = "ready";
    containerRef.current?.focus({ preventScroll: true });
  }

  return {
    selection, setSelection, selected, selAnchorRef,
    clamp, selBounds, selectSingle, setFocusCell, moveSelection, commitNameBox,
  };
}
