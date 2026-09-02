// Supabase Edge Function — 포트원 결제 서버 검증
// 배포: supabase functions deploy verify-payment
// 시크릿: supabase secrets set PORTONE_API_SECRET=... (SERVICE_ROLE 키는 런타임이 자동 주입)
//
// 흐름: 클라이언트가 결제창에서 결제 → paymentId 를 이 함수로 전달 →
//       포트원 API로 결제 진위/금액 확인 → 통과 시 payments=paid + enrollments(올해 말까지) 기록.
// ⚠️ 금액/상품은 반드시 서버에서 재확인한다(클라이언트 값 신뢰 금지).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 상품 정가(서버 기준). 클라이언트가 보낸 금액과 대조.
const PRICE: Record<string, number> = { "2급": 70000, "1급": 120000 };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { paymentId, grade } = await req.json();
    if (!paymentId || !PRICE[grade]) {
      return json({ error: "잘못된 요청" }, 400);
    }

    // 1) 요청한 사용자 확인 (Authorization 헤더의 JWT)
    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "인증 필요" }, 401);

    // 2) 포트원에서 결제 단건 조회
    const pRes = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${Deno.env.get("PORTONE_API_SECRET")}` },
    });
    const payment = await pRes.json();
    console.log("portone lookup:", pRes.status, JSON.stringify(payment).slice(0, 500));

    // 3) 상태·금액 검증
    const paidOk = payment.status === "PAID";
    const amountOk = payment.amount?.total === PRICE[grade];
    if (!paidOk || !amountOk) {
      await admin.from("payments").insert({
        user_id: user.id, grade, amount: PRICE[grade],
        status: paidOk ? "paid" : "failed", provider: "portone",
        payment_id: paymentId, raw: payment,
      });
      // 화면/로그에 실제 조회 결과를 남겨 원인 진단 (status/amount/포트원 에러)
      const detail = `status=${payment?.status ?? "(none)"} amount=${payment?.amount?.total ?? "(none)"} expected=${PRICE[grade]} httpStatus=${pRes.status}${payment?.type ? ` portone=${payment.type}` : ""}${payment?.message ? ` msg=${payment.message}` : ""}`;
      console.error("결제 검증 실패:", detail);
      return json({ error: "결제 검증 실패", detail, paidOk, amountOk }, 400);
    }

    // 4) 결제 원장 기록 (insert 에러를 반드시 확인)
    const { data: pay, error: payErr } = await admin.from("payments").insert({
      user_id: user.id, grade, amount: PRICE[grade],
      status: "paid", provider: "portone",
      payment_id: paymentId, tx_id: payment.pgTxId ?? null,
      raw: payment, paid_at: new Date().toISOString(),
    }).select("id").single();
    if (payErr) {
      console.error("payments insert error:", payErr);
      return json({ error: "결제 기록 저장 실패", detail: payErr.message }, 500);
    }

    // 5) 수강권 부여 — 기간 정책
    //   · 기본값: 결제일부터 2개월 (내년부터 이 값 적용 예정)
    //   · 프로모션(현재): 구매 연도 12월 31일 23:59:59(KST)까지 "올해 끝까지"
    //   프로모션을 끄려면 PROMO_UNTIL_YEAR_END=false 로 바꾸면 기본 2개월이 적용된다.
    const PROMO_UNTIL_YEAR_END = true;
    const BASE_MONTHS = 2;
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = kstNow.getUTCFullYear();
    let validTo: Date;
    if (PROMO_UNTIL_YEAR_END) {
      validTo = new Date(`${year}-12-31T23:59:59+09:00`);
    } else {
      // kstNow는 UTC필드에 KST 벽시계를 담고 있으므로 setUTCMonth로 개월 가산
      validTo = new Date(kstNow);
      validTo.setUTCMonth(validTo.getUTCMonth() + BASE_MONTHS);
    }
    const { error: enrErr } = await admin.from("enrollments").insert({
      user_id: user.id, grade, payment_id: pay?.id, valid_to: validTo.toISOString(),
    });
    if (enrErr) {
      console.error("enrollments insert error:", enrErr);
      return json({ error: "수강권 생성 실패", detail: enrErr.message }, 500);
    }

    return json({ ok: true, validTo: validTo.toISOString() });
  } catch (e) {
    console.error("verify-payment exception:", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
