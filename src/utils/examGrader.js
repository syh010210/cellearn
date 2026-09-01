import XLSX from "xlsx-js-style";

// 실전 모드 채점 — 업로드한 .xlsx를 열어 각 계산작업 문제의 정답 셀 수식을 비교.
// 컴활 실채점과 동일하게 '정답 수식 문자열 일치'(공백 제거·대문자 정규화)로 판정.
const norm = (s) => String(s ?? "").replace(/\s/g, "").toUpperCase();

export function gradeExamFile(file, problems) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array", cellFormula: true });
        const results = problems.map((p) => {
          const ws = wb.Sheets[p.sheetName];
          const items = (p.answers || []).map((ans) => {
            if (!ws) return { ...ans, status: "시트없음", studentFormula: "-" };
            const cell = ws[ans.cell];
            const studentFormula = cell?.f ? `=${cell.f}` : cell?.v !== undefined ? String(cell.v) : "";
            const ok = norm(studentFormula) === norm(ans.formula);
            return { ...ans, status: ok ? "correct" : "wrong", studentFormula };
          });
          const correct = items.filter((it) => it.status === "correct").length;
          return { id: p.id, title: p.title, sheetName: p.sheetName, items, correct, total: items.length };
        });
        resolve(results);
      } catch {
        reject(new Error("파일을 읽는 중 오류가 발생했어요."));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
