// scripts/test-calc-grader.mjs
// 채점기 단위 테스트 — buildInstance 를 거치지 않는 최소 item + getCell 목으로
// (2) 조건 범위 비교, (3) 값·자료형·오류·함수·hint·warnings 경계.

import { gradeCalcItem } from "../src/utils/calc/calcGrader.js";
import { classifySurvivor } from "../src/utils/calc/survivorRules.js";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

// getCell 목: map 에 있으면 셀, 없으면 null(빈 셀)
const gc = (map) => (a) => Object.prototype.hasOwnProperty.call(map, a) ? map[a] : null;
// 결과 셀은 항상 통과하도록 기본 세팅(수식 있음·값 일치·함수 없음)
const okResult = { C1: { f: "A1", v: 1, t: "n" } };
const catsOf = (r) => new Set(r.details.map((d) => d.cat));

// ───────── (2) 조건 범위 비교 ─────────
console.log("=== 조건 범위 비교 ===");
function critItem(range, table) {
  return { no: 1, result: { kind: "single", range: "C1", anchor: "C1" }, answer: { formula: "=A1" }, functions: { required: [], candidates: null }, expected: { C1: 1 }, criteria: { range, table } };
}
const critCats = (range, table, map) => catsOf(gradeCalcItem(critItem(range, table), gc({ ...okResult, ...map })));

// AND 2열 1행: 열 순서 교체 → 통과
check("AND 2열1행 열교체 통과",
  !critCats("E1:F2", [["국어", "영어"], [">=80", ">=90"]], { E1: { v: "영어" }, F1: { v: "국어" }, E2: { v: ">=90" }, F2: { v: ">=80" } }).has("criteria"));
// OR 1열 2행: 행 순서 교체 → 통과
check("OR 1열2행 행교체 통과",
  !critCats("E1:E3", [["점수"], [">=80"], ["<60"]], { E1: { v: "점수" }, E2: { v: "<60" }, E3: { v: ">=80" } }).has("criteria"));
// OR 2열 2행(대각): 행 교체 → 통과
check("OR 2열2행 대각 행교체 통과",
  !critCats("E1:F3", [["반", "점수"], ["1반", ""], ["", "<60"]], { E1: { v: "반" }, F1: { v: "점수" }, F2: { v: "<60" }, E3: { v: "1반" } }).has("criteria"));
// 한 조건을 같은 행으로 옮김(AND로 바뀜) → 불합격
check("OR 2열2행 → AND 변형 불합격",
  critCats("E1:F3", [["반", "점수"], ["1반", ""], ["", "<60"]], { E1: { v: "반" }, F1: { v: "점수" }, E2: { v: "1반" }, F2: { v: "<60" } }).has("criteria"));
// "=상공고" vs "상공고" → 통과
check('"=상공고"≡"상공고" 통과',
  !critCats("E1:E2", [["학교"], ["상공고"]], { E1: { v: "학교" }, E2: { v: "=상공고" } }).has("criteria"));
// ">=80" vs ">79" → 불합격
check('">=80"≠">79" 불합격',
  critCats("E1:E2", [["점수"], [">=80"]], { E1: { v: "점수" }, E2: { v: ">79" } }).has("criteria"));
// 숫자 80 vs 텍스트 "80" → 통과(numToText 정규화)
check("숫자80≡텍스트80 통과",
  !critCats("E1:E2", [["점수"], [80]], { E1: { v: "점수" }, E2: { v: "80", t: "s" } }).has("criteria"));
// 머리글 띄어쓰기 차이 → 불합격
check("머리글 띄어쓰기 불합격",
  critCats("E1:E2", [["평 균"], [">=80"]], { E1: { v: "평균" }, E2: { v: ">=80" } }).has("criteria"));
// 행 수 부족 → 불합격
check("행 수 부족 불합격",
  critCats("E1:E2", [["점수"], [">=80"], ["<60"]], { E1: { v: "점수" }, E2: { v: ">=80" } }).has("criteria"));
// 조건 범위 밖에 입력(범위 안은 비움) → 불합격
check("범위 밖 입력 불합격",
  critCats("E1:E2", [["점수"], [">=80"]], { E1: { v: "점수" }, G2: { v: ">=80" } }).has("criteria"));

