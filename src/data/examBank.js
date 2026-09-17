// 실전 모드 문제 뱅크 — src/data/exam/*.json (포맷: docs/EXAM_MODE_SPEC.md)
// 계산작업은 JSON 뱅크가 아니라 생성기(composeExamCalc)로 즉석 출제한다(3d-3).
import { composeExamCalc } from "../utils/calc/composeExamCalc.js";
const modules = import.meta.glob("./exam/*.json", { eager: true });

export const EXAM_PROBLEMS = Object.values(modules).map((m) => m.default).filter(Boolean);

// 난이도(UI basic|hard) → 생성기 난이도
const DIFF = { basic: "기본", hard: "어려움" };

// 계산작업 문제 = 인스턴스 1개(시트 "계산작업"). 화면 표시는 문항별 지시문+▶ 만, 채점·파일 생성용
//  전체 인스턴스는 problem.instance 에 보관(스냅샷 저장 대상). 기준 수식·기대값은 화면에 넣지 않는다.
export function composeCalcProblem(seed, { count = 5, difficulty = "basic" } = {}) {
  const inst = composeExamCalc(seed, { count, difficulty: DIFF[difficulty] || "기본" });
  return {
    id: `calc-${seed}`, section: "계산", sheetName: "계산작업", title: "",
    instance: inst,
    items: inst.items.map((it) => ({
      no: it.no, points: 8,
      text: it.text + (it.notes && it.notes.length ? "\n" + it.notes.map((nt) => "▶ " + nt).join("\n") : ""),
    })),
  };
}

// 전체 시험지 구성(로드맵 표시용). ready=false 는 아직 준비 중(P2~P3).
export const EXAM_SECTIONS = [
  { key: "기본1", label: "기본작업-1 · 데이터 입력", ready: false },
  { key: "기본2", label: "기본작업-2 · 서식", ready: true },
  { key: "기본3", label: "기본작업-3 · 조건부서식(고급필터 · 텍스트나누기 준비중)", ready: true },
  { key: "계산", label: "계산작업 · 함수 5문제", ready: true },
  { key: "분석1", label: "분석작업-1 · 정렬(부분합 · 통합 · 피벗 등 확장중)", ready: true },
  { key: "분석2", label: "분석작업-2 · 정렬(부분합 · 통합 · 피벗 등 확장중)", ready: true },
  { key: "매크로", label: "매크로작업", ready: true },
  { key: "차트", label: "차트작업 · 종류 검사", ready: true },
];

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

// 분석작업 유형(택2): 피벗/부분합/시나리오/통합/목표값/정렬/데이터표
export const ANALYSIS_SUBTYPES = [
  { key: "sort", label: "정렬" },
  { key: "subtotal", label: "부분합" },
  { key: "consolidate", label: "통합" },
  { key: "goalseek", label: "목표값" },
  { key: "datatable", label: "데이터표" },
  { key: "pivot", label: "피벗" },
  { key: "scenario", label: "시나리오" },
];
export function analysisAvailableSubtypes() {
  const have = new Set(bySection("분석").map((p) => p.subtype));
  return ANALYSIS_SUBTYPES.map((s) => ({ ...s, ready: have.has(s.key) }));
}
export function pickAnalysis(subtypeKeys = []) {
  const chosen = [];
  subtypeKeys.slice(0, 2).forEach((st, i) => {
    const pool = bySection("분석").filter((p) => p.subtype === st);
    if (pool.length) chosen.push({ ...pool[Math.floor(Math.random() * pool.length)], sheetName: `분석작업-${i + 1}` });
  });
  return chosen;
}

// 기본작업-2 (서식) — 지금은 한 문제. sheetName 고정.
export function pickBasic2() {
  const pool = bySection("기본2");
  return pool.length ? { ...pool[Math.floor(Math.random() * pool.length)], sheetName: "기본작업-2" } : null;
}

// 매크로/차트 (고정 슬롯)
export function sectionReady(section) { return bySection(section).length > 0; }
export function pickSection(section, sheetName) {
  const pool = bySection(section);
  return pool.length ? { ...pool[Math.floor(Math.random() * pool.length)], sheetName } : null;
}

