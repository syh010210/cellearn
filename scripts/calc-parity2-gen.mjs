// scripts/calc-parity2-gen.mjs → trial_test/calc-parity/parity2.xlsx
// A~F 엔진 수정 6건의 경계 사례. 1차와 같은 방식(캐시값 제거·fullCalcOnLoad·텍스트 숫자 t:'s'·_xlfn).
// 사람이 엑셀에서 열어 전체 재계산 후 parity2.answer.xlsx 로 저장한다.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { addXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "trial_test", "calc-parity", "parity2.xlsx");

const cells = {};
const Snum = (a, n) => { cells[a] = { t: "n", v: n }; };
const Stext = (a, s) => { cells[a] = { t: "s", v: String(s) }; };
const Sfml = (a, f) => { cells[a] = { t: "n", v: 0, f: addXlfn(String(f).replace(/^=/, "")) }; };

// ── 입력 영역 (col H~) ──
// A. D함수/COUNTIF 대조용 표 (지역/점/반/코드)
Stext("H1", "지역"); Stext("I1", "점"); Stext("J1", "반"); Stext("K1", "코드");
const DB = [
  ["서울", 10, "1반", 1],
  ["서울시", 20, "1반", 2],
  ["서울특별시", 30, "2반", 3],
  ["SEOUL", 40, "1반", 1],
  ["seoul", 50, "2반", 2],
  ["부산", 60, "1반", 3],
  ["*VIP", 70, "3반", 4],
];
DB.forEach((r, i) => { const R = i + 2; Stext(`H${R}`, r[0]); Snum(`I${R}`, r[1]); Stext(`J${R}`, r[2]); Snum(`K${R}`, r[3]); });
// 조건 범위들
Stext("M1", "지역"); Stext("M2", "서울");
Stext("N1", "지역"); Stext("N2", "seoul");
Stext("O1", "지역"); Stext("O2", "=서울");
Stext("P1", "지역"); Stext("P2", "서*");
Stext("Q1", "지역"); Stext("Q2", "?울");
Stext("R1", "지역"); Stext("R2", "서울*시");
Stext("S1", "지역"); Stext("S2", "~*VIP");
Stext("T1", "코드"); Snum("T2", 1);
Stext("U1", "반"); Stext("V1", "점"); Stext("U2", "1반"); Stext("V2", ">=30");
// D. VLOOKUP 근사/정확 대조 표 (H12:I14)
Snum("H12", 10); Stext("I12", "a"); Snum("H13", 20); Stext("I13", "b"); Snum("H14", 30); Stext("I14", "c");
// F. COUNTIF("") 대조용 범위 (H16:H20, 일부 공백)
Snum("H16", 1); Snum("H18", 2); Snum("H20", 3);
// E. 단항^ 참조 셀
Snum("Y1", 3);

// ── 사례 ──
const C = [];
const cnt = {};
const K = (cat, f, desc) => { cnt[cat] = (cnt[cat] || 0) + 1; C.push([`p2-${cat}-${String(cnt[cat]).padStart(2, "0")}`, cat, f, desc]); };

// A. D함수 텍스트 조건(앞부분) + COUNTIF 완전일치 대조 + 와일드카드
K("A", '=DCOUNTA(H1:K8,"지역",M1:M2)', "prefix 서울 → 서울/서울시/서울특별시 =3");
K("A", '=DCOUNTA(H1:K8,"지역",N1:N2)', "prefix seoul(대소문자무시) → SEOUL/seoul =2");
K("A", '=DCOUNTA(H1:K8,"지역",O1:O2)', '"=서울" 완전일치 =1');
K("A", '=DCOUNTA(H1:K8,"지역",P1:P2)', "와일드 서* =3");
K("A", '=DCOUNTA(H1:K8,"지역",Q1:Q2)', "와일드 ?울 =1(서울)");
K("A", '=DCOUNTA(H1:K8,"지역",R1:R2)', "와일드 서울*시 =2");
K("A", '=DCOUNTA(H1:K8,"지역",S1:S2)', "~* 이스케이프 → *VIP =1");
K("A", '=DCOUNT(H1:K8,"점",T1:T2)', "숫자필드 코드=1 → 2");
K("A", '=COUNTIF(H2:H8,"서울")', "COUNTIF 완전일치 서울 =1 (대조)");
K("A", '=COUNTIF(H2:H8,"서*")', "COUNTIF 와일드 서* =3");
K("A", '=DCOUNT(H1:K8,"점",U1:V2)', "AND: 1반(prefix)+점>=30 → 2");
K("A", '=DSUM(H1:K8,"점",U1:V2)', "AND DSUM → 40+60=100");

