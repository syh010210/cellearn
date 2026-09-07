import { useState, useRef, useEffect, useMemo } from "react";
import { toAddr, shiftFormula, findRefAtCursor, RANGE_TOKEN_RE } from "../../utils/formulaUtils";
import { getFunctionHint } from "../../utils/functionHints";
import { Sheet, isErrorValue } from "../../excel-engine/index.js";
import { EXAM_FUNCTIONS } from "../../excel-engine/functions/index.js";
import { gradePractice } from "./miniexcel/gradePractice.js";
import { useSelection } from "./miniexcel/useSelection.js";
import { useKeyboard } from "./miniexcel/useKeyboard.js";

// 자동완성 목록 = 엔진에 등록된 함수(컴활 출제 범위)만
// 자동완성 목록 = 컴활 2급 실기 출제 함수만 (엔진에 등록된 그 외 함수는 노출하지 않음)
const FUNC_NAMES = [...EXAM_FUNCTIONS].sort();

// Phase 3: 셀 표시 형식 (지원: #,##0 / #,##0.00 / 0% / 0.0% / yyyy-mm-dd / @)
function excelSerialToDate(n) {
  if (isNaN(n)) return null;
  const d = new Date(Math.round((n - 25569) * 86400 * 1000));
  if (isNaN(d.getTime())) return null;
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}
function formatValue(v, fmt) {
  if (!fmt) return String(v);
  const n = typeof v === "number" ? v : parseFloat(v);
  switch (fmt) {
    case "#,##0":    return isNaN(n) ? String(v) : Math.round(n).toLocaleString("en-US");
    case "#,##0.00": return isNaN(n) ? String(v) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "0%":       return isNaN(n) ? String(v) : `${Math.round(n * 100)}%`;
    case "0.0%":     return isNaN(n) ? String(v) : `${(n * 100).toFixed(1)}%`;
    case "yyyy-mm-dd": return excelSerialToDate(n) ?? String(v);
    case "@":        return String(v);
    default:         return String(v);
  }
}

// 열 문자(A,B,..) → 인덱스, "A1" → {ri,ci}, "A1:B3" → {r1,c1,r2,c2}
function colToIdx(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}
function parseA1(str) {
  const m = /^\s*([A-Za-z]+)(\d+)\s*$/.exec(str);
  if (!m) return null;
  return { ci: colToIdx(m[1]), ri: parseInt(m[2], 10) - 1 };
}
function parseRangeA1(str) {
  const parts = str.split(":");
  if (parts.length === 1) {
    const a = parseA1(parts[0]);
    return a ? { r1: a.ri, c1: a.ci, r2: a.ri, c2: a.ci } : null;
  }
  const a = parseA1(parts[0]);
  const b = parseA1(parts[1]);
  if (!a || !b) return null;
  return {
    r1: Math.min(a.ri, b.ri), c1: Math.min(a.ci, b.ci),
    r2: Math.max(a.ri, b.ri), c2: Math.max(a.ci, b.ci),
  };
}

