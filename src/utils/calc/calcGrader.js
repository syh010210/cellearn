// src/utils/calc/calcGrader.js
// 계산작업 채점 (순수 함수). getCell(addr)→{f,v,t,w}|null. 반환은 basic2Grader 형태에 맞춘다.
//   gradeCalcItem(item, getCell, cells?) → { no, points:8, ok, earned, reasons[], details[], hint?, warnings[] }
//   gradeCalc(instance, getCell) → { problemId, items[], earned, total }
// 판정: 결과값(정확일치·상대오차1e-9) + ▶ 함수 목록. 수식 문자열 비교는 채점 아님(hint 전용).

import { extractFunctions } from "./formulaFunctions.js";
import { numToText } from "../../excel-engine/utils.js";
import { astEqualFormula, argDiffReason } from "../../components/lesson/miniexcel/gradePractice.js";

// ── A1 유틸 ──
const lettersCol = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
const colLetters = (c) => { let s = "", n = c + 1; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
function parseA1(a) { const m = /^([A-Za-z]{1,3})(\d+)$/.exec(a.trim()); return { c: lettersCol(m[1]), r: +m[2] - 1 }; }
function expand1D(range) {
  const [a, b] = range.split(":"); const pa = parseA1(a); const pb = b ? parseA1(b) : pa;
  const out = [];
  for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) out.push(colLetters(c) + (r + 1));
  return out;
}
function expand2D(range) {
  const [a, b] = range.split(":"); const pa = parseA1(a); const pb = b ? parseA1(b) : pa;
  const rows = [];
  for (let r = Math.min(pa.r, pb.r); r <= Math.max(pa.r, pb.r); r++) { const row = []; for (let c = Math.min(pa.c, pb.c); c <= Math.max(pa.c, pb.c); c++) row.push(colLetters(c) + (r + 1)); rows.push(row); }
  return rows;
}

// ── 값 비교 ──
function valueEq(exp, cell) {
  if (exp && typeof exp === "object" && exp.error) return cell.t === "e" && cell.v === exp.error;
  if (typeof exp === "number") return cell.t === "n" && Math.abs(cell.v - exp) <= 1e-9 * Math.max(1, Math.abs(exp));
  if (typeof exp === "string") return cell.t === "s" && cell.v === exp;
  if (typeof exp === "boolean") return cell.t === "b" && cell.v === exp;
  return false;
}
const dispExp = (v) => (v && typeof v === "object" && v.error) ? v.error : typeof v === "string" ? `"${v}"` : String(v);
const dispCell = (c) => c.t === "e" ? c.v : c.t === "s" ? `"${c.v}"` : String(c.v);

// 조건 정규화: 숫자→numToText, "=값"(연산자·와일드카드 없음)→"값", 그 외 트림.
function normCond(v) {
  if (typeof v === "number") return numToText(v);
  const s = String(v ?? "").trim();
  if (s.startsWith("=") && !/[<>*?]/.test(s.slice(1))) return s.slice(1);
  return s;
}
const normHead = (v) => String(v ?? "").trim();

