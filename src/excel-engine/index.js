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

export class Sheet {
  constructor() {
    this.rawInput = new Map(); // address -> 사용자가 입력한 원본 문자열/숫자
    this.formulas = new Map(); // address -> 파싱된 AST (수식 셀만 존재)
    this.computedValues = new Map(); // address -> 계산된 값 또는 에러 객체
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
      try {
        const ast = parseFormula(input);
        this.formulas.set(address, ast);

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
        this.computedValues.set(address, makeError(ERRORS.NAME));
        this.graph.clearCell(address);
        this.notify([address]);
        return;
      }
    } else {
      this.formulas.delete(address);
      this.graph.clearCell(address);

      let value;
      if (typeof input === 'number') {
        value = input;
      } else if (input === '' || input === undefined || input === null) {
        value = undefined;
      } else {
        const trimmed = String(input).trim();
        const num = Number(trimmed);
        value = trimmed !== '' && !isNaN(num) ? num : input;
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
    const v = this.getCellValue(address);
    if (v === undefined) return '';
    if (isErrorValue(v)) return v.error;
    return v;
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
    this.graph = new DependencyGraph();
    this.notify([]);
  }
}

export { ERRORS, isErrorValue } from './errors.js';
