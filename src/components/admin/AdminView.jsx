import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { LESSONS } from "../../data/lessons";
import { UI } from "../../theme";

// 관리자 대시보드 — 회원/결제/진도 데이터 조회. role='admin' 계정만 접근.
export default function AdminView({ onBack }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("members");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalLessons = LESSONS.length;

  useEffect(() => {
    if (!supabase || !isAdmin) { setLoading(false); return; }
    setLoading(true);

    // 진도 탭: 회원(이메일/이름) + 진도 행을 각각 받아 사용자별로 집계
    if (tab === "progress") {
      Promise.all([
        supabase.from("profiles").select("id, email, name, target_grade"),
        supabase.from("progress").select("user_id, lesson_id, done, score, updated_at"),
      ]).then(([{ data: profs }, { data: prog }]) => {
        const byUser = new Map();
        (profs ?? []).forEach((p) => byUser.set(p.id, {
          email: p.email || p.id, name: p.name || "", grade: p.target_grade || "",
          done: 0, scoreSum: 0, scoreCnt: 0, last: null,
        }));
        (prog ?? []).forEach((r) => {
          let u = byUser.get(r.user_id);
          if (!u) { u = { email: r.user_id, name: "", grade: "", done: 0, scoreSum: 0, scoreCnt: 0, last: null }; byUser.set(r.user_id, u); }
          if (r.done) u.done += 1;
          if (typeof r.score === "number") { u.scoreSum += r.score; u.scoreCnt += 1; }
          if (!u.last || r.updated_at > u.last) u.last = r.updated_at;
        });
        const summary = [...byUser.values()]
          .map((u) => ({
            ...u,
            pct: totalLessons ? Math.round((u.done / totalLessons) * 100) : 0,
            avg: u.scoreCnt ? Math.round((u.scoreSum / u.scoreCnt) * 10) / 10 : null,
          }))
          // 완료 차시 많은 순 → 최근 학습 순
          .sort((a, b) => b.done - a.done || String(b.last || "").localeCompare(String(a.last || "")));
        setRows(summary);
        setLoading(false);
      });
      return;
    }

    const q = tab === "members"
      ? supabase.from("profiles").select("*").order("created_at", { ascending: false })
      : supabase.from("payments").select("*").order("created_at", { ascending: false });
    q.then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, [tab, isAdmin, totalLessons]);

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.red, padding: 40, fontFamily: UI.font }}>관리자만 접근할 수 있습니다.</div>
  );

  const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: UI.mut, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", fontWeight: 700 };
  const td = { padding: "10px 12px", fontSize: 13, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", color: UI.ink };
  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ background: tab === t ? UI.teal : UI.panel, border: `1px solid ${tab === t ? UI.teal : UI.line}`, color: tab === t ? "#fff" : UI.mut, padding: "8px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 500 }}>{label}</button>
  );

  const cols = tab === "members"
    ? ["email", "name", "phone", "target_grade", "exam_date", "role", "created_at"]
    : ["created_at", "user_id", "grade", "amount", "status", "payment_id", "paid_at"];

  const fmtDate = (v) => (v ? String(v).slice(0, 10) : "—");

  return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.ink, padding: 32, fontFamily: UI.font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {onBack && <button style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={onBack}>← 홈</button>}
        <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0 }}>관리자 대시보드</h1>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {tabBtn("members", "회원")}
        {tabBtn("payments", "결제")}
        {tabBtn("progress", "진도")}
      </div>

      {loading ? <div style={{ color: UI.mut }}>불러오는 중…</div> : tab === "progress" ? (
        <div style={{ overflowX: "auto", background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr>
              <th style={th}>이메일</th>
              <th style={th}>이름</th>
              <th style={th}>목표급수</th>
              <th style={th}>완료 차시</th>
              <th style={th}>진도율</th>
              <th style={th}>퀴즈 평균</th>
              <th style={th}>최근 학습</th>
            </tr></thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.email || i}>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.name || "—"}</td>
                  <td style={td}>{u.grade || "—"}</td>
                  <td style={td}>{u.done} / {totalLessons}</td>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 90, height: 8, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: 999 }}>
                        <div style={{ width: `${u.pct}%`, height: "100%", background: UI.teal, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontVariantNumeric: "tabular-nums", color: UI.mut }}>{u.pct}%</span>
                    </div>
                  </td>
                  <td style={td}>{u.avg == null ? "—" : u.avg}</td>
                  <td style={td}>{fmtDate(u.last)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td style={td} colSpan={7}>데이터가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: "auto", background: UI.panel, border: `1px solid ${UI.line}`, borderRadius: 14 }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr>{cols.map((c) => <th key={c} style={th}>{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i}>{cols.map((c) => <td key={c} style={td}>{String(r[c] ?? "")}</td>)}</tr>
              ))}
              {rows.length === 0 && <tr><td style={td} colSpan={cols.length}>데이터가 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
