// src/data/exam/calc/templates/A-3.js
// 최대·최소 차 (LARGE/SMALL, DMAX/DMIN). 변형 2개 구현.
// a3-avg-dmax 는 별도 조건 범위 2개가 필요 — item.criteria 1개 스키마로 표현 불가 → 1차 제외(문서 참조).
import { NAMES, TEAM_NAMES, SIDO_GW, SIDO_ETC } from "../pools.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 900) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };

// 1) a3-large-small [기본] — LARGE(r,k1)-SMALL(r,k2)
function a3LargeSmall(rng) {
  const N = 8 + rng.int(3);
  const headers = ["선수", "소속", "기록"];
  const k1 = 2 + rng.int(3), k2 = 2 + rng.int(3);   // k 시드(2~4)
  // 기출 LARGE-SMALL 차 조합(2,3·3,2·1,1) 회피
  if ((k1 === 2 && k2 === 3) || (k1 === 3 && k2 === 2) || (k1 === 1 && k2 === 1)) throw new Error("기출 순위 조합 회피");
  const vals = distinctInts(rng, N, 30, 99);         // 동점 없음
  const sorted = [...vals].sort((a, b) => b - a);
  if (sorted[k1 - 1] - sorted[N - k2] === 0) throw new Error("결과 0");
  const names = rng.sample(NAMES, N), teams = rng.sample(TEAM_NAMES, Math.min(TEAM_NAMES.length, 6));
  const rows = vals.map((v, i) => [names[i], teams[i % teams.length], v]);
  const g = geom(headers, N), rA = g.colRel("기록");
  return {
    subtype: "A-3", colWidths: [8, 8, 6], headers, rows,
    result: { kind: "single", label: "큰 값과 작은 값 차이" },
    discriminators: [{ name: "기록 최댓값 행", test: (r) => r[2] === Math.max(...vals), min: 1, max: 1 }],
    answer: `=LARGE(${rA},${k1})-SMALL(${rA},${k2})`,
    functions: { required: ["LARGE", "SMALL"], candidates: null },
    text: `[{표}]의 기록[{col:기록}] 중 ${k1}번째로 큰 값과 ${k2}번째로 작은 값의 차이를 [{R}] 셀에 계산하시오. (8점)`,
    notes: ["LARGE, SMALL 함수 사용"],
    accept: [`=LARGE(${g.colRowFixed("기록")},${k1})-SMALL(${g.colRowFixed("기록")},${k2})`],
  };
}

// 2) a3-dmax-dmin [어려움] — DMAX-DMIN, 와일드카드 "*광역시". 증감률 소수1자리(z "0.0").
function a3DmaxDmin(rng) {
  const N = 8 + rng.int(3);
  const headers = ["시도", "조사표본", "증감률"];
  const nGw = 3 + rng.int(2);
  const gw = rng.sample(SIDO_GW, nGw), etc = rng.sample(SIDO_ETC, N - nGw);
  const sido = rng.shuffle([...gw, ...etc]);
  // 증감률(소수1자리): 전체 최대·최소는 비-광역시에, 광역시에는 그 안쪽 값(국소 최대·최소)
  const t = (lo, hi, k) => { const s = new Set(); const o = []; let gd = 0; while (o.length < k && gd++ < 500) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); o.push(v); } } if (o.length < k) throw new Error("부족"); return o; };
  const gwT = t(1, 80, nGw);                         // 광역시: 0.1~8.0
  const outHi = 81 + rng.int(70), outLo = -99 + rng.int(9); // 전체 최대(>8) · 최소(<0)
  const etcT = rng.shuffle([outHi, outLo, ...t(1, 80, N - nGw - 2)]);
  let gi = 0, ei = 0;
  const rate = sido.map((s) => (String(s).endsWith("광역시") ? gwT[gi++] : etcT[ei++]) / 10);
  const sample = distinctInts(rng, N, 300, 1500);    // 조사표본(사실로 읽히지 않는 수치)
  const rows = sido.map((s, i) => [s, sample[i], rate[i]]);
  const g = geom(headers, N), crit = g.critRange(1, 1), fld = g.header("증감률");
  return {
    subtype: "A-3", colWidths: [12, 8, 6], headers, rows, colZ: { 1: "#,##0", 2: "0.0" },
    result: { kind: "single", label: "광역시 증감률 차이" },
    answer: `=DMAX(${g.dbAll()},${fld},${crit})-DMIN(${g.dbAll()},${fld},${crit})`,
    criteria: { headers: ["시도"], rows: [["*광역시"]], rowOffset: 0 },
    discriminators: [{ name: "시도 '광역시'끝(조건)", test: (r) => String(r[0]).endsWith("광역시"), min: 3, max: N }],
    functions: { required: ["DMAX", "DMIN"], candidates: null },
    text: `[{표}]에서 시도[{col:시도}]가 "광역시"로 끝나는 시도의 증감률[{col:증감률}] 최대값과 최소값의 차이를 [{R}] 셀에 계산하시오. (8점)`,
    notes: ["조건은 [{C}] 영역에 알맞게 입력", "DMAX, DMIN 함수 사용"],
    accept: [`=DMAX(${g.dbAllAbs()},3,${crit})-DMIN(${g.dbAllAbs()},3,${crit})`],
  };
}

export const TEMPLATE_A3 = {
  subtype: "A-3",
  variants: [
    { id: "a3-large-small", difficulty: "기본", resultKind: "single", usesD: false, core: ["LARGE", "SMALL"], plan: a3LargeSmall },
    { id: "a3-dmax-dmin", difficulty: "어려움", resultKind: "single", usesD: true, core: ["DMAX", "DMIN"], plan: a3DmaxDmin },
  ],
};
