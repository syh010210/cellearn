// src/utils/calc/calcLayout.js
// 블록(문항 하나의 상대 좌표 묶음)들을 시험지 페이지에 배치하는 순수 함수.
//  · 1·3·5번 = 왼쪽, 2·4번 = 오른쪽. (인덱스 i: 띠 = floor(i/2), 좌/우 = i%2)
//  · 오른쪽 시작 열 = 왼쪽 블록들의 최대 폭 + 1(사이 1열 띄움).
//  · 띠(0:1·2 / 1:3·4 / 2:5) 높이 = 그 띠 두 블록 중 큰 값. 띠 사이 빈 행 2개. 첫 띠는 0행(엑셀 1행).
//  · 20열(index 19=T) 초과 시 오류.
//
// 입력: sizes = [{ w, h }, ...] (3개 또는 5개)
// 출력: { origins: [{ r, c }], usedRange: { r1, c1, r2, c2 }, cols, rows }

const ROW_GAP = 2;

export function layoutPage(sizes) {
  const n = sizes.length;
  if (n !== 3 && n !== 5) throw new Error(`블록 수는 3 또는 5여야 합니다 (받음: ${n})`);

  const leftIdx = sizes.map((_, i) => i).filter((i) => i % 2 === 0);
  const maxLeftW = Math.max(...leftIdx.map((i) => sizes[i].w));
  const rightStartCol = maxLeftW + 1;

  // 띠 높이
  const bandCount = Math.floor((n - 1) / 2) + 1;
  const bandHeight = [];
  for (let b = 0; b < bandCount; b++) {
    const hs = [];
    if (sizes[2 * b]) hs.push(sizes[2 * b].h);
    if (sizes[2 * b + 1]) hs.push(sizes[2 * b + 1].h);
    bandHeight[b] = Math.max(...hs);
  }
  const bandTop = [];
  for (let b = 0; b < bandCount; b++) bandTop[b] = b === 0 ? 0 : bandTop[b - 1] + bandHeight[b - 1] + ROW_GAP;

  const origins = sizes.map((s, i) => {
    const b = Math.floor(i / 2);
    const c = i % 2 === 0 ? 0 : rightStartCol;
    return { r: bandTop[b], c };
  });

  // 사용 영역
  let maxCol = 0, maxRow = 0;
  origins.forEach((o, i) => {
    maxCol = Math.max(maxCol, o.c + sizes[i].w - 1);
    maxRow = Math.max(maxRow, o.r + sizes[i].h - 1);
  });
  if (maxCol > 19) throw new Error(`20열(T) 초과: 최대 열 index ${maxCol}. 오른쪽 시작 ${rightStartCol}, 최대 폭 ${maxLeftW}`);

  return { origins, usedRange: { r1: 0, c1: 0, r2: maxRow, c2: maxCol }, cols: maxCol + 1, rows: maxRow + 1 };
}
