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

// ---- MATCH 근사(이진 탐색): 정렬 여부 무관, parity3 사례 (M·S) ----
{
  // 미정렬 범위 H=95,40,60,20,80,30,70 / I=40,60,95,20,80,30,70 / J=20,60,40,80,30,70,95 / 정렬 K
  const s = new Sheet();
  [95, 40, 60, 20, 80, 30, 70].forEach((v, i) => s.setCellValue('H' + (i + 1), v));
  [40, 60, 95, 20, 80, 30, 70].forEach((v, i) => s.setCellValue('I' + (i + 1), v));
  [20, 60, 40, 80, 30, 70, 95].forEach((v, i) => s.setCellValue('J' + (i + 1), v));
  [20, 30, 40, 60, 70, 80, 95].forEach((v, i) => s.setCellValue('K' + (i + 1), v));
  const m = (f) => { s.setCellInput('Z1', '=' + f); const v = s.getCellValue('Z1'); return isErrorValue(v) ? v.error : v; };
  // type 1 전부
  check('MATCH H MAX,1', m('MATCH(MAX(H1:H7),H1:H7,1)'), 7);
  check('MATCH H MIN,1', m('MATCH(MIN(H1:H7),H1:H7,1)'), 4);
  check('MATCH I MAX,1', m('MATCH(MAX(I1:I7),I1:I7,1)'), 7);
  check('MATCH I MIN,1', m('MATCH(MIN(I1:I7),I1:I7,1)'), 4);
  check('MATCH J MAX,1', m('MATCH(MAX(J1:J7),J1:J7,1)'), 7);
  check('MATCH J MIN,1', m('MATCH(MIN(J1:J7),J1:J7,1)'), 1);
  check('MATCH K MAX,1', m('MATCH(MAX(K1:K7),K1:K7,1)'), 7);
  check('MATCH K 50,1', m('MATCH(50,K1:K7,1)'), 3);
  check('MATCH K 55,1(부재)', m('MATCH(55,K1:K7,1)'), 3);
  check('MATCH K 15,1(<최소)', m('MATCH(15,K1:K7,1)'), ERRORS.NA);
  // type -1 (이진 탐색으로 설명되는 것만)
  check('MATCH H MAX,-1', m('MATCH(MAX(H1:H7),H1:H7,-1)'), 1);
  check('MATCH H MIN,-1', m('MATCH(MIN(H1:H7),H1:H7,-1)'), 4);
  check('MATCH I MAX,-1(#N/A)', m('MATCH(MAX(I1:I7),I1:I7,-1)'), ERRORS.NA);
  check('MATCH I MIN,-1', m('MATCH(MIN(I1:I7),I1:I7,-1)'), 4);
  check('MATCH J MAX,-1(#N/A)', m('MATCH(MAX(J1:J7),J1:J7,-1)'), ERRORS.NA);
  // 정확일치 FALSE = 0
  check('MATCH FALSE=0', m('MATCH(MAX(I1:I7),I1:I7,FALSE)'), 3);
}

// ---- COUNTIF 비교 연산자: 숫자 조건은 숫자 셀만(텍스트 머리글 제외) ----
{
  const s = new Sheet();
  s.setCellValue('X1', '점수');               // 텍스트 머리글
  [90, 80, 75, 80, 60, 95, 50].forEach((v, i) => s.setCellValue('X' + (i + 2), v));
  const c = (f) => { s.setCellInput('Z2', '=' + f); const v = s.getCellValue('Z2'); return isErrorValue(v) ? v.error : v; };
  check('COUNTIF >=80 머리글 포함(텍스트 제외)', c('COUNTIF(X1:X8,">=80")'), 4);
  check('COUNTIF >=80 머리글 제외', c('COUNTIF(X2:X8,">=80")'), 4);
  check('COUNTIF =80 정확', c('COUNTIF(X1:X8,80)'), 2);
}

