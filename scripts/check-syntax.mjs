// 함수 구문 문자열 단일화 검사기.
//
// src/data/lessons/*.json 과 src/components/diagrams/*.jsx 에서
// "구문: =NAME(...)" 패턴(마크다운 **구문** 포함)을 전부 찾아,
// functionSyntax.js 의 표시용 구문과 다른 것을 파일·줄과 함께 출력한다.
//
// 실행:  node scripts/check-syntax.mjs   (npm run check:syntax)
// 다른 것이 하나라도 있으면 종료 코드 1.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { FUNCTION_SYNTAX } from "../src/data/functionSyntax.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TARGETS = [
  { dir: join(ROOT, "src/data/lessons"), ext: ".json" },
  { dir: join(ROOT, "src/components/diagrams"), ext: ".jsx" },
];

// "구문" 뒤에 =NAME( ... ) 이 오는 표기를 잡는다.
//   그룹1 = 함수명, 그룹2 = 괄호 안 인수 문자열
// 표시용 구문에는 괄호가 중첩되지 않으므로 [^)]* 로 충분하다.
const RE = /구문[^\n=]*?=\s*([A-Z][A-Z0-9._]*)\s*\(([^)]*)\)/g;

function collectFiles({ dir, ext }) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.filter((f) => f.endsWith(ext)).map((f) => join(dir, f));
}

const problems = [];

for (const target of TARGETS) {
  for (const file of collectFiles(target)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      RE.lastIndex = 0;
      let m;
      while ((m = RE.exec(line)) !== null) {
        const name = m[1].toUpperCase();
        const found = `=${name}(${m[2].trim()})`;
        const expected = FUNCTION_SYNTAX[name];
        if (expected === undefined) {
          problems.push({ file, line: i + 1, name, found, expected: "(functionSyntax 미등록 함수)" });
        } else if (found !== expected) {
          problems.push({ file, line: i + 1, name, found, expected });
        }
      }
    });
  }
}

if (problems.length === 0) {
  console.log("✓ check:syntax — 모든 '구문: =' 표기가 functionSyntax.js 와 일치합니다.");
  process.exit(0);
}

console.error(`✗ check:syntax — functionSyntax.js 와 다른 구문 표기 ${problems.length}건:\n`);
for (const p of problems) {
  console.error(`  ${relative(ROOT, p.file)}:${p.line}  [${p.name}]`);
  console.error(`      발견: ${p.found}`);
  console.error(`      기대: ${p.expected}\n`);
}
process.exit(1);
