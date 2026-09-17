// scripts/_gichulCheck.mjs — 기출 사전 대조 공용. 변형 spec(들)에서 요소 수집 → 사전과 매칭.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const DICT = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "gichul-dict.json"), "utf8"));

const strLits = (f) => { const s = []; for (const m of String(f).matchAll(/"([^"]*)"/g)) if (m[1]) s.push(m[1]); return s; };
const themeable = (x) => x && !/^[<>=*]/.test(x) && !/^\d+$/.test(x) && !["명", "개", "일", "시간", "초", "분", "-", "/", "(", ")", "년", "월", "남", "여"].includes(x);

// 한 spec 에서 대조용 요소 추출
export function collectSpec(sp, acc) {
  strLits(sp.answer).filter(themeable).forEach((x) => acc.results.add(x));
  (sp.notes || []).forEach((nt) => strLits(nt).filter(themeable).forEach((x) => acc.results.add(x)));
  const rt = sp.refTable || sp.resultTable;
  if (rt) {
    if (rt.name) acc.names.add(rt.name);
    (rt.rows || []).flat().forEach((x) => { if (typeof x === "string" && themeable(x)) acc.results.add(x); });
    (rt.headers || []).forEach((x) => { if (typeof x === "string" && themeable(x)) acc.results.add(x); });
    const low = (rt.rows || []).map((r) => r[0]).filter((x) => typeof x === "number");
    if (low.length >= 3) acc.intervals.add(low.join("/"));
    const hd = (rt.headers || []).filter((x) => typeof x === "number");
    if (hd.length >= 3) acc.intervals.add(hd.join("/"));
    (rt.rowLabels || []).forEach((x) => { if (typeof x === "string" && themeable(x)) acc.refHeads.add(x); });
    (rt.headers || []).forEach((x) => { if (typeof x === "string" && themeable(x)) acc.refHeads.add(x); });
  }
  // 수식이 참조하는 열: 지시문·▶ 의 {col:X}
  for (const t of [sp.text, ...(sp.notes || [])]) for (const m of String(t).matchAll(/\{col:([^}]+)\}/g)) acc.cols.add(m[1]);
  // 기준값: 비교 연산자 뒤 숫자
  for (const m of String(sp.answer).matchAll(/(?:>=|<=|>|<|=)\s*"?(\d{1,9})"?/g)) acc.thr.add(+m[1]);
  // LARGE-SMALL 차 순위 조합
  const rk = /LARGE\([^,]+,\s*(\d+)\s*\)\s*-\s*SMALL\([^,]+,\s*(\d+)\s*\)/.exec(String(sp.answer));
  if (rk) acc.ranks.add(`${rk[1]},${rk[2]}`);
}
export const newAcc = () => ({ results: new Set(), names: new Set(), intervals: new Set(), cols: new Set(), thr: new Set(), ranks: new Set(), refHeads: new Set() });

const subset = (set, group) => group.every((g) => set.has(g));
// acc → { cells:{dim→표시}, immediate:bool, count:int, hits:[...] }
export function judge(acc) {
  const hits = [];
  const rHit = DICT.resultGroups.filter((g) => subset(acc.results, g.set));
  const big = rHit.find((g) => g.set.length >= 3);
  const nHit = DICT.tableNames.find((t) => acc.names.has(t.name));
  const iHit = DICT.intervalCombos.find((c) => acc.intervals.has(c.combo));
  const kHit = DICT.rankKDiff.find((k) => acc.ranks.has(k.combo));
  const cHit = DICT.columnGroups.find((c) => subset(acc.cols, c.set));
  const tHit = DICT.thresholds.filter((t) => acc.thr.has(t.v));
  const hHit = (DICT.refHeaderGroups || []).find((h) => subset(acc.refHeads, h.set));
  const cells = {
    result: rHit.length ? `같음(${rHit.map((g) => g.set.join("")).join(",")})` : "다름",
    name: nHit ? `같음(${nHit.name})` : (acc.names.size ? "다름" : "-"),
    interval: iHit ? `같음(${iHit.combo})` : (acc.intervals.size ? "다름" : "-"),
    rankK: kHit ? `같음(${kHit.combo})` : (acc.ranks.size ? "다름" : "-"),
    col: cHit ? `같음(${cHit.set.join("·")})` : "다름",
    thr: tHit.length ? `같음(${tHit.map((t) => t.v).join(",")})` : "다름",
    refHead: hHit ? `같음(${hHit.set.join("·")})` : (acc.refHeads.size ? "다름" : "-"),
  };
  // 개별(그대로 안 됨) 실패: 표이름·구간·순위k·3원소 이상 결과묶음
  const immediate = !!(nHit || iHit || kHit || big);
  // 카운트 차원(2개 이상이면 실패)
  const count = (rHit.length ? 1 : 0) + (nHit ? 1 : 0) + (iHit ? 1 : 0) + (kHit ? 1 : 0) + (cHit ? 1 : 0) + (tHit.length ? 1 : 0) + (hHit ? 1 : 0);
  if (nHit) hits.push(`표이름 ${nHit.name}(${nHit.loc})`);
  if (iHit) hits.push(`구간 ${iHit.combo}(${iHit.loc})`);
  if (kHit) hits.push(`순위k ${kHit.combo}(${kHit.loc})`);
  rHit.forEach((g) => hits.push(`결과 ${g.set.join("/")}(${g.loc})`));
  if (cHit) hits.push(`열 ${cHit.set.join("·")}(${cHit.loc})`);
  if (tHit.length) hits.push(`기준값 ${tHit.map((t) => t.v).join(",")}`);
  if (hHit) hits.push(`참조머리 ${hHit.set.join("·")}(${hHit.loc})`);
  return { cells, immediate, count, big: !!big, hits, fail: immediate || count >= 2 };
}
