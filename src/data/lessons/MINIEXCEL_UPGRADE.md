# MiniExcel 업그레이드 — 실제 엑셀과 같은 동작

대상 파일: `src/components/lesson/MiniExcel.jsx`, `src/utils/formulaUtils.js`, `src/utils/functionHints.js`, `src/data/lessons/*.json`, `src/hooks/useLearningData.js`
기준: 사용자가 실제 엑셀에서 하는 조작이 미니 엑셀에서도 같은 결과를 내야 한다. 아래 명세에서 "엑셀과 같다"는 MS Excel 기본 동작을 뜻한다.

이미 있는 것(건드리지 말 것): 수식 모드 드래그 범위 삽입, F4 `$` 순환(`cycleReference`), 인수 힌트 바, 채우기 핸들 + `shiftFormula`, Sheet 엔진 계산 흐름, 오토플레이.

작업은 Phase 순서대로 하고, Phase마다 끝에 있는 확인 항목을 통과한 뒤 다음으로 넘어간다.

---

## Phase 1. 편집 모델을 엑셀과 같게

### 1-1. 상태 정의

셀에는 세 가지 상태만 있다.

| 상태 | 진입 | 특징 |
|---|---|---|
| 선택(Ready) | 클릭, 방향키 이동, 커밋 후 | 입력창에 내용은 보이지만 포커스 없음 |
| 입력(Enter 모드) | 선택 상태에서 글자 키 입력 | 기존 내용을 버리고 그 글자부터 새로 시작. 방향키 = 커밋 후 이동 (수식이면 참조 선택, 1-4) |
| 편집(Edit 모드) | F2, 더블클릭, 수식 입력창 클릭 | 기존 내용 유지, 커서는 끝. 방향키 = 텍스트 커서 이동 |

`editModeRef = 'ready' | 'enter' | 'edit'` 하나로 관리한다. 기존 `isEditingRef`는 이것으로 대체.

### 1-2. 키보드 — 선택 상태 (테이블 컨테이너에 `tabIndex={0}` + `onKeyDown`)

셀을 클릭하면 컨테이너에 포커스를 준다(`containerRef.current.focus()`). 입력창이 아니라 컨테이너가 키를 받는다.

| 키 | 동작 |
|---|---|
| 글자·숫자·`=`·`+`·`-` 등 출력 가능 키 | editable 셀이면 `inputVal = 그 글자`, 입력 모드 진입, 입력창 포커스. 비편집 셀이면 무시 |
| F2 | editable 셀이면 편집 모드 진입(기존 내용, 커서 끝) |
| Delete, Backspace | editable 셀(또는 범위 선택 전체)의 input을 `""`로 커밋 |
| ↑↓←→ | 선택 이동. 비편집 셀로도 이동한다(엑셀처럼). 표 끝에서는 멈춤 |
| Shift+↑↓←→ | 범위 선택 확장 (1-3) |
| Enter / Shift+Enter | 아래 / 위로 이동 |
| Tab / Shift+Tab | 오른쪽 / 왼쪽으로 이동 |
| Ctrl+C | 선택 셀(범위)의 input을 클립보드 상태(`clipRef`)에 저장. 시스템 클립보드에는 표시값 텍스트를 복사 |
| Ctrl+V | `clipRef`의 원본 위치 기준으로 `shiftFormula`를 적용해 현재 선택 위치부터 붙여넣기. editable 셀만 채움 |
| Ctrl+Z / Ctrl+Y | 되돌리기 / 다시 실행 (1-5) |
| Esc | 범위 선택 해제 |

### 1-3. 범위 선택 (선택 상태)

- `selection = { anchor: {ri,ci}, focus: {ri,ci} }`로 바꾼다. 기존 `selected`는 `selection.focus`로 대응.
- Shift+클릭: anchor 유지, focus 갱신. Shift+방향키: focus 이동.
- 마우스 드래그(수식 모드가 아닐 때)도 범위 선택. 기존 `onPointerMove`의 hover 추적을 재사용.
- 범위 선택 중 이름 상자는 `A1:B3`, 채우기 핸들은 범위 오른쪽 아래 모서리에 표시.
- Delete·Ctrl+C·자동 채우기는 범위 전체에 적용. 자동 채우기의 원본이 범위이면 엑셀처럼 각 열(행)별로 `shiftFormula`.

