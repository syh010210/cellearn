// 함수별 인수 정보 — 미니 엑셀 힌트 표시용
export const FUNCTION_HINTS = {
  // ── 데이터베이스 함수 ──
  DSUM:     { args: ["범위", "필드", "조건 범위"] },
  DAVERAGE: { args: ["범위", "필드", "조건 범위"] },
  DCOUNT:   { args: ["범위", "필드", "조건 범위"] },
  DCOUNTA:  { args: ["범위", "필드", "조건 범위"] },
  DMAX:     { args: ["범위", "필드", "조건 범위"] },
  DMIN:     { args: ["범위", "필드", "조건 범위"] },

  // ── 조건부 집계 ──
  COUNTIF:    { args: ["범위", "조건"] },
  COUNTIFS:   { args: ["조건 범위1", "조건1", "조건 범위2", "조건2", "..."] },
  SUMIF:      { args: ["범위", "조건", "[합계 범위]"] },
  AVERAGEIF:  { args: ["범위", "조건", "[평균 범위]"] },
  AVERAGEIFS: { args: ["평균 범위", "조건 범위1", "조건1", "..."] },
  SUMIFS:     { args: ["합계 범위", "조건 범위1", "조건1", "조건 범위2", "조건2", "..."] },

  // ── 수학/변환 ──
  ABS:       { args: ["숫자"] },
  INT:       { args: ["숫자"] },
  MOD:       { args: ["숫자", "나누는 수"] },
  POWER:     { args: ["숫자", "지수"] },
  VALUE:     { args: ["텍스트"] },
  ROUND:     { args: ["숫자", "자릿수"] },
  ROUNDUP:   { args: ["숫자", "자릿수"] },
  ROUNDDOWN: { args: ["숫자", "자릿수"] },

  // ── 기본 통계 ──
  SUM:        { args: ["숫자1", "[숫자2, ...]"] },
  AVERAGE:    { args: ["숫자1", "[숫자2, ...]"] },
  MAX:        { args: ["숫자1", "[숫자2, ...]"] },
  MIN:        { args: ["숫자1", "[숫자2, ...]"] },
  COUNT:      { args: ["값1", "[값2, ...]"] },
  COUNTA:     { args: ["값1", "[값2, ...]"] },
  COUNTBLANK: { args: ["범위"] },
  MEDIAN:     { args: ["숫자1", "[숫자2, ...]"] },

  // ── 순위 ──
  "RANK.EQ":  { args: ["숫자", "범위", "[순서]"] },
  "RANK.AVG": { args: ["숫자", "범위", "[순서]"] },
  LARGE:      { args: ["배열", "k"] },
  SMALL:      { args: ["배열", "k"] },

  // ── 참조/검색 ──
  VLOOKUP: { args: ["찾을 값", "범위", "열 번호", "[일치 옵션]"] },
  HLOOKUP: { args: ["찾을 값", "범위", "행 번호", "[일치 옵션]"] },
  INDEX:   { args: ["범위", "행 번호", "[열 번호]"] },
  MATCH:   { args: ["찾을 값", "찾을 범위", "[일치 옵션]"] },
  CHOOSE:  { args: ["순번", "값1", "[값2, ...]"] },

  // ── 문자열 ──
  LEFT:        { args: ["텍스트", "[문자 수]"] },
  RIGHT:       { args: ["텍스트", "[문자 수]"] },
  MID:         { args: ["텍스트", "시작 위치", "문자 수"] },
  LEN:         { args: ["텍스트"] },
  UPPER:       { args: ["텍스트"] },
  LOWER:       { args: ["텍스트"] },
  PROPER:      { args: ["텍스트"] },
  TRIM:        { args: ["텍스트"] },
  FIND:        { args: ["찾을 텍스트", "대상 텍스트", "[시작 위치]"] },
  SEARCH:      { args: ["찾을 텍스트", "대상 텍스트", "[시작 위치]"] },
  SUBSTITUTE:  { args: ["텍스트", "이전 텍스트", "새 텍스트", "[번째]"] },
  REPLACE:     { args: ["이전 텍스트", "시작 위치", "문자 수", "새 텍스트"] },
  CONCATENATE: { args: ["텍스트1", "텍스트2", "..."] },
  TEXT:        { args: ["값", "형식 코드"] },

  // ── 논리 ──
  IF:      { args: ["논리 검사", "참일 때", "거짓일 때"] },
  IFS:     { args: ["논리 검사1", "참일 때1", "논리 검사2", "참일 때2", "..."] },
  IFERROR: { args: ["값", "오류일 때"] },
  IFNA:    { args: ["값", "N/A일 때"] },
  AND:     { args: ["논리1", "[논리2, ...]"] },
  OR:      { args: ["논리1", "[논리2, ...]"] },
  NOT:     { args: ["논리"] },

  // ── 날짜/시간 ──
  TODAY:   { args: [] },
  NOW:     { args: [] },
  YEAR:    { args: ["날짜"] },
  MONTH:   { args: ["날짜"] },
  DAY:     { args: ["날짜"] },
  WEEKDAY: { args: ["날짜", "[반환 유형]"] },
  DATE:    { args: ["연도", "월", "일"] },
  DATEDIF: { args: ["시작 날짜", "끝 날짜", "단위"] },
};

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
