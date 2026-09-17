// src/data/exam/calc/templates/B-1.js
// IF 판정 — 순위 조건 (RANK.EQ/LARGE/SMALL/CHOOSE). 변형 5개. 모두 열 채우기.
import { NAMES, TEAM_NAMES } from "../pools.js";
import { TOPICS, pick } from "../topics.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi, exclude = []) => {
  const ex = new Set(exclude); const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 800) { const v = rng.range(lo, hi); if (!ex.has(v)) { ex.add(v); out.push(v); } }
  if (out.length < n) throw new Error("distinctInts 부족");
  return out;
};
// N행 중 상위 n개(winners)를 row0·마지막·중간에 배치. winners > losers 로 값 분리.
function placeWinners(rng, N, n, { wlo = 80, whi = 99, llo = 40, lhi = 74 } = {}) {
  const winners = distinctInts(rng, n, wlo, whi);
  const losers = distinctInts(rng, N - n, llo, lhi);
  const pos = new Array(N).fill(null);
  pos[0] = "W"; pos[N - 1] = "W";
  const midSlots = []; for (let i = 1; i < N - 1; i++) midSlots.push(i);
  for (const i of rng.shuffle(midSlots).slice(0, n - 2)) pos[i] = "W";
  const wq = rng.shuffle(winners), lq = rng.shuffle(losers);
  let wi = 0, li = 0;
  return pos.map((p) => (p === "W" ? wq[wi++] : lq[li++]));
}

// 1) b1-large-small [기본] — LARGE/SMALL 이 같은 모집단 공유. 마지막 행을 상위 n 경계에 둬
//    LARGE 쪽 축소는 값으로 잡히고, SMALL 쪽 축소 생존은 pairedRangeShrink 규칙이 허용.
function largeSmall(rng) {
  const n = 2 + rng.int(2);                       // 2~3
  const N = 2 * n + 2 + rng.int(3);               // ≥2n+2 → 공백 2개 이상
  const headers = ["팀명", "승점", "비고"];
  const v = [];                                   // 내림차순 distinct, 간격 1~3(경계값 근접)
  let cur = 60 + rng.int(25);
  for (let i = 0; i < N; i++) { v.push(cur); cur -= 1 + rng.int(3); }
  const arr = new Array(N).fill(null);
  arr[0] = v[N - 1];                              // 첫 행 = 최소값(하위 n) → SMALL 부분$ 제거가 아래 행 기준을 바꿈
  arr[N - 1] = v[n - 1];                          // 마지막 행 = n위(상위 경계) → LARGE 축소가 값 변경
  const rest = v.filter((_, i) => i !== N - 1 && i !== n - 1);
  const s2 = v[N - 1 - n];                        // (n+1)번째로 작은 값 → 3번째 행 이후에 배치
  const slot = 3 + rng.int(N - 4);               // index 3..N-2
  arr[slot] = s2;
  const rest2 = rest.filter((x) => x !== s2);
  const mp = rng.shuffle(Array.from({ length: N }, (_, i) => i).filter((i) => arr[i] == null));
  rng.shuffle(rest2).forEach((val, i) => { arr[mp[i]] = val; });
  const rankOf = (x) => v.indexOf(x) + 1;
  const largeN = v[n - 1], smallN = v[N - n];    // LARGE(,n)·SMALL(,n) 임계값
  let star = 0, circ = 0, blank = 0;
  for (const val of arr) { const r = rankOf(val); if (r <= n) star++; else if (N - r + 1 <= n) circ++; else blank++; }
  if (blank < 2 || star < 1 || circ < 1) throw new Error("결과 분포 부족");
  // partialDollar(시작 $ 제거→접미 범위) 판별: SMALL·LARGE 각각 값이 달라지는 행 1+
  const [hi, lo] = pick(rng, TOPICS.markerPairs);   // 상/하위 표시(★/☆·◆/◇ 제외)
  const cls = arr.map((x) => x >= largeN ? hi : x <= smallN ? lo : "");
  const kth = (suf, k, desc) => { if (suf.length < k) return undefined; return [...suf].sort((a, b) => desc ? b - a : a - b)[k - 1]; };
  const pSmall = arr.map((x, k) => { const sm = kth(arr.slice(k), n, false); return x >= largeN ? hi : (sm !== undefined && x <= sm) ? lo : "ERR"; });
  const pLarge = arr.map((x, k) => { const lg = kth(arr.slice(k), n, true); return (lg !== undefined && x >= lg) ? hi : x <= smallN ? lo : "ERR"; });
  if (!cls.some((c, k) => c !== pSmall[k]) || !cls.some((c, k) => c !== pLarge[k])) throw new Error("부분$ 판별 행 없음");
  const names = rng.sample(TEAM_NAMES, N);   // 팀명 풀(사람 이름 아님)
  const rows = arr.map((val, i) => [names[i], val, null]);
  const g = geom(headers, N), rgA = g.colAbs("승점"), x = g.dataCell("승점", 0);
  return {
    subtype: "B-1", colWidths: [10, 8, 8], headers, rows,
    result: { kind: "fillCol", col: "비고" },
    discriminators: [{ name: `승점 상위${n}위(★)`, test: (r) => r[1] >= largeN, min: n, max: n, allowFixed: "lastRow", reason: "상·하위 경계 행을 첫·마지막에 배치(LARGE/SMALL 범위 축소 판별)" }],
    answer: `=IF(${x}>=LARGE(${rgA},${n}),"${hi}",IF(${x}<=SMALL(${rgA},${n}),"${lo}",""))`,
    functions: { required: ["IF", "LARGE", "SMALL"], candidates: null },
    text: `[{표}]에서 승점[{col:승점}]이 상위 ${n}위 이내이면 "${hi}", 하위 ${n}위 이내이면 "${lo}", 나머지는 공백으로 비고[{R}]에 표시하시오. (8점)`,
    notes: ["IF, LARGE, SMALL 함수 사용"],
    accept: [`=IF(${x}>=LARGE(${g.colRowFixed("승점")},${n}),"${hi}",IF(${x}<=SMALL(${g.colRowFixed("승점")},${n}),"${lo}",""))`],
  };
}

