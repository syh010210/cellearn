import { useState, useEffect } from "react";
import MiniExcel from "./MiniExcel";
import { DIAGRAM_REGISTRY } from "../diagrams/registry.js";
import { generateExcel } from "../../utils/excelGenerator";
import { UI } from "../../theme";

function bold(str) {
  return str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function ListItem({ item }) {
  const text = typeof item === "string" ? item : item.text;
  return (
    <li style={{ marginBottom: 6 }}>
      <span dangerouslySetInnerHTML={{ __html: bold(text) }} />
      {item.subItems && (
        <ul style={{ marginTop: 4, paddingLeft: 18, listStyle: "disc" }}>
          {item.subItems.map((sub, k) => (
            <li key={k} style={{ color: UI.mut, marginBottom: 2 }}
                dangerouslySetInnerHTML={{ __html: bold(sub) }} />
          ))}
        </ul>
      )}
    </li>
  );
}

function renderBlock(block, i, lesson) {
  if (block.type === "download") {
    return (
      <button
        key={i}
        onClick={() => generateExcel(lesson)}
        style={{ display: "block", width: "100%", padding: 14, borderRadius: UI.rMd, border: "none", background: UI.teal, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", margin: "6px 0 16px" }}
      >
        {block.label || "실습 파일 내려받기"}
      </button>
    );
  }
  if (block.type === "text") {
    return (
      <p key={i} style={{ color: UI.ink, lineHeight: 1.8, margin: "0 0 12px", whiteSpace: "pre-line" }}
         dangerouslySetInnerHTML={{ __html: bold(block.text) }} />
    );
  }
  if (block.type === "image") {
    const DiagramComponent = DIAGRAM_REGISTRY[block.url];
    if (DiagramComponent) return <DiagramComponent key={i} />;
    return (
      <img key={i} src={block.url} alt={block.alt || ""}
           style={{ maxWidth: "100%", borderRadius: 12, margin: "10px 0 14px", display: "block" }} />
    );
  }
  if (block.type === "heading") {
    return (
      <div key={i} style={{ margin: "26px 0 12px", borderLeft: `3px solid ${UI.teal}`, paddingLeft: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: UI.ink }}>
          {block.text}
        </span>
      </div>
    );
  }
  if (block.type === "bullets") {
    return (
      <ul key={i} style={{ color: UI.ink, lineHeight: 1.7, margin: "4px 0 12px", paddingLeft: 20, listStyle: "disc" }}>
        {block.items.map((item, j) => <ListItem key={j} item={item} />)}
      </ul>
    );
  }
  if (block.type === "numbered") {
    return (
      <ol key={i} style={{ color: UI.ink, lineHeight: 1.7, margin: "4px 0 12px", paddingLeft: 20 }}>
        {block.items.map((item, j) => <ListItem key={j} item={item} />)}
      </ol>
    );
  }
  return null;
}

export default function ConceptView({ lesson, onNext }) {
  const [idx, setIdx] = useState(0);
  const c = lesson.concepts[idx];

  useEffect(() => {
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [idx]);

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
        📖 개념 학습 · {idx + 1}/{lesson.concepts.length}
      </div>

      <div key={idx} className="cl-fade-up" style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 28, marginBottom: 16 }}>
        <h3 style={{ color: UI.ink, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{c.heading}</h3>
        {c.contentBlocks
          ? c.contentBlocks.map((b, i) => renderBlock(b, i, lesson))
          : <p style={{ color: UI.ink, lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{c.content}</p>
        }
        {c.practices
          ? c.practices.map((p, pi) => <MiniExcel key={`${idx}-p${pi}`} practice={p} />)
          : c.practice && <MiniExcel key={idx} practice={c.practice} />}
      </div>

      {/* 진행 점 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
        {lesson.concepts.map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{ width: 10, height: 10, borderRadius: "50%", background: i === idx ? UI.teal : i < idx ? UI.green : "#d3dad6", cursor: "pointer" }}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          disabled={idx === 0}
          onClick={() => setIdx((i) => i - 1)}
          style={{ flex: 1, padding: 13, borderRadius: UI.rMd, border: `1px solid ${UI.line}`, background: UI.surface, color: idx === 0 ? "#c2cac6" : UI.mut, cursor: idx === 0 ? "not-allowed" : "pointer", fontWeight: 600 }}
        >
          ← 이전
        </button>
        {idx < lesson.concepts.length - 1 ? (
          <button
            onClick={() => setIdx((i) => i + 1)}
            style={{ flex: 2, padding: 13, borderRadius: UI.rMd, border: "none", background: UI.teal, color: "#fff", cursor: "pointer", fontWeight: 700 }}
          >
            다음 개념 →
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{ flex: 2, padding: 13, borderRadius: UI.rMd, border: "none", background: UI.teal, color: "#fff", cursor: "pointer", fontWeight: 700 }}
          >
            개념 완료 → 퀴즈 풀기
          </button>
        )}
      </div>
    </div>
  );
}
