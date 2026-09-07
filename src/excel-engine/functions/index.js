// functions/index.js
// 모든 함수를 이름으로 등록하는 레지스트리

import * as math from './math.js';
import * as text from './text.js';
import * as date from './date.js';
import * as lookup from './lookup.js';
import * as database from './database.js';
import * as info from './info.js';
import { IF, IFS, IFERROR, IFNA, CHOOSE, SWITCH, AND, OR } from './lazy.js';

export const FUNCTIONS = {
  // 수학/통계
  SUM: math.SUM,
  AVERAGE: math.AVERAGE,
  AVERAGEA: math.AVERAGEA,
  MEDIAN: math.MEDIAN,
  COUNT: math.COUNT,
  COUNTA: math.COUNTA,
  COUNTBLANK: math.COUNTBLANK,
  SUMIF: math.SUMIF,
  SUMIFS: math.SUMIFS,
  COUNTIF: math.COUNTIF,
  COUNTIFS: math.COUNTIFS,
  AVERAGEIF: math.AVERAGEIF,
  AVERAGEIFS: math.AVERAGEIFS,
  ROUND: math.ROUND,
  ROUNDUP: math.ROUNDUP,
  ROUNDDOWN: math.ROUNDDOWN,
  INT: math.INT,
  POWER: math.POWER,
  RAND: math.RAND,
  RANDBETWEEN: math.RANDBETWEEN,
  MAX: math.MAX,
  MAXA: math.MAXA,
  MIN: math.MIN,
  MINA: math.MINA,
  MOD: math.MOD,
  TRUNC: math.TRUNC,
  ABS: math.ABS,
  LARGE: math.LARGE,
  SMALL: math.SMALL,
  'MODE.SNGL': math.MODE_SNGL,
  'STDEV.S': math.STDEV_S,
  'VAR.S': math.VAR_S,
  'RANK.EQ': math.RANK_EQ,
  'RANK.AVG': math.RANK_AVG,
  SUMPRODUCT: math.SUMPRODUCT,

  // 텍스트
  LEFT: text.LEFT,
  RIGHT: text.RIGHT,
  MID: text.MID,
  LEN: text.LEN,
  TRIM: text.TRIM,
  UPPER: text.UPPER,
  LOWER: text.LOWER,
  CONCATENATE: text.CONCATENATE,
  VALUE: text.VALUE,
  REPLACE: text.REPLACE,
  SUBSTITUTE: text.SUBSTITUTE,
  FIND: text.FIND,
  SEARCH: text.SEARCH,
  PROPER: text.PROPER,
  TEXT: text.TEXT_FN,

  // 날짜/시간
  TODAY: date.TODAY,
  NOW: date.NOW,
  DATE: date.DATE,
  YEAR: date.YEAR,
  MONTH: date.MONTH,
  DAY: date.DAY,
  DAYS: date.DAYS,
  EDATE: date.EDATE,
  EOMONTH: date.EOMONTH,
  HOUR: date.HOUR,
  MINUTE: date.MINUTE,
  SECOND: date.SECOND,
  TIME: date.TIME,
  WEEKDAY: date.WEEKDAY,
  WORKDAY: date.WORKDAY,
  DATEDIF: date.DATEDIF,

  // 찾기/참조
  VLOOKUP: lookup.VLOOKUP,
  HLOOKUP: lookup.HLOOKUP,
  INDEX: lookup.INDEX,
  MATCH: lookup.MATCH,

  // 데이터베이스
  DSUM: database.DSUM,
  DAVERAGE: database.DAVERAGE,
  DCOUNT: database.DCOUNT,
  DCOUNTA: database.DCOUNTA,
  DMAX: database.DMAX,
  DMIN: database.DMIN,

  // 논리/정보
  TRUE: info.TRUE,
  FALSE: info.FALSE,
  NOT: info.NOT,
  ISBLANK: info.ISBLANK,
  ISERROR: info.ISERROR,
  ISNA: info.ISNA,
  ISNUMBER: info.ISNUMBER,
  ISTEXT: info.ISTEXT,
  ISLOGICAL: info.ISLOGICAL,
};

export const LAZY_FUNCTIONS = {
  IF,
  IFS,
  IFERROR,
  IFNA,
  CHOOSE,
  SWITCH,
  AND,
  OR,
  // COLUMN/ROW/COLUMNS/ROWS는 값이 아닌 참조(AST 노드)가 필요해 lazy로 등록
  COLUMN: lookup.COLUMN,
  ROW: lookup.ROW,
  COLUMNS: lookup.COLUMNS,
  ROWS: lookup.ROWS,
};

// 컴활 2급 실기 출제 함수 78개 (자동완성/힌트 대상). 엔진에는 이 외 함수도 등록되어 있으나
// 자동완성 목록에는 노출하지 않는다.
export const EXAM_FUNCTIONS = [
  // 날짜/시간
  'DATE', 'DAY', 'DAYS', 'EDATE', 'EOMONTH', 'HOUR', 'MINUTE', 'MONTH', 'NOW',
  'SECOND', 'TIME', 'TODAY', 'WEEKDAY', 'WORKDAY', 'YEAR',
  // 논리
  'AND', 'FALSE', 'IF', 'IFS', 'IFERROR', 'NOT', 'OR', 'TRUE', 'SWITCH',
  // 데이터베이스
  'DAVERAGE', 'DCOUNT', 'DCOUNTA', 'DMAX', 'DMIN', 'DSUM',
  // 텍스트
  'FIND', 'LEFT', 'LEN', 'LOWER', 'MID', 'PROPER', 'RIGHT', 'SEARCH', 'TRIM', 'UPPER',
  // 수학
  'ABS', 'INT', 'MOD', 'POWER', 'RAND', 'RANDBETWEEN', 'ROUND', 'ROUNDDOWN', 'ROUNDUP',
  'SUM', 'SUMIF', 'SUMIFS', 'TRUNC',
  // 찾기/참조
  'CHOOSE', 'COLUMN', 'COLUMNS', 'HLOOKUP', 'INDEX', 'MATCH', 'ROW', 'ROWS', 'VLOOKUP',
  // 통계
  'AVERAGE', 'AVERAGEA', 'AVERAGEIF', 'AVERAGEIFS', 'COUNT', 'COUNTA', 'COUNTBLANK',
  'COUNTIF', 'COUNTIFS', 'LARGE', 'MAX', 'MAXA', 'MEDIAN', 'MIN', 'MINA', 'MODE.SNGL',
  'RANK.EQ', 'SMALL', 'STDEV.S', 'VAR.S',
];
