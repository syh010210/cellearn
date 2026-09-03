import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { UI } from "../../theme";

// 문의 수신 주소 — 여기로 모든 문의가 메일로 전달됩니다.
const SUPPORT_EMAIL = "support@cellearn.kr";

// 빠른 문의 주제 (누르면 메시지에 프리필)
const QUICK = ["수강·결제 문의", "환불 문의", "학습/채점 오류", "기타 문의"];

// 올해 말(프로모션 마감, 12/31)까지 남은 일수 — 매 분 갱신. 지난 경우 null.
function useDday() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  const ms = end - now;
  if (ms <= 0) return null;
  return Math.floor(ms / 86400000);
}

// 떠 있는 원형 고객센터 위젯 — 백엔드 없이 메일로 문의를 전달한다.
export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const dday = useDday();

  function send() {
    const subject = `[CellLearn 문의]${topic ? " " + topic : ""}`;
    const body =
      `${msg}\n\n` +
      `-----------------------------\n` +
      `주제: ${topic || "(미선택)"}\n` +
      `회신받을 이메일: ${replyTo || "(미입력)"}\n`;
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <>
      {/* 패널 */}
      {open && (
        <div
          className="cl-fade-up"
          style={{
            position: "fixed", right: 24, bottom: 92, zIndex: 1000, width: 340, maxWidth: "calc(100vw - 48px)",
            background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg,
            boxShadow: UI.shadow, overflow: "hidden", fontFamily: UI.font,
          }}
        >
          {/* 헤더 */}
          <div style={{ background: UI.teal, color: "#fff", padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>CellLearn 고객센터</div>
            <div style={{ fontSize: 12.5, color: UI.invMut, marginTop: 3 }}>보통 하루 이내에 답변드려요</div>
          </div>

          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* 봇 인사 */}
            <div style={{ background: UI.panelAlt, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13.5, color: UI.inkSoft, lineHeight: 1.6 }}>
              안녕하세요! 무엇을 도와드릴까요? 아래에서 주제를 고르고 내용을 남겨주시면 메일로 접수돼요.
            </div>

            {/* 빠른 주제 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK.map((q) => {
                const active = topic === q;
                return (
                  <button
                    key={q}
                    onClick={() => setTopic(active ? "" : q)}
                    style={{
                      fontSize: 12.5, padding: "6px 11px", borderRadius: UI.rPill, cursor: "pointer", fontFamily: UI.font,
                      border: `1px solid ${active ? UI.teal : UI.line}`,
                      background: active ? UI.teal : UI.surface, color: active ? "#fff" : UI.mut,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {q}
                  </button>
                );
              })}
            </div>

            {/* 메시지 */}
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="문의 내용을 입력해 주세요."
              rows={4}
              style={{ width: "100%", resize: "vertical", border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13.5, fontFamily: UI.font, color: UI.ink, boxSizing: "border-box", outline: "none", lineHeight: 1.6 }}
            />

            {/* 회신 이메일 */}
            <input
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="회신받을 이메일 (선택)"
              type="email"
              style={{ width: "100%", border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "10px 12px", fontSize: 13.5, fontFamily: UI.font, color: UI.ink, boxSizing: "border-box", outline: "none" }}
            />

            <button
              onClick={send}
              disabled={!msg.trim()}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: msg.trim() ? UI.teal : UI.panelAlt, color: msg.trim() ? "#fff" : UI.faint,
                border: "none", borderRadius: UI.rMd, padding: "11px 14px", fontSize: 14, fontWeight: 700,
                cursor: msg.trim() ? "pointer" : "not-allowed", fontFamily: UI.font,
              }}
            >
              <Send size={15} strokeWidth={2} /> 메일로 문의 보내기
            </button>

            <div style={{ fontSize: 11.5, color: UI.faint, textAlign: "center", lineHeight: 1.6 }}>
              메일 앱이 열리지 않으면 <span style={{ fontFamily: UI.mono }}>{SUPPORT_EMAIL}</span> 로 보내주세요.
            </div>
          </div>
        </div>
      )}

      {/* 원형 버튼 위: 프로모션 D-day 강조 배지 (세로 카드형, 위젯이 닫혀 있을 때만) */}
      {!open && dday != null && (
        <div
          onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
          role="button"
          aria-label={`오픈 프로모션 마감까지 D-${dday}, 수강료 보기`}
          style={{
            position: "fixed", right: 24, bottom: 92, zIndex: 1000, width: 130,
            background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg,
            boxShadow: "0 10px 26px rgba(0, 0, 0, 0.16)", overflow: "hidden",
            fontFamily: UI.font, cursor: "pointer", textAlign: "center",
          }}
        >
          <div style={{ background: UI.teal, color: "#fff", fontSize: 11.5, fontWeight: 800, padding: "6px 0", letterSpacing: "-0.01em" }}>오픈 프로모션</div>
          <div style={{ padding: "10px 10px 12px" }}>
            <div style={{ fontSize: 11, color: UI.mut, fontWeight: 700, marginBottom: 4 }}>올해 끝까지 마감</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: UI.teal, lineHeight: 1, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>D-{dday}</div>
            <div style={{ marginTop: 9, background: UI.lime, color: UI.teal, fontSize: 11.5, fontWeight: 800, borderRadius: UI.rPill, padding: "5px 0" }}>수강료 보기 →</div>
          </div>
        </div>
      )}

      {/* 우하단: 문의 안내 라벨 + 원형 버튼 */}
      <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 1000, display: "flex", alignItems: "center", gap: 10 }}>
        {!open && (
          <span
            onClick={() => setOpen(true)}
            style={{
              background: UI.surface, border: `1px solid ${UI.line}`, boxShadow: UI.shadow,
              color: UI.ink, fontSize: 13, fontWeight: 700, padding: "9px 14px", borderRadius: UI.rPill,
              whiteSpace: "nowrap", fontFamily: UI.font, cursor: "pointer",
            }}
          >
            궁금한 점, 문의하세요
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "고객센터 닫기" : "고객센터 문의 열기"}
          style={{
            width: 56, height: 56, borderRadius: UI.rPill, border: "none", cursor: "pointer",
            background: UI.teal, color: "#fff", boxShadow: UI.shadow, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {open ? <X size={24} strokeWidth={2} /> : <MessageCircle size={24} strokeWidth={2} />}
        </button>
      </div>
    </>
  );
}
