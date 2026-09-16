// 계산작업 함수 목록 (계산작업_유형.md 2절 소유형에서 쓰이는 함수 전부).
//
// 필드
//  · name      : 수식에 쓰는 이름(대문자). 엔진 등록 이름과 같아야 한다.
//  · engine    : 엔진(FUNCTIONS/LAZY_FUNCTIONS) 등록 이름(기본 name).
//  · syntax    : functionSyntax.js 표시용 구문 키(기본 name). 별칭은 정식(점) 이름을 가리킨다.
//  · xlfn      : xlsx 파일에 쓸 때 `_xlfn.` 접두가 필요한가. RANK.EQ·STDEV.S·MODE.SNGL·DAYS 만 true.
//                WORKDAY 는 Excel 2007 기본 함수라 접두 불필요.
//  · alias     : 별칭이면 정식 이름(STDEV→STDEV.S, MODE→MODE.SNGL).
//  · subtypes  : 이 함수가 쓰이는 소유형(2절 코드).
//  · note      : xlfn 판단 근거 등.
//
// xlfn 근거 요약: `_xlfn.` 은 "해당 함수가 도입된 Excel 버전보다 낮은 버전에서도 파일이 열리도록"
// OOXML 이 미래 함수에 붙이는 접두. 도입 시점 기준:
//  · 2007 이하(또는 2007에 ATP 통합)로 도입된 함수 → 접두 없음.
//  · 2010 도입(RANK.EQ / STDEV.S / MODE.SNGL) · 2013 도입(DAYS) → `_xlfn.` 필요.
//  · WORKDAY 는 2007에 ATP가 기본 통합되어 접두 없음(NETWORKDAYS·EDATE·EOMONTH 도 동일 규칙).

