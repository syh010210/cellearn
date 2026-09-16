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
export function roundExample(mode, d, rng, ref) {
  const f = Math.pow(10, d), f1 = Math.pow(10, d + 1);
  const whole = Math.abs(ref) * (0.85 + rng.next() * 0.3);
  const base = Math.floor(whole * f) / f;                 // d 자리까지
  const last = mode === "ROUND" ? rng.range(5, 9) : rng.range(1, 9);
  const input = Math.round((base + last / f1) * f1) / f1;
  const output = applyRound(mode, input, d);
  // 출력은 결과와 같은 소수 d자리로 표기(4 → "4.0"). 데이터의 정수 문자열과도 안 겹침.
  return { input, output, text: `[표시 예 : ${input} → ${output.toFixed(d)}]` };
}

// D-표: 조건 범위/참조표 셀에 들어갈 조건값을 그대로. 와일드카드 "*부"
export const endsWith = (v, suf) => String(v).endsWith(suf);