// 2) b1-rank-if [기본]
function rankIf(rng) {
  const N = 7 + rng.int(4); const n = 2 + rng.int(2);
  const headers = ["선수", "총점", "결과"];
  const vals = placeWinners(rng, N, n);
  const names = rng.sample(NAMES, N);
  const rows = vals.map((v, i) => [names[i], v, null]);
  const g = geom(headers, N);
  return {
    subtype: "B-1", colWidths: [10, 8, 8], headers, rows,
    result: { kind: "fillCol", col: "결과" },
    discriminators: [{ name: `총점 ${n}위 이내(진출)`, test: (r) => ([...vals].sort((a, b) => b - a).indexOf(r[1]) + 1) <= n, min: n, max: n, allowFixed: "lastRow", reason: "상위 n위 행을 첫·마지막에 배치(RANK.EQ 범위 축소 판별)" }],
    answer: `=IF(RANK.EQ(${g.dataCell("총점", 0)},${g.colAbs("총점")})<=${n},"진출","")`,
    functions: { required: ["IF", "RANK.EQ"], candidates: null },
    text: `[{표}]에서 총점[{col:총점}]에 대한 순위가 ${n}위 이내이면 "진출", 그 외에는 공백을 결과[{R}]에 표시하시오. (8점)`,
    notes: ["순위는 총점이 가장 높은 것이 1위", "IF, RANK.EQ 함수 사용"],
    accept: [`=IF(RANK.EQ(${g.dataCell("총점", 0)},${g.colAbs("총점")},0)<=${n},"진출","")`],
  };
}

