// src/data/exam/calc/samples.js
// 계산작업 고정 샘플 블록 6개 (템플릿 아님 — 3b 템플릿의 기준 형태).
// 데이터는 새로 만든 것. 계산작업_유형.md 4절 제약과 7절 워딩 템플릿을 그대로 따르고,
// 문자열 따옴표는 큰따옴표로 통일한다. [표N] 은 조합 위치에서 나오므로 지시문엔 {표} 로 둔다.
// answer.formula: 채우기 중 고정할 범위(참조표·조건 데이터)는 $, 행마다 바뀌는 참조는 상대.

const D = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);

// 1) A-2 DAVERAGE + ROUND · single · criteria(right, "부"로 끝나는)
export const SAMPLE_A2_DAVERAGE = {
  subtype: "A-2", colWidths: [12, 8, 8],
  headers: ["동아리", "등급", "평점"],
  rows: [
    ["연극부", "A", 4.4], ["사진반", "B", 3.8], ["방송부", "A", 4.6],
    ["미술반", "C", 3.15], ["합창부", "B", 4.11], ["토론반", "A", 3.9],
  ],
  result: { kind: "single", label: "동아리부 평점 평균" },
  answer: '=ROUND(DAVERAGE(A2:C8,"평점",E1:E2),1)',
  criteria: { headers: ["동아리"], rows: [["*부"]], rowOffset: 0 },
  functions: { required: ["DAVERAGE", "ROUND"], candidates: null },
  text: '[{표}]에서 동아리[{col:동아리}]가 "부"로 끝나는 동아리의 평점[{col:평점}]에 대한 평균을 [{R}] 셀에 계산하시오. (8점)',
  notes: [
    "소수점 이하 둘째 자리에서 반올림하여 첫째 자리까지 표시 [표시 예 : 3.57 → 3.6]",
    "조건은 [{C}] 영역에 알맞게 입력",
    "DAVERAGE, ROUND 함수 사용",
  ],
  accept: [], reject: [],
};

// 2) B-1 IFERROR + CHOOSE + RANK.EQ · fillCol
export const SAMPLE_B1_RANK = {
  subtype: "B-1", colWidths: [8, 10, 10],
  headers: ["이름", "실기점수", "순위판정"],
  rows: [
    ["김하", 88, null], ["이준", 92, null], ["박서", 85, null],
    ["최민", 95, null], ["정예", 79, null], ["강도", 90, null],
  ],
  result: { kind: "fillCol", col: "순위판정" },
  answer: '=IFERROR(CHOOSE(RANK.EQ(B3,$B$3:$B$8),"금","은","동"),"")',
  functions: { required: ["IFERROR", "CHOOSE", "RANK.EQ"], candidates: null },
  text: '[{표}]에서 실기점수[{col:실기점수}]에 대한 순위를 구하여 1위는 "금", 2위는 "은", 3위는 "동", 그 외에는 공백을 순위판정[{R}]에 표시하시오. (8점)',
  notes: [
    "순위는 실기점수가 가장 높은 것이 1위",
    "IFERROR, CHOOSE, RANK.EQ 함수 사용",
  ],
  accept: [], reject: [],
};

// 3) C-1 IFERROR + HLOOKUP + LEFT · refTable(right) · 참조표에 없는 키 1건(BA)
export const SAMPLE_C1_HLOOKUP = {
  subtype: "C-1", colWidths: [8, 8, 10],
  headers: ["학번", "이름", "학과"],
  rows: [
    ["CS101", "한지민", null], ["EE202", "오세훈", null], ["ME303", "배수지", null],
    ["BA404", "정우성", null], ["CS505", "김태리", null], ["EE606", "손예진", null],
  ],
  result: { kind: "fillCol", col: "학과" },
  answer: '=IFERROR(HLOOKUP(LEFT(A3,2),$E$2:$G$3,2,0),"확인")',
  refTable: { name: "학과기준표", headers: ["CS", "EE", "ME"], rows: [["컴퓨터", "전자", "기계"]], rowOffset: 0 },
  functions: { required: ["IFERROR", "HLOOKUP", "LEFT"], candidates: null },
  text: "[{표}]에서 학번[{col:학번}]의 앞 두 문자와 학과기준표[{T}]를 이용하여 학과[{R}]를 표시하시오. (8점)",
  notes: [
    "학과 = 학번의 처음 두 글자로 학과기준표에서 찾은 값",
    "학번의 처음 두 글자가 학과코드임",
    '단, 오류발생시 학과에 "확인"으로 표시',
    "IFERROR, HLOOKUP, LEFT 함수 사용",
  ],
  accept: [], reject: [],
};

