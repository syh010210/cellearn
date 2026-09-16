// scripts/test-calc-mutation.mjs
// 계산작업 채점기 mutation 테스트: 제출 시뮬레이션 → gradeCalc.
//  · 함수 추출·astToFormula 단위 테스트
//  · 기준 답 만점(조합 여러 개, 한 시트 다문항 독립성)
//  · accept 전부 만점 / reject 전부 불합격 + expectReason 포함
//  · answer.formula 자동 변형: 잡히거나(불합격) allowSurvive 에 있어야 함
//  · 연산자별 생성 수 표(샘플×연산자) 출력

import { Sheet } from "../src/excel-engine/index.js";
import { parseFormula } from "../src/excel-engine/parser.js";
import { shiftFormula } from "../src/utils/formulaUtils.js";
import { engineGetCell } from "../src/utils/calc/cellAdapter.js";
import { gradeCalc } from "../src/utils/calc/calcGrader.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { extractFunctions } from "../src/utils/calc/formulaFunctions.js";
import { astToFormula } from "../src/utils/calc/astToFormula.js";
import { SAMPLES } from "../src/data/exam/calc/samples.js";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) { pass++; } else { fail++; console.log(`✗ ${name}  ${extra}`); } };

// ── A1 유틸 ──
const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const colLetters = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const parseA1 = (a) => { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(a.trim()); return { c: lettersCol(m[1]), r: +m[2] - 1 }; };
function expand1D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const o = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) o.push(colLetters(c) + (r + 1)); return o; }
function expand2D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const rows = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(colLetters(c) + (r + 1)); rows.push(row); } return rows; }
const dateFmt = (z) => !z ? undefined : (/h/i.test(z) ? (/y/i.test(z) ? "datetime" : "time") : (/y/i.test(z) ? "date" : undefined));

// ── 제출 시뮬레이션 ──
function submit(instance, submissions = {}) {
  const sheet = new Sheet();
  for (const [addr, cell] of Object.entries(instance.cells)) {
    if (cell.f !== undefined) sheet.setCellInput(addr, cell.f.startsWith("=") ? cell.f : "=" + cell.f);
    else sheet.setCellValue(addr, cell.v, dateFmt(cell.z));
  }
  for (const it of instance.items) {
    const sub = submissions[it.no] || {};
    const formula = sub.formula !== undefined ? sub.formula : it.answer.formula;
    const { r: ar, c: ac } = parseA1(it.result.anchor);
    for (const a of expand1D(it.result.range)) {
      const { r, c } = parseA1(a);
      if (String(formula).startsWith("=")) sheet.setCellInput(a, shiftFormula(formula, r - ar, c - ac));
      else sheet.setCellInput(a, String(formula)); // 상수 값 입력(noFormula)
    }
    if (it.criteria) {
      const tbl = sub.criteria || it.criteria.table;
      expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const v = tbl[ri]?.[ci]; if (v !== undefined && v !== null && v !== "") sheet.setCellValue(a, v, undefined); }));
    }
  }
  return gradeCalc(instance, engineGetCell(sheet));
}

const norm = (f) => String(f).replace(/\s+/g, "").toUpperCase();

// ══════════════════════ 자동 변형 생성기 ══════════════════════
const ALIAS = (u) => ({ STDEV: "STDEV.S", MODE: "MODE.SNGL" })[u.toUpperCase()] || u.toUpperCase();
const clone = (n) => JSON.parse(JSON.stringify(n));

// 문자열 리터럴 내용을 같은 길이 공백으로 마스킹(정규식이 리터럴 안 참조를 건드리지 않게)
function maskStrings(f) {
  let out = "", i = 0;
  while (i < f.length) {
    if (f[i] === '"') { out += '"'; i++; while (i < f.length) { if (f[i] === '"') { if (f[i + 1] === '"') { out += "  "; i += 2; continue; } out += '"'; i++; break; } out += " "; i++; } }
    else { out += f[i]; i++; }
  }
  return out;
}

