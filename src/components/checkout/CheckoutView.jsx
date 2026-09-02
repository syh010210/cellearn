import { useState, useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { UI } from "../../theme";

// 급수별 기간제 상품 — 프로모션: 올해 말까지 (가격은 서버 verify-payment의 PRICE와 반드시 일치)
const PRODUCTS = {
  "2급": { grade: "2급", amount: 70000, label: "컴퓨터활용능력 2급 실기 · 올해 끝까지" },
  "1급": { grade: "1급", amount: 120000, label: "컴퓨터활용능력 1급 실기 · 올해 끝까지" },
};

// 결제수단 — 카드 일반결제 + KG이니시스 간편결제. requestPayment에 병합할 파라미터를 반환.
const METHODS = [
  { key: "CARD", label: "신용·체크카드", params: { payMethod: "CARD" } },
  { key: "KAKAOPAY", label: "카카오페이", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "KAKAOPAY" } } },
  { key: "NAVERPAY", label: "네이버페이", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "NAVERPAY" } } },
  { key: "TOSSPAY", label: "토스페이", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "TOSSPAY" } } },
  { key: "PAYCO", label: "페이코", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "PAYCO" } } },
  { key: "LPAY", label: "L.pay", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "LPAY" } } },
  { key: "SSGPAY", label: "SSGPAY", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "SSGPAY" } } },
  { key: "SAMSUNGPAY", label: "삼성페이", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "SAMSUNGPAY" } } },
  { key: "APPLEPAY", label: "애플페이", params: { payMethod: "EASY_PAY", easyPay: { easyPayProvider: "APPLEPAY" } } },
];

const STORE_ID = import.meta.env.VITE_PORTONE_STORE_ID;
const CHANNEL_KEY = import.meta.env.VITE_PORTONE_CHANNEL_KEY;
const PENDING_KEY = "portone_pending";

