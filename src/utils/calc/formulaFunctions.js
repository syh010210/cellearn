// src/utils/calc/formulaFunctions.js
// 수식에서 사용된 함수 이름만 추출. 엔진 파서로 AST 를 만들어 FunctionCall 이름을 모은다.
//  · 선행 "=" 보정, _xlfn.·_xlws. 제거.
//  · 동치: STDEV→STDEV.S, MODE→MODE.SNGL (그 외 동치 없음).
//  · 문자열 리터럴 속 "IF(" 등은 파서가 StringLiteral 로 처리하므로 자연히 제외된다.
//  · 파싱 실패 시 { error }.

import { parseFormula } from "../../excel-engine/parser.js";

const ALIAS = { STDEV: "STDEV.S", MODE: "MODE.SNGL" };
const norm = (name) => { const u = String(name).toUpperCase(); return ALIAS[u] || u; };

export function extractFunctions(formula) {
  let f = String(formula ?? "").trim();
  if (f.startsWith("=")) f = f.slice(1);
  f = f.replace(/_xlfn\.|_xlws\./g, "");
  if (f === "") return { functions: [] };
  let ast;
  try { ast = parseFormula(f); } catch { return { error: "수식을 해석할 수 없습니다" }; }
  const set = new Set();
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    switch (n.type) {
      case "FunctionCall": set.add(norm(n.name)); n.args.forEach(walk); break;
      case "BinaryOp": walk(n.left); walk(n.right); break;
      case "UnaryOp": walk(n.operand); break;
      default: break; // CellRef/RangeRef/*Literal/MissingArg — 자식 없음
    }
  })(ast);
  return { functions: [...set] };
}
