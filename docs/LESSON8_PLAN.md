# 8차시 재작성 계획

대상: src/data/lessons/lesson-8.json, src/components/diagrams/Lesson8.jsx
기준: 2~7차시에서 반복되는 형태(아래 "다이어그램 유형 3가지"). 다이어그램의 문제와 실습은 계산작업 기출 문장 뼈대(docs 계산작업_유형.md)를 그대로 따르되 데이터·이름·값은 새로 만든다.
단계별로 진행하고, 각 단계 끝에서 diff를 보고하고 멈춘다. 승인 없이 다음 단계로 넘어가지 말고, 커밋·푸시하지 않는다.

## 개념 순서 (변경)

| 새 번호 | 내용 | 유형 | registry 키 |
|---|---|---|---|
| 1 | IF | B. 인수형 | /images/logic-if.svg |
| 2 | 중첩 IF | C. 단계형 | /images/logic-nested-if.svg |
| 3 | IF + AND | C. 단계형 | /images/logic-if-and.svg |
| 4 | IF + OR | C. 단계형 | /images/logic-if-or.svg |
| 5 | IFERROR | B. 인수형 | /images/logic-iferror.svg |

registry 키와 export 이름은 그대로 두고 JSON의 concepts 배열 순서만 바꾼다.

## 다이어그램 유형 3가지 (2~7차시에서 확인된 것)

| 유형 | 구조 | 쓰는 경우 | 본보기 |
|---|---|---|---|
| A. 카드형 | Row 안 Fixed(ExcelGrid) → Row 안 Fill(FuncCard) 여러 개 | 인수가 한 개 이하이거나 함수 여러 개를 나란히 소개할 때 | Lesson6 MathBasicDiagram, Lesson7 DatetimeBasicDiagram |
| B. 인수형 | ExamProblem → Row[ Fixed(TableCaption+ExcelGrid) / Fill(함수 박스 → 안내 문구 → ArgButtons → ExplainBoard) ] | 함수 하나의 인수를 하나씩 짚을 때. 버튼을 눌러야 새 정보(범위 강조·설명)가 나온다 | Lesson4 VlookupDiagram, Lesson5 DbSumDiagram, Lesson6 SumifDiagram |
| C. 단계형 | ExamProblem → Row[ Fixed(TableCaption+ExcelGrid) / Fill(단계 박스 2~3개, 버튼 없음) ] | 함수 두 개 이상을 순서대로 이을 때. 박스에 설명·수식이 다 있으므로 버튼을 두지 않는다 | Lesson4 IndexMatchDiagram, Lesson7 WeekdayDiagram·WorkdayDiagram |

박스 줄 구성은 세 유형 모두 같다: 함수명(18, bold) → SyntaxLine(size 14) → 설명(14) → 구분선 → 수식+결과(16, bold, 가운데).

## 공통 규칙 (CLAUDE.md "다이어그램(슬라이드) 컴포넌트 규칙" 그대로)

- shared.jsx의 Wrap, Title, Subtitle, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem, ArgButtons, SyntaxLine, rangeSides, ExplainBoard, Cell, FuncCard, StepBox(0단계에서 추가), C, FONT만 쓴다. Card, ArrowDown, ArrowRight, BottomBar, BLine은 쓰지 않는다.
- 가로 배치는 Row + Fixed/Fill만. display:'flex' 행을 직접 만들지 않는다(세로 스택의 flexDirection:'column'은 허용). width·marginLeft·margin:'0 auto'로 위치 잡지 않는다. 세로 블록 간격은 marginTop: 16 하나.
- 색은 C 객체만. '#071a0b', '#1e3a8a', '#0c2440' 같은 hex를 슬라이드 안에 쓰지 않는다. fontFamily: 'monospace' 쓰지 않는다.
- 본문 15px 이상, 보조 14px 이상. 13px 이하 쓰지 않는다.
- 함수 구문은 SyntaxLine(fn=…)으로만. 인수 이름을 손으로 적지 않는다.
- 예시 표는 ExcelGrid로 그려 열 문자·행 번호가 수식의 셀 주소와 맞게 한다.
- 인수 색: 논리 검사·값 = C.amberLight, 참일 때 = C.greenLight, 거짓일 때·오류일 때 = C.redLight. AND·OR 안의 논리1·논리2·논리3 = C.blueLight·C.purpleLight·C.orangeLight.
- 상태에 따라 바뀌는 영역은 가장 큰 상태 기준으로 자리를 미리 확보한다(ExplainBoard 방식).
- 표 데이터에는 경계값(>=의 등호가 걸리는 값)을 한 건 넣고, 설명에서 그 행을 짚는다.

