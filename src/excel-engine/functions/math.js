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
