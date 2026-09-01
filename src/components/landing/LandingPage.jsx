import { useState, useEffect } from "react";
import {
  BookOpen, Table2, CheckCircle2, XCircle, BarChart3, ArrowRight, ArrowUpRight,
  Lock, Unlock, RefreshCw, Download, Upload, CalendarDays, Repeat, Play, Pause,
} from "lucide-react";
import { LESSONS } from "../../data/lessons";
import { ExcelBasicDiagram } from "../diagrams/Lesson1.jsx";
import Logo from "../brand/Logo";
import { UI } from "../../theme";

// 콘텐츠 재구성 (2026-09):
// - 히어로: "2027 출제기준 개정 → 올해가 적기" + 9월 2급 오픈이 메인 메시지.
// - S(스탯) → R(오픈 로드맵)으로 교체: 9월 2급 / 10월 1급(최대 이벤트) / 11월 ITQ / 12월 실무.
// - F: 카드 그리드 → 번호 있는 학습 루프(실제 순서가 있으므로 번호 정당).
// - G(신규): 복습 게이트 — "어제 오답을 다 맞혀야 오늘 수업이 열린다" 전용 섹션.
// - X(신규): 전 차시 완주 후 실전 모드 무제한 밴드.
// - P: 2급만 결제 가능, 1급은 10월 오픈 예정 상태로 표기.
const tealLine = "#2b5a50";

