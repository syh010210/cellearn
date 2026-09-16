// src/utils/calc/calcBlock.js
// 블록 스펙(샘플/템플릿) → 블록-상대 좌표 기하. 원점(0,0) 기준. 페이지 배치(origin)는 calcLayout 이 준다.
// 지시문 좌표·결과·수식·조건·기대값이 모두 이 기하에서 파생된다(좌표 이중 계산 없음).

import { shiftFormula } from "../formulaUtils.js";

// 셀 값 정규화 → { v, t, z? }. 스칼라(number/string) 또는 {v,t?,z?} 객체 허용.
function norm(val, z) {
  if (val && typeof val === "object" && "v" in val) {
    return { v: val.v, t: val.t || (typeof val.v === "number" ? "n" : "s"), ...(val.z || z ? { z: val.z || z } : {}) };
  }
  return { v: val, t: typeof val === "number" ? "n" : "s", ...(z ? { z } : {}) };
}

/**
 * @param {Object} spec 블록 스펙
 * @returns 블록-상대 기하
 */
export function resolveBlock(spec, tableName = spec.tableName || "표1") {
  const headers = spec.headers;
  const nCols = headers.length;
  const nData = spec.rows.length;
  const tableW = nCols;
  const dataR0 = 2;
  const tableBottom = dataR0 + nData - 1;
  const colIdx = (name) => { const i = headers.indexOf(name); if (i < 0) throw new Error(`열 없음: ${name}`); return i; };

  const fileCells = [];   // 문제 파일 셀 {r,c,v?,t?,z?,f?,role}
  const roles = new Map();
  const setRole = (r, c, role) => roles.set(`${r},${c}`, role);
  const push = (r, c, obj, role) => { fileCells.push({ r, c, ...obj, role }); setRole(r, c, role); };

  // 표: 라벨 · 머리글 · 데이터
  push(0, 0, { v: `[${tableName}]`, t: "s" }, "label");
  headers.forEach((h, c) => push(1, c, { v: h, t: "s" }, "header"));

  const resultColIdxs = [];
  if (spec.result.kind === "fillCol") resultColIdxs.push(colIdx(spec.result.col));
  else if (spec.result.kind === "fillRow") spec.result.cols.forEach((n) => resultColIdxs.push(colIdx(n)));
  // fillCol 만 그 열의 데이터를 비운다(열 전체가 결과). fillRow 의 지정 열은 실제 데이터가 있고 결과는 집계 행이다.
  const isResult = new Set(spec.result.kind === "fillCol" ? resultColIdxs : []);

  const dataCells = [];
  spec.rows.forEach((row, i) => {
    const r = dataR0 + i;
    row.forEach((val, c) => {
      if (val === null || val === undefined) return;           // 결과 열 등 빈 셀
      if (isResult.has(c)) return;                             // 결과 열 값은 넣지 않음
      push(r, c, norm(val, spec.colZ?.[c]), "data");
      dataCells.push({ r, c });
    });
  });

  // 중간 계산 수식(선택) — 첫 데이터 행 기준식을 아래로 채움
  const midCells = [];
  (spec.mid || []).forEach((m) => {
    const c = colIdx(m.col);
    for (let i = 0; i < nData; i++) { const r = dataR0 + i; const f = shiftFormula(m.formula, i, 0); midCells.push({ r, c, f }); push(r, c, { f }, "mid"); }
  });

  // 결과 배치
  let anchor, resultCells = [], resultRange, fill = null;
  const merges = [];
  const label = spec.result?.label;
  if (spec.result.kind === "fillCol") {
    const c = resultColIdxs[0]; fill = "down";
    anchor = { r: dataR0, c };
    for (let i = 0; i < nData; i++) { resultCells.push({ r: dataR0 + i, c }); setRole(dataR0 + i, c, "result"); }
    resultRange = { r1: dataR0, c1: c, r2: tableBottom, c2: c };
  } else if (spec.result.kind === "single") {
    const aggR = tableBottom + 1;
    push(aggR, 0, { v: label || "평균", t: "s" }, "reslabel");
    if (nCols - 2 >= 0) merges.push({ r1: aggR, c1: 0, r2: aggR, c2: nCols - 2 });
    anchor = { r: aggR, c: nCols - 1 };
    resultCells = [anchor]; setRole(aggR, nCols - 1, "result");
    resultRange = { r1: aggR, c1: nCols - 1, r2: aggR, c2: nCols - 1 };
  } else if (spec.result.kind === "fillRow") {
    const aggR = tableBottom + 1; fill = "right";
    const sorted = [...resultColIdxs].sort((a, b) => a - b);
    const firstC = sorted[0];
    push(aggR, 0, { v: label || "평균", t: "s" }, "reslabel");
    if (firstC - 1 >= 1) merges.push({ r1: aggR, c1: 0, r2: aggR, c2: firstC - 1 });
    anchor = { r: aggR, c: firstC };
    sorted.forEach((c) => { resultCells.push({ r: aggR, c }); setRole(aggR, c, "result"); });
    resultRange = { r1: aggR, c1: firstC, r2: aggR, c2: sorted[sorted.length - 1] };
  }

  let blockW = tableW;
  let blockH = (spec.result.kind === "single" || spec.result.kind === "fillRow") ? tableBottom + 2 : tableBottom + 1;

  // 부착물 (표 오른쪽으로 1열 띄움)
  const attStartCol = tableW + 1;
  let criteria = null, refTableRange = null, resultTableRange = null;
  const ph = {};

  if (spec.criteria) {
    const cr = spec.criteria; const off = cr.rowOffset || 0; const cw = cr.headers.length;
    const range = { r1: off, c1: attStartCol, r2: off + cr.rows.length, c2: attStartCol + cw - 1 };
    // 조건 셀은 파일에선 비움 → fileCells 에 넣지 않는다. 계산용 값·머리글은 buildInstance 가 채운다.
    const critCells = [];
    cr.headers.forEach((h, i) => critCells.push({ r: off, c: attStartCol + i, v: h, t: "s" }));
    cr.rows.forEach((row, ri) => row.forEach((v, i) => { if (v !== null && v !== undefined) critCells.push({ ...norm(v), r: off + 1 + ri, c: attStartCol + i }); }));
    for (let r = range.r1; r <= range.r2; r++) for (let c = range.c1; c <= range.c2; c++) setRole(r, c, "criteria");
    const rowsObj = cr.rows.map((row) => Object.fromEntries(cr.headers.map((h, i) => [h, row[i]])));
    criteria = { range, table: [cr.headers, ...cr.rows], rows: rowsObj, cells: critCells };
    blockW = Math.max(blockW, range.c2 + 1); blockH = Math.max(blockH, range.r2 + 1);
    ph.C = range;
  }

  if (spec.refTable) {
    const rt = spec.refTable; const off = rt.rowOffset || 0; let r = off;
    if (rt.name) { push(r, attStartCol, { v: rt.name, t: "s" }, "reflabel"); r++; }
    const headR = r;
    rt.headers.forEach((h, i) => push(headR, attStartCol + i, norm(h), "refheader")); r++;
    rt.rows.forEach((row) => { row.forEach((v, i) => push(r, attStartCol + i, norm(v), "refdata")); r++; });
    refTableRange = { r1: headR, c1: attStartCol, r2: r - 1, c2: attStartCol + rt.headers.length - 1 };
    blockW = Math.max(blockW, refTableRange.c2 + 1); blockH = Math.max(blockH, r);
    ph.T = refTableRange;
  }

  if (spec.result.kind === "table") {
    const tb = spec.resultTable; const top = tb.rowOffset || 0; let r = top;
    if (tb.name) { push(r, attStartCol, { v: tb.name, t: "s" }, "rtname"); r++; }
    const headR = r;
    tb.headers.forEach((h, i) => push(headR, attStartCol + i, { v: h, t: "s" }, "rtheader")); r++;
    const resCol = attStartCol + tb.headers.length - 1; fill = "down";
    const labR0 = r;
    resultCells = [];
    tb.labels.forEach((lab, i) => {
      const rr = labR0 + i;
      (Array.isArray(lab) ? lab : [lab]).forEach((lv, k) => push(rr, attStartCol + k, norm(lv), "rtlabel"));
      resultCells.push({ r: rr, c: resCol }); setRole(rr, resCol, "result");
    });
    anchor = { r: labR0, c: resCol };
    resultRange = { r1: labR0, c1: resCol, r2: labR0 + tb.labels.length - 1, c2: resCol };
    // {RT} 은 머리글~본문(이름 라벨 행 제외) — 직사각형 안의 모든 셀에 역할이 있게.
    resultTableRange = { r1: headR, c1: attStartCol, r2: labR0 + tb.labels.length - 1, c2: resCol };
    blockW = Math.max(blockW, resCol + 1); blockH = Math.max(blockH, labR0 + tb.labels.length);
    ph.RT = resultTableRange;
  }

  if (spec.baseCell && nCols >= 3) {
    const bc = spec.baseCell; const c = nCols - 1;                 // 0행 오른쪽 끝
    push(0, c - 1, { v: bc.label, t: "s" }, "baselabel");
    push(0, c, norm(bc.value, bc.z), "base");
    ph.base = { r1: 0, c1: c, r2: 0, c2: c };
  }

  ph.R = resultRange; ph.anchor = anchor;
  const colRange = (name) => { const c = colIdx(name); return { r1: dataR0, c1: c, r2: tableBottom, c2: c }; };

  return {
    spec, width: blockW, height: blockH, nCols, nData, dataR0, tableBottom,
    fileCells, midCells, dataCells,
    answer: { ...anchor, formula: spec.answer },
    result: { kind: spec.result.kind, cells: resultCells, range: resultRange, fill, z: spec.result.z },
    criteria, refTableRange, resultTableRange, merges, roles,
    ph, colRange,
  };
}
