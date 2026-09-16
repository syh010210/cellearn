// src/data/exam/calc/templates/A-1.js
// 조건 개수·비율 (COUNTIF / COUNTIFS / DCOUNTA). 변형 4개. 모두 단일 셀.
import { NAMES, MALE_NAMES, FEMALE_NAMES, REGIONS, MAJORS } from "../pools.js";
import { geom, assertRangesClean, COL } from "./_util.js";

const distinctInts = (rng, n, lo, hi, ex = []) => { const s = new Set(ex); const out = []; let g = 0; while (out.length < n && g++ < 800) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("distinctInts 부족"); return out; };
const seq = (n, p = "P") => Array.from({ length: n }, (_, i) => p + String(101 + i));

// 1) a1-ratio [기본] — COUNTIF("<>서울")/COUNTA
function a1Ratio(rng) {
  const N = 7 + rng.int(4);
  const headers = ["참가번호", "성명", "지역"];
  const v = "서울", others = REGIONS.filter((r) => r !== v);
  const nSeoul = 2 + rng.int(3);                   // 서울 2~4개, 위치 완전 무작위
  const posSet = new Set(rng.sample([...Array(N).keys()], nSeoul));
  const region = Array.from({ length: N }, (_, i) => (posSet.has(i) ? v : rng.pick(others)));
  const names = rng.sample(NAMES, N), no = seq(N);
  const rows = region.map((rg, i) => [no[i], names[i], rg]);
  const g = geom(headers, N), rA = g.colAbs("지역"), rM = g.colRowFixed("지역");
  return {
    subtype: "A-1", colWidths: [8, 8, 8], headers, rows, codeColumns: ["참가번호"],
    matchDecls: [{ col: "지역", value: v, min: 2, max: 4 }],
    result: { kind: "single", label: "서울 외 참가자 비율" },
    answer: `=COUNTIF(${rA},"<>${v}")/COUNTA(${rA})`,
    functions: { required: ["COUNTIF", "COUNTA"], candidates: null },
    text: `[{표}]에서 지역[{col:지역}]이 "${v}"이 아닌 참가자의 비율을 [{R}] 셀에 계산하시오. (8점)`,
    notes: [`비율 = "${v}"이 아닌 참가자 수 / 전체 참가자 수`, "COUNTIF, COUNTA 함수 사용"],
    accept: [`=COUNTIF(${rM},"<>${v}")/COUNTA(${rM})`],
  };
}

// 2) a1-countifs [기본] — COUNTIFS(...)&"명" (후보형)
function a1Countifs(rng) {
  const N = 9 + rng.int(2);
  const headers = ["수험번호", "성명", "필기", "면접"];
  const n = 60 + 5 * rng.int(6), m = 55 + 5 * rng.int(5); // 기준값 시드화(60~85 / 55~75)
  const cl = (x) => Math.max(40, Math.min(99, x));
  // 경계·한 조건만 행을 시드값에서 만들고 나머지와 섞는다
  const key = [
    [n, cl(m + 5 + rng.int(10))],                      // 둘 다(필기 경계 ==n)
    [cl(n + 5 + rng.int(10)), m],                      // 둘 다(면접 경계 ==m)
    [cl(n + rng.int(12)), cl(m - 6 - rng.int(8))],     // 필기만
    [cl(n - 6 - rng.int(8)), cl(m + rng.int(12))],     // 면접만
  ];
  const filler = Array.from({ length: N - 4 }, () => [cl(40 + rng.int(59)), cl(40 + rng.int(59))]);
  const sc = rng.shuffle([...key, ...filler]);          // 위치 무작위
  const names = rng.sample(NAMES, N), no = seq(N, "S");
  const rows = sc.map((s, i) => [no[i], names[i], s[0], s[1]]);
  const cnt = sc.filter((s) => s[0] >= n && s[1] >= m).length;
  const only1 = sc.filter((s) => s[0] >= n && s[1] < m).length, only2 = sc.filter((s) => s[1] >= m && s[0] < n).length;
  if (cnt < 2 || only1 < 1 || only2 < 1) throw new Error("분포 부족");
  if (!sc.some((s) => s[0] === n) || !sc.some((s) => s[1] === m)) throw new Error("경계 행 없음");
  const g = geom(headers, N), pil = g.colAbs("필기"), myn = g.colAbs("면접");
  const answer = `=COUNTIFS(${pil},">=${n}",${myn},">=${m}")&"명"`;
  assertRangesClean(headers, rows, undefined, answer);   // 범위 확장·축소(정렬 어긋남) 생존 방지
  let exN; do { exN = 2 + rng.int(N - 2); } while (exN === cnt); // 표시 예 N ≠ 실제 합격자 수
  return {
    subtype: "A-1", colWidths: [8, 8, 6, 6], headers, rows, codeColumns: ["수험번호"], verbException: "계산",
    result: { kind: "single", label: "합격자 수" },
    answer,
    discriminators: [{ name: `필기=${n}(경계)`, test: (r) => r[2] === n, min: 1, max: N }],
    functions: { required: [], candidates: ["AVERAGEIFS", "SUMIFS", "COUNTIFS"] },
    text: `[{표}]에서 필기[{col:필기}]가 ${n} 이상이고 면접[{col:면접}]이 ${m} 이상인 합격자 수를 [{R}] 셀에 계산하시오. (8점)`,
    notes: [`계산된 합격자 수 뒤에 "명"을 포함하여 표시 [표시 예 : ${exN}명]`, "AVERAGEIFS, SUMIFS, COUNTIFS 중 알맞은 함수와 & 연산자 사용"],
    accept: [`=COUNTIFS(${g.colRowFixed("필기")},">=${n}",${g.colRowFixed("면접")},">=${m}")&"명"`],
  };
}

