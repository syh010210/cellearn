// scripts/test-basic2-assembler.mjs — 기본작업-2 조립기 테스트. 실행: npm run test:assembler
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import { assembleBasic2 } from "../src/utils/basic2Assembler.js";
import { buildExamWorkbook, buildBasic2Sheet } from "../src/utils/examBuilder.js";
import { parseWorkbookStyles, expandRange, idxToCol, parseRef } from "../src/utils/xlsxStyles.js";
import { gradeBasic2 } from "../src/utils/basic2Grader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
let pass = 0, fail = 0; const fails = [];
const check = (name, cond, detail = "") => { if (cond) pass++; else { fail++; fails.push(`✗ ${name}  ${detail}`); } };

const box = (range) => { const [a, b] = String(range).split(":"); const p = parseRef(a), q = parseRef(b || a); return { r1: Math.min(p.row, q.row), r2: Math.max(p.row, q.row), c1: Math.min(p.col, q.col), c2: Math.max(p.col, q.col) }; };
const clean = (inst) => { const { _meta, ...rest } = inst; return rest; };

// ─────────── 1. 픽스처 드리프트 ───────────
const fxPath = join(ROOT, "src/data/exam/basic2-fixture-01.json");
const fx = clean(assembleBasic2("fixture-01"));
if (!existsSync(fxPath)) { writeFileSync(fxPath, JSON.stringify(fx, null, 2) + "\n", "utf8"); console.log("· fixture-01 생성(최초):", fxPath); }
else { const saved = JSON.parse(readFileSync(fxPath, "utf8")); check("fixture-01 드리프트 없음", JSON.stringify(saved) === JSON.stringify(fx), "저장본과 다름 → 조립기 출력이 바뀜"); }

