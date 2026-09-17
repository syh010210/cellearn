// scripts/gen-calc-compose.mjs — 시험 구성기 미리보기.
//  trial_test/calc-compose/ 에 난이도 2 × 문항 2 × 시드 3 = 12개 .xlsx + .md
//  (문항별 소유형·변형·resultKind·지시문·기준 수식·기대값). 캐시값 없음 + fullCalcOnLoad.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { composeExamCalc } from "../src/utils/calc/composeExamCalc.js";
import { buildCalcInstanceSheet } from "../src/utils/calc/calcSheetBuilder.js";
import { makeRng, planItem } from "../src/utils/calc/calcAssembler.js";
import { resolveBlock } from "../src/utils/calc/calcBlock.js";

const colL = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const a1 = (r, c) => colL(c) + (r + 1);
// 블록별 위치(표N 범위 + 부착물 범위·배치) 재현
function blockPositions(inst) {
  const ex = inst._exam, rng = makeRng(`${ex.seed}~exam#${ex.attempt}`);
  const specs = ex.items.map((it) => planItem(it.subtype, it.variantId, ex.difficulty, rng).spec);
  return specs.map((s, i) => {
    const b = resolveBlock(s, "표"), O = inst.items[i].origin;
    const AR = (rg) => `${a1(O.r + rg.r1, O.c + rg.c1)}:${a1(O.r + rg.r2, O.c + rg.c2)}`;
    const table = `${a1(O.r, O.c)}:${a1(O.r + b.tableBottom, O.c + b.nCols - 1)}`;
    let att = "";
    if (b.criteria) att = ` [조건 ${AR(b.criteria.range)} right]`;
    else if (b.refTableRange) att = ` [참조표 ${AR(b.refTableRange)} right]`;
    else if (b.resultTableRange) att = ` [결과표 ${AR(b.resultTableRange)} right]`;
    return `표${i + 1} ${table}${att}`;
  });
}

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "trial_test", "calc-compose");
mkdirSync(DIR, { recursive: true });

async function toBufferNoCache(wb) {
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer", cellStyles: true });
  const zip = await JSZip.loadAsync(buf);
  for (const name of Object.keys(zip.files)) {
    if (/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) {
      let xml = await zip.file(name).async("string");
      xml = xml.replace(/(<f[^>]*>[^<]*<\/f>)<v>[^<]*<\/v>/g, "$1");
      zip.file(name, xml);
    }
  }
  let wbx = await zip.file("xl/workbook.xml").async("string");
  wbx = /<calcPr[^>]*\/>/.test(wbx) ? wbx.replace(/<calcPr[^>]*\/>/, '<calcPr calcId="0" fullCalcOnLoad="1"/>') : wbx.replace("</workbook>", '<calcPr calcId="0" fullCalcOnLoad="1"/></workbook>');
  zip.file("xl/workbook.xml", wbx);
  if (zip.file("xl/calcChain.xml")) {
    zip.remove("xl/calcChain.xml");
    zip.file("[Content_Types].xml", (await zip.file("[Content_Types].xml").async("string")).replace(/<Override PartName="\/xl\/calcChain\.xml"[^>]*\/>/, ""));
    zip.file("xl/_rels/workbook.xml.rels", (await zip.file("xl/_rels/workbook.xml.rels").async("string")).replace(/<Relationship[^>]*calcChain\.xml"[^>]*\/>/, ""));
  }
  return zip.generateAsync({ type: "nodebuffer" });
}

const DIFFS = { "기본": "basic", "어려움": "hard" };
for (const [diff, dtag] of Object.entries(DIFFS)) {
  for (const count of [5, 3]) {
    for (let s = 0; s < 3; s++) {
      const seed = `preview~${s}`;
      const inst = composeExamCalc(seed, { count, difficulty: diff });
      const name = `compose-${dtag}-${count}-s${s}`;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildCalcInstanceSheet(inst), "계산작업");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[name]]), "_meta");
      wb.Workbook = { Sheets: wb.SheetNames.map((sh) => ({ name: sh, Hidden: sh === "_meta" ? 1 : 0 })) };
      writeFileSync(join(DIR, `${name}.xlsx`), await toBufferNoCache(wb));
      const md = [`# ${name} — 위치: ${blockPositions(inst).join(" · ")}`, "",
        `난이도 ${diff} · ${count}문항 · 시드 ${seed} · 구성 ${inst._exam.items.map((it) => it.subtype).join("·")} (재시도 ${inst._exam.attempt})`, ""];
      inst.items.forEach((it, i) => {
        const ex = inst._exam.items[i];
        md.push(`## ${it.no}. [${ex.subtype}] ${ex.variantId}  (resultKind=${ex.resultKind}, usesD=${ex.usesD}, core=[${ex.core.join(",")}])`);
        md.push(`> ${it.text}`);
        for (const nt of it.notes) md.push(`> ▶ ${nt}`);
        md.push("", `- 결과 범위: ${it.result.range}${it.criteria ? " · 조건 범위: " + it.criteria.range : ""}`);
        md.push(`- 기준 수식: \`${it.answer.formula}\``, `- 기대값: ${Object.entries(it.expected).map(([a, v]) => `${a}=${(v && typeof v === "object") ? v.error : JSON.stringify(v)}`).join(", ")}`, "");
      });
      writeFileSync(join(DIR, `${name}.md`), md.join("\n"), "utf8");
      console.log("생성:", name, `(${inst._exam.items.map((it) => it.subtype).join(",")})`);
    }
  }
}
