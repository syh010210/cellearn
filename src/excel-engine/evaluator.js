// evaluator.js
// AST를 순회하며 실제 값을 계산한다.
// context는 { getCellValue(address) } 형태로 셀 조회를 제공해야 한다.

import { parseRangeRef, expandRange } from './cellAddress.js';
import { ERRORS, isErrorValue, makeError } from './errors.js';
import { toNumber, toStr } from './utils.js';
import { makeRangeValue, isRangeValue } from './rangeValue.js';
import { FUNCTIONS, LAZY_FUNCTIONS } from './functions/index.js';

// 에러 값 자체를 인자로 받아 검사해야 하는 함수 (에러를 미리 가로채면 안 됨)
const ERROR_AWARE_FUNCTIONS = new Set([
  'ISERROR', 'ISNA', 'ISBLANK', 'ISNUMBER', 'ISTEXT', 'ISLOGICAL',
]);

export function evaluate(node, context) {
  switch (node.type) {
    case 'NumberLiteral':
      return node.value;
    case 'StringLiteral':
      return node.value;
    case 'BooleanLiteral':
      return node.value;
    case 'ErrorLiteral':
      return makeError(node.value);

    case 'CellRef': {
      const v = context.getCellValue(node.ref);
      return v === undefined ? 0 : v;
    }

    case 'RangeRef': {
      const range = parseRangeRef(node.ref);
      if (!range) return makeError(ERRORS.REF);
      const addresses = expandRange(range);
      const values = addresses.map((row) =>
        row.map((addr) => {
          const v = context.getCellValue(addr);
          return v === undefined ? '' : v;
        })
      );
      return makeRangeValue(values, addresses);
    }

    case 'UnaryOp': {
      const val = evaluate(node.operand, context);
      if (isErrorValue(val)) return val;
      const num = toNumber(val);
      if (isErrorValue(num)) return num;
      return node.op === '-' ? -num : num;
    }

    case 'BinaryOp':
      return evalBinary(node, context);

    case 'FunctionCall':
      return evalFunctionCall(node, context);

    default:
      return makeError(ERRORS.VALUE);
  }
}

function evalBinary(node, context) {
  const { op } = node;

  if (op === '&') {
    const l = evaluate(node.left, context);
    if (isErrorValue(l)) return l;
    const r = evaluate(node.right, context);
    if (isErrorValue(r)) return r;
    return toStr(l) + toStr(r);
  }

  if (['=', '<>', '<', '<=', '>', '>='].includes(op)) {
    const l = evaluate(node.left, context);
    if (isErrorValue(l)) return l;
    const r = evaluate(node.right, context);
    if (isErrorValue(r)) return r;
    return compare(l, r, op);
  }

  const l = evaluate(node.left, context);
  if (isErrorValue(l)) return l;
  const r = evaluate(node.right, context);
  if (isErrorValue(r)) return r;
  const ln = toNumber(l);
  if (isErrorValue(ln)) return ln;
  const rn = toNumber(r);
  if (isErrorValue(rn)) return rn;

  switch (op) {
    case '+': return ln + rn;
    case '-': return ln - rn;
    case '*': return ln * rn;
    case '/': return rn === 0 ? makeError(ERRORS.DIV0) : ln / rn;
    case '^': return Math.pow(ln, rn);
    default: return makeError(ERRORS.VALUE);
  }
}

function compare(l, r, op) {
  let a = l;
  let b = r;

  if (typeof a === 'string' && typeof b === 'string') {
    a = a.toUpperCase();
    b = b.toUpperCase();
  } else if (typeof a !== typeof b) {
    // 타입이 다르면 엑셀 규칙을 간소화: 숫자 < 문자열 < 불리언
    const rank = (v) => (typeof v === 'boolean' ? 2 : typeof v === 'string' ? 1 : 0);
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) {
      switch (op) {
        case '=': return false;
        case '<>': return true;
        case '<': return ra < rb;
        case '<=': return ra <= rb;
        case '>': return ra > rb;
        case '>=': return ra >= rb;
        default: return false;
      }
    }
  }

  switch (op) {
    case '=': return a === b;
    case '<>': return a !== b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '>=': return a >= b;
    default: return false;
  }
}

function evalFunctionCall(node, context) {
  const { name } = node;

  if (LAZY_FUNCTIONS[name]) {
    return LAZY_FUNCTIONS[name](node.args, context, evaluate);
  }

  const fn = FUNCTIONS[name];
  if (!fn) return makeError(ERRORS.NAME);

  const evaluatedArgs = node.args.map((arg) => evaluate(arg, context));

  if (!ERROR_AWARE_FUNCTIONS.has(name)) {
    for (const a of evaluatedArgs) {
      if (isErrorValue(a)) return a;
      if (isRangeValue(a)) {
        const errCell = a.values.flat().find((v) => isErrorValue(v));
        if (errCell) return errCell;
      }
    }
  }

  return fn(evaluatedArgs, context);
}