// ---- COUNTIF "<>": 값과 같지 않은 모든 셀(숫자·다른 텍스트·빈 셀 포함), "<>" 는 비어있지 않은 셀 ----
{
  const s = new Sheet();
  // Y1:Y7 = 서울, 부산, 80, 90, (빈), 서울, 서울
  s.setCellValue('Y1', '서울'); s.setCellValue('Y2', '부산'); s.setCellValue('Y3', 80);
  s.setCellValue('Y4', 90); /* Y5 빈 */ s.setCellValue('Y6', '서울'); s.setCellValue('Y7', '서울');
  const c = (f) => { s.setCellInput('Z3', '=' + f); const v = s.getCellValue('Z3'); return isErrorValue(v) ? v.error : v; };
  check('COUNTIF <>서울 (숫자·빈 포함)', c('COUNTIF(Y1:Y7,"<>서울")'), 4);
  check('COUNTIF <>80 (텍스트·빈 포함)', c('COUNTIF(Y1:Y7,"<>80")'), 6);
  check('COUNTIF <> (비어있지 않은 셀)', c('COUNTIF(Y1:Y7,"<>")'), 6);
  check('COUNTIF >=80 (숫자만)', c('COUNTIF(Y1:Y7,">=80")'), 2);
  check('COUNTIF =80', c('COUNTIF(Y1:Y7,80)'), 1);
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
  // 계산할 열(field)은 열 번호(3)·제목 셀(C1)·제목 텍스트("급여") 세 형태 모두 같은 결과여야 한다
  s.setCellInput('F4', '=DSUM(A1:C4,3,E1:E2)');
  check('DSUM 필드=열번호', s.getDisplayValue('F4'), 620);
  s.setCellInput('F5', '=DSUM(A1:C4,C1,E1:E2)');
  check('DSUM 필드=제목 셀', s.getDisplayValue('F5'), 620);
}

// ==== 컴활 2급 함수 추가분 ====

// ---- 날짜/시간 ----
{
  const s = new Sheet();
  // 절대값: DATE(2026,9,7) = 46272
  s.setCellInput('A1', '=DATE(2026,9,7)');
  check('DATE 날짜 표시(46272)', s.getDisplayValue('A1'), '2026-09-07');

  s.setCellInput('B1', '=DAYS(DATE(2024,12,31),DATE(2024,1,1))');
  check('DAYS 정상', s.getDisplayValue('B1'), 365);
  s.setCellInput('B2', '=DAYS("abc",1)');
  check('DAYS 에러', s.getDisplayValue('B2'), ERRORS.VALUE);

  s.setCellInput('C1', '=DAY(EDATE(DATE(2024,1,31),1))');
  check('EDATE 말일보정(2/29)', s.getDisplayValue('C1'), 29);
  s.setCellInput('C2', '=EDATE("x",1)');
  check('EDATE 에러', s.getDisplayValue('C2'), ERRORS.VALUE);

  s.setCellInput('D1', '=DAY(EOMONTH(DATE(2024,2,10),0))');
  check('EOMONTH 말일', s.getDisplayValue('D1'), 29);
  s.setCellInput('D2', '=MONTH(EOMONTH(DATE(2024,2,10),1))');
  check('EOMONTH 다음달', s.getDisplayValue('D2'), 3);
  s.setCellInput('D3', '=EOMONTH("x",0)');
  check('EOMONTH 에러', s.getDisplayValue('D3'), ERRORS.VALUE);

  s.setCellInput('E1', '=TIME(12,0,0)');
  check('TIME 시간 표시(0.5)', s.getDisplayValue('E1'), '12:00:00');
  s.setCellInput('E2', '=TIME("x",0,0)');
  check('TIME 에러', s.getDisplayValue('E2'), ERRORS.VALUE);

  s.setCellInput('F1', '=HOUR(TIME(13,30,45))');
  check('HOUR 정상', s.getDisplayValue('F1'), 13);
  s.setCellInput('F2', '=HOUR("x")');
  check('HOUR 에러', s.getDisplayValue('F2'), ERRORS.VALUE);
  s.setCellInput('F3', '=MINUTE(TIME(13,30,45))');
  check('MINUTE 정상', s.getDisplayValue('F3'), 30);
  s.setCellInput('F4', '=MINUTE("x")');
  check('MINUTE 에러', s.getDisplayValue('F4'), ERRORS.VALUE);
  s.setCellInput('F5', '=SECOND(TIME(13,30,45))');
  check('SECOND 정상', s.getDisplayValue('F5'), 45);
  s.setCellInput('F6', '=SECOND("x")');
  check('SECOND 에러', s.getDisplayValue('F6'), ERRORS.VALUE);

  s.setCellInput('G1', '=DAY(WORKDAY(DATE(2024,1,1),5))');
  check('WORKDAY 정상(월+5근무일)', s.getDisplayValue('G1'), 8);
  s.setCellInput('G2', '=DAY(WORKDAY(DATE(2024,1,1),5,DATE(2024,1,4)))');
  check('WORKDAY 휴일제외', s.getDisplayValue('G2'), 9);
  s.setCellInput('G3', '=WORKDAY("x",5)');
  check('WORKDAY 에러', s.getDisplayValue('G3'), ERRORS.VALUE);
}

