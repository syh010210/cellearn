// src/utils/calc/calcLayout.js
// 블록(문항 하나의 상대 좌표 묶음)들을 시험지 페이지에 배치하는 순수 함수.
//  · 슬롯: 띠(band) × 좌/우. 5블록 = (0,L)(0,R)(1,L)(1,R)(2,L), 3블록 = (0,L)(0,R)(1,L). 마지막 슬롯은 짝 없음.
//  · 오른쪽 시작 열 = 짝 있는 줄(L·R 모두 있는 띠)의 왼쪽 블록 최대 폭 + 1. 짝 없는 블록은 계산에서 제외
//    (그 블록은 col 0 에서 폭만큼 쓰되 다른 띠의 오른쪽 열과 행이 달라 겹치지 않는다).
//  · 문항→슬롯 배정을 전수 순열로 평가해 비용 최소를 고른다(결정론적: 동률이면 먼저 나온 순열).
//    비용 = 빈열 합 × W_GAP + 전체 사용 열 수 + 오른쪽 블록 너비 불일치 + 20열 초과 페널티.
//    ([표1] A1 고정 제약 없음 — 하네스는 item.origin 으로 블록-상대 식을 옮긴다.)
//  · 띠 높이 = 그 띠 블록 중 큰 값, 띠 사이 빈 행 2개, 첫 띠는 0행.
//  · 20열(index 19=T) 초과 시(최적 배정에서도) 오류.
//
// 입력: sizes = [{ w, h }, ...] (3개 또는 5개)
// 출력: { origins, usedRange, cols, rows, cost, gaps }

const ROW_GAP = 2;
const OVERFLOW_PENALTY = 1e6;
const W_GAP = 50;

function slotPositions(n) {
  const bandCount = Math.floor((n - 1) / 2) + 1;
  const pos = [];
  for (let b = 0; b < bandCount; b++) { pos.push({ band: b, side: 0 }); if (pos.length < n) pos.push({ band: b, side: 1 }); }
  return pos.slice(0, n);
}

function placeAssignment(sizes, positions, assign) {
  const bandCount = Math.max(...positions.map((p) => p.band)) + 1;
  const bandH = Array.from({ length: bandCount }, () => 0);
  const bandHasR = Array.from({ length: bandCount }, () => false);
  const leftW = Array.from({ length: bandCount }, () => 0), rightW = Array.from({ length: bandCount }, () => 0);
  positions.forEach((p, slot) => {
    const s = sizes[assign[slot]];
    if (s.h > bandH[p.band]) bandH[p.band] = s.h;
    if (p.side === 0) leftW[p.band] = s.w; else { rightW[p.band] = s.w; bandHasR[p.band] = true; }
  });
  const pairedBands = [];
  for (let b = 0; b < bandCount; b++) if (bandHasR[b]) pairedBands.push(b);
  const maxPairedLeftW = pairedBands.length ? Math.max(...pairedBands.map((b) => leftW[b])) : 0;
  const rightStart = maxPairedLeftW + 1;

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

  const gaps = pairedBands.map((b) => rightStart - leftW[b]);            // 왼쪽 블록 끝 ~ 오른쪽 시작 사이 빈 열 수
  const gapSum = gaps.reduce((a, b) => a + b, 0);
  const maxRightW = pairedBands.length ? Math.max(...pairedBands.map((b) => rightW[b])) : 0;
  const widthMismatch = pairedBands.reduce((a, b) => a + (maxRightW - rightW[b]), 0);
  const cost = W_GAP * gapSum + maxCol + widthMismatch + (maxCol > 19 ? OVERFLOW_PENALTY : 0);
  return { origins, maxCol, maxRow, cost, gaps };
}

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
  for (const assign of permutations(sizes.map((_, i) => i))) {
    const cand = placeAssignment(sizes, positions, assign);
    if (!best || cand.cost < best.cost) best = cand;
  }
  if (best.maxCol > 19) throw new Error(`20열(T) 초과: 최적 배정에서도 최대 열 index ${best.maxCol}`);
  return { origins: best.origins, usedRange: { r1: 0, c1: 0, r2: best.maxRow, c2: best.maxCol }, cols: best.maxCol + 1, rows: best.maxRow + 1, cost: best.cost, gaps: best.gaps };
}
