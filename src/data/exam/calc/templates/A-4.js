// src/data/exam/calc/templates/A-4.js
// 조건 합계·비율 (SUMIF/SUMIFS/SUM). 변형 2개 구현.
// a4-sumifs-ref 는 선택 셀 2개 + 결과표 머리글 참조(가로·세로 채우기)가 필요 — 현재 스키마(baseCell 1개,
//  1열 resultTable)로 표현 불가 → 보류(보고).
import { NAMES, DEPTS, SEX } from "../pools.js";
import { geom, COL as COLg, assertRangesClean } from "./_util.js";

const distinctInts = (rng, n, lo, hi, unit = 1) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 800) { const v = (lo + rng.int((hi - lo) / unit + 1)) * unit; if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };

// 1) a4-sumif-ratio [기본] — SUMIF/SUM 결과표 (부서별 비율)
function a4SumifRatio(rng) {
  const N = 6 + rng.int(3);
  const headers = ["사원명", "부서", "실적"];
  const deptSet = rng.sample(DEPTS, 3);
  // 각 부서 최소 1행 + 나머지 랜덤, 부서별 합계가 서로 다르게
  const dseq = []; for (let i = 0; i < N; i++) dseq.push(deptSet[i < 3 ? i : rng.int(3)]);
  const seqD = rng.shuffle(dseq);
  const 실적 = distinctInts(rng, N, 20, 300, 10);
  const rows = seqD.map((d, i) => [null, d, 실적[i]]);
  const names = rng.sample(NAMES, N); rows.forEach((r, i) => (r[0] = names[i]));
  const sums = {}; deptSet.forEach((d) => sums[d] = 0); seqD.forEach((d, i) => sums[d] += 실적[i]);
  const sv = deptSet.map((d) => sums[d]);
  if (new Set(sv).size !== 3) throw new Error("부서 합계 중복");
  const g = geom(headers, N), att = g.attCol0;
  const firstLabel = COLg(att) + "3";                 // 이름행1·머리글행2·라벨행3~
  const resCol = COLg(att + 1);
  const R = `${resCol}3:${resCol}${2 + deptSet.length}`;
  return {
    subtype: "A-4", colWidths: [8, 8, 8], headers, rows,
    result: { kind: "table" },
    resultTable: { name: "부서별비율", headers: ["부서", "비율"], labels: deptSet, rowOffset: 0 },
    discriminators: [{ name: "부서=첫 부서", test: (r) => r[1] === deptSet[0], min: 1, max: N }],
    answer: `=SUMIF($B$3:$B$${2 + N},${firstLabel},$C$3:$C$${2 + N})/SUM($C$3:$C$${2 + N})`,
    functions: { required: ["SUMIF", "SUM"], candidates: null },
    text: "[{표}]에서 부서[{col:부서}]와 실적[{col:실적}]을 이용하여 [부서별비율]표의 부서별 비율[{R}]을 계산하시오. (8점)",
    notes: ["비율 = 부서별 실적 합계 / 전체 실적 합계", "SUMIF, SUM 함수 사용"],
    accept: [`=SUMIF($B$3:$B$${2 + N},${firstLabel},C$3:C$${2 + N})/SUM(C$3:C$${2 + N})`],
  };
}

// 2) a4-abs-sumif [어려움] — ABS(SUMIF("남")-SUMIF("여"))
function a4AbsSumif(rng) {
  const N = 8 + rng.int(3);
  const headers = ["사번", "성별", "점수"];
  // 남 합 < 여 합 (ABS 누락 판별), 차이 ≠ 0
  const sexes = [];
  for (let i = 0; i < N; i++) sexes.push(i < 2 ? SEX[i] : rng.pick(SEX));
  const seqS = rng.shuffle(sexes);
  let 점수, sumM, sumF, t = 0;
  do {
    점수 = distinctInts(rng, N, 40, 99);
    sumM = seqS.reduce((s, x, i) => s + (x === "남" ? 점수[i] : 0), 0);
    sumF = seqS.reduce((s, x, i) => s + (x === "여" ? 점수[i] : 0), 0);
  } while ((sumM >= sumF || sumM === sumF) && t++ < 30);
  if (sumM >= sumF) throw new Error("남<여 실패");
  const rows = seqS.map((x, i) => ["A" + String(101 + i), x, 점수[i]]);
  const g = geom(headers, N), sA = g.colRel("성별"), jA = g.colRel("점수");
  const answer = `=ABS(SUMIF(${sA},"남",${jA})-SUMIF(${sA},"여",${jA}))`;
  assertRangesClean(headers, rows, undefined, answer);
  return {
    subtype: "A-4", colWidths: [8, 6, 6], headers, rows, codeColumns: ["사번"],
    result: { kind: "single", label: "남녀 점수 합계 차이" },
    discriminators: [{ name: "성별=남", test: (r) => r[1] === "남", min: 1, max: N - 1 }],
    answer,
    functions: { required: ["ABS", "SUMIF"], candidates: null },
    text: `[{표}]에서 성별[{col:성별}]이 "남"인 점수[{col:점수}]의 합계와 "여"인 점수의 합계 차이를 절댓값으로 [{R}] 셀에 계산하시오. (8점)`,
    notes: ["SUMIF, ABS 함수 사용"],
    accept: [`=ABS(SUMIF(${g.colRowFixed("성별")},"남",${g.colRowFixed("점수")})-SUMIF(${g.colRowFixed("성별")},"여",${g.colRowFixed("점수")}))`],
  };
}

export const TEMPLATE_A4 = {
  subtype: "A-4",
  variants: [
    { id: "a4-sumif-ratio", difficulty: "기본", plan: a4SumifRatio },
    { id: "a4-abs-sumif", difficulty: "어려움", plan: a4AbsSumif },
    // 보류: a4-sumifs-ref = SUMIFS(합계열,$조건1,$선택1,$조건2,$선택2) — 선택 셀 2개 + 결과표 머리글
    //  참조(가로·세로 채우기)가 필요. baseCell 1개·1열 resultTable 로는 불가 → calcBlock 스키마 확장 필요.
  ],
};
