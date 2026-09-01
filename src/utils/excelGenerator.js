import XLSX from "xlsx-js-style";

const FONT = "맑은 고딕"; // 파일 전체 글씨체

// 지정한 범위(예: "A5:E9")의 모든 셀에 얇은 테두리를 넣는다.
// 비어 있는 셀도 테두리가 보이도록 없으면 빈 셀을 만들어 준다.
function setBorders(ws, range, { boldHeaderRow, fontSize = 14, rowHeight } = {}) {
  const thin = { style: "thin", color: { rgb: "000000" } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };
  const r = XLSX.utils.decode_range(range);
  for (let R = r.s.r; R <= r.e.r; R++) {
    for (let C = r.s.c; C <= r.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      const isHeader = boldHeaderRow !== undefined && R === boldHeaderRow;
      ws[addr].s = {
        border,
        alignment: { horizontal: "center", vertical: "center" },
        font: { name: FONT, sz: fontSize, bold: isHeader },
        ...(isHeader ? { fill: { fgColor: { rgb: "E8EEF7" } } } : {}),
      };
    }
  }
  // 행 높이 지정 (큼직한 칸)
  if (rowHeight) {
    ws["!rows"] = ws["!rows"] || [];
    for (let R = r.s.r; R <= r.e.r; R++) ws["!rows"][R] = { hpt: rowHeight };
  }
  // 테두리를 넣은 범위가 시트 참조 범위 안에 포함되도록 !ref 확장
  const cur = ws["!ref"] ? XLSX.utils.decode_range(ws["!ref"]) : r;
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: Math.min(cur.s.r, r.s.r), c: Math.min(cur.s.c, r.s.c) },
    e: { r: Math.max(cur.e.r, r.e.r), c: Math.max(cur.e.c, r.e.c) },
  });
}

// 제목처럼 짧은 텍스트 셀의 글씨 크기를 키운다.
function setFont(ws, addr, { sz = 14, bold = false } = {}) {
  if (!ws[addr]) ws[addr] = { t: "s", v: "" };
  ws[addr].s = { ...(ws[addr].s || {}), font: { name: FONT, sz, bold }, alignment: { vertical: "center" } };
}

// 문제 문장 셀: A~endCol 열까지 병합해 폭을 제한하고, 자동 줄바꿈으로
// 길면 다음 줄로 넘어가게 한다. 글자 수로 줄 수를 넉넉히 추정해 행 높이를 잡는다.
function setProblem(ws, cell, { sz = 14, endCol = 8 } = {}) {
  const { r, c } = XLSX.utils.decode_cell(cell);
  const text = ws[cell] ? String(ws[cell].v ?? "") : "";
  ws[cell] = {
    t: "s",
    v: text,
    s: { font: { name: FONT, sz }, alignment: { wrapText: true, vertical: "top", horizontal: "left" } },
  };
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({ s: { r, c }, e: { r, c: endCol } });
  // 시각적 길이 추정(한글 1, 그 외 0.5) 후 병합 폭(A~I ≈ 한 줄 약 42자) 기준 줄 수 계산
  let vl = 0;
  for (const ch of text) vl += /[가-힣]/.test(ch) ? 1 : 0.5;
  const lines = Math.max(1, Math.ceil(vl / 42));
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][r] = { hpt: lines * 20 }; // 맑은 고딕 14pt 기준 한 줄 = 20pt
  const cur = XLSX.utils.decode_range(ws["!ref"]);
  ws["!ref"] = XLSX.utils.encode_range({
    s: cur.s,
    e: { r: Math.max(cur.e.r, r), c: Math.max(cur.e.c, endCol) },
  });
}

export function generateExcel(lesson) {
  if (lesson.id === 2) return generateLesson2(lesson);
  if (lesson.id === 3) return generateLesson3(lesson);
  if (lesson.id === 4) return generateLesson4(lesson);
  if (lesson.id === 9) return generateLesson9(lesson);
  return generateLesson1(lesson);
}