## 0단계 — 단계 박스 공용화 + CLAUDE.md 보강

1. Lesson4.jsx IndexMatchDiagram의 boxBase·nameSt·descSt·formulaSt와 박스 마크업을 그대로 옮겨 shared.jsx에 `StepBox` 컴포넌트를 만든다.
   props: `title`, `color`(제목·구문 색), `bg`, `border`, `fn`(SyntaxLine 함수명), `syntaxColors`(선택), `desc`(문자열 또는 노드, whiteSpace pre-line), `children`(수식 줄). 테두리는 2px 고정.
   Lesson4·Lesson7은 이번에 건드리지 않는다(나중에 StepBox로 교체). 변경 파일은 shared.jsx 하나여야 한다.
2. CLAUDE.md "다이어그램(슬라이드) 컴포넌트 규칙"의 "### 구조" 앞에 "### 유형" 절을 추가하고, 위 "다이어그램 유형 3가지" 표와 "박스 줄 구성" 한 줄을 그대로 넣는다. 다른 항목은 건드리지 않는다.

diff 보고 후 멈춘다.

## 1단계 — lesson-8.json

### 1-1. 순서 변경
concepts 배열을 [IF, 중첩 IF, IF+AND, IF+OR, IFERROR] 순으로 재배열하고 heading 번호를 1~5로 다시 매긴다. 각 concept의 image url·alt는 그 개념을 따라 함께 움직인다. practiceAnswers도 같은 순서로 재배열한다. quiz는 순서를 건드리지 않는다.

### 1-2. 인수 이름 통일
functionSyntax.js FUNCTION_ARGS와 글자 그대로 맞춘다. 아래 외에는 바꾸지 않는다.
- 개념1 bullets 첫 묶음 4개 교체:
  - "**=IF(논리 검사, 참일 때, 거짓일 때)**"
  - "**논리 검사**: 비교 연산자(>=, <=, >, <, =, <>)로 참·거짓을 판정하는 식. WEEKDAY(B2,2)<=5처럼 함수 결과를 비교해도 됩니다."
  - "**참일 때**: 논리 검사가 TRUE일 때 표시할 값"
  - "**거짓일 때**: 논리 검사가 FALSE일 때 표시할 값"
- 개념3(AND) bullets 첫 항목: "**=IF(AND(논리1, 논리2, ...), 참일 때, 거짓일 때)**"
- 개념4(OR) bullets 첫 항목: "**=IF(OR(논리1, 논리2, ...), 참일 때, 거짓일 때)**"
- 개념5 bullets 첫 묶음 3개 교체:
  - "**=IFERROR(값, 오류일 때)**"
  - "**값**: 먼저 계산할 수식. 오류가 없으면 이 결과가 그대로 표시됩니다."
  - "**오류일 때**: 값에서 오류가 나면 대신 표시할 값"
- 개념5 "처리 가능한 에러 종류" 아래에 heading "시험 팁 — IFERROR는 다른 함수를 감싸서 나온다"와 bullets 2개 추가:
  - "순위·찾기 함수와 묶여 나옵니다. 빈 셀의 순위는 \"실격\", 참조표에 없는 코드는 \"코드오류\"처럼 오류일 때 값이 문제에 적혀 있습니다."
  - "**=IFERROR(RANK.EQ(...), \"실격\")**, **=IFERROR(HLOOKUP(...), \"코드오류\")**"
- 개념2(중첩 IF) "수식 예시" heading과 bullets 4개는 삭제한다(다이어그램이 대신한다). "구조 설계 원칙"은 그대로.

### 1-3. 실습 교체 (5개 모두)
실습은 다이어그램과 같은 기출 뼈대에 다른 데이터를 넣는다. instruction은 시험 지시문 형식(\n으로 줄 나눔). 정답 셀은 한 개.

개념1 IF
- instruction: "[표1]에서 예약일[B2]이 월요일부터 금요일이면 \"평일요금\", 그 외에는 \"주말요금\"을 요금구분[C2]에 표시하시오.\n▶ 요일 계산 시 월요일이 1인 유형으로 지정\n▶ IF, WEEKDAY 함수 사용"
- cols A~C. 1행: 예약자 | 예약일 | 요금구분. 2행: 김서연 | 2026-07-04 | C2 answer "=IF(WEEKDAY(B2,2)<=5,\"평일요금\",\"주말요금\")" result "주말요금". 3행: 박지훈 | 2026-07-07 | "" (editable false).
- practiceAnswers: { sheet: "단일조건", cell: "C2", formula: 위 answer }