// 3) b1-iferror-choose [어려움]
function iferrorChoose(rng) {
  const N = 7 + rng.int(4);
  const headers = ["이름", "실기점수", "순위판정"];
  const vals = distinctInts(rng, N, 40, 99);
  const sorted = [...vals].sort((a, b) => b - a);
  // row0=1위(금), 마지막=3위(동), 중간에 2위(은)
  const mid = rng.shuffle([sorted[1], ...sorted.slice(3)]);
  const arr = [sorted[0], ...mid, sorted[2]];
  const names = rng.sample(NAMES, N);
  const rows = arr.map((v, i) => [names[i], v, null]);
  const g = geom(headers, N);
  return {
    subtype: "B-1", colWidths: [8, 10, 10], headers, rows,
    result: { kind: "fillCol", col: "순위판정" },
    discriminators: [{ name: "실기점수 3위 이내", test: (r) => ([...arr].sort((a, b) => b - a).indexOf(r[1]) + 1) <= 3, min: 3, max: 3, allowFixed: "lastRow", reason: "1~3위 행을 첫·중간·마지막에 배치(RANK.EQ 범위 축소 판별)" }],
    answer: `=IFERROR(CHOOSE(RANK.EQ(${g.dataCell("실기점수", 0)},${g.colAbs("실기점수")}),"금","은","동"),"")`,
    functions: { required: ["IFERROR", "CHOOSE", "RANK.EQ"], candidates: null },
    text: '[{표}]에서 실기점수[{col:실기점수}]에 대한 순위를 구하여 1위는 "금", 2위는 "은", 3위는 "동", 그 외에는 공백을 순위판정[{R}]에 표시하시오. (8점)',
    notes: ["순위는 실기점수가 가장 높은 것이 1위", "IFERROR, CHOOSE, RANK.EQ 함수 사용"],
    accept: [
      `=IFERROR(CHOOSE(RANK.EQ(${g.dataCell("실기점수", 0)},${g.colAbs("실기점수")},0),"금","은","동"),"")`,
      `=IFERROR(CHOOSE(RANK.EQ(${g.dataCell("실기점수", 0)},${g.colRowFixed("실기점수")}),"금","은","동"),"")`,
    ],
  };
}

// 4) b1-or-rank [어려움]
//  · 1차 순위 정확히 n인 행은 2차 순위 n 초과, 그 반대도. 한쪽만 참 각 1개+, 둘 다 거짓 2개+.
//  · cmpSwap 경계 뒤집힘·partialDollar(접미 범위) 판별 행을 구성으로 보장(엔진 zip 시뮬로 검증).
const descRank = (x, arr) => [...arr].sort((a, b) => b - a).indexOf(x) + 1;
function orRank(rng) {
  const N = 8 + rng.int(3); const n = 3;
  const headers = ["사번", "1차", "2차", "결과"];
  const c1 = distinctInts(rng, N, 40, 99), c2 = distinctInts(rng, N, 40, 99);
  const r1 = c1.map((v) => descRank(v, c1)), r2 = c2.map((v) => descRank(v, c2));
  const pass = c1.map((_, i) => r1[i] <= n || r2[i] <= n);
  // 경계(정확히 n위) 행이 반대쪽 n 초과여야 cmpSwap 이 값으로 잡힌다
  const bnd1 = c1.findIndex((_, i) => r1[i] === n), bnd2 = c1.findIndex((_, i) => r2[i] === n);
  if (bnd1 < 0 || bnd2 < 0) throw new Error("경계 행 없음");
  if (r2[bnd1] <= n || r1[bnd2] <= n) throw new Error("경계 행이 양쪽 참");
  // 한쪽만 참 각 1+, 둘 다 거짓 2+
  const only1 = c1.filter((_, i) => r1[i] <= n && r2[i] > n).length;
  const only2 = c1.filter((_, i) => r2[i] <= n && r1[i] > n).length;
  const none = c1.filter((_, i) => !pass[i]).length;
  if (only1 < 1 || only2 < 1 || none < 2) throw new Error("분포 부족");
  // partialDollar: 접미 범위(C(3+k):C_end)로 순위가 바뀌어 OR 결과가 달라지는 행이 각 조건 1+
  const shift1 = c1.map((_, k) => (descRank(c1[k], c1.slice(k)) <= n) || r2[k] <= n);
  const shift2 = c1.map((_, k) => r1[k] <= n || (descRank(c2[k], c2.slice(k)) <= n));
  if (!pass.some((p, k) => p !== shift1[k]) || !pass.some((p, k) => p !== shift2[k])) throw new Error("부분$ 판별 행 없음");
  const sabun = Array.from({ length: N }, (_, i) => "S" + String(101 + i));
  const rows = sabun.map((s, i) => [s, c1[i], c2[i], null]);
  const g = geom(headers, N), x1 = g.dataCell("1차", 0), x2 = g.dataCell("2차", 0), R1 = g.colAbs("1차"), R2 = g.colAbs("2차");
  const passL = pick(rng, TOPICS.passLabel);        // "통과" 대체
  return {
    subtype: "B-1", colWidths: [8, 6, 6, 8], headers, rows, codeColumns: ["사번"],
    result: { kind: "fillCol", col: "결과" },
    discriminators: [{ name: `1차·2차 ${n}위 이내(${passL})`, test: (r) => (descRank(r[1], c1) <= n || descRank(r[2], c2) <= n), min: 1, max: N }],
    answer: `=IF(OR(RANK.EQ(${x1},${R1})<=${n},RANK.EQ(${x2},${R2})<=${n}),"${passL}","")`,
    functions: { required: ["IF", "OR", "RANK.EQ"], candidates: null },
    text: `[{표}]에서 1차[{col:1차}]의 순위가 ${n}위 이내이거나 2차[{col:2차}]의 순위가 ${n}위 이내이면 "${passL}", 그 외에는 공백을 결과[{R}]에 표시하시오. (8점)`,
    notes: ["순위는 점수가 가장 높은 것이 1위", "IF, OR, RANK.EQ 함수 사용"],
    accept: [`=IF(OR(RANK.EQ(${x1},${R1},0)<=${n},RANK.EQ(${x2},${R2},0)<=${n}),"${passL}","")`],
  };
}

