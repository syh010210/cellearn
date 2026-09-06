# PROJECT_SNAPSHOT

## 1. src 폴더 구조 (3단계)

```
src
├── App.css
├── App.jsx
├── assets
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── components
│   ├── admin
│   │   └── AdminView.jsx
│   ├── auth
│   │   ├── authStyles.js
│   │   ├── AuthView.jsx
│   │   ├── LoginView.jsx
│   │   ├── MonthYearPicker.jsx
│   │   ├── PasswordInput.jsx
│   │   └── SignupView.jsx
│   ├── brand
│   │   └── Logo.jsx
│   ├── checkout
│   │   └── CheckoutView.jsx
│   ├── dashboard
│   │   └── Dashboard.jsx
│   ├── diagrams
│   │   ├── Lesson1.jsx ... Lesson20.jsx
│   │   ├── registry.js
│   │   ├── RelativeFillAnim.jsx
│   │   └── shared.jsx
│   ├── exam
│   │   └── ExamView.jsx
│   ├── landing
│   │   └── LandingPage.jsx
│   ├── layout
│   │   └── Sidebar.jsx
│   ├── legal
│   │   └── LegalView.jsx
│   ├── lesson
│   │   ├── ConceptView.jsx
│   │   ├── DayGateView.jsx
│   │   ├── MiniExcel.jsx
│   │   ├── OTView.jsx
│   │   ├── PracticeView.jsx
│   │   ├── QuizView.jsx
│   │   └── TrialView.jsx
│   ├── support
│   │   └── SupportWidget.jsx
│   └── wrongnote
│       └── WrongNoteView.jsx
├── context
│   └── AuthContext.jsx
├── data
│   ├── days.js
│   ├── exam
│   │   ├── analysis-sort-0001.json
│   │   ├── basic3-condformat-0001.json
│   │   ├── basic3-text2col-0001.json
│   │   ├── calc-date-0001.json
│   │   ├── calc-db-0001.json
│   │   ├── calc-logic-0001.json
│   │   ├── calc-lookup-0001.json
│   │   ├── calc-math-0001.json
│   │   ├── calc-ref-0001.json
│   │   ├── calc-stat-0001.json
│   │   ├── calc-text-0001.json
│   │   ├── chart-0001.json
│   │   └── macro-0001.json
│   ├── examBank.js
│   ├── lessons
│   │   ├── lesson-1.json ... lesson-20.json
│   │   ├── lesson-4.png, lesson-4-1.png ... lesson-4-8.png
│   │   ├── lesson-11.xlsx, lesson-13.xlsx, lesson-14.xlsx, lesson-15.xlsx, lesson-17.xlsx
│   │   ├── lesson-12.png, lesson-12_1.png, lesson-12_2.png, lesson-13.png, lesson-14.png
│   │   ├── lesson-9.pptx
│   │   └── lesson-9.xlsm
│   └── lessons.js
├── excel-engine
│   ├── cellAddress.js
│   ├── CLAUDE_MD_ADDITION.md
│   ├── dependencyGraph.js
│   ├── errors.js
│   ├── evaluator.js
│   ├── example
│   │   └── SpreadsheetGrid.jsx
│   ├── FUNCTION_LIST.md
│   ├── functions
│   │   ├── database.js
│   │   ├── date.js
│   │   ├── index.js
│   │   ├── info.js
│   │   ├── lazy.js
│   │   ├── lookup.js
│   │   ├── math.js
│   │   └── text.js
│   ├── index.js
│   ├── parser.js
│   ├── rangeValue.js
│   ├── README.md
│   ├── START_HERE.md
│   ├── test.mjs
│   ├── tokenizer.js
│   └── utils.js
├── hooks
│   └── useLearningData.js
├── index.css
├── lib
│   ├── authErrors.js
│   └── supabase.js
├── main.jsx
├── theme.js
└── utils
    ├── examBuilder.js
    ├── examGrader.js
    ├── excelGenerator.js
    ├── excelGrader.js
    ├── formulaEval.js
    ├── formulaUtils.js
    ├── functionHints.js
    └── xlsxInspect.js
```

---

## 2. CLAUDE.md

`CLAUDE.md`