export default function MiniExcel({ practice, autoplay = false, onPracticeWrong, onPracticeResolve }) {
  const initCells = () =>
    practice.rows.map((row) => row.map((cell) => ({ ...cell, input: "", status: null })));

  const [cells, setCells] = useState(initCells);
  const [inputVal, setInputVal] = useState("");
  const [dragging, setDragging] = useState(false);       // 채우기 핸들 드래그
  const [dragStart, setDragStart] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [graded, setGraded] = useState(false);
  const [gradeResults, setGradeResults] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState({}); // { addr: true } 정답 수식 보기
  const [cursorPos, setCursorPos] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  // 범위 선택 드래그 (수식 모드에서 참조 삽입)
  const [rangeSelecting, setRangeSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  // 선택 상태 마우스 드래그(비수식) 범위 선택
  const [selDragging, setSelDragging] = useState(false);
  // 이름 상자
  const [nameBoxEditing, setNameBoxEditing] = useState(false);
  const [nameBoxVal, setNameBoxVal] = useState("");
  // 함수 자동완성
  const [acIndex, setAcIndex] = useState(0);

  const sheetRef = useRef(null);
  const autoCancelRef = useRef(false); // 오토플레이(히어로 데모) 취소 플래그
  function cancelAuto() { autoCancelRef.current = true; }

  function getAddr(ri, ci) {
    return `${practice.cols[ci]}${ri + 1}`;
  }

  const inputRef = useRef();
  const containerRef = useRef(null);
  const overlayRef = useRef(null); // 수식 참조 색상 오버레이 (입력창 위)
  const acClosedRef = useRef(false); // Esc로 자동완성을 닫았는지
  const isDraggingRef = useRef(false);       // 채우기 핸들
  const dragStartRef = useRef(null);
  const hoverCellRef = useRef(null);
  const nextCursorPos = useRef(null);
  const nextSelRef = useRef(null); // 렌더 후 복원할 텍스트 선택 {start,end} (F4 선택 순환용)
  const lastEditWasTypeRef = useRef(false); // 마지막 inputVal 변경이 사용자 타이핑(onChange)인지
  // 편집 모델: 'ready'(선택) | 'enter'(입력) | 'edit'(편집)
  const editModeRef = useRef("ready");
  const isRangeDraggingRef = useRef(false);  // 수식 참조 드래그
  const rangeStartRef = useRef(null);
  const isSelDraggingRef = useRef(false);    // 선택 범위 드래그
  // 되돌리기
  const historyRef = useRef({ past: [], future: [] });
  // 클립보드
  const clipRef = useRef(null); // { grid: string[][], r0, c0 }
  // 수식 참조 선택 모드(방향키로 참조 삽입/갱신)
  const pointRef = useRef(null); // { insertAt, start, end } | null

  const rowCount = cells.length;
  const colCount = cells[0]?.length || 0;

  // 선택/키보드 로직은 훅으로 분리. ctx = 매 렌더 아래 Object.assign으로 갱신하는 안정된 의존성 객체.
  // (훅 핸들러는 이벤트 시점에 ctx에서 최신 값을 읽으므로 스테일 클로저가 없다.)
  const ctx = useMemo(() => ({}), []);
  const {
    selection, setSelection, selected, selAnchorRef,
    clamp, selBounds, selectSingle, setFocusCell, moveSelection, commitNameBox,
  } = useSelection(ctx);
  const { handleContainerKeyDown, handleInputKeyDown, applyPointRefRange } = useKeyboard(ctx);

  // ── 초기화 ──
  useEffect(() => {
    const sheet = new Sheet();
    practice.rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (!cell.editable) {
          const raw = cell.val !== undefined && cell.val !== null ? String(cell.val) : '';
          if (raw !== '') sheet.setCellInput(`${practice.cols[ci]}${ri + 1}`, raw);
        }
      });
    });
    sheetRef.current = sheet;

    setCells(initCells());
    setSelection(null);
    setInputVal("");
    setGraded(false);
    setGradeResults([]);
    setAttempts(0);
    setRevealed({});
    setRangeSelecting(false);
    setRangeStart(null);
    setHoverCell(null);
    editModeRef.current = "ready";
    isRangeDraggingRef.current = false;
    rangeStartRef.current = null;
    historyRef.current = { past: [], future: [] };
    clipRef.current = null;
    pointRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice]);

  useEffect(() => {
    if (nextSelRef.current !== null && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(nextSelRef.current.start, nextSelRef.current.end);
      nextSelRef.current = null;
      return;
    }
    if (nextCursorPos.current !== null && document.activeElement === inputRef.current) {
      // 입력 모드에서 타이핑 중이면 과거의 nextCursorPos가 캐럿을 되돌리지 않게 버린다.
      // (F4·드래그·참조 선택은 lastEditWasTypeRef=false 라 그대로 적용됨)
      if (pointRef.current === null && editModeRef.current === "enter" && lastEditWasTypeRef.current && nextCursorPos.current < inputVal.length) {
        nextCursorPos.current = null;
        return;
      }
      inputRef.current.setSelectionRange(nextCursorPos.current, nextCursorPos.current);
      nextCursorPos.current = null;
    }
  }, [inputVal]);

  // ── 오토플레이(랜딩 히어로 데모) — 기존 동작 유지 ──
  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let target = null;
    for (let r = 0; r < practice.rows.length && !target; r++) {
      for (let c = 0; c < practice.rows[r].length; c++) {
        const cell = practice.rows[r][c];
        if (cell.editable && cell.answer) { target = { ri: r, ci: c, answer: cell.answer }; break; }
      }
    }
    if (!target) return;
    autoCancelRef.current = false;
    const timers = [];
    const full = target.answer;
    timers.push(setTimeout(() => {
      if (autoCancelRef.current) return;
      selectSingle(target.ri, target.ci);
      for (let i = 1; i <= full.length; i++) {
        timers.push(setTimeout(() => { if (!autoCancelRef.current) setInputVal(full.slice(0, i)); }, i * 60));
      }
      timers.push(setTimeout(() => {
        if (autoCancelRef.current) return;
        commitInput(target.ri, target.ci, full);
        setInputVal("");
        setSelection(null);
      }, full.length * 60 + 350));
    }, 700));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  // ── 전역 포인터 이벤트: 채우기 핸들 / 수식 참조 드래그 / 선택 드래그 ──
  useEffect(() => {
    function onPointerMove(e) {
      if (!isDraggingRef.current && !isRangeDraggingRef.current && !isSelDraggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const td = el?.closest?.("td[data-ri]");
      if (!td) return;
      const ri = parseInt(td.dataset.ri);
      const ci = parseInt(td.dataset.ci);
      if (isNaN(ri) || isNaN(ci)) return;
      if (hoverCellRef.current?.ri === ri && hoverCellRef.current?.ci === ci) return;
      hoverCellRef.current = { ri, ci };
      setHoverCell({ ri, ci });
      // 선택 범위 드래그: focus 갱신
      if (isSelDraggingRef.current && selAnchorRef.current) {
        setSelection({ anchor: selAnchorRef.current, focus: { ri, ci } });
      }
      // 수식 참조 드래그: 같은 span을 매 hover마다 치환 (pointerup에서만 넣지 않음)
      if (isRangeDraggingRef.current && rangeStartRef.current) {
        applyPointRefRange(rangeStartRef.current, { ri, ci });
      }
    }

    function onPointerUp() {
      // 선택 범위 드래그 완료
      if (isSelDraggingRef.current) {
        isSelDraggingRef.current = false;
        setSelDragging(false);
        hoverCellRef.current = null;
        return;
      }
      // 수식 참조 드래그 완료 — 치환은 pointerdown·hover에서 applyPointRefRange로 이미 반영됨
      if (isRangeDraggingRef.current) {
        isRangeDraggingRef.current = false;
        rangeStartRef.current = null;
        hoverCellRef.current = null;
        setRangeSelecting(false);
        setRangeStart(null);
        setHoverCell(null);
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      // 자동 채우기 드래그 완료
      if (!isDraggingRef.current) return;
      const src = dragStartRef.current;
      const tgt = hoverCellRef.current;
      if (src && tgt) fillFromTo(src, tgt);
      isDraggingRef.current = false;
      dragStartRef.current = null;
      hoverCellRef.current = null;
      setDragging(false);
      setDragStart(null);
      setHoverCell(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function rangeAddr(a, b) {
    const r1 = Math.min(a.ri, b.ri), c1 = Math.min(a.ci, b.ci);
    const r2 = Math.max(a.ri, b.ri), c2 = Math.max(a.ci, b.ci);
    return r1 === r2 && c1 === c2 ? toAddr(r1, c1) : `${toAddr(r1, c1)}:${toAddr(r2, c2)}`;
  }

  // ── 되돌리기 스냅샷 ──
  function snapshotInputs(source = cells) {
    const snap = {};
    source.forEach((row, ri) => row.forEach((c, ci) => {
      if (c.editable) snap[getAddr(ri, ci)] = c.input || "";
    }));
    return snap;
  }
  function pushHistory() {
    const h = historyRef.current;
    h.past.push(snapshotInputs());
    if (h.past.length > 50) h.past.shift();
    h.future = [];
  }
  function applySnapshot(snap) {
    const sheet = sheetRef.current;
    setCells((prev) =>
      prev.map((row, ri) => row.map((c, ci) => {
        if (!c.editable) return c;
        const addr = getAddr(ri, ci);
        const input = snap[addr] ?? "";
        sheet?.setCellInput(addr, input.trim());
        return { ...c, input, status: null };
      }))
    );
    setGraded(false);
  }
  function undo() {
    const h = historyRef.current;
    if (!h.past.length) return;
    h.future.push(snapshotInputs());
    const snap = h.past.pop();
    applySnapshot(snap);
  }
  function redo() {
    const h = historyRef.current;
    if (!h.future.length) return;
    h.past.push(snapshotInputs());
    const snap = h.future.pop();
    applySnapshot(snap);
  }

  function isFormulaMode() {
    return (
      inputRef.current !== null &&
      document.activeElement === inputRef.current &&
      inputVal.startsWith("=")
    );
  }

  // ── 마우스 ──
  function handleCellPointerDown(e, ri, ci) {
    cancelAuto();
    if (isFormulaMode()) {
      // 수식 편집 중: 참조를 클릭/드래그로 넣거나 치환 (방향키와 동일한 pointRef 치환 경로)
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 미지원 무시 */ }
      const clickCell = { ri, ci };
      // 치환 대상 span 결정 (커서 끝에 붙은 셀 참조면 그 span, 아니면 커서에 삽입)
      if (!pointRef.current) {
        const pos = inputRef.current?.selectionStart ?? inputVal.length;
        const span = findRefAtCursor(inputVal, pos, "cell");
        if (span && span.end === pos) {
          pointRef.current = { start: span.start, end: span.end, anchor: clickCell, focus: clickCell, dollar: span.dollar };
        } else {
          pointRef.current = { start: pos, end: pos, anchor: clickCell, focus: clickCell, dollar: { col: false, row: false } };
        }
      }
      isRangeDraggingRef.current = true;
      rangeStartRef.current = clickCell; // 드래그 앵커
      hoverCellRef.current = clickCell;
      setRangeSelecting(true);
      setRangeStart(clickCell);
      setHoverCell(clickCell);
      applyPointRefRange(clickCell, clickCell); // 단일 셀로 즉시 치환
      inputRef.current?.focus();
      return;
    }
    // 선택 상태: 클릭/드래그 범위 선택
    if (e.shiftKey && selection) {
      setFocusCell(ri, ci);
    } else {
      selectSingle(ri, ci);
      isSelDraggingRef.current = true;
      setSelDragging(true);
      hoverCellRef.current = { ri, ci };
    }
    containerRef.current?.focus({ preventScroll: true });
  }

  function enterEditMode(ri, ci) {
    if (!cells[ri][ci].editable) return;
    if (isFormulaMode()) return;
    selectSingle(ri, ci);
    editModeRef.current = "edit";
    setInputVal(cells[ri][ci].input || "");
    setTimeout(() => {
      const el = inputRef.current;
      if (el) { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); }
    }, 0);
  }

  function commitInput(ri, ci, val) {
    const cell = cells[ri][ci];
    if (!cell.editable) return;
    const trimmed = val.trim();
    if ((cell.input || "") !== trimmed) pushHistory();
    editModeRef.current = "ready";
    pointRef.current = null;
    sheetRef.current?.setCellInput(getAddr(ri, ci), trimmed);
    setCells((prev) =>
      prev.map((row, r) =>
        row.map((c, cc) =>
          r === ri && cc === ci ? { ...c, input: trimmed, status: null } : c
        )
      )
    );
    setGraded(false);
  }

  // 범위 전체를 특정 input으로 커밋 (Delete용)
  function commitRange(b, valueFor) {
    const sheet = sheetRef.current;
    let changed = false;
    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      for (let r = b.r1; r <= b.r2; r++) {
        for (let c = b.c1; c <= b.c2; c++) {
          if (!next[r]?.[c]?.editable) continue;
          const v = valueFor(r, c);
          if ((next[r][c].input || "") !== v) changed = true;
          next[r][c].input = v;
          next[r][c].status = null;
          sheet?.setCellInput(getAddr(r, c), v.trim());
        }
      }
      return next;
    });
    return changed;
  }

  function deleteSelection() {
    const b = selBounds();
    if (!b) return;
    pushHistory();
    commitRange(b, () => "");
    setInputVal("");
    setGraded(false);
  }

  // ── 자동 채우기 ──
  function fillFromTo(src, tgt) {
    const sheet = sheetRef.current;
    const b = selBounds() || { r1: src.ri, c1: src.ci, r2: src.ri, c2: src.ci };
    // 원본 = 현재 선택 범위, 목표 방향으로 확장
    const minR = Math.min(b.r1, tgt.ri), maxR = Math.max(b.r2, tgt.ri);
    const minC = Math.min(b.c1, tgt.ci), maxC = Math.max(b.c2, tgt.ci);
    const srcH = b.r2 - b.r1 + 1;
    const srcW = b.c2 - b.c1 + 1;
    pushHistory();
    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (r >= b.r1 && r <= b.r2 && c >= b.c1 && c <= b.c2) continue; // 원본 유지
          if (!next[r]?.[c]?.editable) continue;
          // 원본 셀: 같은 열은 열 기준, 같은 행은 행 기준으로 매핑
          const sr = b.r1 + ((r - b.r1) % srcH + srcH) % srcH;
          const sc = b.c1 + ((c - b.c1) % srcW + srcW) % srcW;
          const srcInput = next[sr]?.[sc]?.input || "";
          if (!srcInput) continue;
          const shifted = srcInput.startsWith("=")
            ? shiftFormula(srcInput, r - sr, c - sc)
            : srcInput;
          next[r][c].input = shifted;
          next[r][c].status = null;
          sheet?.setCellInput(getAddr(r, c), shifted);
        }
      }
      return next;
    });
    setGraded(false);
  }

  // 핸들 더블클릭: 왼쪽(없으면 오른쪽) 인접 열 데이터 마지막 행까지 아래로 채움
  function fillHandleDoubleClick() {
    const b = selBounds();
    if (!b) return;
    const probeCol = b.c1 - 1 >= 0 ? b.c1 - 1 : b.c2 + 1;
    if (probeCol < 0 || probeCol >= colCount) return;
    let lastRow = b.r2;
    for (let r = b.r2 + 1; r < rowCount; r++) {
      const c = cells[r]?.[probeCol];
      const has = c && (c.editable ? (c.input || "") !== "" : (c.val !== "" && c.val !== null && c.val !== undefined));
      if (has) lastRow = r; else break;
    }
    if (lastRow <= b.r2) return;
    fillFromTo({ ri: b.r1, ci: b.c1 }, { ri: lastRow, ci: b.c2 });
  }

  function handleFillDragStart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isFormulaMode()) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 미지원 무시 */ }
    // 편집 중이던 값 커밋
    if (selected && inputFocused) commitInput(selected.ri, selected.ci, inputVal);
    const b = selBounds();
    isDraggingRef.current = true;
    dragStartRef.current = b ? { ri: b.r1, ci: b.c1 } : selected;
    hoverCellRef.current = selected;
    setDragging(true);
    setDragStart(b ? { ri: b.r2, ci: b.c2 } : selected);
    setHoverCell(selected);
  }

  // ── 클립보드 ──
  function copySelection() {
    const b = selBounds();
    if (!b) return;
    const grid = [];
    const textRows = [];
    for (let r = b.r1; r <= b.r2; r++) {
      const gr = [];
      const tr = [];
      for (let c = b.c1; c <= b.c2; c++) {
        const cell = cells[r][c];
        gr.push(cell.editable ? (cell.input || "") : String(cell.val ?? ""));
        const disp = cell.editable
          ? (sheetRef.current?.getDisplayValue(getAddr(r, c)) ?? cell.input ?? "")
          : (cell.val ?? "");
        tr.push(String(disp));
      }
      grid.push(gr);
      textRows.push(tr.join("\t"));
    }
    clipRef.current = { grid, r0: b.r1, c0: b.c1 };
    try { navigator.clipboard?.writeText(textRows.join("\n")); } catch { /* 무시 */ }
  }

  function pasteClipboard() {
    const clip = clipRef.current;
    if (!clip || !selection) return;
    const b = selBounds();
    const r0 = b.r1, c0 = b.c1;
    const sheet = sheetRef.current;
    pushHistory();
    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      clip.grid.forEach((gr, dr) => gr.forEach((srcInput, dc) => {
        const r = r0 + dr, c = c0 + dc;
        if (!next[r]?.[c]?.editable) return;
        // shiftFormula: 원본 위치(clip.r0+dr, clip.c0+dc) → 붙일 위치(r,c) 만큼 이동
        const finalInput = srcInput.startsWith("=")
          ? shiftFormula(srcInput, r - (clip.r0 + dr), c - (clip.c0 + dc))
          : srcInput;
        next[r][c].input = finalInput;
        next[r][c].status = null;
        sheet?.setCellInput(getAddr(r, c), finalInput.trim());
      }));
      return next;
    });
    setGraded(false);
  }

  function grade() {
    // 편집 중이면 현재 값을 sheet+로컬 스냅샷에 동기로 반영(gradePractice가 최신값을 보게)
    let cur = cells;
    if (selected && cells[selected.ri]?.[selected.ci]?.editable && inputFocused) {
      const trimmed = inputVal.trim();
      sheetRef.current?.setCellInput(getAddr(selected.ri, selected.ci), trimmed);
      cur = cells.map((row, r) => row.map((c, cc) => (r === selected.ri && cc === selected.ci ? { ...c, input: trimmed } : c)));
      commitInput(selected.ri, selected.ci, inputVal);
    }
    const results = gradePractice({
      cells: cur, cols: practice.cols, sheet: sheetRef.current, requiredFunctions: practice.requiredFunctions,
    });
    setCells((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => {
          if (!cell.editable) return cell;
          const res = results.find((x) => x.ri === ri && x.ci === ci);
          if (!res) return cell;
          return { ...cell, status: res.status === "correct" ? "correct" : res.status === "wrong" ? "wrong" : null };
        })
      )
    );
    setGradeResults(results);
    setAttempts((a) => a + 1);
    setGraded(true);
    // 오답노트 연동 (부모가 콜백을 넘겼을 때만)
    results.forEach((res) => {
      if (res.status === "wrong" || res.status === "empty") {
        onPracticeWrong?.({ cell: res.addr, studentInput: res.studentInput, answer: res.answer, reason: res.reason });
      } else if (res.status === "correct") {
        onPracticeResolve?.({ cell: res.addr });
      }
    });
  }

  // ── 파생 값 ──
  const addrStr = (() => {
    if (rangeSelecting && rangeStart && hoverCell) return rangeAddr(rangeStart, hoverCell);
    const b = selBounds();
    if (!b) return "";
    return b.r1 === b.r2 && b.c1 === b.c2 ? toAddr(b.r1, b.c1) : `${toAddr(b.r1, b.c1)}:${toAddr(b.r2, b.c2)}`;
  })();

  const fillRange =
    dragging && dragStart && hoverCell
      ? { minR: Math.min(dragStart.ri, hoverCell.ri), maxR: Math.max(dragStart.ri, hoverCell.ri),
          minC: Math.min(dragStart.ci, hoverCell.ci), maxC: Math.max(dragStart.ci, hoverCell.ci) }
      : null;

  const rangeSelectBox =
    rangeSelecting && rangeStart && hoverCell
      ? { minR: Math.min(rangeStart.ri, hoverCell.ri), maxR: Math.max(rangeStart.ri, hoverCell.ri),
          minC: Math.min(rangeStart.ci, hoverCell.ci), maxC: Math.max(rangeStart.ci, hoverCell.ci) }
      : null;

  const selBox = selBounds();
  const selCell = selected ? cells[selected.ri]?.[selected.ci] : null;
  const activeHint = inputFocused ? getFunctionHint(inputVal, cursorPos) : null;

  // ── Phase 2: 수식 편집 중 참조 색상 ──
  const REF_COLORS = ["#0000FF", "#FF0000", "#9C27B0", "#008000", "#FF6D00", "#00838F"];
  const showRefs = inputFocused && inputVal.startsWith("=");
  const refSegments = []; // { start, end, color } — 입력창 오버레이용
  const refRanges = [];   // { r1, c1, r2, c2, color } — 셀 테두리용
  if (showRefs) {
    // 엔진 collectReferences는 char offset을 주지 않아, formulaUtils의 공유 참조 토큰 정규식으로
    // 추출한다(미완성 입력도 처리). 인라인 정규식 리터럴을 두지 않고 공유 상수를 재사용.
    const re = new RegExp(RANGE_TOKEN_RE.source, "g");
    const colorMap = new Map();
    let m;
    while ((m = re.exec(inputVal)) !== null) {
      const norm = m[0].toUpperCase();
      if (!colorMap.has(norm)) colorMap.set(norm, REF_COLORS[colorMap.size % REF_COLORS.length]);
      refSegments.push({ start: m.index, end: m.index + m[0].length, color: colorMap.get(norm) });
    }
    for (const [norm, color] of colorMap) {
      const rng = parseRangeA1(norm.replace(/\$/g, ""));
      if (rng && rng.r1 >= 0 && rng.c1 >= 0 && rng.r2 < rowCount && rng.c2 < colCount) {
        refRanges.push({ ...rng, color });
      }
    }
  }
  function refBg(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.08)`;
  }
  function refSideFor(ri, ci) {
    for (const rr of refRanges) {
      if (ri < rr.r1 || ri > rr.r2 || ci < rr.c1 || ci > rr.c2) continue;
      return { color: rr.color, bg: refBg(rr.color), bt: ri === rr.r1, bb: ri === rr.r2, bl: ci === rr.c1, br: ci === rr.c2 };
    }
    return null;
  }
  function renderOverlaySegments() {
    const parts = [];
    let idx = 0;
    const segs = [...refSegments].sort((a, b) => a.start - b.start);
    for (const s of segs) {
      if (s.start > idx) parts.push(<span key={idx}>{inputVal.slice(idx, s.start)}</span>);
      parts.push(<span key={`${s.start}r`} style={{ color: s.color }}>{inputVal.slice(s.start, s.end)}</span>);
      idx = s.end;
    }
    if (idx < inputVal.length) parts.push(<span key="tail">{inputVal.slice(idx)}</span>);
    return parts;
  }

  // ── Phase 3: 함수 자동완성 ──
  const ac = (() => {
    if (!inputFocused || !inputVal.startsWith("=") || acClosedRef.current) return null;
    const pos = Math.min(cursorPos, inputVal.length);
    const before = inputVal.slice(0, pos);
    const m = /([A-Za-z]{2,})$/.exec(before);
    if (!m) return null;
    const partial = m[1];
    const tokenStart = pos - partial.length;
    const prev = before.slice(0, tokenStart).replace(/\s+$/, "").slice(-1);
    const okPrev = prev === "=" || prev === "(" || prev === "," || "+-*/^<>=".includes(prev);
    if (!okPrev) return null;
    const up = partial.toUpperCase();
    const items = FUNC_NAMES.filter((n) => n.startsWith(up)).slice(0, 8);
    if (!items.length) return null;
    return { items, tokenStart, tokenEnd: pos };
  })();

  function insertFunction(name) {
    if (!ac) return;
    const ins = name + "(";
    const newVal = inputVal.slice(0, ac.tokenStart) + ins + inputVal.slice(ac.tokenEnd);
    lastEditWasTypeRef.current = false;
    nextCursorPos.current = ac.tokenStart + ins.length;
    setAcIndex(0);
    setInputVal(newVal);
  }

  const FONT = "'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif";
  // 입력창과 참조 색상 오버레이가 글자 단위로 정확히 겹치도록 공유하는 스타일
  const fieldStyle = { fontFamily: FONT, fontSize: 14, fontWeight: 400, lineHeight: "normal", letterSpacing: "normal", wordSpacing: "normal", textIndent: 0, textRendering: "auto", fontKerning: "none", padding: "6px 8px", border: 0, boxSizing: "border-box" };
  const XL = "#217346";
  const XL_SOFT = "#e6f2ea";
  const XL_EDIT = "#eef6f1";
  const XL_HDR_SEL = "#cfe6da";

  // 선택 범위의 오른쪽 아래 모서리(채우기 핸들 위치) 셀 여부
  function isFillHandleCell(ri, ci) {
    if (!selBox) return false;
    return ri === selBox.r2 && ci === selBox.c2 && cells[ri]?.[ci]?.editable;
  }

  // 훅(useSelection/useKeyboard)이 이벤트 시점에 읽는 최신 의존성을 매 렌더 갱신.
  // 안정된 ctx 객체를 제자리 변경하므로, 빈 deps 이펙트에 잡힌 핸들러도 최신 값을 본다.
  Object.assign(ctx, {
    cells, rowCount, colCount, inputVal, setInputVal, setGraded,
    selection, selected,
    editModeRef, pointRef, lastEditWasTypeRef, nextCursorPos, nextSelRef,
    inputRef, containerRef, acClosedRef,
    ac, acIndex, setAcIndex, insertFunction,
    clamp, selectSingle, setFocusCell, moveSelection, deleteSelection, enterEditMode, commitInput,
    undo, redo, copySelection, pasteClipboard,
    nameBoxVal, setNameBoxEditing, parseRangeA1, parseA1,
  });

  return (
    <div style={{ marginTop: 20, userSelect: "none", fontFamily: FONT }}>
      {/* 문제 카드 */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <span style={{ display: "inline-block", background: "#1f2937", color: "#fff", fontSize: 11.5, fontWeight: 800, letterSpacing: 1, padding: "3px 11px", borderRadius: 999, marginBottom: 10 }}>문제</span>
        <p style={{ color: "#1f2937", fontSize: 18.5, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{practice.instruction}</p>
      </div>

      {/* 엑셀 카드 */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        {/* 수식 입력창 */}
        <div style={{ display: "flex", alignItems: "stretch", background: "#f5f5f5", border: "1px solid #d0d0d0", borderBottom: "none", borderRadius: "4px 4px 0 0" }}>
          {/* 이름 상자 (클릭 시 편집) */}
          {nameBoxEditing ? (
            <input
              autoFocus
              value={nameBoxVal}
              onChange={(e) => setNameBoxVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitNameBox(); else if (e.key === "Escape") setNameBoxEditing(false); }}
              onBlur={commitNameBox}
              style={{ minWidth: 64, width: 64, fontWeight: 700, color: "#333", fontSize: 13, textAlign: "center", borderRight: "1px solid #d0d0d0", border: "none", outline: "none", padding: "6px 8px", fontFamily: FONT }}
            />
          ) : (
            <div
              onClick={() => { setNameBoxVal(addrStr); setNameBoxEditing(true); }}
              title="이름 상자 — 셀 주소 입력 후 Enter"
              style={{ minWidth: 64, fontWeight: 700, color: "#333", fontSize: 13, textAlign: "center", borderRight: "1px solid #d0d0d0", padding: "6px 8px", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", cursor: "text" }}
            >
              {addrStr || "—"}
            </div>
          )}
          <div style={{ padding: "6px 10px", color: "#888", fontSize: 13, borderRight: "1px solid #d0d0d0", display: "flex", alignItems: "center", fontStyle: "italic", fontWeight: 700 }}>fx</div>
          <div style={{ position: "relative", flex: 1, display: "flex" }}>
            {/* 참조 색상 오버레이 — 입력창이 포커스된 수식 모드에서만 렌더 */}
            {showRefs && (
              <div ref={overlayRef} aria-hidden="true" style={{ ...fieldStyle, position: "absolute", inset: 0, whiteSpace: "pre", overflow: "hidden", pointerEvents: "none", color: "#1f2937", display: "flex", alignItems: "center" }}>
                <span>{renderOverlaySegments()}</span>
              </div>
            )}
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => {
                // 편집/입력 중 글자 입력 → 참조 선택 모드 종료
                if (editModeRef.current === "ready") editModeRef.current = "enter";
                pointRef.current = null;
                lastEditWasTypeRef.current = true;
                acClosedRef.current = false;
                setAcIndex(0);
                setInputVal(e.target.value);
                setCursorPos(e.target.selectionStart ?? e.target.value.length);
                if (overlayRef.current) overlayRef.current.scrollLeft = e.target.scrollLeft;
              }}
              onKeyDown={handleInputKeyDown}
              onPointerDown={() => { pointRef.current = null; }}
              onScroll={(e) => { if (overlayRef.current) overlayRef.current.scrollLeft = e.target.scrollLeft; }}
              onSelect={(e) => setCursorPos(e.target.selectionStart ?? inputVal.length)}
              onFocus={() => {
                cancelAuto();
                setInputFocused(true);
                if (editModeRef.current === "ready") editModeRef.current = "edit";
              }}
              onBlur={() => {
                setInputFocused(false);
                pointRef.current = null;
                if (selected && selCell?.editable && editModeRef.current !== "ready") commitInput(selected.ri, selected.ci, inputVal);
              }}
              placeholder={selCell?.editable ? "수식 입력... (셀 드래그로 범위 삽입, F4로 참조 고정)" : ""}
              readOnly={!selCell?.editable}
              style={{ ...fieldStyle, flex: 1, width: "100%", background: "transparent", outline: "none", color: showRefs ? "transparent" : "#1f2937", caretColor: "#1f2937" }}
            />
            {ac && (
              <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 30, minWidth: 180, background: "#fff", border: "1px solid #d0d0d0", borderTop: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", fontFamily: FONT }}>
                {ac.items.map((name, i) => (
                  <div key={name}
                    onMouseDown={(e) => { e.preventDefault(); insertFunction(name); }}
                    onMouseEnter={() => setAcIndex(i)}
                    style={{ padding: "5px 12px", fontSize: 13, cursor: "pointer", color: "#1f2937",
                      background: i === Math.min(acIndex, ac.items.length - 1) ? "#e6f2ea" : "#fff",
                      fontWeight: i === Math.min(acIndex, ac.items.length - 1) ? 700 : 400 }}>
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selected && selCell?.editable && (
            <button
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => { commitInput(selected.ri, selected.ci, inputVal); containerRef.current?.focus({ preventScroll: true }); }}
              style={{ background: XL, border: "none", color: "#fff", padding: "0 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, borderRadius: "0 4px 0 0" }}
            >
              ✓
            </button>
          )}
        </div>

        {/* 함수 인수 힌트 바 */}
        {activeHint && (
          <div style={{ background: "#fff9c4", border: "1px solid #d0d0d0", borderTop: "none", borderBottom: "none", padding: "4px 14px", fontSize: 12, fontFamily: FONT, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
            <span style={{ fontWeight: 700, color: XL }}>{activeHint.name}</span>
            <span style={{ color: "#555" }}>(</span>
            {activeHint.args.map((arg, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: "#999" }}>,&nbsp;</span>}
                <span style={{ color: i === activeHint.argIdx ? XL : "#555", fontWeight: i === activeHint.argIdx ? 700 : 400, textDecoration: i === activeHint.argIdx ? "underline" : "none" }}>{arg}</span>
              </span>
            ))}
            <span style={{ color: "#555" }}>)</span>
          </div>
        )}

        {/* 테이블 */}
        <div
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleContainerKeyDown}
          style={{ overflowX: "auto", border: "1px solid #d0d0d0", borderRadius: "0 0 4px 4px", marginBottom: 16, outline: "none", touchAction: (dragging || rangeSelecting || selDragging) ? "none" : "auto" }}
        >
          <table style={{ borderCollapse: "collapse", fontSize: 14, fontFamily: FONT }}>
            <thead>
              <tr>
                <th style={{ width: 36, background: "#f3f3f3", border: "1px solid #d0d0d0", padding: "5px 6px", color: "#888" }} />
                {practice.cols.map((c, ci) => {
                  const colSel = selBox && ci >= selBox.c1 && ci <= selBox.c2;
                  return (
                    <th key={c} style={{
                      minWidth: 120,
                      background: colSel ? XL_HDR_SEL : "#f3f3f3",
                      borderTop: "1px solid #d0d0d0",
                      borderRight: "1px solid #d0d0d0",
                      borderBottom: colSel ? `2px solid ${XL}` : "1px solid #d0d0d0",
                      borderLeft: "1px solid #d0d0d0",
                      padding: "5px 10px",
                      color: colSel ? XL : "#333",
                      fontWeight: colSel ? 800 : 600,
                      fontSize: 13, textAlign: "center",
                    }}>{c}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {cells.map((row, ri) => {
                const rowSel = selBox && ri >= selBox.r1 && ri <= selBox.r2;
                return (
                  <tr key={ri}>
                    <td style={{ background: rowSel ? XL_HDR_SEL : "#f3f3f3", borderTop: "1px solid #d0d0d0", borderBottom: "1px solid #d0d0d0", borderLeft: "1px solid #d0d0d0", borderRight: rowSel ? `2px solid ${XL}` : "1px solid #d0d0d0", padding: "5px 6px", color: rowSel ? XL : "#888", textAlign: "center", fontSize: 13, fontWeight: rowSel ? 800 : 600 }}>
                      {ri + 1}
                    </td>
                    {row.map((cell, ci) => {
                      const isSel = selected?.ri === ri && selected?.ci === ci;
                      const inSelRange = selBox && ri >= selBox.r1 && ri <= selBox.r2 && ci >= selBox.c1 && ci <= selBox.c2;
                      const inFill = fillRange && ri >= fillRange.minR && ri <= fillRange.maxR && ci >= fillRange.minC && ci <= fillRange.maxC && cell.editable;
                      const inRangeSelect = rangeSelectBox && ri >= rangeSelectBox.minR && ri <= rangeSelectBox.maxR && ci >= rangeSelectBox.minC && ci <= rangeSelectBox.maxC;
                      const isSpecial = isSel || inFill || inRangeSelect || inSelRange;
                      const borderColor =
                        inRangeSelect ? XL : inFill ? XL : isSel ? XL : inSelRange ? XL
                        : cell.status === "correct" ? "#34A853"
                        : cell.status === "wrong" ? "#EA4335" : "#d0d0d0";
                      const bg =
                        cell.status === "correct" ? "#e6f4ea"
                        : cell.status === "wrong" ? "#fce8e6"
                        : inRangeSelect || inFill || (inSelRange && !isSel) ? XL_SOFT
                        : isSel ? "#fff"
                        : cell.editable && !cell.input ? XL_EDIT : "#fff";
                      const borderStyle = inRangeSelect || inFill ? "dashed" : "solid";
                      const borderWidth = isSpecial ? "2px" : "1px";
                      const cellBorder = `${borderWidth} ${borderStyle} ${borderColor}`;
                      // Phase 2: 수식 편집 중 참조 범위 → 바깥 변만 색 테두리 + 옅은 배경
                      const refSide = showRefs && !isSel ? refSideFor(ri, ci) : null;
                      const def1 = "1px solid #d0d0d0";
                      const bTop = refSide ? (refSide.bt ? `2px solid ${refSide.color}` : def1) : cellBorder;
                      const bRight = refSide ? (refSide.br ? `2px solid ${refSide.color}` : def1) : cellBorder;
                      const bBottom = refSide ? (refSide.bb ? `2px solid ${refSide.color}` : def1) : cellBorder;
                      const bLeft = refSide ? (refSide.bl ? `2px solid ${refSide.color}` : def1) : cellBorder;
                      const finalBg = refSide ? refSide.bg : bg;

                      // Phase 3: 표시 텍스트 + 정렬(number 오른쪽 / string 왼쪽 / boolean·에러 가운데)
                      let displayVal, cellAlign;
                      if (cell.editable) {
                        if (isSel && inputFocused) { displayVal = inputVal; cellAlign = "left"; }
                        else {
                          const addr = getAddr(ri, ci);
                          const raw = sheetRef.current?.getCellValue(addr);
                          if (raw === undefined || raw === "") { displayVal = cell.input || ""; cellAlign = "left"; }
                          else if (isErrorValue(raw)) { displayVal = raw.error; cellAlign = "center"; }
                          else if (typeof raw === "number" && sheetRef.current?.isDateCell(addr)) { displayVal = formatValue(raw, "yyyy-mm-dd"); cellAlign = "right"; }
                          else if (typeof raw === "number") { displayVal = cell.format ? formatValue(raw, cell.format) : String(raw); cellAlign = "right"; }
                          else if (typeof raw === "boolean") { displayVal = raw ? "TRUE" : "FALSE"; cellAlign = "center"; }
                          else { displayVal = cell.format ? formatValue(raw, cell.format) : String(raw); cellAlign = "left"; }
                        }
                      } else {
                        const v = cell.val;
                        if (typeof v === "number") { displayVal = cell.format ? formatValue(v, cell.format) : String(v); cellAlign = "right"; }
                        else { displayVal = (v === undefined || v === null) ? "" : (cell.format ? formatValue(v, cell.format) : String(v)); cellAlign = "left"; }
                      }

                      return (
                        <td
                          key={ci}
                          data-ri={ri}
                          data-ci={ci}
                          onPointerDown={(e) => handleCellPointerDown(e, ri, ci)}
                          onDoubleClick={() => enterEditMode(ri, ci)}
                          style={{
                            borderTop: bTop, borderRight: bRight, borderBottom: bBottom, borderLeft: bLeft,
                            background: finalBg, padding: 0, position: "relative", cursor: "cell", minWidth: 120,
                          }}
                        >
                          <div style={{ padding: "7px 12px", color: "#1f2937", minHeight: 30, fontFamily: FONT, fontSize: 14, textAlign: cellAlign }}>
                            {displayVal}
                          </div>
                          {isFillHandleCell(ri, ci) && (
                            <div
                              onPointerDown={(e) => handleFillDragStart(e)}
                              onDoubleClick={(e) => { e.stopPropagation(); fillHandleDoubleClick(); }}
                              title="드래그하여 자동 채우기 (더블클릭: 아래로 채우기)"
                              style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, background: XL, border: "1px solid #fff", cursor: "crosshair", zIndex: 10, touchAction: "none" }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 채점하기 버튼 */}
        <button
          onClick={grade}
          style={{ width: "100%", padding: "10px 0", borderRadius: 6, border: "none", background: XL, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          채점하기
        </button>

        {/* 채점 결과 (이모지 없음, empty 포함) */}
        {graded && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {gradeResults.map((res) => {
              const isCorrect = res.status === "correct";
              const label = isCorrect ? "정답" : res.status === "empty" ? "미입력" : "오답";
              return (
                <div key={res.addr} style={{
                  padding: "8px 14px", borderRadius: 6,
                  background: isCorrect ? "#e6f4ea" : "#fce8e6",
                  color: isCorrect ? "#1e6b3d" : "#b92b27",
                  fontSize: 13, border: `1px solid ${isCorrect ? "#a8d5b5" : "#f5b8b5"}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
                }}>
                  <span>{res.addr} · {label}{isCorrect ? "" : ` — ${res.reason}`}</span>
                  {!isCorrect && attempts >= 2 && res.answer && (
                    revealed[res.addr]
                      ? <span style={{ fontFamily: "'Malgun Gothic',monospace", color: "#1e6b3d", fontWeight: 700 }}>정답: {res.answer}</span>
                      : <button
                          onClick={() => setRevealed((m) => ({ ...m, [res.addr]: true }))}
                          style={{ background: "#fff", border: "1px solid #b92b27", color: "#b92b27", borderRadius: 5, padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >정답 수식 보기</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
