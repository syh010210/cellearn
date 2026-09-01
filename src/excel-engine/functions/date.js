// functions/date.js
// 엑셀 날짜 직렬값 체계: 1899-12-30을 기준(0)으로 사용
// (엑셀의 1900년 윤년 버그를 자연스럽게 재현하는 표준 트릭)
import { ERRORS, isErrorValue, makeError } from '../errors.js';
import { toNumber } from '../utils.js';

const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateToSerial(y, m, d) {
  const ms = Date.UTC(y, m - 1, d);
  return Math.round((ms - EXCEL_EPOCH) / MS_PER_DAY);
}

function serialToDate(serial) {
  return new Date(EXCEL_EPOCH + serial * MS_PER_DAY);
}

export const TODAY = () => {
  const now = new Date();
  return dateToSerial(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

export const NOW = () => {
  const now = new Date();
  const datePart = dateToSerial(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const timePart = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
  return datePart + timePart;
};

export const DATE = ([y, m, d]) => {
  const yy = toNumber(y);
  const mm = toNumber(m);
  const dd = toNumber(d);
  if (isErrorValue(yy)) return yy;
  if (isErrorValue(mm)) return mm;
  if (isErrorValue(dd)) return dd;
  const year = yy < 1900 ? 1900 + yy : yy;
  return dateToSerial(year, mm, dd);
};

export const YEAR = ([serial]) => {
  const s = toNumber(serial);
  if (isErrorValue(s)) return s;
  return serialToDate(Math.floor(s)).getUTCFullYear();
};

export const MONTH = ([serial]) => {
  const s = toNumber(serial);
  if (isErrorValue(s)) return s;
  return serialToDate(Math.floor(s)).getUTCMonth() + 1;
};

export const DAY = ([serial]) => {
  const s = toNumber(serial);
  if (isErrorValue(s)) return s;
  return serialToDate(Math.floor(s)).getUTCDate();
};

export const WEEKDAY = ([serial, type]) => {
  const s = toNumber(serial);
  if (isErrorValue(s)) return s;
  const t = type === undefined ? 1 : toNumber(type);
  const jsDay = serialToDate(Math.floor(s)).getUTCDay(); // 0=일요일

  if (t === 1) return jsDay + 1; // 1=일 ... 7=토
  if (t === 2) return jsDay === 0 ? 7 : jsDay; // 1=월 ... 7=일
  if (t === 3) return jsDay === 0 ? 6 : jsDay - 1; // 0=월 ... 6=일
  return jsDay + 1;
};

export const DATEDIF = ([startSerial, endSerial, unit]) => {
  const s = toNumber(startSerial);
  const e = toNumber(endSerial);
  if (isErrorValue(s)) return s;
  if (isErrorValue(e)) return e;
  if (e < s) return makeError(ERRORS.NUM);

  const u = String(unit).toUpperCase();
  const startDate = serialToDate(Math.floor(s));
  const endDate = serialToDate(Math.floor(e));

  const sy = startDate.getUTCFullYear();
  const sm = startDate.getUTCMonth();
  const sd = startDate.getUTCDate();
  const ey = endDate.getUTCFullYear();
  const em = endDate.getUTCMonth();
  const ed = endDate.getUTCDate();

  switch (u) {
    case 'Y': {
      let years = ey - sy;
      if (em < sm || (em === sm && ed < sd)) years--;
      return years;
    }
    case 'M': {
      let months = (ey - sy) * 12 + (em - sm);
      if (ed < sd) months--;
      return months;
    }
    case 'D':
      return Math.floor(e) - Math.floor(s);
    case 'MD': {
      let days = ed - sd;
      if (days < 0) {
        const prevMonthLastDay = new Date(Date.UTC(ey, em, 0)).getUTCDate();
        days += prevMonthLastDay;
      }
      return days;
    }
    case 'YM': {
      let months = em - sm;
      if (ed < sd) months--;
      if (months < 0) months += 12;
      return months;
    }
    case 'YD': {
      let sameYearStart = new Date(Date.UTC(ey, sm, sd));
      let diff = Math.floor((endDate - sameYearStart) / MS_PER_DAY);
      if (diff < 0) {
        const prevYearStart = new Date(Date.UTC(ey - 1, sm, sd));
        diff = Math.floor((endDate - prevYearStart) / MS_PER_DAY);
      }
      return diff;
    }
    default:
      return makeError(ERRORS.NUM);
  }
};

export { dateToSerial, serialToDate };
