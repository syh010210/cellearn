// scripts/check-calc-coverage.mjs  (npm run test:calc-coverage)
// 계산작업 함수 목록(src/data/exam/calc/functions.js)의 각 함수가
//  · 엔진(FUNCTIONS / LAZY_FUNCTIONS)에 실제로 등록되어 있는지 (별칭 STDEV·MODE 도 이름 그대로 확인)
//  · functionSyntax.js 표시용 구문에 있는지 (별칭은 정식 이름으로 확인)
// 를 표로 출력하고, 하나라도 빠지면 실패(exit 1).

import { CALC_FUNCTIONS, XLFN_FUNCTIONS } from "../src/data/exam/calc/functions.js";
import { FUNCTIONS, LAZY_FUNCTIONS } from "../src/excel-engine/functions/index.js";
import { FUNCTION_SYNTAX } from "../src/data/functionSyntax.js";

const engineHas = (n) => Object.prototype.hasOwnProperty.call(FUNCTIONS, n) || Object.prototype.hasOwnProperty.call(LAZY_FUNCTIONS, n);
const syntaxHas = (n) => Object.prototype.hasOwnProperty.call(FUNCTION_SYNTAX, n);

let fail = 0;
const rows = [];
for (const f of CALC_FUNCTIONS) {
  const engineName = f.engine || f.name;
  const syntaxName = f.syntax || f.name;
  const eOk = engineHas(engineName);
  const sOk = syntaxHas(syntaxName);
  if (!eOk || !sOk) fail++;
  rows.push({
    name: f.name,
    xlfn: XLFN_FUNCTIONS.has(f.name) ? "xlfn" : "",
    engine: eOk ? "O" : "X",
    syntax: sOk ? "O" : "X" + (syntaxName !== f.name ? `(${syntaxName})` : ""),
    subtypes: (f.subtypes || []).join(","),
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log("=== 계산작업 함수 커버리지 ===");
console.log(pad("함수", 12) + pad("xlfn", 6) + pad("엔진", 6) + pad("구문", 6) + "소유형");
for (const r of rows) console.log(pad(r.name, 12) + pad(r.xlfn, 6) + pad(r.engine, 6) + pad(r.syntax, 6) + r.subtypes);

console.log(`\n총 ${rows.length}개 · xlfn ${[...XLFN_FUNCTIONS].join(", ")}`);
if (fail) { console.log(`\n✗ 실패: ${fail}개 함수가 엔진 또는 구문에 없음`); process.exit(1); }
console.log("\n✓ 모든 함수가 엔진과 구문에 등록됨");
