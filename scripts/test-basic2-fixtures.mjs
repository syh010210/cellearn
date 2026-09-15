// scripts/test-basic2-fixtures.mjs — 실제 엑셀 정답 픽스처 채점. 실행: npm run test:fixtures
// trial_test/basic2-fixtures/{seed}.answer.xlsx 를 assembleBasic2(seed) 문제로 채점 → 전부 만점이어야 통과.
// (자기검증에서 제외된 셀 스타일·메모·이름 정의·병합 그룹·밑줄 4종·대각선·선택하여 붙여넣기를 실파일로 검증)

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assembleBasic2 } from "../src/utils/basic2Assembler.js";
import { parseWorkbookStyles } from "../src/utils/xlsxStyles.js";
import { gradeBasic2 } from "../src/utils/basic2Grader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "trial_test", "basic2-fixtures");

if (!existsSync(DIR)) { console.error(`폴더 없음: ${DIR}`); process.exit(1); }
const answers = readdirSync(DIR).filter((f) => /\.answer\.xlsx$/i.test(f)).sort();
if (answers.length === 0) {
  console.error(`정답 파일(*.answer.xlsx)이 없습니다: ${DIR}`);
  console.error(`엑셀에서 fx-*.xlsx 를 풀어 fx-*.answer.xlsx 로 저장하세요.`);
  process.exit(1);
}

let pass = 0, fail = 0;
for (const file of answers) {
  const seed = file.replace(/\.answer\.xlsx$/i, "");
  // 고정 문제(problem.json)가 있으면 그것으로 채점 — 조립기가 바뀌어도 answer 파일이 계속 유효.
  const pjson = join(DIR, `${seed}.problem.json`);
  const problem = existsSync(pjson) ? JSON.parse(readFileSync(pjson, "utf8")) : assembleBasic2(seed);
  const styles = await parseWorkbookStyles(readFileSync(join(DIR, file)));
  const g = gradeBasic2(styles, problem);
  const full = g.sheetFound && g.earned === g.total;
  if (full) { pass++; console.log(`✓ ${seed}: ${g.earned}/${g.total}`); }
  else {
    fail++;
    console.log(`✗ ${seed}: ${g.earned}/${g.total}${g.sheetFound ? "" : " (시트 없음)"}`);
    for (const it of g.items) {
      if (it.ok) continue;
      console.log(`   ${it.no}번 (${it.earned}/${it.points}):`);
      for (const r of it.reasons) console.log(`     - ${r}`);
    }
  }
}
console.log(`\n결과: ${pass} 만점 / ${fail} 미만점 (총 ${answers.length}개)`);
process.exit(fail ? 1 : 0);
