// src/utils/calc/buildInstance.js
// 블록들을 페이지에 배치 → 엔진으로 기대값 계산 → 문제 인스턴스 생성 + 자체 검증.
// 좌표는 calcLayout(origin) + calcBlock(블록-상대)에서만 나온다. 엔진은 수정하지 않는다.

import { Sheet, isErrorValue } from "../../excel-engine/index.js";
import { shiftFormula } from "../formulaUtils.js";
import { resolveBlock } from "./calcBlock.js";
import { layoutPage } from "./calcLayout.js";

// ── A1 좌표 유틸 (0-based r,c) ──
const colLetters = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const a1 = (r, c) => colLetters(c) + (r + 1);
const rngA1 = (rg) => (rg.r1 === rg.r2 && rg.c1 === rg.c2) ? a1(rg.r1, rg.c1) : `${a1(rg.r1, rg.c1)}:${a1(rg.r2, rg.c2)}`;
const dateFmt = (z) => !z ? undefined : (/h/i.test(z) ? (/y/i.test(z) ? "datetime" : "time") : (/y/i.test(z) ? "date" : undefined));
// 표시 폭(엑셀 열 단위 근사): CJK·전각 2, 그 외 1.
const estCharW = (s) => { let w = 0; for (const ch of String(s)) { const cp = ch.codePointAt(0); w += ((cp >= 0x1100 && cp <= 0x115F) || (cp >= 0x2E80 && cp <= 0xA4CF) || (cp >= 0xAC00 && cp <= 0xD7A3) || (cp >= 0xF900 && cp <= 0xFAFF) || (cp >= 0xFF00 && cp <= 0xFF60) || (cp >= 0xFFE0 && cp <= 0xFFE6)) ? 2 : 1; } return w; };
const decodeRangeCols = (range) => { const a = String(range).split(":")[0]; return { c1: lettersCol(/[A-Za-z]+/.exec(a)[0]) }; };
const XLSX_decode = (range) => { const [a, b = a] = String(range).split(":"); const pa = /^([A-Za-z]+)(\d+)$/.exec(a), pb = /^([A-Za-z]+)(\d+)$/.exec(b); return { r1: +pa[2] - 1, c1: lettersCol(pa[1]), r2: +pb[2] - 1, c2: lettersCol(pb[1]) }; };

// 수식의 모든 셀 참조를 (dRow,dCol) 만큼 이동($ 표시는 유지). 문자열 리터럴은 건드리지 않는다.
function translateFormula(formula, dRow, dCol) {
  let out = "", i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (ch === '"') { out += ch; i++; while (i < formula.length) { out += formula[i]; if (formula[i] === '"') { i++; if (formula[i] === '"') { out += '"'; i++; continue; } break; } i++; } continue; }
    const rest = formula.slice(i);
    const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)/.exec(rest);
    const prev = formula[i - 1] || "";
    const after = formula[i + (m ? m[0].length : 0)];
    if (m && !/[A-Za-z0-9_.$]/.test(prev) && after !== "(") {
      const ci = lettersCol(m[2]) + dCol, ri = parseInt(m[4], 10) - 1 + dRow;
      out += m[1] + colLetters(ci) + m[3] + (ri + 1);
      i += m[0].length; continue;
    }
    out += ch; i++;
  }
  return out;
}

// 지시문/▶ 줄의 [주소]/[범위] 토큰 추출 (A1 형태만; [표1]·[표시 예…] 제외)
function bracketAddrs(text) {
  const out = [];
  const re = /\[([A-Za-z]{1,3}\d+(?::[A-Za-z]{1,3}\d+)?)\]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}
function expandA1(range) {
  const [a, b] = range.split(":");
  const pa = /^([A-Za-z]{1,3})(\d+)$/.exec(a); const pb = b ? /^([A-Za-z]{1,3})(\d+)$/.exec(b) : pa;
  const c1 = lettersCol(pa[1]), r1 = +pa[2] - 1, c2 = lettersCol(pb[1]), r2 = +pb[2] - 1;
  const cells = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) cells.push(`${r},${c}`);
  return cells;
}

