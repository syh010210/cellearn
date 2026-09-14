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
  const applied = c.alignment !== null || !!c.fill?.fgColor || c.border?.top || c.border?.bottom || c.border?.left || c.border?.right || c.font?.bold || c.font?.underline != null;
  if (applied) { genClean = false; genDetail = `${addr}=${JSON.stringify({ al: c.alignment, fill: c.fill?.fgColor, b: c.border, bold: c.font?.bold, u: c.font?.underline })}`; break; }
}
check("생성 시트: 적용 서식(글꼴/맞춤/채우기/테두리) 없음", genClean, genDetail);
check("생성 시트: 행 customHeight 없음", Object.values(gsh.rows).every((r) => !r.customHeight), JSON.stringify(gsh.rows));
check("생성 시트: E4 날짜값 + numFmt yyyy-mm-dd", typeof gsh.cells["E4"]?.value === "number" && gsh.cells["E4"]?.numFmt?.code === "yyyy-mm-dd", `E4=${JSON.stringify(gsh.cells["E4"]?.numFmt)} val=${gsh.cells["E4"]?.value}`);
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

console.log("\n" + results.join("\n"));
console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
