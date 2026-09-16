// scripts/calc-parity3-gen.mjs → trial_test/calc-parity/parity3.xlsx
// 3차 대조: 정렬 안 된 범위의 MATCH 근사(1·-1), 근사 VLOOKUP/HLOOKUP(키 존재/부재), 정렬 대조군,
//  COUNTIF 머리글 포함 범위("<>서울"·"*"·">=80"·80). 1·2차와 같은 방식(캐시값 제거·fullCalcOnLoad·_xlfn).
// 사람이 엑셀에서 열어 전체 재계산 후 parity3.answer.xlsx 로 저장한다.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { addXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "trial_test", "calc-parity", "parity3.xlsx");

// 엑셀 자체가 이진 탐색으로 설명되지 않는 사례 → check 에서 대조 제외(참고용, 실제 제외는 calc-parity-check.EXCEL_UNDEFINED).
export const EXCEL_UNDEFINED = ["p3-M-18", "p3-S-02"]; // MATCH(MIN,,-1) 최솟값@1행: 이진 탐색으로 설명 안 됨

const cells = {};
const Snum = (a, n) => { cells[a] = { t: "n", v: n }; };
const Stext = (a, s) => { cells[a] = { t: "s", v: String(s) }; };
const Sfml = (a, f) => { cells[a] = { t: "n", v: 0, f: addXlfn(String(f).replace(/^=/, "")) }; };

// ── 입력 영역 (col H~) ──
// 정렬 안 된 범위: 최댓값 위치 = 첫(H) · 중간(I) · 마지막(J), 정렬 대조군(K)
const H = [95, 40, 60, 20, 80, 30, 70];   // max95@H2(첫), min20@H5(중간)
const I = [40, 60, 95, 20, 80, 30, 70];   // max95@I4(중간), min20@I5
const J = [20, 60, 40, 80, 30, 70, 95];   // min20@J2(첫), max95@J8(마지막)
const K = [20, 30, 40, 60, 70, 80, 95];   // 정렬 오름차순(대조군)
const NAMES7 = ["가나", "다라", "마바", "사아", "자차", "카타", "파하"];
Stext("H1", "H값"); Stext("I1", "I값"); Stext("J1", "J값"); Stext("K1", "K값(정렬)"); Stext("N1", "이름");
for (let i = 0; i < 7; i++) { const R = i + 2; Snum(`H${R}`, H[i]); Snum(`I${R}`, I[i]); Snum(`J${R}`, J[i]); Snum(`K${R}`, K[i]); Stext(`N${R}`, NAMES7[i]); }

// 정렬 안 된 참조표(세로): 키 P2:P6, 값 Q2:Q6
const LKEY = [50, 20, 80, 30, 60], LVAL = ["e", "b", "h", "c", "f"];
Stext("P1", "키"); Stext("Q1", "값");
for (let i = 0; i < 5; i++) { const R = i + 2; Snum(`P${R}`, LKEY[i]); Stext(`Q${R}`, LVAL[i]); }
// 정렬 안 된 참조표(가로): 키 R2:V2, 값 R3:V3
["R", "S", "T", "U", "V"].forEach((c, i) => { Snum(`${c}2`, LKEY[i]); Stext(`${c}3`, LVAL[i]); });

// COUNTIF 머리글 포함 범위: 텍스트열 W(머리글 "지역"), 숫자열 X(머리글 "점수")
Stext("W1", "지역");
["서울", "부산", "서울", "대구", "인천", "서울", "광주"].forEach((v, i) => Stext(`W${i + 2}`, v));
Stext("X1", "점수");
[90, 80, 75, 80, 60, 95, 50].forEach((v, i) => Snum(`X${i + 2}`, v));

// ── 사례 ──
const C = [];
const cnt = {};
const K_ = (cat, f, desc) => { cnt[cat] = (cnt[cat] || 0) + 1; C.push([`p3-${cat}-${String(cnt[cat]).padStart(2, "0")}`, cat, f, desc]); };

