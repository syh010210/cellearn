import { argDiffReason, astEqualFormula, fillFromReason, gradePractice } from "./gradePractice.js";

let pass = 0;
let fail = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) pass++;
  else { fail++; console.log(`FAIL: ${label} -> 기대값 ${JSON.stringify(expected)}, 실제값 ${JSON.stringify(actual)}`); }
}

// ── 인수 단위 비교 ──
check("HLOOKUP 4번째(일치 옵션)",
  argDiffReason("=HLOOKUP(B2,$B$5:$F$6,2,0)", "=HLOOKUP(B2,$B$5:$F$6,2,TRUE)"),
  "4번째 인수(일치 옵션)가 다릅니다. 유사 일치는 TRUE 또는 생략입니다.");

check("VLOOKUP 3번째(열 번호)",
  argDiffReason("=VLOOKUP(C2,$A$6:$C$8,2,0)", "=VLOOKUP(C2,$A$6:$C$8,3,0)"),
  "3번째 인수(열 번호)가 다릅니다. 참조 범위에서 몇 번째 열을 가져올지 확인하세요.");

check("VLOOKUP 2번째(참조 범위)",
  argDiffReason("=VLOOKUP(C2,$A$6:$B$8,3,0)", "=VLOOKUP(C2,$A$6:$C$8,3,0)"),
  "2번째 인수(참조 범위)가 다릅니다. 찾을 범위를 정확히 지정했는지 확인하세요.");

check("SUM 1번째(범위, tail 없음)",
  argDiffReason("=SUM(A1:A5)", "=SUM(A1:A6)"),
  "1번째 인수(범위)가 다릅니다.");

// ── 인수 개수 / 함수명 / 중첩 / $ ──
check("인수 개수 다름",
  argDiffReason("=VLOOKUP(C2,$A$6:$C$8,3)", "=VLOOKUP(C2,$A$6:$C$8,3,0)"),
  "인수 개수가 다릅니다. 정답은 4개입니다.");

check("함수명 다름 → 폴백 null",
  argDiffReason("=HLOOKUP(B2,$B$5:$F$6,2,0)", "=VLOOKUP(B2,$B$5:$F$6,2,0)"),
  null);

check("중첩 함수 인수",
  argDiffReason("=INDEX(A2:A5,MATCH(B1,B2:B9,0))", "=INDEX(A2:A5,MATCH(B1,B2:B5,0))"),
  "2번째 인수 안의 MATCH 함수를 확인하세요.");

check("$ 유무만 다름",
  argDiffReason("=VLOOKUP(A1,B1:C9,2,0)", "=VLOOKUP(A1,$B$1:$C$9,2,0)"),
  "참조 고정($)만 다릅니다.");

check("TRUE↔1 동일 취급 → 차이 없음 null",
  argDiffReason("=VLOOKUP(A1,B1:C9,2,TRUE)", "=VLOOKUP(A1,B1:C9,2,1)"),
  null);

check("파싱 실패 → 폴백 null",
  argDiffReason("=VLOOKUP(", "=VLOOKUP(A1,B1:C9,2,0)"),
  null);

// ── fillFrom AST 검사 ──
// cells[1][3] = D2 (origin), D3 = ri2,ci3. cell.fillFrom="D2".
function makeCells(d2) {
  const cells = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => ({ input: "" })));
  cells[1][3] = { input: d2 }; // D2
  return cells;
}
// 1) D2(…,3,0) / D3(…C3…,3,FALSE) → 정답 (AST로 answer와 동일)
check("fillFrom 정답: FALSE=0",
  astEqualFormula("=VLOOKUP(C3,$A$6:$C$8,3,FALSE)", "=VLOOKUP(C3,$A$6:$C$8,3,0)"), true);
// 2) D2(…,3,0) / D3(…C3…,3) → 4번째 인수 생략(=TRUE) vs 0 → 다름
check("fillFrom 4번째 인수 생략",
  fillFromReason("=VLOOKUP(C3,$A$6:$C$8,3)",
    { fillFrom: "D2", answer: "=VLOOKUP(C3,$A$6:$C$8,3,0)" }, 2, 3, makeCells("=VLOOKUP(C2,$A$6:$C$8,3,0)")),
  "4번째 인수(일치 옵션)가 다릅니다. 유사 일치는 TRUE 또는 생략입니다.");
// 3) D2(C2,A6:C8,3,0) / D3(C3,A7:C9,3,0) → 범위 밀림($없음)
check("fillFrom 범위 밀림",
  fillFromReason("=VLOOKUP(C3,A7:C9,3,0)",
    { fillFrom: "D2", answer: "=VLOOKUP(C3,$A$6:$C$8,3,0)" }, 2, 3, makeCells("=VLOOKUP(C2,A6:C8,3,0)")),
  "참조 범위가 밀렸습니다. 원본 수식에서 범위에 $를 붙여 고정한 뒤 다시 채우세요");
// 4) D2(C2,$A$6:$C$8,3,0) / D3(C2,…) 그대로 → 복사
check("fillFrom 복사",
  fillFromReason("=VLOOKUP(C2,$A$6:$C$8,3,0)",
    { fillFrom: "D2", answer: "=VLOOKUP(C3,$A$6:$C$8,3,0)" }, 2, 3, makeCells("=VLOOKUP(C2,$A$6:$C$8,3,0)")),
  "자동 채우기가 아니라 복사했습니다. 찾을 값이 바뀌어야 합니다");

// ── acceptableAnswers: DB함수 필드 = 열 번호(4) / 제목 셀(D1) 둘 다 정답 ──
const okSheet = { getCellValue: () => 13, getDisplayValue: () => "999" }; // 결과값이 틀려도 AST 일치면 정답
const accCell = (input) => ({
  editable: true, input,
  answer: "=DSUM(A1:D4,4,B1:B2)",
  acceptableAnswers: ["=DSUM(A1:D4,4,B1:B2)", "=DSUM(A1:D4,D1,B1:B2)"],
  result: 13,
});
check("acceptableAnswers: 열 번호(4) 형태 정답",
  gradePractice({ cells: [[accCell("=DSUM(A1:D4,4,B1:B2)")]], cols: ["A"], sheet: okSheet })[0].status, "correct");
check("acceptableAnswers: 제목 셀(D1) 형태도 정답",
  gradePractice({ cells: [[accCell("=DSUM(A1:D4,D1,B1:B2)")]], cols: ["A"], sheet: okSheet })[0].status, "correct");
// 필드는 유효 대체 형태(D1)라 오답 사유는 조건 범위(3번째)만 지목해야 한다
check("acceptableAnswers: 사유는 유효 필드형태를 오답으로 안 짚음",
  gradePractice({ cells: [[accCell("=DSUM(A1:D4,D1,C1:C2)")]], cols: ["A"],
    sheet: { getCellValue: () => 5, getDisplayValue: () => "5" } })[0].reason,
  "3번째 인수(조건 범위)가 다릅니다.");

console.log(`\n총 ${pass + fail}개 중 ${pass}개 통과, ${fail}개 실패`);
process.exit(fail > 0 ? 1 : 0);
