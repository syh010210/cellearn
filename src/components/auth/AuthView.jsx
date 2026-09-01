import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import { S } from "./authStyles";

// 로그인/회원가입을 토글하는 인증 페이지 컨테이너
export default function AuthView({ onBack }) {
  const { isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState("login");

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        {onBack && (
          <button type="button" style={{ ...S.ghost, color: "#94a3b8", marginBottom: 12 }} onClick={onBack}>← 홈</button>
        )}
        {!isSupabaseConfigured && (
          <div style={S.banner}>
            ⚠️ 아직 Supabase 키가 설정되지 않았습니다. <code>.env</code>에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 넣으면 실제 로그인이 동작합니다. (docs/SETUP.md 참고)
          </div>
        )}
        {mode === "login"
          ? <LoginView onSwitch={() => setMode("signup")} />
          : <SignupView onSwitch={() => setMode("login")} />}
      </div>
    </div>
  );
}
