export function toAddr(ri, ci) {
  let n = ci + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters + (ri + 1);
}

export function shiftFormula(formula, dRow, dCol) {
  // 문자열 리터럴("...") 안의 A1은 참조가 아니므로 건드리지 않는다.
  const segments = formula.split(/("(?:[^"]|"")*")/g);
  return segments
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // 홀수 인덱스 = 따옴표 문자열
      return seg.replace(/(\$?)([A-Za-z]+)(\$?)(\d+)/g, (_, dc, col, dr, row) => {
        const newCol = dc ? col : String.fromCharCode(col.charCodeAt(0) + dCol);
        const newRow = dr ? row : String(parseInt(row, 10) + dRow);
        return dc + newCol + dr + newRow;
      });
    })
    .join('');
}

// 참조 토큰 정규식 (컴포넌트에서 직접 쓰지 말고 아래 함수들을 통해서만 사용)
export const CELL_TOKEN_RE = /\$?[A-Za-z]+\$?\d+/;                                   // A1, $A$1
export const RANGE_TOKEN_RE = /\$?[A-Za-z]+\$?\d+(?::\$?[A-Za-z]+\$?\d+)?/;          // A1 또는 A1:B3

// 셀 참조의 $ 상태: (col$, row$) (F,F)->(T,T)->(F,T)->(T,F)->(F,F)
function _cellDollar(part) {
  const m = /^(\$?)([A-Za-z]+)(\$?)(\d+)$/.exec(part);
  return { col: !!m[1], row: !!m[3] };
}
function _nextDollar(d) {
  if (!d.col && !d.row) return { col: true, row: true };
  if (d.col && d.row) return { col: false, row: true };
  if (!d.col && d.row) return { col: true, row: false };
  return { col: false, row: false };
}
function _applyDollar(part, nd) {
  const m = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(part);
  return `${nd.col ? '$' : ''}${m[1]}${nd.row ? '$' : ''}${m[2]}`;
}
// 토큰(단일 셀 또는 범위)의 $ 상태 = 첫 셀 기준
function _tokenDollar(tok) {
  return _cellDollar(tok.split(':')[0]);
}

// 열 문자(A,B,..,Z,AA,..) → 0-based 인덱스
export function colToIdx(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}
// "A1"/"$A$1" → { ri, ci } (없으면 null)
export function parseA1(str) {
  const m = /^\s*\$?([A-Za-z]+)\$?(\d+)\s*$/.exec(str || '');
  if (!m) return null;
  return { ci: colToIdx(m[1]), ri: parseInt(m[2], 10) - 1 };
}
// "A1" 또는 "A1:B3" → { r1,c1,r2,c2 } (없으면 null)
export function parseRangeA1(str) {
  const parts = String(str || '').split(':');
  const a = parseA1(parts[0]);
  if (parts.length === 1) return a ? { r1: a.ri, c1: a.ci, r2: a.ri, c2: a.ci } : null;
  const b = parseA1(parts[1]);
  if (!a || !b) return null;
  return {
    r1: Math.min(a.ri, b.ri), c1: Math.min(a.ci, b.ci),
    r2: Math.max(a.ri, b.ri), c2: Math.max(a.ci, b.ci),
  };
}

// ri/ci/$플래그 → 참조 문자열 ("$C$3"). (기존 refToken 정규식을 대체)
export function formatRef(ri, ci, dollar) {
  const a = toAddr(ri, ci);
  const m = /^([A-Za-z]+)(\d+)$/.exec(a);
  return `${dollar?.col ? '$' : ''}${m[1]}${dollar?.row ? '$' : ''}${m[2]}`;
}

