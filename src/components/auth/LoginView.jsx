import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { S } from "./authStyles";

export default function LoginView({ onSwitch }) {
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
        아직 계정이 없으신가요?{" "}
        <button type="button" style={S.ghost} onClick={onSwitch}>회원가입</button>
      </div>
    </form>
  );
}
