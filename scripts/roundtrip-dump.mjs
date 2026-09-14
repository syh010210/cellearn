// scripts/roundtrip-dump.mjs
// 저장된 xlsx를 두 경로로 읽어 셀 서식을 덤프한다.
//   (1) xlsx-js-style : XLSX.read(..., {cellStyles, cellNF, cellDates:false, cellFormula})
//   (2) JSZip 원본 XML : styles.xml / sheetN.xml / workbook.xml / comments / vml 을 직접 파싱
//
// 실행:  node scripts/roundtrip-dump.mjs <xlsx 경로>
// 출력:  <같은폴더>/<파일명>.dump.json  +  <파일명>.dump.md
//
// 목적: 기본작업-2 서식 항목이 어느 경로에서 식별되는지 확인(채점 로직은 만들지 않음).

import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";

const SHEET = "기본작업-2";
const RANGE = { c1: 0, c2: 7, r1: 0, r2: 9 }; // A1:H10 (0-based)

// ────────────────────────── 인자 ──────────────────────────
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("사용법: node scripts/roundtrip-dump.mjs <xlsx 경로>");
  process.exit(1);
}
const buf = readFileSync(inputPath);
const outBase = join(dirname(inputPath), basename(inputPath).replace(/\.[^.]+$/, ""));

// ────────────────────────── 공통 유틸 ──────────────────────────
const COL = (c) => String.fromCharCode(65 + c);
const addrsAH110 = () => {
  const out = [];
  for (let r = RANGE.r1; r <= RANGE.r2; r++) for (let c = RANGE.c1; c <= RANGE.c2; c++) out.push(`${COL(c)}${r + 1}`);
  return out;
};
const decodeXml = (s) =>
  String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

// 속성 순서에 의존하지 않는 속성 파서
function parseAttrs(openTag) {
  const attrs = {};
  const re = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(openTag)) !== null) attrs[m[1]] = decodeXml(m[2]);
  return attrs;
}
// <tag ...>...</tag> 또는 <tag .../> 블록 목록 (같은 태그가 자기 안에 중첩되지 않는다는 가정 — styles.xml/sheet.xml 요소에 성립)
function getBlocks(xml, tag) {
  const blocks = [];
  const open = `<${tag}`;
  let i = 0;
  while (true) {
    const start = xml.indexOf(open, i);
    if (start < 0) break;
    const after = xml[start + open.length];
    if (after && !/[\s/>]/.test(after)) { i = start + open.length; continue; } // <cellStyleXfs> 가 <cellStyle> 로 오인되는 것 방지
    const gt = xml.indexOf(">", start);
    if (gt < 0) break;
    const openTag = xml.slice(start, gt + 1);
    if (openTag.endsWith("/>")) {
      blocks.push({ attrs: parseAttrs(openTag), inner: "" });
      i = gt + 1;
    } else {
      const close = `</${tag}>`;
      const ci = xml.indexOf(close, gt + 1);
      if (ci < 0) { blocks.push({ attrs: parseAttrs(openTag), inner: "" }); i = gt + 1; }
      else { blocks.push({ attrs: parseAttrs(openTag), inner: xml.slice(gt + 1, ci) }); i = ci + close.length; }
    }
  }
  return blocks;
}
const firstRegion = (xml, tag) => { const b = getBlocks(xml, tag); return b.length ? b[0].inner : ""; };

// ══════════════════════════ (1) xlsx-js-style 경로 ══════════════════════════
function readSheetJS(withStyles) {
  const wb = XLSX.read(buf, { type: "buffer", cellStyles: withStyles, cellNF: true, cellDates: false, cellFormula: true });
  return wb;
}
const wbStyled = readSheetJS(true);
const wbNoStyle = readSheetJS(false);
const wsStyled = wbStyled.Sheets[SHEET];
const wsNoStyle = wbNoStyle.Sheets[SHEET];

