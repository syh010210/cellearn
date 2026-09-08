// 함수별 인수 정보 — 미니 엑셀 힌트 표시용.
// 인수 이름은 functionSyntax.js(표시용 구문의 단일 출처)에서 파생한다.
// 여기서 따로 인수 이름을 관리하지 않으므로 다이어그램·JSON 구문과 항상 일치한다.
import { FUNCTION_ARGS } from "../data/functionSyntax.js";

export const FUNCTION_HINTS = Object.fromEntries(
  Object.entries(FUNCTION_ARGS).map(([name, args]) => [name, { args }]),
);

/**
 * 현재 커서 위치 기준으로 활성화된 함수와 인수 인덱스를 반환합니다.
 * 중첩 함수의 경우 커서가 있는 가장 안쪽 함수를 반환합니다.
 */
export function getFunctionHint(val, cursorPos) {
  if (!val || !val.startsWith("=")) return null;
  const end = Math.min(cursorPos ?? val.length, val.length);

  let depth = 0;
  let inStr = false;
  let argIdx = 0;

  // 커서 위치에서 왼쪽으로 탐색하며 가장 가까운 열린 '(' 찾기
  for (let i = end - 1; i >= 1; i--) {
    const ch = val[i];
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === ")") { depth++; continue; }
    if (ch === "(") {
      if (depth === 0) {
        // '(' 앞의 함수명 추출
        let j = i - 1;
        while (j >= 1 && val[j] === " ") j--;
        const nameEnd = j;
        while (j >= 1 && /[A-Za-z0-9._]/.test(val[j])) j--;
        const name = val.slice(j + 1, nameEnd + 1).toUpperCase();
        const hint = FUNCTION_HINTS[name];
        if (hint) return { name, args: hint.args, argIdx };
        return null;
      }
      depth--;
    } else if (ch === "," && depth === 0) {
      argIdx++;
    }
  }
  return null;
}
