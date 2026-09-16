// scripts/snapshot-lesson-formulas.mjs  [출력이름]
// 차시(lesson-*.json)의 미니 엑셀 실습에 있는 정답 수식을 현재 엔진으로 평가한 값을 저장한다.
// A~F 엔진 수정 전/후로 두 번 돌려 회귀(값 변화)를 비교한다.
//   node scripts/snapshot-lesson-formulas.mjs before   → trial_test/engine-snapshot/before.json
//   node scripts/snapshot-lesson-formulas.mjs after    → trial_test/engine-snapshot/after.json

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Sheet, isErrorValue } from "../src/excel-engine/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LDIR = join(ROOT, "src/data/lessons");
const OUTDIR = join(ROOT, "trial_test/engine-snapshot");
const name = process.argv[2] || "snapshot";

const disp = (sheet, addr) => {
  const v = sheet.getCellValue(addr);
  if (isErrorValue(v)) return v.error;
  if (v === undefined) return null;
  return v;
};

function evalPractice(out, lessonId, ci, pi, p) {
  if (!p || !p.cols || !p.rows) return;
  const cols = p.cols;
  const addrOf = (r, c) => `${cols[c]}${r + 1}`;
  const sheet = new Sheet();
  // 1) 비편집 셀(데이터) 로드
  p.rows.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell || cell.editable) return;
    if (cell.val !== "" && cell.val != null) sheet.setCellInput(addrOf(r, c), String(cell.val));
  }));
  // 2) 정답 수식 입력
  p.rows.forEach((row, r) => row.forEach((cell, c) => {
    if (cell?.editable && cell.answer) sheet.setCellInput(addrOf(r, c), cell.answer);
  }));
  // 3) 결과 기록
  p.rows.forEach((row, r) => row.forEach((cell, c) => {
    if (cell?.editable && cell.answer) out[`L${lessonId}/c${ci}/p${pi}/${addrOf(r, c)}`] = { f: cell.answer, v: disp(sheet, addrOf(r, c)) };
  }));
}

const out = {};
const files = readdirSync(LDIR).filter((f) => /^lesson-\d+\.json$/.test(f));
for (const f of files) {
  const lesson = JSON.parse(readFileSync(join(LDIR, f), "utf8"));
  (lesson.concepts || []).forEach((concept, ci) => {
    const ps = concept.practices ? concept.practices : (concept.practice ? [concept.practice] : []);
    ps.forEach((p, pi) => evalPractice(out, lesson.id, ci, pi, p));
  });
}

mkdirSync(OUTDIR, { recursive: true });
writeFileSync(join(OUTDIR, `${name}.json`), JSON.stringify(out, null, 1));
console.log(`${name}: ${Object.keys(out).length}개 수식 평가 → trial_test/engine-snapshot/${name}.json`);
