// src/data/exam/calc/templates/C-2.js
// 근사 일치 구간표 (HLOOKUP + AVERAGE/RANK.EQ). 변형 3개. 모두 열 채우기.
import { NAMES, PRODUCTS, PRODUCT_PRICE } from "../pools.js";
import { TOPICS, pick } from "../topics.js";
import { geom, josa } from "./_util.js";

const distinctInts = (rng, n, lo, hi, unit = 1) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 900) { const v = (lo + rng.int(Math.floor((hi - lo) / unit) + 1)) * unit; if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };
const round1k = (x) => Math.round(x / 1000) * 1000;

// 1) c2-hlookup-avg [기본] — HLOOKUP(AVERAGE(중간,기말),$학점기준표,2)
function c2HlookupAvg(rng) {
  const N = 7 + rng.int(3);
  const B = pick(rng, TOPICS.band5);                  // 주제 묶음(표 이름·5등급·열 이름)
  const headers = [B.first, B.c1, B.c2, B.cR];
  // 구간 하한(오름차순): 첫 구간 0, 나머지는 기출 조합(0/60/70/80/90) 과 겹치지 않게 시드로
  const keys = [0, 50 + rng.int(6), 62 + rng.int(5), 72 + rng.int(5), 84 + rng.int(5)];
  const cl = (x) => Math.max(45, Math.min(98, x));
  const K1 = keys[1 + rng.int(4)], a1 = rng.range(-6, 6);
  const K2 = keys[1 + rng.int(4)], b1 = rng.range(-6, 6);
  const x = 46 + 2 * rng.int(20);
  const seed = [
    ["", cl(K1 + a1), cl(K1 - a1)],                  // 평균 정확히 기준값 K1
    ["", cl(K2 - 1 + b1), cl(K2 - 1 - b1)],          // 기준값 K2 바로 아래(평균 K2-1)
    ["", x, x + 1],                                   // 평균 비정수(x+0.5)
  ];
  const fill = Array.from({ length: N - 3 }, () => ["", 45 + rng.int(53), 45 + rng.int(53)]);
  const rows = rng.shuffle([...seed, ...fill]);       // 위치 무작위
  const avg = (r) => (r[1] + r[2]) / 2;
  const grade = (v) => { let i = 0; for (let k = 0; k < keys.length; k++) if (v >= keys[k]) i = k; return B.grades[i]; };
  const grades = rows.map((r) => grade(avg(r)));
  if (new Set(grades).size < 2) throw new Error("등급 단일");
  if (!rows.some((r) => avg(r) !== Math.round(avg(r)) || !keys.includes(avg(r)))) throw new Error("근사 판별 행 없음");
  // refShift(첫 인수 B→C=r2 단독 / 둘째 C→결과열=r1 단독) 가 값으로 잡히도록 등급이 달라지는 행 각각 보장
  if (!rows.some((r) => grade(r[2]) !== grade(avg(r))) || !rows.some((r) => grade(r[1]) !== grade(avg(r)))) throw new Error("refShift 무영향");
  const names = rng.sample(NAMES, N); rows.forEach((r, i) => (r[0] = names[i]));
  const g = geom(headers, N), T = g.refRangeAbs(true, 1, keys.length, true);
  return {
    subtype: "C-2", colWidths: [8, 8, 8, 6], headers, rows, _topic: { pool: "band5", id: B.name },
    result: { kind: "fillCol", col: B.cR },
    discriminators: [{ name: "평균 정수(기준 근처)", test: (r) => (r[1] + r[2]) % 2 === 0, min: 1, max: N }],
    refTable: { name: B.name, rowLabels: ["점수", B.cR], headers: keys, rows: [B.grades], rowOffset: 0 },
    answer: `=HLOOKUP(AVERAGE(${g.dataCell(B.c1, 0)},${g.dataCell(B.c2, 0)}),${T},2)`,
    functions: { required: ["AVERAGE", "HLOOKUP"], candidates: null },
    text: `[{표}]에서 ${B.c1}[{col:${B.c1}}], ${B.c2}[{col:${B.c2}}]${josa(B.c2, "과/와")} ${B.name}[{T}]${josa(B.name, "을/를")} 이용하여 ${B.cR}[{R}]${josa(B.cR, "을/를")} 표시하시오. (8점)`,
    notes: [`평균은 각 ${B.first}의 ${B.c1}${josa(B.c1, "과/와")} ${B.c2}${josa(B.c2, "으로/로")} 구함`, "AVERAGE, HLOOKUP 함수 사용"],
    accept: [`=HLOOKUP(AVERAGE(${g.dataCell(B.c1, 0)},${g.dataCell(B.c2, 0)}),${T},2,TRUE)`],
  };
}

