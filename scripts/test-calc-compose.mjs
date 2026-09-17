// scripts/test-calc-compose.mjs (test:calc 포함) — 계산작업 시험 구성기 분포·제약 검증.
// 난이도 2 × 문항 수 2 × 1,000시드: 제약 위반 0·예외 0·기준 답 만점·결정성 + 분포 표.
import XLSX from "xlsx-js-style";
import { composeExamCalc } from "../src/utils/calc/composeExamCalc.js";
import { TEMPLATES } from "../src/utils/calc/calcAssembler.js";
import { submit } from "./_calcTestUtil.mjs";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; if (fail <= 40) console.log(`✗ ${name}  ${extra}`); } };

const FILL = new Set(["fillCol", "fillRow", "table"]);
// 변형 메타 조회(구성기와 독립적으로 TEMPLATES 에서)
const META = {};
for (const t of Object.values(TEMPLATES)) for (const v of t.variants) META[v.id] = { subtype: t.subtype, resultKind: v.resultKind, usesD: v.usesD, core: v.core };
const disjoint = (a, b) => !a.core.some((f) => b.core.includes(f));
const p95 = (arr) => { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * 0.95))]; };

const SEEDS = 1000;
for (const difficulty of ["기본", "어려움"]) {
  for (const count of [5, 3]) {
    const tag = `${difficulty}·${count}문항`;
    const shapeCnt = {}, subCnt = {}, varCnt = {}, kindCnt = { single: 0, fill: 0 };
    const usesDVar = {}; let usesDTotal = 0;
    const cols = [], retries = [], times = [];
    let usesDA_ok = 0, usesD3A = 0;
    for (let s = 0; s < SEEDS; s++) {
      const seed = `compose~${s}`;
      let inst;
      const t0 = performance.now();
      try { inst = composeExamCalc(seed, { count, difficulty }); }
      catch (e) { check(`${tag} 예외 없음`, false, `${seed}: ${e.message}`); continue; }
      times.push(performance.now() - t0);
      const metas = inst._exam.items.map((it) => META[it.variantId]);
      // 결정성
      const inst2 = composeExamCalc(seed, { count, difficulty });
      if (JSON.stringify(inst.cells) !== JSON.stringify(inst2.cells) || JSON.stringify(inst._exam.items) !== JSON.stringify(inst2._exam.items)) check(`${tag} 결정성`, false, seed);
      // 제약: 소유형 중복 없음
      if (new Set(metas.map((m) => m.subtype)).size !== metas.length) check(`${tag} 소유형 중복`, false, seed);
      // 제약: core 교집합 없음(전 쌍)
      let coreOk = true;
      for (let i = 0; i < metas.length; i++) for (let j = i + 1; j < metas.length; j++) if (!disjoint(metas[i], metas[j])) coreOk = false;
      if (!coreOk) check(`${tag} core 교집합`, false, seed);
      // 제약: usesD
      const A = metas.filter((m) => m.subtype[0] === "A");
      const dA = A.filter((m) => m.usesD).length;
      if (count === 5) { if (dA === 1) usesDA_ok++; else check(`${tag} A usesD=1`, false, `${seed} dA=${dA}`); }
      else { if (dA === 1) usesD3A++; if (dA > 1) check(`${tag} 3문항 A usesD≤1`, false, seed); }
      // 제약: resultKind 균형
      const fill = metas.filter((m) => FILL.has(m.resultKind)).length, single = metas.length - fill;
      if (count === 5) { const ok = difficulty === "기본" ? (single >= 1 && single <= 3 && fill >= 2 && fill <= 4) : (single >= 2 && single <= 3 && fill >= 2 && fill <= 3); if (!ok) check(`${tag} resultKind 균형`, false, `${seed} s=${single} f=${fill}`); }
      else { if (!(single >= 1 && single <= 2)) check(`${tag} resultKind 균형`, false, `${seed} s=${single}`); }
      // 제약: C 2개 계열
      const C = metas.filter((m) => m.subtype[0] === "C");
      if (C.length === 2) {
        const h = C.some((m) => m.core.includes("HLOOKUP"));
        const vv = C.some((m) => m.core.includes("VLOOKUP") || m.core.includes("INDEX") || m.core.includes("MATCH"));
        if (!(h && vv)) check(`${tag} C 계열`, false, seed);
      }
      // 기준 답 만점
      const res = submit(inst);
      if (res.earned !== res.total) check(`${tag} 만점`, false, `${seed} ${res.earned}/${res.total}`);
      // 집계
      const shape = "A" + A.length + "B" + metas.filter((m) => m.subtype[0] === "B").length + "C" + C.length + "D" + metas.filter((m) => m.subtype[0] === "D").length;
      shapeCnt[shape] = (shapeCnt[shape] || 0) + 1;
      for (const m of metas) { subCnt[m.subtype] = (subCnt[m.subtype] || 0) + 1; kindCnt[FILL.has(m.resultKind) ? "fill" : "single"]++; }
      for (const it of inst._exam.items) { varCnt[it.variantId] = (varCnt[it.variantId] || 0) + 1; if (META[it.variantId].usesD) { usesDVar[it.variantId] = (usesDVar[it.variantId] || 0) + 1; usesDTotal++; } }
      cols.push(XLSX.utils.decode_range(inst.usedRange).e.c + 1);
      retries.push(inst._exam.attempt);
    }
    const avg = (a) => a.length ? (a.reduce((x, y) => x + y, 0) / a.length) : 0;
    console.log(`\n=== ${tag} (${SEEDS}시드) ===`);
    console.log(`대유형 구성: ${Object.entries(shapeCnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${(v / SEEDS * 100).toFixed(1)}%`).join(", ")}`);
    console.log(`소유형 출현: ${Object.entries(subCnt).sort().map(([k, v]) => `${k}:${v}`).join(" ")}`);
    console.log(`resultKind: single=${kindCnt.single} fill=${kindCnt.fill}`);
    if (count === 5) console.log(`A usesD=1 정확: ${usesDA_ok}/${SEEDS}`); else console.log(`3문항 A usesD 비율: ${(usesD3A / SEEDS * 100).toFixed(1)}%`);
    console.log(`usesD 변형 출현: ${Object.entries(usesDVar).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(" ") || "(없음)"}`);
    console.log(`레이아웃 열수: 평균 ${avg(cols).toFixed(1)} 최대 ${Math.max(...cols)}`);
    console.log(`재시도(attempt): 평균 ${avg(retries).toFixed(3)} 최대 ${Math.max(...retries)}`);
    console.log(`생성시간(ms): 평균 ${avg(times).toFixed(2)} p95 ${p95(times).toFixed(2)}`);
    // 요약 양성 검사(전 시드 제약·만점·예외 통과 확인)
    check(`${tag} 전 시드 생성(예외 0)`, times.length === SEEDS, `${times.length}/${SEEDS}`);
    check(`${tag} resultKind 균형 합계`, count === 5 ? (kindCnt.single >= SEEDS && kindCnt.fill >= SEEDS * 2) : kindCnt.single >= SEEDS);
    if (count === 3) check(`${tag} A usesD 50%±5%`, Math.abs(usesD3A / SEEDS - 0.5) <= 0.05, `${(usesD3A / SEEDS * 100).toFixed(1)}%`);
    if (count === 5) check(`${tag} A usesD=1 전 시드`, usesDA_ok === SEEDS, `${usesDA_ok}/${SEEDS}`);
    // 출현 0 변형(해당 난이도 풀)
    const zero = [];
    for (const t of Object.values(TEMPLATES)) for (const v of t.variants) if (v.difficulty === difficulty && !varCnt[v.id]) zero.push(v.id);
    console.log(`출현 0 변형: ${zero.length ? zero.join(", ") : "(없음)"}`);
  }
}

console.log(`\n구성기 분포: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
