// scripts/_calcTestUtil.mjs
// 계산작업 테스트 공용: 제출 시뮬레이션(submit) + 자동 변형 생성기(mutate).
import { Sheet } from "../src/excel-engine/index.js";
import { parseFormula } from "../src/excel-engine/parser.js";
import { shiftFormula } from "../src/utils/formulaUtils.js";
import { engineGetCell } from "../src/utils/calc/cellAdapter.js";
import { gradeCalc } from "../src/utils/calc/calcGrader.js";
import { astToFormula } from "../src/utils/calc/astToFormula.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";

export const COL = (i) => { let s = "", n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
export const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
export const parseA1 = (a) => { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(a.trim()); return { c: lettersCol(m[1]), r: +m[2] - 1 }; };
export function expand1D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const o = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) o.push(COL(c) + (r + 1)); return o; }
export function expand2D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const rows = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(COL(c) + (r + 1)); rows.push(row); } return rows; }
const dateFmt = (z) => !z ? undefined : (/h/i.test(z) ? (/y/i.test(z) ? "datetime" : "time") : (/y/i.test(z) ? "date" : undefined));

// ── 제출 시뮬레이션 ──
export function submit(instance, submissions = {}) {
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
      else sheet.setCellInput(a, String(formula));
    }
    if (it.criteria) {
      const tbl = sub.criteria || it.criteria.table;
      expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const v = tbl[ri]?.[ci]; if (v !== undefined && v !== null && v !== "") sheet.setCellValue(a, v, undefined); }));
    }
  }
  return gradeCalc(instance, engineGetCell(sheet));
}

export const norm = (f) => String(f).replace(/\s+/g, "").toUpperCase();

// instance.cells → getCell(addr) (정적 값 셀용; survivorRules lookupLeadingText 에 전달)
export function cellsGetCell(cells) {
  return (addr) => { const c = cells[String(addr).toUpperCase()]; if (!c) return null; if (c.f !== undefined) return { f: c.f }; return { v: c.v, t: c.t || (typeof c.v === "number" ? "n" : "s") }; };
}

// 공통 검증: 지시문 좌표 무결성. 반드시 "해석된 item.text"(place­holder 아님)에 적용한다.
// 블록0이 원점(0,0)에 놓이므로 절대 주소 = 블록-상대 주소.
export function validateText(item, spec) {
  const b = resolveBlock(spec, "표1");
  const cellAt = (r, c) => { const p = b.fileCells.find((x) => x.r === r && x.c === c); return p ? p.v : undefined; };
  const roleAt = (r, c) => b.roles.get(`${r},${c}`);
  const refLabel = (b.fileCells.find((x) => x.role === "reflabel") || {}).v;
  const errs = [];
  const re = /([^\[\]\s,]+)\[([A-Z]+\d+)(?::([A-Z]+\d+))?\]/g; let m;
  while ((m = re.exec(item.text)) !== null) {
    const word = m[1], p1 = parseA1(m[2]), p2 = parseA1(m[3] || m[2]);
    const isRef = roleAt(p1.r, p1.c) === "refheader";
    if (isRef) {                                   // 표이름[{T}]
      if (refLabel !== undefined && word !== refLabel) errs.push(`표이름 '${word}' ≠ 라벨 '${refLabel}' [${m[2]}]`);
      for (let r = p1.r; r <= p2.r; r++) for (let c = p1.c; c <= p2.c; c++) { const ro = roleAt(r, c); if (ro === "reflabel" || ro === "reflabelcol") errs.push(`{T} 범위에 ${ro} 셀 [${m[2]}]`); }
    } else if (p1.c === p2.c && p1.r >= 2) {        // 열이름[범위] (본표 열)
      const h = cellAt(p1.r - 1, p1.c);
      if (h !== undefined && h !== word) errs.push(`열 '${word}' ≠ 머리글 '${h}' [${m[2]}]`);
    }
  }
  for (const note of item.notes || []) {           // 산식·규칙 줄 본표 열은 본문에 존재
    if (!/[=×*]/.test(note)) continue;
    for (const h of spec.headers) if (note.includes(h) && !item.text.includes(`${h}[`)) errs.push(`산식 열 '${h}' 본문 누락`);
  }
  return errs;
}

