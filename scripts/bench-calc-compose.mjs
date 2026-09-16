// scripts/bench-calc-compose.mjs — composeCalc 생성 시간 측정.
// 난이도 기본·어려움 × 5문항·3문항, 3절 분포 임의 조합 200회. 평균·p95·최대·재시도.
import { performance } from "node:perf_hooks";
import { composeCalc, makeRng, planItem, TEMPLATES } from "../src/utils/calc/calcAssembler.js";
import { subtypesForSeed } from "./_calcCompose.mjs";

const N = 200;
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (x) => x.toFixed(1);

console.log("=== composeCalc 200회 (난이도 × 문항 수) ===");
console.log("난이도 | 문항 | 평균ms | p95ms | 최대ms | 재시도합 | 재시도평균");
const rows = [];
for (const diff of ["기본", "어려움"]) {
  for (const n of [5, 3]) {
    const times = [], retries = [];
    for (let i = 0; i < N; i++) {
      const seed = `bench~${diff}~${n}~${i}`;
      const subs = subtypesForSeed(seed, diff, n);
      const t0 = performance.now();
      const inst = composeCalc(seed, { subtypes: subs, difficulty: diff });
      times.push(performance.now() - t0);
      retries.push(inst._meta.retries);
    }
    const avg = sum(times) / N, p95 = pct(times, 0.95), mx = Math.max(...times);
    console.log(`${diff} | ${n} | ${fmt(avg)} | ${fmt(p95)} | ${fmt(mx)} | ${sum(retries)} | ${fmt(sum(retries) / N)}`);
    rows.push({ diff, n, avg, p95, mx });
  }
}

// 소유형·변형별 1회 plan 평균 시간 + 재시도 (느린 상위 5)
console.log("\n=== 변형별 planItem (각 150회) ===");
const per = [];
for (const [st, t] of Object.entries(TEMPLATES)) {
  for (const v of t.variants) {
    const times = [], retries = [];
    for (let i = 0; i < 150; i++) {
      const rng = makeRng(`plan~${v.id}~${i}`);
      const t0 = performance.now();
      const r = planItem(st, v.id, v.difficulty, rng);
      times.push(performance.now() - t0);
      retries.push(r.retries);
    }
    per.push({ id: v.id, diff: v.difficulty, avg: sum(times) / times.length, retry: sum(retries) / retries.length });
  }
}
per.sort((a, b) => b.avg - a.avg);
console.log("느린 변형 상위 5 (평균 plan ms · 재시도평균):");
for (const p of per.slice(0, 5)) console.log(`  ${p.id} [${p.diff}] ${fmt(p.avg)}ms · 재${fmt(p.retry)}`);
console.log(`전체 변형 plan 평균: ${fmt(sum(per.map((p) => p.avg)) / per.length)}ms`);

// 기준 판정
const p95_5 = Math.max(...rows.filter((r) => r.n === 5).map((r) => r.p95));
console.log(`\n5문항 p95 최댓값: ${fmt(p95_5)}ms — 기준 1000ms ${p95_5 <= 1000 ? "이하 → 메인 스레드 생성 유지 가능" : "초과 → 대안 검토 필요"}`);
