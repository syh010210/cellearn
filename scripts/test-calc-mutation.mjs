// scripts/test-calc-mutation.mjs
// 계산작업 채점기 mutation 테스트: 제출 시뮬레이션 → gradeCalc.
//  · 함수 추출·astToFormula 단위 테스트
//  · 기준 답 만점(조합 여러 개, 한 시트 다문항 독립성)
//  · accept 전부 만점 / reject 전부 불합격 + expectReason 포함
//  · answer.formula 자동 변형: 잡히거나(불합격) allowSurvive 에 있어야 함
//  · 연산자별 생성 수 표(샘플×연산자) 출력

import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { extractFunctions } from "../src/utils/calc/formulaFunctions.js";
import { astToFormula } from "../src/utils/calc/astToFormula.js";
import { parseFormula } from "../src/excel-engine/parser.js";
import { classifySurvivor } from "../src/utils/calc/survivorRules.js";
import { SAMPLES } from "../src/data/exam/calc/samples.js";
import { submit, mutate, norm, OP_ORDER } from "./_calcTestUtil.mjs";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) { pass++; } else { fail++; console.log(`✗ ${name}  ${extra}`); } };

// ══════════════════════ 1. 단위: 함수 추출 ══════════════════════
console.log("=== 함수 추출 ===");
check("문자열 속 IF( 무시", JSON.stringify(extractFunctions('=CONCATENATE("IF(",A1)').functions.sort()) === '["CONCATENATE"]');
check("중첩", JSON.stringify(extractFunctions('=IFERROR(HLOOKUP(LEFT(A3,2),$E$2:$G$3,2,0),"확인")').functions.sort()) === JSON.stringify(["HLOOKUP", "IFERROR", "LEFT"]));
check("_xlfn.RANK.EQ", extractFunctions("=_xlfn.RANK.EQ(A1,B1:B9)").functions.join() === "RANK.EQ");
check("소문자 입력", extractFunctions("=sum(a1:a9)").functions.join() === "SUM");
check("MissingArg", JSON.stringify(extractFunctions('=IF(A1>1,,"x")').functions.sort()) === '["IF"]');
check("STDEV 동치", extractFunctions("=STDEV(A1:A9)").functions.join() === "STDEV.S");
check("파싱 실패", !!extractFunctions("=SUM(").error);

// ══════════════════════ 2. astToFormula 왕복 ══════════════════════
console.log("=== astToFormula 왕복(함수 집합) ===");
for (const f of ['=ROUND(DAVERAGE(A2:C8,"평점",E1:E2),1)', '=IFERROR(CHOOSE(RANK.EQ(B3,B3:B8),"금",""),"")', '=MONTH(WORKDAY(B3,C3))&"/"&DAY(WORKDAY(B3,C3))', "=SUMIF(B3:B8,E3,C3:C8)/SUM(C3:C8)"]) {
  const a = extractFunctions(f).functions.sort().join(), b = extractFunctions(astToFormula(parseFormula(f))).functions.sort().join();
  check("왕복 " + f.slice(0, 16), a === b, `${a} vs ${b}`);
}

// ══════════════════════ 3. 기준 답 만점(조합) ══════════════════════
console.log("=== 기준 답 만점 ===");
const combos5 = [[0, 1, 2, 3, 4], [5, 4, 3, 2, 1], [2, 0, 4, 1, 3]];
const combos3 = [[0, 1, 2], [3, 4, 5], [5, 2, 0]];
for (const combo of [...combos5, ...combos3]) {
  const inst = buildInstance({ id: "c" + combo.join(""), blocks: combo.map((i) => SAMPLES[i]) });
  const res = submit(inst);
  check("기준답 만점 [" + combo.join(",") + "]", res.earned === res.total, `${res.earned}/${res.total} ` + res.items.filter((i) => !i.ok).map((i) => i.no + ":" + i.reasons[0]).join(" | "));
}
{
  const inst = buildInstance({ id: "indep", blocks: [0, 1, 2, 3, 4].map((i) => SAMPLES[i]) });
  const res = submit(inst, { 3: { formula: "=999" } });
  check("독립성: 3번만 불합격", !res.items[2].ok && res.items.filter((_, i) => i !== 2).every((x) => x.ok), res.items.map((x) => x.no + (x.ok ? "o" : "x")).join(""));
}

// ══════════════════════ 4. 샘플별 accept / reject / 자동 변형 ══════════════════════
console.log("=== accept · reject · 자동 변형 ===");
const opTable = []; // {no, subtype, byOp:{}, mut, caught, survived}
const survivors = [];
SAMPLES.forEach((sample, si) => {
  const combo = [si, (si + 1) % 6, (si + 2) % 6];
  const inst = buildInstance({ id: "s" + si, blocks: combo.map((i) => SAMPLES[i]) });
  const it = inst.items[0];

  for (const acc of sample.accept || []) {
    const r = submit(inst, { 1: { formula: acc } }).items[0];
    check(`[S${si + 1}] accept 만점: ${acc.slice(0, 40)}`, r.ok, r.ok ? "" : r.reasons.join(" / "));
  }
  for (const rej of sample.reject || []) {
    const r = submit(inst, { 1: { formula: rej.formula, criteria: rej.criteria } }).items[0];
    const cats = new Set(r.details.map((d) => d.cat));
    check(`[S${si + 1}] reject 불합격+사유: ${String(rej.formula).slice(0, 34)}`, !r.ok && cats.has(rej.expectReason), `ok=${r.ok} cats=${[...cats].join(",")} 기대=${rej.expectReason}`);
  }

  const byOp = {}; let mut = 0, caught = 0, survived = 0;
  for (const m of mutate(it.answer.formula, sample.functions?.required || [])) {
    byOp[m.op] = (byOp[m.op] || 0) + 1; mut++;
    const r = submit(inst, { 1: { formula: m.formula } }).items[0];
    if (r.ok) { survived++; const rule = classifySurvivor(it.answer.formula, m.formula, it); if (!rule) survivors.push({ s: si + 1, op: m.op, name: m.name, formula: m.formula }); check(`[S${si + 1}] 생존 변형 규칙 허용: ${m.op}/${m.name}`, !!rule, `생존식=${m.formula}`); }
    else caught++;
  }
  opTable.push({ no: si + 1, subtype: sample.subtype, byOp, mut, caught, survived });
});

// ── 연산자별 생성 수 표 ──
console.log("\n=== 연산자별 생성 수 (샘플 × 연산자) ===");
console.log(["샘플", ...OP_ORDER, "합계"].join("\t"));
for (const r of opTable) console.log([`${r.no}(${r.subtype})`, ...OP_ORDER.map((op) => r.byOp[op] || 0), r.mut].join("\t"));
console.log("\n=== 샘플별 잡힘/생존 ===");
console.log("샘플 | 생성 | 잡힘 | 생존");
for (const r of opTable) console.log(`${r.no}(${r.subtype}) | ${r.mut} | ${r.caught} | ${r.survived}`);
if (survivors.length) { console.log("\n[미등재 생존]"); for (const s of survivors) console.log(`  S${s.s} ${s.op}/${s.name}: ${s.formula}`); }

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
