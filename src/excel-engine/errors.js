// errors.js
// 엑셀 에러 코드와 에러 값 래퍼

export const ERRORS = {
  DIV0: '#DIV/0!',
  VALUE: '#VALUE!',
  REF: '#REF!',
  NAME: '#NAME?',
  NA: '#N/A',
  NUM: '#NUM!',
  NULL: '#NULL!',
  CIRCULAR: '#CIRCULAR!',
};

export function isErrorValue(v) {
  return v !== null && typeof v === 'object' && v.__isError === true;
}

export function makeError(code) {
  return { __isError: true, error: code };
}
