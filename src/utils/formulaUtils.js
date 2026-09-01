export function toAddr(ri, ci) {
  return String.fromCharCode(65 + ci) + (ri + 1);
}

export function shiftFormula(formula, dRow, dCol) {
  return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/g, (_, dc, col, dr, row) => {
    const newCol = dc ? col : String.fromCharCode(col.charCodeAt(0) + dCol);
    const newRow = dr ? row : String(parseInt(row) + dRow);
    return dc + newCol + dr + newRow;
  });
}

// 단일 셀 참조 하나를 순환: A1 -> $A$1 -> A$1 -> $A1 -> A1
function cycleCell(dc, col, dr, row) {
  if (!dc && !dr)    return `$${col}$${row}`;
  if (dc && dr)      return `${col}$${row}`;
  if (!dc && dr)     return `$${col}${row}`;
  return `${col}${row}`;
}

// 범위 전체를 순환: A1:A5 -> $A$1:$A$5 -> A$1:A$5 -> $A1:$A5 -> A1:A5
function cycleRange(dc1, col1, dr1, row1, dc2, col2, dr2, row2) {
  if (!dc1 && !dr1)    return `$${col1}$${row1}:$${col2}$${row2}`;
  if (dc1 && dr1)      return `${col1}$${row1}:${col2}$${row2}`;
  if (!dc1 && dr1)     return `$${col1}${row1}:$${col2}${row2}`;
  return `${col1}${row1}:${col2}${row2}`;
}

// F4: 커서 위치에 따라 셀/범위 참조를 순환 변환
//
// 범위(예: B2:B4)에서:
//   - 커서가 ':' 앞(시작셀 범위 내) → 시작셀만 순환: $B2:B4 등
//   - 커서가 ':' 뒤(끝셀 범위 내)  → 끝셀만 순환:   B2:$B4 등
//   - 커서가 범위 바로 뒤(드래그 직후 위치) → 전체 순환: $B$2:$B$4 등
export function cycleReference(formula, cursorPos) {
  let match;

  // 범위 참조 먼저 탐지
  const rangePattern = /(\$?)([A-Z]+)(\$?)(\d+):(\$?)([A-Z]+)(\$?)(\d+)/g;
  while ((match = rangePattern.exec(formula)) !== null) {
    const rangeStart = match.index;
    const rangeEnd   = match.index + match[0].length;

    // 커서가 이 범위와 무관하면 스킵
    if (cursorPos < rangeStart || cursorPos > rangeEnd) continue;

    const [, dc1, col1, dr1, row1, dc2, col2, dr2, row2] = match;
    const startCell = (dc1 || "") + col1 + (dr1 || "") + row1; // e.g. "B2" or "$B$2"
    const endCell   = (dc2 || "") + col2 + (dr2 || "") + row2;
    // colonPos: 범위 문자열에서 ':' 의 절대 위치
    const colonPos  = rangeStart + startCell.length;

    if (cursorPos <= colonPos) {
      // 커서가 ':' 이전 (시작셀 내부) → 시작셀만 순환
      const newStart = cycleCell(dc1, col1, dr1, row1);
      return {
        formula:   formula.slice(0, rangeStart) + newStart + ":" + endCell + formula.slice(rangeEnd),
        cursorPos: rangeStart + newStart.length,
      };
    } else if (cursorPos < rangeEnd) {
      // 커서가 ':' 이후, 범위 끝 이전 (끝셀 내부) → 끝셀만 순환
      const newEnd = cycleCell(dc2, col2, dr2, row2);
      return {
        formula:   formula.slice(0, rangeStart) + startCell + ":" + newEnd + formula.slice(rangeEnd),
        cursorPos: rangeStart + startCell.length + 1 + newEnd.length,
      };
    } else {
      // cursorPos === rangeEnd: 범위 바로 뒤 (드래그 삽입 직후) → 전체 순환
      const newRef = cycleRange(dc1, col1, dr1, row1, dc2, col2, dr2, row2);
      return {
        formula:   formula.slice(0, rangeStart) + newRef + formula.slice(rangeEnd),
        cursorPos: rangeStart + newRef.length,
      };
    }
  }

  // 단일 셀 참조 순환
  const pattern = /(\$?)([A-Z]+)(\$?)(\d+)/g;
  let found = null;
  while ((match = pattern.exec(formula)) !== null) {
    const start = match.index;
    const end   = match.index + match[0].length;
    if (start <= cursorPos && cursorPos <= end) {
      found = { match, start, end };
      break;
    }
  }

  if (!found) return { formula, cursorPos };

  const { match: m, start, end } = found;
  const [, colDollar, col, rowDollar, row] = m;
  const newRef = cycleCell(colDollar, col, rowDollar, row);

  return {
    formula:   formula.slice(0, start) + newRef + formula.slice(end),
    cursorPos: start + newRef.length,
  };
}
