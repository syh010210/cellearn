// 기본작업-2 자리(①~⑤)별 지시문 변형. 각 pick(rng, ctx) → { text, checks, meta, usedCols? }.
// 지시문 문장과 checks 는 같은 슬롯 값에서 동시에 만든다(따로 쓰지 않는다).

import { CELL_STYLE_BUILTIN } from "../../../utils/basic2Grader.js";
import { NUMFMT_CATALOG, renderBase } from "./numFmtCatalog.js";
import { josa, euroRo } from "./josa.js";

const TITLE_FONTS = ["HY헤드라인M", "HY견고딕", "HY견명조", "HY중고딕", "궁서", "궁서체", "돋움체", "굴림체", "바탕체", "휴먼옛체"];
const UNDERLINE_LABEL = { single: "실선", double: "이중 실선", singleAccounting: "실선(회계용)", doubleAccounting: "이중 실선(회계용)" };
const MEMO_POOL = ["판매1위", "재고확인", "확인요망", "우수회원", "예약확정", "신규입고", "담당자확인", "최다판매", "품절임박", "추가주문"];
// 강조색 1~6 + 20/40/60% (builtinId 29~52)
const ACCENT_STYLES = Object.keys(CELL_STYLE_BUILTIN).map(Number).filter((id) => id >= 29 && id <= 52).map((id) => ({ builtinId: id, name: CELL_STYLE_BUILTIN[id] }));

// ── ① 제목 ──
export function pickTitle(rng, ctx) {
  const range = `A1:${ctx.last}1`;
  const pieces = []; const checks = [];
  const align = rng.weighted([["cc", 7], ["merge", 4]]);
  if (align === "cc") { checks.push({ kind: "alignment", range, horizontal: "centerContinuous" }); pieces.push({ label: "'선택 영역의 가운데로'", val: "선택 영역의 가운데로" }); }
  else { checks.push({ kind: "alignment", range, horizontal: "center", merge: true }); pieces.push({ label: "'병합하고 가운데 맞춤'", val: "병합하고 가운데 맞춤" }); }

  const chosen = rng.sample(["font", "size", "style", "underline"], rng.int(2) + 2); // 2~3개, 원래 순서 유지
  const fontCheck = { kind: "font", range: "A1" };
  for (const slot of ["font", "size", "style", "underline"]) {
    if (!chosen.includes(slot)) continue;
    if (slot === "font") { const name = rng.pick(TITLE_FONTS); fontCheck.name = name; pieces.push({ label: `글꼴 '${name}'`, val: name }); }
    else if (slot === "size") { const sz = rng.pick([14, 16, 18, 20]); fontCheck.size = sz; pieces.push({ label: `크기 '${sz}'`, val: String(sz) }); }
    else if (slot === "style") { const st = rng.pick(["bold", "italic", "boldItalic"]); if (st === "bold") { fontCheck.bold = true; pieces.push({ label: "글꼴 스타일 '굵게'", val: "굵게" }); } else if (st === "italic") { fontCheck.italic = true; pieces.push({ label: "글꼴 스타일 '기울임꼴'", val: "기울임꼴" }); } else { fontCheck.bold = true; fontCheck.italic = true; pieces.push({ label: "글꼴 스타일 '굵은 기울임꼴'", val: "굵은 기울임꼴" }); } }
    else if (slot === "underline") { const u = rng.pick(["single", "double", "singleAccounting", "doubleAccounting"]); fontCheck.underline = u; pieces.push({ label: `밑줄 '${UNDERLINE_LABEL[u]}'`, val: UNDERLINE_LABEL[u] }); }
  }
  checks.push(fontCheck);
  if (rng.chance(0.6)) { checks.push({ kind: "rowHeight", row: 1, height: 30 }); pieces.push({ label: "행 높이 '30'", val: "30" }); }

  const last = pieces[pieces.length - 1];
  const text = `[${range}] 영역은 ${pieces.map((p) => p.label).join(", ")}${euroRo(last.val)} 지정하시오.`;
  return { text, checks, meta: { align, slotCount: pieces.length } };
}

// ── ② 머리글 ──
export function pickHeader(rng, ctx) {
  const range = `A3:${ctx.last}3`;
  const groups = ctx.groups.filter((g) => g.endRow > g.startRow);
  const mode = rng.weighted([["cellStyle", 6], ...(groups.length ? [["merge", 3]] : []), ["alignOnly", 1]]);

  if (mode === "cellStyle") {
    const st = rng.pick(ACCENT_STYLES);
    const checks = [{ kind: "cellStyle", range, builtinId: st.builtinId, name: st.name }];
    let text = `[${range}] 영역은 셀 스타일 '${st.name}'${josa(st.name, "을/를")} 지정하시오.`;
    if (rng.chance(0.5)) { checks.push({ kind: "alignment", range, horizontal: "center" }); text = `[${range}] 영역은 셀 스타일 '${st.name}'${josa(st.name, "을/를")} 지정하고 가로 '가운데 맞춤'을 지정하시오.`; }
    return { text, checks, meta: { mode: "cellStyle", style: st.name } };
  }
  if (mode === "merge") {
    const checks = []; const ranges = [];
    for (const g of groups) { const r = `${g.colLetter}${g.startRow}:${g.colLetter}${g.endRow}`; ranges.push(r); checks.push({ kind: "merge", range: r }); checks.push({ kind: "alignment", range: r, horizontal: "center", merge: true }); }
    const text = `[${ranges.join("], [")}] 영역은 '병합하고 가운데 맞춤'을 지정하시오.`;
    return { text, checks, meta: { mode: "merge", groups: groups.length }, usedCols: [ctx.groupableKey] };
  }
  // alignOnly — 가로 '가운데 맞춤'만 (세로 가운데는 생성기 기본)
  return { text: `[${range}] 영역은 가로 '가운데 맞춤'을 지정하시오.`, checks: [{ kind: "alignment", range, horizontal: "center" }], meta: { mode: "alignOnly" } };
}