const sjCells = {};
for (const a of addrsAH110()) {
  const cell = wsStyled?.[a];
  sjCells[a] = cell
    ? { t: cell.t ?? null, v: cell.v ?? null, w: cell.w ?? null, f: cell.f ?? null, z: cell.z ?? null, s: cell.s ?? null, c: cell.c ?? null }
    : null;
}
// cellStyles 없이 읽었을 때 s 가 사라지는지
let anyStyledCellHasS = false, anyNoStyleCellHasS = false;
for (const a of addrsAH110()) {
  if (wsStyled?.[a]?.s) anyStyledCellHasS = true;
  if (wsNoStyle?.[a]?.s) anyNoStyleCellHasS = true;
}

const sheetjs = {
  cells: sjCells,
  merges: wsStyled?.["!merges"] ?? null,
  rows: wsStyled?.["!rows"] ?? null,
  cols: wsStyled?.["!cols"] ?? null,
  definedNames: wbStyled.Workbook?.Names ?? null,
  cellStylesExperiment: {
    withCellStyles_anyCellHasS: anyStyledCellHasS,
    withoutCellStyles_anyCellHasS: anyNoStyleCellHasS,
    note: anyStyledCellHasS && !anyNoStyleCellHasS
      ? "cellStyles:false 로 읽으면 s(스타일)가 사라진다 → 서식 채점 시 cellStyles:true 필수"
      : (!anyStyledCellHasS ? "styled 로 읽어도 s 가 없다(서식 미적용 파일이거나 SheetJS가 못 읽음)" : "두 경우 모두 s 존재"),
  },
};

// ══════════════════════════ (2) JSZip 원본 XML 경로 ══════════════════════════
const zip = await JSZip.loadAsync(buf);
async function grab(path) { const f = zip.file(path); return f ? await f.async("string") : null; }

const workbookXml = await grab("xl/workbook.xml");
const wbRels = await grab("xl/_rels/workbook.xml.rels");