function Btn({ children, onClick, variant = "dark", style, disabled }) {
  const base = { padding: "12px 22px", borderRadius: UI.rMd, fontSize: 15, fontWeight: 700, cursor: disabled ? "default" : "pointer", border: "none", fontFamily: UI.font, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 8, opacity: disabled ? 0.55 : 1 };
  const v = {
    dark: { ...base, background: UI.teal, color: "#fff" },
    lime: { ...base, background: UI.lime, color: UI.teal },
    outline: { ...base, background: "transparent", color: UI.ink, border: `1.5px solid ${UI.line}` },
    onDark: { ...base, background: "#fff", color: UI.teal },
  }[variant];
  return <button onClick={disabled ? undefined : onClick} style={{ ...v, ...style }}>{children}</button>;
}

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
// 숫자 표기 전용 — 깔끔한 본문 글꼴 + 균등폭 숫자 + 좁은 자간
const num = { fontFamily: UI.font, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" };

// 히어로 시각물 — 3화면 자동 전환 캐러셀: 개념(엑셀 기본 구조) → 오답노트(퀴즈) → 복습 게이트.
function CarouselCard({ label, children }) {
  return (
    <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, boxShadow: UI.shadow, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${UI.line}` }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: UI.teal, background: UI.limeSoft, padding: "3px 10px", borderRadius: UI.rPill }}>{label}</span>
      </div>
      <div style={{ padding: 16, flex: 1 }}>{children}</div>
    </div>
  );
}

// 화면 1 — 개념: 1차시 '엑셀 기본 구조' 다이어그램을 그대로 재사용(카드 폭에 맞춰 축소).
function ConceptSlide() {
  return (
    <CarouselCard label="개념 · 엑셀 기본 구조">
      <div style={{ height: 262, overflow: "hidden", borderRadius: UI.rMd }}>
        <div style={{ width: 720, transform: "scale(0.635)", transformOrigin: "top left" }}>
          <ExcelBasicDiagram />
        </div>
      </div>
    </CarouselCard>
  );
}

// 화면 2 — 오답노트: AND/OR 퀴즈 오답 예시. '내가 고른 오답'을 표시하고 아래에 풀이.
function WrongNoteSlide() {
  const opts = [
    "AND는 조건이 하나라도 참이면 TRUE, OR는 모든 조건이 참일 때만 TRUE를 반환한다.",
    "AND는 모든 조건이 참일 때만 TRUE, OR는 조건 중 하나라도 참이면 TRUE를 반환한다.",
    "AND와 OR는 동작 방식이 동일하며 결과도 항상 같다.",
    "AND는 숫자 조건에만, OR는 텍스트 조건에만 사용할 수 있다.",
  ];
  const myWrong = 0; // 내가 고른 오답: ①
  return (
    <CarouselCard label="오답노트 · 퀴즈 복습">
      <div style={{ fontWeight: 700, fontSize: 13, color: UI.ink, marginBottom: 10, lineHeight: 1.5 }}>
        6. 다음 중 AND 함수와 OR 함수의 차이점을 올바르게 설명한 것은?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {opts.map((o, idx) => {
          const wrong = idx === myWrong;
          return (
            <div key={idx} style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 11.5, lineHeight: 1.5, padding: "7px 10px", borderRadius: UI.rSm, border: `1px solid ${wrong ? UI.redLine : UI.line}`, background: wrong ? UI.redSoft : UI.surface, color: wrong ? UI.wrong : UI.mut, fontWeight: wrong ? 600 : 400 }}>
              <span style={{ flexShrink: 0 }}>{["①", "②", "③", "④"][idx]}</span>
              <span>{o}</span>
              {wrong && <XCircle size={14} strokeWidth={2} color={UI.wrong} style={{ marginLeft: "auto", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, background: UI.panelAlt, border: `1px solid ${UI.line}`, borderLeft: `3px solid ${UI.teal}`, borderRadius: UI.rSm, padding: "9px 12px", fontSize: 11.5, color: UI.mut, lineHeight: 1.6 }}>
        <b style={{ color: UI.ink }}>풀이</b> · 정답은 <b style={{ color: UI.correct }}>②</b>. AND는 모든 조건이 참일 때만, OR는 하나라도 참이면 TRUE입니다. ①은 두 함수의 설명이 뒤바뀐 오답이에요.
      </div>
    </CarouselCard>
  );
}

// 화면 3 — 복습 게이트: 누적 복습 단계
function ReviewSlide() {
  const row = { background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" };
  return (
    <CarouselCard label="사전 점검 세션 · 다음 수업 전">
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={row}>
          <RefreshCw size={18} strokeWidth={1.5} color={UI.teal} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>누적 전 차시 퀴즈 오답 <span style={num}>4</span>문항</div>
            <div style={{ fontSize: 11.5, color: UI.mut, marginTop: 2 }}>오답노트에서 자동 수집 후 풀이</div>
          </div>
        </div>
        <div style={row}>
          <Table2 size={18} strokeWidth={1.5} color={UI.teal} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>누적 전 차시 실습 오답 <span style={num}>3</span>문항</div>
            <div style={{ fontSize: 11.5, color: UI.mut, marginTop: 2 }}>틀린 문제만 모은 엑셀 파일로 다시 풀이</div>
          </div>
        </div>
        <div style={{ ...row, background: UI.teal, border: "none", color: "#fff" }}>
          <Unlock size={18} strokeWidth={1.5} color={UI.lime} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>모두 정답 → 오늘 차시 잠금 해제</div>
            <div style={{ fontSize: 11.5, color: UI.invMut, marginTop: 2 }}>다 맞힐 때까지 다음 진도는 열리지 않습니다</div>
          </div>
        </div>
      </div>
    </CarouselCard>
  );
}

const HERO_SLIDES = [
  { label: "개념", render: () => <ConceptSlide /> },
  { label: "오답노트", render: () => <WrongNoteSlide /> },
  { label: "사전 점검 세션", render: () => <ReviewSlide /> },
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduce || !playing) return;
    const t = setInterval(() => setI((x) => (x + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [reduce, playing]);
  return (
    <div>
      <div style={{ minHeight: 348 }}>
        <div key={i} className="cl-fade-up" style={{ height: "100%" }}>
          {HERO_SLIDES[i].render()}
        </div>
      </div>
      {/* 진행 탭 + 재생/정지 */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 14 }}>
        {HERO_SLIDES.map((s, idx) => {
          const active = idx === i;
          return (
            <button
              key={s.label}
              onClick={() => setI(idx)}
              style={{ background: active ? UI.teal : UI.surface, color: active ? "#fff" : UI.mut, border: `1px solid ${active ? UI.teal : UI.line}`, borderRadius: UI.rPill, padding: "5px 12px", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: UI.font }}
            >
              {s.label}
            </button>
          );
        })}
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "정지" : "재생"}
          title={playing ? "자동 전환 정지" : "자동 전환 재생"}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: UI.surface, color: UI.mut, border: `1px solid ${UI.line}`, borderRadius: UI.rPill, cursor: "pointer", marginLeft: 2 }}
        >
          {playing ? <Pause size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const isMobile = window.innerWidth < 768;
  const lessonCount = LESSONS.length;
  const [showAllLessons, setShowAllLessons] = useState(false);

  // S. 스탯
  const stats = [
    { num: "7일", label: "20차시 완성 커리큘럼" },
    { num: "60+", label: "자체 엔진 함수 지원" },
    { num: "100%", label: "실습 중심 학습" },
    { num: "∞", label: "오답을 맞출 때까지 맞춤 복습" },
  ];

  // R. 오픈 로드맵
  const roadmap = [
    { month: "9월", title: "컴활 2급 실기", state: "open", note: "이번 주말 오픈" },
    { month: "10월", title: "컴활 1급 실기", state: "next", note: "오픈 예정" },
    { month: "11월", title: "ITQ 엑셀", state: "soon", note: "오픈 예정" },
    { month: "12월", title: "실무 엑셀", state: "soon", note: "오픈 예정" },
  ];

  // F. 학습 루프 (실제 순서가 있는 시퀀스)
  const loop = [
    { Icon: BookOpen, title: "개념 학습", desc: "차시별 핵심 개념을 카드로 익히고, 웹 미니 엑셀에서 바로 수식을 쳐 봅니다." },
    { Icon: Download, title: "실습 파일 작성", desc: "실제 시험과 같은 형식의 엑셀 파일을 내려받아 직접 문제를 풉니다." },
    { Icon: Upload, title: "업로드 자동 채점", desc: "작성한 파일을 올리면 셀 단위로 수식까지 비교해 즉시 채점됩니다." },
    { Icon: RefreshCw, title: "복습 퀴즈", desc: "차시를 마치며 객관식 퀴즈로 오늘 배운 개념을 한 번 더 점검합니다." },
    { Icon: XCircle, title: "오답노트 적립", desc: "실습·퀴즈에서 틀린 문제는 차시별 오답노트에 자동으로 쌓입니다." },
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

  return (
    <div style={{ fontFamily: UI.font, background: UI.bg, color: UI.ink, minHeight: "100vh" }}>
      {/* ===== AB. 오픈 공지 바 ===== */}
      <div style={{ background: UI.teal, color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: 13.5 }}>
        <span style={{ ...mono, background: UI.lime, color: UI.teal, fontWeight: 700, fontSize: 11.5, padding: "2px 8px", borderRadius: UI.rSm, marginRight: 10 }}>OPEN</span>
        이번 주말, 9월 컴활 2급 실기 클래스가 열립니다
        <a href="#roadmap" style={{ color: UI.lime, fontWeight: 700, textDecoration: "none", marginLeft: 10 }}>오픈 일정 →</a>
      </div>

      {/* ===== N. 네비 ===== */}
      <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={30} />
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, fontSize: 15, color: UI.mut }}>
            <a href="#top" style={{ color: UI.ink, textDecoration: "none" }}>홈</a>
            <a href="#roadmap" style={{ color: UI.mut, textDecoration: "none" }}>오픈 일정</a>
            <a href="#features" style={{ color: UI.mut, textDecoration: "none" }}>학습 방식</a>
            <a href="#curriculum" style={{ color: UI.mut, textDecoration: "none" }}>커리큘럼</a>
            <a href="#pricing" style={{ color: UI.mut, textDecoration: "none" }}>수강료</a>
          </div>
        )}
        <Btn variant="dark" onClick={onStart} style={{ padding: "10px 18px", fontSize: 14 }}>학습 시작</Btn>
      </nav>

      {/* ===== H. 히어로 — 개정 긴급성 + 9월 2급 오픈 ===== */}
      <header
        id="top"
        style={{
          maxWidth: 1180, margin: "0 auto", padding: "40px 24px 56px",
          display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap",
          backgroundImage: `linear-gradient(${UI.gridline} 1px, transparent 1px), linear-gradient(90deg, ${UI.gridline} 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }}
      >
        <div style={{ flex: "1 1 400px", minWidth: 300 }}>
          <h1 style={{ fontSize: "clamp(30px,4.4vw,44px)", fontWeight: 700, lineHeight: 1.22, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            2027년, 컴활 출제기준이 바뀝니다.<br />
            <span style={{ color: UI.teal }}>반드시 올해 안에 끝내야 합니다.</span>
          </h1>
          <p style={{ color: UI.mut, fontSize: 17, lineHeight: 1.7, margin: "0 0 12px" }}>
            지금까지 쌓인 기출 유형이 그대로 통하는 마지막 해.
            9월, 컴활 2급 실기 클래스가 열립니다.
          </p>
          <p style={{ color: UI.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 28px" }}>
            강의를 보기만 하는 학습이 아니라 — 직접 셀에 수식을 입력하고,
            파일로 채점받고, 틀린 문제를 다 맞혀야 다음 수업이 열리는 <b style={{ color: UI.ink }}>실기 전용</b> 학습입니다.
          </p>
          {isMobile ? (
            <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "16px 20px", display: "inline-block", fontSize: 14, color: UI.teal, fontWeight: 600 }}>
              학습 기능은 PC에서 이용할 수 있어요
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <Btn variant="dark" onClick={onStart}>2급 실기 시작하기 <ArrowRight size={18} strokeWidth={2} /></Btn>
              <a href="#roadmap" style={{ color: UI.teal, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                10월 1급 오픈 일정 <ArrowRight size={16} strokeWidth={2} />
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
            <HeroCarousel />
          )}
        </div>
      </header>

      {/* ===== S. 스탯 (4칸) ===== */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "8px 24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
          {stats.map((s) => {
            const inf = s.num === "∞";
            return (
              <div key={s.label} style={{ background: UI.surface, borderRadius: UI.rMd, padding: "22px 24px", border: `1px solid ${UI.line}`, borderLeft: `2px solid ${UI.teal}` }}>
                <div style={{ ...num, fontSize: inf ? 44 : 34, color: UI.ink, lineHeight: 1, height: 44, display: "flex", alignItems: "center" }}>{s.num}</div>
                <div style={{ color: UI.mut, fontSize: 14, marginTop: 8 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== R. 오픈 로드맵 (시트탭 모티프) ===== */}
      <section id="roadmap" style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          {roadmap.map((r) => {
            const open = r.state === "open";
            const next = r.state === "next";
            return (
              <div
                key={r.month}
                style={{
                  position: "relative",
                  background: open ? UI.teal : UI.surface,
                  color: open ? "#fff" : UI.ink,
                  border: `1px solid ${open ? UI.teal : next ? UI.teal : UI.line}`,
                  borderRadius: UI.rMd,
                  padding: "26px 20px 18px",
                }}
              >
                <span style={{ position: "absolute", top: -1, left: 14, ...num, fontSize: 12, padding: "4px 10px", borderRadius: "0 0 8px 8px", background: open ? UI.lime : next ? UI.teal : UI.bg, color: open ? UI.teal : next ? "#fff" : UI.inkFaint, border: open || next ? "none" : `1px solid ${UI.line}`, borderTop: "none" }}>
                  {r.month}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <CalendarDays size={17} strokeWidth={1.5} color={open ? UI.lime : next ? UI.teal : UI.inkFaint} />
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{r.title}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: open ? UI.lime : next ? UI.teal : UI.mut, fontWeight: open || next ? 700 : 500 }}>
                  {r.note}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: "center", color: UI.mut, fontSize: 13.5, marginTop: 16 }}>
          9월 2급을 시작으로, 10월 컴활 1급 → 11월 ITQ 엑셀 → 12월 실무 엑셀까지 총 4개 클래스가 순차 오픈됩니다.
        </p>
      </section>

      {/* ===== F. 학습 루프 (딥그린, 번호 시퀀스) ===== */}
      <section id="features" style={{ background: UI.teal, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 40px", letterSpacing: "-0.01em" }}>
            하루 한 차시, 이렇게 돌아갑니다
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {loop.map(({ Icon, title, desc }, i) => (
              <HoverCard
                key={title}
                style={{ background: UI.tealCard, border: `1px solid ${tealLine}`, borderRadius: UI.rLg, padding: "20px 20px" }}
                hoverStyle={{ borderColor: UI.lime }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <span style={{ ...num, fontSize: 13, color: UI.invMut }}>{i + 1} / {loop.length}</span>
                  {i < loop.length - 1 && <ArrowRight size={15} strokeWidth={2} color={UI.invMut} />}
                </div>
                <Icon size={22} strokeWidth={1.5} color={UI.lime} />
                <div style={{ fontWeight: 700, fontSize: 17, margin: "12px 0 8px" }}>{title}</div>
                <div style={{ color: UI.invMut, fontSize: 13.5, lineHeight: 1.6 }}>{desc}</div>
              </HoverCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== G. 복습 게이트 (핵심 차별점) ===== */}
      <section style={{ background: UI.surface, padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* 좌: 카피 */}
          <div style={{ flex: "1 1 380px", minWidth: 300 }}>
            <h2 style={{ fontSize: "clamp(24px,3.2vw,32px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              틀린 문제를 다 맞혀야<br />다음 수업이 열립니다
            </h2>
            <p style={{ color: UI.mut, fontSize: 15.5, lineHeight: 1.75, margin: "0 0 20px" }}>
              다음 수업을 시작하기 전, 지금까지 쌓인 오답을 <b style={{ color: UI.ink }}>두 단계</b>로 복습합니다.
              먼저 전 차시 <b style={{ color: UI.ink }}>퀴즈 오답</b>이 오답노트에서 모여 다시 출제되고, 이를 모두 맞혀야 합니다.
            </p>
            <p style={{ color: UI.mut, fontSize: 15.5, lineHeight: 1.75, margin: "0 0 24px" }}>
              이어서 전 차시 <b style={{ color: UI.ink }}>실습에서 틀린 문제</b>만 모은 엑셀 파일을 풀어 제출·채점받습니다.
              퀴즈와 실습 두 복습을 모두 통과해야 오늘 차시가 잠금 해제됩니다.
              약한 유형은 익힐 때까지 반복해 만나므로, 진도만 나가고 잊어버리는 일이 없습니다.
            </p>
            <Btn variant="dark" onClick={onStart}>이 방식으로 시작하기 <ArrowRight size={18} strokeWidth={2} /></Btn>
          </div>
          {/* 우: 게이트 흐름 시각화 */}
          <div style={{ flex: "1 1 380px", minWidth: 300 }}>
            <div style={{ background: UI.bg, borderRadius: UI.rLg, padding: 24, border: `1px solid ${UI.line}` }}>
              <div style={{ fontSize: 13, color: UI.mut, marginBottom: 14 }}>오늘의 학습 시작 전</div>
              {/* 좌우 2카드: 퀴즈 / 엑셀 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                {[
                  { Icon: RefreshCw, step: "①", title: "퀴즈 오답 재시험", sub: "전 차시 오답노트", n: "4", unit: "문항" },
                  { Icon: Table2, step: "②", title: "실습 오답 엑셀", sub: "틀린 문제만 모아", n: "3", unit: "문항" },
                ].map((c) => (
                  <div key={c.step} style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "16px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <c.Icon size={20} strokeWidth={1.5} color={UI.teal} />
                      <CheckCircle2 size={17} strokeWidth={2} color={UI.correct} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: UI.ink }}>{c.step} {c.title}</div>
                    <div style={{ fontSize: 12, color: UI.mut, marginTop: 3 }}>{c.sub}</div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ ...num, fontSize: 22, color: UI.teal }}>{c.n}</span>
                      <span style={{ fontSize: 12, color: UI.mut, marginLeft: 3 }}>{c.unit} 통과</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* 하단 해제바 */}
              <div style={{ background: UI.teal, borderRadius: UI.rMd, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center", color: "#fff" }}>
                <Unlock size={18} strokeWidth={1.5} color={UI.lime} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>오늘 차시 잠금 해제</div>
                  <div style={{ fontSize: 12.5, color: UI.invMut, marginTop: 2 }}>퀴즈·실습 두 복습을 모두 통과</div>
                </div>
              </div>
              {/* 잠긴 다음 차시 */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px 2px", color: UI.inkFaint, fontSize: 13 }}>
                <Lock size={15} strokeWidth={1.5} />
                다음 차시 — 오늘 차시 완료 후 열립니다
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== A. 대시보드 — 취약점 파악 ===== */}
      <section style={{ background: UI.bg, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* 좌: 진도 미리보기 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <div style={{ background: UI.surface, borderRadius: UI.rLg, padding: 24, border: `1px solid ${UI.line}` }}>
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
                <div style={{ flex: 1, background: UI.bg, border: `1px solid ${UI.line}`, borderRadius: UI.rMd, padding: "12px 14px" }}>
                  <div style={{ ...num, fontSize: 24 }}>92%</div>
                  <div style={{ fontSize: 12, color: UI.mut }}>퀴즈 정답률</div>
                </div>
                <div style={{ flex: 1, background: UI.limeSoft, borderRadius: UI.rMd, padding: "12px 14px" }}>
                  <div style={{ ...num, fontSize: 24, color: UI.teal }}>3</div>
                  <div style={{ fontSize: 12, color: UI.teal, opacity: 0.8 }}>오답 복습 대기</div>
                </div>
              </div>
            </div>
          </div>
          {/* 우: 강점 목록 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
              어디가 약한지,<br />숫자로 보입니다
            </h2>
            <p style={{ color: UI.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
              진도율과 정답률이 차시별로 쌓이기 때문에, 감이 아니라 데이터로 내 상태를 확인합니다.
            </p>
            {[
              ["차시별 진도율·정답률 추적", "지금 어디까지 왔는지, 계획대로 가고 있는지 대시보드에서 한눈에 봅니다."],
              ["취약 유형 자동 표시", "오답이 쌓이는 함수·유형이 드러나 어디를 더 풀어야 할지 명확해집니다."],
              ["수식 문자열까지 정확한 채점", "결과값이 아니라 입력한 수식을 셀 단위로 비교해 정오답을 가립니다."],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <BarChart3 size={20} strokeWidth={2} color={UI.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: UI.mut, fontSize: 14, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== X. 실전 모드 밴드 (전 차시 완주 후) ===== */}
      <section style={{ background: UI.greenDeep, color: "#fff", padding: "56px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: UI.tealCard, color: UI.lime, fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: UI.rSm, marginBottom: 18 }}>
            <Repeat size={15} strokeWidth={2} /> 전 차시 완주 후
          </div>
          <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            완주하면, 실전만 무제한
          </h2>
          <p style={{ color: UI.invMut, fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            전 차시를 마치면 실전 모드가 열립니다. 실제 시험 형식 그대로, 지금까지 출제되어 온
            유형의 문제를 <b style={{ color: "#fff" }}>원하는 만큼 생성해</b> 풀 수 있습니다.
            시험 전날까지 감을 유지하세요.
          </p>
        </div>
      </section>

      {/* ===== C. 커리큘럼 (콤팩트 리스트 + 펼치기) ===== */}
      <section id="curriculum" style={{ background: UI.bg, padding: "64px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>커리큘럼</h2>
          <p style={{ textAlign: "center", color: UI.mut, fontSize: 16, margin: "0 0 32px" }}>
            총 <span style={{ ...num, color: UI.ink }}>{lessonCount}</span>차시 — 하루 한 차시, 개념·실습·퀴즈가 한 세트로 이어집니다
          </p>
          <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              {(showAllLessons ? LESSONS : LESSONS.slice(0, 8)).map((l, i, arr) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 20px",
                    borderBottom: i < arr.length - (isMobile ? 1 : 2) ? `1px solid ${UI.gridline}` : "none",
                    borderRight: !isMobile && i % 2 === 0 ? `1px solid ${UI.gridline}` : "none",
                  }}
                >
                  <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: UI.teal, background: UI.limeSoft, padding: "3px 8px", borderRadius: UI.rSm, flexShrink: 0 }}>
                    {String(l.id).padStart(2, "0")}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{l.title}</span>
                  <span style={{ ...mono, color: UI.inkFaint, fontSize: 12, flexShrink: 0 }}>{l.quiz.length}문항</span>
                </div>
              ))}
            </div>
            {LESSONS.length > 8 && (
              <button
                onClick={() => setShowAllLessons(!showAllLessons)}
                style={{ width: "100%", padding: "13px 20px", background: UI.bg, border: "none", borderTop: `1px solid ${UI.line}`, color: UI.teal, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: UI.font }}
              >
                {showAllLessons ? "접기" : `전체 ${lessonCount}차시 보기`}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== P. 가격 — 2급만 결제 가능, 1급은 10월 예정 ===== */}
      <section id="pricing" style={{ background: UI.greenDeep, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>수강료</h2>
          <p style={{ textAlign: "center", color: UI.invMut, fontSize: 16, margin: "0 0 40px" }}>결제 한 번으로 3개월 무제한 — 지금은 2급 실기부터</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {/* 2급 — 지금 결제 가능 (현재의 주인공) */}
            <div style={{ position: "relative", background: UI.teal, border: `1px solid ${tealLine}`, borderRadius: UI.rLg, padding: "28px 26px" }}>
              <span style={{ position: "absolute", top: 20, right: 22, background: UI.lime, color: UI.teal, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: UI.rPill }}>9월 오픈</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: UI.lime, marginBottom: 6 }}>컴활 실기 2급</div>
              <div style={{ ...num, fontSize: 36 }}>₩49,000<span style={{ fontSize: 15, fontWeight: 500, color: UI.invMut }}> / 3개월</span></div>
              <div style={{ margin: "20px 0" }}>
                {["20차시 전체 커리큘럼", "엑셀 파일 자동 채점 · 오답노트", "복습 게이트 · 누적 복습 시스템", "완주 후 실전 모드 무제한"].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#d5dbd8", marginBottom: 10 }}>
                    <CheckCircle2 size={17} strokeWidth={2} color={UI.lime} style={{ flexShrink: 0, marginTop: 2 }} />{f}
                  </div>
                ))}
              </div>
              <Btn variant="lime" onClick={onStart} style={{ width: "100%", justifyContent: "center" }}>2급 실기 시작하기</Btn>
            </div>
            {/* 1급 — 10월 오픈 예정 */}
            <div style={{ position: "relative", background: "#12332d", border: "1px solid #204740", borderRadius: UI.rLg, padding: "28px 26px" }}>
              <span style={{ position: "absolute", top: 20, right: 22, background: "transparent", border: `1px solid ${tealLine}`, color: UI.invMut, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: UI.rPill }}>10월 오픈 예정</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#cfd6d3", marginBottom: 6 }}>컴활 실기 1급</div>
              <div style={{ ...num, fontSize: 36 }}>₩69,000<span style={{ fontSize: 15, fontWeight: 500, color: UI.invMut }}> / 3개월</span></div>
              <div style={{ margin: "20px 0" }}>
                {["2급 전체 학습 시스템 포함", "1급 심화 함수 · 배열 수식", "액세스 · 매크로 실기 대비", "10월 첫 주 오픈 예정"].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#d5dbd8", marginBottom: 10 }}>
                    <CheckCircle2 size={17} strokeWidth={2} color={UI.invMut} style={{ flexShrink: 0, marginTop: 2 }} />{f}
                  </div>
                ))}
              </div>
              <Btn variant="onDark" disabled style={{ width: "100%", justifyContent: "center" }}>10월에 열립니다</Btn>
            </div>
          </div>
          <div style={{ background: UI.tealCard, borderRadius: UI.rLg, padding: "22px 26px", marginTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: UI.invMut }}>
              이후 오픈 예정 — <span style={{ color: "#fff", fontWeight: 700 }}>11월 ITQ 엑셀</span> · <span style={{ color: "#fff", fontWeight: 700 }}>12월 실무 엑셀</span>
            </div>
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
              외부 라이브러리 없이 만든 수식 엔진이 참조·재계산·오류 표현까지 실제 엑셀처럼 처리합니다. 컴활 실기 출제 범위 함수를 그대로 실습하세요.
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

      {/* ===== T. CTA 밴드 (딥그린, 긴급성 재강조) ===== */}
      <section style={{ background: UI.teal, color: "#fff", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
          기출 유형이 통하는 마지막 해입니다
        </h2>
        <p style={{ color: UI.invMut, fontSize: 16, margin: "0 0 26px" }}>2027년 출제기준 개정 전, 9월 2급 실기 클래스로 시작하세요.</p>
        <Btn variant="onDark" onClick={onStart}>2급 실기 시작하기 <ArrowRight size={18} strokeWidth={2} /></Btn>
      </section>

      {/* ===== FT. 푸터 (그린딥) ===== */}
      <footer style={{ background: UI.greenDeep, color: "#cfe0da", padding: "48px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ marginBottom: 12 }}>
              <Logo size={26} tone="light" />
            </div>
            <div style={{ fontSize: 13.5, color: UI.invMut, lineHeight: 1.7 }}>컴활·ITQ·실무 엑셀 실기를 개념부터 채점까지<br />한 흐름으로 준비하는 학습 플랫폼.</div>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>학습</div>
              {["오픈 일정", "학습 방식", "커리큘럼", "수강료"].map((x) => <div key={x} style={{ fontSize: 13.5, color: UI.invMut, marginBottom: 8 }}>{x}</div>)}
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
          <span>© 2026 CellLearn. All rights reserved.</span>
          <span style={mono}>cellearn.kr</span>
        </div>
      </footer>
    </div>
  );
}