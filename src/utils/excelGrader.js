import * as XLSX from "xlsx";

export function gradeExcel(file, practiceAnswers) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: "array", cellFormula: true });
        const results = practiceAnswers.map((ans) => {
          const ws = wb.Sheets[ans.sheet];
          if (!ws) return { ...ans, status: "시트없음", studentFormula: "-" };
          const cellObj = ws[ans.cell];
          const studentFormula = cellObj?.f
            ? `=${cellObj.f}`
            : cellObj?.v !== undefined
            ? String(cellObj.v)
            : "";
          const correct = studentFormula.replace(/\s/g, "") === ans.formula.replace(/\s/g, "");
          return { ...ans, status: correct ? "correct" : "wrong", studentFormula };
        });
        resolve(results);
      } catch {
        reject(new Error("파일을 읽는 중 오류가 발생했어요."));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
