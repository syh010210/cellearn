# MINIEXCEL_SNAPSHOT

## 1. 관련 파일 목록

### `src/components/lesson/MiniExcel.jsx` 가 import 하는 파일
- `react` (`useState`, `useRef`, `useEffect`) — React 훅.
- `../../utils/formulaUtils` (`toAddr`, `shiftFormula`, `cycleReference`) — 행·열 인덱스 → 셀 주소 변환, 자동 채우기 시 상대 참조 이동, F4 `$` 토글.
- `../../utils/functionHints` (`getFunctionHint`) — 입력 문자열·커서 위치로 현재 함수명·인수 목록·활성 인수 인덱스 계산.
- `../../excel-engine/index.js` (`Sheet`) — 자체 수식 계산 엔진 공개 API 클래스.

### `MiniExcel` 을 import 하는 파일
- `src/components/lesson/ConceptView.jsx` (`import MiniExcel from "./MiniExcel";`, 2행) — 개념 카드 하단에서 렌더:
  - `c.practices.map((p, pi) => <MiniExcel key={...} practice={p} />)` (109행)
  - `c.practice && <MiniExcel key={idx} practice={c.practice} />` (110행)
  - `autoplay` prop은 전달하지 않음.

---

## 2. MiniExcel.jsx 소스 전문

`src/components/lesson/MiniExcel.jsx`