// ---- 날짜 입력 → 일련번호 저장/표시 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '2026-09-07');
  check('날짜입력 일련번호 저장', s.getCellValue('A1'), 46272);
  check('날짜입력 yyyy-mm-dd 표시', s.getDisplayValue('A1'), '2026-09-07');
  s.setCellInput('A2', '2026/9/7');
  check('슬래시 날짜 입력', s.getCellValue('A2'), 46272);
  s.setCellInput('B1', '=YEAR(A1)');
  check('입력한 날짜로 YEAR', s.getDisplayValue('B1'), 2026);
}

// ---- 논리(추가) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=TRUE()');
  check('TRUE()', s.getDisplayValue('A1'), true);
  s.setCellInput('A2', '=IF(TRUE(),"참","거짓")');
  check('TRUE() 분기', s.getDisplayValue('A2'), '참');
  s.setCellInput('B1', '=FALSE()');
  check('FALSE()', s.getDisplayValue('B1'), false);
  s.setCellInput('B2', '=IF(FALSE(),1,2)');
  check('FALSE() 분기', s.getDisplayValue('B2'), 2);

  s.setCellInput('C1', '=SWITCH(2,1,"일",2,"이",3,"삼")');
  check('SWITCH 일치', s.getDisplayValue('C1'), '이');
  s.setCellInput('C2', '=SWITCH(9,1,"일","기본")');
  check('SWITCH 기본값', s.getDisplayValue('C2'), '기본');
  s.setCellInput('C3', '=SWITCH(9,1,"일")');
  check('SWITCH 미일치 에러', s.getDisplayValue('C3'), ERRORS.NA);
}

// ---- 데이터베이스(추가) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '이름'); s.setCellInput('B1', '부서'); s.setCellInput('C1', '급여');
  s.setCellInput('A2', '김철수'); s.setCellInput('B2', '영업'); s.setCellInput('C2', '300');
  s.setCellInput('A3', '이영희'); s.setCellInput('B3', '개발'); s.setCellInput('C3', '350');
  s.setCellInput('A4', '박민수'); s.setCellInput('B4', '영업'); s.setCellInput('C4', '320');
  s.setCellInput('E1', '부서'); s.setCellInput('E2', '영업');
  s.setCellInput('F1', '=DCOUNTA(A1:C4,"이름",E1:E2)');
  check('DCOUNTA 정상(영업 2명)', s.getDisplayValue('F1'), 2);
  s.setCellInput('E4', '부서'); s.setCellInput('E5', '개발');
  s.setCellInput('G2', '=DCOUNTA(A1:C4,"이름",E4:E5)');
  check('DCOUNTA 다른조건(개발 1명)', s.getDisplayValue('G2'), 1);
}

// ---- 수학(추가) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=INT(3.9)');
  check('INT 정상', s.getDisplayValue('A1'), 3);
  s.setCellInput('A2', '=INT(-3.1)');
  check('INT 음수(내림)', s.getDisplayValue('A2'), -4);
  s.setCellInput('A3', '=INT("x")');
  check('INT 에러', s.getDisplayValue('A3'), ERRORS.VALUE);

  s.setCellInput('B1', '=POWER(2,10)');
  check('POWER 정상', s.getDisplayValue('B1'), 1024);
  s.setCellInput('B2', '=POWER(-1,0.5)');
  check('POWER 에러(#NUM)', s.getDisplayValue('B2'), ERRORS.NUM);

  s.setCellInput('C1', '=INT(RAND())');
  check('RAND 범위(0<=x<1→INT=0)', s.getDisplayValue('C1'), 0);
  s.setCellInput('C2', '=IF(AND(RAND()>=0,RAND()<1),"ok","no")');
  check('RAND 경계', s.getDisplayValue('C2'), 'ok');

  s.setCellInput('D1', '=RANDBETWEEN(5,5)');
  check('RANDBETWEEN 정상', s.getDisplayValue('D1'), 5);
  s.setCellInput('D2', '=RANDBETWEEN(10,1)');
  check('RANDBETWEEN 에러(하한>상한)', s.getDisplayValue('D2'), ERRORS.NUM);
}

