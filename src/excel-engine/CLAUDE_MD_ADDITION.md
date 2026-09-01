# 아래 내용을 프로젝트의 CLAUDE.md에 추가하세요

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
