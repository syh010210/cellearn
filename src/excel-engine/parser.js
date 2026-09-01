// parser.js
// 재귀 하강 파서: 토큰 -> AST
// 우선순위(낮음->높음): 비교연산 < 문자열연결(&) < 덧셈/뺄셈 < 곱셈/나눗셈 < 단항(-) < 거듭제곱(^)

import { tokenize } from './tokenizer.js';

export function parseFormula(formula) {
  const tokens = tokenize(formula);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (type) => {
    const t = next();
    if (t.type !== type) {
      throw new Error(`문법 오류: ${type} 예상, ${t.type}(${t.value}) 발견`);
    }
    return t;
  };

  function parseExpr() {
    return parseComparison();
  }

  function parseComparison() {
    let left = parseConcat();
    while (
      peek().type === 'OP' &&
      ['=', '<>', '<', '<=', '>', '>='].includes(peek().value)
    ) {
      const op = next().value;
      const right = parseConcat();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseConcat() {
    let left = parseAdditive();
    while (peek().type === 'OP' && peek().value === '&') {
      next();
      const right = parseAdditive();
      left = { type: 'BinaryOp', op: '&', left, right };
    }
    return left;
  }

  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const right = parseMultiplicative();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseMultiplicative() {
    let left = parseUnary();
    while (peek().type === 'OP' && (peek().value === '*' || peek().value === '/')) {
      const op = next().value;
      const right = parseUnary();
      left = { type: 'BinaryOp', op, left, right };
    }
    return left;
  }

  function parseUnary() {
    if (peek().type === 'OP' && peek().value === '-') {
      next();
      const operand = parseUnary();
      return { type: 'UnaryOp', op: '-', operand };
    }
    if (peek().type === 'OP' && peek().value === '+') {
      next();
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    let base = parsePrimary();
    if (peek().type === 'OP' && peek().value === '^') {
      next();
      const exponent = parseUnary(); // 우결합
      base = { type: 'BinaryOp', op: '^', left: base, right: exponent };
    }
    return base;
  }

  function parsePrimary() {
    const t = peek();

    if (t.type === 'NUMBER') {
      next();
      const isPercent = t.value.endsWith('%');
      const raw = isPercent ? t.value.slice(0, -1) : t.value;
      const num = parseFloat(raw);
      return { type: 'NumberLiteral', value: isPercent ? num / 100 : num };
    }

    if (t.type === 'STRING') {
      next();
      const raw = t.value.slice(1, -1).replace(/""/g, '"');
      return { type: 'StringLiteral', value: raw };
    }

    if (t.type === 'ERROR_LITERAL') {
      next();
      return { type: 'ErrorLiteral', value: t.value };
    }

    if (t.type === 'RANGE') {
      next();
      // $는 자동 채우기(고정) 표기일 뿐 값 조회와는 무관하므로 제거해 실제 주소로 정규화한다.
      return { type: 'RangeRef', ref: t.value.toUpperCase().replace(/\$/g, '') };
    }

    if (t.type === 'CELL') {
      next();
      // $는 자동 채우기(고정) 표기일 뿐 값 조회와는 무관하므로 제거해 실제 주소로 정규화한다.
      return { type: 'CellRef', ref: t.value.toUpperCase().replace(/\$/g, '') };
    }

    if (t.type === 'FUNC_NAME') {
      next();
      const name = t.value.toUpperCase();
      expect('LPAREN');
      const args = [];
      if (peek().type !== 'RPAREN') {
        args.push(parseExpr());
        while (peek().type === 'COMMA') {
          next();
          args.push(parseExpr());
        }
      }
      expect('RPAREN');
      return { type: 'FunctionCall', name, args };
    }

    if (t.type === 'IDENTIFIER') {
      next();
      const upper = t.value.toUpperCase();
      if (upper === 'TRUE') return { type: 'BooleanLiteral', value: true };
      if (upper === 'FALSE') return { type: 'BooleanLiteral', value: false };
      throw new Error(`알 수 없는 이름: ${t.value}`);
    }

    if (t.type === 'LPAREN') {
      next();
      const expr = parseExpr();
      expect('RPAREN');
      return expr;
    }

    throw new Error(`예상치 못한 토큰: ${t.type} ${t.value}`);
  }

  const ast = parseExpr();
  if (peek().type !== 'EOF') {
    throw new Error(`수식이 올바르지 않습니다 (토큰 "${peek().value}" 근처)`);
  }
  return ast;
}

// AST를 순회하며 참조하는 셀/범위를 수집 (의존성 그래프 구성용)
export function collectReferences(ast) {
  const refs = [];
  function walk(node) {
    if (!node) return;
    switch (node.type) {
      case 'CellRef':
        refs.push({ type: 'cell', ref: node.ref });
        break;
      case 'RangeRef':
        refs.push({ type: 'range', ref: node.ref });
        break;
      case 'BinaryOp':
        walk(node.left);
        walk(node.right);
        break;
      case 'UnaryOp':
        walk(node.operand);
        break;
      case 'FunctionCall':
        node.args.forEach(walk);
        break;
      default:
        break;
    }
  }
  walk(ast);
  return refs;
}
