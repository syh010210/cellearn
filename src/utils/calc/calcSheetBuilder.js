// src/utils/calc/calcSheetBuilder.js
// composeCalc/buildInstance 인스턴스 → 계산작업 시트(xlsx-js-style worksheet).
//  · 값 셀 {t,v,z}. 날짜·시간은 serial + z. 텍스트 숫자(코드 열)는 t:'s'.
//  · 중간 수식 셀은 {t:'n', f}(선행 = 없이) + _xlfn. 접두(RANK.EQ·STDEV.S·MODE.SNGL·DAYS). 캐시값 없음.
//  · 결과·조건 칸은 instance.cells 에 없으므로 값은 없지만, 테두리만 있는 빈 셀(학생이 채움)로 그린다.
//  · 서식은 instance.roles(addr→역할) 기준 — 기출 계산작업 관례: 표 테두리 thin, 머리글 가운데,
//    계산 대상 열 머리글·단일 결과 라벨에 회색 음영(#D9D9D9), 참조표/조건 캡션은 "<이름>"·"<조건>".
// 독립 모듈(examBuilder 배선은 3d-2 이후).
import XLSX from "xlsx-js-style";
import { addXlfn } from "../../data/exam/calc/functions.js";

const FONT = "맑은 고딕";
const thin = { style: "thin", color: { rgb: "FF000000" } };
const BORDER = { top: thin, bottom: thin, left: thin, right: thin };
const GRAY = { patternType: "solid", fgColor: { rgb: "FFD9D9D9" } };   // 계산 대상·결과 라벨 음영
const CENTER = { horizontal: "center", vertical: "center" };
const VCENTER = { vertical: "center" };
const font = (opts = {}) => ({ name: FONT, sz: 11, ...opts });
const colToIdx = (L) => { let n = 0; for (const ch of String(L).toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

// 역할 → 스타일. 표 내부(머리글·데이터·결과·조건)는 테두리+가운데, 캡션류는 테두리 없음.
function styleFor(role) {
  switch (role) {
    case "label": return { font: font({ sz: 10 }), alignment: VCENTER };                 // [표N]
    case "title": return { font: font({ bold: true }), alignment: VCENTER };             // 표 제목(옵션)
    case "critlabel": case "reflabel": case "rtname":                                    // <조건> · <참조표>
      return { font: font(), alignment: VCENTER };
    case "headerAns": case "rtheaderAns": case "reslabel":                               // 계산 대상 머리글 · 단일결과 라벨
      return { font: font(), border: BORDER, alignment: CENTER, fill: GRAY };
    default:                                                                             // header/data/mid/result/criteria/base/ref…
      return { font: font(), border: BORDER, alignment: CENTER };
  }
}

export function buildCalcInstanceSheet(instance) {
  const ws = {};
  const roles = instance.roles || {};
  for (const [addr, c] of Object.entries(instance.cells)) {
    let cell;
    if (c.f !== undefined) {
      cell = { t: "n", f: addXlfn(String(c.f).replace(/^=/, "")) }; // 캐시값(v) 넣지 않음 → fullCalcOnLoad 로 재계산
    } else {
      const t = c.t || (typeof c.v === "number" ? "n" : "s");
      cell = { t, v: t === "n" ? Number(c.v) : String(c.v) };
      if (c.z) cell.z = c.z;
    }
    cell.s = styleFor(roles[addr]);
    ws[addr] = cell;
  }
  // 결과·조건 칸: 값 없이 테두리만(학생이 채우는 빈 칸). 빈 문자열 스텁을 써야 xlsx-js-style 이 스타일을
  //  버리지 않고 <c s=.. t=str/> 로 직렬화한다(엑셀에는 빈칸+테두리로 보임).
  for (const [addr, role] of Object.entries(roles)) {
    if (ws[addr] || (role !== "result" && role !== "criteria")) continue;
    ws[addr] = { t: "s", v: "", s: styleFor(role) };
  }
  // 병합 셀 테두리: 병합 범위의 각 칸에 바깥 변(top/bottom/left/right)을 위치별로 넣고 시작 칸 채우기를 복제한다.
  //  시작 칸 외에는 값 없는 스텁({t:"s",v:""}) — 라벨 영역이라 결과·조건·sourceCells 판정과 겹치지 않는다.
  //  캡션 병합(<조건> 등)은 테두리 없음 그대로 둔다.
  const CAPTION_MERGE = new Set(["label", "title", "critlabel", "reflabel", "rtname"]);
  for (const m of instance.merges || []) {
    const rg = XLSX.utils.decode_range(m);
    const anchorAddr = XLSX.utils.encode_cell({ r: rg.s.r, c: rg.s.c });
    if (CAPTION_MERGE.has(roles[anchorAddr])) continue;
    const base = styleFor(roles[anchorAddr]);
    for (let r = rg.s.r; r <= rg.e.r; r++) for (let c = rg.s.c; c <= rg.e.c; c++) {
      const b = {};
      if (r === rg.s.r) b.top = thin;
      if (r === rg.e.r) b.bottom = thin;
      if (c === rg.s.c) b.left = thin;
      if (c === rg.e.c) b.right = thin;
      const s = { font: base.font, alignment: base.alignment, border: b };
      if (base.fill) s.fill = base.fill;
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) ws[addr].s = s;                      // 시작 칸(값 있음): 스타일만 교체
      else ws[addr] = { t: "s", v: "", s };              // 나머지 칸: 빈 스텁 + 테두리
    }
  }
  if (instance.merges && instance.merges.length) ws["!merges"] = instance.merges.map((m) => XLSX.utils.decode_range(m));
  // 열 너비: colWidths(열문자→wch, buildInstance 가 내용 기준 자동 산정). 사용 영역 폭까지 채우고 미지정은 기본 9.
  const cw = instance.colWidths || {};
  const usedC = instance.usedRange ? XLSX.utils.decode_range(instance.usedRange).e.c : 0;
  const maxCol = Math.max(usedC, ...Object.keys(cw).map(colToIdx), 0);
  const cols = [];
  for (let i = 0; i <= maxCol; i++) { const L = XLSX.utils.encode_col(i); cols[i] = { wch: cw[L] || 9 }; }
  ws["!cols"] = cols;
  ws["!ref"] = instance.usedRange || "A1";
  return ws;
}
