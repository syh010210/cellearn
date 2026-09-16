// src/data/exam/calc/templates/D-3.js
// 근무일 계산 (WORKDAY + MONTH/DAY + &). 변형 1개. 열 채우기(텍스트 결과 "m/d").
//  보류: d3-weekend-plus = IF(WEEKDAY(대여일+5,2)=6,+7,…) 주말 보정형(중첩 IF·날짜 산술) — 별도 구현 대기.
import { NAMES } from "../pools.js";
import { geom, randDate, weekday1 } from "./_util.js";

// serial → {m,d}
const md = (s) => { const dt = new Date(Date.UTC(1899, 11, 30) + s * 86400000); return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }; };
// 주말 제외하고 n 근무일 뒤 (엔진 WORKDAY 와 동일 규칙)
function workday(s, n) { let cur = s, left = n; while (left > 0) { cur++; const w = weekday1(cur); if (w !== 1 && w !== 7) left--; } return cur; }

// 1) d3-workday [어려움] — MONTH(WORKDAY(x,n))&"/"&DAY(WORKDAY(x,n))
function d3Workday(rng) {
  const N = 8 + rng.int(3);
  const headers = ["도서", "대여일", "대여기간", "반납예정일"];
  const used = new Set(); const rowsRaw = [];
  while (rowsRaw.length < N) {
    const dt = randDate(rng, 2024, 2026);
    const n = 5 + rng.int(20);
    const r = workday(dt.s, n);
    const key = md(r).m + "/" + md(r).d;
    if (!used.has(key)) { used.add(key); rowsRaw.push({ s: dt.s, n, key }); }
  }
  const names = rng.sample(NAMES, N);
  const rows = rowsRaw.map((o, i) => [names[i], o.s, o.n, null]);
  const results = new Set(rowsRaw.map((o) => o.key));
  // 표시 예(출력 전용): 결과에 없는 m/d 로 (기대값·데이터와 충돌 방지)
  let ex; for (let t = 0; t < 60; t++) { const c = `${1 + rng.int(12)}/${1 + rng.int(28)}`; if (!results.has(c)) { ex = c; break; } }
  if (!ex) throw new Error("표시 예 실패");
  const g = geom(headers, N), x = g.dataCell("대여일", 0), n = g.dataCell("대여기간", 0);
  const wf = `WORKDAY(${x},${n})`;
  return {
    subtype: "D-3", colWidths: [8, 12, 8, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" }, verbException: "계산",
    result: { kind: "fillCol", col: "반납예정일" },
    answer: `=MONTH(${wf})&"/"&DAY(${wf})`,
    functions: { required: ["WORKDAY", "MONTH", "DAY"], candidates: null },
    text: "[{표}]에서 대여일[{col:대여일}]과 대여기간[{col:대여기간}]을 이용하여 반납예정일[{R}]을 계산하시오. (8점)",
    notes: [`반납예정일 : 대여일에 주말(토·일)을 제외하고 대여기간을 더한 날짜를 "월/일"로 표시 [표시 예 : ${ex}]`, "WORKDAY, MONTH, DAY 함수와 & 연산자 사용"],
    accept: [`=MONTH(${wf})&"/"&DAY(${wf})`],
  };
}

export const TEMPLATE_D3 = {
  subtype: "D-3",
  variants: [
    { id: "d3-workday", difficulty: "어려움", plan: d3Workday },
  ],
};
