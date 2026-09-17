// scripts/probe-basic2-answer.mjs — 기본작업-2 정답 서식 xlsx-js-style 쓰기 가능성 실측.
// 각 시드: 정답 시트 빌드 → 워크북 write → parseWorkbookStyles → gradeBasic2 → 검사 종류별 통과/실패 집계.
import XLSX from "xlsx-js-style";
import { assembleBasic2 } from "../src/utils/basic2Assembler.js";
import { buildBasic2AnswerSheet } from "../src/utils/basic2AnswerSheet.js";
import { parseWorkbookStyles } from "../src/utils/xlsxStyles.js";
import { gradeBasic2 } from "../src/utils/basic2Grader.js";
import { basic2ItemAnswerable, checkUnsupported } from "../src/utils/basic2AnswerSheet.js";

const kindStat = {}; // kind → { pass, fail, samples:[] }
const bump = (kind, ok, reason) => { const s = kindStat[kind] = kindStat[kind] || { pass: 0, fail: 0, samples: [] }; if (ok) s.pass++; else { s.fail++; if (s.samples.length < 3 && reason) s.samples.push(reason); } };

const N = Number(process.argv[2] || 60);
for (const difficulty of ["basic", "hard"]) {
  for (let s = 0; s < N; s++) {
    const p = assembleBasic2(`probe~${difficulty}~${s}`, { difficulty });
    const { ws, definedNames } = buildBasic2AnswerSheet(p);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, p.sheetName);
    if (definedNames.length) { wb.Workbook = wb.Workbook || {}; wb.Workbook.Names = definedNames.map((d) => ({ Name: d.Name, Ref: `'${p.sheetName}'!${d.Ref.replace(/^[^!]*!/, "")}` })); }
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx", cellStyles: true });
    const styles = await parseWorkbookStyles(buf);
    const g = gradeBasic2(styles, p);
    // 답할 수 있는 문항만 만점이어야 한다. 제외 검사 포함 문항은 별도 집계.
    for (const it of p.items) {
      const gi = g.items.find((x) => x.no === it.no);
      if (!basic2ItemAnswerable(it)) { for (const c of it.checks || []) { const u = checkUnsupported(c); if (u) bump(`제외:${u}`, false, null); } continue; }
      const kinds = [...new Set((it.checks || []).map((c) => c.kind))];
      for (const k of kinds) bump(k, gi.ok, gi.ok ? null : `${difficulty}#${s} it${it.no}: ${gi.reasons.join(" | ")}`);
    }
  }
}

console.log(`=== 기본작업-2 정답 서식 쓰기 실측 (시드 ${N}×2난이도) ===`);
console.log("검사종류 | 통과 | 실패 | 예시");
for (const [k, s] of Object.entries(kindStat).sort()) {
  console.log(`${k} | ${s.pass} | ${s.fail}${s.fail ? " | " + s.samples[0] : ""}`);
}