// ---- 찾기/참조(추가) ----
{
  const s = new Sheet();
  s.setCellInput('C1', '=COLUMN(C1)');
  check('COLUMN(참조)', s.getDisplayValue('C1'), 3);
  s.setCellInput('D5', '=COLUMN()');
  check('COLUMN() 자기열', s.getDisplayValue('D5'), 4);
  s.setCellInput('E1', '=COLUMN(5)');
  check('COLUMN 에러(참조아님)', s.getDisplayValue('E1'), ERRORS.VALUE);

  s.setCellInput('A5', '=ROW(A5)');
  check('ROW(참조)', s.getDisplayValue('A5'), 5);
  s.setCellInput('B3', '=ROW()');
  check('ROW() 자기행', s.getDisplayValue('B3'), 3);
  s.setCellInput('B4', '=ROW(5)');
  check('ROW 에러(참조아님)', s.getDisplayValue('B4'), ERRORS.VALUE);

  s.setCellInput('F1', '=COLUMNS(A1:C1)');
  check('COLUMNS 정상', s.getDisplayValue('F1'), 3);
  s.setCellInput('F2', '=COLUMNS(5)');
  check('COLUMNS 에러', s.getDisplayValue('F2'), ERRORS.VALUE);
  s.setCellInput('F3', '=ROWS(A1:A4)');
  check('ROWS 정상', s.getDisplayValue('F3'), 4);
  s.setCellInput('F4', '=ROWS(5)');
  check('ROWS 에러', s.getDisplayValue('F4'), ERRORS.VALUE);
}

// ---- 통계(추가) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '10'); s.setCellInput('A2', '20'); s.setCellInput('A3', '엑셀');
  s.setCellInput('B1', '=AVERAGEA(A1:A3)');
  check('AVERAGEA 텍스트=0', s.getDisplayValue('B1'), 10);
  s.setCellInput('B2', '=AVERAGEA(A5:A6)'); // 빈 셀만
  check('AVERAGEA 에러(빈값)', s.getDisplayValue('B2'), ERRORS.DIV0);

  s.setCellInput('C1', '=MAXA(A1:A3)');
  check('MAXA 정상', s.getDisplayValue('C1'), 20);
  s.setCellInput('C2', '=MAXA(1,1/0)');
  check('MAXA 에러전파', s.getDisplayValue('C2'), ERRORS.DIV0);
  s.setCellInput('D1', '=MINA(A1:A3)');
  check('MINA 텍스트=0', s.getDisplayValue('D1'), 0);
  s.setCellInput('D2', '=MINA(1,1/0)');
  check('MINA 에러전파', s.getDisplayValue('D2'), ERRORS.DIV0);

  s.setCellInput('E1', '1'); s.setCellInput('E2', '2'); s.setCellInput('E3', '2'); s.setCellInput('E4', '3');
  s.setCellInput('F1', '=MODE.SNGL(E1:E4)');
  check('MODE.SNGL 최빈값', s.getDisplayValue('F1'), 2);
  s.setCellInput('G1', '1'); s.setCellInput('G2', '2'); s.setCellInput('G3', '3');
  s.setCellInput('F2', '=MODE.SNGL(G1:G3)');
  check('MODE.SNGL 중복없음 에러', s.getDisplayValue('F2'), ERRORS.NA);

  s.setCellInput('H1', '=VAR.S(2,4,6)');
  check('VAR.S 정상', s.getDisplayValue('H1'), 4);
  s.setCellInput('H2', '=VAR.S(5)');
  check('VAR.S 에러(1개)', s.getDisplayValue('H2'), ERRORS.DIV0);
  s.setCellInput('H3', '=STDEV.S(2,4,6)');
  check('STDEV.S 정상', s.getDisplayValue('H3'), 2);
  s.setCellInput('H4', '=STDEV.S(5)');
  check('STDEV.S 에러(1개)', s.getDisplayValue('H4'), ERRORS.DIV0);
}

