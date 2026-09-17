// src/data/exam/calc/templates/B-2.js
// 문자 추출 조건 (LEFT/RIGHT/MID + IF/CHOOSE/MOD). 변형 5개. 모두 열 채우기(텍스트 결과).
import { NAMES } from "../pools.js";
import { TOPICS, pick } from "../topics.js";
import { geom, josa } from "./_util.js";

const L = "ABCDEFGHJKMNPQRST".split("");
const rl = (rng) => L[rng.int(L.length)];
const rd = (rng) => rng.int(10);
// required(반드시 포함할 판정값들)를 N 안에 모두 넣고 fill 로 채운 뒤 섞는다(분기 누락 방지).
function judgesReq(rng, N, required, fill) {
  if (required.length > N) throw new Error("required > N");
  const arr = required.slice();
  while (arr.length < N) arr.push(fill(rng));
  return rng.shuffle(arr);
}
// MID(x,4,1) 판정용 코드: LL-[판정][d][d]-L (인접 자리는 판정과 다른 종류 → MID±1 이 값으로 잡힘)
const midCode = (rng, j) => `${rl(rng)}${rl(rng)}-${j}${rd(rng)}${rd(rng)}-${rl(rng)}`;
const distinctCodes = (rng, js, mk) => { const seen = new Set(); return js.map((j) => { let c; do { c = mk(rng, j); } while (seen.has(c)); seen.add(c); return c; }); };

// 1) b2-if-right [기본] — IF(RIGHT(x,1)=...)
function b2IfRight(rng) {
  const N = 7 + rng.int(4);
  const B = pick(rng, TOPICS.b2Dept);   // 코드 열·결과 열·결과 값이 한 주제
  const [d1, d2, d3] = B.vals;
  const headers = [B.code, "성명", B.res];
  const js = judgesReq(rng, N, [1, 1, 2, 2, 3 + rng.int(7), 3 + rng.int(7)], (r) => [1, 2, 3 + r.int(7)][r.int(3)]);
  const codes = distinctCodes(rng, js, (r, j) => `${2020 + r.int(7)}-${1 + r.int(8)}-${100 + r.int(900)}${j}`);
  const names = rng.sample(NAMES, N);
  const rows = codes.map((c, i) => [c, names[i], null]);
  const g = geom(headers, N), x = g.dataCell(B.code, 0);
  return {
    subtype: "B-2", colWidths: [12, 8, 8], headers, rows, codeColumns: [B.code], _topic: { pool: "b2Dept", id: B.id },
    result: { kind: "fillCol", col: B.res },
    discriminators: [{ name: "끝1=1", test: (r) => String(r[0]).slice(-1) === "1", min: 1, max: N }, { name: "끝1=2", test: (r) => String(r[0]).slice(-1) === "2", min: 1, max: N }],
    answer: `=IF(RIGHT(${x},1)="1","${d1}",IF(RIGHT(${x},1)="2","${d2}","${d3}"))`,
    functions: { required: ["IF", "RIGHT"], candidates: null },
    text: `[{표}]에서 ${B.code}[{col:${B.code}}]의 오른쪽 한 글자가 "1"이면 "${d1}", "2"이면 "${d2}", 그 외에는 "${d3}"${josa(d3, "으로/로")} ${B.res}[{R}]에 표시하시오. (8점)`,
    notes: ["IF, RIGHT 함수 사용"],
    accept: [`=IF(RIGHT(${x},1)="1","${d1}",IF(RIGHT(${x},1)="2","${d2}","${d3}"))`],
    reject: [{ formula: `=IF(RIGHT(${x},1)=1,"${d1}",IF(RIGHT(${x},1)=2,"${d2}","${d3}"))`, expectReason: "value" }],
  };
}