// 9차시 — 셀 서식 따라하기 통합문서.
// 원본 문제 파일처럼 '테두리·서식이 전혀 없는 밋밋한 표'로 만든다. (모든 서식은 학생이 직접 적용)
// [실습] 베이커리 재고 현황 · [복습] 서점 재고 현황 — 주제를 다르게.
function generateLesson9(lesson) {
  const wb = XLSX.utils.book_new();

  // rows 는 [코드, 분류, 단가/정가, 입고수량/입고부수, 입고일(Date), 재고, 전월재고, 할인율]
  // 할인율만 3개 행이 비어 있고(null, 대각선 테두리 실습용), 전월재고 등 나머지는 항상 값이 있다.
  function makeSheet(title, headers, rows) {
    const aoa = [
      ["", title],
      [],
      ["", ...headers],
      ...rows.map((r) => ["", ...r]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // 열 너비만 지정 — 테두리·글꼴·정렬 등 서식은 일절 넣지 않는다.
    ws["!cols"] = [{ wch: 3 }, { wch: 12 }, { wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 12 }, { wch: 7 }, { wch: 9 }, { wch: 8 }];
    return ws;
  }

  // [실습] — 해피 베이커리 (분류·코드 순서를 섞음, 할인율만 3·7·10행 비움)
  const practice = makeSheet(
    "해피 베이커리 3월 재고 현황",
    ["상품코드", "분류", "단가", "입고수량", "입고일", "재고", "전월재고", "할인율"],
    [
      ["BR105", "빵", 3500, 120, new Date(2024, 2, 2), 30, 10, 0.1],
      ["CK210", "케이크", 28000, 45, new Date(2024, 2, 3), 5, 2, 0.15],
      ["DR330", "음료", 4500, 200, new Date(2024, 2, 5), 20, 0, null],
      ["CK118", "케이크", 32000, 30, new Date(2024, 2, 7), 8, 3, 0.2],
      ["SN402", "샌드위치", 6500, 90, new Date(2024, 2, 10), 15, 8, 0.08],
      ["BR221", "빵", 3000, 150, new Date(2024, 2, 12), 25, 12, 0.1],
      ["DR145", "음료", 5000, 180, new Date(2024, 2, 15), 10, 0, null],
      ["CO309", "쿠키", 2500, 210, new Date(2024, 2, 18), 18, 4, 0.07],
      ["BR117", "빵", 4000, 80, new Date(2024, 2, 20), 12, 6, 0.09],
      ["SN215", "샌드위치", 7000, 60, new Date(2024, 2, 24), 6, 0, null],
      ["CK126", "케이크", 26000, 40, new Date(2024, 2, 27), 9, 5, 0.18],
    ]
  );
  XLSX.utils.book_append_sheet(wb, practice, "실습");

  // [복습] — 달빛 서점 (주제가 다른 표로 한 번 더, 분야·코드 섞음, 할인율만 3·7·10행 비움)
  const review = makeSheet(
    "달빛 서점 4월 재고 현황",
    ["도서코드", "분야", "정가", "입고부수", "입고일", "재고", "전월재고", "할인율"],
    [
      ["NV118", "소설", 15800, 320, new Date(2024, 3, 1), 40, 25, 0.1],
      ["CM204", "만화", 9800, 540, new Date(2024, 3, 2), 60, 30, 0.05],
      ["ES331", "에세이", 13500, 180, new Date(2024, 3, 4), 22, 0, null],
      ["NV142", "소설", 16800, 210, new Date(2024, 3, 6), 18, 12, 0.08],
      ["PO405", "시집", 11000, 95, new Date(2024, 3, 9), 15, 8, 0.12],
      ["CM219", "만화", 8900, 480, new Date(2024, 3, 11), 35, 5, 0.1],
      ["ES128", "에세이", 14200, 120, new Date(2024, 3, 14), 9, 0, null],
      ["PR307", "실용", 18500, 150, new Date(2024, 3, 17), 20, 7, 0.07],
      ["NV133", "소설", 17500, 260, new Date(2024, 3, 19), 28, 15, 0.09],
      ["CM241", "만화", 9500, 610, new Date(2024, 3, 23), 44, 0, null],
      ["ES116", "에세이", 12800, 88, new Date(2024, 3, 26), 7, 4, 0.18],
    ]
  );
  XLSX.utils.book_append_sheet(wb, review, "복습");

  XLSX.writeFile(wb, `컴활2급_9차시_셀서식_실습.xlsx`);
}

function appendLesson1(wb) {
  // ── 시트 1: 상대 참조 (아래로 + 오른쪽으로 자동 채우기). 문제는 최상단. ──
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["표 1 - 분기별 판매 실적 (상대 참조)"],
    ["[문제 1] 아래로 자동 채우기 — E6 셀에 세 분기 판매량의 합계 수식을 입력하고 E8까지 아래로 자동 채우기 하시오."],
    ["[문제 2] 오른쪽으로 자동 채우기 — B9 셀에 세 제품 판매량의 합계 수식을 입력하고 D9까지 오른쪽으로 자동 채우기 하시오."],
    [],
    ["제품", "1분기", "2분기", "3분기", "합계"],
    ["제품A", 100, 120, 90, ""],
    ["제품B", 80, 150, 110, ""],
    ["제품C", 130, 70, 160, ""],
    ["합계", "", "", "", ""],
  ]);
  ws1["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  setBorders(ws1, "A5:E9", { boldHeaderRow: 4, rowHeight: 30 }); // 5행(index 4)이 머리글
  setFont(ws1, "A1", { sz: 16, bold: true }); // 제목
  setProblem(ws1, "A2"); // 문제 1 (자동 줄바꿈)
  setProblem(ws1, "A3"); // 문제 2 (자동 줄바꿈)
  XLSX.utils.book_append_sheet(wb, ws1, "표1_상대참조");

  // ── 시트 2: 절대 참조 (비율 고정). 문제는 최상단, 비율 셀은 B10·B11. $ 표기 대신 셀 주소만. ──
  const ws2 = XLSX.utils.aoa_to_sheet([
    ["표 2 - 가중 점수 계산 (절대 참조)"],
    ["[문제] D5 셀에 '실기 점수 × 실기비율(B10셀) + 봉사 점수 × 봉사비율(B11셀)'을 계산하는 수식을 입력하고 D8까지 아래로 자동 채우기 하시오. 자동 채우기를 해도 비율 셀(B10·B11)이 바뀌지 않도록 고정해야 합니다."],
    [],
    ["이름", "실기 점수", "봉사 점수", "최종 점수"],
    ["김철수", 80, 70, ""],
    ["이영희", 90, 60, ""],
    ["박민준", 75, 85, ""],
    ["정수연", 88, 92, ""],
    [],
    ["실기 비율", 0.6],
    ["봉사 비율", 0.4],
  ]);
  ws2["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  setBorders(ws2, "A4:D8", { boldHeaderRow: 3, rowHeight: 30 }); // 본표 (4행이 머리글)
  setBorders(ws2, "A10:B11", { rowHeight: 30 }); // 비율 표
  setFont(ws2, "A1", { sz: 16, bold: true }); // 제목
  setProblem(ws2, "A2"); // 문제 (자동 줄바꿈)
  XLSX.utils.book_append_sheet(wb, ws2, "표2_절대참조비율");

  // ── 시트 3: 구구단 만들기 (혼합 참조). 위쪽 단(3행) × 왼쪽 수(A열). ──
  const ws3 = XLSX.utils.aoa_to_sheet([
    ["표 3 - 구구단 만들기 (혼합 참조)"],
    ["[문제] B4 셀에 '위쪽 단(3행) × 왼쪽 수(A열)'을 곱하는 수식을 입력하고, 한 번의 자동 채우기로 표 전체(B4:I12)를 완성하시오. 오른쪽·아래로 동시에 채워지도록 어느 방향을 고정할지 생각하여 혼합 참조($)를 사용하시오."],
    ["×", 2, 3, 4, 5, 6, 7, 8, 9],
    [1, "", "", "", "", "", "", "", ""],
    [2, "", "", "", "", "", "", "", ""],
    [3, "", "", "", "", "", "", "", ""],
    [4, "", "", "", "", "", "", "", ""],
    [5, "", "", "", "", "", "", "", ""],
    [6, "", "", "", "", "", "", "", ""],
    [7, "", "", "", "", "", "", "", ""],
    [8, "", "", "", "", "", "", "", ""],
    [9, "", "", "", "", "", "", "", ""],
  ]);
  ws3["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  setBorders(ws3, "A3:I12", { boldHeaderRow: 2, rowHeight: 30 }); // 3행이 단(머리글)
  setFont(ws3, "A1", { sz: 16, bold: true }); // 제목
  setProblem(ws3, "A2"); // 문제 (자동 줄바꿈)
  XLSX.utils.book_append_sheet(wb, ws3, "표3_구구단");
}

function generateLesson1(lesson) {
  const wb = XLSX.utils.book_new();
  appendLesson1(wb);
  XLSX.writeFile(wb, `컴활2급_${lesson.id}차시_${lesson.title}_실습.xlsx`);
}

function appendLesson2(wb) {
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["문자열 추출 함수 실습 (LEFT / RIGHT / MID)"],
    ["원본 데이터", "B열 (결과 입력)", "C열 (결과 입력)", "D열 (결과 입력)"],
    ["ABC456XYZ", "", "", ""],
    ["컴활2급실기", "", "", ""],
    ["Seoul2024KR", "", "", ""],
    [],
    ["[문제 1] B3:B5 셀에 원본 데이터의 왼쪽 3글자를 추출하는 수식을 입력하시오. (LEFT 함수 사용)"],
    ["[문제 2] C3:C5 셀에 원본 데이터의 오른쪽 3글자를 추출하는 수식을 입력하시오. (RIGHT 함수 사용)"],
    ["[문제 3] D3:D5 셀에 원본 데이터의 4번째 글자부터 2글자를 추출하는 수식을 입력하시오. (MID 함수 사용)"],
  ]);
  ws1["!cols"] = [{wch:14},{wch:18},{wch:18},{wch:18}];
  XLSX.utils.book_append_sheet(wb, ws1, "문자열추출");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["문자열 변환 함수 실습 (LEN / UPPER / LOWER / PROPER)"],
    ["원본 텍스트", "B열 (결과 입력)", "C열 (결과 입력)", "D열 (결과 입력)", "E열 (결과 입력)"],
    ["Hello World", "", "", "", ""],
    ["Excel Exam", "", "", "", ""],
    ["computer science", "", "", "", ""],
    [],
    ["[문제 1] B3:B5 셀에 원본 텍스트의 총 글자 수를 구하는 수식을 입력하시오. (LEN 함수 사용, 공백 포함)"],
    ["[문제 2] C3:C5 셀에 원본 텍스트를 모두 대문자로 변환하는 수식을 입력하시오. (UPPER 함수 사용)"],
    ["[문제 3] D3:D5 셀에 원본 텍스트를 모두 소문자로 변환하는 수식을 입력하시오. (LOWER 함수 사용)"],
    ["[문제 4] E3:E5 셀에 원본 텍스트의 각 단어 첫 글자만 대문자로 변환하는 수식을 입력하시오. (PROPER 함수 사용)"],
  ]);
  ws2["!cols"] = [{wch:20},{wch:16},{wch:16},{wch:16},{wch:16}];
  XLSX.utils.book_append_sheet(wb, ws2, "문자열변환");

  const ws3 = XLSX.utils.aoa_to_sheet([
    ["FIND / SEARCH / TRIM 함수 실습"],
    [],
    ["[ FIND · SEARCH 비교 ]"],
    ["원본 데이터", "B열 (결과 입력)", "C열 (결과 입력)"],
    ["John_j", "", ""],
    ["user@Email.com", "", ""],
    [],
    ["[ TRIM - 공백 제거 ]"],
    ["원본 (공백 포함)", "B열 (결과 입력)"],
    ["  컴활  2급  ", ""],
    ["  Hello  World  ", ""],
    [],
    ["[문제 1] B5:B6 셀에 원본 데이터에서 소문자 'j'가 몇 번째에 있는지 찾는 수식을 입력하시오. (FIND 함수 사용, 대소문자 구분O)"],
    ["[문제 2] C5:C6 셀에 원본 데이터에서 'J'(대소문자 무시)의 위치를 찾는 수식을 입력하시오. (SEARCH 함수 사용)"],
    ["[문제 3] B10:B11 셀에 원본 데이터의 앞뒤 공백과 중복 공백을 제거하는 수식을 입력하시오. (TRIM 함수 사용)"],
  ]);
  ws3["!cols"] = [{wch:22},{wch:22},{wch:22}];
  XLSX.utils.book_append_sheet(wb, ws3, "위치및공백");

  const ws4 = XLSX.utils.aoa_to_sheet([
    ["& 연산자 문자열 연결 실습"],
    ["텍스트 A (A열)", "텍스트 B (B열)", "C열 (결과 입력)"],
    ["컴퓨터활용능력", "2급", ""],
    ["excel", "시험", ""],
    ["컴활", "실기", ""],
    [],
    ["[문제 1] C3 셀에 A3과 '-'(붙임표)와 B3을 순서대로 연결하는 수식을 입력하시오."],
    ["[문제 2] C4 셀에 A4를 모두 대문자로 변환하고 공백(' ')을 사이에 넣어 B4를 연결하는 수식을 입력하시오. (UPPER 함수 + & 사용)"],
    ["[문제 3] C5 셀에 A5를 괄호('(' 와 ')')로 감싸고 뒤에 B5를 붙이는 수식을 입력하시오."],
  ]);
  ws4["!cols"] = [{wch:18},{wch:10},{wch:28}];
  XLSX.utils.book_append_sheet(wb, ws4, "문자열연결");
}

