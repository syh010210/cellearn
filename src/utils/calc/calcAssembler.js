// src/utils/calc/calcAssembler.js
// 계산작업 조립기: 유형 템플릿 × 시드 → 블록 spec → buildInstance 결과.
//   planItem(subtype, variantId|null, difficulty, rng) → { spec, variantId, retries } | null
//   composeCalc(seed, { subtypes[], difficulty }) → buildInstance 결과(+_meta)
// buildInstance/resolveBlock 는 수정하지 않는다. 같은 시드 → 같은 인스턴스.

import { buildInstance } from "./buildInstance.js";
import { TEMPLATE_A1 } from "../../data/exam/calc/templates/A-1.js";
import { TEMPLATE_A2 } from "../../data/exam/calc/templates/A-2.js";
import { TEMPLATE_A3 } from "../../data/exam/calc/templates/A-3.js";
import { TEMPLATE_A4 } from "../../data/exam/calc/templates/A-4.js";
import { TEMPLATE_B1 } from "../../data/exam/calc/templates/B-1.js";
import { TEMPLATE_B2 } from "../../data/exam/calc/templates/B-2.js";
import { TEMPLATE_B3 } from "../../data/exam/calc/templates/B-3.js";
import { TEMPLATE_C1 } from "../../data/exam/calc/templates/C-1.js";
import { TEMPLATE_C2 } from "../../data/exam/calc/templates/C-2.js";
import { TEMPLATE_D1 } from "../../data/exam/calc/templates/D-1.js";
import { TEMPLATE_D5 } from "../../data/exam/calc/templates/D-5.js";

export const TEMPLATES = { "A-1": TEMPLATE_A1, "A-2": TEMPLATE_A2, "A-3": TEMPLATE_A3, "A-4": TEMPLATE_A4, "B-1": TEMPLATE_B1, "B-2": TEMPLATE_B2, "B-3": TEMPLATE_B3, "C-1": TEMPLATE_C1, "C-2": TEMPLATE_C2, "D-1": TEMPLATE_D1, "D-5": TEMPLATE_D5 };

// 문자열 시드 → 결정적 난수 (basic2Assembler 와 동일 방식)
export function makeRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (const ch of String(seedStr)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next,
    int: (n) => Math.floor(next() * n),
    range: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    sample: (arr, n) => { const idx = arr.map((_, i) => i); const out = []; for (let k = 0; k < n && idx.length; k++) out.push(idx.splice(Math.floor(next() * idx.length), 1)[0]); return out.map((i) => arr[i]); },
    shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  };
}

// 단일 변형 검증·채점을 위한 최소 채움 블록(레이아웃이 3·5블록만 허용하므로 패딩용).
export const FILLER = {
  subtype: "A-2", colWidths: [6, 6, 6], headers: ["항목", "값1", "값2"],
  rows: [[1, 2, null], [3, 5, null], [7, 4, null], [6, 9, null], [8, 11, null], [10, 13, null]],
  result: { kind: "fillCol", col: "값2" },
  answer: "=A3+B3",
  functions: { required: [], candidates: null },
  text: "[{표}]에서 값1[{col:값1}]로 값2[{R}]를 계산하시오. (8점)",
  notes: ["+ 연산자 사용"], accept: [],
};
export const PROBE_FILLERS = [FILLER, FILLER];

const MAX_RETRY = 120;

export function planItem(subtype, variantId, difficulty, rng) {
  const tmpl = TEMPLATES[subtype];
  if (!tmpl) throw new Error(`템플릿 없음: ${subtype}`);
  let cands = tmpl.variants;
  if (variantId) cands = cands.filter((v) => v.id === variantId);
  else if (difficulty) cands = cands.filter((v) => v.difficulty === difficulty);
  if (!cands.length) return null; // 그 난이도 변형 없음 → 3d 에서 처리
  const variant = variantId ? cands[0] : rng.pick(cands);
  let lastErr;
  for (let a = 0; a < MAX_RETRY; a++) {
    try {
      const spec = variant.plan(rng);
      buildInstance({ id: "_probe", blocks: [spec, ...PROBE_FILLERS] }); // 자체 검증 통과 확인
      return { spec, variantId: variant.id, retries: a };
    } catch (e) { lastErr = e; }
  }
  throw new Error(`planItem ${subtype}/${variant.id} ${MAX_RETRY}회 실패: ${lastErr && lastErr.message}`);
}

export function composeCalc(seed, { subtypes, difficulty = "기본" } = {}) {
  const rng = makeRng(seed);
  const blocks = [], variants = []; let retries = 0;
  for (const st of subtypes) {
    const r = planItem(st, null, difficulty, rng);
    if (!r) throw new Error(`${st} 난이도 '${difficulty}' 변형 없음`);
    blocks.push(r.spec); variants.push(r.variantId); retries += r.retries;
  }
  const inst = buildInstance({ id: "calc-" + seed, blocks });
  inst._meta = { seed, subtypes, difficulty, variants, retries };
  return inst;
}
