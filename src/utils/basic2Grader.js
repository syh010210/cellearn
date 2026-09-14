// src/utils/basic2Grader.js
//
// 기본작업-2(셀 서식) 채점. 순수 함수. 서식 판정은 xlsxStyles.js가 파싱한 XML 기반 객체만 쓴다.
//   gradeBasic2(workbookStyles, problem) → GradeResult
//
// 원칙(실전모드_계획.md 채택한 결정 8):
//  · 항목(item)은 checks가 전부 통과해야 정답. 부분 점수 없음(시험과 동일).
//  · 사유는 학생에게 보이는 한글 문장. 영어 값(double·centerContinuous·medium)은 노출하지 않는다.
//  · 테두리는 셀이 아니라 모서리(edge) 단위. 인접 두 셀 중 기록된 쪽을 쓴다(둘 다면 더 굵은 쪽).
//
// 사유 생성 구조: 각 check 는 구조화된 issue({kind,range,label,expected,actual,locus} 또는 {kind:'raw',text})만
// 만들고, 문장 조립은 항목 단위 formatItem() 에서 한다(같은 범위의 '미지정'을 한 문장으로 합치기 위함).

import { expandRange, parseRef, idxToCol } from "./xlsxStyles.js";

// ─────────────────────── 값 → 한글 라벨 ───────────────────────
const L_HORIZONTAL = { centerContinuous: "선택 영역의 가운데로", center: "가운데 맞춤", left: "왼쪽 맞춤", right: "오른쪽 맞춤", fill: "채우기", justify: "양쪽 맞춤", distributed: "균등 분할" };
const L_VERTICAL = { center: "가운데 맞춤", top: "위쪽 맞춤", bottom: "아래쪽 맞춤", justify: "양쪽 맞춤", distributed: "균등 분할" };
const L_UNDERLINE = { double: "이중 실선", single: "실선", singleAccounting: "회계용 실선", doubleAccounting: "회계용 이중 실선" };
const L_SIDE = { top: "위쪽", bottom: "아래쪽", left: "왼쪽", right: "오른쪽" };
const L_BORDER_STYLE = { thin: "실선", medium: "굵은 실선", thick: "매우 굵은 실선", double: "이중", dotted: "점선", dashed: "파선", hair: "가는 실선" };

// ECMA-376 §18.8.7 내장 셀 스타일 builtinId → 한글 이름 (컴활 출제 범위).
// 41(강조색 4)만 정답A styles.xml에서 실측. 나머지는 규격 기준(미실측).
export const CELL_STYLE_BUILTIN = {
  0: "표준", 3: "쉼표", 4: "통화", 5: "백분율", 6: "쉼표 [0]", 7: "통화 [0]",
  10: "메모", 11: "경고문",
  15: "제목", 16: "제목 1", 17: "제목 2", 18: "제목 3", 19: "제목 4",
  20: "입력", 21: "출력", 22: "계산", 23: "확인 셀", 24: "연결된 셀", 25: "요약",
  26: "좋음", 27: "나쁨", 28: "보통",
  29: "강조색 1", 30: "20% - 강조색 1", 31: "40% - 강조색 1", 32: "60% - 강조색 1",
  33: "강조색 2", 34: "20% - 강조색 2", 35: "40% - 강조색 2", 36: "60% - 강조색 2",
  37: "강조색 3", 38: "20% - 강조색 3", 39: "40% - 강조색 3", 40: "60% - 강조색 3",
  41: "강조색 4", 42: "20% - 강조색 4", 43: "40% - 강조색 4", 44: "60% - 강조색 4",
  45: "강조색 5", 46: "20% - 강조색 5", 47: "40% - 강조색 5", 48: "60% - 강조색 5",
  49: "강조색 6", 50: "20% - 강조색 6", 51: "40% - 강조색 6", 52: "60% - 강조색 6",
  53: "설명 텍스트",
};