// B. CHOOSE 경계
K("B", '=CHOOSE(0.5,"a","b")', "0.5 → #VALUE!");
K("B", '=CHOOSE(1.999,"a","b")', "1.999 → a(절사)");
K("B", '=CHOOSE(-1,"a","b")', "-1 → #VALUE!");
K("B", '=CHOOSE("2","a","b","c")', '"2" → b');

// C. 숫자→텍스트 15유효자리
K("C", '=1/3&""', "1/3");
K("C", '=2/3&""', "2/3");
K("C", '=0.1*3&""', "0.1*3");
K("C", '=123456789.123456789&""', "긴 소수");
K("C", '=1E+20&""', "매우 큰 수(지수)");
K("C", '=0.000001234&""', "매우 작은 수");
K("C", '=LEFT(0.1+0.2,3)', "LEFT(숫자,3)");
K("C", '=LEN(1/3)', "LEN(1/3)");
K("C", '=AVERAGE(I2:I8)&"명"', "평균&명");
K("C", '=78.56*3/3&""', "78.56*3/3");

// D. 인수 생략
K("D", '=TIME(1,,)*86400', "TIME(1,,) = 3600초");
K("D", '=TIME(,,90)*86400', "TIME(,,90) = 90초");
K("D", '=IF(1>2,"a",)', "IF 빈 거짓인수 = 0");
K("D", '=VLOOKUP(25,H12:I14,2,)', "VLOOKUP 빈4번째=정확 → #N/A");
K("D", '=VLOOKUP(25,H12:I14,2)', "VLOOKUP 3인수=근사 → b");
K("D", '=DATE(2026,,1)', "DATE(2026,,1) → 2025-12-01");
K("D", '=ROUND(2.5,)', "ROUND(2.5,) = 3");

// E. 연산자 우선순위
K("E", '=-2^2', "-2^2 = 4");
K("E", '=2-3^2', "2-3^2 = -7");
K("E", '=-(2)^2', "-(2)^2 = 4");
K("E", '=50%^2', "50%^2 = 0.25");
K("E", '=2^-1', "2^-1 = 0.5");
K("E", '=-Y1^2', "-Y1^2 = 9 (Y1=3)");
K("E", '=10%*10%', "10%*10% = 0.01");

// F. 빈 셀 비교 (Z1,Z2 는 빈 셀)
K("F", '=Z1=""', '빈="" → TRUE');
K("F", '=Z1<>""', '빈<>"" → FALSE');
K("F", '=Z1=0', "빈=0 → TRUE");
K("F", '=Z1<1', "빈<1 → TRUE");
K("F", '=Z1>"a"', '빈>"a" → FALSE');
K("F", '=Z1=FALSE', "빈=FALSE → TRUE");
K("F", '=Z1=Z2', "빈=빈 → TRUE");
K("F", '=IF(Z1="","무","유")', "IF(빈=\"\") → 무");
K("F", '=COUNTIF(H16:H20,"")', 'COUNTIF("") 빈칸수 =2 (대조)');

// 기록
Stext("A1", "ID"); Stext("B1", "수식"); Stext("C1", "설명"); Stext("D1", "범주");
C.forEach((row, i) => { const R = i + 2; Stext(`A${R}`, row[0]); Sfml(`B${R}`, row[2]); Stext(`C${R}`, row[3]); Stext(`D${R}`, row[1]); });

let maxR = 1, maxC = 0;
for (const a of Object.keys(cells)) { const { r, c } = XLSX.utils.decode_cell(a); if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
cells["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
cells["!cols"] = [{ wch: 10 }, { wch: 40 }, { wch: 34 }, { wch: 6 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, cells, "parity2");
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

const byCat = {};
C.forEach((r) => { byCat[r[1]] = (byCat[r[1]] || 0) + 1; });
console.log("생성:", OUT, "총", C.length, "사례");
console.log("범주별:", Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join("  "));
