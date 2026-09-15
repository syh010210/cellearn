// 기본작업-2 자리(①~⑤)별 지시문 변형. 각 pick(rng, ctx, tier) → { text, checks, meta, usedCols? }.
// tier: "basic" | "hard". hard 는 반드시 hard 전용 요소를 1개 이상 쓴다(meta.hardUsed=true).
// 지시문 문장과 checks 는 같은 슬롯 값에서 동시에 만든다(따로 쓰지 않는다).

import { CELL_STYLE_BUILTIN } from "../../../utils/basic2Grader.js";
import { buildNumberSpec, buildDateSpec, renderBase, availableNumFmtUnits, specFromNumberFamily, specFromDateFamily } from "./numFmtCatalog.js";
import { STANDARD_COLORS, colorLabel } from "./colors.js";
import { idxToCol } from "../../../utils/xlsxStyles.js";
import { josa, euroRo } from "./josa.js";

const SYMBOLS = ["♠", "♣", "◆", "●", "★", "◎"];
// 제목 tail 에 등장하는 한자 변환 가능 단어
const HANJA = { "현황": "現況", "관리": "管理", "판매": "販賣", "실적": "實績", "등급": "等級", "예약": "豫約", "급여": "給與", "수강": "受講" };

const TITLE_FONTS = ["HY헤드라인M", "HY견고딕", "HY견명조", "HY중고딕", "궁서", "궁서체", "돋움체", "굴림체", "바탕체", "휴먼옛체"];
const UNDERLINE_LABEL = { single: "실선", double: "이중 실선", singleAccounting: "실선(회계용)", doubleAccounting: "이중 실선(회계용)" };
const MEMO_POOL = ["판매1위", "재고확인", "확인요망", "우수회원", "예약확정", "신규입고", "담당자확인", "최다판매", "품절임박", "추가주문"];
// 강조색: 기본=100%(강조색 1~6), 어려움=20/40/60% 변형
const ACCENT_BASIC = [29, 33, 37, 41, 45, 49].map((id) => ({ builtinId: id, name: CELL_STYLE_BUILTIN[id] }));
const ACCENT_HARD = Object.keys(CELL_STYLE_BUILTIN).map(Number).filter((id) => id >= 30 && id <= 52 && ![33, 37, 41, 45, 49].includes(id)).map((id) => ({ builtinId: id, name: CELL_STYLE_BUILTIN[id] }));

