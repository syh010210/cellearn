import XLSX from "xlsx-js-style";

// 선택된 계산작업 문제들로 시험지 .xlsx 생성.
// 각 문제 = 한 시트. 표는 A1부터 배치(정답 셀 좌표 유지), 지시문은 표 아래에 배치.
export function buildExamFile(problems, label = "") {
  const wb = XLSX.utils.book_new();
  problems.forEach((p, i) => {
    const ws = XLSX.utils.aoa_to_sheet(p.table);
    // 지시문을 표 아래 두 칸 띄워 배치 (정답 셀 좌표에 영향 없음)
    const instrRow = p.table.length + 2; // 0-based row index
    const addr = XLSX.utils.encode_cell({ r: instrRow, c: 0 });
    ws[addr] = { t: "s", v: `[문제] ${p.instruction}` };
    // ref 확장
    const cur = XLSX.utils.decode_range(ws["!ref"]);
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(cur.e.r, instrRow), c: Math.max(cur.e.c, 0) } });
    ws["!cols"] = (p.table[0] || []).map(() => ({ wch: 14 }));
    XLSX.utils.book_append_sheet(wb, ws, p.sheetName || `계산${i + 1}`);
  });
  XLSX.writeFile(wb, `컴활2급_실전_계산작업${label ? `_${label}` : ""}.xlsx`);
}