// ── ③ 표시 형식 ──
export function pickNumFmt(rng, ctx) {
  const hasDate = ctx.columns.some((c) => c.type === "date");
  const numItems = NUMFMT_CATALOG.filter((it) => it.kind === "number").filter((it) => matchCols(ctx, it).length);
  const item = rng.pick(numItems);
  const col = rng.pick(matchCols(ctx, item));
  const range = `${col.letter}4:${col.letter}${ctx.dataEnd}`;
  // 절삭 항목은 나누어떨어지는 값을 표시 예로 우선 선택(없으면 첫 값).
  let sampleVal = ctx.rows[0][col.idx];
  if (item.preferDivisor) { const cand = ctx.rows.map((r) => r[col.idx]).find((v) => v % item.preferDivisor === 0); if (cand !== undefined) sampleVal = cand; }
  const ex = [`${fmtNum(sampleVal)} → ${item.render(sampleVal)}`];
  if (item.zeroExample && ctx.rows.some((r) => r[col.idx] === 0)) ex.push(`0 → ${item.render(0)}`);
  const numText = `[${range}] 영역은 사용자 지정 표시 형식을 이용하여 ${item.phrase} [표시 예 : ${ex.join(", ")}]`;
  const checks = [{ kind: "numFmt", range, codes: [item.code], samples: [] }];
  const usedCols = [col.key];

  if (hasDate && rng.chance(0.4)) {
    const dcol = ctx.columns.find((c) => c.type === "date");
    const dbase = dcol.baseFormat || "yyyy-mm-dd";
    const dLetter = dcol.letter; const dRange = `${dLetter}4:${dLetter}${ctx.dataEnd}`;
    const dItems = NUMFMT_CATALOG.filter((c) => c.kind === "date" || (c.kind === "builtinDate" && dbase !== "yyyy-mm-dd"));
    const dItem = rng.pick(dItems);
    const iso = ctx.rows[0][dcol.idx];
    let dText, dCheck;
    if (dItem.kind === "builtinDate") { dText = `[${dRange}] 영역은 ${dItem.phrase}`; dCheck = { kind: "numFmt", range: dRange, codes: dItem.codes, samples: [] }; }
    else { dText = `[${dRange}] 영역은 사용자 지정 표시 형식을 이용하여 날짜를 [표시 예 : ${renderBase(iso, dbase)} → ${dItem.render(iso)}]과 같이 표시하시오.`; dCheck = { kind: "numFmt", range: dRange, codes: [dItem.code], samples: [] }; }
    checks.push(dCheck); usedCols.push(dcol.key);
    return { text: `${numText}\n${dText}`, checks, meta: { numItem: item.id, dateItem: dItem.id }, usedCols };
  }
  return { text: numText, checks, meta: { numItem: item.id, dateItem: null }, usedCols };
}
function matchCols(ctx, item) {
  return ctx.columns.filter((c) => item.target.includes(c.type) && !ctx.used.has(c.key) && (!item.requires7digit || ctx.rows.some((r) => r[c.idx] >= 1000000)));
}
const fmtNum = (v) => (typeof v === "number" ? v : v);

// ── ④ 맞춤·이름·메모·쉼표 ──
// 맞춤 라벨(조사 없이) + 정렬 check. 묶음 문장에서 조사는 josa 로 붙인다.
function alignParts(rng, range) {
  const sub = rng.weighted([["h", 6], ["dist", 1], ["indent", 1]]); // 세로 가운데는 생성기 기본이라 지시하지 않음
  if (sub === "h") return { sub, label: "가로 '가운데 맞춤'", check: { kind: "alignment", range, horizontal: "center" } };
  if (sub === "dist") return { sub, label: "'균등 분할 (들여쓰기)'", check: { kind: "alignment", range, horizontal: "distributed", indent: 1 } };
  const ind = rng.pick([1, 2]); return { sub, label: `들여쓰기 '${ind}'`, check: { kind: "alignment", range, indent: ind } };
}