// ── ① 제목 ──
export function pickTitle(rng, ctx, tier = "basic") {
  const hard = tier === "hard";
  const range = `A1:${ctx.last}1`;
  const pieces = []; const checks = [];
  const align = rng.weighted([["cc", 7], ["merge", 4]]);
  if (align === "cc") { checks.push({ kind: "alignment", range, horizontal: "centerContinuous" }); pieces.push({ label: "'선택 영역의 가운데로'", val: "선택 영역의 가운데로" }); }
  else { checks.push({ kind: "alignment", range, horizontal: "center", merge: true }); pieces.push({ label: "'병합하고 가운데 맞춤'", val: "병합하고 가운데 맞춤" }); }

  // 어려움 전용 요소 택1: 굵은 기울임꼴 · 회계용 밑줄 · 슬롯 4개 · 특수문자 · 한자
  const hanjaWords = Object.keys(HANJA).filter((w) => ctx.title.includes(w));
  let hardFeat = null, deco = "none";
  if (hard) {
    hardFeat = rng.pick(["boldItalic", "acct", "slot4", "special", ...(hanjaWords.length ? ["hanja"] : [])]);
    if (hardFeat === "special") deco = "special"; else if (hardFeat === "hanja") deco = "hanja";
  }

  const slotN = hard && hardFeat === "slot4" ? 4 : 2 + rng.int(2);
  let chosen = rng.sample(["font", "size", "style", "underline"], slotN);
  const ensure = (slot) => { if (chosen.includes(slot)) return; if (chosen.length < 4) chosen = [...chosen, slot]; else { const i = chosen.findIndex((s) => s !== slot); const c = [...chosen]; c[i] = slot; chosen = c; } };
  if (hard && hardFeat === "boldItalic") ensure("style");
  if (hard && hardFeat === "acct") ensure("underline");

  const fontCheck = { kind: "font", range: "A1" };
  for (const slot of ["font", "size", "style", "underline"]) {
    if (!chosen.includes(slot)) continue;
    if (slot === "font") { const name = rng.pick(TITLE_FONTS); fontCheck.name = name; pieces.push({ label: `글꼴 '${name}'`, val: name }); }
    else if (slot === "size") { const sz = rng.pick([14, 16, 18, 20]); fontCheck.size = sz; pieces.push({ label: `크기 '${sz}'`, val: String(sz) }); }
    else if (slot === "style") {
      const st = hard && hardFeat === "boldItalic" ? "boldItalic" : rng.pick(["bold", "italic"]); // 굵은 기울임꼴은 어려움 전용
      if (st === "bold") { fontCheck.bold = true; pieces.push({ label: "글꼴 스타일 '굵게'", val: "굵게" }); }
      else if (st === "italic") { fontCheck.italic = true; pieces.push({ label: "글꼴 스타일 '기울임꼴'", val: "기울임꼴" }); }
      else { fontCheck.bold = true; fontCheck.italic = true; pieces.push({ label: "글꼴 스타일 '굵은 기울임꼴'", val: "굵은 기울임꼴" }); }
    }
    else if (slot === "underline") {
      const u = hard && hardFeat === "acct" ? rng.pick(["singleAccounting", "doubleAccounting"]) : rng.pick(["single", "double"]); // 회계용은 어려움 전용
      fontCheck.underline = u; pieces.push({ label: `밑줄 '${UNDERLINE_LABEL[u]}'`, val: UNDERLINE_LABEL[u] });
    }
  }
  checks.push(fontCheck);
  const slotCount = chosen.length;
  if (rng.chance(0.6)) { checks.push({ kind: "rowHeight", row: 1, height: 30 }); pieces.push({ label: "행 높이 '30'", val: "30" }); }

  const last = pieces[pieces.length - 1];
  let text = `[${range}] 영역은 ${pieces.map((p) => p.label).join(", ")}${euroRo(last.val)} 지정하시오.`;
  if (deco === "special") {
    const sym = rng.pick(SYMBOLS);
    checks.push({ kind: "value", cell: "A1", equals: `${sym} ${ctx.title} ${sym}`, normalize: "spaces", label: "특수문자" });
    text += ` [A1] 셀의 제목 앞뒤에 특수문자 '${sym}'를 삽입하시오.`;
  } else if (deco === "hanja") {
    const w = rng.pick(hanjaWords); const h = HANJA[w];
    checks.push({ kind: "value", cell: "A1", equals: ctx.title.replace(w, h), normalize: "spaces", label: "한자변환" });
    text += ` [A1] 셀의 '${w}'${josa(w, "을/를")} 한자 '${h}'${euroRo(w)} 변환하시오.`;
  }
  return { text, checks, meta: { tier, align, slotCount, hardFeat, special: deco === "special", hanja: deco === "hanja", hardUsed: hard } };
}

// ── ② 머리글 ──
export function pickHeader(rng, ctx, tier = "basic") {
  const hard = tier === "hard";
  const range = `A3:${ctx.last}3`;
  const groups = ctx.groups.filter((g) => g.endRow > g.startRow);

  const cellStyleItem = (accentPool, hardUsed) => {
    const st = rng.pick(accentPool);
    const checks = [{ kind: "cellStyle", range, builtinId: st.builtinId, name: st.name }];
    let text = `[${range}] 영역은 셀 스타일 '${st.name}'${josa(st.name, "을/를")} 지정하시오.`;
    let usedCenter = false;
    if (rng.chance(0.5)) { checks.push({ kind: "alignment", range, horizontal: "center" }); usedCenter = true; text = `[${range}] 영역은 셀 스타일 '${st.name}'${josa(st.name, "을/를")} 지정하고 가로 '가운데 맞춤'을 지정하시오.`; }
    return { text, checks, meta: { tier, mode: "cellStyle", style: st.name, usedCenter, hardUsed } };
  };

  if (!hard) {
    const mode = rng.weighted([["cellStyle", 6], ["fill", 2], ["alignOnly", 1]]);
    if (mode === "fill") {
      const col = rng.pick(STANDARD_COLORS);
      return { text: `[${range}] 영역은 채우기 색 '${colorLabel(col.rgb)}', 가로 '가운데 맞춤'을 지정하시오.`, checks: [{ kind: "fill", range, rgb: col.rgb }, { kind: "alignment", range, horizontal: "center" }], meta: { tier, mode: "fill", color: col.name, usedCenter: true, hardUsed: false } };
    }
    if (mode === "cellStyle") return cellStyleItem(ACCENT_BASIC, false);
    return { text: `[${range}] 영역은 가로 '가운데 맞춤'을 지정하시오.`, checks: [{ kind: "alignment", range, horizontal: "center" }], meta: { tier, mode: "alignOnly", usedCenter: true, hardUsed: false } };
  }

  // 어려움: 20/40/60% 강조색 · 세로 병합 그룹
  const mode = rng.weighted([["cellStyle", 3], ...(groups.length ? [["merge", 3]] : [])]);
  if (mode === "merge") {
    const checks = []; const ranges = []; const gi = ctx.columns.find((c) => c.groupable).idx;
    for (const g of groups) {
      const r = `${g.colLetter}${g.startRow}:${g.colLetter}${g.endRow}`; ranges.push(r);
      checks.push({ kind: "merge", range: r }); checks.push({ kind: "alignment", range: r, horizontal: "center", merge: true });
      for (let rr = g.startRow + 1; rr <= g.endRow; rr++) ctx.rows[rr - 4][gi] = null; // 병합 그룹은 첫 행에만 값
    }
    return { text: `[${ranges.join("], [")}] 영역은 '병합하고 가운데 맞춤'을 지정하시오.`, checks, meta: { tier, mode: "merge", groups: groups.length, hardUsed: true }, usedCols: [ctx.groupableKey] };
  }
  return cellStyleItem(ACCENT_HARD, true);
}

