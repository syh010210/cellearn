// utils.js
// 타입 변환 (숫자/불리언/문자열) 및 SUMIF 등에서 쓰는 조건(criteria) 매칭

import { ERRORS, isErrorValue, makeError } from './errors.js';

export function toNumber(v) {
  if (isErrorValue(v)) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return 0;
    const n = Number(trimmed);
    if (!isNaN(n)) return n;
    return makeError(ERRORS.VALUE);
  }
  return makeError(ERRORS.VALUE);
}

export function toBoolean(v) {
  if (isErrorValue(v)) return v;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const upper = v.trim().toUpperCase();
    if (upper === 'TRUE') return true;
    if (upper === 'FALSE') return false;
  }
  return makeError(ERRORS.VALUE);
}

export function toStr(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (isErrorValue(v)) return v.error;
  return String(v);
}

export function isBlank(v) {
  return v === undefined || v === null || v === '';
}

// SUMIF/COUNTIF/AVERAGEIF 등에서 쓰는 조건 매칭
// 지원: 숫자/문자열 동등비교, 부등호(<, <=, >, >=, <>), 와일드카드(*, ?)
export function matchCriteria(cellValue, criteria) {
  if (criteria === undefined || criteria === null) criteria = '';
  if (typeof criteria === 'boolean') criteria = criteria ? 'TRUE' : 'FALSE';
  const critStr = String(criteria).trim();

  const opMatch = critStr.match(/^(<>|<=|>=|<|>|=)(.*)$/);
  let op = '=';
  let rest = critStr;
  if (opMatch) {
    op = opMatch[1];
    rest = opMatch[2];
  }

  const restNum = Number(rest);
  const cellIsNum = typeof cellValue === 'number';
  const restIsNum = rest.trim() !== '' && !isNaN(restNum);

  if (op !== '=' && op !== '<>') {
    let a, b;
    if (cellIsNum && restIsNum) {
      a = cellValue;
      b = restNum;
    } else {
      a = String(cellValue ?? '').toUpperCase();
      b = rest.toUpperCase();
    }
    switch (op) {
      case '<': return a < b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '>=': return a >= b;
      default: return false;
    }
  }

  let isEqual;
  if (rest === '') {
    isEqual = isBlank(cellValue);
  } else if (cellIsNum && restIsNum) {
    isEqual = cellValue === restNum;
  } else if (/[*?]/.test(rest)) {
    const pattern = '^' + rest
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') + '$';
    isEqual = new RegExp(pattern, 'i').test(String(cellValue ?? ''));
  } else {
    isEqual = String(cellValue ?? '').toUpperCase() === rest.toUpperCase();
  }

  return op === '<>' ? !isEqual : isEqual;
}
