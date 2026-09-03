import { Sheet, ERRORS, isErrorValue } from './index.js';

let pass = 0;
let fail = 0;

function check(label, actual, expected) {
  const a = isErrorValue(actual) ? actual.error : actual;
  const ok = JSON.stringify(a) === JSON.stringify(expected);
  if (ok) {
    pass++;
  } else {
    fail++;
    console.log(`FAIL: ${label} -> 기대값 ${JSON.stringify(expected)}, 실제값 ${JSON.stringify(a)}`);
  }
}

// ---- 기본 산술 & 재계산 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '10');
  s.setCellInput('B1', '=A1*2');
  check('기본 곱셈', s.getDisplayValue('B1'), 20);

  s.setCellInput('A1', '5');
  check('자동 재계산', s.getDisplayValue('B1'), 10);

  s.setCellInput('C1', '=B1+A1');
  check('연쇄 참조', s.getDisplayValue('C1'), 15);
  s.setCellInput('A1', '100');
  check('연쇄 참조 재계산', s.getDisplayValue('C1'), 300);
}

// ---- 절대/혼합 참조($) ----
{
  const s = new Sheet();
  s.setCellInput('B2', '80'); s.setCellInput('C2', '70');
  s.setCellInput('B5', '0.6'); s.setCellInput('C5', '0.4');
  s.setCellInput('D2', '=B2*$B$5+C2*$C$5');
  check('절대 참조 계산', s.getDisplayValue('D2'), 76);
  s.setCellInput('B5', '1');
  check('절대 참조 재계산(의존성)', s.getDisplayValue('D2'), 108);

  const s2 = new Sheet();
  s2.setCellInput('A2', '2'); s2.setCellInput('B1', '3');
  s2.setCellInput('B2', '=$A2*B$1');
  check('혼합 참조 계산', s2.getDisplayValue('B2'), 6);
  s2.setCellInput('A2', '5');
  s2.setCellInput('D2', '=SUM($B$1,A2)');
  check('절대 참조 범위/함수', s2.getDisplayValue('D2'), 8);
}

// ---- 순환 참조 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=B1+1');
  s.setCellInput('B1', '=A1+1');
  check('순환 참조 감지', s.getDisplayValue('A1'), ERRORS.CIRCULAR);
}

// ---- 에러 전파 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '10');
  s.setCellInput('B1', '0');
  s.setCellInput('C1', '=A1/B1');
  check('DIV0 에러', s.getDisplayValue('C1'), ERRORS.DIV0);
  s.setCellInput('D1', '=C1+1');
  check('에러 전파', s.getDisplayValue('D1'), ERRORS.DIV0);
}

// ---- 논리 함수 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '85');
  s.setCellInput('B1', '=IF(A1>=90,"A",IF(A1>=80,"B","C"))');
  check('중첩 IF', s.getDisplayValue('B1'), 'B');

  s.setCellInput('C1', '=IFERROR(1/0,"에러남")');
  check('IFERROR', s.getDisplayValue('C1'), '에러남');

  s.setCellInput('D1', '=AND(A1>50, A1<100)');
  check('AND', s.getDisplayValue('D1'), true);

  s.setCellInput('E1', '=IFS(A1>=90,"A",A1>=80,"B",TRUE,"C")');
  check('IFS', s.getDisplayValue('E1'), 'B');

  s.setCellInput('F1', '=CHOOSE(2,"일","이","삼")');
  check('CHOOSE', s.getDisplayValue('F1'), '이');
}

// ---- 수학/통계 함수 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '10');
  s.setCellInput('A2', '20');
  s.setCellInput('A3', '30');
  s.setCellInput('B1', '=SUM(A1:A3)');
  check('SUM', s.getDisplayValue('B1'), 60);

  s.setCellInput('B2', '=AVERAGE(A1:A3)');
  check('AVERAGE', s.getDisplayValue('B2'), 20);

  s.setCellInput('C1', '90');
  s.setCellInput('C2', '75');
  s.setCellInput('C3', '90');
  s.setCellInput('D1', '남');
  s.setCellInput('D2', '여');
  s.setCellInput('D3', '남');
  s.setCellInput('E1', '=SUMIF(D1:D3,"남",C1:C3)');
  check('SUMIF', s.getDisplayValue('E1'), 180);

  s.setCellInput('E2', '=COUNTIF(C1:C3,">=80")');
  check('COUNTIF 부등호', s.getDisplayValue('E2'), 2);

  s.setCellInput('E3', '=ROUND(3.14159,2)');
  check('ROUND', s.getDisplayValue('E3'), 3.14);

  s.setCellInput('E4', '=ROUNDUP(3.141,2)');
  check('ROUNDUP', s.getDisplayValue('E4'), 3.15);

  s.setCellInput('E5', '=RANK.EQ(C1,C1:C3,0)');
  check('RANK.EQ', s.getDisplayValue('E5'), 1);

  s.setCellInput('E6', '=LARGE(C1:C3,2)');
  check('LARGE', s.getDisplayValue('E6'), 90);

  s.setCellInput('E7', '=MOD(10,3)');
  check('MOD', s.getDisplayValue('E7'), 1);

  s.setCellInput('E8', '=MEDIAN(C1:C3)');
  check('MEDIAN', s.getDisplayValue('E8'), 90);

  s.setCellInput('E9', '=RANK.AVG(C1,C1:C3,0)');
  check('RANK.AVG 동점', s.getDisplayValue('E9'), 1.5);

  s.setCellInput('F1', '90'); s.setCellInput('F3', '80');
  s.setCellInput('G1', '=COUNTBLANK(F1:F4)');
  check('COUNTBLANK', s.getDisplayValue('G1'), 2);
}

