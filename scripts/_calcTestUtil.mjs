// scripts/_calcTestUtil.mjs
// 계산작업 테스트 공용: 제출 시뮬레이션(submit) + 자동 변형 생성기(mutate).
import { Sheet } from "../src/excel-engine/index.js";
import { parseFormula } from "../src/excel-engine/parser.js";
import { shiftFormula } from "../src/utils/formulaUtils.js";
import { engineGetCell } from "../src/utils/calc/cellAdapter.js";
import { gradeCalc } from "../src/utils/calc/calcGrader.js";
import { astToFormula } from "../src/utils/calc/astToFormula.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";
import { NAMES } from "../src/data/exam/calc/pools.js";
const NAMESET = new Set(NAMES);

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

// 인스턴스 셀 + 조건 셀을 올린 뒤 result anchor 에 formula 를 넣어 값을 얻는다(공통 검증용).
export function evalAt(instance, item, formula) {
  const sheet = new Sheet();
  for (const [addr, cell] of Object.entries(instance.cells)) { if (cell.f !== undefined) sheet.setCellInput(addr, cell.f.startsWith("=") ? cell.f : "=" + cell.f); else sheet.setCellValue(addr, cell.v, dateFmt(cell.z)); }
  if (item.criteria) { const tbl = item.criteria.table; expand2D(item.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const v = tbl[ri]?.[ci]; if (v !== undefined && v !== null && v !== "") sheet.setCellValue(a, v, undefined); })); }
  sheet.setCellInput(item.result.anchor, String(formula).startsWith("=") ? formula : "=" + formula);
  const v = sheet.getCellValue(item.result.anchor);
  return (v && typeof v === "object" && v.error) ? "E:" + v.error : v;
}

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
      if (refLabel !== undefined && word !== String(refLabel).replace(/^<|>$/g, "")) errs.push(`표이름 '${word}' ≠ 라벨 '${refLabel}' [${m[2]}]`);
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
  // 표시 예 출력이 기대값(결과 셀)과 같으면 실패 ("N명" 포함)
  const expStrs = new Set(Object.values(item.expected).map((v) => (v && typeof v === "object" && v.error) ? "E:" + v.error : String(v)));
  for (const note of item.notes || []) {
    const mm = /표시\s*예\s*[:：]?\s*([^\]]+)/.exec(note); if (!mm) continue;
    const parts = mm[1].split("→").map((s) => s.trim());
    const outTok = (parts.length > 1 ? parts[1] : parts[0]).replace(/[.\s]+$/, "");
    if (!/\d/.test(outTok)) continue;                // 숫자·"N명" 형태만 검사(범주형 예시는 제외)
    for (const c of [outTok, outTok.replace(/명$/, "")]) if (expStrs.has(c)) errs.push(`표시 예 출력 '${outTok}'이 기대값과 같음`);
  }
  // 동사: 결과 전부 텍스트 → "표시하시오", 숫자 있으면 "계산하시오"(verbException 예외)
  const vals = Object.values(item.expected);
  const allText = vals.length > 0 && vals.every((v) => typeof v === "string");
  const hasNum = vals.some((v) => typeof v === "number");
  if (allText && !item.text.includes("표시하시오") && spec.verbException !== "계산") errs.push("텍스트 결과인데 '표시하시오' 없음");
  if (hasNum && !item.text.includes("계산하시오") && spec.verbException !== "표시") errs.push("숫자 결과인데 '계산하시오' 없음");
  // 결과 라벨: 따옴표·특수기호(− · " ')·"세째/두째" 금지
  const label = spec.result?.label || "";
  if (/["'−·]/.test(label) || /[세두]째/.test(label)) errs.push(`결과 라벨 부적합: "${label}"`);
  // 텍스트 데이터 열이 전부 "이름+숫자"(종목50 등) 패턴이면 실패 (codeColumns 선언 제외)
  const codeCols = new Set(spec.codeColumns || []);
  spec.headers.forEach((h, c) => {
    if (codeCols.has(h)) return;
    const cv = spec.rows.map((r) => r[c]).filter((v) => typeof v === "string" && v !== "");
    if (cv.length && cv.every((v) => /^[가-힣A-Za-z]+\d+$/.test(v))) errs.push(`열 '${h}' 이름+숫자 패턴(코드열 아님)`);
  });
  // 본문에 "에서" 2회 이상이면 실패
  if ((item.text.match(/에서/g) || []).length >= 2) errs.push("본문에 '에서' 2회 이상");
  // ▶ 줄이 서술체("~다"/"~한다"/"~이다")로 끝나면 실패(지시문은 명사형·"표시"·"사용" 등으로 끝냄)
  for (const note of item.notes || []) { const t = note.replace(/\s+$/, ""); if (/다$/.test(t)) errs.push(`▶ 줄 서술체 종결: "${t}"`); }
  // 결과가 "월/일" 같은 날짜 텍스트면 표시 예에 입력값(" → " 앞)이 있어야 함
  const evals = Object.values(item.expected);
  if (evals.length && evals.every((v) => typeof v === "string" && /^\d{1,2}\/\d{1,2}$/.test(v))) {
    for (const note of item.notes || []) { const mm = /표시\s*예\s*[:：]\s*([^\]]+)/.exec(note); if (mm) { const parts = mm[1].split("→"); if (parts.length < 2 || !parts[0].trim()) errs.push("날짜 텍스트 표시 예에 입력값 없음"); } }
  }
  // 판별 행 개수가 선언 범위(min~max) 안인지 (discriminators = matchDecls 흡수)
  for (const d of specDiscriminators(spec)) {
    const cnt = spec.rows.filter((r) => d.test(r)).length;
    if (cnt < d.min || cnt > d.max) errs.push(`판별 '${d.name}' 행 수 ${cnt} (${d.min}~${d.max} 밖)`);
  }
  return errs;
}

// 판별 행 선언 통합: spec.discriminators([{name,test,min,max,allowFixed?,reason?}]) + spec.matchDecls 흡수.
// test(row) 는 한 데이터 행(셀 값 배열)으로 판별 대상 여부를 판정. allowFixed 있으면 위치 분산 검사 면제.
export function specDiscriminators(spec) {
  const out = [];
  for (const d of spec.discriminators || []) out.push({ name: d.name, test: d.test, min: d.min, max: d.max, allowFixed: d.allowFixed || null, reason: d.reason || "" });
  for (const m of spec.matchDecls || []) { const c = spec.headers.indexOf(m.col); out.push({ name: `${m.col}=${m.value}`, test: (row) => String(row[c]) === String(m.value), min: m.min, max: m.max, allowFixed: null, reason: "" }); }
  return out;
}

// 이름 열 자동 감지(값이 모두 이름 풀) — 고정 패턴 검사에서 제외
export function significantCols(spec) {
  const codeCols = new Set(spec.codeColumns || []);
  return spec.headers.map((h, c) => ({ h, c })).filter(({ h, c }) => {
    if (codeCols.has(h)) return false;
    const cv = spec.rows.map((r) => r[c]);
    if (cv.length && cv.every((v) => NAMESET.has(v))) return false; // 이름 열
    if (cv.every((v) => v == null || v === "")) return false;       // 결과 열 등 빈 열
    return true;
  }).map((x) => x.c);
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
