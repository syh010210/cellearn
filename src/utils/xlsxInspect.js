import JSZip from "jszip";

// 업로드한 xlsx(zip) 내부 XML을 직접 열어 조작형(조건부서식·차트·매크로 등)을 실채점하기 위한 유틸.
// SheetJS는 값·수식만 읽으므로, 서식/차트/피벗/VBA는 원본 XML을 파싱한다.

export async function loadXlsxZip(arrayBuffer) {
  return JSZip.loadAsync(arrayBuffer);
}

// 시트 표시이름("기본작업-3") → 내부 파일 경로(xl/worksheets/sheetN.xml)
async function sheetPathByName(zip, name) {
  const wb = await zip.file("xl/workbook.xml")?.async("string");
  const rels = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
  if (!wb || !rels) return null;
  // <sheet name="..." sheetId=".." r:id="rIdN"/>  (속성 순서 무관하게 name과 r:id 추출)
  let rid = null;
  for (const m of wb.matchAll(/<sheet\b([^>]*)\/>/g)) {
    const attrs = m[1];
    const nm = attrs.match(/name="([^"]+)"/);
    const ri = attrs.match(/r:id="([^"]+)"/);
    if (nm && ri && nm[1] === name) { rid = ri[1]; break; }
  }
  if (!rid) return null;
  const rel = rels.match(new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*Target="([^"]+)"`))
    || rels.match(new RegExp(`<Relationship[^>]*Target="([^"]+)"[^>]*Id="${rid}"`));
  if (!rel) return null;
  let target = rel[1].replace(/^\/?xl\//, "").replace(/^\//, "");
  if (!target.startsWith("worksheets/") && !target.startsWith("xl/")) target = target;
  return "xl/" + target.replace(/^xl\//, "");
}

// 특정 시트의 조건부 서식 규칙: [{ sqref, type, formula }]
export async function getConditionalFormats(zip, sheetName) {
  const path = await sheetPathByName(zip, sheetName);
  if (!path) return [];
  const xml = await zip.file(path)?.async("string");
  if (!xml) return [];
  const out = [];
  for (const cf of xml.matchAll(/<conditionalFormatting\b[^>]*sqref="([^"]+)"[^>]*>([\s\S]*?)<\/conditionalFormatting>/g)) {
    const sqref = cf[1];
    for (const r of cf[2].matchAll(/<cfRule\b[^>]*?type="([^"]+)"[^>]*>([\s\S]*?)<\/cfRule>/g)) {
      const fm = r[2].match(/<formula>([\s\S]*?)<\/formula>/);
      out.push({ sqref, type: r[1], formula: fm ? fm[1] : null });
    }
  }
  return out;
}

// 차트 종류 목록(예: ["barChart"])
export async function getChartTypes(zip) {
  const types = [];
  const files = Object.keys(zip.files).filter((f) => /^xl\/charts\/chart\d+\.xml$/.test(f));
  for (const f of files) {
    const xml = await zip.file(f).async("string");
    for (const m of xml.matchAll(/<c:(barChart|lineChart|pieChart|areaChart|scatterChart|doughnutChart|radarChart)\b/g)) {
      types.push(m[1]);
    }
  }
  return [...new Set(types)];
}

// 매크로(VBA) 포함 여부
export function hasMacro(zip) {
  return !!zip.file("xl/vbaProject.bin");
}

// 정규화: 공백 제거 + 대문자
export const normFormula = (s) => String(s ?? "").replace(/\s/g, "").toUpperCase();
