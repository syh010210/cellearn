// src/data/exam/calc/templates/B-3.js
// 날짜 판정 (YEAR/MONTH/DAY/MOD). 변형 4개. 기준일은 baseCell(TODAY 금지).
import { NAMES, EXAM_NAMES, EVENTS } from "../pools.js";
import { geom, COL, randDate } from "./_util.js";

const shuffleRows = (rng, arr) => rng.shuffle(arr);

// 1) b3-year-diff [기본] — IF(YEAR($기준)-YEAR(x)>=n,...)
function b3YearDiff(rng) {
  const N = 8 + rng.int(3);
  const headers = ["성명", "가입일", "등급"];
  const baseY = 2024 + rng.int(3);
  const base = randDate(rng, 0, 0, { year: baseY, month: 12, day: 31 });
  const n = 8 + rng.int(5), m = 3 + rng.int(3);      // n>m
  const diffs = [n, n - 1, m, m - 1];                 // 경계
  while (diffs.length < N) diffs.push(1 + rng.int(n + 2));
  const dates = shuffleRows(rng, diffs).map((df) => randDate(rng, 0, 0, { year: baseY - df }));
  const names = rng.sample(NAMES, N);
  const rows = dates.map((d, i) => [names[i], d.s, null]);
  const g = geom(headers, N), bA = `$${COL(headers.length - 1)}$1`, x = g.dataCell("가입일", 0);
  return {
    subtype: "B-3", colWidths: [8, 12, 6], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    baseCell: { label: "기준일", value: base.s, z: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "등급" },
    answer: `=IF(YEAR(${bA})-YEAR(${x})>=${n},"★",IF(YEAR(${bA})-YEAR(${x})>=${m},"☆",""))`,
    functions: { required: ["IF", "YEAR"], candidates: null },
    text: `[{표}]에서 기준일[{base}]을 기준으로 가입일[{col:가입일}]의 가입기간이 ${n}년 이상이면 "★", ${m}년 이상이면 "☆", 그 외에는 공백을 등급[{R}]에 표시하시오. (8점)`,
    notes: ["가입기간은 연도만으로 계산", "IF, YEAR 함수 사용"],
    accept: [`=IF(YEAR(${bA})-YEAR(${x})>=${n},"★",IF(YEAR(${bA})-YEAR(${x})>=${m},"☆",""))`],
  };
}

