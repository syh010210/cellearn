# 5차시 형식 변환 — 4차시 스타일로

## 결론부터

lesson-5.json의 구조(concepts → contentBlocks → practice, quiz)는 lesson-4.json과 이미 같다. JSON을 갈아엎을 필요는 없다. 실제로 다른 것은 세 가지다.

| 항목 | 4차시 | 5차시 |
|---|---|---|
| 다이어그램 | 시험형 문제 박스 + 표 + 인수 버튼으로 인수별 강조가 바뀌는 인터랙티브 컴포넌트 (VlookupDiagram 등) | DbSum/DbAverage/DbCount/DbMax 4개가 등록돼 있으나 4차시 패턴인지 불명 (소스 미확인) |
| 개념 도입 | 함수 공통 설명 다이어그램(VlookupHlookupIntroDiagram)이 맨 앞에 옴 | 없음. 공통 형식 설명이 bullets 텍스트로만 있음 |
| 문구 | 제목이 함수명 나열: "찾기 및 참조 함수 (VLOOKUP, INDEX · MATCH)" | "데이터베이스 함수의 공통 공식과 조건 설정 마스터" |

텍스트 블록·실습·퀴즈 내용은 그대로 둔다. 작업은 다이어그램 5개(신규 1 + 재작성 4)와 제목 한 줄이다.

---

## 0. 먼저 확인할 것

Lesson5.jsx의 현재 4개 컴포넌트가 아래 패턴을 얼마나 갖추고 있는지 표로 보고하고 멈춰라. 이미 갖춘 것은 재작성하지 않는다.

- Wrap / Title / Row / Fixed / Fill 사용 여부
- 시험형 문제 박스(4차시 VlookupDiagram의 `[표1]에서 … 계산하시오` 박스) 유무
- ExcelGrid로 표를 그리는지, 직접 div로 그리는지
- 인수 버튼(useState로 active 인수 바꾸며 표 강조)이 있는지
- 4차시 `rangeSides`처럼 범위 바깥 테두리로 강조하는지

---

## 1. 신규: DbCommonIntroDiagram

등록: `'/diagram/db-common'`. lesson-5.json 개념1의 첫 image 블록(`/images/db-dsum.svg`) **앞에** 새 image 블록으로 삽입.

VlookupHlookupIntroDiagram과 같은 구성. 카드 하나 + 함수 칩 6개.

- Title: `데이터베이스 함수 — D로 시작하는 함수는 인수가 전부 같다`
- 카드(blueCard): 구문 `=D함수(전체 표 범위, 계산할 열, 조건 범위)` 크게. 아래 세 줄:
  - 전체 표 범위: 열 제목(1행)을 포함해 표 전체
  - 계산할 열: 열 제목 셀을 클릭하거나 왼쪽부터 센 번호
  - 조건 범위: 제목 + 값이 한 세트. 셀 하나만 지정할 수 없음
- Row 안에 Fill 6개(min 140): DSUM 합계 / DAVERAGE 평균 / DCOUNT 숫자 셀 개수 / DCOUNTA 비어 있지 않은 셀 개수 / DMAX 최댓값 / DMIN 최솟값. 함수명 굵게, 아래 한 줄. 색은 전부 같은 계열(C.blue), 구분 색 쓰지 않는다.

---

## 2. DbSumDiagram 재작성 — VlookupDiagram 패턴

Title: `단일 조건 — 조건 범위는 제목과 값 두 칸`

문제 박스(4차시와 같은 스타일, 인수별 색 강조):
> [표1]에서 <amber>제품군[B2:B4]</amber>이 "세탁기"인 제품의 <green>판매량[D2:D4]</green> 합계를 [G2] 셀에 계산하시오.
> ▶ 조건은 [F1:F2] 영역에 입력하시오
> ▶ DSUM 함수 사용

왼쪽 Fixed:
- `[표1] 판매 현황` — ExcelGrid, lesson-5 실습1의 A1:D4 데이터 그대로 (제품ID/제품군/단가/판매량, W-01 세탁기 1200000 5 …), startRow=1
- `[조건 범위]` — ExcelGrid 2행 1열: 제품군 / 세탁기, startRow=1, 열 문자 F