export default function CheckoutView({ onBack }) {
  const { user, profile, refresh } = useAuth();
  const [grade, setGrade] = useState(profile?.target_grade || "2급");
  const [method, setMethod] = useState("CARD");
  const [buyerName, setBuyerName] = useState(profile?.name || "");
  const [buyerPhone, setBuyerPhone] = useState(profile?.phone || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const product = PRODUCTS[grade];

  // 프로필이 (비동기로) 로드되면 구매자 정보 자동 채움 — 이미 입력한 값은 보존
  useEffect(() => {
    if (profile?.name) setBuyerName((v) => v || profile.name);
    if (profile?.phone) setBuyerPhone((v) => v || profile.phone);
    if (profile?.target_grade) setGrade((g) => g || profile.target_grade);
  }, [profile]);

  // 모바일 리다이렉트 복귀 처리 — 결제창이 페이지를 벗어났다가 ?portone=return 로 돌아옴
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("portone") !== "return" && !q.get("paymentId")) return;
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
    // URL 정리(파라미터 제거) — 새로고침 시 재실행 방지
    window.history.replaceState({}, "", window.location.pathname);
    if (q.get("code")) {
      setMsg(q.get("message") ? decodeURIComponent(q.get("message")) : "결제가 취소되었습니다.");
      return;
    }
    const paymentId = q.get("paymentId") || pending?.paymentId;
    const g = pending?.grade || grade;
    if (paymentId) finalize(paymentId, g);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 서버 검증 → 수강권 반영 (데스크톱·모바일 공통 마무리)
  async function finalize(paymentId, g) {
    setBusy(true);
    setMsg("결제를 확인하는 중…");
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", { body: { paymentId, grade: g } });
      if (error) {
        // 서버가 반환한 상세 에러(JSON body)를 최대한 뽑아 표시
        let detail = error.message;
        try {
          const body = await error.context?.json?.();
          if (body?.error) detail = body.detail ? `${body.error}: ${body.detail}` : body.error;
        } catch { /* body 파싱 실패 시 기본 메시지 */ }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      sessionStorage.removeItem(PENDING_KEY);
      setMsg("결제가 완료되었습니다. 학습을 시작합니다…");
      await refresh(); // 활성 수강권 반영 → App이 자동으로 학습 화면으로 이동
    } catch (e) {
      setMsg(e.message || "결제 검증 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function startCheckout() {
    setMsg("");
    if (!supabase || !STORE_ID || !CHANNEL_KEY) {
      setMsg("결제 설정이 아직 없습니다. docs/SETUP.md의 Supabase·포트원 키를 .env에 넣어주세요.");
      return;
    }
    if (!user) { setMsg("로그인이 필요합니다."); return; }
    const phone = buyerPhone.replace(/[^0-9]/g, "");
    if (!buyerName.trim() || phone.length < 10) {
      setMsg("구매자 이름과 휴대폰 번호를 입력해 주세요.");
      return;
    }
    setBusy(true);
    try {
      const paymentId = `pay-${crypto.randomUUID()}`;
      // 모바일 리다이렉트 복귀 시 필요한 정보 보관
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ paymentId, grade }));
      const m = METHODS.find((x) => x.key === method) || METHODS[0];

      // 이니시스 V2 일반결제는 구매자명·휴대폰이 필수
      const customer = { email: user.email, fullName: buyerName.trim(), phoneNumber: phone };

      // 포트원 결제창 호출 (KG이니시스 채널). 모바일은 여기서 redirectUrl로 이동됨.
      const res = await PortOne.requestPayment({
        storeId: STORE_ID,
        channelKey: CHANNEL_KEY,
        paymentId,
        orderName: product.label,
        totalAmount: product.amount,
        currency: "CURRENCY_KRW",
        ...m.params,
        redirectUrl: `${window.location.origin}/?portone=return`,
        customer,
        // 이니시스 merchantData는 한글 불가 → 급수는 ASCII 코드로 (검증은 서버 body.grade 사용)
        customData: JSON.stringify({ userId: user.id, grade: grade === "1급" ? "level1" : "level2" }),
      });

      // 데스크톱(팝업): 결과가 여기로 반환됨. (모바일은 위에서 리다이렉트되어 도달하지 않음)
      if (res?.code) throw new Error(res.message || "결제가 취소되었습니다.");
      await finalize(paymentId, grade);
    } catch (e) {
      setMsg(e.message || "결제 처리 중 오류가 발생했습니다.");
      setBusy(false);
    }
  }

  const wrap = { minHeight: "100vh", background: UI.bg, color: UI.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: UI.font };
  const card = { width: "100%", maxWidth: 460, background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 34, boxShadow: UI.shadow };
  const opt = (g) => ({ flex: 1, padding: "16px", borderRadius: UI.rMd, cursor: "pointer", textAlign: "center", border: `2px solid ${grade === g ? UI.teal : UI.line}`, background: grade === g ? UI.limeSoft : UI.panelAlt });
  const methodBtn = (active) => ({
    padding: "10px 8px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
    border: `1.5px solid ${active ? UI.teal : UI.line}`, background: active ? UI.tealSoft : UI.surface,
    color: active ? UI.teal : UI.mut, fontFamily: UI.font,
  });

  return (
    <div style={wrap}>
      <div style={card}>
        {onBack && <button style={{ background: "transparent", border: "none", color: UI.mut, cursor: "pointer", fontSize: 13, marginBottom: 12, fontWeight: 600 }} onClick={onBack}>← 홈</button>}
        <div style={{ fontSize: 23, fontWeight: 700 }}>수강권 결제</div>
        <div style={{ fontSize: 13.5, color: UI.mut, margin: "6px 0 22px" }}>급수를 선택하면 올해 말까지 해당 급수 학습·실습이 열립니다.</div>

        <div style={{ display: "flex", gap: 12 }}>
          {["2급", "1급"].map((g) => (
            <div key={g} style={opt(g)} onClick={() => setGrade(g)}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>컴활 {g}</div>
              <div style={{ fontSize: 13, color: UI.mut, marginTop: 4 }}>올해 끝까지 이용</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8, color: UI.teal, fontFamily: UI.mono }}>{PRODUCTS[g].amount.toLocaleString()}원</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, fontSize: 13, fontWeight: 700, color: UI.ink }}>결제수단</div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {METHODS.map((m) => (
            <button key={m.key} style={methodBtn(method === m.key)} onClick={() => setMethod(m.key)}>{m.label}</button>
          ))}
        </div>

        <div style={{ marginTop: 22, fontSize: 13, fontWeight: 700, color: UI.ink }}>구매자 정보</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="이름"
            style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "11px 12px", fontSize: 14, fontFamily: UI.font, color: UI.ink, boxSizing: "border-box", outline: "none" }}
          />
          <input
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            placeholder="휴대폰 번호 (- 없이 숫자만)"
            inputMode="numeric"
            style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "11px 12px", fontSize: 14, fontFamily: UI.font, color: UI.ink, boxSizing: "border-box", outline: "none" }}
          />
        </div>

        <div style={{ marginTop: 20, fontSize: 13, color: UI.mut, lineHeight: 1.7 }}>
          · 상품: {product.label}<br />
          · 결제 금액: <b style={{ color: UI.ink, fontFamily: UI.mono }}>{product.amount.toLocaleString()}원</b><br />
          · 이용 기간: 결제일부터 <b style={{ color: UI.ink }}>2026년 12월 31일</b>까지
        </div>

        {msg && <div style={{ marginTop: 16, background: UI.tealSoft, border: `1px solid ${UI.greenLine}`, color: UI.teal, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13 }}>{msg}</div>}

        <button
          onClick={startCheckout}
          disabled={busy}
          style={{ width: "100%", marginTop: 22, background: UI.teal, color: "#fff", border: "none", padding: 14, borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: UI.font }}
        >
          {busy ? "처리 중…" : `${product.amount.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