// 4) A-4 SUMIF + SUM · resultTable(right, 표 이름 라벨 포함) · 비율 소수 그대로
export const SAMPLE_A4_SUMIF = {
  subtype: "A-4", colWidths: [8, 8, 8],
  headers: ["사원명", "부서", "실적"],
  rows: [
    ["한가람", "영업", 120], ["이도현", "개발", 170], ["박서준", "지원", 40],
    ["최유리", "영업", 80], ["정민호", "개발", 130], ["강예린", "지원", 60],
  ],
  result: { kind: "table" },
  resultTable: { name: "부서별비율", headers: ["부서", "비율"], labels: ["영업", "개발", "지원"], rowOffset: 0 },
  answer: '=SUMIF($B$3:$B$8,E3,$C$3:$C$8)/SUM($C$3:$C$8)',
  functions: { required: ["SUMIF", "SUM"], candidates: null },
  text: "[{표}]에서 부서[{col:부서}]와 실적[{col:실적}]을 이용하여 부서별비율표[{RT}]의 부서별 비율[{R}]을 계산하시오. (8점)",
  notes: [
    "비율 = 부서별 실적 합계 / 전체 실적 합계",
    "SUMIF, SUM 함수 사용",
  ],
  accept: [], reject: [],
};

// 5) D-3 WORKDAY + MONTH + DAY 와 & · fillCol · 텍스트 결과 · 금/토 시작·두 주말 걸침 포함
export const SAMPLE_D3_WORKDAY = {
  subtype: "D-3", colWidths: [8, 12, 6, 8],
  headers: ["작업", "시작일", "기간", "완료일"],
  colZ: { 1: "yyyy-mm-dd" },
  rows: [
    ["설계", D(2026, 3, 5), 3, null],   // 목
    ["개발", D(2026, 3, 13), 5, null],  // 금
    ["검수", D(2026, 3, 21), 4, null],  // 토
    ["배포", D(2026, 3, 9), 12, null],  // 월, 기간 12 → 두 주말 걸침
    ["기획", D(2026, 3, 4), 2, null],   // 수
    ["운영", D(2026, 3, 25), 8, null],  // 수, 두 주말 걸침
  ],
  result: { kind: "fillCol", col: "완료일" },
  answer: '=MONTH(WORKDAY(B3,C3))&"/"&DAY(WORKDAY(B3,C3))',
  functions: { required: ["WORKDAY", "MONTH", "DAY"], candidates: null },
  text: "[{표}]에서 시작일[{col:시작일}]과 기간[{col:기간}]을 이용하여 완료일[{R}]을 표시하시오. (8점)",
  notes: [
    "완료일 : 시작일에 주말(토요일과 일요일)은 제외하고 기간을 더한 날짜 [표시 예 : 2026-04-10 → 4/17]",
    "WORKDAY, MONTH, DAY 함수와 & 연산자 사용",
  ],
  accept: [], reject: [],
};

// 6) A-2 AVERAGEIF · ROUNDDOWN/ROUND/ROUNDUP 중 알맞은 함수 · fillRow
export const SAMPLE_A2_AVERAGEIF = {
  subtype: "A-2", colWidths: [8, 6, 6, 6, 6],
  headers: ["이름", "반", "국어", "영어", "수학"],
  rows: [
    ["김", "1반", 88, 90, 76], ["이", "2반", 70, 60, 55], ["박", "1반", 92, 84, 90],
    ["최", "3반", 55, 48, 60], ["정", "2반", 100, 95, 88], ["강", "1반", 68, 70, 76],
    ["윤", "3반", 45, 50, 52], ["임", "2반", 78, 81, 74],
  ],
  result: { kind: "fillRow", cols: ["국어", "영어", "수학"], label: "1반 평균" },
  answer: '=ROUNDDOWN(AVERAGEIF($B$3:$B$10,"1반",C3:C10),0)',
  functions: { required: ["AVERAGEIF"], candidates: ["ROUNDDOWN", "ROUND", "ROUNDUP"] },
  text: '[{표}]에서 반[{col:반}]이 "1반"인 학생의 국어[{col:국어}], 영어[{col:영어}], 수학[{col:수학}]의 평균을 [{R}] 영역에 계산하시오. (8점)',
  notes: [
    "소수점 이하 첫째 자리에서 내림하여 일의 자리까지 표시 [표시 예 : 82.7 → 82]",
    "AVERAGEIF, ROUNDDOWN, ROUND, ROUNDUP 중 알맞은 함수 사용",
  ],
  accept: [], reject: [],
};

export const SAMPLES = [
  SAMPLE_A2_DAVERAGE, SAMPLE_B1_RANK, SAMPLE_C1_HLOOKUP,
  SAMPLE_A4_SUMIF, SAMPLE_D3_WORKDAY, SAMPLE_A2_AVERAGEIF,
];
