// src/utils/xlsxStyles.js
//
// xlsx(zip) 내부 XML을 직접 읽어 "서식 관련 정보"를 정규화된 객체로 돌려주는 파서.
// 채점 로직은 없다(basic2Grader.js가 담당). 기본작업-3(조건부 서식) 등에서도 재사용한다.
//
// 왜 XML을 직접 읽나: xlsx-js-style의 read 경로는 글꼴·맞춤·테두리를 셀 스타일(s)로
// 내려주지 않는다(왕복 실험 확인, 실전모드_계획.md 채택한 결정 8). 그래서 서식 판정은
// styles.xml / sheetN.xml / workbook.xml / comments / vml 을 직접 파싱한다.
//
// XML 파싱은 속성 순서에 의존하지 않는다(정규식으로 태그를 자르되 속성은 키=값 맵으로 읽음).

import JSZip from "jszip";

// ─────────────────────────── 최소 XML 유틸 ───────────────────────────
function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}
// 여는 태그 문자열에서 속성을 순서 무관하게 추출
function parseAttrs(openTag) {
  const attrs = {};
  const re = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(openTag)) !== null) attrs[m[1]] = decodeXml(m[2]);
  return attrs;
}
// <tag ...>...</tag> 또는 <tag .../> 블록 목록. (같은 태그가 자기 안에 중첩되지 않는다는 가정 —
// SpreadsheetML의 styles.xml/sheet.xml 요소들에 성립한다.)
function getBlocks(xml, tag) {
  if (!xml) return [];
  const blocks = [];
  const open = `<${tag}`;
  let i = 0;
  while (true) {
    const start = xml.indexOf(open, i);
    if (start < 0) break;
    const after = xml[start + open.length];
    if (after && !/[\s/>]/.test(after)) { i = start + open.length; continue; } // <cellXfs> 가 <cellStyleXfs> 등과 혼동되지 않도록
    const gt = xml.indexOf(">", start);
    if (gt < 0) break;
    const openTag = xml.slice(start, gt + 1);
    if (openTag.endsWith("/>")) { blocks.push({ attrs: parseAttrs(openTag), inner: "" }); i = gt + 1; }
    else {
      const close = `</${tag}>`;
      const ci = xml.indexOf(close, gt + 1);
      if (ci < 0) { blocks.push({ attrs: parseAttrs(openTag), inner: "" }); i = gt + 1; }
      else { blocks.push({ attrs: parseAttrs(openTag), inner: xml.slice(gt + 1, ci) }); i = ci + close.length; }
    }
  }
  return blocks;
}
const firstRegion = (xml, tag) => { const b = getBlocks(xml, tag); return b.length ? b[0].inner : ""; };
const textInner = (xml, tag) => { const b = getBlocks(xml, tag)[0]; return b ? decodeXml(b.inner) : null; };

// ─────────────────────────── 주소 유틸 ───────────────────────────
export function colToIdx(letters) { let n = 0; for (const ch of String(letters).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; }
export function idxToCol(i) { let n = i + 1, s = ""; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }
export function parseRef(ref) { const m = /^\$?([A-Za-z]+)\$?(\d+)$/.exec(String(ref).trim()); return m ? { col: colToIdx(m[1]), row: +m[2] } : null; }
export function expandRange(range) {
  const parts = String(range).split(":");
  const a = parseRef(parts[0]); const b = parts[1] ? parseRef(parts[1]) : a;
  if (!a || !b) return [];
  const out = [];
  for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++)
    for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) out.push(idxToCol(c) + r);
  return out;
}

// ─────────────────────────── ECMA-376 내장 표시 형식(0~49) ───────────────────────────
// locale 의존 항목은 en-US 기본값. (컴활 문제의 사용자 지정 형식은 id>=164 이므로 채점에는 거의 안 쓰이나 보존.)
export const BUILTIN_NUMFMT = {
  0: "General", 1: "0", 2: "0.00", 3: "#,##0", 4: "#,##0.00",
  9: "0%", 10: "0.00%", 11: "0.00E+00", 12: "# ?/?", 13: "# ??/??",
  14: "mm-dd-yy", 15: "d-mmm-yy", 16: "d-mmm", 17: "mmm-yy", 18: "h:mm AM/PM",
  19: "h:mm:ss AM/PM", 20: "h:mm", 21: "h:mm:ss", 22: "m/d/yy h:mm",
  37: "#,##0 ;(#,##0)", 38: "#,##0 ;[Red](#,##0)", 39: "#,##0.00;(#,##0.00)",
  40: "#,##0.00;[Red](#,##0.00)", 45: "mm:ss", 46: "[h]:mm:ss", 47: "mmss.0",
  48: "##0.0E+0", 49: "@",
};

