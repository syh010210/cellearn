// src/data/exam/calc/templates/C-1.js
// 참조표 정확 일치 찾기 (HLOOKUP/VLOOKUP + 문자 추출·결합·산식·IFERROR). 변형 4개. 열 채우기.
import { NAMES, DEPT_CODES, PRODUCTS, PRODUCT_PRICE, REGIONS } from "../pools.js";
import { geom } from "./_util.js";

const distinctInts = (rng, n, lo, hi) => { const s = new Set(); let g = 0; while (s.size < n && g++ < 500) s.add(rng.range(lo, hi)); return [...s]; };
const round1k = (x) => Math.round(x / 1000) * 1000;
// 서로 다른 값이 되도록 천 원 단위로 뽑기
function distinctThousands(rng, gen, n) { const out = [], seen = new Set(); let g = 0; while (out.length < n && g++ < 200) { const v = round1k(gen()); if (!seen.has(v)) { seen.add(v); out.push(v); } } if (out.length < n) throw new Error("가격 중복"); return out; }
const isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v);
const notSorted = (rng, arr) => { for (let k = 0; k < 8; k++) { const s = rng.shuffle(arr); if (!isSorted(s)) return s; } const s = arr.slice().reverse(); return isSorted(s) ? arr.slice() : s; };

// 1) c1-vlookup-left [기본] — 세로 참조표(이름 행 없음 → 시작행 확장 불가)
function vlookupLeft(rng) {
  const N = 6 + rng.int(4);
  const K = 3 + rng.int(2);                      // 참조표 코드 3~4
  const codes = rng.sample(DEPT_CODES, K);
  const headers = ["학번", "이름", "학과"];
  // 각 코드가 최소 1회 등장하도록 학번 배치
  const codeSeq = []; for (let i = 0; i < N; i++) codeSeq.push(codes[i < K ? i : rng.int(K)]);
  const seq = rng.shuffle(codeSeq);
  const used = new Set();
  const hakbun = seq.map((c) => { let s; do { s = c.code + String(101 + rng.int(899)); } while (used.has(s)); used.add(s); return s; });
  const names = rng.sample(NAMES, N);
  const rows = hakbun.map((h, i) => [h, names[i], null]);
  const refCodes = notSorted(rng, codes.map((c) => c.code));   // 근사 일치와 갈리도록 정렬 아님
  const refRows = refCodes.map((cd) => [cd, codes.find((c) => c.code === cd).name]);
  const g = geom(headers, N);
  const T = g.refRangeAbs(true, refRows.length, 2);            // 이름 라벨 행 + 머리글(코드/학과) 정렬
  return {
    subtype: "C-1", colWidths: [8, 8, 12], headers, rows, codeColumns: ["학번"],
    result: { kind: "fillCol", col: "학과" },
    refTable: { name: "학과기준표", headers: ["코드", "학과"], rows: refRows, rowOffset: 0 },
    discriminators: [{ name: "학번 앞2=참조표 첫 코드", test: (r) => String(r[0]).slice(0, 2) === codes[0].code, min: 1, max: N }],
    answer: `=VLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,0)`,
    functions: { required: ["VLOOKUP", "LEFT"], candidates: null },
    text: "[{표}]에서 학번[{col:학번}]의 앞 두 글자와 학과기준표[{T}]를 이용하여 학과[{R}]를 표시하시오. (8점)",
    notes: ["학번의 앞 두 글자가 학과코드임", "VLOOKUP, LEFT 함수 사용"],
    accept: [
      `=VLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,FALSE)`,
      `=VLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,)`,
    ],
  };
}