// ─────────────────────── 조사(받침) 자동 선택 ───────────────────────
// 한글: (code-0xAC00)%28 !== 0 이면 받침. 숫자: 0,1,3,6,7,8 받침 / 2,4,5,9 없음.
// 영문: 모음(a,e,i,o,u,y) 없음 / 자음 받침. 그 외(괄호·따옴표 등)는 앞 글자로 판단.
function hasBatchim(word) {
  const s = String(word ?? "");
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
    if (/[0-9]/.test(ch)) return [0, 1, 3, 6, 7, 8].includes(Number(ch));
    if (/[A-Za-z]/.test(ch)) return !"aeiouyAEIOUY".includes(ch);
    // 그 외 문자: 앞 글자로 판단(계속)
  }
  return false;
}
// pair 예: "이/가", "을/를", "은/는"
function josa(word, pair) { const [withB, without] = pair.split("/"); return hasBatchim(word) ? withB : without; }

// ─────────────────────── numFmt 정규화 (코드 비교용) ───────────────────────
// 규칙: (1) 백슬래시 이스케이프 \x 와 따옴표 리터럴 "x" 는 같은 것 — 둘 다 리터럴 문자 x 로 푼다.
//       (2) 공백은 제거하지 않는다. 리터럴 공백(\ · " " · 그냥 공백)은 전부 공백 한 칸으로 통일하되 남긴다.
//       (3) 대소문자는 서식 코드 부분만 소문자화. 리터럴 문자는 원래 대소문자 유지.
export function normNumFmt(code) {
  const s = String(code ?? "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { out += " "; i++; continue; }
    if (ch === "\\") { i++; if (i < s.length) { out += /\s/.test(s[i]) ? " " : s[i]; i++; } continue; }
    if (ch === '"') { i++; while (i < s.length && s[i] !== '"') { out += /\s/.test(s[i]) ? " " : s[i]; i++; } if (i < s.length) i++; continue; }
    out += ch.toLowerCase();
    i++;
  }
  return out.replace(/ +/g, " ");
}

