// Supabase Edge Function — 관리자용 수강(테스트) 계정 관리
// 배포: supabase functions deploy admin-student
// 시크릿: STUDENT_EMAIL_DOMAIN (선택, 기본 student.cellearn.kr) / SUPABASE_URL·SUPABASE_SERVICE_ROLE_KEY 는 런타임 자동 주입
//
// ⚠️ 서비스 롤 키는 이 함수(서버) 환경에서만 사용한다. 클라이언트에는 절대 내려보내지 않는다.
// 호출자 JWT 를 검증하고 profiles.role='admin' 일 때만 동작한다(아니면 403).
//
// 입력: { action: "create" | "reset" | "list", username, password? }
//  - create : 수강 계정 생성(이메일 인증 완료 처리) + 2급 수강권 1년 부여
//  - reset  : progress·day_clears·wrong_notes·exam_attempts 에서 그 계정 행 삭제
//  - list   : user_metadata.created_by='admin' 계정 목록(최대 100)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_DOMAIN = "student.cellearn.kr";
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) 호출자 인증 + 관리자 검증
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "인증이 필요합니다.", reason: "Authorization 헤더 없음" }, 401);
    const { data: userData, error: getErr } = await admin.auth.getUser(token);
    const caller = userData?.user;
    // 진단: 토큰이 사용자 세션이 아니라 anon 키면 role='anon' 으로 잡힌다(가장 흔한 401 원인).
    if (!caller) return json({ error: "인증이 필요합니다.", reason: getErr?.message || `세션 토큰이 아님(role=${jwtRole(token)})` }, 401);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", caller.id).single();
    if (prof?.role !== "admin") return json({ error: "관리자 권한이 필요합니다." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const domain = Deno.env.get("STUDENT_EMAIL_DOMAIN") || DEFAULT_DOMAIN;
    const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
    const emailOf = (u: string) => `${u}@${domain}`;

    // ── list ────────────────────────────────────────────────
    if (action === "list") {
      const { data: page, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
      if (listErr) return json({ error: "목록 조회 실패", detail: listErr.message }, 500);
      const students = (page?.users ?? []).filter((u) => u.user_metadata?.created_by === "admin");
      const ids = students.map((u) => u.id);
      let enrByUser: Record<string, string | null> = {};
      let doneByUser: Record<string, number> = {};
      if (ids.length) {
        const { data: enr } = await admin.from("enrollments").select("user_id, valid_to").in("user_id", ids);
        for (const e of enr ?? []) {
          const cur = enrByUser[e.user_id];
          if (!cur || new Date(e.valid_to) > new Date(cur)) enrByUser[e.user_id] = e.valid_to;
        }
        const { data: prog } = await admin.from("progress").select("user_id").eq("done", true).in("user_id", ids);
        for (const r of prog ?? []) doneByUser[r.user_id] = (doneByUser[r.user_id] || 0) + 1;
      }
      const rows = students
        .map((u) => ({
          username: u.user_metadata?.username ?? (u.email || "").split("@")[0],
          user_id: u.id,
          email: u.email,
          created_at: u.created_at,
          valid_to: enrByUser[u.id] ?? null,
          done_count: doneByUser[u.id] ?? 0,
        }))
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
      return json({ ok: true, students: rows });
    }

    // create·reset 공통: username 형식 검증
    if (action === "create" || action === "reset") {
      if (!USERNAME_RE.test(username)) {
        return json({ error: "아이디는 영문 소문자·숫자·밑줄 3~20자만 가능합니다." }, 400);
      }
    }

    // ── create ──────────────────────────────────────────────
    if (action === "create") {
      const password = typeof body?.password === "string" ? body.password : "";
      if (password.length < 8) return json({ error: "비밀번호는 8자 이상이어야 합니다." }, 400);
      const email = emailOf(username);

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, created_by: "admin" },
      });
      if (cErr) {
        if (/already.*(registered|exists)|email_exists|been registered/i.test(cErr.message || "")) {
          return json({ error: "이미 있는 아이디입니다." }, 409);
        }
        return json({ error: "계정 생성 실패", detail: cErr.message }, 500);
      }
      const uid = created.user!.id;

      // 2급 수강권 1년 (payments 는 건드리지 않는다)
      const validFrom = new Date();
      const validTo = new Date(validFrom);
      validTo.setUTCFullYear(validTo.getUTCFullYear() + 1);
      const { error: enrErr } = await admin.from("enrollments").insert({
        user_id: uid, grade: "2급", valid_from: validFrom.toISOString(), valid_to: validTo.toISOString(),
      });
      if (enrErr) return json({ error: "수강권 생성 실패", detail: enrErr.message }, 500);

      return json({ ok: true, email, user_id: uid, valid_to: validTo.toISOString() });
    }

    // ── reset ───────────────────────────────────────────────
    if (action === "reset") {
      const email = emailOf(username);
      const { data: p } = await admin.from("profiles").select("id").eq("email", email).single();
      if (!p?.id) return json({ error: "해당 아이디의 계정을 찾을 수 없습니다." }, 404);
      const uid = p.id;

      const tables = ["progress", "day_clears", "wrong_notes", "exam_attempts"];
      const deleted: Record<string, number> = {};
      for (const t of tables) {
        const { count, error: dErr } = await admin.from(t).delete({ count: "exact" }).eq("user_id", uid);
        if (dErr) return json({ error: `${t} 삭제 실패`, detail: dErr.message }, 500);
        deleted[t] = count ?? 0;
      }
      return json({ ok: true, user_id: uid, deleted });
    }

    return json({ error: "알 수 없는 action 입니다." }, 400);
  } catch (e) {
    console.error("admin-student exception:", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// JWT payload 의 role 만 꺼낸다(진단용). anon 키가 Authorization 으로 오면 'anon' 이 나온다.
function jwtRole(t: string): string {
  try {
    const seg = t.split(".")[1];
    const pad = seg.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(pad + "=".repeat((4 - (pad.length % 4)) % 4)));
    return payload.role || "(none)";
  } catch {
    return "(unparsable)";
  }
}
