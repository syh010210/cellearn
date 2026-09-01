import { useState } from "react";
import { BookOpen, Table2, CheckCircle2, PenLine, XCircle, BarChart3, ArrowRight, ArrowUpRight } from "lucide-react";
import { LESSONS } from "../../data/lessons";
import MiniExcel from "../lesson/MiniExcel";
import { UI } from "../../theme";

// 디자인 리뉴얼(docs/DESIGN_RENEWAL_SPEC.md §2) 반영.
// - 팔레트는 theme.js(UI) 단일 소스. 로컬 T 팔레트 폐지.
// - 이모지 → lucide 라인 아이콘. 숫자·수식·금액은 모노.
// - 알약 버튼 폐지(radius 10). 라임은 의미색(완료/하이라이트)으로만.
const tealLine = "#2b5a50"; // 딥그린 위 카드 보더

// ── 버튼: radius 10 (알약 폐지)
function Btn({ children, onClick, variant = "dark", style }) {
  const base = { padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: UI.font, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 8 };
  const v = {
    dark: { ...base, background: UI.teal, color: "#fff" },
    lime: { ...base, background: UI.lime, color: UI.teal },
    outline: { ...base, background: "transparent", color: UI.ink, border: `1.5px solid ${UI.line}` },
    onDark: { ...base, background: "#fff", color: UI.teal }, // 다크 섹션 위 CTA (형광 클리셰 회피)
  }[variant];
  return <button onClick={onClick} style={{ ...v, ...style }}>{children}</button>;
}

// ── hover 반응 카드 (translateY + ↗ 슬라이드 인, 150ms)
function HoverCard({ children, style, hoverStyle, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ transition: "transform .15s cubic-bezier(.22,1,.36,1), background .15s, border-color .15s", ...style, ...(h ? { transform: "translateY(-2px)", ...hoverStyle } : null) }}
    >
      {typeof children === "function" ? children(h) : children}
    </div>
  );
}

const mono = { fontFamily: UI.mono };

// 히어로 라이브 데모 (실제 조작 가능한 MiniExcel)
const heroPractice = {
  instruction: "D2 셀에 =B2+C2 를 입력해 합계를 구하고, 오른쪽 아래 채우기 핸들을 아래로 끌어 D3·D4까지 채워 보세요.",
  cols: ["A", "B", "C", "D"],
  rows: [
    [{ val: "이름", editable: false }, { val: "필기", editable: false }, { val: "실기", editable: false }, { val: "합계", editable: false }],
    [{ val: "김철수", editable: false }, { val: "85", editable: false }, { val: "90", editable: false }, { val: "", editable: true, answer: "=B2+C2", result: 175 }],
    [{ val: "이영희", editable: false }, { val: "72", editable: false }, { val: "68", editable: false }, { val: "", editable: true, answer: "=B3+C3", result: 140 }],
    [{ val: "박민준", editable: false }, { val: "91", editable: false }, { val: "78", editable: false }, { val: "", editable: true, answer: "=B4+C4", result: 169 }],
  ],
};