// 시트 표시이름 → 워크시트 XML 경로 (없으면 sheet1.xml)
function resolveSheetPath() {
  if (!workbookXml || !wbRels) return "xl/worksheets/sheet1.xml";
  let rid = null;
  for (const s of getBlocks(workbookXml, "sheet")) if (s.attrs.name === SHEET) { rid = s.attrs["r:id"] || s.attrs["id"]; break; }
  if (!rid) return "xl/worksheets/sheet1.xml";
  let target = null;
  for (const rel of getBlocks(wbRels, "Relationship")) if (rel.attrs.Id === rid) { target = rel.attrs.Target; break; }
  if (!target) return "xl/worksheets/sheet1.xml";
  return "xl/" + target.replace(/^\/?xl\//, "").replace(/^\//, "");
}
const sheetPath = resolveSheetPath();
const sheetXml = await grab(sheetPath);
const sheetRelsPath = sheetPath.replace(/worksheets\/([^/]+)$/, "worksheets/_rels/$1.rels");
const stylesXml = await grab("xl/styles.xml");
const comments1 = await grab("xl/comments1.xml");
const vml1 = await grab("xl/drawings/vmlDrawing1.vml");
const sheetRels = await grab(sheetRelsPath);

const rawXml = {
  "xl/workbook.xml": workbookXml,
  [sheetPath]: sheetXml,
  "xl/styles.xml": stylesXml,
  "xl/comments1.xml": comments1,
  "xl/drawings/vmlDrawing1.vml": vml1,
  "xl/_rels/workbook.xml.rels": wbRels,
  [sheetRelsPath]: sheetRels,
};

// ── styles.xml 파싱 ──
const BUILTIN_NUMFMT = { 0: "General", 1: "0", 2: "0.00", 3: "#,##0", 4: "#,##0.00", 9: "0%", 10: "0.00%", 14: "mm-dd-yy(날짜)", 22: "m/d/yy h:mm" };
function parseFontInner(inner) {
  const nm = getBlocks(inner, "name")[0]?.attrs.val ?? null;
  const sz = getBlocks(inner, "sz")[0]?.attrs.val ?? null;
  const bold = inner.includes("<b/>") || inner.includes("<b ") ? true : false;
  const uBlk = getBlocks(inner, "u")[0];
  const underline = uBlk ? (uBlk.attrs.val || "single") : null;
  const color = getBlocks(inner, "color")[0]?.attrs ?? null;
  return { name: nm, sz, bold, underline, color };
}
function parseBorderInner(inner) {
  const side = (s) => { const b = getBlocks(inner, s)[0]; return b ? { style: b.attrs.style ?? null, color: getBlocks(b.inner, "color")[0]?.attrs ?? null } : null; };
  return { left: side("left"), right: side("right"), top: side("top"), bottom: side("bottom"), diagonal: side("diagonal") };
}
function parseFillInner(inner) {
  const pf = getBlocks(inner, "patternFill")[0];
  if (!pf) return null;
  return { patternType: pf.attrs.patternType ?? null, fgColor: getBlocks(pf.inner, "fgColor")[0]?.attrs ?? null, bgColor: getBlocks(pf.inner, "bgColor")[0]?.attrs ?? null };
}
let styles = null;
if (stylesXml) {
  const numFmtsList = getBlocks(stylesXml, "numFmt").map((b) => ({ numFmtId: b.attrs.numFmtId, formatCode: b.attrs.formatCode }));
  const numFmtMap = Object.fromEntries(numFmtsList.map((n) => [n.numFmtId, n.formatCode]));
  const fonts = getBlocks(firstRegion(stylesXml, "fonts"), "font").map((b) => parseFontInner(b.inner));
  const fills = getBlocks(firstRegion(stylesXml, "fills"), "fill").map((b) => parseFillInner(b.inner));
  const borders = getBlocks(firstRegion(stylesXml, "borders"), "border").map((b) => parseBorderInner(b.inner));
  const cellXfs = getBlocks(firstRegion(stylesXml, "cellXfs"), "xf").map((b) => ({ ...b.attrs, alignment: getBlocks(b.inner, "alignment")[0]?.attrs ?? null }));
  const cellStyleXfs = getBlocks(firstRegion(stylesXml, "cellStyleXfs"), "xf").map((b) => ({ ...b.attrs, alignment: getBlocks(b.inner, "alignment")[0]?.attrs ?? null }));
  const cellStyles = getBlocks(firstRegion(stylesXml, "cellStyles"), "cellStyle").map((b) => b.attrs);
  const dxfsCount = getBlocks(firstRegion(stylesXml, "dxfs"), "dxf").length;
  styles = { numFmtMap, fonts, fills, borders, cellXfs, cellStyleXfs, cellStyles, dxfsCount };
}
const numFmtLabel = (id) => (id == null ? null : (styles?.numFmtMap[id] ?? BUILTIN_NUMFMT[id] ?? `(id ${id})`));

// ── sheet XML 셀 파싱 + 스타일 해석 ──
const xmlCells = {};
if (sheetXml) {
  const wantSet = new Set(addrsAH110());
  const sd = firstRegion(sheetXml, "sheetData");
  for (const c of getBlocks(sd || sheetXml, "c")) {
    const r = c.attrs.r;
    if (!wantSet.has(r)) continue;
    const sIdx = c.attrs.s != null ? Number(c.attrs.s) : null;
    const xf = sIdx != null && styles ? styles.cellXfs[sIdx] : null;
    let resolved = null;
    if (xf) {
      const styleName = xf.xfId != null && styles?.cellStyles ? styles.cellStyles.find((cs) => cs.xfId === xf.xfId)?.name ?? null : null;
      resolved = {
        numFmtId: xf.numFmtId ?? null, numFmt: numFmtLabel(xf.numFmtId),
        fontId: xf.fontId ?? null, font: xf.fontId != null ? styles.fonts[Number(xf.fontId)] : null,
        fillId: xf.fillId ?? null, fill: xf.fillId != null ? styles.fills[Number(xf.fillId)] : null,
        borderId: xf.borderId ?? null, border: xf.borderId != null ? styles.borders[Number(xf.borderId)] : null,
        applyNumberFormat: xf.applyNumberFormat ?? null, applyAlignment: xf.applyAlignment ?? null,
        alignment: xf.alignment ?? null, xfId: xf.xfId ?? null, cellStyleName: styleName,
      };
    }
    xmlCells[r] = { s: sIdx, t: c.attrs.t ?? null, f: getBlocks(c.inner, "f")[0]?.inner ?? null, v: getBlocks(c.inner, "v")[0]?.inner ?? null, xf: resolved };
  }
}
// rows / merges / definedNames
const xmlRows = sheetXml ? getBlocks(sheetXml, "row").map((b) => ({ r: b.attrs.r, ht: b.attrs.ht ?? null, customHeight: b.attrs.customHeight ?? null })) : [];
const xmlMerges = sheetXml ? getBlocks(sheetXml, "mergeCell").map((b) => b.attrs.ref) : [];
const xmlDefinedNames = workbookXml ? getBlocks(workbookXml, "definedName").map((b) => ({ name: b.attrs.name, ref: b.inner })) : [];
// comments
let xmlComments = [];
if (comments1) xmlComments = getBlocks(comments1, "comment").map((b) => ({ ref: b.attrs.ref, text: getBlocks(b.inner, "t").map((t) => t.inner).join("") }));

const jszip = { sheetPath, styles, cells: xmlCells, rows: xmlRows, merges: xmlMerges, definedNames: xmlDefinedNames, comments: xmlComments, hasVml: !!vml1, hasCommentsFile: !!comments1 };

// ══════════════════════════ 덤프 JSON ══════════════════════════
const dump = { input: inputPath, sheet: SHEET, sheetjs, jszip, rawXml };
writeFileSync(`${outBase}.dump.json`, JSON.stringify(dump, null, 2), "utf8");

// ══════════════════════════ B-3 분석 표 (.dump.md) ══════════════════════════
const NF = "안 읽힘";
const sj = (a) => sjCells[a];
const xc = (a) => xmlCells[a];
const has = (v) => v !== null && v !== undefined && v !== "";

// 각 항목: {label, need, sjFn, xmlFn} → sjFn/xmlFn 는 "읽힘(값)"/"부분(..)"/null 반환
function borderMediumAnywhere() {
  for (const a of addrsAH110()) { const b = xc(a)?.xf?.border; if (b) for (const s of ["left", "right", "top", "bottom"]) if (b[s]?.style && /medium|thick/.test(b[s].style)) return `${a}.${s}=${b[s].style}`; }
  return null;
}
function sjBorderMediumAnywhere() {
  for (const a of addrsAH110()) { const b = sj(a)?.s?.border; if (b) for (const s of ["left", "right", "top", "bottom"]) if (b[s]?.style && /medium|thick/.test(b[s].style)) return `${a}.${s}=${b[s].style}`; }
  return null;
}
const ROWS = [
  { label: "① 선택 영역의 가운데로", need: "alignment.horizontal = centerContinuous",
    sj: () => sj("A1")?.s?.alignment?.horizontal === "centerContinuous" ? "읽힘 (centerContinuous)" : (sj("A1")?.s?.alignment ? `부분 (${JSON.stringify(sj("A1").s.alignment)})` : null),
    xml: () => xc("A1")?.xf?.alignment?.horizontal === "centerContinuous" ? "읽힘 (centerContinuous)" : (xc("A1")?.xf?.alignment ? `부분 (${JSON.stringify(xc("A1").xf.alignment)})` : null) },
  { label: "① 글꼴 이름/크기/굵게", need: "font.name/sz/bold",
    sj: () => { const f = sj("A1")?.s?.font; return f && (f.name || f.sz || f.bold) ? `읽힘 (name=${f.name}, sz=${f.sz}, bold=${!!f.bold})` : null; },
    xml: () => { const f = xc("A1")?.xf?.font; return f && (f.name || f.sz || f.bold) ? `읽힘 (name=${f.name}, sz=${f.sz}, bold=${f.bold})` : null; } },
  { label: "① 밑줄 이중 실선", need: "font.underline = double",
    sj: () => { const u = sj("A1")?.s?.font?.underline; return u ? (u === true || u === 2 || u === "double" ? "읽힘 (double 추정)" : `부분 (underline=${u})`) : null; },
    xml: () => { const u = xc("A1")?.xf?.font?.underline; return u ? (u === "double" ? "읽힘 (double)" : `부분 (u val=${u})`) : null; } },
  { label: "① 행 높이 30", need: "row ht",
    sj: () => { const h = sheetjs.rows?.[0]?.hpt; return has(h) ? `읽힘 (hpt=${h})` : null; },
    xml: () => { const row = xmlRows.find((r) => r.r === "1"); return row?.ht ? `읽힘 (ht=${row.ht}${row.customHeight ? ", customHeight" : ""})` : null; } },
  { label: "② 셀 스타일 '강조색 4'", need: "cellStyles name / fill 색",
    sj: () => { const fill = sj("A3")?.s?.fill; return fill?.fgColor ? `부분 (fill=${JSON.stringify(fill.fgColor)}, 스타일명은 SheetJS 미제공)` : null; },
    xml: () => { const nm = xc("A3")?.xf?.cellStyleName; const fill = xc("A3")?.xf?.fill; return nm ? `읽힘 (cellStyle="${nm}")` : (fill?.fgColor ? `부분 (fill fgColor=${JSON.stringify(fill.fgColor)}, 명명 스타일 없음)` : null); } },
  { label: "② 가로 가운데", need: "alignment.horizontal = center",
    sj: () => sj("A3")?.s?.alignment?.horizontal === "center" ? "읽힘 (center)" : null,
    xml: () => xc("A3")?.xf?.alignment?.horizontal === "center" ? "읽힘 (center)" : null },
  { label: "③ 표시 형식 #,##0\"원\"", need: "numFmt formatCode (D4)",
    sj: () => { const z = sj("D4")?.z; return has(z) && /원/.test(String(z)) ? `읽힘 (${z})` : (has(z) ? `부분 (${z})` : null); },
    xml: () => { const nf = xc("D4")?.xf?.numFmt; return has(nf) && /원/.test(String(nf)) ? `읽힘 (${nf})` : (has(nf) ? `부분 (${nf})` : null); } },
  { label: "③ 날짜 형식 mm\"월\"dd\"일\"(aaa)", need: "numFmt formatCode (E4)",
    sj: () => { const z = sj("E4")?.z; return has(z) && /월|aaa/.test(String(z)) ? `읽힘 (${z})` : (has(z) ? `부분 (${z})` : null); },
    xml: () => { const nf = xc("E4")?.xf?.numFmt; return has(nf) && /월|aaa/.test(String(nf)) ? `읽힘 (${nf})` : (has(nf) ? `부분 (${nf})` : null); } },
  { label: "④ 세로 가운데", need: "alignment.vertical = center (B4)",
    sj: () => sj("B4")?.s?.alignment?.vertical === "center" ? "읽힘 (center)" : null,
    xml: () => xc("B4")?.xf?.alignment?.vertical === "center" ? "읽힘 (center)" : null },
  { label: "④ 이름 정의 '제품명'", need: "definedName name/ref",
    sj: () => { const n = sheetjs.definedNames?.find((x) => x.Name === "제품명"); return n ? `읽힘 (${n.Ref})` : null; },
    xml: () => { const n = xmlDefinedNames.find((x) => x.name === "제품명"); return n ? `읽힘 (${n.ref})` : null; } },
  { label: "④ 메모 '판매1위' 항상 표시", need: "comment text / visible",
    sj: () => { const c = sj("F4")?.c; return c && c.length ? `읽힘 (${c.map((x) => x.t).join("")})` : null; },
    xml: () => { const c = xmlComments.find((x) => x.ref === "F4"); return c ? `읽힘 (${c.text}${vml1 ? ", vml 있음(표시여부 vml)" : ""})` : null; } },
  { label: "⑤ 모든 테두리(thin 4방)", need: "border 4방 thin (A4)",
    sj: () => { const b = sj("A4")?.s?.border; return b && b.top && b.bottom && b.left && b.right ? "읽힘 (4방 존재)" : (b ? `부분 (${JSON.stringify(b)})` : null); },
    xml: () => { const b = xc("A4")?.xf?.border; const n = b ? ["top", "bottom", "left", "right"].filter((s) => b[s]?.style).length : 0; return n === 4 ? "읽힘 (4방 thin)" : (n ? `부분 (${n}방)` : null); } },
  { label: "⑤ 굵은 바깥쪽", need: "외곽 셀 border medium",
    sj: () => sjBorderMediumAnywhere() ? `읽힘 (${sjBorderMediumAnywhere()})` : null,
    xml: () => borderMediumAnywhere() ? `읽힘 (${borderMediumAnywhere()})` : null },
  { label: "⑤ 아래쪽 이중(A3:H3)", need: "border.bottom = double (A3)",
    sj: () => sj("A3")?.s?.border?.bottom?.style === "double" ? "읽힘 (double)" : (sj("A3")?.s?.border?.bottom ? `부분 (${sj("A3").s.border.bottom.style})` : null),
    xml: () => xc("A3")?.xf?.border?.bottom?.style === "double" ? "읽힘 (double)" : (xc("A3")?.xf?.border?.bottom?.style ? `부분 (${xc("A3").xf.border.bottom.style})` : null) },
  { label: "(대조) 병합하고 가운데 맞춤", need: "mergeCells + center",
    sj: () => { const m = sheetjs.merges?.length; const ctr = sj("A1")?.s?.alignment?.horizontal === "center"; return m ? `${ctr ? "읽힘" : "부분"} (merges=${m}, A1 center=${ctr})` : null; },
    xml: () => { const m = xmlMerges.length; const ctr = xc("A1")?.xf?.alignment?.horizontal === "center"; return m ? `${ctr ? "읽힘" : "부분"} (merges=${xmlMerges.join(",")}, A1 center=${ctr})` : null; } },
];

function recommend(sjRes, xmlRes) {
  const ok = (r) => r && r.startsWith("읽힘");
  if (ok(sjRes) && ok(xmlRes)) return "SheetJS cell.s (둘 다 가능, 간단한 쪽)";
  if (ok(sjRes)) return "SheetJS cell.s";
  if (ok(xmlRes)) return "JSZip XML (SheetJS 미식별)";
  if ((sjRes && sjRes.startsWith("부분")) || (xmlRes && xmlRes.startsWith("부분"))) return "JSZip XML 권장 (부분만 식별 — 원본 XML로 확인 필요)";
  return "미확인 (해당 서식 미적용/미식별 — 정답 파일로 재확인)";
}

const lines = [];
lines.push(`# 서식 왕복 덤프 — ${basename(inputPath)}`);
lines.push("");
lines.push(`- 대상 시트: **${SHEET}** · 범위 A1:H10`);
lines.push(`- 워크시트 XML 경로: \`${sheetPath}\``);
lines.push(`- comments1.xml: ${comments1 ? "있음" : "없음"} · vmlDrawing1.vml: ${vml1 ? "있음" : "없음"}`);
lines.push(`- SheetJS cellStyles 실험: withCellStyles s=${anyStyledCellHasS} / withoutCellStyles s=${anyNoStyleCellHasS} → ${sheetjs.cellStylesExperiment.note}`);
lines.push("");
lines.push("| 지시 항목 | 채점에 필요한 속성 | xlsx-js-style에서 | 원본 XML에서 | 권장 경로 |");
lines.push("|---|---|---|---|---|");
for (const row of ROWS) {
  const sjRes = row.sj() || NF;
  const xmlRes = row.xml() || NF;
  lines.push(`| ${row.label} | ${row.need} | ${sjRes} | ${xmlRes} | ${recommend(sjRes, xmlRes)} |`);
}
lines.push("");
lines.push("> 권장 경로는 스크립트가 두 경로 판독 결과로 자동 제안한 것이다(사람이 채우는 칸 아님).");
writeFileSync(`${outBase}.dump.md`, lines.join("\n"), "utf8");

console.log("덤프 완료:");
console.log(" -", `${outBase}.dump.json`);
console.log(" -", `${outBase}.dump.md`);
