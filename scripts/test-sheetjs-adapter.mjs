// scripts/test-sheetjs-adapter.mjs (test:calc 포함) — engineGetCell 과 sheetjsGetCell 이 같은 파일에서 같은 결과.
// 수식·숫자·텍스트·빈 문자열·오류 셀을 엔진에 올려 engineGetCell 값을 얻고, 같은 내용을 SheetJS 파일로
// 써서(수식+캐시값) 읽어 sheetjsGetCell 과 비교한다.
import XLSX from "xlsx-js-style";
import { Sheet } from "../src/excel-engine/index.js";
import { engineGetCell } from "../src/utils/calc/cellAdapter.js";
import { sheetjsGetCell } from "../src/utils/calc/sheetjsGetCell.js";
import { stripXlfn } from "../src/data/exam/calc/functions.js";

let pass = 0, fail = 0;
const check = (n, c, e = "") => { if (c) pass++; else { fail++; console.log(`✗ ${n}  ${e}`); } };

const E = new Sheet();
E.setCellValue("A1", 10);                       // 숫자
E.setCellValue("A2", "안녕");                    // 텍스트
E.setCellInput("A3", "=A1*2");                  // 수식(숫자) → 20
E.setCellInput("A4", '=IF(1=2,1,"")');          // 수식(빈 문자열)
E.setCellInput("A5", "=10/0");                  // 오류 #DIV/0!
E.setCellInput("A6", '="가"&"나"');              // 수식(텍스트)
const eg = engineGetCell(E);
const addrs = ["A1", "A2", "A3", "A4", "A5", "A6"];

// 학생 저장 파일 모사: 수식 셀은 f + 캐시값, 값 셀은 값. 오류는 t:'e' w:오류문자열.
const ws = { "!ref": "A1:A6" };
for (const a of addrs) {
  const g = eg(a);
  if (g.f !== undefined) {
    if (g.t === "e") ws[a] = { t: "e", f: g.f, w: g.v, v: 0x07 };
    else if (g.t === "n") ws[a] = { t: "n", f: g.f, v: g.v };
    else ws[a] = { t: "s", f: g.f, v: g.v };
  } else if (g.t === "n") ws[a] = { t: "n", v: g.v };
  else ws[a] = { t: "s", v: g.v };
}
const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "s");
const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
const ws2 = XLSX.read(buf, { type: "buffer", cellFormula: true }).Sheets["s"];
const sg = sheetjsGetCell(ws2);

for (const a of addrs) {
  const e = eg(a), s = sg(a);
  check(`${a} t`, e.t === s.t, `${e.t}≠${s.t}`);
  check(`${a} v`, String(e.v) === String(s.v), `${JSON.stringify(e.v)}≠${JSON.stringify(s.v)}`);
  check(`${a} f`, stripXlfn(e.f || "") === stripXlfn(s.f || ""), `${e.f}≠${s.f}`);
}
// 빈 셀 → null
check("빈 셀 null", sg("Z9") === null);

console.log(`\nSheetJS 어댑터: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
