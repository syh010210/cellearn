// scripts/dump-topic-variety.mjs → trial_test/calc-dump/topic-variety.md
// _topic 을 가진 변형별: 주제 묶음마다 표본 1개(최대 6) — 전체 지시문 + ▶ 줄 + 머리글 행 + 결과 예 2개.
import fs from "node:fs";
import path from "node:path";
import { makeRng, planItem, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";

const expDisp = (v) => (v && typeof v === "object" && v.error) ? v.error : typeof v === "string" ? `"${v}"` : String(v);

const out = ["# 계산작업 주제 묶음 다양성 (topic-variety)", "",
  "`_topic` 메타를 가진 변형별로, 서로 다른 주제 묶음마다 표본 1개(최대 6개)를 뽑았다.",
  "머리글(코드 열·결과 열 포함)·결과 문자열·▶ 안내가 한 묶음에서 함께 나오는지 확인용.", ""];

for (const [st, t] of Object.entries(TEMPLATES)) {
  for (const v of t.variants) {
    const seen = new Map();                              // 묶음 id → 표본
    for (let s = 0; s < 400 && seen.size < 6; s++) {
      let spec; try { spec = planItem(st, v.id, v.difficulty, makeRng(`${v.id}~tv${s}`)).spec; } catch { continue; }
      if (!spec._topic || seen.has(spec._topic.id)) continue;
      const inst = buildInstance({ id: "d", blocks: [spec, FILLER, FILLER] });
      const it = inst.items.find((x) => x._blockIndex === 0);
      const vals = [...new Set(Object.values(it.expected).map(expDisp))].slice(0, 2);
      seen.set(spec._topic.id, { pool: spec._topic.pool, text: it.text, notes: it.notes || [], headers: spec.headers, vals });
    }
    if (!seen.size) continue;
    out.push(`## ${v.id} [${v.difficulty}] — 묶음 ${seen.size}종 (풀: ${[...seen.values()][0].pool})`, "");
    for (const [id, smp] of seen) {
      out.push(`### 묶음 \`${id}\``);
      out.push(`> ${smp.text}`);
      for (const n of smp.notes) out.push(`> ▶ ${n}`);
      out.push("", `- 머리글: ${smp.headers.map((h) => `**${h}**`).join(" | ")}`, `- 결과 예: ${smp.vals.join(", ")}`, "");
    }
  }
}

const dir = path.join(process.cwd(), "trial_test", "calc-dump");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "topic-variety.md");
fs.writeFileSync(file, out.join("\n"), "utf8");
console.log("wrote", file, `(${out.join("\n").length} bytes)`);
