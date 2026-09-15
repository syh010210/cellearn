// 기본작업-2 ③ 표시 형식 카탈로그 — 패밀리 + 슬롯 구조.
// 각 패밀리는 고정 코드가 아니라 슬롯 풀에서 값을 뽑아 code·phrase·render 를 함께 만든다.
// tier: "basic" | "hard". 조립기가 난이도별로 뽑는 풀을 나눈다.
// 표시 예 값은 조립기(templates)가 실제 데이터에서 뽑아 render 로 만든다.

import { josa } from "./josa.js";

const WD_K = ["일", "월", "화", "수", "목", "금", "토"];
const WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_EN_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad2 = (n) => String(n).padStart(2, "0");
const comma = (n) => Number(n).toLocaleString("ko-KR");
export function parseISO(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, wd: WD_K[dow], dow };
}
// 요일 토큰 → 문자열
const wdStr = (tok, P) => tok === "aaa" ? P.wd : tok === "aaaa" ? P.wd + "요일" : tok === "ddd" ? WD_EN[P.dow] : WD_EN_FULL[P.dow];
// 요일 토큰 풀 (dddd 는 드물게)
export const WEEKDAY_TOKENS = [["aaa", 5], ["aaaa", 3], ["ddd", 3], ["dddd", 1]];

// 세트 baseFormat 으로 "앞쪽 값"을 렌더 (표시 예 왼쪽).
export function renderBase(iso, baseFormat) {
  const { y, m, d } = parseISO(iso);
  if (baseFormat === 'm"월" d"일"') return `${m}월 ${d}일`;
  return `${y}-${pad2(m)}-${pad2(d)}`; // 기본 yyyy-mm-dd
}

// ── 열 후보 헬퍼 ──
const free = (ctx, type) => ctx.columns.filter((c) => c.type === type && !ctx.used.has(c.key));
const has7 = (ctx, c) => ctx.rows.some((r) => r[c.idx] >= 1000000);
const hasDiv = (ctx, c, d) => ctx.rows.some((r) => r[c.idx] % d === 0);

// 접두 풀
const P_PREFIX = ["*", "◆", "▶", "○", "No.", "☆"];
const P_DIGIT = ["GP-", "NO-", "A-", "S-", "K-"];
const S_TRUNC_K = ["천원", "천", "천 원", "K"];
const S_TRUNC_M = ["백만", "백만원", "M"];