개념2 중첩 IF (다이어그램은 숫자 구간, 실습은 문자 분기 — 기출의 두 갈래를 모두 다룬다)
- instruction: "[표1]에서 사번[A2]의 오른쪽 한 글자가 1이면 \"개발부\", 2이면 \"기획부\", 3이면 \"영업부\"를 부서[C2]에 표시하시오.\n▶ IF, RIGHT 함수 사용"
- cols A~C. 1행: 사번 | 사원명 | 부서. 2행: EMP-2 | 김서연 | C2 answer "=IF(RIGHT(A2,1)=\"1\",\"개발부\",IF(RIGHT(A2,1)=\"2\",\"기획부\",\"영업부\"))" result "기획부". 3행: EMP-3 | 박지훈 | "" (editable false).
- practiceAnswers: { sheet: "중첩IF", cell: "C2", formula: 위 answer }

개념3 IF+AND
- instruction: "[표1]에서 필기[B2], 실기[C2]가 각각 40 이상이면서 평균이 60 이상이면 \"합격\", 그 외에는 \"불합격\"을 결과[D2]에 표시하시오.\n▶ IF, AVERAGE, AND 함수 사용"
- cols A~D. 1행: 응시자 | 필기 | 실기 | 결과. 2행: 김서연 | 38 | 95 | D2 answer "=IF(AND(B2>=40,C2>=40,AVERAGE(B2:C2)>=60),\"합격\",\"불합격\")" result "불합격". 3행: 박지훈 | 70 | 65 | "".
- practiceAnswers: { sheet: "AND조건", cell: "D2", formula: 위 answer }

개념4 IF+OR
- instruction: "[표1]에서 방문횟수[B2:B4]가 30 이상이거나 결제금액[C2:C4]이 결제금액의 평균보다 크면 \"단골\", 그렇지 않으면 \"일반\"을 구분[D2]에 표시하시오.\n▶ AVERAGE, IF, OR 함수 사용"
- cols A~D. 1행: 고객명 | 방문횟수 | 결제금액 | 구분. 2행: 김서연 | 12 | 85000 | D2 answer "=IF(OR(B2>=30,C2>AVERAGE($C$2:$C$4)),\"단골\",\"일반\")" result "단골". 3행: 박지훈 | 35 | 40000 | "". 4행: 이수민 | 20 | 60000 | "". (평균 61,667 → 85,000이 평균보다 크다.)
- practiceAnswers: { sheet: "OR조건", cell: "D2", formula: 위 answer }

개념5 IFERROR
- instruction: "[표1]에서 기록[B2:B4]에 대한 순위를 구하여 순위[C3]에 표시하시오.\n▶ 순위는 기록이 가장 빠른 것이 1위\n▶ 기록이 비어 있는 경우 \"실격\"\n▶ IFERROR, RANK.EQ 함수 사용"
- cols A~C. 1행: 선수명 | 기록(초) | 순위. 2행: 김서연 | 14.2 | "" (editable false). 3행: 박지훈 | "" | C3 answer "=IFERROR(RANK.EQ(B3,$B$2:$B$4,1),\"실격\")" result "실격". 4행: 이수민 | 13.8 | "".
- practiceAnswers: { sheet: "에러처리", cell: "C3", formula: 위 answer }

### 1-4. quiz
- id 7의 question이 따옴표가 어긋나 있다. 아래로 교체. options·answer·explanation은 그대로.
  "수식 =IF(A1<>\"\", \"입력됨\", \"비어있음\")에서 <> 연산자와 A1<>\"\"의 뜻으로 올바른 것은?"
- 다른 quiz, content 필드는 건드리지 않는다.

### 1-5. 확인
- JSON 파싱, 구문 검사 스크립트(있으면).
- 미니 엑셀 엔진으로 실습 정답 5개를 실제로 계산해 result와 일치하는지 보고한다. 특히 개념5: B3가 빈 셀일 때 RANK.EQ가 오류를 내고 IFERROR가 "실격"을 돌려주는지. 빈 셀에서 오류가 아니라 숫자가 나오면 수정하지 말고 보고하고 멈춘다.
- 개념2 실습: RIGHT 결과는 문자이므로 "1"처럼 따옴표로 비교해야 한다. 엔진에서 RIGHT(A2,1)=1(숫자 비교)이 FALSE가 되고 RIGHT(A2,1)="2"가 TRUE가 되는지 확인해 보고한다.

