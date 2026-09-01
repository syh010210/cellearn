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
import { ArrowLeft, BookOpen, FolderOpen, PenLine } from "lucide-react";
import { UI } from "./theme";

const STEP_TABS = [
  { key: "concept", label: "개념", Icon: BookOpen },
  { key: "practice", label: "실습", Icon: FolderOpen },
  { key: "quiz", label: "퀴즈", Icon: PenLine },
];

// ⚠️ 임시: 결제 연동 전까지 로그인만 하면 실습 허용. 결제 붙일 때 true로 되돌려 수강권(결제) 필수로 조인다.
const REQUIRE_ENROLLMENT = false;

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
  const canLearn = gateBypassed || (isAuthed && (!REQUIRE_ENROLLMENT || hasActiveEnrollment));

  // 로그인/결제 상태가 바뀌면 인증·결제 페이지에서 자동으로 다음 단계로 이동
  useEffect(() => {
    if (page === "auth" && isAuthed) setPage((!REQUIRE_ENROLLMENT || hasActiveEnrollment) ? "learn" : "checkout");
    if (page === "checkout" && hasActiveEnrollment) setPage("learn");
  }, [page, isAuthed, hasActiveEnrollment]);

  function startLearning() {
    if (isMobile) return;
    if (gateBypassed) return setPage("learn");
    if (!isAuthed) return setPage("auth");
    if (REQUIRE_ENROLLMENT && !hasActiveEnrollment) return setPage("checkout");
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
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.mut, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI.font }}>불러오는 중…</div>
  );

  if (page === "auth") return <AuthView onBack={() => setPage("landing")} />;
  if (page === "checkout") return <CheckoutView onBack={() => setPage("landing")} />;
  if (page === "admin") return <AdminView onBack={() => setPage("landing")} />;

  if (page === "landing") return (
    <div>
      <LandingPage onStart={startLearning} />
      {!isMobile && isAuthed && (
        <button
          onClick={signOut}
          style={{ position: "fixed", top: 18, right: 24, background: UI.panel, color: UI.mut, border: `1px solid ${UI.line}`, padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: UI.font, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          로그아웃
        </button>
      )}
    </div>
  );

  // page === "learn" — 접근 권한 확인
  if (!canLearn) {
    if (!isAuthed) return <AuthView onBack={() => setPage("landing")} />;
    return <CheckoutView onBack={() => setPage("landing")} />;
  }

  return (
    <div style={{ display: "flex", background: UI.bg, color: UI.ink, height: "100vh", overflow: "hidden", fontFamily: UI.font }}>
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
        {/* 상단 탭 — sticky 고정. 차시 탭은 엑셀 시트탭 모양 */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: UI.bg, borderBottom: `1px solid ${UI.line}`, padding: "12px 32px 0", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <button
            onClick={() => setPage("landing")}
            style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: UI.font }}
          >
            <ArrowLeft size={15} strokeWidth={2} /> 홈
          </button>
          {currentLesson && STEP_TABS.map(({ key, label, Icon }) => {
            const active = step === key;
            return (
              <button
                key={key}
                onClick={() => { setStep(key); document.getElementById("main-content").scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{
                  background: active ? UI.surface : "transparent",
                  border: `1px solid ${active ? UI.line : "transparent"}`,
                  borderBottom: active ? `1px solid ${UI.surface}` : "1px solid transparent",
                  color: active ? UI.ink : UI.mut,
                  padding: "9px 18px", borderRadius: "10px 10px 0 0", cursor: "pointer",
                  fontSize: 13.5, fontWeight: active ? 700 : 500, marginBottom: -1,
                  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI.font,
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} color={active ? UI.teal : UI.mut} /> {label}
              </button>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            {isAdmin && (
              <button onClick={() => setPage("admin")} style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font }}>관리자</button>
            )}
            {user && <span style={{ fontSize: 12.5, color: UI.faint, fontFamily: UI.mono }}>{user.email}</span>}
            {isAuthed && (
              <button onClick={signOut} style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font }}>로그아웃</button>
            )}
          </div>
        </div>

        <div style={{ padding: "32px 32px 40px" }}>
          {view === "dash" && <Dashboard lessons={LESSONS} progress={progress} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
          {view === "wrong" && <WrongNoteView lessons={LESSONS} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
          {currentLesson && step === "concept" && <ConceptView key={view} lesson={currentLesson} onNext={() => setStep("quiz")} />}
          {currentLesson && step === "practice" && <PracticeView lesson={currentLesson} onNext={() => setStep("quiz")} onWrong={savePracticeWrong} />}
          {currentLesson && step === "quiz" && <QuizView lesson={currentLesson} onSaveWrong={saveQuizWrong} onDone={(score) => completeLesson(currentLesson.id, score)} />}
        </div>
      </div>
    </div>
  );
}
