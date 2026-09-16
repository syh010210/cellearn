// scripts/test-calc-templates.mjs  (test:calc 에 포함)
// 변형별 200시드: 자체검증·재시도율·기준답 만점·accept 만점·mutation 전부 잡힘(규칙 생존 제외)·결정성.
// + 1000시드 분포 + composeCalc 조합 만점.
import { makeRng, planItem, composeCalc, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { classifySurvivor } from "../src/utils/calc/survivorRules.js";
import { submit, mutate, cellsGetCell, validateText } from "./_calcTestUtil.mjs";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

const VARIANTS = [];
for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) VARIANTS.push({ st, id: v.id, difficulty: v.difficulty });

const SEEDS = 200;
// 잡힘 범주: value > function > criteria > noFormula (여러 범주면 value 우선 + 전체 목록)
function caughtCat(it) {
  const cats = new Set(it.details.map((d) => d.cat));
  const pri = cats.has("value") || cats.has("parse") ? "value"
    : (cats.has("functionMissing") || cats.has("functionOutside")) ? "function"
      : cats.has("criteria") ? "criteria" : cats.has("noFormula") ? "noFormula" : "기타";
  return { pri, cats: [...cats] };
}
console.log("=== 변형별 (200시드) ===");
console.log("변형 | 난이도 | 재시도율 | accept | 생성/잡힘/규칙생존 | 잡힘범주(V/F/C) | 규칙");
const catRows = [];
for (const V of VARIANTS) {
  let retry = 0, accOk = 0, accN = 0, mutN = 0, caught = 0, ruled = 0;
  const bad = [];
  const catCnt = { value: 0, function: 0, criteria: 0, noFormula: 0, 기타: 0 };
  const ruleCnt = {};
  let shrinkCaught = 0, sawPaired = false, validated = 0;
  const badCandidate = [];
  for (let s = 0; s < SEEDS; s++) {
    const seed = `${V.id}#${s}`;
    const r = planItem(V.st, V.id, V.difficulty, makeRng(seed));
    if (!r) { check(`${V.id} 변형 존재`, false); break; }
    retry += r.retries;
    const inst = buildInstance({ id: "t", blocks: [r.spec, FILLER, FILLER] });
    const r2 = planItem(V.st, V.id, V.difficulty, makeRng(seed)); // 결정성
    if (JSON.stringify(r2.spec) !== JSON.stringify(r.spec)) check(`${V.id} 결정성`, false, seed);
    const it = inst.items[0];
    { const e = validateText(it, r.spec); validated++; if (e.length) check(`${V.id} 지시문 좌표 무결성`, false, `${seed} :: ${e.join(" / ")}`); }
    const gc = cellsGetCell(inst.cells);
    const cand = it.functions?.candidates || null;
    const ref = submit(inst).items[0];
    if (!ref.ok) check(`${V.id} 기준답 만점`, false, `${seed} :: ${ref.reasons.join(" / ")}`);
    for (const a of r.spec.accept || []) { accN++; const rr = submit(inst, { 1: { formula: a } }).items[0]; if (rr.ok) accOk++; else check(`${V.id} accept`, false, `${seed} :: ${a} :: ${rr.reasons.join("/")}`); }
    for (const m of mutate(it.answer.formula, r.spec.functions?.required || [])) {
      mutN++;
      const rr = submit(inst, { 1: { formula: m.formula } }).items[0];
      if (rr.ok) {
        // withinListSurvive: 생존자는 함수 규칙으로 못 잡힌(허용 목록 안) 경우 → 반드시 생존 규칙에 해당해야
        const rule = classifySurvivor(it.answer.formula, m.formula, it, gc);
        if (rule) { ruled++; ruleCnt[rule.name] = (ruleCnt[rule.name] || 0) + 1; if (rule.name === "pairedRangeShrink") sawPaired = true; }
        else if (bad.length < 4) bad.push({ seed, op: m.op, mut: m.formula, ans: it.answer.formula });
      } else {
        caught++; const c = caughtCat(rr); catCnt[c.pri]++;
        if (m.op === "rangeShrink") shrinkCaught++;
        // 후보형: 후보 함수끼리 교체(roundSwap)는 반드시 값으로 잡혀야 한다
        if (cand && m.op === "roundSwap" && c.pri !== "value") badCandidate.push(`${seed}:${m.name}:${c.pri}`);
      }
    }
  }
  const survivedBad = mutN - caught - ruled;
  check(`${V.id} accept 전부 만점`, accOk === accN, `${accOk}/${accN}`);
  check(`${V.id} withinListSurvive(미규칙 생존) 0`, survivedBad === 0, bad.map((b) => `[${b.op}] ${b.mut} ⟵ ${b.ans} (${b.seed})`).join("  |  "));
  if (sawPaired) check(`${V.id} pairedRangeShrink: 같은 범위 축소 중 값으로 잡힌 것 있음`, shrinkCaught >= 1, `shrinkCaught=${shrinkCaught}`);
  check(`${V.id} 후보 교체는 값으로 잡힘`, badCandidate.length === 0, badCandidate.slice(0, 3).join(" "));
  console.log(`${V.id} | ${V.difficulty} | 검증${validated} | 재${(retry / SEEDS).toFixed(2)} | ${accOk}/${accN} | ${mutN}/${caught}/${survivedBad} | ${catCnt.value}/${catCnt.function}/${catCnt.criteria} | ${Object.entries(ruleCnt).map(([k, v]) => k + ":" + v).join(",")}`);
  catRows.push({ id: V.id, cat: catCnt, rule: ruleCnt });
}

// ── 1000시드 분포 ──
console.log("\n=== 1000시드 변형 분포 (난이도 풀) ===");
for (const [st, t] of Object.entries(TEMPLATES)) {
  for (const diff of ["기본", "어려움"]) {
    const pool = t.variants.filter((v) => v.difficulty === diff);
    if (!pool.length) continue;
    const cnt = {};
    for (let s = 0; s < 1000; s++) { const r = planItem(st, null, diff, makeRng(`${st}~${diff}~${s}`)); cnt[r.variantId] = (cnt[r.variantId] || 0) + 1; }
    console.log(`${st} ${diff} (${pool.length}종): ${Object.entries(cnt).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
}

// ── composeCalc 조합 만점 ──
console.log("\n=== composeCalc [A-2,B-1,C-1] 200시드 만점 ===");
for (const diff of ["기본", "어려움"]) {
  let ok = 0, totRetry = 0;
  for (let s = 0; s < 200; s++) {
    const inst = composeCalc(`compose~${diff}~${s}`, { subtypes: ["A-2", "B-1", "C-1"], difficulty: diff });
    totRetry += inst._meta.retries;
    const res = submit(inst);
    if (res.earned === res.total && inst.items.length === 3) ok++;
    else check(`compose 만점`, false, `${diff}#${s} ${res.earned}/${res.total}`);
  }
  check(`compose ${diff} 200시드 만점`, ok === 200, `${ok}/200`);
  console.log(`${diff}: ${ok}/200 만점, 총재시도 ${totRetry}`);
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
