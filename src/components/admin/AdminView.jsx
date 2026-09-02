import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { LESSONS } from "../../data/lessons";
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

  const totalLessons = LESSONS.length;

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
        </>
      )}
    </div>
  );
}