```jsx
import { useState, useRef, useEffect } from "react";
import { toAddr, shiftFormula, cycleReference } from "../../utils/formulaUtils";
import { getFunctionHint } from "../../utils/functionHints";
import { Sheet } from "../../excel-engine/index.js";

export default function MiniExcel({ practice, autoplay = false }) {
  const initCells = () =>
    practice.rows.map((row) => row.map((cell) => ({ ...cell, input: "", status: null })));

  const [cells, setCells] = useState(initCells);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [graded, setGraded] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  // 범위 선택 드래그 (수식 모드)
  const [rangeSelecting, setRangeSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);

  const sheetRef = useRef(null);
  const autoCancelRef = useRef(false); // 오토플레이(히어로 데모) 취소 플래그
  function cancelAuto() { autoCancelRef.current = true; }

  function getAddr(ri, ci) {
    return `${practice.cols[ci]}${ri + 1}`;
  }

  const inputRef = useRef();
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef(null);
  const hoverCellRef = useRef(null);
  const nextCursorPos = useRef(null);
  const isEditingRef = useRef(false);
  const isRangeDraggingRef = useRef(false);
  const rangeStartRef = useRef(null);
  const rangeDragCursorRef = useRef(0);

  useEffect(() => {
    // Sheet 초기화: non-editable 셀 값을 미리 로드
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
    setSelected(null);
    setInputVal("");
    setGraded(false);
    setRangeSelecting(false);
    setRangeStart(null);
    setHoverCell(null);
    isRangeDraggingRef.current = false;
    rangeStartRef.current = null;
  }, [practice]);

  useEffect(() => {
    if (nextCursorPos.current !== null && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(nextCursorPos.current, nextCursorPos.current);
      nextCursorPos.current = null;
    }
  }, [inputVal]);

  // 오토플레이(랜딩 히어로 데모): 마운트 시 1회, 첫 정답 셀에 수식을 타이핑→계산.
  // reduced-motion 존중, 사용자가 표를 건드리면 즉시 취소.
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
      setSelected({ ri: target.ri, ci: target.ci });
      for (let i = 1; i <= full.length; i++) {
        timers.push(setTimeout(() => { if (!autoCancelRef.current) setInputVal(full.slice(0, i)); }, i * 60));
      }
      timers.push(setTimeout(() => {
        if (autoCancelRef.current) return;
        commitInput(target.ri, target.ci, full);
        setInputVal("");
        setSelected(null);
      }, full.length * 60 + 350));
    }, 700));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  useEffect(() => {
    function onPointerMove(e) {
      if (!isDraggingRef.current && !isRangeDraggingRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const td = el?.closest?.("td[data-ri]");
      if (!td) return;
      const ri = parseInt(td.dataset.ri);
      const ci = parseInt(td.dataset.ci);
      if (isNaN(ri) || isNaN(ci)) return;
      if (hoverCellRef.current?.ri === ri && hoverCellRef.current?.ci === ci) return;
      hoverCellRef.current = { ri, ci };
      setHoverCell({ ri, ci });
    }

    function onPointerUp() {
      // 수식 범위 선택 드래그 완료
      if (isRangeDraggingRef.current) {
        const src = rangeStartRef.current;
        const tgt = hoverCellRef.current;
        if (src && tgt) {
          const r1 = Math.min(src.ri, tgt.ri);
          const c1 = Math.min(src.ci, tgt.ci);
          const r2 = Math.max(src.ri, tgt.ri);
          const c2 = Math.max(src.ci, tgt.ci);
          const addrToInsert =
            r1 === r2 && c1 === c2
              ? toAddr(r1, c1)
              : `${toAddr(r1, c1)}:${toAddr(r2, c2)}`;
          const insertAt = rangeDragCursorRef.current;
          setInputVal((v) => v.slice(0, insertAt) + addrToInsert + v.slice(insertAt));
          nextCursorPos.current = insertAt + addrToInsert.length;
        }
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

      if (src && tgt) {
        const sheet = sheetRef.current;
        setCells((prev) => {
          const srcCell = prev[src.ri]?.[src.ci];
          if (!srcCell?.editable || !srcCell.input) return prev;
          const next = prev.map((r) => r.map((c) => ({ ...c })));
          const minR = Math.min(src.ri, tgt.ri), maxR = Math.max(src.ri, tgt.ri);
          const minC = Math.min(src.ci, tgt.ci), maxC = Math.max(src.ci, tgt.ci);
          for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
              if (r === src.ri && c === src.ci) continue;
              if (!next[r]?.[c]?.editable) continue;
              const shifted = srcCell.input.startsWith("=")
                ? shiftFormula(srcCell.input, r - src.ri, c - src.ci)
                : srcCell.input;
              next[r][c].input = shifted;
              next[r][c].status = null;
              sheet?.setCellInput(`${practice.cols[c]}${r + 1}`, shifted);
            }
          }
          return next;
        });
        setGraded(false);
      }

      isDraggingRef.current = false;
      dragStartRef.current = null;
      hoverCellRef.current = null;
      setDragging(false);
      setDragStart(null);
      setHoverCell(null);
    }

    // Pointer Events로 마우스·터치·펜을 모두 처리 (태블릿 지원)
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const rowCount = cells.length;
  const colCount = cells[0]?.length || 0;

  function isFormulaMode() {
    return (
      inputRef.current !== null &&
      document.activeElement === inputRef.current &&
      inputVal.startsWith("=")
    );
  }

  // 수식 모드 중 셀 pointerdown: 범위 선택 드래그 시작 (즉시 삽입하지 않고 pointerup 시 삽입)
  function handleCellPointerDown(e, ri, ci) {
    cancelAuto();
    if (isFormulaMode()) {
      e.preventDefault();
      // 터치 드래그가 스크롤로 가로채이지 않도록 포인터 캡처
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 미지원 무시 */ }
      // 드래그 시작 시점의 커서 위치 저장 — pointerup 시 이 위치에 범위 주소 삽입
      rangeDragCursorRef.current = inputRef.current?.selectionStart ?? inputVal.length;
      isRangeDraggingRef.current = true;
      rangeStartRef.current = { ri, ci };
      hoverCellRef.current = { ri, ci };
      setRangeSelecting(true);
      setRangeStart({ ri, ci });
      setHoverCell({ ri, ci });
      inputRef.current?.focus();
    }
  }

  // 단일 클릭: 선택만 (편집 진입 X). 실제 엑셀처럼 채우기 핸들을 잡기 위한 선택 상태.
  function selectCell(ri, ci) {
    if (isFormulaMode()) return;
    isEditingRef.current = false;
    setSelected({ ri, ci });
    setInputVal(cells[ri][ci].editable ? (cells[ri][ci].input || "") : (cells[ri][ci].val || ""));
    // 포커스하지 않는다 — 편집은 더블클릭(enterEditMode)에서만 시작.
  }

  // 더블 클릭: 편집 모드 진입 (입력창 포커스). 이때만 셀 안에서 수정이 가능하다.
  function enterEditMode(ri, ci) {
    if (!cells[ri][ci].editable) return;
    if (isFormulaMode()) return;
    setSelected({ ri, ci });
    setInputVal(cells[ri][ci].input || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitInput(ri, ci, val) {
    const cell = cells[ri][ci];
    if (!cell.editable) return;
    isEditingRef.current = false;
    const trimmed = val.trim();
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

  function grade() {
    if (selected && cells[selected.ri]?.[selected.ci]?.editable) {
      commitInput(selected.ri, selected.ci, inputVal);
    }
    const sheet = sheetRef.current;
    setCells((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => {
          if (!cell.editable) return cell;
          const val = cell.input.trim();
          if (val === "") return { ...cell, status: null };
          const addr = `${practice.cols[ci]}${ri + 1}`;
          const computed = sheet?.getDisplayValue(addr) ?? val;
          const expected = cell.result;
          const ok =
            expected !== undefined
              ? String(computed) === String(expected) ||
                (!isNaN(parseFloat(String(computed))) &&
                  !isNaN(parseFloat(String(expected))) &&
                  parseFloat(String(computed)) === parseFloat(String(expected)))
              : val.toUpperCase() === (cell.answer || "").toUpperCase();
          return { ...cell, status: ok ? "correct" : "wrong" };
        })
      )
    );
    setGraded(true);
  }

  function handleKeyDown(e) {
    if (!selected) return;
    const { ri, ci } = selected;

    if (e.key === "F4") {
      e.preventDefault();
      if (!inputVal.startsWith("=")) return;
      const pos = inputRef.current?.selectionStart ?? inputVal.length;
      const { formula: newFormula, cursorPos: newPos } = cycleReference(inputVal, pos);
      nextCursorPos.current = newPos;
      setInputVal(newFormula);
      return;
    }

    if (e.key === "Enter") {
      commitInput(ri, ci, inputVal);
      if (ri + 1 < rowCount && cells[ri + 1]?.[ci]?.editable) {
        setSelected({ ri: ri + 1, ci });
        setInputVal(cells[ri + 1][ci].input || "");
        setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        inputRef.current?.blur();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitInput(ri, ci, inputVal);
      if (ci + 1 < colCount) {
        setSelected({ ri, ci: ci + 1 });
        setInputVal(cells[ri][ci + 1]?.input || "");
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    } else if (e.key === "Escape") {
      setInputVal(cells[ri][ci].input || "");
      inputRef.current?.blur();
    }
  }

  function handleFillDragStart(e, ri, ci) {
    e.preventDefault();
    e.stopPropagation();
    if (isFormulaMode()) return;
    // 터치로 핸들을 끌 때 스크롤 대신 드래그가 유지되도록 포인터 캡처
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 미지원 무시 */ }
    if (selected) {
      const selRi = selected.ri, selCi = selected.ci;
      const trimmed = inputVal.trim();
      setCells((prev) =>
        prev.map((row, r) =>
          row.map((c, cc) =>
            r === selRi && cc === selCi && c.editable ? { ...c, input: trimmed, status: null } : c
          )
        )
      );
    }
    isDraggingRef.current = true;
    dragStartRef.current = { ri, ci };
    hoverCellRef.current = { ri, ci };
    setDragging(true);
    setDragStart({ ri, ci });
    setHoverCell({ ri, ci });
  }

  // 주소창에 표시할 주소 (범위 선택 중이면 A3:A5 형식)
  const addrStr = (() => {
    if (rangeSelecting && rangeStart && hoverCell) {
      const r1 = Math.min(rangeStart.ri, hoverCell.ri);
      const c1 = Math.min(rangeStart.ci, hoverCell.ci);
      const r2 = Math.max(rangeStart.ri, hoverCell.ri);
      const c2 = Math.max(rangeStart.ci, hoverCell.ci);
      return r1 === r2 && c1 === c2
        ? toAddr(r1, c1)
        : `${toAddr(r1, c1)}:${toAddr(r2, c2)}`;
    }
    return selected ? toAddr(selected.ri, selected.ci) : "";
  })();

  const fillRange =
    dragging && dragStart && hoverCell
      ? {
          minR: Math.min(dragStart.ri, hoverCell.ri),
          maxR: Math.max(dragStart.ri, hoverCell.ri),
          minC: Math.min(dragStart.ci, hoverCell.ci),
          maxC: Math.max(dragStart.ci, hoverCell.ci),
        }
      : null;

  const rangeSelectBox =
    rangeSelecting && rangeStart && hoverCell
      ? {
          minR: Math.min(rangeStart.ri, hoverCell.ri),
          maxR: Math.max(rangeStart.ri, hoverCell.ri),
          minC: Math.min(rangeStart.ci, hoverCell.ci),
          maxC: Math.max(rangeStart.ci, hoverCell.ci),
        }
      : null;

  const selCell = selected ? cells[selected.ri]?.[selected.ci] : null;

  // 모든 셀이 비어있고 non-editable인 열 = 스페이서 열 (좁게 렌더)
  const spacerCols = new Set();
  for (let ci = 0; ci < colCount; ci++) {
    if (cells.every(row => {
      const c = row[ci];
      return !c?.editable && (c?.val === "" || c?.val === null || c?.val === undefined);
    })) spacerCols.add(ci);
  }

  // 처음으로 editable 셀이 등장하는 열 인덱스 (참조 영역 / 입력 영역 구분선)
  const firstEditableColIdx = (() => {
    for (let ci = 0; ci < colCount; ci++) {
      if (cells.some(row => row[ci]?.editable)) return ci;
    }
    return -1;
  })();

  // 입력 열이 (헤더 아래에) 참조 데이터를 함께 가진 경우 = 아래에 다른 표가 걸쳐 있는 형태.
  // 이때는 구분 스페이서를 넣으면 아래 표가 중간에서 끊기므로 넣지 않는다.
  const editColSharesRefData = firstEditableColIdx >= 0 && cells.some((row, ri) => {
    if (ri === 0) return false;
    const c = row[firstEditableColIdx];
    return c && !c.editable && c.val !== "" && c.val !== null && c.val !== undefined;
  });

  // 함수 인수 힌트
  const activeHint = inputFocused ? getFunctionHint(inputVal, cursorPos) : null;

  const FONT = "'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif";
  // 실제 MS 엑셀 룩 — 엑셀 그린 계열로 통일
  const XL = "#217346";        // 엑셀 브랜드 그린 (선택 테두리·핸들·버튼)
  const XL_SOFT = "#e6f2ea";   // 선택/범위 채움 연녹
  const XL_EDIT = "#eef6f1";   // 입력 대상 빈 셀 옅은 녹색 틴트
  const XL_HDR_SEL = "#cfe6da"; // 선택된 셀의 행/열 머리 강조

  return (
    <div style={{ marginTop: 20, userSelect: "none", fontFamily: FONT }}>
      {/* ── 문제 카드 (상단, 엑셀과 분리) — 가독성 우선, 엑셀 색 미사용 ── */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <span style={{ display: "inline-block", background: "#1f2937", color: "#fff", fontSize: 11.5, fontWeight: 800, letterSpacing: 1, padding: "3px 11px", borderRadius: 999, marginBottom: 10 }}>문제</span>
        <p style={{ color: "#1f2937", fontSize: 18.5, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>{practice.instruction}</p>
      </div>

      {/* ── 엑셀 카드 (하단) ── */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
      {/* 수식 입력창 (Excel 스타일) */}
      <div style={{ display: "flex", alignItems: "stretch", background: "#f5f5f5", border: "1px solid #d0d0d0", borderBottom: "none", borderRadius: "4px 4px 0 0" }}>
        <div style={{ minWidth: 64, fontWeight: 700, color: "#333", fontSize: 13, textAlign: "center", borderRight: "1px solid #d0d0d0", padding: "6px 8px", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {addrStr || "—"}
        </div>
        <div style={{ padding: "6px 10px", color: "#888", fontSize: 13, borderRight: "1px solid #d0d0d0", display: "flex", alignItems: "center", fontStyle: "italic", fontWeight: 700 }}>fx</div>
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => {
            isEditingRef.current = true;
            setInputVal(e.target.value);
            setCursorPos(e.target.selectionStart ?? e.target.value.length);
          }}
          onKeyDown={handleKeyDown}
          onSelect={(e) => setCursorPos(e.target.selectionStart ?? inputVal.length)}
          onFocus={() => {
            cancelAuto();
            setInputFocused(true);
            if (inputVal.startsWith("=")) isEditingRef.current = true;
          }}
          onBlur={() => {
            setInputFocused(false);
            if (selected && selCell?.editable) commitInput(selected.ri, selected.ci, inputVal);
          }}
          placeholder={selCell?.editable ? "수식 입력... (셀 드래그로 범위 삽입, F4로 참조 고정)" : ""}
          readOnly={!selCell?.editable}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1f2937", fontSize: 14, fontFamily: FONT, padding: "6px 8px" }}
        />
        {selected && selCell?.editable && (
          <button
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              commitInput(selected.ri, selected.ci, inputVal);
              setSelected(null);
              setInputVal("");
              inputRef.current?.blur();
            }}
            style={{ background: XL, border: "none", color: "#fff", padding: "0 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, borderRadius: "0 4px 0 0" }}
          >
            ✓
          </button>
        )}
      </div>

      {/* 함수 인수 힌트 바 */}
      {activeHint && (
        <div style={{
          background: "#fff9c4",
          border: "1px solid #d0d0d0",
          borderTop: "none",
          borderBottom: "none",
          padding: "4px 14px",
          fontSize: 12,
          fontFamily: FONT,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0,
        }}>
          <span style={{ fontWeight: 700, color: XL }}>{activeHint.name}</span>
          <span style={{ color: "#555" }}>(</span>
          {activeHint.args.map((arg, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: "#999" }}>,&nbsp;</span>}
              <span style={{
                color: i === activeHint.argIdx ? XL : "#555",
                fontWeight: i === activeHint.argIdx ? 700 : 400,
                textDecoration: i === activeHint.argIdx ? "underline" : "none",
              }}>{arg}</span>
            </span>
          ))}
          <span style={{ color: "#555" }}>)</span>
        </div>
      )}

      {/* 테이블 */}
      <div style={{ overflowX: "auto", border: "1px solid #d0d0d0", borderRadius: "0 0 4px 4px", marginBottom: 16, touchAction: (dragging || rangeSelecting) ? "none" : "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 14, fontFamily: FONT }}>
          <thead>
            <tr>
              <th style={{ width: 36, background: "#f3f3f3", border: "1px solid #d0d0d0", padding: "5px 6px", color: "#888" }} />
              {practice.cols.flatMap((c, ci) => {
                const isSpacer = spacerCols.has(ci);
                const addVirtualSpacer =
                  ci === firstEditableColIdx &&
                  firstEditableColIdx > 0 &&
                  !spacerCols.has(firstEditableColIdx - 1) &&
                  !editColSharesRefData;
                const ths = [];
                if (addVirtualSpacer) {
                  ths.push(
                    <th key={`vs-${ci}`} style={{
                      minWidth: 32, width: 32,
                      background: "#f3f3f3",
                      borderTop: "1px solid #d0d0d0",
                      borderRight: "1px solid #d0d0d0",
                      borderBottom: "1px solid #d0d0d0",
                      borderLeft: "1px solid #d0d0d0",
                    }} />
                  );
                }
                const colSel = selected?.ci === ci && !isSpacer;
                ths.push(
                  <th key={c} style={{
                    minWidth: isSpacer ? 32 : 120,
                    width: isSpacer ? 32 : undefined,
                    background: colSel ? XL_HDR_SEL : "#f3f3f3",
                    borderTop: "1px solid #d0d0d0",
                    borderRight: "1px solid #d0d0d0",
                    borderBottom: colSel ? `2px solid ${XL}` : "1px solid #d0d0d0",
                    borderLeft: "1px solid #d0d0d0",
                    padding: isSpacer ? "5px 0" : "5px 10px",
                    color: isSpacer ? "#ccc" : colSel ? XL : "#333",
                    fontWeight: colSel ? 800 : 600,
                    fontSize: 13,
                    textAlign: "center",
                  }}>
                    {isSpacer ? "" : c}
                  </th>
                );
                return ths;
              })}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                <td style={{ background: selected?.ri === ri ? XL_HDR_SEL : "#f3f3f3", borderTop: "1px solid #d0d0d0", borderBottom: "1px solid #d0d0d0", borderLeft: "1px solid #d0d0d0", borderRight: selected?.ri === ri ? `2px solid ${XL}` : "1px solid #d0d0d0", padding: "5px 6px", color: selected?.ri === ri ? XL : "#888", textAlign: "center", fontSize: 13, fontWeight: selected?.ri === ri ? 800 : 600 }}>
                  {ri + 1}
                </td>
                {row.flatMap((cell, ci) => {
                  const isSel = selected?.ri === ri && selected?.ci === ci;
                  const inFill =
                    fillRange &&
                    ri >= fillRange.minR && ri <= fillRange.maxR &&
                    ci >= fillRange.minC && ci <= fillRange.maxC &&
                    !(ri === dragStart?.ri && ci === dragStart?.ci) &&
                    cell.editable;
                  const inRangeSelect =
                    rangeSelectBox &&
                    ri >= rangeSelectBox.minR && ri <= rangeSelectBox.maxR &&
                    ci >= rangeSelectBox.minC && ci <= rangeSelectBox.maxC;

                  const isSpecial = isSel || inFill || inRangeSelect;
                  const borderColor = inRangeSelect
                    ? XL
                    : inFill
                    ? XL
                    : isSel
                    ? XL
                    : cell.status === "correct"
                    ? "#34A853"
                    : cell.status === "wrong"
                    ? "#EA4335"
                    : "#d0d0d0";
                  const bg =
                    cell.status === "correct"
                    ? "#e6f4ea"
                    : cell.status === "wrong"
                    ? "#fce8e6"
                    : inRangeSelect || inFill || isSel
                    ? XL_SOFT
                    : cell.editable && !cell.input
                    ? XL_EDIT
                    : "#fff";
                  const borderStyle = inRangeSelect || inFill ? "dashed" : "solid";
                  const borderWidth = isSpecial ? "2px" : "1px";

                  const isSpacer = spacerCols.has(ci);
                  const cellBorder = isSpacer ? "1px solid #e8e8e8" : `${borderWidth} ${borderStyle} ${borderColor}`;

                  const addVirtualSpacer =
                    ci === firstEditableColIdx &&
                    firstEditableColIdx > 0 &&
                    !spacerCols.has(firstEditableColIdx - 1) &&
                    !editColSharesRefData;

                  const tds = [];
                  if (addVirtualSpacer) {
                    tds.push(
                      <td key={`vs-${ri}-${ci}`} style={{
                        minWidth: 32, width: 32,
                        borderTop: "1px solid #e8e8e8",
                        borderRight: "1px solid #e8e8e8",
                        borderBottom: "1px solid #e8e8e8",
                        borderLeft: "1px solid #e8e8e8",
                        background: "#f9f9f9",
                        padding: 0,
                        cursor: "default",
                      }} />
                    );
                  }
                  tds.push(
                    <td
                      key={ci}
                      data-ri={ri}
                      data-ci={ci}
                      onPointerDown={(e) => handleCellPointerDown(e, ri, ci)}
                      onClick={() => selectCell(ri, ci)}
                      onDoubleClick={() => enterEditMode(ri, ci)}
                      style={{
                        borderTop: cellBorder,
                        borderRight: cellBorder,
                        borderBottom: cellBorder,
                        borderLeft: isSpacer ? "1px solid #e8e8e8" : `${borderWidth} ${borderStyle} ${borderColor}`,
                        background: isSpacer ? "#f9f9f9" : bg,
                        padding: 0,
                        position: "relative",
                        cursor: isSpacer ? "default" : "cell",
                        minWidth: isSpacer ? 32 : 120,
                        width: isSpacer ? 32 : undefined,
                      }}
                    >
                      <div style={{ padding: "7px 12px", color: "#1f2937", minHeight: 30, fontFamily: FONT, fontSize: 14 }}>
                        {cell.editable
                          ? isSel && inputFocused
                            ? inputVal
                            : (() => {
                                const v = sheetRef.current?.getDisplayValue(getAddr(ri, ci));
                                return v !== undefined && v !== '' ? String(v) : (cell.input || '');
                              })()
                          : cell.val}
                      </div>
                      {isSel && cell.editable && (
                        <div
                          onPointerDown={(e) => handleFillDragStart(e, ri, ci)}
                          title="드래그하여 자동 채우기"
                          style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, background: XL, border: "1px solid #fff", cursor: "crosshair", zIndex: 10, touchAction: "none" }}
                        />
                      )}
                    </td>
                  );
                  return tds;
                })}
              </tr>
            ))}
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

      {/* 채점 결과 */}
      {graded && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {cells.flatMap((row, ri) =>
            row.map((cell, ci) => {
              if (!cell.editable || !cell.status) return null;
              return (
                <div
                  key={`${ri}-${ci}`}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    background: cell.status === "correct" ? "#e6f4ea" : "#fce8e6",
                    color: cell.status === "correct" ? "#1e6b3d" : "#b92b27",
                    fontSize: 13,
                    border: `1px solid ${cell.status === "correct" ? "#a8d5b5" : "#f5b8b5"}`,
                  }}
                >
                  {toAddr(ri, ci)}: {cell.status === "correct" ? "✅ 정답입니다!" : `❌ 오답 — 힌트: ${cell.answer}`}
                </div>
              );
            })
          )}
        </div>
      )}
      </div>
    </div>
  );
}
```

