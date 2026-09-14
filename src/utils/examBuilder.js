import XLSX from "xlsx-js-style";

// 실전 모드 시험지(.xlsx) 생성. 지문은 파일에 넣지 않는다(채택한 결정 6) — 표(데이터)만 그린다.
// section 별 시트 빌더로 분리하고, 워크북 끝에 숨김 "_meta" 시트로 attemptId 를 심는다(업로드 매칭용).

// "YYYY-MM-DD" → 로컬 Date (SheetJS serial 변환이 로컬 기준이므로 로컬로 만든다)
function toDate(v) {
  if (v instanceof Date) return v;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(v));
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
}

// 계산작업 시트: 표(2차원 배열) 그대로. 지문·서식 없음, 열 너비만.
function buildCalcSheet(p) {
  const ws = XLSX.utils.aoa_to_sheet(p.table);
  ws["!cols"] = (p.table[0] || []).map(() => ({ wch: 14 }));
  return ws;
}

// 기본작업-2 시트: table 스펙대로. 서식은 열 너비만, date 는 t:"d" + numFmt "yyyy-mm-dd",
// formula 열은 {r} 치환 수식. font/alignment/fill/border/rowHeight 는 넣지 않는다(학생이 적용).
export function buildBasic2Sheet(problem) {
  const t = problem.table;
  const ws = {};
  const colSpec = {};
  (t.columns || []).forEach((c) => { colSpec[c.key] = c; });

  const titleAddr = t.titleCell || "A1";
  ws[titleAddr] = { t: "s", v: t.title };

  const hr = t.headerRow; // 1-based
  t.headers.forEach((h, c) => { ws[XLSX.utils.encode_cell({ r: hr - 1, c })] = { t: "s", v: h }; });

  t.rows.forEach((row, ri) => {
    const excelRow = hr + 1 + ri; // 1-based
    let dp = 0; // 데이터 포인터 (formula 열은 데이터를 소비하지 않는다)
    t.headers.forEach((h, c) => {
      const spec = colSpec[h];
      const addr = XLSX.utils.encode_cell({ r: excelRow - 1, c });
      if (spec?.type === "formula") {
        ws[addr] = { t: "n", f: spec.formula.replace(/\{r\}/g, String(excelRow)).replace(/^=/, "") };
        return;
      }
      const val = row[dp++];
      if (val === "" || val == null) return;
      if (spec?.type === "date") ws[addr] = { t: "d", v: toDate(val), z: "yyyy-mm-dd" };
      else if (spec?.type === "int" || typeof val === "number") ws[addr] = { t: "n", v: Number(val) };
      else ws[addr] = { t: "s", v: String(val) };
    });
  });

  const lastRow = hr + t.rows.length; // 1-based
  ws["!ref"] = `A1:${XLSX.utils.encode_cell({ r: lastRow - 1, c: t.headers.length - 1 })}`;
  ws["!cols"] = (t.colWidths || []).map((w) => ({ wch: w }));
  return ws;
}

function buildSheet(p, i) {
  if (p.section === "기본2") return buildBasic2Sheet(p);
  return buildCalcSheet(p, i);
}

// 문제 세트로 워크북 구성 (다운로드 없이 객체 반환 — 테스트에서도 씀).
export function buildExamWorkbook(problems, attemptId = "") {
  const wb = XLSX.utils.book_new();
  problems.forEach((p, i) => {
    XLSX.utils.book_append_sheet(wb, buildSheet(p, i), p.sheetName || `계산${i + 1}`);
  });
  // 숨김 _meta 시트: A1 = attemptId (없으면 문제 id 목록). 채점기는 이 시트를 무시한다.
  const meta = XLSX.utils.aoa_to_sheet([[attemptId || problems.map((p) => p.id).join(",")]]);
  XLSX.utils.book_append_sheet(wb, meta, "_meta");
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Sheets = wb.SheetNames.map((name) => ({ name, Hidden: name === "_meta" ? 1 : 0 }));
  return wb;
}

// 브라우저 다운로드.
export function buildExamFile(problems, label = "", attemptId = "") {
  const wb = buildExamWorkbook(problems, attemptId);
  XLSX.writeFile(wb, `컴활2급_실전_${label || "모의고사"}.xlsx`);
}