function removeFuncFirst(base, fnNorm) {
  let ast; try { ast = parseFormula(base); } catch { return null; }
  let done = false;
  const rec = (n) => {
    if (done || !n || typeof n !== "object") return n;
    if (n.type === "FunctionCall") { if (ALIAS(n.name) === fnNorm && n.args.length) { done = true; return n.args[0]; } n.args = n.args.map(rec); }
    else if (n.type === "BinaryOp") { n.left = rec(n.left); n.right = rec(n.right); }
    else if (n.type === "UnaryOp") { n.operand = rec(n.operand); }
    return n;
  };
  const r = rec(clone(ast));
  return done ? "=" + astToFormula(r) : null;
}
function swapArgsAll(base, fnName, i, j) {
  let ast; try { ast = parseFormula(base); } catch { return null; }
  let any = false;
  const rec = (n) => {
    if (!n || typeof n !== "object") return n;
    if (n.type === "FunctionCall") { n.args = n.args.map(rec); if (n.name.toUpperCase() === fnName && n.args.length > Math.max(i, j)) { const t = n.args[i]; n.args[i] = n.args[j]; n.args[j] = t; any = true; } }
    else if (n.type === "BinaryOp") { n.left = rec(n.left); n.right = rec(n.right); }
    else if (n.type === "UnaryOp") { n.operand = rec(n.operand); }
    return n;
  };
  const c = clone(ast); rec(c);
  return any ? "=" + astToFormula(c) : null;
}

function forEachRange(base, masked, cb) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; let m; const res = [];
  while ((m = re.exec(masked)) !== null) {
    const R = { c1d: m[1], col1: m[2], r1d: m[3], row1: +m[4], c2d: m[5], col2: m[6], r2d: m[7], row2: +m[8] };
    const rep = cb(R); if (rep) res.push(base.slice(0, m.index) + rep + base.slice(m.index + m[0].length));
  }
  return res;
}
function forEachCell(base, masked, cb) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; let m; const res = [];
  while ((m = re.exec(masked)) !== null) {
    const s = m.index, e = s + m[0].length;
    if (masked[s - 1] === ":" || masked[e] === ":" || masked[e] === "(") continue; // 범위 구성원·함수명 제외
    const rep = cb({ cd: m[1], col: m[2], rd: m[3], row: +m[4] }); if (rep) res.push(base.slice(0, s) + rep + base.slice(e));
  }
  return res;
}

