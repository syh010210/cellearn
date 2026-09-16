// src/data/exam/calc/templates/_util.js
// 템플릿 공용: 블록-상대 A1 주소 계산(geom) + 워딩 조각(반올림 문구·요일 등).
// 좌표 규약(calcBlock 과 일치): 라벨=행1, 머리글=행2, 데이터=행3.., 부착물 시작 열 = 표너비+1(0-based).

export const COL = (i) => { let s = "", n = i + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };

export function geom(headers, nData) {
  const nCols = headers.length;
  const hdr = 2, dr1 = 3, dr2 = 2 + nData, aggR = dr2 + 1;
  const attCol0 = nCols + 1;
  const idx = (name) => { const i = headers.indexOf(name); if (i < 0) throw new Error(`열 없음: ${name}`); return i; };
  const L = (name) => COL(idx(name));
  return {
    nCols, nData, hdr, dr1, dr2, aggR, attCol0,
    idx, colLetter: L,
    header: (name) => L(name) + hdr,
    dataCell: (name, k) => L(name) + (dr1 + k),
    colRel: (name) => `${L(name)}${dr1}:${L(name)}${dr2}`,
    colAbs: (name) => `$${L(name)}$${dr1}:$${L(name)}$${dr2}`,
    colRowFixed: (name) => `${L(name)}$${dr1}:${L(name)}$${dr2}`,
    dbAll: () => `A${hdr}:${COL(nCols - 1)}${dr2}`,
    dbAllAbs: () => `$A$${hdr}:$${COL(nCols - 1)}$${dr2}`,
    single: () => COL(nCols - 1) + aggR,
    // 조건 범위: 1열 · condRows 조건 행 (rowOffset 0). E1:E(1+condRows)
    critRange: (condRows = 1, cols = 1) => `${COL(attCol0)}1:${COL(attCol0 + cols - 1)}${1 + condRows}`,
    // 참조표 {T}: 머리글+데이터(이름 행 제외, 라벨 열 제외). hasName·데이터행수·너비·hasLabels.
    refRangeAbs: (hasName, nRefRows, width, hasLabels = false) => { const top = hasName ? 1 : 0; const r1 = top + 1, r2 = top + 1 + nRefRows; const c0 = attCol0 + (hasLabels ? 1 : 0); return `$${COL(c0)}$${r1}:$${COL(c0 + width - 1)}$${r2}`; },
  };
}

// 반올림 문구 + 표시 예. mode: "ROUND"|"ROUNDUP"|"ROUNDDOWN", decimals: 0|1|2
// 뒤 위치에는 "소수점 이하"를 반복하지 않는다: "소수점 이하 둘째 자리에서 반올림하여 첫째 자리까지 표시".
const MODE_WORD = { ROUND: "반올림", ROUNDUP: "올림", ROUNDDOWN: "내림" };
const FROM_POS = { 0: "소수점 이하 첫째 자리", 1: "소수점 이하 둘째 자리", 2: "소수점 이하 셋째 자리" };
const TO_POS = { 0: "일의 자리", 1: "첫째 자리", 2: "둘째 자리" };
export function roundPhrase(mode, decimals) {
  return `${FROM_POS[decimals]}에서 ${MODE_WORD[mode]}하여 ${TO_POS[decimals]}까지 표시`;
}
export function applyRound(mode, x, d) {
  const f = Math.pow(10, d);
  if (mode === "ROUNDUP") return Math.ceil(x * f - 1e-9) / f;
  if (mode === "ROUNDDOWN") return Math.floor(x * f + 1e-9) / f;
  return Math.round(x * f) / f;
}
// 표시 예: 문항 결과값(반올림 전 값 ref) ±15% 안에서 뽑는다. 결과와 같은 소수 d자리 + 버리는 자리 1개.
// 반올림 방향이 실제로 드러나게(반올림은 버리는 자리 5~9, 올림·내림은 1~9). 호출부가 데이터·기대값과
// 겹치면 재시도(selfVerify 표시 예 검사). 기출 예시 숫자와 무관.
export function roundExample(mode, d, rng, ref, avoid = []) {
  const f = Math.pow(10, d), f1 = Math.pow(10, d + 1);
  const av = new Set(avoid.map((x) => Number(x)));
  let input, output;
  for (let t = 0; t < 40; t++) {
    const whole = Math.abs(ref) * (0.85 + rng.next() * 0.3);
    const base = Math.floor(whole * f) / f;               // d 자리까지
    const last = mode === "ROUND" ? rng.range(5, 9) : rng.range(1, 9);
    input = Math.round((base + last / f1) * f1) / f1;
    output = applyRound(mode, input, d);
    if (!av.has(output) && !av.has(input)) break;         // 결과값과 겹치면 다시
  }
  // 출력은 결과와 같은 소수 d자리로 표기(4 → "4.0"). 데이터의 정수 문자열과도 안 겹침.
  return { input, output, text: `[표시 예 : ${input} → ${output.toFixed(d)}]` };
}

