// scripts/scan-josa.mjs — 전 변형 200시드 지시문·▶ 조사 위반 스캔(수정 대상 파악용)
import { makeRng, planItem, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { josaViolations } from "./_josaCheck.mjs";

const agg = new Map();   // `${variant}|${word}${josa}→${expect}` → {cnt, ctx}
let scanned = 0;
for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
  for (let s = 0; s < 200; s++) {
    let spec; try { spec = planItem(st, v.id, v.difficulty, makeRng(`${v.id}#josa${s}`)).spec; } catch { continue; }
    const it = buildInstance({ id: "d", blocks: [spec, FILLER, FILLER] }).items.find((x) => x._blockIndex === 0);
    scanned++;
    for (const line of [it.text, ...(it.notes || [])]) {
      for (const vio of josaViolations(line)) {
        const k = `${v.id} | ${vio.word}+${vio.josa} → ${vio.expect}`;
        const e = agg.get(k) || { cnt: 0, ctx: vio.ctx };
        e.cnt++; agg.set(k, e);
      }
    }
  }
}
console.log(`스캔 ${scanned}건, 위반 종류 ${agg.size}`);
for (const [k, e] of [...agg.entries()].sort()) console.log(`  ${k}  (${e.cnt}회)  «${e.ctx}»`);
