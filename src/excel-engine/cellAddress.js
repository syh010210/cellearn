// cellAddress.js
// 셀 주소(A1, $A$1, A1:B10 등) 파싱 및 변환 유틸리티

export function colLettersToIndex(letters) {
  letters = letters.toUpperCase();
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1; // 0-based
}

export function colIndexToLetters(index) {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

// "A1", "$A$1", "$A1", "A$1" 지원
export function parseCellRef(ref) {
  const match = ref.match(/^(\$?)([A-Za-z]+)(\$?)(\d+)$/);
  if (!match) return null;
  const [, colAbs, colLetters, rowAbs, rowNum] = match;
  return {
    col: colLettersToIndex(colLetters),
    row: parseInt(rowNum, 10) - 1,
    colAbsolute: colAbs === '$',
    rowAbsolute: rowAbs === '$',
  };
}

export function cellRefToString({ row, col }) {
  return `${colIndexToLetters(col)}${row + 1}`;
}

export function isRangeRef(ref) {
  return ref.includes(':');
}

// "A1:B10" -> {startRow, endRow, startCol, endCol}
export function parseRangeRef(ref) {
  const [startStr, endStr] = ref.split(':');
  const start = parseCellRef(startStr);
  const end = parseCellRef(endStr);
  if (!start || !end) return null;
  return {
    startRow: Math.min(start.row, end.row),
    endRow: Math.max(start.row, end.row),
    startCol: Math.min(start.col, end.col),
    endCol: Math.max(start.col, end.col),
  };
}

// 범위를 2차원 주소 문자열 배열로 확장 (행 우선)
export function expandRange(range) {
  const cells = [];
  for (let r = range.startRow; r <= range.endRow; r++) {
    const rowCells = [];
    for (let c = range.startCol; c <= range.endCol; c++) {
      rowCells.push(cellRefToString({ row: r, col: c }));
    }
    cells.push(rowCells);
  }
  return cells;
}