// ── 숫자 패밀리 ──
// make(rng, col) → { code, phrase, render, opts:{ zeroExample?, preferDivisor?, textSample? } }
export const NUMBER_FAMILIES = [
  { id: "suffix", tier: "basic", weight: 3, kind: "number",
    cols: (ctx) => free(ctx, "count").filter((c) => c.unit),
    make: (rng, col) => ({ code: `0"${col.unit}"`, phrase: `숫자 뒤에 '${col.unit}'${josa(col.unit, "을/를")} 표시하시오.`, render: (v) => v + col.unit, opts: { zeroExample: true } }) },
  { id: "thousand-suffix", tier: "basic", weight: 3, kind: "number",
    cols: (ctx) => free(ctx, "money"),
    make: () => ({ code: '#,##0"원"', phrase: "천 단위 구분 기호와 숫자 뒤에 '원'을 표시하시오.", render: (v) => comma(v) + "원", opts: { zeroExample: true } }) },
  { id: "thousand-decimal", tier: "basic", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "decimal"),
    make: (rng, col) => ({ code: `#,##0.0"${col.unit}"`, phrase: `천 단위 구분 기호와 숫자 뒤에 '${col.unit}'${josa(col.unit, "을/를")} 표시하고 소수점 이하 첫째 자리까지 표시하시오.`, render: (v) => { const [i, d] = Number(v).toFixed(1).split("."); return comma(Number(i)) + "." + d + col.unit; }, opts: { zeroExample: true } }) },
  { id: "decimal-suffix", tier: "basic", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "decimal"),
    make: (rng, col) => ({ code: `0.00"${col.unit}"`, phrase: `숫자 뒤에 '${col.unit}'${josa(col.unit, "을/를")} 표시하고 소수점 이하 둘째 자리까지 표시하시오.`, render: (v) => Number(v).toFixed(2) + col.unit, opts: { zeroExample: true } }) },
  { id: "percent-int", tier: "basic", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "percentInt"),
    make: () => ({ code: '0"%"', phrase: "숫자 뒤에 '%'를 표시하시오.", render: (v) => v + "%", opts: { zeroExample: true } }) },
  { id: "percent-decimal", tier: "basic", weight: 1, kind: "number",
    cols: (ctx) => free(ctx, "decimal"),
    make: () => ({ code: '0.0"%"', phrase: "숫자 뒤에 '%'를 표시하고 소수점 이하 첫째 자리까지 표시하시오.", render: (v) => Number(v).toFixed(1) + "%", opts: { zeroExample: true } }) },
  { id: "text-suffix", tier: "basic", weight: 2, kind: "number",
    cols: (ctx) => ctx.columns.filter((c) => c.type === "text" && c.textSuffix && !c.groupable && !ctx.used.has(c.key)),
    make: (rng, col) => { const s = rng.pick(col.textSuffix); return { code: `@"${s}"`, phrase: `문자 뒤에 '${s}'${josa(s, "을/를")} 표시하시오.`, render: (v) => String(v) + s, opts: { textSample: true } }; } },
  { id: "text-percent", tier: "basic", weight: 3, kind: "number",
    cols: (ctx) => ctx.columns.filter((c) => c.atPercent && !ctx.used.has(c.key)),
    make: () => ({ code: '@"%"', phrase: "문자 뒤에 '%'를 표시하시오.", render: (v) => String(v) + "%", opts: { textSample: true } }) },

  { id: "prefix-suffix", tier: "hard", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "count").filter((c) => c.unit),
    make: (rng, col) => { const p = rng.pick(P_PREFIX); return { code: `"${p}"0"${col.unit}"`, phrase: `숫자 앞에 '${p}'${josa(p, "을/를")} 표시하고 숫자 뒤에 '${col.unit}'${josa(col.unit, "을/를")} 표시 예와 같이 표시하시오.`, render: (v) => p + v + col.unit, opts: { zeroExample: true } }; } },
  { id: "prefix-digits", tier: "hard", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "seq"),
    make: (rng) => { const p = rng.pick(P_DIGIT); const dg = rng.pick([2, 3]); return { code: `"${p}"${"0".repeat(dg)}`, phrase: `숫자 앞에 '${p}'가 항상 표시되고 숫자는 ${dg}자리로 표시되게 지정하시오.`, render: (v) => p + String(v).padStart(dg, "0"), opts: {} }; } },
  { id: "trunc-thousand", tier: "hard", weight: 2, kind: "number",
    cols: (ctx) => free(ctx, "money").filter((c) => hasDiv(ctx, c, 1000)),
    make: (rng) => { const s = rng.pick(S_TRUNC_K); return { code: `#,##0,"${s}"`, phrase: `천 단위를 절삭하고 숫자 뒤에 '${s}'${josa(s, "을/를")} 표시하시오.`, render: (v) => comma(Math.round(v / 1000)) + s, opts: { preferDivisor: 1000, zeroExample: true } }; } },
  { id: "trunc-million", tier: "hard", weight: 1, kind: "number",
    cols: (ctx) => free(ctx, "money").filter((c) => has7(ctx, c) && hasDiv(ctx, c, 1000000)),
    make: (rng) => {
      const s = rng.pick(S_TRUNC_M);
      const dec = rng.weighted([["0.00", 3], ["#,##0", 2], ["0.0", 1]]); // 0.0,, 은 드물게
      const code = `${dec},,"${s}"`;
      const render = dec === "0.00" ? (v) => (v / 1e6).toFixed(2) + s : dec === "0.0" ? (v) => (v / 1e6).toFixed(1) + s : (v) => comma(Math.round(v / 1e6)) + s;
      return { code, phrase: `백만 단위를 절삭하고 숫자 뒤에 '${s}'${josa(s, "을/를")} 표시하시오.`, render, opts: { preferDivisor: 1000000, zeroExample: true } };
    } },
];

