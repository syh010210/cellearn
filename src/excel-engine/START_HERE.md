# 여기부터 읽으세요 (Claude Code용 안내)

이 폴더(`excel-engine/`)는 **컴활 1급/2급 실기 학습 플랫폼**에 들어갈, 외부 스프레드시트
라이브러리(SheetJS 계산 기능, Handsontable 등) 없이 **직접 구현한 엑셀 수식 계산 엔진**입니다.
다른 대화(Claude.ai 채팅)에서 설계·구현·테스트까지 마친 상태로 이 프로젝트에 그대로
가져와 붙이는 것이 목적입니다.

이 프로젝트는 React + Vite + SheetJS + Recharts로 진행 중이며, Supabase 연동을 계획하고
있습니다. SheetJS는 여기서는 **파일 저장/불러오기(.xlsx import·export)** 용도로만 쓰고,
셀 값 계산/재계산은 전부 이 폴더의 자체 엔진이 담당합니다.

## 지금 상태 (중요)

- 코드는 전부 완성되어 있고 **`node test.mjs`로 35개 테스트를 실행해 전부 통과 확인됨**.
- 아직 이 프로젝트의 실제 UI/데이터 구조에는 연결되지 않은 "독립 실행 가능한 엔진 + 데모"
  상태. `example/SpreadsheetGrid.jsx`는 참고용 데모일 뿐, 실제 화면이 아님.
- 함수 범위는 컴활 1급/2급 실기 출제 범위(약 60개)로 의도적으로 한정함 (엑셀 전체 함수 아님).

## 파일별 설명

| 파일 | 역할 |
|---|---|
| `index.js` | **공개 API.** `Sheet` 클래스 하나만 export. 실제 프로젝트 코드에서는 이 파일만 import해서 쓰면 됨 |
| `cellAddress.js` | `"A1"` ↔ `{row, col}` 변환, `"A1:B10"` 같은 범위를 셀 목록으로 확장 |
| `errors.js` | `#DIV/0!`, `#REF!` 등 엑셀 에러 코드를 값으로 표현하는 규칙 |
| `utils.js` | 숫자/문자열/불리언 타입 변환, SUMIF·COUNTIF 등에서 쓰는 조건(criteria) 매칭 로직 |
| `rangeValue.js` | 셀 범위(A1:B10)를 평가한 결과를 담는 래퍼 객체 |
| `tokenizer.js` | 수식 문자열(`"=SUM(A1:A3)"`)을 토큰으로 쪼갬 |
| `parser.js` | 토큰을 AST(추상 구문 트리)로 변환. AST에서 참조하는 셀 목록을 뽑아내는 함수도 포함 |
| `evaluator.js` | AST를 실제로 계산 (사칙연산, 비교, 함수 호출 처리, 에러 전파) |
| `dependencyGraph.js` | 셀 간 참조 관계 그래프. 값이 바뀌면 영향받는 셀들을 위상 정렬로 올바른 순서로 재계산하게 해줌. 순환 참조도 여기서 감지 |
| `functions/math.js` | SUM, SUMIF(S), COUNTIF(S), AVERAGE(IF/S), ROUND 계열, RANK.EQ, LARGE/SMALL 등 |
| `functions/text.js` | LEFT/RIGHT/MID, LEN, TRIM, TEXT, SUBSTITUTE, FIND 등 |
| `functions/date.js` | DATE, YEAR/MONTH/DAY, DATEDIF, WEEKDAY, TODAY/NOW (엑셀 1900 날짜 체계 재현) |
| `functions/lookup.js` | VLOOKUP, HLOOKUP, INDEX, MATCH |
| `functions/database.js` | DSUM, DAVERAGE, DCOUNT, DMAX, DMIN |
| `functions/info.js` | ISBLANK, ISERROR, ISNUMBER 등 |
| `functions/lazy.js` | IF, IFS, IFERROR, IFNA, CHOOSE, AND, OR — 인자를 조건에 따라 **선택적으로만** 계산해야 하는 함수들 |
| `functions/index.js` | 위 함수들을 이름별로 등록하는 레지스트리 (`FUNCTIONS`, `LAZY_FUNCTIONS`) |
| `test.mjs` | 엔진 검증 테스트. `node test.mjs`로 실행 |
| `example/SpreadsheetGrid.jsx` | 엔진을 붙여서 동작을 보여주는 **참고용** React 그리드 (실제 프로젝트 화면 아님) |
| `README.md` | 엔진 사용법 (일반 문서) |
| `FUNCTION_LIST.md` | 구현된 함수 전체 목록 |
| `CLAUDE_MD_ADDITION.md` | 이 프로젝트의 `CLAUDE.md`에 그대로 추가할 규칙 모음 |

## Claude Code에게 요청할 때 이렇게 말하면 됩니다

예시:
> `excel-engine/START_HERE.md`부터 읽고 이 폴더 구조를 파악해줘. 그다음 이 엔진을
> `src/` 아래로 옮기고, [실제 화면/컴포넌트 이름]에 연결해서 [원하는 동작]이 되게 해줘.

또는 함수/버그 관련 요청이라면:
> `excel-engine/START_HERE.md` 읽고, `functions/math.js`에 NETWORKDAYS 함수 추가해줘.
> 추가하고 나서 `test.mjs`에도 케이스 넣고 `node test.mjs`로 확인해줘.

## 지켜야 할 규칙 (자세한 내용은 `CLAUDE_MD_ADDITION.md`)

1. 이 폴더 안의 파일 구조(카테고리별 `functions/*.js`)를 그대로 유지하면서 확장한다.
2. 에러는 절대 `throw` 하지 않고 `makeError(ERRORS.XXX)` 값으로 반환한다 (엔진 전체가
   이 방식으로 동작하므로 여기서 벗어나면 다른 셀 계산이 깨진다).
3. IF/IFS/CHOOSE처럼 조건부로만 평가해야 하는 함수는 반드시 `functions/lazy.js`에 추가한다.
4. 셀 값 흐름(`setCellInput` → 파싱 → 의존성 그래프 갱신 → 위상 정렬 재계산 → `onChange`
   알림)을 우회해서 `computedValues`/`rawInput`을 직접 건드리지 않는다.
5. 뭔가 고치거나 추가했으면 반드시 `node test.mjs`로 기존 테스트가 깨지지 않았는지
   확인하고, 새 기능에 대한 테스트 케이스도 추가한다.
6. 함수 범위는 컴활 1급/2급 실기 출제 범위로 유지한다 (특별한 요청이 없는 한 엑셀
   전체 함수로 무분별하게 확장하지 않는다).
