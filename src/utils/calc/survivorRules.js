// src/utils/calc/survivorRules.js
// 자동 변형(mutation)이 채점을 통과(생존)했을 때, 그것이 "수학적 동치"라서 허용되는지 판정.
// 3a 의 개별 allowSurvive 수식 목록을 일반 규칙으로 대체한다. 규칙에 안 걸리는 생존은 전부 실패.
//
// classifySurvivor(base, mut, item) → { name, why } | null
//   base : 기준 답 수식(=… , $ 포함), mut : 생존한 변형 수식, item : { result:{kind}, ... }

const stripDollar = (s) => String(s).replace(/\$/g, "");
const norm = (s) => stripDollar(s).replace(/\s+/g, "").toUpperCase();

const AGG = new Set(["SUM", "AVERAGE", "COUNT", "COUNTA", "RANK.EQ", "LARGE", "SMALL", "MAX", "MIN"]);
const DFUNC = new Set(["DAVERAGE", "DSUM", "DCOUNT", "DCOUNTA", "DMAX", "DMIN"]);

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
    why: "SUM·AVERAGE·COUNT·RANK.EQ·LARGE·SMALL·MAX·MIN 범위에 텍스트 머리글 1행만 더 포함돼도 집계에서 무시되어 동치",
    test: (base, mut) => {
      const f = rangeEditMatches(base, mut, (R) => R.row1 > 1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1 - 1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null);
      return !!f && AGG.has(f);
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

export function classifySurvivor(base, mut, item, getCell = null) {
  for (const r of SURVIVOR_RULES) if (r.test(base, mut, item)) return { name: r.name, why: r.why };
  if (lookupLeadingText(base, mut, getCell)) return { name: "lookupLeadingText", why: "정확 일치 VLOOKUP/HLOOKUP 범위 앞에 텍스트 셀(표 이름/머리글) 1행·1열만 더 포함돼도 검색 결과 동일 → 동치" };
  return null;
}
