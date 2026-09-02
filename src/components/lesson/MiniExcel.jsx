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
    function onMouseMove(e) {
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

    function onMouseUp() {
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

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
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

  // 수식 모드 중 셀 mousedown: 범위 선택 드래그 시작 (즉시 삽입하지 않고 mouseup 시 삽입)
  function handleCellMouseDown(e, ri, ci) {
    cancelAuto();
    if (isFormulaMode()) {
      e.preventDefault();
      // 드래그 시작 시점의 커서 위치 저장 — mouseup 시 이 위치에 범위 주소 삽입
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

  // 함수 인수 힌트
  const activeHint = inputFocused ? getFunctionHint(inputVal, cursorPos) : null;

  const FONT = "'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif";
  // 실제 MS 엑셀 룩 — 엑셀 그린 계열로 통일
  const XL = "#217346";        // 엑셀 브랜드 그린 (선택 테두리·핸들·버튼)
  const XL_SOFT = "#e6f2ea";   // 선택/범위 채움 연녹
  const XL_EDIT = "#eef6f1";   // 입력 대상 빈 셀 옅은 녹색 틴트
  const XL_HDR_SEL = "#cfe6da"; // 선택된 셀의 행/열 머리 강조

  return (
    <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: "20px 24px", userSelect: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", fontFamily: FONT }}>
      {/* 문제 설명 */}
      <div style={{ background: "#e8f0ec", border: "1px solid #bfe0d2", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
        <span style={{ color: "#123a33", fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>문제</span>
        <p style={{ color: "#1c2f2a", fontSize: 15, fontWeight: 600, margin: "4px 0 0", lineHeight: 1.6 }}>{practice.instruction}</p>
      </div>

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
            onMouseDown={(e) => e.preventDefault()}
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
      <div style={{ overflowX: "auto", border: "1px solid #d0d0d0", borderRadius: "0 0 4px 4px", marginBottom: 16 }}>
        <table style={{ borderCollapse: "collapse", fontSize: 14, fontFamily: FONT }}>
          <thead>
            <tr>
              <th style={{ width: 36, background: "#f3f3f3", border: "1px solid #d0d0d0", padding: "5px 6px", color: "#888" }} />
              {practice.cols.flatMap((c, ci) => {
                const isSpacer = spacerCols.has(ci);
                const addVirtualSpacer =
                  ci === firstEditableColIdx &&
                  firstEditableColIdx > 0 &&
                  !spacerCols.has(firstEditableColIdx - 1);
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
                    !spacerCols.has(firstEditableColIdx - 1);

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
                      onMouseDown={(e) => handleCellMouseDown(e, ri, ci)}
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
                          onMouseDown={(e) => handleFillDragStart(e, ri, ci)}
                          title="드래그하여 자동 채우기"
                          style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, background: XL, border: "1px solid #fff", cursor: "crosshair", zIndex: 10 }}
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
  );
}
