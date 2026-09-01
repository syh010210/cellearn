// rangeValue.js
// 셀 범위(A1:B10)를 평가한 결과를 담는 래퍼

export function isRangeValue(v) {
  return v !== null && typeof v === 'object' && v.__isRange === true;
}

export function makeRangeValue(values, addresses) {
  return { __isRange: true, values, addresses };
}

// 스칼라든 범위든 1차원 배열로 평탄화
export function flatten(v) {
  if (isRangeValue(v)) return v.values.flat();
  return [v];
}