const normName = (s) => String(s ?? "").replace(/\s/g, "");
const normRef = (r) => String(r ?? "").replace(/^.*!/, "").replace(/[$'"\s]/g, "").toUpperCase();
const normText = (s) => String(s ?? "").replace(/\s/g, "");
const stripSheet = (r) => String(r ?? "").replace(/^.*!/, "");

// ─────────────────────── 범위 유틸 ───────────────────────
function rangeBox(range) {
  const parts = String(range).split(":");
  const a = parseRef(parts[0]); const b = parts[1] ? parseRef(parts[1]) : a;
  return { r1: Math.min(a.row, b.row), r2: Math.max(a.row, b.row), c1: Math.min(a.col, b.col), c2: Math.max(a.col, b.col) };
}
const topLeft = (range) => { const b = rangeBox(range); return idxToCol(b.c1) + b.r1; };
function boxesIntersect(x, y) { return x.r1 <= y.r2 && x.r2 >= y.r1 && x.c1 <= y.c2 && x.c2 >= y.c1; }
function rangeContains(outer, inner) {
  try { const o = rangeBox(outer), i = rangeBox(inner); return i.r1 >= o.r1 && i.r2 <= o.r2 && i.c1 >= o.c1 && i.c2 <= o.c2; }
  catch { return false; }
}
function rangeHasMerge(sheet, range) { const box = rangeBox(range); return (sheet.merges || []).some((m) => boxesIntersect(box, rangeBox(m))); }
function hasMergeCovering(sheet, range) {
  const want = rangeBox(range);
  return (sheet.merges || []).some((m) => { const b = rangeBox(m); return b.r1 === want.r1 && b.r2 === want.r2 && b.c1 === want.c1 && b.c2 === want.c2; });
}

// ─────────────────────── issue 헬퍼 ───────────────────────
const mism = (range, label, expected, actual, locus) => ({ kind: "mismatch", range, label, expected: expected == null ? null : String(expected), actual: actual == null ? null : String(actual), locus: locus || null });
const miss = (range, label, expected, locus) => ({ kind: "missing", range, label, expected: expected == null ? null : String(expected), locus: locus || null });
const raw = (text) => ({ kind: "raw", text });

// ─────────────────────── 개별 check → issues ───────────────────────
function checkAlignment(sheet, chk) {
  const issues = [];
  if (chk.horizontal === "centerContinuous" && rangeHasMerge(sheet, chk.range))
    issues.push(raw(`[${chk.range}] '선택 영역의 가운데로'가 아니라 '병합하고 가운데'로 되어 있습니다.`));
  let targets;
  if (chk.merge) {
    if (!hasMergeCovering(sheet, chk.range)) issues.push(raw(`[${chk.range}] '병합하고 가운데 맞춤'이 지정되지 않았습니다.`));
    targets = [topLeft(chk.range)];
  } else targets = expandRange(chk.range);
  const attrs = [
    { key: "horizontal", label: "가로 맞춤", map: L_HORIZONTAL },
    { key: "vertical", label: "세로 맞춤", map: L_VERTICAL },
    { key: "wrapText", label: "자동 줄 바꿈", map: { true: "적용", false: "해제" } },
    { key: "indent", label: "들여쓰기", map: {} },
  ];
  for (const a of attrs) {
    if (chk[a.key] === undefined) continue;
    const want = a.key === "wrapText" ? !!chk[a.key] : chk[a.key];
    let bad = null;
    for (const addr of targets) {
      const actual = sheet.cells[addr]?.alignment?.[a.key] ?? null;
      if (actual !== want) { bad = { actual }; break; }
    }
    if (bad) {
      const wantLabel = a.map[want] ?? String(want);
      if (bad.actual == null) issues.push(miss(chk.range, a.label, wantLabel));
      else issues.push(mism(chk.range, a.label, wantLabel, a.map[bad.actual] ?? String(bad.actual)));
    }
  }
  return { ok: issues.length === 0, issues, detail: { kind: "alignment", range: chk.range } };
}

function isDefaultFont(f, def) {
  if (!f) return true;
  if (def) return normName(f.name) === normName(def.name) && Number(f.size) === Number(def.size) && !f.bold && !f.italic && f.underline == null;
  return !f.bold && !f.italic && f.underline == null && (f.size == null || Number(f.size) === 11);
}
function checkFont(sheet, chk, defaultFont) {
  const issues = [];
  const targets = expandRange(chk.range);
  const specs = [
    { key: "name", label: "글꼴" },
    { key: "size", label: "글꼴 크기" },
    { key: "bold", label: "굵게", bool: true },
    { key: "italic", label: "기울임꼴", bool: true },
    { key: "underline", label: "밑줄", underline: true },
  ];
  for (const sp of specs) {
    if (chk[sp.key] === undefined) continue;
    let bad = null;
    for (const addr of targets) {
      const f = sheet.cells[addr]?.font ?? null;
      const applied = f && !isDefaultFont(f, defaultFont);
      if (sp.bool) { if (!f?.[sp.key]) { bad = { missing: true }; break; } }
      else if (sp.underline) { const u = f?.underline ?? null; if (u !== chk.underline) { bad = u == null ? { missing: true } : { actual: u }; break; } }
      else if (sp.key === "name") { if (normName(f?.name) !== normName(chk.name)) { bad = applied ? { actual: f?.name } : { missing: true }; break; } }
      else if (sp.key === "size") { if (Number(f?.size) !== Number(chk.size)) { bad = applied ? { actual: f?.size } : { missing: true }; break; } }
    }
    if (bad) {
      const wantLabel = sp.underline ? (L_UNDERLINE[chk.underline] ?? String(chk.underline)) : (sp.bool ? null : String(chk[sp.key]));
      if (bad.missing) issues.push(miss(chk.range, sp.label, sp.bool ? null : wantLabel));
      else {
        const actualLabel = sp.underline ? (L_UNDERLINE[bad.actual] ?? String(bad.actual)) : String(bad.actual);
        issues.push(mism(chk.range, sp.label, wantLabel, actualLabel));
      }
    }
  }
  return { ok: issues.length === 0, issues, detail: { kind: "font", range: chk.range } };
}

function checkRowHeight(sheet, chk) {
  const actual = sheet.rows?.[String(chk.row)]?.height ?? null;
  const ok = actual != null && Math.abs(actual - chk.height) < 0.5;
  // 범위 표기는 항목 범위를 쓰도록 range=null → formatItem 에서 항목 범위로 치환
  const issues = ok ? [] : [actual == null ? miss(null, "행 높이", String(chk.height)) : mism(null, "행 높이", String(chk.height), String(actual))];
  return { ok, issues, detail: { kind: "rowHeight", row: chk.row, expected: chk.height, actual, ok } };
}

function checkColWidth(sheet, chk) {
  const colIdx = chk.col != null ? (typeof chk.col === "number" ? chk.col : parseRef(chk.col + "1").col) : rangeBox(chk.range).c1;
  const def = (sheet.cols || []).find((c) => c.min != null && c.max != null && colIdx + 1 >= c.min && colIdx + 1 <= c.max);
  const actual = def?.width ?? null;
  const ok = actual != null && Math.abs(actual - chk.width) < 0.6;
  const r = `${idxToCol(colIdx)}열`;
  const issues = ok ? [] : [actual == null ? miss(r, "열 너비", String(chk.width)) : mism(r, "열 너비", String(chk.width), String(Math.round(actual * 10) / 10))];
  return { ok, issues, detail: { kind: "colWidth", col: idxToCol(colIdx), expected: chk.width, actual, ok } };
}

function checkCellStyle(sheet, chk) {
  const targets = expandRange(chk.range);
  const wantLabel = chk.builtinId != null ? (CELL_STYLE_BUILTIN[chk.builtinId] ?? chk.name ?? `builtinId ${chk.builtinId}`) : (chk.name ?? "");
  let themeSeen = null, bad = null;
  for (const addr of targets) {
    const cell = sheet.cells[addr];
    const cs = cell?.cellStyle;
    themeSeen = cell?.fill?.fgColor?.theme ?? themeSeen;
    const ok = chk.builtinId != null ? cs?.builtinId === chk.builtinId : normName(cs?.name) === normName(chk.name);
    if (!ok) { bad = { cs }; break; }
  }
  const issues = [];
  if (bad) {
    const cs = bad.cs;
    const unset = cs == null || cs.builtinId == null || cs.builtinId === 0; // 표준(기본)은 '미지정'으로 본다
    if (unset) issues.push(miss(chk.range, "셀 스타일", wantLabel));
    else issues.push(mism(chk.range, "셀 스타일", wantLabel, CELL_STYLE_BUILTIN[cs.builtinId] ?? cs.name ?? `builtinId ${cs.builtinId}`));
  }
  return { ok: issues.length === 0, issues, detail: { kind: "cellStyle", range: chk.range, expected: wantLabel, fillTheme: themeSeen } };
}

function checkNumFmt(sheet, chk) {
  const wants = (chk.codes || []).map(normNumFmt);
  const wantLabel = (chk.codes || []).join(" 또는 ");
  let bad = null;
  for (const addr of expandRange(chk.range)) {
    const code = sheet.cells[addr]?.numFmt?.code ?? null;
    const norm = normNumFmt(code);
    const isGeneral = norm === "general" || code == null;
    if (isGeneral || !wants.includes(norm)) { bad = { addr, code, isGeneral }; break; }
  }
  const issues = [];
  if (bad) {
    if (bad.isGeneral) issues.push(miss(chk.range, "표시 형식", wantLabel, bad.addr));
    else issues.push(mism(chk.range, "표시 형식", wantLabel, bad.code, bad.addr));
  }
  return { ok: issues.length === 0, issues, detail: { kind: "numFmt", range: chk.range, expected: wantLabel, samples: chk.samples ?? [] } };
}

function checkDefinedName(workbookStyles, chk) {
  const dn = (workbookStyles.definedNames || []).find((x) => normName(x.name) === normName(chk.name));
  if (!dn) return { ok: false, issues: [raw(`이름 정의 '${chk.name}'${josa(chk.name, "이/가")} 없습니다.`)], detail: { kind: "definedName", name: chk.name, ok: false } };
  if (chk.ref && normRef(dn.ref) !== normRef(chk.ref)) {
    const actual = stripSheet(dn.ref);
    return { ok: false, issues: [raw(`이름 정의 '${chk.name}'의 참조가 '${chk.ref}'${josa(chk.ref, "이/가")} 아니라 '${actual}'입니다.`)], detail: { kind: "definedName", name: chk.name, expected: chk.ref, actual: dn.ref, ok: false } };
  }
  return { ok: true, issues: [], detail: { kind: "definedName", name: chk.name, actual: dn.ref, ok: true } };
}

function checkComment(sheet, chk) {
  const cm = sheet.comments?.[chk.cell];
  if (!cm) return { ok: false, issues: [raw(`[${chk.cell}] 메모가 없습니다.`)], detail: { kind: "comment", cell: chk.cell, ok: false } };
  const issues = [];
  if (chk.text !== undefined && normText(cm.text) !== normText(chk.text)) issues.push(raw(`[${chk.cell}] 메모가 '${chk.text}'${josa(chk.text, "이/가")} 아니라 '${cm.text ?? ""}'입니다.`));
  if (chk.visible !== undefined && !!cm.visible !== !!chk.visible) issues.push(raw(`[${chk.cell}] 메모가 항상 표시되도록 지정되지 않았습니다.`));
  if (chk.autoSize !== undefined && !!cm.autoSize !== !!chk.autoSize) issues.push(raw(`[${chk.cell}] 메모가 '자동 크기'로 지정되지 않았습니다.`));
  return { ok: issues.length === 0, issues, detail: { kind: "comment", cell: chk.cell, actual: cm } };
}

// ── 테두리(모서리 단위) ── 지시문 문구를 그대로 쓰는 raw 사유.
const PROM = { hair: 1, dotted: 2, dashed: 2, thin: 3, mediumDashed: 4, medium: 5, thick: 6, double: 7 };
function borderCheck(sheet, chk) {
  const box = rangeBox(chk.range);
  const sideOf = (r, c, side) => sheet.cells[idxToCol(c) + r]?.border?.[side]?.style ?? null;
  const pick = (a, b) => ((PROM[a] || 0) >= (PROM[b] || 0) ? a : b);
  const vEdge = (r, c) => pick(sideOf(r, c, "right"), sideOf(r, c + 1, "left"));
  const hEdge = (r, c) => pick(sideOf(r, c, "bottom"), sideOf(r + 1, c, "top"));

  const overridden = new Set();
  const overrideChecks = [];
  for (const e of chk.edges || []) {
    const eb = rangeBox(e.range);
    const keys = [];
    if (e.side === "bottom") for (let c = eb.c1; c <= eb.c2; c++) keys.push(`H:${eb.r2}:${c}`);
    else if (e.side === "top") for (let c = eb.c1; c <= eb.c2; c++) keys.push(`H:${eb.r1 - 1}:${c}`);
    else if (e.side === "right") for (let r = eb.r1; r <= eb.r2; r++) keys.push(`V:${r}:${eb.c2}`);
    else if (e.side === "left") for (let r = eb.r1; r <= eb.r2; r++) keys.push(`V:${r}:${eb.c1 - 1}`);
    keys.forEach((k) => overridden.add(k));
    overrideChecks.push({ e, keys });
  }

  // 누락 위치는 "셀 방향"으로 적는다. 세로 모서리=그 셀의 오른쪽, 가로 모서리=그 셀의 아래쪽.
  const issues = [];
  if (chk.inner) {
    let bad = null;
    for (let r = box.r1; r <= box.r2 && !bad; r++) for (let c = box.c1; c < box.c2; c++) { if (overridden.has(`V:${r}:${c}`)) continue; if (vEdge(r, c) !== chk.inner) { bad = `${idxToCol(c)}${r} 오른쪽`; break; } }
    for (let c = box.c1; c <= box.c2 && !bad; c++) for (let r = box.r1; r < box.r2; r++) { if (overridden.has(`H:${r}:${c}`)) continue; if (hEdge(r, c) !== chk.inner) { bad = `${idxToCol(c)}${r} 아래쪽`; break; } }
    if (bad) issues.push(raw(`[${chk.range}] 모든 테두리가 빠진 곳이 있습니다. (${bad})`));
  }
  if (chk.outer) {
    let bad = null;
    for (let c = box.c1; c <= box.c2 && !bad; c++) { if (sideOf(box.r1, c, "top") !== chk.outer) bad = `${idxToCol(c)}${box.r1} 위쪽`; else if (sideOf(box.r2, c, "bottom") !== chk.outer) bad = `${idxToCol(c)}${box.r2} 아래쪽`; }
    for (let r = box.r1; r <= box.r2 && !bad; r++) { if (sideOf(r, box.c1, "left") !== chk.outer) bad = `${idxToCol(box.c1)}${r} 왼쪽`; else if (sideOf(r, box.c2, "right") !== chk.outer) bad = `${idxToCol(box.c2)}${r} 오른쪽`; }
    if (bad) issues.push(raw(`[${chk.range}] 굵은 바깥쪽 테두리가 빠진 곳이 있습니다. (${bad})`));
  }
  for (const oc of overrideChecks) {
    const { e, keys } = oc;
    let badKey = null;
    for (const k of keys) { const [type, rr, cc] = k.split(":"); const eff = type === "H" ? hEdge(Number(rr), Number(cc)) : vEdge(Number(rr), Number(cc)); if (eff !== e.style) { badKey = k; break; } }
    if (badKey) {
      const [type, rr, cc] = badKey.split(":");
      const loc = `${idxToCol(Number(cc))}${rr} ${type === "H" ? "아래쪽" : "오른쪽"}`;
      issues.push(raw(`[${e.range}] ${L_SIDE[e.side] ?? ""} ${L_BORDER_STYLE[e.style] ?? e.style} 테두리가 빠진 곳이 있습니다. (${loc})`));
    }
  }
  return { ok: issues.length === 0, issues, detail: { kind: "border", range: chk.range } };
}

function checkMerge(sheet, chk) {
  const ok = hasMergeCovering(sheet, chk.range);
  return { ok, issues: ok ? [] : [raw(`[${chk.range}] 병합되어 있지 않습니다.`)], detail: { kind: "merge", range: chk.range, ok } };
}

function checkFill(sheet, chk) {
  const issues = [];
  for (const addr of expandRange(chk.range)) {
    const fg = sheet.cells[addr]?.fill?.fgColor;
    let ok = !!fg && fg.patternType !== "none";
    if (chk.theme != null) ok = fg?.theme === chk.theme;
    if (chk.rgb != null) ok = ok && String(fg?.rgb).toUpperCase().endsWith(String(chk.rgb).toUpperCase());
    if (!ok) { issues.push(raw(`[${chk.range}] ${addr} 채우기 색이 지정되지 않았거나 다릅니다.`)); break; }
  }
  return { ok: issues.length === 0, issues, detail: { kind: "fill", range: chk.range } };
}

// ─────────────────────── 항목 단위 사유 조립 ───────────────────────
const sMismatch = (i) => `[${i.range}] ${i.locus ? i.locus + " " : ""}${i.label}${josa(i.label, "이/가")} '${i.expected}'${josa(i.expected, "이/가")} 아니라 '${i.actual}'입니다.`;
function sMissing(i) {
  const head = `[${i.range}] ${i.locus ? i.locus + " " : ""}${i.label}${josa(i.label, "이/가")} 지정되지 않았습니다.`;
  return i.expected != null ? `${head} 지시는 '${i.expected}'입니다.` : head;
}
// 병합 문장에서만 줄이는 라벨 (단독 문장은 원래 라벨 유지)
const MERGE_LABEL = { "글꼴 크기": "크기" };
const shortLabel = (l) => MERGE_LABEL[l] ?? l;
const sMerged = (range, labels) => { const ls = labels.map(shortLabel); return `[${range}] ${ls.join(", ")}${josa(ls[ls.length - 1], "이/가")} 지정되지 않았습니다.`; };

function firstRange(item) { for (const c of item.checks || []) if (c.range) return c.range; return null; }

function formatItem(item, issues) {
  const primary = firstRange(item);
  issues.forEach((i) => { if (i.kind !== "raw" && i.range == null) i.range = primary; });

  // 미지정을 범위 그룹으로 묶되(항목 범위 포함분끼리), 출력은 체크(issue) 순서를 보존한다.
  const groups = new Map();
  const keyOf = (m) => (primary && m.range && rangeContains(primary, m.range) ? primary : (m.range || primary || ""));
  for (const i of issues) if (i.kind === "missing") { const k = keyOf(i); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(i); }

  const out = [];
  const doneGroup = new Set();
  for (const i of issues) {
    if (i.kind === "raw") { out.push(i.text); continue; }
    if (i.kind === "mismatch") { out.push(sMismatch(i)); continue; }
    // missing: 그룹이 2개 이상이면 첫 멤버 위치에서 한 번만 병합 출력, 아니면 단독 출력
    const k = keyOf(i);
    const arr = groups.get(k);
    if (arr.length >= 2) { if (!doneGroup.has(k)) { doneGroup.add(k); out.push(sMerged(k, arr.map((x) => x.label))); } }
    else out.push(sMissing(i));
  }
  return out;
}

// ─────────────────────── 디스패치 ───────────────────────
function runCheck(workbookStyles, sheet, chk) {
  switch (chk.kind) {
    case "alignment": return checkAlignment(sheet, chk);
    case "font": return checkFont(sheet, chk, workbookStyles.fonts?.[0]);
    case "rowHeight": return checkRowHeight(sheet, chk);
    case "colWidth": return checkColWidth(sheet, chk);
    case "cellStyle": return checkCellStyle(sheet, chk);
    case "numFmt": return checkNumFmt(sheet, chk);
    case "definedName": return checkDefinedName(workbookStyles, chk);
    case "comment": return checkComment(sheet, chk);
    case "border": return borderCheck(sheet, chk);
    case "merge": return checkMerge(sheet, chk);
    case "fill": return checkFill(sheet, chk);
    default: return { ok: false, issues: [raw(`알 수 없는 검사 종류: ${chk.kind}`)], detail: { kind: chk.kind, ok: false } };
  }
}

// ─────────────────────── 공개 API ───────────────────────
export function gradeBasic2(workbookStyles, problem) {
  const sheet = workbookStyles.sheets?.[problem.sheetName];
  const total = (problem.items || []).reduce((s, it) => s + (it.points || 0), 0);
  if (!sheet) {
    return {
      problemId: problem.id, sheetFound: false,
      items: (problem.items || []).map((it) => ({ no: it.no, points: it.points, ok: false, earned: 0, reasons: [`'${problem.sheetName}' 시트가 없습니다.`], details: [] })),
      earned: 0, total,
    };
  }
  const items = (problem.items || []).map((it) => {
    const outs = (it.checks || []).map((chk) => runCheck(workbookStyles, sheet, chk));
    const ok = outs.every((o) => o.ok);
    const issues = outs.flatMap((o) => o.issues);
    return {
      no: it.no, points: it.points, ok, earned: ok ? it.points : 0,
      reasons: formatItem(it, issues),
      details: outs.map((o) => o.detail),
    };
  });
  return { problemId: problem.id, sheetFound: true, items, earned: items.reduce((s, it) => s + it.earned, 0), total };
}
