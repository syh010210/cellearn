# 7차시 재작성 계획

대상: src/data/lessons/lesson-7.json, src/components/diagrams/Lesson7.jsx
기준: 5·6차시와 같은 형식. 퀴즈 8문항 추가는 이미 커밋됨(309c421).
수업 내용(개념 텍스트, 실습, 퀴즈)은 1단계에 적힌 것 외에는 바꾸지 않는다.
단계별로 진행하고, 각 단계 끝에서 diff를 보고하고 멈춘다. 승인 없이 다음 단계로 넘어가지 말고, 커밋·푸시하지 않는다.

## 공통 규칙 (CLAUDE.md "다이어그램(슬라이드) 컴포넌트 규칙" 그대로)

- shared.jsx의 Wrap, Title, Subtitle, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem, ArgButtons, SyntaxLine, rangeSides, ExplainBoard, Cell, C, FONT만 쓴다. Card, ArrowDown, BottomBar, BLine은 이번 차시에서 쓰지 않는다.
- 가로 배치는 Row + Fixed/Fill만. display:'flex' 행을 직접 만들지 않는다. width·marginLeft·margin:'0 auto'로 위치 잡지 않는다. 세로 블록 간격은 marginTop: 16 하나.
- 색은 C 객체만. '#071a0b', '#251005' 같은 hex를 슬라이드 안에 쓰지 않는다. fontFamily: 'monospace' 쓰지 않는다.
- 본문 15px 이상, 보조 14px 이상. 11·12·13px 쓰지 않는다.
- 함수 구문은 SyntaxLine(fn=…)으로만 표시한다. 인수 이름을 손으로 적지 않는다.
- 예시 표는 ExcelGrid로 그려 열 문자·행 번호가 수식의 셀 주소와 맞게 한다.
- 인터랙티브 다이어그램(개념3·4)은 Lesson6.jsx SumifDiagram 구조를 그대로 따른다: ExamProblem(notes) → Row → Fixed(TableCaption + ExcelGrid) / Fill(min 360, max 500: 함수 박스[함수명 18 → SyntaxLine(colors) → 설명 14 → 구분선 → 수식+결과 16] → 안내 문구 → ArgButtons → ExplainBoard).
- 인수 색은 첫 인수 blueLight, 둘째 greenLight, 셋째 amberLight.
- 카드 색 묶음(bg / border / color / valColor)은 Lesson6 MathBasicDiagram과 같다:
  - blue = C.blueCard / C.blueDim / C.blue / C.blueLight
  - purple = C.purpleCard / C.purple / C.purpleLight / C.purpleLight
  - green = C.greenDark / C.green / C.greenLight / C.greenLight
  - amber = C.amberBg / C.amber / C.amber / C.amberLight
  - orange = C.orangeBg / C.orange / C.orange / C.orangeLight

## 0단계 — 카드 컴포넌트 공용화

Lesson6.jsx의 MathCard를 shared.jsx로 옮겨 FuncCard라는 이름으로 export하고, Lesson6.jsx는 import해서 쓰도록 바꾼다(코드 본문·props 불변, Lesson6 화면 불변). Lesson3.jsx에 같은 이름의 로컬 컴포넌트가 있어도 그 파일은 건드리지 않는다. 변경 파일은 shared.jsx, Lesson6.jsx 두 개뿐이어야 한다.

diff 보고 후 멈춘다.

## 1단계 — lesson-7.json 인수 이름 통일

functionSyntax.js의 FUNCTION_ARGS 값과 글자 그대로 맞춘다. 아래 항목 외에는 한 글자도 바꾸지 않는다.

