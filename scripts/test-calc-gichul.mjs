// scripts/test-calc-gichul.mjs (test:calc 포함) — 기출 사전(보강) 대조 검증.
//  각 변형 200시드 산출이 기출과 (그대로 1건 또는 2개 이상) 겹치면 실패.
//  + 수정 전 상태를 재현한 고정 기준 사례 3건은 반드시 "실패"로 잡혀야 한다(사전이 제대로 잡는지).
import { makeRng, planItem, TEMPLATES } from "../src/utils/calc/calcAssembler.js";
import { collectSpec, newAcc, judge } from "./_gichulCheck.mjs";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; if (fail <= 40) console.log(`✗ ${name}  ${extra}`); } };

// 변형별 200시드 → 기출과 안 겹쳐야(판정 통과)
for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
  const acc = newAcc();
  for (let s = 0; s < 200; s++) { let r; try { r = planItem(st, v.id, v.difficulty, makeRng(v.id + "#g" + s)); } catch { continue; } collectSpec(r.spec, acc); }
  const j = judge(acc);
  check(`${v.id} 기출 비유사`, !j.fail, j.hits.join(" · "));
}

// 기준 사례(수정 전 재현): 사전이 반드시 "실패"로 잡아야 한다.
const baselines = [
  { name: "b5-or-avg VIP/일반·150", spec: { answer: '=IF(OR(A3>=150,B3>AVERAGE($B$3:$B$12)),"VIP","일반")', notes: [], text: "[{표}]에서 구매횟수[{col:구매횟수}]가 150 이상이거나 적립금액[{col:적립금액}]이 평균보다 크면 …" } },
  { name: "a3-large-small k=2·3", spec: { answer: "=LARGE(C3:C10,2)-SMALL(C3:C10,3)", notes: [], text: "[{표}]의 기록[{col:기록}] …" } },
  { name: "c2-hlookup-avg 중간·기말·학점기준표·F~A", spec: { answer: "=HLOOKUP(AVERAGE(B3,C3),$G$12:$K$13,2)", notes: ["평균은 중간고사와 기말고사로 구함"], text: "[{표}]에서 중간고사[{col:중간고사}], 기말고사[{col:기말고사}]와 학점기준표[{T}]를 …", refTable: { name: "학점기준표", headers: [0, 60, 70, 80, 90], rows: [["F", "D", "C", "B", "A"]] } } },
];
for (const b of baselines) {
  const acc = newAcc(); collectSpec(b.spec, acc);
  const j = judge(acc);
  check(`기준사례 실패판정: ${b.name}`, j.fail, `hits=${j.hits.join(" · ")}`);
}

console.log(`\n기출 사전 대조: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