```markdown
# 컴활 실기 학습 플랫폼 — 프로젝트 가이드

## 프로젝트 개요
컴퓨터활용능력 2급/1급 **실기 시험** 대비 웹 학습 플랫폼.
차시별 개념 학습 → 웹 내 미니 엑셀 실습 → 엑셀 파일 다운로드/제출/채점 → 객관식 퀴즈 → 오답노트 → 진도 대시보드 순서로 이어지는 학습 흐름.

## 기술 스택
- React + Vite
- Tailwind CSS (유틸리티 클래스만 사용)
- SheetJS (xlsx) — 엑셀 파일 생성 및 파싱
- Recharts — 대시보드 차트
- Supabase — 추후 Auth + DB 연동 예정 (현재는 로컬 상태)

---

## 유스케이스 명세서

### 액터
| 액터 | 설명 |
|------|------|
| 비회원 | 랜딩·커리큘럼·가격 페이지만 열람 |
| 수강생 | 결제 완료 후 해당 급수 학습 기능 전체 이용 |
| 시스템 | 엑셀 파일 생성, 퀴즈 채점, 진도 저장 등 자동 처리 |

### UC-01. 랜딩 페이지
- 플랫폼 소개, 커리큘럼 목록, 가격 안내
- 모바일: 랜딩/커리큘럼/가격만 접근 가능. 학습 기능 진입 시 "PC에서 이용하세요" 표시
- PC: 학습 시작 버튼으로 학습 페이지 진입

### UC-02. 급수 선택 및 결제
- 결제 시 1급 or 2급 1회 선택 및 확정 (로그인 시 재선택 없음)
- 결제 완료 후 해당 급수 커리큘럼 고정

### UC-03. 로그인 및 진입
- Supabase Auth 예정 (현재는 결제 없이 바로 학습 진입)
- 결제된 급수에 맞는 커리큘럼 자동 로드
- 모바일 접근 시 학습 페이지 차단

### UC-04. 차시별 개념 학습
- 차시마다 여러 개념 카드로 구성
- 각 개념 카드 하단에 미니 엑셀 실습 포함
- 미니 엑셀: 실제 엑셀처럼 동작
  - 셀 클릭으로 선택
  - = 입력 후 셀 클릭 시 셀 주소 자동 삽입
  - Enter 입력 시 수식 계산 결과가 셀에 표시
  - 오른쪽 하단 핸들 드래그로 자동 채우기 (상대 참조 이동 포함)
  - 채점 버튼 클릭 시 정오답 판별
- 마지막 개념 카드 완료 후 실습 단계로 이동

### UC-05. 엑셀 실습 파일 다운로드 및 제출
- 차시 내용 기반 엑셀 파일(.xlsx) 생성 및 다운로드 (SheetJS)
- 수강생이 로컬 엑셀에서 수식 직접 입력 후 저장
- 완성 파일 업로드 → 시스템이 셀별 수식 정확히 비교하여 채점
- 정답 기준: 수식 문자열 정확히 일치 (공백 제외)
- 오답 셀은 오답노트에 자동 수집

### UC-06. 객관식 복습 퀴즈
- 차시별 4지선다 문제 (현재 1차시 10문제)
- 전체 선택 완료 후 제출 가능
- 제출 시 즉시 채점, 정답/오답 색상 구분
- 오답 문제에 풀이 해설 제공
- 오답은 오답노트에 자동 수집

### UC-07. 오답노트
- 엑셀 실습 오답 (시트명·셀·입력수식·정답수식)
- 퀴즈 오답 (문제·정답·풀이 해설)
- 두 가지 분리하여 표시

### UC-08. 진도 관리 및 대시보드
- 완료 차시 수, 퀴즈 정답률, 오답 누적, 진도율
- 차시별 진행 바 시각화
- 차시 완료 시 사이드바 ✓ 표시 자동 업데이트

### UC-09. 차시 완료 처리
- 퀴즈 제출 완료 후 "차시 완료" 버튼 클릭
- 사이드바 ✓ 표시, 대시보드 진도율 갱신

---

## 페이지 접근 권한
| 페이지 | 비회원 | 수강생(모바일) | 수강생(PC) |
|--------|--------|--------------|-----------|
| 랜딩 | ✅ | ✅ | ✅ |
| 커리큘럼 안내 | ✅ | ✅ | ✅ |
| 가격 안내 | ✅ | ✅ | ✅ |
| 개념 학습 | ❌ | ❌ | ✅ |
| 엑셀 실습 | ❌ | ❌ | ✅ |
| 퀴즈 | ❌ | ❌ | ✅ |
| 오답노트 | ❌ | ❌ | ✅ |
| 대시보드 | ❌ | ❌ | ✅ |

---

## 현재 구현된 차시 데이터

### 1차시: 상대 참조와 절대 참조

#### 개념 목록 (4개)
1. 엑셀 기본 구조 — 열/행/셀/시트 개념
2. 상대 참조의 원리 — 자동 채우기 시 참조 이동
3. 절대 참조 ($) — F4 키, 셀 고정
4. 혼합 참조 — 행 고정/열 고정 분리

#### 엑셀 실습 파일 구성 (표1~3)
- 표1_상대참조: 합계(D열), 평균(E열) — 정답: =B3+C3, =(B3+C3)/2
- 표2_절대참조비율: 실기×$B$8 + 봉사×$B$9 — 정답: =B3*$B$8+C3*$B$9
- 표3_환율변환: 달러×$B$2 — 정답: =B5*$B$2

#### 퀴즈 (10문제)
- 셀 주소 개념, 상대 참조 이동, F4 단축키, 절대/혼합 참조 응용

---

## 파일 구조 (이렇게 만들어줘)

```
computil-platform/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopNav.jsx
│   │   ├── landing/
│   │   │   └── LandingPage.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── lesson/
│   │   │   ├── ConceptView.jsx
│   │   │   ├── MiniExcel.jsx       ← 핵심. 실제 엑셀처럼 동작
│   │   │   ├── PracticeView.jsx
│   │   │   └── QuizView.jsx
│   │   └── wrongnote/
│   │       └── WrongNoteView.jsx
│   ├── data/
│   │   └── lessons.js              ← 차시 데이터 (개념, 퀴즈, 정답 수식 등)
│   ├── utils/
│   │   ├── excelGenerator.js       ← SheetJS 엑셀 파일 생성
│   │   ├── excelGrader.js          ← 업로드 파일 채점 로직
│   │   └── formulaUtils.js         ← 수식 파싱, 자동 채우기 이동 등
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── CLAUDE.md
├── package.json
└── vite.config.js
```

---

## 개발 규칙
- 컴포넌트는 위 파일 구조대로 분리할 것
- 차시 데이터는 src/data/lessons.js 에서만 관리
- 엑셀 관련 로직은 src/utils/ 에 분리
- 스타일은 인라인 스타일 사용 (Tailwind 클래스 혼용 금지)
- 현재 상태 관리는 React useState (Supabase 연동 전)
- 모바일에서는 랜딩/커리큘럼/가격만 표시, 학습 기능 전체 차단

## 지금 당장 할 작업
현재 App.jsx 한 파일에 모든 코드가 들어있음.
위 파일 구조대로 컴포넌트를 분리하고,
MiniExcel.jsx는 아래 동작을 구현할 것:
- 셀 클릭으로 선택 (선택된 셀 파란 테두리)
- = 입력 후 셀 클릭 시 해당 셀 주소가 수식에 자동 삽입
- Enter 입력 시 수식 계산 결과값이 셀에 표시 (오답 표시 없음)
- 오른쪽 하단 핸들 드래그로 자동 채우기
- "채점하기" 버튼 클릭 시 정오답 판별 및 피드백

---

## 자체 스프레드시트 엔진 (excel-engine/)

`src/excel-engine/` 아래에 SheetJS/외부 라이브러리 없이 직접 구현한 수식 계산 엔진이 있다.
셀 값 저장, 수식 파싱, 의존성 추적, 자동 재계산을 전부 자체 구현했으므로 아래 규칙을 지킬 것.

### 구조
- `cellAddress.js` : "A1" ↔ {row,col} 변환, 범위 확장
- `errors.js` : 엑셀 에러 코드(#DIV/0! 등) 표현
- `utils.js` : 타입 변환(toNumber/toBoolean/toStr), SUMIF류 조건 매칭
- `rangeValue.js` : 셀 범위 평가 결과 래퍼
- `tokenizer.js` / `parser.js` : 수식 문자열 → AST, AST에서 참조 셀 추출
- `evaluator.js` : AST 평가 (연산자, 함수 호출 처리)
- `dependencyGraph.js` : 셀 간 참조 그래프, 위상 정렬 기반 재계산 순서 결정
- `functions/` : 카테고리별 함수 구현체 (math/text/date/lookup/database/info/lazy)
- `index.js` : 공개 API `Sheet` 클래스 (React에서는 이것만 사용)

### 새 함수 추가 시 규칙
1. 반드시 `functions/` 아래 알맞은 카테고리 파일에 추가한다 (임의 위치에 추가 금지).
2. IF/IFS/IFERROR/IFNA/CHOOSE/AND/OR처럼 **인자를 조건부로만 평가해야 하는 함수**는
   `functions/lazy.js`에 `(argNodes, context, evaluateFn)` 시그니처로 추가하고
   `functions/index.js`의 `LAZY_FUNCTIONS`에 등록한다.
3. 그 외 일반 함수는 `(evaluatedArgs, context)` 시그니처로 만들고 `FUNCTIONS`에 등록한다.
4. 함수 이름은 항상 대문자로 등록한다 (`FUNCTIONS['VLOOKUP']`, `FUNCTIONS['RANK.EQ']` 등).
5. 에러가 발생할 수 있는 경우 `throw` 하지 말고 `makeError(ERRORS.XXX)`를 반환한다.
   엔진 전체가 예외를 던지지 않고 값으로 에러를 표현하는 방식을 따른다.
6. 범위 인자는 `flatten()` (rangeValue.js) 으로 1차원 배열로 펼쳐서 다루거나,
   VLOOKUP/INDEX처럼 2차원 구조가 필요하면 `range.values`를 직접 사용한다.
7. 함수를 추가/수정했으면 `test.mjs`에 최소 1개의 검증 케이스를 추가하고
   `node test.mjs`로 전체 테스트가 통과하는지 반드시 확인한다.

### 셀 값 흐름 (중요 - 절대 우회하지 말 것)
사용자 입력 → `Sheet.setCellInput(address, input)` → (수식이면) `parseFormula` → AST →
`collectReferences`로 참조 셀 추출 → `dependencyGraph.setDependencies` 갱신 →
`recalculate`가 영향받는 모든 셀을 위상 정렬로 찾아 순서대로 `evaluate` 재실행 →
`onChange` 리스너 호출 → React가 리렌더.

이 흐름을 건너뛰고 `computedValues`나 `rawInput`을 직접 조작하지 않는다.

### 순환 참조
`dependencyGraph.getAffectedCellsSorted`가 위상 정렬 실패 시 순환에 포함된 셀 목록을
`circular`로 반환한다. 이 셀들은 `#CIRCULAR!`로 표시되며, 실제 엑셀의 순환 참조 경고와
동일한 역할을 한다. 순환 감지 로직은 수정하지 말고, 새 기능은 이 위에 얹는다.

