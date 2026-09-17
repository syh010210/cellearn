// src/data/exam/calc/templates/D-4.js
// 시간 계산 (HOUR / MINUTE + IF 반올림). 변형 1개. 열 채우기(정수 결과).
//  보류: d4-time-hms = HOUR(SMALL(..))&"시간"&MINUTE(..)&"분"&SECOND(..)&"초" (다중 & 조합) — 별도 구현 대기.
import { NAMES } from "../pools.js";
import { geom } from "./_util.js";

const tfrac = (min) => min / 1440;                       // 분 → 하루 분수

// 1) d4-hour-minute [어려움] — IF(MINUTE(퇴실-입실)>=30, HOUR(..)+1, HOUR(..))
function d4HourMinute(rng) {
  const N = 8 + rng.int(3);
  const headers = ["회원", "입실시간", "퇴실시간", "이용시간"];
  // 분 필수: 정확히 30(경계) 1행, 29(litPM1 30→29) 1행, 그 외 다양. 시(H)도 다양하게.
  const base = [{ H: 1 + rng.int(6), M: 30 }, { H: 1 + rng.int(6), M: 29 }];
  while (base.length < N) base.push({ H: 1 + rng.int(8), M: rng.int(60) });
  const durs = rng.shuffle(base);                          // 경계(30·29) 행 위치 분산
  const rows = [], results = [];
  for (const d of durs) {
    const inMin = (8 + rng.int(3)) * 60 + rng.int(60);   // 입실 08:00~10:59
    const outMin = inMin + d.H * 60 + d.M;
    rows.push([null, tfrac(inMin), tfrac(outMin), null]);
    results.push(d.M >= 30 ? d.H + 1 : d.H);
  }
  if (new Set(results).size < 2) throw new Error("결과 단일");
  const names = rng.sample(NAMES, N); rows.forEach((r, i) => (r[0] = names[i]));
  const g = geom(headers, N), inC = g.dataCell("입실시간", 0), outC = g.dataCell("퇴실시간", 0);
  const diff = `${outC}-${inC}`;
  return {
    subtype: "D-4", colWidths: [8, 10, 10, 8], headers, rows, colZ: { 1: "h:mm", 2: "h:mm" },
    result: { kind: "fillCol", col: "이용시간" },
    discriminators: [
      { name: "분>=30(올림)", test: (r) => Math.round((r[2] - r[1]) * 1440) % 60 >= 30, min: 1, max: N },
      { name: "분=30(경계)", test: (r) => Math.round((r[2] - r[1]) * 1440) % 60 === 30, min: 1, max: N },
    ],
    answer: `=IF(MINUTE(${diff})>=30,HOUR(${diff})+1,HOUR(${diff}))`,
    functions: { required: ["IF", "MINUTE", "HOUR"], candidates: null },
    text: "[{표}]에서 입실시간[{col:입실시간}]과 퇴실시간[{col:퇴실시간}]을 이용하여 이용시간[{R}]을 계산하시오. (8점)",
    notes: ["이용시간은 퇴실시간에서 입실시간을 뺀 시간의 시(時)로 하되, 분이 30 이상이면 시에 1을 더하여 표시", "IF, HOUR, MINUTE 함수 사용"],
    accept: [`=IF(MINUTE(${diff})>=30,HOUR(${diff})+1,HOUR(${diff}))`],
  };
}

export const TEMPLATE_D4 = {
  subtype: "D-4",
  variants: [
    { id: "d4-hour-minute", difficulty: "어려움", resultKind: "fillCol", usesD: false, core: ["HOUR", "MINUTE"], plan: d4HourMinute },
  ],
};
