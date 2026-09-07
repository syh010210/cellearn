import { argDiffReason } from "./gradePractice.js";

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

console.log(`\n총 ${pass + fail}개 중 ${pass}개 통과, ${fail}개 실패`);
process.exit(fail > 0 ? 1 : 0);