// 3) a1-dcounta-or [어려움] — DCOUNTA + OR 2행 조건
function a1DcountaOr(rng) {
  const N = 8 + rng.int(3);
  const headers = ["성명", "성별", "학과"];
  const gv = "남성", mv = "항공과";
  const oMaj = MAJORS.filter((x) => x !== mv);
  const nMale = 3 + rng.int(3);                     // 남성 3~5(둘 다 포함)
  const nAir = 2 + rng.int(2);                      // 항공과 2~3(둘 다 포함)
  const types = ["both"];                            // 둘 다 1개
  for (let i = 0; i < nMale - 1; i++) types.push("maleOnly");
  for (let i = 0; i < nAir - 1; i++) types.push("airOnly");
  while (types.length < N) types.push("neither");
  const arr0 = rng.shuffle(types).map((t) => {
    const male = t === "both" || t === "maleOnly";
    const air = t === "both" || t === "airOnly";
    return [male ? gv : "여성", air ? mv : rng.pick(oMaj), male];
  });
  // 표 축소가 값을 바꾸려면 마지막 행이 조건 대상이어야 하나, 위치는 무작위로 두고
  // assertRangesClean 이 아니면 재시도하게 한다(위치 편중 방지).
  const males = rng.sample(MALE_NAMES, arr0.filter((r) => r[2]).length);
  const females = rng.sample(FEMALE_NAMES, arr0.filter((r) => !r[2]).length);
  let mi = 0, fi = 0;
  const rows = arr0.map((r) => [r[2] ? males[mi++] : females[fi++], r[0], r[1]]);
  const arr = arr0.map((r) => [r[0], r[1]]);
  const g = geom(headers, N), crit = g.critRange(2, 2), att = g.attCol0;
  const answer = `=DCOUNTA(${g.dbAllAbs()},${g.header("성명")},${crit})&"명"`;
  // 조건 셀을 놓고 범위 mutant(표 축소·조건 축소) 자체 검증 (필드 불변 mutant 는 규칙이 처리)
  const extra = { [COL(att) + "1"]: "성별", [COL(att + 1) + "1"]: "학과", [COL(att) + "2"]: gv, [COL(att + 1) + "3"]: mv };
  assertRangesClean(headers, rows, undefined, answer, extra);
  const cnt = arr.filter((r) => r[0] === gv || r[1] === mv).length;
  let exN; do { exN = 2 + rng.int(N - 2); } while (exN === cnt);
  return {
    subtype: "A-1", colWidths: [8, 6, 8], headers, rows, verbException: "계산",
    matchDecls: [{ col: "성별", value: gv, min: 3, max: 5 }, { col: "학과", value: mv, min: 2, max: 3 }],
    result: { kind: "single", label: "인원 수" },
    answer,
    criteria: { headers: ["성별", "학과"], rows: [[gv, ""], ["", mv]], rowOffset: 0 },
    functions: { required: ["DCOUNTA"], candidates: null },
    text: `[{표}]에서 성별[{col:성별}]이 "${gv}"이거나 학과[{col:학과}]가 "${mv}"인 인원 수를 [{R}] 셀에 계산하시오. (8점)`,
    notes: [`계산된 인원 수 뒤에 "명"을 포함하여 표시 [표시 예 : ${exN}명]`, "조건은 [{C}] 영역에 알맞게 입력", "DCOUNTA 함수와 & 연산자 사용"],
    accept: [`=DCOUNTA(${g.dbAllAbs()},1,${crit})&"명"`, `=DCOUNTA(${g.dbAllAbs()},${g.header("성별")},${crit})&"명"`],
  };
}

