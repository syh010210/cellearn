import { LESSONS } from "../../data/lessons";

export default function LandingPage({ onStart }) {
  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ fontFamily: "'Noto Sans KR', sans-serif", background: "#0f172a", color: "#f1f5f9", minHeight: "100vh" }}>
      {/* 히어로 */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 13, background: "#3b82f6", display: "inline-block", padding: "4px 14px", borderRadius: 20, marginBottom: 16 }}>
          컴퓨터활용능력 실기 전문
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
          컴활 실기,<br />이제 제대로 배우자
        </h1>
        <p style={{ color: "#bfdbfe", fontSize: 16, marginBottom: 32 }}>
          1급·2급 실기 시험을 위한 체계적인 차시별 학습 플랫폼
        </p>
        {isMobile ? (
          <div style={{ background: "#1e3a8a", border: "1px solid #3b82f6", borderRadius: 12, padding: "16px 20px", display: "inline-block", fontSize: 14, color: "#93c5fd" }}>
            💻 PC에서 학습 기능을 이용할 수 있어요
          </div>
        ) : (
          <button
            onClick={onStart}
            style={{ background: "#f59e0b", color: "#000", border: "none", padding: "14px 36px", borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: "pointer" }}
          >
            학습 시작하기 →
          </button>
        )}
      </div>

      {/* 커리큘럼 */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>📚 2급 커리큘럼</h2>
        {LESSONS.map((l) => (
          <div key={l.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{ background: "#2563eb", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
              {l.id}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{l.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{l.concepts.length}개 개념 · {l.quiz.length}문제</div>
            </div>
          </div>
        ))}
        {[2, 3, 4, 5].map((n) => (
          <div key={n} style={{ background: "#1e293b", border: "1px dashed #334155", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 12, opacity: 0.4 }}>
            <div style={{ background: "#334155", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
              {n}
            </div>
            <div style={{ color: "#64748b", fontWeight: 600 }}>준비 중...</div>
          </div>
        ))}
      </div>

      {/* 가격 */}
      <div style={{ background: "#1e293b", padding: "48px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 32 }}>💳 수강료 안내</h2>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {[{ grade: "2급", price: "89,000", color: "#3b82f6" }, { grade: "1급", price: "129,000", color: "#8b5cf6" }].map((p) => (
            <div key={p.grade} style={{ background: "#0f172a", border: `2px solid ${p.color}`, borderRadius: 16, padding: "28px 36px", textAlign: "center", minWidth: 200 }}>
              <div style={{ color: p.color, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>컴활 실기 {p.grade}</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>₩{p.price}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>전 차시 무제한</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