// ---- setCellValue: 자료형 보존(텍스트 숫자·날짜) ----
{
  const s = new Sheet();
  s.setCellValue('A1', '03');            // 텍스트 그대로 (숫자 변환 X)
  s.setCellInput('B1', '=LEN(A1)');
  check('setCellValue 텍스트 길이 LEN("03")=2', s.getDisplayValue('B1'), 2);
  s.setCellInput('B2', '=A1=3');
  check('setCellValue "03"=3 은 FALSE', s.getDisplayValue('B2'), false);
  s.setCellInput('B3', '=A1*1');
  check('setCellValue "03"*1 = 3', s.getDisplayValue('B3'), 3);

  // 텍스트 셀을 참조하는 COUNTIF / VLOOKUP
  const t = new Sheet();
  t.setCellValue('A1', '03'); t.setCellValue('A2', '10'); t.setCellValue('A3', '03');
  t.setCellInput('C1', '=COUNTIF(A1:A3,"03")');
  check('COUNTIF 텍스트 "03" = 2', t.getDisplayValue('C1'), 2);
  t.setCellInput('C2', '=COUNTIF(A1:A3,3)');
  check('COUNTIF 숫자 3 은 텍스트"03"과 불일치 = 0', t.getDisplayValue('C2'), 0);
  // VLOOKUP 키가 텍스트
  t.setCellValue('E1', '03'); t.setCellValue('F1', '컴퓨터');
  t.setCellValue('E2', '10'); t.setCellValue('F2', '전자');
  t.setCellInput('G1', '=VLOOKUP("03",E1:F2,2,0)');
  check('VLOOKUP 텍스트 키 "03" → 컴퓨터', t.getDisplayValue('G1'), '컴퓨터');
  t.setCellInput('G2', '=VLOOKUP(3,E1:F2,2,0)');
  check('VLOOKUP 숫자 3 → #N/A(텍스트 키와 불일치)', s2NA(t.getCellValue('G2')), ERRORS.NA);

  // 날짜 serial + 표시 형식
  const d = new Sheet();
  d.setCellValue('A1', 46037, 'date'); // 2026-01-15
  check('setCellValue 날짜 표시', d.getDisplayValue('A1'), '2026-01-15');
  d.setCellInput('B1', '=YEAR(A1)');
  check('setCellValue 날짜 YEAR', d.getDisplayValue('B1'), 2026);
}
function s2NA(v) { return isErrorValue(v) ? v.error : v; }