// ─────────── 2. 시드 200개 유효성 + 3. 분포 ───────────
const dist = { dataset: {}, header: {}, num: {}, date: {}, titleAlign: {}, miscAlign: {}, miscFlag: { name: 0, memo: 0, comma: 0 }, border: {}, difficulty: {} };
const bump = (m, k) => { m[k] = (m[k] || 0) + 1; };
const N = 200;
for (let i = 0; i < N; i++) {
  const seed = `seed-${String(i).padStart(3, "0")}`;
  const inst = assembleBasic2(seed);
  const cols = inst.table.columns.length, maxRow = 3 + inst.table.rows.length;

  // 시트 생성 무에러
  try { buildExamWorkbook([inst]); } catch (e) { check(`${seed} 워크북 생성`, false, String(e)); continue; }

  // 항목 5개, ①(alignment)·⑤(border) 존재, 표시형식 존재
  check(`${seed} 항목 5개`, inst.items.length === 5, `len=${inst.items.length}`);
  const kindsOf = (it) => it.checks.map((c) => c.kind);
  check(`${seed} ① alignment 존재`, kindsOf(inst.items[0]).includes("alignment"));
  check(`${seed} ⑤ border 존재`, kindsOf(inst.items[4]).includes("border"));
  check(`${seed} 표시형식 존재`, inst.items.some((it) => kindsOf(it).includes("numFmt")));

  // 모든 check range 가 표 안
  for (const it of inst.items) for (const chk of it.checks) {
    const ranges = [];
    if (chk.range) ranges.push(chk.range);
    if (chk.cell) ranges.push(chk.cell);
    if (chk.edges) chk.edges.forEach((e) => ranges.push(e.range));
    for (const rg of ranges) { const b = box(rg); if (b.c1 < 0 || b.c2 > cols - 1 || b.r1 < 1 || b.r2 > maxRow) check(`${seed} range 범위내 ${rg}`, false, `cols=${cols} maxRow=${maxRow}`); }
  }

  // 텍스트 결함 문자 없음
  for (const it of inst.items) { const t = it.text || ""; if (/undefined|NaN|\[object/.test(t)) check(`${seed} 텍스트 결함`, false, t); }

  // ③과 ④ 열 겹침 없음 (가운데 두 항목의 numFmt vs alignment/cellStyle 열)
  const mid = [inst.items[2], inst.items[3]];
  const colsOfKinds = (item, kinds) => new Set(item.checks.filter((c) => kinds.includes(c.kind) && c.range).map((c) => box(c.range).c1));
  const numItem = mid.find((it) => it.checks.some((c) => c.kind === "numFmt"));
  const miscItem = mid.find((it) => it !== numItem);
  if (numItem && miscItem) {
    const A = colsOfKinds(numItem, ["numFmt"]);
    const B = colsOfKinds(miscItem, ["alignment", "cellStyle"]);
    const overlap = [...A].some((c) => B.has(c));
    check(`${seed} ③④ 열 겹침 없음`, !overlap, `③cols=${[...A]} ④cols=${[...B]}`);
  }

  // 분포 집계
  const m = inst._meta;
  bump(dist.dataset, m.dataset); bump(dist.header, m.header.mode); bump(dist.num, m.numFmt.numItem);
  if (m.numFmt.dateItem) bump(dist.date, m.numFmt.dateItem);
  bump(dist.titleAlign, m.title.align); bump(dist.miscAlign, m.misc.align); bump(dist.border, m.border.mode); bump(dist.difficulty, inst.difficulty);
  if (m.misc.name) dist.miscFlag.name++; if (m.misc.memo) dist.miscFlag.memo++; if (m.misc.comma) dist.miscFlag.comma++;
}

// 분포 0 검사
const req = {
  "데이터셋": [dist.dataset, ["sales-quarter", "member-grade", "book-instock", "reserve-room", "staff-salary", "course-enroll"]],
  "②머리글": [dist.header, ["cellStyle", "merge", "alignOnly"]],
  "③숫자": [dist.num, ["seq-gp", "count-star-gae", "count-myeong", "money-won", "money-cheon", "money-baekman", "percent-literal"]],
  "③날짜": [dist.date, ["date-mmddaaa", "date-mdaaa", "date-yymmaaa", "date-simple"]],
  "①정렬": [dist.titleAlign, ["cc", "merge"]],
  "④맞춤": [dist.miscAlign, ["h", "dist", "indent"]],
  "⑤테두리": [dist.border, ["headerDouble", "outer", "all3"]],
};
for (const [label, [m, keys]] of Object.entries(req)) for (const k of keys) check(`분포 ${label}:${k} > 0`, (m[k] || 0) > 0, `count=${m[k] || 0}`);
for (const f of ["name", "memo", "comma"]) check(`분포 ④${f} > 0`, dist.miscFlag[f] > 0);

// ─────────── 4. 정답 자기검증 ───────────
// xlsx-js-style 로 못 쓰거나 검증이 다른 항목은 제외: cellStyle · comment · definedName · merge(그룹) · font.underline
const EXCLUDE = new Set(["cellStyle", "comment", "definedName", "merge"]);
const reduce = (inst) => ({ ...inst, items: inst.items.map((it) => ({ ...it, checks: it.checks.filter((c) => !EXCLUDE.has(c.kind)).map((c) => (c.kind === "font" ? (({ underline, ...r }) => r)(c) : c)) })) });

function writeAnswer(inst) {
  const ws = buildBasic2Sheet(inst);
  // 정답 파일에서는 스타일이 붙는 빈 셀을 값셀로 승격(스텁 t:"z"는 write에서 드롭되므로). 채점은 값을 무시한다.
  const ensure = (a) => { if (!ws[a]) ws[a] = { t: "s", v: "" }; else if (ws[a].t === "z") { ws[a].t = "s"; ws[a].v = ""; } return ws[a]; };
  const mS = (a, patch) => { const c = ensure(a); c.s = { ...(c.s || {}) }; for (const k in patch) { if (k === "alignment" || k === "font" || k === "border") c.s[k] = { ...(c.s[k] || {}), ...patch[k] }; else c.s[k] = patch[k]; } };
  const merges = ws["!merges"] || (ws["!merges"] = []);
  const thin = { style: "thin" }, med = { style: "medium" }, dbl = { style: "double" };
  const border = (chk) => {
    const b = box(chk.range);
    for (let r = b.r1; r <= b.r2; r++) for (let c = b.c1; c <= b.c2; c++) mS(idxToCol(c) + r, { border: { top: { ...thin }, bottom: { ...thin }, left: { ...thin }, right: { ...thin } } });
    if (chk.outer) { for (let c = b.c1; c <= b.c2; c++) { mS(idxToCol(c) + b.r1, { border: { top: { ...med } } }); mS(idxToCol(c) + b.r2, { border: { bottom: { ...med } } }); } for (let r = b.r1; r <= b.r2; r++) { mS(idxToCol(b.c1) + r, { border: { left: { ...med } } }); mS(idxToCol(b.c2) + r, { border: { right: { ...med } } }); } }
    for (const e of chk.edges || []) { const eb = box(e.range); const st = e.style === "double" ? dbl : e.style === "medium" ? med : thin; if (e.side === "bottom") for (let c = eb.c1; c <= eb.c2; c++) mS(idxToCol(c) + eb.r2, { border: { bottom: { ...st } } }); }
  };
  for (const it of inst.items) for (const chk of it.checks) {
    if (chk.kind === "alignment") { const al = {}; for (const k of ["horizontal", "vertical", "wrapText", "indent"]) if (chk[k] !== undefined) al[k] = chk[k]; for (const a of expandRange(chk.range)) mS(a, { alignment: al }); if (chk.merge) { const b = box(chk.range); merges.push({ s: { r: b.r1 - 1, c: b.c1 }, e: { r: b.r2 - 1, c: b.c2 } }); } }
    else if (chk.kind === "font") { const f = {}; if (chk.name) f.name = chk.name; if (chk.size) f.sz = chk.size; if (chk.bold) f.bold = true; if (chk.italic) f.italic = true; if (chk.underline) f.underline = chk.underline; for (const a of expandRange(chk.range)) mS(a, { font: f }); }
    else if (chk.kind === "rowHeight") { ws["!rows"] = ws["!rows"] || []; ws["!rows"][chk.row - 1] = { hpt: chk.height }; }
    else if (chk.kind === "numFmt") { const code = chk.codes && chk.codes[0]; for (const a of expandRange(chk.range)) { ensure(a); ws[a].z = code; } }
    else if (chk.kind === "border") border(chk);
  }
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, inst.sheetName);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

let selfOk = 0, selfTot = 0;
for (let i = 0; i < N; i++) {
  const seed = `seed-${String(i).padStart(3, "0")}`;
  const inst = assembleBasic2(seed);
  const buf = writeAnswer(inst);
  const styles = await parseWorkbookStyles(buf);
  const g = gradeBasic2(styles, reduce(inst));
  selfTot++;
  const allOk = g.items.every((it) => it.ok);
  if (allOk) selfOk++;
  else if (fails.length < 40) fails.push(`✗ 자기검증 ${seed}: ${g.items.filter((it) => !it.ok).map((it) => `#${it.no}[${it.reasons.join(" / ")}]`).join(" ")}`);
}
check(`정답 자기검증 ${selfOk}/${selfTot}`, selfOk === selfTot);

// ─────────── 분포 표 출력 ───────────
const show = (m) => Object.entries(m).sort().map(([k, v]) => `${k}:${v}`).join("  ");
console.log("\n=== 분포 (200 시드) ===");
console.log("데이터셋   ", show(dist.dataset));
console.log("①정렬      ", show(dist.titleAlign));
console.log("②머리글    ", show(dist.header));
console.log("③숫자      ", show(dist.num));
console.log("③날짜      ", show(dist.date));
console.log("④맞춤      ", show(dist.miscAlign), " | 이름:", dist.miscFlag.name, "메모:", dist.miscFlag.memo, "쉼표:", dist.miscFlag.comma);
console.log("⑤테두리    ", show(dist.border));
console.log("난이도     ", show(dist.difficulty));
console.log("자기검증   ", `${selfOk}/${selfTot} (제외: cellStyle·comment·definedName·merge그룹·font.underline)`);

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fails.length) console.log(fails.slice(0, 40).join("\n"));
process.exit(fail ? 1 : 0);
