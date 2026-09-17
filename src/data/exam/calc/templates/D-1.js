// src/data/exam/calc/templates/D-1.js
// 문자열 결합 (UPPER/LOWER/PROPER + LEFT + & + YEAR/MONTH). 변형 4개. 열 채우기(텍스트 결과).
import { ENG_DEPT, CATEGORY, COUNTRIES } from "../pools.js";
import { geom, randDate } from "./_util.js";

const codeNo = (rng, n, pre) => { const s = new Set(); while (s.size < n) s.add(`${pre}-${100 + rng.int(900)}`); return [...s]; };
// 부서명(소문자). 사번 앞 글자 시드용 A~Z.
const DEPT_EN = ["sales", "planning", "design", "finance", "support", "research", "service", "strategy", "quality", "logistics", "marketing", "account"];
// 학과명 — 공백 포함(PROPER 효과가 드러남) 것과 단어형을 섞음
const MAJOR_EN = ["data science", "art history", "food science", "earth science", "computer", "biology", "tourism", "statistics", "economics", "architecture", "business", "chemistry"];
const MAJOR_MULTI = ["data science", "art history", "food science", "earth science"];
// 표시 예 전용 풀(데이터 풀과 겹치지 않아 충돌 없음, 시드마다 달라 다양성 확보)
const EX_DEPT = ["network", "academy", "banking", "trading", "hosting", "medical"];
const EX_COUNTRY = [["Ghana", "Accra"], ["Peru", "Lima"], ["Cuba", "Havana"], ["Iran", "Tehran"], ["Fiji", "Suva"]];
const EX_CAT = ["media", "fashion", "gadget", "comic", "puzzle"];
const EX_MAJOR = ["network", "robotics", "genetics", "astronomy", "geology"];
const pad2 = (n) => String(n).padStart(2, "0");

// 1) d1-upper-left [기본] — UPPER(LEFT(x,3))&"-"&y
function d1UpperLeft(rng) {
  const N = 7 + rng.int(4);
  const headers = ["부서", "사번", "부서코드"];
  const dept = rng.sample(DEPT_EN, N);               // 부서명(소문자) → UPPER·LEFT±1 값 변경
  const pre = String.fromCharCode(65 + rng.int(26)); // 사번 앞 글자 시드(A~Z)
  const sab = codeNo(rng, N, pre);
  const rows = dept.map((d, i) => [d, sab[i], null]);
  const g = geom(headers, N), x = g.dataCell("부서", 0), y = g.dataCell("사번", 0);
  return {
    subtype: "D-1", colWidths: [12, 8, 10], headers, rows, codeColumns: ["사번"],
    result: { kind: "fillCol", col: "부서코드" },
    answer: `=UPPER(LEFT(${x},3))&"-"&${y}`,
    functions: { required: ["UPPER", "LEFT"], candidates: null },
    text: "[{표}]에서 부서[{col:부서}]의 앞 세 글자와 사번[{col:사번}]을 이용하여 부서코드[{R}]를 표시하시오. (8점)",
    notes: [(() => { const w = rng.pick(EX_DEPT); return `부서 앞 세 글자는 대문자로 [표시 예 : ${w}, A-000 → ${w.slice(0, 3).toUpperCase()}-A-000]`; })(), "UPPER, LEFT 함수와 & 연산자 사용"],
    accept: [`=UPPER(LEFT(${x},3))&"-"&${y}`],
  };
}

// 2) d1-upper-lower [기본] — UPPER(a)&"("&LOWER(b)&")"
function d1UpperLower(rng) {
  const N = 7 + rng.int(4);
  const headers = ["국가", "수도", "표기"];
  const pick = rng.sample(COUNTRIES, N);             // 혼합대소문자 → UPPER·LOWER 값 변경
  const rows = pick.map(([c, cap]) => [c, cap, null]);
  const g = geom(headers, N), a = g.dataCell("국가", 0), b = g.dataCell("수도", 0);
  return {
    subtype: "D-1", colWidths: [8, 8, 12], headers, rows,
    result: { kind: "fillCol", col: "표기" },
    answer: `=UPPER(${a})&"("&LOWER(${b})&")"`,
    functions: { required: ["UPPER", "LOWER"], candidates: null },
    text: "[{표}]에서 국가[{col:국가}]와 수도[{col:수도}]를 이용하여 표기[{R}]를 표시하시오. (8점)",
    notes: [(() => { const [c, cap] = rng.pick(EX_COUNTRY); return `국가는 대문자, 수도는 소문자로 [표시 예 : ${c}, ${cap} → ${c.toUpperCase()}(${cap.toLowerCase()})]`; })(), "UPPER, LOWER 함수와 & 연산자 사용"],
    accept: [`=UPPER(${a})&"("&LOWER(${b})&")"`],
  };
}

