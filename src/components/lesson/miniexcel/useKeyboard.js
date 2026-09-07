import { formatRef, findRefAtCursor, cycleReference } from "../../../utils/formulaUtils";

// 컨테이너 키보드(선택 상태)·입력창 키보드(입력/편집 모드)와
// 참조 선택 모드(pointRef)·F4 순환·Ctrl+Z/Y/C/V 를 담당하는 훅.
// ctx = MiniExcel이 매 렌더 Object.assign 으로 갱신하는 "안정된 의존성 객체".
// 핸들러는 이벤트 시점에 ctx에서 최신 값을 구조분해하므로 동작이 보존된다.
// 참조 토큰 정규식은 직접 쓰지 않고 formulaUtils의 순수 함수(formatRef/findRefAtCursor/cycleReference)만 호출한다.
export function useKeyboard(ctx) {
  // ── 참조 선택 모드 코어 ──
  // pointRef = { start, end, anchor, focus, dollar } 하나로 관리.
  // start·end = inputVal에서 이 참조가 차지하는 문자 범위, anchor·focus = 셀 좌표, dollar = $ 유지 플래그.
  function pointAddr(p) {
    const single = p.anchor.ri === p.focus.ri && p.anchor.ci === p.focus.ci;
    return single
      ? formatRef(p.anchor.ri, p.anchor.ci, p.dollar)
      : `${formatRef(p.anchor.ri, p.anchor.ci, p.dollar)}:${formatRef(p.focus.ri, p.focus.ci, p.dollar)}`;
  }
  // 방향키·클릭·드래그가 공유하는 치환 코어. pointRef.start~end 를 addr 로 항상 치환.
  // 함수형 setInputVal 로 최신 문자열을 읽어 포인터 핸들러(스테일 클로저)에서도 안전.
  function applyPointRefRange(anchor, focus) {
    const { pointRef, lastEditWasTypeRef, setInputVal, nextCursorPos } = ctx;
    const p = pointRef.current;
    if (!p) return;
    const oldEnd = p.end;
    const addr = pointAddr({ ...p, anchor, focus });
    pointRef.current = { ...p, anchor, focus, end: p.start + addr.length };
    lastEditWasTypeRef.current = false;
    setInputVal((v) => v.slice(0, p.start) + addr + v.slice(oldEnd));
    nextCursorPos.current = p.start + addr.length;
  }
  function replaceReference(start, end, anchor, focus, dollar) {
    const { pointRef } = ctx;
    pointRef.current = { start, end, anchor, focus, dollar: dollar || { col: false, row: false } };
    applyPointRefRange(anchor, focus);
  }
  function pointReferenceMove(dr, dc, shift) {
    const { pointRef, clamp, selected, inputRef, inputVal } = ctx;
    if (!pointRef.current) {
      // 새 참조: start=end=커서, anchor=focus=현재 선택 셀에서 이동한 셀
      const base = clamp((selected?.ri ?? 0) + dr, (selected?.ci ?? 0) + dc);
      const at = inputRef.current?.selectionStart ?? inputVal.length;
      replaceReference(at, at, base, base);
      return;
    }
    const p = pointRef.current;
    const focus = clamp(p.focus.ri + dr, p.focus.ci + dc);
    const anchor = shift ? p.anchor : focus;
    applyPointRefRange(anchor, focus);
  }
  function isRefContext(val, pos) {
    // 커서 바로 앞 글자가 =, (, ,, 연산자면 참조 삽입 가능
    const before = val.slice(0, pos).trimEnd();
    const last = before.slice(-1);
    return before.startsWith("=") && (last === "=" || last === "(" || last === "," || "+-*/^<>=".includes(last));
  }

  // ── 컨테이너 키보드 (선택 상태) ──
  function handleContainerKeyDown(e) {
    const {
      selection, cells, inputRef, undo, redo, copySelection, pasteClipboard,
      moveSelection, selectSingle, deleteSelection, enterEditMode,
      editModeRef, lastEditWasTypeRef, nextCursorPos, setInputVal,
    } = ctx;
    if (!selection) return;
    // 입력창이 포커스면 컨테이너 핸들러는 무시 (input onKeyDown이 처리)
    if (document.activeElement === inputRef.current) return;
    const { ri, ci } = selection.focus;
    const key = e.key;
    const cell = cells[ri]?.[ci];

    if ((e.ctrlKey || e.metaKey) && (key === "z" || key === "Z")) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (key === "y" || key === "Y")) { e.preventDefault(); redo(); return; }
    if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "C")) { e.preventDefault(); copySelection(); return; }
    if ((e.ctrlKey || e.metaKey) && (key === "v" || key === "V")) { e.preventDefault(); pasteClipboard(); return; }
    if (e.ctrlKey || e.metaKey) return;

    if (key === "ArrowUp")    { e.preventDefault(); moveSelection(-1, 0, e.shiftKey); return; }
    if (key === "ArrowDown")  { e.preventDefault(); moveSelection(1, 0, e.shiftKey); return; }
    if (key === "ArrowLeft")  { e.preventDefault(); moveSelection(0, -1, e.shiftKey); return; }
    if (key === "ArrowRight") { e.preventDefault(); moveSelection(0, 1, e.shiftKey); return; }
    if (key === "Enter")      { e.preventDefault(); moveSelection(e.shiftKey ? -1 : 1, 0, false); return; }
    if (key === "Tab")        { e.preventDefault(); moveSelection(0, e.shiftKey ? -1 : 1, false); return; }
    if (key === "Escape")     { e.preventDefault(); if (selection?.focus) selectSingle(ri, ci); return; }
    if (key === "Delete" || key === "Backspace") { e.preventDefault(); deleteSelection(); return; }
    if (key === "F2") {
      e.preventDefault();
      if (cell?.editable) enterEditMode(ri, ci);
      return;
    }
    // 출력 가능한 한 글자 (글자/숫자/=,+,- 등) → 입력 모드 진입
    if (key.length === 1 && !e.altKey) {
      if (!cell?.editable) { e.preventDefault(); return; }
      e.preventDefault();
      editModeRef.current = "enter";
      lastEditWasTypeRef.current = true;
      nextCursorPos.current = null;
      setInputVal(key);
      // 입력 모드 진입: nextCursorPos에 의존하지 않고 포커스 직후 같은 콜백에서 커서를 끝으로.
      setTimeout(() => {
        const el = inputRef.current;
        if (el) { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); }
      }, 0);
    }
  }

  // ── 입력창 키보드 (입력/편집 모드) ──
  function handleInputKeyDown(e) {
    const {
      selected, pointRef, ac, setAcIndex, acIndex, insertFunction, acClosedRef,
      inputVal, inputRef, nextSelRef, nextCursorPos, lastEditWasTypeRef, setInputVal,
      commitInput, clamp, selectSingle, containerRef, cells, editModeRef, parseA1,
    } = ctx;
    if (!selected) return;
    const { ri, ci } = selected;
    const key = e.key;

    // 참조 선택 모드는 F4·(Shift+)방향키에서만 유지된다. 그 외 키가 오면 즉시 종료.
    if (key !== "F4" && !key.startsWith("Arrow")) pointRef.current = null;

    // 자동완성 드롭다운이 열려 있으면 방향키/Tab/Enter/Esc는 드롭다운이 우선
    if (ac) {
      if (key === "ArrowDown") { e.preventDefault(); setAcIndex((i) => Math.min(ac.items.length - 1, i + 1)); return; }
      if (key === "ArrowUp")   { e.preventDefault(); setAcIndex((i) => Math.max(0, i - 1)); return; }
      if (key === "Tab" || key === "Enter") { e.preventDefault(); insertFunction(ac.items[Math.min(acIndex, ac.items.length - 1)]); return; }
      if (key === "Escape")    { e.preventDefault(); acClosedRef.current = true; setAcIndex(0); return; }
    }

    if (key === "F4") {
      e.preventDefault();
      if (!inputVal.startsWith("=")) return;
      const el = inputRef.current;
      const selS = el?.selectionStart ?? inputVal.length;
      const selE = el?.selectionEnd ?? selS;
      lastEditWasTypeRef.current = false;
      // 규칙1: pointSpan(참조 선택 모드) → 범위 통째 순환 / 규칙3: 텍스트 선택 / 규칙2: 커서 단일 셀
      const p = pointRef.current;
      const pointSpan = p ? { start: p.start, end: p.end } : null;
      const selection = selE > selS ? { start: selS, end: selE } : null;
      const r = cycleReference(inputVal, selS, selection, pointSpan);
      setInputVal(r.text);
      if (r.selection) nextSelRef.current = { start: r.selection.start, end: r.selection.end };
      else nextCursorPos.current = r.cursor;
      // 규칙1이면 연속 F4를 위해 pointRef의 끝/$플래그 갱신 (정규식 없이 span.dollar 사용)
      if (r.span && pointRef.current) {
        pointRef.current = { ...pointRef.current, end: r.span.end, dollar: r.span.dollar };
      }
      return;
    }
    if (key === "Enter") {
      e.preventDefault();
      if (commitInput(ri, ci, inputVal) === false) return; // 잘못된 수식이면 편집 유지
      const t = clamp(ri + (e.shiftKey ? -1 : 1), ci);
      selectSingle(t.ri, t.ci);
      containerRef.current?.focus({ preventScroll: true });
      return;
    }
    if (key === "Tab") {
      e.preventDefault();
      if (commitInput(ri, ci, inputVal) === false) return;
      const t = clamp(ri, ci + (e.shiftKey ? -1 : 1));
      selectSingle(t.ri, t.ci);
      containerRef.current?.focus({ preventScroll: true });
      return;
    }
    if (key === "Escape") {
      e.preventDefault();
      setInputVal(cells[ri][ci].input || "");
      editModeRef.current = "ready";
      pointRef.current = null;
      inputRef.current?.blur();
      containerRef.current?.focus({ preventScroll: true });
      return;
    }
    // 방향키
    if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
      const pos = inputRef.current?.selectionStart ?? inputVal.length;
      const dr = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
      const dc = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
      if (inputVal.startsWith("=")) {
        // 이미 참조 선택 모드 → 계속 이동
        if (pointRef.current) { e.preventDefault(); pointReferenceMove(dr, dc, e.shiftKey); return; }
        // 커서 바로 앞 토큰이 셀 참조 → 그 참조로 참조 선택 모드 재개 (커서가 토큰 끝일 때만)
        const span = findRefAtCursor(inputVal, pos, "cell");
        if (span && span.end === pos) {
          const cell = parseA1(span.text.split("$").join(""));
          if (cell) {
            e.preventDefault();
            pointRef.current = { start: span.start, end: span.end, anchor: cell, focus: cell, dollar: span.dollar };
            pointReferenceMove(dr, dc, e.shiftKey);
            return;
          }
        }
        // 커서 앞이 =,(,쉼표,연산자 → 새 참조 삽입
        if (isRefContext(inputVal, pos)) { e.preventDefault(); pointReferenceMove(dr, dc, e.shiftKey); return; }
      }
      // 그 외 — 편집 모드: 텍스트 커서 이동(브라우저 기본)
      if (editModeRef.current === "edit") return;
      // 입력 모드: 커밋 후 이동 (잘못된 수식이면 편집 유지)
      e.preventDefault();
      if (commitInput(ri, ci, inputVal) === false) return;
      const t = clamp(ri + dr, ci + dc);
      selectSingle(t.ri, t.ci);
      containerRef.current?.focus({ preventScroll: true });
    }
  }

  return { handleContainerKeyDown, handleInputKeyDown, applyPointRefRange };
}
