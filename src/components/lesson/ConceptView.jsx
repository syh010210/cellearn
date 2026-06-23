import { useState } from "react";
import MiniExcel from "./MiniExcel";

export default function ConceptView({ lesson, onNext }) {
  const [idx, setIdx] = useState(0);
  const c = lesson.concepts[idx];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ color: "#60a5fa", fontSize: 13, marginBottom: 4 }}>
        📖 개념 학습 · {idx + 1}/{lesson.concepts.length}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 20px" }}>{lesson.title}</h2>

      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h3 style={{ color: "#60a5fa", fontSize: 16, marginBottom: 12 }}>{c.heading}</h3>
        <p style={{ color: "#e2e8f0", lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{c.content}</p>
        {c.practice && <MiniExcel key={idx} practice={c.practice} />}
      </div>

      {/* 진행 점 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
        {lesson.concepts.map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{ width: 10, height: 10, borderRadius: "50%", background: i === idx ? "#3b82f6" : i < idx ? "#22c55e" : "#334155", cursor: "pointer" }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          disabled={idx === 0}
          onClick={() => setIdx((i) => i - 1)}
          style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: idx === 0 ? "not-allowed" : "pointer" }}
        >
          ← 이전
        </button>
        {idx < lesson.concepts.length - 1 ? (
          <button
            onClick={() => setIdx((i) => i + 1)}
            style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}
          >
            다음 개념 →
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", cursor: "pointer", fontWeight: 700 }}
          >
            ✅ 개념 완료 → 실습하기
          </button>
        )}
      </div>
    </div>
  );
}
