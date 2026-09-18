// supabase/functions/verify-payment/validTo.js
// 결제 검증 시 수강권 만료일 계산 + 판매 급수 정책. (Deno Edge Function 과 Node 단위 테스트가 공유)
// ⚠️ 값은 클라이언트 src/data/membership.js 와 일치해야 한다. 어긋나면 화면 문구와 실제 만료일이 달라진다.
//    - 유료 이용기간: 2급 2개월 / 1급 3개월 (PRODUCTS.paidMonths). 아래 PAID_MONTHS 는 현재 판매 중인 2급 기준.
//      (1급은 sold:false 로 서버에서 거부되어 만료일 계산이 실행되지 않는다. 1급 정가는 verify-payment PRICE=140000.)
//    - 프로모션 결제 마감: 2026-10-31 23:59:59 KST (PROMO.payDeadline)
//    - 프로모션 연장 종료: 2026-12-31 23:59:59 KST (PROMO.extendTo)

export const SOLD_GRADES = new Set(["2급"]); // 판매 중인 급수. 1급은 판매 중지(서버에서 거부)
export const PAID_MONTHS = 2; // 판매 중인 2급 기준(1급 3개월은 판매 개시 시 반영)
export const PROMO_PAY_DEADLINE_MS = Date.parse("2026-10-31T23:59:59+09:00");
export const PROMO_EXTEND_TO_MS = Date.parse("2026-12-31T23:59:59+09:00");

// 결제 시각(now: Date) → 수강권 만료 instant(Date).
//  · 결제일(KST 벽시계) + 2개월
//  · 결제 시각이 프로모션 마감(2026-10-31 23:59:59 KST) 이하이면 연장 종료일과 비교해 늦은 날짜로
export function computeValidTo(now) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000); // UTC 필드에 KST 벽시계를 담아 개월 가산
  kst.setUTCMonth(kst.getUTCMonth() + PAID_MONTHS);
  const paidValidTo = new Date(kst.getTime() - 9 * 3600 * 1000); // 실제 instant 로 복원
  if (now.getTime() <= PROMO_PAY_DEADLINE_MS) {
    return new Date(Math.max(paidValidTo.getTime(), PROMO_EXTEND_TO_MS));
  }
  return paidValidTo;
}