// ── ③ 표시 형식 ──
function numFmtText(range, spec, ctx) {
  const col = spec.col;
  let sampleVal = ctx.rows[0][col.idx];
  if (spec.opts?.preferDivisor) {
    const d = spec.opts.preferDivisor; const vals = ctx.rows.map((r) => r[col.idx]);
    sampleVal = vals.find((v) => v % d === 0 && v / d >= 1000) ?? vals.find((v) => v % d === 0) ?? sampleVal;
  }
  const ex = [`${sampleVal} → ${spec.render(sampleVal)}`];
  if (spec.opts?.zeroExample) ex.push(`0 → ${spec.render(0)}`);
  return `[${range}] 영역은 사용자 지정 표시 형식을 이용하여 ${spec.phrase} [표시 예 : ${ex.join(", ")}]`;
}
function dateFmtText(range, spec, ctx) {
  const iso = ctx.rows[0][spec.col.idx];
  return `[${range}] 영역은 사용자 지정 표시 형식을 이용하여 날짜를 [표시 예 : ${renderBase(iso, spec.base)} → ${spec.render(iso)}]과 같이 표시하시오.`;
}
const rangeOf = (col, ctx) => `${col.letter}4:${col.letter}${ctx.dataEnd}`;

export function pickNumFmt(rng, ctx, tier = "basic", forced = null) {
  const hard = tier === "hard";
  // 유닛은 조립기가 목표 비율로 미리 고른 forced 를 쓴다(세트도 그 유닛을 낼 수 있게 선택됨).
  // forced 가 없거나 이 세트에서 못 내면 세트 내 가용 유닛에서 뽑는다(안전망).
  const units = availableNumFmtUnits(ctx, tier);
  const availIds = units.map((x) => x.id);
  const u = (forced && units.find((x) => x.id === forced)) || rng.weighted(units.map((x) => [x, x.w]));

  if (u.kind === "combo") {
    const numSpec = buildNumberSpec(rng, ctx, null);
    const dateSpec = buildDateSpec(rng, ctx, "hard", { weekday: true });
    const nRange = rangeOf(numSpec.col, ctx), dRange = rangeOf(dateSpec.col, ctx);
    return {
      text: `${numFmtText(nRange, numSpec, ctx)}\n${dateFmtText(dRange, dateSpec, ctx)}`,
      checks: [{ kind: "numFmt", range: nRange, codes: [numSpec.code], samples: [] }, { kind: "numFmt", range: dRange, codes: [dateSpec.code], samples: [] }],
      meta: { tier, unit: "combo", numItem: numSpec.familyId, dateItem: dateSpec.familyId, combo: true, hardUsed: true, availIds }, usedCols: [numSpec.col.key, dateSpec.col.key],
    };
  }
  const spec = u.kind === "date" ? specFromDateFamily(rng, ctx, u.fam) : specFromNumberFamily(rng, ctx, u.fam);
  const range = rangeOf(spec.col, ctx);
  // '간단한 날짜'(내장 14): 표시 예 없이 내장 형식 이름으로 지시하고, 채점은 내장 번호 14 일치로만 한다.
  if (spec.kind === "date" && spec.shortDate) {
    return {
      text: `[${range}] 영역은 '간단한 날짜' 형식으로 지정하시오.`,
      checks: [{ kind: "shortDate", range }],
      meta: { tier, unit: u.id, numItem: null, dateItem: spec.familyId, combo: false, hardUsed: hard, availIds },
      usedCols: [spec.col.key],
    };
  }
  const text = spec.kind === "date" ? dateFmtText(range, spec, ctx) : numFmtText(range, spec, ctx);
  return {
    text, checks: [{ kind: "numFmt", range, codes: [spec.code], samples: [] }],
    meta: { tier, unit: u.id, numItem: spec.kind === "number" ? spec.familyId : null, dateItem: spec.kind === "date" ? spec.familyId : null, combo: false, hardUsed: hard, availIds },
    usedCols: [spec.col.key],
  };
}