// 2) c1-hlookup-mul [기본] — 가로 단가표, 산식 = 수량 * 단가
function hlookupMul(rng) {
  const N = 6 + rng.int(4);
  const K = 4 + rng.int(2);
  const prods = rng.sample(PRODUCTS, K);
  const headers = ["상품", "수량", "금액"];
  const seq = rng.shuffle([...prods, ...Array.from({ length: N - K }, () => rng.pick(prods))]);
  const qty = Array.from({ length: N }, () => 2 + rng.int(8));    // 수량 1 없음
  const rows = seq.map((p, i) => [p, qty[i], null]);
  const refKeys = notSorted(rng, prods);
  // 상품별 가격 범위에서 천 원 단위로, 서로 다르게
  const seen = new Set(); const priceOf = {};
  for (const p of prods) { const [lo, hi] = PRODUCT_PRICE[p]; let v, g = 0; do { v = round1k(lo + rng.int(hi - lo + 1)); } while (seen.has(v) && g++ < 80); seen.add(v); priceOf[p] = v; }
  const g = geom(headers, N);
  const T = g.refRangeAbs(true, 1, K, true);                       // 라벨 열(상품/단가) 제외
  return {
    subtype: "C-1", colWidths: [10, 6, 10], headers, rows,
    result: { kind: "fillCol", col: "금액", z: "#,##0" },
    refTable: { name: "단가표", rowLabels: ["상품", "단가"], z: "#,##0", headers: refKeys, rows: [refKeys.map((p) => priceOf[p])], rowOffset: 0 },
    discriminators: [{ name: "상품=참조표 첫 항목", test: (r) => r[0] === prods[0], min: 1, max: N }],
    answer: `=${g.dataCell("수량", 0)}*HLOOKUP(${g.dataCell("상품", 0)},${T},2,0)`,
    functions: { required: ["HLOOKUP"], candidates: null },
    text: "[{표}]에서 상품[{col:상품}], 수량[{col:수량}]과 단가표[{T}]를 이용하여 금액[{R}]을 계산하시오. (8점)",
    notes: ["금액 = 수량 * 단가", "HLOOKUP 함수 사용"],
    accept: [
      `=HLOOKUP(${g.dataCell("상품", 0)},${T},2,FALSE)*${g.dataCell("수량", 0)}`,
      `=${g.dataCell("수량", 0)}*HLOOKUP(${g.dataCell("상품", 0)},${T},2,)`,
    ],
  };
}

// 3) c1-iferror-hlookup-left [어려움] — 없는 키 1건(정렬 사이), IFERROR
function iferrorHlookupLeft(rng) {
  const N = 6 + rng.int(4);
  // 정렬 시 사이에 빈틈이 있는 코드 집합 선택
  const allCodes = DEPT_CODES.map((c) => c.code).sort();
  let present, missing;
  for (let t = 0; t < 20; t++) {
    const pick = rng.sample(DEPT_CODES, 3 + rng.int(2)).map((c) => c.code).sort();
    const cand = allCodes.filter((c) => c > pick[0] && c < pick[pick.length - 1] && !pick.includes(c));
    if (cand.length) { present = pick; missing = rng.pick(cand); break; }
  }
  if (!present) throw new Error("사이 코드 없음");
  const headers = ["학번", "이름", "학과"];
  const nameOf = (cd) => DEPT_CODES.find((c) => c.code === cd)?.name || "미상";
  // 각 present 코드 1회 이상 + 없는 코드(missing) 1건
  const codeSeq = [...present];
  while (codeSeq.length < N - 1) codeSeq.push(rng.pick(present));
  codeSeq.push(missing);
  const seq = rng.shuffle(codeSeq);
  const used = new Set();
  const hakbun = seq.map((c) => { let s; do { s = c + String(101 + rng.int(899)); } while (used.has(s)); used.add(s); return s; });
  const names = rng.sample(NAMES, N);
  const rows = hakbun.map((h, i) => [h, names[i], null]);
  const refKeys = notSorted(rng, present);
  const g = geom(headers, N);
  const T = g.refRangeAbs(true, 1, present.length, true);        // 라벨 열(학과코드/학과명) 제외
  return {
    subtype: "C-1", colWidths: [8, 8, 12], headers, rows, codeColumns: ["학번"],
    result: { kind: "fillCol", col: "학과" },
    refTable: { name: "학과기준표", rowLabels: ["학과코드", "학과명"], headers: refKeys, rows: [refKeys.map(nameOf)], rowOffset: 0 },
    discriminators: [{ name: "미존재 코드(오류→확인)", test: (r) => String(r[0]).slice(0, 2) === missing, min: 1, max: 1 }],
    answer: `=IFERROR(HLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,0),"확인")`,
    functions: { required: ["IFERROR", "HLOOKUP", "LEFT"], candidates: null },
    text: "[{표}]에서 학번[{col:학번}]의 앞 두 글자와 학과기준표[{T}]를 이용하여 학과[{R}]를 표시하시오. (8점)",
    notes: ["학번의 앞 두 글자가 학과코드임", '단, 오류발생시 학과에 "확인"으로 표시', "IFERROR, HLOOKUP, LEFT 함수 사용"],
    accept: [
      `=IFERROR(HLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,FALSE),"확인")`,
      `=IFERROR(HLOOKUP(LEFT(${g.dataCell("학번", 0)},2),${T},2,),"확인")`,
    ],
  };
}

