/**
 * 미니 엑셀 수식 평가기
 * 지원 연산자: +, -, *, /, &
 * 지원 함수: 문자열(LEFT/RIGHT/MID/LEN/UPPER/LOWER/PROPER/FIND/SEARCH/TRIM),
 *           통계(SUM/AVERAGE/MAX/MIN/MEDIAN/COUNT/COUNTA/COUNTBLANK/
 *                RANK.EQ/RANK.AVG/LARGE/SMALL/COUNTIF/COUNTIFS/AVERAGEIF/AVERAGEIFS/SUMIF),
 *           참조(VLOOKUP/HLOOKUP/MATCH/INDEX/CHOOSE)
 */
export function evalFormula(formula, getCellVal, depth = 0) {
  if (!formula || typeof formula !== "string") return formula;
  if (!formula.startsWith("=")) return formula;
  if (depth > 10) return "#CIRC!";

  const src = formula.slice(1);
  let pos = 0;

  function skip() {
    while (pos < src.length && (src[pos] === " " || src[pos] === "\t")) pos++;
  }

  // 범위 내 모든 셀 값을 2D 배열로 반환 [[r1c1,r1c2],[r2c1,r2c2],...]
  function getRangeValues(col1, row1, col2, row2) {
    const result = [];
    const c1 = col1.charCodeAt(0) - 65;
    const c2 = col2.charCodeAt(0) - 65;
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    const minR = Math.min(row1, row2), maxR = Math.max(row1, row2);
    for (let r = minR; r <= maxR; r++) {
      const row = [];
      for (let c = minC; c <= maxC; c++) {
        const addr = String.fromCharCode(65 + c) + r;
        row.push(getCellVal ? getCellVal(addr, depth + 1) : "");
      }
      result.push(row);
    }
    return result;
  }

  function parseExpr() { return parseConcat(); }

  function parseConcat() {
    let left = parseAddSub();
    skip();
    while (pos < src.length && src[pos] === "&") {
      pos++;
      skip();
      left = toStr(left) + toStr(parseAddSub());
      skip();
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDiv();
    skip();
    while (pos < src.length && (src[pos] === "+" || src[pos] === "-")) {
      const op = src[pos++];
      skip();
      const right = parseMulDiv();
      left = op === "+" ? toNum(left) + toNum(right) : toNum(left) - toNum(right);
      skip();
    }
    return left;
  }

  function parseMulDiv() {
    let left = parseUnary();
    skip();
    while (pos < src.length && (src[pos] === "*" || src[pos] === "/")) {
      const op = src[pos++];
      skip();
      const right = parseUnary();
      if (op === "/") {
        const d = toNum(right);
        left = d !== 0 ? toNum(left) / d : "#DIV/0!";
      } else {
        left = toNum(left) * toNum(right);
      }
      skip();
    }
    return left;
  }

  function parseUnary() {
    skip();
    if (src[pos] === "-") { pos++; return -toNum(parsePrimary()); }
    if (src[pos] === "+") { pos++; return parsePrimary(); }
    return parsePrimary();
  }

  function parsePrimary() {
    skip();
    if (pos >= src.length) return "";

    if (src[pos] === "(") {
      pos++;
      const val = parseExpr();
      skip();
      if (pos < src.length && src[pos] === ")") pos++;
      return val;
    }

    if (src[pos] === '"') {
      pos++;
      let s = "";
      while (pos < src.length && src[pos] !== '"') s += src[pos++];
      if (pos < src.length) pos++;
      return s;
    }

    if (/[0-9]/.test(src[pos])) {
      let s = "";
      while (pos < src.length && /[0-9.]/.test(src[pos])) s += src[pos++];
      return parseFloat(s);
    }

    // $ 앞부분 건너뜀
    while (pos < src.length && src[pos] === "$") pos++;

    // 함수명은 알파벳 + 점(RANK.EQ, RANK.AVG 등) 허용
    let letters = "";
    while (pos < src.length && (/[A-Za-z]/.test(src[pos]) || src[pos] === ".")) {
      letters += src[pos++].toUpperCase();
    }

    if (!letters) { pos++; return ""; }

    // $ (행 앞) 건너뜀
    while (pos < src.length && src[pos] === "$") pos++;

    let rowDigits = "";
    while (pos < src.length && /[0-9]/.test(src[pos])) rowDigits += src[pos++];

    if (rowDigits) {
      // 범위 참조 확인 (e.g. B2:B4)
      const savedPos = pos;
      skip();
      if (pos < src.length && src[pos] === ":") {
        pos++;
        while (pos < src.length && src[pos] === "$") pos++;
        let endLetters = "";
        while (pos < src.length && /[A-Za-z]/.test(src[pos])) endLetters += src[pos++].toUpperCase();
        while (pos < src.length && src[pos] === "$") pos++;
        let endRowDigits = "";
        while (pos < src.length && /[0-9]/.test(src[pos])) endRowDigits += src[pos++];
        if (endLetters && endRowDigits) {
          return getRangeValues(letters, parseInt(rowDigits), endLetters, parseInt(endRowDigits));
        }
      }
      pos = savedPos;
      return getCellVal ? getCellVal(letters + rowDigits, depth + 1) : "";
    }

    // 함수 호출
    skip();
    if (pos < src.length && src[pos] === "(") {
      pos++;
      const args = [];
      skip();
      while (pos < src.length && src[pos] !== ")") {
        args.push(parseExpr());
        skip();
        if (pos < src.length && src[pos] === ",") { pos++; skip(); }
      }
      if (pos < src.length && src[pos] === ")") pos++;
      return callFn(letters, args);
    }

    return "";
  }

  // 숫자인 값만 추출 (1D/2D 배열 모두 처리)
  function flatNums(args) {
    const out = [];
    function addNum(v) {
      if (Array.isArray(v)) { v.forEach(addNum); }
      else { const n = parseFloat(v); if (!isNaN(n)) out.push(n); }
    }
    args.forEach(addNum);
    return out;
  }

  // 조건 매칭 (">80", "대리", 80 등)
  function matchCriteria(val, criteria) {
    const c = toStr(criteria).trim();
    const m = c.match(/^([<>]=?|<>|=)(.*)/);
    if (m) {
      const op = m[1], rhs = m[2].trim();
      const lv = toStr(val).toLowerCase();
      const rv = rhs.toLowerCase();
      const ln = toNum(val), rn = toNum(rhs);
      const bothNum = !isNaN(ln) && !isNaN(rn);
      if (op === ">")  return bothNum ? ln > rn  : lv > rv;
      if (op === ">=") return bothNum ? ln >= rn : lv >= rv;
      if (op === "<")  return bothNum ? ln < rn  : lv < rv;
      if (op === "<=") return bothNum ? ln <= rn : lv <= rv;
      if (op === "<>") return bothNum ? ln !== rn : lv !== rv;
      if (op === "=")  return bothNum ? ln === rn : lv === rv;
    }
    // 와일드카드 * ? 패턴 매칭
    if (c.includes('*') || c.includes('?')) {
      const reStr = c.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
      return new RegExp('^' + reStr + '$', 'i').test(toStr(val));
    }
    return toStr(val).toLowerCase() === c.toLowerCase();
  }

  // 1D/2D 배열을 모두 1D로 평탄화
  function asArr(v) {
    if (!Array.isArray(v)) return [v];
    if (v.length > 0 && Array.isArray(v[0])) return v.flat();
    return v;
  }

  // 데이터베이스 함수 — 2번째 인수(field) 해석: 숫자→열번호(1-based), 문자열→헤더명 검색
  function resolveDbField(fieldArg, headerRow) {
    const n = typeof fieldArg === 'number' ? fieldArg : parseFloat(fieldArg);
    if (!isNaN(n) && n > 0) return Math.floor(n) - 1; // 1-based → 0-based
    const name = toStr(fieldArg).toLowerCase().trim();
    return headerRow.findIndex(h => toStr(h).toLowerCase().trim() === name);
  }

  // 데이터베이스 함수 — 조건을 만족하는 행의 지정 열 값 배열 반환
  function dbFilteredValues(database, fieldIdx, criteria) {
    if (!Array.isArray(database) || database.length < 2) return [];
    const headerRow = Array.isArray(database[0]) ? database[0] : [database[0]];
    const dataRows = database.slice(1);
    if (!Array.isArray(criteria) || criteria.length < 2) return [];
    const critHeaders = (Array.isArray(criteria[0]) ? criteria[0] : [criteria[0]])
      .map(h => toStr(h).toLowerCase().trim());
    const critRows = criteria.slice(1);
    const dataHeaders = headerRow.map(h => toStr(h).toLowerCase().trim());

    const filtered = dataRows.filter(row => {
      const rowArr = Array.isArray(row) ? row : [row];
      // 조건 행 간 OR / 같은 행 내 AND
      return critRows.some(critRow => {
        const ca = Array.isArray(critRow) ? critRow : [critRow];
        return ca.every((cv, ci) => {
          if (cv === '' || cv === null || cv === undefined) return true;
          const hdr = critHeaders[ci];
          if (!hdr) return true;
          const dci = dataHeaders.indexOf(hdr);
          if (dci < 0) return true;
          return matchCriteria(rowArr[dci], cv);
        });
      });
    });

    return filtered.map(row => {
      const rowArr = Array.isArray(row) ? row : [row];
      return fieldIdx >= 0 && fieldIdx < rowArr.length ? rowArr[fieldIdx] : undefined;
    });
  }

  function callFn(name, args) {
    const [a0, a1, a2] = args;
    switch (name) {
      // ── 문자열 함수 ──
      case "LEFT": {
        const s = toStr(a0);
        return s.slice(0, Math.max(0, Math.floor(toNum(a1 !== undefined ? a1 : 1))));
      }
      case "RIGHT": {
        const s = toStr(a0);
        const n = Math.max(0, Math.floor(toNum(a1 !== undefined ? a1 : 1)));
        return s.slice(Math.max(0, s.length - n));
      }
      case "MID": {
        const s = toStr(a0);
        const start = Math.max(0, Math.floor(toNum(a1)) - 1);
        return s.slice(start, start + Math.max(0, Math.floor(toNum(a2))));
      }
      case "LEN":    return toStr(a0).length;
      case "UPPER":  return toStr(a0).toUpperCase();
      case "LOWER":  return toStr(a0).toLowerCase();
      case "PROPER": return toStr(a0).toLowerCase().replace(/(^|\s)([a-z가-힣])/g, (_, sp, ch) => sp + ch.toUpperCase());
      case "TRIM":   return toStr(a0).trim().replace(/\s+/g, " ");
      case "FIND": {
        const idx = toStr(a1).indexOf(toStr(a0), a2 !== undefined ? Math.floor(toNum(a2)) - 1 : 0);
        return idx === -1 ? "#VALUE!" : idx + 1;
      }
      case "SEARCH": {
        const idx = toStr(a1).toLowerCase().indexOf(toStr(a0).toLowerCase(), a2 !== undefined ? Math.floor(toNum(a2)) - 1 : 0);
        return idx === -1 ? "#VALUE!" : idx + 1;
      }

      // ── 기본 통계 ──
      case "SUM": {
        return flatNums(args).reduce((s, n) => s + n, 0);
      }
      case "AVERAGE": {
        const nums = flatNums(args);
        return nums.length === 0 ? "#DIV/0!" : nums.reduce((s, n) => s + n, 0) / nums.length;
      }
      case "MAX": {
        const nums = flatNums(args);
        return nums.length === 0 ? 0 : Math.max(...nums);
      }
      case "MIN": {
        const nums = flatNums(args);
        return nums.length === 0 ? 0 : Math.min(...nums);
      }
      case "MEDIAN": {
        const nums = flatNums(args).sort((a, b) => a - b);
        if (nums.length === 0) return 0;
        const mid = Math.floor(nums.length / 2);
        return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
      }

      // ── 개수 ──
      case "COUNT": {
        let cnt = 0;
        for (const a of args) {
          for (const v of asArr(a)) { if (v !== "" && v !== null && !isNaN(parseFloat(v))) cnt++; }
        }
        return cnt;
      }
      case "COUNTA": {
        let cnt = 0;
        for (const a of args) {
          for (const v of asArr(a)) { if (v !== "" && v !== null && v !== undefined) cnt++; }
        }
        return cnt;
      }
      case "COUNTBLANK": {
        let cnt = 0;
        for (const a of args) {
          for (const v of asArr(a)) { if (v === "" || v === null || v === undefined) cnt++; }
        }
        return cnt;
      }

      // ── 순위 ──
      case "RANK.EQ": {
        const val = toNum(a0);
        const arr = asArr(a1).map(toNum).filter(n => !isNaN(n));
        const order = a2 !== undefined ? toNum(a2) : 0;
        const sorted = [...arr].sort((a, b) => order === 0 ? b - a : a - b);
        const rank = sorted.indexOf(val) + 1;
        return rank === 0 ? "#N/A" : rank;
      }
      case "RANK.AVG": {
        const val = toNum(a0);
        const arr = asArr(a1).map(toNum).filter(n => !isNaN(n));
        const order = a2 !== undefined ? toNum(a2) : 0;
        const sorted = [...arr].sort((a, b) => order === 0 ? b - a : a - b);
        const first = sorted.indexOf(val);
        if (first === -1) return "#N/A";
        const last = sorted.lastIndexOf(val);
        return (first + last) / 2 + 1;
      }

      // ── K번째 순위값 ──
      case "LARGE": {
        const sorted = asArr(a0).map(toNum).filter(n => !isNaN(n)).sort((a, b) => b - a);
        const k = Math.floor(toNum(a1));
        return (k >= 1 && k <= sorted.length) ? sorted[k - 1] : "#NUM!";
      }
      case "SMALL": {
        const sorted = asArr(a0).map(toNum).filter(n => !isNaN(n)).sort((a, b) => a - b);
        const k = Math.floor(toNum(a1));
        return (k >= 1 && k <= sorted.length) ? sorted[k - 1] : "#NUM!";
      }

      // ── 조건부 집계 ──
      case "COUNTIF": {
        return asArr(a0).filter(v => matchCriteria(v, a1)).length;
      }
      case "COUNTIFS": {
        // (range1, crit1, range2, crit2, ...)
        const pairs = [];
        for (let i = 0; i < args.length - 1; i += 2) pairs.push({ range: asArr(args[i]), crit: args[i + 1] });
        if (pairs.length === 0) return 0;
        const len = pairs[0].range.length;
        let cnt = 0;
        for (let j = 0; j < len; j++) {
          if (pairs.every(({ range, crit }) => matchCriteria(range[j], crit))) cnt++;
        }
        return cnt;
      }
      case "SUMIF": {
        const critRange = asArr(a0);
        const sumRange = a2 !== undefined ? asArr(a2) : critRange;
        return critRange.reduce((s, v, i) => matchCriteria(v, a1) ? s + toNum(sumRange[i]) : s, 0);
      }
      case "AVERAGEIF": {
        const critRange = asArr(a0);
        const avgRange = a2 !== undefined ? asArr(a2) : critRange;
        let sum = 0, cnt = 0;
        critRange.forEach((v, i) => {
          if (matchCriteria(v, a1)) { const n = toNum(avgRange[i]); if (!isNaN(n)) { sum += n; cnt++; } }
        });
        return cnt === 0 ? "#DIV/0!" : sum / cnt;
      }
      case "AVERAGEIFS": {
        // (avg_range, crit_range1, crit1, ...)
        const avgRange = asArr(a0);
        const pairs = [];
        for (let i = 1; i < args.length - 1; i += 2) pairs.push({ range: asArr(args[i]), crit: args[i + 1] });
        let sum = 0, cnt = 0;
        avgRange.forEach((_, j) => {
          if (pairs.every(({ range, crit }) => matchCriteria(range[j], crit))) {
            const n = toNum(avgRange[j]); if (!isNaN(n)) { sum += n; cnt++; }
          }
        });
        return cnt === 0 ? "#DIV/0!" : sum / cnt;
      }
      case "SUMIFS": {
        const sumRange = asArr(a0);
        const pairs = [];
        for (let i = 1; i < args.length - 1; i += 2) pairs.push({ range: asArr(args[i]), crit: args[i + 1] });
        return sumRange.reduce((s, v, j) =>
          pairs.every(({ range, crit }) => matchCriteria(range[j], crit)) ? s + toNum(v) : s, 0);
      }

      // ── 수학/변환 함수 ──
      case "ABS": return Math.abs(toNum(a0));
      case "INT": return Math.floor(toNum(a0));
      case "MOD": {
        const n = toNum(a0), d = toNum(a1);
        if (d === 0) return "#DIV/0!";
        return n - d * Math.floor(n / d);
      }
      case "POWER": return Math.pow(toNum(a0), toNum(a1));
      case "VALUE": {
        const s = toStr(a0).replace(/^["']|["']$/g, "").replace(/,/g, "").trim();
        const n = parseFloat(s);
        return isNaN(n) ? "#VALUE!" : n;
      }
      case "ROUND": {
        const n = toNum(a0), k = Math.floor(toNum(a1));
        const factor = Math.pow(10, k);
        return Math.round(n * factor) / factor;
      }
      case "ROUNDUP": {
        const n = toNum(a0), k = Math.floor(toNum(a1));
        const factor = Math.pow(10, k);
        const scaled = n * factor;
        return (n >= 0 ? Math.ceil(scaled) : -Math.ceil(-scaled)) / factor;
      }
      case "ROUNDDOWN": {
        const n = toNum(a0), k = Math.floor(toNum(a1));
        const factor = Math.pow(10, k);
        const scaled = n * factor;
        return (n >= 0 ? Math.floor(scaled) : -Math.floor(-scaled)) / factor;
      }

      // ── 참조/검색 함수 ──
      case "VLOOKUP": {
        const lookupVal = toStr(a0).toLowerCase().trim();
        const table = Array.isArray(a1) ? a1 : [];
        const colIdx = Math.floor(toNum(a2)) - 1;
        for (const row of table) {
          const rowArr = Array.isArray(row) ? row : [row];
          if (toStr(rowArr[0]).toLowerCase().trim() === lookupVal) {
            return colIdx >= 0 && colIdx < rowArr.length ? rowArr[colIdx] : "#REF!";
          }
        }
        return "#N/A";
      }
      case "HLOOKUP": {
        const lookupVal = toStr(a0).toLowerCase().trim();
        const table = Array.isArray(a1) ? a1 : [];
        const rowIdx = Math.floor(toNum(a2)) - 1;
        if (table.length === 0) return "#N/A";
        const firstRow = Array.isArray(table[0]) ? table[0] : [table[0]];
        for (let c = 0; c < firstRow.length; c++) {
          if (toStr(firstRow[c]).toLowerCase().trim() === lookupVal) {
            const targetRow = Array.isArray(table[rowIdx]) ? table[rowIdx] : [];
            return c < targetRow.length ? targetRow[c] : "#REF!";
          }
        }
        return "#N/A";
      }
      case "MATCH": {
        const lookupVal = toStr(a0).toLowerCase().trim();
        const flat = asArr(a1);
        for (let i = 0; i < flat.length; i++) {
          if (toStr(flat[i]).toLowerCase().trim() === lookupVal) return i + 1;
        }
        return "#N/A";
      }
      case "INDEX": {
        const rowNum = Math.floor(toNum(a1));
        if (a2 !== undefined) {
          const colNum = Math.floor(toNum(a2));
          const tableArr = Array.isArray(a0) ? a0 : [[a0]];
          const row = tableArr[rowNum - 1];
          if (!row) return "#REF!";
          const rowArr = Array.isArray(row) ? row : [row];
          return colNum >= 1 && colNum <= rowArr.length ? rowArr[colNum - 1] : "#REF!";
        } else {
          const flat = asArr(a0);
          return rowNum >= 1 && rowNum <= flat.length ? flat[rowNum - 1] : "#REF!";
        }
      }
      case "CHOOSE": {
        const idx = Math.floor(toNum(args[0]));
        return idx >= 1 && idx < args.length ? args[idx] : "#VALUE!";
      }

      // ── 데이터베이스 함수 ──
      case "DSUM":
      case "DAVERAGE":
      case "DCOUNT":
      case "DCOUNTA":
      case "DMAX":
      case "DMIN": {
        const db = Array.isArray(a0) ? a0 : [];
        if (db.length < 1) return 0;
        const hdr = Array.isArray(db[0]) ? db[0] : [db[0]];
        const fi = resolveDbField(a1, hdr);
        const crit = Array.isArray(a2) ? a2 : [];
        const vals = dbFilteredValues(db, fi, crit);
        if (name === "DSUM") return vals.reduce((s, v) => s + toNum(v), 0);
        if (name === "DAVERAGE") {
          const ns = vals.map(toNum).filter(n => !isNaN(n));
          return ns.length === 0 ? "#DIV/0!" : ns.reduce((s, n) => s + n, 0) / ns.length;
        }
        if (name === "DCOUNT") return vals.filter(v => v !== "" && v !== null && v !== undefined && !isNaN(parseFloat(v))).length;
        if (name === "DCOUNTA") return vals.filter(v => v !== "" && v !== null && v !== undefined).length;
        if (name === "DMAX") { const ns = vals.map(toNum).filter(n => !isNaN(n)); return ns.length === 0 ? "#NUM!" : Math.max(...ns); }
        if (name === "DMIN") { const ns = vals.map(toNum).filter(n => !isNaN(n)); return ns.length === 0 ? "#NUM!" : Math.min(...ns); }
        return "#NAME?";
      }

      default: return "#NAME?";
    }
  }

  function toNum(v) {
    if (typeof v === "number") return v;
    if (Array.isArray(v)) return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function toStr(v) {
    if (v === null || v === undefined) return "";
    if (Array.isArray(v)) return "";
    return String(v);
  }

  try {
    return parseExpr();
  } catch {
    return "#ERROR!";
  }
}
