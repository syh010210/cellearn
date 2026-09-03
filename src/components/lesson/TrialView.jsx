import { useState } from "react";
import { BookOpen, PenLine, X, ArrowRight } from "lucide-react";
import ConceptView from "./ConceptView";
import QuizView from "./QuizView";
import Logo from "../brand/Logo";
import { UI } from "../../theme";

const noop = () => {};

// 랜딩에서 로그인·결제 없이 실제 수업(개념 → 퀴즈)을 체험하는 화면.
// 실제 학습 화면과 동일한 ConceptView / QuizView 를 그대로 재사용한다.
export default function TrialView({ lesson, onExit, onSignup }) {
  const [step, setStep] = useState("concept"); // concept | quiz
  const [finished, setFinished] = useState(false);

  const tabs = [
    { key: "concept", label: "개념", Icon: BookOpen },
    { key: "quiz", label: "퀴즈", Icon: PenLine },
  ];

  const goStep = (key) => { setStep(key); document.getElementById("main-content")?.scrollTo({ top: 0 }); };

  return (
    <div style={{ height: "100vh", background: UI.bg, display: "flex", flexDirection: "column", fontFamily: UI.font, color: UI.ink }}>
      {/* 상단 바 */}
      <div style={{ background: UI.surface, borderBottom: `1px solid ${UI.line}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={20} />
          <span style={{ fontSize: 12, fontWeight: 700, color: UI.teal, background: UI.limeSoft, padding: "3px 10px", borderRadius: UI.rPill }}>무료 체험</span>
        </div>
        <div style={{ fontSize: 13.5, color: UI.mut, fontWeight: 600 }}>
          계산 작업 - <b style={{ color: UI.ink }}>{lesson.shortTitle || lesson.title}</b>
        </div>
        <button onClick={onExit} style={{ marginLeft: "auto", background: "transparent", border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 12px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI.font }}>
          <X size={15} strokeWidth={2} /> 체험 종료
        </button>
      </div>

      {/* 개념 / 퀴즈 탭 */}
      <div style={{ background: UI.bg, borderBottom: `1px solid ${UI.line}`, padding: "10px 20px 0", display: "flex", gap: 8 }}>
        {tabs.map(({ key, label, Icon }) => {
          const active = step === key;
          return (
            <button
              key={key}
              onClick={() => goStep(key)}
              style={{ background: active ? UI.surface : "transparent", border: `1px solid ${active ? UI.line : "transparent"}`, borderBottom: `1px solid ${active ? UI.surface : "transparent"}`, color: active ? UI.ink : UI.mut, padding: "9px 18px", borderRadius: "10px 10px 0 0", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 700 : 500, marginBottom: -1, display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI.font }}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} color={active ? UI.teal : UI.mut} /> {label}
            </button>
          );
        })}
      </div>

      {/* 본문 (스크롤) */}
      <div id="main-content" style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "28px 20px 48px" }}>
          {step === "concept" && <ConceptView key="concept" lesson={lesson} onNext={() => goStep("quiz")} />}
          {step === "quiz" && <QuizView key="quiz" lesson={lesson} onSaveWrong={noop} onDone={() => setFinished(true)} />}
        </div>
      </div>

      {/* 체험 완료 → 수강 유도 */}
      {finished && (
        <div onClick={() => setFinished(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,20,18,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="cl-fade-up" style={{ maxWidth: 440, width: "100%", background: UI.surface, borderRadius: UI.rLg, padding: 32, textAlign: "center", border: `1px solid ${UI.line}` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px", color: UI.ink }}>체험 학습을 완료했어요!</h2>
            <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 22px" }}>
              방금 해본 <b style={{ color: UI.ink }}>개념 학습 → 퀴즈</b> 흐름으로 <b style={{ color: UI.ink }}>20차시 전체</b>를 배웁니다.
              여기에 <b style={{ color: UI.ink }}>엑셀 파일 실습·채점</b>까지 더해 실기를 확실히 준비하세요.
            </p>
            <button onClick={onSignup} style={{ width: "100%", padding: 14, borderRadius: UI.rMd, border: "none", background: UI.teal, color: "#fff", fontSize: 15.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              수강 신청하고 계속 배우기 <ArrowRight size={18} strokeWidth={2} />
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setFinished(false); goStep("concept"); }} style={{ flex: 1, padding: 11, borderRadius: UI.rMd, border: `1px solid ${UI.line}`, background: UI.surface, color: UI.mut, cursor: "pointer", fontWeight: 600, fontFamily: UI.font }}>다시 체험</button>
              <button onClick={onExit} style={{ flex: 1, padding: 11, borderRadius: UI.rMd, border: `1px solid ${UI.line}`, background: UI.surface, color: UI.mut, cursor: "pointer", fontWeight: 600, fontFamily: UI.font }}>홈으로</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
