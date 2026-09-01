# 실전 모드(Exam Mode) 설계

> 전 차시 완주 후 열리는 모드. 사용자가 **원하는 주제를 골라** 실제 시험 형식의 문제를
> **원하는 만큼 생성**해 무제한으로 푼다. 시험 직전 감각 유지가 목적.

## 1. 문제 공급 방식 — 결정

두 가지 경로가 있다. **MVP는 A(문제 뱅크)** 로 가고, B는 2차로 얹는다.

### A. 문제 뱅크(오프라인 생성) — 채택
- 사용자가 넣어줄 **최근 5개년 기출 폴더**를 근거로, 내가(세션에서) 다수의 문제를
  `src/data/exam/*.json` 으로 **미리 저작**해 둔다(주제·난이도 태깅).
- 런타임은 LLM 호출 없이 **주제로 필터 → 셔플 → N개 추출**만 한다.
- 장점: 무료·즉시·안정·테스트 가능. 오답/정답 수식이 검증된 문제만 제공.

### B. 실시간 생성(LLM) — 2차 확장(선택)
- Supabase Edge Function `generate-exam` 이 Claude API에 (주제 + 뱅크의 few-shot 예시)를
  주고 새 문제 JSON을 받아 스키마 검증 후 반환.
- 장점: 무한 변형. 단점: API 키·비용·지연·품질 검증 필요. **A가 충분히 쌓이면 검토**.

## 2. 문제 데이터 포맷 (`src/data/exam/*.json`)

기존 자산 재사용: 엑셀형은 MiniExcel의 `practice` 구조, 객관식은 lesson quiz 구조와 동일.

```jsonc
{
  "id": "ex-ref-0001",
  "type": "excel",            // "excel" | "quiz"
  "topics": ["ref"],          // EXAM_TOPICS 의 key 배열(복수 가능)
  "difficulty": "기본",        // "기본" | "심화"
  "grade": "2급",             // "2급" | "1급"
  "title": "분기별 합계",
  // type === "excel":
  "practice": {               // MiniExcel 과 동일 구조
    "instruction": "D2에 =B2+C2 …",
    "cols": ["A","B","C","D"],
    "rows": [[{ "val":"이름","editable":false }, …], …]
  },
  // type === "quiz":
  "question": "…", "options": ["…"], "answer": 1, "explanation": "…"
}
```

> 엑셀형은 `MiniExcel`이 그대로 렌더·채점(수식 문자열/계산값 비교)한다.
> 객관식은 `ExamView`가 인라인으로 렌더·채점한다.

## 3. 주제 분류 (`EXAM_TOPICS`, examBank.js)

차시 기반. 초기 매핑(2급 범위 위주, 1급 확장 여지):

| key | label | 근거 차시 |
|---|---|---|
| ref | 상대·절대·혼합 참조 | 1 |
| text | 문자열 함수 | 2 |
| stat | 통계 함수 | 3 |
| lookup | 찾기·참조 함수 | 4 |
| db | 데이터베이스 함수 | 5 |
| math | 수학·삼각 함수 | 6 |
| date | 날짜·시간 함수 | 7 |
| logic | 논리 함수 | 8 |
| format | 셀 서식 | 9 |
| filter | 필터 | 10 |
| condformat | 조건부 서식 | 11 |
| sort | 정렬 | 12 |
| subtotal | 부분합 | 13 |
| pivot | 피벗 테이블 | 14 |
| analysis | 데이터표·시나리오·목표값·통합 | 15–18 |
| macro | 매크로 | 19 |
| chart | 차트 | 20 |

## 4. 잠금·접근
- **해제 조건**: 전 일차 클리어(`allDaysCleared`) 또는 관리자(`isAdmin`).
- 사이드바에 **🎯 실전 모드** 항목. 미완주면 자물쇠 + 클릭 시 안내.
- `App` view `"exam"` → 해제 시 `ExamView`, 아니면 잠금 안내.

## 5. ExamView 흐름
1. **주제 선택**(칩 다중 선택, 미선택=전체) + **문항 수**(5/10/20) 선택.
2. **문제 생성** → `pickProblems(topics, count)` 로 뱅크에서 셔플·추출.
3. 문제 렌더: 엑셀형=MiniExcel(자체 채점), 객관식=인라인(제출 시 채점·해설).
4. **다시 생성**으로 새 세트. (2차: 세트 종합 점수·타이머·시험지 PDF)

## 6. 파일 구조
```
src/data/exam/                 ← 문제 JSON 뱅크 (여기에 계속 추가)
src/data/examBank.js           ← glob 로드 + EXAM_TOPICS + pickProblems
src/components/exam/ExamView.jsx
src/data/days.js               ← allDaysCleared() 추가
```

## 7. 남은 작업 (데이터 오면)
- 사용자 제공 최근 5개년 폴더 → 주제·난이도별 문제 JSON 다수 저작해 `src/data/exam/`에 채움.
- (선택) B안 Edge Function `generate-exam` + 스키마 검증.
- (선택) 종합 채점·타이머·오답 → 오답노트 연동.