// ---- 텍스트 함수 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '컴퓨터활용능력');
  s.setCellInput('B1', '=LEFT(A1,2)');
  check('LEFT', s.getDisplayValue('B1'), '컴퓨');
  s.setCellInput('B2', '=MID(A1,3,2)');
  check('MID', s.getDisplayValue('B2'), '터활');
  s.setCellInput('B3', '=LEN(A1)');
  check('LEN', s.getDisplayValue('B3'), 7);
  s.setCellInput('B4', '="점수: "&90&"점"');
  check('문자열 연결', s.getDisplayValue('B4'), '점수: 90점');

  s.setCellInput('C1', 'Excel Exam');
  s.setCellInput('C2', '=SEARCH("e",C1)');
  check('SEARCH 대소문자무시', s.getDisplayValue('C2'), 1);
  s.setCellInput('C3', '=PROPER("hello world")');
  check('PROPER', s.getDisplayValue('C3'), 'Hello World');
}

// ---- 찾기/참조 함수 ----
{
  const s = new Sheet();
  // 표: A1:B3 = (101,사과) (102,바나나) (103,체리)
  s.setCellInput('A1', '101'); s.setCellInput('B1', '사과');
  s.setCellInput('A2', '102'); s.setCellInput('B2', '바나나');
  s.setCellInput('A3', '103'); s.setCellInput('B3', '체리');
  s.setCellInput('D1', '102');
  s.setCellInput('E1', '=VLOOKUP(D1,A1:B3,2,FALSE)');
  check('VLOOKUP 정확일치', s.getDisplayValue('E1'), '바나나');

  s.setCellInput('E2', '=MATCH(103,A1:A3,0)');
  check('MATCH', s.getDisplayValue('E2'), 3);

  s.setCellInput('E3', '=INDEX(B1:B3,2)');
  check('INDEX', s.getDisplayValue('E3'), '바나나');
}

// ---- 날짜 함수 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=DATE(2024,3,15)');
  s.setCellInput('B1', '=YEAR(A1)');
  s.setCellInput('B2', '=MONTH(A1)');
  s.setCellInput('B3', '=DAY(A1)');
  check('YEAR', s.getDisplayValue('B1'), 2024);
  check('MONTH', s.getDisplayValue('B2'), 3);
  check('DAY', s.getDisplayValue('B3'), 15);

  s.setCellInput('C1', '=DATE(2024,1,1)');
  s.setCellInput('C2', '=DATE(2024,12,31)');
  s.setCellInput('C3', '=DATEDIF(C1,C2,"D")');
  check('DATEDIF 일수', s.getDisplayValue('C3'), 365); // 2024는 윤년이라 366-1=365
}

// ---- 데이터베이스 함수 ----
{
  const s = new Sheet();
  // 헤더: A1=이름 B1=부서 C1=급여
  s.setCellInput('A1', '이름'); s.setCellInput('B1', '부서'); s.setCellInput('C1', '급여');
  s.setCellInput('A2', '김철수'); s.setCellInput('B2', '영업'); s.setCellInput('C2', '300');
  s.setCellInput('A3', '이영희'); s.setCellInput('B3', '개발'); s.setCellInput('C3', '350');
  s.setCellInput('A4', '박민수'); s.setCellInput('B4', '영업'); s.setCellInput('C4', '320');

  // 기준표: E1=부서 E2=영업
  s.setCellInput('E1', '부서'); s.setCellInput('E2', '영업');
  s.setCellInput('F1', '=DSUM(A1:C4,"급여",E1:E2)');
  check('DSUM', s.getDisplayValue('F1'), 620);
  s.setCellInput('F2', '=DAVERAGE(A1:C4,"급여",E1:E2)');
  check('DAVERAGE', s.getDisplayValue('F2'), 310);
  s.setCellInput('F3', '=DCOUNT(A1:C4,"급여",E1:E2)');
  check('DCOUNT', s.getDisplayValue('F3'), 2);
}

console.log(`\n총 ${pass + fail}개 중 ${pass}개 통과, ${fail}개 실패`);
process.exit(fail > 0 ? 1 : 0);
