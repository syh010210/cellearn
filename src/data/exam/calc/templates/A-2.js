// src/data/exam/calc/templates/A-2.js
// 조건 평균 (AVERAGEIF(S)/DAVERAGE) + 반올림·차. 변형 4개.
import { NAMES, CLUBS_BU, CLUBS_ETC, SCHOOLS, REGIONS } from "../pools.js";
import { geom, roundPhrase, applyRound, roundExample, COL } from "./_util.js";
import { Sheet } from "../../../../excel-engine/index.js";
import { shiftFormula } from "../../../../utils/formulaUtils.js";

// 본표만 놓고 가로 채우기 결과를 실제 엔진으로 계산(부분$ 등 채우기-민감 mutation 자체 검증용)
function fillRowResults(headers, rows, anchorFormula, resultColIdxs) {
  const sh = new Sheet();
  headers.forEach((h, c) => sh.setCellValue(COL(c) + 2, h));
  rows.forEach((row, ri) => row.forEach((v, c) => { if (v !== null && v !== undefined && v !== "") sh.setCellValue(COL(c) + (3 + ri), v); }));
  const aggR = 3 + rows.length; const cs = [...resultColIdxs].sort((a, b) => a - b), a0 = cs[0];
  return cs.map((c) => { sh.setCellInput(COL(c) + aggR, shiftFormula(anchorFormula, 0, c - a0)); const v = sh.getCellValue(COL(c) + aggR); return (v && typeof v === "object") ? "E" : v; });
}

const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const differ = (a, b) => Math.abs(a - b) > 1e-9;
// 반올림 결과가 서로 달라 mutation(자릿수 ±1·함수 교체)이 값을 바꾸는가
function roundSep(avg, mode, d, { modes = false } = {}) {
  const here = applyRound(mode, avg, d);
  if (here === applyRound(mode, avg, d + 1)) return false;         // litPM1 +1
  if (d >= 1 && here === applyRound(mode, avg, d - 1)) return false; // litPM1 -1
  if (modes) for (const m of ["ROUND", "ROUNDUP", "ROUNDDOWN"]) if (m !== mode && here === applyRound(m, avg, d)) return false; // roundSwap
  return true;
}
// 조건 대상 라벨을 첫·마지막 데이터 행과 중간에 배치
function placeGroup(rng, n, matchLabel, others) {
  const arr = new Array(n).fill(null);
  arr[0] = matchLabel; arr[n - 1] = matchLabel;
  const mid = 1 + rng.int(n - 2); arr[mid] = matchLabel;             // 중간 매칭 1개
  const pool = rng.shuffle(others);
  let p = 0;
  for (let i = 0; i < n; i++) if (arr[i] == null) arr[i] = pool[p++ % pool.length];
  return arr;
}
const distinctInts = (rng, n, lo, hi, exclude = []) => {
  const ex = new Set(exclude); const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 500) { const v = rng.range(lo, hi); if (!ex.has(v)) { ex.add(v); out.push(v); } }
  if (out.length < n) throw new Error("distinctInts 부족");
  return out;
};