diff 보고 후 멈춘다.

## 2단계 — Lesson8.jsx 다섯 다이어그램 다시 작성

export 이름 5개(IfDiagram, NestedIfDiagram, IfAndDiagram, IfOrDiagram, IfErrorDiagram)와 registry 키는 그대로. 파일 안 정의 순서는 새 개념 순서(1→5)로 맞춘다. import는 useState(개념1·5만)와 공통 규칙에 적힌 shared 컴포넌트만.

### 2-1. IfDiagram (개념1, B. 인수형) — 기출 뼈대: IF, WEEKDAY

- Title: 조건에 따라 두 값 중 하나 표시하기: IF
- ExamProblem notes `['요일 계산 시 월요일이 1인 유형으로 지정', 'IF, WEEKDAY 함수 사용']`:
  [표1]에서 `<b amberLight>`응시일[B2:B5]`</b>`이 월요일부터 금요일이면 `<b greenLight>`"평일"`</b>`, 그 외에는 `<b redLight>`"주말"`</b>`을 요일구분[C2:C5]에 표시하시오.
- data = `[['응시자','응시일','요일구분'],['김민지','2026-06-22','평일'],['이도현','2026-06-27','주말'],['박서준','2026-06-26','평일'],['최유나','2026-06-28','주말']]`. TableCaption "[표1] 자격시험 응시 명단". firstColW 72, minColW 96. (6/22 월, 6/26 금 = 경계, 6/27 토, 6/28 일)
- tabs: `{ '논리 검사', C.amberLight }`, `{ '참일 때', C.greenLight }`, `{ '거짓일 때', C.redLight }`.
- dataSt: 머리글 `{ bold, color: C.blueLight, bg: C.blueCard }`.
  - '논리 검사' → rangeSides로 B2:B5(ci 1, ri 1~4) amberLight 테두리.
  - '참일 때' → C열 중 '평일'인 행(ri 1, 3) bg C.greenBg, color C.greenLight.
  - '거짓일 때' → C열 중 '주말'인 행(ri 2, 4) bg C.redBg, color C.redLight.
  - C열 ri 1~4는 항상 bold.
- 함수 박스(bg C.blueCard, border 2px C.blueDim): "IF" → SyntaxLine(fn="IF", colors [amberLight, greenLight, redLight]) → 설명 "논리 검사가 TRUE면 참일 때 값을, FALSE면 거짓일 때 값을 표시합니다." → 구분선 → 수식(16 bold): =IF(`<amberLight>`WEEKDAY(B2, 2)<=5`</amberLight>`, `<greenLight>`"평일"`</greenLight>`, `<redLight>`"주말"`</redLight>`) → 평일 (greenLight)
- 안내 문구 "버튼을 눌러 세 개의 인수를 하나씩 확인하세요".
- explain:
  - '논리 검사': 'WEEKDAY(B2, 2)로 요일 번호를 구해 5 이하인지 비교합니다. 월요일이 1이므로 금요일(5)까지 TRUE, 토(6)·일(7)은 FALSE입니다.'
  - '참일 때': '논리 검사가 TRUE인 행에 표시할 값입니다. 문자는 큰따옴표로 감쌉니다.'
  - '거짓일 때': 'FALSE인 행에 표시할 값입니다. 공백을 표시하라는 문제면 큰따옴표 두 개 ""를 씁니다.'

### 2-2. NestedIfDiagram (개념2, C. 단계형) — 기출 뼈대: IF, YEAR

- Title: 결과가 셋 이상일 때: 중첩 IF
- ExamProblem notes `['가입기간 = 기준일의 연도 − 가입일의 연도', 'IF, YEAR 함수 사용']`:
  [표1]에서 기준일[E2]을 기준으로 `<b amberLight>`가입일[B2:B6]`</b>`의 가입기간이 10년 이상이면 "★", 10년 미만 5년 이상이면 "☆", 5년 미만이면 공백을 등급[C2:C6]에 표시하시오.