1. 개념2 bullets: "**DATE(연, 월, 일)**" → "**DATE(연도, 월, 일)**"
2. 개념3
   - text: "두 번째 인수(옵션)로" → "두 번째 인수(반환 유형)로"
   - heading "옵션 1 vs 옵션 2" → "반환 유형 1 vs 반환 유형 2"
   - bullets: "**옵션 1 (또는 생략)**" → "**반환 유형 1 (또는 생략)**", "**옵션 2**" → "**반환 유형 2**", "월요일 시작(옵션 2)" → "월요일 시작(반환 유형 2)", "옵션 2 기준:" → "반환 유형 2 기준:"
   - practice instruction: "월요일이 1이 되는 '옵션 2'를" → "월요일이 1이 되는 반환 유형 '2'를". rows 머리글 "요일번호(옵션2)" → "요일번호(반환유형2)"
   - image alt: "WEEKDAY 옵션 1(일요일=1)과 옵션 2(월요일=1) 비교표" → "WEEKDAY 반환 유형 1(일요일=1)과 2(월요일=1) 비교표"
3. 개념4 bullets 첫 묶음 4개를 아래로 교체:
   - "**=WORKDAY(시작 날짜, 일수, [휴일 범위])**"
   - "**시작 날짜**: 일정이 시작되는 날짜. 이 날은 세지 않고 다음 날부터 센다."
   - "**일수**: 주말 제외 순수 근무일 수 (음수 입력 시 이전 날짜 계산)"
   - "**[휴일 범위]**: 주중 공휴일 날짜가 입력된 셀 범위 (선택 사항, 시험에 거의 나오지 않음)"
4. quiz, practiceAnswers, content 필드는 건드리지 않는다.

JSON 파싱과 구문 검사 스크립트(있으면)를 돌린 뒤 diff 보고 후 멈춘다.

## 2단계 — Lesson7.jsx 네 다이어그램 다시 작성

registry.js의 키 4개('/images/datetime-basic.svg', '/images/datetime-compose.svg', '/images/weekday-func.svg', '/images/workday-func.svg')와 export 이름 4개는 그대로 둔다. import는 useState와 공통 규칙에 적힌 shared 컴포넌트만.

### 2-1. DatetimeBasicDiagram (개념1, 정적 카드형)

- Title: 현재 날짜와 날짜 단위 추출: TODAY · NOW · YEAR · MONTH · DAY
- Row 안 Fixed 하나: TableCaption(C.blueLight) "[표1] 배포 일지", ExcelGrid data `[['서버명','배포일자'],['메인 DB','2026-06-27']]`, startRow 1, 머리글 행 `{ bold, color: C.blueLight, bg: C.blueCard }`, minColW 100.
- 그 아래 Row(gap 12, marginTop 16)에 Fill(min 150) 5개, FuncCard:
  - TODAY — 오늘 날짜(인수 없음) — =TODAY() — = 오늘 날짜 (amber)
  - NOW — 오늘 날짜와 현재 시각(인수 없음) — =NOW() — = 오늘 날짜 + 시각 (orange)
  - YEAR — 연도만 추출 — =YEAR(B2) — = 2026 (blue)
  - MONTH — 월(1~12)만 추출 — =MONTH(B2) — = 6 (purple)
  - DAY — 일(1~31)만 추출 — =DAY(B2) — = 27 (green)
- BottomBar 없음. "괄호를 반드시 붙인다"는 JSON bullets에 이미 있으므로 다이어그램에 다시 적지 않는다.

### 2-2. DatetimeComposeDiagram (개념2, 정적 카드형)

- Title: 시간 분해와 날짜 · 시간 조합: HOUR · MINUTE · SECOND · DATE · TIME
- Subtitle: 분해(HOUR · MINUTE · SECOND) ↔ 조합(DATE · TIME)
- Row 안 Fixed 하나: TableCaption "[표1] 로그온 기록", ExcelGrid data `[['연도','월','일','시','분','초','기록시각'],[2026,6,15,14,35,9,'14:35:09']]`, 머리글 행 스타일은 2-1과 같음, minColW 56, firstColW 60.
- 그 아래 Row(gap 12, marginTop 16)에 Fill(min 150) 5개, FuncCard:
  - HOUR — 시(0~23)만 추출 — =HOUR(G2) — = 14 (blue)
  - MINUTE — 분(0~59)만 추출 — =MINUTE(G2) — = 35 (purple)
  - SECOND — 초(0~59)만 추출 — =SECOND(G2) — = 9 (green)
  - DATE — 연도·월·일 → 날짜 — =DATE(A2, B2, C2) — = 2026-06-15 (amber)
  - TIME — 시·분·초 → 시간 — =TIME(D2, E2, F2) — = 14:35:09 (orange)

