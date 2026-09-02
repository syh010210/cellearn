import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UI } from "../../theme";

// 비밀번호 입력 + 표시/숨김 토글 (눈 아이콘). 로그인·회원가입·결제에서 공통 사용.
export default function PasswordInput({ style, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        type={show ? "text" : "password"}
        style={{ ...style, paddingRight: 44, width: "100%", boxSizing: "border-box" }}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 표시"}
        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: UI.mut, display: "flex", padding: 6 }}
      >
        {show ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
      </button>
    </div>
  );
}