---

## 3. 동작별 구현 위치

파일은 별도 표기 없으면 `src/components/lesson/MiniExcel.jsx`.

| 동작 | 위치 |
|---|---|
| 셀 선택 (클릭) | `selectCell` (227–233) / `<td onClick={() => selectCell(ri, ci)}>` (630) |
| 범위 선택 드래그 (수식 편집 중) | `handleCellPointerDown` (208–224), `onPointerMove` (106–117), `onPointerUp` 범위 삽입 분기 (120–145); `rangeSelectBox` 계산 (374–382); 셀 하이라이트 (562–597) |
| Shift+클릭 | 없음 |
| Shift+방향키 | 없음 |
| 방향키 이동 | 없음 |
| Enter | `handleKeyDown` (302–310) — commit 후 아래 셀로 이동 |
| Tab | `handleKeyDown` (311–318) — commit 후 오른쪽 셀로 이동 |
| Delete | 없음 |
| F2 | 없음 (편집 진입은 더블클릭 `enterEditMode` 236–242) |
| Esc | `handleKeyDown` (319–322) — 입력 되돌리고 blur |
| 편집 모드 진입 | `enterEditMode` (236–242, 더블클릭). `selectCell`(227–233)은 선택만 |
| 편집 모드 종료 | `commitInput` (244–258); `onBlur` (452–455); Enter/Tab/Esc (302–322); ✓ 버튼 (460–473) |
| 수식 입력줄 동기화 | `<input value={inputVal}>` (437–459), `onChange` (440–444); 셀 표시 시 `isSel && inputFocused ? inputVal` (646–648) |
| 수식 편집 중 셀 클릭·드래그 참조 삽입 | `isFormulaMode` (199–205), `handleCellPointerDown` (208–224), `onPointerUp` 삽입 (120–145) — 커서 위치에 `A1` 또는 `A1:B2` 삽입 |
| F4 `$` 토글 | `handleKeyDown` F4 분기 (292–300) → `cycleReference` (`utils/formulaUtils.js`) |
| 수식 편집 중 참조 범위 색상 표시 | 없음 (드래그로 **선택 중인** 범위 하이라이트 `rangeSelectBox`는 있으나, 입력된 수식 문자열의 참조 셀을 파싱해 색칠하는 기능은 없음) |
| 함수 자동완성 (함수명 드롭다운) | 없음 |
| 인수 힌트 | `activeHint` (412) ← `getFunctionHint` (`utils/functionHints.js`); 힌트 바 렌더 (477–505) |
| 채우기 핸들 드래그 + 상대 참조 이동 | `handleFillDragStart` (325–348), `onPointerUp` 채우기 분기 (147–183) → `shiftFormula`; 핸들 렌더 (655–661); `fillRange` (364–372) |
| Ctrl+Z | 없음 |
| Ctrl+C | 없음 |
| Ctrl+V | 없음 |
| 숫자·문자 정렬 (타입별 정렬) | 없음 (셀 내용 div 고정 `padding: "7px 12px"`, 기본 좌측 정렬 — 645) |
| 표시 형식 (number format) | 없음 |
| 에러값 표시 | `Sheet.getDisplayValue`가 반환하는 에러 문자열(예: `#DIV/0!`)을 그대로 출력 (650–652). 엔진 측 `getDisplayValue` (`excel-engine/index.js` 142–147: `isErrorValue`면 `v.error` 반환). 오류 전용 스타일 없음 |
| 이름 상자 | `addrStr` 계산 (351–362), fx 바 좌측 주소 칸에 표시 (433–435). 주소를 입력해 이동하는 기능 없음(읽기 표시만) |

