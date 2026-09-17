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
    // 조건 범위: 1열 · condRows 조건 행. "<조건>" 캡션이 1행을 차지하므로 머리글은 2행부터. E2:E(2+condRows)
    critRange: (condRows = 1, cols = 1) => `${COL(attCol0)}2:${COL(attCol0 + cols - 1)}${2 + condRows}`,
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

// 마지막 글자의 음운: 받침 유무·ㄹ 받침 여부. 슬롯 단어가 묶음마다 달라 고정 조사 불가.
//  - 한글: 종성코드로 판정 (0=없음, 8=ㄹ)
//  - 숫자: 읽는 소리 (0영·1일·3삼·6육·7칠·8팔=받침 / 2·4·5·9=없음 ; ㄹ소리=1일·7칠·8팔)
//  - 영문: L·M·N·R=받침(엘·엠·엔·알) / 그 외 대문자 단독 등은 없음 ; ㄹ소리=L·R
const DIGIT_BATCHIM = new Set(["0", "1", "3", "6", "7", "8"]);
const DIGIT_RIEUL = new Set(["1", "7", "8"]);
const ENG_BATCHIM = new Set(["L", "M", "N", "R"]);
const ENG_RIEUL = new Set(["L", "R"]);
function lastPhon(word) {
  const s = String(word), ch = s[s.length - 1], c = s.charCodeAt(s.length - 1);
  if (c >= 0xAC00 && c <= 0xD7A3) { const j = (c - 0xAC00) % 28; return { batchim: j !== 0, rieul: j === 8 }; }
  if (/[0-9]/.test(ch)) return { batchim: DIGIT_BATCHIM.has(ch), rieul: DIGIT_RIEUL.has(ch) };
  if (/[A-Za-z]/.test(ch)) { const U = ch.toUpperCase(); return { batchim: ENG_BATCHIM.has(U), rieul: ENG_RIEUL.has(U) }; }
  return { batchim: false, rieul: false };
}
// josa(단어, "받침형/비받침형"). 예: josa(x,"이/가"), josa(x,"을/를"), josa(x,"은/는"), josa(x,"과/와"), josa(x,"으로/로").
// "으로/로" 는 ㄹ 받침이면 "로"(비받침형)을 쓴다.
export function josa(word, pair) {
  const [withB, without] = pair.split("/");
  const { batchim, rieul } = lastPhon(word);
  if (withB === "으로" && rieul) return without;
  return batchim ? withB : without;
}