// ── 자동 변형 생성기 ──
const ALIAS = (u) => ({ STDEV: "STDEV.S", MODE: "MODE.SNGL" })[u.toUpperCase()] || u.toUpperCase();
const clone = (n) => JSON.parse(JSON.stringify(n));
function maskStrings(f) { let out = "", i = 0; while (i < f.length) { if (f[i] === '"') { out += '"'; i++; while (i < f.length) { if (f[i] === '"') { if (f[i + 1] === '"') { out += "  "; i += 2; continue; } out += '"'; i++; break; } out += " "; i++; } } else { out += f[i]; i++; } } return out; }
function removeFuncFirst(base, fnNorm) {
  let ast; try { ast = parseFormula(base); } catch { return null; }
  let done = false;
  const rec = (n) => { if (done || !n || typeof n !== "object") return n; if (n.type === "FunctionCall") { if (ALIAS(n.name) === fnNorm && n.args.length) { done = true; return n.args[0]; } n.args = n.args.map(rec); } else if (n.type === "BinaryOp") { n.left = rec(n.left); n.right = rec(n.right); } else if (n.type === "UnaryOp") { n.operand = rec(n.operand); } return n; };
  const r = rec(clone(ast)); return done ? "=" + astToFormula(r) : null;
}
function swapArgsAll(base, fnName, i, j) {
  let ast; try { ast = parseFormula(base); } catch { return null; }
  let any = false;
  const rec = (n) => { if (!n || typeof n !== "object") return n; if (n.type === "FunctionCall") { n.args = n.args.map(rec); if (n.name.toUpperCase() === fnName && n.args.length > Math.max(i, j)) { const t = n.args[i]; n.args[i] = n.args[j]; n.args[j] = t; any = true; } } else if (n.type === "BinaryOp") { n.left = rec(n.left); n.right = rec(n.right); } else if (n.type === "UnaryOp") { n.operand = rec(n.operand); } return n; };
  const c = clone(ast); rec(c); return any ? "=" + astToFormula(c) : null;
}
function forEachRange(base, masked, cb) { const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; let m; const res = []; while ((m = re.exec(masked)) !== null) { const R = { c1d: m[1], col1: m[2], r1d: m[3], row1: +m[4], c2d: m[5], col2: m[6], r2d: m[7], row2: +m[8] }; const rep = cb(R); if (rep) res.push(base.slice(0, m.index) + rep + base.slice(m.index + m[0].length)); } return res; }
function forEachCell(base, masked, cb) { const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; let m; const res = []; while ((m = re.exec(masked)) !== null) { const s = m.index, e = s + m[0].length; if (masked[s - 1] === ":" || masked[e] === ":" || masked[e] === "(") continue; const rep = cb({ cd: m[1], col: m[2], rd: m[3], row: +m[4] }); if (rep) res.push(base.slice(0, s) + rep + base.slice(e)); } return res; }

export const OP_ORDER = ["removeDollar", "roundSwap", "cmpSwap", "rankOrder", "litPM1", "strLit", "removeFunc", "rangeShrink", "rangeExpand", "refShift", "partialDollar", "argSwap"];

export function mutate(base, required = []) {
  const masked = maskStrings(base);
  const outs = []; const seen = new Set([norm(base)]);
  const add = (op, name, f) => { if (!f) return; const k = norm(f); if (seen.has(k)) return; seen.add(k); outs.push({ op, name, formula: f }); };
  add("removeDollar", "$전부제거", base.replace(/\$/g, ""));
  for (const [from, tos] of [["ROUNDDOWN", ["ROUND", "ROUNDUP"]], ["ROUNDUP", ["ROUND", "ROUNDDOWN"]], ["ROUND", ["ROUNDUP", "ROUNDDOWN"]]])
    if (new RegExp("\\b" + from + "\\s*\\(").test(base)) for (const to of tos) add("roundSwap", from + ">" + to, base.replace(new RegExp("\\b" + from + "\\b"), to));
  for (const [a, b] of [[">=", ">"], ["<=", "<"], ["<>", "="]]) if (masked.includes(a)) add("cmpSwap", a + ">" + b, base.replace(a, b));
  if (/RANK\.EQ\s*\(/.test(masked)) {
    if (/RANK\.EQ\([^)]*,\s*1\s*\)/.test(masked)) add("rankOrder", "1>0", base.replace(/(RANK\.EQ\([^)]*),\s*1\s*\)/, "$1,0)"));
    else if (/RANK\.EQ\([^)]*,\s*0\s*\)/.test(masked)) add("rankOrder", "0>1", base.replace(/(RANK\.EQ\([^)]*),\s*0\s*\)/, "$1,1)"));
    else add("rankOrder", "+1", base.replace(/(RANK\.EQ\([^,]+,[^,)]+)\)/, "$1,1)"));
  }
  { const re = /([,(])(\d+)([,)])/g; let m; while ((m = re.exec(masked)) !== null) { const idx = m.index + m[1].length, n = +m[2]; for (const d of [n + 1, n - 1]) { if (d < 0) continue; add("litPM1", n + ">" + d, base.slice(0, idx) + d + base.slice(idx + m[2].length)); } } }
  { const re = /"([^"]*)"/g; let m; while ((m = re.exec(base)) !== null) { const inner = m[1]; let rep; if (inner === "") rep = "x"; else { const ch = inner[0]; rep = (/[가-힣]/.test(ch) ? String.fromCharCode(ch.charCodeAt(0) + 1) : ch + "X") + inner.slice(1); } add("strLit", "[" + inner + "]", base.slice(0, m.index) + '"' + rep + '"' + base.slice(m.index + m[0].length)); } }
  for (const fn of required) add("removeFunc", "del " + fn, removeFuncFirst(base, ALIAS(fn)));
  for (const f of forEachRange(base, masked, (R) => R.row2 > R.row1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2 - 1}` : (lettersCol(R.col2) > lettersCol(R.col1) ? `${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${COL(lettersCol(R.col2) - 1)}${R.r2d}${R.row2}` : null))) add("rangeShrink", "끝-1", f);
  for (const f of forEachRange(base, masked, (R) => R.row1 > 1 ? `${R.c1d}${R.col1}${R.r1d}${R.row1 - 1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : (lettersCol(R.col1) > 0 ? `${R.c1d}${COL(lettersCol(R.col1) - 1)}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null))) add("rangeExpand", "시작+1", f);
  for (const f of forEachCell(base, masked, (C) => `${C.cd}${COL(lettersCol(C.col) + 1)}${C.rd}${C.row}`)) add("refShift", "→1", f);
  for (const f of forEachRange(base, masked, (R) => (R.c1d || R.r1d) ? `${R.col1}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}` : null)) add("partialDollar", "시작$제거", f);
  add("argSwap", "SUMIF 조건↔합계", swapArgsAll(base, "SUMIF", 0, 2));
  add("argSwap", "WORKDAY 두 인수", swapArgsAll(base, "WORKDAY", 0, 1));
  return outs;
}
