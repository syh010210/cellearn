// scripts/calc-parity4-gen.mjs → trial_test/calc-parity/parity4.xlsx
// 섞인 범위(숫자·텍스트·빈 셀)의 COUNTIF/COUNTIFS/SUMIF/SUMIFS "<>"·비교연산자, D함수 조건 대조.
// 사람이 엑셀에서 열어 전체 재계산 후 parity4.answer.xlsx 로 저장한다.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { addXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "trial_test", "calc-parity", "parity4.xlsx");

const cells = {};
const Snum = (a, n) => { cells[a] = { t: "n", v: n }; };
const Stext = (a, s) => { cells[a] = { t: "s", v: String(s) }; };
const Sfml = (a, f) => { cells[a] = { t: "n", v: 0, f: addXlfn(String(f).replace(/^=/, "")) }; };

// ── 입력: 섞인 범위(항목=텍스트/숫자/빈), 금액(숫자), 분류(텍스트) ──
Stext("H1", "항목"); Stext("I1", "금액"); Stext("J1", "분류");
const ITEM = ["서울", "부산", 80, 90, null, "서울", "대구"];  // H2:H8, H6 은 빈 셀
const MONEY = [10, 20, 30, 40, 50, 60, 70];
const CLASS = ["A", "B", "A", "A", "B", "A", "B"];
ITEM.forEach((v, i) => { const R = i + 2; if (v !== null) (typeof v === "number" ? Snum : Stext)(`H${R}`, v); Snum(`I${R}`, MONEY[i]); Stext(`J${R}`, CLASS[i]); });
// D함수 조건 범위
Stext("L1", "항목"); Stext("L2", "<>서울");
Stext("M1", "항목"); Stext("M2", ">=80");

const C = [];
const cnt = {};
const K = (cat, f, desc) => { cnt[cat] = (cnt[cat] || 0) + 1; C.push([`p4-${cat}-${String(cnt[cat]).padStart(2, "0")}`, cat, f, desc]); };

// COUNTIF (섞인 범위)
K("CIF", '=COUNTIF(H2:H8,"<>서울")', "<>서울: 숫자·다른텍스트·빈 포함");
K("CIF", '=COUNTIF(H2:H8,"<>80")', "<>80: 텍스트·빈 포함");
K("CIF", '=COUNTIF(H2:H8,"<>")', "<>: 비어있지 않은 셀");
K("CIF", '=COUNTIF(H2:H8,">=80")', ">=80: 숫자 셀만");
K("CIF", '=COUNTIF(H2:H8,"=80")', "=80 정확");
K("CIF", '=COUNTIF(H2:H8,80)', "80 정확");
K("CIF", '=COUNTIF(H2:H8,"")', '"" 빈 셀');
// COUNTIFS
K("CIFS", '=COUNTIFS(H2:H8,"<>서울",J2:J8,"A")', "<>서울 & 분류A");
K("CIFS", '=COUNTIFS(H2:H8,">=80",J2:J8,"A")', ">=80 & 분류A");
// SUMIF / SUMIFS
K("SIF", '=SUMIF(H2:H8,"<>서울",I2:I8)', "<>서울 금액합");
K("SIF", '=SUMIF(H2:H8,"<>80",I2:I8)', "<>80 금액합");
K("SIF", '=SUMIF(H2:H8,">=80",I2:I8)', ">=80 금액합");
K("SIF", '=SUMIFS(I2:I8,H2:H8,"<>서울",J2:J8,"A")', "<>서울 & 분류A 금액합");
// D함수 (db H1:J8)
K("DB", '=DCOUNTA(H1:J8,"항목",L1:L2)', "DCOUNTA <>서울");
K("DB", '=DSUM(H1:J8,"금액",L1:L2)', "DSUM <>서울");
K("DB", '=DCOUNTA(H1:J8,"항목",M1:M2)', "DCOUNTA >=80");
K("DB", '=DSUM(H1:J8,"금액",M1:M2)', "DSUM >=80");

Stext("A1", "ID"); Stext("B1", "수식"); Stext("C1", "설명"); Stext("D1", "범주");
C.forEach((row, i) => { const R = i + 2; Stext(`A${R}`, row[0]); Sfml(`B${R}`, row[2]); Stext(`C${R}`, row[3]); Stext(`D${R}`, row[1]); });

let maxR = 1, maxC = 0;
for (const a of Object.keys(cells)) { const { r, c } = XLSX.utils.decode_cell(a); if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
cells["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
cells["!cols"] = [{ wch: 10 }, { wch: 42 }, { wch: 30 }, { wch: 6 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, cells, "parity4");
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
writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer" }));
const byCat = {}; C.forEach((r) => { byCat[r[1]] = (byCat[r[1]] || 0) + 1; });
console.log("생성:", OUT, "총", C.length, "사례 ·", Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join("  "));