export const CALC_FUNCTIONS = [
  // ── 조건 집계 (A-1·A-2·A-4·A-5) ──
  { name: "COUNTIF",    subtypes: ["A-1", "A-5", "B-4"], note: "1995~2003 계열, 접두 없음" },
  { name: "COUNTIFS",   subtypes: ["A-1", "A-4"],        note: "2007 도입, 접두 없음" },
  { name: "COUNTA",     subtypes: ["A-1", "B-6"],        note: "2003 이하, 접두 없음" },
  { name: "COUNT",      subtypes: ["A-1"],               note: "2003 이하, 접두 없음" },
  { name: "SUMIF",      subtypes: ["A-4"],               note: "2003 이하, 접두 없음" },
  { name: "SUMIFS",     subtypes: ["A-4"],               note: "2007 도입, 접두 없음" },
  { name: "SUM",        subtypes: ["A-4", "B-5"],        note: "기본, 접두 없음" },
  { name: "AVERAGE",    subtypes: ["A-2", "A-3", "B-5", "C-2"], note: "기본, 접두 없음" },
  { name: "AVERAGEIF",  subtypes: ["A-2"],               note: "2007 도입, 접두 없음" },
  { name: "AVERAGEIFS", subtypes: ["A-2", "A-4"],        note: "2007 도입, 접두 없음" },
  { name: "ROUND",      subtypes: ["A-2", "A-5", "A-6"], note: "기본, 접두 없음" },
  { name: "ROUNDUP",    subtypes: ["A-2", "A-6"],        note: "기본, 접두 없음" },
  { name: "ROUNDDOWN",  subtypes: ["A-2", "A-6"],        note: "기본, 접두 없음" },
  { name: "ABS",        subtypes: ["A-2", "A-4"],        note: "기본, 접두 없음" },
  { name: "MEDIAN",     subtypes: ["A-5"],               note: "기본, 접두 없음" },
  { name: "MAX",        subtypes: ["A-3"],               note: "기본, 접두 없음" },
  { name: "MIN",        subtypes: ["A-3"],               note: "기본, 접두 없음" },
  { name: "LARGE",      subtypes: ["A-3", "B-1", "C-2"], note: "기본, 접두 없음" },
  { name: "SMALL",      subtypes: ["A-3", "B-1"],        note: "기본, 접두 없음" },
  { name: "STDEV.S",    xlfn: true,  subtypes: ["A-5"],  note: "2010 도입 → _xlfn. 필요" },
  { name: "STDEV",      alias: "STDEV.S", syntax: "STDEV.S", subtypes: ["A-5"], note: "STDEV.S 별칭(엔진 등록). 작성은 STDEV.S(_xlfn.)로 한다" },
  { name: "MODE.SNGL",  xlfn: true,  subtypes: ["A-5"],  note: "2010 도입 → _xlfn. 필요" },
  { name: "MODE",       alias: "MODE.SNGL", syntax: "MODE.SNGL", subtypes: ["A-5"], note: "MODE.SNGL 별칭(엔진 등록). 작성은 MODE.SNGL(_xlfn.)로 한다" },

  // ── D 함수 (A-1·A-2·A-3·A-6·C-3) ──
  { name: "DCOUNTA",  subtypes: ["A-1"],        note: "기본, 접두 없음" },
  { name: "DCOUNT",   subtypes: ["A-1"],        note: "기본, 접두 없음" },
  { name: "DAVERAGE", subtypes: ["A-2"],        note: "기본, 접두 없음" },
  { name: "DMAX",     subtypes: ["A-3", "C-3"], note: "기본, 접두 없음" },
  { name: "DMIN",     subtypes: ["A-3"],        note: "기본, 접두 없음" },
  { name: "DSUM",     subtypes: ["A-6"],        note: "기본, 접두 없음" },

  // ── 순위·판정 (B-1·B-5) ──
  { name: "RANK.EQ", xlfn: true, subtypes: ["B-1", "C-2"], note: "2010 도입 → _xlfn. 필요" },
  { name: "CHOOSE",  subtypes: ["B-1", "B-2", "B-6", "D-5"], note: "기본, 접두 없음" },
  { name: "IFERROR", subtypes: ["B-1", "B-2", "C-1"], note: "2007 도입, 접두 없음" },
  { name: "IF",      subtypes: ["B-1", "B-2", "B-3", "B-4", "B-5", "D-3", "D-4", "D-5"], note: "기본, 접두 없음" },
  { name: "AND",     subtypes: ["B-5"], note: "기본, 접두 없음" },
  { name: "OR",      subtypes: ["B-5"], note: "기본, 접두 없음" },
  { name: "POWER",   subtypes: ["B-5"], note: "기본, 접두 없음" },

  // ── 텍스트 (B-2·C-1·D-1·D-2) ──
  { name: "LEFT",   subtypes: ["B-2", "C-1", "D-1", "D-2"], note: "기본, 접두 없음" },
  { name: "RIGHT",  subtypes: ["B-2", "C-1", "D-1", "D-4"], note: "기본, 접두 없음" },
  { name: "MID",    subtypes: ["B-2", "C-1", "D-2"], note: "기본, 접두 없음" },
  { name: "MOD",    subtypes: ["B-2", "B-3"], note: "기본, 접두 없음" },
  { name: "INT",    subtypes: ["B-3"], note: "기본, 접두 없음" },
  { name: "TRUNC",  subtypes: ["C-3"], note: "기본, 접두 없음" },
  { name: "VALUE",  subtypes: ["C-1"], note: "기본, 접두 없음" },
  { name: "UPPER",  subtypes: ["D-1"], note: "기본, 접두 없음" },
  { name: "LOWER",  subtypes: ["D-1"], note: "기본, 접두 없음" },
  { name: "PROPER", subtypes: ["D-1"], note: "기본, 접두 없음" },

  // ── 찾기/참조 (C-1·C-2·C-3) ──
  { name: "HLOOKUP", subtypes: ["C-1", "C-2"], note: "기본, 접두 없음" },
  { name: "VLOOKUP", subtypes: ["C-1", "C-2", "C-3"], note: "기본, 접두 없음" },
  { name: "INDEX",   subtypes: ["C-3"], note: "기본, 접두 없음" },
  { name: "MATCH",   subtypes: ["C-3"], note: "기본, 접두 없음" },

  // ── 날짜/시간 (B-3·D-2·D-3·D-4·D-5) ──
  { name: "YEAR",    subtypes: ["B-3", "D-1"], note: "기본, 접두 없음" },
  { name: "MONTH",   subtypes: ["B-3", "D-1", "D-3"], note: "기본, 접두 없음" },
  { name: "DAY",     subtypes: ["B-3", "D-3"], note: "기본, 접두 없음" },
  { name: "DATE",    subtypes: ["D-2"], note: "기본, 접두 없음" },
  { name: "DAYS",    xlfn: true, subtypes: ["D-2"], note: "2013 도입 → _xlfn. 필요" },
  { name: "WEEKDAY", subtypes: ["B-5", "D-2", "D-3", "D-5"], note: "기본, 접두 없음" },
  { name: "WORKDAY", subtypes: ["D-3"], note: "2007에 ATP 기본 통합 → 접두 없음" },
  { name: "HOUR",    subtypes: ["D-4"], note: "기본, 접두 없음" },
  { name: "MINUTE",  subtypes: ["D-4"], note: "기본, 접두 없음" },
  { name: "SECOND",  subtypes: ["D-4"], note: "기본, 접두 없음" },
  { name: "TIME",    subtypes: ["D-4"], note: "기본, 접두 없음" },
];

// 수식 문자열에 `_xlfn.` 접두를 붙여야 하는 함수 집합(파일 기록용).
export const XLFN_FUNCTIONS = new Set(CALC_FUNCTIONS.filter((f) => f.xlfn).map((f) => f.name));

// 수식 문자열에서 xlfn 접두를 붙이거나(파일 기록) 떼는(엔진 평가) 유틸.
export function addXlfn(formula) {
  let out = formula;
  for (const n of XLFN_FUNCTIONS) {
    // 이미 _xlfn. 이 붙지 않은, 뒤에 '(' 가 오는 함수명만 치환
    const re = new RegExp(`(?<![A-Za-z0-9_.])(?<!_xlfn\\.)${n.replace(/\./g, "\\.")}\\s*\\(`, "g");
    out = out.replace(re, `_xlfn.${n}(`);
  }
  return out;
}
export function stripXlfn(formula) {
  return String(formula).replace(/_xlfn\.|_xlws\./g, "");
}