---

## 4. 계산 흐름

- MiniExcel은 **`excel-engine`의 `Sheet`만** 사용한다. `utils/formulaEval.js`는 import 하지 않는다(갈림 없음).
- 초기화: `useEffect([practice])` (41–63) — `new Sheet()` 생성 후 non-editable 셀 값을 `sheet.setCellInput`으로 로드, `sheetRef.current`에 저장.
- 입력: fx `<input>` `onChange` (440–444)는 `inputVal` state만 갱신(계산 안 함).
- 커밋: `commitInput` (244–258)에서 `sheetRef.current.setCellInput(getAddr(ri, ci), trimmed)` 호출. 호출 시점 = Enter(303)/Tab(313)/blur(454)/✓버튼(464)/자동 채우기(169).
- 엔진 내부(`excel-engine/index.js` `Sheet.setCellInput`): `=`로 시작하면 `parseFormula` → AST → `collectReferences` → `dependencyGraph.setDependencies` → `recalculate`(위상 정렬로 영향 셀 `evaluate`).
- 표시: 렌더 시 editable 셀은 `sheetRef.current.getDisplayValue(getAddr(ri, ci))` (650–652), non-editable 셀은 `cell.val` (653). 단, 선택+포커스 중인 셀은 `inputVal`을 그대로 표시 (647–648).