// ─────────────────────────── styles.xml 파싱 ───────────────────────────
function parseFont(inner) {
  const nameB = getBlocks(inner, "name")[0] || getBlocks(inner, "rFont")[0];
  const uB = getBlocks(inner, "u")[0];
  const colorB = getBlocks(inner, "color")[0];
  return {
    name: nameB ? nameB.attrs.val ?? null : null,
    size: getBlocks(inner, "sz")[0] ? Number(getBlocks(inner, "sz")[0].attrs.val) : null,
    bold: /<b\b/.test(inner),
    italic: /<i\b/.test(inner),
    underline: uB ? (uB.attrs.val || "single") : null, // 없으면 null, <u/> 는 single, val="double"
    color: colorB ? colorB.attrs : null,
  };
}
function parseFill(inner) {
  const pf = getBlocks(inner, "patternFill")[0];
  if (!pf) return { patternType: null, fgColor: null };
  const fg = getBlocks(pf.inner, "fgColor")[0];
  return {
    patternType: pf.attrs.patternType ?? null,
    fgColor: fg ? { rgb: fg.attrs.rgb ?? null, theme: fg.attrs.theme != null ? Number(fg.attrs.theme) : null, tint: fg.attrs.tint != null ? Number(fg.attrs.tint) : null, indexed: fg.attrs.indexed ?? null } : null,
  };
}
function parseBorder(inner, attrs = {}) {
  const side = (s) => { const b = getBlocks(inner, s)[0]; if (!b) return null; if (!b.attrs.style) return null; const c = getBlocks(b.inner, "color")[0]; return { style: b.attrs.style, color: c ? c.attrs : null }; };
  const diag = side("diagonal");
  return {
    top: side("top"), bottom: side("bottom"), left: side("left"), right: side("right"),
    // <border diagonalUp diagonalDown> 속성은 border 요소에 있고, 선 스타일은 <diagonal> 자식에 있다.
    diagonal: diag ? { ...diag, up: attrs.diagonalUp === "1", down: attrs.diagonalDown === "1" } : null,
  };
}
function parseXf(b) {
  return {
    numFmtId: b.attrs.numFmtId != null ? Number(b.attrs.numFmtId) : 0,
    fontId: b.attrs.fontId != null ? Number(b.attrs.fontId) : 0,
    fillId: b.attrs.fillId != null ? Number(b.attrs.fillId) : 0,
    borderId: b.attrs.borderId != null ? Number(b.attrs.borderId) : 0,
    xfId: b.attrs.xfId != null ? Number(b.attrs.xfId) : null,
    applyFont: b.attrs.applyFont ?? null,
    applyAlignment: b.attrs.applyAlignment ?? null,
    applyNumberFormat: b.attrs.applyNumberFormat ?? null,
    applyBorder: b.attrs.applyBorder ?? null,
    alignment: getBlocks(b.inner, "alignment")[0]?.attrs ?? null,
  };
}
function parseStyles(xml) {
  if (!xml) return { numFmts: {}, fonts: [], fills: [], borders: [], cellXfs: [], cellStyleXfs: [], cellStyles: [] };
  const numFmts = {};
  for (const b of getBlocks(xml, "numFmt")) numFmts[Number(b.attrs.numFmtId)] = b.attrs.formatCode;
  const fonts = getBlocks(firstRegion(xml, "fonts"), "font").map((b) => parseFont(b.inner));
  const fills = getBlocks(firstRegion(xml, "fills"), "fill").map((b) => parseFill(b.inner));
  const borders = getBlocks(firstRegion(xml, "borders"), "border").map((b) => parseBorder(b.inner, b.attrs));
  const cellXfs = getBlocks(firstRegion(xml, "cellXfs"), "xf").map(parseXf);
  const cellStyleXfs = getBlocks(firstRegion(xml, "cellStyleXfs"), "xf").map(parseXf);
  const cellStyles = getBlocks(firstRegion(xml, "cellStyles"), "cellStyle").map((b) => ({
    name: b.attrs.name ?? null,
    xfId: b.attrs.xfId != null ? Number(b.attrs.xfId) : null,
    builtinId: b.attrs.builtinId != null ? Number(b.attrs.builtinId) : null,
  }));
  return { numFmts, fonts, fills, borders, cellXfs, cellStyleXfs, cellStyles };
}

