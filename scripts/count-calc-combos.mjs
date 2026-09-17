// scripts/count-calc-combos.mjs — 계산작업 경우의 수·데이터 다양성 분석(리포트 전용, 채점 아님).
//  · 난이도별 제약을 만족하는 서로 다른 변형 5개 조합 수(전수 열거, 분포별).
//  · 변형 풀 크기, 시드 공간, 5,000시드 데이터 다양성, 대표 변형 데이터 규모(자릿수).
import { TEMPLATES } from "../src/utils/calc/calcAssembler.js";
import { composeExamCalc } from "../src/utils/calc/composeExamCalc.js";

const FILL = new Set(["fillCol", "fillRow", "table"]);
const isFill = (m) => FILL.has(m.resultKind);
const disjoint = (a, b) => !a.core.some((f) => b.core.includes(f));
const hFam = (m) => m.core.includes("HLOOKUP");
const vFam = (m) => m.core.includes("VLOOKUP") || m.core.includes("INDEX") || m.core.includes("MATCH");
const allDisjoint = (ms) => { for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) if (!disjoint(ms[i], ms[j])) return false; return true; };
function resultKindOk(ms, count, diff) {
  const fill = ms.filter(isFill).length, single = ms.length - fill;
  if (count === 5) return diff === "기본" ? (single >= 1 && single <= 3 && fill >= 2 && fill <= 4) : (single >= 2 && single <= 3 && fill >= 2 && fill <= 3);
  return single >= 1 && single <= 2;
}
function pool(diff) {
  const p = { A: [], B: [], C: [], D: [] };
  for (const t of Object.values(TEMPLATES)) for (const v of t.variants) if (v.difficulty === diff) p[t.subtype[0]].push({ subtype: t.subtype, id: v.id, resultKind: v.resultKind, usesD: v.usesD, core: v.core });
  return p;
}
// 서로 다른 소유형 k개 조합(변형 단위)
function* combosDistinctSubtype(list, k, start = 0, chosen = []) {
  if (chosen.length === k) { yield chosen.slice(); return; }
  for (let i = start; i < list.length; i++) {
    const m = list[i];
    if (chosen.some((c) => c.subtype === m.subtype)) continue;
    chosen.push(m); yield* combosDistinctSubtype(list, k, i + 1, chosen); chosen.pop();
  }
}

function count5(diff) {
  const p = pool(diff);
  const shapes = [{ name: "A2·B1·C1·D1", B: 1, C: 1, D: 1 }, { name: "A2·B2·C1", B: 2, C: 1, D: 0 }, { name: "A2·B1·C2", B: 1, C: 2, D: 0 }];
  // A 쌍: 정확히 1개 usesD, 소유형 다름, core 교집합 없음
  const aPairs = [];
  const dA = p.A.filter((m) => m.usesD), nA = p.A.filter((m) => !m.usesD);
  for (const a1 of dA) for (const a2 of nA) if (a1.subtype !== a2.subtype && disjoint(a1, a2)) aPairs.push([a1, a2]);
  const groupCombos = (list, k, familyC) => {
    const out = [];
    for (const c of combosDistinctSubtype(list, k)) {
      if (!allDisjoint(c)) continue;
      if (familyC && k === 2 && !(c.some(hFam) && c.some(vFam))) continue;
      out.push(c);
    }
    return out;
  };
  const byShape = {};
  let total = 0; const seen = new Set();
  for (const sh of shapes) {
    const Bs = groupCombos(p.B, sh.B, false);
    const Cs = groupCombos(p.C, sh.C, sh.C === 2);
    const Ds = sh.D ? groupCombos(p.D, sh.D, false) : [[]];
    let n = 0;
    for (const A of aPairs) for (const B of Bs) for (const C of Cs) for (const D of Ds) {
      const ms = [...A, ...B, ...C, ...D];
      if (!allDisjoint(ms)) continue;
      if (!resultKindOk(ms, 5, diff)) continue;
      const key = ms.map((m) => m.id).sort().join(","); if (seen.has(key)) continue; seen.add(key);
      n++;
    }
    byShape[sh.name] = n; total += n;
  }
  return { total, byShape, pool: p, aPairs: aPairs.length };
}