// ── 날짜 패밀리 ──  year: 연도 노출 · weekday: 요일 토큰
// shortDate: 내장 '간단한 날짜'(내장 번호 14). 연도가 드러나지만 연도 노출 규칙의 유일한 예외로,
//   yyyy-mm-dd 세트가 아니라 m"월" d"일" 세트(book·reserve·hospital·delivery)에서만, 기본 tier 로만 출제한다.
//   표시 예 없이 "'간단한 날짜' 형식으로 지정" 문장을 쓰고, 채점은 내장 번호 14 일치로만 한다(templates·grader 참고).
export const DATE_FAMILIES = [
  { id: "date-short", tier: "basic", year: false, weekday: false, shortDate: true, weight: 2, code: () => 14, render: (P) => `${P.y}-${pad2(P.m)}-${pad2(P.d)}` },
  { id: "date-y-mmdd", tier: "basic", year: true, weekday: false, weight: 2, code: () => 'yyyy"년" mm"월" dd"일"', render: (P) => `${P.y}년 ${pad2(P.m)}월 ${pad2(P.d)}일` },
  { id: "date-y-md", tier: "basic", year: true, weekday: false, weight: 2, code: () => 'yyyy"년" m"월" d"일"', render: (P) => `${P.y}년 ${P.m}월 ${P.d}일` },
  { id: "date-mmdd", tier: "basic", year: false, weekday: false, weight: 2, code: () => 'mm"월" dd"일"', render: (P) => `${pad2(P.m)}월 ${pad2(P.d)}일` },
  { id: "date-md", tier: "basic", year: false, weekday: false, weight: 2, code: () => 'm"월" d"일"', render: (P) => `${P.m}월 ${P.d}일` },
  { id: "date-mmdd-w", tier: "hard", year: false, weekday: true, weight: 3, code: (w) => `mm"월" dd"일"(${w})`, render: (P, w) => `${pad2(P.m)}월 ${pad2(P.d)}일(${wdStr(w, P)})` },
  { id: "date-md-w", tier: "hard", year: false, weekday: true, weight: 3, code: (w) => `m"월" d"일"(${w})`, render: (P, w) => `${P.m}월 ${P.d}일(${wdStr(w, P)})` },
  { id: "date-slash-md-w", tier: "hard", year: false, weekday: true, weight: 2, code: (w) => `m/d(${w})`, render: (P, w) => `${P.m}/${P.d}(${wdStr(w, P)})` },
  { id: "date-slash-mmdd-w", tier: "hard", year: false, weekday: true, weight: 2, code: (w) => `mm/dd(${w})`, render: (P, w) => `${pad2(P.m)}/${pad2(P.d)}(${wdStr(w, P)})` },
  { id: "date-iso-w", tier: "hard", year: true, weekday: true, weight: 2, code: (w) => `yyyy-mm-dd(${w})`, render: (P, w) => `${P.y}-${pad2(P.m)}-${pad2(P.d)}(${wdStr(w, P)})` },
  { id: "date-yyslash-w", tier: "hard", year: true, weekday: true, weight: 1, code: (w) => `yy/mm/dd(${w})`, render: (P, w) => `${String(P.y).slice(2)}/${pad2(P.m)}/${pad2(P.d)}(${wdStr(w, P)})` },
];

// ── 출제 목표 비율 (패밀리별 %). 조립기가 세트에서 뽑을 수 있는 패밀리만 남겨 재정규화한 뒤 이 비율로 뽑는다. ──
export const TARGET_BASIC = {
  "thousand-suffix": 15, "text-suffix": 15, "suffix": 15, "percent-int": 15, "date-mmdd": 15,
  // 나머지 25% 균등 8개 (date-short 는 m"월" d"일" 세트에서만 실제로 뽑히고, 그 외 세트에선 후보에서 빠져 재정규화됨)
  "date-md": 25 / 8, "date-y-mmdd": 25 / 8, "date-y-md": 25 / 8, "date-short": 25 / 8, "decimal-suffix": 25 / 8, "percent-decimal": 25 / 8, "thousand-decimal": 25 / 8, "text-percent": 25 / 8,
};
export const TARGET_HARD = {
  "trunc-thousand": 20, "prefix-suffix": 20,
  // 요일 날짜 20% 균등 6종
  "date-mmdd-w": 20 / 6, "date-md-w": 20 / 6, "date-slash-md-w": 20 / 6, "date-slash-mmdd-w": 20 / 6, "date-iso-w": 20 / 6, "date-yyslash-w": 20 / 6,
  // 나머지 40% 균등 3개
  "trunc-million": 40 / 3, "prefix-digits": 40 / 3, "combo": 40 / 3,
};
const NUM_BY_ID = Object.fromEntries(NUMBER_FAMILIES.map((f) => [f.id, f]));
const DATE_BY_ID = Object.fromEntries(DATE_FAMILIES.map((f) => [f.id, f]));