// M. 정렬 안 된 범위의 MATCH 근사(1·-1) — 최대/최소값. 위치가 첫·중간·마지막
for (const [col, where] of [["H", "max첫/min중간"], ["I", "max중간"], ["J", "max마지막/min첫"]]) {
  const R = `${col}2:${col}8`;
  K_("M", `=MATCH(MAX(${R}),${R},1)`, `${where} MAX ,1`);
  K_("M", `=MATCH(MAX(${R}),${R},-1)`, `${where} MAX ,-1`);
  K_("M", `=MATCH(MIN(${R}),${R},1)`, `${where} MIN ,1`);
  K_("M", `=MATCH(MIN(${R}),${R},-1)`, `${where} MIN ,-1`);
  K_("M", `=MATCH(MAX(${R}),${R},0)`, `${where} MAX ,0(대조)`);
  K_("M", `=INDEX(N2:N8,MATCH(MAX(${R}),${R},0))`, `${where} INDEX+MATCH,0`);
  K_("M", `=INDEX(N2:N8,MATCH(MAX(${R}),${R},1))`, `${where} INDEX+MATCH,1`);
}

// S. 정렬된 범위 대조군(K)
K_("S", "=MATCH(MAX(K2:K8),K2:K8,1)", "정렬 MAX ,1 → 마지막");
K_("S", "=MATCH(MIN(K2:K8),K2:K8,-1)", "정렬 MIN ,-1");
K_("S", "=MATCH(50,K2:K8,1)", "정렬 근사 50(존재)");
K_("S", "=MATCH(55,K2:K8,1)", "정렬 근사 55(부재→≤55 최대=50)");
K_("S", "=MATCH(15,K2:K8,1)", "정렬 근사 15(<최소 → #N/A)");

// L. 정렬 안 된 참조표 근사/정확 (키 존재/부재)
K_("L", "=VLOOKUP(30,P2:Q6,2,TRUE)", "세로 근사 30(존재)");
K_("L", "=VLOOKUP(30,P2:Q6,2,1)", "세로 근사 30(옵션1)");
K_("L", "=VLOOKUP(30,P2:Q6,2)", "세로 근사 30(4번째 생략)");
K_("L", "=VLOOKUP(45,P2:Q6,2,TRUE)", "세로 근사 45(사이 부재)");
K_("L", "=VLOOKUP(100,P2:Q6,2,TRUE)", "세로 근사 100(>최대)");
K_("L", "=VLOOKUP(5,P2:Q6,2,TRUE)", "세로 근사 5(<최소)");
K_("L", "=VLOOKUP(30,P2:Q6,2,FALSE)", "세로 정확 30(존재, 대조)");
K_("L", "=VLOOKUP(45,P2:Q6,2,FALSE)", "세로 정확 45(부재 → #N/A, 대조)");
K_("L", "=HLOOKUP(30,R2:V3,2,TRUE)", "가로 근사 30(존재)");
K_("L", "=HLOOKUP(45,R2:V3,2,TRUE)", "가로 근사 45(부재)");
K_("L", "=HLOOKUP(80,R2:V3,2,FALSE)", "가로 정확 80(존재, 대조)");

// C. COUNTIF 머리글 포함 범위
K_("C", '=COUNTIF(W1:W8,"<>서울")', "머리글포함 <>서울 (지역+비서울)");
K_("C", '=COUNTIF(W2:W8,"<>서울")', "머리글제외 <>서울 (대조)");
K_("C", '=COUNTIF(W1:W8,"*")', "머리글포함 * (텍스트 전부)");
K_("C", '=COUNTIF(W2:W8,"*")', "머리글제외 * (대조)");
K_("C", '=COUNTIF(X1:X8,">=80")', "머리글포함 >=80 (머리글 텍스트 무시)");
K_("C", '=COUNTIF(X2:X8,">=80")', "머리글제외 >=80 (대조)");
K_("C", '=COUNTIF(X1:X8,80)', "머리글포함 =80");
K_("C", '=COUNTIF(X1:X8,"<>서울")', "숫자열+머리글 <>서울 (전부 카운트)");

// 기록
Stext("A1", "ID"); Stext("B1", "수식"); Stext("C1", "설명"); Stext("D1", "범주");
C.forEach((row, i) => { const R = i + 2; Stext(`A${R}`, row[0]); Sfml(`B${R}`, row[2]); Stext(`C${R}`, row[3]); Stext(`D${R}`, row[1]); });

let maxR = 1, maxC = 0;
for (const a of Object.keys(cells)) { const { r, c } = XLSX.utils.decode_cell(a); if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
cells["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
cells["!cols"] = [{ wch: 10 }, { wch: 42 }, { wch: 30 }, { wch: 6 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, cells, "parity3");
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
