import { LESSONS } from "../../data/lessons";

// Prodmast 레퍼런스 톤: 밝은 히어로 · 딥그린 섹션 · 블랙 가격 · 라임 포인트 · 다크 푸터
const T = {
  teal: "#123a33",       // 딥그린 섹션 배경
  tealCard: "#16443b",   // 딥그린 위 카드
  tealLine: "#2b5a50",
  black: "#0b0c0e",      // 가격 섹션
  lime: "#c8f26a",       // 포인트(버튼/칩)
  limeSoft: "#e4f6b8",   // 연한 라임 카드
  light: "#edf0ee",      // 밝은 섹션 배경
  card: "#ffffff",
  ink: "#132420",        // 진한 텍스트
  mut: "#5f6f6a",        // 보조 텍스트
  line: "#e2e6e4",
  invMut: "#9fb4ad",     // 딥그린 위 보조 텍스트
};

const FONT = "'Noto Sans KR', sans-serif";

function Pill({ children, onClick, variant = "lime", style }) {
  const base = { padding: "13px 26px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: FONT, whiteSpace: "nowrap" };
  const v = {
    lime: { ...base, background: T.lime, color: T.ink },
    dark: { ...base, background: T.teal, color: "#fff" },
    outline: { ...base, background: "transparent", color: T.ink, border: `1.5px solid ${T.ink}33` },
  }[variant];
  return <button onClick={onClick} style={{ ...v, ...style }}>{children}</button>;
}

function IconBadge({ children, bg = T.teal, color = "#fff" }) {
  return (
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
      {children}
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const isMobile = window.innerWidth < 768;
  const lessonCount = LESSONS.length;

  const features = [
    { icon: "📖", title: "개념 학습", desc: "차시별 핵심 개념을 카드로 정리해 빠르게 이해합니다." },
    { icon: "🧮", title: "웹 미니 엑셀", desc: "설치 없이 브라우저에서 실제 엑셀처럼 수식을 실습합니다." },
    { icon: "✅", title: "엑셀 파일 채점", desc: "파일을 내려받아 작성·업로드하면 셀 수식을 자동 채점합니다." },
    { icon: "📝", title: "복습 퀴즈", desc: "차시마다 객관식 문제로 개념을 점검하고 해설을 확인합니다." },
    { icon: "❌", title: "오답노트", desc: "틀린 실습·퀴즈를 자동으로 모아 약점만 다시 봅니다." },
    { icon: "📊", title: "진도 대시보드", desc: "완료 차시·정답률·진도율을 한눈에 시각화합니다." },
  ];

  const funcs = ["VLOOKUP", "INDEX", "MATCH", "IF", "SUMIF", "SUMIFS", "COUNTIF", "RANK.EQ", "CHOOSE", "DSUM", "DAVERAGE", "ROUND", "LEFT", "MID", "WORKDAY", "WEEKDAY"];

  const plans = [
    { grade: "2급", price: "49,000", accent: false, feats: ["전 차시 개념·실습 학습", "웹 미니 엑셀 무제한", "엑셀 파일 자동 채점", "퀴즈·오답노트·대시보드"] },
    { grade: "1급", price: "69,000", accent: true, feats: ["2급 전체 포함", "1급 심화 함수·기능", "데이터 분석·매크로 대비", "3개월 무제한 이용"] },
  ];

  return (
    <div style={{ fontFamily: FONT, background: T.light, color: T.ink, minHeight: "100vh" }}>
      {/* ===== 상단 네비 ===== */}
      <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: T.teal, color: T.lime, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>C</span>
          CellLearn
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, fontSize: 15, color: T.mut }}>
            <a href="#top" style={{ color: T.ink, textDecoration: "none" }}>홈</a>
            <a href="#features" style={{ color: T.mut, textDecoration: "none" }}>학습 방식</a>
            <a href="#curriculum" style={{ color: T.mut, textDecoration: "none" }}>커리큘럼</a>
            <a href="#pricing" style={{ color: T.mut, textDecoration: "none" }}>수강료</a>
          </div>
        )}
        <Pill variant="dark" onClick={onStart} style={{ padding: "10px 20px", fontSize: 14 }}>학습 시작</Pill>
      </nav>

      {/* ===== 히어로 ===== */}
      <header id="top" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-block", fontSize: 13, fontWeight: 700, background: T.limeSoft, color: T.teal, padding: "6px 16px", borderRadius: 999, marginBottom: 22 }}>
          컴퓨터활용능력 실기 전문 · 2025 신규 오픈
        </div>
        <h1 style={{ fontSize: "clamp(30px,5.2vw,54px)", fontWeight: 800, lineHeight: 1.18, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          컴활 실기,<br />최신 학습법으로 한 번에
        </h1>
        <p style={{ color: T.mut, fontSize: 17, lineHeight: 1.7, margin: "0 0 28px" }}>
          1급·2급 실기 시험을 위한 체계적 차시 학습 플랫폼.<br />
          개념부터 실습·채점·복습까지 한 흐름으로 준비하세요.
        </p>
        {isMobile ? (
          <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 20px", display: "inline-block", fontSize: 14, color: T.teal, fontWeight: 600 }}>
            💻 학습 기능은 PC에서 이용할 수 있어요
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Pill variant="dark" onClick={onStart}>학습 시작하기 →</Pill>
            <Pill variant="outline" onClick={onStart}>미리보기</Pill>
          </div>
        )}
      </header>

      {/* ===== 스탯 카드 줄 ===== */}
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
          <div style={{ background: T.teal, color: "#fff", borderRadius: 18, padding: "26px 24px" }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>{lessonCount}차시</div>
            <div style={{ color: T.invMut, fontSize: 14, marginTop: 6 }}>체계적 커리큘럼</div>
          </div>
          <div style={{ background: T.card, borderRadius: 18, padding: "26px 24px", border: `1px solid ${T.line}` }}>
            <div style={{ fontSize: 34, fontWeight: 800 }}>60+</div>
            <div style={{ color: T.mut, fontSize: 14, marginTop: 6 }}>자체 엔진 함수 지원</div>
          </div>
          <div style={{ background: T.limeSoft, borderRadius: 18, padding: "26px 24px" }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: T.teal }}>100%</div>
            <div style={{ color: T.teal, fontSize: 14, marginTop: 6, opacity: 0.8 }}>실습 중심 학습</div>
          </div>
          <div style={{ background: T.tealCard, color: "#fff", borderRadius: 18, padding: "26px 24px", gridColumn: "span 1" }}>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.5 }}>설치 없이<br />브라우저에서 바로 실습</div>
          </div>
        </div>
      </section>

      {/* ===== 학습 방식 (딥그린) ===== */}
      <section id="features" style={{ background: T.teal, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, margin: "0 0 12px" }}>
            차시로 완성하는 컴활 실기 학습
          </h2>
          <p style={{ textAlign: "center", color: T.invMut, fontSize: 16, margin: "0 0 40px" }}>
            개념 → 실습 → 채점 → 복습으로 이어지는 하나의 흐름
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: T.tealCard, border: `1px solid ${T.tealLine}`, borderRadius: 16, padding: "24px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                  <span style={{ fontSize: 26 }}>{f.icon}</span>
                  <span style={{ color: T.lime, fontSize: 18 }}>↗</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: T.invMut, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 핵심 강점 (밝은) ===== */}
      <section style={{ background: T.card, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* 좌: 대시보드 목업 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <div style={{ background: T.light, borderRadius: 20, padding: 24, border: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 13, color: T.mut, marginBottom: 10 }}>내 진도</div>
              {[["1차시 · 상대/절대 참조", 100], ["2차시 · 문자열 함수", 70], ["3차시 · 통계 함수", 30]].map(([label, pct]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span>{label}</span><span style={{ color: T.mut }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: "#dfe4e1", borderRadius: 999 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: T.teal, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <div style={{ flex: 1, background: T.card, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>92%</div>
                  <div style={{ fontSize: 12, color: T.mut }}>퀴즈 정답률</div>
                </div>
                <div style={{ flex: 1, background: T.limeSoft, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: T.teal }}>3</div>
                  <div style={{ fontSize: 12, color: T.teal, opacity: 0.8 }}>오답 복습 대기</div>
                </div>
              </div>
            </div>
          </div>
          {/* 우: 강점 목록 */}
          <div style={{ flex: "1 1 360px", minWidth: 300 }}>
            <h2 style={{ fontSize: "clamp(24px,3.2vw,32px)", fontWeight: 800, margin: "0 0 14px", lineHeight: 1.3 }}>
              합격까지, 실습으로<br />체감하는 학습 시스템
            </h2>
            <p style={{ color: T.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
              눈으로 보는 강의가 아니라, 직접 수식을 입력하고 채점받으며 익힙니다.
            </p>
            {[
              ["실제 엑셀처럼 동작하는 미니 엑셀", "셀 클릭·수식 입력·자동 채우기까지 자체 수식 엔진으로 구현했습니다."],
              ["수식 문자열까지 정확한 채점", "결과값이 아니라 입력한 수식을 셀 단위로 비교해 정오답을 가립니다."],
              ["오답 자동 정리 · 진도 관리", "틀린 문제는 오답노트로, 학습 상태는 대시보드로 자동 정리됩니다."],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <span style={{ color: T.teal, fontSize: 18, fontWeight: 800, marginTop: 2 }}>◆</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{t}</div>
                  <div style={{ color: T.mut, fontSize: 14, lineHeight: 1.6 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 커리큘럼 (밝은) ===== */}
      <section id="curriculum" style={{ background: T.light, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, margin: "0 0 12px" }}>커리큘럼</h2>
          <p style={{ textAlign: "center", color: T.mut, fontSize: 16, margin: "0 0 36px" }}>차시별로 개념·실습·퀴즈가 한 세트로 구성됩니다</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {LESSONS.map((l) => (
              <div key={l.id} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: T.teal, color: T.lime, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>{l.id}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                  <div style={{ color: T.mut, fontSize: 12.5, marginTop: 2 }}>{l.concepts.length}개 개념 · {l.quiz.length}문제</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 가격 (블랙) ===== */}
      <section id="pricing" style={{ background: T.black, color: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, margin: "0 0 12px" }}>급수별 수강료</h2>
          <p style={{ textAlign: "center", color: "#9aa3a0", fontSize: 16, margin: "0 0 40px" }}>결제 한 번으로 해당 급수 3개월 무제한</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {plans.map((p) => (
              <div key={p.grade} style={{ background: p.accent ? T.teal : "#141618", border: `1px solid ${p.accent ? T.tealLine : "#242729"}`, borderRadius: 18, padding: "28px 26px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: p.accent ? T.lime : "#cfd6d3", marginBottom: 6 }}>컴활 실기 {p.grade}</div>
                <div style={{ fontSize: 36, fontWeight: 800 }}>₩{p.price}<span style={{ fontSize: 15, fontWeight: 500, color: "#9aa3a0" }}> / 3개월</span></div>
                <div style={{ margin: "20px 0" }}>
                  {p.feats.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#d5dbd8", marginBottom: 10 }}>
                      <span style={{ color: T.lime }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Pill variant={p.accent ? "lime" : "outline"} onClick={onStart} style={p.accent ? { width: "100%" } : { width: "100%", color: "#fff", border: "1.5px solid #3a3d3f" }}>
                  학습 시작하기
                </Pill>
              </div>
            ))}
          </div>
          {/* 공통 제공 밴드 */}
          <div style={{ background: T.tealCard, borderRadius: 18, padding: "24px 26px", marginTop: 16, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>모든 플랜 공통 제공</div>
            <div style={{ color: T.invMut, fontSize: 14 }}>개념 학습 · 웹 미니 엑셀 · 엑셀 파일 자동 채점 · 복습 퀴즈 · 오답노트 · 진도 대시보드</div>
          </div>
        </div>
      </section>

      {/* ===== 함수/엔진 (밝은) ===== */}
      <section style={{ background: T.card, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <h2 style={{ fontSize: "clamp(24px,3.2vw,32px)", fontWeight: 800, margin: "0 0 14px", lineHeight: 1.3 }}>
              컴활 출제 함수를<br />자체 엔진으로 구현
            </h2>
            <p style={{ color: T.mut, fontSize: 15, lineHeight: 1.7, margin: "0 0 22px" }}>
              외부 라이브러리 없이 만든 수식 엔진이 참조·재계산·오류 표현까지 실제 엑셀처럼 처리합니다. 컴활 1·2급 실기 출제 범위 함수를 그대로 실습하세요.
            </p>
            <Pill variant="lime" onClick={onStart}>학습 시작하기</Pill>
          </div>
          <div style={{ flex: "1 1 320px", background: T.limeSoft, borderRadius: 20, padding: 28 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {funcs.map((fn) => (
                <span key={fn} style={{ background: T.card, color: T.teal, fontWeight: 700, fontSize: 13.5, padding: "8px 14px", borderRadius: 999, border: `1px solid ${T.line}` }}>{fn}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA 밴드 (딥그린) ===== */}
      <section style={{ background: T.teal, color: "#fff", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 800, margin: "0 0 12px" }}>지금 바로 컴활 실기 준비를 시작하세요</h2>
        <p style={{ color: T.invMut, fontSize: 16, margin: "0 0 26px" }}>개념부터 채점까지, PC에서 바로 실습할 수 있습니다.</p>
        <Pill variant="lime" onClick={onStart}>학습 시작하기 →</Pill>
      </section>

      {/* ===== 푸터 ===== */}
      <footer style={{ background: "#0d2a25", color: "#cfe0da", padding: "48px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 19, color: "#fff", marginBottom: 12 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: T.lime, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>C</span>
              CellLearn
            </div>
            <div style={{ fontSize: 13.5, color: T.invMut, lineHeight: 1.7 }}>컴퓨터활용능력 실기를 개념부터 실습까지<br />한 흐름으로 준비하는 학습 플랫폼.</div>
          </div>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>학습</div>
              {["학습 방식", "커리큘럼", "수강료"].map((x) => <div key={x} style={{ fontSize: 13.5, color: T.invMut, marginBottom: 8 }}>{x}</div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>고객지원</div>
              {["자주 묻는 질문", "이용약관", "개인정보처리방침"].map((x) => <div key={x} style={{ fontSize: 13.5, color: T.invMut, marginBottom: 8 }}>{x}</div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>문의</div>
              <div style={{ fontSize: 13.5, color: T.invMut, marginBottom: 8 }}>syh010210@naver.com</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "28px auto 0", paddingTop: 20, borderTop: "1px solid #1e463e", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12.5, color: T.invMut }}>
          <span>© 2025 CellLearn. All rights reserved.</span>
          <span>cellearn.kr</span>
        </div>
      </footer>
    </div>
  );
}
