// index.js
// 스프레드시트 엔진의 공개 API. React 컴포넌트에서는 이 Sheet 클래스만 사용하면 된다.
//
// 사용 예:
//   const sheet = new Sheet();
//   sheet.setCellInput('A1', '10');
//   sheet.setCellInput('B1', '=A1*2');
//   sheet.getDisplayValue('B1'); // 20
//   sheet.setCellInput('A1', '5');
//   sheet.getDisplayValue('B1'); // 10 (자동 재계산됨)

import { parseFormula, collectReferences } from './parser.js';
import { evaluate } from './evaluator.js';
import { DependencyGraph } from './dependencyGraph.js';
import { parseRangeRef, expandRange } from './cellAddress.js';
import { ERRORS, isErrorValue, makeError } from './errors.js';
import { dateToSerial, serialToDate, formatSerialAsDate, formatSerialAsDateTime, formatSerialAsTime } from './functions/date.js';

// 최상위 노드가 아래 함수 호출이면 결과를 날짜/시간 형식으로 표시한다.
// functions/date.js에 실제로 구현된 함수만 넣는다. IF/CHOOSE 등에 중첩된 경우는 다루지 않는다(최상위만).
const DATE_FUNC_FORMAT = {
  DATE: 'date', TODAY: 'date', WORKDAY: 'date', EOMONTH: 'date', EDATE: 'date',
  NOW: 'datetime',
  TIME: 'time',
};

// "2026-09-07" 또는 "2026/9/7" 형태면 엑셀 일련번호로, 아니면 null
function parseDateInput(str) {
  const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(str);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const serial = dateToSerial(y, mo, d);
  const back = serialToDate(serial); // 2월 30일 같은 무효 날짜 거르기
  if (back.getUTCFullYear() !== y || back.getUTCMonth() + 1 !== mo || back.getUTCDate() !== d) return null;
  return serial;
}

