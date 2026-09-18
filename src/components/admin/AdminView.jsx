import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { LESSONS } from "../../data/lessons";
import { DAYS } from "../../data/days";
import { computeRefund } from "../../data/refund";
import { PAID_MONTHS } from "../../data/membership";
import { kstDateStr } from "../../lib/trackVisit";
import { UI } from "../../theme";

// 관리자 대시보드 — 회원/결제/진도 데이터 조회. role='admin' 계정만 접근.
// 원본 Supabase 컬럼 대신 한글 라벨·포맷된 금액/날짜·상태 뱃지로 가공해서 보여준다.
export default function AdminView({ onBack }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("overview");
  const [profiles, setProfiles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 접속 현황(방문자) — 날짜별로 따로 조회
  const [visits, setVisits] = useState([]);
  const [visitDate, setVisitDate] = useState(() => kstDateStr());
  const [visitsLoading, setVisitsLoading] = useState(false);
  // 수강(테스트) 계정 관리 (Edge Function admin-student)
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createMsg, setCreateMsg] = useState(null); // { ok, text }
  const [createBusy, setCreateBusy] = useState(false);

  const totalLessons = LESSONS.length;
  const day1LessonCount = DAYS[0]?.lessons.length ?? 3; // 1일차 차시 수(전액 환불 기준)

  // 관리자 데이터는 양이 적으므로(초기 서비스) 한 번에 모두 받아 탭별로 가공한다.
  async function load() {
    if (!supabase || !isAdmin) { setLoading(false); return; }
    setLoading(true); setError(null);
    const [profRes, payRes, enrRes, progRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*"),
      supabase.from("progress").select("user_id, lesson_id, done, score, updated_at"),
    ]);
    const firstErr = profRes.error || payRes.error || enrRes.error || progRes.error;
    if (firstErr) { setError(firstErr.message); setLoading(false); return; }
    setProfiles(profRes.data ?? []);
    setPayments(payRes.data ?? []);
    setEnrollments(enrRes.data ?? []);
    setProgress(progRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isAdmin]);

  // 접속 현황: 탭 진입 또는 날짜 변경 시 해당 날짜(KST) 방문 기록 조회
  async function loadVisits(date) {
    if (!supabase || !isAdmin) return;
    setVisitsLoading(true);
    const { data, error: err } = await supabase.from("visits").select("*").eq("visit_date", date);
    if (!err) setVisits(data ?? []);
    setVisitsLoading(false);
  }
  useEffect(() => { if (tab === "visits") loadVisits(visitDate); /* eslint-disable-next-line */ }, [tab, visitDate, isAdmin]);

  // ── 수강 계정 (Edge Function) ──────────────────────────────
  // functions.invoke 가 세션 복원 직후엔 anon 키를 Authorization 으로 보내는 경우가 있어(→ 함수에서 401),
  // 호출 직전에 현재 세션 access_token 을 직접 받아 Authorization 헤더로 명시한다.
  // 비-2xx 시 error 본문은 error.context(Response)에 담기므로 서버 한글 메시지를 꺼낸다.
  async function invokeAdminStudent(body) {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) return { error: "로그인 세션이 없습니다. 다시 로그인해 주세요." };
    const { data, error: err } = await supabase.functions.invoke("admin-student", {
      body,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (err) {
      let msg = err.message || "요청 실패";
      try { const j = await err.context.json(); if (j?.error) msg = j.error + (j.reason ? ` (${j.reason})` : ""); } catch { /* 무시 */ }
      return { error: msg };
    }
    return { data };
  }
  async function loadStudents() {
    if (!supabase || !isAdmin) return;
    setStudentsLoading(true);
    const { data, error: err } = await invokeAdminStudent({ action: "list" });
    if (!err) setStudents(data?.students ?? []);
    setStudentsLoading(false);
  }
  useEffect(() => { if (tab === "students") loadStudents(); /* eslint-disable-next-line */ }, [tab, isAdmin]);

  async function createStudent(e) {
    e?.preventDefault?.();
    setCreateBusy(true); setCreateMsg(null);
    const { error: err } = await invokeAdminStudent({ action: "create", username: newUsername.trim().toLowerCase(), password: newPassword });
    setCreateBusy(false);
    if (err) { setCreateMsg({ ok: false, text: err }); return; }
    setCreateMsg({ ok: true, text: `${newUsername.trim().toLowerCase()} 생성됨, 2급 1년` });
    setNewUsername(""); setNewPassword("");
    loadStudents();
  }
  async function resetStudent(username) {
    if (!window.confirm(`${username} 계정의 학습 기록(진도·일차·오답·응시)을 모두 지웁니다. 계속할까요?`)) return;
    const { data, error: err } = await invokeAdminStudent({ action: "reset", username });
    if (err) { alert(err); return; }
    const d = data?.deleted || {};
    alert(`${username} 초기화 완료 — 진도 ${d.progress ?? 0} · 일차 ${d.day_clears ?? 0} · 오답 ${d.wrong_notes ?? 0} · 응시 ${d.exam_attempts ?? 0}`);
    loadStudents();
  }
  // 수강권 회수: 계정·결제·진도는 보존하고 학습 접근만 차단(enrollments.valid_to=now). 실제 환불은 결제사에서 수동.
  async function revokeEnrollment(uid, label) {
    if (!window.confirm(`${label} 회원의 수강권을 회수합니다.\n학습 접근이 즉시 차단됩니다. 계정·결제·진도 기록은 삭제하지 않습니다.\n(실제 환불은 결제사에서 별도로 처리하세요.)\n계속할까요?`)) return;
    const { data, error: err } = await invokeAdminStudent({ action: "revoke", user_id: uid });
    if (err) { alert(err); return; }
    alert(`수강권 회수 완료 — 회수된 수강권 ${data?.revoked ?? 0}건.`);
    load();
  }

  // ── 파생 데이터 ─────────────────────────────────────────────
  const profById = useMemo(() => {
    const m = new Map();
    profiles.forEach((p) => m.set(p.id, p));
    return m;
  }, [profiles]);

  const now = Date.now();
  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.valid_to && new Date(e.valid_to).getTime() > now),
    [enrollments, now],
  );

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid");
    const revenue = paid.reduce((s, p) => s + (p.amount || 0), 0);
    const paidUserIds = new Set(activeEnrollments.map((e) => e.user_id));
    const byGrade = { "1급": 0, "2급": 0 };
    activeEnrollments.forEach((e) => { if (byGrade[e.grade] != null) byGrade[e.grade] += 1; });
    const todayStr = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" });
    const isToday = (v) => v && new Date(v).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) === todayStr;
    return {
      members: profiles.length,
      paidMembers: paidUserIds.size,
      revenue,
      paidCount: paid.length,
      failedCount: payments.filter((p) => p.status === "failed").length,
      activeCount: activeEnrollments.length,
      byGrade,
      conversion: profiles.length ? Math.round((paidUserIds.size / profiles.length) * 100) : 0,
      todaySignups: profiles.filter((p) => isToday(p.created_at)).length,
      todayRevenue: paid.filter((p) => isToday(p.paid_at || p.created_at)).reduce((s, p) => s + (p.amount || 0), 0),
    };
  }, [profiles, payments, activeEnrollments]);

  // 회원별 활성 수강권(급수·만료일)
  const enrByUser = useMemo(() => {
    const m = new Map();
    activeEnrollments.forEach((e) => {
      const prev = m.get(e.user_id);
      if (!prev || new Date(e.valid_to) > new Date(prev.valid_to)) m.set(e.user_id, e);
    });
    return m;
  }, [activeEnrollments]);

  // 진도 집계(사용자별)
  const progressRows = useMemo(() => {
    const byUser = new Map();
    profiles.forEach((p) => byUser.set(p.id, {
      email: p.email || p.id, name: p.name || "", grade: p.target_grade || "",
      done: 0, scoreSum: 0, scoreCnt: 0, last: null,
    }));
    progress.forEach((r) => {
      let u = byUser.get(r.user_id);
      if (!u) { u = { email: r.user_id, name: "", grade: "", done: 0, scoreSum: 0, scoreCnt: 0, last: null }; byUser.set(r.user_id, u); }
      if (r.done) u.done += 1;
      if (typeof r.score === "number") { u.scoreSum += r.score; u.scoreCnt += 1; }
      if (!u.last || r.updated_at > u.last) u.last = r.updated_at;
    });
    return [...byUser.values()]
      .map((u) => ({
        ...u,
        pct: totalLessons ? Math.round((u.done / totalLessons) * 100) : 0,
        avg: u.scoreCnt ? Math.round((u.scoreSum / u.scoreCnt) * 10) / 10 : null,
      }))
      .sort((a, b) => b.done - a.done || String(b.last || "").localeCompare(String(a.last || "")));
  }, [profiles, progress, totalLessons]);

  // 환불·수강권 회수용 회원별 집계 (결제 있는 회원만)
  const refundRows = useMemo(() => {
    const paidByUser = new Map();
    payments.forEach((p) => {
      if (p.status !== "paid") return;
      const t = p.paid_at || p.created_at;
      const cur = paidByUser.get(p.user_id);
      if (!cur || new Date(t) > new Date(cur.paidAt)) paidByUser.set(p.user_id, { amount: p.amount || 0, paidAt: t });
    });
    const doneByUser = new Map();
    progress.forEach((r) => { if (r.done) doneByUser.set(r.user_id, (doneByUser.get(r.user_id) || 0) + 1); });
    const enrByUser = new Map();
    enrollments.forEach((e) => { const cur = enrByUser.get(e.user_id); if (!cur || new Date(e.valid_to) > new Date(cur.valid_to)) enrByUser.set(e.user_id, e); });
    const rows = [];
    for (const [uid, pay] of paidByUser) {
      const prof = profById.get(uid);
      const done = doneByUser.get(uid) || 0;
      const enr = enrByUser.get(uid);
      const rf = computeRefund({ amount: pay.amount, totalLessons, doneLessons: done, day1LessonCount, paidStartMs: Date.parse(pay.paidAt), paidMonths: PAID_MONTHS, nowMs: now });
      rows.push({
        uid, email: prof?.email || uid, name: prof?.name || "",
        amount: pay.amount, paidAt: pay.paidAt, done,
        elapsedPaidDays: Math.round(rf.elapsedPaidDays), periodDays: Math.round(rf.periodDays),
        refund: rf.refund, reason: rf.reason, refundable: rf.refundable, full: rf.full, capped: rf.capped,
        active: !!(enr && new Date(enr.valid_to).getTime() > now),
        revoked: !!enr?.revoked_at, revokedAt: enr?.revoked_at || null, validTo: enr?.valid_to || null,
      });
    }
    return rows.sort((a, b) => String(b.paidAt || "").localeCompare(String(a.paidAt || "")));
  }, [payments, progress, enrollments, profById, totalLessons, day1LessonCount, now]);

  // 접속 현황 집계(선택 날짜)
  const visitStats = useMemo(() => {
    const total = visits.length;
    const members = visits.filter((v) => v.user_id).length;
    const paid = visits.filter((v) => v.medium === "paid").length;
    const byDevice = { mobile: 0, tablet: 0, desktop: 0 };
    visits.forEach((v) => { if (byDevice[v.device] != null) byDevice[v.device] += 1; });
    const bySource = {};
    visits.forEach((v) => { const s = v.source || "기타"; bySource[s] = (bySource[s] || 0) + 1; });
    const byCampaign = {};
    visits.forEach((v) => {
      if (!v.campaign && !v.content) return;
      const k = `${v.campaign || "—"} / ${v.content || "—"}`;
      byCampaign[k] = (byCampaign[k] || 0) + 1;
    });
    return {
      total, members, paid, byDevice,
      sources: Object.entries(bySource).sort((a, b) => b[1] - a[1]),
      campaigns: Object.entries(byCampaign).sort((a, b) => b[1] - a[1]),
    };
  }, [visits]);

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.red, padding: 40, fontFamily: UI.font }}>관리자만 접근할 수 있습니다.</div>
  );

  // ── 공통 스타일/포맷터 ──────────────────────────────────────
  const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: UI.mut, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", fontWeight: 700 };
  const td = { padding: "10px 12px", fontSize: 13, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", color: UI.ink };
  const tdNum = { ...td, fontFamily: UI.mono };

  const fmtWon = (n) => "₩" + (n || 0).toLocaleString("ko-KR");
  const fmtDateTime = (v) => v ? new Date(v).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
  const fmtDay = (v) => v ? String(v).slice(0, 10) : "—";

  const STATUS = {
    paid: { label: "완료", bg: UI.greenSoft, fg: UI.green, line: UI.greenLine },
    pending: { label: "대기", bg: UI.panelAlt, fg: UI.mut, line: UI.line },
    failed: { label: "실패", bg: UI.redSoft, fg: UI.red, line: UI.redLine },
    cancelled: { label: "취소", bg: UI.panelAlt, fg: UI.mut, line: UI.line },
    refunded: { label: "환불", bg: "#fdf3e3", fg: UI.warn, line: "#f0dcb8" },
  };
  const Badge = ({ s }) => {
    const c = STATUS[s] || { label: s || "—", bg: UI.panelAlt, fg: UI.mut, line: UI.line };
    return <span style={{ background: c.bg, color: c.fg, border: `1px solid ${c.line}`, padding: "2px 10px", borderRadius: UI.rPill, fontSize: 12, fontWeight: 700 }}>{c.label}</span>;
  };
  const GradeChip = ({ g }) => g ? <span style={{ background: UI.tealSoft, color: UI.teal, padding: "2px 8px", borderRadius: UI.rSm, fontSize: 12, fontWeight: 700 }}>{g}</span> : <span style={{ color: UI.faint }}>—</span>;

  // 포트원 결제수단(raw jsonb)에서 사람이 읽을 수단명을 best-effort로 추출
  const payMethod = (raw) => {
    const m = raw?.method;
    if (!m) return "—";
    if (m.card?.publisher || m.card?.issuer) return `카드(${m.card.publisher || m.card.issuer})`;
    if (m.provider) return `간편(${m.provider})`;
    if (m.type) return String(m.type);
    return "—";
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ background: tab === t ? UI.teal : UI.panel, border: `1px solid ${tab === t ? UI.teal : UI.line}`, color: tab === t ? "#fff" : UI.mut, padding: "8px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 500 }}>{label}</button>
  );

  const Kpi = ({ label, value, unit, sub, accent }) => (
    <div style={{ background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: "18px 20px", minWidth: 0 }}>
      <div style={{ fontSize: 13, color: UI.mut, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: UI.mono, color: accent || UI.ink, lineHeight: 1.1 }}>
        {value}{unit && <span style={{ fontFamily: UI.font, fontSize: 15, fontWeight: 700, marginLeft: 3 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 12, color: UI.faint, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  const tableWrap = { overflowX: "auto", background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 14 };

  const vpct = (n) => visitStats.total ? Math.round((n / visitStats.total) * 100) : 0;
  const DEVICE_LABEL = { mobile: "모바일", tablet: "태블릿", desktop: "데스크톱" };

  return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.ink, padding: 32, fontFamily: UI.font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {onBack && <button style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={onBack}>← 홈</button>}
        <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0 }}>관리자 대시보드</h1>
        <button onClick={load} style={{ marginLeft: "auto", background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↻ 새로고침</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {tabBtn("overview", "개요")}
        {tabBtn("members", "회원")}
        {tabBtn("payments", "결제")}
        {tabBtn("progress", "진도")}
        {tabBtn("refund", "환불·수강권")}
        {tabBtn("visits", "접속 현황")}
        {tabBtn("students", "수강 계정")}
      </div>

      {error && <div style={{ color: UI.red, background: UI.redSoft, border: `1px solid ${UI.redLine}`, borderRadius: UI.rMd, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>데이터 조회 오류: {error}</div>}

      {loading ? <div style={{ color: UI.mut }}>불러오는 중…</div> : (
        <>
          {/* ── 개요 ─────────────────────────────── */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                <Kpi label="총 매출" value={fmtWon(stats.revenue)} sub={`오늘 +${fmtWon(stats.todayRevenue)}`} accent={UI.teal} />
                <Kpi label="유료 회원 (활성 수강권)" value={stats.paidMembers} sub={`전환율 ${stats.conversion}%`} accent={UI.green} />
                <Kpi label="총 회원" value={stats.members} sub={`오늘 가입 +${stats.todaySignups}`} />
                <Kpi label="활성 수강권" value={stats.activeCount} sub={`1급 ${stats.byGrade["1급"]} · 2급 ${stats.byGrade["2급"]}`} />
                <Kpi label="결제 성공" value={stats.paidCount} unit="건" />
                <Kpi label="결제 실패" value={stats.failedCount} unit="건" accent={stats.failedCount ? UI.red : UI.ink} />
              </div>

              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 10px" }}>최근 결제</h2>
                <div style={tableWrap}>
                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead><tr>
                      <th style={th}>결제일시</th><th style={th}>회원</th><th style={th}>급수</th><th style={th}>금액</th><th style={th}>상태</th>
                    </tr></thead>
                    <tbody>
                      {payments.slice(0, 8).map((p) => {
                        const u = profById.get(p.user_id);
                        return (
                          <tr key={p.id}>
                            <td style={tdNum}>{fmtDateTime(p.paid_at || p.created_at)}</td>
                            <td style={td}>{u ? (u.name || u.email) : <span style={{ fontFamily: UI.mono, color: UI.faint }}>{String(p.user_id).slice(0, 8)}…</span>}</td>
                            <td style={td}><GradeChip g={p.grade} /></td>
                            <td style={tdNum}>{fmtWon(p.amount)}</td>
                            <td style={td}><Badge s={p.status} /></td>
                          </tr>
                        );
                      })}
                      {payments.length === 0 && <tr><td style={td} colSpan={5}>결제 내역이 없습니다.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── 회원 ─────────────────────────────── */}
          {tab === "members" && (
            <div style={tableWrap}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr>
                  <th style={th}>가입일</th><th style={th}>이메일</th><th style={th}>이름</th><th style={th}>연락처</th>
                  <th style={th}>학습 과정</th><th style={th}>응시예정일</th><th style={th}>수강권</th><th style={th}>마케팅</th><th style={th}>권한</th>
                </tr></thead>
                <tbody>
                  {profiles.map((p) => {
                    const e = enrByUser.get(p.id);
                    return (
                      <tr key={p.id}>
                        <td style={tdNum}>{fmtDay(p.created_at)}</td>
                        <td style={td}>{p.email || "—"}</td>
                        <td style={td}>{p.name || "—"}</td>
                        <td style={tdNum}>{p.phone || "—"}</td>
                        <td style={td}><GradeChip g={p.target_grade} /></td>
                        <td style={tdNum}>{fmtDay(p.exam_date)}</td>
                        <td style={td}>{e ? <span style={{ color: UI.green, fontWeight: 700 }}>{e.grade} · ~{fmtDay(e.valid_to)}</span> : <span style={{ color: UI.faint }}>없음</span>}</td>
                        <td style={td}>{p.marketing_agree ? "✓" : "—"}</td>
                        <td style={td}>{p.role === "admin" ? <span style={{ color: UI.teal, fontWeight: 700 }}>관리자</span> : "회원"}</td>
                      </tr>
                    );
                  })}
                  {profiles.length === 0 && <tr><td style={td} colSpan={9}>회원이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 결제 ─────────────────────────────── */}
          {tab === "payments" && (
            <div style={tableWrap}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr>
                  <th style={th}>결제일시</th><th style={th}>회원</th><th style={th}>이메일</th><th style={th}>급수</th>
                  <th style={th}>금액</th><th style={th}>상태</th><th style={th}>결제수단</th><th style={th}>포트원 결제ID</th>
                </tr></thead>
                <tbody>
                  {payments.map((p) => {
                    const u = profById.get(p.user_id);
                    return (
                      <tr key={p.id}>
                        <td style={tdNum}>{fmtDateTime(p.paid_at || p.created_at)}</td>
                        <td style={td}>{u?.name || <span style={{ color: UI.faint }}>—</span>}</td>
                        <td style={td}>{u?.email || <span style={{ fontFamily: UI.mono, color: UI.faint }}>{String(p.user_id).slice(0, 8)}…</span>}</td>
                        <td style={td}><GradeChip g={p.grade} /></td>
                        <td style={tdNum}>{fmtWon(p.amount)}</td>
                        <td style={td}><Badge s={p.status} /></td>
                        <td style={td}>{payMethod(p.raw)}</td>
                        <td style={{ ...tdNum, color: UI.faint }}>{p.payment_id || "—"}</td>
                      </tr>
                    );
                  })}
                  {payments.length === 0 && <tr><td style={td} colSpan={8}>결제 내역이 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 진도 ─────────────────────────────── */}
          {tab === "progress" && (
            <div style={tableWrap}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr>
                  <th style={th}>이메일</th><th style={th}>이름</th><th style={th}>학습 과정</th>
                  <th style={th}>완료 차시</th><th style={th}>진도율</th><th style={th}>퀴즈 평균</th><th style={th}>최근 학습</th>
                </tr></thead>
                <tbody>
                  {progressRows.map((u, i) => (
                    <tr key={u.email || i}>
                      <td style={td}>{u.email}</td>
                      <td style={td}>{u.name || "—"}</td>
                      <td style={td}><GradeChip g={u.grade} /></td>
                      <td style={tdNum}>{u.done} / {totalLessons}</td>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 90, height: 8, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rPill }}>
                            <div style={{ width: `${u.pct}%`, height: "100%", background: u.pct === 100 ? UI.lime : UI.teal, borderRadius: UI.rPill }} />
                          </div>
                          <span style={{ fontFamily: UI.mono, color: UI.mut }}>{u.pct}%</span>
                        </div>
                      </td>
                      <td style={tdNum}>{u.avg == null ? "—" : u.avg}</td>
                      <td style={tdNum}>{fmtDay(u.last)}</td>
                    </tr>
                  ))}
                  {progressRows.length === 0 && <tr><td style={td} colSpan={7}>데이터가 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* ── 환불·수강권 ─────────────────────────── */}
          {tab === "refund" && (
            <>
              <div style={{ background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "10px 14px", fontSize: 12.5, color: UI.mut, marginBottom: 12, lineHeight: 1.6 }}>
                환불 예상 금액은 <b style={{ color: UI.ink }}>환불정책 기준으로 계산한 참고용 표시</b>입니다. <b style={{ color: UI.ink }}>실제 환불은 결제사(PortOne) 콘솔에서 수동으로 처리</b>하세요. 수강권 회수는 학습 접근만 차단하며 계정·결제·진도 기록은 보존합니다.
              </div>
              <div style={tableWrap}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr>
                    <th style={th}>이메일</th><th style={th}>완료 차시</th><th style={th}>결제일</th><th style={th}>경과/유료기간(일)</th>
                    <th style={th}>결제금액</th><th style={th}>환불 예상</th><th style={th}>근거</th><th style={th}>수강권</th><th style={th}>회수</th>
                  </tr></thead>
                  <tbody>
                    {refundRows.map((u) => (
                      <tr key={u.uid}>
                        <td style={td}>{u.email}{u.name ? ` (${u.name})` : ""}</td>
                        <td style={tdNum}>{u.done} / {totalLessons}</td>
                        <td style={tdNum}>{fmtDay(u.paidAt)}</td>
                        <td style={tdNum}>{u.elapsedPaidDays} / {u.periodDays}</td>
                        <td style={tdNum}>{fmtWon(u.amount)}</td>
                        <td style={{ ...tdNum, color: u.refund === 0 ? UI.red : u.full ? UI.green : UI.ink, fontWeight: 700 }}>{fmtWon(u.refund)}{u.full ? " (전액)" : ""}</td>
                        <td style={{ ...td, whiteSpace: "normal", maxWidth: 260, color: UI.mut, fontSize: 12 }}>{u.reason}</td>
                        <td style={td}>
                          {u.revoked ? <span style={{ background: "#fdf3e3", color: UI.warn, border: "1px solid #f0dcb8", padding: "2px 10px", borderRadius: UI.rPill, fontSize: 12, fontWeight: 700 }}>회수됨</span>
                            : u.active ? <span style={{ background: UI.greenSoft, color: UI.green, border: `1px solid ${UI.greenLine}`, padding: "2px 10px", borderRadius: UI.rPill, fontSize: 12, fontWeight: 700 }}>활성</span>
                            : <span style={{ color: UI.faint }}>만료</span>}
                        </td>
                        <td style={td}>
                          <button onClick={() => revokeEnrollment(u.uid, u.email)} disabled={!u.active}
                            style={{ background: u.active ? UI.redSoft : UI.panelAlt, color: u.active ? UI.red : UI.faint, border: `1px solid ${u.active ? UI.redLine : UI.line}`, borderRadius: UI.rMd, padding: "5px 12px", fontSize: 12.5, fontWeight: 700, cursor: u.active ? "pointer" : "not-allowed" }}>
                            수강권 회수
                          </button>
                        </td>
                      </tr>
                    ))}
                    {refundRows.length === 0 && <tr><td style={td} colSpan={9}>결제 기록이 있는 회원이 없습니다.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── 접속 현황 ─────────────────────────── */}
          {tab === "visits" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 13, color: UI.mut, fontWeight: 700 }}>날짜</label>
                <input type="date" value={visitDate} max={kstDateStr()} onChange={(e) => setVisitDate(e.target.value)}
                  style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "7px 10px", fontSize: 13, fontFamily: UI.font, color: UI.ink, background: UI.panel }} />
                <button onClick={() => setVisitDate(kstDateStr())} style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>오늘</button>
                <button onClick={() => loadVisits(visitDate)} style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>↻ 새로고침</button>
                <span style={{ fontSize: 12, color: UI.faint }}>KST 기준 · 관리자 접속 제외</span>
              </div>

              {visitsLoading ? <div style={{ color: UI.mut }}>불러오는 중…</div> : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                    <Kpi label="방문자" value={visitStats.total} unit="명" accent={UI.teal} />
                    <Kpi label="회원 방문" value={visitStats.members} unit="명" sub={`전체의 ${vpct(visitStats.members)}%`} accent={UI.green} />
                    <Kpi label="광고 유입" value={visitStats.paid} unit="명" sub={`medium=paid · ${vpct(visitStats.paid)}%`} accent={visitStats.paid ? UI.teal : UI.ink} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
                    {/* 기기별 */}
                    <div>
                      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 10px" }}>기기별</h2>
                      <div style={tableWrap}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={th}>기기</th><th style={th}>방문자</th><th style={th}>비율</th></tr></thead>
                          <tbody>
                            {["mobile", "tablet", "desktop"].map((d) => (
                              <tr key={d}>
                                <td style={td}>{DEVICE_LABEL[d]}</td>
                                <td style={tdNum}>{visitStats.byDevice[d]}</td>
                                <td style={tdNum}>{vpct(visitStats.byDevice[d])}%</td>
                              </tr>
                            ))}
                            {visitStats.total === 0 && <tr><td style={td} colSpan={3}>방문 기록이 없습니다.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 유입 경로별 */}
                    <div>
                      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 10px" }}>유입 경로별 (source)</h2>
                      <div style={tableWrap}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={th}>출처</th><th style={th}>방문자</th><th style={th}>비율</th></tr></thead>
                          <tbody>
                            {visitStats.sources.map(([s, n]) => (
                              <tr key={s}><td style={td}>{s}</td><td style={tdNum}>{n}</td><td style={tdNum}>{vpct(n)}%</td></tr>
                            ))}
                            {visitStats.sources.length === 0 && <tr><td style={td} colSpan={3}>방문 기록이 없습니다.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 광고별 */}
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 10px" }}>광고별 (campaign · content)</h2>
                    <div style={tableWrap}>
                      <table style={{ borderCollapse: "collapse", width: "100%" }}>
                        <thead><tr><th style={th}>캠페인 / 콘텐츠</th><th style={th}>방문자</th><th style={th}>비율</th></tr></thead>
                        <tbody>
                          {visitStats.campaigns.map(([k, n]) => (
                            <tr key={k}><td style={td}>{k}</td><td style={tdNum}>{n}</td><td style={tdNum}>{vpct(n)}%</td></tr>
                          ))}
                          {visitStats.campaigns.length === 0 && <tr><td style={td} colSpan={3}>광고(캠페인) 유입이 없습니다.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── 수강 계정 ─────────────────────────── */}
          {tab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* 수강 계정 만들기 */}
              <div style={{ background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: "18px 20px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>수강 계정 만들기</h2>
                <form onSubmit={createStudent} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="아이디 (영문소문자·숫자·_ 3~20)"
                    style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "9px 12px", fontSize: 13, fontFamily: UI.font, minWidth: 240 }} />
                  <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="text" placeholder="비밀번호 (8자 이상)"
                    style={{ border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "9px 12px", fontSize: 13, fontFamily: UI.font, minWidth: 200 }} />
                  <button type="submit" disabled={createBusy} style={{ background: UI.teal, color: "#fff", border: "none", borderRadius: UI.rMd, padding: "9px 18px", fontSize: 13.5, fontWeight: 700, cursor: createBusy ? "default" : "pointer" }}>{createBusy ? "만드는 중…" : "만들기"}</button>
                  <span style={{ fontSize: 12, color: UI.faint }}>도메인 @student.cellearn.kr · 로그인은 아이디만 입력</span>
                </form>
                {createMsg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: createMsg.ok ? UI.green : UI.red }}>{createMsg.text}</div>}
              </div>

              {/* 테스트 계정 목록 */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "6px 0 10px" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>테스트 계정 목록</h2>
                  <button onClick={loadStudents} style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>↻ 새로고침</button>
                </div>
                {studentsLoading ? <div style={{ color: UI.mut }}>불러오는 중…</div> : (
                  <div style={tableWrap}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <thead><tr>
                        <th style={th}>아이디</th><th style={th}>생성일</th><th style={th}>수강권 만료</th><th style={th}>완료 차시</th><th style={th}>학습 초기화</th>
                      </tr></thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.user_id}>
                            <td style={td}>{s.username}</td>
                            <td style={tdNum}>{fmtDay(s.created_at)}</td>
                            <td style={td}>{s.valid_to ? <span style={{ color: new Date(s.valid_to) > new Date() ? UI.green : UI.faint, fontWeight: 700 }}>~{fmtDay(s.valid_to)}</span> : <span style={{ color: UI.faint }}>없음</span>}</td>
                            <td style={tdNum}>{s.done_count} / {totalLessons}</td>
                            <td style={td}><button onClick={() => resetStudent(s.username)} style={{ background: UI.redSoft, color: UI.red, border: `1px solid ${UI.redLine}`, borderRadius: UI.rMd, padding: "5px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>학습 초기화</button></td>
                          </tr>
                        ))}
                        {students.length === 0 && <tr><td style={td} colSpan={5}>수강 계정이 없습니다.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