// ─────────────────────────── sharedStrings.xml 파싱 ───────────────────────────
function parseSharedStrings(xml) {
  if (!xml) return [];
  return getBlocks(xml, "si").map((si) => {
    // <si><t>..</t></si> 또는 <si><r><t>..</t></r>...</si> (여러 run 이어붙임)
    const runs = getBlocks(si.inner, "t");
    return runs.map((t) => decodeXml(t.inner)).join("");
  });
}

// ─────────────────────────── 워크시트 파싱 ───────────────────────────
function resolveCellValue(cAttrs, inner, ss) {
  const vRaw = getBlocks(inner, "v")[0]?.inner;
  const t = cAttrs.t ?? null;
  if (t === "s") return vRaw != null ? (ss[Number(vRaw)] ?? null) : null;
  if (t === "inlineStr") { const is = getBlocks(inner, "is")[0]; return is ? getBlocks(is.inner, "t").map((x) => decodeXml(x.inner)).join("") : null; }
  if (t === "str") return vRaw != null ? decodeXml(vRaw) : null;
  if (t === "b") return vRaw === "1";
  if (vRaw == null) return undefined;
  const n = Number(vRaw);
  return isNaN(n) ? decodeXml(vRaw) : n;
}
function resolveCellStyle(sIdx, styles) {
  const xf = styles.cellXfs[sIdx];
  if (!xf) return null;
  const font = styles.fonts[xf.fontId] ?? null;
  const fill = styles.fills[xf.fillId] ?? null;
  const border = styles.borders[xf.borderId] ?? null;
  const code = styles.numFmts[xf.numFmtId] != null ? decodeXml(styles.numFmts[xf.numFmtId]) : (BUILTIN_NUMFMT[xf.numFmtId] ?? null);
  let cellStyle = null;
  if (xf.xfId != null) { const cs = styles.cellStyles.find((c) => c.xfId === xf.xfId); if (cs) cellStyle = { name: cs.name, builtinId: cs.builtinId }; }
  return {
    font,
    alignment: xf.alignment ? {
      horizontal: xf.alignment.horizontal ?? null, vertical: xf.alignment.vertical ?? null,
      wrapText: xf.alignment.wrapText === "1" ? true : (xf.alignment.wrapText === "0" ? false : null),
      indent: xf.alignment.indent != null ? Number(xf.alignment.indent) : null,
    } : null,
    fill,
    border,
    numFmt: { id: xf.numFmtId, code },
    cellStyle,
  };
}
function parseSheet(xml, ss, styles) {
  const sd = firstRegion(xml, "sheetData") || xml;
  const cells = {};
  for (const c of getBlocks(sd, "c")) {
    const addr = c.attrs.r;
    if (!addr) continue;
    const sIdx = c.attrs.s != null ? Number(c.attrs.s) : 0;
    const style = resolveCellStyle(sIdx, styles) || {};
    const value = resolveCellValue(c.attrs, c.inner, ss);
    const fB = getBlocks(c.inner, "f")[0];
    cells[addr] = {
      value,
      formula: fB ? (fB.inner ? decodeXml(fB.inner) : null) : null,
      type: c.attrs.t ?? "n",
      s: sIdx,
      font: style.font ?? null,
      alignment: style.alignment ?? null,
      fill: style.fill ?? null,
      border: style.border ?? null,
      numFmt: style.numFmt ?? null,
      cellStyle: style.cellStyle ?? null,
    };
  }
  const rows = {};
  for (const r of getBlocks(xml, "row")) {
    if (r.attrs.r == null) continue;
    rows[r.attrs.r] = { height: r.attrs.ht != null ? Number(r.attrs.ht) : null, customHeight: r.attrs.customHeight === "1" };
  }
  const cols = getBlocks(firstRegion(xml, "cols"), "col").map((b) => ({
    min: b.attrs.min != null ? Number(b.attrs.min) : null, max: b.attrs.max != null ? Number(b.attrs.max) : null,
    width: b.attrs.width != null ? Number(b.attrs.width) : null, customWidth: b.attrs.customWidth === "1",
  }));
  const merges = getBlocks(firstRegion(xml, "mergeCells"), "mergeCell").map((b) => b.attrs.ref).filter(Boolean);
  return { cells, rows, cols, merges };
}