// 2) b2-if-left [기본] — IF(LEFT(x,1)=대문자)
function b2IfLeft(rng) {
  const N = 7 + rng.int(4);
  const headers = ["제품코드", "제품명", "등급"];
  const other = (r) => L[2 + r.int(L.length - 2)];
  const js = judgesReq(rng, N, ["A", "A", "B", "B", other(rng), other(rng)], (r) => ["A", "B", other(r)][r.int(3)]);
  const codes = distinctCodes(rng, js, (r, j) => `${j}-${2000 + r.int(999)}`);
  const prod = distinctCodes(rng, js.map(() => 0), (r) => `제품${rl(r)}${rl(r)}`);
  const rows = codes.map((c, i) => [c, prod[i], null]);
  const g = geom(headers, N), x = g.dataCell("제품코드", 0);
  return {
    subtype: "B-2", colWidths: [10, 8, 6], headers, rows, codeColumns: ["제품코드", "제품명"],
    result: { kind: "fillCol", col: "등급" },
    discriminators: [{ name: "앞1=A", test: (r) => String(r[0])[0] === "A", min: 1, max: N }, { name: "앞1=B", test: (r) => String(r[0])[0] === "B", min: 1, max: N }],
    answer: `=IF(LEFT(${x},1)="A","우수",IF(LEFT(${x},1)="B","양호","보통"))`,
    functions: { required: ["IF", "LEFT"], candidates: null },
    text: `[{표}]에서 제품코드[{col:제품코드}]의 왼쪽 한 글자가 "A"이면 "우수", "B"이면 "양호", 그 외에는 "보통"으로 등급[{R}]에 표시하시오. (8점)`,
    notes: ["IF, LEFT 함수 사용"],
    accept: [`=IF(LEFT(${x},1)="A","우수",IF(LEFT(${x},1)="B","양호","보통"))`],
  };
}

// 3) b2-choose-mid-repeat [어려움] — CHOOSE(MID) 인수 반복("그 외에는 …")
function b2ChooseMidRepeat(rng) {
  const N = 7 + rng.int(4);
  const headers = ["회원코드", "성명", "관심분야"];
  const js = judgesReq(rng, N, [1, 1, 2, 2, 3, 3, 4, 5], (r) => 1 + r.int(5)); // 인덱스 1~5 전부(4·5 반복 구간)
  const codes = distinctCodes(rng, js, midCode);
  const names = rng.sample(NAMES, N);
  const rows = codes.map((c, i) => [c, names[i], null]);
  const g = geom(headers, N), x = g.dataCell("회원코드", 0);
  const [h1, h2, h3, h4] = pick(rng, TOPICS.hobbySets);   // 가구/도서/요리/손글씨 대체
  return {
    subtype: "B-2", colWidths: [10, 8, 8], headers, rows, codeColumns: ["회원코드"],
    result: { kind: "fillCol", col: "관심분야" },
    discriminators: [{ name: "4번째=1", test: (r) => String(r[0])[3] === "1", min: 1, max: N }, { name: "4번째=4|5", test: (r) => ["4", "5"].includes(String(r[0])[3]), min: 1, max: N }],
    answer: `=CHOOSE(MID(${x},4,1),"${h1}","${h2}","${h3}","${h4}","${h4}")`,
    functions: { required: ["CHOOSE", "MID"], candidates: null },
    text: `[{표}]에서 회원코드[{col:회원코드}]의 네 번째 문자가 "1"이면 "${h1}", "2"이면 "${h2}", "3"이면 "${h3}", "4"나 "5"이면 "${h4}"${josa(h4, "으로/로")} 관심분야[{R}]에 표시하시오. (8점)`,
    notes: ["CHOOSE, MID 함수 사용"],
    accept: [`=CHOOSE(MID(${x},4,1),"${h1}","${h2}","${h3}","${h4}","${h4}")`],
  };
}

