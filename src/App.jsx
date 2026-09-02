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
import DayGateView from "./components/lesson/DayGateView";
import ExamView from "./components/exam/ExamView";
import LegalView from "./components/legal/LegalView";
import SupportWidget from "./components/support/SupportWidget";
import { getDay, isLessonUnlocked, isDayComplete, allDaysCleared } from "./data/days";
import { ArrowLeft, BookOpen, FolderOpen, PenLine, Lock, ClipboardCheck, Target } from "lucide-react";
import { UI } from "./theme";

const STEP_TABS = [
  { key: "concept", label: "개념", Icon: BookOpen },
  { key: "practice", label: "실습", Icon: FolderOpen },
  { key: "quiz", label: "퀴즈", Icon: PenLine },
];

// 수강권(결제) 필수. true면 로그인 후 활성 수강권이 없으면 결제 화면으로 보낸다.
const REQUIRE_ENROLLMENT = true;

export default function App() {
  const isMobile = window.innerWidth < 768;
  const { loading, dataReady, isSupabaseConfigured, isAuthed, isAdmin, hasActiveEnrollment, user, signOut } = useAuth();
  const [page, setPage] = useState("landing");
  const [legalTab, setLegalTab] = useState("terms");
  const [view, setView] = useState("dash");
  const [step, setStep] = useState("concept");
  // 진도/오답은 계정에 저장·복원 (비로그인/미설정 시 메모리 fallback)
  const { progress, quizWrongMap, practiceWrongMap, dayClears, saveQuizWrong, savePracticeWrong, completeLesson: persistComplete, clearDay } = useLearningData();

  // Supabase 키가 없으면(개발 중) 게이팅을 우회해 기존처럼 학습 화면 사용 가능
  const gateBypassed = !isSupabaseConfigured;
  const canLearn = gateBypassed || (isAuthed && (!REQUIRE_ENROLLMENT || hasActiveEnrollment));

  // 포트원 모바일 결제 리다이렉트 복귀(?portone=return) → 결제 화면으로 보내 검증 마무리
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("portone") === "return" || q.get("paymentId")) setPage("checkout");
  }, []);

  // 로그인/결제 상태가 바뀌면 자동 이동. 결제 필요 여부는 learn 렌더 게이트(canLearn)가 판단 →
  // 수강권 로딩 중 결제화면이 깜빡이는 레이스를 막는다.
  useEffect(() => {
    if (page === "auth" && isAuthed) setPage("learn");
    if (page === "checkout" && hasActiveEnrollment) setPage("learn");
  }, [page, isAuthed, hasActiveEnrollment]);

  function openLegal(section) {
    setLegalTab(section || "terms");
    setPage("legal");
    window.scrollTo({ top: 0 });
  }

  function startLearning() {
    if (isMobile) return;
    if (gateBypassed) return setPage("learn");
    if (!isAuthed) return setPage("auth");
    // 결제 필요 여부는 learn 화면 렌더 시 canLearn 게이트가 판단 (미리 결제화면 띄우지 않음)
    setPage("learn");
  }

  function selectLesson(id) {
    setView(id);
    setStep("concept");
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }
  function completeLesson(lid, score) { persistComplete(lid, score); setView("dash"); }

  function openGate(day) { setView(`gate-${day}`); document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" }); }
  function onDayCleared(day) { clearDay(day); setView("dash"); }

  const totalWrong = Object.values(quizWrongMap).flat().length + Object.values(practiceWrongMap).flat().length;
  const currentLesson = typeof view === "number" ? LESSONS.find((l) => l.id === view) : null;
  const gateDay = typeof view === "string" && view.startsWith("gate-") ? Number(view.slice(5)) : null;
  // 관리자 계정은 차시 잠금 없이 전체 접근
  const lessonLocked = currentLesson && !isAdmin && !isLessonUnlocked(currentLesson.id, dayClears);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.mut, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI.font }}>불러오는 중…</div>
  );

  if (page === "auth") return <AuthView onBack={() => setPage("landing")} />;
  if (page === "checkout") return <CheckoutView onBack={() => setPage("landing")} />;
  if (page === "admin") return <AdminView onBack={() => setPage("landing")} />;
  if (page === "legal") return (
    <>
      <LegalView initial={legalTab} onBack={() => setPage("landing")} />
      <SupportWidget />
    </>
  );

  if (page === "landing") return (
    <div>
      <LandingPage onStart={startLearning} onLegal={openLegal} />
      <SupportWidget />
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
    // 로그인 직후 수강권 조회가 끝나기 전엔 결제화면 대신 로더 (깜빡임 방지)
    if (!dataReady) return (
      <div style={{ minHeight: "100vh", background: UI.bg, color: UI.mut, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI.font }}>불러오는 중…</div>
    );
    return <CheckoutView onBack={() => setPage("landing")} />;
  }

  return (
    <div style={{ display: "flex", background: UI.bg, color: UI.ink, height: "100vh", overflow: "hidden", fontFamily: UI.font }}>
      <Sidebar
        lessons={LESSONS}
        current={view}
        onSelect={selectLesson}
        progress={progress}
        dayClears={dayClears}
        unlockAll={isAdmin}
        onDash={() => setView("dash")}
        onWrong={() => setView("wrong")}
        wrongCount={totalWrong}
        onGate={openGate}
        onExam={() => setView("exam")}
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
          {currentLesson && !lessonLocked && STEP_TABS.map(({ key, label, Icon }) => {
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
          {view === "exam" && (
            (isAdmin || allDaysCleared(dayClears))
              ? <ExamView />
              : <div className="cl-fade-up" style={{ maxWidth: 560, margin: "40px auto 0", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 32, textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: UI.rPill, background: UI.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Target size={24} strokeWidth={2} color={UI.mut} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: UI.ink }}>실전 모드는 완주 후 열립니다</h2>
                  <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
                    1~7일차를 모두 마치고 사전 점검 세션을 통과하면, 최근 기출 유형 문제를 원하는 만큼 생성해 푸는 실전 모드가 열립니다.
                  </p>
                </div>
          )}
          {gateDay != null && (
            <DayGateView
              day={gateDay}
              lessons={LESSONS}
              quizWrongMap={quizWrongMap}
              practiceWrongMap={practiceWrongMap}
              saveQuizWrong={saveQuizWrong}
              savePracticeWrong={savePracticeWrong}
              onCleared={onDayCleared}
              onExit={() => setView("dash")}
            />
          )}
          {currentLesson && lessonLocked && <LockNotice lesson={currentLesson} progress={progress} onGate={openGate} onDash={() => setView("dash")} />}
          {currentLesson && !lessonLocked && step === "concept" && <ConceptView key={view} lesson={currentLesson} onNext={() => setStep("quiz")} />}
          {currentLesson && !lessonLocked && step === "practice" && <PracticeView lesson={currentLesson} onNext={() => setStep("quiz")} onWrong={savePracticeWrong} />}
          {currentLesson && !lessonLocked && step === "quiz" && <QuizView lesson={currentLesson} onSaveWrong={saveQuizWrong} onDone={(score) => completeLesson(currentLesson.id, score)} />}
        </div>
      </div>
    </div>
  );
}

// 잠긴 차시 진입 시 안내 — 이전 일차 마무리 시험을 먼저 통과해야 함
function LockNotice({ lesson, progress, onGate, onDash }) {
  const d = getDay(lesson.id);
  const prevDay = d ? d.day - 1 : null;
  const prevComplete = prevDay ? isDayComplete(prevDay, progress) : false;
  return (
    <div className="cl-fade-up" style={{ maxWidth: 560, margin: "40px auto 0", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 32, textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: UI.rPill, background: UI.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Lock size={24} strokeWidth={2} color={UI.mut} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: UI.ink }}>{d?.day}일차는 아직 잠겨 있어요</h2>
      <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 20px" }}>
        {prevDay}일차를 마치고 <b style={{ color: UI.ink }}>{prevDay}일차 마무리 시험</b>(오답 재시험 · 누적 복습 엑셀)을
        통과하면 {d?.day}일차가 열립니다.
      </p>
      {prevComplete ? (
        <button onClick={() => onGate(prevDay)} style={{ background: UI.teal, color: "#fff", border: "none", padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ClipboardCheck size={17} strokeWidth={2} /> {prevDay}일차 마무리 시험 보기
        </button>
      ) : (
        <button onClick={onDash} style={{ background: UI.panelAlt, color: UI.ink, border: `1px solid ${UI.line}`, padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          {prevDay}일차 학습 먼저 끝내기
        </button>
      )}
    </div>
  );
}
