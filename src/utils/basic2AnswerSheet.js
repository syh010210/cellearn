// src/utils/basic2AnswerSheet.js
// 기본작업-2 정답 시트: 문제 시트(buildBasic2Sheet)에 각 문항 checks 의 정답 서식을 적용한다.
//  · xlsx-js-style 로 쓸 수 있는 항목만 적용(쓸 수 없는 종류는 BASIC2_ANSWER_UNSUPPORTED 로 제외).
//  · 정답 판정은 basic2Grader(XML 파서 기반)이므로, 파서가 읽는 형태로 스타일을 쓴다.
//  반환: { ws, definedNames:[{Name,Ref}] }  (definedNames 는 워크북 레벨에서 병합)
import { buildBasic2Sheet } from "./examBuilder.js";
import { expandRange, parseRef, idxToCol } from "./xlsxStyles.js";

// xlsx-js-style 로 정답을 쓸 수 없는 검사(실측 기준 — probe-basic2-answer.mjs 로 확정):
//  · cellStyle          : 내장 셀 스타일(쉼표·강조색 등, builtinId) 지정 API 없음(cellStyleXfs/xfId 미지원)
//  · comment            : 메모 텍스트·'항상 표시'·'자동 크기' 를 comments/vml 로 못 쓴다
//  · font 이중 밑줄      : underline 은 항상 single 로 기록됨(double 불가)
//  · border 대각선       : 선 스타일은 써지나 방향(diagonalUp/Down = X 모양)이 기록되지 않음
export function checkUnsupported(chk) {
  if (chk.kind === "cellStyle") return "셀 스타일";
  if (chk.kind === "comment") return "메모(항상 표시·자동 크기)";
  if (chk.kind === "font" && chk.underline && chk.underline !== "single") return "특수 밑줄(이중·회계용)"; // single 만 기록 가능
  if (chk.kind === "border" && chk.diagonal) return "대각선 테두리";
  return null;
}
// 문항이 정답 파일로 완전히 채워지는가(제외 검사를 하나도 포함하지 않으면 true)
export function basic2ItemAnswerable(item) { return (item.checks || []).every((c) => !checkUnsupported(c)); }
// 문제 세트에서 제외된(정답 파일에 담지 못하는) 서식 목록 — 결과 화면 안내용
export function basic2ExcludedFeatures(problems) {
  const set = new Set();
  for (const p of problems || []) if (p.section === "기본2") for (const it of p.items || []) for (const c of it.checks || []) { const u = checkUnsupported(c); if (u) set.add(u); }
  return [...set];
}