// 1) a2-daverage-round [기본] — DAVERAGE + ROUND, 조건 "*부"
function daverageRound(rng) {
  const n = 6 + rng.int(4);
  const headers = ["동아리", "등급", "평점"];
  const clubs = placeGroup(rng, n, null, []); // placeholder
  // "부" 로 끝나는 동아리를 첫·마지막·중간에, 나머지는 비-부
  const buFirst = rng.sample(CLUBS_BU, 3);
  const etc = rng.sample(CLUBS_ETC, n - 3);
  const labels = new Array(n).fill(null);
  labels[0] = buFirst[0]; labels[n - 1] = buFirst[1];
  const mid = 1 + rng.int(n - 2); labels[mid] = buFirst[2];
  let e = 0; for (let i = 0; i < n; i++) if (!labels[i]) labels[i] = etc[e++];
  const tenths = distinctInts(rng, n, 30, 44); // 3.0~4.4
  const grade = () => ["A", "B", "C"][rng.int(3)];
  const rows = labels.map((c, i) => [c, grade(), tenths[i] / 10]);
  // 부-평점 평균 (마지막 데이터 행은 부)
  const val = rows.map((r) => r[2]);
  const buVals = rows.filter((r) => String(r[0]).endsWith("부")).map((r) => r[2]);
  const avg = mean(buVals), res1 = applyRound("ROUND", avg, 1);
  if (!roundSep(avg, "ROUND", 1)) throw new Error("round 미분리");
  // rangeShrink 가 잡히도록: 마지막 부 행 제거·조건 제거 시 결과가 달라져야
  if (!differ(applyRound("ROUND", mean(buVals.slice(0, -1)), 1), res1)) throw new Error("db축소 무영향");
  if (!differ(applyRound("ROUND", mean(val), 1), res1)) throw new Error("조건축소 무영향");

  const g = geom(headers, n);
  const db = g.dbAll(), dbA = g.dbAllAbs(), crit = g.critRange(1);
  const ex = roundExample("ROUND", 1, rng, avg, [res1]); // 결과(부-평점 평균) ±15%, 기대값 회피
  return {
    subtype: "A-2", colWidths: [12, 8, 8], headers, rows, colZ: { 2: "0.0" },
    result: { kind: "single", label: "부 동아리 평점 평균" },
    answer: `=ROUND(DAVERAGE(${dbA},"평점",${crit}),1)`,
    criteria: { headers: ["동아리"], rows: [["*부"]], rowOffset: 0 },
    functions: { required: ["DAVERAGE", "ROUND"], candidates: null },
    text: '[{표}]에서 동아리[{col:동아리}]가 "부"로 끝나는 동아리의 평점[{col:평점}]에 대한 평균을 [{R}] 셀에 계산하시오. (8점)',
    notes: [`${roundPhrase("ROUND", 1)} ${ex.text}`, "조건은 [{C}] 영역에 알맞게 입력", "DAVERAGE, ROUND 함수 사용"],
    accept: [
      `=ROUND(DAVERAGE(${dbA},${g.header("평점")},${crit}),1)`,  // 필드=머리글 셀
      `=ROUND(DAVERAGE(${dbA},3,${crit}),1)`,                    // 필드=열 번호
      `=ROUND(DAVERAGE(${db},"평점",${crit}),1)`,                // 표 범위 $ 없음
    ],
  };
}

// 2) a2-averageif-round [기본] — AVERAGEIF + 내림, 가로 채우기(후보형)
function averageifRound(rng) {
  const n = 8 + rng.int(3); // 8~10 (1반 3개 이상 확보)
  const headers = ["이름", "반", "국어", "영어", "수학"];
  const others = ["2반", "3반", "4반"];
  const labels = placeGroup(rng, n, "1반", others);
  const names = rng.sample(NAMES, n);
  // 과목별 점수 (78 제외: 표시 예 출력과 충돌 방지)
  const subj = [0, 1, 2].map(() => distinctInts(rng, n, 55, 99, [78]));
  const rows = labels.map((cls, i) => [names[i], cls, subj[0][i], subj[1][i], subj[2][i]]);
  const idx1 = labels.map((c, i) => c === "1반" ? i : -1).filter((i) => i >= 0);
  const avgs = subj.map((col) => idx1.reduce((s, i) => s + col[i], 0) / idx1.length);
  const downs = avgs.map((a) => applyRound("ROUNDDOWN", a, 0));
  if (new Set(downs).size !== 3) throw new Error("결과 중복");        // fillRow 숫자 서로 달라야
  // 후보(ROUND·ROUNDUP·ROUNDDOWN) 교체가 전부 값으로 잡히려면: 평균 정수 칸 금지 +
  //  소수 첫째 ≥5 칸 1개(DOWN≠ROUND) + 0<소수 첫째<5 칸 1개(ROUND≠UP). (DOWN≠UP 은 비정수면 자동)
  const fr = avgs.map((a) => a - Math.floor(a));
  if (fr.some((f) => f < 1e-9)) throw new Error("평균 정수 칸");        // 정수 칸 금지
  // 후보 교체(mutate 가 생성하는 ROUNDDOWN→ROUND·ROUNDUP)가 값으로 잡히려면:
  //  소수 첫째 ≥5 칸 1개(DOWN≠ROUND) + 비정수(DOWN≠UP, 정수 금지로 보장). ROUND↔UP 은 생성 안 되어 불요.
  if (!fr.some((f) => f >= 0.5)) throw new Error("후보 교체 미구분");
  // rangeShrink: 마지막 1반 행(row n-1) 제거 시 ≥1 과목의 내림 결과가 달라져야
  const idx1NoLast = idx1.filter((i) => i !== n - 1);
  const okShrink = [0, 1, 2].some((c) => applyRound("ROUNDDOWN", idx1NoLast.reduce((s, i) => s + subj[c][i], 0) / idx1NoLast.length, 0) !== downs[c]);
  if (!okShrink) throw new Error("축소 무영향");
  const g = geom(headers, n);
  const 반A = g.colAbs("반"), guk = g.colRel("국어");
  // partialDollar(조건 열 시작 $ 제거 → 가로 채우기 때 열 밀림): 가로 채우기 결과가 달라져야
  const rIdx = ["국어", "영어", "수학"].map((nm) => headers.indexOf(nm));
  const baseF = `=ROUNDDOWN(AVERAGEIF(${반A},"1반",${guk}),0)`;
  const pdF = `=ROUNDDOWN(AVERAGEIF(${반A.replace(/^\$([A-Z]+)\$(\d+)/, "$1$2")},"1반",${guk}),0)`;
  if (JSON.stringify(fillRowResults(headers, rows, baseF, rIdx)) === JSON.stringify(fillRowResults(headers, rows, pdF, rIdx))) throw new Error("부분$ 무영향");
  const ex = roundExample("ROUNDDOWN", 0, rng, avgs[0], downs); // 결과(1반 평균) ±15%, 기대값 회피
  return {
    subtype: "A-2", colWidths: [8, 6, 6, 6, 6], headers, rows,
    result: { kind: "fillRow", cols: ["국어", "영어", "수학"], label: "1반 평균" },
    answer: `=ROUNDDOWN(AVERAGEIF(${반A},"1반",${guk}),0)`,
    functions: { required: ["AVERAGEIF"], candidates: ["ROUNDDOWN", "ROUND", "ROUNDUP"] },
    text: '[{표}]에서 반[{col:반}]이 "1반"인 학생의 국어[{col:국어}], 영어[{col:영어}], 수학[{col:수학}]의 평균을 [{R}] 영역에 계산하시오. (8점)',
    notes: [`${roundPhrase("ROUNDDOWN", 0)} ${ex.text}`, "AVERAGEIF, ROUNDDOWN, ROUND, ROUNDUP 중 알맞은 함수 사용"],
    accept: [
      `=ROUNDDOWN(AVERAGEIF(${반A},"=1반",${guk}),0)`,          // 조건 "=1반"
      `=ROUNDDOWN(AVERAGEIF(${반A},"1반",${guk}),)`,            // 자릿수 빈 인수
    ],
  };
}

