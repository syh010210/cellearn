// src/data/exam/calc/templates/C-2.js
// 근사 일치 구간표 (HLOOKUP + AVERAGE/RANK.EQ). 변형 3개. 모두 열 채우기.
import { NAMES, PRODUCTS, PRODUCT_PRICE, BAND_GRADES, HAKJEOM } from "../pools.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi, unit = 1) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 900) { const v = (lo + rng.int(Math.floor((hi - lo) / unit) + 1)) * unit; if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };
const round1k = (x) => Math.round(x / 1000) * 1000;

// 1) c2-hlookup-avg [기본] — HLOOKUP(AVERAGE(중간,기말),$학점기준표,2)
function c2HlookupAvg(rng) {
  const N = 7 + rng.int(3);
  const headers = ["학생", "중간고사", "기말고사", "학점"];
  const keys = [0, 60, 70, 80, 90];                  // 학점 기준값 고정
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
  const grade = (v) => { let i = 0; for (let k = 0; k < keys.length; k++) if (v >= keys[k]) i = k; return HAKJEOM[i]; };
  const grades = rows.map((r) => grade(avg(r)));
  if (new Set(grades).size < 2) throw new Error("학점 단일");
  if (!rows.some((r) => avg(r) !== Math.round(avg(r)) || !keys.includes(avg(r)))) throw new Error("근사 판별 행 없음");
  const names = rng.sample(NAMES, N); rows.forEach((r, i) => (r[0] = names[i]));
  const g = geom(headers, N), T = g.refRangeAbs(true, 1, keys.length, true);
  return {
    subtype: "C-2", colWidths: [8, 8, 8, 6], headers, rows,
    result: { kind: "fillCol", col: "학점" },
    discriminators: [{ name: "평균 정수(기준 근처)", test: (r) => (r[1] + r[2]) % 2 === 0, min: 1, max: N }],
    refTable: { name: "학점기준표", rowLabels: ["점수", "학점"], headers: keys, rows: [HAKJEOM], rowOffset: 0 },
    answer: `=HLOOKUP(AVERAGE(${g.dataCell("중간고사", 0)},${g.dataCell("기말고사", 0)}),${T},2)`,
    functions: { required: ["AVERAGE", "HLOOKUP"], candidates: null },
    text: "[{표}]에서 중간고사[{col:중간고사}], 기말고사[{col:기말고사}]와 학점기준표[{T}]를 이용하여 학점[{R}]을 표시하시오. (8점)",
    notes: ["평균은 각 학생의 중간고사와 기말고사로 구함", "AVERAGE, HLOOKUP 함수 사용"],
    accept: [`=HLOOKUP(AVERAGE(${g.dataCell("중간고사", 0)},${g.dataCell("기말고사", 0)}),${T},2,TRUE)`],
  };
}

// 2) c2-discount [어려움] — 판매량*가격*(1-HLOOKUP(판매량,$할인율표,2,1))
function c2Discount(rng) {
  const N = 7 + rng.int(3);
  const headers = ["상품", "판매량", "가격", "판매액"];
  const k1 = 30 + rng.int(15), k2 = k1 + 15 + rng.int(10), k3 = k2 + 15 + rng.int(10);
  const keys = [0, k1, k2, k3];                       // 판매량 하한 오름차순, 시드화
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
  const headers = ["고객", "구입총액", "등급"];
  const keys = [1, 3, 5, 7];
  const total = distinctInts(rng, N, 100, 990, 1).map((x) => x * 10000); // 1,000,000~9,900,000 천원단위·동점 없음
  const names = rng.sample(NAMES, N);
  const rows = total.map((v, i) => [names[i], v, null]);
  const g = geom(headers, N), rA = g.colAbs("구입총액"), T = g.refRangeAbs(true, 1, keys.length, true);
  return {
    subtype: "C-2", colWidths: [8, 10, 8], headers, rows, colZ: { 1: "#,##0" },
    result: { kind: "fillCol", col: "등급" },
    discriminators: [{ name: "구입총액 1위", test: (r) => r[1] === Math.max(...total), min: 1, max: 1 }],
    refTable: { name: "등급표", rowLabels: ["순위", "등급"], headers: keys, rows: [BAND_GRADES], rowOffset: 0 },
    answer: `=HLOOKUP(RANK.EQ(${g.dataCell("구입총액", 0)},${rA}),${T},2)`,
    functions: { required: [], candidates: ["VLOOKUP", "HLOOKUP", "RANK.EQ", "LARGE"] },
    text: "[{표}]에서 구입총액[{col:구입총액}]과 등급표[{T}]를 이용하여 등급[{R}]을 표시하시오. (8점)",
    notes: ["순위는 구입총액이 가장 많은 것이 1위", "VLOOKUP, HLOOKUP, RANK.EQ, LARGE 함수 중 알맞은 함수들을 선택하여 사용"],
    accept: [`=HLOOKUP(RANK.EQ(${g.dataCell("구입총액", 0)},${rA},0),${T},2)`],
  };
}

export const TEMPLATE_C2 = {
  subtype: "C-2",
  variants: [
    { id: "c2-hlookup-avg", difficulty: "기본", plan: c2HlookupAvg },
    { id: "c2-discount", difficulty: "어려움", plan: c2Discount },
    { id: "c2-rank-band", difficulty: "어려움", plan: c2RankBand },
  ],
};
