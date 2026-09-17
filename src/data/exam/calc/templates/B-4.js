// src/data/exam/calc/templates/B-4.js
// IF 판정 — COUNTIF 조건 (행 내 개수 / 열 중복 개수). 변형 2개. 모두 열 채우기.
import { NAMES } from "../pools.js";
import { TOPICS, pick } from "../topics.js";
import { geom, josa } from "./_util.js";

const ri = (rng, lo, hi) => rng.range(lo, hi);

// 1) b4-count-subject [기본] — IF(COUNTIF(행범위,"<80")>=2,"","합격")
function b4CountSubject(rng) {
  const N = 8 + rng.int(3);
  const [s1, s2, s3] = pick(rng, TOPICS.subjectTriples);   // 국어/영어/수학 열묶음 회피
  const headers = ["이름", s1, s2, s3, "합격여부"];
  // 각 행의 80 미만 과목 수 c. 필수: c=2(수학<80) 1행, c=1 1행, c=0 1행, c=3 1행 → 나머지 랜덤
  const specs = [{ c: 2, dLow: true }, { c: 1, dLow: false }, { c: 0, dLow: false }, { c: 3, dLow: true }];
  while (specs.length < N) specs.push({ c: rng.int(4), dLow: rng.chance(0.5) });
  const makeRow = (sp) => {
    // 어느 과목이 80 미만인지: dLow 면 수학(idx2) 포함해서 c개
    const idxs = [0, 1, 2];
    let low;
    if (sp.dLow && sp.c >= 1) { const rest = rng.shuffle([0, 1]).slice(0, sp.c - 1); low = new Set([2, ...rest]); }
    else { low = new Set(rng.shuffle(idxs).slice(0, sp.c)); }
    return [0, 1, 2].map((k) => (low.has(k) ? ri(rng, 40, 79) : ri(rng, 80, 99)));
  };
  const scoreRows = rng.shuffle(specs).map(makeRow);
  const below = (r) => r.filter((v) => v < 80).length;
  const res = scoreRows.map((r) => (below(r) >= 2 ? "" : "합격"));
  if (new Set(res).size < 2) throw new Error("결과 단일");
  // rangeShrink(수학 열 제거)로 결과가 바뀌는 행: 수학<80 이면서 정확히 2개 미만인 행
  if (!scoreRows.some((r) => r[2] < 80 && below(r) === 2)) throw new Error("열축소 무영향");
  if (!scoreRows.some((r) => below(r) === 1)) throw new Error("count 1 없음");   // litPM1 2→1 판별
  // "<80" 경계: 정확히 80 인 과목 셀 1개 이상(80 은 미만 아님 → below 불변). 위치 편중 방지 위해 무작위 대상 행 선택.
  const ord = rng.shuffle(scoreRows.map((_, i) => i));
  outer: for (const i of ord) for (let k = 0; k < 3; k++) if (scoreRows[i][k] >= 80) { scoreRows[i][k] = 80; break outer; }
  const names = rng.sample(NAMES, N);
  const rows = scoreRows.map((r, i) => [names[i], r[0], r[1], r[2], null]);
  const g = geom(headers, N);
  const rowRange = `${g.dataCell(s1, 0)}:${g.dataCell(s3, 0)}`;
  return {
    subtype: "B-4", colWidths: [8, 6, 6, 6, 8], headers, rows,
    result: { kind: "fillCol", col: "합격여부" },
    discriminators: [
      { name: "80미만 2과목↑(공백)", test: (r) => [r[1], r[2], r[3]].filter((v) => v < 80).length >= 2, min: 1, max: N },
      { name: "정확히 80 포함", test: (r) => [r[1], r[2], r[3]].includes(80), min: 1, max: N },
    ],
    answer: `=IF(COUNTIF(${rowRange},"<80")>=2,"","합격")`,
    functions: { required: ["IF", "COUNTIF"], candidates: null },
    text: `[{표}]에서 ${s1}[{col:${s1}}], ${s2}[{col:${s2}}], ${s3}[{col:${s3}}] 점수 중 2과목 이상이 80점 미만이면 공백, 그 외에는 "합격"으로 합격여부[{R}]에 표시하시오. (8점)`,
    notes: ["IF, COUNTIF 함수 사용"],
    accept: [`=IF(COUNTIF(${rowRange},"<80")>=2,"","합격")`],
  };
}