console.log("======== 계산작업 경우의 수 (변형 5개 조합, 전수 열거) ========");
for (const diff of ["기본", "어려움"]) {
  const r = count5(diff);
  console.log(`\n[${diff}] 변형 풀: A=${r.pool.A.length} B=${r.pool.B.length} C=${r.pool.C.length} D=${r.pool.D.length} (A usesD쌍 ${r.aPairs})`);
  console.log(`  서로 다른 5-변형 조합: 총 ${r.total.toLocaleString()}`);
  for (const [k, v] of Object.entries(r.byShape)) console.log(`    ${k}: ${v.toLocaleString()}`);
}

// 시드 생성 방식
console.log("\n======== 시드 공간 ========");
console.log("  앱: ExamView.compose() → const s = (crypto.randomUUID() || Date.now()).slice(0,8) — UUID 앞 8자(16진).");
console.log("  → 시드 공간 ≈ 16^8 = " + Math.pow(16, 8).toLocaleString() + " (composeExamCalc 는 `${seed}~exam~${count}~${difficulty}` 로 rng 시드)");

// 데이터 다양성 (5,000시드)
console.log("\n======== 데이터 다양성 (5,000시드) ========");
for (const diff of ["기본", "어려움"]) {
  const N = 5000;
  const comboSet = new Set(), cellSet = new Map(), itemDataSet = new Map();
  let itemTotal = 0, itemRepeat = 0, cellDup = 0;
  for (let s = 0; s < N; s++) {
    const inst = composeExamCalc(`combo~${s}`, { count: 5, difficulty: diff });
    comboSet.add(inst._exam.items.map((it) => it.variantId).sort().join(","));
    const cellKey = JSON.stringify(inst.cells);
    cellSet.set(cellKey, (cellSet.get(cellKey) || 0) + 1);
    // 문항 단위: variantId + 그 문항의 표 데이터(sourceCells 값) 재출현
    for (const it of inst.items) {
      const vId = inst._exam.items.find((x) => x.no === it.no).variantId;
      const data = (it.sourceCells || []).map((a) => inst.cells[a] && inst.cells[a].v).join("|");
      const key = vId + "@" + data;
      itemTotal++; if (itemDataSet.has(key)) itemRepeat++; else itemDataSet.set(key, 1);
    }
  }
  for (const c of cellSet.values()) if (c > 1) cellDup += c - 1;
  console.log(`\n[${diff}] ${N}시드`);
  console.log(`  서로 다른 변형 조합: ${comboSet.size}`);
  console.log(`  완전 동일 인스턴스(입력 셀 전체 동일) 중복 발생: ${cellDup}건 (고유 ${cellSet.size})`);
  console.log(`  문항 단위 같은 (변형+표데이터) 재출현: ${itemRepeat}/${itemTotal} (${(itemRepeat / itemTotal * 100).toFixed(2)}%), 고유 ${itemDataSet.size}`);
}

// 대표 변형 데이터 규모(자릿수) — 5,000시드에서 그 변형의 고유 표데이터 수로 하한 추정
console.log("\n======== 대표 변형 데이터 규모(5,000시드 하한) ========");
{
  const targets = ["a2-daverage-round", "b1-rank-if", "c1-vlookup-left"];
  const uniq = {}; targets.forEach((t) => (uniq[t] = new Set()));
  for (const diff of ["기본", "어려움"]) for (let s = 0; s < 5000; s++) {
    const inst = composeExamCalc(`rep~${diff}~${s}`, { count: 5, difficulty: diff });
    for (const it of inst.items) {
      const ex = inst._exam.items.find((x) => x.no === it.no);
      if (targets.includes(ex.variantId)) uniq[ex.variantId].add((it.sourceCells || []).map((a) => inst.cells[a] && inst.cells[a].v).join("|"));
    }
  }
  for (const t of targets) console.log(`  ${t}: 5,000시드 중 고유 표데이터 ≥ ${uniq[t].size} (실제 가짓수는 이 이상, 데이터 생성 자유도상 최소 10^3~10^6+ 추정)`);
}
