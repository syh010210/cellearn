// functions/lookup.js
import { ERRORS, isErrorValue, makeError } from '../errors.js';
import { toNumber } from '../utils.js';
import { isRangeValue } from '../rangeValue.js';

function toTable(range) {
  if (isRangeValue(range)) return range.values;
  return [[range]];
}

function matchExact(cellVal, lookupVal) {
  if (typeof cellVal === 'string' && typeof lookupVal === 'string') {
    if (/[*?]/.test(lookupVal)) {
      const pattern =
        '^' +
        lookupVal
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$';
      return new RegExp(pattern, 'i').test(cellVal);
    }
    return cellVal.toUpperCase() === lookupVal.toUpperCase();
  }
  return cellVal === lookupVal;
}

function compareForLookup(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const as = String(a ?? '').toUpperCase();
  const bs = String(b ?? '').toUpperCase();
  return as < bs ? -1 : as > bs ? 1 : 0;
}

export const VLOOKUP = ([lookupValue, tableArray, colIndex, rangeLookup]) => {
  const table = toTable(tableArray);
  const col = toNumber(colIndex);
  if (isErrorValue(col)) return col;
  const approximate = rangeLookup === undefined ? true : !!rangeLookup;

  if (col < 1 || col > (table[0]?.length || 0)) return makeError(ERRORS.REF);

  if (approximate) {
    let result = makeError(ERRORS.NA);
    for (const row of table) {
      if (compareForLookup(row[0], lookupValue) <= 0) {
        result = row[col - 1];
      } else break;
    }
    return result;
  }

  for (const row of table) {
    if (matchExact(row[0], lookupValue)) return row[col - 1];
  }
  return makeError(ERRORS.NA);
};

export const HLOOKUP = ([lookupValue, tableArray, rowIndex, rangeLookup]) => {
  const table = toTable(tableArray);
  const row = toNumber(rowIndex);
  if (isErrorValue(row)) return row;
  const approximate = rangeLookup === undefined ? true : !!rangeLookup;
  const headerRow = table[0] || [];

  if (row < 1 || row > table.length) return makeError(ERRORS.REF);

  if (approximate) {
    let resultCol = -1;
    for (let i = 0; i < headerRow.length; i++) {
      if (compareForLookup(headerRow[i], lookupValue) <= 0) resultCol = i;
      else break;
    }
    if (resultCol === -1) return makeError(ERRORS.NA);
    return table[row - 1][resultCol];
  }

  for (let i = 0; i < headerRow.length; i++) {
    if (matchExact(headerRow[i], lookupValue)) return table[row - 1][i];
  }
  return makeError(ERRORS.NA);
};

export const INDEX = ([array, rowNum, colNum]) => {
  const table = toTable(array);
  const r = rowNum === undefined ? undefined : toNumber(rowNum);
  const c = colNum === undefined ? undefined : toNumber(colNum);
  if (isErrorValue(r)) return r;
  if (isErrorValue(c)) return c;

  const numRows = table.length;
  const numCols = table[0]?.length || 1;

  if (numRows === 1 && r === undefined) {
    return table[0][(c ?? 1) - 1];
  }
  if (numCols === 1 && c === undefined) {
    return table[(r ?? 1) - 1][0];
  }

  const rr = (r ?? 1) - 1;
  const cc = (c ?? 1) - 1;
  if (rr < 0 || rr >= numRows || cc < 0 || cc >= numCols) return makeError(ERRORS.REF);
  return table[rr][cc];
};

export const MATCH = ([lookupValue, lookupArray, matchType]) => {
  const arr = toTable(lookupArray).flat();
  const type = matchType === undefined ? 1 : toNumber(matchType);
  if (isErrorValue(type)) return type;

  if (type === 0) {
    for (let i = 0; i < arr.length; i++) {
      if (matchExact(arr[i], lookupValue)) return i + 1;
    }
    return makeError(ERRORS.NA);
  }

  if (type === 1) {
    let result = -1;
    for (let i = 0; i < arr.length; i++) {
      if (compareForLookup(arr[i], lookupValue) <= 0) result = i;
      else break;
    }
    if (result === -1) return makeError(ERRORS.NA);
    return result + 1;
  }

  // type === -1: 내림차순 배열, lookupValue 이상인 것 중 마지막
  let result = -1;
  for (let i = 0; i < arr.length; i++) {
    if (compareForLookup(arr[i], lookupValue) >= 0) result = i;
    else break;
  }
  if (result === -1) return makeError(ERRORS.NA);
  return result + 1;
};