### 2-3. WeekdayDiagram (개념3, 인터랙티브, SumifDiagram 구조)

- Title: 날짜의 요일 번호 구하기: WEEKDAY
- ExamProblem notes `['WEEKDAY, CHOOSE 함수 사용', '월요일이 1이 되도록 반환 유형 지정']`:
  [표1]의 `<b color blueLight>`마감일자[B2:B5]`</b>`의 요일을 [C2:C5] 영역에 "월"~"일"로 표시하시오.
- data = `[['작업명','마감일자','요일'],['UI 디자인','2026-06-22','월'],['API 연동','2026-06-24','수'],['QA 테스트','2026-06-27','토'],['배포','2026-06-28','일']]`. TableCaption "[표1] 스프린트 마감일". minColW 78, firstColW 90.
- tabs: `{ '날짜', C.blueLight }`, `{ '반환 유형', C.greenLight }`.
- dataSt: '날짜' 활성 시 rangeSides로 B2:B5(ri 1~4, ci 1) 감싸기. 머리글 행은 `{ bold, color: C.blueLight, bg: C.blueCard }`. C열(ci 2) ri 1~4는 항상 bold. '반환 유형' 활성 시 표 강조 없음(아래 비교표에서 강조).
- 함수 박스: 함수명 "WEEKDAY" → SyntaxLine(fn="WEEKDAY", colors [C.blueLight, C.greenLight]) → 설명 "날짜의 요일을 1~7 숫자로 돌려줍니다. 반환 유형이 어느 요일을 1로 셀지 정합니다." → 구분선 → 수식 영역(minHeight 104):
  - 첫 줄(C.textMuted, 15, 400): =WEEKDAY(B2, 2) → 1
  - 둘째 줄(16 bold, SumifsDiagram처럼 nowrap 2줄): =CHOOSE(`<blueLight>`WEEKDAY(B2, 2)`</blueLight>`, "월","화","수","목","금","토","일") / → 월 (greenLight)
- 안내 문구 "버튼을 눌러 두 개의 인수를 하나씩 확인하세요".
- explain:
  - '날짜': '요일을 알고 싶은 날짜 셀입니다. [B2] 하나만 적고 아래로 채웁니다.'
  - '반환 유형': '1 또는 생략 = 일요일부터 1, 2 = 월요일부터 1.\nCHOOSE에 "월"부터 나열하려면 2를 써야 숫자와 요일이 맞습니다.'
- Row 아래(marginTop 16) 반환 유형 비교표: MathRoundDiagram의 Cell 격자 방식, gridTemplateColumns 'auto repeat(7, 1fr)'.
  - 머리글 행: 반환 유형 | 월 | 화 | 수 | 목 | 금 | 토 | 일 (C.blueCard / C.blueDim / C.blueLight bold 15)
  - 행 "1 (생략)": 2 3 4 5 6 7 1 (C.bgDark, C.text 15)
  - 행 "2": 1 2 3 4 5 6 7 — active === '반환 유형'이면 이 행 전체 bg C.amberBg, border C.amber, color C.amber bold. 아니면 다른 행과 같음. 크기 변화 없이 색만 바뀌어야 한다.
  - 표 위 TableCaption(C.textMuted) "반환 유형별 요일 번호".

### 2-4. WorkdayDiagram (개념4, 인터랙티브, SumifDiagram 구조)

공휴일은 다루지 않는다. 휴일 범위 열·버튼을 만들지 않는다.

- Title: 주말을 뺀 완료일 구하기: WORKDAY
- ExamProblem notes `['WORKDAY 함수 사용', '주말(토 · 일)은 근무일에서 제외']`:
  [표1]의 `<b blueLight>`개발시작일[B2:B4]`</b>`에서 `<b greenLight>`소요일수[C2:C4]`</b>`만큼 지난 완료예정일을 [D2:D4] 영역에 계산하시오.
