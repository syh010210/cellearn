// src/data/refund.js
// 환불 예상 금액 계산(표시용) — 환불정책(LegalView "3. 이용 개시 후")과 같은 규칙.
//  · 결제 7일 이내 + 1일차까지만 수강(완료 차시 ≤ 1일차 차시 수) → 전액
//  · 유료 이용기간의 1/2 경과 후 → 0원(환불 불가)
//  · 그 외 → max(차시 기준, 기간 기준) 공제, 공제 상한 90%
//  · 프로모션 무상 연장 기간은 계산에서 제외(유료 이용기간 = 결제일 + 유료 개월)
// 순수 함수(외부 의존 없음) — Node 단위 테스트 가능.

const DAY = 86400000;

// 결제일 + n개월 (달력 기준). ms → ms
export function addMonths(ms, n) {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

// 입력값으로 환불 예상 결과를 계산한다.
//  amount: 결제 금액, totalLessons: 전체 차시, doneLessons: 완료 차시,
//  day1LessonCount: 1일차 차시 수(전액 기준), paidStartMs: 결제 시각(ms),
//  paidMonths: 유료 이용 개월, nowMs: 기준 시각(ms)
export function computeRefund({ amount, totalLessons, doneLessons, day1LessonCount = 3, paidStartMs, paidMonths = 2, nowMs = Date.now() }) {
  const periodDays = (addMonths(paidStartMs, paidMonths) - paidStartMs) / DAY;
  const elapsedTotalDays = Math.max(0, (nowMs - paidStartMs) / DAY);
  const elapsedPaidDays = Math.min(elapsedTotalDays, periodDays); // 유료기간 내로 상한

  // 1) 전액: 결제 7일 이내 + 1일차까지만
  if (elapsedTotalDays <= 7 && doneLessons <= day1LessonCount) {
    return { refundable: true, full: true, refund: amount, deduct: 0, deductRate: 0, basis: "full", capped: false,
      periodDays, elapsedPaidDays, reason: "결제 7일 이내·1일차까지 수강 — 전액 환불" };
  }
  // 2) 유료 이용기간 1/2 경과 → 환불 불가
  if (elapsedPaidDays > periodDays / 2) {
    return { refundable: false, full: false, refund: 0, deduct: amount, deductRate: 1, basis: "half", capped: false,
      periodDays, elapsedPaidDays, reason: `유료 이용기간(${Math.round(periodDays)}일)의 1/2 경과 — 환불 불가` };
  }
  // 3) 그 외: 차시 기준·기간 기준 중 큰 공제(상한 90%)
  const lessonRate = totalLessons ? doneLessons / totalLessons : 0;
  const timeRate = periodDays ? elapsedPaidDays / periodDays : 0;
  const rawRate = Math.max(lessonRate, timeRate);
  const capped = rawRate > 0.9;
  const deductRate = Math.min(rawRate, 0.9);
  const deduct = Math.round(amount * deductRate);
  const refund = amount - deduct;
  const basis = lessonRate >= timeRate ? "lesson" : "time";
  const basisText = basis === "lesson"
    ? `완료 차시 기준(${doneLessons}/${totalLessons})`
    : `이용일수 기준(${Math.round(elapsedPaidDays)}/${Math.round(periodDays)}일)`;
  return { refundable: true, full: false, refund, deduct, deductRate, basis, capped, lessonRate, timeRate,
    periodDays, elapsedPaidDays,
    reason: `${basisText} ${Math.round(deductRate * 100)}% 공제${capped ? " (상한 90% 적용)" : ""}` };
}
