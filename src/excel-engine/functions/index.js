// functions/index.js
// 모든 함수를 이름으로 등록하는 레지스트리

import * as math from './math.js';
import * as text from './text.js';
import * as date from './date.js';
import * as lookup from './lookup.js';
import * as database from './database.js';
import * as info from './info.js';
import { IF, IFS, IFERROR, IFNA, CHOOSE, AND, OR } from './lazy.js';

export const FUNCTIONS = {
  // 수학/통계
  SUM: math.SUM,
  AVERAGE: math.AVERAGE,
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
  MAX: math.MAX,
  MIN: math.MIN,
  MOD: math.MOD,
  TRUNC: math.TRUNC,
  ABS: math.ABS,
  LARGE: math.LARGE,
  SMALL: math.SMALL,
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

  // 날짜
  TODAY: date.TODAY,
  NOW: date.NOW,
  DATE: date.DATE,
  YEAR: date.YEAR,
  MONTH: date.MONTH,
  DAY: date.DAY,
  WEEKDAY: date.WEEKDAY,
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
  DMAX: database.DMAX,
  DMIN: database.DMIN,

  // 정보
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
  AND,
  OR,
};