// 이 세트(ctx)에서 뽑을 수 있는 표시형식 유닛 목록(패밀리 또는 combo) + 목표 가중치
export function availableNumFmtUnits(ctx, tier) {
  const targets = tier === "hard" ? TARGET_HARD : TARGET_BASIC;
  const dcol = ctx.columns.find((c) => c.type === "date" && !ctx.used.has(c.key));
  const yearOK = (dcol?.baseFormat || "yyyy-mm-dd") === "yyyy-mm-dd";
  const out = [];
  for (const [id, w] of Object.entries(targets)) {
    if (id === "combo") {
      const numAvail = NUMBER_FAMILIES.some((f) => f.cols(ctx).length);
      const wdAvail = !!dcol && DATE_FAMILIES.some((f) => f.weekday && (yearOK || !f.year));
      if (dcol && numAvail && wdAvail) out.push({ id, w, kind: "combo" });
    } else if (id.startsWith("date")) {
      const fam = DATE_BY_ID[id];
      // date-short 는 연도 노출 규칙의 예외: m"월" d"일" 세트(!yearOK)에서만. 그 외 날짜 패밀리는 기존 규칙.
      const okBase = fam.shortDate ? !yearOK : (yearOK || !fam.year);
      if (dcol && okBase) out.push({ id, w, kind: "date", fam });
    } else {
      const fam = NUM_BY_ID[id];
      if (fam && fam.cols(ctx).length) out.push({ id, w, kind: "number", fam });
    }
  }
  return out;
}
export function specFromNumberFamily(rng, ctx, fam) { const col = rng.pick(fam.cols(ctx)); return { kind: "number", familyId: fam.id, tier: fam.tier, col, ...fam.make(rng, col) }; }
export function specFromDateFamily(rng, ctx, fam) {
  const dcol = ctx.columns.find((c) => c.type === "date" && !ctx.used.has(c.key));
  const w = fam.weekday ? rng.weighted(WEEKDAY_TOKENS) : null;
  return { kind: "date", familyId: fam.id, tier: fam.tier, shortDate: !!fam.shortDate, col: dcol, base: dcol.baseFormat || "yyyy-mm-dd", code: fam.code(w), render: (iso) => fam.render(parseISO(iso), w), weekdayTok: w };
}

// ── 선택 API (combo 의 숫자부·요일 날짜부 조립에 쓴다) ──
export function buildNumberSpec(rng, ctx, tier) {
  const fams = NUMBER_FAMILIES.filter((f) => (tier == null || f.tier === tier) && f.cols(ctx).length);
  if (!fams.length) return null;
  const fam = rng.weighted(fams.map((f) => [f, f.weight || 1]));
  return specFromNumberFamily(rng, ctx, fam);
}
export function buildDateSpec(rng, ctx, tier, opts = {}) {
  const dcol = ctx.columns.find((c) => c.type === "date" && !ctx.used.has(c.key));
  if (!dcol) return null;
  const yearOK = (dcol.baseFormat || "yyyy-mm-dd") === "yyyy-mm-dd";
  const fams = DATE_FAMILIES.filter((f) => (tier == null || f.tier === tier) && (yearOK || !f.year) && (opts.weekday == null || f.weekday === opts.weekday));
  if (!fams.length) return null;
  const fam = rng.weighted(fams.map((f) => [f, f.weight || 1]));
  return specFromDateFamily(rng, ctx, fam);
}
