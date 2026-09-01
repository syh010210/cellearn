# 자체 스프레드시트 엔진 (컴활 실기 출제 함수 기준)

SheetJS 등 외부 스프레드시트 라이브러리 없이 직접 구현한 수식 계산 엔진입니다.
컴활 1급/2급 실기에 나오는 함수 약 60개(`FUNCTION_LIST.md` 참고)를 실제 엑셀과
동일하게 동작하도록 구현했고, `test.mjs`에서 35개 테스트로 검증했습니다 (전부 통과).

## 폴더 구조

```
excel-engine/
├─ cellAddress.js       # "A1" ↔ {row,col}, 범위(A1:B10) 처리
├─ errors.js            # #DIV/0!, #REF! 등 엑셀 에러 코드
├─ utils.js             # 타입 변환, SUMIF류 조건(criteria) 매칭
├─ rangeValue.js        # 셀 범위 평가 결과 래퍼
├─ tokenizer.js         # 수식 문자열 → 토큰
├─ parser.js            # 토큰 → AST, AST → 참조 셀 목록 추출
├─ evaluator.js         # AST 평가 (연산자/함수 처리, 에러 전파)
├─ dependencyGraph.js   # 셀 의존성 그래프 + 위상 정렬 재계산
├─ index.js             # 공개 API: Sheet 클래스 (이것만 쓰면 됨)
├─ functions/
│  ├─ math.js           # SUM, SUMIF(S), COUNTIF(S), ROUND 계열, RANK.EQ 등
│  ├─ text.js           # LEFT/RIGHT/MID, TEXT, SUBSTITUTE 등
│  ├─ date.js           # DATE, DATEDIF, WEEKDAY 등 (엑셀 1900 날짜 체계)
│  ├─ lookup.js         # VLOOKUP/HLOOKUP/INDEX/MATCH
│  ├─ database.js       # DSUM/DAVERAGE/DCOUNT/DMAX/DMIN
│  ├─ info.js           # ISBLANK/ISERROR/ISNUMBER 등
│  ├─ lazy.js           # IF/IFS/IFERROR/CHOOSE/AND/OR (조건부 평가)
│  └─ index.js          # 함수 이름 → 구현 등록
├─ test.mjs             # node test.mjs 로 실행하는 검증 테스트
└─ example/
   └─ SpreadsheetGrid.jsx  # 실제 동작하는 React 그리드 데모
```

## React 프로젝트에 통합하는 방법

1. `excel-engine/` 폴더 전체를 `src/` 아래로 복사합니다 (예: `src/excel-engine/`).
2. `example/SpreadsheetGrid.jsx`를 참고해서 원하는 페이지에 그리드를 붙입니다.
3. 파일 저장/불러오기가 필요하면 `sheet.serialize()` / `sheet.loadFrom(data)`를
   SheetJS의 `XLSX.utils.sheet_to_json` / `json_to_sheet`와 연결하면 됩니다.

## 기본 사용 예 (엔진만 단독으로)

```javascript
import { Sheet } from './excel-engine/index.js';

const sheet = new Sheet();
sheet.setCellInput('A1', '90');
sheet.setCellInput('A2', '75');
sheet.setCellInput('B1', '=AVERAGE(A1:A2)');

sheet.getDisplayValue('B1'); // 82.5

sheet.onChange((changedAddresses) => {
  console.log('다시 계산된 셀:', changedAddresses);
});

sheet.setCellInput('A1', '100'); // B1이 자동으로 90으로 재계산됨
```

## 검증 방법

```bash
cd excel-engine
node test.mjs
```

`총 35개 중 35개 통과`가 나오면 정상입니다. 함수를 추가/수정할 때마다
`test.mjs`에 케이스를 추가하고 이 명령으로 재확인하세요.

## 알아둘 점 (한계)

- 배열 수식({=...}), 순환 참조 반복 계산 옵션, 조건부 서식, 피벗 등은 구현하지 않았습니다
  (컴활 실기 범위 밖).
- `TEXT` 함수는 자주 쓰는 숫자 서식 코드(0, 0.00, #,##0, 0% 등) 위주로만 지원합니다.
- 그리드 UI(`example/SpreadsheetGrid.jsx`)는 가상 스크롤이 없는 기본 버전입니다.
  행/열이 아주 많아지면(수백~수천 행) 성능을 위해 가상 스크롤 라이브러리
  (예: `react-window`) 적용을 권장합니다.
- 날짜는 엑셀의 1900 날짜 체계(1899-12-30 기준)를 그대로 재현했습니다.

## CLAUDE.md 반영

`CLAUDE_MD_ADDITION.md` 파일 내용을 프로젝트의 `CLAUDE.md`에 그대로 추가하면,
이후 Claude Code에서 이 엔진에 함수를 추가하거나 수정할 때 규칙을 지키며 작업합니다.