// 커서 위치의 참조 span을 반환. mode 'range'면 콜론 범위를 한 단위로, 'cell'이면 단일 셀만.
// 반환 { start, end, text, dollar } 또는 null. 커서가 토큰 끝(또는 내부)일 때 매칭한다.
// 커서가 콜론 바로 뒤(범위의 두 번째 셀 앞)면 콜론 왼쪽 셀을 반환한다(엑셀 동작).
export function findRefAtCursor(text, cursor, mode = 'range') {
  const re = new RegExp((mode === 'cell' ? CELL_TOKEN_RE : RANGE_TOKEN_RE).source, 'g');
  let m;
  let colonLeft = null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (start < cursor && cursor <= end) {
      return { start, end, text: m[0], dollar: _tokenDollar(m[0]) };
    }
    // 커서가 콜론 바로 뒤면(cursor-1이 ':', 이 토큰이 그 왼쪽 셀) 후보로 기억
    if (end === cursor - 1 && text[cursor - 1] === ':') {
      colonLeft = { start, end, text: m[0], dollar: _tokenDollar(m[0]) };
    }
  }
  return colonLeft;
}

// 커서 앞이 참조면 그 참조(범위 단위)를 newRef로 치환, 아니면 커서 위치에 삽입.
// 반환 { text, cursor, span }. cursor/span은 삽입·치환된 newRef의 끝/범위.
export function replaceRefAtCursor(text, cursor, newRef) {
  const found = findRefAtCursor(text, cursor, 'range');
  if (found) {
    const newText = text.slice(0, found.start) + newRef + text.slice(found.end);
    const span = { start: found.start, end: found.start + newRef.length, text: newRef };
    return { text: newText, cursor: span.end, span };
  }
  const newText = text.slice(0, cursor) + newRef + text.slice(cursor);
  const span = { start: cursor, end: cursor + newRef.length, text: newRef };
  return { text: newText, cursor: span.end, span };
}

// F4 참조 순환. 우선순위: pointSpan(규칙1) → selection(규칙3) → 커서 단일 셀(규칙2).
//  규칙1: pointSpan {start,end}의 범위 전체를 한 단위로 $ 순환. (연속 F4용 새 span 반환)
//  규칙2: pointSpan/selection 없음 → 커서가 닿은 단일 셀만 순환.
//  규칙3: selection {start,end}(start<end) → 선택과 겹치는 셀들을 첫 셀 패턴으로 통일 순환, 선택 유지.
// 반환 { text, cursor, selection, span } (해당 없는 값은 null).
export function cycleReference(text, cursor, selection, pointSpan) {
  // 규칙 1: 참조 선택 모드(범위 전체를 한 단위로)
  if (pointSpan) {
    const tok = text.slice(pointSpan.start, pointSpan.end);
    const nd = _nextDollar(_tokenDollar(tok));
    const newTok = tok.split(':').map((p) => _applyDollar(p, nd)).join(':');
    const newText = text.slice(0, pointSpan.start) + newTok + text.slice(pointSpan.end);
    const span = { start: pointSpan.start, end: pointSpan.start + newTok.length, text: newTok, dollar: nd };
    return { text: newText, cursor: span.end, selection: null, span };
  }

  // 규칙 3: 텍스트 선택
  if (selection && selection.end > selection.start) {
    const re = new RegExp(CELL_TOKEN_RE.source, 'g');
    const hits = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      const s = m.index;
      const e = s + m[0].length;
      if (e > selection.start && s < selection.end) hits.push({ s, e, text: m[0] });
    }
    if (!hits.length) return { text, cursor, selection, span: null };
    const nd = _nextDollar(_cellDollar(hits[0].text));
    let out = '';
    let idx = 0;
    let newEnd = selection.end;
    for (const h of hits) {
      out += text.slice(idx, h.s);
      const nt = _applyDollar(h.text, nd);
      out += nt;
      newEnd += nt.length - h.text.length;
      idx = h.e;
    }
    out += text.slice(idx);
    return { text: out, cursor: newEnd, selection: { start: selection.start, end: newEnd }, span: null };
  }

  // 규칙 2: 커서 위치의 단일 셀
  const found = findRefAtCursor(text, cursor, 'cell');
  if (!found) return { text, cursor, selection: null, span: null };
  const nd = _nextDollar(_cellDollar(found.text));
  const newTok = _applyDollar(found.text, nd);
  const newText = text.slice(0, found.start) + newTok + text.slice(found.end);
  return { text: newText, cursor: found.start + newTok.length, selection: null, span: null };
}