// 2) c2-discount [어려움] — 판매량*가격*(1-HLOOKUP(판매량,$할인율표,2,1))
function c2Discount(rng) {
  const N = 7 + rng.int(3);
  const headers = ["상품", "판매량", "가격", "판매액"];
  const k1 = 30 + rng.int(15), k2 = k1 + 15 + rng.int(10), k3 = k2 + 15 + rng.int(10);
  const keys = [0, k1, k2, k3];                       // 판매량 하한 오름차순, 시드화
  if (keys.join("/") === "0/40/60/80") throw new Error("기출 할인율 구간(0/40/60/80) 회피");
  const disc = [0, 0.05, 0.1, 0.15];                 // 0% 구간 포함
  const prods = rng.sample(PRODUCTS, N > PRODUCTS.length ? PRODUCTS.length : N);
  const q0 = [k1, k2 - 1];                             // 기준값과 정확히 같은 값·바로 아래 값
  const used = new Set(q0);
  while (q0.length < N) { const q = 5 + rng.int(k3 + 20); if (!used.has(q)) { used.add(q); q0.push(q); } }
  const 판매량 = rng.shuffle(q0);                       // 기준값 행 위치 분산
  if (!판매량.some((q) => !keys.includes(q))) throw new Error("정확일치만"); // 근사 판별(정확일치 실패 행)
  const rows = 판매량.map((q, i) => [prods[i % prods.length], q, round1k(PRODUCT_PRICE[prods[i % prods.length]][0] + rng.int(20000)), null]);
  const g = geom(headers, N), T = g.refRangeAbs(true, 1, keys.length, true);
  return {
    subtype: "C-2", colWidths: [8, 6, 8, 10], headers, rows, colZ: { 2: "#,##0" },
    result: { kind: "fillCol", col: "판매액", z: "#,##0" },
    discriminators: [{ name: "판매량=구간 기준값", test: (r) => r[1] === k1, min: 1, max: N }],
    refTable: { name: "할인율표", rowLabels: ["판매량", "할인율"], z: "0%", headers: keys, rows: [disc], rowOffset: 0 },
    answer: `=${g.dataCell("판매량", 0)}*${g.dataCell("가격", 0)}*(1-HLOOKUP(${g.dataCell("판매량", 0)},${T},2,1))`,
    functions: { required: ["HLOOKUP"], candidates: null },
    text: "[{표}]에서 판매량[{col:판매량}], 가격[{col:가격}]과 할인율표[{T}]를 이용하여 판매액[{R}]을 계산하시오. (8점)",
    notes: ["판매액 = 판매량 * 가격 * (1 - 할인율)", "HLOOKUP 함수 사용"],
    accept: [`=${g.dataCell("판매량", 0)}*${g.dataCell("가격", 0)}*(1-HLOOKUP(${g.dataCell("판매량", 0)},${T},2,TRUE))`],
  };
}

// 3) c2-rank-band [어려움] — HLOOKUP(RANK.EQ(x,$r),$등급표,2) (후보형)
function c2RankBand(rng) {
  const N = 8 + rng.int(3);
  const B = pick(rng, TOPICS.band4);                  // 주제 묶음(표 이름·4등급·금액 열)
  const headers = [B.first, B.amt, B.cR];
  // 순위 하한(오름차순): 기출 조합(1/3/5/7·1/4/6/8) 과 겹치지 않게 시드로
  const keys = [1, 2 + rng.int(2), 5 + rng.int(2), 7 + rng.int(2)];
  if (keys[1] === 3 && keys[2] === 5 && keys[3] === 7) keys[3] = 8; // 1/3/5/7 회피
  const total = distinctInts(rng, N, 100, 990, 1).map((x) => x * 10000); // 1,000,000~9,900,000 천원단위·동점 없음
  const names = rng.sample(NAMES, N);
  const rows = total.map((v, i) => [names[i], v, null]);
  const g = geom(headers, N), rA = g.colAbs(B.amt), T = g.refRangeAbs(true, 1, keys.length, true);
  return {
    subtype: "C-2", colWidths: [8, 10, 8], headers, rows, colZ: { 1: "#,##0" }, _topic: { pool: "band4", id: B.name },
    result: { kind: "fillCol", col: B.cR },
    discriminators: [{ name: `${B.amt} 1위`, test: (r) => r[1] === Math.max(...total), min: 1, max: 1 }],
    refTable: { name: B.name, rowLabels: ["순위", B.cR], headers: keys, rows: [B.grades], rowOffset: 0 },
    answer: `=HLOOKUP(RANK.EQ(${g.dataCell(B.amt, 0)},${rA}),${T},2)`,
    functions: { required: [], candidates: ["VLOOKUP", "HLOOKUP", "RANK.EQ", "LARGE"] },
    text: `[{표}]에서 ${B.amt}[{col:${B.amt}}]${josa(B.amt, "과/와")} ${B.name}[{T}]${josa(B.name, "을/를")} 이용하여 ${B.cR}[{R}]${josa(B.cR, "을/를")} 표시하시오. (8점)`,
    notes: [`순위는 ${B.amt}${josa(B.amt, "이/가")} 가장 많은 것이 1위`, "VLOOKUP, HLOOKUP, RANK.EQ, LARGE 함수 중 알맞은 함수들을 선택하여 사용"],
    accept: [`=HLOOKUP(RANK.EQ(${g.dataCell(B.amt, 0)},${rA},0),${T},2)`],
  };
}

export const TEMPLATE_C2 = {
  subtype: "C-2",
  variants: [
    { id: "c2-hlookup-avg", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["HLOOKUP"], plan: c2HlookupAvg },
    { id: "c2-discount", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["HLOOKUP"], plan: c2Discount },
    { id: "c2-rank-band", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["HLOOKUP", "RANK.EQ"], plan: c2RankBand },
  ],
};