// 3) d1-proper-year [어려움] — PROPER(LEFT(x,3))&YEAR(d)
function d1ProperYear(rng) {
  const N = 7 + rng.int(4);
  const headers = ["학과", "입학일자", "입학코드"];
  const dept = rng.sample(MAJOR_EN, N);
  if (!dept.some((d) => d.includes(" "))) { const m = MAJOR_MULTI.find((x) => !dept.includes(x)); if (m) dept[rng.int(N)] = m; } // 공백 포함(PROPER 효과) 1행 이상
  const dates = Array.from({ length: N }, () => randDate(rng, 2018, 2024));
  const rows = dept.map((d, i) => [d, dates[i].s, null]);
  const g = geom(headers, N), x = g.dataCell("학과", 0), d = g.dataCell("입학일자", 0);
  return {
    subtype: "D-1", colWidths: [12, 12, 10], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "입학코드" },
    // 판별 의미 없음(균일 변환) — 공백 포함 학과가 최소 1행 있는지 위치 분산만 확인.
    discriminators: [{ name: "학과명 공백 포함", test: (r) => String(r[0]).includes(" "), min: 1, max: N }],
    answer: `=PROPER(LEFT(${x},3))&YEAR(${d})`,
    functions: { required: ["PROPER", "LEFT", "YEAR"], candidates: null },
    text: "[{표}]에서 학과[{col:학과}]의 앞 세 글자와 입학일자[{col:입학일자}]의 연도를 이용하여 입학코드[{R}]를 표시하시오. (8점)",
    notes: [(() => { const w = rng.pick(EX_MAJOR), y = 2018 + rng.int(8); return `학과 앞 세 글자는 첫 글자만 대문자로 [표시 예 : ${w}, ${y}-03-02 → ${w[0].toUpperCase() + w.slice(1, 3)}${y}]`; })(), "PROPER, LEFT, YEAR 함수와 & 연산자 사용"],
    accept: [`=PROPER(LEFT(${x},3))&YEAR(${d})`],
  };
}

// 4) d1-upper-month [어려움] — UPPER(a)&"-"&MONTH(d)
function d1UpperMonth(rng) {
  const N = 7 + rng.int(4);
  const headers = ["분류", "생산일자", "분류코드"];
  const cat = rng.sample(CATEGORY, N);               // 소문자 → UPPER 값 변경
  const dates = Array.from({ length: N }, () => randDate(rng, 2024, 2026));
  const rows = cat.map((c, i) => [c, dates[i].s, null]);
  const g = geom(headers, N), a = g.dataCell("분류", 0), d = g.dataCell("생산일자", 0);
  return {
    subtype: "D-1", colWidths: [8, 12, 10], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "분류코드" },
    answer: `=UPPER(${a})&"-"&MONTH(${d})`,
    functions: { required: ["UPPER", "MONTH"], candidates: null },
    text: "[{표}]에서 분류[{col:분류}]와 생산일자[{col:생산일자}]의 월을 이용하여 분류코드[{R}]를 표시하시오. (8점)",
    notes: [(() => { const w = rng.pick(EX_CAT), mo = 1 + rng.int(12); return `분류는 대문자로 [표시 예 : ${w}, 2025-${pad2(mo)}-10 → ${w.toUpperCase()}-${mo}]`; })(), "UPPER, MONTH 함수와 & 연산자 사용"],
    accept: [`=UPPER(${a})&"-"&MONTH(${d})`],
  };
}

export const TEMPLATE_D1 = {
  subtype: "D-1",
  variants: [
    { id: "d1-upper-left", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["UPPER"], plan: d1UpperLeft },
    { id: "d1-upper-lower", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["UPPER", "LOWER"], plan: d1UpperLower },
    { id: "d1-proper-year", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["PROPER"], plan: d1ProperYear },
    { id: "d1-upper-month", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["UPPER"], plan: d1UpperMonth },
  ],
};
