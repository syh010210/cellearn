# 컴활 실기 학습 플랫폼 — 프로젝트 가이드

## 프로젝트 개요
컴퓨터활용능력 2급/1급 **실기 시험** 대비 웹 학습 플랫폼.
차시별 개념 학습 → 웹 내 미니 엑셀 실습 → 엑셀 파일 다운로드/제출/채점 → 객관식 퀴즈 → 오답노트 → 진도 대시보드 순서로 이어지는 학습 흐름.

## 기술 스택
- React + Vite
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

---

## Supabase 스키마 변경 규칙

`supabase/schema.sql`은 전체 스키마의 참조본일 뿐, **라이브 DB에 자동 반영되지 않는다.**
실제로 과거에 `schema.sql`에 있는 테이블(`wrong_notes`·`day_clears`)이 라이브 DB에는 없어
오답/일차 클리어 저장이 조용히 실패한 사고가 있었다. 그래서 아래 규칙을 지킨다.

- 새 테이블·컬럼·제약·인덱스·RLS 정책을 추가하면, **반드시 `supabase/migrations/` 아래
  멱등(idempotent) SQL 파일로 남긴다.** 파일명은 `YYYYMMDDHHMMSS_설명.sql`.
- 멱등하게 작성한다: `create table if not exists`, `add column if not exists`,
  제약/정책은 `drop ... if exists` 후 `create` (또는 `do $$ ... exception when duplicate_object then null; end $$`).
  이미 있으면 아무것도 바뀌지 않고, 없으면 만들어지게.
- 마이그레이션 내용은 `schema.sql`과 일치시킨다(참조본도 같이 갱신).
- RLS 정책은 기본적으로 "본인 행만 CRUD"(`auth.uid() = user_id`)로 만든다.
- 에이전트는 `supabase db push`를 실행하지 않는다. **SQL 파일만 준비**하고,
  보고에 **"SQL Editor에서 실행 필요"**를 반드시 명시한다(적용은 사람이 한다).
- 저장이 실패해도 사용자 데이터가 사라지지 않도록, 클라이언트 저장 로직은
  localStorage 미러 + 실패 재시도 큐를 유지한다(`src/hooks/useLearningData.js` 참고).

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

## 다이어그램(슬라이드) 컴포넌트 규칙

모든 학습 다이어그램은 `src/components/diagrams/LessonN.jsx`의 React 컴포넌트이며
`registry.js`에 경로 → 컴포넌트로 등록한다. `public/images/*.svg`는 만들지 않는다.

### 구조
- 최상위는 항상 `<Wrap>`. 그 안에 `Title` → (`Subtitle`) → (`ProblemBox`) → 본문 → (`BottomBar`) 순서.
- 본문의 세로 배치는 Wrap 안에 그대로 나열한다. 블록 사이 간격은 `marginTop: 16` 하나로 통일.
- 가로 배치는 `Row`만 사용한다. `display: 'flex'` 행을 슬라이드 안에서 직접 만들지 않는다.
- `Row`의 자식은 `Fixed` 또는 `Fill`만 넣는다.
  - 표(ExcelGrid), 이미지, 크기가 고정된 박스 → `Fixed`
  - 카드, 설명, 버튼 묶음, 칠판 → `Fill`
- 슬라이드 안에서 `justifyContent`, `margin: '0 auto'`, `maxWidth`, `width: N`으로 위치를 잡지 않는다.
  폭 제한이 필요하면 `Fill`의 `max` prop만 쓴다.
- 가로 한 줄에 카드 여러 개를 나열할 때도 `Row` 안에 `Fill`을 여러 개 넣는다.
- 예외: ref나 position:relative가 필요한 애니메이션 컴포넌트(RelativeFillAnim 등)는 Row로 바꾸지 않는다.
- 예외: 기존 가로행 중 maxWidth가 없고 justifyContent: 'center' 또는 equal-flex로 이미 중앙 정렬된 것은 유지해도 된다. 새로 만드는 슬라이드는 Row를 쓴다.

### 확인
- 브라우저 폭 1400px 이상에서 `Row`의 좌우 여백이 같아야 한다.
- 폭 900px에서 `Row`가 세로로 접히고 겹치는 요소가 없어야 한다.
- 새 슬라이드를 만들면 `registry.js`에 등록하고, 해당 lesson JSON의 contentBlocks에서 참조한다.

### 텍스트
- 모든 텍스트는 `FONT`, 색상은 `C` 객체만 사용. 슬라이드 안에 hex 값을 직접 쓰지 않는다.
- 본문 최소 15px, 보조 설명 14px 이상.