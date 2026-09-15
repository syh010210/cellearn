// scripts/test-basic2-assembler.mjs — 기본작업-2 조립기 테스트(난이도 2단계). 실행: npm run test:assembler
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import { assembleBasic2 } from "../src/utils/basic2Assembler.js";
import { buildExamWorkbook, buildBasic2Sheet } from "../src/utils/examBuilder.js";
import { parseWorkbookStyles, expandRange, idxToCol, parseRef } from "../src/utils/xlsxStyles.js";
import { gradeBasic2 } from "../src/utils/basic2Grader.js";
import { isDateCode } from "../src/utils/numFmtRender.js";
import { TARGET_BASIC, TARGET_HARD } from "../src/data/exam/basic2/numFmtCatalog.js";

// 지시 종류 라벨 (한 문제 안 중복 금지 대상).
const DEDUP_KINDS = new Set(["가로가운데", "균등분할", "들여쓰기", "병합", "셀스타일", "채우기색", "이름정의", "메모", "쉼표스타일", "선택하여붙여넣기", "텍스트형식", "특수문자", "대각선", "표시형식(숫자)", "표시형식(날짜)"]);
function kindLabels(item) {
  const s = new Set();
  for (const c of item.checks) {
    if (c.kind === "alignment") {
      if (c.merge) continue;
      if (c.horizontal === "center") s.add("가로가운데");
      else if (c.horizontal === "distributed") s.add("균등분할");
      else if (c.indent != null) s.add("들여쓰기");
    } else if (c.kind === "merge") s.add("병합");
    else if (c.kind === "cellStyle") s.add(c.builtinId === 3 ? "쉼표스타일" : "셀스타일");
    else if (c.kind === "fill") s.add("채우기색");
    else if (c.kind === "definedName") s.add("이름정의");
    else if (c.kind === "comment") s.add("메모");
    else if (c.kind === "values") s.add("선택하여붙여넣기");
    else if (c.kind === "value") s.add("특수문자");
    else if (c.kind === "border" && c.diagonal) s.add("대각선");
    else if (c.kind === "numFmt") { const code = c.codes[0]; if (code === "@") s.add("텍스트형식"); else s.add(isDateCode(code) ? "표시형식(날짜)" : "표시형식(숫자)"); }
    else if (c.kind === "shortDate") s.add("표시형식(날짜)");
  }
  return s;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
let pass = 0, fail = 0; const fails = [];
const check = (name, cond, detail = "") => { if (cond) pass++; else { fail++; fails.push(`✗ ${name}  ${detail}`); } };
const box = (range) => { const [a, b] = String(range).split(":"); const p = parseRef(a), q = parseRef(b || a); return { r1: Math.min(p.row, q.row), r2: Math.max(p.row, q.row), c1: Math.min(p.col, q.col), c2: Math.max(p.col, q.col) }; };
const clean = (inst) => { const { _meta, ...rest } = inst; return rest; };

// ─────────── 1. 픽스처 드리프트 (basic) ───────────
const fxPath = join(ROOT, "src/data/exam/basic2-fixture-01.json");
const fx = clean(assembleBasic2("fixture-01", { difficulty: "basic" }));
if (!existsSync(fxPath)) { writeFileSync(fxPath, JSON.stringify(fx, null, 2) + "\n", "utf8"); console.log("· fixture-01 생성(최초):", fxPath); }
else { const saved = JSON.parse(readFileSync(fxPath, "utf8")); check("fixture-01 드리프트 없음", JSON.stringify(saved) === JSON.stringify(fx), "저장본과 다름 → 조립기 출력이 바뀜"); }

// ─────────── 공용 인스턴스 검증(불변식) ───────────
function validate(seed, inst, tier) {
  const cols = inst.table.columns.length, maxRow = 3 + inst.table.rows.length;
  try { buildExamWorkbook([inst]); } catch (e) { check(`${seed} 워크북 생성`, false, String(e)); return; }

  check(`${seed} 항목 5개`, inst.items.length === 5, `len=${inst.items.length}`);
  const kindsOf = (it) => it.checks.map((c) => c.kind);
  check(`${seed} ① alignment 존재`, kindsOf(inst.items[0]).includes("alignment"));
  check(`${seed} ⑤ border 존재`, kindsOf(inst.items[4]).includes("border"));
  check(`${seed} 표시형식 존재`, inst.items.some((it) => it.checks.some((c) => (c.kind === "numFmt" && c.codes[0] !== "@") || c.kind === "shortDate")));

  // 난이도 구성 규칙
  if (tier === "basic") {
    check(`${seed} basic 난이도 라벨`, inst.difficulty === "기본", inst.difficulty);
    check(`${seed} basic hard 전용 0`, inst._meta.otherHard === 0 && inst._meta.numFmt.hardUsed === false, `otherHard=${inst._meta.otherHard} ③hard=${inst._meta.numFmt.hardUsed}`);
  } else {
    check(`${seed} hard 난이도 라벨`, inst.difficulty === "어려움", inst.difficulty);
    check(`${seed} hard ③ hard 풀`, inst._meta.numFmt.hardUsed === true);
    check(`${seed} hard ①②④⑤ 중 hard ≥1`, inst._meta.otherHard >= 1, `otherHard=${inst._meta.otherHard}`);
  }

  for (const it of inst.items) for (const chk of it.checks) {
    const ranges = [];
    if (chk.range) ranges.push(chk.range);
    if (chk.cell) ranges.push(chk.cell);
    if (chk.edges) chk.edges.forEach((e) => ranges.push(e.range));
    for (const rg of ranges) { const b = box(rg); if (b.c1 < 0 || b.c2 > cols - 1 || b.r1 < 1 || b.r2 > maxRow) check(`${seed} range 범위내 ${rg}`, false, `cols=${cols} maxRow=${maxRow}`); }
  }
  for (const it of inst.items) { const t = it.text || ""; if (/undefined|NaN|\[object/.test(t)) check(`${seed} 텍스트 결함`, false, t); }

  // 종류 중복 0건
  const kindCount = {};
  for (const it of inst.items) for (const k of kindLabels(it)) if (DEDUP_KINDS.has(k)) kindCount[k] = (kindCount[k] || 0) + 1;
  const dupKind = Object.entries(kindCount).filter(([, n]) => n > 1);
  if (dupKind.length) check(`${seed} 종류 중복 없음`, false, JSON.stringify(dupKind));

  // 범위(열) 항목간 겹침 0건
  const colItem = {}; let colOverlap = false;
  inst.items.forEach((it, ii) => {
    const cset = new Set();
    for (const c of it.checks) {
      const rg = c.range || c.cell; if (!rg) continue; const b = box(rg); if (b.r1 < 4) continue;
      if (c.kind === "border" && !c.diagonal) continue;
      if (c.kind === "alignment" && c.merge) continue;
      for (let cc = b.c1; cc <= b.c2; cc++) cset.add(cc);
    }
    for (const cc of cset) { if (colItem[cc] !== undefined && colItem[cc] !== ii) colOverlap = true; colItem[cc] = ii; }
  });
  if (colOverlap) check(`${seed} 범위(열) 항목간 겹침 없음`, false, JSON.stringify(colItem));

  const nfCols = inst.table.columns.filter((c) => c.type !== "formula");
  const nfIndexOfLetter = (fullC) => { const key = inst.table.columns[fullC]?.key; return nfCols.findIndex((c) => c.key === key); };
  const gcolIdx = nfCols.findIndex((c) => c.groupable);
  if (gcolIdx >= 0) {
    const hasNull = inst.table.rows.some((r) => r[gcolIdx] == null);
    if (inst._meta.header.mode === "merge") check(`${seed} 병합=groupable 첫행만 값`, hasNull);
    else check(`${seed} 비병합=groupable 전부 값`, !hasNull);
  }
  if (inst._meta.border.diagonal) {
    const dchk = inst.items[4].checks.find((c) => c.kind === "border" && c.diagonal);
    const b = box(dchk.range); const nfi = nfIndexOfLetter(b.c1);
    check(`${seed} 대각선 셀 비어있음 ${dchk.range}`, inst.table.rows[b.r1 - 4]?.[nfi] == null, `v=${inst.table.rows[b.r1 - 4]?.[nfi]}`);
  }
  // 이름 겹침 금지
  {
    const nameCols = nfCols.map((c, j) => ({ c, j })).filter(({ c }) => c.type === "text" && c.pool && !c.groupable && !c.repeatable);
    const poolMap = new Map();
    for (const e of nameCols) { if (!poolMap.has(e.c.pool)) poolMap.set(e.c.pool, []); poolMap.get(e.c.pool).push(e); }
    for (const group of poolMap.values()) {
      const seen = new Set(); let bad = false, why = "";
      for (const { c, j } of group) {
        const vals = inst.table.rows.map((r) => r[j]).filter((v) => v != null);
        if (new Set(vals).size !== vals.length) { bad = true; why = `${c.key} 열내중복`; }
        for (const v of vals) { if (seen.has(v)) { bad = true; why = `${c.key}:${v} 열간겹침`; } seen.add(v); }
      }
      if (bad) check(`${seed} 이름 겹침 없음`, false, why);
    }
  }
  // rangeByGroup 준수
  {
    const gj2 = nfCols.findIndex((c) => c.groupable); let curG = null;
    for (let r = 0; r < inst.table.rows.length; r++) {
      const gv = inst.table.rows[r][gj2]; if (gv != null) curG = gv;
      for (let j = 0; j < nfCols.length; j++) {
        const c = nfCols[j]; if (!c.rangeByGroup || curG == null) continue;
        const spec = c.rangeByGroup[curG]; const v = inst.table.rows[r][j];
        if (v == null || !spec) continue;
        if (!(v >= spec.min && v <= spec.max)) check(`${seed} ${c.key} rangeByGroup 준수`, false, `g=${curG} v=${v}`);
      }
    }
  }
  // 열 간 종속: maxOfColumn · derivedFrom · scaleFrom
  {
    const keyIdx = {}; nfCols.forEach((c, j) => { keyIdx[c.key] = j; });
    for (let r = 0; r < inst.table.rows.length; r++) {
      const rowObj = {}; nfCols.forEach((c, j) => { rowObj[c.key] = inst.table.rows[r][j]; });
      nfCols.forEach((c, j) => {
        const v = inst.table.rows[r][j];
        if (c.maxOfColumn && v != null) { const ref = inst.table.rows[r][keyIdx[c.maxOfColumn]]; check(`${seed} ${c.key} ≤ ${c.maxOfColumn}`, v <= ref, `${v} > ${ref}`); }
        if (c.derivedFrom && v != null) { const calc = c.derivedFrom(rowObj); check(`${seed} ${c.key} derivedFrom`, v === calc, `v=${v} calc=${calc}`); }
        if (c.type === "money" && c.scaleFrom && v != null) { const base = inst.table.rows[r][keyIdx[c.scaleFrom.col]]; const { minPct, maxPct, unit } = c.scaleFrom; const lo = (base * minPct) / 100 - unit, hi = (base * maxPct) / 100 + unit; check(`${seed} ${c.key} scaleFrom`, v >= lo && v <= hi, `v=${v} base=${base}`); }
      });
    }
  }
  // 단위 접미 일치 (count numFmt 코드 끝 리터럴 == unit)
  for (const it of inst.items) for (const c of it.checks) {
    if (c.kind !== "numFmt") continue; const code = c.codes[0]; if (isDateCode(code) || code === "@") continue;
    const fullCol = box(c.range).c1; const col = inst.table.columns[fullCol];
    if (col.type !== "count") continue;
    const mm = code.match(/"([^"]+)"$/);
    check(`${seed} 단위 접미 일치`, !!(mm && mm[1] === col.unit), `code=${code} unit=${col.unit}`);
  }
}

// 분포/커버리지 수집
const bump = (m, k) => { if (k != null) m[k] = (m[k] || 0) + 1; };
const cov = { fam: new Set(), titleHard: new Set(), header: new Set(), misc: new Set(), border: new Set(), weekday: new Set() };
function collect(dist, inst) {
  const m = inst._meta;
  bump(dist.dataset, m.dataset);
  bump(dist.titleAlign, m.title.align);
  bump(dist.header, m.header.mode);
  bump(dist.border, m.border.mode);
  bump(dist.difficulty, inst.difficulty);
  bump(dist.num, m.numFmt.unit);
  // 표시형식 출제 비율 실측(패밀리 먼저 뽑으므로 목표와 바로 비교)
  dist.act[m.numFmt.unit] = (dist.act[m.numFmt.unit] || 0) + 1;
  // 커버리지
  cov.fam.add(m.numFmt.numItem); cov.fam.add(m.numFmt.dateItem);
  if (m.title.hardFeat) cov.titleHard.add(m.title.hardFeat);
  cov.header.add(m.header.mode); if (m.header.mode === "cellStyle") cov.header.add(m.header.tier === "hard" ? "accent-hard" : "accent-basic");
  if (m.misc.align) cov.misc.add("align:" + m.misc.align);
  for (const t of ["name", "name2", "comma", "memo", "attext"]) if (m.misc[t]) cov.misc.add(t);
  if (m.misc.paste) cov.misc.add(m.misc.add ? "paste-add" : "paste-mul");
  cov.border.add(m.border.mode); if (m.border.diagonal) cov.border.add("diagonal");
  for (const it of inst.items) for (const c of it.checks) if (c.kind === "numFmt") { const mm = String(c.codes[0]).match(/\((aaaa|aaa|dddd|ddd)\)/); if (mm) cov.weekday.add(mm[1]); }
}

// ─────────── 2. basic·hard 각 200시드 ───────────
const N = 200, RATIO_N = 1200, SELF_N = 120;
// 불변식 검증: 각 200시드
for (const tier of ["basic", "hard"]) {
  for (let i = 0; i < N; i++) validate(`${tier}-${String(i).padStart(3, "0")}`, assembleBasic2(`${tier}-${String(i).padStart(3, "0")}`, { difficulty: tier }), tier);
}
// 비율·커버리지·분포: 노이즈를 줄이려 큰 시드수(조립만, 파싱 없음)
const mkDist = () => ({ dataset: {}, header: {}, num: {}, titleAlign: {}, border: {}, difficulty: {}, act: {} });
const distB = mkDist(), distH = mkDist();
for (const [tier, dist] of [["basic", distB], ["hard", distH]]) {
  for (let i = 0; i < RATIO_N; i++) collect(dist, assembleBasic2(`${tier}-${String(i).padStart(4, "0")}`, { difficulty: tier }));
}

// 같은 데이터셋 완전 중복 0건 (basic)
{
  const byDs = {};
  for (let i = 0; i < N; i++) { const inst = assembleBasic2(`basic-${String(i).padStart(3, "0")}`, { difficulty: "basic" }); const key = JSON.stringify([inst.title, inst.table.rows]); (byDs[inst._meta.dataset] ||= new Map()); byDs[inst._meta.dataset].set(key, (byDs[inst._meta.dataset].get(key) || 0) + 1); }
  let dup = 0; for (const ds of Object.values(byDs)) for (const n of ds.values()) if (n > 1) dup += n - 1;
  check("같은 데이터셋 제목·값 완전 중복 0건", dup === 0, `중복 ${dup}`);
}

// ─────────── 3. 커버리지: 신규 패밀리·슬롯 전부 등장 ───────────
const NUM_FAMS = ["suffix", "thousand-suffix", "thousand-decimal", "decimal-suffix", "percent-int", "percent-decimal", "text-suffix", "text-percent", "prefix-suffix", "prefix-digits", "trunc-thousand", "trunc-million"];
const DATE_FAMS = ["date-y-mmdd", "date-y-md", "date-mmdd", "date-md", "date-short", "date-mmdd-w", "date-md-w", "date-slash-md-w", "date-slash-mmdd-w", "date-iso-w", "date-yyslash-w"];
for (const f of [...NUM_FAMS, ...DATE_FAMS]) check(`패밀리 등장: ${f}`, cov.fam.has(f));
for (const f of ["boldItalic", "acct", "slot4", "special", "hanja"]) check(`①hard 슬롯 등장: ${f}`, cov.titleHard.has(f));
for (const f of ["cellStyle", "fill", "alignOnly", "merge", "accent-basic", "accent-hard"]) check(`②슬롯 등장: ${f}`, cov.header.has(f));
for (const f of ["align:h", "align:dist", "align:indent", "name", "name2", "comma", "memo", "paste-mul", "paste-add", "attext"]) check(`④슬롯 등장: ${f}`, cov.misc.has(f));
for (const f of ["headerDouble", "outer", "all3", "diagonal"]) check(`⑤슬롯 등장: ${f}`, cov.border.has(f));
for (const f of ["aaa", "aaaa", "ddd", "dddd"]) check(`요일 토큰 등장: ${f}`, cov.weekday.has(f));

// 데이터셋 14종 basic·hard 모두 등장
const DSN = ["sales-quarter", "member-grade", "book-instock", "reserve-room", "staff-salary", "course-enroll", "car-rental", "hospital-visit", "book-loan", "show-ticket", "branch-sales", "student-score", "delivery-status", "gym-member"];
for (const d of DSN) { check(`basic 데이터셋 등장: ${d}`, (distB.dataset[d] || 0) > 0); check(`hard 데이터셋 등장: ${d}`, (distH.dataset[d] || 0) > 0); }

// ─────────── 4. 정답 자기검증 (양 난이도) ───────────
const EXCLUDE = new Set(["cellStyle", "comment", "definedName", "merge"]);
const reduce = (inst) => ({ ...inst, items: inst.items.map((it) => ({ ...it, checks: it.checks.filter((c) => !EXCLUDE.has(c.kind)).map((c) => { if (c.kind === "font") { const { underline, ...r } = c; return r; } if (c.kind === "border") { const { diagonalUp, diagonalDown, ...r } = c; return r; } return c; }) })) });

function writeAnswer(inst) {
  const ws = buildBasic2Sheet(inst);
  const ensure = (a) => { if (!ws[a]) ws[a] = { t: "s", v: "" }; else if (ws[a].t === "z") { ws[a].t = "s"; ws[a].v = ""; } return ws[a]; };
  const mS = (a, patch) => { const c = ensure(a); c.s = { ...(c.s || {}) }; for (const k in patch) { if (k === "alignment" || k === "font" || k === "border") c.s[k] = { ...(c.s[k] || {}), ...patch[k] }; else c.s[k] = patch[k]; } };
  const merges = ws["!merges"] || (ws["!merges"] = []);
  const thin = { style: "thin" }, med = { style: "medium" }, dbl = { style: "double" };
  const border = (chk) => {
    const b = box(chk.range);
    if (chk.inner) for (let r = b.r1; r <= b.r2; r++) for (let c = b.c1; c <= b.c2; c++) mS(idxToCol(c) + r, { border: { top: { ...thin }, bottom: { ...thin }, left: { ...thin }, right: { ...thin } } });
    if (chk.outer) { for (let c = b.c1; c <= b.c2; c++) { mS(idxToCol(c) + b.r1, { border: { top: { ...med } } }); mS(idxToCol(c) + b.r2, { border: { bottom: { ...med } } }); } for (let r = b.r1; r <= b.r2; r++) { mS(idxToCol(b.c1) + r, { border: { left: { ...med } } }); mS(idxToCol(b.c2) + r, { border: { right: { ...med } } }); } }
    for (const e of chk.edges || []) { const eb = box(e.range); const st = e.style === "double" ? dbl : e.style === "medium" ? med : thin; if (e.side === "bottom") for (let c = eb.c1; c <= eb.c2; c++) mS(idxToCol(c) + eb.r2, { border: { bottom: { ...st } } }); }
    if (chk.diagonal) for (const a of expandRange(chk.range)) mS(a, { border: { diagonal: { style: chk.diagonal } } });
  };
  for (const it of inst.items) for (const chk of it.checks) {
    if (chk.kind === "alignment") { const al = {}; for (const k of ["horizontal", "vertical", "wrapText", "indent"]) if (chk[k] !== undefined) al[k] = chk[k]; for (const a of expandRange(chk.range)) mS(a, { alignment: al }); if (chk.merge) { const b = box(chk.range); merges.push({ s: { r: b.r1 - 1, c: b.c1 }, e: { r: b.r2 - 1, c: b.c2 } }); } }
    else if (chk.kind === "font") { const f = {}; if (chk.name) f.name = chk.name; if (chk.size) f.sz = chk.size; if (chk.bold) f.bold = true; if (chk.italic) f.italic = true; if (chk.underline) f.underline = chk.underline; for (const a of expandRange(chk.range)) mS(a, { font: f }); }
    else if (chk.kind === "fontColor") { for (const a of expandRange(chk.range)) mS(a, { font: { color: { rgb: chk.rgb } } }); }
    else if (chk.kind === "fill") { for (const a of expandRange(chk.range)) mS(a, { fill: { patternType: "solid", fgColor: { rgb: chk.rgb } } }); }
    else if (chk.kind === "rowHeight") { ws["!rows"] = ws["!rows"] || []; ws["!rows"][chk.row - 1] = { hpt: chk.height }; }
    else if (chk.kind === "numFmt") { const code = chk.codes && chk.codes[0]; for (const a of expandRange(chk.range)) { ensure(a); ws[a].z = code; } }
    else if (chk.kind === "shortDate") { for (const a of expandRange(chk.range)) { ensure(a); ws[a].z = 14; } } // '간단한 날짜' = 내장 14
    else if (chk.kind === "border") border(chk);
    else if (chk.kind === "value") { const c = ensure(chk.cell); c.t = "s"; c.v = chk.equals; }
    else if (chk.kind === "values") { const cells = expandRange(chk.range); (chk.expected || []).forEach((v, i) => { if (v !== undefined && cells[i]) { const c = ensure(cells[i]); c.t = "n"; c.v = v; } }); }
  }
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, inst.sheetName);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

let selfOk = 0, selfTot = 0;
for (const tier of ["basic", "hard"]) {
  for (let i = 0; i < SELF_N; i++) {
    const seed = `${tier}-${String(i).padStart(3, "0")}`;
    const inst = assembleBasic2(seed, { difficulty: tier });
    const styles = await parseWorkbookStyles(writeAnswer(inst));
    const g = gradeBasic2(styles, reduce(inst));
    selfTot++;
    if (g.items.every((it) => it.ok)) selfOk++;
    else if (fails.length < 40) fails.push(`✗ 자기검증 ${seed}: ${g.items.filter((it) => !it.ok).map((it) => `#${it.no}[${it.reasons.join(" / ")}]`).join(" ")}`);
  }
}
check(`정답 자기검증 ${selfOk}/${selfTot}`, selfOk === selfTot);

// ─────────── 표시형식 출제 비율: 목표 vs 기대(후보재정규화) vs 실측 ───────────
// 검증: 실측이 '기대'(열 사정 반영)와 ±5%p 이내여야 통과(=조립기가 비율·재정규화를 바르게 구현).
// 보고: 목표(nominal)와 나란히. 목표에 못 미치면 열 부족 사유로 표시.
function ratioReport(tier, dist, targets) {
  console.log(`\n=== ③ 표시형식 출제 비율 [${tier}] (${RATIO_N} 시드, %) — 목표 vs 실측 ===`);
  console.log("패밀리".padEnd(20) + "목표".padStart(7) + "실측".padStart(7) + "  판정");
  for (const id of Object.keys(targets)) {
    const target = targets[id];
    const actual = (dist.act[id] || 0) / RATIO_N * 100;
    const ok = Math.abs(actual - target) <= 5;
    check(`[${tier}] 비율 ${id} 실측≈목표(±5%p)`, ok, `목표 ${target.toFixed(1)} 실측 ${actual.toFixed(1)}`);
    console.log(id.padEnd(20) + target.toFixed(1).padStart(7) + actual.toFixed(1).padStart(7) + "  " + (ok ? "±5%p" : "★목표초과"));
  }
}
ratioReport("basic", distB, TARGET_BASIC);
ratioReport("hard", distH, TARGET_HARD);

// ─────────── 분포 표 ───────────
const show = (m) => Object.entries(m).sort().map(([k, v]) => `${k}:${v}`).join("  ");
for (const [tier, dist] of [["basic", distB], ["hard", distH]]) {
  console.log(`\n=== 분포 [${tier}] (${RATIO_N} 시드) ===`);
  console.log("데이터셋   ", show(dist.dataset));
  console.log("①정렬      ", show(dist.titleAlign));
  console.log("②머리글    ", show(dist.header));
  console.log("⑤테두리    ", show(dist.border));
}
console.log("\n자기검증   ", `${selfOk}/${selfTot} (제외: cellStyle·comment·definedName·merge그룹·font.underline·대각선방향)`);

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fails.length) console.log(fails.slice(0, 40).join("\n"));
process.exit(fail ? 1 : 0);