// 4) c1-hlookup-concat [어려움] — 지점 & 코드 끝 글자, 3행 단가표(원가·판매가)
function hlookupConcat(rng) {
  const N = 6 + rng.int(4);
  const branches = rng.sample(REGIONS, 2);
  const tags = ["T", "S"];
  const combos = [];
  for (const b of branches) for (const t of tags) combos.push({ key: b + t, b, t });
  const headers = ["지점", "코드", "수량", "금액"];
  const seq = rng.shuffle([...combos, ...Array.from({ length: N - combos.length }, () => rng.pick(combos))]).slice(0, N);
  const used = new Set();
  const rows = seq.map((c) => {
    let code; do { code = "P" + String(100 + rng.int(900)) + c.t; } while (used.has(code)); used.add(code);
    return [c.b, code, 2 + rng.int(8), null];
  });
  // 제품 기준가를 먼저 뽑고 지점(조합)별 ±20% 변동, 천 원 단위. 매입가 = 판매가의 60~80%.
  const base = round1k(100000 + rng.int(500000));
  const prices = distinctThousands(rng, () => base * (0.8 + rng.next() * 0.4), combos.length);
  const priceOf = Object.fromEntries(combos.map((c, i) => [c.key, prices[i]]));
  const costOf = Object.fromEntries(combos.map((c) => [c.key, round1k(priceOf[c.key] * (0.6 + rng.next() * 0.2))]));
  // 참조표 안 같은 값 금지(매입가·판매가 전부 서로 다름)
  const allVals = [...Object.values(costOf), ...Object.values(priceOf)];
  if (new Set(allVals).size !== allVals.length) throw new Error("참조표 값 중복");
  const refKeys = notSorted(rng, combos.map((c) => c.key));
  const g = geom(headers, N);
  const T = g.refRangeAbs(true, 2, combos.length, true);        // 라벨 열(구분/매입가/판매가) 제외
  return {
    subtype: "C-1", colWidths: [6, 8, 6, 10], headers, rows, codeColumns: ["코드"],
    result: { kind: "fillCol", col: "금액", z: "#,##0" },
    refTable: { name: "제품가격표", rowLabels: ["구분", "매입가", "판매가"], z: "#,##0", headers: refKeys, rows: [refKeys.map((k) => costOf[k]), refKeys.map((k) => priceOf[k])], rowOffset: 0 },
    discriminators: [{ name: "지점=첫 지점", test: (r) => r[0] === branches[0], min: 1, max: N }],
    answer: `=${g.dataCell("수량", 0)}*HLOOKUP(${g.dataCell("지점", 0)}&RIGHT(${g.dataCell("코드", 0)},1),${T},3,FALSE)`,
    functions: { required: ["HLOOKUP", "RIGHT"], candidates: null },
    text: "[{표}]에서 지점[{col:지점}], 코드[{col:코드}]의 마지막 한 글자, 수량[{col:수량}]과 제품가격표[{T}]를 이용하여 금액[{R}]을 계산하시오. (8점)",
    notes: ["금액 = 수량 * 판매가", "HLOOKUP, RIGHT 함수와 & 연산자 사용"],
    accept: [
      `=HLOOKUP(${g.dataCell("지점", 0)}&RIGHT(${g.dataCell("코드", 0)},1),${T},3,FALSE)*${g.dataCell("수량", 0)}`,
      `=${g.dataCell("수량", 0)}*HLOOKUP(${g.dataCell("지점", 0)}&RIGHT(${g.dataCell("코드", 0)},1),${T},3,0)`,
    ],
  };
}

export const TEMPLATE_C1 = {
  subtype: "C-1",
  variants: [
    { id: "c1-vlookup-left", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["VLOOKUP"], plan: vlookupLeft },
    { id: "c1-hlookup-mul", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["HLOOKUP"], plan: hlookupMul },
    { id: "c1-iferror-hlookup-left", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["HLOOKUP"], plan: iferrorHlookupLeft },
    { id: "c1-hlookup-concat", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["HLOOKUP"], plan: hlookupConcat },
  ],
};
