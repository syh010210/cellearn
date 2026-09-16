// (scripts 전용) 3절 대유형 분포를 만족하는 임의 소유형 조합 선택. 프로덕션 구성기는 3d-3에서 src 에.
// 난이도별 가용 풀(3d-0 표: 해당 난이도 변형이 있는 소유형만).
import { makeRng } from "../src/utils/calc/calcAssembler.js";

export const POOLS = {
  기본: { A: ["A-1", "A-2", "A-3", "A-4", "A-5"], B: ["B-1", "B-2", "B-3", "B-4", "B-5"], C: ["C-1", "C-2"], D: ["D-1", "D-2", "D-5"] },
  어려움: { A: ["A-1", "A-2", "A-3", "A-4", "A-5", "A-6"], B: ["B-1", "B-2", "B-3", "B-5", "B-6"], C: ["C-1", "C-2", "C-3"], D: ["D-1", "D-2", "D-3", "D-4"] },
};

// 5문항: A2·B1·C1·D1, 3문항: A1·B1·C1 (3절 대유형 분포). 소유형은 대유형 안에서 중복 없이.
export function pickSubtypes(rng, difficulty, n) {
  const p = POOLS[difficulty];
  const take = (arr, k) => rng.shuffle(arr).slice(0, k);
  if (n === 5) return rng.shuffle([...take(p.A, 2), ...take(p.B, 1), ...take(p.C, 1), ...take(p.D, 1)]);
  if (n === 3) return rng.shuffle([...take(p.A, 1), ...take(p.B, 1), ...take(p.C, 1)]);
  throw new Error("문항 수는 3 또는 5");
}

// 시드 하나로 (소유형 조합 + composeCalc 입력) 만들기 — 벤치·테스트·파일 생성 공용.
export function subtypesForSeed(seed, difficulty, n) {
  return pickSubtypes(makeRng(`sub~${seed}`), difficulty, n);
}
