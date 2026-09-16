// scripts/gen-calc-sheet.mjs — 사용자 확인용 계산작업 시험지 + 조건 빈 열 대조 파일 생성.
//  · trial_test/calc-sheet/calc-{basic-5,hard-5,basic-3}.xlsx (+ .md 지시문/기준수식)
//  · trial_test/calc-sheet/blank-criteria.xlsx == trial_test/calc-parity/parity5.xlsx (D함수 조건 빈 열 동치 6사례)
// 모두 캐시값 없음 + fullCalcOnLoad(파리티 방식). 사람이 엑셀에서 풀어 확인.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { composeCalc } from "../src/utils/calc/calcAssembler.js";
import { buildCalcInstanceSheet } from "../src/utils/calc/calcSheetBuilder.js";
import { subtypesForSeed } from "./_calcCompose.mjs";
import { addXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "trial_test", "calc-sheet");
const PARITY = join(__dirname, "..", "trial_test", "calc-parity");
mkdirSync(DIR, { recursive: true });
mkdirSync(PARITY, { recursive: true });

// 캐시값 제거 + fullCalcOnLoad + calcChain 제거 (파리티 생성과 동일)
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

// ── 시험지 3종 + .md ──
const CASES = [["calc-basic-5", "기본", 5], ["calc-hard-5", "어려움", 5], ["calc-basic-3", "기본", 3]];
for (const [name, diff, n] of CASES) {
  const seed = `demo~${name}`;
  const inst = composeCalc(seed, { subtypes: subtypesForSeed(seed, diff, n), difficulty: diff });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildCalcInstanceSheet(inst), "계산작업");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([[`demo:${name}`]]), "_meta");
  wb.Workbook = { Sheets: wb.SheetNames.map((s) => ({ name: s, Hidden: s === "_meta" ? 1 : 0 })) };
  writeFileSync(join(DIR, `${name}.xlsx`), await toBufferNoCache(wb));
  const md = [`# ${name} (난이도 ${diff} · ${n}문항 · 시드 ${seed})`, "", "엑셀에서 결과·조건 칸을 채워 확인. 기준 수식은 참고용.", ""];
  inst.items.forEach((it) => {
    md.push(`## ${it.no}. [${it.subtype}]`, `> ${it.text}`);
    for (const nt of it.notes) md.push(`> ▶ ${nt}`);
    md.push("", `- 결과 범위: ${it.result.range} (${it.result.kind})`);
    if (it.criteria) md.push(`- 조건 범위: ${it.criteria.range}`);
    md.push(`- 기준 수식: \`${it.answer.formula}\``, `- 기대값: ${Object.entries(it.expected).map(([a, v]) => `${a}=${(v && typeof v === "object") ? v.error : JSON.stringify(v)}`).join(", ")}`, "");
  });
  writeFileSync(join(DIR, `${name}.md`), md.join("\n"), "utf8");
  console.log("생성:", name, `(${inst.items.map((i) => i.subtype).join(",")})`);
}

// ── 조건 빈 열 동치 6사례 (parity5) ──
{
  const cells = {};
  const Snum = (a, n) => { cells[a] = { t: "n", v: n }; };
  const Stext = (a, s) => { cells[a] = { t: "s", v: String(s) }; };
  const Sfml = (a, f) => { cells[a] = { t: "n", v: 0, f: addXlfn(String(f).replace(/^=/, "")) }; };
  // db H1:K9 (지역/점수/반/코드) 8행
  Stext("H1", "지역"); Stext("I1", "점수"); Stext("J1", "반"); Stext("K1", "코드");
  [["서울", 80, "1반", 1], ["부산", 60, "2반", 2], ["서울", 90, "1반", 1], ["대구", 70, "3반", 3], ["부산", 75, "2반", 2], ["서울", 85, "1반", 1], ["인천", 65, "3반", 3], ["부산", 95, "2반", 2]]
    .forEach((r, i) => { const R = i + 2; Stext(`H${R}`, r[0]); Snum(`I${R}`, r[1]); Stext(`J${R}`, r[2]); Snum(`K${R}`, r[3]); });
  // 조건: 단일(서울) M1:M2, 빈 열 붙임 M1:N2 (N 비움). OR 2행(서울/부산) P1:P3, 빈 열 P1:Q3 (Q 비움).
  Stext("M1", "지역"); Stext("M2", "서울");
  Stext("P1", "지역"); Stext("P2", "서울"); Stext("P3", "부산");
  const eqDesc = [
    ["DAVERAGE", "I", 'DAVERAGE(H1:K9,"점수",M1:M2)', 'DAVERAGE(H1:K9,"점수",M1:N2)', "단일 조건 + 빈 열"],
    ["DSUM", "I", 'DSUM(H1:K9,"점수",M1:M2)', 'DSUM(H1:K9,"점수",M1:N2)', "단일 조건 + 빈 열"],
    ["DCOUNTA", "H", 'DCOUNTA(H1:K9,"지역",M1:M2)', 'DCOUNTA(H1:K9,"지역",M1:N2)', "단일 조건 + 빈 열"],
    ["DMAX", "I", 'DMAX(H1:K9,"점수",M1:M2)', 'DMAX(H1:K9,"점수",M1:N2)', "단일 조건 + 빈 열"],
    ["DAVERAGE-OR", "I", 'DAVERAGE(H1:K9,"점수",P1:P3)', 'DAVERAGE(H1:K9,"점수",P1:Q3)', "OR 2행 + 빈 열"],
    ["DSUM-OR", "I", 'DSUM(H1:K9,"점수",P1:P3)', 'DSUM(H1:K9,"점수",P1:Q3)', "OR 2행 + 빈 열"],
  ];
  const C = [];
  eqDesc.forEach(([tag, , normal, blank, desc], i) => {
    // 동치 여부(빈 열 있으나 없으나 같은가) + 두 원값
    C.push([`p5-${String(i + 1).padStart(2, "0")}-eq`, "EQ", `(${normal})=(${blank})`, `${desc}: 동치면 TRUE`]);
    C.push([`p5-${String(i + 1).padStart(2, "0")}-a`, "VAL", normal, `${desc}: 조건범위 정상`]);
    C.push([`p5-${String(i + 1).padStart(2, "0")}-b`, "VAL", blank, `${desc}: 조건범위 빈 열 포함`]);
  });
  Stext("A1", "ID"); Stext("B1", "수식"); Stext("C1", "설명"); Stext("D1", "범주");
  C.forEach((row, i) => { const R = i + 2; Stext(`A${R}`, row[0]); Sfml(`B${R}`, row[2]); Stext(`C${R}`, row[3]); Stext(`D${R}`, row[1]); });
  let maxR = 1, maxC = 0;
  for (const a of Object.keys(cells)) { const { r, c } = XLSX.utils.decode_cell(a); if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
  cells["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
  cells["!cols"] = [{ wch: 12 }, { wch: 40 }, { wch: 28 }, { wch: 6 }];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, cells, "parity5");
  const buf = await toBufferNoCache(wb);
  writeFileSync(join(PARITY, "parity5.xlsx"), buf);
  writeFileSync(join(DIR, "blank-criteria.xlsx"), buf);
  console.log("생성: parity5.xlsx / blank-criteria.xlsx (동치 6 + 원값 12 = 18 사례)");
}