export class Sheet {
  constructor() {
    this.rawInput = new Map(); // address -> 사용자가 입력한 원본 문자열/숫자
    this.formulas = new Map(); // address -> 파싱된 AST (수식 셀만 존재)
    this.computedValues = new Map(); // address -> 계산된 값 또는 에러 객체
    this.dateCells = new Set(); // 날짜로 입력된 셀 (표시를 yyyy-mm-dd로)
    this.dateFormatCells = new Map(); // 날짜/시간 함수 수식 셀 (주소 → 'date' | 'datetime' | 'time')
    this.graph = new DependencyGraph();
    this.listeners = new Set(); // 셀 변경 구독자 (React re-render 트리거용)
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(changedAddresses) {
    this.listeners.forEach((cb) => cb(changedAddresses));
  }

  getCellValue(address) {
    address = address.toUpperCase();
    if (this.computedValues.has(address)) {
      return this.computedValues.get(address);
    }
    return this.rawInput.get(address);
  }

  getContext() {
    return { getCellValue: (addr) => this.getCellValue(addr) };
  }

  getRawInput(address) {
    return this.rawInput.get(address.toUpperCase()) ?? '';
  }

  // 사용자가 셀에 값을 입력할 때 호출한다.
  // input이 '='로 시작하면 수식으로 처리하고, 아니면 값(숫자/문자열)으로 처리한다.
  setCellInput(address, input) {
    address = address.toUpperCase();
    this.rawInput.set(address, input);

    if (typeof input === 'string' && input.startsWith('=')) {
      this.dateCells.delete(address);
      try {
        const ast = parseFormula(input);
        this.formulas.set(address, ast);

        // 최상위가 날짜/시간 함수면 결과를 날짜 형식으로 표시하도록 기록 (중첩은 다루지 않음)
        const dfmt = ast.type === 'FunctionCall' ? DATE_FUNC_FORMAT[ast.name] : undefined;
        if (dfmt) this.dateFormatCells.set(address, dfmt);
        else this.dateFormatCells.delete(address);

        const refs = collectReferences(ast);
        const cellDeps = new Set();
        refs.forEach((r) => {
          if (r.type === 'cell') {
            cellDeps.add(r.ref);
          } else if (r.type === 'range') {
            const range = parseRangeRef(r.ref);
            if (range) {
              expandRange(range).flat().forEach((addr) => cellDeps.add(addr));
            }
          }
        });
        this.graph.setDependencies(address, cellDeps);
      } catch (e) {
        // 수식 문법 오류
        this.formulas.set(address, null);
        this.dateFormatCells.delete(address);
        this.computedValues.set(address, makeError(ERRORS.NAME));
        this.graph.clearCell(address);
        this.notify([address]);
        return;
      }
    } else {
      this.formulas.delete(address);
      this.graph.clearCell(address);
      this.dateCells.delete(address);
      this.dateFormatCells.delete(address);

      let value;
      if (typeof input === 'number') {
        value = input;
      } else if (input === '' || input === undefined || input === null) {
        value = undefined;
      } else {
        const trimmed = String(input).trim();
        const dateSerial = parseDateInput(trimmed);
        if (dateSerial !== null) {
          value = dateSerial;
          this.dateCells.add(address);
        } else {
          const num = Number(trimmed);
          value = trimmed !== '' && !isNaN(num) ? num : input;
        }
      }
      this.computedValues.set(address, value);
    }

    this.recalculate([address]);
  }

  recalculate(changedAddresses) {
    const { sorted, circular } = this.graph.getAffectedCellsSorted(changedAddresses);

    const toCompute = [];
    changedAddresses.forEach((addr) => {
      if (this.formulas.has(addr) && this.formulas.get(addr)) toCompute.push(addr);
    });
    sorted.forEach((addr) => {
      if (!toCompute.includes(addr)) toCompute.push(addr);
    });

    const notified = new Set();
    const context = this.getContext();

    for (const addr of toCompute) {
      if (circular.includes(addr)) continue; // 아래에서 별도 처리
      const ast = this.formulas.get(addr);
      if (!ast) continue;
      try {
        context.currentCell = addr; // COLUMN()/ROW() 인자 없는 호출용
        const result = evaluate(ast, context);
        const finalValue =
          result && result.__isRange ? result.values[0]?.[0] ?? makeError(ERRORS.VALUE) : result;
        this.computedValues.set(addr, finalValue);
      } catch (e) {
        this.computedValues.set(addr, makeError(ERRORS.VALUE));
      }
      notified.add(addr);
    }

    circular.forEach((addr) => {
      this.computedValues.set(addr, makeError(ERRORS.CIRCULAR));
      notified.add(addr);
    });

    this.notify([...notified]);
  }

  // 화면에 표시할 값 (에러는 에러 코드 문자열로 변환)
  getDisplayValue(address) {
    address = address.toUpperCase();
    const v = this.getCellValue(address);
    if (v === undefined) return '';
    if (isErrorValue(v)) return v.error;
    // 숫자가 아니거나 음수면 날짜 변환하지 않고 원래대로
    const dfmt = this.getDateFormat(address);
    if (dfmt && typeof v === 'number' && v >= 0) {
      if (dfmt === 'datetime') return formatSerialAsDateTime(v);
      if (dfmt === 'time') return formatSerialAsTime(v);
      return formatSerialAsDate(v);
    }
    return v;
  }

  // 셀의 날짜/시간 표시 형식: 날짜 입력 셀은 'date', 날짜/시간 함수 수식 셀은 그 형식, 아니면 null
  getDateFormat(address) {
    address = address.toUpperCase();
    if (this.dateCells.has(address)) return 'date';
    return this.dateFormatCells.get(address) ?? null;
  }

  // 날짜로 입력된 셀인지 (MiniExcel 표시용)
  isDateCell(address) {
    return this.dateCells.has(address.toUpperCase());
  }

  isFormulaCell(address) {
    return this.formulas.has(address.toUpperCase()) && !!this.formulas.get(address.toUpperCase());
  }

  // 파일 저장/불러오기용 직렬화 (SheetJS 연동 시 활용)
  serialize() {
    const data = {};
    this.rawInput.forEach((val, key) => {
      data[key] = val;
    });
    return data;
  }

  loadFrom(data) {
    Object.entries(data).forEach(([addr, val]) => this.setCellInput(addr, val));
  }

  clear() {
    this.rawInput.clear();
    this.formulas.clear();
    this.computedValues.clear();
    this.dateCells.clear();
    this.dateFormatCells.clear();
    this.graph = new DependencyGraph();
    this.notify([]);
  }
}

export { ERRORS, isErrorValue } from './errors.js';