// 4) a1-countifs-avg [어려움] — COUNTIFS(">="&AVERAGE(r),...)&"명"
function a1CountifsAvg(rng) {
  const N = 8 + rng.int(3);
  const headers = ["성명", "점수", "반"];            // 2번째 조건은 점수와 무관한 열(반)
  const C = 70 + rng.int(10);                       // 평균이 될 중심값
  const pool = rng.shuffle([-15, -12, -9, -7, -5, -3, 3, 5, 7, 9, 12, 15, -4, 4, -8, 8]);
  const offs = [0]; for (let i = 0; i < N - 2; i++) offs.push(pool[i]);
  offs.push(-offs.reduce((a, b) => a + b, 0));
  if (new Set(offs).size !== offs.length) throw new Error("오프셋 중복");
  const scores = offs.map((o) => C + o);            // 평균 정확히 C, 점수 하나는 C(>= vs > 구분)
  if (scores.some((s) => s < 40 || s > 99)) throw new Error("점수 범위");
  const others = ["2반", "3반"];
  const ban = scores.map((s) => (s >= C ? (rng.chance(0.6) ? "1반" : rng.pick(others)) : (rng.chance(0.4) ? "1반" : rng.pick(others))));
  if (!scores.some((s, i) => s < C && ban[i] === "1반")) ban[scores.findIndex((s) => s < C)] = "1반"; // 2번째 조건만 맞는 행
  if (!scores.some((s, i) => s >= C && ban[i] === "1반")) ban[scores.findIndex((s) => s >= C)] = "1반";
  const names = rng.sample(NAMES, N);
  const rows = scores.map((s, i) => [names[i], s, ban[i]]);
  const g = geom(headers, N), jA = g.colAbs("점수"), bA = g.colAbs("반");
  const answer = `=COUNTIFS(${jA},">="&AVERAGE(${jA}),${bA},"1반")&"명"`;
  assertRangesClean(headers, rows, undefined, answer);
  const cnt = scores.filter((s, i) => s >= C && ban[i] === "1반").length;
  let exN; do { exN = 2 + rng.int(N - 2); } while (exN === cnt);
  return {
    subtype: "A-1", colWidths: [8, 6, 6], headers, rows, verbException: "계산",
    result: { kind: "single", label: "인원 수" },
    answer,
    discriminators: [{ name: "점수>=평균&1반", test: (r) => r[1] >= C && r[2] === "1반", min: 1, max: N, allowFixed: "lastRow", reason: "평균 경계(점수=평균) 행을 첫 행에 고정(>= vs > 판별)" }],
    functions: { required: ["COUNTIFS", "AVERAGE"], candidates: null },
    text: `[{표}]에서 점수[{col:점수}]가 점수의 평균 이상이고 반[{col:반}]이 "1반"인 인원 수를 [{R}] 셀에 계산하시오. (8점)`,
    notes: [`계산된 인원 수 뒤에 "명"을 포함하여 표시 [표시 예 : ${exN}명]`, "COUNTIFS, AVERAGE 함수와 & 연산자 사용"],
    accept: [`=COUNTIFS(${g.colRowFixed("점수")},">="&AVERAGE(${g.colRowFixed("점수")}),${g.colRowFixed("반")},"1반")&"명"`],
  };
}

export const TEMPLATE_A1 = {
  subtype: "A-1",
  variants: [
    { id: "a1-ratio", difficulty: "기본", plan: a1Ratio },
    { id: "a1-countifs", difficulty: "기본", plan: a1Countifs },
    { id: "a1-dcounta-or", difficulty: "어려움", plan: a1DcountaOr },
    { id: "a1-countifs-avg", difficulty: "어려움", plan: a1CountifsAvg },
  ],
};
