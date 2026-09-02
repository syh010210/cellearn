import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LoginView from "./LoginView";
import SignupView from "./SignupView";
import { S } from "./authStyles";

// 인증 페이지 컨테이너.
// 기본은 로그인 전용. 수강 신청(제품 CTA)로 들어오면 initialMode="signup" + presetGrade로 가입 폼을 연다.
export default function AuthView({ onBack, initialMode = "login", presetGrade = "2급" }) {
  const { isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState(initialMode);

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
          ? <LoginView onNeedAccount={() => setMode("signup")} />
          : <SignupView presetGrade={presetGrade} onSwitch={() => setMode("login")} />}
      </div>
    </div>
  );
}