---

## 5. 채점 흐름

- 채점하기 버튼 `onClick={grade}` (673–678).
- `grade()` (260–286):
  1. 선택 셀이 editable이면 먼저 `commitInput`으로 커밋 (261–263).
  2. 각 editable 셀에 대해 `computed = sheet.getDisplayValue(addr)`, `expected = cell.result`.
  3. 판정 기준:
     - `cell.result`가 정의돼 있으면 → `String(computed) === String(expected)` **또는** 둘 다 숫자로 파싱되고 `parseFloat` 값이 같으면 정답. (즉 **계산 결과값** 비교)
     - `cell.result`가 없으면 → `cell.input.toUpperCase() === (cell.answer||"").toUpperCase()` (입력 문자열 비교).
  4. 각 셀에 `status: "correct" | "wrong"` 부여, `graded=true`.
- 오답 셀 안내에는 `cell.answer`가 힌트로 노출 (698).

`grade()` 소스 (MiniExcel.jsx 260–286):

```jsx
function grade() {
  if (selected && cells[selected.ri]?.[selected.ci]?.editable) {
    commitInput(selected.ri, selected.ci, inputVal);
  }
  const sheet = sheetRef.current;
  setCells((prev) =>
    prev.map((row, ri) =>
      row.map((cell, ci) => {
        if (!cell.editable) return cell;
        const val = cell.input.trim();
        if (val === "") return { ...cell, status: null };
        const addr = `${practice.cols[ci]}${ri + 1}`;
        const computed = sheet?.getDisplayValue(addr) ?? val;
        const expected = cell.result;
        const ok =
          expected !== undefined
            ? String(computed) === String(expected) ||
              (!isNaN(parseFloat(String(computed))) &&
                !isNaN(parseFloat(String(expected))) &&
                parseFloat(String(computed)) === parseFloat(String(expected)))
            : val.toUpperCase() === (cell.answer || "").toUpperCase();
        return { ...cell, status: ok ? "correct" : "wrong" };
      })
    )
  );
  setGraded(true);
}
```

