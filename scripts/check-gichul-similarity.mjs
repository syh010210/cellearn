// scripts/check-gichul-similarity.mjs — 템플릿 변형 × 기출 사전(보강) 유사도 표(리포트).
import { makeRng, planItem, TEMPLATES } from "../src/utils/calc/calcAssembler.js";
import { collectSpec, newAcc, judge } from "./_gichulCheck.mjs";

console.log("변형 | 결과 | 표이름 | 구간 | 순위k | 열조합 | 기준값 | 참조머리 | 판정");
const fails = [];
let sum = 0;
for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
  const acc = newAcc();
  for (let s = 0; s < 200; s++) { let r; try { r = planItem(st, v.id, v.difficulty, makeRng(v.id + "#sim" + s)); } catch { continue; } collectSpec(r.spec, acc); }
  const j = judge(acc);
  sum += j.count;
  const verdict = j.fail ? `실패(${j.immediate ? "그대로" : "2+"} ${j.count})` : "통과";
  if (j.fail) fails.push(`${v.id}[${j.hits.join(" · ")}]`);
  console.log(`${v.id} | ${j.cells.result} | ${j.cells.name} | ${j.cells.interval} | ${j.cells.rankK} | ${j.cells.col} | ${j.cells.thr} | ${j.cells.refHead} | ${verdict}`);
}
console.log(`\n실패(같음) 변형 ${fails.length}개, 전체 같음차원 합 ${sum}`);
fails.forEach((f) => console.log("  - " + f));
