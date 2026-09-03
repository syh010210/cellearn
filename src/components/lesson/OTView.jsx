import {
  ClipboardCheck, BookOpen, Save, Upload, PenLine, Target,
  ArrowRight, Repeat, CheckCircle2, AlertTriangle, Lightbulb, GraduationCap, ChevronRight,
} from "lucide-react";
import { UI } from "../../theme";

// 오리엔테이션(OT) — 학습 흐름과 매일의 루틴을 실제 첫 수업처럼 안내한다.
// 사이드바에서 "실전 모드"와 "1일차" 사이에 위치한다.
export default function OTView({ onStart }) {
  return (
    <div className="cl-fade-up" style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* ── 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 46, height: 46, borderRadius: UI.rMd, background: UI.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <GraduationCap size={26} strokeWidth={2} color={UI.teal} />
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: UI.teal, letterSpacing: 0.4 }}>ORIENTATION</div>
          <h2 style={{ fontSize: 25, fontWeight: 800, margin: 0, color: UI.ink }}>시작하기 전에, 학습 흐름부터</h2>
        </div>
      </div>
      <p style={{ color: UI.mut, fontSize: 15, lineHeight: 1.75, margin: "0 0 26px" }}>
        컴활 2급 실기를 <b style={{ color: UI.ink }}>7일 완성</b>으로 설계했습니다. 하루하루 정해진 루틴을 그대로 따라오면
        됩니다. 이 페이지만 한 번 읽어두면, 앞으로 무엇을 어떤 순서로 하는지 헷갈릴 일이 없습니다.
      </p>

      {/* ── 하루의 흐름 다이어그램 */}
      <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: "24px 22px", marginBottom: 26 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: UI.faint, letterSpacing: 0.4, marginBottom: 16 }}>매일의 학습 루틴</div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 8, flexWrap: "wrap" }}>
          <FlowPill icon={ClipboardCheck} label="사전 점검" sub="지난 오답 재시험" tone="amber" />
          <FlowArrow />
          <FlowPill icon={BookOpen} label="개념 학습" sub="꼼꼼히 정독" tone="teal" />
          <FlowArrow />
          <FlowPill icon={Upload} label="엑셀 실습" sub="저장 후 업로드" tone="teal" />
          <FlowArrow />
          <FlowPill icon={PenLine} label="퀴즈" sub="오답 해설 확인" tone="teal" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, padding: "10px 14px", background: UI.panelAlt, border: `1px dashed ${UI.line}`, borderRadius: UI.rMd }}>
          <Repeat size={16} strokeWidth={2} color={UI.teal} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: UI.mut, lineHeight: 1.6 }}>
            이 흐름이 <b style={{ color: UI.ink }}>7일간 반복</b>됩니다. 단, <b style={{ color: UI.ink }}>첫날 첫 차시</b>는 되돌아볼 지난 수업이 없으므로 사전 점검 없이 바로 개념 학습으로 시작합니다.
          </span>
        </div>
      </div>

      {/* ── 단계별 상세 */}
      <div style={{ fontSize: 14, fontWeight: 700, color: UI.faint, letterSpacing: 0.4, margin: "0 0 14px" }}>단계별로 자세히</div>

      <StepCard
        n={1} icon={ClipboardCheck} tone="amber"
        title="사전 점검 세션"
        badge="매 수업 시작 시 · 첫날 첫 차시 제외"
      >
        <p style={{ margin: "0 0 12px" }}>
          매 수업은 <b style={{ color: UI.ink }}>사전 점검</b>으로 문을 엽니다. 바로 지난 일자에서 <b style={{ color: UI.ink }}>틀렸던 것만 모아</b> 다시 확인하는 세션입니다.
        </p>
        <ul style={ulStyle}>
          <li>지난 일자 <b style={{ color: UI.ink }}>차시별 퀴즈에서 틀린 문제</b>만 다시 테스트</li>
          <li>지난 일자 <b style={{ color: UI.ink }}>엑셀 실습에서 틀린 문제</b>가 있으면 그 문제만 다시 풀어 제출</li>
        </ul>
        <Callout tone="amber" icon={AlertTriangle}>
          이 오답들을 <b>모두 맞혀야</b> 날짜가 바뀌어 <b>다음 날의 수업으로 넘어갈 수 있습니다.</b> 그래서 오늘 틀린 문제는 반드시 내일 다시 만나게 됩니다.
        </Callout>
      </StepCard>

      <StepCard
        n={2} icon={BookOpen} tone="teal"
        title="개념 학습"
        badge="가장 중요한 단계"
      >
        <p style={{ margin: "0 0 12px" }}>
          각 차시의 개념 학습에는 <b style={{ color: UI.ink }}>실제 시험에 나오는 문제들을 개념 안에 충분히 풀어</b> 이해하기 쉽게 설명해 두었습니다.
          훑어보지 말고 <b style={{ color: UI.ink }}>한 줄도 빠뜨리지 말고 꼼꼼히</b> 읽어 주세요.
        </p>
        <Callout tone="lime" icon={Lightbulb}>
          여기서 다루는 예제가 곧 시험 문제의 원형입니다. <b>개념을 대충 넘기면 뒤의 실습·퀴즈·실전 모드가 모두 무너집니다.</b> 정독이 곧 합격의 지름길입니다.
        </Callout>
      </StepCard>

      <StepCard
        n={3} icon={Upload} tone="teal"
        title="엑셀 실습"
        badge="차시 개념 학습 후"
      >
        <p style={{ margin: "0 0 12px" }}>
          개념을 익힌 뒤에는 실제 엑셀 문제로 직접 실습합니다. 문제를 풀고 나면 순서가 중요합니다.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "0 0 12px" }}>
          <MiniStep icon={Save} label="값을 저장" />
          <ChevronRight size={16} color={UI.faint} />
          <MiniStep icon={Upload} label="채점용 파일 업로드" />
          <ChevronRight size={16} color={UI.faint} />
          <MiniStep icon={CheckCircle2} label="자동 채점" tone="green" />
        </div>
        <p style={{ margin: "0 0 12px" }}>
          반드시 <b style={{ color: UI.ink }}>값을 저장한 뒤</b> 채점을 위해 <b style={{ color: UI.ink }}>파일을 업로드</b>해야 합니다. 저장하지 않으면 채점되지 않습니다.
        </p>
        <Callout tone="amber" icon={AlertTriangle}>
          여기서 틀린 문제는 <b>다음 날 사전 점검 세션에서 다시 풀어야</b> 넘어갈 수 있습니다. 그러니 지금 <b>틀리지 않도록 꼼꼼히</b> 풀어 두는 편이 훨씬 편합니다.
        </Callout>
      </StepCard>

      <StepCard
        n={4} icon={PenLine} tone="teal"
        title="복습 퀴즈"
        badge="차시 마무리"
      >
        <p style={{ margin: "0 0 12px" }}>
          차시의 마지막은 퀴즈입니다. 그날 수업에서 <b style={{ color: UI.ink }}>꼭 알아야 할 중요한 개념들로만</b> 문제를 구성했습니다.
          개념을 꼼꼼히 읽었다면 어렵지 않게 풀 수 있습니다.
        </p>
        <Callout tone="lime" icon={Lightbulb}>
          채점을 하면 <b>틀린 문제마다 해설</b>이 붙습니다. 반드시 해설을 읽고 왜 틀렸는지 확인하세요. 이 오답 역시 다음 날 사전 점검에서 다시 만납니다.
        </Callout>
      </StepCard>

      {/* ── 7일 이후: 실전 모드 */}
      <div style={{ background: UI.tealCard, borderRadius: UI.rLg, padding: "26px 24px", margin: "8px 0 26px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: UI.rMd, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={22} strokeWidth={2} color={UI.lime} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: UI.lime, letterSpacing: 0.4 }}>7일 완주 이후</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>실전 모드</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "#dfeee7" }}>
          7일간의 학습을 모두 마치면 <b style={{ color: "#fff" }}>실전 모드</b>가 열립니다. 배운 개념들이 <b style={{ color: "#fff" }}>실제 시험에서 어떻게 출제되는지</b>,
          모의고사를 직접 풀어 보며 시험 감각을 익히는 단계입니다. 여기까지 오면 합격까지 한 걸음입니다.
        </p>
      </div>

      {/* ── 시작 CTA */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => onStart?.()}
          style={{ background: UI.teal, color: "#fff", border: "none", padding: "14px 26px", borderRadius: UI.rMd, fontSize: 15.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9, fontFamily: UI.font }}
        >
          1일차 1차시 시작하기 <ArrowRight size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

const ulStyle = { margin: "0 0 12px", paddingLeft: 18, color: UI.mut, fontSize: 14.5, lineHeight: 1.9 };

const TONES = {
  teal: { bg: UI.tealSoft, fg: UI.teal, line: UI.line },
  amber: { bg: "#fbf1dd", fg: UI.warn, line: "#f0dca8" },
  lime: { bg: UI.limeSoft, fg: "#5a7a12", line: "#d8ecae" },
  green: { bg: UI.greenSoft, fg: UI.green, line: UI.greenLine },
};

function FlowPill({ icon: Icon, label, sub, tone = "teal" }) {
  const t = TONES[tone];
  return (
    <div style={{ flex: "1 1 120px", minWidth: 120, background: t.bg, border: `1px solid ${t.line}`, borderRadius: UI.rMd, padding: "14px 10px", textAlign: "center" }}>
      <Icon size={22} strokeWidth={2} color={t.fg} />
      <div style={{ fontSize: 14, fontWeight: 700, color: UI.ink, marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: UI.mut, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      <ArrowRight size={18} strokeWidth={2} color={UI.faint} />
    </div>
  );
}

function MiniStep({ icon: Icon, label, tone = "teal" }) {
  const t = TONES[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: t.bg, border: `1px solid ${t.line}`, color: UI.ink, fontSize: 13, fontWeight: 600, padding: "7px 12px", borderRadius: UI.rMd }}>
      <Icon size={15} strokeWidth={2} color={t.fg} /> {label}
    </span>
  );
}

function StepCard({ n, icon: Icon, tone, title, badge, children }) {
  const t = TONES[tone];
  return (
    <div style={{ background: UI.surface, border: `1px solid ${UI.line}`, borderRadius: UI.rLg, padding: "22px 22px", marginBottom: 14, display: "flex", gap: 16 }}>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: UI.rMd, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={24} strokeWidth={2} color={t.fg} />
        </div>
        <div style={{ fontFamily: UI.mono, fontSize: 12, fontWeight: 700, color: UI.faint }}>STEP {n}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: UI.ink }}>{title}</h3>
          {badge && (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: t.fg, background: t.bg, border: `1px solid ${t.line}`, padding: "3px 10px", borderRadius: UI.rPill }}>{badge}</span>
          )}
        </div>
        <div style={{ color: UI.mut, fontSize: 14.5, lineHeight: 1.75 }}>{children}</div>
      </div>
    </div>
  );
}

function Callout({ tone = "lime", icon: Icon, children }) {
  const t = TONES[tone];
  return (
    <div style={{ display: "flex", gap: 10, background: t.bg, border: `1px solid ${t.line}`, borderRadius: UI.rMd, padding: "12px 14px" }}>
      <Icon size={18} strokeWidth={2} color={t.fg} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 14, lineHeight: 1.7, color: UI.ink }}>{children}</div>
    </div>
  );
}