- data = `[['회원명','가입일','등급','','기준일'],['김민지','2014-03-05','★','','2026-09-10'],['이도현','2019-11-20','☆','',''],['박서준','2023-06-01','','',''],['최유나','2016-09-10','★','',''],['정하늘','2021-01-15','☆','','']]`. TableCaption "[표1] 회원 가입 현황". firstColW 72, minColW 96. D열은 빈 칸, E1·E2만 값. (2016 → 10년 경계 ★, 2021 → 5년 경계 ☆)
- dataSt(정적): 머리글(ri 0, ci 0~2와 ci 4) blueCard. B2:B6 rangeSides C.amber. E2 bg C.blueCard bold. C열 ri 1~5: '★' color C.greenLight, '☆' color C.blueLight, '' 없음. 모두 bold. D열은 테두리만 기본.
- Fill(min 360, max 500, gap 12) 안 StepBox 2개:
  - 1단계 (bg C.greenDark, border C.green, color C.greenLight): 제목 "1단계 · 첫 번째 IF — 가장 높은 기준", SyntaxLine(fn="IF", colors [amberLight, greenLight, redLight]), 설명 "높은 기준부터 검사합니다. 가입기간이 10 이상이면 여기서 ★로 끝나고, 아니면 거짓일 때 자리로 넘어갑니다.", 수식 =IF(`<amberLight>`YEAR($E$2)-YEAR(B2)>=10`</amberLight>`, `<greenLight>`"★"`</greenLight>`, `<redLight>`거짓일 때`</redLight>`)
  - 2단계 (bg C.blueCard, border C.blue, color C.blueLight): 제목 "2단계 · 거짓일 때 자리에 두 번째 IF", SyntaxLine(fn="IF", colors [amberLight, greenLight, redLight]), 설명 "첫 번째 IF의 거짓일 때 자리에 IF를 하나 더 넣습니다. 여기 온 값은 이미 10 미만이므로 5 이상인지만 검사하면 됩니다. 닫는 괄호는 IF 개수만큼 두 개입니다.", 수식(두 줄) =IF(YEAR($E$2)-YEAR(B2)>=10, "★", `<blueLight>`IF(YEAR($E$2)-YEAR(B2)>=5, "☆", "")`</blueLight>`) / = "★"
- Row 아래(marginTop 16) 판정 띠: Row 안 Fill(max 500), TableCaption(C.textMuted) "가입기간에 따른 판정", Cell 격자 'repeat(3, 1fr)' 한 줄. 각 칸 두 줄(div로 나눠 가운데 정렬):
  - "10년 이상\n★" (C.greenDark / C.green / C.greenLight bold), "5년 이상 10년 미만\n☆" (C.blueCard / C.blue / C.blueLight bold), "5년 미만\n공백" (C.bgDark / C.border / C.textMuted bold)

### 2-3. IfAndDiagram (개념3, C. 단계형) — 기출 뼈대: IF, AVERAGE, AND

- Title: 조건을 모두 만족할 때: IF + AND
- ExamProblem notes `['IF, AVERAGE, AND 함수 사용']`:
  [표1]에서 `<b blueLight>`1과목[B2:B6]`</b>`, `<b purpleLight>`2과목[C2:C6]`</b>`이 각각 40 이상이면서 `<b orangeLight>`평균`</b>`이 60 이상이면 "합격"을, 그 외에는 "불합격"을 합격여부[D2:D6]에 표시하시오.
- data = `[['응시자','1과목','2과목','합격여부'],['김민지',70,80,'합격'],['이도현',35,95,'불합격'],['박서준',55,60,'불합격'],['최유나',40,80,'합격'],['정하늘',90,30,'불합격']]`. TableCaption "[표1] 자격시험 결과". firstColW 72, minColW 80. (이도현: 평균 65지만 35<40 → 불합격. 박서준: 평균 57.5. 최유나: 40·평균 60 모두 경계 → 합격.)
- dataSt(정적): 머리글 blueCard. B2:B6 rangeSides C.blue, C2:C6 rangeSides C.purple. D열 ri 1~5: '합격' color C.greenLight, '불합격' color C.redLight, bold.
- Fill(min 360, max 500, gap 12) 안 StepBox 2개:
  - 1단계 (bg C.blueCard, border C.blue, color C.blueLight): 제목 "1단계 · AND — 모두 TRUE인지", SyntaxLine(fn="AND", colors [blueLight, purpleLight, orangeLight]), 설명 "나열한 조건이 전부 TRUE일 때만 TRUE입니다. 하나라도 FALSE면 FALSE입니다. 조건은 셋 이상 넣을 수 있습니다.", 수식(두 줄) =AND(`<blueLight>`B2>=40`</blueLight>`, `<purpleLight>`C2>=40`</purpleLight>`, `<orangeLight>`AVERAGE(B2:C2)>=60`</orangeLight>`) / = TRUE
  - 2단계 (bg C.greenDark, border C.green, color C.greenLight): 제목 "2단계 · IF — 결과 표시", SyntaxLine(fn="IF", colors [amberLight, greenLight, redLight]), 설명 "IF의 논리 검사 자리에 1단계 AND 수식을 그대로 넣습니다.", 수식(두 줄) =IF(`<amberLight>`AND(B2>=40, C2>=40, AVERAGE(B2:C2)>=60)`</amberLight>`, `<greenLight>`"합격"`</greenLight>`, `<redLight>`"불합격"`</redLight>`) / = "합격"
