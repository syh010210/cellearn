// 실전 모드 문제 뱅크 — src/data/exam/*.json (포맷: docs/EXAM_MODE_SPEC.md)
// P1: 계산작업(함수) 문제만 실동작. 기본/분석/매크로/차트는 P2~P3에서 확장.
const modules = import.meta.glob("./exam/*.json", { eager: true });

export const EXAM_PROBLEMS = Object.values(modules).map((m) => m.default).filter(Boolean);

// 계산작업 함수 유형(차시 1~8)
export const CALC_SUBTYPES = [
  { key: "ref", label: "참조" },
  { key: "text", label: "문자열" },
  { key: "stat", label: "통계" },
  { key: "lookup", label: "찾기/참조" },
  { key: "db", label: "DB 함수" },
  { key: "math", label: "수학" },
  { key: "date", label: "날짜/시간" },
  { key: "logic", label: "논리" },
];

// 전체 시험지 구성(로드맵 표시용). ready=false 는 아직 준비 중(P2~P3).
export const EXAM_SECTIONS = [
  { key: "기본1", label: "기본작업-1 · 데이터 입력", ready: false },
  { key: "기본2", label: "기본작업-2 · 서식", ready: false },
  { key: "기본3", label: "기본작업-3 · 조건부서식(고급필터·텍스트나누기 준비중)", ready: true },
  { key: "계산", label: "계산작업 · 함수 5문제", ready: true },
  { key: "분석1", label: "분석작업-1 · 피벗/부분합/시나리오 등", ready: false },
  { key: "분석2", label: "분석작업-2 · 피벗/부분합/시나리오 등", ready: false },
  { key: "매크로", label: "매크로작업", ready: false },
  { key: "차트", label: "차트작업", ready: false },
];

const calcProblems = () => EXAM_PROBLEMS.filter((p) => p.section === "계산");
const bySection = (sec) => EXAM_PROBLEMS.filter((p) => p.section === sec);

// 기본작업-3 유형(택1): 조건부서식/고급필터/텍스트나누기
export const BASIC3_SUBTYPES = [
  { key: "condformat", label: "조건부 서식" },
  { key: "advfilter", label: "고급필터" },
  { key: "text2col", label: "텍스트 나누기" },
];
export function basic3AvailableSubtypes() {
  const have = new Set(bySection("기본3").map((p) => p.subtype));
  return BASIC3_SUBTYPES.map((s) => ({ ...s, ready: have.has(s.key) }));
}
export function pickBasic3(subtype) {
  const pool = bySection("기본3").filter((p) => !subtype || p.subtype === subtype);
  return pool.length ? { ...pool[Math.floor(Math.random() * pool.length)], sheetName: "기본작업-3" } : null;
}

export function calcAvailableSubtypes() {
  const have = new Set(calcProblems().map((p) => p.subtype));
  return CALC_SUBTYPES.filter((s) => have.has(s.key));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 선택 유형(빈 배열=전체)으로 계산작업 문제 count개 추출
export function pickCalc(subtypeKeys = [], count = 5) {
  const pool = subtypeKeys.length
    ? calcProblems().filter((p) => subtypeKeys.includes(p.subtype))
    : calcProblems();
  return shuffle(pool).slice(0, count).map((p, i) => ({ ...p, sheetName: `계산${i + 1}` }));
}
