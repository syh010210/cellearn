// scripts/test-calc.mjs  (npm run test:calc)
// 계산작업 레이아웃 + buildInstance 자체검증 테스트.

import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { layoutPage } from "../src/utils/calc/calcLayout.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";
import { SAMPLES } from "../src/data/exam/calc/samples.js";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${detail}`); } };
const throws = (name, fn) => { let t = false, msg = ""; try { fn(); } catch (e) { t = true; msg = e.message; } check(name + " (예외 기대)", t, t ? "" : "예외 없음"); return msg; };

const colL = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const a1 = (r, c) => colL(c) + (r + 1);
const AR = (o, rg) => rg.r1 === rg.r2 && rg.c1 === rg.c2 ? a1(o.r + rg.r1, o.c + rg.c1) : `${a1(o.r + rg.r1, o.c + rg.c1)}:${a1(o.r + rg.r2, o.c + rg.c2)}`;

// ─────────── 1. 레이아웃 조합 (5개 3가지 · 3개 3가지) ───────────
const combos5 = [[0, 1, 2, 3, 4], [5, 4, 3, 2, 1], [2, 0, 4, 1, 3]];
const combos3 = [[0, 1, 2], [3, 4, 5], [5, 2, 0]];
for (const combo of [...combos5, ...combos3]) {
  const blocks = combo.map((i) => SAMPLES[i]);
  let inst = null, err = "";
  try { inst = buildInstance({ id: "calc-" + combo.join(""), blocks }); } catch (e) { err = e.message; }
  check(`조합 [${combo.join(",")}] 빌드`, !!inst, err);
  if (inst) {
    check(`조합 [${combo.join(",")}] 항목 ${blocks.length}개`, inst.items.length === blocks.length);
    // 20열 이내
    const [, br] = inst.usedRange.split(":");
    const c2 = colL(0); // dummy
    const maxColLetter = br.replace(/\d+/g, "");
    let mc = 0; for (const ch of maxColLetter) mc = mc * 26 + (ch.charCodeAt(0) - 64);
    check(`조합 [${combo.join(",")}] 20열 이내`, mc - 1 <= 19, `maxCol=${mc - 1}`);
  }
}

// ─────────── 1b. [표N] 재번호 (조합 위치 기준) ───────────
{
  const inst = buildInstance({ id: "renum", blocks: [5, 1, 2].map((i) => SAMPLES[i]) }); // 샘플 6,2,3
  check("조합 [6,2,3] → 문항1 지시문이 [표1]", inst.items[0].text.startsWith("[표1]"), inst.items[0].text.slice(0, 8));
  check("조합 [6,2,3] → 문항2 지시문이 [표2]", inst.items[1].text.startsWith("[표2]"), inst.items[1].text.slice(0, 8));
  check("조합 [6,2,3] → 문항3 지시문이 [표3]", inst.items[2].text.startsWith("[표3]"), inst.items[2].text.slice(0, 8));
  // 라벨 셀도 [표1] 로 기록되는지
  const label1 = Object.entries(inst.cells).find(([, c]) => c.v === "[표1]");
  check("조합 [6,2,3] → [표1] 라벨 셀 존재", !!label1);
}

// ─────────── 2. 블록별 범위 표 (조합 [0,1,2,3,4]) ───────────
{
  const combo = [0, 1, 2, 3, 4];
  const specs = combo.map((i) => resolveBlock(SAMPLES[i]));
  const { origins } = layoutPage(specs.map((b) => ({ w: b.width, h: b.height })));
  console.log("\n=== 블록별 범위 (조합 [0,1,2,3,4]) ===");
  console.log("블록 | 위치(origin) | 폭x높이 | 표(라벨~데이터) | 결과 | 부착물");
  specs.forEach((b, i) => {
    const o = origins[i];
    const tableRange = AR(o, { r1: 0, c1: 0, r2: b.tableBottom, c2: b.nCols - 1 });
    const resRange = AR(o, b.result.range);
    let att = "-";
    if (b.criteria) att = "criteria " + AR(o, b.criteria.range);
    else if (b.refTableRange) att = "refTable " + AR(o, b.refTableRange);
    else if (b.resultTableRange) att = "resultTable " + AR(o, b.resultTableRange);
    console.log(`${i + 1}(${b.spec.subtype}) | ${a1(o.r, o.c)} | ${b.width}x${b.height} | ${tableRange} | ${resRange} | ${att}`);
  });
}

// ─────────── 3. 지시문·▶ 전문 + 기대값 (6개 샘플) ───────────
function itemFor(sampleIdx) {
  // 그 샘플을 포함하는 조합을 빌드해 item 을 얻는다.
  const combo = sampleIdx <= 4 ? [0, 1, 2, 3, 4] : [5, 0, 1];
  const pos = combo.indexOf(sampleIdx);
  const inst = buildInstance({ id: "x", blocks: combo.map((i) => SAMPLES[i]) });
  return inst.items[pos];
}
console.log("\n=== 지시문 · ▶ 줄 · 기대값 (6개 샘플) ===");
for (let i = 0; i < 6; i++) {
  const it = itemFor(i);
  console.log(`\n[샘플 ${i + 1}] ${it.subtype}  (result=${it.result.kind}, fill=${it.result.fill})`);
  console.log("  지시문: " + it.text);
  it.notes.forEach((n) => console.log("  ▶ " + n));
  console.log("  함수: required=" + JSON.stringify(it.functions.required) + " candidates=" + JSON.stringify(it.functions.candidates));
  if (it.criteria) console.log("  조건범위: " + it.criteria.range + " = " + JSON.stringify(it.criteria.table));
  console.log("  answer: " + it.answer.formula);
  console.log("  기대값: " + Object.entries(it.expected).map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : JSON.stringify(v)}`).join("  "));
  check(`샘플 ${i + 1} 기대값에 오류 없음`, Object.values(it.expected).every((v) => !(v && typeof v === "object" && v.error)));
}

