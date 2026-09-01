// functions/lazy.js
// 인자를 조건에 따라 선택적으로만 평가해야 하는 함수들
// (예: IF는 참/거짓 분기 중 실제로 쓰이는 쪽만 계산해야 안 쓰는 분기의 에러가 전파되지 않음)
// 각 함수는 (argNodes, context, evaluateFn) 형태로 호출된다.

import { ERRORS, isErrorValue, makeError } from '../errors.js';
import { toBoolean, toNumber } from '../utils.js';
import { flatten } from '../rangeValue.js';

export const IF = (args, context, evaluate) => {
  const condVal = evaluate(args[0], context);
  if (isErrorValue(condVal)) return condVal;
  const cond = toBoolean(condVal);
  if (isErrorValue(cond)) return cond;

  if (cond) {
    return args[1] !== undefined ? evaluate(args[1], context) : true;
  }
  return args[2] !== undefined ? evaluate(args[2], context) : false;
};

export const IFS = (args, context, evaluate) => {
  for (let i = 0; i < args.length; i += 2) {
    const condVal = evaluate(args[i], context);
    if (isErrorValue(condVal)) return condVal;
    const cond = toBoolean(condVal);
    if (isErrorValue(cond)) return cond;
    if (cond) return evaluate(args[i + 1], context);
  }
  return makeError(ERRORS.NA);
};

export const IFERROR = (args, context, evaluate) => {
  const val = evaluate(args[0], context);
  if (isErrorValue(val)) return evaluate(args[1], context);
  return val;
};

export const IFNA = (args, context, evaluate) => {
  const val = evaluate(args[0], context);
  if (isErrorValue(val) && val.error === ERRORS.NA) return evaluate(args[1], context);
  return val;
};

export const CHOOSE = (args, context, evaluate) => {
  const idxVal = evaluate(args[0], context);
  if (isErrorValue(idxVal)) return idxVal;
  const idx = toNumber(idxVal);
  if (isErrorValue(idx)) return idx;
  const rounded = Math.round(idx);
  if (rounded < 1 || rounded >= args.length) return makeError(ERRORS.VALUE);
  return evaluate(args[rounded], context);
};

export const AND = (args, context, evaluate) => {
  let result = true;
  for (const a of args) {
    const v = evaluate(a, context);
    if (isErrorValue(v)) return v;
    for (const flatV of flatten(v)) {
      const b = toBoolean(flatV);
      if (isErrorValue(b)) return b;
      result = result && b;
    }
  }
  return result;
};

export const OR = (args, context, evaluate) => {
  let result = false;
  for (const a of args) {
    const v = evaluate(a, context);
    if (isErrorValue(v)) return v;
    for (const flatV of flatten(v)) {
      const b = toBoolean(flatV);
      if (isErrorValue(b)) return b;
      result = result || b;
    }
  }
  return result;
};