// 5) b1-iferror-rank-asc [어려움] — 오름차순, 빈 기록 1건
function iferrorRankAsc(rng) {
  const N = 8 + rng.int(3);
  const KREC = "기록";                    // 머리글은 "기록"(z "0.00"으로 초 단위 표시)
  const headers = ["선수", KREC, "순위"];
  // 기록은 초 단위 소수 2자리(11.00~15.99), 동점 없음. 빈 기록 1건 제외.
  const cents = new Set(); let g0 = 0;
  while (cents.size < N - 1 && g0++ < 800) cents.add(1100 + rng.int(500));
  const vals = [...cents].map((c) => c / 100);
  const names = rng.sample(NAMES, N);
  const blankAt = 1 + rng.int(N - 2);   // 빈 기록은 첫·마지막이 아닌 중간
  const rows = []; let vi = 0;
  // 빈 기록은 빈 문자열(셀 역할 유지). RANK.EQ("") → #N/A → IFERROR "실격"
  for (let i = 0; i < N; i++) rows.push([names[i], i === blankAt ? "" : vals[vi++], null]);
  const g = geom(headers, N);
  return {
    subtype: "B-1", colWidths: [10, 10, 8], headers, rows, colZ: { 1: "0.00" }, verbException: "표시",
    result: { kind: "fillCol", col: "순위" },
    discriminators: [{ name: "빈 기록(실격)", test: (r) => r[1] === "" || r[1] == null, min: 1, max: 1 }],
    answer: `=IFERROR(RANK.EQ(${g.dataCell(KREC, 0)},${g.colAbs(KREC)},1),"실격")`,
    functions: { required: ["IFERROR", "RANK.EQ"], candidates: null },
    text: `[{표}]에서 기록[{col:${KREC}}]에 대한 순위를 구하여 순위[{R}]에 표시하시오. (8점)`,
    notes: ["순위는 기록이 가장 빠른 것이 1위", '기록이 비어 있는 경우 "실격"으로 표시', "IFERROR, RANK.EQ 함수 사용"],
    accept: [],
  };
}

export const TEMPLATE_B1 = {
  subtype: "B-1",
  variants: [
    { id: "b1-large-small", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["LARGE", "SMALL"], plan: largeSmall },
    { id: "b1-rank-if", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["RANK.EQ"], plan: rankIf },
    { id: "b1-iferror-choose", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["RANK.EQ", "CHOOSE"], plan: iferrorChoose },
    { id: "b1-or-rank", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["RANK.EQ"], plan: orRank },
    { id: "b1-iferror-rank-asc", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["RANK.EQ"], plan: iferrorRankAsc },
  ],
};
