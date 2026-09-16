// src/utils/calc/cellAdapter.js
// getCell(addr) → { f, v, t, w } | null. SheetJS 셀과 같은 형태.
//  · 숫자 t:'n' · 문자열 t:'s'(""도 t:'s', 3a-2 실측) · 오류 t:'e' w:"#N/A" · 논리 t:'b' · 빈 셀 null.
//  · f 는 선행 "=" 없이. 값 셀은 f 없음.
// SheetJS 어댑터(3d)는 별도. 형태만 맞춘다.

import { isErrorValue } from "../../excel-engine/index.js";

export function engineGetCell(sheet) {
  return (addr) => {
    const A = String(addr).toUpperCase();
    const hasFormula = sheet.isFormulaCell(A);
    const v = sheet.getCellValue(A);
    if (!hasFormula && v === undefined) return null; // 빈 셀
    const f = hasFormula ? String(sheet.getRawInput(A)).replace(/^=/, "") : undefined;
    if (isErrorValue(v)) return { f, v: v.error, t: "e", w: v.error };
    if (v === undefined) return { f, v: "", t: "s", w: "" };           // 수식 결과 없음 → 빈 문자열 취급
    if (typeof v === "number") return { f, v, t: "n", w: String(v) };
    if (typeof v === "boolean") return { f, v, t: "b", w: v ? "TRUE" : "FALSE" };
    return { f, v: String(v), t: "s", w: String(v) };                  // 문자열(빈 문자열 포함)
  };
}