// ── ④ 맞춤·이름·메모·쉼표·붙여넣기·텍스트형식 ──
export function pickMisc(rng, ctx, tier = "basic") {
  const hard = tier === "hard";
  const nameableFree = () => ctx.columns.filter((c) => c.nameable && !ctx.used.has(c.key));
  const moneyFree = () => ctx.columns.filter((c) => c.type === "money" && !ctx.used.has(c.key));
  const textFree = () => ctx.textCols().filter((c) => !ctx.used.has(c.key) && !c.groupable);
  const dataFree = (excl) => ctx.dataCols().filter((c) => !ctx.used.has(c.key) && !c.groupable && c.key !== excl);
  const anyFree = () => ctx.dataCols().filter((c) => !ctx.used.has(c.key));
  const R = (c) => `${c.letter}4:${c.letter}${ctx.dataEnd}`;
  // 메모 50/50: (a) 항상 표시만  (b) 자동 크기 + 항상 표시
  const makeMemo = (mc) => {
    const cell = `${mc.letter}${4 + rng.int(ctx.rowCount)}`; const memo = rng.pick(MEMO_POOL); const auto = rng.chance(0.5);
    const text = auto
      ? `[${cell}] 셀에 '${memo}'${josa(memo, "이라는/라는")} 메모를 삽입한 후 '자동 크기'로 지정하고 항상 표시되도록 하시오.`
      : `[${cell}] 셀에 '${memo}'${josa(memo, "이라는/라는")} 메모를 삽입한 후 항상 표시되도록 하시오.`;
    const check = { kind: "comment", cell, text: memo, visible: true, ...(auto ? { autoSize: true } : {}) };
    return { text, check, auto, key: mc.key };
  };

  if (!hard) {
    // 기본: 한 항목에 1개
    const opts = [];
    if (!ctx.usedCenter) opts.push("h");
    if (nameableFree().length) opts.push("name");
    opts.push("memo");
    if (moneyFree().length) opts.push("comma");
    const op = rng.pick(opts);
    if (op === "h") { const c = (textFree()[0] ? rng.pick(textFree()) : rng.pick(anyFree())); return { text: `[${R(c)}] 영역은 가로 '가운데 맞춤'을 지정하시오.`, checks: [{ kind: "alignment", range: R(c), horizontal: "center" }], meta: { tier, align: "h", hardUsed: false, bundle: 1 }, usedCols: [c.key] }; }
    if (op === "name") { const c = rng.pick(nameableFree()); return { text: `[${R(c)}] 영역은 '${c.key}'${euroRo(c.key)} 이름을 정의하시오.`, checks: [{ kind: "definedName", name: c.key, ref: `$${c.letter}$4:$${c.letter}$${ctx.dataEnd}` }], meta: { tier, name: true, hardUsed: false, bundle: 1 }, usedCols: [c.key] }; }
    if (op === "comma") { const c = rng.pick(moneyFree()); return { text: `[${R(c)}] 영역은 '쉼표 스타일'을 지정하시오.`, checks: [{ kind: "cellStyle", range: R(c), builtinId: 3, accept: [3, 6] }], meta: { tier, comma: true, hardUsed: false, bundle: 1 }, usedCols: [c.key] }; }
    // memo
    const mm = makeMemo(rng.pick(anyFree()));
    return { text: mm.text, checks: [mm.check], meta: { tier, memo: true, memoAuto: mm.auto, hardUsed: false, bundle: 1 }, usedCols: [mm.key] };
  }

  // 어려움: 선택하여 붙여넣기 · 텍스트 형식 @ · (균등분할/들여쓰기 + 이름/메모/쉼표) 2개 묶음
  const countFree = ctx.columns.filter((c) => c.type === "count" && !ctx.used.has(c.key));
  const digitsFree = ctx.columns.filter((c) => c.type === "digits" && !ctx.used.has(c.key));
  const op = rng.weighted([["bundle", 5], ["paste", countFree.length ? 3 : 0], ["attext", digitsFree.length ? 2 : 0]]);

  if (op === "paste") {
    const ccol = rng.pick(countFree); const cRange = R(ccol);
    const extraCell = `${idxToCol(ctx.dataset.columns.length + 1)}2`;
    const add = rng.chance(0.5);
    const val = add ? rng.pick([10, 50, 100]) : rng.pick([2, 3, 10]);
    const expected = ctx.rows.map((r) => add ? r[ccol.idx] + val : r[ccol.idx] * val);
    const opWord = add ? "더하기" : "곱하기";
    return {
      text: `[${extraCell}] 셀의 값을 [${cRange}] 영역에 연산의 '${opWord}'로 선택하여 붙여넣기 하시오.`,
      checks: [{ kind: "values", range: cRange, expected }],
      meta: { tier, paste: true, add, val, hardUsed: true, bundle: 1 }, usedCols: [ccol.key], extraCells: [{ cell: extraCell, value: val }],
    };
  }
  if (op === "attext") {
    const dcol = rng.pick(digitsFree); const range = R(dcol);
    return { text: `[${range}] 영역은 표시 형식을 '텍스트'로 지정하시오.`, checks: [{ kind: "numFmt", range, codes: ["@"], samples: [] }], meta: { tier, attext: true, hardUsed: true, bundle: 1 }, usedCols: [dcol.key] };
  }

  // bundle: (균등분할 | 들여쓰기[숫자열]) + (이름/두범위이름/쉼표/메모)
  const numericFree = ctx.columns.filter((c) => ["count", "percentInt", "money", "decimal"].includes(c.type) && !ctx.used.has(c.key));
  const alignSub = rng.weighted([["dist", 1], ["indent", numericFree.length ? 1 : 0]]);
  let acol, alabel, acheck;
  if (alignSub === "indent") { acol = rng.pick(numericFree); const ind = rng.pick([1, 2]); alabel = `들여쓰기 '${ind}'`; acheck = { kind: "alignment", range: R(acol), indent: ind }; }
  else { acol = textFree().length ? rng.pick(textFree()) : rng.pick(anyFree()); alabel = "'균등 분할 (들여쓰기)'"; acheck = { kind: "alignment", range: R(acol), horizontal: "distributed" }; }
  const checks = [acheck]; const usedCols = [acol.key]; const sentences = []; const meta = { tier, align: alignSub, hardUsed: true, bundle: 2 };
  const P = josa(alabel, "을/를");

  // 2번째 작업 선택. name2(두 범위 이름 정의) = 이름 열 + money/count 열, 이름은 세트 groupName.
  const names = nameableFree().filter((c) => c.key !== acol.key);
  const monies = moneyFree().filter((c) => c.key !== acol.key);
  const nmCols = ctx.columns.filter((c) => ["money", "count"].includes(c.type) && !ctx.used.has(c.key) && c.key !== acol.key);
  const canName2 = names.length && nmCols.length && ctx.groupName;
  const sec = rng.pick([
    ...(canName2 ? ["name2"] : []),
    ...(names.length ? ["name"] : []),
    ...(monies.length ? ["comma"] : []),
    "memo",
  ]);
  if (sec === "name2") {
    const c1 = rng.pick(names); const c2rest = nmCols.filter((c) => c.key !== c1.key); const c2 = rng.pick(c2rest.length ? c2rest : nmCols);
    usedCols.push(c1.key, c2.key); meta.name = true; meta.name2 = true;
    checks.push({ kind: "definedName", name: ctx.groupName, ref: `$${c1.letter}$4:$${c1.letter}$${ctx.dataEnd},$${c2.letter}$4:$${c2.letter}$${ctx.dataEnd}` });
    sentences.push(`[${R(acol)}] 영역은 ${alabel}${P} 지정하시오.`);
    sentences.push(`[${R(c1)}], [${R(c2)}] 영역은 '${ctx.groupName}'${euroRo(ctx.groupName)} 이름을 정의하시오.`);
  } else if (sec === "name") {
    const c = rng.pick(names); usedCols.push(c.key); meta.name = true;
    checks.push({ kind: "definedName", name: c.key, ref: `$${c.letter}$4:$${c.letter}$${ctx.dataEnd}` });
    sentences.push(`[${R(acol)}] 영역은 ${alabel}${P} 지정하시오.`);
    sentences.push(`[${R(c)}] 영역은 '${c.key}'${euroRo(c.key)} 이름을 정의하시오.`);
  } else if (sec === "comma") {
    const c = rng.pick(monies); usedCols.push(c.key); meta.comma = true;
    checks.push({ kind: "cellStyle", range: R(c), builtinId: 3, accept: [3, 6] });
    sentences.push(`[${R(acol)}] 영역은 ${alabel}${P} 지정하시오.`);
    sentences.push(`[${R(c)}] 영역은 '쉼표 스타일'을 지정하시오.`);
  } else {
    const mcands = dataFree(acol.key); const mc = mcands.length ? rng.pick(mcands) : acol; meta.memo = true;
    const mm = makeMemo(mc); usedCols.push(mm.key); meta.memoAuto = mm.auto;
    checks.push(mm.check);
    sentences.push(`[${R(acol)}] 영역은 ${alabel}${P} 지정하시오.`);
    sentences.push(mm.text);
  }
  return { text: sentences.join(" "), checks, meta, usedCols };
}

