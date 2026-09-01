// 실전 모드 문제 뱅크 — src/data/exam/*.json 을 모아 주제별로 추출한다.
// 새 문제는 exam/ 폴더에 JSON 파일로 추가하면 자동 포함된다. (포맷: docs/EXAM_MODE_SPEC.md)
const modules = import.meta.glob("./exam/*.json", { eager: true });

export const EXAM_PROBLEMS = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean);

// 주제 분류 (차시 기반). label 은 UI 노출용.
export const EXAM_TOPICS = [
  { key: "ref", label: "상대·절대 참조" },
  { key: "text", label: "문자열 함수" },
  { key: "stat", label: "통계 함수" },
  { key: "lookup", label: "찾기·참조 함수" },
  { key: "db", label: "데이터베이스 함수" },
  { key: "math", label: "수학·삼각 함수" },
  { key: "date", label: "날짜·시간 함수" },
  { key: "logic", label: "논리 함수" },
  { key: "format", label: "셀 서식" },
  { key: "filter", label: "필터" },
  { key: "condformat", label: "조건부 서식" },
  { key: "sort", label: "정렬" },
  { key: "subtotal", label: "부분합" },
  { key: "pivot", label: "피벗 테이블" },
  { key: "analysis", label: "데이터 분석 도구" },
  { key: "macro", label: "매크로" },
  { key: "chart", label: "차트" },
];

// 실제 문제가 1개 이상 있는 주제만 (UI 칩 노출용)
export function availableTopics() {
  const have = new Set(EXAM_PROBLEMS.flatMap((p) => p.topics || []));
  return EXAM_TOPICS.filter((t) => have.has(t.key));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 주제(비었으면 전체)로 필터 → 셔플 → count개. 부족하면 있는 만큼.
export function pickProblems(topicKeys = [], count = 5) {
  const pool = topicKeys.length
    ? EXAM_PROBLEMS.filter((p) => (p.topics || []).some((t) => topicKeys.includes(t)))
    : EXAM_PROBLEMS;
  return shuffle(pool).slice(0, count);
}
