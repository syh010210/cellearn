import { shiftFormula } from "../../../utils/formulaUtils.js";
import { isErrorValue } from "../../../excel-engine/index.js";

// "D2" → { ri, ci } (단일 셀만)
function parseCellA1(str) {
  const m = /^\s*([A-Za-z]+)(\d+)\s*$/.exec(str || "");
  if (!m) return null;
  let ci = 0;
  for (const ch of m[1].toUpperCase()) ci = ci * 26 + (ch.charCodeAt(0) - 64);
  return { ci: ci - 1, ri: parseInt(m[2], 10) - 1 };
}
const norm = (s) => String(s || "").replace(/\s/g, "").toUpperCase();

// 순수 채점 함수. cells는 {editable, input, answer, result, format, fillFrom, requiredFunctions} 셀의 2차원 배열.
// sheet는 excel-engine Sheet 인스턴스(getCellValue/getDisplayValue 제공).
// 반환: [{ ri, ci, addr, status:'correct'|'wrong'|'empty', reason, answer, studentInput }]
export function gradePractice({ cells, cols, sheet, requiredFunctions = [] }) {
  const addrOf = (ri, ci) => `${cols[ci]}${ri + 1}`;
  const results = [];

  cells.forEach((row, ri) => row.forEach((cell, ci) => {
    if (!cell.editable) return;
    const input = (cell.input || "").trim();
    const answer = cell.answer;
    const base = { ri, ci, addr: addrOf(ri, ci), answer, studentInput: input };

    // 1. 미입력
    if (input === "") { results.push({ ...base, status: "empty", reason: "입력하지 않았습니다" }); return; }
    // 2. 값 직접 입력
    if (!input.startsWith("=")) { results.push({ ...base, status: "wrong", reason: "수식이 아니라 값을 직접 입력했습니다" }); return; }
    // 3. 필수 함수 누락
    const req = cell.requiredFunctions || requiredFunctions || [];
    const up = input.toUpperCase();
    const missing = req.find((fn) => !up.includes(String(fn).toUpperCase()));
    if (missing) { results.push({ ...base, status: "wrong", reason: `${missing} 함수를 사용하지 않았습니다` }); return; }
    // 4. 계산 결과 에러
    const raw = sheet?.getCellValue(base.addr);
    if (isErrorValue(raw)) { results.push({ ...base, status: "wrong", reason: `수식 오류 (${raw.error}) — 참조 범위와 찾을 값을 확인하세요` }); return; }
    // 5. 결과값 불일치
    const computed = sheet?.getDisplayValue(base.addr);
    if (cell.result !== undefined) {
      const expected = cell.result;
      const eq =
        String(computed) === String(expected) ||
        (!isNaN(parseFloat(String(computed))) && !isNaN(parseFloat(String(expected))) &&
          parseFloat(String(computed)) === parseFloat(String(expected)));
      if (!eq) { results.push({ ...base, status: "wrong", reason: "결과값이 다릅니다" }); return; }
    }
    // 6. 자동 채우기 검증
    if (cell.fillFrom && answer && norm(input) !== norm(answer)) {
      const origin = parseCellA1(cell.fillFrom);
      let reason = `${cell.fillFrom}에서 자동 채우기한 결과와 다릅니다`;
      if (origin) {
        const originInput = (cells[origin.ri]?.[origin.ci]?.input || "").trim();
        const shifted = originInput.startsWith("=") ? shiftFormula(originInput, ri - origin.ri, ci - origin.ci) : originInput;
        if (originInput && norm(input) === norm(shifted)) {
          reason = "참조 범위가 밀렸습니다. 원본 수식에서 범위에 $를 붙여 고정한 뒤 다시 채우세요";
        } else if (originInput && norm(input) === norm(originInput)) {
          reason = "자동 채우기가 아니라 복사했습니다. 찾을 값이 바뀌어야 합니다";
        }
      }
      results.push({ ...base, status: "wrong", reason });
      return;
    }
    // 7. 정답
    results.push({ ...base, status: "correct", reason: "정답" });
  }));

  return results;
}