### 별도 경로: 업로드 xlsx 채점 (`src/utils/excelGrader.js`)

MiniExcel의 채점하기 버튼과는 다른 경로다. 다운로드한 `.xlsx`를 업로드해 채점하며, 셀의 **수식 문자열**(`cellObj.f`)을 공백 제거 후 `practiceAnswers[].formula`와 정확히 비교한다. (MiniExcel.jsx는 이 파일을 import하지 않음. 계산 결과값 비교인 `grade()`와 기준이 다름.)

`excelGrader.js` 소스 전문:

```js
import XLSX from "xlsx-js-style";

export function gradeExcel(file, practiceAnswers) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array", cellFormula: true });
        const results = practiceAnswers.map((ans) => {
          const ws = wb.Sheets[ans.sheet];
          if (!ws) return { ...ans, status: "시트없음", studentFormula: "-" };
          const cellObj = ws[ans.cell];
          const studentFormula = cellObj?.f
            ? `=${cellObj.f}`
            : cellObj?.v !== undefined
            ? String(cellObj.v)
            : "";
          const correct = studentFormula.replace(/\s/g, "") === ans.formula.replace(/\s/g, "");
          return { ...ans, status: correct ? "correct" : "wrong", studentFormula };
        });
        resolve(results);
      } catch {
        reject(new Error("파일을 읽는 중 오류가 발생했어요."));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
```

