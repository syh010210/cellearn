// functions/text.js
import { ERRORS, isErrorValue, makeError } from '../errors.js';
import { toNumber, toStr } from '../utils.js';

export const LEFT = ([text, n]) => {
  const s = toStr(text);
  const num = n === undefined ? 1 : toNumber(n);
  if (isErrorValue(num)) return num;
  return s.slice(0, Math.max(0, num));
};

export const RIGHT = ([text, n]) => {
  const s = toStr(text);
  const num = n === undefined ? 1 : toNumber(n);
  if (isErrorValue(num)) return num;
  return num >= s.length ? s : s.slice(s.length - num);
};

export const MID = ([text, start, len]) => {
  const s = toStr(text);
  const st = toNumber(start);
  const ln = toNumber(len);
  if (isErrorValue(st)) return st;
  if (isErrorValue(ln)) return ln;
  if (st < 1) return makeError(ERRORS.VALUE);
  return s.slice(st - 1, st - 1 + ln);
};

export const LEN = ([text]) => toStr(text).length;
export const TRIM = ([text]) => toStr(text).replace(/\s+/g, ' ').trim();
export const UPPER = ([text]) => toStr(text).toUpperCase();
export const LOWER = ([text]) => toStr(text).toLowerCase();
export const CONCATENATE = (args) => args.map(toStr).join('');

export const VALUE = ([text]) => {
  const raw = toStr(text).trim();
  const isPercent = raw.endsWith('%');
  const cleaned = (isPercent ? raw.slice(0, -1) : raw).replace(/,/g, '');
  const n = Number(cleaned);
  if (isNaN(n) || cleaned === '') return makeError(ERRORS.VALUE);
  return isPercent ? n / 100 : n;
};

export const REPLACE = ([oldText, start, len, newText]) => {
  const s = toStr(oldText);
  const st = toNumber(start);
  const ln = toNumber(len);
  if (isErrorValue(st)) return st;
  if (isErrorValue(ln)) return ln;
  return s.slice(0, st - 1) + toStr(newText) + s.slice(st - 1 + ln);
};

export const SUBSTITUTE = ([text, oldText, newText, instance]) => {
  const s = toStr(text);
  const o = toStr(oldText);
  const n = toStr(newText);
  if (o === '') return s;

  if (instance === undefined) {
    return s.split(o).join(n);
  }

  const inst = toNumber(instance);
  if (isErrorValue(inst)) return inst;
  let count = 0;
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s.slice(i, i + o.length) === o) {
      count++;
      if (count === inst) {
        result += n;
        i += o.length;
        continue;
      }
    }
    result += s[i];
    i++;
  }
  return result;
};

export const FIND = ([findText, withinText, start]) => {
  const f = toStr(findText);
  const w = toStr(withinText);
  const st = start === undefined ? 1 : toNumber(start);
  if (isErrorValue(st)) return st;
  const idx = w.indexOf(f, st - 1);
  if (idx === -1) return makeError(ERRORS.VALUE);
  return idx + 1;
};

// SEARCH: FIND와 같지만 대소문자를 구분하지 않는다
export const SEARCH = ([findText, withinText, start]) => {
  const f = toStr(findText).toLowerCase();
  const w = toStr(withinText).toLowerCase();
  const st = start === undefined ? 1 : toNumber(start);
  if (isErrorValue(st)) return st;
  const idx = w.indexOf(f, st - 1);
  if (idx === -1) return makeError(ERRORS.VALUE);
  return idx + 1;
};

// PROPER: 각 단어(영문)의 첫 글자만 대문자로. 한글은 영향 없음
export const PROPER = ([text]) => toStr(text).replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// TEXT 함수: 컴활에서 자주 쓰는 기본 숫자 서식 코드 지원
export const TEXT_FN = ([value, format]) => {
  const n = toNumber(value);
  if (isErrorValue(n)) return n;
  const fmt = toStr(format);

  if (/^0+$/.test(fmt)) return String(Math.round(n)).padStart(fmt.length, '0');
  if (/^0+\.0+$/.test(fmt)) {
    const decimals = fmt.split('.')[1].length;
    return n.toFixed(decimals);
  }
  if (fmt === '#,##0') return Math.round(n).toLocaleString('en-US');
  if (fmt === '#,##0.00') {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (fmt === '0%') return `${Math.round(n * 100)}%`;
  if (fmt === '0.0%') return `${(n * 100).toFixed(1)}%`;
  return String(n);
};
