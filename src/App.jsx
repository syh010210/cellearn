import { useState, useEffect } from "react";
import { LESSONS } from "./data/lessons";
import { useAuth } from "./context/AuthContext";
import { useLearningData } from "./hooks/useLearningData";
import Sidebar from "./components/layout/Sidebar";
import LandingPage from "./components/landing/LandingPage";
import Dashboard from "./components/dashboard/Dashboard";
import ConceptView from "./components/lesson/ConceptView";
import PracticeView from "./components/lesson/PracticeView";
import QuizView from "./components/lesson/QuizView";
import WrongNoteView from "./components/wrongnote/WrongNoteView";
import AuthView from "./components/auth/AuthView";
import CheckoutView from "./components/checkout/CheckoutView";
import AdminView from "./components/admin/AdminView";

export default function App() {
  const isMobile = window.innerWidth < 768;
  const { loading, isSupabaseConfigured, isAuthed, isAdmin, hasActiveEnrollment, user, signOut } = useAuth();
  const [page, setPage] = useState("landing");
  const [view, setView] = useState("dash");
  const [step, setStep] = useState("concept");
  // 진도/오답은 계정에 저장·복원 (비로그인/미설정 시 메모리 fallback)
  const { progress, quizWrongMap, practiceWrongMap, saveQuizWrong, savePracticeWrong, completeLesson: persistComplete } = useLearningData();

  // Supabase 키가 없으면(개발 중) 게이팅을 우회해 기존처럼 학습 화면 사용 가능
  const gateBypassed = !isSupabaseConfigured;
  const canLearn = gateBypassed || (isAuthed && hasActiveEnrollment);

  // 로그인/결제 상태가 바뀌면 인증·결제 페이지에서 자동으로 다음 단계로 이동
  useEffect(() => {
    if (page === "auth" && isAuthed) setPage(hasActiveEnrollment ? "learn" : "checkout");
    if (page === "checkout" && hasActiveEnrollment) setPage("learn");
  }, [page, isAuthed, hasActiveEnrollment]);

  function startLearning() {
    if (isMobile) return;
    if (gateBypassed) return setPage("learn");
    if (!isAuthed) return setPage("auth");
    if (!hasActiveEnrollment) return setPage("checkout");
    setPage("learn");
  }

  function selectLesson(id) {
    setView(id);
    setStep("concept");
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }
  function completeLesson(lid, score) { persistComplete(lid, score); setView("dash"); }

  const totalWrong = Object.values(quizWrongMap).flat().length + Object.values(practiceWrongMap).flat().length;
  const currentLesson = typeof view === "number" ? LESSONS.find((l) => l.id === view) : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>불러오는 중…</div>
  );

  if (page === "auth") return <AuthView onBack={() => setPage("landing")} />;
  if (page === "checkout") return <CheckoutView onBack={() => setPage("landing")} />;
  if (page === "admin") return <AdminView onBack={() => setPage("landing")} />;

  if (page === "landing") return (
    <div>
      <LandingPage onStart={startLearning} />
      {!isMobile && (
        <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", gap: 10 }}>
          {isAuthed && (
            <button
              onClick={signOut}
              style={{ background: "transparent", color: "#94a3b8", border: "1px solid #334155", padding: "14px 20px", borderRadius: 12, fontSize: 14, cursor: "pointer" }}
            >
              로그아웃
            </button>
          )}
          <button
            onClick={startLearning}
            style={{ background: "#f59e0b", color: "#000", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px #f59e0b66" }}
          >
            학습 시작 →
          </button>
        </div>
      )}
    </div>
  );

  // page === "learn" — 접근 권한 확인
  if (!canLearn) {
    if (!isAuthed) return <AuthView onBack={() => setPage("landing")} />;
    return <CheckoutView onBack={() => setPage("landing")} />;
  }

  return (
    <div style={{ display: "flex", background: "#0f172a", color: "#f1f5f9", height: "100vh", overflow: "hidden", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Sidebar
        lessons={LESSONS}
        current={view}
        onSelect={selectLesson}
        progress={progress}
        onDash={() => setView("dash")}
        onWrong={() => setView("wrong")}
        wrongCount={totalWrong}
      />
      <div id="main-content" style={{ flex: 1, overflowY: "auto" }}>
        {/* 상단 탭 — sticky 고정 */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 32px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setPage("landing")}
            style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
          >
            ← 홈
          </button>
          {currentLesson && ["concept", "practice", "quiz"].map((s) => (
            <button
              key={s}
              onClick={() => { setStep(s); document.getElementById("main-content").scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{ background: step === s ? "#1e3a8a" : "transparent", border: `1px solid ${step === s ? "#3b82f6" : "#334155"}`, color: step === s ? "#f1f5f9" : "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}
            >
              {s === "concept" ? "📖 개념" : s === "practice" ? "📂 실습" : "📝 퀴즈"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {isAdmin && (
              <button onClick={() => setPage("admin")} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>관리자</button>
            )}
            {user && <span style={{ fontSize: 12.5, color: "#64748b" }}>{user.email}</span>}
            {isAuthed && (
              <button onClick={signOut} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>로그아웃</button>
            )}
          </div>
        </div>

        <div style={{ padding: "32px 32px 40px" }}>
          {view === "dash" && <Dashboard lessons={LESSONS} progress={progress} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
          {view === "wrong" && <WrongNoteView lessons={LESSONS} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
          {currentLesson && step === "concept" && <ConceptView key={view} lesson={currentLesson} onNext={() => setStep("practice")} />}
          {currentLesson && step === "practice" && <PracticeView lesson={currentLesson} onNext={() => setStep("quiz")} onWrong={savePracticeWrong} />}
          {currentLesson && step === "quiz" && <QuizView lesson={currentLesson} onSaveWrong={saveQuizWrong} onDone={(score) => completeLesson(currentLesson.id, score)} />}
        </div>
      </div>
    </div>
  );
}
