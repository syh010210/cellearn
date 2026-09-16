// scripts/calc-parity-gen.mjs
// 엔진 ↔ 엑셀 대조용 parity.xlsx 생성. (사람이 엑셀에서 열어 전체 재계산 후 parity.answer.xlsx 로 저장)
//
// 배치:
//  · 사례 영역 : A열 ID, B열 수식(값 없이 f만), C열 설명, D열 범주 (1행 헤더, 2행부터)
//  · 입력 영역 : H열~ (사례와 열이 겹치지 않음). 날짜·시간은 serial 숫자 + 표시형식(z), 텍스트 숫자는 t:'s'.
//  · 파일 기록 시 RANK.EQ·STDEV.S·MODE.SNGL·DAYS 에는 _xlfn. 접두를 붙인다(addXlfn).
//  · workbook calcPr.fullCalcOnLoad 를 켜고, 수식 셀은 캐시값 없이 f 만 기록 → 엑셀이 열 때 재계산.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";
import JSZip from "jszip";
import { addXlfn } from "../src/data/exam/calc/functions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "trial_test", "calc-parity", "parity.xlsx");

const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
const tser = (h, m, s) => (h * 3600 + m * 60 + s) / 86400;

const cells = {};
const S = (addr, v, opts = {}) => { cells[addr] = { ...opts, v }; };        // 값 셀
const Snum = (addr, n, z) => { cells[addr] = { t: "n", v: n, ...(z ? { z } : {}) }; };
const Stext = (addr, s) => { cells[addr] = { t: "s", v: String(s) }; };     // 텍스트(숫자처럼 보여도 t:'s')
// 수식 셀: SheetJS 는 캐시값(v) 없는 수식 셀을 기록에서 누락하므로 placeholder v=0 을 넣고,
// 파일 후처리에서 캐시값 <v> 를 제거해 엑셀이 열 때 반드시 재계산하게 한다.
const Sfml = (addr, f) => { cells[addr] = { t: "n", v: 0, f: addXlfn(String(f).replace(/^=/, "")) }; };

// ─────────── 입력 영역 ───────────
// 조건집계·순위·통계·D함수 표 (DB = H1:N10). 기록(O)·혼합(P)은 순위·통계용.
const HDR = ["이름", "반", "지역", "국어", "영어", "합계", "평가", "기록", "혼합"];
["H", "I", "J", "K", "L", "M", "N", "O", "P"].forEach((c, i) => Stext(`${c}1`, HDR[i]));
const ROWS = [
  // 이름, 반, 지역, 국어, 영어, 평가, 기록, 혼합
  ["김하늘", "1반", "서울",   90, 85, "우수", 12.5, 3],
  ["이준서", "2반", "부산",   70, 60, "",     14.2, 5],
  ["박서연", "1반", "서울시", 88, 92, "우수", 11.8, "결시"],
  ["최민재", "3반", "대구",   55, 48, "",     15.0, 5],
  ["정예은", "2반", "부산",  100, 95, "우수", null, 7],   // 기록 blank(실격)
  ["강도윤", "1반", "서울",   60, 72, "",     13.1, null], // 혼합 blank
  ["윤지우", "3반", "대구",   45, 50, "",     16.4, 5],
  ["임채원", "2반", "부산",   78, 81, "",     12.0, 2],
  ["오시원", "1반", "대구",   85, 66, "",     13.9, 9],
];
ROWS.forEach((r, i) => {
  const R = i + 2;
  Stext(`H${R}`, r[0]); Stext(`I${R}`, r[1]); Stext(`J${R}`, r[2]);
  Snum(`K${R}`, r[3]); Snum(`L${R}`, r[4]);
  Sfml(`M${R}`, `=K${R}+L${R}`);                 // 중간 계산 수식(합계)
  if (r[5] !== "") Stext(`N${R}`, r[5]);
  if (r[6] != null) Snum(`O${R}`, r[6]);         // 기록 (blank 은 미기록)
  if (r[7] != null) (typeof r[7] === "number" ? Snum(`P${R}`, r[7]) : Stext(`P${R}`, r[7]));
});

