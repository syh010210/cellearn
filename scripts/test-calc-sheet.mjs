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
import { verifyTableOrder } from "./_calcTestUtil.mjs";

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
      { const teo = verifyTableOrder(inst); if (teo.length) check(`${seed} 표번호 위치순`, false, teo[0]); }
      const ws = buildCalcInstanceSheet(inst);
      // 서식 검사(쓰기 측 ws 기준 — SheetJS 재읽기는 테두리를 보존하지 않음)
      {
        const roles = inst.roles || {};
        const gray = (s) => s?.fill?.fgColor?.rgb === "FFD9D9D9";
        const bordered = (s) => ["top", "bottom", "left", "right"].every((k) => s?.border?.[k]?.style === "thin");
        const centered = (s) => s?.alignment?.horizontal === "center";
        const gridRoles = ["header", "headerAns", "data", "mid", "refheader", "refdata", "rtheader", "rtheaderAns", "result", "criteria", "reslabel", "rtlabel", "base", "baselabel", "reflabelcol"];
        const mergedAll = new Set();               // 병합에 포함된 모든 칸(앵커 포함) — 테두리는 바깥 변만 있으므로 all-4 검사 제외
        (inst.merges || []).forEach((m) => { const r = XLSX.utils.decode_range(m); for (let rr = r.s.r; rr <= r.e.r; rr++) for (let cc = r.s.c; cc <= r.e.c; cc++) mergedAll.add(XLSX.utils.encode_cell({ r: rr, c: cc })); });
        for (const [addr, role] of Object.entries(roles)) {
          if (gridRoles.includes(role) && !mergedAll.has(addr)) {
            if (!bordered(ws[addr]?.s)) check(`${seed} 서식 테두리 ${addr}(${role})`, false);
            if (!centered(ws[addr]?.s)) check(`${seed} 서식 가운데 ${addr}(${role})`, false);
          }
          if (["headerAns", "rtheaderAns", "reslabel"].includes(role) && !mergedAll.has(addr) && !gray(ws[addr]?.s)) check(`${seed} 서식 음영 ${addr}(${role})`, false);
        }
        // 병합 셀 바깥 변 테두리: 캡션 제외 병합의 모든 칸에서 위치별 바깥 변이 존재
        const CAPTION_M = new Set(["label", "title", "critlabel", "reflabel", "rtname"]);
        for (const m of inst.merges || []) {
          const rg = XLSX.utils.decode_range(m), anchor = XLSX.utils.encode_cell({ r: rg.s.r, c: rg.s.c });
          if (CAPTION_M.has(roles[anchor])) continue;
          for (let r = rg.s.r; r <= rg.e.r; r++) for (let c = rg.s.c; c <= rg.e.c; c++) {
            const s = ws[XLSX.utils.encode_cell({ r, c })]?.s, need = [];
            if (r === rg.s.r) need.push("top"); if (r === rg.e.r) need.push("bottom"); if (c === rg.s.c) need.push("left"); if (c === rg.e.c) need.push("right");
            for (const k of need) if (s?.border?.[k]?.style !== "thin") check(`${seed} 병합 바깥테두리 ${m} @${XLSX.utils.encode_cell({ r, c })} ${k}`, false);
          }
        }
        // 결과 빈칸: 값 없이 테두리만
        for (const it of inst.items) for (const a of expand1D(it.result.range)) {
          const c = ws[a];
          if (!bordered(c?.s)) check(`${seed} 결과칸 테두리 ${a}`, false);
          if (c && ((c.v !== undefined && c.v !== "") || c.f !== undefined)) check(`${seed} 결과칸 값없음 ${a}`, false, JSON.stringify(c));
        }
        // 자동 너비: 병합 아닌 값 셀은 열 너비 ≥ 표시 폭(#### 방지)
        const estW = (str) => { let w = 0; for (const ch of String(str)) { const cp = ch.codePointAt(0); w += ((cp >= 0x1100 && cp <= 0x115F) || (cp >= 0x2E80 && cp <= 0xA4CF) || (cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0xFF00 && cp <= 0xFF60)) ? 2 : 1; } return w; };
        const disp = (c) => { const v = c.v; if (v == null) return ""; if (c.z && /y/i.test(c.z)) return "0000-00-00"; if (c.z && /h/i.test(c.z)) return "00:00:00"; if (typeof v === "number" && c.z && c.z.includes("#,##0")) return Math.round(Math.abs(v)).toLocaleString("en-US"); return String(v); };
        const merged = new Set();
        (inst.merges || []).forEach((m) => { const r = XLSX.utils.decode_range(m); if (r.e.c > r.s.c) for (let cc = r.s.c; cc <= r.e.c; cc++) for (let rr = r.s.r; rr <= r.e.r; rr++) merged.add(XLSX.utils.encode_cell({ r: rr, c: cc })); });
        const CAPTION = new Set(["label", "title", "critlabel", "reflabel", "rtname"]); // 캡션은 넘쳐 보여도 됨(너비 제외)
        for (const [addr, cell] of Object.entries(inst.cells)) {
          if (cell.f !== undefined || merged.has(addr) || CAPTION.has(roles[addr])) continue;
          const ci = lettersCol(/[A-Z]+/.exec(addr)[0]);
          const w = (inst.colWidths || {})[XLSX.utils.encode_col(ci)] || 9;
          const need = estW(disp(cell));
          if (need > w + 0.01) check(`${seed} 너비부족 ${addr}`, false, `내용폭 ${need} > 너비 ${w}`);
        }
        // 병합 라벨(캡션 제외)은 병합 열 합계 너비 ≥ 내용 폭
        for (const m of inst.merges || []) {
          const rg = XLSX.utils.decode_range(m); const anchor = XLSX.utils.encode_cell({ r: rg.s.r, c: rg.s.c });
          const cell = inst.cells[anchor]; if (!cell || CAPTION.has(roles[anchor])) continue;
          let sum = 0; for (let c = rg.s.c; c <= rg.e.c; c++) sum += (inst.colWidths || {})[XLSX.utils.encode_col(c)] || 9;
          const need = estW(disp(cell));
          if (need > sum + 0.01) check(`${seed} 병합너비부족 ${m}`, false, `내용폭 ${need} > 합계 ${sum}`);
        }
      }
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
      // 결과·조건 칸 빈칸(값 없음 = undefined 이거나 테두리용 빈 문자열 스텁, 수식 없음)
      const blankCell = (c) => c === undefined || (c.f === undefined && (c.v === undefined || c.v === ""));
      for (const it of inst.items) {
        for (const a of expand1D(it.result.range)) if (!blankCell(ws2[a])) check(`${seed} 결과칸 비어야 ${a}`, false, JSON.stringify(ws2[a]));
        if (it.criteria) for (const row of expand2D(it.criteria.range)) for (const a of row) if (!blankCell(ws2[a])) check(`${seed} 조건칸 비어야 ${a}`, false);
      }
      // 병합
      const rm = (ws2["!merges"] || []).map((m) => XLSX.utils.encode_range(m)).sort();
      check(`${seed} 병합`, JSON.stringify(rm) === JSON.stringify([...inst.merges].sort()), `${JSON.stringify(rm)} vs ${JSON.stringify(inst.merges)}`);
      // 열 너비
      // SheetJS 가 wch↔width 변환에서 미세 반올림(±~0.3)하므로 근사 비교.
      for (const [L, w] of Object.entries(inst.colWidths || {})) { const col = (ws2["!cols"] || [])[lettersCol(L)]; check(`${seed} 너비 ${L}`, col && Math.abs(col.wch - w) < 0.6, `${col?.wch}≠${w}`); }

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