export default function LandingPage({ onStart }) {
  const isMobile = window.innerWidth < 768;
  const lessonCount = LESSONS.length;

  const features = [
    { Icon: BookOpen, cell: "A1", title: "개념 학습", desc: "차시별 핵심 개념을 카드로 정리해 빠르게 이해합니다." },
    { Icon: Table2, cell: "B1", title: "웹 미니 엑셀", desc: "설치 없이 브라우저에서 실제 엑셀처럼 수식을 실습합니다." },
    { Icon: CheckCircle2, cell: "C1", title: "엑셀 파일 채점", desc: "파일을 내려받아 작성·업로드하면 셀 수식을 자동 채점합니다." },
    { Icon: PenLine, cell: "A2", title: "복습 퀴즈", desc: "차시마다 객관식 문제로 개념을 점검하고 해설을 확인합니다." },
    { Icon: XCircle, cell: "B2", title: "오답노트", desc: "틀린 실습·퀴즈를 자동으로 모아 약점만 다시 봅니다." },
    { Icon: BarChart3, cell: "C2", title: "진도 대시보드", desc: "완료 차시·정답률·진도율을 한눈에 시각화합니다." },
  ];

  const funcs = [
    ["VLOOKUP", "VLOOKUP(찾을값, 범위, 열번호, [일치옵션])"],
    ["INDEX", "INDEX(범위, 행번호, [열번호])"],
    ["MATCH", "MATCH(찾을값, 범위, [일치옵션])"],
    ["IF", "IF(조건, 참일때, 거짓일때)"],
    ["SUMIF", "SUMIF(조건범위, 조건, [합계범위])"],
    ["SUMIFS", "SUMIFS(합계범위, 조건범위1, 조건1, …)"],
    ["COUNTIF", "COUNTIF(범위, 조건)"],
    ["RANK.EQ", "RANK.EQ(수, 범위, [정렬방식])"],
    ["CHOOSE", "CHOOSE(번호, 값1, 값2, …)"],
    ["DSUM", "DSUM(범위, 필드, 조건범위)"],
    ["DAVERAGE", "DAVERAGE(범위, 필드, 조건범위)"],
    ["ROUND", "ROUND(수, 자릿수)"],
    ["LEFT", "LEFT(문자열, 개수)"],
    ["MID", "MID(문자열, 시작, 개수)"],
    ["WORKDAY", "WORKDAY(시작일, 일수, [휴일])"],
    ["WEEKDAY", "WEEKDAY(날짜, [유형])"],
  ];

  const plans = [
    { grade: "2급", price: "49,000", accent: false, feats: ["전 차시 개념·실습 학습", "웹 미니 엑셀 무제한", "엑셀 파일 자동 채점", "퀴즈·오답노트·대시보드"] },
    { grade: "1급", price: "69,000", accent: true, feats: ["2급 전체 포함", "1급 심화 함수·기능", "데이터 분석·매크로 대비", "3개월 무제한 이용"] },
  ];

  const stats = [
    { num: "60+", label: "시험 범위 함수" },
    { num: "100%", label: "브라우저 실습" },
    { num: "즉시", label: "엑셀 파일 채점" },
  ];

  return (
    <div style={{ fontFamily: UI.font, background: UI.bg, color: UI.ink, minHeight: "100vh" }}>
      {/* ===== N. 네비 ===== */}
      <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 20 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: UI.teal, color: UI.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, ...mono, fontWeight: 700 }}>C</span>
          <span><span style={{ ...mono, color: UI.inkFaint, fontWeight: 500 }}>=</span>CellLearn</span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, fontSize: 15, color: UI.mut }}>
            <a href="#top" style={{ color: UI.ink, textDecoration: "none" }}>홈</a>
            <a href="#features" style={{ color: UI.mut, textDecoration: "none" }}>학습 방식</a>
            <a href="#curriculum" style={{ color: UI.mut, textDecoration: "none" }}>커리큘럼</a>
            <a href="#pricing" style={{ color: UI.mut, textDecoration: "none" }}>수강료</a>
          </div>
        )}
        <Btn variant="dark" onClick={onStart} style={{ padding: "10px 18px", fontSize: 14 }}>학습 시작</Btn>
      </nav>

      {/* ===== H. 히어로 — 좌 카피 / 우 라이브 데모 ===== */}
      <header
        id="top"
        style={{
          maxWidth: 1180, margin: "0 auto", padding: "40px 24px 56px",
          display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap",
          backgroundImage: `linear-gradient(${UI.gridline} 1px, transparent 1px), linear-gradient(90deg, ${UI.gridline} 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: 300 }}>
          <h1 style={{ fontSize: "clamp(32px,4.6vw,46px)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            컴활 실기,<br />브라우저에서 바로 친다
          </h1>
          <p style={{ color: UI.mut, fontSize: 17, lineHeight: 1.7, margin: "0 0 28px" }}>
            강의를 보기만 하는 학습은 그만. 직접 셀을 클릭하고 수식을 입력하며
            개념·실습·채점·복습을 한 흐름으로 익힙니다.
          </p>
          {isMobile ? (
            <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "16px 20px", display: "inline-block", fontSize: 14, color: UI.teal, fontWeight: 600 }}>
              학습 기능은 PC에서 이용할 수 있어요
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <Btn variant="dark" onClick={onStart}>무료로 시작 <ArrowRight size={18} strokeWidth={2} /></Btn>
              <a href="#curriculum" style={{ color: UI.teal, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                커리큘럼 보기 <ArrowRight size={16} strokeWidth={2} />
              </a>
            </div>
          )}
        </div>
        <div style={{ flex: "1 1 460px", minWidth: 320 }}>
          {isMobile ? (
            <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: 24, textAlign: "center", color: UI.mut }}>
              <Table2 size={40} strokeWidth={1.5} color={UI.teal} />
              <div style={{ marginTop: 10, fontSize: 14 }}>PC에서 실제 미니 엑셀을 실습해 보세요</div>
            </div>
          ) : (
            <div>
              <MiniExcel practice={heroPractice} />
              <div style={{ ...mono, textAlign: "center", color: UI.inkFaint, fontSize: 12.5, marginTop: 10 }}>
                설치 없음 · 채점 즉시 · 실제 시험 함수 60+
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ===== S. 스탯 (3칸, 통일 카드 + 좌측 그린 보더) ===== */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: UI.surface, borderRadius: UI.rMd, padding: "24px 24px", border: `1px solid ${UI.line}`, borderLeft: `2px solid ${UI.teal}` }}>
              <div style={{ ...mono, fontSize: 32, fontWeight: 700, color: UI.ink }}>{s.num}</div>
              <div style={{ color: UI.mut, fontSize: 14, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== F. 학습 방식 (딥그린) ===== */}
      <section id="features" style={{ background: UI.teal, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            차시로 완성하는 컴활 실기 학습
          </h2>
          <p style={{ textAlign: "center", color: UI.invMut, fontSize: 16, margin: "0 0 40px" }}>
            개념 → 실습 → 채점 → 복습으로 이어지는 하나의 흐름
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {features.map(({ Icon, cell, title, desc }) => (
              <HoverCard
                key={title}
                style={{ background: UI.tealCard, border: `1px solid ${tealLine}`, borderRadius: UI.rLg, padding: "22px 22px" }}
                hoverStyle={{ borderColor: UI.lime }}
              >
                {(h) => (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 34 }}>
                      <span style={{ ...mono, fontSize: 12, color: UI.invMut }}>{cell}</span>
                      <ArrowUpRight size={18} strokeWidth={2} color={UI.lime} style={{ opacity: h ? 1 : 0, transform: h ? "none" : "translate(-4px,4px)", transition: "opacity .15s, transform .15s" }} />
                    </div>
                    <Icon size={22} strokeWidth={1.5} color={UI.lime} />
                    <div style={{ fontWeight: 700, fontSize: 18, margin: "12px 0 8px" }}>{title}</div>
                    <div style={{ color: UI.invMut, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
                  </>
                )}
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== A. 핵심 강점 (밝은) ===== */}
      <section style={{ background: UI.surface, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* 좌: 진도 미리보기 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <div style={{ background: UI.bg, borderRadius: UI.rLg, padding: 24, border: `1px solid ${UI.line}` }}>
              <div style={{ fontSize: 13, color: UI.mut, marginBottom: 10 }}>내 진도</div>
              {[["1차시 · 상대/절대 참조", 100], ["2차시 · 문자열 함수", 70], ["3차시 · 통계 함수", 30]].map(([label, pct]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span>{label}</span><span style={{ ...mono, color: UI.mut }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "#dfe4e1", borderRadius: UI.rPill }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? UI.lime : UI.teal, borderRadius: UI.rPill }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "12px 14px" }}>
                  <div style={{ ...mono, fontSize: 22, fontWeight: 700 }}>92%</div>
                  <div style={{ fontSize: 12, color: UI.mut }}>퀴즈 정답률</div>
                </div>
                <div style={{ flex: 1, background: UI.limeSoft, borderRadius: UI.rMd, padding: "12px 14px" }}>
                  <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: UI.teal }}>3</div>
                  <div style={{ fontSize: 12, color: UI.teal, opacity: 0.8 }}>오답 복습 대기</div>
                </div>
              </div>
            </div>
          </div>
          {/* 우: 강점 목록 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              합격까지, 실습으로<br />체감하는 학습 시스템
            </h2>
            <p style={{ color: UI.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
              눈으로 보는 강의가 아니라, 직접 수식을 입력하고 채점받으며 익힙니다.
            </p>
            {[
              ["실제 엑셀처럼 동작하는 미니 엑셀", "셀 클릭·수식 입력·자동 채우기까지 자체 수식 엔진으로 구현했습니다."],
              ["수식 문자열까지 정확한 채점", "결과값이 아니라 입력한 수식을 셀 단위로 비교해 정오답을 가립니다."],
              ["오답 자동 정리 · 진도 관리", "틀린 문제는 오답노트로, 학습 상태는 대시보드로 자동 정리됩니다."],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <CheckCircle2 size={20} strokeWidth={2} color={UI.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: UI.mut, fontSize: 14, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== C. 커리큘럼 (시트탭 모티프) ===== */}
      <section id="curriculum" style={{ background: UI.bg, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>커리큘럼</h2>
          <p style={{ textAlign: "center", color: UI.mut, fontSize: 16, margin: "0 0 36px" }}>차시별로 개념·실습·퀴즈가 한 세트로 구성됩니다</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {LESSONS.map((l) => (
              <HoverCard
                key={l.id}
                style={{ position: "relative", background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "26px 18px 16px" }}
                hoverStyle={{ background: UI.limeSoft, borderColor: UI.lime }}
              >
                {/* 시트 탭 */}
                <span style={{ position: "absolute", top: -1, left: 16, background: UI.teal, color: UI.lime, ...mono, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: "0 0 8px 8px" }}>
                  L{String(l.id).padStart(2, "0")}
                </span>
                <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                <div style={{ color: UI.mut, fontSize: 12.5, marginTop: 4 }}>
                  <span style={mono}>{l.concepts.length}</span>개 개념 · <span style={mono}>{l.quiz.length}</span>문제
                </div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== P. 가격 (그린딥) ===== */}
      <section id="pricing" style={{ background: UI.greenDeep, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>급수별 수강료</h2>
          <p style={{ textAlign: "center", color: UI.invMut, fontSize: 16, margin: "0 0 40px" }}>결제 한 번으로 해당 급수 3개월 무제한</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {plans.map((p) => (
              <div key={p.grade} style={{ position: "relative", background: p.accent ? UI.teal : "#12332d", border: `1px solid ${p.accent ? tealLine : "#204740"}`, borderRadius: UI.rLg, padding: "28px 26px" }}>
                {p.accent && (
                  <span style={{ position: "absolute", top: 20, right: 22, background: UI.lime, color: UI.teal, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: UI.rPill }}>추천</span>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, color: p.accent ? UI.lime : "#cfd6d3", marginBottom: 6 }}>컴활 실기 {p.grade}</div>
                <div style={{ ...mono, fontSize: 34, fontWeight: 700 }}>₩{p.price}<span style={{ fontSize: 15, fontWeight: 500, color: UI.invMut, fontFamily: UI.font }}> / 3개월</span></div>
                <div style={{ margin: "20px 0" }}>
                  {p.feats.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#d5dbd8", marginBottom: 10 }}>
                      <CheckCircle2 size={17} strokeWidth={2} color={UI.lime} style={{ flexShrink: 0, marginTop: 2 }} />{f}
                    </div>
                  ))}
                </div>
                <Btn variant={p.accent ? "lime" : "onDark"} onClick={onStart} style={{ width: "100%", justifyContent: "center" }}>학습 시작하기</Btn>
              </div>
            ))}
          </div>
          <div style={{ background: UI.tealCard, borderRadius: UI.rLg, padding: "24px 26px", marginTop: 16, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>모든 플랜 공통 제공</div>
            <div style={{ color: UI.invMut, fontSize: 14 }}>개념 학습 · 웹 미니 엑셀 · 엑셀 파일 자동 채점 · 복습 퀴즈 · 오답노트 · 진도 대시보드</div>
          </div>
        </div>
      </section>

      {/* ===== E. 함수/엔진 (밝은) ===== */}
      <section style={{ background: UI.surface, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              컴활 출제 함수를<br />자체 엔진으로 구현
            </h2>
            <p style={{ color: UI.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 22px" }}>
              외부 라이브러리 없이 만든 수식 엔진이 참조·재계산·오류 표현까지 실제 엑셀처럼 처리합니다. 컴활 1·2급 실기 출제 범위 함수를 그대로 실습하세요.
            </p>
            <Btn variant="dark" onClick={onStart}>학습 시작하기 <ArrowRight size={18} strokeWidth={2} /></Btn>
          </div>
          <div style={{ flex: "1 1 320px", background: UI.limeSoft, borderRadius: UI.rLg, padding: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {funcs.map(([fn, sig]) => (
                <span key={fn} title={sig} style={{ ...mono, background: UI.surface, color: UI.teal, fontWeight: 700, fontSize: 13, padding: "8px 12px", borderRadius: UI.rSm, border: `1px solid ${UI.line}`, cursor: "help" }}>{fn}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== T. CTA 밴드 (딥그린) ===== */}
      <section style={{ background: UI.teal, color: "#fff", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>지금 바로 컴활 실기 준비를 시작하세요</h2>
        <p style={{ color: UI.invMut, fontSize: 16, margin: "0 0 26px" }}>개념부터 채점까지, PC에서 바로 실습할 수 있습니다.</p>
        <Btn variant="onDark" onClick={onStart}>학습 시작하기 <ArrowRight size={18} strokeWidth={2} /></Btn>
      </section>

      {/* ===== FT. 푸터 (그린딥) ===== */}
      <footer style={{ background: UI.greenDeep, color: "#cfe0da", padding: "48px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 19, color: "#fff", marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: UI.lime, color: UI.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, ...mono, fontWeight: 700 }}>C</span>
              CellLearn
            </div>
            <div style={{ fontSize: 13.5, color: UI.invMut, lineHeight: 1.7 }}>컴퓨터활용능력 실기를 개념부터 실습까지<br />한 흐름으로 준비하는 학습 플랫폼.</div>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>학습</div>
              {["학습 방식", "커리큘럼", "수강료"].map((x) => <div key={x} style={{ fontSize: 13.5, color: UI.invMut, marginBottom: 8 }}>{x}</div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>고객지원</div>
              {["자주 묻는 질문", "이용약관", "개인정보처리방침"].map((x) => <div key={x} style={{ fontSize: 13.5, color: UI.invMut, marginBottom: 8 }}>{x}</div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>문의</div>
              <div style={{ ...mono, fontSize: 13, color: UI.invMut, marginBottom: 8 }}>syh010210@naver.com</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "28px auto 0", paddingTop: 20, borderTop: "1px solid #1e463e", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12.5, color: UI.invMut }}>
          <span>© 2025 CellLearn. All rights reserved.</span>
          <span style={mono}>cellearn.kr</span>
        </div>
      </footer>
    </div>
  );
}
