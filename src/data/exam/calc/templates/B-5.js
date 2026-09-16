// src/data/exam/calc/templates/B-5.js
// IF 판정 — AND/OR + 평균 비교 (값 비교형). 변형 2개. 모두 열 채우기.
//  answer: =IF(op(x>=k, y>AVERAGE($y범위)), 참, 거짓)
//  값 생성 → 평균 기준 분류 → 조건 열 x 를 역배치해서 각 mutant(경계·평균축소·조건 제거·refShift)를 값으로 잡는다.
import { NAMES } from "../pools.js";
import { geom, assertFillColClean } from "./_util.js";

const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const distinctThousands = (rng, n, loK, hiK) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 900) { const v = (loK + rng.int(hiK - loK + 1)) * 1000; if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };

// op: "AND"|"OR". needB = 경계 행에서 필요한 cond2(y>평균) 상태.
function b5Build(rng, { op, headers, xCol, yCol, resCol, kBase, kStep, kSpan, trueLabel, falseLabel, colWidths, note, colZy }) {
  const N = 9 + rng.int(2);
  const k = kBase + kStep * rng.int(kSpan);
  const needB = op === "AND";
  // y: 마지막 값을 극단적으로 크게 → 평균과 평균'(마지막 제외)의 간격을 넓혀 flip 행 확보
  const y = distinctThousands(rng, N - 1, 100, 600);
  y.push((820 + rng.int(150)) * 1000);                 // 마지막 = 극단 고값
  const avg = mean(y), avgP = mean(y.slice(0, -1));     // avgP < avg
  const c2 = y.map((v) => v > avg), c2p = y.map((v) => v > avgP);
  const flip = y.map((_, i) => c2[i] !== c2p[i]);       // 평균축소 시 cond2 바뀌는 행
  const idx = { t: [], f: [], flip: [] };
  y.forEach((_, i) => { (c2[i] ? idx.t : idx.f).push(i); if (flip[i]) idx.flip.push(i); });
  // 배치에 필요한 풀 확인
  const bPool = needB ? idx.t : idx.f;                  // 경계 행 후보(cond2 == needB)
  if (bPool.length < 2 || idx.t.length < 1 || idx.f.length < 1 || idx.flip.length < 1) throw new Error("풀 부족");
  const x = new Array(N).fill(null);
  const take = (arr, cond) => { for (const i of arr) if (x[i] === null && cond(i)) { return i; } return -1; };
  // 경계 두 행: x=k, x=k-1 (cond2 == needB)
  const b0 = bPool[0], b1 = bPool[1]; x[b0] = k; x[b1] = k - 1;
  // 조건 제거 catch / refShift catch
  let need = [];
  if (op === "AND") {
    // drop-cond2: x>=k & cond2 false ; refShift(x→y): x<k & cond2 true ; flip: x>=k
    const rf = take(idx.f, (i) => true); if (rf < 0) throw new Error("AND drop 풀"); x[rf] = k + 1 + rng.int(30);
    const rr = take(idx.t, (i) => true); if (rr < 0) throw new Error("AND refShift 풀"); x[rr] = k - 1 - rng.int(30 < k ? 30 : k - 1);
    const rp = take(idx.flip, (i) => true); if (rp < 0) throw new Error("AND flip 풀"); x[rp] = k + 1 + rng.int(30);
  } else {
    // drop-cond2: x<k & cond2 true ; flip: x<k. (refShift x→y 는 항상 잡힘)
    const rr = take(idx.t, (i) => true); if (rr < 0) throw new Error("OR drop 풀"); x[rr] = k - 1 - rng.int(30 < k ? 30 : k - 1);
    const rp = take(idx.flip, (i) => true); if (rp < 0) throw new Error("OR flip 풀"); x[rp] = k - 1 - rng.int(30 < k ? 30 : k - 1);
  }
  // 나머지 x: k 부근을 피해 골고루(경계 mutant 오염 방지: k, k±1 금지)
  for (let i = 0; i < N; i++) if (x[i] === null) { let v; do { v = k - 40 + rng.int(90); } while (Math.abs(v - k) <= 1); x[i] = v; }
  const res = y.map((v, i) => ((op === "AND") ? (x[i] >= k && c2[i]) : (x[i] >= k || c2[i])) ? trueLabel : falseLabel);
  if (new Set(res).size < 2) throw new Error("결과 단일");
  const names = rng.sample(NAMES, N);
  const rows = y.map((v, i) => [names[i], x[i], v, null]);
  const g = geom(headers, N), xc = g.dataCell(xCol, 0), yc = g.dataCell(yCol, 0), yA = g.colAbs(yCol);
  const answer = `=IF(${op}(${xc}>=${k},${yc}>AVERAGE(${yA})),"${trueLabel}","${falseLabel}")`;
  const spec = {
    subtype: "B-5", colWidths, headers, rows, colZ: { 2: colZy },
    result: { kind: "fillCol", col: resCol },
    answer,
    functions: { required: ["IF", op, "AVERAGE"], candidates: null },
    text: note(xCol, yCol, k, trueLabel, falseLabel, resCol),
    notes: [`IF, ${op}, AVERAGE 함수 사용`],
    accept: [`=IF(${op}(${xc}>=${k},${yc}>AVERAGE(${g.colRowFixed(yCol)})),"${trueLabel}","${falseLabel}")`],
  };
  // 평균 범위의 $ 제거(removeDollar)·시작$ 제거(partialDollar)는 채울 때 범위가 밀린다 → 조합 레이아웃에서 결과를 바꿔야
  const partRange = `${g.colLetter(yCol)}${g.dr1}:$${g.colLetter(yCol)}$${g.dr2}`;
  assertFillColClean(spec, [answer.replace(/\$/g, ""), answer.replace(yA, partRange)]);
  return spec;
}

// 1) b5-or-avg [기본] — VIP
function b5OrAvg(rng) {
  return b5Build(rng, {
    op: "OR", headers: ["고객", "구매횟수", "적립금액", "등급"], xCol: "구매횟수", yCol: "적립금액", resCol: "등급",
    kBase: 120, kStep: 10, kSpan: 7, trueLabel: "VIP", falseLabel: "일반", colWidths: [8, 8, 10, 6], colZy: "#,##0",
    note: (xC, yC, k, t, f, r) => `[{표}]에서 구매횟수[{col:${xC}}]가 ${k} 이상이거나 적립금액[{col:${yC}}]이 적립금액의 평균보다 크면 "${t}", 그렇지 않으면 "${f}"으로 등급[{R}]에 표시하시오. (8점)`,
  });
}

// 2) b5-and-avg [어려움] — MVG
function b5AndAvg(rng) {
  return b5Build(rng, {
    op: "AND", headers: ["회원", "구매횟수", "적립금액", "등급"], xCol: "구매횟수", yCol: "적립금액", resCol: "등급",
    kBase: 150, kStep: 10, kSpan: 6, trueLabel: "MVG", falseLabel: "", colWidths: [8, 8, 10, 6], colZy: "#,##0",
    note: (xC, yC, k, t, f, r) => `[{표}]에서 구매횟수[{col:${xC}}]가 ${k} 이상이고 적립금액[{col:${yC}}]이 적립금액의 평균보다 크면 "${t}", 그렇지 않으면 공백으로 등급[{R}]에 표시하시오. (8점)`,
  });
}

export const TEMPLATE_B5 = {
  subtype: "B-5",
  variants: [
    { id: "b5-or-avg", difficulty: "기본", plan: b5OrAvg },
    { id: "b5-and-avg", difficulty: "어려움", plan: b5AndAvg },
  ],
};