### 1-4. 입력·편집 모드 키보드 (기존 `handleKeyDown` 확장)

| 키 | 동작 |
|---|---|
| Enter | 커밋 후 아래로 이동. 다음 셀이 비편집이어도 이동(입력창은 readOnly) |
| Shift+Enter | 커밋 후 위로 |
| Tab / Shift+Tab | 커밋 후 오른쪽 / 왼쪽 |
| Esc | 취소, 선택 상태로. 입력창은 원래 값으로 |
| F4 | 기존 그대로 |
| ↑↓←→ (입력 모드, 수식 아님) | 커밋 후 이동 |
| ↑↓←→ (편집 모드) | 텍스트 커서 이동 (브라우저 기본) |
| ↑↓←→ (수식 모드, 커서 앞 글자가 `=`, `(`, `,`, 연산자 중 하나) | 참조 선택 모드: 커서 위치에 셀 주소를 삽입하고 방향키마다 그 주소를 갱신. Shift+방향키면 `A1:A3` 범위로 확장. 글자 키를 치면 참조 선택 종료 |

참조 선택 모드는 `pointRef = { insertAt, start, end } | null`로 관리한다. 기존 드래그 삽입(`rangeDragCursorRef`)과 같은 삽입 로직을 쓴다.

### 1-5. 되돌리기

- `historyRef = { past: [], future: [] }`. 커밋·자동 채우기·붙여넣기·Delete마다 `cells`의 input 맵 스냅샷(`{ addr: input }`)을 past에 push (최대 50).
- Ctrl+Z: past에서 꺼내 적용하고 현재를 future로. Ctrl+Y 반대.
- 적용 시 Sheet에도 `setCellInput`으로 전부 반영한다.

### 1-6. 자동 채우기 보강

- 핸들 더블클릭: 왼쪽 인접 열의 데이터가 있는 마지막 행까지 아래로 채움(엑셀과 같음). 왼쪽이 없으면 오른쪽 열 기준.
- 드래그 중 채워질 셀에 결과 미리보기 텍스트를 옅게 표시(선택 사항, 있으면 좋음).

### 1-7. 이름 상자

- 클릭하면 편집 가능. `D2` 또는 `A6:C8` 입력 후 Enter → 해당 셀/범위 선택. 잘못된 주소는 무시.

### Phase 1 확인

- 셀 클릭 → `=` 타이핑 → 셀 드래그 → `,3,0)` → Enter 까지 마우스 클릭 없이 진행되는가
- F2로 기존 수식을 열면 커서가 끝에 있고 방향키가 커서를 움직이는가
- D2 입력 후 Enter → D3 선택 → Ctrl+Z → D2 비워지는가
- Shift+↓로 D2:D3 잡고 Delete → 둘 다 비워지는가
- 핸들 더블클릭으로 D2 수식이 D3까지 채워지는가

---

## Phase 2. 수식 편집 중 참조 색상

- 입력창이 수식 모드일 때 `inputVal`을 파싱해 참조 목록을 순서대로 뽑는다. 엔진의 `collectReferences`(parser.js)를 쓰되, 파싱 실패(입력 중이라 괄호가 안 닫힌 상태)를 대비해 정규식 백업 `/\$?[A-Z]+\$?\d+(:\$?[A-Z]+\$?\d+)?/g`를 함께 둔다.
- 색상 배열(엑셀 순서): `['#0000FF', '#FF0000', '#9C27B0', '#008000', '#FF6D00', '#00838F']`. 같은 참조가 두 번 나오면 같은 색.
- 셀: 참조 범위의 바깥 테두리를 2px 실선으로 해당 색, 배경은 그 색 8% 투명도. 기존 `rangeSides` 방식(shared.jsx의 다이어그램 코드 참고)으로 바깥쪽 변만 그린다.
- 입력창: `<input>`은 부분 색을 못 넣으므로 입력창 위에 같은 폰트·패딩의 오버레이 `<div>`를 겹쳐 텍스트를 색으로 렌더하고 input의 글자색은 `transparent`, 캐럿색만 유지(`caretColor`). 스크롤 위치 동기화 필요.
- 인수 힌트 바는 그대로 둔다.

