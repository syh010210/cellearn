import { useState, useRef, useEffect } from "react";
import { toAddr, shiftFormula } from "../../utils/formulaUtils";

export default function MiniExcel({ practice }) {
  const initCells = () =>
    practice.rows.map((row) => row.map((cell) => ({ ...cell, input: "", status: null })));

  const [cells, setCells] = useState(initCells);
  const [selected, setSelected] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    setCells(initCells());
    setSelected(null);
    setInputVal("");
  }, [practice]);

  const rowCount = cells.length;
  const colCount = cells[0]?.length || 0;

  function selectCell(ri, ci) {
    if (!cells[ri][ci].editable) {
      setSelected({ ri, ci });
      setInputVal(cells[ri][ci].val || "");
      return;
    }
    setSelected({ ri, ci });
    setInputVal(cells[ri][ci].input || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitInput(ri, ci, val) {
    const cell = cells[ri][ci];
    if (!cell.editable) return;
    const trimmed = val.trim();
    const correct = trimmed === cell.answer;
    setCells((prev) =>
      prev.map((row, r) =>
        row.map((c, cc) =>
          r === ri && cc === ci
            ? { ...c, input: trimmed, status: trimmed === "" ? null : correct ? "correct" : "wrong" }
            : c
        )
      )
    );
  }

  function handleKeyDown(e) {
    if (!selected) return;
    const { ri, ci } = selected;
    if (e.key === "Enter") {
      commitInput(ri, ci, inputVal);
      if (ri + 1 < rowCount) selectCell(ri + 1, ci);
      else inputRef.current?.blur();
    } else if (e.key === "Tab") {
      e.preventDefault();
      commitInput(ri, ci, inputVal);
      if (ci + 1 < colCount) selectCell(ri, ci + 1);
    } else if (e.key === "Escape") {
      setInputVal(cells[ri][ci].input || "");
      inputRef.current?.blur();
    }
  }

  function handleFillDragStart(e, ri, ci) {
    e.preventDefault();
    e.stopPropagation();
    setDragStart({ ri, ci });
    setDragging(true);
  }

  function handleFillDragEnd(e, targetRi, targetCi) {
    if (!dragging || !dragStart) return;
    const { ri: sRi, ci: sCi } = dragStart;
    const src = cells[sRi][sCi];
    if (!src.editable || !src.input) {
      setDragging(false);
      setDragStart(null);
      return;
    }

    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      const minR = Math.min(sRi, targetRi), maxR = Math.max(sRi, targetRi);
      const minC = Math.min(sCi, targetCi), maxC = Math.max(sCi, targetCi);
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (r === sRi && c === sCi) continue;
          if (!next[r]?.[c]?.editable) continue;
          const shifted = src.input.startsWith("=")
            ? shiftFormula(src.input, r - sRi, c - sCi)
            : src.input;
          const correct = shifted.trim() === next[r][c].answer;
          next[r][c].input = shifted;
          next[r][c].status = shifted === "" ? null : correct ? "correct" : "wrong";
        }
      }
      return next;
    });
    setDragging(false);
    setDragStart(null);
  }

  const selCell = selected ? cells[selected.ri]?.[selected.ci] : null;
  const addrStr = selected ? toAddr(selected.ri, selected.ci) : "";

  return (
    <div style={{ marginTop: 16, background: "#0f172a", borderRadius: 10, padding: 16, userSelect: "none" }}>
      <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 10 }}>✏️ {practice.instruction}</div>

      {/* 수식 입력창 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, background: "#1e293b", borderRadius: 8, padding: "6px 10px" }}>
        <div style={{ minWidth: 40, fontWeight: 700, color: "#60a5fa", fontSize: 13, textAlign: "center", background: "#0f172a", borderRadius: 4, padding: "4px 8px" }}>
          {addrStr || "—"}
        </div>
        <div style={{ width: 1, height: 20, background: "#334155" }} />
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (selected && selCell?.editable) commitInput(selected.ri, selected.ci, inputVal); }}
          placeholder={selCell?.editable ? "수식 또는 값 입력..." : ""}
          readOnly={!selCell?.editable}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 13, fontFamily: "monospace" }}
        />
        {selected && selCell?.editable && (
          <button
            onClick={() => commitInput(selected.ri, selected.ci, inputVal)}
            style={{ background: "#2563eb", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
          >
            ✓
          </button>
        )}
      </div>

      {/* 테이블 */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ width: 28, background: "#1e293b", border: "1px solid #334155", padding: "4px 6px", color: "#475569" }} />
              {practice.cols.map((c) => (
                <th key={c} style={{ minWidth: 100, background: "#1e293b", border: "1px solid #334155", padding: "4px 10px", color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri}>
                <td style={{ background: "#1e293b", border: "1px solid #334155", padding: "4px 6px", color: "#475569", textAlign: "center", fontSize: 12, fontWeight: 600 }}>
                  {ri + 1}
                </td>
                {row.map((cell, ci) => {
                  const isSel = selected?.ri === ri && selected?.ci === ci;
                  const borderColor = isSel ? "#3b82f6" : cell.status === "correct" ? "#22c55e" : cell.status === "wrong" ? "#ef4444" : "#334155";
                  const bg = cell.status === "correct" ? "#064e3b33" : cell.status === "wrong" ? "#7f1d1d33" : isSel ? "#1e3a8a22" : "#0f172a";
                  return (
                    <td
                      key={ci}
                      onClick={() => selectCell(ri, ci)}
                      style={{ border: `${isSel ? "2px" : "1px"} solid ${borderColor}`, background: bg, padding: 0, position: "relative", cursor: "default", minWidth: 100 }}
                    >
                      <div style={{ padding: "5px 8px", color: "#e2e8f0", minHeight: 28, fontFamily: "monospace", fontSize: 13 }}>
                        {cell.editable ? (isSel ? inputVal : cell.input || "") : cell.val}
                      </div>
                      {/* 자동 채우기 핸들 */}
                      {isSel && cell.editable && (
                        <div
                          onMouseDown={(e) => handleFillDragStart(e, ri, ci)}
                          style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, background: "#3b82f6", cursor: "crosshair", zIndex: 10 }}
                        />
                      )}
                      {/* 드래그 오버레이 */}
                      {dragging && cell.editable && !(ri === dragStart?.ri && ci === dragStart?.ci) && (
                        <div
                          onMouseUp={(e) => handleFillDragEnd(e, ri, ci)}
                          style={{ position: "absolute", inset: 0, background: "#3b82f620", border: "1px dashed #3b82f6", zIndex: 9, cursor: "crosshair" }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 채점 피드백 */}
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {cells.flatMap((row, ri) =>
          row.map((cell, ci) => {
            if (!cell.editable || !cell.status) return null;
            return (
              <div
                key={`${ri}-${ci}`}
                style={{ padding: "7px 12px", borderRadius: 7, background: cell.status === "correct" ? "#064e3b" : "#7f1d1d", color: cell.status === "correct" ? "#86efac" : "#fca5a5", fontSize: 13 }}
              >
                {toAddr(ri, ci)}: {cell.status === "correct" ? "🎉 정답입니다!" : `❌ 오답 — 힌트: ${cell.answer}`}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
