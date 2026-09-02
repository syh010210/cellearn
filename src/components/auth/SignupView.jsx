import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UI } from "../../theme";
import { S } from "./authStyles";
import MonthYearPicker from "./MonthYearPicker";

export default function SignupView({ onSwitch }) {
  const { signUp } = useAuth();
  const [f, setF] = useState({
    name: "", email: "", password: "", phone: "",
    examDate: "",
    marketingAgree: false, termsAgree: false,
  });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!f.termsAgree) { setErr("이용약관 및 개인정보 처리방침에 동의해 주세요."); return; }
    if (f.password.length < 6) { setErr("비밀번호는 6자 이상이어야 합니다."); return; }
    setBusy(true);
    const { error } = await signUp(f);
    setBusy(false);
    if (error) { setErr(error.message || "가입에 실패했습니다."); return; }
    setDone(true);
  }

  if (done) return (
    <div>
      <div style={S.title}>가입 신청 완료 🎉</div>
      <div style={S.ok}>
        입력하신 이메일로 인증 메일을 보냈습니다. 메일의 링크를 눌러 인증을 마친 뒤 로그인해 주세요.
      </div>
      <button style={S.primary} onClick={onSwitch}>로그인 화면으로</button>
    </div>
  );

  return (
    <form onSubmit={submit}>
      <div style={S.title}>회원가입</div>
      <div style={S.sub}>결제 후 선택한 급수의 학습·실습을 이용할 수 있습니다.</div>

      <label style={S.label}>이름</label>
      <input style={S.input} required value={f.name} onChange={set("name")} />

      <label style={S.label}>이메일</label>
      <input style={S.input} type="email" required value={f.email} onChange={set("email")} />

      <label style={S.label}>비밀번호 (6자 이상)</label>
      <input style={S.input} type="password" required value={f.password} onChange={set("password")} />

      <label style={S.label}>휴대전화번호</label>
      <input style={S.input} type="tel" placeholder="010-0000-0000" required value={f.phone} onChange={set("phone")} />

      <label style={S.label}>응시 예정 시기 <span style={{ color: UI.faint, fontWeight: 500 }}>(선택)</span></label>
      <MonthYearPicker value={f.examDate} onChange={(v) => setF((p) => ({ ...p, examDate: v }))} />

      <label style={S.checkRow}>
        <input type="checkbox" checked={f.termsAgree} onChange={set("termsAgree")} />
        <span>[필수] 이용약관 및 개인정보 수집·이용에 동의합니다.</span>
      </label>
      <label style={S.checkRow}>
        <input type="checkbox" checked={f.marketingAgree} onChange={set("marketingAgree")} />
        <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
      </label>

      {err && <div style={S.error}>{err}</div>}
      <button style={S.primary} disabled={busy}>{busy ? "처리 중…" : "가입하기"}</button>

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
        이미 계정이 있으신가요?{" "}
        <button type="button" style={S.ghost} onClick={onSwitch}>로그인</button>
      </div>
    </form>
  );
}
