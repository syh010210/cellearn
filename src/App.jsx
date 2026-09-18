import { useState, useEffect, useRef } from "react";
import { LESSONS } from "./data/lessons";
import { trackVisit } from "./lib/trackVisit";
import { useAuth } from "./context/AuthContext";
import { useLearningData } from "./hooks/useLearningData";
import { useLessonFlow, allConceptsPassed } from "./hooks/useLessonFlow";
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
import OTView from "./components/lesson/OTView";
import TrialView from "./components/lesson/TrialView";
import LegalView from "./components/legal/LegalView";
import SupportWidget from "./components/support/SupportWidget";
import { getDay, isLessonAccessible, lessonLockReason, isDayComplete, allDaysCleared, isOTDone } from "./data/days";
import { isExamGuarded, endExamAttempt } from "./utils/examGuard";
import { BookOpen, FolderOpen, PenLine, Lock, ClipboardCheck, Target, GraduationCap } from "lucide-react";
import { UI } from "./theme";

const STEP_TABS = [
  { key: "concept", label: "개념", Icon: BookOpen },
  { key: "practice", label: "실습", Icon: FolderOpen },
  { key: "quiz", label: "퀴즈", Icon: PenLine },
];

// 수강권(결제) 필수. true면 로그인 후 활성 수강권이 없으면 결제 화면으로 보낸다.
const REQUIRE_ENROLLMENT = true;

// 모바일 안내 게이트 판정 — 뷰포트 폭이 아니라 "기기 특성"으로 본다.
// 터치 전용(pointer:coarse && hover:none, iPad OS13+ 데스크톱 UA 포함) 또는 모바일 UA 일 때만 true.
// → PC에서 창을 좁혀도(마우스가 있으면) 뜨지 않는다.
function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(ua);
  let touchOnly = false;
  try { touchOnly = window.matchMedia("(pointer: coarse) and (hover: none)").matches; } catch { /* 무시 */ }
  return uaMobile || touchOnly;
}

// 사이드바를 접는 최소 폭. 이보다 좁으면(주로 PC에서 창을 크게 줄인 경우) 사이드바를 숨겨
// 본문이 전체 폭을 쓰게 하고, 타이머는 상단 고정(ExamPanel 의 상단 배너 전환)으로 넘어간다.
const SIDEBAR_COLLAPSE_W = 480;

