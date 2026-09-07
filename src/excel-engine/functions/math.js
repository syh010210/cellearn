// functions/math.js
import { ERRORS, isErrorValue, makeError } from '../errors.js';
import { toNumber, matchCriteria } from '../utils.js';
import { flatten, isRangeValue } from '../rangeValue.js';

function numbersOnly(args) {
  const nums = [];
  for (const a of args) {
    const isRange = isRangeValue(a);
    for (const v of flatten(a)) {
      if (isErrorValue(v)) return v;
      if (typeof v === 'number') {
        nums.push(v);
      } else if (!isRange && typeof v === 'string' && v.trim() !== '') {
        // 직접 인자로 넘긴 문자열 숫자만 변환 시도 (범위 안 텍스트는 무시)
        const n = Number(v);
        if (!isNaN(n)) nums.push(n);
      }
    }
  }
  return nums;
}

export const SUM = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  return nums.reduce((a, b) => a + b, 0);
};

export const AVERAGE = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  if (nums.length === 0) return makeError(ERRORS.DIV0);
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

export const MEDIAN = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  if (nums.length === 0) return makeError(ERRORS.NUM);
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const COUNT = (args) => {
  let c = 0;
  for (const a of args) {
    for (const v of flatten(a)) {
      if (typeof v === 'number') c++;
    }
  }
  return c;
};

export const COUNTA = (args) => {
  let c = 0;
  for (const a of args) {
    for (const v of flatten(a)) {
      if (v !== undefined && v !== null && v !== '') c++;
    }
  }
  return c;
};

export const COUNTBLANK = (args) => {
  let c = 0;
  for (const a of args) {
    for (const v of flatten(a)) {
      if (v === undefined || v === null || v === '') c++;
    }
  }
  return c;
};

function sumIf(range, criteria, sumRange) {
  const rangeVals = flatten(range);
  const sumVals = sumRange ? flatten(sumRange) : rangeVals;
  let total = 0;
  for (let i = 0; i < rangeVals.length; i++) {
    if (matchCriteria(rangeVals[i], criteria)) {
      const v = sumVals[i];
      if (typeof v === 'number') total += v;
    }
  }
  return total;
}

export const SUMIF = ([range, criteria, sumRange]) => sumIf(range, criteria, sumRange);

export const SUMIFS = ([sumRange, ...criteriaPairs]) => {
  const sumVals = flatten(sumRange);
  const pairs = [];
  for (let i = 0; i < criteriaPairs.length; i += 2) {
    pairs.push({ range: flatten(criteriaPairs[i]), criteria: criteriaPairs[i + 1] });
  }
  let total = 0;
  for (let i = 0; i < sumVals.length; i++) {
    let ok = true;
    for (const p of pairs) {
      if (!matchCriteria(p.range[i], p.criteria)) { ok = false; break; }
    }
    if (ok && typeof sumVals[i] === 'number') total += sumVals[i];
  }
  return total;
};

export const COUNTIF = ([range, criteria]) => {
  const vals = flatten(range);
  return vals.filter((v) => matchCriteria(v, criteria)).length;
};

export const COUNTIFS = (args) => {
  const pairs = [];
  for (let i = 0; i < args.length; i += 2) {
    pairs.push({ range: flatten(args[i]), criteria: args[i + 1] });
  }
  const len = pairs[0]?.range.length || 0;
  let count = 0;
  for (let i = 0; i < len; i++) {
    if (pairs.every((p) => matchCriteria(p.range[i], p.criteria))) count++;
  }
  return count;
};

export const AVERAGEIF = ([range, criteria, avgRange]) => {
  const rangeVals = flatten(range);
  const avgVals = avgRange ? flatten(avgRange) : rangeVals;
  let total = 0;
  let cnt = 0;
  for (let i = 0; i < rangeVals.length; i++) {
    if (matchCriteria(rangeVals[i], criteria) && typeof avgVals[i] === 'number') {
      total += avgVals[i];
      cnt++;
    }
  }
  if (cnt === 0) return makeError(ERRORS.DIV0);
  return total / cnt;
};