// D함수 조건 범위들
Stext("Q1", "반"); Stext("Q2", "1반");                         // 단일
Stext("R1", "지역"); Stext("R2", "서울"); Stext("R3", "부산"); // OR (2행)
Stext("S1", "반"); Stext("T1", "지역"); Stext("S2", "1반"); Stext("T2", "서울"); // AND(같은 행)
Stext("U1", "지역"); Stext("U2", "서울");                       // 접두 일치(서울 → 서울,서울시)
Stext("V1", "반"); Stext("V2", "=1반");                         // 정확 일치
Stext("W1", "지역"); Stext("W2", "대*");                        // 와일드카드
Stext("X1", "반"); Stext("X2", "4반");                          // 일치 없음

// 참조표(가로 등급표) H12:K13
["A", "B", "C", "D"].forEach((c, i) => Stext(`${["H", "I", "J", "K"][i]}12`, c));
["우수", "보통", "미흡", "재수강"].forEach((c, i) => Stext(`${["H", "I", "J", "K"][i]}13`, c));
// 참조표(세로 학과표) 데이터 H16:I19 (헤더 H15:I15)
Stext("H15", "코드"); Stext("I15", "학과");
[["CS", "컴퓨터"], ["EE", "전자"], ["ME", "기계"], ["BA", "경영"]].forEach((r, i) => { Stext(`H${16 + i}`, r[0]); Stext(`I${16 + i}`, r[1]); });
// 구간표(근사) H22:L23 : 하한 오름차순 + 학점
[0, 60, 70, 80, 90].forEach((n, i) => Snum(`${["H", "I", "J", "K", "L"][i]}22`, n));
["F", "D", "C", "B", "A"].forEach((c, i) => Stext(`${["H", "I", "J", "K", "L"][i]}23`, c));
// 텍스트 원본 H26:H31
Stext("H26", "ami6019d"); Stext("H27", "ELP-2020"); Stext("H28", "james brown");
Stext("H29", "MIA park"); Stext("H30", "03"); Stext("H31", "001");
// 날짜(serial) H33:H36 + 기준일 J33
Snum("H33", serial(2026, 1, 15), "yyyy-mm-dd");
Snum("H34", serial(2026, 3, 1), "yyyy-mm-dd");   // 일요일
Snum("H35", serial(2026, 5, 30), "yyyy-mm-dd");  // 토요일
Snum("H36", serial(2026, 12, 25), "yyyy-mm-dd");
Snum("J33", serial(2026, 6, 15), "yyyy-mm-dd");
// 시간(serial 소수) H39:H41
Snum("H39", tser(9, 15, 20), "h:mm:ss");
Snum("H40", tser(17, 45, 50), "h:mm:ss");
Snum("H41", tser(8, 45, 0), "h:mm:ss");

// ─────────── 사례 (12 범주) ───────────
// [id, 범주, 수식, 설명]
const C = [];
const add = (cat, f, desc) => C.push([`${cat}-${String(C.filter((x) => x[3 - 2] === cat).length + 1).padStart(2, "0")}`, cat, f, desc]);
// 위 add 의 id 카운트가 헷갈리므로 범주별 카운터를 명시적으로 관리
const cnt = {};
const K = (cat, f, desc) => { cnt[cat] = (cnt[cat] || 0) + 1; C.push([`c${cat}-${String(cnt[cat]).padStart(2, "0")}`, cat, f, desc]); };

// 1. 조건 함수
K(1, '=COUNTIF(I2:I10,"1반")', "COUNTIF 반=1반");
K(1, '=COUNTIF(J2:J10,"<>서울")', "COUNTIF <>서울(정확)");
K(1, '=COUNTIF(J2:J10,"서*")', "COUNTIF 와일드카드 서*");
K(1, '=COUNTIF(H2:H10,"*원")', "COUNTIF 끝 '원'");
K(1, '=COUNTIFS(I2:I10,"1반",J2:J10,"서울")', "COUNTIFS 1반+서울(정확)");
K(1, '=COUNTIFS(K2:K10,">=80")', "COUNTIFS 국어>=80");
K(1, '=COUNTIF(K2:K10,">="&AVERAGE(K2:K10))', ">=평균");
K(1, '=SUMIF(J2:J10,"부산",K2:K10)', "SUMIF 부산 국어합");
K(1, '=SUMIFS(K2:K10,I2:I10,"1반",J2:J10,"서울")', "SUMIFS 1반+서울 국어합");
K(1, '=AVERAGEIF(I2:I10,"2반",L2:L10)', "AVERAGEIF 2반 영어평균");
K(1, '=AVERAGEIFS(K2:K10,I2:I10,"3반")', "AVERAGEIFS 3반 국어평균");
K(1, '=AVERAGEIF(I2:I10,"4반",K2:K10)', "AVERAGEIF 일치없음 → #DIV/0!");
K(1, '=COUNTIF(H26:H31,"AMI6019D")', "COUNTIF 대소문자 무시");
K(1, '=COUNTIF(K2:K10,90)', "COUNTIF 숫자 일치");