### Phase 2 확인

- `=VLOOKUP(C2,$A$6:$C$8,3,0)` 편집 중 C2는 파랑, A6:C8은 빨강 테두리, 입력창 텍스트도 같은 색인가
- 괄호를 다 닫기 전(`=VLOOKUP(C2,$A$6`)에도 색이 나오는가

---

## Phase 3. 표시를 엑셀과 같게

- 정렬: 계산 결과가 number → 오른쪽, string → 왼쪽, boolean·에러 → 가운데. 비편집 셀도 `typeof val === 'number'`면 오른쪽.
- 표시 형식: 기본은 엑셀 일반(General) 서식 — 천 단위 쉼표 없음, 500000은 그대로 500000. 셀 JSON에 `"format": "#,##0"` 또는 `"0.0%"`가 있을 때만 적용. 지원 형식은 `#,##0`, `#,##0.00`, `0%`, `0.0%`, `yyyy-mm-dd`, `@` 다섯 개로 한정.
- 에러값: 엑셀처럼 검정 텍스트 그대로. 별도 색 없음. 단 셀 왼쪽 위에 초록 삼각형은 넣지 않는다.
- 폰트: 표 안 글꼴을 `'Malgun Gothic'`으로 고정하는 현재 설정 유지.
- 수식 입력 자동완성: `=` 뒤 또는 연산자·`(`·`,` 뒤에 영문자를 2자 이상 치면 엔진 `FUNCTIONS`+`LAZY_FUNCTIONS` 키 중 접두어가 맞는 것을 최대 8개 드롭다운으로 표시. ↑↓로 선택, Tab으로 `NAME(` 삽입, Esc로 닫기. 목록은 컴활 출제 범위 함수만(엔진에 이미 그 범위만 있음).

### Phase 3 확인

- 500000이 오른쪽 정렬로 쉼표 없이 나오는가
- `=VL` 입력 시 VLOOKUP 드롭다운, Tab 시 `=VLOOKUP(`이 되는가

---

## Phase 4. 채점

### 4-1. practice JSON 필드 추가

editable 셀 또는 practice 최상위에:

```json
"requiredFunctions": ["VLOOKUP"],
"fillFrom": "D2"
```

- `requiredFunctions`: 수식에 반드시 들어가야 하는 함수명. practice 최상위에 두면 모든 editable 셀에 적용.
- `fillFrom`: 이 셀이 자동 채우기로 만들어져야 하는 원본 셀. D3에 `"fillFrom": "D2"`면 `shiftFormula(D2.input, 1, 0) === D3.input`(공백·대소문자 무시)일 때만 자동 채우기 인정.

### 4-2. `grade()` 판정 순서 (셀마다, 처음 걸리는 것이 사유)

1. input이 `""` → `status: "empty"`, 사유 "입력하지 않았습니다"
2. input이 `=`로 시작하지 않음 → `wrong`, "수식이 아니라 값을 직접 입력했습니다"
3. `requiredFunctions` 중 수식에 없는 것 → `wrong`, "VLOOKUP 함수를 사용하지 않았습니다"
4. 계산 결과가 에러 → `wrong`, "수식 오류 (#N/A) — 참조 범위와 찾을 값을 확인하세요"
5. 계산 결과 ≠ `result` (기존 비교식 유지) → `wrong`, "결과값이 다릅니다"
6. `fillFrom`이 있고 원본에서 밀어낸 수식과 다름 → `wrong`, 아래 4-3
7. 통과 → `correct`

### 4-3. 자동 채우기 오답 세분화 (6번)