// 날짜 serial (1899-12-30 기준) + 실제 존재하는 날짜만 뽑기
export const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
const DIM = (y, m) => [31, (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export function randDate(rng, y1, y2, opt = {}) {
  const y = opt.year || rng.range(y1, y2);
  const m = opt.month || (1 + rng.int(12));
  const d = opt.day || (1 + rng.int(DIM(y, m)));
  return { y, m, d, s: serial(y, m, d) };
}
export const serialYear = (s) => new Date(Date.UTC(1899, 11, 30) + s * 86400000).getUTCFullYear();
export const serialMonth = (s) => new Date(Date.UTC(1899, 11, 30) + s * 86400000).getUTCMonth() + 1;
export const serialDay = (s) => new Date(Date.UTC(1899, 11, 30) + s * 86400000).getUTCDate();
export const weekday1 = (s) => new Date(Date.UTC(1899, 11, 30) + s * 86400000).getUTCDay() + 1; // 일=1..토=7
export const weekday2 = (s) => { const d = weekday1(s); return d === 1 ? 7 : d - 1; };            // 월=1..일=7
// 지정 요일(mode 1/2)이 되는 날짜를 뽑는다
export function dateWithWeekday(rng, want, mode, y1, y2, used) {
  for (let t = 0; t < 200; t++) { const dt = randDate(rng, y1, y2); const wd = mode === 2 ? weekday2(dt.s) : weekday1(dt.s); if (wd === want && !used.has(dt.s)) { used.add(dt.s); return dt; } }
  throw new Error("요일 날짜 실패");
}

// ── 단일 셀 결과의 범위 mutation 자체 검증(다중 범위 함수 정렬 어긋남 생존 방지) ──
import { Sheet } from "../../../../excel-engine/index.js";
import { classifySurvivor } from "../../../../utils/calc/survivorRules.js";
import { shiftFormula } from "../../../../utils/formulaUtils.js";
import { buildInstance, translateFormula } from "../../../../utils/calc/buildInstance.js";

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

// ── 열 채우기 결과: 페이지 조합(본표 + 필러 2개)까지 재현해 특정 mutant 가 결과 벡터를 바꾸는지 검증 ──
// removeDollar 처럼 채울 때 범위가 블록 밖(이웃 문항)으로 밀리는 변형은 조합에 따라 값이 달라지므로,
// 테스트와 동일한 레이아웃([spec, 필러, 필러])에서 평가해야 신뢰할 수 있다. 필러는 calcAssembler.FILLER 와 동일.
const _dateFmt = (z) => !z ? undefined : (/h/i.test(z) ? (/y/i.test(z) ? "datetime" : "time") : (/y/i.test(z) ? "date" : undefined));
const _parseA1 = (a) => { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(String(a).trim()); return { c: lettersColU(m[1]), r: +m[2] - 1 }; };
function _expand1D(range) { const [a, b] = range.split(":"); const pa = _parseA1(a), pb = b ? _parseA1(b) : pa; const o = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) o.push(COL(c) + (r + 1)); return o; }
function _expand2D(range) { const [a, b] = range.split(":"); const pa = _parseA1(a), pb = b ? _parseA1(b) : pa; const rows = []; for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(COL(c) + (r + 1)); rows.push(row); } return rows; }
const _FILLER = { subtype: "A-2", colWidths: [6, 6, 6], headers: ["항목", "값1", "값2"], rows: [[1, 2, null], [3, 5, null], [7, 4, null], [6, 9, null], [8, 11, null], [10, 13, null]], result: { kind: "fillCol", col: "값2" }, answer: "=A3+B3", functions: { required: [], candidates: null }, text: "[{표}]에서 값1[{col:값1}]로 값2[{R}]를 계산하시오. (8점)", notes: ["+ 연산자 사용"], accept: [] };
// item0 의 결과 범위에 formula 를 채워 결과 벡터를 얻는다(submit 과 동일 절차: 모든 문항 답 채우고 조건 셀 세팅).
function _fillColVec(inst, item, formula) {
  const sheet = new Sheet();
  for (const [addr, cell] of Object.entries(inst.cells)) { if (cell.f !== undefined) sheet.setCellInput(addr, cell.f.startsWith("=") ? cell.f : "=" + cell.f); else sheet.setCellValue(addr, cell.v, _dateFmt(cell.z)); }
  for (const it of inst.items) {
    const f = it === item ? formula : it.answer.formula;
    const { r: ar, c: ac } = _parseA1(it.result.anchor);
    for (const a of _expand1D(it.result.range)) { const { r, c } = _parseA1(a); sheet.setCellInput(a, String(f).startsWith("=") ? shiftFormula(f, r - ar, c - ac) : String(f)); }
    if (it.criteria) _expand2D(it.criteria.range).forEach((row, ri) => row.forEach((a, ci) => { const v = it.criteria.table[ri + 1]?.[ci]; if (v !== undefined && v !== null && v !== "") sheet.setCellValue(a, v, undefined); }));
  }
  return _expand1D(item.result.range).map((a) => { const v = sheet.getCellValue(a); return (v && typeof v === "object") ? "E:" + v.error : v; });
}
// mutants 목록의 각 수식이 결과 벡터를 바꿔야 한다(안 바꾸면 재시도). 생존 규칙 대상은 목록에서 뺀다.
export function assertFillColClean(spec, mutants) {
  const inst = buildInstance({ id: "_chk", blocks: [spec, _FILLER, _FILLER] });
  const item = inst.items.find((x) => x._blockIndex === 0);   // 테스트 블록(입력 0), items 는 표번호순
  const base = JSON.stringify(_fillColVec(inst, item, item.answer.formula));
  for (const m of mutants) {
    // mutant 는 블록-상대(A1 기준) → 블록 원점으로 이동해 절대 기준식과 같은 위치에서 비교.
    const mm = String(m).startsWith("=") ? "=" + translateFormula(String(m).replace(/^=/, ""), item.origin.r, item.origin.c) : m;
    if (JSON.stringify(_fillColVec(inst, item, mm)) === base) throw new Error("fillCol mutant 무영향: " + m);
  }
}
