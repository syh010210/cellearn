// 16차시 — 시나리오 관리자 애니메이션.
// 핵심: 변경 셀(입력)을 여러 값으로 바꾼 '시나리오'들을 만들고,
//       결과 셀(출력)이 어떻게 달라지는지 '시나리오 요약' 보고서로 비교한다.
//  · 셀 이름을 먼저 정의하면 요약 보고서에 이름이 그대로 표시된다.
import { useState } from 'react';
import { Wrap, Title, Subtitle, C, ExcelGrid, ProblemBox, TableCaption } from './shared.jsx';

function StepChip({ n, label, active, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: active ? C.blueDim : C.bgDark,
      border: `1px solid ${active ? C.blueDim : C.border}`,
      color: active ? '#fff' : done ? C.green : C.textMuted,
      borderRadius: 999, padding: '7px 13px', fontSize: 13, fontWeight: 700,
      transition: 'all .25s', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none',
    }}>
      <span>{done ? '✓' : n}</span><span>{label}</span>
    </button>
  );
}

const STEPS = [
  { label: '셀 이름 정의', desc: "변경 셀 I21을 '이익률', 결과 셀 I19를 '순이익합계'로 이름 정의합니다. → 요약 보고서에 이름이 그대로 표시됩니다." },
  { label: '시나리오: 이익률 증가', desc: "[추가] → 이름 '이익률 증가', 변경 셀 = 이익률(I21), 값 = 35%(0.35)." },
  { label: '시나리오: 이익률 감소', desc: "[추가] → 이름 '이익률 감소', 변경 셀 = 이익률(I21), 값 = 25%(0.25)." },
  { label: '요약 보고서', desc: "[요약] → 결과 셀 = 순이익합계(I19). 원본 왼쪽에 '시나리오 요약' 시트가 자동 생성됩니다." },
];