원본 셀 수식과 학생 D3 수식을 비교해서:
- 원본 수식의 참조 중 `$` 없는 범위가 D3에서 한 칸 밀려 있음 (예 `A7:C9`) → "참조 범위가 밀렸습니다. 원본 수식에서 범위에 $를 붙여 고정한 뒤 다시 채우세요"
- D3 수식이 원본과 완전히 같음(찾을 값도 C2) → "자동 채우기가 아니라 복사했습니다. 찾을 값이 C3으로 바뀌어야 합니다"
- 그 외 → "D2에서 자동 채우기한 결과와 다릅니다"

### 4-4. 결과 표시

- 채점 시도 횟수 `attempts` 상태. 1회차 오답: 사유만. 2회차 이상: 사유 + "정답 수식 보기" 버튼(누르면 `cell.answer` 표시). 지금처럼 바로 정답을 보여주지 않는다.
- `empty`도 결과 목록에 나온다.
- 이모지(✅❌) 제거. 텍스트만: "D2 · 정답", "D3 · 오답 — 참조 범위가 밀렸습니다".

### 4-5. 오답노트 연동

- `useLearningData`에 `addPracticeWrong({ lessonId, conceptIdx, practiceIdx, cell, studentInput, answer, reason })` 추가. `grade()`에서 `wrong`·`empty` 셀마다 호출. 같은 셀이 나중에 `correct`가 되면 `resolvePracticeWrong`으로 해결 표시.
- WrongNoteView의 "엑셀 실습 오답" 섹션에 미니 엑셀 오답도 같이 표시. 업로드 채점 오답과 출처(`source: "mini" | "upload"`)로 구분.
- DayGate 조건에 미니 엑셀 미해결 오답을 포함할지는 별도 결정 사항 — 이번 작업에서는 저장·표시까지만 하고 게이트 조건은 건드리지 않는다.

### Phase 4 확인

- D2에 `500000` 직접 입력 → "값을 직접 입력했습니다"
- D2에 `=VLOOKUP(C2,A6:C8,3,0)` 후 D3까지 채우기 → D2 정답, D3 "참조 범위가 밀렸습니다"
- D3에 직접 `=VLOOKUP(C3,$A$6:$C$8,3,0)` 타이핑 → 결과는 맞지만 fillFrom 검사에서는 통과(수식이 동일하므로). 이건 의도된 허용.
- 오답노트 화면에 미니 엑셀 오답이 보이는가

---

## 결정 사항 (작업 전 확인)

1. 가상 스페이서 열: 시험 시트에 없는 요소이므로 **제거**한다. `addVirtualSpacer` 로직 삭제. JSON에 실제 빈 열이 있으면 그건 일반 열로 렌더(현재 `spacerCols` 좁게 렌더링도 제거, 열 문자 표시).
2. 비편집 셀도 선택·이동은 되지만 입력은 안 된다. 타이핑하면 아무 반응 없음.
3. 표 밖으로는 이동하지 않는다(엑셀은 무한 시트지만 실습 표는 고정).

---

## Claude Code 지시문

```
MINIEXCEL_UPGRADE.md를 읽고 Phase 1부터 순서대로 진행해라.

- Phase마다 끝의 확인 항목을 코드 기준으로 점검하고, 통과 여부와 근거(함수명·줄)를 표로 보고한 뒤 다음 Phase로 넘어가라.
- "이미 있는 것" 목록은 수정하지 마라. 리팩터링이 꼭 필요하면 이유를 먼저 적어라.
- 결정 사항 1~3은 확정이다. 다시 묻지 마라.
- 파일이 700줄을 넘으면 키보드 처리(useKeyboard.js), 선택 상태(useSelection.js), 채점(gradePractice.js)을 src/components/lesson/miniexcel/ 아래로 분리해라. 분리는 동작을 바꾸지 않는 순수 이동이어야 한다.
- 4차시 lesson-4.json의 VLOOKUP 실습에 requiredFunctions와 fillFrom을 추가해라. 다른 차시 JSON은 건드리지 마라.
- 전부 끝나면 node src/excel-engine/test.mjs와 npm run build가 통과하는지 확인하고, 변경 파일 목록과 각 파일의 변경 요약을 출력해라.
```
