import { useState, useEffect } from "react";
import MiniExcel from "./MiniExcel";
import LessonProgress from "./LessonProgress";
import { DIAGRAM_REGISTRY } from "../diagrams/registry.js";
import { generateExcel } from "../../utils/excelGenerator";
import { FUNCTION_SYNTAX } from "../../data/functionSyntax.js";
import { UI } from "../../theme";

// {{syntax:NAME}} 토큰을 functionSyntax.js 의 표시용 구문으로 치환한다.
// (미등록 함수면 토큰을 그대로 두어 눈에 띄게 한다.)
function syntaxTokens(str) {
  return str.replace(/\{\{\s*syntax:\s*([A-Za-z0-9._]+)\s*\}\}/g, (m, name) => {
    const s = FUNCTION_SYNTAX[name.toUpperCase()];
    return s ?? m;
  });
}

function bold(str) {
  // 굵게(**...**) 파싱을 먼저 끝낸 뒤, 남은 개행을 <br />로 바꾼다.
  // (** 정규식은 개행을 넘지 않으므로 순서가 뒤바뀌어도 태그가 깨지지 않지만,
  //  요구된 "굵게 후 개행 분리" 순서를 명시적으로 지킨다.)
  return syntaxTokens(str)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
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
      <p key={i} style={{ color: UI.ink, lineHeight: 1.8, margin: "0 0 12px" }}
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
  if (block.type === "sectionTitle") {
    // 카드 대제목(c.heading)과 같은 크기 — 상단 구분선으로 새 상위 섹션임을 표시
    return (
      <h3 key={i} style={{ fontSize: 20, fontWeight: 800, color: UI.ink, margin: "34px 0 14px", paddingTop: 22, borderTop: `1px solid ${UI.line}` }}>
        {block.text}
      </h3>
    );
  }
  if (block.type === "heading") {
    return (
      <div key={i} style={{ margin: "26px 0 12px", borderLeft: `3px solid ${UI.teal}`, paddingLeft: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: UI.ink }}>
          {syntaxTokens(block.text)}
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

export default function ConceptView({ lesson, idx: idxProp, setIdx: setIdxProp, onGoStep, onNext, addPracticeWrong, resolvePracticeWrong, flow, setConceptPassed, unlockAll = false, showAdminBadge = false, finalLabel }) {
  // flow 가 없으면(무료 체험 등) 게이팅·진행 표시줄 없이 자유 이동 — 기존 동작 유지.
  const gated = !!flow;
  const flowSafe = flow || { concepts: {}, practiceDone: false };
  const passConcept = setConceptPassed || (() => {});
  const [localIdx, setLocalIdx] = useState(0);
  const idx = idxProp ?? localIdx;
  const setIdx = setIdxProp ?? setLocalIdx;

  const c = lesson.concepts[idx];
  const practiceCount = c.practices ? c.practices.length : (c.practice ? 1 : 0);
  // 이번 세션의 문제 통과 신호. 게이팅은 저장된 flow.concepts[idx].passed 로 판단하므로,
  // 새로고침 후에도 통과 상태는 유지된다(이 맵은 통과를 flow 에 '올리는' 용도).
  const [passMap, setPassMap] = useState({}); // { "idx-pi": 'graded' | 'revealed' }
  const [tutorialActive, setTutorialActive] = useState(false); // 따라 하기 진행 중이면 잠금 안내 대신 말풍선만
  // 따라 하기: 1차시 개념1(전체) · 개념3 첫 문제(F4 한 단계)에서만
  const tutorialFor = (pi) => {
    if (lesson.id !== 1 || pi !== 0) return undefined;
    if (idx === 0) return { kind: "full" };
    if (idx === 2) return { kind: "f4" };
    return undefined;
  };

  useEffect(() => {
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [idx]);

  // 미니 엑셀 문제가 없는 개념은 읽기만으로 통과
  useEffect(() => {
    if (gated && practiceCount === 0 && !flowSafe.concepts?.[idx]?.passed) passConcept(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, practiceCount, gated]);

  const conceptPassed = !gated || unlockAll || !!flowSafe.concepts?.[idx]?.passed || practiceCount === 0;
  const canGo = (i) => !gated || unlockAll || i === idx || !!flowSafe.concepts?.[i]?.passed;
  const isLast = idx >= lesson.concepts.length - 1;
  const lastLabel = finalLabel ?? (onGoStep ? "개념 완료 → 실습" : "개념 완료 → 퀴즈 풀기");
  const goFinal = () => { if (onGoStep) onGoStep("practice"); else onNext?.(); };

  // 현재 개념의 모든 문제가 통과되면 개념 통과로 기록. graded 는 revealed 로 덮지 않는다.
  function markPractice(pi, via) {
    setPassMap((m) => {
      if (m[`${idx}-${pi}`] === "graded") return m;
      const nm = { ...m, [`${idx}-${pi}`]: via };
      const keys = Array.from({ length: practiceCount }, (_, k) => `${idx}-${k}`);
      if (keys.every((k) => nm[k])) passConcept(idx, { revealed: keys.some((k) => nm[k] === "revealed") });
      return nm;
    });
  }

  const navBtn = (enabled, primary) => ({
    flex: primary ? 2 : 1, padding: 13, borderRadius: UI.rMd,
    border: primary ? "none" : `1px solid ${UI.line}`,
    background: primary ? (enabled ? UI.teal : "#cfd6d2") : UI.surface,
    color: primary ? "#fff" : (enabled ? UI.mut : "#c2cac6"),
    cursor: enabled ? "pointer" : "not-allowed", fontWeight: primary ? 700 : 600,
  });

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      {gated && (
        <LessonProgress
          lesson={lesson} flow={flow} step="concept" conceptIdx={idx}
          unlockAll={unlockAll} showAdminBadge={showAdminBadge}
          onJump={(t) => { if (t.step === "concept") { if (canGo(t.idx)) setIdx(t.idx); } else onGoStep?.(t.step); }}
        />
      )}

      <div key={idx} className="cl-fade-up" style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 28, marginBottom: 16 }}>
        <h3 style={{ color: UI.ink, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{c.heading}</h3>
        {c.contentBlocks
          ? c.contentBlocks.map((b, i) => renderBlock(b, i, lesson))
          : <p style={{ color: UI.ink, lineHeight: 1.8, whiteSpace: "pre-line", margin: 0 }}>{c.content}</p>
        }
        {(() => {
          const sheetLabel = `${lesson.id}차시 개념${idx + 1} 실습`;
          const wrongCb = (pi) => (w) => addPracticeWrong?.(lesson.id, { source: "mini", conceptIdx: idx, practiceIdx: pi, cell: w.cell, sheet: sheetLabel, studentFormula: w.studentInput, formula: w.answer, reason: w.reason });
          const resolveCb = (pi) => (w) => resolvePracticeWrong?.(lesson.id, { source: "mini", conceptIdx: idx, practiceIdx: pi, cell: w.cell, sheet: sheetLabel });
          const gradedCb = (pi) => (passed) => { if (passed) markPractice(pi, "graded"); };
          const revealCb = (pi) => () => markPractice(pi, "revealed");
          return c.practices
            ? c.practices.map((p, pi) => <MiniExcel key={`${idx}-p${pi}`} practice={p} onPracticeWrong={wrongCb(pi)} onPracticeResolve={resolveCb(pi)} onGraded={gradedCb(pi)} onRevealConfirm={revealCb(pi)} tutorial={tutorialFor(pi)} onTutorialActive={setTutorialActive} />)
            : c.practice && <MiniExcel key={idx} practice={c.practice} onPracticeWrong={wrongCb(0)} onPracticeResolve={resolveCb(0)} onGraded={gradedCb(0)} onRevealConfirm={revealCb(0)} tutorial={tutorialFor(0)} onTutorialActive={setTutorialActive} />;
        })()}
      </div>

      {/* 진행 점 (통과·현재 개념만 이동) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "center" }}>
        {lesson.concepts.map((_, i) => (
          <div
            key={i}
            onClick={() => { if (canGo(i)) setIdx(i); }}
            style={{ width: 10, height: 10, borderRadius: "50%", background: i === idx ? UI.teal : flowSafe.concepts?.[i]?.passed ? UI.green : "#d3dad6", cursor: canGo(i) ? "pointer" : "default", opacity: canGo(i) ? 1 : 0.4 }}
          />
        ))}
      </div>

      {/* 잠금 안내 (따라 하기 중에는 말풍선만 보이게 숨김) */}
      {!conceptPassed && !tutorialActive && (
        <div style={{ textAlign: "center", color: UI.mut, fontSize: 13, marginBottom: 12 }}>
          아래 문제를 풀고 채점을 통과하면 다음 개념이 열립니다.
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          disabled={idx === 0}
          onClick={() => setIdx(idx - 1)}
          style={navBtn(idx !== 0, false)}
        >
          ← 이전
        </button>
        {!isLast ? (
          <button disabled={!conceptPassed} onClick={() => { if (conceptPassed) setIdx(idx + 1); }} style={navBtn(conceptPassed, true)}>
            다음 개념 →
          </button>
        ) : (
          <button disabled={!conceptPassed} onClick={() => { if (conceptPassed) goFinal(); }} style={navBtn(conceptPassed, true)}>
            {lastLabel}
          </button>
        )}
      </div>
    </div>
  );
}
