// scripts/test-refund.mjs — 환불 예상 계산(computeRefund) 단위 테스트.
import { computeRefund, addMonths } from "../src/data/refund.js";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

const AMT = 70000, TOTAL = 20, DAY1 = 3, MONTHS = 2, DAY = 86400000;
const START = Date.parse("2026-01-01T00:00:00+09:00"); // 유료기간 = 1/1~3/1 = 59일, 절반 29.5일
const periodDays = (addMonths(START, MONTHS) - START) / DAY;
const at = (days) => START + days * DAY;
const r = (o) => computeRefund({ amount: AMT, totalLessons: TOTAL, day1LessonCount: DAY1, paidStartMs: START, paidMonths: MONTHS, ...o });

check("유료기간 59일", Math.round(periodDays) === 59, String(periodDays));

// 1) 7일 이내 1일차까지 → 전액
{ const x = r({ doneLessons: 3, nowMs: at(3) }); check("7일 이내 1일차까지 전액", x.full && x.refund === 70000, JSON.stringify(x)); }

// 2) 7일 이내 2일차까지 → 공제(차시 기준 6/20=30%)
{ const x = r({ doneLessons: 6, nowMs: at(3) }); check("7일 이내 2일차까지 공제", !x.full && x.refundable && x.basis === "lesson" && x.deduct === 21000 && x.refund === 49000, JSON.stringify(x)); }

// 3) 차시 기준이 큰 경우 (done 10/20=50% > 5일 경과율 8.5%)
{ const x = r({ doneLessons: 10, nowMs: at(5) }); check("차시 기준 공제", x.basis === "lesson" && x.deduct === 35000 && x.refund === 35000, JSON.stringify(x)); }

// 4) 기간 기준이 큰 경우 (25일 경과율 42.4% > 2/20=10%, 절반(29.5) 이내)
{ const x = r({ doneLessons: 2, nowMs: at(25) }); const exp = Math.round(70000 * (25 / periodDays)); check("기간 기준 공제", x.basis === "time" && !x.capped && x.deduct === exp && x.refund === 70000 - exp, JSON.stringify(x)); }

// 5) 상한 90% (done 19/20=95%, 경과 2일이라 절반 이내)
{ const x = r({ doneLessons: 19, nowMs: at(2) }); check("상한 90% 적용", x.capped && x.deductRate === 0.9 && x.deduct === 63000 && x.refund === 7000, JSON.stringify(x)); }

// 6) 유료기간 1/2 초과 → 0원
{ const x = r({ doneLessons: 5, nowMs: at(40) }); check("1/2 초과 환불 불가", !x.refundable && x.refund === 0, JSON.stringify(x)); }

// 7) 경계: 정확히 7일째 + 1일차까지 → 전액
{ const x = r({ doneLessons: 3, nowMs: at(7) }); check("정확히 7일째 전액", x.full && x.refund === 70000, JSON.stringify(x)); }

// 7-b) 경계: 정확히 절반(29.5일) → 환불 불가 아님(공제)
{ const x = r({ doneLessons: 1, nowMs: at(periodDays / 2) }); check("정확히 절반은 공제(불가 아님)", x.refundable && x.basis === "time" && x.refund > 0, JSON.stringify(x)); }

// 7-c) 경계: 절반 + 1일 → 환불 불가
{ const x = r({ doneLessons: 1, nowMs: at(periodDays / 2 + 1) }); check("절반 초과 환불 불가", !x.refundable && x.refund === 0, JSON.stringify(x)); }

console.log(`\n환불 계산: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
