// src/utils/calc/calcAnswerSheet.js
// 계산작업 정답 시트: 문제 시트(buildCalcInstanceSheet)와 같은 표·서식에
//  · 결과 칸 = 기준 수식(fill 범위 전체, 위치별 이동) — _xlfn. 접두 + fullCalcOnLoad 로 엑셀 재계산
//  · 조건 칸(밖 조건) = 조건 값
//  결과 칸에는 엔진이 계산한 기대값을 캐시로 함께 넣는다. 채점기는 업로드 파일의 캐시값을 읽으므로
//  (실제 제출 파일과 동일하게) 캐시가 있어야 오프라인 채점이 만점이 된다. 엑셀에서는 fullCalcOnLoad 로 재계산된다.
import XLSX from "xlsx-js-style";
import { buildCalcInstanceSheet } from "./calcSheetBuilder.js";
import { addXlfn } from "../../data/exam/calc/functions.js";
import { shiftFormula } from "../formulaUtils.js";

const decode = (a) => XLSX.utils.decode_cell(String(a).toUpperCase());
function expand1D(range) {
  const [a, b] = String(range).split(":"); if (!b) return [a];
  const s = decode(a), e = decode(b), out = [];
  for (let r = s.r; r <= e.r; r++) for (let c = s.c; c <= e.c; c++) out.push(XLSX.utils.encode_cell({ r, c }));
  return out;
}
function expand2D(range) {
  const [a, b] = String(range).split(":"); const s = decode(a), e = b ? decode(b) : s, rows = [];
  for (let r = s.r; r <= e.r; r++) { const row = []; for (let c = s.c; c <= e.c; c++) row.push(XLSX.utils.encode_cell({ r, c })); rows.push(row); }
  return rows;
}
function cachedCell(exp) {
  if (exp && typeof exp === "object" && exp.error) return { t: "e", v: exp.error };
  if (typeof exp === "number") return { t: "n", v: exp };
  if (typeof exp === "boolean") return { t: "b", v: exp };
  return { t: "s", v: exp == null ? "" : String(exp) };
}

// 인스턴스 → 정답 워크시트(문제 시트 + 결과 수식 + 조건 값)
export function buildCalcAnswerSheet(instance) {
  const ws = buildCalcInstanceSheet(instance);
  for (const it of instance.items) {
    const anc = decode(it.result.anchor);
    for (const a of expand1D(it.result.range)) {
      const p = decode(a);
      const f = addXlfn(shiftFormula(it.answer.formula, p.r - anc.r, p.c - anc.c).replace(/^=/, ""));
      const cache = cachedCell(it.expected[a]);
      const cell = { ...cache, f, s: ws[a] && ws[a].s };
      if (it.result.z) cell.z = it.result.z;
      ws[a] = cell;
    }
    if (it.criteria) {
      expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => {
        const v = it.criteria.table[ri] ? it.criteria.table[ri][ci] : undefined;
        if (v === undefined || v === null || v === "") return;
        ws[a] = { t: typeof v === "number" ? "n" : "s", v: typeof v === "number" ? v : String(v), s: ws[a] && ws[a].s };
      }));
    }
  }
  return ws;
}