// 2. D함수
K(2, '=DCOUNTA(H1:N10,"이름",U1:U2)', "DCOUNTA 접두일치(서울→서울,서울시)");
K(2, '=DCOUNTA(H1:N10,"이름",V1:V2)', 'DCOUNTA "=1반" 정확');
K(2, '=DCOUNT(H1:N10,"국어",Q1:Q2)', "DCOUNT 국어 1반");
K(2, '=DCOUNT(H1:N10,"평가",Q1:Q2)', "DCOUNT 문자필드 → 0");
K(2, '=DCOUNTA(H1:N10,"평가",Q1:Q2)', "DCOUNTA 문자필드");
K(2, '=DAVERAGE(H1:N10,"국어",Q1:Q2)', "DAVERAGE 필드=문자열");
K(2, '=DAVERAGE(H1:N10,4,Q1:Q2)', "DAVERAGE 필드=번호");
K(2, '=DAVERAGE(H1:N10,K1,Q1:Q2)', "DAVERAGE 필드=머리글셀");
K(2, '=DSUM(H1:N10,"국어",R1:R3)', "DSUM OR(서울/부산)");
K(2, '=DMAX(H1:N10,"국어",Q1:Q2)', "DMAX 1반 국어");
K(2, '=DMIN(H1:N10,"영어",S1:T2)', "DMIN AND(1반+서울)");
K(2, '=DCOUNTA(H1:N10,"이름",W1:W2)', "DCOUNTA 와일드카드 대*");
K(2, '=DCOUNTA(H1:N10,"이름",X1:X2)', "DCOUNTA 일치없음 → 0");