// 2) b3-age-plus1 [어려움] — 나이=(기준연도-생년)+1, 2구간
function b3AgePlus1(rng) {
  const N = 8 + rng.int(3);
  const headers = ["성명", "생년월일", "세대구분"];
  const baseY = 2024 + rng.int(3);
  const base = randDate(rng, 0, 0, { year: baseY, month: 12, day: 31 });
  const a = 19 + rng.int(3), b = 29 + rng.int(3);     // 청소년<a, ~b→중간, else
  // 나이 = (baseY - 생년)+1 → 생년 = baseY - 나이 + 1. 경계 나이 포함
  const ages = [a - 1, a, b, b + 1];
  while (ages.length < N) ages.push(15 + rng.int(b - 10));
  const dates = shuffleRows(rng, ages).map((age) => randDate(rng, 0, 0, { year: baseY - age + 1 }));
  const names = rng.sample(NAMES, N);
  const rows = dates.map((d, i) => [names[i], d.s, null]);
  const g = geom(headers, N), bA = `$${COL(headers.length - 1)}$1`, x = g.dataCell("생년월일", 0);
  return {
    subtype: "B-3", colWidths: [8, 12, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    baseCell: { label: "기준일", value: base.s, z: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "세대구분" },
    answer: `=IF((YEAR(${bA})-YEAR(${x}))+1<${a},"청소년",IF((YEAR(${bA})-YEAR(${x}))+1<=${b},"청년","장년"))`,
    functions: { required: ["IF", "YEAR"], candidates: null },
    text: `[{표}]에서 기준일[{base}]과 생년월일[{col:생년월일}]을 이용한 나이가 ${a}세 미만이면 "청소년", ${b}세 이하이면 "청년", 그 외에는 "장년"으로 세대구분[{R}]에 표시하시오. (8점)`,
    notes: ["나이 = (기준일의 년도 - 생년월일의 년도) + 1", "IF, YEAR 함수 사용"],
    accept: [`=IF((YEAR(${bA})-YEAR(${x}))+1<${a},"청소년",IF((YEAR(${bA})-YEAR(${x}))+1<=${b},"청년","장년"))`],
  };
}

// 3) b3-mod-day [어려움] — IF(MOD(DAY(x),5)=0,...)
function b3ModDay(rng) {
  const N = 8 + rng.int(3);
  const headers = ["종목", "시험일자", "구분"];
  const mult = [5, 10, 15, 20, 25, 30], non = [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29];
  const days = [rng.pick(mult), rng.pick(mult), rng.pick(non), rng.pick(non), 31]; // 배수2·비배수2·31일1
  while (days.length < N) days.push(rng.chance(0.4) ? rng.pick(mult) : rng.pick(non));
  const dates = shuffleRows(rng, days).map((d) => randDate(rng, 2024, 2026, { day: d }));
  const events = rng.sample(EXAM_NAMES, N);
  const rows = dates.map((d, i) => [events[i], d.s, null]);
  const g = geom(headers, N), x = g.dataCell("시험일자", 0);
  return {
    subtype: "B-3", colWidths: [10, 12, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "구분" },
    answer: `=IF(MOD(DAY(${x}),5)=0,"정기시험","상시시험")`,
    functions: { required: ["IF", "MOD", "DAY"], candidates: null },
    text: `[{표}]에서 시험일자[{col:시험일자}]의 일이 5의 배수이면 "정기시험", 그 외에는 "상시시험"으로 구분[{R}]에 표시하시오. (8점)`,
    notes: ["IF, MOD, DAY 함수 사용"],
    accept: [`=IF(MOD(DAY(${x}),5)=0,"정기시험","상시시험")`],
  };
}

// 4) b3-or-month [어려움] — IF(OR(MONTH(x)=m1,MONTH(x)=m2),...)
function b3OrMonth(rng) {
  const N = 8 + rng.int(3);
  const headers = ["행사명", "홍보예정일", "발송여부"];
  const m1 = 2 + rng.int(4), m2 = m1 + 3 + rng.int(3);  // m1<m2, 인접월 존재
  const months = [m1, m2, m1 + 1, m2 - 1];
  while (months.length < N) months.push(1 + rng.int(12));
  const dates = shuffleRows(rng, months).map((mm) => randDate(rng, 2024, 2026, { month: mm }));
  const events = rng.sample(EVENTS, N);
  const rows = dates.map((d, i) => [events[i], d.s, null]);
  const g = geom(headers, N), x = g.dataCell("홍보예정일", 0);
  return {
    subtype: "B-3", colWidths: [10, 12, 6], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "발송여부" },
    answer: `=IF(OR(MONTH(${x})=${m1},MONTH(${x})=${m2}),"발송","")`,
    functions: { required: ["IF", "OR", "MONTH"], candidates: null },
    text: `[{표}]에서 홍보예정일[{col:홍보예정일}]의 월이 ${m1} 또는 ${m2}이면 "발송", 그 외에는 공백을 발송여부[{R}]에 표시하시오. (8점)`,
    notes: ["IF, OR, MONTH 함수 사용"],
    accept: [`=IF(OR(MONTH(${x})=${m1},MONTH(${x})=${m2}),"발송","")`],
  };
}

export const TEMPLATE_B3 = {
  subtype: "B-3",
  variants: [
    { id: "b3-year-diff", difficulty: "기본", plan: b3YearDiff },
    { id: "b3-age-plus1", difficulty: "어려움", plan: b3AgePlus1 },
    { id: "b3-mod-day", difficulty: "어려움", plan: b3ModDay },
    { id: "b3-or-month", difficulty: "어려움", plan: b3OrMonth },
  ],
};