오른쪽 Fill(min 360, max 500):
- 박스: DSUM / 구문 `=DSUM(전체 표 범위, 계산할 열, 조건 범위)` / 한 줄 설명 / 구분선 / 수식 `=DSUM(<blue>A1:D4</blue>, <green>4</green>, <amber>F1:F2</amber>)` → `13`
- 안내: `버튼을 눌러 세 개의 인수를 하나씩 확인하세요`
- 버튼 3개: 전체 표 범위(blue) / 계산할 열(green) / 조건 범위(amber)
- 설명(explain):
  - 전체 표 범위: `열 제목이 있는 1행부터 표 끝까지 전부 선택합니다. VLOOKUP과 달리 제목 행을 뺴지 않습니다.` ← "뺴지" 오타 주의, "빼지"
  - 계산할 열: `합계를 구할 판매량은 표의 왼쪽부터 4번째 열입니다. 제목 셀 D1을 클릭해도 됩니다.`
  - 조건 범위: `조건 열 제목 "제품군"과 조건값 "세탁기"를 위아래 두 칸으로 지정합니다. "세탁기" 한 칸만 지정하면 어느 열의 조건인지 알 수 없습니다.`

표 강조(rangeSides 방식):
- 전체 표 범위: 표1 A1:D4 전체 blue 테두리, 1행(제목) 연한 blue 채움
- 계산할 열: 표1 D1:D4 green 테두리, labelRow에 `4번째`
- 조건 범위: 조건표 F1:F2 amber 테두리. 표1에서 B열의 "세탁기" 셀 두 개(B2, B4) amber 형광, D2·D4 값(5, 8) green 굵게

---

## 3. DbAverageDiagram 재작성 — AND 조건

Title: `AND 조건 — 같은 행에 나란히`

문제 박스:
> [표1]에서 <amber>제조사</amber>가 "A사"이면서 <amber>재고량</amber>이 20 이상인 가전의 <green>단가</green> 평균을 [H2] 셀에 계산하시오.
> ▶ 조건은 [F1:G2] 영역에 입력하시오
> ▶ DAVERAGE 함수 사용

왼쪽: `[표1] 가전 재고` A1:D4 (실습2 데이터), `[조건 범위]` 2행 2열: 제조사 재고량 / A사 >=20

오른쪽 박스: 수식 `=DAVERAGE(<blue>A1:D4</blue>, <green>3</green>, <amber>F1:G2</amber>)` → `1900000`

버튼 3개는 2번과 같고, 조건 범위 설명만 다르다:
- 조건 범위: `두 조건이 같은 행에 나란히 있으면 "둘 다 만족"(AND)입니다. 제목 2칸 + 값 2칸, 모두 4칸을 지정합니다.`

강조: 조건 범위 버튼 시 조건표 F1:G2 amber 테두리 + 표1에서 두 조건을 모두 만족하는 행(에어컨, 스타일러) 전체를 연한 amber 채움, 그 행의 단가(1800000, 2000000) green 굵게. 조건을 하나만 만족하는 행(청소기: 재고 40이지만 B사)은 회색 처리.

추가 요소(박스 아래): 작은 표 두 개 나란히 `같은 행 → AND` / `다른 행 → OR`, 각 2×2·3×2 ExcelGrid. OR 쪽은 다음 개념 예고용이라 흐리게(opacity 0.6).

---

## 4. DbCountDiagram 재작성 — OR 조건 + DCOUNT/DCOUNTA

Title: `OR 조건 — 행을 바꿔 엇갈리게`

문제 박스:
> [표1]에서 <amber>매장위치</amber>가 "대구점"이거나 <amber>판매량</amber>이 50 이상인 지점 수를 [H2] 셀에 계산하시오.
> ▶ 조건은 [F1:G3] 영역에 입력하시오
> ▶ DCOUNT 함수 사용

왼쪽: `[표1] 지점 판매` A1:D4 (실습3 데이터), `[조건 범위]` 3행 2열: 매장위치 판매량 / 대구점 (빈칸) / (빈칸) >=50

오른쪽 박스: 수식 `=DCOUNT(<blue>A1:D4</blue>, <green>3</green>, <amber>F1:G3</amber>)` → `2`

버튼은 4개: 전체 표 범위 / 계산할 열 / 조건 범위 / **DCOUNTA와 비교**
- 조건 범위: `조건값이 서로 다른 행에 있으면 "하나라도 만족"(OR)입니다. 빈칸까지 포함해 F1:G3 여섯 칸을 지정합니다.`
- DCOUNTA와 비교: 이 버튼을 누르면 박스의 수식이 두 줄로 바뀐다:
  - `=DCOUNT(A1:D4, <green>4</green>, F1:G3)` → `0` ← 담당자 열은 문자
  - `=DCOUNTA(A1:D4, <green>4</green>, F1:G3)` → `2`
  - 설명: `DCOUNT는 숫자·날짜·시간 셀만 셉니다. 담당자처럼 문자 열을 세려면 DCOUNTA를 씁니다.`
  - 표1의 D열(담당자) green 테두리, labelRow `4번째`

