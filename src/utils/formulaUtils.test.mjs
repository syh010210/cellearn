import { shiftFormula, findRefAtCursor, replaceRefAtCursor, cycleReference } from './formulaUtils.js';

let pass = 0;
let fail = 0;

function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${label} -> 기대값 ${JSON.stringify(expected)}, 실제값 ${JSON.stringify(actual)}`);
  }
}

// ==== replaceRefAtCursor ====
{
  check('치환: =SUM(A1 끝 + B2', replaceRefAtCursor('=SUM(A1', 7, 'B2').text, '=SUM(B2');
  check('치환: =SUM(A1:A5 끝 + B2:B6', replaceRefAtCursor('=SUM(A1:A5', 10, 'B2:B6').text, '=SUM(B2:B6');
  check('치환: 앞 인수 보존', replaceRefAtCursor('=SUM(A1:A5,C1', 13, 'D1').text, '=SUM(A1:A5,D1');
  check('치환: 괄호 앞 커서', replaceRefAtCursor('=SUM(A1:A5,C1)', 13, 'D1').text, '=SUM(A1:A5,D1)');
  check('치환: IF 가운데 인수', replaceRefAtCursor('=IF(A1>5,B1,C1', 11, 'D1').text, '=IF(A1>5,D1,C1');
  check('치환: $범위 통째로', replaceRefAtCursor('=VLOOKUP(C2,$A$6:$C$8,3,0', 21, 'A6:C9').text, '=VLOOKUP(C2,A6:C9,3,0');
  check('삽입: =A1+ 끝 + B1', replaceRefAtCursor('=A1+', 4, 'B1').text, '=A1+B1');
  check('삽입: =SUM( 끝 + A1:A3', replaceRefAtCursor('=SUM(', 5, 'A1:A3').text, '=SUM(A1:A3');
  check('치환: 중첩 MATCH 안', replaceRefAtCursor('=INDEX(A2:A5,MATCH(B1,B2:B5,0', 27, 'C2:C5').text, '=INDEX(A2:A5,MATCH(B1,C2:C5,0');
  // "=A1" 커서가 =바로뒤(A1 앞): 커서 앞이 참조가 아니므로 삽입 규칙 → "=B1A1" (엑셀은 치환하지만 본 구현은 삽입)
  check('삽입: =A1 앞 커서(= 규칙 고정)', replaceRefAtCursor('=A1', 1, 'B1').text, '=B1A1');

  // 삽입/치환의 커서·span도 확인
  check('치환 커서 위치', replaceRefAtCursor('=SUM(A1', 7, 'B2').cursor, 7);
  check('삽입 커서 위치', replaceRefAtCursor('=A1+', 4, 'B1').cursor, 6);
}

// ==== findRefAtCursor ====
{
  check('find range 범위', findRefAtCursor('=SUM(A1:A5', 10, 'range'), { start: 5, end: 10, text: 'A1:A5', dollar: { col: false, row: false } });
  check('find cell 콜론왼쪽', findRefAtCursor('=SUM(A6:C8)', 8, 'cell').text, 'A6');
  check('find 없음(연산자 뒤)', findRefAtCursor('=A1+', 4, 'range'), null);
}

// ==== cycleReference ====
{
  // 규칙 1: pointSpan 전체 범위 순환
  let r = cycleReference('=SUM(A6:C8)', 0, null, { start: 5, end: 10 });
  check('규칙1 #1', r.span.text, '$A$6:$C$8');
  r = cycleReference(r.text, 0, null, r.span);
  check('규칙1 #2', r.span.text, 'A$6:C$8');
  r = cycleReference(r.text, 0, null, r.span);
  check('규칙1 #3', r.span.text, '$A6:$C8');
  r = cycleReference(r.text, 0, null, r.span);
  check('규칙1 #4', r.span.text, 'A6:C8');
  check('규칙1 최종 text', r.text, '=SUM(A6:C8)');

  // 규칙 2: 커서 위치 단일 셀
  check('규칙2 8뒤 → C8', cycleReference('=SUM(A6:C8)', 10, null, null).text, '=SUM(A6:$C$8)');
  check('규칙2 6뒤 → A6', cycleReference('=SUM(A6:C8)', 7, null, null).text, '=SUM($A$6:C8)');
  check('규칙2 콜론위 → A6', cycleReference('=SUM(A6:C8)', 8, null, null).text, '=SUM($A$6:C8)');
  check('규칙2 함수 안 여러 참조(B1만)', cycleReference('=IF(A1>5,B1,C1)', 11, null, null).text, '=IF(A1>5,$B$1,C1)');

  // 규칙 3: 텍스트 선택
  const all = cycleReference('=SUM(A6:C8)', 0, { start: 5, end: 10 }, null);
  check('규칙3 전체선택 text', all.text, '=SUM($A$6:$C$8)');
  check('규칙3 전체선택 유지', all.selection, { start: 5, end: 14 });
  const one = cycleReference('=SUM(A6:C8)', 0, { start: 5, end: 7 }, null);
  check('규칙3 A6만 text', one.text, '=SUM($A$6:C8)');
  check('규칙3 A6만 선택유지', one.selection, { start: 5, end: 9 });
}

// ==== shiftFormula ====
{
  check('shift 상대 둘다', shiftFormula('=A1', 1, 1), '=B2');
  check('shift $절대 고정', shiftFormula('=$A$1', 1, 1), '=$A$1');
  check('shift 열고정($A1)', shiftFormula('=$A1', 1, 1), '=$A2');
  check('shift 행고정(A$1)', shiftFormula('=A$1', 1, 1), '=B$1');
  check('shift 범위', shiftFormula('=SUM(A1:B2)', 1, 1), '=SUM(B2:C3)');
  check('shift 음수 이동', shiftFormula('=C3', -1, -1), '=B2');
  check('shift 문자열 안 A1 보존', shiftFormula('=A1&"A1"', 1, 0), '=A2&"A1"');
  check('shift 혼합+범위 복합', shiftFormula('=$A1+SUM(B$2:C3)', 2, 1), '=$A3+SUM(C$2:D5)');
}

console.log(`\n총 ${pass + fail}개 중 ${pass}개 통과, ${fail}개 실패`);
process.exit(fail > 0 ? 1 : 0);
