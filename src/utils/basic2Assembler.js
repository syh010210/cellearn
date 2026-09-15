// 기본작업-2 조립기: 유형 템플릿 × 데이터 세트 × 시드 → 문제 인스턴스.
// 출력은 basic2-0001.json 과 같은 필드(id, section, subtype, difficulty, grade, sheetName, title, table, intro, items).
// 같은 시드 → 같은 결과(mulberry32). examBuilder/examGrader/basic2Grader 는 이 출력을 그대로 쓴다.

import { DATASETS } from "../data/exam/basic2/datasets.js";
import { idxToCol } from "./xlsxStyles.js";
import { pickTitle, pickHeader, pickNumFmt, pickMisc, pickBorder } from "../data/exam/basic2/templates.js";
import { TARGET_BASIC, TARGET_HARD, DATE_FAMILIES } from "../data/exam/basic2/numFmtCatalog.js";

// 연도가 드러나는 날짜 패밀리(m"월" d"일" 세트에서는 출제 불가)
const YEAR_DATE_IDS = new Set(DATE_FAMILIES.filter((f) => f.year).map((f) => f.id));

// 세트가 이 ③ 유닛을 낼 수 있는가 (필요한 열 종류 유무). 절삭 백만은 7자리+백만배수 가능한 전역 money 열 필요.
function datasetCanProduce(d, unitId) {
  const cols = d.columns;
  const has = (pred) => cols.some(pred);
  const dateCol = cols.find((c) => c.type === "date");
  const yearOK = (dateCol?.baseFormat || "yyyy-mm-dd") === "yyyy-mm-dd";
  switch (unitId) {
    case "combo": return !!dateCol && has((c) => ["money", "count", "percentInt", "decimal", "seq"].includes(c.type) || (c.type === "text" && c.textSuffix) || c.atPercent);
    case "suffix": case "prefix-suffix": return has((c) => c.type === "count" && c.unit);
    case "thousand-suffix": case "trunc-thousand": return has((c) => c.type === "money");
    case "trunc-million": return has((c) => c.type === "money" && !c.rangeByGroup && !c.perNightByGroup && !c.scaleFrom && c.max >= 1e6);
    case "percent-int": return has((c) => c.type === "percentInt");
    case "decimal-suffix": case "percent-decimal": case "thousand-decimal": return has((c) => c.type === "decimal");
    case "text-suffix": return has((c) => c.type === "text" && c.textSuffix && !c.groupable);
    case "text-percent": return has((c) => c.atPercent);
    case "prefix-digits": return has((c) => c.type === "seq");
    case "date-short": return !!dateCol && !yearOK; // '간단한 날짜'는 m"월" d"일" 세트에서만
    default:
      if (unitId.startsWith("date")) return !!dateCol && (yearOK || !YEAR_DATE_IDS.has(unitId));
      return true;
  }
}

// 문자열 시드 → 결정적 난수
function makeRng(seedStr) {
  let h = 2166136261 >>> 0;
  for (const ch of String(seedStr)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  const next = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next,
    int: (n) => Math.floor(next() * n),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    weighted: (pairs) => { const tot = pairs.reduce((s, [, w]) => s + w, 0); let r = next() * tot; for (const [item, w] of pairs) { if ((r -= w) < 0) return item; } return pairs[pairs.length - 1][0]; },
    sample: (arr, n) => { const idx = arr.map((_, i) => i); const out = []; for (let k = 0; k < n && idx.length; k++) out.push(idx.splice(Math.floor(next() * idx.length), 1)[0]); return out.sort((x, y) => x - y).map((i) => arr[i]); },
  };
}

