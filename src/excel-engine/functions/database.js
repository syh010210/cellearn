// functions/database.js
import { ERRORS, makeError } from '../errors.js';
import { matchCriteria } from '../utils.js';
import { isRangeValue } from '../rangeValue.js';

function toTable(v) {
  return isRangeValue(v) ? v.values : [[v]];
}

function getFieldIndex(headers, field) {
  if (typeof field === 'number') return field - 1;
  return headers.findIndex((h) => String(h).toUpperCase() === String(field).toUpperCase());
}

function matchesCriteria(record, headers, criteriaTable) {
  const critHeaders = criteriaTable[0];
  const critRows = criteriaTable.slice(1);
  // 기준 표: 행끼리는 OR, 한 행 안의 열끼리는 AND
  return critRows.some((critRow) =>
    critHeaders.every((h, i) => {
      const critVal = critRow[i];
      if (critVal === '' || critVal === undefined) return true;
      const fieldIdx = headers.findIndex((hh) => String(hh).toUpperCase() === String(h).toUpperCase());
      if (fieldIdx === -1) return true;
      return matchCriteria(record[fieldIdx], critVal);
    })
  );
}

function getMatchingValues(database, field, criteria) {
  const dbTable = toTable(database);
  const headers = dbTable[0];
  const rows = dbTable.slice(1);
  const fieldIdx = getFieldIndex(headers, field);
  const criteriaTable = toTable(criteria);

  const matched = rows.filter((row) => matchesCriteria(row, headers, criteriaTable));
  return matched.map((row) => row[fieldIdx]).filter((v) => typeof v === 'number');
}

export const DSUM = ([database, field, criteria]) => {
  const vals = getMatchingValues(database, field, criteria);
  return vals.reduce((a, b) => a + b, 0);
};

export const DAVERAGE = ([database, field, criteria]) => {
  const vals = getMatchingValues(database, field, criteria);
  if (vals.length === 0) return makeError(ERRORS.DIV0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

export const DCOUNT = ([database, field, criteria]) => getMatchingValues(database, field, criteria).length;

export const DMAX = ([database, field, criteria]) => {
  const vals = getMatchingValues(database, field, criteria);
  return vals.length ? Math.max(...vals) : 0;
};

export const DMIN = ([database, field, criteria]) => {
  const vals = getMatchingValues(database, field, criteria);
  return vals.length ? Math.min(...vals) : 0;
};