export const AVERAGEIFS = ([avgRange, ...criteriaPairs]) => {
  const avgVals = flatten(avgRange);
  const pairs = [];
  for (let i = 0; i < criteriaPairs.length; i += 2) {
    pairs.push({ range: flatten(criteriaPairs[i]), criteria: criteriaPairs[i + 1] });
  }
  let total = 0;
  let cnt = 0;
  for (let i = 0; i < avgVals.length; i++) {
    if (pairs.every((p) => matchCriteria(p.range[i], p.criteria)) && typeof avgVals[i] === 'number') {
      total += avgVals[i];
      cnt++;
    }
  }
  if (cnt === 0) return makeError(ERRORS.DIV0);
  return total / cnt;
};

export const ROUND = ([num, digits]) => {
  const n = toNumber(num);
  const d = toNumber(digits ?? 0);
  if (isErrorValue(n)) return n;
  if (isErrorValue(d)) return d;
  const factor = Math.pow(10, d);
  const shifted = n * factor;
  const rounded = n >= 0 ? Math.round(shifted) : -Math.round(-shifted);
  return rounded / factor;
};

export const ROUNDUP = ([num, digits]) => {
  const n = toNumber(num);
  const d = toNumber(digits ?? 0);
  if (isErrorValue(n)) return n;
  if (isErrorValue(d)) return d;
  const factor = Math.pow(10, d);
  return n >= 0 ? Math.ceil(n * factor) / factor : Math.floor(n * factor) / factor;
};

export const ROUNDDOWN = ([num, digits]) => {
  const n = toNumber(num);
  const d = toNumber(digits ?? 0);
  if (isErrorValue(n)) return n;
  if (isErrorValue(d)) return d;
  const factor = Math.pow(10, d);
  return n >= 0 ? Math.floor(n * factor) / factor : Math.ceil(n * factor) / factor;
};

export const MAX = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  return nums.length ? Math.max(...nums) : 0;
};

export const MIN = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  return nums.length ? Math.min(...nums) : 0;
};

export const MOD = ([n, d]) => {
  const a = toNumber(n);
  const b = toNumber(d);
  if (isErrorValue(a)) return a;
  if (isErrorValue(b)) return b;
  if (b === 0) return makeError(ERRORS.DIV0);
  return a - b * Math.floor(a / b);
};

export const TRUNC = ([num, digits]) => {
  const n = toNumber(num);
  const d = toNumber(digits ?? 0);
  if (isErrorValue(n)) return n;
  if (isErrorValue(d)) return d;
  const factor = Math.pow(10, d);
  return n >= 0 ? Math.floor(n * factor) / factor : Math.ceil(n * factor) / factor;
};

export const ABS = ([num]) => {
  const n = toNumber(num);
  return isErrorValue(n) ? n : Math.abs(n);
};

export const LARGE = ([range, k]) => {
  const nums = flatten(range).filter((v) => typeof v === 'number').sort((a, b) => b - a);
  const kk = toNumber(k);
  if (isErrorValue(kk)) return kk;
  if (kk < 1 || kk > nums.length) return makeError(ERRORS.NUM);
  return nums[kk - 1];
};

export const SMALL = ([range, k]) => {
  const nums = flatten(range).filter((v) => typeof v === 'number').sort((a, b) => a - b);
  const kk = toNumber(k);
  if (isErrorValue(kk)) return kk;
  if (kk < 1 || kk > nums.length) return makeError(ERRORS.NUM);
  return nums[kk - 1];
};

export const RANK_EQ = ([num, range, order]) => {
  const n = toNumber(num);
  if (isErrorValue(n)) return n;
  const nums = flatten(range).filter((v) => typeof v === 'number');
  const desc = !order || toNumber(order) === 0;
  const sorted = [...nums].sort((a, b) => (desc ? b - a : a - b));
  const idx = sorted.indexOf(n);
  if (idx === -1) return makeError(ERRORS.NA);
  return idx + 1;
};

