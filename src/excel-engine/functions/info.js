// functions/info.js
import { ERRORS, isErrorValue } from '../errors.js';
import { toBoolean, isBlank } from '../utils.js';

export const NOT = ([v]) => {
  const b = toBoolean(v);
  return isErrorValue(b) ? b : !b;
};

export const ISBLANK = ([v]) => isBlank(v);
export const ISERROR = ([v]) => isErrorValue(v);
export const ISNA = ([v]) => isErrorValue(v) && v.error === ERRORS.NA;
export const ISNUMBER = ([v]) => typeof v === 'number';
export const ISTEXT = ([v]) => typeof v === 'string';
export const ISLOGICAL = ([v]) => typeof v === 'boolean';
