// src/utils/calc/calcSheetBuilder.js
// composeCalc/buildInstance 인스턴스 → 계산작업 시트(xlsx-js-style worksheet).
//  · 값 셀 {t,v,z}. 날짜·시간은 serial + z. 텍스트 숫자(코드 열)는 t:'s'.
//  · 중간 수식 셀은 {t:'n', f}(선행 = 없이) + _xlfn. 접두(RANK.EQ·STDEV.S·MODE.SNGL·DAYS). 캐시값 없음.
//  · 결과·조건 칸은 instance.cells 에 없으므로 셀을 만들지 않는다(빈칸 = 학생이 채움).
//  · 병합·열 너비·사용 영역. 글꼴은 기본작업-2 빌더와 같은 기본값(테두리·채우기 없음).
// 독립 모듈(examBuilder 배선은 3d-2 이후).
import XLSX from "xlsx-js-style";
import { addXlfn } from "../../data/exam/calc/functions.js";

const baseStyle = () => ({ font: { name: "맑은 고딕", sz: 11 }, alignment: { vertical: "center" } });
const colToIdx = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

export function buildCalcInstanceSheet(instance) {
  const ws = {};
  for (const [addr, c] of Object.entries(instance.cells)) {
    let cell;
    if (c.f !== undefined) {
      cell = { t: "n", f: addXlfn(String(c.f).replace(/^=/, "")) }; // 캐시값(v) 넣지 않음 → fullCalcOnLoad 로 재계산
    } else {
      const t = c.t || (typeof c.v === "number" ? "n" : "s");
      cell = { t, v: t === "n" ? Number(c.v) : String(c.v) };
      if (c.z) cell.z = c.z;
    }
    cell.s = baseStyle();
    ws[addr] = cell;
  }
  if (instance.merges && instance.merges.length) ws["!merges"] = instance.merges.map((m) => XLSX.utils.decode_range(m));
  // 열 너비: colWidths(열문자→wch). 사용 영역 폭까지 채우고 미지정은 기본 9.
  const cw = instance.colWidths || {};
  const usedC = instance.usedRange ? XLSX.utils.decode_range(instance.usedRange).e.c : 0;
  const maxCol = Math.max(usedC, ...Object.keys(cw).map(colToIdx), 0);
  const cols = [];
  for (let i = 0; i <= maxCol; i++) { const L = XLSX.utils.encode_col(i); cols[i] = { wch: cw[L] || 9 }; }
  ws["!cols"] = cols;
  ws["!ref"] = instance.usedRange || "A1";
  return ws;
}
