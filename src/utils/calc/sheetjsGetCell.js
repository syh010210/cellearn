// src/utils/calc/sheetjsGetCell.js
// SheetJS worksheet → getCell(addr) → { f, v, t, w } | null. calcGrader 업로드 파일 채점용 어댑터.
//  · f 는 선행 "=" 없이(SheetJS 규칙과 동일하나 방어적으로 제거).
//  · 오류 셀 t:'e' → v 를 오류 문자열("#N/A" 등, SheetJS 의 w)로 맞춘다(calcGrader valueEq 가 exp.error 와 v 비교).
//  · 논리 t:'b' v:boolean. 숫자 t:'n' v:number. 그 외/빈 문자열 t:'s' v:''(문자열).
//  · engineGetCell 과 같은 형태(형태만 맞춘다 — 3d-0 조사).
export function sheetjsGetCell(ws) {
  return (addr) => {
    const c = ws[String(addr).toUpperCase()];
    if (!c) return null;
    const f = c.f !== undefined ? String(c.f).replace(/^=/, "") : undefined;
    if (c.t === "e") { const err = c.w != null ? String(c.w) : String(c.v); return { f, v: err, t: "e", w: err }; }
    if (c.t === "b") return { f, v: !!c.v, t: "b", w: c.v ? "TRUE" : "FALSE" };
    if (c.t === "n") return { f, v: Number(c.v), t: "n", w: c.w != null ? String(c.w) : String(c.v) };
    const v = c.v == null ? "" : String(c.v); // t:'s' | 't:str' | undefined
    return { f, v, t: "s", w: c.w != null ? String(c.w) : v };
  };
}