// 3) a2-daverage-diff [어려움] — DAVERAGE - AVERAGE
function daverageDiff(rng) {
  const n = 7 + rng.int(3);
  const headers = ["학생", "학교", "국어"];
  const school = rng.pick(SCHOOLS);
  const others = SCHOOLS.filter((s) => s !== school);
  const labels = placeGroup(rng, n, school, others);
  const names = rng.sample(NAMES, n);
  const scores = distinctInts(rng, n, 55, 99);
  const rows = labels.map((s, i) => [names[i], s, scores[i]]);
  // rangeShrink 민감도: DAVERAGE db·AVERAGE 범위·조건 축소가 결과를 바꿔야
  const val = rows.map((r) => r[2]);
  const matchVals = rows.filter((r) => r[1] === school).map((r) => r[2]);
  const davg = mean(matchVals), avgAll = mean(val);
  if (!differ(mean(matchVals.slice(0, -1)), davg)) throw new Error("db축소 무영향");   // 마지막 매칭 행 제거
  if (!differ(mean(val.slice(0, -1)), avgAll)) throw new Error("avg축소 무영향");
  if (!differ(davg, avgAll)) throw new Error("조건축소 무영향");

  const g = geom(headers, n);
  const db = g.dbAll(), dbA = g.dbAllAbs(), crit = g.critRange(1), valRel = g.colRel("국어");
  return {
    subtype: "A-2", colWidths: [8, 8, 8], headers, rows,
    result: { kind: "single", label: `${school} 국어 평균차` },
    answer: `=DAVERAGE(${dbA},"국어",${crit})-AVERAGE(${valRel})`,
    criteria: { headers: ["학교"], rows: [[school]], rowOffset: 0 },
    functions: { required: ["DAVERAGE", "AVERAGE"], candidates: null },
    text: `[{표}]의 학교[{col:학교}]가 "${school}"인 학생의 국어[{col:국어}] 평균에서 전체 국어[{col:국어}] 평균을 뺀 값을 [{R}] 셀에 계산하시오. (8점)`,
    notes: ["조건은 [{C}] 영역에 알맞게 입력", "DAVERAGE, AVERAGE 함수 사용"],
    accept: [
      `=DAVERAGE(${dbA},${g.header("국어")},${crit})-AVERAGE(${valRel})`, // 필드=머리글
      `=DAVERAGE(${dbA},3,${crit})-AVERAGE(${valRel})`,                   // 필드=번호
    ],
  };
}

