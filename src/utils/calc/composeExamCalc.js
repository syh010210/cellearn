// src/utils/calc/composeExamCalc.js
// 계산작업 시험 구성기: 시드 → 대유형 분포 추첨 → 소유형·변형 후보 필터 → 제약 만족 조합 → composeCalc(순열 배치).
//   composeExamCalc(seed, { count: 3|5, difficulty }) → composeCalc 인스턴스 (+ _meta 확장: 문항별 subtype·variantId·resultKind)
// 제약(3d-2b):
//   · 소유형 중복 없음 · coreFunctions 교집합 없음(전 문항 쌍)
//   · 5문항: A 2개 중 정확히 1개 usesD / single 2~3·채우기 2~3
//   · 3문항: A 1개가 usesD 50% / single 1~2
//   · C 2개면 하나는 HLOOKUP 계열, 하나는 VLOOKUP·INDEX/MATCH 계열
//   · 난이도 풀(v.difficulty===difficulty)에 없는 변형은 후보 제외
//   · 제약 불만족·레이아웃(20열) 실패면 다른 조합으로 재시도(상한 50, 초과 시 예외)
// 결정적: 같은 seed·설정 → 같은 인스턴스.
import { TEMPLATES, composeCalc, makeRng } from "./calcAssembler.js";

const FILL_KINDS = new Set(["fillCol", "fillRow", "table"]);
const MAX_ATTEMPTS = 50;

// 난이도 풀에서 대유형(A~D) → 변형 메타 목록
function metaPool(difficulty) {
  const pool = { A: [], B: [], C: [], D: [] };
  for (const [st, t] of Object.entries(TEMPLATES)) {
    const letter = st[0];
    if (!pool[letter]) continue;
    for (const v of t.variants) {
      if (v.difficulty !== difficulty) continue;
      pool[letter].push({ subtype: st, id: v.id, resultKind: v.resultKind, usesD: v.usesD, core: v.core });
    }
  }
  return pool;
}

const isFill = (m) => FILL_KINDS.has(m.resultKind);
const disjoint = (a, b) => !a.core.some((f) => b.core.includes(f));
const hlookupFam = (m) => m.core.includes("HLOOKUP");
const vlookupFam = (m) => m.core.includes("VLOOKUP") || m.core.includes("INDEX") || m.core.includes("MATCH");

// 같은 소유형 없이 n개를 무작위로 뽑되 필터·짝 제약을 만족. 실패 시 null.
function pickDistinct(rng, list, n, predSet) {
  const bySub = new Map();
  for (const m of list) { if (!bySub.has(m.subtype)) bySub.set(m.subtype, []); bySub.get(m.subtype).push(m); }
  const subs = rng.shuffle([...bySub.keys()]);
  const out = [];
  for (const sub of subs) {
    if (out.length === n) break;
    const cand = rng.pick(bySub.get(sub));
    if (predSet && !predSet(cand, out)) continue;
    out.push(cand);
  }
  return out.length === n ? out : null;
}

// A 2개: 정확히 1개 usesD, 소유형 다름
function pickA2(rng, poolA) {
  const dPool = poolA.filter((m) => m.usesD), nPool = poolA.filter((m) => !m.usesD);
  if (!dPool.length || !nPool.length) return null;
  const a1 = rng.pick(dPool);
  const a2cands = nPool.filter((m) => m.subtype !== a1.subtype && disjoint(m, a1));
  if (!a2cands.length) return null;
  return rng.chance(0.5) ? [a1, rng.pick(a2cands)] : [rng.pick(a2cands), a1];
}

// A 1개: usesD 여부 지정
function pickA1(rng, poolA, wantD) {
  const p = poolA.filter((m) => m.usesD === wantD);
  return p.length ? [rng.pick(p)] : null;
}

// C 2개: HLOOKUP 계열 1 + VLOOKUP·INDEX 계열 1, 소유형 다름·core 교집합 없음
function pickC2(rng, poolC) {
  const h = rng.shuffle(poolC.filter(hlookupFam)), v = rng.shuffle(poolC.filter(vlookupFam));
  for (const a of h) for (const b of v) if (a.subtype !== b.subtype && disjoint(a, b)) return rng.chance(0.5) ? [a, b] : [b, a];
  return null;
}

// 전 문항 쌍 core 교집합 없음
function allDisjoint(metas) {
  for (let i = 0; i < metas.length; i++) for (let j = i + 1; j < metas.length; j++) if (!disjoint(metas[i], metas[j])) return false;
  return true;
}

function resultKindOk(metas, count) {
  const fill = metas.filter(isFill).length, single = metas.length - fill;
  return count === 5 ? (single >= 2 && single <= 3 && fill >= 2 && fill <= 3) : (single >= 1 && single <= 2);
}

// 한 번의 조합 추첨(제약 검사까지). 실패 시 null.
function drawCombo(rng, pool, count) {
  let metas;
  if (count === 5) {
    const roll = rng.next();
    const shape = roll < 0.70 ? { B: 1, C: 1, D: 1 } : roll < 0.85 ? { B: 2, C: 1, D: 0 } : { B: 1, C: 2, D: 0 };
    const A = pickA2(rng, pool.A); if (!A) return null;
    const B = pickDistinct(rng, pool.B, shape.B, (c, out) => out.every((o) => disjoint(c, o))); if (!B) return null;
    const C = shape.C === 2 ? pickC2(rng, pool.C) : pickDistinct(rng, pool.C, 1, null); if (!C) return null;
    const D = shape.D === 1 ? pickDistinct(rng, pool.D, 1, null) : []; if (shape.D === 1 && !D) return null;
    metas = [...A, ...B, ...C, ...D];
  } else {
    const A = pickA1(rng, pool.A, rng.chance(0.5)); if (!A) return null;
    const B = pickDistinct(rng, pool.B, 1, null); if (!B) return null;
    const last = rng.chance(0.5) ? pickDistinct(rng, pool.C, 1, null) : pickDistinct(rng, pool.D, 1, null);
    if (!last) return null;
    metas = [...A, ...B, ...last];
  }
  if (new Set(metas.map((m) => m.subtype)).size !== metas.length) return null; // 소유형 중복 없음
  if (!allDisjoint(metas)) return null;
  if (!resultKindOk(metas, count)) return null;
  return metas;
}

export function composeExamCalc(seed, { count = 5, difficulty = "기본" } = {}) {
  if (count !== 3 && count !== 5) throw new Error(`count 는 3 또는 5 (받음: ${count})`);
  const pool = metaPool(difficulty);
  const rng = makeRng(seed + "~exam~" + count + "~" + difficulty);
  let lastErr;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const metas = drawCombo(rng, pool, count);
    if (!metas) continue;
    const subtypes = metas.map((m) => m.subtype), variantIds = metas.map((m) => m.id);
    let inst;
    try {
      inst = composeCalc(`${seed}~exam#${attempt}`, { subtypes, difficulty, variants: variantIds });
    } catch (e) { lastErr = e; continue; }   // 레이아웃(20열) 등 실패 → 다른 조합
    inst._exam = {
      seed, count, difficulty, attempt,
      items: inst.items.map((it, i) => ({ no: it.no, subtype: metas[i].subtype, variantId: variantIds[i], resultKind: metas[i].resultKind, usesD: metas[i].usesD, core: metas[i].core })),
    };
    return inst;
  }
  throw new Error(`composeExamCalc ${MAX_ATTEMPTS}회 실패 (seed=${seed}, count=${count}, ${difficulty})${lastErr ? ": " + lastErr.message : ""}`);
}