const rgbFull = (rgb) => { const s = String(rgb).replace(/^#/, ""); return s.length === 6 ? "FF" + s.toUpperCase() : s.toUpperCase(); };
const box = (range) => { const p = String(range).split(":"); const a = parseRef(p[0]); const b = p[1] ? parseRef(p[1]) : a; return { r1: Math.min(a.row, b.row), r2: Math.max(a.row, b.row), c1: Math.min(a.col, b.col), c2: Math.max(a.col, b.col) }; };
const addr = (r, c) => idxToCol(c) + r;

// 셀 스타일 누적(기존 s 위에 병합) — 여러 검사가 같은 셀을 건드려도 잃지 않게.
function ensure(ws, a) { if (!ws[a]) ws[a] = { t: "z" }; if (!ws[a].s) ws[a].s = {}; return ws[a]; }
function mergeStyle(ws, a, patch) {
  const cell = ensure(ws, a); const s = cell.s;
  if (patch.font) s.font = { ...(s.font || {}), ...patch.font };
  if (patch.alignment) s.alignment = { ...(s.alignment || {}), ...patch.alignment };
  if (patch.fill) s.fill = { ...(s.fill || {}), ...patch.fill };
  if (patch.border) s.border = { ...(s.border || {}), ...patch.border };
}
const setSide = (ws, a, side, style) => { const cell = ensure(ws, a); const b = { ...(cell.s.border || {}) }; b[side] = { style, color: { rgb: "FF000000" } }; cell.s.border = b; };

function applyCheck(ws, chk, definedNames) {
  switch (chk.kind) {
    case "numFmt": for (const a of expandRange(chk.range)) { ensure(ws, a).z = (chk.codes || [])[0]; } break;
    case "shortDate": for (const a of expandRange(chk.range)) { ensure(ws, a).z = "m/d/yy"; } break; // 내장 14 = 간단한 날짜
    case "value": ws[chk.cell] = { t: "s", v: String(chk.equals), s: (ws[chk.cell] && ws[chk.cell].s) || {} }; break;
    case "values": { const cells = expandRange(chk.range); (chk.expected || []).forEach((v, i) => { if (v == null || cells[i] == null) return; const a = cells[i]; ws[a] = typeof v === "number" ? { t: "n", v, s: (ws[a] && ws[a].s) || {} } : { t: "s", v: String(v), s: (ws[a] && ws[a].s) || {} }; }); break; }
    case "fill": for (const a of expandRange(chk.range)) { mergeStyle(ws, a, { fill: { patternType: "solid", fgColor: { rgb: rgbFull(chk.rgb) } } }); } break;
    case "fontColor": for (const a of expandRange(chk.range)) { mergeStyle(ws, a, { font: { color: { rgb: rgbFull(chk.rgb) } } }); } break;
    case "font": { const f = {}; if (chk.name) f.name = chk.name; if (chk.size) f.sz = chk.size; if (chk.bold) f.bold = true; if (chk.italic) f.italic = true; if (chk.underline) f.underline = true; for (const a of expandRange(chk.range)) mergeStyle(ws, a, { font: f }); break; }
    case "alignment": {
      const al = {}; if (chk.horizontal) al.horizontal = chk.horizontal; if (chk.vertical) al.vertical = chk.vertical;
      if (chk.wrapText !== undefined) al.wrapText = !!chk.wrapText; if (chk.indent !== undefined) al.indent = chk.indent;
      if (chk.merge) { addMerge(ws, chk.range); const bb = box(chk.range); mergeStyle(ws, addr(bb.r1, bb.c1), { alignment: al }); }
      else for (const a of expandRange(chk.range)) mergeStyle(ws, a, { alignment: al });
      break;
    }
    case "merge": addMerge(ws, chk.range); mergeStyle(ws, addr(box(chk.range).r1, box(chk.range).c1), { alignment: { horizontal: "center", vertical: "center" } }); break;
    case "rowHeight": { ws["!rows"] = ws["!rows"] || []; ws["!rows"][chk.row - 1] = { hpt: chk.height }; break; }
    case "definedName": if (chk.ref) definedNames.push({ Name: chk.name, Ref: String(chk.ref).replace(/^=/, "") }); break;
    case "border": applyBorder(ws, chk); break;
    case "cellStyle": /* 미지원 — BASIC2_ANSWER_UNSUPPORTED */ break;
    case "comment": /* 메모 텍스트만 (visible·autoSize 미지원) */ if (chk.cell) { const c = ensure(ws, chk.cell); c.c = [{ a: "정답", t: String(chk.text ?? "") }]; c.c.hidden = !chk.visible ? true : false; } break;
    default: break;
  }
}

function addMerge(ws, range) {
  ws["!merges"] = ws["!merges"] || [];
  const b = box(range);                                    // b.r1/r2 는 1-based, SheetJS !merges 는 0-based → -1
  const m = { s: { r: b.r1 - 1, c: b.c1 }, e: { r: b.r2 - 1, c: b.c2 } };
  if (!ws["!merges"].some((x) => x.s.r === m.s.r && x.s.c === m.s.c && x.e.r === m.e.r && x.e.c === m.e.c)) ws["!merges"].push(m);
}

function applyBorder(ws, chk) {
  const b = box(chk.range);
  if (chk.inner) for (let r = b.r1; r <= b.r2; r++) for (let c = b.c1; c <= b.c2; c++) { for (const side of ["top", "bottom", "left", "right"]) setSide(ws, addr(r, c), side, chk.inner); }
  if (chk.outer) {
    for (let c = b.c1; c <= b.c2; c++) { setSide(ws, addr(b.r1, c), "top", chk.outer); setSide(ws, addr(b.r2, c), "bottom", chk.outer); }
    for (let r = b.r1; r <= b.r2; r++) { setSide(ws, addr(r, b.c1), "left", chk.outer); setSide(ws, addr(r, b.c2), "right", chk.outer); }
  }
  for (const e of chk.edges || []) {
    const eb = box(e.range);
    if (e.side === "bottom") for (let c = eb.c1; c <= eb.c2; c++) setSide(ws, addr(eb.r2, c), "bottom", e.style);
    else if (e.side === "top") for (let c = eb.c1; c <= eb.c2; c++) setSide(ws, addr(eb.r1, c), "top", e.style);
    else if (e.side === "right") for (let r = eb.r1; r <= eb.r2; r++) setSide(ws, addr(r, eb.c2), "right", e.style);
    else if (e.side === "left") for (let r = eb.r1; r <= eb.r2; r++) setSide(ws, addr(r, eb.c1), "left", e.style);
  }
  if (chk.diagonal) for (const a of expandRange(chk.range)) { const cell = ensure(ws, a); cell.s.border = { ...(cell.s.border || {}), diagonal: { style: chk.diagonal, color: { rgb: "FF000000" } }, diagonalUp: !!chk.diagonalUp, diagonalDown: !!chk.diagonalDown }; }
}

export function buildBasic2AnswerSheet(problem) {
  const ws = buildBasic2Sheet(problem);
  const definedNames = [];
  for (const it of problem.items || []) for (const chk of it.checks || []) {
    if (chk.kind === "cellStyle" || chk.kind === "comment") continue; // 아예 못 쓰는 종류는 건너뜀
    try { applyCheck(ws, chk, definedNames); } catch { /* 개별 검사 적용 실패는 건너뛴다(써지는 부분만) */ }
  }
  // 빈 셀(t:"z")은 스타일이 있어도 xlsx-js-style 이 직렬화에서 버린다 → 스타일 있는 빈 칸은
  //  빈 문자열 스텁({t:"s",v:""})으로 바꿔야 정렬·글꼴·채우기·테두리 xf 가 파일에 남는다.
  for (const [a, cell] of Object.entries(ws)) {
    if (a.startsWith("!")) continue;
    if (cell && cell.t === "z" && cell.s && Object.keys(cell.s).length) ws[a] = { t: "s", v: "", s: cell.s, ...(cell.z ? { z: cell.z } : {}) };
  }
  return { ws, definedNames };
}
