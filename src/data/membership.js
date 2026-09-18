// src/data/membership.js
// 이용권 판매 구조 단일 상수 — 랜딩·결제·프로모션 위젯·JSON-LD 가 모두 이 모듈만 본다.
//  결제사(보증보험 면제)는 3개월 이하 이용권만 인정 → 판매 상품은 "2개월 이용권".
//  그보다 긴 기간은 "자체 프로모션 무상 연장"으로 별도 표기(환불 계산에는 미포함).
//  ⚠️ 서버(supabase/functions/verify-payment/index.ts)는 결제 검증상 같은 값을 자체 상수로 둔다.
//     값을 바꾸면 서버 상수(PRICE·PAID_MONTHS·PROMO_PAY_DEADLINE·PROMO_EXTEND_TO)도 함께 맞출 것.

// 판매(유료) 상품 — 2급만 판매. 1급은 상수만 두고 sold:false(랜딩 "10월 오픈 예정", 결제 목록 제외).
export const PRODUCTS = {
  "2급": { grade: "2급", amount: 70000, paidMonths: 2, orderName: "셀런 컴활 2급 실기 2개월 이용권", sold: true },
  "1급": { grade: "1급", amount: 140000, paidMonths: 3, orderName: "셀런 컴활 1급 실기 3개월 이용권", sold: false },
};

// 유료 이용기간(개월)
export const PAID_MONTHS = 2;

// 자체 프로모션: 결제 마감일 이전 결제 시 연장 종료일까지 무상 연장 (KST 23:59:59)
export const PROMO = {
  payDeadline: "2026-10-31T23:59:59+09:00", // 이 시각 이하로 결제하면 프로모션 적용
  extendTo: "2026-12-31T23:59:59+09:00",     // 연장 종료일
  payDeadlineText: "2026년 10월 31일",
  extendToText: "2026년 12월 31일",
};

// 화면 공용 문구(승인된 문장 그대로) — 여러 화면이 같은 값을 쓰도록 모아 둔다.
export const COPY = {
  priceTitle: "컴활 2급 실기",
  priceLine: "70,000원 · 이용기간 2개월",
  promoLabel: "자체 프로모션",
  promoSentence: "2026년 10월 31일까지 결제하시면 2026년 12월 31일까지 이용하실 수 있습니다.",
  // 날짜·개월은 상수(PAID_MONTHS·PROMO)에서 조립 — 하드코딩 금지
  usagePeriodLine: `이용 기간: ${PAID_MONTHS}개월 (자체 프로모션으로 ${PROMO.extendToText}까지 연장)`,
  usagePeriodLineRefund: `이용 기간: ${PAID_MONTHS}개월 (자체 프로모션으로 ${PROMO.extendToText}까지 연장, 연장 기간은 환불 계산에 미포함)`,
  faqQ: "실제로 얼마나 이용할 수 있나요?",
  faqA: "판매 상품은 2개월 이용권입니다. 2026년 10월 31일까지 결제하시면 자체 프로모션으로 2026년 12월 31일까지 이용하실 수 있습니다.",
  refundBasis: "환불은 유료 이용기간 2개월과 결제 금액 70,000원을 기준으로 계산합니다.",
  refundPromoExcluded: "자체 프로모션으로 무상 제공된 연장 기간은 환불 계산에 포함되지 않습니다.",
};
