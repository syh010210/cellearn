import { useState, useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { UI } from "../../theme";
import PasswordInput from "../auth/PasswordInput";

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

// 결제 우선(게스트) → 결제 완료 후 이메일 OTP로 계정 생성·인증·즉시 로그인.
// phase: "form"(결제 정보) → "account"(결제완료·비번/약관) → "otp"(6자리 코드) → 완료
export default function CheckoutView({ onBack, presetGrade, onNeedLogin }) {
  const { user, profile, refresh, signUp, verifySignupOtp, resendSignupOtp } = useAuth();
  const [grade, setGrade] = useState(presetGrade || profile?.target_grade || "2급");
  const [method, setMethod] = useState("CARD");
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAgree, setTermsAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("form");
  const [paidId, setPaidId] = useState(null); // 결제 완료된 paymentId (계정 생성 후 검증에 사용)
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const product = PRODUCTS[grade];
  const isGuest = !user;

  useEffect(() => {
    if (profile?.name) setName((v) => v || profile.name);
    if (profile?.phone) setPhone((v) => v || profile.phone);
    if (profile?.target_grade) setGrade((g) => g || profile.target_grade);
  }, [profile]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // 모바일 리다이렉트 복귀(?portone=return) 처리
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("portone") !== "return" && !q.get("paymentId")) return;
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
    window.history.replaceState({}, "", window.location.pathname);
    if (q.get("code")) {
      setMsg(q.get("message") ? decodeURIComponent(q.get("message")) : "결제가 취소되었습니다.");
      return;
    }
    const paymentId = q.get("paymentId") || pending?.paymentId;
    if (!paymentId) return;
    const g = pending?.grade || grade;
    if (pending?.grade) setGrade(pending.grade);
    if (user) {
      // 이미 로그인된 사용자 → 바로 검증
      finalize(paymentId, g);
    } else {
      // 게스트 → 결제는 됐으니 계정 생성 단계로
      if (pending?.email) setEmail(pending.email);
      if (pending?.name) setName(pending.name);
      if (pending?.phone) setPhone(pending.phone);
      setPaidId(paymentId);
      setPhase("account");
      setMsg("결제가 확인되었습니다. 아래에서 계정을 만들어 학습을 시작하세요.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 결제 검증 → 수강권 반영 (로그인된 상태에서 호출)
  async function finalize(paymentId, g) {
    setBusy(true);
    setMsg("결제를 확인하는 중…");
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", { body: { paymentId, grade: g } });
      if (error) {
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

  // 1단계: 결제하기 (게스트도 로그인 없이 결제)
  async function startCheckout() {
    setMsg("");
    if (!supabase || !STORE_ID || !CHANNEL_KEY) {
      setMsg("결제 설정이 아직 없습니다. docs/SETUP.md의 Supabase·포트원 키를 .env에 넣어주세요.");
      return;
    }
    const ph = phone.replace(/[^0-9]/g, "");
    if (!name.trim() || ph.length < 10) { setMsg("이름과 휴대폰 번호를 입력해 주세요."); return; }
    const mail = email.trim();
    if (isGuest && !/^\S+@\S+\.\S+$/.test(mail)) { setMsg("결제 영수증·계정에 쓸 이메일을 정확히 입력해 주세요."); return; }

    setBusy(true);
    try {
      const paymentId = `pay-${crypto.randomUUID()}`;
      // 모바일 리다이렉트 복귀에 대비해 결제 정보 보관 (비번은 저장하지 않음)
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ paymentId, grade, name: name.trim(), phone: ph, email: mail }));
      const m = METHODS.find((x) => x.key === method) || METHODS[0];
      const customer = { email: user?.email || mail, fullName: name.trim(), phoneNumber: ph };

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
        customData: JSON.stringify({ grade: grade === "1급" ? "level1" : "level2" }),
      });

      // 데스크톱(팝업): 결과가 여기로 반환됨. (모바일은 리다이렉트되어 도달 안 함)
      if (res?.code) throw new Error(res.message || "결제가 취소되었습니다.");

      if (user) {
        await finalize(paymentId, grade); // 로그인 상태면 바로 검증
      } else {
        setPaidId(paymentId);
        setPhase("account");
        setBusy(false);
        setMsg("결제가 완료되었습니다. 아래에서 계정을 만들어 학습을 시작하세요.");
      }
    } catch (e) {
      setMsg(e.message || "결제 처리 중 오류가 발생했습니다.");
      setBusy(false);
    }
  }

  // 2단계: 계정 만들기 → 이메일로 인증 코드 발송
  async function createAccount() {
    setMsg("");
    if (password.length < 6) { setMsg("비밀번호는 6자 이상이어야 합니다."); return; }
    if (!termsAgree) { setMsg("이용약관 및 개인정보 처리방침에 동의해 주세요."); return; }
    setBusy(true);
    const { data, error } = await signUp({
      email: email.trim(), password, name: name.trim(), phone: phone.replace(/[^0-9]/g, ""),
      targetGrade: grade, examDate: "", marketingAgree, termsAgree,
    });
    if (error) {
      setBusy(false);
      const m = (error.message || "").toLowerCase();
      // 인증 메일 발송 실패(SMTP 문제) — 결제는 이미 완료됐으니 안심시키고 안내
      if (m.includes("email") && (m.includes("send") || m.includes("confirmation"))) {
        setMsg("결제는 정상 완료되었습니다. 다만 인증 메일 발송에 일시적 문제가 있어 계정 활성화가 지연되고 있어요. support@cellearn.kr 로 결제하신 이메일을 남겨 주시면 바로 처리해 드립니다.");
      } else {
        setMsg(error.message || "계정 생성에 실패했습니다.");
      }
      return;
    }
    if (data?.session) {
      // Supabase 이메일 인증이 꺼져 있으면 가입 즉시 로그인됨 → OTP 건너뛰고 바로 검증
      await finalize(paidId, grade);
      return;
    }
    setBusy(false);
    setPhase("otp");
    setMsg("입력하신 이메일로 6자리 인증 코드를 보냈습니다. 코드를 입력해 주세요.");
  }

  // 3단계: 코드 인증 → 즉시 로그인 → 결제 검증(수강권 귀속)
  async function verifyAndFinish() {
    setMsg("");
    if (otp.trim().length < 6) { setMsg("6자리 인증 코드를 입력해 주세요."); return; }
    setBusy(true);
    const { error } = await verifySignupOtp({ email: email.trim(), token: otp });
    if (error) { setBusy(false); setMsg(error.message || "인증에 실패했습니다. 코드를 다시 확인해 주세요."); return; }
    // 세션 발급됨(로그인 상태) → 결제 검증
    await finalize(paidId, grade);
  }

  async function resendCode() {
    setMsg("");
    const { error } = await resendSignupOtp({ email: email.trim() });
    setMsg(error ? (error.message || "코드 재발송에 실패했습니다.") : "인증 코드를 다시 보냈습니다.");
  }

  const wrap = { minHeight: "100vh", background: UI.bg, color: UI.ink, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px", fontFamily: UI.font };
  const card = { width: "100%", maxWidth: 460, background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 34, boxShadow: UI.shadow };
  const methodBtn = (active) => ({
    padding: "10px 8px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
    border: `1.5px solid ${active ? UI.teal : UI.line}`, background: active ? UI.tealSoft : UI.surface,
    color: active ? UI.teal : UI.mut, fontFamily: UI.font,
  });
  const inp = { border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "11px 12px", fontSize: 14, fontFamily: UI.font, color: UI.ink, boxSizing: "border-box", outline: "none", width: "100%" };
  const primary = (label) => (
    <button onClick={phase === "form" ? startCheckout : phase === "account" ? createAccount : verifyAndFinish} disabled={busy}
      style={{ width: "100%", marginTop: 22, background: UI.teal, color: "#fff", border: "none", padding: 14, borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1, fontFamily: UI.font }}>
      {busy ? "처리 중…" : label}
    </button>
  );

  return (
    <div style={wrap}>
      <div style={card}>
        {onBack && phase === "form" && <button style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "8px 15px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }} onClick={onBack}>← 홈으로</button>}

        <div style={{ fontSize: 23, fontWeight: 700 }}>수강 결제</div>
        <div style={{ fontSize: 13.5, color: UI.mut, margin: "6px 0 22px" }}>결제하면 올해 말까지 해당 학습 과정의 학습·실습이 열립니다.</div>

        {/* 진행 단계 표시 (게스트 결제-우선 흐름) */}
        {isGuest && (
          <div style={{ display: "flex", gap: 6, marginBottom: 20, fontSize: 12, fontWeight: 700 }}>
            {[["1", "결제", "form"], ["2", "계정", "account"], ["3", "인증", "otp"]].map(([n, lab, ph], i) => {
              const order = { form: 0, account: 1, otp: 2 };
              const active = order[phase] >= i;
              return (
                <div key={n} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: UI.rSm, background: active ? UI.tealSoft : UI.panelAlt, color: active ? UI.teal : UI.faint, border: `1px solid ${active ? UI.teal : UI.line}` }}>{n} {lab}</div>
              );
            })}
          </div>
        )}

        {/* 학습 과정 (읽기 전용) */}
        <div style={{ fontSize: 13, fontWeight: 700, color: UI.ink, marginBottom: 10 }}>학습 과정</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 20px", borderRadius: UI.rMd, border: `2px solid ${UI.teal}`, background: UI.limeSoft }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>컴활 {grade} 실기</div>
            <div style={{ fontSize: 13, color: UI.mut, marginTop: 4 }}>올해 끝까지 이용</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: UI.teal, fontFamily: UI.mono }}>{product.amount.toLocaleString()}원</div>
        </div>

        {/* ── 1단계: 결제 정보 ── */}
        {phase === "form" && (
          <>
            <div style={{ marginTop: 22, fontSize: 13, fontWeight: 700, color: UI.ink }}>결제수단</div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {METHODS.map((m) => (
                <button key={m.key} style={methodBtn(method === m.key)} onClick={() => setMethod(m.key)}>{m.label}</button>
              ))}
            </div>

            <div style={{ marginTop: 22, fontSize: 13, fontWeight: 700, color: UI.ink }}>구매자 정보</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" style={inp} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="휴대폰 번호 (- 없이 숫자만)" inputMode="numeric" style={inp} />
              {isGuest && <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일 (영수증·로그인 아이디)" style={inp} />}
            </div>

            <div style={{ marginTop: 20, fontSize: 13, color: UI.mut, lineHeight: 1.7 }}>
              · 상품: {product.label}<br />
              · 결제 금액: <b style={{ color: UI.ink, fontFamily: UI.mono }}>{product.amount.toLocaleString()}원</b><br />
              · 이용 기간: 결제일부터 <b style={{ color: UI.ink }}>2026년 12월 31일</b>까지
            </div>

            {msg && <div style={{ marginTop: 16, background: UI.tealSoft, border: `1px solid ${UI.greenLine}`, color: UI.teal, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13 }}>{msg}</div>}
            {primary(`${product.amount.toLocaleString()}원 결제하기`)}

            {isGuest && (
              <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: UI.mut }}>
                이미 계정이 있으신가요?{" "}
                <button type="button" onClick={onNeedLogin} style={{ background: "transparent", border: "none", color: UI.teal, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: UI.font }}>로그인</button>
              </div>
            )}
          </>
        )}

        {/* ── 2단계: 계정 만들기 (결제 완료 후) ── */}
        {phase === "account" && (
          <>
            <div style={{ marginTop: 18, background: UI.greenSoft, border: `1px solid ${UI.greenLine}`, color: UI.green, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>✓ 결제 완료 — 이제 계정을 만들어 학습을 시작하세요.</div>
            <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: UI.ink }}>계정 만들기</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일" style={inp} />
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 (6자 이상)" style={inp} />
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6, fontSize: 13, color: UI.mut }}>
                <input type="checkbox" checked={termsAgree} onChange={(e) => setTermsAgree(e.target.checked)} />
                <span>[필수] 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: UI.mut }}>
                <input type="checkbox" checked={marketingAgree} onChange={(e) => setMarketingAgree(e.target.checked)} />
                <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
              </label>
            </div>
            {msg && <div style={{ marginTop: 16, background: UI.tealSoft, border: `1px solid ${UI.greenLine}`, color: UI.teal, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13 }}>{msg}</div>}
            {primary("인증 코드 받기")}
          </>
        )}

        {/* ── 3단계: 이메일 코드 인증 → 즉시 로그인 ── */}
        {phase === "otp" && (
          <>
            <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: UI.ink }}>이메일 인증</div>
            <div style={{ fontSize: 12.5, color: UI.mut, margin: "4px 0 10px" }}><b style={{ color: UI.ink }}>{email}</b> 로 보낸 6자리 코드를 입력하세요.</div>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} inputMode="numeric" placeholder="6자리 코드" style={{ ...inp, fontFamily: UI.mono, fontSize: 20, letterSpacing: 6, textAlign: "center" }} />
            <div style={{ marginTop: 8, textAlign: "center", fontSize: 13, color: UI.mut }}>
              코드를 못 받으셨나요?{" "}
              <button type="button" onClick={resendCode} style={{ background: "transparent", border: "none", color: UI.teal, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: UI.font }}>재발송</button>
            </div>
            {msg && <div style={{ marginTop: 16, background: UI.tealSoft, border: `1px solid ${UI.greenLine}`, color: UI.teal, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13 }}>{msg}</div>}
            {primary("인증하고 학습 시작")}
          </>
        )}
      </div>
    </div>
  );
}