// ─────────────────────────── 메모(comments + vml) 파싱 ───────────────────────────
function parseComments(xml) {
  if (!xml) return {};
  const authors = getBlocks(firstRegion(xml, "authors"), "author").map((a) => decodeXml(a.inner));
  const out = {};
  for (const c of getBlocks(firstRegion(xml, "commentList"), "comment")) {
    const ref = c.attrs.ref;
    if (!ref) continue;
    const textNode = getBlocks(c.inner, "text")[0];
    const text = textNode ? getBlocks(textNode.inner, "t").map((t) => decodeXml(t.inner)).join("") : "";
    out[ref] = { text, author: authors[Number(c.attrs.authorId ?? 0)] ?? null };
  }
  return out;
}
// vmlDrawing: 셀별 표시 여부(<x:Visible/> 존재)와 자동 크기(mso-fit-shape-to-text:t)
function parseVml(xml) {
  if (!xml) return {};
  const out = {};
  for (const shape of getBlocks(xml, "v:shape")) {
    const cd = getBlocks(shape.inner, "x:ClientData")[0];
    if (!cd || cd.attrs.ObjectType !== "Note") continue;
    const rowT = textInner(cd.inner, "x:Row");
    const colT = textInner(cd.inner, "x:Column");
    if (rowT == null || colT == null) continue;
    const addr = idxToCol(Number(colT)) + (Number(rowT) + 1);
    const visible = /<x:Visible\s*\/?>/.test(cd.inner);
    const autoSize = /mso-fit-shape-to-text\s*:\s*t/i.test(shape.inner);
    out[addr] = { visible, autoSize };
  }
  return out;
}

// ─────────────────────────── 공개 API ───────────────────────────
export async function parseWorkbookStyles(input) {
  const zip = await JSZip.loadAsync(input);
  const read = async (p) => { const f = zip.file(p); return f ? await f.async("string") : null; };

  const workbookXml = await read("xl/workbook.xml");
  const wbRelsXml = await read("xl/_rels/workbook.xml.rels");
  const stylesXml = await read("xl/styles.xml");
  const ssXml = await read("xl/sharedStrings.xml");

  const styles = parseStyles(stylesXml);
  const ss = parseSharedStrings(ssXml);

  // workbook.xml.rels: rId → Target
  const relMap = {};
  for (const rel of getBlocks(wbRelsXml, "Relationship")) relMap[rel.attrs.Id] = rel.attrs.Target;

  const sheets = {};
  for (const s of getBlocks(workbookXml, "sheet")) {
    const name = s.attrs.name;
    const rid = s.attrs["r:id"] || s.attrs["id"];
    let target = relMap[rid];
    if (!target) continue;
    const sheetPath = "xl/" + target.replace(/^\/?xl\//, "").replace(/^\//, "");
    const sheetXml = await read(sheetPath);
    if (sheetXml == null) continue;
    const parsed = parseSheet(sheetXml, ss, styles);

    // 워크시트 rels → comments / vmlDrawing 경로
    const base = sheetPath.replace(/^xl\/worksheets\//, "").replace(/\.xml$/, "");
    const sheetRelsXml = await read(`xl/worksheets/_rels/${base}.xml.rels`);
    let commentsPath = null, vmlPath = null;
    for (const rel of getBlocks(sheetRelsXml, "Relationship")) {
      const t = rel.attrs.Target || "";
      if (/comments\d*\.xml$/i.test(t)) commentsPath = "xl/" + t.replace(/^\.\.\//, "").replace(/^\/?xl\//, "");
      if (/vmlDrawing\d*\.vml$/i.test(t)) vmlPath = "xl/" + t.replace(/^\.\.\//, "").replace(/^\/?xl\//, "");
    }
    const commentsXml = commentsPath ? await read(commentsPath) : null;
    const vmlXml = vmlPath ? await read(vmlPath) : null;
    const commentMap = parseComments(commentsXml);
    const vmlMap = parseVml(vmlXml);
    const comments = {};
    for (const ref of new Set([...Object.keys(commentMap), ...Object.keys(vmlMap)])) {
      comments[ref] = {
        text: commentMap[ref]?.text ?? null,
        author: commentMap[ref]?.author ?? null,
        visible: vmlMap[ref]?.visible ?? false,
        autoSize: vmlMap[ref]?.autoSize ?? false,
      };
    }

    sheets[name] = { cells: parsed.cells, rows: parsed.rows, cols: parsed.cols, merges: parsed.merges, comments };
  }

  const definedNames = getBlocks(workbookXml, "definedName").map((b) => ({
    name: b.attrs.name ?? null,
    ref: decodeXml(b.inner),
    localSheetId: b.attrs.localSheetId != null ? Number(b.attrs.localSheetId) : null,
  }));

  return {
    sheets,
    definedNames,
    cellStyles: styles.cellStyles,
    fonts: styles.fonts,
    fills: styles.fills,
    borders: styles.borders,
    numFmts: styles.numFmts,
  };
}
