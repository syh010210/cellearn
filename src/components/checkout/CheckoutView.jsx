import { useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { UI } from "../../theme";

// 급수별 3개월 기간제 상품 (가격은 실제 정책에 맞게 조정 — 서버 verify-payment의 PRICE와 반드시 일치)
const PRODUCTS = {
  "2급": { grade: "2급", amount: 70000, label: "컴퓨터활용능력 2급 실기 · 올해 끝까지" },
  "1급": { grade: "1급", amount: 69000, label: "컴활 1급 실기 · 3개월" },
};

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;

export default function CheckoutView({ onBack }) {
  const { user, profile, refresh } = useAuth();
  const [grade, setGrade] = useState(profile?.target_grade || "2급");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const product = PRODUCTS[grade];

  async function startCheckout() {
    setMsg("");
    if (!supabase || !STORE_ID || !CHANNEL_KEY) {
      setMsg("결제 설정이 아직 없습니다. docs/SETUP.md의 Supabase·포트원 키를 .env에 넣어주세요.");
      return;
    }
    if (!user) { setMsg("로그인이 필요합니다."); return; }
    setBusy(true);
    try {
      // 1) 포트원 결제창 호출
      const paymentId = `pay-${crypto.randomUUID()}`;
      const res = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
        paymentId,
        orderName: product.label,
        totalAmount: product.amount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: { fullName: profile?.name, email: user.email, phoneNumber: profile?.phone },
        customData: JSON.stringify({ userId: user.id, grade }),
      });
      // 사용자가 취소했거나 결제 실패
      if (res?.code) throw new Error(res.message || "결제가 취소되었습니다.");

      // 2) 서버 검증 (금액·상태 재확인 후 payments/enrollments 기록)
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { paymentId, grade },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // 3) 수강권 반영 → App이 자동으로 학습 화면으로 이동
      setMsg("결제가 완료되었습니다. 학습을 시작합니다…");
      await refresh();
    } catch (e) {
      setMsg(e.message || "결제 처리 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  const wrap = { minHeight: "100vh", background: UI.bg, color: UI.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: UI.font };
  const card = { width: "100%", maxWidth: 460, background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 34, boxShadow: UI.shadow };
  const opt = (g) => ({ flex: 1, padding: "16px", borderRadius: UI.rMd, cursor: "pointer", textAlign: "center", border: `2px solid ${grade === g ? UI.teal : UI.line}`, background: grade === g ? UI.limeSoft : UI.panelAlt });

  return (
    <div style={wrap}>
      <div style={card}>
        {onBack && <button style={{ background: "transparent", border: "none", color: UI.mut, cursor: "pointer", fontSize: 13, marginBottom: 12, fontWeight: 600 }} onClick={onBack}>← 홈</button>}
        <div style={{ fontSize: 23, fontWeight: 700 }}>수강권 결제</div>
        <div style={{ fontSize: 13.5, color: UI.mut, margin: "6px 0 22px" }}>급수를 선택하면 3개월간 해당 급수 학습·실습이 열립니다.</div>

        <div style={{ display: "flex", gap: 12 }}>
          {["2급", "1급"].map((g) => (
            <div key={g} style={opt(g)} onClick={() => setGrade(g)}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>컴활 {g}</div>
              <div style={{ fontSize: 13, color: UI.mut, marginTop: 4 }}>3개월 이용권</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8, color: UI.teal, fontFamily: UI.mono }}>{PRODUCTS[g].amount.toLocaleString()}원</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, fontSize: 13, color: UI.mut, lineHeight: 1.7 }}>
          · 상품: {product.label}<br />
          · 결제 금액: <b style={{ color: UI.ink, fontFamily: UI.mono }}>{product.amount.toLocaleString()}원</b><br />
          · 이용 기간: 결제 완료 시점부터 3개월
        </div>

        {msg && <div style={{ marginTop: 16, background: UI.tealSoft, border: `1px solid ${UI.greenLine}`, color: UI.teal, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13 }}>{msg}</div>}

        <button
          onClick={startCheckout}
          disabled={busy}
          style={{ width: "100%", marginTop: 22, background: UI.teal, color: "#fff", border: "none", padding: 14, borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: UI.font }}
        >
          {busy ? "처리 중…" : `${product.amount.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