// ───────── (3) 값·자료형·오류·함수·hint·warnings 경계 ─────────
console.log("=== 채점기 경계 ===");
const item = (over) => ({ no: 1, result: { kind: "single", range: "C1", anchor: "C1" }, answer: { formula: "=A1" }, functions: { required: [], candidates: null }, expected: { C1: 1 }, criteria: null, ...over });
const grade = (over, map, cells) => gradeCalcItem(item(over), gc(map), cells);

// 기대 82(숫자) / 입력 "82"(텍스트) → value 불합격
{ const r = grade({ expected: { C1: 82 } }, { C1: { f: "A1", v: "82", t: "s" } }); check("숫자82 vs 텍스트82 → value", !r.ok && catsOf(r).has("value")); }
// 기대 "" / 입력 수식 결과 "" → 통과
{ const r = grade({ expected: { C1: "" } }, { C1: { f: 'A1&""', v: "", t: "s" } }); check('기대"" vs 결과"" 통과', r.ok, r.reasons.join()); }
// 기대 "" / 셀 비어 있음 → noFormula
{ const r = grade({ expected: { C1: "" } }, {}); check('기대"" vs 빈 셀 → noFormula', !r.ok && catsOf(r).has("noFormula")); }
// 기대 #N/A / 입력 #N/A → 통과, 입력 #VALUE! → 불합격
{ const r = grade({ expected: { C1: { error: "#N/A" } }, functions: { required: ["NA"], candidates: null } }, { C1: { f: "NA()", v: "#N/A", t: "e" } }); check("#N/A vs #N/A 통과", r.ok, r.reasons.join()); }
{ const r = grade({ expected: { C1: { error: "#N/A" } }, functions: { required: ["NA"], candidates: null } }, { C1: { f: "NA()", v: "#VALUE!", t: "e" } }); check("#N/A vs #VALUE! → value", !r.ok && catsOf(r).has("value")); }
// 숫자 오차 1e-12 통과 / 1e-6 불합격
{ const r = grade({ expected: { C1: 1 } }, { C1: { f: "A1", v: 1 + 1e-12, t: "n" } }); check("오차 1e-12 통과", r.ok); }
{ const r = grade({ expected: { C1: 1 } }, { C1: { f: "A1", v: 1 + 1e-6, t: "n" } }); check("오차 1e-6 불합격", !r.ok && catsOf(r).has("value")); }
// 입력 수식 파싱 실패 → parse
{ const r = grade({ expected: { C1: 1 } }, { C1: { f: "SUM(", v: 1, t: "n" } }); check("파싱 실패 → parse", catsOf(r).has("parse")); }
// sourceCells 값 변경 → warnings 만, ok 영향 없음
{ const r = grade({ sourceCells: ["A1"] }, { C1: { f: "A1", v: 1, t: "n" }, A1: { v: 9, t: "n" } }, { A1: { v: 5 } }); check("sourceCells 변경 → warnings, ok 유지", r.ok && r.warnings.length === 1, r.warnings.join()); }
// hint: 틀린 제출에서 생성 / 맞은 제출에서 없음
{ const r = grade({ expected: { C1: 5 }, answer: { formula: "=ROUND(A1,0)" }, functions: { required: ["ROUND"], candidates: null } }, { C1: { f: "ROUND(A1,2)", v: 1, t: "n" } }); check("틀린 제출 hint 생성", !!r.hint, "hint=" + r.hint); }
{ const r = grade({ expected: { C1: 5 }, answer: { formula: "=ROUND(A1,0)" }, functions: { required: ["ROUND"], candidates: null } }, { C1: { f: "ROUND(A1,0)", v: 5, t: "n" } }); check("맞은 제출 hint 없음", !r.hint && r.ok); }
// 함수 판정: 셀마다 다른 수식(일부만 TEXT) → functionOutside
{ const r = grade({ result: { kind: "fillCol", range: "C1:C2", anchor: "C1" }, expected: { C1: 1, C2: 1 } }, { C1: { f: "A1", v: 1, t: "n" }, C2: { f: 'TEXT(A2,"0")', v: 1, t: "n" } }); check("일부 셀 TEXT → functionOutside", catsOf(r).has("functionOutside")); }
// STDEV 입력 + required STDEV.S → 통과, _xlfn. 붙은 f → 통과
{ const r = grade({ expected: { C1: 1 }, functions: { required: ["STDEV.S"], candidates: null } }, { C1: { f: "STDEV(A1:A9)", v: 1, t: "n" } }); check("STDEV≡STDEV.S 통과", r.ok, r.reasons.join()); }
{ const r = grade({ expected: { C1: 1 }, functions: { required: ["STDEV.S"], candidates: null } }, { C1: { f: "_xlfn.STDEV.S(A1:A9)", v: 1, t: "n" } }); check("_xlfn.STDEV.S 통과", r.ok, r.reasons.join()); }