### 컴활 실기 출제 범위 유지
함수는 컴활 1급/2급 실기 출제 범위(약 60개)로 한정한다. 엑셀 전체 함수(500개+)를
무분별하게 추가하지 말고, 새 함수가 필요하면 먼저 실제 출제 범위에 있는지 확인 후 추가한다.

---

## SVG 슬라이드 생성 규칙

모든 학습 이미지는 `public/images/*.svg` 에 직접 작성한 SVG 파일이다.
아래 규칙을 반드시 준수한다.

### 1. 캔버스 크기

- `width`: 고정 960 강제하지 말 것. 내용이 넓으면 1100~1300까지 늘려도 됨.
- `height`: "보통 400~600" 같은 감으로 잡지 말고, **모든 박스/텍스트의 y 좌표를
  먼저 계산한 뒤, 가장 아래 요소의 bottom + 하단 여백 40px**을 최종 height로 정한다.
- 요소 사이 최소 간격: **24px 이상** (화살표가 있는 경우 화살표 포함 24px).

### 2. 텍스트 블록 높이 계산

N줄 텍스트, 각 줄 폰트 크기 f1…fN 일 때:

```
block_height = f1×0.8 + Σ(f_i × 1.8, i=1..N-1) + fN×0.3
```

### 3. 텍스트 블록을 박스 안에 배치하는 방법 (핵심 — 반드시 이 순서로)

