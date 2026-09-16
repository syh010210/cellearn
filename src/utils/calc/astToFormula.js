// src/utils/calc/astToFormula.js
// AST → 수식 문자열. 우선순위 보존을 위해 이항/단항은 괄호로 감싼다.
// 주의: 엔진 파서가 $ 를 제거하므로 round-trip 은 함수·계산값은 보존하되 $ 표기는 잃는다.

function numStr(v) {
  if (typeof v !== "number") return String(v);
  return Object.is(v, -0) ? "0" : String(v);
}

export function astToFormula(node) {
  if (!node) return "";
  switch (node.type) {
    case "NumberLiteral": return numStr(node.value);
    case "StringLiteral": return '"' + String(node.value).replace(/"/g, '""') + '"';
    case "BooleanLiteral": return node.value ? "TRUE" : "FALSE";
    case "ErrorLiteral": return node.value;
    case "CellRef": return node.ref;
    case "RangeRef": return node.ref;
    case "UnaryOp": return "(" + node.op + astToFormula(node.operand) + ")";
    case "BinaryOp": return "(" + astToFormula(node.left) + node.op + astToFormula(node.right) + ")";
    case "FunctionCall": return node.name + "(" + node.args.map(astToFormula).join(",") + ")";
    case "MissingArg": return "";
    default: return "";
  }
}