// 4) a2-averageifs-round [어려움] — ROUND + AVERAGEIFS (두 조건 인라인)
function averageifsRound(rng) {
  const n = 8 + rng.int(3);
  const headers = ["선수", "클럽", "포지션", "점수"];
  const clubA = rng.pick(REGIONS), posA = "수비수";
  const posPool = ["공격수", "수비수", "미드필더", "골키퍼"];
  const otherClubs = REGIONS.filter((r) => r !== clubA);
  // 두 조건 각각만 맞는 행 + 둘 다 맞는 행을 보장
  const club = new Array(n).fill(null), pos = new Array(n).fill(null);
  club[0] = clubA; pos[0] = posA;                          // both
  club[1] = clubA; pos[1] = "공격수";                       // c1 만
  club[2] = rng.pick(otherClubs); pos[2] = posA;           // c2 만
  club[3] = clubA; pos[3] = posA;                          // both
  club[4] = clubA; pos[4] = posA;                          // both (3개 이상 → 평균에 소수 발생)
  club[n - 1] = clubA; pos[n - 1] = posA;                  // 마지막 행도 both → 범위 축소가 값을 바꾼다
  for (let i = 5; i < n - 1; i++) { club[i] = rng.pick(REGIONS); pos[i] = rng.pick(posPool); }
  const names = rng.sample(NAMES, n);
  const scores = distinctInts(rng, n, 60, 99);
  const rows = names.map((nm, i) => [nm, club[i], pos[i], scores[i]]);
  const both = rows.filter((r) => r[1] === clubA && r[2] === posA).map((r) => r[3]);
  const avg = mean(both), res1 = applyRound("ROUND", avg, 1);
  if (!roundSep(avg, "ROUND", 1, { modes: false })) throw new Error("round 미분리");
  // 아래 mutation 들은 채점이 ROUND 결과를 비교하므로 반올림 값 기준으로 분리되어야 한다.
  const rDiff = (x) => Number.isNaN(x) || differ(applyRound("ROUND", x, 1), res1);
  // rangeShrink: 마지막 both 행 제거 시 반올림 결과가 달라져야
  if (!rDiff(mean(both.slice(0, -1)))) throw new Error("범위축소 무영향");
  // rangeExpand(조건 범위 시작-1): AVERAGEIFS 는 값 범위 길이로 순회하며 조건 범위를 위로 한 칸 밀어 참조
  const cl = rows.map((r) => r[1]), po = rows.map((r) => r[2]), va = rows.map((r) => r[3]);
  const avgIfs = (v, c1, c2) => { let t = 0, c = 0; for (let i = 0; i < v.length; i++) if (c1[i] === clubA && c2[i] === posA) { t += v[i]; c++; } return c ? t / c : NaN; };
  const c2Shift = va.map((_, i) => (i === 0 ? "포지션" : po[i - 1]));
  const c1Shift = va.map((_, i) => (i === 0 ? "클럽" : cl[i - 1]));
  if (!rDiff(avgIfs(va, cl, c2Shift)) || !rDiff(avgIfs(va, c1Shift, po))) throw new Error("조건확장 무영향");

  const g = geom(headers, n);
  const vR = g.colRel("점수"), c1 = g.colRel("클럽"), c2 = g.colRel("포지션");
  const ex = roundExample("ROUND", 1, rng, avg, [res1]); // 결과(조건 평균) ±15%, 기대값 회피
  return {
    subtype: "A-2", colWidths: [8, 8, 8, 6], headers, rows,
    result: { kind: "single", label: `${clubA} ${posA} 점수 평균` },
    answer: `=ROUND(AVERAGEIFS(${vR},${c1},"${clubA}",${c2},"${posA}"),1)`,
    functions: { required: ["ROUND", "AVERAGEIFS"], candidates: null },
    text: `[{표}]에서 클럽[{col:클럽}]이 "${clubA}"이고 포지션[{col:포지션}]이 "${posA}"인 선수의 점수[{col:점수}] 평균을 [{R}] 셀에 계산하시오. (8점)`,
    notes: [`${roundPhrase("ROUND", 1)} ${ex.text}`, "ROUND, AVERAGEIFS 함수 사용"],
    accept: [
      `=ROUND(AVERAGEIFS(${vR},${c2},"${posA}",${c1},"${clubA}"),1)`, // 조건 순서 교체
    ],
  };
}

export const TEMPLATE_A2 = {
  subtype: "A-2",
  variants: [
    { id: "a2-daverage-round", difficulty: "기본", plan: daverageRound },
    { id: "a2-averageif-round", difficulty: "기본", plan: averageifRound },
    { id: "a2-daverage-diff", difficulty: "어려움", plan: daverageDiff },
    { id: "a2-averageifs-round", difficulty: "어려움", plan: averageifsRound },
  ],
};