- Row 아래(marginTop 16) AND 진리표: Row 안 Fill(max 500), TableCaption(C.textMuted) "AND — 모두 TRUE일 때만 TRUE", Cell 격자 'repeat(3, 1fr)':
  - 머리글: 논리1 | 논리2 | AND 결과 (C.blueCard / C.blueDim / C.blueLight bold 15)
  - TRUE TRUE → TRUE (bg C.greenDark, border C.green, color C.greenLight, 결과 칸 bold)
  - TRUE FALSE → FALSE, FALSE TRUE → FALSE, FALSE FALSE → FALSE (bg C.redDark, border C.red, color C.redLight, 결과 칸 bold)

### 2-4. IfOrDiagram (개념4, C. 단계형) — 기출 뼈대: AVERAGE, IF, OR

- Title: 조건 중 하나만 만족해도: IF + OR
- ExamProblem notes `['AVERAGE, IF, OR 함수 사용']`:
  [표1]에서 `<b blueLight>`구입횟수[B2:B6]`</b>`가 150 이상이거나 `<b purpleLight>`구입총액[C2:C6]`</b>`이 구입총액의 평균보다 크면 "VIP", 그렇지 않으면 "일반"을 등급[D2:D6]에 표시하시오.
- data = `[['회원명','구입횟수','구입총액','등급'],['김민지',160,'820,000','VIP'],['이도현',90,'1,250,000','VIP'],['박서준',40,'300,000','일반'],['최유나',150,'500,000','VIP'],['정하늘',120,'700,000','일반']]`. TableCaption "[표1] 회원 구매 현황". firstColW 72, minColW 90. (평균 714,000. 김민지 횟수로 VIP, 이도현 총액으로 VIP, 최유나 150 경계로 VIP, 정하늘 둘 다 미달.)
- dataSt(정적): 머리글 blueCard. B2:B6 rangeSides C.blue, C2:C6 rangeSides C.purple. D열 ri 1~5: 'VIP' color C.greenLight, '일반' color C.textMuted, bold.
- Fill(min 360, max 500, gap 12) 안 StepBox 2개:
  - 1단계 (bg C.blueCard, border C.blue, color C.blueLight): 제목 "1단계 · OR — 하나라도 TRUE인지", SyntaxLine(fn="OR", colors [blueLight, purpleLight]), 설명 "나열한 조건 중 하나라도 TRUE면 TRUE입니다. 전부 FALSE일 때만 FALSE입니다. 평균 범위는 아래로 채워도 고정되도록 $를 붙입니다.", 수식(두 줄) =OR(`<blueLight>`B2>=150`</blueLight>`, `<purpleLight>`C2>AVERAGE($C$2:$C$6)`</purpleLight>`) / = TRUE
  - 2단계 (bg C.greenDark, border C.green, color C.greenLight): 제목 "2단계 · IF — 결과 표시", SyntaxLine(fn="IF", colors [amberLight, greenLight, redLight]), 설명 "IF의 논리 검사 자리에 1단계 OR 수식을 그대로 넣습니다.", 수식(두 줄) =IF(`<amberLight>`OR(B2>=150, C2>AVERAGE($C$2:$C$6))`</amberLight>`, `<greenLight>`"VIP"`</greenLight>`, `<redLight>`"일반"`</redLight>`) / = "VIP"
- Row 아래(marginTop 16) OR 진리표: 2-3과 같은 구조, TableCaption "OR — 하나라도 TRUE면 TRUE". TRUE TRUE / TRUE FALSE / FALSE TRUE → TRUE(초록), FALSE FALSE → FALSE(빨강).