// 2) b4-id-dup [기본] — IF(COUNTIF($id범위,id)>=2,"우수","일반")
function b4IdDup(rng) {
  const N = 8 + rng.int(3);
  const B = pick(rng, TOPICS.b4Dup);   // ID 열·결과 열·재방문/신규가 한 주제
  const headers = [B.idc, "이름", B.res];
  // 그룹별 등장 횟수(1 또는 2). 최소 2그룹, count2 최소 1·count1 최소 1. 마지막 행은 count2 그룹.
  const counts = [2, 1];
  while (counts.reduce((a, b) => a + b, 0) < N) counts.push(rng.chance(0.45) ? 2 : 1);
  let total = counts.reduce((a, b) => a + b, 0);
  while (total > N) { const i = counts.findIndex((c) => c === 1); if (i < 0) { counts[counts.length - 1]--; total--; } else { counts.splice(i, 1); total--; } }
  if (!counts.includes(2) || !counts.includes(1)) throw new Error("그룹 분포 부족");
  const ids = []; { const s = new Set(); while (s.size < counts.length) s.add("M" + String(101 + rng.int(899))); ids.push(...s); }
  // count2 그룹 하나를 마지막 행 전용으로 예약
  const g2idx = counts.findIndex((c) => c === 2);
  const seqAll = [];
  counts.forEach((c, gi) => { for (let k = 0; k < c; k++) seqAll.push({ id: ids[gi], gi }); });
  const lastOne = seqAll.filter((e) => e.gi === g2idx).pop();          // 이 그룹의 한 항목을 끝으로
  const rest = rng.shuffle(seqAll.filter((e) => e !== lastOne));
  const seq = [...rest, lastOne].map((e) => e.id);
  const freq = {}; seq.forEach((id) => (freq[id] = (freq[id] || 0) + 1));
  const names = rng.sample(NAMES, N);
  const rows = seq.map((id, i) => [id, names[i], null]);
  const res = seq.map((id) => (freq[id] >= 2 ? B.dup : B.one));
  if (new Set(res).size < 2) throw new Error("결과 단일");
  const g = geom(headers, N), rA = g.colAbs(B.idc), x = g.dataCell(B.idc, 0);
  return {
    subtype: "B-4", colWidths: [8, 8, 8], headers, rows, codeColumns: [B.idc], _topic: { pool: "b4Dup", id: B.id },
    result: { kind: "fillCol", col: B.res },
    discriminators: [{ name: `중복ID(${B.dup})`, test: (r) => freq[r[0]] >= 2, min: 2, max: N, allowFixed: "lastRow", reason: "마지막 행을 중복 그룹으로 고정(COUNTIF 범위 끝-1 축소 판별)" }],
    answer: `=IF(COUNTIF(${rA},${x})>=2,"${B.dup}","${B.one}")`,
    functions: { required: ["IF", "COUNTIF"], candidates: null },
    text: `[{표}]에서 ${B.idc}[{col:${B.idc}}]에 같은 ${B.idc}${josa(B.idc, "이/가")} 2개 이상이면 "${B.dup}", 그렇지 않으면 "${B.one}"${josa(B.one, "을/를")} ${B.res}[{R}]에 표시하시오. (8점)`,
    notes: ["IF, COUNTIF 함수 사용"],
    accept: [`=IF(COUNTIF(${g.colRowFixed(B.idc)},${x})>=2,"${B.dup}","${B.one}")`],
  };
}

export const TEMPLATE_B4 = {
  subtype: "B-4",
  variants: [
    { id: "b4-count-subject", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["COUNTIF"], plan: b4CountSubject },
    { id: "b4-id-dup", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["COUNTIF"], plan: b4IdDup },
  ],
};