export default function App() {
  const [isMobile] = useState(isMobileDevice); // 기기 특성 기반, 세션 내 고정
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => { const on = () => setVw(window.innerWidth); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []);
  const collapseSidebar = vw < SIDEBAR_COLLAPSE_W;
  const { loading, dataReady, isSupabaseConfigured, isAuthed, isAdmin, hasActiveEnrollment, user, signOut } = useAuth();
  const [page, setPage] = useState("landing");
  const [legalTab, setLegalTab] = useState("terms");
  const [view, setView] = useState("dash");
  const [step, setStep] = useState("concept");
  // 제품 CTA로 선택한 학습 과정(급수)과, 인증 화면 초기 모드
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  // 실전 응시(phase=running) 중 앱 내 다른 화면으로 이동하려 하면 종료 확인. 확정 이동 함수를 담아둔다.
  const [examExitAsk, setExamExitAsk] = useState(null);
  // 진도/오답은 계정에 저장·복원 (비로그인/미설정 시 메모리 fallback)
  const { progress, quizWrongMap, practiceWrongMap, dayClears, saveError, saveQuizWrong, savePracticeWrong, addPracticeWrong, resolvePracticeWrong, completeLesson: persistComplete, clearDay } = useLearningData();
  // 차시 내 순서 강제(개념→실습→퀴즈) 흐름 상태 — 현재 차시 기준, localStorage 만 사용
  const [conceptIdx, setConceptIdx] = useState(0);
  const [tabNotice, setTabNotice] = useState(null);
  const { flow, setConceptPassed, setPracticeDone } = useLessonFlow(typeof view === "number" ? view : null, user?.id);

  // Supabase 키가 없으면(개발 중) 게이팅을 우회해 기존처럼 학습 화면 사용 가능
  const gateBypassed = !isSupabaseConfigured;
  // 관리자(role=admin)는 결제/수강권 없이도 학습·관리 화면에 접근할 수 있어야 한다.
  const canLearn = gateBypassed || isAdmin || (isAuthed && (!REQUIRE_ENROLLMENT || hasActiveEnrollment));

  // 포트원 모바일 결제 리다이렉트 복귀(?portone=return) → 결제 화면으로 보내 검증 마무리
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("portone") === "return" || q.get("paymentId")) setPage("checkout");
  }, []);

  // 접속 현황 기록 — 인증 상태가 정해진 뒤 하루 한 번(관리자 제외). 실패해도 앱 영향 없음.
  const trackedRef = useRef(false);
  useEffect(() => {
    if (loading || trackedRef.current) return;
    trackedRef.current = true;
    trackVisit({ isAdmin }); // user_id 는 서버 트리거가 채움
  }, [loading, user, isAdmin]);

  // 로그인/결제 상태가 바뀌면 자동 이동. 결제 필요 여부는 learn 렌더 게이트(canLearn)가 판단 →
  // 수강권 로딩 중 결제화면이 깜빡이는 레이스를 막는다.
  useEffect(() => {
    if (page === "auth" && isAuthed) setPage("learn");
    if (page === "checkout" && hasActiveEnrollment) setPage("learn");
  }, [page, isAuthed, hasActiveEnrollment]);

  // 응시 중이면 이동을 붙잡고 종료 확인 모달을 띄운다. 아니면 즉시 이동.
  const guardNav = (fn) => (...args) => {
    if (isExamGuarded()) setExamExitAsk(() => () => fn(...args));
    else fn(...args);
  };

  function openLegal(section) {
    setLegalTab(section || "terms");
    setPage("legal");
    window.scrollTo({ top: 0 });
  }

  function startLearning(grade) {
    // 여러 버튼이 onClick={onStart}로 이벤트를 넘길 수 있어 문자열일 때만 과정으로 취급
    const g = typeof grade === "string" ? grade : null;
    if (g) setSelectedGrade(g);
    // 모바일도 수강 신청(가입)·결제까지는 가능해야 한다. 실제 학습(learn) 화면만 PC 전용으로 막는다.
    if (!isAuthed && !gateBypassed) {
      // 제품 CTA(과정 지정)면 결제 화면에서 가입까지 한 번에(결제 우선 흐름), 그 외엔 로그인
      if (g) return setPage("checkout");
      setAuthMode("login");
      return setPage("auth");
    }
    // 결제 필요 여부는 learn 화면 렌더 시 canLearn 게이트가 판단 (미리 결제화면 띄우지 않음)
    setPage("learn");
  }

  function selectLesson(id) {
    setView(id);
    setStep("concept");
    setConceptIdx(0);
    setTabNotice(null);
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }
  // 단계 이동(개념/실습/퀴즈) — 진행 표시줄·완료 버튼 공용
  function goStep(s) { setStep(s); setTabNotice(null); document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" }); }
  function jumpTo(t) { if (t.step === "concept") setConceptIdx(t.idx); goStep(t.step); }
  function completeLesson(lid, score) { persistComplete(lid, score); setView("dash"); }

  function openGate(day) { setView(`gate-${day}`); document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" }); }
  function onDayCleared(day) { clearDay(day); setView("dash"); }

  const totalWrong = Object.values(quizWrongMap).flat().length + Object.values(practiceWrongMap).flat().length;
  const currentLesson = typeof view === "number" ? LESSONS.find((l) => l.id === view) : null;
  const gateDay = typeof view === "string" && view.startsWith("gate-") ? Number(view.slice(5)) : null;
  // 관리자·이미 완료한 차시는 잠금 예외(재열람 항상 가능). 그 외엔 일차 잠금 + 차시 순서 잠금(앞 차시 완료).
  const lessonDone = currentLesson ? !!progress[currentLesson.id]?.done : false;
  const lessonLocked = currentLesson && !isAdmin && !lessonDone && !isLessonAccessible(currentLesson.id, dayClears, progress);
  const lockReason = (currentLesson && !lessonDone) ? lessonLockReason(currentLesson.id, dayClears, progress) : null;
  // 순서 게이팅 우회: 관리자 또는 이미 완료한 차시(재방문 자유 이동)
  const freeNav = isAdmin || (typeof view === "number" && !!progress[view]?.done);
  const conceptsPassed = currentLesson ? allConceptsPassed(currentLesson, flow) : false;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.mut, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI.font }}>불러오는 중…</div>
  );

  if (page === "auth") return <AuthView onBack={() => setPage("landing")} initialMode={authMode} presetGrade={selectedGrade || "2급"} />;
  if (page === "checkout") return <CheckoutView onBack={() => setPage("landing")} presetGrade={selectedGrade} onNeedLogin={() => { setAuthMode("login"); setPage("auth"); }} />;
  if (page === "admin") return <AdminView onBack={() => setPage("landing")} />;
  // 무료 수업 체험 — 로그인·결제 없이 1일차 3차시(통계 함수)의 개념+퀴즈를 그대로 열어준다.
  if (page === "trial") {
    const trialLesson = LESSONS.find((l) => l.id === 3);
    return <TrialView lesson={trialLesson} onExit={() => setPage("landing")} onSignup={() => startLearning("2급")} />;
  }
  if (page === "legal") return (
    <>
      <LegalView initial={legalTab} onBack={() => setPage("landing")} />
      <SupportWidget />
    </>
  );

  if (page === "landing") return (
    <div>
      <LandingPage onStart={startLearning} onTrial={() => { setPage("trial"); window.scrollTo({ top: 0 }); }} onLegal={openLegal} isAuthed={isAuthed} onSignOut={signOut} />
      <SupportWidget />
    </div>
  );

  // page === "learn" — 접근 권한 확인
  if (!canLearn) {
    if (!isAuthed) return <AuthView onBack={() => setPage("landing")} initialMode={authMode} presetGrade={selectedGrade || "2급"} />;
    // 로그인 직후 수강권 조회가 끝나기 전엔 결제화면 대신 로더 (깜빡임 방지)
    if (!dataReady) return (
      <div style={{ minHeight: "100vh", background: UI.bg, color: UI.mut, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI.font }}>불러오는 중…</div>
    );
    return <CheckoutView onBack={() => setPage("landing")} presetGrade={selectedGrade} onNeedLogin={() => { setAuthMode("login"); setPage("auth"); }} />;
  }

  // 실제 학습(개념/실습/퀴즈)은 PC 전용 — 모바일 기기는 안내 후 홈으로.
  // 단, 실전 응시 중(running)에는 어떤 경우에도 게이트를 띄우지 않는다(진행 중 응시 보호).
  if (isMobile && !isExamGuarded()) return (
    <div style={{ minHeight: "100vh", background: UI.bg, color: UI.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: UI.font }}>
      <div style={{ maxWidth: 380, textAlign: "center", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🖥️</div>
        <h2 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 10px" }}>학습은 PC에서 이용해 주세요</h2>
        <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 20px" }}>
          결제 · 계정은 완료되었습니다. 개념 학습 · 미니 엑셀 실습 · 채점은 마우스와 넓은 화면이 필요해
          PC(웹 브라우저)에서 <b style={{ color: UI.ink }}>cellearn.kr</b>에 로그인하면 바로 이어집니다.
        </p>
        <button onClick={() => setPage("landing")} style={{ background: UI.teal, color: "#fff", border: "none", padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: UI.font }}>홈으로</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", background: UI.bg, color: UI.ink, height: "100vh", overflow: "hidden", fontFamily: UI.font }}>
      {/* 480px 미만이면 사이드바를 접어 본문이 전체 폭을 쓰게 한다(타이머는 ExamPanel 이 상단 고정). */}
      {!collapseSidebar && <Sidebar
        lessons={LESSONS}
        current={view}
        onSelect={guardNav(selectLesson)}
        progress={progress}
        dayClears={dayClears}
        unlockAll={isAdmin}
        onDash={guardNav(() => setView("dash"))}
        onWrong={guardNav(() => setView("wrong"))}
        wrongCount={totalWrong}
        onGate={guardNav(openGate)}
        onExam={() => setView("exam")}
        onOT={guardNav(() => setView("ot"))}
        otDone={isOTDone(dayClears)}
        onHome={guardNav(() => setPage("landing"))}
      />}
      <div id="main-content" style={{ flex: 1, overflowY: "auto" }}>
        {/* 저장 실패 누적 시 안내 배너 — 진도/오답이 서버에 저장되지 않고 있을 때 */}
        {saveError && (
          <div style={{ background: UI.redSoft, borderBottom: `1px solid ${UI.redLine}`, color: UI.red, fontSize: 13.5, fontWeight: 600, padding: "10px 32px", textAlign: "center" }}>
            학습 기록 저장에 문제가 있습니다 — 기록은 이 브라우저에 임시 보관되며, 연결이 회복되면 다시 저장됩니다.
          </div>
        )}
        {/* 상단 탭 — sticky 고정. 차시 탭은 엑셀 시트탭 모양 */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: UI.bg, borderBottom: `1px solid ${UI.line}`, padding: "12px 32px 0", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          {currentLesson && !lessonLocked && STEP_TABS.map(({ key, label, Icon }) => {
            const active = step === key;
            // 실습 탭 = 개념 전부 통과 후, 퀴즈 탭 = 실습 채점 후 활성 (관리자·완료 차시는 항상)
            const enabled = freeNav || key === "concept" || (key === "practice" && conceptsPassed) || (key === "quiz" && flow.practiceDone);
            return (
              <button
                key={key}
                onClick={() => {
                  if (!enabled) { setTabNotice(key === "practice" ? "개념 학습을 먼저 끝내세요" : "실습 파일을 올려 채점하세요"); return; }
                  goStep(key);
                }}
                style={{
                  background: active ? UI.surface : "transparent",
                  border: `1px solid ${active ? UI.line : "transparent"}`,
                  borderBottom: active ? `1px solid ${UI.surface}` : "1px solid transparent",
                  color: active ? UI.ink : UI.mut,
                  padding: "9px 18px", borderRadius: "10px 10px 0 0", cursor: enabled ? "pointer" : "not-allowed",
                  fontSize: 13.5, fontWeight: active ? 700 : 500, marginBottom: -1, opacity: enabled ? 1 : 0.45,
                  display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI.font,
                }}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.5} color={active ? UI.teal : UI.mut} /> {label}
              </button>
            );
          })}
          {currentLesson && !lessonLocked && tabNotice && (
            <span style={{ alignSelf: "center", marginBottom: 10, fontSize: 12.5, color: UI.warn, fontWeight: 600 }}>{tabNotice}</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            {isAdmin && (
              <button onClick={guardNav(() => setPage("admin"))} style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font }}>관리자</button>
            )}
            {user && <span style={{ fontSize: 12.5, color: UI.faint, fontFamily: UI.mono }}>{user.email}</span>}
            {isAuthed && (
              <button onClick={guardNav(signOut)} style={{ background: UI.surface, border: `1px solid ${UI.line}`, color: UI.mut, padding: "7px 14px", borderRadius: UI.rMd, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: UI.font }}>로그아웃</button>
            )}
          </div>
        </div>

        <div style={{ padding: "32px 32px 40px" }}>
          {view === "dash" && <Dashboard lessons={LESSONS} progress={progress} quizWrongMap={quizWrongMap} practiceWrongMap={practiceWrongMap} />}
          {view === "ot" && <OTView otDone={isOTDone(dayClears)} onComplete={() => clearDay(0)} onStart={() => selectLesson(1)} onReplayTutorial={() => selectLesson(1)} />}
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
          {currentLesson && lessonLocked && <LockNotice lesson={currentLesson} reason={lockReason} progress={progress} onGate={openGate} onDash={() => setView("dash")} onOT={() => setView("ot")} onSelect={selectLesson} />}
          {currentLesson && !lessonLocked && step === "concept" && <ConceptView key={view} lesson={currentLesson} idx={conceptIdx} setIdx={setConceptIdx} onGoStep={goStep} addPracticeWrong={addPracticeWrong} resolvePracticeWrong={resolvePracticeWrong} flow={flow} setConceptPassed={setConceptPassed} unlockAll={freeNav} showAdminBadge={isAdmin} />}
          {currentLesson && !lessonLocked && step === "practice" && <PracticeView lesson={currentLesson} onGoStep={goStep} onJump={jumpTo} onWrong={savePracticeWrong} flow={flow} setPracticeDone={setPracticeDone} unlockAll={freeNav} showAdminBadge={isAdmin} />}
          {currentLesson && !lessonLocked && step === "quiz" && <QuizView lesson={currentLesson} onJump={jumpTo} onSaveWrong={saveQuizWrong} onDone={(score) => completeLesson(currentLesson.id, score)} flow={flow} unlockAll={freeNav} showAdminBadge={isAdmin} />}
        </div>
      </div>

      {/* 실전 응시 중 앱 내 이동 종료 확인 */}
      {examExitAsk && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,33,29,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }}>
          <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 22, minWidth: 360, maxWidth: 400, margin: 16, boxShadow: UI.shadow, fontFamily: UI.font }}>
            <div style={{ fontWeight: 700, color: UI.ink, fontSize: 15, marginBottom: 6 }}>시험을 종료할까요?</div>
            <div style={{ color: UI.mut, fontSize: 13.5, marginBottom: 16, lineHeight: 1.6 }}>시험은 이 화면에서만 진행됩니다. 다른 화면으로 이동하면 시험이 종료되고 이 응시는 채점 없이 사라집니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { const go = examExitAsk; setExamExitAsk(null); endExamAttempt(); go(); }}
                style={{ flex: 1, whiteSpace: "nowrap", background: UI.red, color: "#fff", border: "none", borderRadius: UI.rMd, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: UI.font }}
              >종료</button>
              <button
                onClick={() => setExamExitAsk(null)}
                style={{ flex: 1, whiteSpace: "nowrap", background: UI.surface, color: UI.ink, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "11px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: UI.font }}
              >계속 풀기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 잠긴 차시 진입 시 안내 — 차시 순서 잠금(앞 차시 미완료) 또는 일차 잠금
function LockNotice({ lesson, reason, progress, onGate, onDash, onOT, onSelect }) {
  const d = getDay(lesson.id);
  const prevDay = d ? d.day - 1 : null;
  const prevComplete = prevDay ? isDayComplete(prevDay, progress) : false;

  // 차시 순서 잠금: 일차는 열렸으나 같은 일차의 앞 차시가 아직 미완료
  if (reason === "lesson" && d) {
    const pos = d.lessons.indexOf(lesson.id);
    const prevLessonId = pos > 0 ? d.lessons[pos - 1] : null;
    const prev = prevLessonId ? LESSONS.find((l) => l.id === prevLessonId) : null;
    return (
      <div className="cl-fade-up" style={{ maxWidth: 560, margin: "40px auto 0", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 32, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: UI.rPill, background: UI.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Lock size={24} strokeWidth={2} color={UI.mut} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: UI.ink }}>앞 차시를 완료하면 열립니다</h2>
        <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 20px" }}>
          {prev ? <><b style={{ color: UI.ink }}>{prev.id}차시 {prev.shortTitle || prev.title}</b>를 완료하면 이 차시가 열립니다.</> : "앞 차시를 완료하면 이 차시가 열립니다."}
        </p>
        {prev && (
          <button onClick={() => onSelect?.(prev.id)} style={{ background: UI.teal, color: "#fff", border: "none", padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={17} strokeWidth={2} /> {prev.id}차시로 가기
          </button>
        )}
      </div>
    );
  }

  // 1일차는 직전이 OT(day 0). 마무리 시험이 아니라 학습 안내(OT)를 먼저 봐야 열린다.
  if (d?.day === 1) {
    return (
      <div className="cl-fade-up" style={{ maxWidth: 560, margin: "40px auto 0", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 32, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: UI.rPill, background: UI.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <GraduationCap size={24} strokeWidth={2} color={UI.teal} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px", color: UI.ink }}>먼저 학습 안내(OT)를 확인해 주세요</h2>
        <p style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 20px" }}>
          앞으로 7일간 무엇을 어떤 순서로 하는지 <b style={{ color: UI.ink }}>OT · 학습 안내</b>에서 확인하고
          각 단계를 체크하면 <b style={{ color: UI.ink }}>1일차 수업이 열립니다.</b>
        </p>
        <button onClick={onOT} style={{ background: UI.teal, color: "#fff", border: "none", padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <GraduationCap size={17} strokeWidth={2} /> 학습 안내 보러 가기
        </button>
      </div>
    );
  }
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