export function buildInstance({ id, seed = "sample", difficulty = "상", blocks }) {
  // [표N] 의 N 은 샘플 번호가 아니라 조합 안의 문항 위치(1-based).
  const specs = blocks.map((spec, bi) => resolveBlock(spec, "표" + (bi + 1)));
  const { origins, usedRange } = layoutPage(specs.map((b) => ({ w: b.width, h: b.height })));

  const sheet = new Sheet();
  const cells = {};              // 문제 파일 상태
  const merges = [];
  const colWidths = {};
  const occupied = new Map();    // "r,c" → role (겹침 검사)
  const globalRoles = new Map(); // "r,c" → role (좌표 검증)
  const items = [];

  const OR = (bi) => origins[bi];
  const ABS = (bi, r, c) => ({ r: OR(bi).r + r, c: OR(bi).c + c });
  const AA = (bi, r, c) => a1(OR(bi).r + r, OR(bi).c + c);
  const AR = (bi, rg) => rngA1({ r1: OR(bi).r + rg.r1, c1: OR(bi).c + rg.c1, r2: OR(bi).r + rg.r2, c2: OR(bi).c + rg.c2 });
  const occupy = (bi, r, c, role) => {
    const k = `${OR(bi).r + r},${OR(bi).c + c}`;
    if (occupied.has(k)) throw new Error(`셀 겹침: ${a1(OR(bi).r + r, OR(bi).c + c)} (${occupied.get(k)} ↔ ${role})`);
    occupied.set(k, role); globalRoles.set(k, role);
  };

  // 1) 파일 셀 적재
  specs.forEach((b, bi) => {
    for (const p of b.fileCells) {
      const addr = AA(bi, p.r, p.c);
      occupy(bi, p.r, p.c, p.role);
      if (p.f) { const f = translateFormula(p.f, OR(bi).r, OR(bi).c); cells[addr] = { f }; sheet.setCellInput(addr, f); }
      else { const cell = {}; if (p.v !== undefined) cell.v = p.v; if (p.t) cell.t = p.t; if (p.z) cell.z = p.z; cells[addr] = cell; sheet.setCellValue(addr, p.v, dateFmt(p.z)); }
    }
    for (const m of b.merges) merges.push(AR(bi, m));
    (b.spec.colWidths || []).forEach((w, c) => { colWidths[colLetters(OR(bi).c + c)] = w; });
  });

  // 2) 조건 값(계산용) + 결과 셀 자리 점유
  specs.forEach((b, bi) => {
    if (b.criteria) for (const cc of b.criteria.cells) { occupy(bi, cc.r, cc.c, "criteria"); sheet.setCellValue(AA(bi, cc.r, cc.c), cc.v, undefined); }
    for (const rc of b.result.cells) occupy(bi, rc.r, rc.c, "result");
  });

  // 3) answer → result 범위로 이동 채우기
  specs.forEach((b, bi) => {
    const absAnswer = translateFormula(b.answer.formula.replace(/^=/, ""), OR(bi).r, OR(bi).c);
    for (const rc of b.result.cells) {
      const f = shiftFormula("=" + absAnswer, rc.r - b.answer.r, rc.c - b.answer.c);
      sheet.setCellInput(AA(bi, rc.r, rc.c), f);
    }
  });

  // 4) 기대값 + 결과/조건 셀 비우기 + item 구성
  specs.forEach((b, bi) => {
    const expected = {};
    for (const rc of b.result.cells) {
      const addr = AA(bi, rc.r, rc.c);
      const v = sheet.getCellValue(addr);
      expected[addr] = isErrorValue(v) ? { error: v.error } : (v === undefined ? "" : v);
      delete cells[addr]; // 결과는 문제 파일에서 비움
    }
    // 조건 범위는 파일에 넣지 않았으므로 이미 비어 있음

    // placeholder 해석: {R} {anchor} {C} {T} {RT} {base} {col:이름}
    const resolve = (s) => String(s)
      .replace(/\{표\}/g, "표" + (bi + 1))
      .replace(/\{R\}/g, rngA1({ r1: OR(bi).r + b.result.range.r1, c1: OR(bi).c + b.result.range.c1, r2: OR(bi).r + b.result.range.r2, c2: OR(bi).c + b.result.range.c2 }))
      .replace(/\{anchor\}/g, AA(bi, b.answer.r, b.answer.c))
      .replace(/\{C\}/g, b.criteria ? AR(bi, b.criteria.range) : "")
      .replace(/\{T\}/g, b.refTableRange ? AR(bi, b.refTableRange) : "")
      .replace(/\{RT\}/g, b.resultTableRange ? AR(bi, b.resultTableRange) : "")
      .replace(/\{base\}/g, b.ph.base ? AR(bi, b.ph.base) : "")
      .replace(/\{col:([^}]+)\}/g, (_, name) => AR(bi, b.colRange(name)));

    const text = resolve(b.spec.text);
    const notes = (b.spec.notes || []).map(resolve);

    items.push({
      no: bi + 1, subtype: b.spec.subtype, points: 8,
      text, notes,
      functions: b.spec.functions,
      result: { kind: b.result.kind, range: rngA1({ r1: OR(bi).r + b.result.range.r1, c1: OR(bi).c + b.result.range.c1, r2: OR(bi).r + b.result.range.r2, c2: OR(bi).c + b.result.range.c2 }), anchor: AA(bi, b.answer.r, b.answer.c), fill: b.result.fill, ...(b.result.z ? { z: b.result.z } : {}) },
      answer: { formula: "=" + translateFormula(b.answer.formula.replace(/^=/, ""), OR(bi).r, OR(bi).c) },
      criteria: b.criteria ? { range: AR(bi, b.criteria.range), rows: b.criteria.rows, table: b.criteria.table } : null,
      expected,
      sourceCells: b.dataCells.map((d) => AA(bi, d.r, d.c)),
      accept: b.spec.accept || [],
      reject: b.spec.reject || [],
    });
  });

  // 셀 역할(addr→role): 서식(calcSheetBuilder)이 역할별로 테두리·음영·정렬을 준다.
  const roles = {};
  specs.forEach((b, bi) => { for (const [rc, role] of b.roles) { const [r, c] = rc.split(",").map(Number); roles[AA(bi, r, c)] = role; } });

  // 자동 열 너비 — 2단계.
  //  1단계: 병합 안 된 셀만으로 열별 최대 표시 폭(머리글·데이터·결과 기대값·조건·참조표). [표N]·제목·<캡션>은 제외.
  //  2단계: 병합 라벨(single·fillRow 라벨, 제목)은 병합 열 합계가 모자랄 때만 부족분을 병합 열에 고르게 더한다.
  //  최소 = 엑셀 기본(8.43), 여백 +2, 상한 20(초과 시 경고).
  const DEFAULT_W = 8.43, PAD = 2, CAP = 20;
  const CAPTION_ROLES = new Set(["label", "title", "critlabel", "reflabel", "rtname"]);
  const dispV = (v, z) => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "object") return v.error ? String(v.error) : String(v.v ?? "");
    if (typeof v === "number") {
      if (z && /y/i.test(z)) return "0000-00-00";
      if (z && /h/i.test(z)) return "00:00:00";
      if (z && z.includes("#,##0")) return Math.round(Math.abs(v)).toLocaleString("en-US") + (/\.0/.test(z) ? ".0" : "") + (v < 0 ? "-" : "");
      return String(Number(v.toPrecision(12)));            // 엑셀 General 근사: 부동소수 노이즈 제거(3.9000000000000004→3.9)
    }
    return String(v);
  };
  // 병합에 포함된 셀 집합(앵커 제외 X — 전부) + 앵커→범위
  const mergedCells = new Set();
  const mergeRanges = merges.map((m) => { const rg = XLSX_decode(m); for (let r = rg.r1; r <= rg.r2; r++) for (let c = rg.c1; c <= rg.c2; c++) mergedCells.add(`${r},${c}`); return rg; });
  const key = (addr) => { const c = lettersCol(/[A-Z]+/.exec(addr)[0]), r = +/\d+/.exec(addr)[0] - 1; return `${r},${c}`; };

  // 1단계
  const colContent = {};
  const seeW = (c, s) => { const w = estCharW(s); if (w > (colContent[c] || 0)) colContent[c] = w; };
  for (const [addr, c] of Object.entries(cells)) {
    if (mergedCells.has(key(addr)) || CAPTION_ROLES.has(roles[addr])) continue;
    const ci = lettersCol(/[A-Z]+/.exec(addr)[0]);
    seeW(ci, c.f !== undefined ? dispV(sheet.getCellValue(addr), c.z) : dispV(c.v, c.z));
  }
  for (const it of items) {
    for (const [addr, v] of Object.entries(it.expected)) { if (!mergedCells.has(key(addr))) seeW(lettersCol(/[A-Z]+/.exec(addr)[0]), dispV(v, it.result?.z)); }
    if (it.criteria) { const { c1 } = decodeRangeCols(it.criteria.range); (it.criteria.table || []).forEach((row) => row.forEach((cell, i) => seeW(c1 + i, dispV(cell)))); }
  }
  const maxC = usedRange.c2;
  const overflow = [];
  const width = {};                                        // colIdx → 확정 너비
  for (let c = 0; c <= maxC; c++) { const raw = colContent[c] ? colContent[c] + PAD : DEFAULT_W; width[c] = Math.max(DEFAULT_W, Math.min(CAP, raw)); if (colContent[c] + PAD > CAP) overflow.push(`${colLetters(c)}(${colContent[c]})`); }

  // 2단계: 병합 라벨 부족분 분배 (제외 대상 caption 은 skip — critlabel 병합 등)
  for (const rg of mergeRanges) {
    const anchor = colLetters(rg.c1) + (rg.r1 + 1);
    if (CAPTION_ROLES.has(roles[anchor])) continue;        // <조건> 등 캡션 병합은 폭에 반영 안 함
    const cell = cells[anchor]; if (!cell) continue;
    const need = estCharW(dispV(cell.v, cell.z)) + PAD;
    let have = 0; for (let c = rg.c1; c <= rg.c2; c++) have += width[c];
    if (need > have) { const span = rg.c2 - rg.c1 + 1, add = (need - have) / span; for (let c = rg.c1; c <= rg.c2; c++) width[c] = Math.min(CAP, width[c] + add); }
  }
  for (let c = 0; c <= maxC; c++) colWidths[colLetters(c)] = Math.round(width[c] * 100) / 100;
  if (overflow.length) console.warn(`[calc 열너비 상한 초과] ${id}: ${overflow.join(" ")}`);

  const instance = { id, section: "계산", seed, difficulty, sheetName: "계산작업", cells, merges, colWidths, roles, usedRange: rngA1(usedRange), items };
  selfVerify(instance, specs, origins, globalRoles);
  return instance;
}

