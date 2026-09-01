// Supabase Edge Function — 포트원 결제 서버 검증
// 배포: supabase functions deploy verify-payment
// 시크릿: supabase secrets set PORTONE_API_SECRET=... (SERVICE_ROLE 키는 런타임이 자동 주입)
//
// 흐름: 클라이언트가 결제창에서 결제 → paymentId 를 이 함수로 전달 →
//       포트원 API로 결제 진위/금액 확인 → 통과 시 payments=paid + enrollments(3개월) 기록.
// ⚠️ 금액/상품은 반드시 서버에서 재확인한다(클라이언트 값 신뢰 금지).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 상품 정가(서버 기준). 클라이언트가 보낸 금액과 대조.
const PRICE: Record<string, number> = { "2급": 49000, "1급": 69000 };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
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

    // 3) 상태·금액 검증
    const paidOk = payment.status === "PAID";
    const amountOk = payment.amount?.total === PRICE[grade];
    if (!paidOk || !amountOk) {
      await admin.from("payments").insert({
        user_id: user.id, grade, amount: PRICE[grade],
        status: paidOk ? "paid" : "failed", provider: "portone",
        payment_id: paymentId, raw: payment,
      });
      return json({ error: "결제 검증 실패", paidOk, amountOk }, 400);
    }

    // 4) 결제 원장 기록
    const { data: pay } = await admin.from("payments").insert({
      user_id: user.id, grade, amount: PRICE[grade],
      status: "paid", provider: "portone",
      payment_id: paymentId, tx_id: payment.pgTxId ?? null,
      raw: payment, paid_at: new Date().toISOString(),
    }).select("id").single();

    // 5) 수강권 3개월 부여
    const validTo = new Date();
    validTo.setMonth(validTo.getMonth() + 3);
    await admin.from("enrollments").insert({
      user_id: user.id, grade, payment_id: pay?.id, valid_to: validTo.toISOString(),
    });

    return json({ ok: true, validTo: validTo.toISOString() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
