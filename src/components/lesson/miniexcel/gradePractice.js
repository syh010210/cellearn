import { shiftFormula } from "../../../utils/formulaUtils.js";
import { isErrorValue } from "../../../excel-engine/index.js";
import { parseFormula } from "../../../excel-engine/parser.js";
import { FUNCTION_HINTS } from "../../../utils/functionHints.js";

// "D2" → { ri, ci } (단일 셀만)
function parseCellA1(str) {
  const m = /^\s*([A-Za-z]+)(\d+)\s*$/.exec(str || "");
  if (!m) return null;
  let ci = 0;
  for (const ch of m[1].toUpperCase()) ci = ci * 26 + (ch.charCodeAt(0) - 64);
  return { ci: ci - 1, ri: parseInt(m[2], 10) - 1 };
}
const norm = (s) => String(s || "").replace(/\s/g, "").toUpperCase();
// 휘발성 함수(매번 값이 달라짐): 결과값 비교를 건너뛴다
const VOLATILE = /\b(NOW|TODAY|RAND|RANDBETWEEN)\s*\(/i;

// ── 인수 단위 비교 ──────────────────────────────────────────────
// 인수 AST → 정규화 문자열 (대문자·공백/$제거는 파서가 이미 처리, TRUE↔1·FALSE↔0 통일)
function serializeArg(node) {
  switch (node.type) {
    case "NumberLiteral": return String(node.value);
    case "BooleanLiteral": return node.value ? "1" : "0";     // TRUE=1, FALSE=0
    case "StringLiteral": return `"${String(node.value).toUpperCase()}"`;
    case "ErrorLiteral": return node.value;
    case "CellRef": return node.ref;                          // 파서가 대문자화·$제거
    case "RangeRef": return node.ref;
    case "UnaryOp": return node.op + serializeArg(node.operand);
    case "BinaryOp": return `(${serializeArg(node.left)}${node.op}${serializeArg(node.right)})`;
    case "FunctionCall": return `${node.name}(${node.args.map(serializeArg).join(",")})`;
    default: return "";
  }
}
// functionHints 인수명 정리: 대괄호·"..." 제거
function cleanHintName(s) {
  return String(s).replace(/[[\]]/g, "").replace(/,?\s*\.\.\.$/, "").trim();
}
// 표시용 인수명 정규화 (집계 첫 인수 → 범위, lookup 범위 → 참조 범위)
function canonArgName(base) {
  if (base === "숫자1" || base === "숫자" || base === "값1") return "범위";
  if (base === "범위") return "참조 범위";
  return base;
}
function argName(fname, i) {
  const hints = FUNCTION_HINTS[fname]?.args || [];
  const raw = hints.length ? hints[Math.min(i, hints.length - 1)] : "인수";
  return canonArgName(cleanHintName(raw));
}
// 인수명별 마지막 안내 문장 (없으면 앞부분만)
const ARG_TAIL = {
  "찾을 값": "찾을 값이 참조 범위 첫 열(행)에 있는지 확인하세요.",
  "참조 범위": "찾을 범위를 정확히 지정했는지 확인하세요.",
  "열 번호": "참조 범위에서 몇 번째 열을 가져올지 확인하세요.",
  "행 번호": "참조 범위에서 몇 번째 행을 가져올지 확인하세요.",
  "일치 옵션": "유사 일치는 TRUE 또는 생략입니다.",
  "조건": "조건 표기(>=80, \"김*\" 등)를 확인하세요.",
  "자릿수": "반올림·버림할 자릿수를 확인하세요.",
};

// 학생 수식 vs 정답을 최상위 함수 인수 단위로 비교. 다른 첫 인수만 알려준다.
// 반환: 구체 사유 문자열 또는 null(폴백: 기존 사유 사용).
export function argDiffReason(studentInput, answer) {
  let sAst, aAst;
  try { sAst = parseFormula(studentInput); aAst = parseFormula(answer); }
  catch { return null; }
  if (!sAst || !aAst || sAst.type !== "FunctionCall" || aAst.type !== "FunctionCall") return null;
  if (sAst.name !== aAst.name) return null; // 함수명 다름 → 기존(requiredFunctions) 사유로 폴백
  const sArgs = sAst.args, aArgs = aAst.args;
  if (sArgs.length !== aArgs.length) return `인수 개수가 다릅니다. 정답은 ${aArgs.length}개입니다.`;
  for (let i = 0; i < aArgs.length; i++) {
    if (serializeArg(sArgs[i]) === serializeArg(aArgs[i])) continue;
    // 중첩 함수 인수는 그 안을 확인하라고만
    if (sArgs[i].type === "FunctionCall" || aArgs[i].type === "FunctionCall") {
      const inner = aArgs[i].type === "FunctionCall" ? aArgs[i].name : sArgs[i].name;
      return `${i + 1}번째 인수 안의 ${inner} 함수를 확인하세요.`;
    }
    const name = argName(aAst.name, i);
    const tail = ARG_TAIL[name];
    return `${i + 1}번째 인수(${name})가 다릅니다.${tail ? ` ${tail}` : ""}`;
  }
  // 인수는 모두 같은데 원문이 다르면 $ 유무 차이
  const noDollar = (s) => String(s).toUpperCase().replace(/\s/g, "").replace(/\$/g, "");
  const withDollar = (s) => String(s).toUpperCase().replace(/\s/g, "");
  if (noDollar(studentInput) === noDollar(answer) && withDollar(studentInput) !== withDollar(answer)) {
    return "참조 고정($)만 다릅니다.";
  }
  return null;
}

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
    // 4. 계산 결과 에러 — 인수 단위로 비교해 어느 인수가 틀렸는지 먼저 안내
    const raw = sheet?.getCellValue(base.addr);
    if (isErrorValue(raw)) {
      const argReason = answer ? argDiffReason(input, answer) : null;
      results.push({ ...base, status: "wrong", reason: argReason || `수식 오류 (${raw.error}) — 참조 범위와 찾을 값을 확인하세요` });
      return;
    }
    // 5. 결과값 불일치 — NOW/TODAY/RAND/RANDBETWEEN이 들어가면 값이 매번 달라지므로 건너뜀
    //    (필수 함수 검사(3)와 에러 검사(4)는 이미 통과한 상태)
    const isVolatile = VOLATILE.test(input);
    const computed = sheet?.getDisplayValue(base.addr);
    if (!isVolatile && cell.result !== undefined) {
      const expected = cell.result;
      const eq =
        String(computed) === String(expected) ||
        (!isNaN(parseFloat(String(computed))) && !isNaN(parseFloat(String(expected))) &&
          parseFloat(String(computed)) === parseFloat(String(expected)));
      if (!eq) {
        const argReason = argDiffReason(input, answer);
        results.push({ ...base, status: "wrong", reason: argReason || "결과값이 다릅니다" });
        return;
      }
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