// base → [{op, name, formula}]  (직렬화 문자열 기준 중복 제거, 원식 제외)
function mutate(base, required = []) {
  const masked = maskStrings(base);
  const outs = []; const seen = new Set([norm(base)]);
  const add = (op, name, f) => { if (!f) return; const k = norm(f); if (seen.has(k)) return; seen.add(k); outs.push({ op, name, formula: f }); };

  // $ 전부 제거
  add("removeDollar", "$전부제거", base.replace(/\$/g, ""));
  // 반올림 함수 교체
  for (const [from, tos] of [["ROUNDDOWN", ["ROUND", "ROUNDUP"]], ["ROUNDUP", ["ROUND", "ROUNDDOWN"]], ["ROUND", ["ROUNDUP", "ROUNDDOWN"]]])
    if (new RegExp("\\b" + from + "\\s*\\(").test(base)) for (const to of tos) add("roundSwap", from + ">" + to, base.replace(new RegExp("\\b" + from + "\\b"), to));
  // 비교 연산자 교체
  for (const [a, b] of [[">=", ">"], ["<=", "<"], ["<>", "="]]) if (masked.includes(a)) add("cmpSwap", a + ">" + b, base.replace(a, b));
  // RANK.EQ 순서 0↔1 (없으면 ,1 추가)
  if (/RANK\.EQ\s*\(/.test(masked)) {
    if (/RANK\.EQ\([^)]*,\s*1\s*\)/.test(masked)) add("rankOrder", "1>0", base.replace(/(RANK\.EQ\([^)]*),\s*1\s*\)/, "$1,0)"));
    else if (/RANK\.EQ\([^)]*,\s*0\s*\)/.test(masked)) add("rankOrder", "0>1", base.replace(/(RANK\.EQ\([^)]*),\s*0\s*\)/, "$1,1)"));
    else add("rankOrder", "+1", base.replace(/(RANK\.EQ\([^,]+,[^,)]+)\)/, "$1,1)"));
  }
  // 숫자 인수 ±1 ( , 또는 ( 바로 뒤 정수 )
  { const re = /([,(])(\d+)([,)])/g; let m; while ((m = re.exec(masked)) !== null) { const idx = m.index + m[1].length, n = +m[2]; for (const d of [n + 1, n - 1]) { if (d < 0) continue; add("litPM1", n + ">" + d, base.slice(0, idx) + d + base.slice(idx + m[2].length)); } } }
  // 문자열 리터럴 첫 글자 변경 — 리터럴마다 1개 (빈 리터럴은 x)
  { const re = /"([^"]*)"/g; let m; while ((m = re.exec(base)) !== null) { const inner = m[1]; let rep; if (inner === "") rep = "x"; else { const ch = inner[0]; rep = (/[가-힣]/.test(ch) ? String.fromCharCode(ch.charCodeAt(0) + 1) : ch + "X") + inner.slice(1); } add("strLit", "[" + inner + "]", base.slice(0, m.index) + '"' + rep + '"' + base.slice(m.index + m[0].length)); } }
  // required 함수 제거 — 함수마다 1개
  for (const fn of required) add("removeFunc", "del " + fn, removeFuncFirst(base, ALIAS(fn)));
  // a. 범위 끝 1칸 축소
  for (const f of forEachRange(base, masked, (R) => R.row2 > R.row1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2 - 1}` : (lettersCol(R.col2) > lettersCol(R.col1) ? `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${colLetters(lettersCol(R.col2) - 1)}${R.r2d}${R.row2}` : null))) add("rangeShrink", "끝-1", f);
  // b. 범위 시작 1칸 확장(머리글 포함)
  for (const f of forEachRange(base, masked, (R) => R.row1 > 1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1 - 1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : (lettersCol(R.col1) > 0 ? `${R.c1d}${colLetters(lettersCol(R.col1) - 1)}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null))) add("rangeExpand", "시작+1", f);
  // c. 참조 한 칸 밀림(오른쪽 1칸) — 단일 셀 참조마다
  for (const f of forEachCell(base, masked, (C) => `${C.cd}${colLetters(lettersCol(C.col) + 1)}${C.rd}${C.row}`)) add("refShift", "→1", f);
  // d. 부분 $ 제거(시작 셀 $ 만) — 범위마다
  for (const f of forEachRange(base, masked, (R) => (R.c1d || R.r1d) ? `${R.col1}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null)) add("partialDollar", "시작$제거", f);
  // e. 인수 교환
  add("argSwap", "SUMIF 조건↔합계", swapArgsAll(base, "SUMIF", 0, 2));
  add("argSwap", "WORKDAY 두 인수", swapArgsAll(base, "WORKDAY", 0, 1));

  return outs;
}

const OP_ORDER = ["removeDollar", "roundSwap", "cmpSwap", "rankOrder", "litPM1", "strLit", "removeFunc", "rangeShrink", "rangeExpand", "refShift", "partialDollar", "argSwap"];

// ══════════════════════ 1. 단위: 함수 추출 ══════════════════════
console.log("=== 함수 추출 ===");
check("문자열 속 IF( 무시", JSON.stringify(extractFunctions('=CONCATENATE("IF(",A1)').functions.sort()) === '["CONCATENATE"]');
check("중첩", JSON.stringify(extractFunctions('=IFERROR(HLOOKUP(LEFT(A3,2),$E$2:$G$3,2,0),"확인")').functions.sort()) === JSON.stringify(["HLOOKUP", "IFERROR", "LEFT"]));
check("_xlfn.RANK.EQ", extractFunctions("=_xlfn.RANK.EQ(A1,B1:B9)").functions.join() === "RANK.EQ");
check("소문자 입력", extractFunctions("=sum(a1:a9)").functions.join() === "SUM");
check("MissingArg", JSON.stringify(extractFunctions('=IF(A1>1,,"x")').functions.sort()) === '["IF"]');
check("STDEV 동치", extractFunctions("=STDEV(A1:A9)").functions.join() === "STDEV.S");
check("파싱 실패", !!extractFunctions("=SUM(").error);

// ══════════════════════ 2. astToFormula 왕복 ══════════════════════
console.log("=== astToFormula 왕복(함수 집합) ===");
for (const f of ['=ROUND(DAVERAGE(A2:C8,"평점",E1:E2),1)', '=IFERROR(CHOOSE(RANK.EQ(B3,B3:B8),"금",""),"")', '=MONTH(WORKDAY(B3,C3))&"/"&DAY(WORKDAY(B3,C3))', "=SUMIF(B3:B8,E3,C3:C8)/SUM(C3:C8)"]) {
  const a = extractFunctions(f).functions.sort().join(), b = extractFunctions(astToFormula(parseFormula(f))).functions.sort().join();
  check("왕복 " + f.slice(0, 16), a === b, `${a} vs ${b}`);
}

// ══════════════════════ 3. 기준 답 만점(조합) ══════════════════════
console.log("=== 기준 답 만점 ===");
const combos5 = [[0, 1, 2, 3, 4], [5, 4, 3, 2, 1], [2, 0, 4, 1, 3]];
const combos3 = [[0, 1, 2], [3, 4, 5], [5, 2, 0]];
for (const combo of [...combos5, ...combos3]) {
  const inst = buildInstance({ id: "c" + combo.join(""), blocks: combo.map((i) => SAMPLES[i]) });
  const res = submit(inst);
  check("기준답 만점 [" + combo.join(",") + "]", res.earned === res.total, `${res.earned}/${res.total} ` + res.items.filter((i) => !i.ok).map((i) => i.no + ":" + i.reasons[0]).join(" | "));
}
{
  const inst = buildInstance({ id: "indep", blocks: [0, 1, 2, 3, 4].map((i) => SAMPLES[i]) });
  const res = submit(inst, { 3: { formula: "=999" } });
  check("독립성: 3번만 불합격", !res.items[2].ok && res.items.filter((_, i) => i !== 2).every((x) => x.ok), res.items.map((x) => x.no + (x.ok ? "o" : "x")).join(""));
}

// ══════════════════════ 4. 샘플별 accept / reject / 자동 변형 ══════════════════════
console.log("=== accept · reject · 자동 변형 ===");
const opTable = []; // {no, subtype, byOp:{}, mut, caught, survived}
const survivors = [];
SAMPLES.forEach((sample, si) => {
  const combo = [si, (si + 1) % 6, (si + 2) % 6];
  const inst = buildInstance({ id: "s" + si, blocks: combo.map((i) => SAMPLES[i]) });
  const it = inst.items[0];

  for (const acc of sample.accept || []) {
    const r = submit(inst, { 1: { formula: acc } }).items[0];
    check(`[S${si + 1}] accept 만점: ${acc.slice(0, 40)}`, r.ok, r.ok ? "" : r.reasons.join(" / "));
  }
  for (const rej of sample.reject || []) {
    const r = submit(inst, { 1: { formula: rej.formula, criteria: rej.criteria } }).items[0];
    const cats = new Set(r.details.map((d) => d.cat));
    check(`[S${si + 1}] reject 불합격+사유: ${String(rej.formula).slice(0, 34)}`, !r.ok && cats.has(rej.expectReason), `ok=${r.ok} cats=${[...cats].join(",")} 기대=${rej.expectReason}`);
  }

  const surviveSet = (sample.allowSurvive || []).map((x) => norm(x.formula));
  const byOp = {}; let mut = 0, caught = 0, survived = 0;
  for (const m of mutate(it.answer.formula, sample.functions?.required || [])) {
    byOp[m.op] = (byOp[m.op] || 0) + 1; mut++;
    const r = submit(inst, { 1: { formula: m.formula } }).items[0];
    if (r.ok) { survived++; const allowed = surviveSet.includes(norm(m.formula)); if (!allowed) survivors.push({ s: si + 1, op: m.op, name: m.name, formula: m.formula }); check(`[S${si + 1}] 생존 변형 allowSurvive 등재: ${m.op}/${m.name}`, allowed, `생존식=${m.formula}`); }
    else caught++;
  }
  opTable.push({ no: si + 1, subtype: sample.subtype, byOp, mut, caught, survived });
});

// ── 연산자별 생성 수 표 ──
console.log("\n=== 연산자별 생성 수 (샘플 × 연산자) ===");
console.log(["샘플", ...OP_ORDER, "합계"].join("\t"));
for (const r of opTable) console.log([`${r.no}(${r.subtype})`, ...OP_ORDER.map((op) => r.byOp[op] || 0), r.mut].join("\t"));
console.log("\n=== 샘플별 잡힘/생존 ===");
console.log("샘플 | 생성 | 잡힘 | 생존");
for (const r of opTable) console.log(`${r.no}(${r.subtype}) | ${r.mut} | ${r.caught} | ${r.survived}`);
if (survivors.length) { console.log("\n[미등재 생존]"); for (const s of survivors) console.log(`  S${s.s} ${s.op}/${s.name}: ${s.formula}`); }

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
