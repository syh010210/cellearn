import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UI } from "../../theme";
import { S } from "./authStyles";

// 로그인 전용 화면 — 회원가입은 여기서 하지 않는다.
// 신규 수강 신청은 랜딩의 '수강료'에서 과정을 선택(예: 2급 실기 시작하기)해 진행한다.
export default function LoginView({ onNeedAccount }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await signIn({ email, password });
    setBusy(false);
    if (error) setErr(error.message || "로그인에 실패했습니다.");
  }

  return (
    <form onSubmit={submit}>
      <div style={S.title}>로그인</div>
      <div style={S.sub}>수강생 계정으로 로그인하면 실습이 열립니다.</div>

      <label style={S.label}>이메일</label>
      <input style={S.input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

      <label style={S.label}>비밀번호</label>
      <input style={S.input} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

      {err && <div style={S.error}>{err}</div>}
      <button style={S.primary} disabled={busy}>{busy ? "확인 중…" : "로그인"}</button>

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
        아직 수강생이 아니신가요?{" "}
        <button type="button" style={S.ghost} onClick={onNeedAccount}>수강 신청하기</button>
      </div>
    </form>
  );
}
