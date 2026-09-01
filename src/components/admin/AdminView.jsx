import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// 관리자 대시보드 — 회원/결제 데이터 조회. role='admin' 계정만 접근.
export default function AdminView({ onBack }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("members");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !isAdmin) { setLoading(false); return; }
    setLoading(true);
    const q = tab === "members"
      ? supabase.from("profiles").select("*").order("created_at", { ascending: false })
      : supabase.from("payments").select("*").order("created_at", { ascending: false });
    q.then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, [tab, isAdmin]);

  if (!isAdmin) return (
    <div style={{ padding: 40, color: "#fca5a5" }}>관리자만 접근할 수 있습니다.</div>
  );

  const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#94a3b8", borderBottom: "1px solid #334155", whiteSpace: "nowrap" };
  const td = { padding: "10px 12px", fontSize: 13, borderBottom: "1px solid #1e293b", whiteSpace: "nowrap" };
  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ background: tab === t ? "#1e3a8a" : "transparent", border: `1px solid ${tab === t ? "#3b82f6" : "#334155"}`, color: "#f1f5f9", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>{label}</button>
  );

  const cols = tab === "members"
    ? ["email", "name", "phone", "target_grade", "exam_date", "role", "created_at"]
    : ["created_at", "user_id", "grade", "amount", "status", "payment_id", "paid_at"];

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", padding: 32, fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {onBack && <button style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }} onClick={onBack}>← 홈</button>}
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>관리자 대시보드</h1>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {tabBtn("members", "회원")}
        {tabBtn("payments", "결제")}
      </div>

      {loading ? <div style={{ color: "#94a3b8" }}>불러오는 중…</div> : (
        <div style={{ overflowX: "auto", border: "1px solid #1e293b", borderRadius: 12 }}>
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
