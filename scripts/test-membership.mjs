// scripts/test-membership.mjs — 수강권 만료일(computeValidTo) + 판매 급수 정책 단위 테스트.
import { computeValidTo, SOLD_GRADES } from "../supabase/functions/verify-payment/validTo.js";
import { PRODUCTS, PROMO, PAID_MONTHS } from "../src/data/membership.js";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };
const kstYMD = (d) => new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const at = (iso) => new Date(iso); // KST 오프셋 포함 ISO

// 만료일 규칙: 결제일+2개월, 프로모션 마감(2026-10-31 23:59:59 KST) 이하면 2026-12-31 과 max
const cases = [
  ["마감 전(10/1)", "2026-10-01T12:00:00+09:00", "2026-12-31"],
  ["마감 직전(10/31)", "2026-10-31T12:00:00+09:00", "2026-12-31"],
  ["마감 직후(11/1)", "2026-11-01T12:00:00+09:00", "2027-01-01"],
  ["12/1(→2/1, 연장일보다 늦음)", "2026-12-01T12:00:00+09:00", "2027-02-01"],
  ["2027 결제(→ 결제일+2개월)", "2027-03-15T12:00:00+09:00", "2027-05-15"],
];
for (const [name, now, want] of cases) {
  const got = kstYMD(computeValidTo(at(now)));
  check(`만료일 ${name}`, got === want, `기대 ${want} 실제 ${got}`);
}

// 마감 경계: 정확히 23:59:59 KST 는 프로모션 포함, 1초 뒤는 미포함
check("마감 정각(23:59:59) 프로모션 포함", kstYMD(computeValidTo(at("2026-10-31T23:59:59+09:00"))) === "2026-12-31");
check("마감 1초 뒤 미포함(→ 결제일+2개월)", kstYMD(computeValidTo(at("2026-11-01T00:00:00+09:00"))) === "2027-01-01");

// 판매 급수 정책
check("2급 판매", SOLD_GRADES.has("2급"));
check("1급 판매 중지", !SOLD_GRADES.has("1급"));

// 상수 정합성(클라이언트 ↔ 서버)
check("클라 PAID_MONTHS=2", PAID_MONTHS === 2 && PRODUCTS["2급"].paidMonths === 2);
check("클라 프로모션 마감=서버 상수", Date.parse(PROMO.payDeadline) === Date.parse("2026-10-31T23:59:59+09:00"));
check("클라 연장 종료=서버 상수", Date.parse(PROMO.extendTo) === Date.parse("2026-12-31T23:59:59+09:00"));
check("2급 판매/1급 미판매(클라)", PRODUCTS["2급"].sold === true && PRODUCTS["1급"].sold === false);

console.log(`\n이용권 상수·만료일: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
