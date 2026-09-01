import XLSX from "xlsx-js-style";
import { loadXlsxZip, getConditionalFormats, getChartTypes, hasMacro, normFormula } from "./xlsxInspect";

// 실전 모드 채점 — 작업(problem)별로 실채점 디스패치.
//  · 계산(answers)            : 정답 셀 수식 문자열 정확 일치
//  · expect.kind="condformat" : xlsx conditionalFormatting(범위+수식) 검사
//  · expect.kind="values"     : 결과 셀 값 비교(텍스트나누기·고급필터·정렬·통합·목표값·데이터표)
//  · expect.kind="chart"      : 차트 종류 검사
//  · expect.kind="macro"      : 매크로(vbaProject) 포함 검사
const norm = normFormula;
const valEq = (a, b) => {
  if (a === undefined || a === null || a === "") return false;
  const na = parseFloat(a), nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb) && String(a).trim() !== "" && String(b).trim() !== "") return na === nb;
  return String(a).trim() === String(b).trim();
};

function gradeCalc(wb, p) {
  const ws = wb.Sheets[p.sheetName];
  return (p.answers || []).map((ans) => {
    if (!ws) return { ...ans, status: "시트없음", studentFormula: "-" };
    const cell = ws[ans.cell];
    const studentFormula = cell?.f ? `=${cell.f}` : cell?.v !== undefined ? String(cell.v) : "";
    return { ...ans, status: norm(studentFormula) === norm(ans.formula) ? "correct" : "wrong", studentFormula };
  });
}

function gradeValues(wb, p) {
  const ws = wb.Sheets[p.sheetName];
  return (p.expect.values || []).map((e) => {
    if (!ws) return { cell: e.cell, status: "시트없음", studentFormula: "-", formula: String(e.value) };
    const v = ws[e.cell]?.v;
    return {
      cell: e.cell,
      status: valEq(v, e.value) ? "correct" : "wrong",
      studentFormula: v === undefined ? "(빈칸)" : String(v),
      formula: String(e.value),
    };
  });
}

async function gradeCondFormat(zip, p) {
  const rules = zip ? await getConditionalFormats(zip, p.sheetName) : [];
  const wantSqref = String(p.expect.sqref).replace(/\s/g, "").toUpperCase();
  const wantFormula = norm(p.expect.formula);
  const hit = rules.some((r) => r.sqref.replace(/\s/g, "").toUpperCase() === wantSqref && r.formula && norm(r.formula) === wantFormula);
  return [{ cell: p.expect.sqref, status: hit ? "correct" : "wrong", studentFormula: rules.map((r) => `${r.sqref}:${r.formula || r.type}`).join(" / ") || "(규칙 없음)", formula: `${p.expect.sqref} · =${p.expect.formula}` }];
}

async function gradeChart(zip, p) {
  const types = zip ? await getChartTypes(zip) : [];
  const hit = types.includes(p.expect.chartType);
  return [{ cell: "차트", status: hit ? "correct" : "wrong", studentFormula: types.join(",") || "(차트 없음)", formula: p.expect.chartType }];
}

function gradeMacro(zip, p) {
  const hit = zip ? hasMacro(zip) : false;
  return [{ cell: "매크로", status: hit ? "correct" : "wrong", studentFormula: hit ? "vbaProject 있음" : "(매크로 없음)", formula: "매크로 포함(.xlsm)" }];
}

export async function gradeExamFile(file, problems) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellFormula: true });
  const needZip = problems.some((p) => p.expect && ["condformat", "chart", "macro"].includes(p.expect.kind));
  let zip = null;
  if (needZip) { try { zip = await loadXlsxZip(buf); } catch { zip = null; } }

  const results = [];
  for (const p of problems) {
    let items;
    const kind = p.answers ? "formula" : p.expect?.kind;
    if (kind === "formula") items = gradeCalc(wb, p);
    else if (kind === "condformat") items = await gradeCondFormat(zip, p);
    else if (kind === "values") items = gradeValues(wb, p);
    else if (kind === "chart") items = await gradeChart(zip, p);
    else if (kind === "macro") items = gradeMacro(zip, p);
    else items = [{ cell: "-", status: "wrong", studentFormula: "(미지원)", formula: "-" }];
    const correct = items.filter((it) => it.status === "correct").length;
    results.push({ id: p.id, title: p.title, sheetName: p.sheetName, section: p.section, items, correct, total: items.length });
  }
  return results;
}