- data = `[['프로젝트명','개발시작일','소요일수','완료예정일'],['API 연동','2026-06-22',5,'2026-06-29'],['UI 디자인','2026-06-23',3,'2026-06-26'],['QA 테스트','2026-06-25',2,'2026-06-29']]`. TableCaption "[표1] 외주 개발 일정". minColW 78, firstColW 88.
- tabs: `{ '시작 날짜', blueLight }`, `{ '일수', greenLight }`.
- dataSt: 머리글 행 `{ bold, blueLight, blueCard }`. '시작 날짜' → B2:B4(ci 1, ri 1~3) rangeSides. '일수' → C2:C4(ci 2). D열 ri 1~3 항상 bold.
- 함수 박스: "WORKDAY" → SyntaxLine(colors [blueLight, greenLight]) — 셋째 인수 [휴일 범위]는 functionSyntax 값이므로 그대로 표시되지만 색은 주지 않는다 → 설명 "시작 날짜에서 주말(토 · 일)을 건너뛰고 일수만큼 지난 날짜를 돌려줍니다. 시작 날짜 자신은 세지 않습니다." → 구분선 → 수식(16 bold, 한 줄): =WORKDAY(`<blueLight>`B2`</blueLight>`, `<greenLight>`C2`</greenLight>`) → 2026-06-29 (greenLight)
- 안내 문구 "버튼을 눌러 두 개의 인수를 하나씩 확인하세요".
- explain:
  - '시작 날짜': '기준 날짜 [B2]. 이 날은 세지 않고 다음 날부터 1일째로 셉니다.'
  - '일수': '건너뛸 근무일 수 [C2]. 주말은 자동으로 빠집니다. 셋째 인수 [휴일 범위]는 생략하면 되고 시험에는 거의 나오지 않습니다.'
- Row 아래(marginTop 16) 계산 과정 띠: TableCaption(C.textMuted) "=WORKDAY(B2, C2) 계산 과정 — B2 = 6/22(월)". Cell 격자 gridTemplateColumns 'repeat(7, 1fr)', 셀 7개, 각 셀 두 줄(whiteSpace 'pre-line', 15 bold):
  - "6/23 화\n1일째" (C.greenDark / C.green / C.greenLight)
  - "6/24 수\n2일째" (green)
  - "6/25 목\n3일째" (green)
  - "6/26 금\n4일째" (green)
  - "6/27 토\n주말" (C.purpleCard / C.purple / C.purpleLight)
  - "6/28 일\n주말" (purple)
  - "6/29 월\n5일째 ★" (bg C.greenBg, border C.greenLight, color C.greenLight)
- "일련번호로 보이면 Ctrl+1" 안내는 JSON bullets에 이미 있으므로 다이어그램에 넣지 않는다.

diff 보고 후 멈춘다.

## 3단계 — 검증

- npm run build 통과. 구문 검사 스크립트가 있으면 통과.
- Lesson2~5.jsx, lesson-2~6.json, registry.js는 한 줄도 바뀌지 않았음을 git diff --stat으로 보고한다. Lesson6.jsx는 0단계의 import 변경만 있어야 한다.
- 폭 1400px에서 각 Row 좌우 여백이 같고, 900px에서 겹치는 요소가 없는지 확인한다.
- 개념3·4에서 버튼을 눌러도 표·함수 박스·칠판·비교표의 높이가 변하지 않는지 확인한다.
- 7차시에서 바꾼 파일별 변경 요약과 줄 번호를 표로 출력한다.

## 참고 (확인된 값)

- 2026-06-22 월, 06-26 금, 06-27 토, 06-15 월
- WORKDAY 계산(공휴일 없음): 6/22+5 → 6/29, 6/23+3 → 6/26, 6/25+2 → 6/29
- WEEKDAY(, 2): 6/22 → 1(월), 6/24 → 3(수), 6/27 → 6(토), 6/28 → 7(일)