**Case A: 박스 크기를 내용에 맞춰 새로 만드는 경우**
```
box_height     = 14(top pad) + block_height + 14(bottom pad)
first_baseline = rect_y + 14 + f1×0.8
다음 줄: baseline_i = baseline_(i-1) + f_(i-1)×1.8
```

**Case B: 박스 높이가 이미 정해져 있는 경우 → 반드시 세로 중앙 정렬**
```
top_offset     = max(14, (box_height - block_height) / 2)
first_baseline = rect_y + top_offset + f1×0.8
다음 줄: baseline_i = baseline_(i-1) + f_(i-1)×1.8
```
→ 14px 고정 padding으로 시작하면 안 됨. 박스 높이가 내용보다 클 때는 반드시 중앙 정렬.

### 4. 가로 정렬

- 모든 줄 `text-anchor="middle"`, `x = box_x + box_width / 2` 로 통일.
- 왼쪽 정렬이 필요한 표/목록이 아닌 이상 무조건 middle.

### 5. 요소 간 겹침 방지

완성 전에 좌표로 직접 확인:
- `boxA.x + boxA.width + gap ≤ boxB.x` (가로 나열, gap ≥ 16px, 화살표 있으면 ≥ 24px)
- `boxA.y + boxA.height + gap ≤ boxB.y` (세로 나열, 동일 기준)
- 화살표 끝점은 박스 테두리에서 최소 4~6px 이격.
- 박스 안 마지막 줄 bottom(`baseline + fN×0.3`) < `rect_y + rect_height` 수치 확인.

### 6. 폰트 크기 최솟값

| 역할 | 크기 |
|---|---|
| 슬라이드 제목 | 22px bold |
| 섹션 제목 | 18–20px bold |
| 본문 | 16–18px |
| 보조 설명 (각주 성격만) | **15px 이상** (13–14px 금지) |

하단 요약/공식 바처럼 사용자가 꼭 읽어야 하는 텍스트는 "보조 설명"이 아니라 "본문" 취급.

### 7. 완성 전 자체 체크리스트

- [ ] 박스 높이가 내용보다 여유 있는 경우, 3번 Case B 중앙 정렬 공식을 적용했는가?
- [ ] 인접한 모든 도형/화살표/텍스트 쌍에 대해 5번 겹침 검사를 했는가?
- [ ] 캔버스 height ≥ 가장 아래 요소 bottom + 40px 인가?

### 검증 주석 형식

