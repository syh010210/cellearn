// scripts/grade-calc-file.mjs <xlsx> <instance.json> — 업로드 풀이 파일을 인스턴스로 채점.
import { readFileSync } from "node:fs";
import XLSX from "xlsx-js-style";
import { sheetjsGetCell } from "../src/utils/calc/sheetjsGetCell.js";
import { gradeCalc } from "../src/utils/calc/calcGrader.js";

const [, , xlsxPath, instPath] = process.argv;
if (!xlsxPath || !instPath) { console.error("usage: grade-calc-file <xlsx> <instance.json>"); process.exit(2); }
const wb = XLSX.read(readFileSync(xlsxPath), { type: "buffer", cellFormula: true, cellNF: true });
const inst = JSON.parse(readFileSync(instPath, "utf8"));
const ws = wb.Sheets[inst.sheetName];
if (!ws) { console.error(`시트 없음: ${inst.sheetName}`); process.exit(2); }

const g = gradeCalc(inst, sheetjsGetCell(ws));
console.log(`파일: ${xlsxPath}\n인스턴스: ${instPath} (${inst.sheetName})\n`);
for (const it of g.items) {
  const spec = inst.items.find((x) => x.no === it.no);
  console.log(`## ${it.no}. [${spec?.subtype}] ${it.ok ? "정답" : "오답"} (${it.earned}/${it.points})`);
  console.log(`   결과범위 ${spec?.result?.range} · 기준수식 ${spec?.answer?.formula}`);
  if (it.reasons.length) console.log(`   사유: ${it.reasons.join(" / ")}`);
  if (it.hint) console.log(`   hint: ${it.hint}`);
  if (it.warnings?.length) console.log(`   warnings: ${it.warnings.join(" / ")}`);
}
console.log(`\n총점 ${g.earned}/${g.total}`);
