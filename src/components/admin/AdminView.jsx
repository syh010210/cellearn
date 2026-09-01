import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { UI } from "../../theme";

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

  return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.ink, padding: 32, fontFamily: UI.font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {onBack && <button style={{ background: UI.panel, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600 }} onClick={onBack}>← 홈</button>}
        <h1 style={{ fontSize: 23, fontWeight: 800, margin: 0 }}>관리자 대시보드</h1>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {tabBtn("members", "회원")}
        {tabBtn("payments", "결제")}
      </div>

      {loading ? <div style={{ color: UI.mut }}>불러오는 중…</div> : (
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