### 2-5. IfErrorDiagram (개념5, B. 인수형) — 기출 뼈대: IFERROR, RANK.EQ

- Title: 오류가 나면 다른 값으로: IFERROR
- ExamProblem notes `['순위는 기록이 가장 빠른 것이 1위', '기록이 비어 있는 경우 "실격"', 'IFERROR, RANK.EQ 함수 사용']`:
  [표1]에서 `<b amberLight>`기록[B2:B6]`</b>`에 대한 순위를 구하여 순위[C2:C6]에 표시하시오.
- data = `[['선수명','기록(초)','순위'],['김민지',12.4,2],['이도현','','실격'],['박서준',11.9,1],['최유나',13.1,3],['정하늘',13.5,4]]`. TableCaption "[표1] 100m 기록". firstColW 72, minColW 84.
- tabs: `{ '값', C.amberLight }`, `{ '오류일 때', C.redLight }`.
- dataSt: 머리글 blueCard. '값' → rangeSides로 B2:B6(ci 1, ri 1~5) amberLight 테두리. '오류일 때' → ri 2(이도현) B·C 칸 bg C.redBg, color C.redLight. C열 ri 1~5 항상 bold.
- 함수 박스(bg C.blueCard, border 2px C.blueDim): "IFERROR" → SyntaxLine(fn="IFERROR", colors [amberLight, redLight]) → 설명 "값을 먼저 계산합니다. 오류가 아니면 그 결과를, 오류면 오류일 때 값을 표시합니다." → 구분선 → 수식(16 bold): =IFERROR(`<amberLight>`RANK.EQ(B2, $B$2:$B$6, 1)`</amberLight>`, `<redLight>`"실격"`</redLight>`) → 2 (greenLight)
  그 아래 한 줄(15, C.textMuted): 빈 셀 B3에서 RANK.EQ만 쓰면 → #VALUE!
- 안내 문구 "버튼을 눌러 두 개의 인수를 하나씩 확인하세요".
- explain:
  - '값': '먼저 계산할 수식입니다. 기록이 가장 빠른 것이 1위이므로 RANK.EQ의 정렬 인수는 1(오름차순)입니다. 기록이 있는 행은 순위가 그대로 나옵니다.'
  - '오류일 때': '이도현처럼 기록이 빈 셀이면 RANK.EQ가 오류를 내고, 그 자리에 "실격"이 대신 표시됩니다. #N/A, #DIV/0! 등 어떤 오류든 같습니다.'

diff 보고 후 멈춘다.

## 3단계 — 검증

- npm run build 통과. 구문 검사 스크립트가 있으면 통과.
- Lesson2~7.jsx, lesson-2~7.json, registry.js는 한 줄도 바뀌지 않았음을 git diff --stat으로 보고한다. shared.jsx는 0단계 StepBox 추가만, CLAUDE.md는 0단계 유형 절 추가만 있어야 한다.
- grep -n "#[0-9a-fA-F]\{6\}\|monospace\|fontSize: 1[0-3]\b\|marginLeft\|width: [0-9]" src/components/diagrams/Lesson8.jsx 결과를 출력한다. display: 'flex'는 flexDirection: 'column'인 것만 허용.
- 폭 1400px에서 각 Row 좌우 여백이 같고, 900px에서 겹치는 요소가 없는지 확인한다.
- 개념1·5에서 버튼을 눌러도 표·함수 박스·칠판 높이가 변하지 않는지 확인한다.
- 8차시에서 바꾼 파일별 변경 요약과 줄 번호를 표로 출력한다.

## 참고 (확인된 값)

- 2026-06-22 월, 06-26 금, 06-27 토, 06-28 일, 07-04 토, 07-07 화
- 개념2 가입기간: 2014→12 ★, 2019→7 ☆, 2023→3 "", 2016→10 ★, 2021→5 ☆. 실습 EMP-2 → 오른쪽 글자 "2" → 기획부.
- 개념3: (70,80) 합격, (35,95) 불합격, (55,60) 불합격, (40,80) 합격, (90,30) 불합격. 실습 (38,95) 불합격.
- 개념4 평균 714,000. 실습 평균 61,667 → 85,000 단골.
- 개념5 순위: 11.9→1, 12.4→2, 13.1→3, 13.5→4, 빈 셀→실격. 실습 C3 → 실격.