export function pickMisc(rng, ctx) {
  const sentences = []; const checks = []; const usedCols = []; const meta = { name: false, memo: false, comma: false };
  const nameableFree = ctx.columns.filter((c) => c.nameable && !ctx.used.has(c.key));
  const moneyFree = ctx.columns.filter((c) => c.type === "money" && !ctx.used.has(c.key));
  const textFree = ctx.textCols().filter((c) => !ctx.used.has(c.key) && !c.groupable);

  // 두 개 묶음(맞춤 + 이름/메모/쉼표 중 하나) 70%, 단독 30%.
  const cand = ["memo"];
  if (nameableFree.length) cand.push("name");
  if (moneyFree.length) cand.push("comma");
  const extra = rng.chance(0.7) ? rng.pick(cand) : null;

  // 맞춤 대상 열: 이름=nameable 열, 쉼표=money 열, 그 외=text 열
  let acol;
  if (extra === "name") acol = rng.pick(nameableFree);
  else if (extra === "comma") acol = rng.pick(moneyFree);
  else acol = textFree.length ? rng.pick(textFree) : rng.pick(ctx.dataCols().filter((c) => !ctx.used.has(c.key)));
  usedCols.push(acol.key);
  const aRange = `${acol.letter}4:${acol.letter}${ctx.dataEnd}`;
  const ap = alignParts(rng, aRange); checks.push(ap.check); meta.align = ap.sub;
  const P = josa(ap.label, "을/를");

  if (extra === "name") {
    meta.name = true;
    const others = nameableFree.filter((c) => c.key !== acol.key);
    if (others.length && rng.chance(0.3)) { // 떨어진 두 범위를 한 이름으로 (맞춤·이름 각 문장)
      const n2 = rng.pick(others); usedCols.push(n2.key);
      checks.push({ kind: "definedName", name: acol.key, ref: `$${acol.letter}$4:$${acol.letter}$${ctx.dataEnd},$${n2.letter}$4:$${n2.letter}$${ctx.dataEnd}` });
      sentences.push(`[${aRange}] 영역은 ${ap.label}${P} 지정하시오.`);
      sentences.push(`[${aRange}], [${n2.letter}4:${n2.letter}${ctx.dataEnd}] 영역은 '${acol.key}'${euroRo(acol.key)} 이름을 정의하시오.`);
    } else { // 맞춤 + 이름 한 문장(같은 열)
      checks.push({ kind: "definedName", name: acol.key, ref: `$${acol.letter}$4:$${acol.letter}$${ctx.dataEnd}` });
      sentences.push(`[${aRange}] 영역은 ${ap.label}${P} 지정하고 '${acol.key}'${euroRo(acol.key)} 이름을 정의하시오.`);
    }
  } else if (extra === "comma") { // 맞춤 + 쉼표 한 문장(같은 money 열)
    meta.comma = true;
    checks.push({ kind: "cellStyle", range: aRange, builtinId: 3 });
    sentences.push(`[${aRange}] 영역은 ${ap.label}${josa(ap.label, "과/와")} '쉼표 스타일'을 지정하시오.`);
  } else if (extra === "memo") { // 맞춤 + 메모(두 문장)
    meta.memo = true;
    const mcol = rng.pick(ctx.dataCols()); const cell = `${mcol.letter}${4 + rng.int(ctx.rowCount)}`; const memo = rng.pick(MEMO_POOL);
    checks.push({ kind: "comment", cell, text: memo, visible: true, autoSize: true });
    sentences.push(`[${aRange}] 영역은 ${ap.label}${P} 지정하시오.`);
    sentences.push(`[${cell}] 셀에 '${memo}'${josa(memo, "이라는/라는")} 메모를 삽입한 후 '자동 크기'로 지정하고 항상 표시되도록 하시오.`);
  } else {
    sentences.push(`[${aRange}] 영역은 ${ap.label}${P} 지정하시오.`);
  }
  return { text: sentences.join(" "), checks, meta: { ...meta, bundle: extra ? 2 : 1 }, usedCols };
}

// ── ⑤ 테두리 ──
export function pickBorder(rng, ctx) {
  const range = `A3:${ctx.last}${ctx.dataEnd}`;
  const headerRange = `A3:${ctx.last}3`;
  const mode = rng.weighted([["headerDouble", 5], ["outer", 5], ["all3", 2]]);
  if (mode === "headerDouble") {
    return { text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용하고, [${headerRange}] 영역은 '아래쪽 이중 테두리(⊟)'를 적용하여 표시하시오.`, checks: [{ kind: "border", range, inner: "thin", edges: [{ range: headerRange, side: "bottom", style: "double" }] }], meta: { mode } };
  }
  if (mode === "outer") {
    return { text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용한 후 '굵은 바깥쪽 테두리(⊡)'를 적용하여 표시하시오.`, checks: [{ kind: "border", range, inner: "thin", outer: "medium" }], meta: { mode } };
  }
  return { text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용한 후 '굵은 바깥쪽 테두리(⊡)'를 적용하고, [${headerRange}] 영역은 '아래쪽 이중 테두리(⊟)'를 적용하여 표시하시오.`, checks: [{ kind: "border", range, inner: "thin", outer: "medium", edges: [{ range: headerRange, side: "bottom", style: "double" }] }], meta: { mode } };
}
