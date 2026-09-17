// src/utils/calc/calcLayout.js
// 블록(문항 하나의 상대 좌표 묶음)들을 시험지 페이지에 배치하는 순수 함수.
//  · 슬롯: 띠(band) × 좌/우. 5블록 = (0,L)(0,R)(1,L)(1,R)(2,L), 3블록 = (0,L)(0,R)(1,L).
//  · 오른쪽 시작 열 = 왼쪽 블록들의 최대 폭 + 1(사이 1열 띄움). 띠 높이 = 그 띠 블록 중 큰 값.
//    띠 사이 빈 행 2개. 첫 띠는 0행(엑셀 1행).
//  · 문항→슬롯 배정을 순열로 평가해 비용(사용 열 폭 + 20열 초과 페널티) 최소를 고른다(결정론적: 동률이면
//    먼저 나온 순열). origins 는 입력 블록 순서(index)에 맞춰 돌려주므로 buildInstance 는 그대로 쓴다.
//  · 블록 0(=표1)은 항상 좌상단 슬롯(A1)에 고정한다: 채점 하네스가 표1 accept 를 A1 기준으로 평가하고,
//    [표1]이 읽기 시작점이어야 한다. 나머지 블록만 남은 슬롯에 재배정한다.
//  · 20열(index 19=T) 초과 시(최적 배정에서도) 오류.
//
// 입력: sizes = [{ w, h }, ...] (3개 또는 5개)
// 출력: { origins: [{ r, c }], usedRange: { r1, c1, r2, c2 }, cols, rows, cost }

const ROW_GAP = 2;
const OVERFLOW_PENALTY = 100000;

// 위치 목록(읽기 순서). 각 원소 { band, side } side 0=왼쪽 1=오른쪽.
function slotPositions(n) {
  const bandCount = Math.floor((n - 1) / 2) + 1;
  const pos = [];
  for (let b = 0; b < bandCount; b++) { pos.push({ band: b, side: 0 }); if (pos.length < n) pos.push({ band: b, side: 1 }); }
  return pos.slice(0, n);
}

// 한 배정(assign[slot] = 블록 index)의 origins·사용영역·비용 계산.
function placeAssignment(sizes, positions, assign) {
  const bandCount = Math.max(...positions.map((p) => p.band)) + 1;
  const leftW = [], rightW = [], bandH = Array.from({ length: bandCount }, () => 0);
  positions.forEach((p, slot) => {
    const s = sizes[assign[slot]];
    (p.side === 0 ? leftW : rightW).push(s.w);
    if (s.h > bandH[p.band]) bandH[p.band] = s.h;
  });
  const maxLeftW = leftW.length ? Math.max(...leftW) : 0;
  const rightStart = maxLeftW + 1;
  const bandTop = []; for (let b = 0; b < bandCount; b++) bandTop[b] = b === 0 ? 0 : bandTop[b - 1] + bandH[b - 1] + ROW_GAP;

  const origins = new Array(sizes.length);
  let maxCol = 0, maxRow = 0;
  positions.forEach((p, slot) => {
    const bi = assign[slot], s = sizes[bi];
    const c = p.side === 0 ? 0 : rightStart, r = bandTop[p.band];
    origins[bi] = { r, c };
    maxCol = Math.max(maxCol, c + s.w - 1);
    maxRow = Math.max(maxRow, r + s.h - 1);
  });
  const cost = maxCol + (maxCol > 19 ? OVERFLOW_PENALTY : 0);
  return { origins, maxCol, maxRow, cost };
}

// 순열 생성(결정론적: 사전순).
function* permutations(arr) {
  if (arr.length <= 1) { yield arr.slice(); return; }
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) yield [arr[i], ...p];
  }
}

export function layoutPage(sizes) {
  const n = sizes.length;
  if (n !== 3 && n !== 5) throw new Error(`블록 수는 3 또는 5여야 합니다 (받음: ${n})`);

  const positions = slotPositions(n);
  let best = null;
  const rest = sizes.map((_, i) => i).slice(1);          // 블록 0 은 슬롯 0(A1)에 고정
  for (const p of permutations(rest)) {
    const assign = [0, ...p];
    const cand = placeAssignment(sizes, positions, assign);
    if (!best || cand.cost < best.cost) best = cand;      // 동률이면 먼저 나온 순열 유지
  }
  if (best.maxCol > 19) throw new Error(`20열(T) 초과: 최적 배정에서도 최대 열 index ${best.maxCol}`);

  return { origins: best.origins, usedRange: { r1: 0, c1: 0, r2: best.maxRow, c2: best.maxCol }, cols: best.maxCol + 1, rows: best.maxRow + 1, cost: best.cost };
}
