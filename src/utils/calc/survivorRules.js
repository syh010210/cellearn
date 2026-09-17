// src/utils/calc/survivorRules.js
// 자동 변형(mutation)이 채점을 통과(생존)했을 때, 그것이 "수학적 동치"라서 허용되는지 판정.
// 3a 의 개별 allowSurvive 수식 목록을 일반 규칙으로 대체한다. 규칙에 안 걸리는 생존은 전부 실패.
//
// classifySurvivor(base, mut, item) → { name, why } | null
//   base : 기준 답 수식(=… , $ 포함), mut : 생존한 변형 수식, item : { result:{kind}, ... }

const stripDollar = (s) => String(s).replace(/\$/g, "");
const norm = (s) => stripDollar(s).replace(/\s+/g, "").toUpperCase();

// 범위 앞에 텍스트 머리글 1행이 더 붙어도 값이 안 변하는 함수들. 집계 함수는 텍스트를 무시하고,
// COUNTIF 는 숫자·정확일치 조건이면 텍스트 머리글이 조건에 안 맞아 개수가 그대로다(생존자에서만 조회되므로 안전).
const AGG = new Set(["SUM", "AVERAGE", "COUNT", "COUNTA", "RANK.EQ", "LARGE", "SMALL", "MAX", "MIN", "STDEV", "STDEV.S", "MODE.SNGL", "MEDIAN", "COUNTIF"]);
const DFUNC = new Set(["DAVERAGE", "DSUM", "DCOUNT", "DCOUNTA", "DMAX", "DMIN"]);