// ── 자체 검증 (실패 시 예외) ──
function selfVerify(inst, specs, origins, globalRoles) {
  const OR = (bi) => origins[bi];

  inst.items.forEach((it, bi) => {
    const b = specs[bi];
    // (텍스트 위생) 연속 공백 금지 · "(8점)" 앞 공백 정확히 1개
    for (const s of [it.text, ...it.notes]) {
      if (/\s{2,}/.test(s)) throw new Error(`[${it.no}] 연속 공백: "${s}"`);
    }
    if (!/[^ ] \(8점\)$/.test(it.text)) throw new Error(`[${it.no}] 배점 표기 공백 오류: "${it.text.slice(-12)}"`);
    // (0) 표 크기: 열 3~7, 데이터 행 6~11
    if (b.nCols < 3 || b.nCols > 7) throw new Error(`[${it.no}] 표 열 수 ${b.nCols} (3~7 이어야 함)`);
    if (b.nData < 6 || b.nData > 11) throw new Error(`[${it.no}] 데이터 행 수 ${b.nData} (6~11 이어야 함)`);
    // (6) 채우기 결과: 전부 같은 값이 아니다. fillRow·table 숫자 결과는 서로 같은 값 쌍이 없다.
    if (b.result.kind !== "single") {
      const vals = Object.values(it.expected);
      const key = (v) => (v && typeof v === "object") ? "E:" + v.error : (typeof v === "number") ? "N:" + v : "S:" + v;
      const keys = vals.map(key);
      if (new Set(keys).size <= 1) throw new Error(`[${it.no}] 채우기 결과가 전부 같은 값(${keys[0]})`);
      if ((b.result.kind === "fillRow" || b.result.kind === "table") && vals.every((v) => typeof v === "number")) {
        if (new Set(keys).size !== keys.length) throw new Error(`[${it.no}] ${b.result.kind} 숫자 결과에 같은 값 쌍 있음: ${keys.join(",")}`);
      }
    }
    // (1) 기대값에 의도치 않은 오류 없음 (allowError 제외)
    const allow = new Set((b.spec.allowError || []));
    for (const [addr, v] of Object.entries(it.expected)) {
      if (v && typeof v === "object" && v.error && !allow.has(addr)) throw new Error(`[${it.no}] 기대값 오류: ${addr}=${v.error}  (${it.answer.formula})`);
    }
    // (3) 지시문/▶ 의 [주소] 가 실제 셀 역할과 일치
    for (const tok of [it.text, ...it.notes].flatMap(bracketAddrs)) {
      for (const key of expandA1(tok)) {
        if (!globalRoles.has(key)) throw new Error(`[${it.no}] 지시문 좌표 오기: [${tok}] → ${key.split(",").map((n, i) => i ? n : "").join("")} 역할 없음`);
      }
    }
    // (4) D함수 텍스트 조건: 앞부분 일치 행집합 == 완전 일치 행집합
    if (b.criteria) {
      const headers = b.spec.headers;
      const dataByCol = {}; // header → [values]
      headers.forEach((h, c) => { dataByCol[h] = b.spec.rows.map((row) => row[c]); });
      b.criteria.rows.forEach((row) => {
        for (const [h, cond] of Object.entries(row)) {
          if (cond == null || cond === "") continue;
          const s = String(cond);
          if (/^[<>=]/.test(s) || /[*?]/.test(s)) continue; // 연산자·와일드카드 제외
          const vals = dataByCol[h] || [];
          const pre = vals.map((v, i) => [i, String(v ?? "").toUpperCase().startsWith(s.toUpperCase())]).filter(([, m]) => m).map(([i]) => i).join(",");
          const exact = vals.map((v, i) => [i, String(v ?? "").toUpperCase() === s.toUpperCase()]).filter(([, m]) => m).map(([i]) => i).join(",");
          if (pre !== exact) throw new Error(`[${it.no}] 조건 '${s}'(${h}) 앞부분≠완전 일치 (prefix행 ${pre} vs exact행 ${exact}) — 데이터 충돌`);
        }
      });
    }
    // (5) 표시 예 값이 실제 데이터에 없음
    const dataVals = new Set(b.spec.rows.flat().filter((v) => v != null).map((v) => String(typeof v === "object" ? v.v : v)));
    for (const note of it.notes) {
      const mm = /표시\s*예\s*[:：]?\s*([^\]]+)/.exec(note);
      if (!mm) continue;
      for (const tok of mm[1].split(/[→,]/).map((s) => s.trim()).filter(Boolean)) {
        if (dataVals.has(tok)) throw new Error(`[${it.no}] 표시 예 값 '${tok}'이 실제 데이터에 존재`);
      }
    }
  });

  // (2) 결과·조건 범위가 입력 셀과 겹치지 않음 — occupy() 가 빌드 중 이미 강제(겹치면 예외).
}