### 정답 데이터 형태 (in-app 실습: `cell.answer` / `cell.result`)

4차시 VLOOKUP 실습의 정답 셀은 `rows` 안의 editable 셀에 `answer`(정답 수식 문자열)와 `result`(정답 결과값)로 들어 있다. 예 (`src/data/lessons/lesson-4.json` 개념1 practice의 D2·D3 셀):

```json
{ "val": "", "editable": true, "answer": "=VLOOKUP(C2,$A$6:$C$8,3,0)", "result": 500000 }
```
```json
{ "val": "", "editable": true, "answer": "=VLOOKUP(C3,$A$6:$C$8,3,0)", "result": 200000 }
```

### 정답 데이터 형태 (업로드 xlsx 채점: `practiceAnswers`)

`src/data/lessons/lesson-4.json` 최상위 `practiceAnswers` 배열 (업로드 채점용, `{ sheet, cell, formula }`):

```json
"practiceAnswers": [
  { "sheet": "방향검색", "cell": "C2", "formula": "=VLOOKUP(\"B-102\",A2:B4,2,0)" },
  { "sheet": "위치찾기", "cell": "C3", "formula": "=MATCH(\"이영희\",B2:B4,0)" },
  { "sheet": "조합활용", "cell": "B7", "formula": "=INDEX(A2:A5,MATCH(MAX(D2:D5),D2:D5,0))" },
  { "sheet": "값선택", "cell": "C2", "formula": "=CHOOSE(RIGHT(B2,1),\"실버\",\"골드\",\"VIP\")" },
  { "sheet": "값선택", "cell": "C3", "formula": "=CHOOSE(RIGHT(B3,1),\"실버\",\"골드\",\"VIP\")" },
  { "sheet": "값선택", "cell": "C4", "formula": "=CHOOSE(RIGHT(B4,1),\"실버\",\"골드\",\"VIP\")" }
]
```