// COUNTIF 범위 앞에 텍스트 머리글 1행이 붙어도 개수가 그대로인가(=조건이 그 텍스트 셀을 세지 않는가).
// 안전: 숫자 비교(">=80")·숫자 리터럴·정확일치(셀 참조·함수·값). 불안전: 와일드카드(*·?)·"<>값"(머리글도 셈).
function countifHeaderSafe(base) {
  const args = callArgs(base, "COUNTIF");
  if (!args || args.length < 2) return false;
  const cond = args[1].trim();
  if (/[*?]/.test(cond.replace(/"/g, ""))) return false;      // 와일드카드
  if (cond.replace(/^"/, "").startsWith("<>")) return false;  // <>값 → 텍스트 머리글도 카운트
  return true;
}

// pos(범위 시작 문자 인덱스)를 감싸는 가장 가까운 함수 이름
function enclosingFunc(s, pos) {
  let depth = 0;
  for (let i = pos - 1; i >= 0; i--) {
    const ch = s[i];
    if (ch === ")") depth++;
    else if (ch === "(") { if (depth === 0) { let j = i - 1, name = ""; while (j >= 0 && /[A-Za-z0-9_.]/.test(s[j])) { name = s[j] + name; j--; } return name.toUpperCase(); } depth--; }
  }
  return "";
}

// base 안의 각 범위를 edit(R) 로 바꾼 뒤 $·공백 무시하고 mut 과 같아지는 첫 범위의 감싸는 함수 반환.
// edit 이 null 을 주면 그 범위는 건너뜀.
function rangeEditMatches(base, mut, edit) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g;
  const target = norm(mut);
  let m;
  while ((m = re.exec(base)) !== null) {
    const R = { c1d: m[1], col1: m[2], r1d: m[3], row1: +m[4], c2d: m[5], col2: m[6], r2d: m[7], row2: +m[8] };
    const rep = edit(R);
    if (!rep) continue;
    const cand = base.slice(0, m.index) + rep + base.slice(m.index + m[0].length);
    if (norm(cand) === target) return enclosingFunc(base, m.index);
  }
  return null;
}
const colNum = (L) => { let n = 0; for (const ch of L.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const colStr = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };

// base 안의 모든 범위 토큰과 $ 무시 정규화 카운트
function rangeCounts(s) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g;
  const cnt = new Map(); let m;
  while ((m = re.exec(s)) !== null) { const key = (m[2] + m[4] + ":" + m[6] + m[8]).toUpperCase(); cnt.set(key, (cnt.get(key) || 0) + 1); }
  return cnt;
}

export const SURVIVOR_RULES = [
  {
    name: "singleDollar",
    why: "single 결과는 채우기가 없어 참조가 이동하지 않으므로 $ 유무가 값에 영향 없음(수학적 동치)",
    test: (base, mut, item) => item?.result?.kind === "single" && norm(base) === norm(mut),
  },
  {
    name: "headerInAggregate",
    why: "SUM·AVERAGE·COUNT·RANK.EQ·LARGE·SMALL·MAX·MIN·STDEV·MODE.SNGL·MEDIAN 범위에 텍스트 머리글 1행만 더 포함돼도 집계에서 무시되어 동치. COUNTIF 는 조건이 텍스트 머리글을 세지 않을 때만(숫자 비교·정확일치 등, 와일드카드·<> 제외).",
    test: (base, mut) => {
      const f = rangeEditMatches(base, mut, (R) => R.row1 > 1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1 - 1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null);
      if (!f || !AGG.has(f)) return false;
      if (f === "COUNTIF") return countifHeaderSafe(base);
      return true;
    },
  },
  {
    name: "blankCriteriaColumn",
    why: "D함수 조건 범위에 완전히 빈 열이 붙어도 추가 제약이 없어 동치 (3d 실파일 확인 대상)",
    test: (base, mut) => {
      const f = rangeEditMatches(base, mut, (R) => colNum(R.col1) > 0 ? `${R.c1d}${colStr(colNum(R.col1) - 1)}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null);
      return !!f && DFUNC.has(f);
    },
  },
  {
    // 3b-1 추가(엔진 semantics): RANK.EQ 의 정렬 인수는 0이 아니면 전부 오름차순으로 같게 처리된다
    // (math.js: desc = !order || toNumber(order)===0). 따라서 ",1" ↔ ",2" 같은 양수↔양수 변경은 진짜 동치.
    // STDEV≡STDEV.S 처럼 함수 semantics 동치이며, 데이터로 잡을 수 없어 규칙으로 인정한다.
    name: "rankOrderNonzero",
    why: "RANK.EQ 정렬 인수는 0이 아니면 모두 오름차순으로 동일 취급 → 양수↔양수 변경은 엔진상 동치",
    test: (base, mut) => {
      const mask = (s) => s.replace(/(RANK\.EQ\([^()]*,[^()]*,)([1-9]\d*)(\))/gi, "$1#$3");
      return norm(mask(base)) === norm(mask(mut)) && norm(base) !== norm(mut);
    },
  },
  {
    // 같은 범위가 수식에 2번 이상 나오고(예: LARGE·SMALL 이 같은 모집단 공유) 그중 한 곳만 끝 1칸 축소한 변형.
    // 잘린 원소가 한쪽 함수의 관심 구간(k-창) 밖이면 값이 안 변할 수 있다. 단, 같은 범위 축소 변형 중
    // 최소 1개는 값으로 잡혀야 하며(테스트에서 강제), 모두 생존하면 실패.
    name: "pairedRangeShrink",
    why: "동일 범위가 2회 이상 쓰인 수식에서 한 곳만 끝 1칸 축소 → 잘린 원소가 그 함수의 관심 구간 밖이라 동치(다른 축소 변형은 값으로 잡힘)",
    test: (base, mut) => {
      const cnt = rangeCounts(base);
      const f = rangeEditMatches(base, mut, (R) => {
        const key = (R.col1 + R.row1 + ":" + R.col2 + R.row2).toUpperCase();
        if ((cnt.get(key) || 0) < 2) return null;
        if (R.row2 > R.row1) return `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2 - 1}`;
        if (colNum(R.col2) > colNum(R.col1)) return `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${colStr(colNum(R.col2) - 1)}${R.r2d}${R.row2}`;
        return null;
      });
      return f !== null;
    },
  },
];

// ── lookupLeadingText: 정확 일치 VLOOKUP/HLOOKUP 범위 앞에 텍스트 1행(열)만 넓힘 → 동치 ──
function parseRanges(s) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; const out = []; let m;
  while ((m = re.exec(s)) !== null) out.push({ i: m.index, c1: colNum(m[2]), r1: +m[4], c2: colNum(m[6]), r2: +m[8], enc: enclosingFunc(s, m.index) });
  return out;
}
// 특정 함수 호출의 4번째 인수가 정확 일치(0/FALSE/생략)인가
function exactMatch(s, fn) {
  const idx = s.toUpperCase().indexOf(fn + "("); if (idx < 0) return false;
  let i = idx + fn.length + 1, depth = 0, arg = "", args = [];
  for (; i < s.length; i++) { const ch = s[i]; if (ch === "(") { depth++; arg += ch; } else if (ch === ")") { if (depth === 0) { args.push(arg); break; } depth--; arg += ch; } else if (ch === "," && depth === 0) { args.push(arg); arg = ""; } else arg += ch; }
  if (args.length <= 3) return true; // 4번째 생략
  const a4 = args[3].trim().toUpperCase(); return a4 === "0" || a4 === "FALSE" || a4 === "";
}
function lookupLeadingText(base, mut, getCell) {
  if (!getCell) return false;
  const rb = parseRanges(base), rm = parseRanges(mut);
  if (rb.length !== rm.length) return false;
  let d = -1; for (let k = 0; k < rb.length; k++) { const a = rb[k], b = rm[k]; if (a.c1 !== b.c1 || a.r1 !== b.r1 || a.c2 !== b.c2 || a.r2 !== b.r2) { if (d >= 0) return false; d = k; } }
  if (d < 0) return false;
  const B = rb[d], M = rm[d], fn = B.enc;
  const val = (c, r) => { const cell = getCell(colStr(c) + r); return cell ? cell.v : undefined; };
  // 추가된 셀은 검색 키와 같으면 안 되고 숫자여도 안 된다(빈 셀·비-키 텍스트는 무해).
  const okAdd = (v, keys) => typeof v !== "number" && !keys.includes(v);
  if (fn === "VLOOKUP" && M.r1 === B.r1 - 1 && M.c1 === B.c1 && M.c2 === B.c2 && M.r2 === B.r2) {
    if (!exactMatch(base, "VLOOKUP")) return false;
    const keys = []; for (let r = B.r1; r <= B.r2; r++) keys.push(val(B.c1, r));
    for (let c = M.c1; c <= M.c2; c++) if (!okAdd(val(c, M.r1), keys)) return false;
    return true;
  }
  if (fn === "HLOOKUP" && M.c1 === B.c1 - 1 && M.r1 === B.r1 && M.r2 === B.r2 && M.c2 === B.c2) {
    if (!exactMatch(base, "HLOOKUP")) return false;
    const keys = []; for (let c = B.c1; c <= B.c2; c++) keys.push(val(c, B.r1));
    for (let r = M.r1; r <= M.r2; r++) if (!okAdd(val(M.c1, r), keys)) return false;
    return true;
  }
  return false;
}

// ── dcountaFieldInvariant: DCOUNTA 의 필드 인수가 표 안 다른 열로 바뀌어도, 조건에 맞는 레코드에서
//    두 필드 열이 모두 비어있지 않으면 개수 동일 → 동치. DCOUNT 는 제외(숫자만 세므로 열 바뀌면 달라짐). ──
function callArgs(s, fn) {
  const idx = s.toUpperCase().indexOf(fn + "("); if (idx < 0) return null;
  let i = idx + fn.length + 1, depth = 0, arg = "", args = [];
  for (; i < s.length; i++) { const ch = s[i]; if (ch === "(") { depth++; arg += ch; } else if (ch === ")") { if (depth === 0) { args.push(arg); break; } depth--; arg += ch; } else if (ch === "," && depth === 0) { args.push(arg); arg = ""; } else arg += ch; }
  return args.map((a) => a.trim());
}
function fieldCol(fieldArg, dbC1, cell0) {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(fieldArg);
  if (m) return { col: colNum(m[1]), row: +m[2] };          // 머리글 셀
  if (/^\d+$/.test(fieldArg)) return { col: dbC1 + (+fieldArg - 1), row: null }; // 열 번호
  return null;                                              // 머리글 문자열 등은 판정 제외
}
function dcountaFieldInvariant(base, mut, getCell) {
  if (!getCell) return false;
  const a = callArgs(base, "DCOUNTA"), b = callArgs(mut, "DCOUNTA");
  if (!a || !b || a.length < 3 || b.length !== a.length) return false;
  if (a[0] !== b[0] || a[2] !== b[2] || a[1] === b[1]) return false; // db·조건 동일, 필드만 다름
  if (a.slice(3).join() !== b.slice(3).join()) return false;
  const dm = /^\$?([A-Za-z]{1,3})\$?(\d+):\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(a[0]); if (!dm) return false;
  const c1 = colNum(dm[1]), r1 = +dm[2], c2 = colNum(dm[3]), r2 = +dm[4];
  const fb = fieldCol(a[1], c1), fm = fieldCol(b[1], c1);
  if (!fb || !fm) return false;
  if (fb.col < c1 || fb.col > c2 || fm.col < c1 || fm.col > c2) return false; // 둘 다 표 안
  const nonblank = (c, r) => { const cell = getCell(colStr(c) + r); return !!cell && cell.v !== "" && cell.v != null; };
  for (let r = r1 + 1; r <= r2; r++) if (!nonblank(fb.col, r) || !nonblank(fm.col, r)) return false; // 모든 데이터 행 두 열 비어있지 않음
  return true;
}

// ── extremeLookupShrink: 최댓/최솟값 행을 찾는 INDEX/MATCH·VLOOKUP/DMAX 형태에서, 범위 끝 1칸 축소가
//    답을 안 바꾸는 경우(= 최대/최소 행이 마지막 데이터 행이 아니라 잘린 행이 답과 무관) → 동치. ──
const colRangeM = (s) => { const m = /^\$?([A-Za-z]{1,3})\$?(\d+):\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(s.trim()); return m ? { c1: colNum(m[1]), r1: +m[2], c2: colNum(m[3]), r2: +m[4] } : null; };
// 값 범위(단일 열)에서 최대/최소값의 행. 없으면 null.
function extremeRow(rangeStr, isMax, getCell) {
  const r = colRangeM(rangeStr); if (!r) return null;
  let best = null, bestRow = -1;
  for (let row = r.r1; row <= r.r2; row++) { const cell = getCell(colStr(r.c1) + row); const v = cell ? cell.v : undefined; if (typeof v !== "number") continue; if (best === null || (isMax ? v > best : v < best)) { best = v; bestRow = row; } }
  return bestRow < 0 ? null : { row: bestRow, last: r.r2 };
}
// DMAX/DMIN(db, field, crit) 의 극값 행. 조건값은 item.criteria(밖 조건 — 문제 파일엔 조건 셀이 비어 있음)에서,
// item.criteria 가 null(표 칸 조건)이면 기준 수식의 조건 범위 주소(머리글 셀 + 그 아래 값)로 시트에서 읽는다.
// 정확 일치 조건만 판정(연산자·와일드카드는 null → 미적용). 판정 내용(극값 행이 마지막이 아니면 끝-1 축소 동치)은 동일.
function dExtremeRow(db, field, critRange, item, isMax, getCell) {
  const d = colRangeM(db); if (!d) return null;
  let critHdr, cvRaw;
  const table = item?.criteria?.table;
  if (table) {
    if (table.length < 2 || table[0].length !== 1) return null;    // 밖 조건: 단일 열만
    critHdr = String(table[0][0]); cvRaw = String(table[1][0]);
  } else if (item == null || item.criteria == null) {
    const cr = colRangeM(critRange); if (!cr) return null;         // 표 칸 조건: 1열 · 머리글+값 1칸
    if (cr.c1 !== cr.c2 || cr.r2 - cr.r1 !== 1) return null;
    const hc = getCell(colStr(cr.c1) + cr.r1), vc = getCell(colStr(cr.c1) + cr.r2);
    if (!hc || !vc) return null;
    critHdr = String(hc.v); cvRaw = String(vc.v);
  } else return null;
  if (/[<>=*?]/.test(cvRaw)) return null;   // 단일 정확 일치 조건만
  // field → 열 인덱스
  let fcol = null; const fm = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(field.trim());
  if (fm) fcol = colNum(fm[1]);
  else if (/^\d+$/.test(field.trim())) fcol = d.c1 + (+field.trim() - 1);
  else { const name = field.trim().replace(/^"|"$/g, ""); for (let c = d.c1; c <= d.c2; c++) { const h = getCell(colStr(c) + d.r1); if (h && String(h.v) === name) { fcol = c; break; } } }
  if (fcol === null) return null;
  let ccol = null; for (let c = d.c1; c <= d.c2; c++) { const h = getCell(colStr(c) + d.r1); if (h && String(h.v) === critHdr) { ccol = c; break; } }
  if (ccol === null) return null;
  let best = null, bestRow = -1;
  for (let row = d.r1 + 1; row <= d.r2; row++) {
    const cc = getCell(colStr(ccol) + row); if (!cc || String(cc.v) !== cvRaw) continue;
    const fv = getCell(colStr(fcol) + row); const v = fv ? fv.v : undefined; if (typeof v !== "number") continue;
    if (best === null || (isMax ? v > best : v < best)) { best = v; bestRow = row; }
  }
  return bestRow < 0 ? null : { row: bestRow, last: d.r2 };
}
export function extremeLookupShrink(base, mut, item, getCell) {
  if (!getCell) return false;
  // mut 이 base 의 어느 한 범위를 끝 1행 축소한 것이어야 한다.
  const shrunk = rangeEditMatches(base, mut, (R) => R.row2 > R.row1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2 - 1}` : null);
  if (shrunk === null) return false;
  const im = /INDEX\(\s*\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+\s*,\s*MATCH\(\s*(MAX|MIN)\(\s*(\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+)\s*\)\s*,\s*\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+\s*,\s*(?:0|FALSE)\s*\)/i.exec(base);
  if (im) { const e = extremeRow(im[2], im[1].toUpperCase() === "MAX", getCell); return !!(e && e.row !== e.last); }
  const vm = /VLOOKUP\(\s*(DMAX|DMIN)\(\s*(\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+)\s*,\s*("[^"]*"|\$?[A-Za-z]+\$?\d+|\d+)\s*,\s*(\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+)\s*\)\s*,\s*\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+\s*,\s*\d+\s*,\s*(?:0|FALSE)\s*\)/i.exec(base);
  if (vm) { const e = dExtremeRow(vm[2], vm[3], vm[4], item, vm[1].toUpperCase() === "DMAX", getCell); return !!(e && e.row !== e.last); }
  return false;
}

export function classifySurvivor(base, mut, item, getCell = null) {
  // extremeLookupShrink 를 먼저(범위 축소가 최대/최소와 무관한 행을 자르는 경우 → 동치). pairedRangeShrink 보다 우선.
  if (extremeLookupShrink(base, mut, item, getCell)) return { name: "extremeLookupShrink", why: "최대/최소 행이 마지막 데이터 행이 아니어서, 범위 끝 1칸 축소가 잘라내는 행이 답과 무관 → 동치" };
  for (const r of SURVIVOR_RULES) if (r.test(base, mut, item)) return { name: r.name, why: r.why };
  if (lookupLeadingText(base, mut, getCell)) return { name: "lookupLeadingText", why: "정확 일치 VLOOKUP/HLOOKUP 범위 앞에 텍스트 셀(표 이름/머리글) 1행·1열만 더 포함돼도 검색 결과 동일 → 동치" };
  if (dcountaFieldInvariant(base, mut, getCell)) return { name: "dcountaFieldInvariant", why: "DCOUNTA 필드를 표 안 다른 열로 바꿔도 조건 레코드의 두 열이 모두 비어있지 않으면 개수 동일 → 동치" };
  return null;
}