// ---- E. 연산자 우선순위 (단항 - · % 가 ^ 보다 강함) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '3');
  s.setCellInput('E1', '=-2^2');     check('-2^2 = 4', s.getDisplayValue('E1'), 4);
  s.setCellInput('E2', '=2-3^2');    check('2-3^2 = -7', s.getDisplayValue('E2'), -7);
  s.setCellInput('E3', '=50%^2');    check('50%^2 = 0.25', s.getDisplayValue('E3'), 0.25);
  s.setCellInput('E4', '=2^-1');     check('2^-1 = 0.5', s.getDisplayValue('E4'), 0.5);
  s.setCellInput('E5', '=-A1^2');    check('-A1^2 = 9 (A1=3)', s.getDisplayValue('E5'), 9);
  s.setCellInput('E6', '=2^3^2');    check('2^3^2 = 64 (좌결합)', s.getDisplayValue('E6'), 64);
  s.setCellInput('E7', '=50%*4');    check('50%*4 = 2 (% 우선)', s.getDisplayValue('E7'), 2);
}
// ---- B. CHOOSE 인덱스 절사 ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=CHOOSE(2.9,"a","b","c")'); check('CHOOSE(2.9) = b', s.getDisplayValue('A1'), 'b');
  s.setCellInput('A2', '=CHOOSE(0.5,"a","b")');     check('CHOOSE(0.5) = #VALUE!', s.getDisplayValue('A2'), ERRORS.VALUE);
  s.setCellInput('A3', '=CHOOSE(3,"a","b")');       check('CHOOSE(3,2개) = #VALUE!', s.getDisplayValue('A3'), ERRORS.VALUE);
}
// ---- C. 숫자→텍스트 15유효자리 (& 결합) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=0.1+0.2&""'); check('0.1+0.2&"" = "0.3"', s.getDisplayValue('A1'), '0.3');
  s.setCellInput('A2', '=1/3&""');     check('1/3&"" 15자리', s.getDisplayValue('A2'), '0.333333333333333');
}
// ---- D. 인수 생략 (MissingArg) ----
{
  const s = new Sheet();
  s.setCellInput('A1', '=TIME(,2,)*86400'); check('TIME(,2,) = 120초', s.getDisplayValue('A1'), 120);
  s.setCellInput('A2', '=IF(1>2,"a",)');    check('IF(1>2,"a",) = 0', s.getDisplayValue('A2'), 0);
  // VLOOKUP 4번째: 빈 인수 = 정확(→#N/A), 3인수 = 근사(→b)
  const t = new Sheet();
  t.setCellInput('B1','1'); t.setCellInput('C1','a');
  t.setCellInput('B2','3'); t.setCellInput('C2','b');
  t.setCellInput('B3','5'); t.setCellInput('C3','c');
  t.setCellInput('D1','=VLOOKUP(4,B1:C3,2,)'); check('VLOOKUP(4,,,) 빈4번째=정확 → #N/A', t.getDisplayValue('D1'), ERRORS.NA);
  t.setCellInput('D2','=VLOOKUP(4,B1:C3,2)');  check('VLOOKUP(4,,) 3인수=근사 → b', t.getDisplayValue('D2'), 'b');
}
// ---- F. 빈 셀 비교 ----
{
  const s = new Sheet(); // Z1 은 비워 둔다
  s.setCellInput('A1', '=Z1=""');    check('빈="" → TRUE', s.getDisplayValue('A1'), true);
  s.setCellInput('A2', '=Z1=0');     check('빈=0 → TRUE', s.getDisplayValue('A2'), true);
  s.setCellInput('A3', '=Z1<1');     check('빈<1 → TRUE', s.getDisplayValue('A3'), true);
  s.setCellInput('A4', '=Z1>"a"');   check('빈>"a" → FALSE', s.getDisplayValue('A4'), false);
  s.setCellInput('A5', '=Z1=FALSE'); check('빈=FALSE → TRUE', s.getDisplayValue('A5'), true);
  s.setCellInput('A6', '=Z1<>""');   check('빈<>"" → FALSE', s.getDisplayValue('A6'), false);
  s.setCellInput('A7', '=Z1=Z2');    check('빈=빈 → TRUE', s.getDisplayValue('A7'), true);
}
// ---- A. D함수 텍스트 조건 앞부분 일치 (COUNTIF 는 완전 일치 유지) ----
{
  const s = new Sheet();
  s.setCellInput('A1','지역'); s.setCellInput('B1','점');
  s.setCellInput('A2','서울'); s.setCellInput('B2','1');
  s.setCellInput('A3','서울시'); s.setCellInput('B3','2');
  s.setCellInput('A4','부산'); s.setCellInput('B4','3');
  s.setCellInput('D1','지역'); s.setCellInput('D2','서울');
  s.setCellInput('F1','=DCOUNTA(A1:B4,"지역",D1:D2)'); check('DCOUNTA 앞부분(서울→서울,서울시) = 2', s.getDisplayValue('F1'), 2);
  s.setCellInput('F2','=COUNTIF(A2:A4,"서울")');        check('COUNTIF 완전일치 서울 = 1', s.getDisplayValue('F2'), 1);
  // 와일드카드: D함수는 시작만 고정(앞부분), COUNTIF 는 끝까지 고정
  s.setCellInput('G1','지역'); s.setCellInput('G2','?울');
  s.setCellInput('F3','=DCOUNTA(A1:B4,"지역",G1:G2)'); check('DCOUNTA 와일드 ?울 앞부분 = 2', s.getDisplayValue('F3'), 2);
  s.setCellInput('F4','=COUNTIF(A2:A4,"?울")');         check('COUNTIF 와일드 ?울 완전 = 1', s.getDisplayValue('F4'), 1);
}

console.log(`\n총 ${pass + fail}개 중 ${pass}개 통과, ${fail}개 실패`);
process.exit(fail > 0 ? 1 : 0);