// D-표: 조건 범위/참조표 셀에 들어갈 조건값을 그대로. 와일드카드 "*부"
export const endsWith = (v, suf) => String(v).endsWith(suf);

// ── 단일 셀 결과의 범위 mutation 자체 검증(다중 범위 함수 정렬 어긋남 생존 방지) ──
import { Sheet } from "../../../../excel-engine/index.js";
import { classifySurvivor } from "../../../../utils/calc/survivorRules.js";

const lettersColU = (L) => { let n = 0; for (const ch of L.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
// 본표(+조건/참조 셀)를 미니 시트에 놓고 formula 를 평가
function evalTable(headers, rows, colZ, formula, extra = {}) {
  const s = new Sheet();
  headers.forEach((h, c) => s.setCellValue(COL(c) + 2, h));
  rows.forEach((row, ri) => row.forEach((v, c) => { if (v !== null && v !== undefined && v !== "") s.setCellValue(COL(c) + (3 + ri), v); }));
  for (const [a, v] of Object.entries(extra)) s.setCellValue(a, v);
  s.setCellInput("AZ1", formula.startsWith("=") ? formula : "=" + formula);
  const val = s.getCellValue("AZ1");
  return (val && typeof val === "object" && val.error) ? "E:" + val.error : val;
}
// 각 범위의 시작-1 확장·끝-1 축소 변형을 만든다(mutate 의 range 규칙과 동일)
function rangeMutants(base) {
  const re = /(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g; const out = []; let m;
  while ((m = re.exec(base)) !== null) {
    const R = { c1d: m[1], col1: m[2], r1d: m[3], row1: +m[4], c2d: m[5], col2: m[6], r2d: m[7], row2: +m[8] };
    const put = (rep) => { if (rep) out.push(base.slice(0, m.index) + rep + base.slice(m.index + m[0].length)); };
    // 끝-1 축소
    if (R.row2 > R.row1) put(`${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2 - 1}`);
    else if (lettersColU(R.col2) > lettersColU(R.col1)) put(`${R.c1d}${R.col1}${R.r1d}${R.row1}:${R.c2d}${COL(lettersColU(R.col2) - 1)}${R.r2d}${R.row2}`);
    // 시작-1 확장
    if (R.row1 > 1) put(`${R.c1d}${R.col1}${R.r1d}${R.row1 - 1}:${R.c2d}${R.col2}${R.r2d}${R.row2}`);
    else if (lettersColU(R.col1) > 0) put(`${R.c1d}${COL(lettersColU(R.col1) - 1)}${R.r1d}${R.row1}:${R.c2d}${R.col2}${R.r2d}${R.row2}`);
  }
  return out;
}
const sameVal = (a, b) => (typeof a === "number" && typeof b === "number") ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)) : a === b;
// 단일 셀 결과: 모든 범위 확장·축소 변형이 값으로 달라지거나 생존 규칙에 해당해야 한다. 아니면 throw(재시도).
export function assertRangesClean(headers, rows, colZ, answer, extra = {}) {
  const base = evalTable(headers, rows, colZ, answer, extra);
  for (const mut of rangeMutants(answer)) {
    if (sameVal(evalTable(headers, rows, colZ, mut, extra), base) && !classifySurvivor(answer, mut, { result: { kind: "single" } })) throw new Error("범위 mutant 생존: " + mut);
  }
}
