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

// DAYS(끝날짜, 시작날짜) = 두 날짜 사이 일수
export const DAYS = ([endSerial, startSerial]) => {
  const e = toNumber(endSerial);
  const s = toNumber(startSerial);
  if (isErrorValue(e)) return e;
  if (isErrorValue(s)) return s;
  return Math.floor(e) - Math.floor(s);
};

// EDATE(날짜, 개월수) = 지정 개월 후/전의 같은 날 (말일 초과 시 말일로 보정)
export const EDATE = ([serial, months]) => {
  const s = toNumber(serial);
  const m = toNumber(months);
  if (isErrorValue(s)) return s;
  if (isErrorValue(m)) return m;
  const d = serialToDate(Math.floor(s));
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth();
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(y, mo + Math.trunc(m), 1));
  const ty = target.getUTCFullYear();
  const tm = target.getUTCMonth();
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return dateToSerial(ty, tm + 1, Math.min(day, lastDay));
};

// EOMONTH(날짜, 개월수) = 지정 개월 후/전 달의 말일
export const EOMONTH = ([serial, months]) => {
  const s = toNumber(serial);
  const m = toNumber(months);
  if (isErrorValue(s)) return s;
  if (isErrorValue(m)) return m;
  const d = serialToDate(Math.floor(s));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + Math.trunc(m) + 1, 0));
  return dateToSerial(last.getUTCFullYear(), last.getUTCMonth() + 1, last.getUTCDate());
};

// 시간 함수: 일련번호의 소수부(하루=1)로 시/분/초 계산
function timeSeconds(serial) {
  const s = toNumber(serial);
  if (isErrorValue(s)) return s;
  const frac = s - Math.floor(s);
  let secs = Math.round(frac * 86400);
  secs = ((secs % 86400) + 86400) % 86400;
  return secs;
}
export const HOUR = ([serial]) => {
  const secs = timeSeconds(serial);
  return isErrorValue(secs) ? secs : Math.floor(secs / 3600);
};
export const MINUTE = ([serial]) => {
  const secs = timeSeconds(serial);
  return isErrorValue(secs) ? secs : Math.floor(secs / 60) % 60;
};
export const SECOND = ([serial]) => {
  const secs = timeSeconds(serial);
  return isErrorValue(secs) ? secs : secs % 60;
};

// TIME(시, 분, 초) = 하루 대비 소수(하루를 넘으면 24시간으로 나눈 나머지)
export const TIME = ([h, m, sec]) => {
  const hh = toNumber(h);
  const mm = toNumber(m);
  const ss = toNumber(sec);
  if (isErrorValue(hh)) return hh;
  if (isErrorValue(mm)) return mm;
  if (isErrorValue(ss)) return ss;
  const total = hh * 3600 + mm * 60 + ss;
  const frac = total / 86400;
  return frac - Math.floor(frac);
};

// WORKDAY(시작날짜, 일수, [휴일범위]) = 주말/휴일을 제외하고 일수만큼 이동한 날
export const WORKDAY = ([startSerial, days, holidays]) => {
  const s = toNumber(startSerial);
  const d = toNumber(days);
  if (isErrorValue(s)) return s;
  if (isErrorValue(d)) return d;
  const holSet = new Set();
  if (holidays !== undefined) {
    const list = holidays && holidays.__isRange ? holidays.values.flat() : [holidays];
    for (const v of list) {
      if (typeof v === 'number') holSet.add(Math.floor(v));
    }
  }
  const step = d >= 0 ? 1 : -1;
  let remaining = Math.abs(Math.trunc(d));
  let cur = Math.floor(s);
  while (remaining > 0) {
    cur += step;
    const dow = serialToDate(cur).getUTCDay(); // 0=일, 6=토
    if (dow === 0 || dow === 6) continue;
    if (holSet.has(cur)) continue;
    remaining--;
  }
  return cur;
};

// 일련번호를 yyyy-mm-dd 문자열로 (표시용)
export function formatSerialAsDate(serial) {
  const d = serialToDate(Math.floor(serial));
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

// 일련번호를 yyyy-mm-dd hh:mm 문자열로 (표시용). 소수부를 분 단위로 반올림하며,
// 반올림이 하루를 넘기면(23:59:xx → 24:00) 다음 날로 넘긴다.
export function formatSerialAsDateTime(serial) {
  const p = (x) => String(x).padStart(2, '0');
  let dayPart = Math.floor(serial);
  const frac = serial - dayPart;
  let mins = Math.round(frac * 1440);
  if (mins >= 1440) { mins -= 1440; dayPart += 1; }
  const d = serialToDate(dayPart);
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(Math.floor(mins / 60))}:${p(mins % 60)}`;
}

// 일련번호의 소수부를 hh:mm:ss 문자열로 (표시용). 초 단위로 반올림해 부동소수 오차(8.999초 등)를 없앤다.
export function formatSerialAsTime(serial) {
  const p = (x) => String(x).padStart(2, '0');
  const frac = serial - Math.floor(serial);
  let secs = Math.round(frac * 86400);
  secs = ((secs % 86400) + 86400) % 86400;
  return `${p(Math.floor(secs / 3600))}:${p(Math.floor(secs / 60) % 60)}:${p(secs % 60)}`;
}

export { dateToSerial, serialToDate };