function generateLesson2(lesson) {
  const wb = XLSX.utils.book_new();
  appendLesson2(wb);
  XLSX.writeFile(wb, `컴활2급_${lesson.id}차시_${lesson.title}_실습.xlsx`);
}

function appendLesson3(wb) {
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["기본 통계 함수 실습 (AVERAGE / MEDIAN)"],
    ["월별", "판매량", "구분", "결과값"],
    ["1월", 150, "평균 판매량", ""],
    ["2월", 220, "중간값 판매량", ""],
    ["3월", 110, "", ""],
    [],
    ["[문제 1] D2 셀에 1~3월 판매량의 평균을 구하는 수식을 입력하시오. (AVERAGE 함수 사용)"],
    ["[문제 2] D3 셀에 1~3월 판매량의 중간값을 구하는 수식을 입력하시오. (MEDIAN 함수 사용)"],
  ]);
  ws1["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, "기본통계");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["순위 및 특정 위치 값 구하기 (RANK.EQ / LARGE)"],
    ["이름", "점수", "결과"],
    ["홍길동", 85, ""],
    ["김철수", 95, ""],
    ["이영희", 70, "2위 점수"],
    ["", "", ""],
    [],
    ["[문제 1] C2 셀에 홍길동의 순위를 구하는 수식을 입력하시오. (RANK.EQ 함수, 높은 점수가 1등, 참조범위 절대 참조 사용)"],
    ["[문제 2] C5 셀에 점수 중 2번째로 높은 값을 구하는 수식을 입력하시오. (LARGE 함수 사용)"],
  ]);
  ws2["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, ws2, "순위");

  const ws3 = XLSX.utils.aoa_to_sheet([
    ["셀 개수 세기 (COUNT / COUNTA / COUNTBLANK)"],
    ["성명", "시험점수", "항목"],
    ["강감찬", 90, "응시자수"],
    ["이순신", "결시", ""],
    ["유관순", 80, ""],
    [],
    ["[문제] C3 셀에 시험점수 중 숫자(점수)가 입력된 셀의 개수를 구하는 수식을 입력하시오. (COUNT 함수 사용)"],
  ]);
  ws3["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws3, "셀개수");

  const ws4 = XLSX.utils.aoa_to_sheet([
    ["조건부 통계 함수 실습 (AVERAGEIF)"],
    ["성명", "직급", "급여", "대리 평균급여"],
    ["박과장", "과장", 4000000, ""],
    ["김대리", "대리", 3000000, ""],
    ["이사원", "대리", 2600000, ""],
    [],
    ["[문제] D2 셀에 '대리' 직급에 해당하는 급여의 평균을 구하는 수식을 입력하시오. (AVERAGEIF 함수 사용)"],
  ]);
  ws4["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws4, "조건부통계");
}

function generateLesson3(lesson) {
  const wb = XLSX.utils.book_new();
  appendLesson3(wb);
  XLSX.writeFile(wb, `컴활2급_${lesson.id}차시_${lesson.title}_실습.xlsx`);
}

function appendLesson4(wb) {
  const ws1 = XLSX.utils.aoa_to_sheet([
    ["도서코드", "도서명", "검색결과(도서명)"],
    ["A-101", "파이썬 기초", ""],
    ["B-102", "자바스크립트 완전정복", ""],
    ["C-103", "리액트 실무", ""],
    [],
    ["[문제] C2 셀에 VLOOKUP 함수를 사용하여 코드 'B-102'에 해당하는 도서명을 가져오는 수식을 입력하시오."],
    ["정답 수식: =VLOOKUP(\"B-102\",A2:B4,2,0)"],
  ]);
  ws1["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, "방향검색");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["사원번호", "이름", "결과항목"],
    ["E001", "홍길동", "이영희의 위치"],
    ["E002", "김철수", ""],
    ["E003", "이영희", ""],
    [],
    ["[문제] C3 셀에 MATCH 함수를 사용하여 '이영희' 사원이 B열에서 몇 번째 위치인지 구하는 수식을 입력하시오."],
    ["정답 수식: =MATCH(\"이영희\",B2:B4,0)"],
  ]);
  ws2["!cols"] = [{ wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, "위치찾기");

  const ws3 = XLSX.utils.aoa_to_sheet([
    ["도서ID", "도서코드", "재고량", "조회 결과 (ID)"],
    ["1001", "BK-88", 45, ""],
    ["1002", "BK-99", 12, ""],
    ["1003", "BK-77", 30, ""],
    [],
    ["[문제] D2 셀에 INDEX+MATCH 조합을 사용하여 코드 'BK-99'를 가진 도서의 ID를 구하는 수식을 입력하시오."],
    ["정답 수식: =INDEX(A2:A4,MATCH(\"BK-99\",B2:B4,0))"],
  ]);
  ws3["!cols"] = [{ wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, "조합활용");

  const ws4 = XLSX.utils.aoa_to_sheet([
    ["이름", "등급코드", "최종등급"],
    ["강감찬", 2, ""],
    ["이순신", 1, ""],
    ["유관순", 3, ""],
    [],
    ["[문제] C2 셀에 CHOOSE 함수를 사용하여 등급코드(B2)에 따라 1=최우수, 2=우수, 3=보통을 표시하는 수식을 입력하시오."],
    ["정답 수식: =CHOOSE(B2,\"최우수\",\"우수\",\"보통\")"],
  ]);
  ws4["!cols"] = [{ wch: 10 }, { wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws4, "값선택");
}

function generateLesson4(lesson) {
  const wb = XLSX.utils.book_new();
  appendLesson4(wb);
  XLSX.writeFile(wb, `컴활2급_${lesson.id}차시_${lesson.title}_실습.xlsx`);
}

// 누적 복습 통합문서 — 여러 차시의 실습 시트를 한 파일에 모은다.
// (실습 생성기가 갖춰진 차시만 포함. days.js의 REVIEW_ENABLED와 일치)
const REVIEW_APPENDERS = { 1: appendLesson1, 2: appendLesson2, 3: appendLesson3, 4: appendLesson4 };

export function generateReviewExcel(lessonIds, label = "") {
  const wb = XLSX.utils.book_new();
  lessonIds.forEach((id) => { if (REVIEW_APPENDERS[id]) REVIEW_APPENDERS[id](wb); });
  if (!wb.SheetNames || wb.SheetNames.length === 0) return false;
  XLSX.writeFile(wb, `컴활2급_누적복습${label ? `_${label}` : ""}.xlsx`);
  return true;
}