export function ScenarioFlowAnim() {
  const [slot, setSlot] = useState(0);
  const scen1 = slot >= 1, scen2 = slot >= 2, summary = slot >= 3;

  const ScenCard = ({ show, title, val, color, bg }) => (
    <div style={{
      background: bg, border: `1.5px solid ${show ? color : C.border}`, borderRadius: 10,
      padding: '10px 14px', opacity: show ? 1 : 0.35, transition: 'all .4s', minWidth: 150,
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: show ? color : C.textDim, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.textMuted }}>변경 셀: <b style={{ color: C.text }}>이익률</b></div>
      <div style={{ fontSize: 12.5, color: C.textMuted }}>값: <b style={{ color: show ? color : C.textDim }}>{val}</b></div>
    </div>
  );

  return (
    <Wrap>
      <Title>시나리오 관리자 — '만약 이렇게 된다면?'</Title>
      <Subtitle>변경 셀의 값을 바꾼 시나리오들을 만들고, 결과 셀의 변화를 요약 보고서로 비교합니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        {STEPS[slot].desc}
      </div>

      {/* 흐름: 변경 셀 → 시나리오들 → 결과 셀 */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ background: C.amberBg, border: `1.5px solid ${C.amber}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.amberLight, fontWeight: 700 }}>변경 셀 (입력)</div>
          <div style={{ fontSize: 15, color: C.amber, fontWeight: 800 }}>이익률 · I21</div>
        </div>
        <span style={{ color: C.textDim, fontSize: 22 }}>→</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ScenCard show={scen1} title="이익률 증가" val="35%" color={C.green} bg={C.greenBg} />
          <ScenCard show={scen2} title="이익률 감소" val="25%" color={C.red} bg={C.redBg} />
        </div>
        <span style={{ color: C.textDim, fontSize: 22 }}>→</span>
        <div style={{ background: C.purpleBg, border: `1.5px solid ${C.purple}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.purpleLight, fontWeight: 700 }}>결과 셀 (출력)</div>
          <div style={{ fontSize: 15, color: C.purpleLight, fontWeight: 800 }}>순이익합계 · I19</div>
        </div>
      </div>

      {/* 요약 보고서 */}
      {summary && (
        <div style={{ marginTop: 16, animation: 'scFade .5s ease' }}>
          <style>{'@keyframes scFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6, textAlign: 'center' }}>▼ 시나리오 요약 (자동 생성 시트)</div>
          <div style={{ maxWidth: 460, margin: '0 auto', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', fontSize: 13 }}>
            {[
              ['', '현재 값', '이익률 증가', '이익률 감소', '#0b1220', C.textDim],
              ['변경 셀: 이익률', '30%', '35%', '25%', C.amberBg, C.amberLight],
              ['결과 셀: 순이익합계', '900', '1,050', '750', C.purpleBg, C.purpleLight],
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr' }}>
                {row.slice(0, 4).map((v, ci) => (
                  <div key={ci} style={{
                    borderRight: ci === 3 ? 'none' : `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                    padding: '7px 9px', background: row[4], color: ci === 0 ? row[5] : C.text,
                    fontWeight: ci === 0 || ri === 0 ? 700 : 400, textAlign: ci === 0 ? 'left' : 'center',
                  }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Wrap>
  );
}

// ── 실전 문제: 이익률 변동 시나리오 ──
export function ScenarioExamProblem() {
  const src = [
    ['제품 매출 현황', '', ''],
    ['제품', '매출액', '순이익'],
    ['A제품', '12,000,000', '3,600,000'],
    ['B제품', '8,000,000', '2,400,000'],
    ['C제품', '10,000,000', '3,000,000'],
    ['이익률', '30%', ''],
    ['순이익합계', '', '9,000,000'],
  ];
  const srcStyle = (ri, ci, val) => {
    if (ri === 0) return { bg: '#0b1220', color: C.textDim, bold: true };
    if (ri === 1) return { bg: '#111c33', color: C.blueLight, bold: true, align: 'center' };
    if (ri === 5) return ci === 0 ? { bg: C.amberBg, color: C.amberLight, bold: true } : ci === 1 ? { bg: C.amberBg, color: C.amber, bold: true } : {};
    if (ri === 6) return ci === 0 ? { bg: C.purpleBg, color: C.purpleLight, bold: true } : ci === 2 ? { bg: C.purpleBg, color: C.purpleLight, bold: true } : {};
    if (ci === 0) return { color: C.textMuted };
    return { color: C.text };
  };
  const summary = [
    ['시나리오 요약', '현재 값', '이익률 증가', '이익률 감소'],
    ['변경 셀: 이익률', '30%', '35%', '25%'],
    ['결과 셀: 순이익합계', '9,000,000', '10,500,000', '7,500,000'],
  ];
  const sumStyle = (ri, ci) => {
    if (ri === 0) return { bg: '#0b1220', color: ci === 0 ? C.green : C.blueLight, bold: true, align: 'center' };
    if (ri === 1) return ci === 0 ? { bg: C.amberBg, color: C.amberLight, bold: true } : { bg: C.amberBg, color: C.amber, align: 'center' };
    return ci === 0 ? { bg: C.purpleBg, color: C.purpleLight, bold: true } : { bg: C.purpleBg, color: C.purpleLight, bold: true, align: 'center' };
  };
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (시나리오)</Title>
      <ProblemBox>
        <b style={{ color: C.amber }}>이익률</b>(현재 30%)이 <b>35%로 오를 때('이익률 증가')</b>와 <b>25%로 내릴 때('이익률 감소')</b>
        <b style={{ color: C.purpleLight }}> 순이익합계</b>가 어떻게 달라지는지 시나리오 요약을 작성하시오.
      </ProblemBox>

      <TableCaption>▼ 원본 (이익률=변경 셀, 순이익합계=결과 셀)</TableCaption>
      <ExcelGrid data={src} startRow={1} cellStyle={srcStyle} minColW={92} firstColW={82} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 8px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.amberLight }}>풀이</span>
        <span style={{ fontSize: 13, color: C.textMuted }}>
          이익률·순이익합계 <b>이름 정의</b> → [데이터]→[가상 분석]→[시나리오 관리자] → [추가]로 '이익률 증가'(35%)·'이익률 감소'(25%) → [요약] 결과 셀=순이익합계
        </span>
      </div>

      <TableCaption color={C.green}>▼ 완성 결과 (시나리오 요약)</TableCaption>
      <ExcelGrid data={summary} startRow={1} cellStyle={sumStyle} minColW={104} firstColW={128} />
    </Wrap>
  );
}

// 시나리오 vs 목표값 찾기 vs 데이터 표 — 가상 분석 3형제 비교
export function WhatIfCompareDiagram() {
  const rows = [
    ['데이터 표', '한두 변수를 여러 값으로', '표로 한꺼번에', C.blue],
    ['목표값 찾기', '결과를 정해 두고', '입력값 하나를 거꾸로', C.green],
    ['시나리오', '변경 셀 상황(집합)마다', '요약 보고서로 비교', C.purple],
  ];
  return (
    <Wrap>
      <Title>가상 분석 3형제 — 무엇이 다른가</Title>
      <Subtitle>모두 [데이터] → [예측] → [가상 분석] 안에 있습니다</Subtitle>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', maxWidth: 620, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.6fr', background: '#0b1220' }}>
          {['기능', '주는 것', '얻는 것'].map((h) => (
            <div key={h} style={{ padding: '8px 12px', color: C.blueLight, fontWeight: 700, fontSize: 13, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{h}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1.6fr' }}>
            <div style={{ padding: '9px 12px', color: r[3], fontWeight: 800, fontSize: 14, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{r[0]}</div>
            <div style={{ padding: '9px 12px', color: C.textMuted, fontSize: 13, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{r[1]}</div>
            <div style={{ padding: '9px 12px', color: C.text, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{r[2]}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13.5, color: C.amberLight }}>
        💡 시나리오는 결과 셀을 <b>Ctrl로 여러 개</b> 선택할 수 있습니다. (예: 상반기 수입 + 하반기 수입)
      </div>
    </Wrap>
  );
}
