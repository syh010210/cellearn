// 기본작업-2 조립기: 유형 템플릿 × 데이터 세트 × 시드 → 문제 인스턴스.
// 출력은 basic2-0001.json 과 같은 필드(id, section, subtype, difficulty, grade, sheetName, title, table, intro, items).
// 같은 시드 → 같은 결과(mulberry32). examBuilder/examGrader/basic2Grader 는 이 출력을 그대로 쓴다.

import { DATASETS } from "../data/exam/basic2/datasets.js";
import { idxToCol } from "./xlsxStyles.js";
import { pickTitle, pickHeader, pickNumFmt, pickMisc, pickBorder } from "../data/exam/basic2/templates.js";

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

function buildContext(rng, dataset) {
  const nf = dataset.columns.filter((c) => c.type !== "formula");
  const nfIdx = (key) => nf.findIndex((c) => c.key === key);
  const columns = dataset.columns.map((c, i) => ({ key: c.key, type: c.type, nameable: !!c.nameable, groupable: !!c.groupable, baseFormat: c.baseFormat, letter: idxToCol(i), idx: c.type === "formula" ? -1 : nfIdx(c.key) }));
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));

  const rowCount = rng.int(5) + 6; // 6~10
  const start = rng.int(dataset.rows.length - rowCount + 1);
  const rows = dataset.rows.slice(start, start + rowCount);

  const gcol = columns.find((c) => c.groupable);
  const groups = [];
  if (gcol) {
    let cur = null, s = 0;
    rows.forEach((r, i) => { const v = r[gcol.idx]; if (v !== cur) { if (cur !== null) groups.push({ value: cur, startRow: 4 + s, endRow: 4 + i - 1, colLetter: gcol.letter }); cur = v; s = i; } });
    groups.push({ value: cur, startRow: 4 + s, endRow: 4 + rows.length - 1, colLetter: gcol.letter });
  }

  const used = new Set();
  const ctx = {
    dataset, columns, rows, rowCount, dataStart: 4, dataEnd: 3 + rowCount,
    last: idxToCol(dataset.columns.length - 1),
    groups, groupableKey: gcol?.key ?? null, used,
    colOf: (key) => colByKey[key].letter,
    idxOf: (key) => colByKey[key].idx,
    textCols: () => columns.filter((c) => c.type === "text"),
    dataCols: () => columns.filter((c) => c.type !== "formula"),
  };
  return ctx;
}

export function assembleBasic2(seed, constraints = {}) {
  const rng = makeRng(seed);

  // 데이터 세트 선택 (constraints.numFmt 에 date 가 있으면 date 열 세트만)
  let pool = DATASETS;
  if (constraints.numFmt?.includes("date")) pool = DATASETS.filter((d) => d.columns.some((c) => c.type === "date"));
  const dataset = rng.pick(pool);

  const ctx = buildContext(rng, dataset);

  // ① 제목 (필수) · ② 머리글 · ③ 표시형식 · ④ 맞춤/이름/메모 · ⑤ 테두리
  const title = pickTitle(rng, ctx);
  const header = pickHeader(rng, ctx);
  (header.usedCols || []).forEach((k) => ctx.used.add(k));

  // ③④ 순서 30% 교체
  const swap = rng.chance(0.3);
  const slots = [];
  const runNumFmt = () => { const s = pickNumFmt(rng, ctx); (s.usedCols || []).forEach((k) => ctx.used.add(k)); return s; };
  const runMisc = () => { const s = pickMisc(rng, ctx); (s.usedCols || []).forEach((k) => ctx.used.add(k)); return s; };
  const a = swap ? runMisc() : runNumFmt();
  const b = swap ? runNumFmt() : runMisc();
  const numFmt = swap ? b : a;
  const misc = swap ? a : b;
  const border = pickBorder(rng, ctx);

  // 표시 순서: ① ② (③④ 또는 ④③) ⑤
  const ordered = [title, header, a, b, border];
  const items = ordered.map((s, i) => ({ no: i + 1, points: 2, text: s.text, checks: s.checks }));

  const difficulty = (title.meta.slotCount >= 4 || misc.meta.bundle >= 2) ? "중" : "하";

  const table = {
    titleCell: "A1",
    title: dataset.title,
    headerRow: 3,
    headers: dataset.columns.map((c) => c.key),
    rows: ctx.rows,
    columns: dataset.columns,
    colWidths: dataset.colWidths,
  };

  return {
    id: "basic2-" + seed,
    section: "기본2",
    subtype: "format",
    difficulty,
    grade: "2급",
    sheetName: "기본작업-2",
    title: dataset.title,
    table,
    intro: "'기본작업-2' 시트에 대하여 다음의 지시사항을 처리하시오. (각 2점)",
    items,
    _meta: { seed, dataset: dataset.id, swap, title: title.meta, header: header.meta, numFmt: numFmt.meta, misc: misc.meta, border: border.meta },
  };
}
