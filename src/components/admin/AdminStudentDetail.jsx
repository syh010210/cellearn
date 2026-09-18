import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { LESSONS } from "../../data/lessons";
import { DAYS } from "../../data/days";
import { UI } from "../../theme";

// 관리자 진도 상세 — 한 회원의 학습 기록을 그 회원 것만(eq user_id) 조회해 보여준다.
// RLS: progress/day_clears/wrong_notes/exam_attempts 는 is_admin() select 정책이 있어 관리자가 직접 읽는다.
export default function AdminStudentDetail({ uid, profile, payment, enrollment, totalLessons, onBack }) {
  const [d, setD] = useState(null); // { progress, clears, wrongs, exams }
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supabase || !uid) { setD({ progress: [], clears: [], wrongs: [], exams: [] }); return; }
      const [p, c, w, e] = await Promise.all([
        supabase.from("progress").select("lesson_id, done, score, updated_at, concepts, practice_done").eq("user_id", uid),
        supabase.from("day_clears").select("day, cleared_at").eq("user_id", uid),
        supabase.from("wrong_notes").select("lesson_id, kind, payload").eq("user_id", uid),
        supabase.from("exam_attempts").select("created_at, correct, total, elapsed_ms").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      if (!alive) return;
      const firstErr = p.error || c.error || w.error || e.error;
      if (firstErr) { setErr(firstErr.message); return; }
      setD({ progress: p.data ?? [], clears: c.data ?? [], wrongs: w.data ?? [], exams: e.data ?? [], nowMs: Date.now() });
    })();
    return () => { alive = false; };
  }, [uid]);

  // ── 포맷터 ──
  const kstDateTime = (v) => v ? new Date(v).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }) : "없음";
  const kstDate = (v) => v ? new Date(v).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) : "없음";
  const mmss = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  const quizLen = (lid) => LESSONS.find((l) => l.id === lid)?.quiz?.length ?? 0;

  const progById = useMemo(() => { const m = new Map(); (d?.progress ?? []).forEach((r) => m.set(r.lesson_id, r)); return m; }, [d]);
  const clearByDay = useMemo(() => { const m = new Map(); (d?.clears ?? []).forEach((r) => m.set(r.day, r.cleared_at)); return m; }, [d]);
  const doneCount = useMemo(() => (d?.progress ?? []).filter((r) => r.done).length, [d]);
  const lastLearn = useMemo(() => (d?.progress ?? []).reduce((mx, r) => (r.updated_at > (mx || "") ? r.updated_at : mx), null), [d]);

  // 날짜별 학습량(최근 30일): 완료(done) 차시를 완료시각 KST 날짜로 묶는다.
  const byDate = useMemo(() => {
    const cutoff = (d?.nowMs ?? 0) - 30 * 86400000;
    const m = new Map();
    (d?.progress ?? []).filter((r) => r.done && r.updated_at && new Date(r.updated_at).getTime() >= cutoff)
      .forEach((r) => { const k = kstDate(r.updated_at); if (!m.has(k)) m.set(k, []); m.get(k).push(r.lesson_id); });
    return [...m.entries()].map(([date, ids]) => ({ date, ids: ids.sort((a, b) => a - b) })).sort((a, b) => b.date.localeCompare(a.date));
  }, [d]);

  // 오답: 차시별 (quiz 오답 수 + practice 오답 수)
  const wrongByLesson = useMemo(() => {
    const m = new Map();
    (d?.wrongs ?? []).forEach((r) => {
      const n = Array.isArray(r.payload) ? r.payload.length : 0;
      const cur = m.get(r.lesson_id) || { quiz: 0, practice: 0 };
      if (r.kind === "quiz") cur.quiz += n; else if (r.kind === "practice") cur.practice += n;
      m.set(r.lesson_id, cur);
    });
    return [...m.entries()].map(([lid, v]) => ({ lid, ...v, total: v.quiz + v.practice })).filter((x) => x.total > 0).sort((a, b) => a.lid - b.lid);
  }, [d]);

  const pct = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;
  const active = !!(enrollment && d && new Date(enrollment.valid_to).getTime() > (d.nowMs ?? 0));

  const card = { background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 18, marginBottom: 16 };
  const h = { fontSize: 14, fontWeight: 700, color: UI.ink, marginBottom: 10 };
  const th = { textAlign: "left", padding: "8px 10px", fontSize: 12, color: UI.mut, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", fontWeight: 700 };
  const td = { padding: "8px 10px", fontSize: 12.5, borderBottom: `1px solid ${UI.line}`, whiteSpace: "nowrap", color: UI.ink };
  const tdNum = { ...td, fontFamily: UI.mono };
  const none = <span style={{ color: UI.faint }}>없음</span>;

  return (
    <div>
      <button onClick={onBack} style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font, marginBottom: 14 }}>← 목록으로</button>

      {err && <div style={{ ...card, color: UI.red }}>조회 오류: {err}</div>}
      {!d && !err && <div style={{ ...card, color: UI.mut }}>불러오는 중…</div>}

      {d && !err && (<>
        {/* 요약 */}
        <div style={card}>
          <div style={h}>요약</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, fontSize: 13 }}>
            <div><span style={{ color: UI.mut }}>이름 </span>{profile?.name || none}</div>
            <div><span style={{ color: UI.mut }}>이메일 </span><span style={{ fontFamily: UI.mono }}>{profile?.email || uid}</span></div>
            <div><span style={{ color: UI.mut }}>학습 과정 </span>{profile?.target_grade || none}</div>
            <div><span style={{ color: UI.mut }}>완료 차시 </span><span style={{ fontFamily: UI.mono }}>{doneCount} / {totalLessons} ({pct}%)</span></div>
            <div><span style={{ color: UI.mut }}>결제일 </span><span style={{ fontFamily: UI.mono }}>{payment ? kstDate(payment.paid_at) : "없음"}</span></div>
            <div><span style={{ color: UI.mut }}>수강권 만료 </span><span style={{ fontFamily: UI.mono }}>{enrollment ? kstDate(enrollment.valid_to) : "없음"}</span>{enrollment && (enrollment.revoked_at ? <span style={{ color: UI.warn, fontWeight: 700 }}> · 회수됨</span> : active ? <span style={{ color: UI.green, fontWeight: 700 }}> · 활성</span> : <span style={{ color: UI.faint }}> · 만료</span>)}</div>
            <div><span style={{ color: UI.mut }}>최근 학습 </span><span style={{ fontFamily: UI.mono }}>{lastLearn ? kstDate(lastLearn) : "없음"}</span></div>
          </div>
        </div>

        {/* 일차별 */}
        <div style={card}>
          <div style={h}>일차별 클리어</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr><th style={th}>일차</th><th style={th}>차시</th><th style={th}>클리어 시각</th></tr></thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day.day}>
                  <td style={td}>{day.day}일차</td>
                  <td style={tdNum}>{day.lessons[0]}~{day.lessons[day.lessons.length - 1]}</td>
                  <td style={tdNum}>{clearByDay.has(day.day) ? kstDateTime(clearByDay.get(day.day)) : <span style={{ color: UI.faint, fontFamily: UI.font }}>미클리어</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 차시별 */}
        <div style={card}>
          <div style={h}>차시별 진행</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead><tr><th style={th}>차시</th><th style={th}>제목</th><th style={th}>상태</th><th style={th}>완료 시각</th><th style={th}>퀴즈 점수</th></tr></thead>
            <tbody>
              {LESSONS.map((l) => {
                const r = progById.get(l.id);
                const ql = quizLen(l.id);
                const nConcept = l.concepts?.length ?? 0;
                const passed = Object.values(r?.concepts || {}).filter((c) => c?.passed).length;
                const started = passed > 0 || !!r?.practice_done;
                let status;
                if (r?.done) status = <span style={{ color: UI.green, fontWeight: 700 }}>완료</span>;
                else if (started) status = <span style={{ color: UI.warn, fontWeight: 700 }}>진행 중 (개념 {passed}/{nConcept}, 실습 {r?.practice_done ? "채점됨" : "미채점"})</span>;
                else status = <span style={{ color: UI.faint }}>미시작</span>;
                return (
                  <tr key={l.id}>
                    <td style={tdNum}>{l.id}</td>
                    <td style={td}>{l.shortTitle || l.title}</td>
                    <td style={{ ...td, whiteSpace: "normal" }}>{status}</td>
                    <td style={tdNum}>{r?.done && r?.updated_at ? kstDateTime(r.updated_at) : "—"}</td>
                    <td style={tdNum}>{typeof r?.score === "number" ? `${r.score} / ${ql}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 날짜별 학습량 */}
        <div style={card}>
          <div style={h}>날짜별 학습량 (최근 30일)</div>
          {byDate.length === 0 ? none : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr><th style={th}>날짜</th><th style={th}>완료 차시 수</th><th style={th}>차시 번호</th></tr></thead>
              <tbody>
                {byDate.map((row) => (
                  <tr key={row.date}><td style={tdNum}>{row.date}</td><td style={tdNum}>{row.ids.length}</td><td style={tdNum}>{row.ids.join(", ")}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 실전모드 */}
        <div style={card}>
          <div style={h}>실전 모의고사 (응시 {d.exams.length}회)</div>
          {d.exams.length === 0 ? none : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr><th style={th}>회차</th><th style={th}>날짜</th><th style={th}>점수</th><th style={th}>소요 시간</th></tr></thead>
              <tbody>
                {d.exams.map((x, i) => (
                  <tr key={i}><td style={tdNum}>{d.exams.length - i}</td><td style={tdNum}>{kstDateTime(x.created_at)}</td><td style={tdNum}>{x.correct} / {x.total}</td><td style={tdNum}>{mmss(x.elapsed_ms)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 오답 */}
        <div style={card}>
          <div style={h}>차시별 오답</div>
          {wrongByLesson.length === 0 ? none : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead><tr><th style={th}>차시</th><th style={th}>제목</th><th style={th}>퀴즈 오답</th><th style={th}>실습 오답</th><th style={th}>합계</th></tr></thead>
              <tbody>
                {wrongByLesson.map((x) => (
                  <tr key={x.lid}><td style={tdNum}>{x.lid}</td><td style={td}>{LESSONS.find((l) => l.id === x.lid)?.shortTitle || "—"}</td><td style={tdNum}>{x.quiz}</td><td style={tdNum}>{x.practice}</td><td style={tdNum}>{x.total}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>)}
    </div>
  );
}