---

## 6. 실습 데이터 구조

### MiniExcel props
- `practice` (필수, object)
  - `instruction` (string) — 문제 지시문. 문제 카드에 렌더 (426).
  - `cols` (string[]) — 열 문자 배열. `getAddr`에서 셀 주소 생성에 사용 (28).
  - `rows` (2차원 배열) — 각 원소는 셀 객체:
    - `val` (string|number) — 표시 값(비편집 셀) / 초기 표시.
    - `editable` (boolean) — 학생이 입력하는 셀 여부.
    - `answer` (string, editable 셀만) — 정답 수식 문자열(오답 힌트·오토플레이·문자열 채점에 사용).
    - `result` (string|number, editable 셀만) — 정답 결과값(계산값 채점 기준).
  - (런타임에 각 셀에 `input: ""`, `status: null` 필드가 추가됨 — `initCells` 8행)
- `autoplay` (boolean, 기본 `false`) — 마운트 시 첫 정답 셀에 수식을 자동 타이핑하는 데모. ConceptView에서는 전달하지 않음.

### 4차시 VLOOKUP 실습 JSON 블록 (`src/data/lessons/lesson-4.json`, 개념1 `practice`)

```json
"practice": {
  "instruction": "[표1]에서 각 사원의 등급[C2:C3]과 [A6:C8] 영역의 [등급표]를 이용하여 상여금[D2:D3]을 구하시오. (VLOOKUP 함수 사용 · D2에 입력한 뒤 D3로 자동 채우기)",
  "cols": ["A", "B", "C", "D"],
  "rows": [
    [
      { "val": "사원명", "editable": false },
      { "val": "부서", "editable": false },
      { "val": "등급", "editable": false },
      { "val": "상여금", "editable": false }
    ],
    [
      { "val": "김유신", "editable": false },
      { "val": "영업1팀", "editable": false },
      { "val": "A", "editable": false },
      { "val": "", "editable": true, "answer": "=VLOOKUP(C2,$A$6:$C$8,3,0)", "result": 500000 }
    ],
    [
      { "val": "이순신", "editable": false },
      { "val": "관리팀", "editable": false },
      { "val": "C", "editable": false },
      { "val": "", "editable": true, "answer": "=VLOOKUP(C3,$A$6:$C$8,3,0)", "result": 200000 }
    ],
    [
      { "val": "", "editable": false },
      { "val": "", "editable": false },
      { "val": "", "editable": false },
      { "val": "", "editable": false }
    ],
    [
      { "val": "등급", "editable": false },
      { "val": "직무", "editable": false },
      { "val": "상여금", "editable": false },
      { "val": "", "editable": false }
    ],
    [
      { "val": "A", "editable": false },
      { "val": "영업", "editable": false },
      { "val": 500000, "editable": false },
      { "val": "", "editable": false }
    ],
    [
      { "val": "B", "editable": false },
      { "val": "관리", "editable": false },
      { "val": 350000, "editable": false },
      { "val": "", "editable": false }
    ],
    [
      { "val": "C", "editable": false },
      { "val": "지원", "editable": false },
      { "val": 200000, "editable": false },
      { "val": "", "editable": false }
    ]
  ]
}
```

### ConceptView에서 넘기는 방식 (`src/components/lesson/ConceptView.jsx` 109–110)

```jsx
? c.practices.map((p, pi) => <MiniExcel key={`${idx}-p${pi}`} practice={p} />)
: c.practice && <MiniExcel key={idx} practice={c.practice} />}
```

---

## 7. TODO / FIXME / 미완성 주석

- `MiniExcel.jsx` 내 `TODO`, `FIXME`, `XXX`, "미완성/미구현" 주석: **없음**.
- 참고: 미완성 표기는 아니지만 코드에 있는 관련 주석
  - `try { ... } catch { /* 미지원 무시 */ }` — 포인터 캡처 미지원 브라우저 무시 (213, 330).
  - `// eslint-disable-next-line react-hooks/exhaustive-deps` — 오토플레이 useEffect 의존성 경고 억제 (102).
