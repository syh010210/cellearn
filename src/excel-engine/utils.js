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

// 숫자를 엑셀 General(텍스트 변환) 규칙에 맞춰 문자열화: 15 유효자리로 반올림 후 불필요한 0 제거.
// 숫자가 텍스트로 바뀌는 모든 경로(& 결합, LEFT/RIGHT/MID/LEN/UPPER 등의 숫자 인수)가 이 함수를 쓴다.
export function numToText(n) {
  if (typeof n !== 'number') return String(n);
  if (!isFinite(n)) return String(n);
  if (n === 0) return '0';
  let s = n.toPrecision(15);
  if (/e/i.test(s)) {
    let [m, e] = s.split(/e/i);
    if (m.indexOf('.') >= 0) m = m.replace(/0+$/, '').replace(/\.$/, '');
    const ei = parseInt(e, 10);
    return m + 'E' + (ei < 0 ? '-' : '+') + String(Math.abs(ei)).padStart(2, '0');
  }
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

export function toStr(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (isErrorValue(v)) return v.error;
  if (typeof v === 'number') return numToText(v);
  return String(v);
}

export function isBlank(v) {
  return v === undefined || v === null || v === '';
}

// 와일드카드(* ? ~이스케이프) 매칭. 대소문자 무시. 시작은 항상 고정.
// anchorEnd=true(기본, COUNTIF 계열)=끝까지 일치(^…$). anchorEnd=false(D함수 앞부분 일치)=시작만 고정(^…).
function wildcardMatch(text, pat, anchorEnd = true) {
  let re = '^';
  for (let i = 0; i < pat.length; i++) {
    const ch = pat[i];
    if (ch === '~' && i + 1 < pat.length) { const nx = pat[++i]; re += nx.replace(/[.+^${}()|[\]\\*?]/g, '\\$&'); }
    else if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(re + (anchorEnd ? '$' : ''), 'i').test(text);
}

// SUMIF/COUNTIF/AVERAGEIF 등에서 쓰는 조건 매칭.
// 지원: 숫자/문자열 동등비교, 부등호(<, <=, >, >=, <>), 와일드카드(*, ?, ~).
// opts.prefix=true (D함수 전용): 연산자 없는 텍스트 조건을 "앞부분 일치"로 본다("서울"→"서울","서울시").
//   COUNTIF/SUMIF 계열은 opts 없이 호출 → 기존 완전 일치 동작 유지.
export function matchCriteria(cellValue, criteria, opts = {}) {
  const prefix = !!opts.prefix;
  if (criteria === undefined || criteria === null) criteria = '';
  if (typeof criteria === 'boolean') criteria = criteria ? 'TRUE' : 'FALSE';
  const critStr = String(criteria).trim();

  const opMatch = critStr.match(/^(<>|<=|>=|<|>|=)(.*)$/);
  const explicitOp = !!opMatch;
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
    // 엑셀: 비교 연산자 + 숫자 조건은 숫자 셀만, 비교 연산자 + 텍스트 조건은 텍스트 셀만 비교(교차 타입은 미포함).
    let a, b;
    if (restIsNum) {
      if (!cellIsNum) return false;
      a = cellValue;
      b = restNum;
    } else {
      if (cellIsNum) return false;
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
    // D함수(prefix): 시작만 고정(앞부분). COUNTIF 계열: 끝까지 고정.
    isEqual = wildcardMatch(String(cellValue ?? ''), rest, !(prefix && !explicitOp));
  } else if (prefix && !explicitOp) {
    // D함수: 연산자 없는 텍스트 조건 = 앞부분 일치(대소문자 무시)
    isEqual = String(cellValue ?? '').toUpperCase().startsWith(rest.toUpperCase());
  } else {
    isEqual = String(cellValue ?? '').toUpperCase() === rest.toUpperCase();
  }

  return op === '<>' ? !isEqual : isEqual;
}
