// src/data/exam/calc/templates/D-3.js
// 근무일 계산 (WORKDAY + MONTH/DAY + &). 변형 1개. 열 채우기(텍스트 결과 "m/d").
//  보류: d3-weekend-plus = IF(WEEKDAY(대여일+5,2)=6,+7,…) 주말 보정형(중첩 IF·날짜 산술) — 별도 구현 대기.
import { NAMES } from "../pools.js";
import { geom, randDate, weekday1, dateWithWeekday } from "./_util.js";

// serial → {m,d}
const md = (s) => { const dt = new Date(Date.UTC(1899, 11, 30) + s * 86400000); return { m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }; };
// 주말 제외하고 n 근무일 뒤 (엔진 WORKDAY 와 동일 규칙)
function workday(s, n) { let cur = s, left = n; while (left > 0) { cur++; const w = weekday1(cur); if (w !== 1 && w !== 7) left--; } return cur; }
// 대여일~반납일 사이에 낀 토요일 수(= 걸친 주말 수)
function weekendsSpanned(s, n) { const end = workday(s, n); let c = 0; for (let d = s + 1; d <= end; d++) if (weekday1(d) === 7) c++; return c; }

// 1) d3-workday [어려움] — MONTH(WORKDAY(x,n))&"/"&DAY(WORKDAY(x,n))
function d3Workday(rng) {
  const N = 8 + rng.int(3);
  const headers = ["대여자", "대여일", "대여기간", "반납예정일"];
  const dateUsed = new Set(), keySet = new Set(), wdUsed = new Set(), rowsRaw = [];
  const add = (s, n) => { if (dateUsed.has(s)) return false; const key = md(workday(s, n)).m + "/" + md(workday(s, n)).d; if (keySet.has(key)) return false; dateUsed.add(s); keySet.add(key); rowsRaw.push({ s, n, key }); return true; };
  let guard = 0;
  // 필수 판별 행: 금요일 시작 · 토요일 시작 · 주말 2회 걸침(대여기간 김). dateWithWeekday 는 wdUsed 로 내부 중복만 관리.
  while (!add(dateWithWeekday(rng, 6, 1, 2024, 2026, wdUsed).s, 5 + rng.int(12)) && guard++ < 60);
  while (!add(dateWithWeekday(rng, 7, 1, 2024, 2026, wdUsed).s, 5 + rng.int(12)) && guard++ < 60);
  while (guard++ < 200) { const dt = randDate(rng, 2024, 2026); const n = 12 + rng.int(8); if (weekendsSpanned(dt.s, n) >= 2 && add(dt.s, n)) break; }
  while (rowsRaw.length < N && guard++ < 400) { const dt = randDate(rng, 2024, 2026); add(dt.s, 5 + rng.int(20)); }
  if (rowsRaw.length < N) throw new Error("행 부족");
  const shuffled = rng.shuffle(rowsRaw);                  // 판별 행 위치 분산
  const names = rng.sample(NAMES, N);
  const rows = shuffled.map((o, i) => [names[i], o.s, o.n, null]);
  const results = new Set(shuffled.map((o) => o.key)), dataN = new Set(shuffled.map((o) => o.n));
  const pad2 = (v) => String(v).padStart(2, "0");
  // 표시 예: 입력(날짜, 기간) → 결과(월/일). 결과·기간이 데이터와 겹치지 않게.
  let ex;
  for (let t = 0; t < 80; t++) { const ed = randDate(rng, 2024, 2026); const en = 5 + rng.int(15); const er = workday(ed.s, en); const key = md(er).m + "/" + md(er).d; if (!results.has(key) && !dataN.has(en)) { ex = `${ed.y}-${pad2(ed.m)}-${pad2(ed.d)}, ${en} → ${md(er).m}/${md(er).d}`; break; } }
  if (!ex) throw new Error("표시 예 실패");
  const g = geom(headers, N), x = g.dataCell("대여일", 0), n = g.dataCell("대여기간", 0);
  const wf = `WORKDAY(${x},${n})`;
  return {
    subtype: "D-3", colWidths: [8, 12, 8, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "반납예정일" },
    discriminators: [
      { name: "금요일 시작", test: (r) => weekday1(r[1]) === 6, min: 1, max: N },
      { name: "토요일 시작", test: (r) => weekday1(r[1]) === 7, min: 1, max: N },
      { name: "주말 2회 걸침", test: (r) => weekendsSpanned(r[1], r[2]) >= 2, min: 1, max: N },
    ],
    answer: `=MONTH(${wf})&"/"&DAY(${wf})`,
    functions: { required: ["WORKDAY", "MONTH", "DAY"], candidates: null },
    text: "[{표}]에서 대여일[{col:대여일}]과 대여기간[{col:대여기간}]을 이용하여 반납예정일[{R}]을 표시하시오. (8점)",
    notes: [`반납예정일 : 대여일에 주말(토요일과 일요일)은 제외하고 대여기간을 더한 날짜 [표시 예 : ${ex}]`, "WORKDAY, MONTH, DAY 함수와 & 연산자 사용"],
    accept: [`=MONTH(${wf})&"/"&DAY(${wf})`],
  };
}

export const TEMPLATE_D3 = {
  subtype: "D-3",
  variants: [
    { id: "d3-workday", difficulty: "어려움", plan: d3Workday },
  ],
};