// 4) b2-iferror-choose-mid [어려움] — 범위 밖은 공백
function b2IferrorChooseMid(rng) {
  const N = 8 + rng.int(3);
  const headers = ["관리코드", "성명", "구분"];
  const oob = (r) => r.chance(0.5) ? 0 : 5 + r.int(5);
  const js = judgesReq(rng, N, [1, 2, 3, 4, oob(rng), oob(rng)], (r) => [1, 2, 3, 4, oob(r)][r.int(5)]); // 인덱스 1~4 + 범위밖 2개
  const codes = distinctCodes(rng, js, midCode);
  const names = rng.sample(NAMES, N);
  const rows = codes.map((c, i) => [c, names[i], null]);
  const g = geom(headers, N), x = g.dataCell("관리코드", 0);
  return {
    subtype: "B-2", colWidths: [10, 8, 6], headers, rows, codeColumns: ["관리코드"],
    result: { kind: "fillCol", col: "구분" },
    discriminators: [{ name: "4번째=1|3", test: (r) => ["1", "3"].includes(String(r[0])[3]), min: 1, max: N }, { name: "4번째=범위밖", test: (r) => { const d = +String(r[0])[3]; return !(d >= 1 && d <= 4); }, min: 1, max: N }],
    answer: `=IFERROR(CHOOSE(MID(${x},4,1),"A조","B조","A조","B조"),"")`,
    functions: { required: ["IFERROR", "CHOOSE", "MID"], candidates: null },
    text: `[{표}]에서 관리코드[{col:관리코드}]의 네 번째 문자가 "1"이나 "3"이면 "A조", "2"나 "4"이면 "B조", 그 외에는 공백을 구분[{R}]에 표시하시오. (8점)`,
    notes: ["CHOOSE, IFERROR, MID 함수 사용"],
    accept: [`=IFERROR(CHOOSE(MID(${x},4,1),"A조","B조","A조","B조"),"")`],
  };
}

// 5) b2-mod-mid [어려움] — IF(MOD(MID,2)=1,...)
function b2ModMid(rng) {
  const N = 8 + rng.int(3);
  const headers = ["사원코드", "성명", "구분"];
  // 홀수 2·짝수 2·0(짝수)·mod2≠mod3 판별 숫자(3·5·9·4) 1개 → 자릿수 2→3 변형이 값으로 잡힘
  const js = judgesReq(rng, N, [1, 7, 2, 8, 0, [3, 5, 9, 4][rng.int(4)]], (r) => r.int(10));
  const codes = distinctCodes(rng, js, midCode);
  const names = rng.sample(NAMES, N);
  const rows = codes.map((c, i) => [c, names[i], null]);
  const g = geom(headers, N), x = g.dataCell("사원코드", 0);
  return {
    subtype: "B-2", colWidths: [10, 8, 6], headers, rows, codeColumns: ["사원코드"],
    result: { kind: "fillCol", col: "구분" },
    discriminators: [{ name: "4번째=홀수", test: (r) => +String(r[0])[3] % 2 === 1, min: 1, max: N }, { name: "4번째=짝수", test: (r) => +String(r[0])[3] % 2 === 0, min: 1, max: N }],
    answer: `=IF(MOD(MID(${x},4,1),2)=1,"홀수조","짝수조")`,
    functions: { required: ["IF", "MID", "MOD"], candidates: null },
    text: `[{표}]에서 사원코드[{col:사원코드}]의 네 번째 문자가 홀수이면 "홀수조", 짝수이면 "짝수조"로 구분[{R}]에 표시하시오. (8점)`,
    notes: ["IF, MID, MOD 함수 사용"],
    accept: [`=IF(MOD(MID(${x},4,1),2)=1,"홀수조","짝수조")`],
  };
}

export const TEMPLATE_B2 = {
  subtype: "B-2",
  variants: [
    { id: "b2-if-right", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["RIGHT"], plan: b2IfRight },
    { id: "b2-if-left", difficulty: "기본", resultKind: "fillCol", usesD: false, core: ["LEFT"], plan: b2IfLeft },
    { id: "b2-choose-mid-repeat", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["CHOOSE", "MID"], plan: b2ChooseMidRepeat },
    { id: "b2-iferror-choose-mid", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["CHOOSE", "MID"], plan: b2IferrorChooseMid },
    { id: "b2-mod-mid", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["MOD", "MID"], plan: b2ModMid },
  ],
};
