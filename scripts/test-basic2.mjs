// scripts/test-basic2.mjs
// 기본작업-2 채점기 테스트. 실행: npm run test:basic2
//
// 1단계: xlsxStyles.js 파서 self-check (정답A/정답B를 파싱해 실측 항목과 일치하는지).
// (2·3단계는 이후 추가)

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import JSZip from "jszip";
import XLSX from "xlsx-js-style";
import { parseWorkbookStyles } from "../src/utils/xlsxStyles.js";
import { gradeBasic2 } from "../src/utils/basic2Grader.js";
import { renderEqual } from "../src/utils/numFmtRender.js";
import { buildExamWorkbook, buildBasic2Sheet } from "../src/utils/examBuilder.js";
import { gradeExamBuffer } from "../src/utils/examGrader.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIR = join(ROOT, "trial_test", "roundtrip");
const SHEET = "기본작업-2";

// numFmt 정규화(코드 비교용): 소문자 · 백슬래시 이스케이프 해제 · 따옴표 제거 · 공백 제거
const normNumFmt = (code) => String(code ?? "").toLowerCase().replace(/\\(.)/g, "$1").replace(/"/g, "").replace(/\s/g, "");
// ref 정규화: 시트 접두사(…!) 제거 · $ 제거 · 따옴표/공백 제거 · 대문자
const normRef = (r) => String(r ?? "").replace(/^.*!/, "").toUpperCase().replace(/[$'"\s]/g, "");

let pass = 0, fail = 0;
const results = [];
function check(name, cond, detail = "") {
  if (cond) { pass++; results.push(`  ✓ ${name}`); }
  else { fail++; results.push(`  ✗ ${name}  ${detail}`); }
}

const load = async (file) => parseWorkbookStyles(readFileSync(join(DIR, file)));

// ─────────────────── 1단계: 파서 self-check ───────────────────
const A = await load("정답A.xlsx");
const shA = A.sheets[SHEET];

// 파서 출력 샘플 (A1·A3·D4·F4)
console.log("=== 1단계: 파서 출력 샘플 (정답A) ===");
for (const addr of ["A1", "A3", "D4", "F4"]) {
  console.log(`--- ${addr} ---`);
  console.log(JSON.stringify(shA.cells[addr], null, 1));
}
console.log("--- comments[F4] ---", JSON.stringify(shA.comments["F4"]));
console.log("--- rows[1] ---", JSON.stringify(shA.rows["1"]));
console.log("--- merges ---", JSON.stringify(shA.merges));
console.log("--- definedNames ---", JSON.stringify(A.definedNames));
console.log("--- cellStyles ---", JSON.stringify(A.cellStyles));

console.log("\n=== 1단계: self-check (정답A = 정답A.dump.md 실측 대조) ===");
// ① 글꼴
const f1 = shA.cells["A1"].font;
check("A1 글꼴 이름 HY헤드라인M", f1?.name === "HY헤드라인M", `실제=${f1?.name}`);
check("A1 크기 16", f1?.size === 16, `실제=${f1?.size}`);
check("A1 굵게", f1?.bold === true, `실제=${f1?.bold}`);
check("A1 밑줄 double", f1?.underline === "double", `실제=${f1?.underline}`);
// ① 정렬 centerContinuous + 병합 없음
check("A1 centerContinuous", shA.cells["A1"].alignment?.horizontal === "centerContinuous", `실제=${shA.cells["A1"].alignment?.horizontal}`);
check("정답A 병합 없음", shA.merges.length === 0, `merges=${JSON.stringify(shA.merges)}`);
// ① 행 높이 30
check("1행 높이 30", shA.rows["1"]?.height === 30 && shA.rows["1"]?.customHeight === true, `실제=${JSON.stringify(shA.rows["1"])}`);
// ② 셀 스타일 강조색4 (builtinId 41)
check("A3 cellStyle builtinId 41", shA.cells["A3"].cellStyle?.builtinId === 41, `실제=${JSON.stringify(shA.cells["A3"].cellStyle)}`);
check("A3 cellStyle name 강조색4", (shA.cells["A3"].cellStyle?.name || "").replace(/\s/g, "") === "강조색4");
check("A3 fill theme 7 (보조 신호)", shA.cells["A3"].fill?.fgColor?.theme === 7, `실제=${JSON.stringify(shA.cells["A3"].fill)}`);
// ② 가로 가운데
check("A3 가로 center", shA.cells["A3"].alignment?.horizontal === "center", `실제=${shA.cells["A3"].alignment?.horizontal}`);
// ③ 표시 형식
check('D4 numFmt = #,##0"원"', normNumFmt(shA.cells["D4"].numFmt?.code) === normNumFmt('#,##0"원"'), `실제=${shA.cells["D4"].numFmt?.code}`);
check('E4 numFmt = mm"월" dd"일"(aaa)', normNumFmt(shA.cells["E4"].numFmt?.code) === normNumFmt('mm"월" dd"일"(aaa)'), `실제=${shA.cells["E4"].numFmt?.code}`);
// ④ 세로 가운데
check("B4 세로 center", shA.cells["B4"].alignment?.vertical === "center", `실제=${shA.cells["B4"].alignment?.vertical}`);
// ④ 이름 정의
const dn = A.definedNames.find((x) => x.name === "제품명");
check("이름정의 제품명 = $B$4:$B$10", dn && normRef(dn.ref) === "B4:B10", `실제=${dn?.ref} → ${normRef(dn?.ref)}`);
// ④ 메모
const cm = shA.comments["F4"];
check("F4 메모 텍스트 판매1위", (cm?.text || "").replace(/\s/g, "") === "판매1위", `실제=${cm?.text}`);
check("F4 메모 visible", cm?.visible === true, `실제=${cm?.visible}`);
check("F4 메모 autoSize", cm?.autoSize === true, `실제=${cm?.autoSize}`);
// ⑤ 테두리 (모서리)
check("A3 top medium", shA.cells["A3"].border?.top?.style === "medium", `실제=${shA.cells["A3"].border?.top?.style}`);
check("A3 left medium", shA.cells["A3"].border?.left?.style === "medium", `실제=${shA.cells["A3"].border?.left?.style}`);
check("A3 bottom double", shA.cells["A3"].border?.bottom?.style === "double", `실제=${shA.cells["A3"].border?.bottom?.style}`);
check("H10 right medium", shA.cells["H10"].border?.right?.style === "medium", `실제=${shA.cells["H10"].border?.right?.style}`);
check("H10 bottom medium", shA.cells["H10"].border?.bottom?.style === "medium", `실제=${shA.cells["H10"].border?.bottom?.style}`);

// 정답B: A1:H1 merge + center
const B = await load("정답B.xlsx");
const shB = B.sheets[SHEET];
check("정답B merges 에 A1:H1", shB.merges.map(normRef).includes("A1:H1"), `merges=${JSON.stringify(shB.merges)}`);
check("정답B A1 가로 center", shB.cells["A1"].alignment?.horizontal === "center", `실제=${shB.cells["A1"].alignment?.horizontal}`);

// ─────────────────── 2단계: gradeBasic2 채점 ───────────────────
// 문제 인스턴스는 src/data/exam/basic2-0001.json 에서 불러온다(리터럴 제거).
// item1 정렬 검사만 A(선택 영역의 가운데로, JSON 원본) / B(병합하고 가운데)로 바꾼다.
const PROBLEM = JSON.parse(readFileSync(join(ROOT, "src/data/exam/basic2-0001.json"), "utf8"));
const CENTER_CONTINUOUS = { kind: "alignment", range: "A1:H1", horizontal: "centerContinuous" };
const MERGE_CENTER = { kind: "alignment", range: "A1:H1", horizontal: "center", merge: true };
function makeProblem(item1Alignment) {
  const p = JSON.parse(JSON.stringify(PROBLEM));
  p.items[0].checks[0] = item1Alignment; // item1 의 첫 check(정렬)만 교체
  return p;
}

console.log("\n=== 2단계: gradeBasic2 채점 결과 ===");
const gradeA = gradeBasic2(A, makeProblem(CENTER_CONTINUOUS));
const gradeB = gradeBasic2(B, makeProblem(MERGE_CENTER));
console.log("정답A:", JSON.stringify({ earned: gradeA.earned, total: gradeA.total, items: gradeA.items.map((i) => ({ no: i.no, ok: i.ok, reasons: i.reasons })) }, null, 1));
console.log("정답B:", JSON.stringify({ earned: gradeB.earned, total: gradeB.total, items: gradeB.items.map((i) => ({ no: i.no, ok: i.ok, reasons: i.reasons })) }, null, 1));
check("정답A 5/5 (10점)", gradeA.earned === 10 && gradeA.total === 10, `earned=${gradeA.earned}`);
check("정답B 5/5 (10점)", gradeB.earned === 10 && gradeB.total === 10, `earned=${gradeB.earned}`);

// ─────────────────── 3단계: mutation 테스트 ───────────────────
// 정답A.xlsx 를 JSZip으로 열어 XML을 한 군데만 바꾼 변형을 메모리에서 만들고(디스크에 안 씀),
// 채점해서 "정확히 그 항목만" 오답이 되고 사유 문장이 기대와 같은지 확인한다.
// 안전 규칙: 기존 xf 인덱스를 고치지 않고, 새 font/border/xf 를 추가한 뒤 대상 셀의 s 만 바꾼다.
const baseBuf = readFileSync(join(DIR, "정답A.xlsx"));
const S = "xl/styles.xml", SH = "xl/worksheets/sheet1.xml", WB = "xl/workbook.xml", CM = "xl/comments1.xml", VML = "xl/drawings/vmlDrawing1.vml";

// 리스트(fonts/borders/cellXfs/numFmts)에 블록 추가 + 새 인덱스 반환 (count 증가, 다른 인덱스 불변)
function bumpList(xml, tag, block) {
  const count = Number(xml.match(new RegExp(`<${tag} count="(\\d+)"`))[1]);
  const xml2 = xml.replace(new RegExp(`(<${tag} count=")\\d+(")`), `$1${count + 1}$2`).replace(`</${tag}>`, block + `</${tag}>`);
  return { xml: xml2, index: count };
}
const setCellS = (xml, addr, s) => xml.replace(new RegExp(`(<c r="${addr}" )s="\\d+"`), `$1s="${s}"`);
const B1 = `<border><left style="thin"><color indexed="64"/></left><right style="thin"><color indexed="64"/></right><top style="thin"><color indexed="64"/></top><bottom style="thin"><color indexed="64"/></bottom><diagonal/></border>`;

// A1 폰트만 바꾼 새 xf 로 A1 재지정 (centerContinuous 유지)
async function reassignA1Font(ctx, fontBlock) {
  let st = await ctx.rd(S);
  let r = bumpList(st, "fonts", fontBlock); st = r.xml; const fid = r.index;
  r = bumpList(st, "cellXfs", `<xf numFmtId="0" fontId="${fid}" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="centerContinuous"/></xf>`); st = r.xml;
  ctx.wr(S, st);
  ctx.wr(SH, setCellS(await ctx.rd(SH), "A1", r.index));
}

const MUTATIONS = [
  { no: 1, item: 1, includes: ["이중 실선", "실선"], mutate: (c) => reassignA1Font(c, `<font><b/><u/><sz val="16"/><name val="HY헤드라인M"/><family val="1"/><charset val="129"/></font>`) },
  { no: 2, item: 1, includes: ["16", "14"], mutate: (c) => reassignA1Font(c, `<font><b/><u val="double"/><sz val="14"/><name val="HY헤드라인M"/><family val="1"/><charset val="129"/></font>`) },
  { no: 3, item: 1, includes: ["굵게"], mutate: (c) => reassignA1Font(c, `<font><u val="double"/><sz val="16"/><name val="HY헤드라인M"/><family val="1"/><charset val="129"/></font>`) },
  { no: 4, item: 1, includes: ["선택 영역의 가운데로"], mutate: async (c) => {
    let st = await c.rd(S); const r = bumpList(st, "cellXfs", `<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf>`); c.wr(S, r.xml);
    c.wr(SH, setCellS(await c.rd(SH), "A1", r.index));
  } },
  { no: 5, item: 1, includes: ["30", "27"], mutate: async (c) => { c.wr(SH, (await c.rd(SH)).replace(`ht="30"`, `ht="27"`)); } },
  { no: 6, item: 2, includes: ["강조색 4", "강조색 2"], mutate: async (c) => { c.wr(S, (await c.rd(S)).replace(`<cellStyle name="강조색4" xfId="1" builtinId="41"/>`, `<cellStyle name="강조색2" xfId="1" builtinId="33"/>`)); } },
  { no: 7, item: 2, includes: ["A3"], mutate: async (c) => {
    let st = await c.rd(S); const r = bumpList(st, "cellXfs", `<xf numFmtId="0" fontId="1" fillId="2" borderId="10" xfId="1" applyBorder="1"/>`); c.wr(S, r.xml);
    c.wr(SH, setCellS(await c.rd(SH), "A3", r.index));
  } },
  { no: 8, item: 3, includes: ["D4"], mutate: async (c) => {
    let st = await c.rd(S); const r = bumpList(st, "cellXfs", `<xf numFmtId="3" fontId="0" fillId="0" borderId="8" xfId="0" applyNumberFormat="1" applyBorder="1"/>`); c.wr(S, r.xml);
    c.wr(SH, setCellS(await c.rd(SH), "D4", r.index));
  } },
  { no: 9, item: 3, includes: ["D7"], mutate: async (c) => { c.wr(SH, setCellS(await c.rd(SH), "D7", 3)); } }, // xf3 = border1, numFmt 없음(General)
  { no: 10, item: 3, includes: ["E4"], mutate: async (c) => {
    let st = await c.rd(S); let r = bumpList(st, "numFmts", `<numFmt numFmtId="180" formatCode="yyyy-mm-dd"/>`); st = r.xml;
    r = bumpList(st, "cellXfs", `<xf numFmtId="180" fontId="0" fillId="0" borderId="8" xfId="0" applyNumberFormat="1" applyBorder="1"/>`); c.wr(S, r.xml);
    c.wr(SH, setCellS(await c.rd(SH), "E4", r.index));
  } },
  { no: 11, item: 4, includes: ["세로 맞춤"], mutate: async (c) => {
    let sh = await c.rd(SH); sh = setCellS(sh, "B4", 17); for (const r of [5, 6, 7, 8, 9]) sh = setCellS(sh, "B" + r, 3); sh = setCellS(sh, "B10", 11); c.wr(SH, sh);
  } }, // 17=border8, 3=border1, 11=border5 (모두 세로 가운데 없음, 테두리는 동일)
  { no: 12, item: 4, includes: ["제품명"], mutate: async (c) => { c.wr(WB, (await c.rd(WB)).replace(`<definedNames><definedName name="제품명">'기본작업-2'!$B$4:$B$10</definedName></definedNames>`, ``)); } },
  { no: 13, item: 4, includes: ["제품명", "$B$4:$B$9"], mutate: async (c) => { c.wr(WB, (await c.rd(WB)).replace(`'기본작업-2'!$B$4:$B$10`, `'기본작업-2'!$B$4:$B$9`)); } },
  { no: 14, item: 4, includes: ["판매1위"], mutate: async (c) => { c.wr(CM, (await c.rd(CM)).replace(`<t>1</t>`, `<t>2</t>`)); } },
  { no: 15, item: 4, includes: ["항상 표시"], mutate: async (c) => { c.wr(VML, (await c.rd(VML)).replace(`<x:Visible/>`, ``)); } },
  { no: 16, item: 5, includes: ["굵은 바깥쪽 테두리"], mutate: async (c) => {
    let st = await c.rd(S);
    let r = bumpList(st, "borders", `<border><left style="medium"><color indexed="64"/></left><right style="thin"><color indexed="64"/></right><top style="thin"><color indexed="64"/></top><bottom style="double"><color indexed="64"/></bottom><diagonal/></border>`); st = r.xml; const bid = r.index;
    r = bumpList(st, "cellXfs", `<xf numFmtId="0" fontId="1" fillId="2" borderId="${bid}" xfId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>`); c.wr(S, r.xml);
    c.wr(SH, setCellS(await c.rd(SH), "A3", r.index));
  } },
  { no: 17, item: 5, includes: ["아래쪽 이중 테두리"], mutate: async (c) => { c.wr(S, (await c.rd(S)).replaceAll(`<bottom style="double"><color indexed="64"/></bottom>`, `<bottom style="thin"><color indexed="64"/></bottom>`)); } },
  { no: 18, item: 5, includes: ["모든 테두리"], mutate: async (c) => {
    let st = await c.rd(S);
    let r = bumpList(st, "borders", `<border><left style="thin"><color indexed="64"/></left><right/><top style="thin"><color indexed="64"/></top><bottom style="thin"><color indexed="64"/></bottom><diagonal/></border>`); st = r.xml; const bC = r.index;
    r = bumpList(st, "cellXfs", `<xf numFmtId="0" fontId="0" fillId="0" borderId="${bC}" xfId="0" applyBorder="1"/>`); st = r.xml; const xC = r.index;
    r = bumpList(st, "borders", `<border><left/><right style="thin"><color indexed="64"/></right><top style="thin"><color indexed="64"/></top><bottom style="thin"><color indexed="64"/></bottom><diagonal/></border>`); st = r.xml; const bD = r.index;
    r = bumpList(st, "cellXfs", `<xf numFmtId="176" fontId="0" fillId="0" borderId="${bD}" xfId="0" applyNumberFormat="1" applyBorder="1"/>`); c.wr(S, r.xml); const xD = r.index;
    let sh = await c.rd(SH); sh = setCellS(sh, "C6", xC); sh = setCellS(sh, "D6", xD); c.wr(SH, sh);
  } },
  { no: 19, item: "sheet", includes: [], mutate: async (c) => { c.wr(WB, (await c.rd(WB)).replace(`name="기본작업-2"`, `name="Sheet1"`)); } },
  { no: 21, item: 5, includes: ["굵은 바깥쪽 테두리"], mutate: async (c) => { c.wr(S, (await c.rd(S)).replaceAll(`style="medium"`, `style="thin"`)); } },
];

async function runMutation(mut) {
  const zip = await JSZip.loadAsync(baseBuf);
  const ctx = { rd: (p) => zip.file(p).async("string"), wr: (p, cnt) => zip.file(p, cnt) };
  await mut.mutate(ctx);
  const out = await zip.generateAsync({ type: "nodebuffer" });
  const ws = await parseWorkbookStyles(out);
  return gradeBasic2(ws, makeProblem(CENTER_CONTINUOUS));
}

console.log("\n=== 3단계: mutation 테스트 ===");
console.log("| # | 변형 | 기대 | 결과 오답항목 | 사유 매칭 | 판정 |");
console.log("|---|---|---|---|---|---|");
for (const mut of MUTATIONS) {
  const res = await runMutation(mut);
  if (mut.item === "sheet") {
    const ok = res.sheetFound === false && res.earned === 0;
    check(`mut ${mut.no} (시트명 변경 → 0점)`, ok, `sheetFound=${res.sheetFound} earned=${res.earned}`);
    console.log(`| ${mut.no} | 시트 이름 변경 | 0/10 | sheetFound=${res.sheetFound} | - | ${ok ? "✓" : "✗"} |`);
    continue;
  }
  const target = res.items.find((i) => i.no === mut.item);
  const others = res.items.filter((i) => i.no !== mut.item);
  const onlyThis = !target.ok && others.every((i) => i.ok);
  const joined = target.reasons.join(" | ");
  const reasonOk = mut.includes.every((s) => joined.includes(s));
  const ok = onlyThis && reasonOk;
  check(`mut ${mut.no} (item ${mut.item}만 오답 + 사유)`, ok, `오답항목=${res.items.filter(i=>!i.ok).map(i=>i.no)} 사유="${joined}"`);
  console.log(`| ${mut.no} | ${mut.no}번 변형 | item${mut.item} | ${res.items.filter((i) => !i.ok).map((i) => i.no).join(",") || "없음"} | ${reasonOk ? "○" : "✗"} | ${ok ? "✓" : "✗"} |`);
}
// mut 20: 변형 없음 → 정답A·정답B 모두 5/5 (이미 2단계에서 확인, 표에 명시)
console.log(`| 20 | 변형 없음 | 5/5 | 정답A ${gradeA.earned}/10 · 정답B ${gradeB.earned}/10 | - | ${gradeA.earned === 10 && gradeB.earned === 10 ? "✓" : "✗"} |`);
check("mut 20 (변형 없음 → A·B 5/5)", gradeA.earned === 10 && gradeB.earned === 10, `A=${gradeA.earned} B=${gradeB.earned}`);

// ─────────────────── 4단계: 생성기 + 채점 연결 ───────────────────
console.log("\n=== 4단계: examBuilder 생성 + gradeExamBuffer 연결 ===");
// 1) buildBasic2Sheet 로 만든 워크북을 다시 읽어 "적용 서식 없음" + 날짜/수식 확인
const genWb = buildExamWorkbook([PROBLEM], "test-attempt");
const genBuf = XLSX.write(genWb, { type: "buffer", bookType: "xlsx" });
const genStyles = await parseWorkbookStyles(genBuf);
const gsh = genStyles.sheets[SHEET];
let genClean = true, genDetail = "";
for (const addr of Object.keys(gsh.cells)) {
  const c = gsh.cells[addr];
  const al = c.alignment;
  const badAlign = al && (al.horizontal || al.wrapText != null || al.indent != null || (al.vertical && al.vertical !== "center"));
  const applied = badAlign || !!c.fill?.fgColor || c.border?.top || c.border?.bottom || c.border?.left || c.border?.right || c.font?.bold || c.font?.underline != null;
  if (applied) { genClean = false; genDetail = `${addr}=${JSON.stringify({ al: c.alignment, fill: c.fill?.fgColor, b: c.border, bold: c.font?.bold, u: c.font?.underline })}`; break; }
}
check("생성 시트: 세로 가운데 외 서식 없음", genClean, genDetail);
check("생성 시트: A3 세로 가운데 기본", gsh.cells["A3"]?.alignment?.vertical === "center", `A3.align=${JSON.stringify(gsh.cells["A3"]?.alignment)}`);
check("생성 시트: A3 기본 글꼴 맑은 고딕 11", gsh.cells["A3"]?.font?.name === "맑은 고딕" && Number(gsh.cells["A3"]?.font?.size) === 11, `A3.font=${JSON.stringify(gsh.cells["A3"]?.font)}`);
// 빈 셀은 스텁(<c r=".." s=".."/> — 자식 <v> 없음)이어야 '선택 영역의 가운데로'가 펼쳐진다.
const genZip = await (await import("jszip")).default.loadAsync(genBuf);
const sheetXml = await genZip.file("xl/worksheets/sheet1.xml").async("string");
const cellXml = (r) => { const m = sheetXml.match(new RegExp(`<c r="${r}"[\\s\\S]*?(?:/>|</c>)`)); return m ? m[0] : null; };
const b1 = cellXml("B1"), c2 = cellXml("C2");
// xlsx-js-style 은 값 없는 셀을 스타일이 있어도 드롭한다 → B1/C2 는 부재(진짜 빈 셀). 어느 쪽이든 <v> 가 없어야 한다.
check("생성 B1 값 없음(스텁/부재)", !b1 || !/<v>/.test(b1), `B1=${b1}`);
check("생성 2행(C2) 값 없음(스텁/부재)", !c2 || !/<v>/.test(c2), `C2=${c2}`);
check("생성 시트: 행 customHeight 없음", Object.values(gsh.rows).every((r) => !r.customHeight), JSON.stringify(gsh.rows));
const e4Base = (PROBLEM.table.columns.find((c) => c.key === "입고일")?.baseFormat) || "yyyy-mm-dd";
check(`생성 시트: E4 날짜값 + numFmt ${e4Base}`, typeof gsh.cells["E4"]?.value === "number" && gsh.cells["E4"]?.numFmt?.code === e4Base, `E4=${JSON.stringify(gsh.cells["E4"]?.numFmt)} val=${gsh.cells["E4"]?.value}`);
check("생성 시트: G4 수식(D4*F4)", /D4\*F4/i.test(gsh.cells["G4"]?.formula || ""), `G4.formula=${gsh.cells["G4"]?.formula}`);
check("생성 워크북: _meta 숨김 시트 존재", genWb.SheetNames.includes("_meta") && genWb.Workbook.Sheets.find((s) => s.name === "_meta")?.Hidden === 1);

// 2) 정답A.xlsx 를 gradeExamBuffer(기본2 경로)로 채점 → 10/10
const examRes = await gradeExamBuffer(readFileSync(join(DIR, "정답A.xlsx")), [PROBLEM]);
check("gradeExamBuffer: 기본2 정답A 10/10", examRes[0]?.earned === 10 && examRes[0]?.correct === 5, `earned=${examRes[0]?.earned} correct=${examRes[0]?.correct}`);

// 3) 계산작업 문제로 파일 생성이 에러 없이 되는지
const calc = JSON.parse(readFileSync(join(ROOT, "src/data/exam/calc-ref-0001.json"), "utf8"));
let calcOk = true, calcErr = "";
try { const cw = buildExamWorkbook([calc]); calcOk = cw.SheetNames.includes(calc.sheetName) && cw.SheetNames.includes("_meta"); }
catch (e) { calcOk = false; calcErr = String(e); }
check("계산작업 문제로 워크북 생성 무에러", calcOk, calcErr);

// ─────────────────── 5단계: 새 check kind mutation ───────────────────
console.log("\n=== 5단계: 새 kind mutation (특수문자·채우기색·글꼴색·곱하기·대각선) ===");
async function gradeItem(setup, checks) {
  const ws = XLSX.utils.aoa_to_sheet([[""]]); ws["!ref"] = "A1:J12"; setup(ws);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, SHEET);
  const styles = await parseWorkbookStyles(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  return gradeBasic2(styles, { sheetName: SHEET, items: [{ no: 1, points: 2, checks }] }).items[0];
}
const rsn = (it) => it.reasons.join(" | ");
const VAL = { kind: "value", cell: "A1", equals: "♠ 상공물산 ♠", normalize: "spaces", label: "특수문자" };
let it;
it = await gradeItem((w) => { w.A1 = { t: "s", v: "♠ 상공물산 ♠" }; }, [VAL]);
check("value 특수문자 정답", it.ok, rsn(it));
it = await gradeItem((w) => { w.A1 = { t: "s", v: "상공물산" }; }, [VAL]);
check("value 특수문자 없음 오답", !it.ok && rsn(it).includes("특수문자"), rsn(it));
it = await gradeItem((w) => { w.A1 = { t: "s", v: "♣ 상공물산 ♣" }; }, [VAL]);
check("value 기호만 다름 오답", !it.ok, rsn(it));
it = await gradeItem((w) => { w.A3 = { t: "s", v: "h", s: { fill: { patternType: "solid", fgColor: { rgb: "FFFF00" } } } }; }, [{ kind: "fill", range: "A3", rgb: "FFFF00" }]);
check("fill 채우기색 정답", it.ok, rsn(it));
it = await gradeItem((w) => { w.A3 = { t: "s", v: "h", s: { fill: { patternType: "solid", fgColor: { rgb: "FF0000" } } } }; }, [{ kind: "fill", range: "A3", rgb: "FFFF00" }]);
check("fill 다른 색 오답", !it.ok && rsn(it).includes("채우기 색"), rsn(it));
it = await gradeItem((w) => { w.A1 = { t: "s", v: "t", s: { font: { color: { rgb: "0070C0" } } } }; }, [{ kind: "fontColor", range: "A1", rgb: "0070C0" }]);
check("fontColor 정답", it.ok, rsn(it));
it = await gradeItem((w) => { w.A1 = { t: "s", v: "t" }; }, [{ kind: "fontColor", range: "A1", rgb: "0070C0" }]);
check("fontColor 없음 오답", !it.ok && rsn(it).includes("글꼴 색"), rsn(it));
const setVals = (vals) => (w) => { ["F4", "F5", "F6"].forEach((a, i) => { w[a] = { t: "n", v: vals[i] }; }); };
it = await gradeItem(setVals([20, 40, 60]), [{ kind: "values", range: "F4:F6", expected: [20, 40, 60] }]);
check("values 곱하기 정답", it.ok, rsn(it));
it = await gradeItem(setVals([10, 20, 30]), [{ kind: "values", range: "F4:F6", expected: [20, 40, 60] }]);
check("values 배수 틀림 오답", !it.ok && rsn(it).includes("값"), rsn(it));
it = await gradeItem((w) => { w.A3 = { t: "s", v: "h", s: { border: { diagonal: { style: "thin" } } } }; }, [{ kind: "border", range: "A3", diagonal: "thin" }]);
check("border 대각선 정답(style)", it.ok, rsn(it));
it = await gradeItem((w) => { w.A3 = { t: "s", v: "h" }; }, [{ kind: "border", range: "A3", diagonal: "thin" }]);
check("border 대각선 없음 오답", !it.ok && rsn(it).includes("대각선"), rsn(it));
// 대각선 X(양방향) 방향 판정 — xlsx-js-style 은 방향을 못 쓰므로 파싱 객체를 직접 만들어 채점.
const fakeStyles = (diag) => ({ sheets: { [SHEET]: { cells: { H7: { border: { diagonal: diag } } }, rows: {}, cols: [], merges: [], comments: {} } }, definedNames: [], fonts: [{}] });
const diagChk = [{ kind: "border", range: "H7", diagonal: "thin", diagonalUp: true, diagonalDown: true }];
const gd = (diag) => gradeBasic2(fakeStyles(diag), { sheetName: SHEET, items: [{ no: 1, points: 2, checks: diagChk }] }).items[0];
check("대각선 X 양방향 정답", gd({ style: "thin", up: true, down: true }).ok);
{ const x = gd({ style: "thin", up: true, down: false }); check("대각선 한 방향 오답(X 아님)", !x.ok && rsn(x).includes("X 모양"), rsn(x)); }
{ const x = gd(null); check("대각선 없음 오답(직접)", !x.ok && rsn(x).includes("지정되지"), rsn(x)); }
// 쉼표 스타일: builtinId 3(쉼표)·6(쉼표 [0]) 둘 다 정답(accept:[3,6]).
const commaFake = (bid) => ({ sheets: { [SHEET]: { cells: Object.fromEntries(["E4", "E5", "E6"].map((a) => [a, { cellStyle: { builtinId: bid } }])), rows: {}, cols: [], merges: [], comments: {} } }, definedNames: [], fonts: [{}] });
const commaChk = [{ kind: "cellStyle", range: "E4:E6", builtinId: 3, accept: [3, 6] }];
const gc = (bid) => gradeBasic2(commaFake(bid), { sheetName: SHEET, items: [{ no: 1, points: 2, checks: commaChk }] }).items[0];
check("쉼표 스타일 builtinId 3 정답", gc(3).ok, rsn(gc(3)));
check("쉼표 [0] builtinId 6 정답", gc(6).ok, rsn(gc(6)));
{ const x = gc(41); check("다른 셀 스타일(강조색4) 오답", !x.ok && rsn(x).includes("셀 스타일"), rsn(x)); }

// 두 범위 이름 정의: XML 원문(시트 접두사 2개·콤마) → 파서 → 채점기 전체 경로
{
  const ws2 = XLSX.utils.aoa_to_sheet([["t"]]); const wb2 = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb2, ws2, SHEET);
  wb2.Workbook = { Names: [{ Name: "도서정보", Ref: "'기본작업-2'!$B$4:$B$12,'기본작업-2'!$C$4:$C$12" }] };
  const st = await parseWorkbookStyles(XLSX.write(wb2, { type: "buffer", bookType: "xlsx" }));
  check("두범위 파서 원문 보존", /\$B\$4:\$B\$12/.test(st.definedNames[0]?.ref) && /\$C\$4:\$C\$12/.test(st.definedNames[0]?.ref), st.definedNames[0]?.ref);
  const gdn = (ref) => gradeBasic2(st, { sheetName: SHEET, items: [{ no: 1, points: 2, checks: [{ kind: "definedName", name: "도서정보", ref }] }] }).items[0];
  check("두범위 이름 정의 정답(전체 경로)", gdn("$B$4:$B$12,$C$4:$C$12").ok, rsn(gdn("$B$4:$B$12,$C$4:$C$12")));
  check("두범위 순서 무관 정답", gdn("$C$4:$C$12,$B$4:$B$12").ok);
  { const x = gdn("$C$4:$C$12"); check("두범위 vs 한범위 오답", !x.ok && rsn(x).includes("참조"), rsn(x)); }
}

// ─────────────────── 6단계: 표시 형식 결과 채점 (동치/비동치) ───────────────────
console.log("\n=== 6단계: 표시 형식 결과 동치/비동치 ===");
const sN = [0, 6, 15, 1000, 128000, 1240000, 1850000]; // 숫자 샘플
const serial = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / 86400000) + 25569;
const sD = [serial(2026, 7, 5), serial(2026, 1, 7)]; // 날짜 샘플
// 동치 쌍(정답 처리) — renderEqual === true
const EQ = [
  ['0"명"', '#0"명"', sN], ['0"명"', '##0"명"', sN], ['0"개"', "0\\개", sN], ['"*"0"개"', '\\*0"개"', sN],
  ['#,##0"원"', "#,##0\\원", sN], ['0"%"', "0\\%", sN], ['#,##0,"천원"', '#,##0,"천원"', sN],
  ['0,"천원"', '#,##0,"천원"', [90000, 270000, 0]],
  ['mm"월" dd"일"(aaa)', 'mm"월"\\ dd"일"(aaa)', sD], ['mm"월" dd"일"(aaa)', 'mm"월"\\ dd"일"\\(aaa\\)', sD],
  ["m/d(aaa)", 'm"/"d(aaa)', sD], ["yy/mm(aaa)", 'yy"/"mm(aaa)', sD],
];
// 비동치 쌍(오답) — renderEqual === false
const NE = [
  ['#,##0"원"', '#,###"원"', sN], ['0"명"', '0"개"', sN], ["m/d(aaa)", "mm/dd(aaa)", sD],
  ['mm"월" dd"일"(aaa)', 'mm"월" dd"일"', sD], ['0"%"', "0%", sN], ['#,##0,"천원"', '#,##0"천원"', sN],
  ['0.00,,"백만"', '0.0,,"백만"', sN], ['"GP-"000', '"GP-"00', sN], ['#,##0"원"', '#,##0.0"원"', sN],
  ["yy/mm(aaa)", "yyyy/mm(aaa)", sD], ['0"명"', '#,##0"명"', [1000]],
  ['0,"천원"', '#,##0,"천원"', [90000, 1200000]],
];
EQ.forEach(([a, b, s], i) => check(`동치 ${i + 1}: ${a} ≡ ${b}`, renderEqual(a, b, s) === true, `= ${renderEqual(a, b, s)}`));
NE.forEach(([a, b, s], i) => check(`비동치 ${i + 1}: ${a} ≢ ${b}`, renderEqual(a, b, s) === false, `= ${renderEqual(a, b, s)}`));

// 요일 토큰 4종(aaa/aaaa/ddd/dddd) 각각 동치·비동치
const WEQ = [
  ['yyyy-mm-dd(aaa)', "yyyy-mm-dd\\(aaa\\)", sD],       // aaa: 괄호 리터럴 이스케이프 동치
  ['m"월" d"일"(aaaa)', 'm"월"\\ d"일"(aaaa)', sD],       // aaaa: 공백 이스케이프 동치
  ["m/d(ddd)", 'm"/"d(ddd)', sD],                        // ddd: 슬래시 리터럴 동치
  ["m/d(dddd)", 'm"/"d(dddd)', sD],                      // dddd: 슬래시 리터럴 동치
];
const WNE = [
  ["m/d(aaa)", "m/d(aaaa)", sD],   // 월 ≠ 월요일
  ["m/d(aaaa)", "m/d(ddd)", sD],   // 월요일 ≠ Mon
  ["m/d(ddd)", "m/d(dddd)", sD],   // Mon ≠ Monday
  ["m/d(dddd)", "m/d(aaa)", sD],   // Monday ≠ 월
];
WEQ.forEach(([a, b, s], i) => check(`요일 동치 ${i + 1}: ${a} ≡ ${b}`, renderEqual(a, b, s) === true, `= ${renderEqual(a, b, s)}`));
WNE.forEach(([a, b, s], i) => check(`요일 비동치 ${i + 1}: ${a} ≢ ${b}`, renderEqual(a, b, s) === false, `= ${renderEqual(a, b, s)}`));

// @ 텍스트 서식 동치·비동치 각 3쌍
const sT = ["김도현", "이순신", "90~100"];
const AEQ = [['@"점"', "@\\점", sT], ['@"%"', "@\\%", sT], ['@"점장"', '@"점""장"', sT]];
const ANE = [['@"점장"', '@"팀장"', sT], ['@"%"', '@"점"', sT], ['@"님"', "@", sT]];
AEQ.forEach(([a, b, s], i) => check(`@동치 ${i + 1}: ${a} ≡ ${b}`, renderEqual(a, b, s) === true, `= ${renderEqual(a, b, s)}`));
ANE.forEach(([a, b, s], i) => check(`@비동치 ${i + 1}: ${a} ≢ ${b}`, renderEqual(a, b, s) === false, `= ${renderEqual(a, b, s)}`));

// ─────────────────── 7단계: '간단한 날짜'(내장 번호 14) ───────────────────
console.log("\n=== 7단계: 간단한 날짜(내장 14) ===");
{
  // (a) 파싱 객체 직접 채점: id 14 또는 변환 코드 인정, 사용자 지정 yyyy-mm-dd·미지정 오답
  const shortFake = (numFmt) => ({ sheets: { [SHEET]: { cells: Object.fromEntries(["D4", "D5", "D6"].map((a) => [a, { numFmt }])), rows: {}, cols: [], merges: [], comments: {} } }, definedNames: [], fonts: [{}] });
  const shortChk = [{ kind: "shortDate", range: "D4:D6" }];
  const gs = (numFmt) => gradeBasic2(shortFake(numFmt), { sheetName: SHEET, items: [{ no: 1, points: 2, checks: shortChk }] }).items[0];
  check("간단한 날짜: 내장 14 정답", gs({ id: 14, code: "mm-dd-yy" }).ok, rsn(gs({ id: 14, code: "mm-dd-yy" })));
  check("간단한 날짜: 코드 m/d/yy 인정", gs({ id: 0, code: "m/d/yy" }).ok, rsn(gs({ id: 0, code: "m/d/yy" })));
  { const x = gs({ id: 176, code: "yyyy-mm-dd" }); check("간단한 날짜: 사용자 지정 yyyy-mm-dd 오답", !x.ok && rsn(x).includes("간단한 날짜"), rsn(x)); }
  { const x = gs(null); check("간단한 날짜: 미지정 오답", !x.ok && rsn(x).includes("간단한 날짜"), rsn(x)); }

  // (b) 실제 파일 왕복: z:14 로 쓴 셀은 파서에서 내장 14로 복원되어 정답, z:"yyyy-mm-dd" 는 오답
  const serial14 = serial(2026, 5, 6);
  const it14 = await gradeItem((w) => { ["D4", "D5", "D6"].forEach((a) => { w[a] = { t: "n", v: serial14, z: 14 }; }); }, [{ kind: "shortDate", range: "D4:D6" }]);
  check("간단한 날짜: 실제 z:14 파일 정답", it14.ok, rsn(it14));
  const itCustom = await gradeItem((w) => { ["D4", "D5", "D6"].forEach((a) => { w[a] = { t: "n", v: serial14, z: "yyyy-mm-dd" }; }); }, [{ kind: "shortDate", range: "D4:D6" }]);
  check("간단한 날짜: 실제 yyyy-mm-dd 파일 오답", !itCustom.ok && rsn(itCustom).includes("간단한 날짜"), rsn(itCustom));
}

console.log("\n" + results.join("\n"));
console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