// 3. 순위
K(3, "=_R_(O2,O2:O10)", "RANK.EQ 내림");            // placeholder replaced below
K(3, "=_R_(O2,O2:O10,1)", "RANK.EQ 오름");
K(3, "=_R_(O5,O2:O10)", "RANK.EQ 빈 셀 참조(O6 blank via 정예은)");
K(3, "=LARGE(O2:O10,2)", "LARGE k=2");
K(3, "=SMALL(O2:O10,3)", "SMALL k=3");
K(3, "=LARGE(O2:O10,20)", "LARGE k 초과 → #NUM!");
K(3, "=_R_(M2,M2:M10)", "RANK.EQ 합계 내림");
K(3, "=SMALL(M2:M10,1)", "SMALL k=1 = 최소");
// RANK.EQ 표기 치환(가독성용 placeholder → 실제 함수). 빈 셀은 정예은 행(6행)의 O6.
C.forEach((r) => { r[2] = r[2].replace(/_R_\(/g, "RANK.EQ(").replace("O5,O2:O10)", "O6,O2:O10)"); });

// 4. CHOOSE
K(4, '=CHOOSE(RIGHT("A2",1),"가","나")', "CHOOSE RIGHT 텍스트인덱스");
K(4, '=CHOOSE(MID("X3Y",2,1),"a","b","c")', "CHOOSE MID 텍스트인덱스");
K(4, '=CHOOSE(0,"a","b")', "CHOOSE 0 → #VALUE!");
K(4, '=CHOOSE(5,"a","b")', "CHOOSE 범위밖 → #VALUE!");
K(4, '=CHOOSE(2.9,"a","b","c")', "CHOOSE 소수 인덱스(절사)");
K(4, '=CHOOSE(WEEKDAY(H33),"일","월","화","수","목","금","토")', "CHOOSE+WEEKDAY");

// 5. 텍스트
K(5, '=LEFT("abc",10)', "LEFT 길이초과");
K(5, '=RIGHT("abc",10)', "RIGHT 길이초과");
K(5, '=MID("abc",5,2)', "MID 시작초과 → 빈문자열");
K(5, '=MID("ami6019d",4,4)', "MID 정상");
K(5, "=UPPER(H28)", "UPPER");
K(5, "=LOWER(H29)", "LOWER");
K(5, '=PROPER("kor-07 test")', "PROPER(숫자 섞임)");
K(5, '=0.1+0.2&""', "부동소수 결합 0.1+0.2");
K(5, "=VALUE(H30)", 'VALUE("03")');
K(5, '=("1")*1', '"1"*1');
K(5, '=("1"=1)', '"1"=1 비교');
K(5, '=MONTH(H33)&"/"&DAY(H33)', "월/일 결합");

// 6. 반올림
K(6, "=ROUND(2.675,2)", "ROUND(2.675,2)");
K(6, "=ROUND(-2.5,0)", "ROUND(-2.5,0)");
K(6, "=ROUNDUP(2.671,1)", "ROUNDUP");
K(6, "=ROUNDDOWN(2.679,1)", "ROUNDDOWN");
K(6, "=ROUND(1234.5,-1)", "ROUND 음수 자릿수");
K(6, "=TRUNC(-2.9)", "TRUNC 음수");
K(6, "=INT(-2.1)", "INT 음수");
K(6, "=MOD(-3,2)", "MOD 음수");
K(6, "=POWER(2,10)", "POWER");
K(6, "=ROUNDDOWN(AVERAGE(K2:K10),0)", "평균 내림");
K(6, "=ROUND(AVERAGE(L2:L10),1)", "평균 반올림");

// 7. 통계
K(7, "=STDEV.S(P2:P10)", "STDEV.S(문자·빈칸 섞임)");
K(7, "=AVERAGE(P2:P10)", "AVERAGE(숫자만)");
K(7, "=COUNT(P2:P10)", "COUNT");
K(7, "=COUNTA(P2:P10)", "COUNTA");
K(7, "=MODE.SNGL(P2:P10)", "MODE.SNGL 최빈 5");
K(7, "=MEDIAN(P2:P10)", "MEDIAN(홀수)");
K(7, "=MEDIAN(K2:K10)", "MEDIAN 국어(9개)");
K(7, "=MEDIAN(K2:K9)", "MEDIAN 짝수(8개)");
K(7, "=MODE.SNGL(K2:K10)", "MODE 반복없음 → #N/A");

// 8. 찾기
K(8, '=HLOOKUP("B",H12:K13,2,0)', "HLOOKUP 정확");
K(8, '=VLOOKUP("EE",H16:I19,2,0)', "VLOOKUP 정확");
K(8, '=VLOOKUP("AR",H16:I19,2,0)', "VLOOKUP 없음 → #N/A");
K(8, "=HLOOKUP(85,H22:L23,2,1)", "HLOOKUP 근사");
K(8, "=HLOOKUP(-5,H22:L23,2,1)", "HLOOKUP 최소미만 → #N/A");
K(8, "=HLOOKUP(90,H22:L23,2,1)", "HLOOKUP 경계 정확");
K(8, '=INDEX(I16:I19,MATCH("ME",H16:H19,0))', "INDEX/MATCH");
K(8, '=MATCH("BA",H16:H19,0)', "MATCH 정확");
K(8, "=MATCH(85,H22:L22,1)", "MATCH 근사");
K(8, "=VLOOKUP(90,H16:I19,2,0)", "숫자키 vs 텍스트 → #N/A");
K(8, '=HLOOKUP("b",H12:K13,2,0)', "HLOOKUP 대소문자 무시");
K(8, "=INDEX(H12:K13,2,3)", "INDEX 2차원");

// 9. 날짜
K(9, "=DATE(2026,3,5)", "DATE");
K(9, "=DATE(2026,13,1)", "DATE 월13 → 이월");
K(9, "=YEAR(H33)", "YEAR");
K(9, "=MONTH(H35)", "MONTH");
K(9, "=DAY(H36)", "DAY");
K(9, "=WEEKDAY(H34,1)", "WEEKDAY 유형1(일=1)");
K(9, "=WEEKDAY(H34,2)", "WEEKDAY 유형2(월=1)");
K(9, "=WORKDAY(H33,5)", "WORKDAY +5");
K(9, "=WORKDAY(H36,3)", "WORKDAY 주말걸침");
K(9, "=DAYS(J33,H33)", "DAYS");
K(9, "=H33+10", "날짜+정수");
K(9, '=MONTH(WORKDAY(H35,2))&"/"&DAY(WORKDAY(H35,2))', "WORKDAY 월/일 결합");

// 10. 시간
K(10, "=HOUR(H40-H39)", "HOUR(차)");
K(10, "=MINUTE(H40-H39)", "MINUTE(차)");
K(10, "=SECOND(H40-H39)", "SECOND(차)");
K(10, "=TIME(,2,)", "TIME 인수생략");
K(10, "=TIME(1,90,0)", "TIME 분초과");
K(10, "=HOUR(H41)", "HOUR");
K(10, "=H39+TIME(1,0,0)", "시각+1시간");
K(10, "=MINUTE(H41)", "MINUTE");

// 11. 논리·연산자
K(11, '=IF(K8>=60,"합격")', "IF 거짓인수 생략 → FALSE");
K(11, '=IFERROR(1/0,"")', "IFERROR → 빈문자열");
K(11, "=30%", "백분율 리터럴");
K(11, "=-2^2", "-2^2 우선순위");
K(11, '=("a"="A")', "문자 대소문자 비교");
K(11, "=1&2+3", "& 와 + 우선순위");
K(11, '=IF(AND(K2>=80,L2>=80),"우수","")', "IF+AND");
K(11, '=IF(OR(J2="서울",I2="3반"),"Y","N")', "IF+OR");
K(11, "=(Z1=0)", "빈 셀 = 0");
K(11, '=(Z1="")', '빈 셀 = ""');
K(11, '=IF(N3="","무","유")', "빈문자열 판정");

// 12. 빈 문자열 결과 (SheetJS 읽기 확인)
K(12, '=IF(K8>=60,"합격","")', "빈문자열 결과 IF");
K(12, '=""', "리터럴 빈문자열");
K(12, '=IFERROR(VLOOKUP("AR",H16:I19,2,0),"")', "IFERROR 빈문자열");
K(12, '=MID("abc",5,2)', "MID 빈문자열");
K(12, '=IF(1=2,"x","")', "IF 거짓 → 빈문자열");

// ─────────── 사례·헤더 기록 ───────────
Stext("A1", "ID"); Stext("B1", "수식"); Stext("C1", "설명"); Stext("D1", "범주");
C.forEach((row, i) => {
  const R = i + 2;
  Stext(`A${R}`, row[0]);
  Sfml(`B${R}`, row[2]);
  Stext(`C${R}`, row[3]);
  Snum(`D${R}`, row[1]);
});

// !ref 계산
let maxR = 1, maxC = 0;
for (const addr of Object.keys(cells)) { const { r, c } = XLSX.utils.decode_cell(addr); if (r > maxR) maxR = r; if (c > maxC) maxC = c; }
cells["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
cells["!cols"] = [{ wch: 10 }, { wch: 46 }, { wch: 30 }, { wch: 6 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, cells, "parity");
const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer", cellStyles: true });

// ── 후처리: 캐시값 제거 + fullCalcOnLoad + calcChain 제거 → 엑셀이 열 때 전체 재계산 ──
const zip = await JSZip.loadAsync(buf);
for (const name of Object.keys(zip.files)) {
  if (/^xl\/worksheets\/sheet\d+\.xml$/.test(name)) {
    let xml = await zip.file(name).async("string");
    xml = xml.replace(/(<f[^>]*>[^<]*<\/f>)<v>[^<]*<\/v>/g, "$1"); // 수식 셀의 캐시값 삭제
    zip.file(name, xml);
  }
}
let wbx = await zip.file("xl/workbook.xml").async("string");
wbx = /<calcPr[^>]*\/>/.test(wbx)
  ? wbx.replace(/<calcPr[^>]*\/>/, '<calcPr calcId="0" fullCalcOnLoad="1"/>')
  : wbx.replace("</workbook>", '<calcPr calcId="0" fullCalcOnLoad="1"/></workbook>');
zip.file("xl/workbook.xml", wbx);
if (zip.file("xl/calcChain.xml")) {
  zip.remove("xl/calcChain.xml");
  let ct = await zip.file("[Content_Types].xml").async("string");
  zip.file("[Content_Types].xml", ct.replace(/<Override PartName="\/xl\/calcChain\.xml"[^>]*\/>/, ""));
  let rels = await zip.file("xl/_rels/workbook.xml.rels").async("string");
  zip.file("xl/_rels/workbook.xml.rels", rels.replace(/<Relationship[^>]*calcChain\.xml"[^>]*\/>/, ""));
}
writeFileSync(OUT, await zip.generateAsync({ type: "nodebuffer" }));

// 요약
const byCat = {};
C.forEach((r) => { byCat[r[1]] = (byCat[r[1]] || 0) + 1; });
console.log("생성:", OUT);
console.log("총 사례:", C.length);
console.log("범주별:", Object.keys(byCat).sort((a, b) => a - b).map((k) => `${k}:${byCat[k]}`).join("  "));