// ── 풀 기반 값 생성 ──
const WD1 = ["일", "월", "화", "수", "목", "금", "토"];
const isoWeekday = (iso) => { const [y, m, d] = iso.split("-").map(Number); return WD1[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; };
const toISO = (dt) => `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
const roundTo = (v, u) => Math.round(v / u) * u;

function planGroups(rng, groupsPool, rowCount) {
  const maxG = Math.min(groupsPool.length, Math.floor(rowCount / 2)); // 그룹당 2행 이상 보장
  const ng = Math.min(maxG, 2 + rng.int(2)); // 2~3
  const vals = rng.sample(groupsPool, ng);
  const counts = vals.map(() => 2); // 각 그룹 최소 2행
  let extra = rowCount - ng * 2;
  while (extra-- > 0) counts[rng.int(ng)]++;
  return vals.map((value, i) => ({ value, count: counts[i] }));
}

function genColumn(rng, col, rowCount, groupPlan, groupableKey, cache) {
  const t = col.type;
  // 다른 열에서 계산 (예: 달성률 = round(매출/목표×100)). 종속 열이 cache 에 있어야 하므로 마지막 단계에서 호출.
  if (col.derivedFrom) return Array.from({ length: rowCount }, (_, r) => { const row = {}; for (const k in cache) row[k] = cache[k][r]; return col.derivedFrom(row); });
  if (t === "seq") return Array.from({ length: rowCount }, (_, i) => i + 1);
  if (t === "code") {
    const out = new Set();
    while (out.size < rowCount) out.add(`${rng.pick(col.prefixes)}-${String(rng.int(Math.pow(10, col.digits))).padStart(col.digits, "0")}`);
    return [...out];
  }
  // 숫자형 문자 열(우편번호 등): 앞자리 0 보존 위해 문자열로. 텍스트(@) 형식 대상.
  if (t === "digits") {
    const out = new Set();
    while (out.size < rowCount) out.add(String(rng.int(Math.pow(10, col.digits))).padStart(col.digits, "0"));
    return [...out];
  }
  if (t === "money") {
    const groupVals = groupableKey ? cache[groupableKey] : null;
    // 요금 = 그룹별 단가 × 다른 열(숙박일수 등) — 항상 정수
    if (col.perNightByGroup) {
      const times = cache[col.times];
      return groupVals.map((g, r) => col.perNightByGroup[g] * times[r]);
    }
    // 그룹별 금액 범위 (등급별 포인트·부서별 기본급·등급별 일요금 등)
    if (col.rangeByGroup) {
      return groupVals.map((g) => { const { min, max, unit = 1 } = col.rangeByGroup[g]; return roundTo(min + rng.int(max - min + 1), unit); });
    }
    // 다른 금액 열 × 비율 (매출액 = 목표액 × 60~130%)
    if (col.scaleFrom) {
      const ref = cache[col.scaleFrom.col]; const { minPct, maxPct, unit = 1 } = col.scaleFrom;
      return ref.map((base) => roundTo((base * (minPct + rng.int(maxPct - minPct + 1))) / 100, unit));
    }
    const vals = Array.from({ length: rowCount }, () => roundTo(col.min + rng.int(col.max - col.min + 1), col.unit));
    if (col.max >= 1e6) {
      let c = vals.filter((v) => v >= 1e6).length, i = 0;
      while (c < 2 && i < rowCount) { if (vals[i] < 1e6) { vals[i] = roundTo(1e6 + rng.int(col.max - 1e6 + 1), col.unit); c++; } i++; }
      // 백만 절삭용: 백만 단위로 나누어떨어지는 값 1개 보장
      if (!vals.some((v) => v % 1e6 === 0)) { const m = (1 + rng.int(Math.floor(col.max / 1e6))) * 1e6; const j = vals.findIndex((v) => v >= 1e6); vals[j < 0 ? 0 : j] = m; }
    }
    // 천 단위 절삭용: 천 단위로 나누어떨어지는 값 1개 보장(어느 money 열이든 절삭 천 출제 가능하게)
    if (!vals.some((v) => v % 1000 === 0)) { const lo = Math.ceil(col.min / 1000), hi = Math.floor(col.max / 1000); if (hi >= lo) vals[rng.int(rowCount)] = (lo + rng.int(hi - lo + 1)) * 1000; }
    return vals;
  }
  if (t === "count" && col.rangeByGroup) {
    const groupVals = cache[groupableKey];
    return groupVals.map((g) => { const { min, max } = col.rangeByGroup[g]; return min + rng.int(max - min + 1); });
  }
  // 지정 열 값 이하 (예매수 ≤ 좌석수, 수강인원 ≤ 정원)
  if (t === "count" && col.maxOfColumn) {
    const ref = cache[col.maxOfColumn];
    return ref.map((mx) => col.min + rng.int(Math.max(0, mx - col.min) + 1));
  }
  if (t === "count" || t === "percentInt") return Array.from({ length: rowCount }, () => col.min + rng.int(col.max - col.min + 1));
  if (t === "decimal") { // 소수 (평점·만족도 등). decimals 자리까지.
    const f = Math.pow(10, col.decimals || 1); const lo = Math.round(col.min * f), hi = Math.round(col.max * f);
    return Array.from({ length: rowCount }, () => (lo + rng.int(hi - lo + 1)) / f);
  }
  if (t === "date") {
    const from = new Date(col.from + "T00:00:00Z"), to = new Date(col.to + "T00:00:00Z");
    const days = Math.round((to - from) / 86400000);
    if (col.weekdayOf) { // 그룹(요일)에 맞는 날짜
      const wants = cache[col.weekdayOf]; // 각 행의 요일 문자열("월요일")
      const used = new Set();
      return wants.map((w) => { const target = w.replace("요일", ""); let iso; do { const off = rng.int(days + 1); iso = toISO(new Date(from.getTime() + off * 86400000)); } while (isoWeekday(iso) !== target || used.has(iso)); used.add(iso); return iso; });
    }
    const used = new Set();
    return Array.from({ length: rowCount }, () => { let iso; do { iso = toISO(new Date(from.getTime() + rng.int(days + 1) * 86400000)); } while (used.has(iso)); used.add(iso); return iso; });
  }
  // text
  if (col.groupable) { const out = []; for (const g of groupPlan) for (let k = 0; k < g.count; k++) out.push(g.value); return out; }
  if (col.repeatable) return Array.from({ length: rowCount }, () => rng.pick(col.pool));
  return rng.sample(col.pool, rowCount); // 중복 없이
}

function buildContext(rng, dataset) {
  const nf = dataset.columns.filter((c) => c.type !== "formula");
  const nfIdx = (key) => nf.findIndex((c) => c.key === key);
  const columns = dataset.columns.map((c, i) => ({ key: c.key, type: c.type, nameable: !!c.nameable, groupable: !!c.groupable, unit: c.unit || null, textSuffix: c.textSuffix || null, atPercent: !!c.atPercent, baseFormat: c.baseFormat, letter: idxToCol(i), idx: c.type === "formula" ? -1 : nfIdx(c.key) }));
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));

  const [lo, hi] = dataset.rowCount;
  const rowCount = lo + rng.int(hi - lo + 1);

  const gcolSpec = dataset.columns.find((c) => c.groupable);
  const groupPlan = gcolSpec ? planGroups(rng, gcolSpec.groups, rowCount) : null;

  // 열별 값 생성. 순서: 그룹 열 → (이름 겹침 방지 텍스트) → 그 외 비금액 → 금액.
  // 금액은 그룹/개수(숙박일수 등)를 참조할 수 있어 마지막에 만든다.
  const gkey = gcolSpec?.key ?? null;
  const cache = {};
  for (const c of dataset.columns) if (c.groupable) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  // 같은 pool 을 쓰는 일반 텍스트 열끼리 이름이 겹치지 않도록 한 번에 뽑아 분배
  const plainText = dataset.columns.filter((c) => c.type === "text" && !c.groupable && !c.repeatable);
  const byPool = new Map();
  for (const c of plainText) { if (!byPool.has(c.pool)) byPool.set(c.pool, []); byPool.get(c.pool).push(c); }
  for (const [pool, cols] of byPool) {
    const need = cols.length * rowCount;
    const seq = rng.sample(pool, Math.min(need, pool.length));
    cols.forEach((c, ci) => { cache[c.key] = seq.slice(ci * rowCount, (ci + 1) * rowCount); });
  }
  const pending = (c) => !(c.key in cache) && c.type !== "formula";
  // 3) 독립 비금액 열 (maxOfColumn·derivedFrom 은 종속이라 뒤로 미룸)
  for (const c of dataset.columns) if (pending(c) && c.type !== "money" && !c.maxOfColumn && !c.derivedFrom) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  // 4) 독립 금액 → 5) 비율 종속 금액(scaleFrom) → 6) 상한 종속 개수(maxOfColumn) → 7) 파생 열(derivedFrom)
  for (const c of dataset.columns) if (pending(c) && c.type === "money" && !c.scaleFrom && !c.derivedFrom) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  for (const c of dataset.columns) if (pending(c) && c.type === "money" && c.scaleFrom) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  for (const c of dataset.columns) if (pending(c) && c.maxOfColumn) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  for (const c of dataset.columns) if (pending(c) && c.derivedFrom) cache[c.key] = genColumn(rng, c, rowCount, groupPlan, gkey, cache);
  const rows = Array.from({ length: rowCount }, (_, r) => nf.map((c) => cache[c.key][r]));

  const gcol = columns.find((c) => c.groupable);
  const groups = [];
  if (gcol && groupPlan) {
    let s = 0;
    for (const g of groupPlan) { groups.push({ value: g.value, startRow: 4 + s, endRow: 4 + s + g.count - 1, colLetter: gcol.letter }); s += g.count; }
  }

  const title = `${rng.pick(dataset.titlePool.org)} ${rng.pick(dataset.titlePool.tail)}`;
  const used = new Set();
  return {
    dataset, columns, rows, rowCount, dataStart: 4, dataEnd: 3 + rowCount,
    last: idxToCol(dataset.columns.length - 1), title, groupName: dataset.groupName,
    groups, groupableKey: gcol?.key ?? null, used,
    colOf: (key) => colByKey[key].letter,
    idxOf: (key) => colByKey[key].idx,
    textCols: () => columns.filter((c) => c.type === "text"),
    dataCols: () => columns.filter((c) => c.type !== "formula"),
  };
}

export function assembleBasic2(seed, constraints = {}) {
  return assembleOnce(makeRng(seed), seed, constraints);
}

function assembleOnce(rng, seed, constraints = {}) {
  const hard = constraints.difficulty === "hard"; // 기본값 basic
  const tier = hard ? "hard" : "basic";
  const targets = hard ? TARGET_HARD : TARGET_BASIC;

  // ① ③ 표시형식 패밀리(유닛)를 목표 비율로 먼저 뽑고 → ② 그 패밀리를 낼 수 있는 세트만 후보로 세트 선택.
  const dateOnly = constraints.numFmt?.includes("date");
  let unitId = null, pool = null;
  for (let t = 0; t < 40; t++) {
    const id = rng.weighted(Object.entries(targets));
    let cand = DATASETS.filter((d) => datasetCanProduce(d, id));
    if (dateOnly) cand = cand.filter((d) => d.columns.some((c) => c.type === "date"));
    if (cand.length) { unitId = id; pool = cand; break; }
  }
  if (!pool) { pool = dateOnly ? DATASETS.filter((d) => d.columns.some((c) => c.type === "date")) : DATASETS; unitId = null; }
  const dataset = rng.pick(pool);

  const ctx = buildContext(rng, dataset);

  // 어려움: ③은 항상 hard. ①②④ 중 최소 1자리 이상이 확실히 hard 전용(총 ③ 포함 ≥2자리).
  // ⑤는 어려움 모드에서 4변형(모든+아래이중·모든+굵은바깥·셋 다·대각선) 풀을 쓰며 그 자체로 hard 여부가 갈린다(보너스).
  const slotHard = { title: false, header: false, misc: false };
  if (hard) {
    for (const k of ["title", "header", "misc"]) slotHard[k] = rng.chance(0.5);
    if (!Object.values(slotHard).some(Boolean)) slotHard[rng.pick(["title", "header", "misc"])] = true;
  }
  const tierOf = (k) => (slotHard[k] ? "hard" : "basic");

  // ① 제목 (필수) · ② 머리글 · ③ 표시형식 · ④ 맞춤/이름/메모 · ⑤ 테두리
  const title = pickTitle(rng, ctx, tierOf("title"));
  const header = pickHeader(rng, ctx, tierOf("header"));
  (header.usedCols || []).forEach((k) => ctx.used.add(k));
  ctx.usedCenter = !!header.meta.usedCenter; // ②가 가로 가운데를 썼으면 ④는 균등 분할·들여쓰기로

  // ③(표시형식)을 항상 먼저 뽑아 열을 예약한다(날짜 열 포함). ④(맞춤·이름·메모)가 같은 열을 침범하지 않게.
  // swap 은 표시 순서에만 적용한다(③④ 자리 교체).
  const swap = rng.chance(0.3);
  const runNumFmt = () => { const s = pickNumFmt(rng, ctx, tier, unitId); (s.usedCols || []).forEach((k) => ctx.used.add(k)); return s; };
  const runMisc = () => { const s = pickMisc(rng, ctx, tierOf("misc")); (s.usedCols || []).forEach((k) => ctx.used.add(k)); return s; };
  const numFmt = runNumFmt();
  const misc = runMisc();
  const a = swap ? misc : numFmt;
  const b = swap ? numFmt : misc;
  const border = pickBorder(rng, ctx, hard ? "hard" : "basic");

  // 표시 순서: ① ② (③④ 또는 ④③) ⑤
  const ordered = [title, header, a, b, border];
  const items = ordered.map((s, i) => ({ no: i + 1, points: 2, text: s.text, checks: s.checks }));

  const extraCells = [...(a.extraCells || []), ...(b.extraCells || [])]; // 선택하여 붙여넣기용 배수 셀 등
  const table = {
    titleCell: "A1",
    title: ctx.title,
    headerRow: 3,
    headers: dataset.columns.map((c) => c.key),
    rows: ctx.rows,
    columns: dataset.columns,
    colWidths: dataset.colWidths,
    ...(extraCells.length ? { extraCells } : {}),
  };

  // 어려움에서 ①②④⑤ 중 실제로 hard 전용이 몇 자리 들어갔는지 (③ 제외)
  const otherHard = [title, header, misc, border].filter((s) => s.meta.hardUsed).length;
  const inst = {
    id: "basic2-" + seed,
    section: "기본2",
    subtype: "format",
    difficulty: hard ? "어려움" : "기본",
    grade: "2급",
    sheetName: "기본작업-2",
    title: ctx.title,
    table,
    intro: "'기본작업-2' 시트에 대하여 다음의 지시사항을 처리하시오. (각 2점)",
    items,
    _meta: { seed, dataset: dataset.id, difficulty: hard ? "hard" : "basic", swap, otherHard, title: title.meta, header: header.meta, numFmt: numFmt.meta, misc: misc.meta, border: border.meta },
  };
  return inst;
}
