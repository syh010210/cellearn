import { useState, useRef } from "react";
import { RotateCcw, Download, Upload, CheckCircle2, XCircle, Lock, ArrowRight } from "lucide-react";
import { DAYS, reviewLessonIds, reviewAnswers } from "../../data/days";
import { generateReviewExcel } from "../../utils/excelGenerator";
import { gradeExcel } from "../../utils/excelGrader";
import { UI } from "../../theme";

// 일차 마무리 시험 — 통과해야 다음 일차가 열린다.
//  ① 직전(이번) 일차 퀴즈 오답 재시험 — 전부 정답
//  ② 1차시~이번 일차 누적 복습 엑셀 — 다운로드 후 제출·채점 통과
export default function DayGateView({ day, lessons, quizWrongMap, saveQuizWrong, onCleared, onExit }) {
  const dayCfg = DAYS.find((d) => d.day === day);
  const dayLessonIds = dayCfg?.lessons ?? [];
  const isLast = day === DAYS[DAYS.length - 1].day;

  // 이번 일차 차시들의 퀴즈 오답 문제 모으기
  const wrongItems = dayLessonIds.flatMap((lid) => {
    const lesson = lessons.find((l) => l.id === lid);
    if (!lesson) return [];
    return (quizWrongMap[lid] || [])
      .map((qid) => { const q = lesson.quiz.find((qq) => qq.id === qid); return q ? { lid, q } : null; })
      .filter(Boolean);
  });

  const [answers, setAnswers] = useState({});
  const [retestSubmitted, setRetestSubmitted] = useState(false);

  const allRetestAnswered = wrongItems.every(({ lid, q }) => answers[`${lid}-${q.id}`] !== undefined);
  const retestPass = wrongItems.length === 0 ||
    (retestSubmitted && wrongItems.every(({ lid, q }) => answers[`${lid}-${q.id}`] === q.answer));

  function submitRetest() {
    // 재시험에서 맞힌 오답은 누적 오답노트에서 제거
    dayLessonIds.forEach((lid) => {
      const cur = quizWrongMap[lid] || [];
      if (cur.length === 0) return;
      const lesson = lessons.find((l) => l.id === lid);
      const stillWrong = cur.filter((qid) => {
        const q = lesson.quiz.find((qq) => qq.id === qid);
        return q ? answers[`${lid}-${qid}`] !== q.answer : true;
      });
      if (stillWrong.length !== cur.length) saveQuizWrong(lid, stillWrong);
    });
    setRetestSubmitted(true);
  }

  // ② 누적 복습 엑셀
  const reviewIds = reviewLessonIds(day);
  const answersList = reviewAnswers(day);
  const [excelResult, setExcelResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const fileRef = useRef();
  const excelCorrect = excelResult ? excelResult.filter((r) => r.status === "correct").length : 0;
  const excelPass = reviewIds.length === 0 || (excelResult && excelResult.length > 0 && excelCorrect === excelResult.length);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setChecking(true);
    try {
      const results = await gradeExcel(file, answersList);
      setExcelResult(results);
    } catch { alert("파일을 읽는 중 오류가 발생했어요."); }
    setChecking(false);
  }

  const cleared = retestPass && excelPass;
  const card = { background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 24, marginBottom: 16 };
  const mono = { fontFamily: UI.mono };
  const stepBadge = (done) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24,
    borderRadius: UI.rPill, background: done ? UI.correct : UI.panelAlt, color: done ? "#fff" : UI.mut,
    fontSize: 13, fontWeight: 700, fontFamily: UI.mono, border: done ? "none" : `1px solid ${UI.line}`,
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onExit} style={{ background: "transparent", border: "none", color: UI.mut, cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>← 돌아가기</button>
      <div style={{ color: UI.teal, fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <Lock size={15} strokeWidth={2} /> {day}일차 마무리 시험
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: UI.ink }}>{day}일차 마무리 {isLast ? "· 전체 과정 완료" : "· 다음 일차 잠금 해제"}</h2>
      <p style={{ color: UI.mut, fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>
        {isLast
          ? <>아래 두 가지를 모두 통과하면 <b style={{ color: UI.ink }}>전체 커리큘럼</b>이 완료됩니다.</>
          : <>아래 두 가지를 모두 통과하면 <b style={{ color: UI.ink }}>{day + 1}일차</b>가 열립니다.</>}
      </p>

      {/* ① 오답 재시험 */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={stepBadge(retestPass)}>{retestPass ? "✓" : "1"}</span>
          <div style={{ fontWeight: 700, color: UI.ink, display: "flex", alignItems: "center", gap: 6 }}>
            <RotateCcw size={16} strokeWidth={2} /> 퀴즈 오답 재시험
          </div>
          {retestPass && <span style={{ marginLeft: "auto", color: UI.correct, fontSize: 13, fontWeight: 700 }}>통과</span>}
        </div>

        {wrongItems.length === 0 ? (
          <div style={{ color: UI.mut, fontSize: 14 }}>이번 일차에서 다시 풀 퀴즈 오답이 없습니다. ✓</div>
        ) : (
          <>
            <div style={{ color: UI.mut, fontSize: 13.5, marginBottom: 14 }}>
              이번 일차에서 틀렸던 <span style={mono}>{wrongItems.length}</span>문제입니다. 모두 맞혀야 통과합니다.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {wrongItems.map(({ lid, q }) => {
                const key = `${lid}-${q.id}`;
                const sel = answers[key];
                return (
                  <div key={key} style={{ borderTop: `1px solid ${UI.line}`, paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: UI.faint, marginBottom: 6, ...mono }}>L{lid}</div>
                    <div style={{ fontWeight: 600, marginBottom: 10, color: UI.ink }}>{q.question}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {q.options.map((opt, oi) => {
                        const picked = sel === oi;
                        const showCorrect = retestSubmitted && oi === q.answer;
                        const showWrong = retestSubmitted && picked && oi !== q.answer;
                        const bg = showCorrect ? UI.limeSoft : showWrong ? UI.redSoft : picked ? UI.tealSoft : UI.surface;
                        const bc = showCorrect ? UI.greenLine : showWrong ? UI.redLine : picked ? UI.teal : UI.line;
                        const tc = showCorrect ? UI.correct : showWrong ? UI.wrong : UI.ink;
                        return (
                          <button
                            key={oi}
                            onClick={() => setAnswers((a) => ({ ...a, [key]: oi }))}
                            style={{ textAlign: "left", padding: "10px 13px", borderRadius: UI.rMd, border: `1px solid ${bc}`, background: bg, color: tc, cursor: "pointer", fontSize: 14, fontWeight: picked || showCorrect ? 600 : 400, fontFamily: UI.font }}
                          >
                            {["①", "②", "③", "④"][oi]} {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {!retestPass && (
              <button
                onClick={submitRetest}
                disabled={!allRetestAnswered}
                style={{ width: "100%", marginTop: 16, padding: 12, borderRadius: UI.rMd, border: "none", background: allRetestAnswered ? UI.teal : "#cfd6d2", color: "#fff", fontSize: 15, fontWeight: 700, cursor: allRetestAnswered ? "pointer" : "not-allowed" }}
              >
                {retestSubmitted ? "다시 제출" : "재시험 제출"}
              </button>
            )}
            {retestSubmitted && !retestPass && (
              <div style={{ marginTop: 10, color: UI.wrong, fontSize: 13, textAlign: "center" }}>아직 틀린 문제가 있어요. 정답을 다시 골라 제출하세요.</div>
            )}
          </>
        )}
      </div>

      {/* ② 누적 복습 엑셀 */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={stepBadge(excelPass)}>{excelPass ? "✓" : "2"}</span>
          <div style={{ fontWeight: 700, color: UI.ink }}>누적 복습 엑셀 (1차시~{day}일차)</div>
          {excelPass && <span style={{ marginLeft: "auto", color: UI.correct, fontSize: 13, fontWeight: 700 }}>통과</span>}
        </div>

        {reviewIds.length === 0 ? (
          <div style={{ color: UI.mut, fontSize: 14 }}>이 구간에는 채점 가능한 복습 실습이 아직 없습니다. ✓</div>
        ) : (
          <>
            <div style={{ color: UI.mut, fontSize: 13.5, marginBottom: 12, lineHeight: 1.7 }}>
              지금까지 배운 차시(<span style={mono}>{reviewIds.join(", ")}</span>차시)의 핵심 수식을 한 파일에 모았습니다.
              내려받아 각 시트의 수식을 채운 뒤 업로드하세요.
            </div>
            <button
              onClick={() => generateReviewExcel(reviewIds, `1~${day}일차`)}
              style={{ width: "100%", padding: 13, borderRadius: UI.rMd, border: "none", background: UI.teal, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
            >
              <Download size={17} strokeWidth={2} /> 누적 복습 파일 내려받기
            </button>
            <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFile} style={{ display: "none" }} />
            <button
              onClick={() => fileRef.current.click()}
              disabled={checking}
              style={{ width: "100%", padding: 13, borderRadius: UI.rMd, border: `2px dashed ${UI.line}`, background: UI.panelAlt, color: UI.teal, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Upload size={17} strokeWidth={2} /> {checking ? "채점 중..." : "완성 파일 업로드 & 채점"}
            </button>

            {excelResult && (
              <div className="cl-fade-up" style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, textAlign: "center", color: excelPass ? UI.correct : UI.warn }}>
                  채점 결과: <span style={mono}>{excelCorrect} / {excelResult.length}</span>
                </div>
                {excelResult.filter((r) => r.status !== "correct").map((r, i) => (
                  <div key={i} style={{ background: UI.redSoft, border: `1px solid ${UI.redLine}`, borderRadius: UI.rMd, padding: "10px 14px", marginBottom: 8, fontSize: 12.5, color: UI.mut }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={mono}>{r.sheet} · {r.cell}</span>
                      <span style={{ color: UI.wrong, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {r.status === "시트없음" ? "시트없음" : <><XCircle size={13} strokeWidth={2} /> 오답</>}
                      </span>
                    </div>
                    <div>입력한 수식: <span style={{ color: UI.wrong, ...mono }}>{r.studentFormula || "(없음)"}</span></div>
                    <div>정답 수식: <span style={{ color: UI.correct, ...mono }}>{r.formula}</span></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 최종 잠금 해제 */}
      <button
        onClick={() => onCleared(day)}
        disabled={!cleared}
        style={{ width: "100%", padding: 15, borderRadius: UI.rMd, border: "none", background: cleared ? UI.teal : "#cfd6d2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: cleared ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        {cleared
          ? (isLast ? <>전체 과정 완료 <CheckCircle2 size={18} strokeWidth={2} /></> : <>{day + 1}일차 열기 <ArrowRight size={18} strokeWidth={2} /></>)
          : "두 단계를 모두 통과하면 열립니다"}
      </button>
    </div>
  );
}