// 동점이면 해당 순위들의 평균을 부여
export const RANK_AVG = ([num, range, order]) => {
  const n = toNumber(num);
  if (isErrorValue(n)) return n;
  const nums = flatten(range).filter((v) => typeof v === 'number');
  const desc = !order || toNumber(order) === 0;
  const sorted = [...nums].sort((a, b) => (desc ? b - a : a - b));
  const first = sorted.indexOf(n);
  if (first === -1) return makeError(ERRORS.NA);
  let last = first;
  while (last + 1 < sorted.length && sorted[last + 1] === n) last++;
  return ((first + 1) + (last + 1)) / 2;
};

export const INT = ([num]) => {
  const n = toNumber(num);
  return isErrorValue(n) ? n : Math.floor(n);
};

export const POWER = ([num, power]) => {
  const n = toNumber(num);
  const p = toNumber(power);
  if (isErrorValue(n)) return n;
  if (isErrorValue(p)) return p;
  const r = Math.pow(n, p);
  if (!isFinite(r) || isNaN(r)) return makeError(ERRORS.NUM);
  return r;
};

export const RAND = () => Math.random();

export const RANDBETWEEN = ([bottom, top]) => {
  const b = toNumber(bottom);
  const t = toNumber(top);
  if (isErrorValue(b)) return b;
  if (isErrorValue(t)) return t;
  const lo = Math.ceil(b);
  const hi = Math.floor(t);
  if (lo > hi) return makeError(ERRORS.NUM);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
};

// AVERAGEA/MAXA/MINA용: 텍스트=0, TRUE=1, FALSE=0, 숫자=그대로, 빈 셀=무시. 에러는 전파.
function numbersWithText(args) {
  const nums = [];
  for (const a of args) {
    for (const v of flatten(a)) {
      if (isErrorValue(v)) return v;
      if (typeof v === 'number') nums.push(v);
      else if (typeof v === 'boolean') nums.push(v ? 1 : 0);
      else if (typeof v === 'string' && v !== '') nums.push(0);
    }
  }
  return nums;
}

export const AVERAGEA = (args) => {
  const nums = numbersWithText(args);
  if (isErrorValue(nums)) return nums;
  if (nums.length === 0) return makeError(ERRORS.DIV0);
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

export const MAXA = (args) => {
  const nums = numbersWithText(args);
  if (isErrorValue(nums)) return nums;
  return nums.length ? Math.max(...nums) : 0;
};

export const MINA = (args) => {
  const nums = numbersWithText(args);
  if (isErrorValue(nums)) return nums;
  return nums.length ? Math.min(...nums) : 0;
};

// MODE.SNGL: 가장 자주 나오는 숫자. 모두 한 번씩이면 #N/A.
export const MODE_SNGL = (args) => {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  const counts = new Map();
  let bestVal = null;
  let bestCount = 1;
  for (const n of nums) {
    const c = (counts.get(n) || 0) + 1;
    counts.set(n, c);
    if (c > bestCount) { bestCount = c; bestVal = n; }
  }
  if (bestVal === null) return makeError(ERRORS.NA);
  return bestVal;
};

// STDEV.S / VAR.S: 표본 기준(n-1). 데이터 2개 미만이면 #DIV/0!.
function sampleVariance(args) {
  const nums = numbersOnly(args);
  if (isErrorValue(nums)) return nums;
  if (nums.length < 2) return makeError(ERRORS.DIV0);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const ss = nums.reduce((a, b) => a + (b - mean) ** 2, 0);
  return ss / (nums.length - 1);
}

export const VAR_S = (args) => sampleVariance(args);

export const STDEV_S = (args) => {
  const v = sampleVariance(args);
  return isErrorValue(v) ? v : Math.sqrt(v);
};

export const SUMPRODUCT = (args) => {
  const arrays = args.map((a) => flatten(a));
  const len = arrays[0]?.length || 0;
  let total = 0;
  for (let i = 0; i < len; i++) {
    let product = 1;
    for (const arr of arrays) {
      const v = arr[i];
      product *= typeof v === 'number' ? v : 0;
    }
    total += product;
  }
  return total;
};
