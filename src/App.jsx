import { useState } from "react";
import { LESSONS } from "./data/lessons";
import Sidebar from "./components/layout/Sidebar";
import LandingPage from "./components/landing/LandingPage";
import Dashboard from "./components/dashboard/Dashboard";
import ConceptView from "./components/lesson/ConceptView";
import PracticeView from "./components/lesson/PracticeView";
import QuizView from "./components/lesson/QuizView";
import WrongNoteView from "./components/wrongnote/WrongNoteView";

export default function App() {
  const isMobile = window.innerWidth < 768;
  const [page, setPage] = useState("landing");
  const [view, setView] = useState("dash");
  const [step, setStep] = useState("concept");
  const [progress, setProgress] = useState({});
  const [quizWrongMap, setQuizWrongMap] = useState({});
  const [practiceWrongMap, setPracticeWrongMap] = useState({});

  function selectLesson(id) { setView(id); setStep("concept"); }
  function saveQuizWrong(lid, ids) { setQuizWrongMap((m) => ({ ...m, [lid]: ids })); }
  function savePracticeWrong(lid, items) { setPracticeWrongMap((m) => ({ ...m, [lid]: items })); }
  function completeLesson(lid, score) { setProgress((p) => ({ ...p, [lid]: { done: true, score } })); setView("dash"); }

  const totalWrong = Object.values(quizWrongMap).flat().length + Object.values(practiceWrongMap).flat().length;
  const currentLesson = typeof view === "number" ? LESSONS.find((l) => l.id === view) : null;

  if (page === "landing") return (
    <div>
      <LandingPage onStart={() => { if (!isMobile) setPage("learn"); }} />
      {!isMobile && (
        <div style={{ position: "fixed", bottom: 24, right: 24 }}>
          <button
            onClick={() => setPage("learn")}
            style={{ background: "#f59e0b", color: "#000", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px #f59e0b66" }}
          >
            학습 시작 →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", background: "#0f172a", color: "#f1f5f9", minHeight: "100vh", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Sidebar
        lessons={LESSONS}
        current={view}
        onSelect={selectLesson}
        progress={progress}
        onDash={() => setView("dash")}
        onWrong={() => setView("wrong")}
        wrongCount={totalWrong}
      />
      <div style={{ flex: 1, padding: "40px 32px", overflowY: "auto" }}>
        {/* 상단 탭 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setPage("landing")}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            ← 홈
          </button>
          {currentLesson && ["concept", "practice", "quiz"].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              style={{ background: step === s ? "#1e3a8a" : "transparent", border: `1px solid ${step === s ? "#3b82f6" : "#334155"}`, color: step === s ? "#f1f5f9" : "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              {s === "concept" ? "📖 개념" : s === "practice" ? "📂 실습" : "📝 퀴즈"}
            </button>
          ))}
        </div>

        {view === "dash" && <Dashboard lessons={LESSONS} progress={progress} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
        {view === "wrong" && <WrongNoteView lessons={LESSONS} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
        {currentLesson && step === "concept" && <ConceptView lesson={currentLesson} onNext={() => setStep("practice")} />}
        {currentLesson && step === "practice" && <PracticeView lesson={currentLesson} onNext={() => setStep("quiz")} onWrong={savePracticeWrong} />}
        {currentLesson && step === "quiz" && <QuizView lesson={currentLesson} onSaveWrong={saveQuizWrong} onDone={(score) => completeLesson(currentLesson.id, score)} />}
      </div>
    </div>
  );
}
