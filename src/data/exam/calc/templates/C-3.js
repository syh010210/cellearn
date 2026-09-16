// src/data/exam/calc/templates/C-3.js
// 참조 찾기 — 최대값 행의 이름(INDEX/MATCH/MAX, VLOOKUP/DMAX). 변형 2개. 단일 셀.
//  단일 셀이라 $ 유무는 값에 영향 없음(singleDollar). 최댓값 행은 마지막 데이터 행이 아닌 위치에 두어
//  MATCH 근사(0→1) 는 값으로 잡히고(이진 탐색이 다른 위치 반환), 범위 끝 축소는 extremeLookupShrink 로 동치 인정.
import { PRODUCTS, TEAM_NAMES } from "../pools.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 800) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };
// 엑셀식 MATCH type1 이진 탐색이 방문하는 mid 위치(전부 오른쪽으로 갈 때). 최댓값을 이 밖에 두면 근사가 다른 위치를 준다.
const visitedMids = (n) => { const s = new Set(); let lo = 0, hi = n - 1; while (lo <= hi) { const m = (lo + hi) >> 1; s.add(m); lo = m + 1; } return s; };

// 1) c3-index-match-max [어려움] — INDEX(이름범위,MATCH(MAX(값범위),값범위,0))
function c3IndexMatchMax(rng) {
  const N = 8 + rng.int(3);
  const headers = ["제품", "브랜드", "판매량"];
  const base = distinctInts(rng, N - 1, 100, 780);      // 전부 세 자리, 서로 다름
  const second = Math.max(...base);
  let maxVal = Math.round(second * (1.01 + rng.next() * 0.04)); // 2등보다 1~5% 큼
  if (maxVal <= second) maxVal = second + 1;
  if (maxVal > 999 || base.includes(maxVal)) throw new Error("최댓값 생성 실패");
  // 최댓값 위치: 이진 탐색 방문 밖 + 마지막 아님(첫 행 포함) → 근사(,1)가 마지막 위치를 반환해 값으로 갈림
  const vis = visitedMids(N);
  const cands = []; for (let i = 0; i < N - 1; i++) if (!vis.has(i)) cands.push(i);
  if (!cands.length) throw new Error("최댓값 후보 위치 없음");
  const pos = rng.pick(cands);
  const vals = base.slice(); vals.splice(pos, 0, maxVal);
  const prods = rng.sample(PRODUCTS, N), brands = rng.sample(TEAM_NAMES, N);
  const rows = prods.map((p, i) => [p, brands[i], vals[i]]);
  const g = geom(headers, N), nameA = g.colAbs("제품"), valA = g.colAbs("판매량");
  return {
    subtype: "C-3", colWidths: [8, 8, 8], headers, rows, verbException: "표시",
    result: { kind: "single", label: "판매량이 가장 많은 제품" },
    discriminators: [{ name: "최댓값 행", test: (r) => r[2] === maxVal, min: 1, max: 1 }],
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
  const isT = new Array(N).fill(false);
  const idxs = rng.shuffle([...Array(N).keys()]);
  const nT = 3 + rng.int(2);                            // 조건 대상 3~4개, 위치 무작위
  for (let i = 0; i < nT; i++) isT[idxs[i]] = true;
  const vals = distinctInts(rng, N, 100, 900);          // 서로 다름 → 답 값(실적)이 열 전체에서 유일
  const tRows = [...Array(N).keys()].filter((i) => isT[i]);
  let maxTi = tRows[0]; for (const i of tRows) if (vals[i] > vals[maxTi]) maxTi = i;
  if (maxTi === N - 1) throw new Error("조건 대상 최대가 마지막 행"); // 마지막 아님 보장(재시도)
  const catCol = isT.map((t) => (t ? target : rng.pick(others)));
  const prods = rng.sample(PRODUCTS, N), brands = rng.sample(TEAM_NAMES, N);
  const rows = catCol.map((c, i) => [c, brands[i], vals[i], prods[i]]);
  const g = geom(headers, N), dbA = g.dbAllAbs(), crit = g.critRange(1);
  const lookA = `$${g.colLetter("판매실적")}$${g.dr1}:$${g.colLetter("제품명")}$${g.dr2}`;
  return {
    subtype: "C-3", colWidths: [8, 8, 8, 10], headers, rows, verbException: "표시",
    result: { kind: "single", label: `${target} 중 판매실적 최고 제품명` },
    discriminators: [{ name: `분류=${target}`, test: (r) => r[0] === target, min: 3, max: N }],
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
