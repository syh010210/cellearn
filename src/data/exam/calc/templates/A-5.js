// src/data/exam/calc/templates/A-5.js
// 통계량 (STDEV / MODE.SNGL). 변형 2개. 모두 단일 셀.
//  · STDEV·MODE.SNGL 는 범위 앞 텍스트 머리글을 무시하므로 rangeExpand 생존은 survivorRules 의 AGG 규칙이 처리.
import { NAMES, PRODUCTS } from "../pools.js";
import { geom, roundPhrase, roundExample } from "./_util.js";

const distinctInts = (rng, n, lo, hi) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 800) { const v = rng.range(lo, hi); if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("distinctInts 부족"); return out; };
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const stdevS = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1)); };
const round = (x, d) => { const f = Math.pow(10, d); return Math.round(x * f) / f; };

// 1) a5-stdev-round [기본] — ROUND(STDEV(범위),2)
function a5StdevRound(rng) {
  const N = 8 + rng.int(3);
  const headers = ["학번", "성명", "점수"];
  const scores = distinctInts(rng, N, 55, 99);
  const sd = stdevS(scores), r2 = round(sd, 2);
  // litPM1 (자릿수 2→1·2→3) 이 값으로 잡히도록: 2자리 반올림이 1·3자리와 달라야
  if (round(sd, 1) === r2) throw new Error("자릿수 1 미분리");
  if (round(sd, 3) === r2) throw new Error("자릿수 3 미분리");   // 3자리 소수 존재(=removeFunc ROUND 도 값으로 잡힘)
  // rangeShrink(끝-1): 마지막 행 제거 시 반올림값이 달라져야
  if (round(stdevS(scores.slice(0, -1)), 2) === r2) throw new Error("범위축소 무영향");
  const names = rng.sample(NAMES, N);
  const rows = scores.map((v, i) => ["A" + String(101 + i), names[i], v]);
  const g = geom(headers, N), rA = g.colRel("점수"), rM = g.colRowFixed("점수");
  const ex = roundExample("ROUND", 2, rng, sd, [r2]);   // 결과(표준편차) 크기 기준 표시 예
  return {
    subtype: "A-5", colWidths: [8, 8, 6], headers, rows, codeColumns: ["학번"],
    result: { kind: "single", label: "점수 표준편차" },
    answer: `=ROUND(STDEV(${rA}),2)`,
    functions: { required: ["STDEV.S", "ROUND"], candidates: null },
    text: "[{표}]에서 점수[{col:점수}]의 표준편차를 [{R}] 셀에 계산하시오. (8점)",
    notes: [`${roundPhrase("ROUND", 2)} ${ex.text}`, "ROUND, STDEV 함수 사용"],
    accept: [`=ROUND(STDEV.S(${rA}),2)`, `=ROUND(STDEV(${rM}),2)`],
  };
}

// 2) a5-mode-count [어려움] — COUNTIF(범위,MODE.SNGL(범위))&"개"
function a5ModeCount(rng) {
  const N = 8 + rng.int(2);                              // 8~9
  const headers = ["관리코드", "품목", "구분코드"];
  const K = 6 + rng.int(3);                              // 서로 다른 코드 6~8 (1~9 중)
  const codes = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], K);
  const modeVal = rng.pick(codes);                       // 최빈값 1~9 (시드마다 다름)
  const f = 3 + rng.int(3);                              // 최빈 개수 3~5
  const others = rng.shuffle(codes.filter((c) => c !== modeVal));
  const cnt = {}; others.forEach((o) => (cnt[o] = 0));
  const arr = Array(f).fill(modeVal);                    // 나머지는 f-2 이하로 채워 최빈 유일·여유 ≥2
  let rem = N - f, ci = 0, guard = 0;
  while (rem > 0 && guard++ < 500) { const o = others[ci++ % others.length]; if (cnt[o] < f - 2) { cnt[o]++; arr.push(o); rem--; } }
  if (rem > 0) throw new Error("코드 채우기 실패");
  // 최빈 유일 + 2위와 여유 ≥2 (MODE 범위 끝-1 축소가 최빈을 안 바꿈 → pairedRangeShrink 로 처리)
  const second = Math.max(0, ...Object.values(cnt));
  if (f - second < 2) throw new Error("최빈 여유 부족");
  // 마지막 데이터 행 = 최빈값 → COUNTIF 범위 끝-1 축소가 개수를 바꿔 값으로 잡힘(pairedRangeShrink 짝 성립)
  const rest = rng.shuffle(arr.slice(1));                // modeVal 1개는 마지막으로
  const codeSeq = [...rest, modeVal];
  const items = rng.sample(PRODUCTS, N);
  const mgmt = []; { const s = new Set(); while (s.size < N) s.add("M" + String(101 + rng.int(899))); mgmt.push(...s); }
  const rows = codeSeq.map((c, i) => [mgmt[i], items[i % items.length], c]);
  const result = f;                                      // 최빈값의 개수
  let exN; do { exN = 2 + rng.int(N - 2); } while (exN === result);
  const g = geom(headers, N), rA = g.colRel("구분코드"), rM = g.colRowFixed("구분코드");
  return {
    subtype: "A-5", colWidths: [8, 8, 8], headers, rows, codeColumns: ["관리코드"], verbException: "계산",
    result: { kind: "single", label: "최빈 구분코드의 개수" },
    discriminators: [{ name: "최빈값 행", test: (r) => r[2] === modeVal, min: 3, max: N, allowFixed: "lastRow", reason: "최빈값 1개를 마지막 행에 고정(COUNTIF 범위 끝-1 축소 판별)" }],
    answer: `=COUNTIF(${rA},MODE.SNGL(${rA}))&"개"`,
    functions: { required: ["COUNTIF", "MODE.SNGL"], candidates: null },
    text: "[{표}]에서 구분코드[{col:구분코드}]의 빈도가 가장 높은 코드의 개수를 [{R}] 셀에 계산하시오. (8점)",
    notes: [`계산된 개수 뒤에 "개"를 포함하여 표시 [표시 예 : ${exN}개]`, "COUNTIF, MODE.SNGL 함수와 & 연산자 사용"],
    accept: [`=COUNTIF(${rM},MODE.SNGL(${rM}))&"개"`],
  };
}

export const TEMPLATE_A5 = {
  subtype: "A-5",
  variants: [
    { id: "a5-stdev-round", difficulty: "기본", plan: a5StdevRound },
    { id: "a5-mode-count", difficulty: "어려움", plan: a5ModeCount },
  ],
};
