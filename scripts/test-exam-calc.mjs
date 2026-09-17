// scripts/test-exam-calc.mjs (test:calc 포함) — 계산작업 앱 연결 통합 테스트.
//  앱과 같은 함수: composeExamCalc → buildExamWorkbook → write → (풀이 시뮬) → gradeExamBuffer.
//  examBank 는 import.meta.glob(Vite) 이라 Node 에서 못 쓰므로 계산 문제 shape 를 여기서 동일하게 만든다.
import XLSX from "xlsx-js-style";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { composeExamCalc } from "../src/utils/calc/composeExamCalc.js";
import { buildExamWorkbook } from "../src/utils/examBuilder.js";
import { gradeExamBuffer } from "../src/utils/examGrader.js";
import { assembleBasic2 } from "../src/utils/basic2Assembler.js";
import { shiftFormula } from "../src/utils/formulaUtils.js";
import { stripXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const parseA1 = (a) => { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(String(a).trim()); return { c: lettersCol(m[1]), r: +m[2] - 1 }; };
const enc = (r, c) => XLSX.utils.encode_cell({ r, c });
function expand1D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const o = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) o.push(enc(r, c)); return o; }
function expand2D(range) { const [a, b] = range.split(":"); const pa = parseA1(a), pb = b ? parseA1(b) : pa; const rows = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(enc(r, c)); rows.push(row); } return rows; }

// examBank.composeCalcProblem 와 동일 shape
function calcProblem(seed, count, difficulty) {
  const inst = composeExamCalc(seed, { count, difficulty });
  return { id: `calc-${seed}`, section: "계산", sheetName: "계산작업", title: "", instance: inst, items: inst.items.map((it) => ({ no: it.no, points: 8, text: it.text })) };
}
const setCell = (ws, a, cell) => { ws[a] = cell; const p = parseA1(a); const ref = XLSX.utils.decode_range(ws["!ref"]); if (p.r > ref.e.r || p.c > ref.e.c) { ref.e.r = Math.max(ref.e.r, p.r); ref.e.c = Math.max(ref.e.c, p.c); ws["!ref"] = XLSX.utils.encode_range(ref); } };
const valCell = (v) => (typeof v === "number" ? { t: "n", v } : (v && typeof v === "object" && v.error) ? { t: "e", v: 0, w: v.error } : { t: "s", v: String(v) });

// 풀이 시뮬레이션: 버퍼 → 계산 시트에 결과 수식(f)+값(v)·조건 값 채움 → 새 버퍼. wrong: {no, mode}
function solveBuffer(buf, inst, wrong = null) {
  const wb = XLSX.read(buf, { type: "array", cellFormula: true, cellStyles: true });
  const ws = wb.Sheets["계산작업"];
  for (const it of inst.items) {
    const { r: ar, c: ac } = parseA1(it.result.anchor);
    for (const a of expand1D(it.result.range)) {
      const { r, c } = parseA1(a);
      const f = stripXlfn(shiftFormula(it.answer.formula, r - ar, c - ac)).replace(/^=/, "");
      const v = it.expected[a];
      if (wrong && it.no === wrong.no && wrong.mode === "valueOnly") setCell(ws, a, valCell(v));          // 값만(수식 없음)
      else if (wrong && it.no === wrong.no && wrong.mode === "outsideFunc") setCell(ws, a, { t: "n", v: -99999, f: "WEEKDAY(B3,2)" }); // 목록 밖 함수
      else setCell(ws, a, { ...valCell(v), f });
    }
    if (it.criteria) expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const cv = it.criteria.table[ri] && it.criteria.table[ri][ci]; if (cv != null && cv !== "") setCell(ws, a, valCell(cv)); }));
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