export function gradeCalcItem(item, getCell, cells) {
  const reasons = [], details = [], warnings = [];
  const add = (cat, text) => { reasons.push(text); details.push({ cat, text }); };
  let hint;

  const addrs = expand1D(item.result.range);
  const cellOf = {};
  const missing = [], noFormula = [];
  for (const a of addrs) {
    const c = getCell(a); cellOf[a] = c;
    if (!c) missing.push(a);
    else if (c.f === undefined) noFormula.push(a);
  }
  for (const a of missing) add("noFormula", `[${a}] 셀이 비어 있습니다`);
  for (const a of noFormula) add("noFormula", `[${a}] 셀에 수식이 아니라 값이 입력되어 있습니다`);

  // 2) 값 비교 (수식이 있는 셀만)
  const mism = [];
  for (const a of addrs) { const c = cellOf[a]; if (!c || c.f === undefined) continue; if (!valueEq(item.expected[a], c)) mism.push(a); }
  if (mism.length) {
    if (item.result.kind === "single") {
      const a = mism[0]; add("value", `[${a}] 결과가 다릅니다. 입력 ${dispCell(cellOf[a])}, 정답 ${dispExp(item.expected[a])}`);
    } else {
      const shown = mism.slice(0, 3).join(", ");
      add("value", `${item.result.range} 중 ${mism.length}개 셀의 결과가 다릅니다 (${shown})`);
    }
  }

  // 3) 함수 목록 (수식 셀 있을 때만)
  const anyFormula = addrs.some((a) => cellOf[a] && cellOf[a].f !== undefined);
  if (anyFormula) {
    const union = new Set(); let parseErr = false;
    for (const a of addrs) { const c = cellOf[a]; if (!c || c.f === undefined) continue; const r = extractFunctions(c.f); if (r.error) parseErr = true; else r.functions.forEach((f) => union.add(f)); }
    if (parseErr) add("parse", "수식을 해석할 수 없습니다");
    const req = item.functions?.required || [];
    const cand = item.functions?.candidates || null;
    for (const fn of req) if (!union.has(fn)) add("functionMissing", `${fn} 함수를 사용하지 않았습니다`);
    if (cand && cand.length && !cand.some((f) => union.has(f))) add("functionMissing", `${cand.join(", ")} 중 알맞은 함수를 사용하지 않았습니다`);
    const allowed = new Set([...req, ...(cand || [])]);
    for (const f of union) if (!allowed.has(f)) add("functionOutside", `함수 목록에 없는 ${f} 함수를 사용했습니다`);
  }

  // 4) 조건 범위
  if (item.criteria) {
    const grid = expand2D(item.criteria.range).map((row) => row.map((a) => { const c = getCell(a); return c ? c.v : ""; }));
    const sHead = grid[0].map(normHead);
    const eHead = item.criteria.table[0].map(normHead);
    const setEq = (a, b) => a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");
    const rowObjs = (head, rows) => rows.map((row) => JSON.stringify(head.map((h, i) => [normHead(h), normCond(row[i])]).sort()));
    let critMsg = null;
    if (!setEq(sHead, eHead)) critMsg = "머리글이 다릅니다";
    else {
      const sRows = rowObjs(sHead, grid.slice(1));
      const eRows = rowObjs(eHead, item.criteria.table.slice(1));
      if (sRows.length !== eRows.length) critMsg = "조건 행 수가 다릅니다";
      else if ([...sRows].sort().join("~") !== [...eRows].sort().join("~")) critMsg = "조건 값이 다릅니다";
    }
    if (critMsg) add("criteria", `조건 범위 [${item.criteria.range}]의 조건이 다릅니다 — ${critMsg}`);
  }

  // 5) hint (값이 틀렸을 때만; 채점 무관)
  if (mism.length) {
    const anc = getCell(item.result.anchor);
    if (anc && anc.f) {
      const h = argDiffReason(anc.f, item.answer.formula, { padDefaults: true });
      if (h) hint = h; else if (!astEqualFormula(anc.f, item.answer.formula)) hint = "기준 수식과 구조가 다릅니다";
    }
  }

  // 6) warnings (표 데이터 변경; 채점 무관)
  for (const a of item.sourceCells || []) {
    const c = getCell(a); const orig = cells?.[a];
    if (!orig) continue;
    const cv = c ? c.v : undefined;
    if (String(cv) !== String(orig.v)) warnings.push(`표 데이터가 변경되었습니다 (${a})`);
  }

  const ok = reasons.length === 0;
  return { no: item.no, points: 8, ok, earned: ok ? 8 : 0, reasons, details, ...(hint ? { hint } : {}), warnings };
}

export function gradeCalc(instance, getCell) {
  const items = (instance.items || []).map((it) => gradeCalcItem(it, getCell, instance.cells));
  return { problemId: instance.id, items, earned: items.reduce((s, i) => s + i.earned, 0), total: items.length * 8 };
}
