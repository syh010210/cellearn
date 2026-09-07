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

// 셀 참조의 $ 순환: (col$, row$) (F,F)->(T,T)->(F,T)->(T,F)->(F,F)
function _cellDollar(part) {
  const m = /^(\$?)([A-Z]+)(\$?)(\d+)$/.exec(part);
  return { col: !!m[1], row: !!m[3] };
}
function _nextDollar(d) {
  if (!d.col && !d.row) return { col: true, row: true };
  if (d.col && d.row)   return { col: false, row: true };
  if (!d.col && d.row)  return { col: true, row: false };
  return { col: false, row: false };
}
function _applyDollar(part, nd) {
  const m = /^\$?([A-Z]+)\$?(\d+)$/.exec(part);
  return `${nd.col ? "$" : ""}${m[1]}${nd.row ? "$" : ""}${m[2]}`;
}

// F4 참조 순환. mode = 'range'(콜론 범위를 한 단위로) | 'cell'(커서가 닿은 단일 셀만).
// 텍스트 선택(selEnd > selStart)이면 mode와 무관하게 선택과 겹치는 셀들을 첫 셀 패턴으로 통일 순환.
// 반환: 선택이면 { formula, selStart, selEnd }, 아니면 { formula, cursorPos }.
export function cycleReference(formula, selStart, selEnd = selStart, mode = "cell") {
  // 3. 텍스트 선택 모드
  if (selEnd > selStart) {
    const re = /\$?[A-Z]+\$?\d+/g;
    const hits = [];
    let m;
    while ((m = re.exec(formula)) !== null) {
      const s = m.index, e = s + m[0].length;
      if (e > selStart && s < selEnd) hits.push({ s, e, text: m[0] });
    }
    if (!hits.length) return { formula, selStart, selEnd };
    const nd = _nextDollar(_cellDollar(hits[0].text));
    let out = "", idx = 0, newEnd = selEnd;
    for (const h of hits) {
      out += formula.slice(idx, h.s);
      const nt = _applyDollar(h.text, nd);
      out += nt;
      newEnd += nt.length - h.text.length;
      idx = h.e;
    }
    out += formula.slice(idx);
    return { formula: out, selStart, selEnd: newEnd };
  }

  const cursor = selStart;
  // 1. 전체 범위 모드
  if (mode === "range") {
    const re = /\$?[A-Z]+\$?\d+(?::\$?[A-Z]+\$?\d+)?/g;
    let match;
    while ((match = re.exec(formula)) !== null) {
      const s = match.index, e = s + match[0].length;
      if (cursor < s || cursor > e) continue;
      const parts = match[0].split(":");
      const nd = _nextDollar(_cellDollar(parts[0]));
      const newTok = parts.map((p) => _applyDollar(p, nd)).join(":");
      return { formula: formula.slice(0, s) + newTok + formula.slice(e), cursorPos: s + newTok.length };
    }
    return { formula, cursorPos: cursor };
  }

  // 2. 단일 셀 모드 (콜론으로 묶지 않음)
  const re = /\$?[A-Z]+\$?\d+/g;
  let match;
  while ((match = re.exec(formula)) !== null) {
    const s = match.index, e = s + match[0].length;
    if (cursor < s || cursor > e) continue;
    const nd = _nextDollar(_cellDollar(match[0]));
    const newTok = _applyDollar(match[0], nd);
    return { formula: formula.slice(0, s) + newTok + formula.slice(e), cursorPos: s + newTok.length };
  }
  return { formula, cursorPos: cursor };
}
