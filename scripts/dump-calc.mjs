// scripts/dump-calc.mjs → trial_test/calc-dump/3b-1.md
// 등록된 변형 × 시드 2개: 지시문·▶ 줄, 블록 셀 격자(결과·조건 칸 ◻), 기준 수식, 기대값.
import fs from "node:fs";
import path from "node:path";
import { makeRng, planItem, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";
import { classifySurvivor } from "../src/utils/calc/survivorRules.js";
import { submit, mutate, cellsGetCell, validateText } from "./_calcTestUtil.mjs";

let failed = 0;

const COL = (i) => { let s = "", n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const expDisp = (v) => (v && typeof v === "object" && v.error) ? v.error : typeof v === "string" ? `"${v}"` : String(v);
// 표시 형식 적용(콤마·소수 자릿수)
function fmt(x, z) {
  if (typeof x !== "number") return String(x);
  if (z === "0.0") return x.toFixed(1);
  if (z === "0.00") return x.toFixed(2);
  if (z === "0%") return Math.round(x * 100) + "%";
  if (z === "#,##0" || Math.abs(x) >= 1000) return x.toLocaleString("en-US");
  return String(x);
}

function gridMd(spec) {
  const b = resolveBlock(spec, "표1");
  const W = b.width, H = b.height;
  const g = Array.from({ length: H }, () => Array(W).fill(""));
  for (const p of b.fileCells) g[p.r][p.c] = p.f ? p.f : fmt(p.v, p.z); // p.z = 셀에 지정된 표시 형식(본표 colZ·refTable z)
  for (const rc of b.result.cells) g[rc.r][rc.c] = "◻";                 // 결과 칸
  if (b.criteria) for (let r = b.criteria.range.r1; r <= b.criteria.range.r2; r++) for (let c = b.criteria.range.c1; c <= b.criteria.range.c2; c++) g[r][c] = "◻"; // 조건 칸
  const head = "| 행 | " + Array.from({ length: W }, (_, c) => COL(c)).join(" | ") + " |";
  const sep = "|---|" + Array.from({ length: W }, () => "---").join("|") + "|";
  const body = g.map((row, r) => `| ${r + 1} | ` + row.map((x) => x === "" ? "" : x).join(" | ") + " |").join("\n");
  return [head, sep, body].join("\n");
}

// 변형별 mutation 요약: 생성/값/함수/조건/규칙 생존. 테스트와 같은 getCell·classifySurvivor 사용.
function mutSummary(inst) {
  const it = inst.items[0];
  const gc = cellsGetCell(inst.cells);
  let gen = 0, v = 0, f = 0, c = 0, ruled = 0, bad = 0;
  for (const m of mutate(it.answer.formula, it.functions?.required || [])) {
    gen++;
    const rr = submit(inst, { 1: { formula: m.formula } }).items[0];
    if (rr.ok) { classifySurvivor(it.answer.formula, m.formula, it, gc) ? ruled++ : bad++; continue; }
    const cats = new Set(rr.details.map((d) => d.cat));
    if (cats.has("value") || cats.has("parse")) v++;
    else if (cats.has("functionMissing") || cats.has("functionOutside")) f++;
    else if (cats.has("criteria")) c++;
  }
  if (bad) failed++;
  return `생성 ${gen} · 값 ${v} · 함수 ${f} · 조건 ${c} · 규칙생존 ${ruled}${bad ? ` · ⚠미규칙 ${bad}` : ""}`;
}

// 인자: [outName] [subtypes,쉼표]  (기본: 3b-1 · 전체)
const outName = process.argv[2] || "3b-1";
const subs = process.argv[3] ? process.argv[3].split(",") : null;
const out = [`# 계산작업 ${outName} 검토`, "", "각 변형 × 시드 2개. ◻ = 학생이 채우는 결과·조건 칸(문제 파일에서 비어 있음).", ""];
for (const [st, t] of Object.entries(TEMPLATES)) {
  if (subs && !subs.includes(st)) continue;
  out.push(`## ${st}`);
  for (const v of t.variants) {
    out.push(`### ${v.id} [${v.difficulty}]`);
    for (let s = 0; s < 2; s++) {
      const r = planItem(st, v.id, v.difficulty, makeRng(`${v.id}@${s}`));
      const inst = buildInstance({ id: "d", blocks: [r.spec, FILLER, FILLER] });
      const it = inst.items[0];
      out.push(`**시드 ${s}** (재시도 ${r.retries})`, "", `> ${it.text}`);
      for (const n of it.notes) out.push(`> ▶ ${n}`);
      out.push("", gridMd(r.spec), "", `- 기준 수식: \`${it.answer.formula}\``, `- 기대값: ${Object.entries(it.expected).map(([a, val]) => `${a}=${expDisp(val)}`).join(", ")}`, `- mutation: ${mutSummary(inst)}`);
      const verr = validateText(it, r.spec);
      if (verr.length) { failed++; out.push(`- ⚠ 검증 실패: ${verr.join(" / ")}`); }
      out.push("");
    }
  }
}

// 보고용 확인표: 변형 × 시드 0·1 — 본문 60자·조건행 위치·표시 예 (보고 근거)
out.push("## 보고용 확인표", "", "| 변형 | 시드 | 본문(앞 60자) | 조건행 위치 | 표시 예 |", "|---|--|---|---|---|");
for (const [st, t] of Object.entries(TEMPLATES)) {
  if (subs && !subs.includes(st)) continue;
  for (const v of t.variants) for (let s = 0; s < 2; s++) {
    const r = planItem(st, v.id, v.difficulty, makeRng(`${v.id}@${s}`));
    const it = buildInstance({ id: "d", blocks: [r.spec, FILLER, FILLER] }).items[0];
    const mrows = (r.spec.matchDecls || []).map((d) => { const c = r.spec.headers.indexOf(d.col); return `${d.value}[${r.spec.rows.map((row, i) => String(row[c]) === String(d.value) ? i + 3 : null).filter((x) => x != null).join(",")}]`; }).join(" ");
    const ex = ((it.notes || []).join(" ").match(/표시 예[^\]]*/) || ["-"])[0];
    out.push(`| ${v.id} | ${s} | ${it.text.slice(0, 60)} | ${mrows || "-"} | ${ex} |`);
  }
}

const dir = path.join(process.cwd(), "trial_test", "calc-dump");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${outName}.md`);
fs.writeFileSync(file, out.join("\n"), "utf8");
console.log("wrote", file, `(${out.join("\n").length} bytes)`);
if (failed) { console.log(`⚠ 검증/미규칙 실패 ${failed}건 — ${outName}.md 참조`); process.exit(1); }