// ── ⑤ 테두리 ──
export function pickBorder(rng, ctx, tier = "basic") {
  const hard = tier === "hard";
  const range = `A3:${ctx.last}${ctx.dataEnd}`;
  const headerRange = `A3:${ctx.last}3`;
  const frame = {
    inner: () => ({ text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용하여 표시하시오.`, check: { kind: "border", range, inner: "thin" } }),
    headerDouble: () => ({ text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용하고, [${headerRange}] 영역은 '아래쪽 이중 테두리(⊟)'를 적용하여 표시하시오.`, check: { kind: "border", range, inner: "thin", edges: [{ range: headerRange, side: "bottom", style: "double" }] } }),
    outer: () => ({ text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용한 후 '굵은 바깥쪽 테두리(⊡)'를 적용하여 표시하시오.`, check: { kind: "border", range, inner: "thin", outer: "medium" } }),
    all3: () => ({ text: `[${range}] 영역에 '모든 테두리(⊞)'를 적용한 후 '굵은 바깥쪽 테두리(⊡)'를 적용하고, [${headerRange}] 영역은 '아래쪽 이중 테두리(⊟)'를 적용하여 표시하시오.`, check: { kind: "border", range, inner: "thin", outer: "medium", edges: [{ range: headerRange, side: "bottom", style: "double" }] } }),
  };

  if (!hard) {
    const mode = rng.weighted([["headerDouble", 1], ["outer", 1]]);
    const f = frame[mode]();
    return { text: f.text, checks: [f.check], meta: { tier, mode, hardUsed: false } };
  }

  // 어려움: 4변형 같은 가중치 — 모든+아래이중 / 모든+굵은바깥 / 셋 다 / 대각선 X
  const cands = ctx.textCols().filter((c) => !ctx.used.has(c.key) && !c.groupable);
  const mode = rng.weighted([["headerDouble", 1], ["outer", 1], ["all3", 1], ["diagonal", cands.length ? 1 : 0]]);
  if (mode === "diagonal") {
    const baseMode = rng.chance(0.5) ? "inner" : "outer"; // 모든 테두리 또는 모든+굵은 바깥쪽에 붙임
    const f = frame[baseMode]();
    const col = rng.pick(cands); const rr = 4 + rng.int(ctx.rowCount); const cell = `${col.letter}${rr}`;
    ctx.rows[rr - 4][col.idx] = null; ctx.used.add(col.key);
    return { text: `${f.text} [${cell}] 셀에 '대각선(X)' 테두리를 적용하시오.`, checks: [f.check, { kind: "border", range: cell, diagonal: "thin", diagonalUp: true, diagonalDown: true }], meta: { tier, mode: baseMode, diagonal: true, hardUsed: true } };
  }
  const f = frame[mode]();
  return { text: f.text, checks: [f.check], meta: { tier, mode, hardUsed: mode === "all3" } };
}
