// src/data/exam/calc/templates/C-3.js
// 참조 찾기 — 최대값 행의 이름(INDEX/MATCH/MAX, VLOOKUP/DMAX). 변형 2개. 단일 셀.
//  단일 셀이라 $ 유무는 값에 영향 없음(singleDollar). 최댓값 행을 마지막에 둬 범위 축소가 모두 값으로 잡히게 한다.
import { PRODUCTS, TEAM_NAMES } from "../pools.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 800) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };
const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v) || a.every((v, i) => i === 0 || a[i - 1] >= v);

// 1) c3-index-match-max [어려움] — INDEX(이름범위,MATCH(MAX(값범위),값범위,0))
function c3IndexMatchMax(rng) {
  const N = 8 + rng.int(3);
  const headers = ["제품", "브랜드", "판매량"];
  const vals = distinctInts(rng, N, 100, 990);          // 동점 없음
  const mi = vals.indexOf(Math.max(...vals));
  [vals[mi], vals[N - 1]] = [vals[N - 1], vals[mi]];     // 최댓값을 마지막 행으로(범위 축소가 모두 잡히게)
  if (isSorted(vals)) throw new Error("정렬됨");          // MATCH 근사(,1/,-1) 가 값으로 갈리게
  const prods = rng.sample(PRODUCTS, N), brands = rng.sample(TEAM_NAMES, N);
  const rows = prods.map((p, i) => [p, brands[i], vals[i]]);
  const g = geom(headers, N), nameA = g.colAbs("제품"), valA = g.colAbs("판매량");
  return {
    subtype: "C-3", colWidths: [8, 8, 8], headers, rows, verbException: "표시",
    result: { kind: "single", label: "판매량이 가장 많은 제품" },
    answer: `=INDEX(${nameA},MATCH(MAX(${valA}),${valA},0))`,
    functions: { required: ["INDEX", "MATCH", "MAX"], candidates: null },
    text: "[{표}]에서 판매량[{col:판매량}]이 가장 많은 제품[{col:제품}]을 [{R}] 셀에 표시하시오. (8점)",
    notes: ["INDEX, MATCH, MAX 함수 사용"],
    accept: [`=INDEX(${g.colRowFixed("제품")},MATCH(MAX(${g.colRowFixed("판매량")}),${g.colRowFixed("판매량")},0))`],
  };
}

// 2) c3-vlookup-dmax [어려움] — VLOOKUP(DMAX(db,실적,조건),실적:이름 범위,2,0)
function c3VlookupDmax(rng) {
  const N = 8 + rng.int(3);
  const headers = ["분류", "브랜드", "판매실적", "제품명"];
  const catPool = ["캠핑용품", "등산용품", "낚시용품", "수영용품"];
  const target = rng.pick(catPool), others = catPool.filter((c) => c !== target);
  // target 분류를 첫·중간·마지막 행에 배치(≥3). 전체 최댓값 실적은 target 행 중 마지막 데이터 행에 둔다.
  const isT = new Array(N).fill(false);
  isT[0] = true; isT[N - 1] = true; isT[1 + rng.int(N - 2)] = true;
  const catCol = isT.map((t) => (t ? target : rng.pick(others)));
  const vals = distinctInts(rng, N, 100, 990);
  // 전체 최댓값을 마지막 행(=target)에 → DMAX = 그 값, VLOOKUP 범위 끝-1 축소 시 그 행 사라져 #N/A
  const gmax = Math.max(...vals) + 5 + rng.int(20);
  vals[N - 1] = gmax;
  const prods = rng.sample(PRODUCTS, N), brands = rng.sample(TEAM_NAMES, N);
  const rows = catCol.map((c, i) => [c, brands[i], vals[i], prods[i]]);
  const g = geom(headers, N), dbA = g.dbAllAbs(), crit = g.critRange(1);
  // VLOOKUP 범위: 판매실적(키, 왼쪽) ~ 제품명. 실적 col=C(2), 제품명 col=D(3).
  const lookA = `$${g.colLetter("판매실적")}$${g.dr1}:$${g.colLetter("제품명")}$${g.dr2}`;
  return {
    subtype: "C-3", colWidths: [8, 8, 8, 10], headers, rows, verbException: "표시",
    result: { kind: "single", label: `${target} 중 판매실적 최고 제품명` },
    answer: `=VLOOKUP(DMAX(${dbA},"판매실적",${crit}),${lookA},2,0)`,
    criteria: { headers: ["분류"], rows: [[target]], rowOffset: 0 },
    functions: { required: ["VLOOKUP", "DMAX"], candidates: null },
    text: `[{표}]에서 분류[{col:분류}]가 "${target}"인 제품 중 판매실적[{col:판매실적}]이 가장 높은 제품명[{col:제품명}]을 [{R}] 셀에 표시하시오. (8점)`,
    notes: ["조건은 [{C}] 영역에 알맞게 입력", "VLOOKUP, DMAX 함수 사용"],
    accept: [
      `=VLOOKUP(DMAX(${dbA},3,${crit}),${lookA},2,0)`,
      `=VLOOKUP(DMAX(${dbA},"판매실적",${crit}),${lookA},2,FALSE)`,
    ],
  };
}

export const TEMPLATE_C3 = {
  subtype: "C-3",
  variants: [
    { id: "c3-index-match-max", difficulty: "어려움", plan: c3IndexMatchMax },
    { id: "c3-vlookup-dmax", difficulty: "어려움", plan: c3VlookupDmax },
  ],
};
