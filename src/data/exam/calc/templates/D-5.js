// src/data/exam/calc/templates/D-5.js
// 요일 (CHOOSE+WEEKDAY / IF+WEEKDAY). 변형 2개. 열 채우기(텍스트 결과).
import { NAMES } from "../pools.js";
import { geom, randDate, weekday1, weekday2, dateWithWeekday } from "./_util.js";

const WD1_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

// 1) d5-choose-weekday [기본] — CHOOSE(WEEKDAY(d,1),...)
function d5ChooseWeekday(rng) {
  const N = 7 + rng.int(4);
  const headers = ["예약자", "출발일자", "출발요일"];
  // 모든 CHOOSE 인수가 쓰이도록 7개 요일 전부 포함(미사용 인수 strLit 생존 방지)
  const used = new Set(), dates = [];
  for (const w of [1, 2, 3, 4, 5, 6, 7]) dates.push(dateWithWeekday(rng, w, 1, 2024, 2026, used));
  while (dates.length < N) { const dt = randDate(rng, 2024, 2026); if (!used.has(dt.s)) { used.add(dt.s); dates.push(dt); } }
  const names = rng.sample(NAMES, N);
  const rows = rng.shuffle(dates).map((d, i) => [names[i], d.s, null]);
  const exWd = WD1_NAMES[rng.int(7)];                 // 표시 예: 요일명(범주형 → 기대값 검사 제외)
  const g = geom(headers, N), x = g.dataCell("출발일자", 0);
  // 정렬 인수 "1"은 생략(WEEKDAY 기본=일요일 1). "1"을 쓰면 litPM1 ,1→,0 이 엔진상 동치라 생존한다.
  return {
    subtype: "D-5", colWidths: [8, 12, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "출발요일" },
    answer: `=CHOOSE(WEEKDAY(${x}),"일요일","월요일","화요일","수요일","목요일","금요일","토요일")`,
    functions: { required: ["CHOOSE", "WEEKDAY"], candidates: null },
    text: "[{표}]에서 출발일자[{col:출발일자}]를 이용하여 출발요일[{R}]을 표시하시오. (8점)",
    notes: [`요일번호는 "일요일"이 1이 되는 방법으로 지정 [표시 예 : ${exWd}]`, "CHOOSE, WEEKDAY 함수 사용"],
    accept: [`=CHOOSE(WEEKDAY(${x},1),"일요일","월요일","화요일","수요일","목요일","금요일","토요일")`],
  };
}

// 2) d5-if-weekday [기본] — IF(WEEKDAY(d,2)<=5,"평일","주말")
function d5IfWeekday(rng) {
  const N = 7 + rng.int(4);
  const headers = ["응시자", "응시일", "요일구분"];
  const used = new Set(), dates = [];
  for (const w of [5, 6, 7, 1]) dates.push(dateWithWeekday(rng, w, 2, 2024, 2026, used)); // 금·토·일·월 보장
  while (dates.length < N) { const dt = randDate(rng, 2024, 2026); if (!used.has(dt.s)) { used.add(dt.s); dates.push(dt); } }
  const names = rng.sample(NAMES, N);
  const rows = rng.shuffle(dates).map((d, i) => [names[i], d.s, null]);
  const g = geom(headers, N), x = g.dataCell("응시일", 0);
  return {
    subtype: "D-5", colWidths: [8, 12, 8], headers, rows, colZ: { 1: "yyyy-mm-dd" },
    result: { kind: "fillCol", col: "요일구분" },
    answer: `=IF(WEEKDAY(${x},2)<=5,"평일","주말")`,
    functions: { required: ["IF", "WEEKDAY"], candidates: null },
    text: `[{표}]에서 응시일[{col:응시일}]이 월요일부터 금요일이면 "평일", 그 외에는 "주말"로 요일구분[{R}]에 표시하시오. (8점)`,
    notes: ["요일 계산 시 월요일이 1인 유형으로 지정", "IF, WEEKDAY 함수 사용"],
    accept: [`=IF(WEEKDAY(${x},2)<=5,"평일","주말")`],
  };
}

export const TEMPLATE_D5 = {
  subtype: "D-5",
  variants: [
    { id: "d5-choose-weekday", difficulty: "기본", plan: d5ChooseWeekday },
    { id: "d5-if-weekday", difficulty: "기본", plan: d5IfWeekday },
  ],
};
