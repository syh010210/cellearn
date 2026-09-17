// src/data/exam/calc/templates/D-2.js
// 날짜 생성·일수 (DATE / DAYS). 변형 2개. 열 채우기.
import { NAMES } from "../pools.js";
import { geom, COL, randDate, serial, assertFillColClean } from "./_util.js";

const pad2 = (n) => String(n).padStart(2, "0");

// 1) d2-days [기본] — DAYS(대상일,기준일)&"일"  (기준일 = baseCell)
function d2Days(rng) {
  const N = 8 + rng.int(3);
  const headers = ["휴가자", "휴가출발일", "남은일수"];
  const baseY = 2024 + rng.int(2);
  const base = randDate(rng, 0, 0, { year: baseY, month: 1 + rng.int(3), day: 1 + rng.int(20) });
  // 대상일은 기준일 이후, 서로 다른 일수(양수)
  const gaps = new Set(); const out = [];
  while (out.length < N) { const g = 10 + rng.int(180); if (!gaps.has(g)) { gaps.add(g); out.push(g); } }
  const names = rng.sample(NAMES, N);
  const rows = out.map((gp, i) => [names[i], base.s + gp, null]);
  const g = geom(headers, N), bA = `$${COL(headers.length - 1)}$1`, x = g.dataCell("휴가출발일", 0);
  const spec = {
    subtype: "D-2", colWidths: [8, 12, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" }, verbException: "계산",
    baseCell: { label: "기준일", value: base.s, z: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "남은일수" },
    answer: `=DAYS(${x},${bA})&"일"`,
    functions: { required: ["DAYS"], candidates: null },
    text: "[{표}]에서 기준일[{base}]부터 휴가출발일[{col:휴가출발일}]까지 남은일수[{R}]를 계산하시오. (8점)",
    notes: [(() => { let e; do { e = 3 + rng.int(300); } while (out.includes(e)); return `남은일수 뒤에 "일"을 포함하여 표시 [표시 예 : ${e}일]`; })(), "DAYS 함수와 & 연산자 사용"],
    accept: [`=DAYS(${x},${bA})&"일"`],
  };
  assertFillColClean(spec, [spec.answer.replace(/\$/g, "")]);   // 기준일 $ 제거 시 채우기가 밀려 값이 달라져야
  return spec;
}

// 2) d2-date-build [어려움] — DATE(LEFT(x,4),MID(x,5,2),MID(x,7,2))  (관리번호 = 날짜8 + 일련2)
function d2DateBuild(rng) {
  const N = 8 + rng.int(3);
  const headers = ["사원", "관리번호", "입사일"];
  const RES = "2000010199";                              // 표시 예용 예약 코드(데이터에서 제외)
  const codes = new Set(); const out = [];
  while (out.length < N) {
    const d = randDate(rng, 2018, 2025);
    const code = `${d.y}${pad2(d.m)}${pad2(d.d)}${pad2(10 + rng.int(90))}`;
    if (code !== RES && !codes.has(code)) { codes.add(code); out.push({ code, s: d.s }); }
  }
  if (new Set(out.map((o) => o.s)).size < 2) throw new Error("날짜 단일");
  const names = rng.sample(NAMES, N);
  const rows = out.map((o, i) => [names[i], o.code, null]);
  const g = geom(headers, N), x = g.dataCell("관리번호", 0);
  return {
    subtype: "D-2", colWidths: [8, 12, 12], headers, rows, codeColumns: ["관리번호"], colZ: { 2: "yyyy-mm-dd" }, verbException: "표시",
    result: { kind: "fillCol", col: "입사일", z: "yyyy-mm-dd" },
    answer: `=DATE(LEFT(${x},4),MID(${x},5,2),MID(${x},7,2))`,
    functions: { required: ["DATE", "LEFT", "MID"], candidates: null },
    text: "[{표}]에서 관리번호[{col:관리번호}]를 이용하여 입사일[{R}]을 표시하시오. (8점)",
    notes: [(() => { const d = randDate(rng, 2018, 2025); return `입사일 : 관리번호의 왼쪽 네 글자는 연도, 다섯째부터 두 글자는 월, 일곱째부터 두 글자는 일 [표시 예 : ${d.y}${pad2(d.m)}${pad2(d.d)}${pad2(10 + rng.int(90))} → ${d.y}-${pad2(d.m)}-${pad2(d.d)}]`; })(), "DATE, LEFT, MID 함수 사용"],
    accept: [`=DATE(LEFT(${x},4),MID(${x},5,2),MID(${x},7,2))`],
  };
}

export const TEMPLATE_D2 = {
  subtype: "D-2",
  variants: [
    { id: "d2-days", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["DAYS"], plan: d2Days },
    { id: "d2-date-build", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["DATE"], plan: d2DateBuild },
  ],
};
