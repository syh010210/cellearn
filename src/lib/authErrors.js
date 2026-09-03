// Supabase Auth 에러 메시지(영어) → 사용자용 한글 문구 변환.
// signIn / signUp / verifyOtp 등에서 올라오는 error를 그대로 노출하지 말고 이 함수를 거친다.
export function krAuthError(error, fallback = "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.") {
  if (!error) return "";
  const raw = (typeof error === "string" ? error : error.message) || "";
  const m = raw.toLowerCase();

  // 로그인 실패 (아이디/비번 불일치)
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";

  // 이메일 미인증
  if (m.includes("email not confirmed"))
    return "이메일 인증이 아직 완료되지 않았습니다. 메일함에서 인증을 먼저 완료해 주세요.";

  // 이미 가입된 이메일
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "이미 가입된 이메일입니다. 로그인해 주세요.";

  // 인증 코드(OTP) 오류/만료
  if (m.includes("token has expired") || m.includes("otp_expired"))
    return "인증 코드가 만료되었습니다. 코드를 다시 요청해 주세요.";
  if ((m.includes("invalid") && m.includes("otp")) || m.includes("token is invalid"))
    return "인증 코드가 올바르지 않습니다. 다시 확인해 주세요.";

  // 요청 과다(레이트 리밋)
  if (m.includes("email rate limit exceeded"))
    return "인증 메일 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  if (m.includes("for security purposes") && m.includes("seconds")) {
    const s = raw.match(/(\d+)\s*seconds?/i);
    return s ? `보안을 위해 ${s[1]}초 후에 다시 시도해 주세요.` : "잠시 후 다시 시도해 주세요.";
  }
  if (m.includes("request this after") || m.includes("rate limit"))
    return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";

  // 비밀번호 규칙
  if (m.includes("password should be at least"))
    return "비밀번호는 6자 이상이어야 합니다.";
  if (m.includes("password is too weak") || m.includes("weak password"))
    return "비밀번호가 너무 단순합니다. 더 복잡하게 설정해 주세요.";

  // 이메일 형식/발송 실패
  if (m.includes("unable to validate email address") || m.includes("invalid email") || (m.includes("email address") && m.includes("invalid")))
    return "이메일 형식이 올바르지 않습니다.";
  if (m.includes("error sending") && m.includes("email"))
    return "인증 메일 발송에 문제가 있습니다. 잠시 후 다시 시도하거나 support@cellearn.kr 로 문의해 주세요.";

  // 이메일 로그인 비활성
  if (m.includes("email logins are disabled") || m.includes("signups not allowed"))
    return "현재 이메일 로그인이 비활성화되어 있습니다. 잠시 후 다시 시도해 주세요.";

  // 네트워크
  if (m.includes("failed to fetch") || m.includes("network"))
    return "네트워크 연결을 확인해 주세요.";

  // Supabase 미설정(개발용)
  if (m.includes("supabase 미설정")) return raw;

  return fallback;
}