강조(조건 범위): 조건표 amber 테두리, 표1에서 조건 중 하나라도 만족하는 행(서울점 65, 대구점 30) 연한 amber 채움, 판매량 셀 green 굵게. 부산점은 회색.

---

## 5. DbMaxDiagram 재작성 — 와일드카드

Title: `와일드카드 — * 는 여러 글자, ? 는 한 글자`

문제 박스:
> [표1]에서 <amber>모델명</amber>이 "OLED"로 시작하는 제품의 <green>출시연도</green> 중 가장 큰 값을 [G2] 셀에 계산하시오.
> ▶ 조건은 [F1:F2] 영역에 입력하시오
> ▶ DMAX 함수 사용

왼쪽: `[표1] 물류창고` A1:D4 (실습4 데이터), `[조건 범위]` 모델명 / OLED*

오른쪽 박스: 수식 `=DMAX(<blue>A1:D4</blue>, <green>3</green>, <amber>F1:F2</amber>)` → `2026`

버튼 3개(전체 표 범위 / 계산할 열 / 조건 범위). 조건 범위 설명: `"OLED*"는 OLED로 시작하고 뒤에 몇 글자가 오든 상관없다는 뜻입니다. OLED-TV, OLED-Monitor 두 행이 걸립니다.`

박스 아래 추가 요소 — 패턴 4개 표(Row 안에 Fill 4개):
| 패턴 | 뜻 | 예 |
|---|---|---|
| 고* | 고로 시작 | 고구마, 고등어, 고 |
| *고 | 고로 끝남 | 사과, 망고, 고 |
| *고* | 고 포함 | 고구마, 망고, 참고서 |
| 고?? | 고 + 정확히 2글자 | 고구마 (O), 고등어 (O), 고기 (X) |
각 Fill을 클릭하면 예시 목록에서 매칭되는 단어만 amber 형광. 예시 단어는 lesson-5.json bullets의 "고" 예시를 그대로 쓴다.

---

## 6. lesson-5.json 수정 (최소)

1. `title`: `데이터베이스 함수 (DSUM, DAVERAGE, DCOUNT, DMAX)`, `shortTitle` 그대로.
2. 개념1 contentBlocks 맨 앞 text 블록 다음에 `{ "type": "image", "url": "/diagram/db-common", "alt": "데이터베이스 함수 공통 구문과 6개 함수" }` 삽입.
3. 기존 4개 image 블록의 url은 그대로(registry가 이미 연결). alt만 새 다이어그램 내용에 맞게 갱신.
4. 나머지 텍스트·bullets·practice·quiz는 한 글자도 바꾸지 않는다.

---

## 7. 실습에 대한 메모 (이번 작업 범위 아님)

시험에서는 조건 범위를 학생이 직접 입력하는 문제가 많다. 지금 실습은 F1:F2에 "세탁기"가 미리 들어 있다. 나중에 조건 칸을 editable로 만들려면 gradePractice의 2번 규칙(수식이 아니면 오답)에 예외가 필요하다: 셀에 `"plain": true`가 있으면 값 그대로 비교. 이건 MiniExcel 쪽 작업이라 별도로 진행한다.

---

## Claude Code 지시문

```
LESSON5_CONVERT.md를 읽고 순서대로 진행해라.

1. 0절 확인표를 먼저 보고하고 멈춰라.
2. (확인 후) 1~5절의 다이어그램을 Lesson5.jsx에 작성해라. 4차시 VlookupDiagram의 구조(문제 박스, Row/Fixed/Fill, ExcelGrid, rangeSides, 인수 버튼, explain)를 그대로 따르되 코드를 복사하지 말고 공통 부분(문제 박스, 인수 버튼 묶음, rangeSides)은 shared.jsx로 뽑아 4차시도 그것을 쓰게 리팩터해라. 리팩터 후 4차시 다이어그램의 동작이 바뀌지 않아야 한다.
3. registry.js에 '/diagram/db-common' 등록.
4. 6절대로 lesson-5.json 수정. diff를 보고해라. 6절에 없는 변경이 diff에 있으면 안 된다.
5. CLAUDE.md 다이어그램 규칙 준수 여부 확인, npm run build 통과, 5차시 다이어그램 5개 컴포넌트명과 줄 수 보고.
```
