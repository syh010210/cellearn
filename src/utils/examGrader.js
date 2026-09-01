import XLSX from "xlsx-js-style";
import { loadXlsxZip, getConditionalFormats, normFormula } from "./xlsxInspect";

// 실전 모드 채점 — 작업(section)별로 실채점.
//  · 계산: 정답 셀 수식 문자열 정확 일치(공백제거·대문자)
//  · 기본3/조건부서식: 업로드 파일의 xlsx 내부 XML에서 조건부 서식 규칙(범위+수식) 검사
const norm = normFormula;

function gradeCalc(wb, p) {
  const ws = wb.Sheets[p.sheetName];
  const items = (p.answers || []).map((ans) => {
    if (!ws) return { ...ans, status: "시트없음", studentFormula: "-" };
    const cell = ws[ans.cell];
    const studentFormula = cell?.f ? `=${cell.f}` : cell?.v !== undefined ? String(cell.v) : "";
    const ok = norm(studentFormula) === norm(ans.formula);
    return { ...ans, status: ok ? "correct" : "wrong", studentFormula };
  });
  return items;
}

async function gradeCondFormat(zip, p) {
  const rules = await getConditionalFormats(zip, p.sheetName);
  const wantSqref = String(p.expect.sqref).replace(/\s/g, "").toUpperCase();
  const wantFormula = norm(p.expect.formula);
  const hit = rules.some(
    (r) => r.sqref.replace(/\s/g, "").toUpperCase() === wantSqref && r.formula && norm(r.formula) === wantFormula
  );
  const detail = rules.map((r) => `${r.sqref}: ${r.formula || r.type}`).join(" / ") || "(규칙 없음)";
  return [{
    cell: p.expect.sqref,
    status: hit ? "correct" : "wrong",
    studentFormula: detail,
    formula: `${p.expect.sqref} · =${p.expect.formula}`,
  }];
}

export async function gradeExamFile(file, problems) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellFormula: true });
  let zip = null;
  const needZip = problems.some((p) => p.section !== "계산");
  if (needZip) { try { zip = await loadXlsxZip(buf); } catch { zip = null; } }

  const results = [];
  for (const p of problems) {
    let items;
    if (p.section === "기본3" && p.expect?.kind === "condformat") {
      items = zip ? await gradeCondFormat(zip, p) : [{ cell: p.expect.sqref, status: "wrong", studentFormula: "(파일 파싱 실패)", formula: p.expect.formula }];
    } else {
      items = gradeCalc(wb, p);
    }
    const correct = items.filter((it) => it.status === "correct").length;
    results.push({ id: p.id, title: p.title, sheetName: p.sheetName, section: p.section, items, correct, total: items.length });
  }
  return results;
}
