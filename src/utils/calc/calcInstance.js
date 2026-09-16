// src/utils/calc/calcInstance.js
// 계산작업 문제 인스턴스 스키마 (JSDoc 정의만; 런타임 코드 없음).
//
// 원칙: 지시문 문장 · 결과 좌표 · 기준 수식 · 조건 범위 · 기대값은 모두 같은 슬롯 값과
//       같은 레이아웃 좌표(calcLayout)에서 만든다. 좌표를 따로 계산하는 코드를 두지 않는다.
//
// section 은 "계산"(기존 관례). 새 스키마는 items 배열 유무로 구분한다(items 있으면 신 스키마).
// 파일에 수식을 쓸 때 _xlfn. 접두는 3d examBuilder 가 functions.js 의 xlfn 필드를 보고 붙인다.
// 이 스키마의 수식(answer.formula, cells[].f)에는 접두를 넣지 않는다.

/**
 * @typedef {Object} CalcCell
 * @property {number|string} [v]   셀 값 (문제 파일 상태). 결과·조건 셀은 비어 있음(생략).
 * @property {"n"|"s"} [t]         자료형. 엔진 적재 시 setCellValue 로 보존.
 * @property {string} [z]          표시 형식(날짜/시간 등). 예: "yyyy-mm-dd".
 * @property {string} [f]          중간 계산 수식(선행 = 포함). 예: "=C4*D4".
 */

/**
 * @typedef {Object} CalcResult
 * @property {"single"|"fillCol"|"fillRow"|"table"} kind
 * @property {string} range        결과 셀 범위 A1 (단일이면 단일 셀).
 * @property {string} anchor       기준 수식이 들어가는 셀 A1.
 * @property {"down"|"right"|null} fill  채우기 방향(fillCol=down, fillRow/table=right, single=null).
 * @property {string} [z]          결과 표시 형식.
 */

/**
 * @typedef {Object} CalcCriteria
 * @property {string} range        빈 조건 범위 A1 (머리글 + 조건 행). 문제 파일에선 비어 있음.
 * @property {Array<Object>} rows   [{ 머리글: 조건, ... }] — 채점·기대값 계산의 기준 조건.
 * @property {string[][]} table    조건 범위를 2차원으로(머리글 행 + 조건 행들).
 */

/**
 * @typedef {Object} CalcItem
 * @property {number} no
 * @property {string} subtype                 예: "A-2","B-1","C-1","A-4","D-3".
 * @property {8} points
 * @property {string} text                    지시문(끝에 "(8점)").
 * @property {string[]} notes                 ▶ 줄. 순서: 산식·규칙 → 표시 예 → 조건 입력 위치 → 함수 목록.
 * @property {{ required: string[], candidates: string[]|null }} functions
 * @property {CalcResult} result
 * @property {{ formula: string }} answer     anchor 기준 수식(선행 = 포함, xlfn 접두 없음).
 * @property {CalcCriteria|null} criteria
 * @property {Object.<string, (number|string|{error:string})>} expected  결과 셀별 기대값.
 * @property {string[]} sourceCells           입력 데이터 셀 주소(데이터 변경 경고용).
 * @property {string[]} [accept]              별해(3a-4 채점기가 채움).
 * @property {string[]} [reject]              대표 실수(3a-4 채점기가 채움).
 */

/**
 * @typedef {Object} CalcInstance
 * @property {string} id
 * @property {"계산"} section
 * @property {string} seed
 * @property {string} difficulty
 * @property {"계산작업"} sheetName
 * @property {Object.<string, CalcCell>} cells   문제 파일 상태(결과·조건 셀은 비어 있음).
 * @property {string[]} merges                    병합 범위 A1 목록.
 * @property {Object.<string, number>} colWidths  열(letter) → 너비.
 * @property {string} usedRange                   전체 사용 영역 A1.
 * @property {CalcItem[]} items
 */

export {}; // 타입 전용 모듈