// ── 1. 난이도 2 × 문항 2 × 시드 10: 만점 + 오답 범주 + 기본2 불간섭 ──
for (const difficulty of ["기본", "어려움"]) {
  for (const count of [5, 3]) {
    for (let s = 0; s < 10; s++) {
      const seed = `exam~${s}`;
      const calc = calcProblem(seed, count, difficulty);
      const b2 = assembleBasic2(seed, { difficulty: difficulty === "어려움" ? "hard" : "basic" });
      const problems = [b2, calc];
      const buf = XLSX.write(buildExamWorkbook(problems, "att"), { type: "buffer", bookType: "xlsx", cellStyles: true });

      // 만점 풀이
      const solved = solveBuffer(buf, calc.instance);
      const res = await gradeExamBuffer(solved, problems);
      const cr = res.find((r) => r.section === "계산");
      check(`${difficulty}·${count}·#${s} 계산 만점`, cr.earned === cr.totalPoints && cr.totalPoints === count * 8, `${cr.earned}/${cr.totalPoints}`);
      // 기본2 불간섭: calc 유무와 무관하게 동일
      const resB2only = await gradeExamBuffer(solved, [b2]);
      const a = res.find((r) => r.section === "기본2"), b = resB2only.find((r) => r.section === "기본2");
      check(`${difficulty}·${count}·#${s} 기본2 불간섭`, JSON.stringify(a.items) === JSON.stringify(b.items), "");

      if (s === 0) {
        // 오답: 1번 값만(수식 없음) → functionMissing, 2번 목록 밖 함수 → functionOutside
        const wrong1 = await gradeExamBuffer(solveBuffer(buf, calc.instance, { no: 1, mode: "valueOnly" }), problems);
        const c1 = wrong1.find((r) => r.section === "계산");
        const it1 = c1.items.find((x) => x.no === 1);
        check(`${difficulty}·${count} 값만 0점`, !it1.ok && it1.earned === 0);
        check(`${difficulty}·${count} 값만 사유 noFormula`, it1.reasons.some((r) => r.includes("수식") || r.includes("값이 입력")), it1.reasons.join("/"));
        const wrong2 = await gradeExamBuffer(solveBuffer(buf, calc.instance, { no: 2, mode: "outsideFunc" }), problems);
        const c2 = wrong2.find((r) => r.section === "계산");
        const it2 = c2.items.find((x) => x.no === 2);
        check(`${difficulty}·${count} 목록밖함수 0점`, !it2.ok && it2.earned === 0);
        check(`${difficulty}·${count} 목록밖함수 사유`, it2.reasons.some((r) => r.includes("WEEKDAY") || r.includes("함수")), it2.reasons.join("/"));
      }
    }
  }
}

// ── 1b. 미풀이(문제 파일 그대로) 업로드 → 전 문항 "비어 있습니다", "값이 입력" 0건 ──
for (const [difficulty, count] of [["기본", 5], ["어려움", 5], ["기본", 3]]) {
  const calc = calcProblem(`blank~${difficulty}~${count}`, count, difficulty);
  const buf = XLSX.write(buildExamWorkbook([calc], "att"), { type: "buffer", bookType: "xlsx", cellStyles: true });
  const res = await gradeExamBuffer(buf, [calc]);
  const cr = res.find((r) => r.section === "계산");
  const allReasons = cr.items.flatMap((it) => it.reasons);
  check(`${difficulty}·${count} 미풀이 0점`, cr.earned === 0);
  check(`${difficulty}·${count} 미풀이 전문항 비어있음`, cr.items.every((it) => it.reasons.some((r) => r.includes("비어 있습니다"))), "");
  check(`${difficulty}·${count} 미풀이 값입력 0건`, !allReasons.some((r) => r.includes("값이 입력")), allReasons.filter((r) => r.includes("값이 입력")).join(" | "));
}

// ── 2. 시트 없음 ──
{
  const calc = calcProblem("nosheet", 5, "기본");
  const wbOther = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbOther, XLSX.utils.aoa_to_sheet([["x"]]), "딴시트");
  const buf = XLSX.write(wbOther, { type: "buffer", bookType: "xlsx" });
  const res = await gradeExamBuffer(buf, [calc]);
  const cr = res.find((r) => r.section === "계산");
  check("시트없음 0점", cr.earned === 0 && cr.sheetFound === false);
  check("시트없음 사유", cr.items.every((it) => it.reasons.some((r) => r.includes("시트를 찾을 수 없"))), "");
}

// ── 3. 옛 형식(instance 없음) ──
{
  const legacy = { id: "old", section: "계산", sheetName: "계산1", title: "옛", answers: [{ cell: "D3", formula: "=A1" }] };
  const buf = XLSX.write(buildExamWorkbook([legacy], "att"), { type: "buffer", bookType: "xlsx" });
  const res = await gradeExamBuffer(buf, [legacy]);
  const cr = res.find((r) => r.section === "계산");
  check("옛형식 안내·점수미포함", cr.earned === 0 && cr.totalPoints === 0 && cr.items[0].reasons[0].includes("이전 형식"), JSON.stringify(cr.items[0]?.reasons));
}

// ── 4. 실파일: calc-basic-5.solved.xlsx + calc-basic-5.instance.json → 32/40 ──
{
  const inst = JSON.parse(readFileSync(join(__dirname, "..", "trial_test", "calc-sheet", "calc-basic-5.instance.json"), "utf8"));
  const p = { id: "real", section: "계산", sheetName: inst.sheetName || "계산작업", title: "", instance: inst, items: inst.items.map((it) => ({ no: it.no, points: 8, text: it.text })) };
  const buf = readFileSync(join(__dirname, "..", "trial_test", "calc-sheet", "calc-basic-5.solved.xlsx"));
  const res = await gradeExamBuffer(buf, [p]);
  const cr = res.find((r) => r.section === "계산");
  check("실파일 solved 32/40", cr.earned === 32 && cr.totalPoints === 40, `${cr.earned}/${cr.totalPoints}`);
}

console.log(`\n계산작업 앱 통합: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