Case B(중앙 정렬) 적용 시 주석에 반드시 계산 과정을 남긴다:
```
<!--
  박스 높이 120 고정, 내용 2줄 (18px + 15px):
  block_height = 18×0.8 + 18×1.8 + 15×0.3 = 14.4 + 32.4 + 4.5 = 51.3
  top_offset = max(14, (120 - 51.3)/2) = 34.35
  L1 = rect_y + 34.35 + 18×0.8 = rect_y + 48.75
  L2 = L1 + 18×1.8
  L2 bottom = L2 + 15×0.3 < rect_y + 120 ✓
-->
```
```

---

## 3. 슬라이드 컴포넌트 소스 전문 (구조가 다른 3개)

### 3-1. 정적 정의 카드형 — `src/components/diagrams/Lesson4.jsx` : VlookupHlookupIntroDiagram

```jsx
export function VlookupHlookupIntroDiagram() {
  return (
    <Wrap>
      <Title>VLOOKUP · HLOOKUP</Title>

      {/* 두 함수 설명 카드 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', minWidth: 280, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
          <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 세로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 열에서 세로 방향으로 찾아 같은 행의 지정한 열에 있는 값을 반환</div>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 280, background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
          <div style={{ color: C.orangeLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 가로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 행에서 가로 방향으로 찾아 같은 열의 지정한 행에 있는 값을 반환</div>
        </div>
      </div>
    </Wrap>
  );
}
```

### 3-2. 정적 흐름형 (수식 → 화살표 → 카드 → 결과 → BottomBar) — `src/components/diagrams/Lesson4.jsx` : ChooseDiagram

```jsx
export function ChooseDiagram() {
  const options = [
    { num: 1, label: '번호 = 1',       value: '"최우수"', note: '(선택 안 됨)', active: false },
    { num: 2, label: '번호 = 2  ★ 선택됨', value: '"우수"',   note: '→ 이 값 반환', active: true  },
    { num: 3, label: '번호 = 3',       value: '"보통"',   note: '(선택 안 됨)', active: false },
  ];

  return (
    <Wrap>
      <Title>목록 선택 함수: CHOOSE</Title>
      <Subtitle>번호 인수에 따라 미리 지정된 값 목록에서 하나를 선택하여 반환합니다</Subtitle>

      {/* Formula box */}
      <div style={{
        background: '#1e3a8a', border: `2px solid ${C.blueDim}`,
        borderRadius: 10, padding: 16,
        maxWidth: 480, margin: '0 auto 16px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{
          color: C.blueLight, fontSize: 16, fontFamily: 'monospace',
          fontWeight: 700, textAlign: 'center',
        }}>
          =CHOOSE( 2 , &quot;최우수&quot; , &quot;우수&quot; , &quot;보통&quot; )
        </div>
        <div style={{
          color: C.textDim, fontSize: 14, fontFamily: 'monospace', textAlign: 'center',
        }}>
          &nbsp;&nbsp;&nbsp;&nbsp;① 번호&nbsp;&nbsp;&nbsp;② 값1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;③ 값2&nbsp;&nbsp;&nbsp;&nbsp;④ 값3
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ArrowDown color={C.blueDim} size={32} />
      </div>

      {/* Three option cards */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {options.map((opt) => (
          <div key={opt.num} style={{
            flex: 1, borderRadius: 10, padding: 16,
            background: opt.active ? C.blueCard : C.bgDark,
            border: opt.active ? `3px solid ${C.blueDim}` : `1px solid ${C.border}`,
            opacity: opt.active ? 1 : 0.7,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              color: opt.active ? C.blue : C.textDim,
              fontSize: 15, fontWeight: opt.active ? 700 : 400, textAlign: 'center',
            }}>
              {opt.label}
            </div>
            <div style={{
              color: opt.active ? C.blue : C.textSlate,
              fontSize: opt.active ? 28 : 20,
              fontWeight: 700, textAlign: 'center',
            }}>
              {opt.value}
            </div>
            <div style={{
              color: opt.active ? C.blueLight : C.textSlate,
              fontSize: 15, textAlign: 'center',
            }}>
              {opt.note}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <ArrowDown color={C.green} size={32} />
      </div>

      {/* Result box */}
      <div style={{
        background: '#14532d', border: `2px solid ${C.green}`,
        borderRadius: 10, padding: 16, marginTop: 4,
        maxWidth: 300, margin: '4px auto 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: C.greenLight, fontSize: 24, fontWeight: 700 }}>
          결과: &quot;우수&quot;
        </div>
      </div>

      <BottomBar>
        <BLine>=CHOOSE(번호, 값1, 값2, 값3, ...)  ·  번호가 1이면 값1, 2면 값2, 3이면 값3을 반환</BLine>
        <BLine color={C.blue} bold>CHOOSE의 번호 인수에 WEEKDAY, MONTH 등 다른 함수를 중첩해서 활용</BLine>
      </BottomBar>
    </Wrap>
  );
}
```

### 3-3. 인터랙티브형 (useState/useEffect + 버튼 + ExcelGrid cellStyle + 칠판) — `src/components/diagrams/Lesson4.jsx` : VlookupDiagram

```jsx
export function VlookupDiagram() {
  const [active, setActive] = useState(null);

  // 일치 옵션을 누르면 성과급률 3개가 2초 간격으로 하나씩 채워짐
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['2.0%', '5.0%', '3.5%']; // 박서준(C)·김민지(A)·이도현(B)

  const loan = [
    ['사원코드', '사원명', '판매액', '성과급률'],
    ['103-C-2201', '박서준', '24,000,000', ''],
    ['101-A-4503', '김민지', '9,800,000', ''],
    ['102-B-3302', '이도현', '13,500,000', ''],
  ];
  const code = [
    ['등급', '직무', '성과급률'],
    ['A', '영업', '5.0%'],
    ['B', '관리', '3.5%'],
    ['C', '지원', '2.0%'],
  ];

  const WHITE = '#ffffff';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '열 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '사원코드의 다섯 번째 문자입니다.',
    '참조 범위': '찾을 값이 사원코드의 다섯 번째 문자(등급)이기 때문에 참조 범위의 첫 열로 오도록 하여, 위의 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '열 번호': '각 사원의 성과급률을 계산하라고 했기 때문에, 반환할 값이 지정한 참조 범위의 세 번째 열에 있으니 3입니다.',
    '일치 옵션': '찾을 값(C,A,B)이 참조 범위의 첫 열에 전부 있습니다. \n(정확히 일치 · FALSE)',
  };

  // 사원코드 문자열에서 다섯 번째 글자(A·B·C)에만 형광펜 배경
  const hi = (s) => {
    const str = String(s);
    return (
      <span>{str.slice(0, 4)}<span style={{ background: C.amberLight, color: '#0b1220', borderRadius: 3, padding: '1px 3px', fontWeight: 700 }}>{str.slice(4, 5)}</span>{str.slice(5)}</span>
    );
  };

  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';

  // 표1: 사원코드(A3:A5)의 다섯 번째 문자를 형광펜으로 표시 (열 번호 탭에서는 숨김)
  const loanSt = (ri, ci, val) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 0 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, content: hi(val) };
    if (ci === 3 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
    return {};
  };

  // 범위 바깥쪽 변에만 테두리를 그려 '범위를 감싼 것'처럼 보이게 (ri·ci는 data 인덱스)
  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 등급표: 참조 범위=A12:C14(첫 열 연한 채우기), 열 번호=C12:C14(초록), 일치 옵션=A12:A14(흰) — 모두 바깥쪽 테두리만
  const codeSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    let boxes = [];
    let fillFirstCol = false;
    if (active === '참조 범위') { boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }]; fillFirstCol = true; }
    else if (active === '열 번호') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }, { r1: 1, r2: 3, c1: 2, c2: 2, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 0, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstCol && ci === 0 && ri >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>참조 범위에서 나열된 데이터의 방향이 세로이면 VLOOKUP</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>사원코드[A3:A5]</b>의 다섯 번째 문자와
          <b style={{ color: C.blueLight }}> [A11:C14]</b> 영역의 표를 이용하여 각 사원의
          <b style={{ color: C.greenLight }}> 성과급률[D3:D5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 사원코드의 앞에서 다섯 번째 문자가 “A”이면 성과급률은 5.0%, “B”이면 3.5%, “C”이면 2.0%임</div>
          <div>▶ VLOOKUP, MID 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 사원 실적표 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={loan} startRow={2} cellStyle={loanSt} minColW={78} firstColW={104} />
          </div>
          <div>
            <TableCaption color={C.blueLight}>[등급표] 세로 참조 범위</TableCaption>
            <ExcelGrid data={code} startRow={11} cellStyle={codeSt} minColW={82} firstColW={64}
              labelRow={[
                active === '참조 범위' ? { text: '첫 열', color: C.blueLight } : null,
                null,
                active === '열 번호' ? { text: '3번째', color: C.greenLight } : null,
              ]} />
          </div>
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* VLOOKUP 박스 (구문 + 수식) */}
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MID(A3,5,1)</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$A$12:$C$14</span>, <span style={{ color: C.greenLight }}>3</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 2.0%</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}
```

---

## 4. 공통 컴포넌트 목록과 props

`src/components/diagrams/shared.jsx`

- `FONT` — `"'Noto Sans KR', sans-serif"`
- `C` — 색상 상수 객체
- `Wrap({ children })`
- `Title({ children })`
- `Subtitle({ children })`
- `BottomBar({ children })`
- `BLine({ children, color, bold = false, size = 15 })`
- `Cell({ children, bg, border, bw = 1, style = {} })`
- `Card({ children, bg, border, bw = 2, style = {} })`
- `ArrowDown({ color = '#3b82f6', size = 36 })`
- `ArrowRight({ color = '#3b82f6', size = 40 })`
- `colLetter(i)`
- `ExcelGrid({ data, startCol = 0, startRow = 1, cellStyle, minColW = 56, firstColW, labelRow, rowLabels })`
- `ProblemBox({ no, children, tag = '문제' })`
- `TableCaption({ children, color })`

---

## 5. 슬라이드 캔버스 크기 · 색상/폰트 변수 정의 위치

`src/components/diagrams/shared.jsx`

```jsx
// 다이어그램의 모든 텍스트(한글·영문·숫자·수식)는 페이지 기본 글꼴로 통일한다.
export const FONT = "'Noto Sans KR', sans-serif";

export const C = {
  bg: '#1e293b',
  bgDark: '#0f172a',
  blue: '#60a5fa', blueLight: '#93c5fd', blueDim: '#3b82f6', blueBg: '#172554', blueCard: '#0c2344',
  green: '#22c55e', greenLight: '#86efac', greenBg: '#14532d', greenDark: '#052e16',
  red: '#ef4444', redLight: '#fca5a5', redBg: '#450a0a', redDark: '#1a0b0b',
  amber: '#fbbf24', amberLight: '#fcd34d', amberBg: '#431407',
  purple: '#a855f7', purpleLight: '#d8b4fe', purpleBg: '#2e1065', purpleCard: '#1e0f47',
  orange: '#fb923c', orangeBg: '#431407', orangeLight: '#fdba74',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b', textSlate: '#475569',
  border: '#334155',
};

export function Wrap({ children }) {
  return (
    <div style={{
      // 밝은 개념 페이지 위에서 브랜드 톤(딥그린) 피규어 카드로 보이게 한다.
      background: '#123a33', border: '1px solid #1f4f45', borderRadius: 16, padding: 20,
      margin: '10px 0 14px',
      // 다이어그램 안의 모든 텍스트를 페이지 기본 글꼴(문제 텍스트와 동일)로 통일한다.
      fontFamily: FONT, color: C.text,
    }}>
      {children}
    </div>
  );
}
```

---

## 6. 슬라이드 렌더링 · 내보내기 방식

`src/components/lesson/ConceptView.jsx`

```jsx
import { DIAGRAM_REGISTRY } from "../diagrams/registry.js";

// ...

if (block.type === "image") {
  const DiagramComponent = DIAGRAM_REGISTRY[block.url];
  if (DiagramComponent) return <DiagramComponent key={i} />;
  return (
    <img key={i} src={block.url} alt={block.alt || ""}
         style={{ maxWidth: "100%", borderRadius: 12, margin: "10px 0 14px", display: "block" }} />
  );
}
```

```jsx
{c.contentBlocks
  ? c.contentBlocks.map((b, i) => renderBlock(b, i, lesson))
  : <p style={{ color: UI.ink, lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{c.content}</p>
}
```

`src/components/diagrams/registry.js`

```js
import { ExcelBasicDiagram, RelativeDownDiagram, RelativeRightDiagram, AbsoluteRefDiagram, MixedRefDiagram } from './Lesson1.jsx';
import { StringExtractDiagram, StringLenCaseDiagram, StringFindTrimDiagram, StringCombineDiagram } from './Lesson2.jsx';
import { StatBasicDiagram, StatRankDiagram, StatLargeSmallDiagram, StatCountDiagram, StatCondCountDiagram } from './Lesson3.jsx';
import { VlookupHlookupIntroDiagram, VlookupDiagram, HlookupTwoTableDiagram, VlookupApproxDiagram, VlookupOneTableDiagram, MatchIndexDiagram, ChooseDiagram, ChooseRankDiagram, IndexMatchDiagram, VlookupLimitDiagram } from './Lesson4.jsx';
import { DbSumDiagram, DbAverageDiagram, DbCountDiagram, DbMaxDiagram } from './Lesson5.jsx';
import { MathBasicDiagram, MathRoundDiagram, SumifDiagram, SumifsDiagram } from './Lesson6.jsx';
import { DatetimeBasicDiagram, DatetimeComposeDiagram, WeekdayDiagram, WorkdayDiagram } from './Lesson7.jsx';
import { IfDiagram, IfAndDiagram, IfOrDiagram, NestedIfDiagram, IfErrorDiagram } from './Lesson8.jsx';
import { PasteSpecialAnim, NumberFormatDiagram, CellAnatomyDiagram, ProductCodeDiagram, NameBoxDiagram, DateCodeDiagram, CellCommentDiagram, MergeCenterDiagram, AlignGridDiagram, BordersDiagram } from './Lesson9.jsx';
import { RelativeFillDownAnim, RelativeFillRightAnim, AbsoluteFillDownAnim, FillHandleCursorAnim, ExcelCursorsAnim } from './RelativeFillAnim.jsx';
import { AutoFilterAnim, CustomFilterMenu, CustomAutoFilterDialog, AndOrConditionDiagram, CompoundConditionDiagram, ComparisonOperatorDiagram, AdvancedFilterDialog, FilterMistakesDiagram } from './Lesson10.jsx';
import { CondFormatFormulaAnim, CondFormatStepsAnim, CondFormatPracticeAnim } from './Lesson11.jsx';
import { SortStepsAnim, SortLeftRightDiagram, SortBasicStepsAnim, SortFilterRibbon } from './Lesson12.jsx';
import { SubtotalFlowAnim, SubtotalDialogDiagram, SubtotalExamProblem } from './Lesson13.jsx';
import { PivotBuildAnim, PivotIntroProblem, PivotAreaMap, PivotStepsDiagram, PivotExamProblem } from './Lesson14.jsx';
import { DataTableTwoVarAnim, DataTablePlacementDiagram, DataTableExamProblem } from './Lesson15.jsx';
import { ScenarioFlowAnim, WhatIfCompareDiagram, ScenarioExamProblem } from './Lesson16.jsx';
import { ConsolidateAnim, ConsolidateWildcardDiagram, ConsolidateExamProblem } from './Lesson17.jsx';
import { GoalSeekAnim, GoalSeekElementsDiagram, GoalSeekExamProblem } from './Lesson18.jsx';
import { MacroRecordAnim, MacroConnectDiagram, MacroExamProblem } from './Lesson19.jsx';
import { ChartAnatomyDiagram, ChartDataRangeDiagram, ChartExamProblem } from './Lesson20.jsx';

export const DIAGRAM_REGISTRY = {
  // 자동 채우기 애니메이션 (개념 학습용)
  '/anim/paste-special':               PasteSpecialAnim,
  '/diagram/number-format':            NumberFormatDiagram,
  '/diagram/cell-anatomy':             CellAnatomyDiagram,
  '/diagram/product-code':             ProductCodeDiagram,
  '/diagram/name-box':                 NameBoxDiagram,
  '/diagram/date-code':                DateCodeDiagram,
  '/diagram/cell-comment':             CellCommentDiagram,
  '/diagram/merge-center':             MergeCenterDiagram,
  '/diagram/align-grid':               AlignGridDiagram,
  '/diagram/borders':                  BordersDiagram,
  '/anim/excel-cursors':               ExcelCursorsAnim,
  '/anim/fill-handle-cursor':          FillHandleCursorAnim,
  '/anim/relative-fill-down':          RelativeFillDownAnim,
  '/anim/relative-fill-right':         RelativeFillRightAnim,
  '/anim/absolute-fill-down':          AbsoluteFillDownAnim,

  // 10차시 — 필터
  '/anim/auto-filter':                 AutoFilterAnim,
  '/diagram/custom-filter-menu':       CustomFilterMenu,
  '/diagram/custom-filter-dialog':     CustomAutoFilterDialog,
  '/diagram/filter-andor':             AndOrConditionDiagram,
  '/diagram/filter-compound':          CompoundConditionDiagram,
  '/diagram/filter-comparison':        ComparisonOperatorDiagram,
  '/diagram/advanced-filter-dialog':   AdvancedFilterDialog,
  '/diagram/filter-mistakes':          FilterMistakesDiagram,

  // 11차시 — 조건부 서식
  '/anim/cond-format-steps':           CondFormatStepsAnim,
  '/anim/cond-format-formula':         CondFormatFormulaAnim,
  '/anim/cond-format-practice':        CondFormatPracticeAnim,

  // 12차시 — 정렬
  '/anim/sort-basic-steps':            SortBasicStepsAnim,
  '/diagram/sort-filter-ribbon':       SortFilterRibbon,
  '/anim/sort-steps':                  SortStepsAnim,
  '/diagram/sort-left-right':          SortLeftRightDiagram,

  // 13차시 — 부분합
  '/anim/subtotal-flow':               SubtotalFlowAnim,
  '/diagram/subtotal-dialog':          SubtotalDialogDiagram,
  '/problem/subtotal':                 SubtotalExamProblem,

  // 14차시 — 피벗 테이블
  '/anim/pivot-build':                 PivotBuildAnim,
  '/problem/pivot-intro':              PivotIntroProblem,
  '/diagram/pivot-area-map':           PivotAreaMap,
  '/diagram/pivot-steps':              PivotStepsDiagram,
  '/problem/pivot':                    PivotExamProblem,

  // 15차시 — 데이터 표
  '/anim/datatable-2var':              DataTableTwoVarAnim,
  '/diagram/datatable-placement':      DataTablePlacementDiagram,
  '/problem/datatable':                DataTableExamProblem,

  // 16차시 — 시나리오 관리자
  '/anim/scenario-flow':               ScenarioFlowAnim,
  '/diagram/whatif-compare':           WhatIfCompareDiagram,
  '/problem/scenario':                 ScenarioExamProblem,

  // 17차시 — 데이터 통합
  '/anim/consolidate':                 ConsolidateAnim,
  '/diagram/consolidate-wildcard':     ConsolidateWildcardDiagram,
  '/problem/consolidate':              ConsolidateExamProblem,

  // 18차시 — 목표값 찾기
  '/anim/goalseek':                    GoalSeekAnim,
  '/diagram/goalseek-elements':        GoalSeekElementsDiagram,
  '/problem/goalseek':                 GoalSeekExamProblem,

  // 19차시 — 매크로
  '/anim/macro-record':                MacroRecordAnim,
  '/diagram/macro-connect':            MacroConnectDiagram,
  '/problem/macro':                    MacroExamProblem,

  // 20차시 — 차트
  '/diagram/chart-anatomy':            ChartAnatomyDiagram,
  '/diagram/chart-datarange':          ChartDataRangeDiagram,
  '/problem/chart':                    ChartExamProblem,

  '/images/excel-basic.svg':           ExcelBasicDiagram,
  '/images/relative-down.svg':         RelativeDownDiagram,
  '/images/relative-right.svg':        RelativeRightDiagram,
  '/images/absolute-ref.svg':          AbsoluteRefDiagram,
  '/images/mixed-ref.svg':             MixedRefDiagram,

  '/images/string-extract.svg':        StringExtractDiagram,
  '/images/string-len-case.svg':       StringLenCaseDiagram,
  '/images/string-find-trim.svg':      StringFindTrimDiagram,
  '/images/string-combine.svg':        StringCombineDiagram,

  '/images/stat-basic.svg':            StatBasicDiagram,
  '/images/stat-rank.svg':             StatRankDiagram,
  '/images/stat-largesmall.svg':       StatLargeSmallDiagram,
  '/images/stat-count.svg':            StatCountDiagram,
  '/images/stat-condcount.svg':        StatCondCountDiagram,

  '/diagram/lookup-common':            VlookupHlookupIntroDiagram,
  '/images/lookup-vlookup.svg':        VlookupDiagram,
  '/diagram/lookup-hlookup-2table':    HlookupTwoTableDiagram,
  '/diagram/lookup-vlookup-approx':    VlookupApproxDiagram,
  '/diagram/lookup-vlookup-1table':    VlookupOneTableDiagram,
  '/images/lookup-matchindex.svg':     MatchIndexDiagram,
  '/images/lookup-indexmatch.svg':     IndexMatchDiagram,
  '/images/lookup-vlookup-limit.svg':  VlookupLimitDiagram,
  '/images/lookup-choose.svg':         ChooseDiagram,
  '/diagram/lookup-choose-rank':       ChooseRankDiagram,

  '/images/db-dsum.svg':               DbSumDiagram,
  '/images/db-daverage.svg':           DbAverageDiagram,
  '/images/db-dcount.svg':             DbCountDiagram,
  '/images/db-dmax.svg':               DbMaxDiagram,

  '/images/math-abs-int-mod-power.svg': MathBasicDiagram,
  '/images/math-round.svg':            MathRoundDiagram,
  '/images/math-sumif.svg':            SumifDiagram,
  '/images/math-sumifs.svg':           SumifsDiagram,

  '/images/datetime-basic.svg':        DatetimeBasicDiagram,
  '/images/datetime-compose.svg':      DatetimeComposeDiagram,
  '/images/weekday-func.svg':          WeekdayDiagram,
  '/images/workday-func.svg':          WorkdayDiagram,

  '/images/logic-if.svg':              IfDiagram,
  '/images/logic-if-and.svg':          IfAndDiagram,
  '/images/logic-if-or.svg':           IfOrDiagram,
  '/images/logic-nested-if.svg':       NestedIfDiagram,
  '/images/logic-iferror.svg':         IfErrorDiagram,
};
```
