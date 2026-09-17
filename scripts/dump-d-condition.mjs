// scripts/dump-d-condition.mjs → trial_test/calc-dump/d-condition.md
// D함수 조건 형태 규칙: 규칙1(표 칸) 변형 × 시드 2, 규칙2·3(밖) 변형 × 시드 1. 지시문·표·기준 수식.
import fs from "node:fs";
import path from "node:path";
import { makeRng, planItem, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";

const COL = (i) => { let s = "", n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const pad2 = (n) => String(n).padStart(2, "0");
function fmt(x, z) {
  if (typeof x !== "number") return String(x);
  if (z === "0.0") return x.toFixed(1); if (z === "0.00") return x.toFixed(2);
  if (z === "yyyy-mm-dd") { const d = new Date(Date.UTC(1899, 11, 30) + x * 86400000); return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`; }
  if (z === "#,##0" || Math.abs(x) >= 1000) return x.toLocaleString("en-US");
  return String(x);
}
function gridMd(spec) {
  const b = resolveBlock(spec, "표1");
  const W = b.width, H = b.height;
  const g = Array.from({ length: H }, () => Array(W).fill(""));
  for (const p of b.fileCells) g[p.r][p.c] = p.f ? p.f : fmt(p.v, p.z);
  for (const rc of b.result.cells) g[rc.r][rc.c] = "◻";
  if (b.criteria) for (let r = b.criteria.range.r1; r <= b.criteria.range.r2; r++) for (let c = b.criteria.range.c1; c <= b.criteria.range.c2; c++) g[r][c] = g[r][c] === "" ? "◻" : g[r][c];
  const head = "| 행 | " + Array.from({ length: W }, (_, c) => COL(c)).join(" | ") + " |";
  const sep = "|---|" + Array.from({ length: W }, () => "---").join("|") + "|";
  const body = g.map((row, r) => `| ${r + 1} | ` + row.join(" | ") + " |").join("\n");
  return [head, sep, body].join("\n");
}

// 규칙 분류 (usesD 변형)
const RULE = {
  "a1-dcounta-single": 1, "a2-daverage-diff": 1, "a6-dsum-basic": 1, "a6-dsum-roundup": 1, "c3-vlookup-dmax": 1,
  "a2-daverage-round": 2, "a3-dmax-dmin": 2, "a1-dcounta-or": 3,
};

const out = ["# 계산작업 D함수 조건 형태 (d-condition)", "",
  "규칙1 = 표 칸 형태(조건을 표 안 머리글+첫 데이터 행으로, `item.criteria` 없음).",
  "규칙2 = 와일드카드·비교 조건(밖), 규칙3 = 조건 2개 이상(밖). ◻ = 학생이 채우는 결과·조건 칸.", ""];

for (const [st, t] of Object.entries(TEMPLATES)) {
  for (const v of t.variants) {
    const rule = RULE[v.id]; if (rule === undefined) continue;
    const seeds = rule === 1 ? [0, 1] : [0];               // 규칙1 × 2, 규칙2·3 × 1
    out.push(`## ${v.id} [${v.difficulty}] — 규칙 ${rule}`);
    for (const s of seeds) {
      const r = planItem(st, v.id, v.difficulty, makeRng(`${v.id}@dc${s}`));
      const inst = buildInstance({ id: "d", blocks: [r.spec, FILLER, FILLER] });
      const it = inst.items.find((x) => x._blockIndex === 0);
      out.push(`**시드 ${s}**`, "", `> ${it.text}`);
      for (const n of it.notes) out.push(`> ▶ ${n}`);
      out.push("", gridMd(r.spec), "", `- 기준 수식: \`${it.answer.formula}\``,
        `- item.criteria: ${it.criteria ? `있음(밖) 범위 ${it.criteria.range}` : "null(표 칸)"}`, "");
    }
  }
}

const dir = path.join(process.cwd(), "trial_test", "calc-dump");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "d-condition.md");
fs.writeFileSync(file, out.join("\n"), "utf8");
console.log("wrote", file, `(${out.join("\n").length} bytes)`);