// ─────────── 4. 자체 검증 실패(음성) 테스트 ───────────
console.log("\n=== 음성 테스트 (자체 검증이 막아야 함) ===");
const clone = (o) => JSON.parse(JSON.stringify(o));

// (a) 조건 앞부분 충돌 데이터
throws("앞부분 충돌 데이터", () => {
  const bad = clone(SAMPLES[0]);
  bad.headers = ["동아리", "등급", "평점"];
  bad.rows = [["연극부", "A", 4.1], ["연극반", "B", 3.9], ["방송부", "A", 4.6], ["미술반", "C", 3.1], ["합창부", "B", 4.0], ["토론반", "A", 3.8]];
  bad.criteria = { headers: ["동아리"], rows: [["연극"]], rowOffset: 0 }; // 연극 → 연극부·연극반(2) vs 완전일치(0)
  bad.answer = '=ROUND(DAVERAGE(A2:C8,"평점",E1:E2),1)';
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[1], SAMPLES[2]] });
});

// (b) 20열 초과
throws("20열 초과", () => layoutPage([{ w: 21, h: 3 }, { w: 2, h: 2 }, { w: 2, h: 2 }]));

// (c) 부착물 겹침 (criteria + refTable 같은 위치)
throws("부착물 겹침", () => {
  const bad = clone(SAMPLES[0]);
  bad.refTable = { headers: ["X", "Y"], rows: [["1", "2"]], rowOffset: 0 }; // criteria 와 같은 startCol/row 에서 겹침
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[1], SAMPLES[2]] });
});

// (d) 지시문 좌표 오기
throws("지시문 좌표 오기", () => {
  const bad = clone(SAMPLES[1]);
  bad.notes = [...bad.notes, "잘못된 참조 [Z99] 표기"];
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[2], SAMPLES[3]] });
});

// (e) 표 열 수 < 3
throws("표 열 수 부족(<3)", () => {
  const bad = { subtype: "B-1", headers: ["점수", "판정"], rows: [[88, null], [92, null], [85, null], [95, null], [79, null], [90, null]], result: { kind: "fillCol", col: "판정" }, answer: '=IFERROR(CHOOSE(RANK.EQ(A3,$A$3:$A$8),"금","은","동"),"")', functions: { required: [], candidates: null }, text: "[{표}] 판정[{R}]. (8점)", notes: [] };
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[0], SAMPLES[1]] });
});

// (f) 데이터 행 수 < 6
throws("데이터 행 수 부족(<6)", () => {
  const bad = clone(SAMPLES[0]);
  bad.rows = bad.rows.slice(0, 4);
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[1], SAMPLES[2]] });
});

// (g) 채우기 결과가 전부 같은 값 (fillCol 상수식)
throws("채우기 결과 전부 같음", () => {
  const bad = clone(SAMPLES[1]);
  bad.answer = '=LEN("금")'; // 항상 1
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[0], SAMPLES[2]] });
});

// (h) fillRow 숫자 결과에 같은 값 쌍
throws("fillRow 같은 값 쌍", () => {
  const bad = clone(SAMPLES[5]);
  // 국어=영어 열 값을 동일하게 → 두 평균이 같아짐
  bad.rows = [
    ["김", "1반", 80, 80, 70], ["이", "2반", 70, 60, 55], ["박", "1반", 90, 90, 88],
    ["최", "3반", 55, 48, 60], ["정", "2반", 100, 95, 88], ["강", "1반", 70, 70, 76],
    ["윤", "3반", 45, 50, 52], ["임", "2반", 78, 81, 74],
  ];
  buildInstance({ id: "bad", blocks: [bad, SAMPLES[0], SAMPLES[1]] });
});

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
