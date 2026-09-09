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
// 표시용 인수명 — functionSyntax.js(단일 출처)의 인수 이름을 그대로 쓴다.
// (집계 함수는 "범위", 참조/검색 함수는 "참조 범위" 등 이미 표시에 맞게 정의돼 있다.)
function argName(fname, i) {
  const hints = FUNCTION_HINTS[fname]?.args || [];
  const raw = hints.length ? hints[Math.min(i, hints.length - 1)] : "인수";
  return cleanHintName(raw);
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

// 생략 가능한 인수의 기본값(정규화 문자열). 생략 = 기본값 동일 취급용.
// 예) VLOOKUP/HLOOKUP 4번째(일치 옵션) 생략 = TRUE = "1"
const ARG_DEFAULT = { VLOOKUP: { 3: "1" }, HLOOKUP: { 3: "1" }, MATCH: { 2: "1" } };

function astOf(formula) {
  try { return parseFormula(formula); } catch { return null; }
}
// 인수 i의 정규화 문자열. 없으면 (pad일 때) 기본값, 그래도 없으면 null.
function argSer(ast, i, pad) {
  if (i < ast.args.length) return serializeArg(ast.args[i]);
  if (pad) { const d = ARG_DEFAULT[ast.name]?.[i]; if (d !== undefined) return d; }
  return null;
}
// 수식 두 개가 AST(정규화)로 같은지. TRUE↔1·FALSE↔0·$무시·대소문자/공백 무시.
export function astEqualFormula(a, b) {
  const x = astOf(a), y = astOf(b);
  if (!x || !y) return false;
  return serializeArg(x) === serializeArg(y);
}
// $ 없는 콜론 범위(밀릴 수 있는 범위)가 들어있는지
function hasUnlockedRange(formula) {
  const re = /\$?[A-Za-z]+\$?\d+:\$?[A-Za-z]+\$?\d+/g;
  let m;
  while ((m = re.exec(formula)) !== null) if (!m[0].includes("$")) return true;
  return false;
}

// 학생 수식 vs 정답을 최상위 함수 인수 단위로 비교. 다른 첫 인수만 알려준다.
// opts.padDefaults=true 면 생략 인수를 기본값으로 채워 비교(개수 차이 대신 값 차이로).
// 반환: 구체 사유 문자열 또는 null(폴백: 기존 사유 사용).
export function argDiffReason(studentInput, answer, opts = {}) {
  const pad = !!opts.padDefaults;
  const sAst = astOf(studentInput), aAst = astOf(answer);
  if (!sAst || !aAst || sAst.type !== "FunctionCall" || aAst.type !== "FunctionCall") return null;
  if (sAst.name !== aAst.name) return null; // 함수명 다름 → 기존(requiredFunctions) 사유로 폴백
  const n = Math.max(sAst.args.length, aAst.args.length);
  for (let i = 0; i < n; i++) {
    const ss = argSer(sAst, i, pad), as = argSer(aAst, i, pad);
    if (ss === null && as === null) continue;
    if (ss === null || as === null) return `인수 개수가 다릅니다. 정답은 ${aAst.args.length}개입니다.`;
    if (ss === as) continue;
    // 중첩 함수 인수는 그 안을 확인하라고만
    if (sAst.args[i]?.type === "FunctionCall" || aAst.args[i]?.type === "FunctionCall") {
      const inner = aAst.args[i]?.type === "FunctionCall" ? aAst.args[i].name : sAst.args[i].name;
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

// fillFrom 셀: 원본(D2) 자동 채우기 기준으로 어떻게 다른지 세분화한 사유
export function fillFromReason(input, cell, ri, ci, cells) {
  const origin = parseCellA1(cell.fillFrom);
  const originInput = origin ? (cells[origin.ri]?.[origin.ci]?.input || "").trim() : "";
  if (!originInput.startsWith("=")) {
    return argDiffReason(input, cell.answer, { padDefaults: true }) || `${cell.fillFrom}에서 자동 채우기한 결과와 다릅니다`;
  }
  const shifted = shiftFormula(originInput, ri - origin.ri, ci - origin.ci);
  // 1) 찾을 값도 안 바꾸고 원본과 똑같음 → 복사
  if (astEqualFormula(input, originInput)) return "자동 채우기가 아니라 복사했습니다. 찾을 값이 바뀌어야 합니다";
  // 2) 원본을 그대로 채웠는데 범위에 $가 없어 밀림
  if (astEqualFormula(shifted, input) && hasUnlockedRange(input)) {
    return "참조 범위가 밀렸습니다. 원본 수식에서 범위에 $를 붙여 고정한 뒤 다시 채우세요";
  }
  // 3) 그 외 — 원본을 (dRow,dCol) 민 것과 인수 단위로 비교
  return argDiffReason(input, shifted, { padDefaults: true }) || `${cell.fillFrom}에서 자동 채우기한 결과와 다릅니다`;
}

// acceptableAnswers: 정답으로 인정하는 여러 수식 형태(예: DB함수 필드 = 열 번호 4 / 제목 셀 D1).
function acceptableAnswers(cell) {
  if (Array.isArray(cell.acceptableAnswers) && cell.acceptableAnswers.length) return cell.acceptableAnswers;
  return cell.answer != null ? [cell.answer] : [];  // "" 도 유효한 정답(빈칸 유지)일 수 있으므로 != null
}
// 최상위 인수 중 다른 개수 (가장 가까운 정답 형태를 고르는 데 사용)
function argDiffCount(a, b) {
  const x = astOf(a), y = astOf(b);
  if (!x || !y || x.type !== "FunctionCall" || y.type !== "FunctionCall" || x.name !== y.name) return Infinity;
  const n = Math.max(x.args.length, y.args.length);
  let d = 0;
  for (let i = 0; i < n; i++) if (argSer(x, i, true) !== argSer(y, i, true)) d++;
  return d;
}
// 학생 입력과 인수가 가장 적게 다른 정답 형태 → 유효 대체 형태(필드 4 ≡ D1)를 오답 사유로 지목하지 않게 한다.
function closestAnswer(input, answers) {
  let best = answers[0], bestD = Infinity;
  for (const a of answers) { const d = argDiffCount(input, a); if (d < bestD) { bestD = d; best = a; } }
  return best;
}

// 값(plain) 비교용 정규화: 공백 제거 + 대소문자 무시. ">=20"과 ">= 20"을 같게 본다.
const normPlain = (s) => String(s ?? "").replace(/\s/g, "").toUpperCase();

// plain(값) 셀 오답 사유: 제목 칸 / 값 칸 / AND·OR 배치 오류
function plainWrongReason(cell, input, cells, conditionType) {
  if (cell.role === "condTitle") return "조건 열 제목이 표의 열 제목과 다릅니다";
  const inNorm = normPlain(input);
  // 입력한 값이 다른 조건값 칸의 정답과 일치하면 → 값은 맞는데 행(위치)을 잘못 적은 것
  let misplaced = false;
  cells.forEach((row) => row.forEach((c) => {
    if (c === cell || !c.plain || c.role !== "condValue") return;
    const accs = Array.isArray(c.acceptableAnswers) && c.acceptableAnswers.length ? c.acceptableAnswers : (c.answer != null ? [c.answer] : []);
    if (accs.some((a) => a !== "" && normPlain(a) === inNorm)) misplaced = true;
  }));
  if (misplaced) {
    if (conditionType === "AND") return "AND 조건은 같은 행에 나란히 적어야 합니다";
    if (conditionType === "OR") return "OR 조건은 서로 다른 행에 적어야 합니다";
  }
  return "조건값이 다릅니다";
}

// 순수 채점 함수. cells는 {editable, input, answer, acceptableAnswers, result, format, fillFrom, requiredFunctions} 셀의 2차원 배열.
// sheet는 excel-engine Sheet 인스턴스(getCellValue/getDisplayValue 제공).
// 반환: [{ ri, ci, addr, status:'correct'|'wrong'|'empty', reason, answer, studentInput }]
export function gradePractice({ cells, cols, sheet, requiredFunctions = [], conditionType }) {
  const addrOf = (ri, ci) => `${cols[ci]}${ri + 1}`;
  const results = [];

  cells.forEach((row, ri) => row.forEach((cell, ci) => {
    if (!cell.editable) return;
    const input = (cell.input || "").trim();
    const answer = cell.answer;
    const answers = acceptableAnswers(cell);
    const base = { ri, ci, addr: addrOf(ri, ci), answer, studentInput: input };

    // 0. plain(값) 셀: 수식이 아니라 값 자체로 채점(공백 제거·대소문자 무시). 조건 제목/값 칸 등.
    if (cell.plain) {
      const inNorm = normPlain(input);
      if (answers.some((a) => normPlain(a) === inNorm)) {
        results.push({ ...base, status: "correct", reason: "정답" });
      } else if (input === "") {
        results.push({ ...base, status: "empty", reason: "입력하지 않았습니다" });
      } else {
        results.push({ ...base, status: "wrong", reason: plainWrongReason(cell, input, cells, conditionType) });
      }
      return;
    }
    // 1. 미입력
    if (input === "") { results.push({ ...base, status: "empty", reason: "입력하지 않았습니다" }); return; }
    // 2. 값 직접 입력
    if (!input.startsWith("=")) { results.push({ ...base, status: "wrong", reason: "수식이 아니라 값을 직접 입력했습니다" }); return; }
    // 3. 필수 함수 누락
    const req = cell.requiredFunctions || requiredFunctions || [];
    const up = input.toUpperCase();
    const missing = req.find((fn) => !up.includes(String(fn).toUpperCase()));
    if (missing) { results.push({ ...base, status: "wrong", reason: `${missing} 함수를 사용하지 않았습니다` }); return; }
    // 3.5 정답으로 인정하는 형태(열 번호/제목 셀 등) 중 하나와 AST가 일치하면 정답 (엔진 계산 결과와 무관하게 인정)
    if (answers.length && answers.some((a) => astEqualFormula(input, a))) {
      results.push({ ...base, status: "correct", reason: "정답" });
      return;
    }
    // 4. 계산 결과 에러 — 인수 단위로 비교해 어느 인수가 틀렸는지 먼저 안내
    const raw = sheet?.getCellValue(base.addr);
    if (isErrorValue(raw)) {
      const argReason = answers.length ? argDiffReason(input, closestAnswer(input, answers)) : null;
      results.push({ ...base, status: "wrong", reason: argReason || `수식 오류 (${raw.error}) — 참조 범위와 찾을 값을 확인하세요` });
      return;
    }
    // 5. 자동 채우기 셀: 정답 수식과 AST로 같으면(직접 쳤든 채웠든) 정답, 아니면 세분화 오답.
    //    fillFrom 검사를 결과값 비교보다 먼저 해서 "밀림/복사/인수 차이"를 정확히 안내한다.
    if (cell.fillFrom && answer) {
      if (astEqualFormula(input, answer)) {
        results.push({ ...base, status: "correct", reason: "정답" });
      } else {
        results.push({ ...base, status: "wrong", reason: fillFromReason(input, cell, ri, ci, cells) });
      }
      return;
    }
    // 6. 결과값 불일치 — NOW/TODAY/RAND/RANDBETWEEN이 들어가면 값이 매번 달라지므로 건너뜀
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
        const argReason = answers.length ? argDiffReason(input, closestAnswer(input, answers)) : null;
        results.push({ ...base, status: "wrong", reason: argReason || "결과값이 다릅니다" });
        return;
      }
    }
    // 7. 정답
    results.push({ ...base, status: "correct", reason: "정답" });
  }));

  return results;
}
