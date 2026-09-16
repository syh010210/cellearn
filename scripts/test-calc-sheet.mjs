// scripts/test-calc-sheet.mjs (test:calc 포함) — 계산작업 시트 빌더 왕복 검증.
// 시드 20 × 난이도 2 × 문항 5·3: write → SheetJS read.
//  A) 입력 셀 값·자료형·z 일치, 결과·조건 칸 빈칸, 병합·열 너비 일치, _xlfn 대상만.
//  B) 읽은 시트를 엔진에 올리고 각 문항 answer 채워 계산 = instance.expected.
//  C) 기준 답 채운 시트를 calcGrader.gradeCalc(engineGetCell) 로 채점 → 만점.
import XLSX from "xlsx-js-style";
import { composeCalc } from "../src/utils/calc/calcAssembler.js";
import { buildCalcInstanceSheet } from "../src/utils/calc/calcSheetBuilder.js";
import { subtypesForSeed } from "./_calcCompose.mjs";
import { Sheet } from "../src/excel-engine/index.js";
import { shiftFormula } from "../src/utils/formulaUtils.js";
import { engineGetCell } from "../src/utils/calc/cellAdapter.js";
import { gradeCalc } from "../src/utils/calc/calcGrader.js";
import { stripXlfn, XLFN_FUNCTIONS } from "../src/data/exam/calc/functions.js";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const parseA1 = (a) => { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(a); return { c: lettersCol(m[1]), r: +m[2] - 1 }; };
function expand1D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const o = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) o.push(XLSX.utils.encode_cell({ r, c })); return o; }
function expand2D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const rows = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(XLSX.utils.encode_cell({ r, c })); rows.push(row); } return rows; }
const dateFmt = (z) => !z ? undefined : (/h/i.test(z) ? (/y/i.test(z) ? "datetime" : "time") : (/y/i.test(z) ? "date" : undefined));
const numClose = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

for (let s = 0; s < 20; s++) {
  for (const diff of ["기본", "어려움"]) {
    for (const n of [5, 3]) {
      const seed = `sheet~${s}~${diff}~${n}`;
      const inst = composeCalc(seed, { subtypes: subtypesForSeed(seed, diff, n), difficulty: diff });
      const ws = buildCalcInstanceSheet(inst);
      // _xlfn: 쓰기 셀의 수식이 대상 함수에만 접두를 가진다
      for (const [addr, c] of Object.entries(ws)) {
        if (addr[0] === "!" || c.f === undefined) continue;
        for (const m of String(c.f).matchAll(/_xlfn\.([A-Z][A-Z0-9.]*)/g)) if (!XLFN_FUNCTIONS.has(m[1])) check(`${seed} _xlfn 비대상`, false, m[1]);
      }
      const buf = XLSX.write((() => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "계산작업"); return wb; })(), { bookType: "xlsx", type: "buffer", cellStyles: true });
      const wb2 = XLSX.read(buf, { type: "buffer", cellFormula: true, cellNF: true, cellStyles: true });
      const ws2 = wb2.Sheets["계산작업"];
      check(`${seed} 시트 존재`, !!ws2);
      if (!ws2) continue;

      // A) 값·자료형·z 일치
      for (const [addr, c] of Object.entries(inst.cells)) {
        const rc = ws2[addr];
        if (!rc) { check(`${seed} 셀 누락 ${addr}`, false); continue; }
        if (c.f !== undefined) { check(`${seed} 수식 ${addr}`, stripXlfn(String(rc.f || "")) === stripXlfn(String(c.f).replace(/^=/, ""))); continue; }
        const t = c.t || (typeof c.v === "number" ? "n" : "s");
        check(`${seed} 자료형 ${addr}`, rc.t === t, `${rc.t}≠${t}`);
        if (t === "n") check(`${seed} 값 ${addr}`, numClose(Number(rc.v), Number(c.v)), `${rc.v}≠${c.v}`);
        else check(`${seed} 값 ${addr}`, String(rc.v) === String(c.v), `${rc.v}≠${c.v}`);
        if (c.z) check(`${seed} z ${addr}`, rc.z === c.z, `${rc.z}≠${c.z}`);
      }
      // 결과·조건 칸 빈칸
      for (const it of inst.items) {
        for (const a of expand1D(it.result.range)) if (ws2[a] !== undefined) check(`${seed} 결과칸 비어야 ${a}`, false, JSON.stringify(ws2[a]));
        if (it.criteria) for (const row of expand2D(it.criteria.range)) for (const a of row) if (ws2[a] !== undefined) check(`${seed} 조건칸 비어야 ${a}`, false);
      }
      // 병합
      const rm = (ws2["!merges"] || []).map((m) => XLSX.utils.encode_range(m)).sort();
      check(`${seed} 병합`, JSON.stringify(rm) === JSON.stringify([...inst.merges].sort()), `${JSON.stringify(rm)} vs ${JSON.stringify(inst.merges)}`);
      // 열 너비
      for (const [L, w] of Object.entries(inst.colWidths || {})) { const col = (ws2["!cols"] || [])[lettersCol(L)]; check(`${seed} 너비 ${L}`, col && col.wch === w, `${col?.wch}≠${w}`); }

      // B·C) 읽은 시트 → 엔진 → 답 채워 계산·채점
      const eng = new Sheet();
      for (const addr of Object.keys(ws2)) {
        if (addr[0] === "!") continue; const c = ws2[addr];
        if (c.f !== undefined) eng.setCellInput(addr, "=" + stripXlfn(String(c.f)));
        else if (c.t === "n") eng.setCellValue(addr, Number(c.v), dateFmt(c.z));
        else if (c.t === "b") eng.setCellValue(addr, c.v);
        else eng.setCellValue(addr, String(c.v));
      }
      for (const it of inst.items) {
        const { r: ar, c: ac } = parseA1(it.result.anchor);
        for (const a of expand1D(it.result.range)) { const { r, c } = parseA1(a); eng.setCellInput(a, shiftFormula(it.answer.formula, r - ar, c - ac)); }
        if (it.criteria) expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const v = it.criteria.table[ri]?.[ci]; if (v !== undefined && v !== null && v !== "") eng.setCellValue(a, v); }));
      }
      // B) 결과 = expected
      for (const it of inst.items) for (const a of expand1D(it.result.range)) {
        const v = eng.getCellValue(a); const exp = it.expected[a];
        const got = (v && typeof v === "object" && v.error) ? { error: v.error } : (v === undefined ? "" : v);
        const ok = (exp && typeof exp === "object") ? (got.error === exp.error) : (typeof exp === "number" ? numClose(Number(got), exp) : String(got) === String(exp));
        if (!ok) check(`${seed} expected ${a}`, false, `${JSON.stringify(got)}≠${JSON.stringify(exp)}`);
      }
      // C) 채점 만점
      const g = gradeCalc(inst, engineGetCell(eng));
      if (g.earned !== g.total) check(`${seed} 채점 만점`, false, `${g.earned}/${g.total} :: ${g.items.filter((i) => !i.ok).map((i) => i.no + ":" + i.reasons.join("/")).join(" | ")}`);
    }
  }
}

console.log(`\n계산 시트 왕복: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
