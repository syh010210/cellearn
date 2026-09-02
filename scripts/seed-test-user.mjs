// 테스트 로그인 계정 생성 스크립트 (KG이니시스 결제 테스트용)
//
// 비회원 결제는 막혀 있으므로, 결제 흐름을 테스트하려면 로그인 계정이 필요하다.
// 이 스크립트는 Supabase Admin API로 "이메일 인증 완료" 상태의 테스트 유저를 만든다.
//
// 실행 (둘 중 하나):
//   Bash:        SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-test-user.mjs
//   PowerShell:  $env:SUPABASE_URL="..."; $env:SUPABASE_SERVICE_ROLE_KEY="..."; node scripts/seed-test-user.mjs
//
// - SUPABASE_URL: Supabase 프로젝트 URL (VITE_SUPABASE_URL 과 동일값)
// - SUPABASE_SERVICE_ROLE_KEY: Settings > API 의 service_role 키 (비밀! 절대 커밋/노출 금지)
//
// 원하면 아래 기본 계정 정보를 바꿔서 실행해도 된다.

import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = process.env.TEST_EMAIL || "tester@cellearn.kr";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "Cellearn!234";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const { data, error } = await admin.auth.admin.createUser({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  email_confirm: true, // 인증 메일 없이 바로 로그인 가능
});

if (error) {
  if (String(error.message).includes("already been registered")) {
    console.log(`ℹ️ 이미 존재하는 계정입니다: ${TEST_EMAIL} (그대로 로그인해서 쓰면 됩니다)`);
    process.exit(0);
  }
  console.error("❌ 생성 실패:", error.message);
  process.exit(1);
}

console.log("✅ 테스트 계정 생성 완료");
console.log("   이메일:", TEST_EMAIL);
console.log("   비밀번호:", TEST_PASSWORD);
console.log("   user id:", data.user?.id);
