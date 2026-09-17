// src/data/exam/calc/templates/B-6.js
// IF/CHOOSE 판정 — CHOOSE + 집계 인덱스. 변형 1개(열 채우기).
//  보류: b6-choose-counta = CHOOSE(COUNTA(출석범위),…) — 출석 빈칸(역할 없는 셀)을 여러 열 사각 범위로
//   지시문에서 참조해야 하는데 {col} 는 단일 열만 지원 → 사각 범위 placeholder 필요(스키마 확장 대기).
import { NAMES } from "../pools.js";
import { geom } from "./_util.js";

const CHOOSE_GRADE = ["D", "C", "B", "A"];             // 정수부 1→D … 4→A

// 1) b6-choose-int-avg [어려움] — CHOOSE(INT(AVERAGE(과목범위)),"D","C","B","A")
function b6ChooseIntAvg(rng) {
  const N = 8 + rng.int(3);
  const headers = ["이름", "평가1", "평가2", "평가3", "등급"];
  const intAvg = (r) => Math.floor((r[0] + r[1] + r[2]) / 3);
  // 각 평가 1~5점, 합계 15 제외(정수부 5 방지) → 평균 ∈ [1,5), 정수부 1~4. 네 버킷 모두 대표 행 확보.
  const gen = () => { let r; do { r = [1 + rng.int(5), 1 + rng.int(5), 1 + rng.int(5)]; } while (r[0] + r[1] + r[2] === 15); return r; };
  const bucket = (want) => { for (let t = 0; t < 200; t++) { const r = gen(); if (intAvg(r) === want) return r; } throw new Error("버킷 실패"); };
  const base = [bucket(1), bucket(2), bucket(3), bucket(4)];
  while (base.length < N) base.push(gen());
  const scoreRows = rng.shuffle(base);                    // 버킷 대표 행 위치 분산
  // 자체 검증: 평균이 5 이상 또는 1 미만인 행 금지
  if (scoreRows.some((r) => { const a = (r[0] + r[1] + r[2]) / 3; return a >= 5 || a < 1; })) throw new Error("평균 범위 밖");
  const grades = scoreRows.map((r) => CHOOSE_GRADE[intAvg(r) - 1]);
  if (new Set(grades).size < 4) throw new Error("등급 4종 미충족");   // 결과 D·C·B·A 각 1행 이상
  // rangeShrink(평가3 열 제거): 두 평가 평균 정수부가 세 평가와 달라 결과가 바뀌는 행 필요
  if (!scoreRows.some((r) => Math.floor((r[0] + r[1]) / 2) !== intAvg(r))) throw new Error("열축소 무영향");
  const names = rng.sample(NAMES, N);
  const rows = scoreRows.map((r, i) => [names[i], r[0], r[1], r[2], null]);
  const g = geom(headers, N);
  const rowRange = `${g.dataCell("평가1", 0)}:${g.dataCell("평가3", 0)}`;
  return {
    subtype: "B-6", colWidths: [8, 6, 6, 6, 6], headers, rows,
    result: { kind: "fillCol", col: "등급" },
    discriminators: [
      { name: "정수부=1(D)", test: (r) => Math.floor((r[1] + r[2] + r[3]) / 3) === 1, min: 1, max: N },
      { name: "정수부=4(A)", test: (r) => Math.floor((r[1] + r[2] + r[3]) / 3) === 4, min: 1, max: N },
    ],
    answer: `=CHOOSE(INT(AVERAGE(${rowRange})),"D","C","B","A")`,
    functions: { required: ["CHOOSE", "INT", "AVERAGE"], candidates: null },
    text: '[{표}]에서 평가1[{col:평가1}], 평가2[{col:평가2}], 평가3[{col:평가3}] 점수 평균의 정수 부분이 1이면 "D", 2이면 "C", 3이면 "B", 4이면 "A"로 등급[{R}]에 표시하시오. (8점)',
    notes: ["CHOOSE, INT, AVERAGE 함수 사용"],
    accept: [`=CHOOSE(INT(AVERAGE(${rowRange})),"D","C","B","A")`],
  };
}

export const TEMPLATE_B6 = {
  subtype: "B-6",
  variants: [
    { id: "b6-choose-int-avg", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["CHOOSE"], plan: b6ChooseIntAvg },
  ],
};