// ───────── lookupLeadingText 생존 규칙 ─────────
console.log("=== lookupLeadingText ===");
const it0 = { result: { kind: "fillCol" }, functions: { required: ["VLOOKUP"], candidates: null } };
// E1=표 이름, E2..E5=키(코드/CS/EE/ME), F1 빈 셀
const gcOk = gc({ E1: { v: "학과기준표", t: "s" }, F1: null, E2: { v: "코드", t: "s" }, E3: { v: "CS", t: "s" }, E4: { v: "EE", t: "s" }, E5: { v: "ME", t: "s" } });
const gcKey = gc({ E1: { v: "CS", t: "s" }, F1: null, E2: { v: "코드", t: "s" }, E3: { v: "CS", t: "s" }, E4: { v: "EE", t: "s" }, E5: { v: "ME", t: "s" } });
const rn = (b, m, g, it = it0) => { const r = classifySurvivor(b, m, it, g); return r && r.name; };
check("정확 일치 + 표 이름 행 포함 → 허용", rn("=VLOOKUP(A3,$E$2:$F$5,2,0)", "=VLOOKUP(A3,$E$1:$F$5,2,0)", gcOk) === "lookupLeadingText");
check("빈 인수(정확) → 허용", rn("=VLOOKUP(A3,$E$2:$F$5,2,)", "=VLOOKUP(A3,$E$1:$F$5,2,)", gcOk) === "lookupLeadingText");
check("근사 일치 → 비허용", rn("=VLOOKUP(A3,$E$2:$F$5,2,1)", "=VLOOKUP(A3,$E$1:$F$5,2,1)", gcOk) === null);
check("추가 셀이 키와 같은 텍스트 → 비허용", rn("=VLOOKUP(A3,$E$2:$F$5,2,0)", "=VLOOKUP(A3,$E$1:$F$5,2,0)", gcKey) === null);
check("HLOOKUP 왼쪽 1열 텍스트 → 허용", rn("=HLOOKUP(A3,$F$2:$I$3,2,0)", "=HLOOKUP(A3,$E$2:$I$3,2,0)",
  gc({ F1: null, F2: { v: "노트북", t: "s" }, G2: { v: "키보드", t: "s" }, H2: { v: "마우스", t: "s" }, I2: { v: "허브", t: "s" }, E2: { v: "상품", t: "s" }, E3: { v: "단가", t: "s" } }),
  { result: { kind: "fillCol" }, functions: { required: ["HLOOKUP"] } }) === "lookupLeadingText");

// ───────── dcountaFieldInvariant 생존 규칙 ─────────
console.log("=== dcountaFieldInvariant ===");
{
  const it = { result: { kind: "single" } };
  const filled = {}; for (let r = 3; r <= 10; r++) { filled["A" + r] = { v: "이름" + r, t: "s" }; filled["B" + r] = { v: "남성", t: "s" }; }
  const rn = (b, m, g) => { const x = classifySurvivor(b, m, it, g); return x && x.name; };
  check("필드 A2→B2, 두 열 모두 채움 → 허용", rn("=DCOUNTA($A$2:$C$10,A2,E1:F3)&\"명\"", "=DCOUNTA($A$2:$C$10,B2,E1:F3)&\"명\"", gc(filled)) === "dcountaFieldInvariant");
  check("필드 번호 1→2, 채움 → 허용", rn("=DCOUNTA($A$2:$C$10,1,E1:F3)", "=DCOUNTA($A$2:$C$10,2,E1:F3)", gc(filled)) === "dcountaFieldInvariant");
  const blank = { ...filled, B5: null };
  check("변형 열에 빈칸 레코드 → 비허용", rn("=DCOUNTA($A$2:$C$10,A2,E1:F3)", "=DCOUNTA($A$2:$C$10,B2,E1:F3)", gc(blank)) === null);
  check("DCOUNT 은 비허용", rn("=DCOUNT($A$2:$C$10,A2,E1:F3)", "=DCOUNT($A$2:$C$10,B2,E1:F3)", gc(filled)) === null);
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
