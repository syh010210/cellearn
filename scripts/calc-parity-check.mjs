// scripts/calc-parity-check.mjs  (npm run test:calc-parity)
// parity.answer.xlsx / parity2.answer.xlsx(엑셀이 재계산해 저장한 값)와 엔진 평가 결과를 사례별로 대조.
//  · 입력 영역(H열~)은 setCellValue 로 자료형 보존해 엔진 시트에 올린다(중간계산 M열은 수식으로).
//  · 사례(B열) 수식을 _xlfn 제거 후 엔진 평가 → 엑셀 저장값과 비교.
//  · 비교: 숫자 상대오차 1e-9, 텍스트 완전 일치(빈 문자열 포함), 오류는 종류까지, 자료형 다르면 불일치.
//  · parity2.answer 가 없으면 1차만 돌리고 그 사실을 출력. 불일치가 있으면 exit 1.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import { Sheet, isErrorValue } from "../src/excel-engine/index.js";
import { stripXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "trial_test", "calc-parity");

const excelVal = (c) => {
  if (!c) return { kind: "blank" };
  if (c.t === "e") return { kind: "error", v: String(c.w || c.v) };
  if (c.t === "b") return { kind: "bool", v: !!c.v };
  if (c.t === "n") return { kind: "num", v: Number(c.v) };
  return { kind: "str", v: String(c.v) };
};
const engVal = (v) => {
  if (isErrorValue(v)) return { kind: "error", v: v.error };
  if (v === undefined || v === null) return { kind: "blank" };
  if (typeof v === "boolean") return { kind: "bool", v };
  if (typeof v === "number") return { kind: "num", v };
  return { kind: "str", v: String(v) };
};
function eq(ex, en) {
  if (ex.kind !== en.kind) return false;
  switch (ex.kind) {
    case "blank": return true;
    case "error": return ex.v === en.v;
    case "bool": return ex.v === en.v;
    case "str": return ex.v === en.v;
    case "num": return Math.abs(ex.v - en.v) <= 1e-9 * Math.max(1, Math.abs(ex.v), Math.abs(en.v));
    default: return false;
  }
}
const show = (o) => o.kind === "blank" ? "(blank)" : o.kind === "num" ? String(o.v) : o.kind === "str" ? JSON.stringify(o.v) : String(o.v);

function checkFile(path, label) {
  const wb = XLSX.read(readFileSync(path), { type: "buffer", cellFormula: true, cellNF: true });
  const ws = wb.Sheets[wb.SheetNames.find((n) => n !== "_meta") || wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // 입력 영역(col>=H=7) 로드
  const sheet = new Sheet();
  const inputFormulas = [];
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let Cc = 7; Cc <= range.e.c; Cc++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: Cc });
      const cell = ws[addr];
      if (!cell) continue;
      if (cell.f) { inputFormulas.push([addr, cell.f]); continue; }
      if (cell.t === "n") sheet.setCellValue(addr, Number(cell.v));
      else if (cell.t === "b") sheet.setCellValue(addr, cell.v ? 1 : 0);
      else if (cell.t === "e") { /* 입력 에러 없음 */ }
      else sheet.setCellValue(addr, String(cell.v));
    }
  }
  for (const [addr, f] of inputFormulas) sheet.setCellInput(addr, "=" + stripXlfn(f));

  const SCRATCH = "ZZ1";
  let n = 0, okN = 0;
  const mism = [], emptyRows = [];
  for (let R = range.s.r + 1; R <= range.e.r; R++) {
    const id = ws[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
    const bcell = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
    const desc = ws[XLSX.utils.encode_cell({ r: R, c: 2 })]?.v;
    const cat = ws[XLSX.utils.encode_cell({ r: R, c: 3 })]?.v;
    if (!id || !bcell || !bcell.f) continue;
    n++;
    sheet.setCellInput(SCRATCH, "=" + stripXlfn(bcell.f));
    const ex = excelVal(bcell), en = engVal(sheet.getCellValue(SCRATCH));
    if (ex.kind === "str" && ex.v === "") emptyRows.push({ id, t: bcell.t, v: bcell.v, w: bcell.w, eng: show(en) });
    if (eq(ex, en)) okN++;
    else mism.push({ id, cat, f: bcell.f, desc, excel: show(ex), engine: show(en) });
  }

  console.log(`\n=== ${label}: ${okN}/${n} 일치 ===`);
  if (emptyRows.length) {
    console.log("  빈 문자열 결과 셀 (t/v/w | 엔진):");
    for (const e of emptyRows) console.log(`    ${String(e.id).padEnd(8)} t=${e.t} v=${JSON.stringify(e.v)} w=${JSON.stringify(e.w)} | ${e.eng}`);
  }
  if (mism.length) {
    console.log(`  불일치 ${mism.length}건:`);
    for (const m of mism) console.log(`    [${m.id}] cat${m.cat} ${m.f}\n       엑셀=${m.excel}  엔진=${m.engine}  (${m.desc})`);
  } else console.log("  ✓ 불일치 없음");
  return mism.length;
}

let totalMism = 0, ran = 0;
for (const [file, label] of [["parity.answer.xlsx", "1차"], ["parity2.answer.xlsx", "2차"]]) {
  const p = join(DIR, file);
  if (existsSync(p)) { totalMism += checkFile(p, label); ran++; }
  else console.log(`\n(${label} ${file} 없음 → 건너뜀)`);
}
console.log(`\n결과: ${ran}개 파일 대조, 불일치 ${totalMism}건`);
process.exit(totalMism > 0 ? 1 : 0);
