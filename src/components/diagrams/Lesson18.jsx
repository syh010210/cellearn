// 18차시 — 목표값 찾기(Goal Seek) 애니메이션.
// 핵심: 결과(수식 셀)를 원하는 값으로 만들려면 입력(값을 바꿀 셀)을 얼마로 해야 하는지 거꾸로 계산.
//  3요소 = 수식 셀 / 찾는 값 / 값을 바꿀 셀 (문제도 항상 이 순서로 제시).
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
  { label: '3요소 파악', desc: '수식 셀 = 재고 비용(B5), 찾는 값 = 150,000, 값을 바꿀 셀 = 생산량(B3).' },
  { label: '대화상자 입력', desc: '[데이터] → [예측] → [가상 분석] → [목표값 찾기]. 세 칸을 순서대로 채웁니다.' },
  { label: '결과 확인', desc: '재고 비용이 150,000이 되려면 생산량은 2,500이어야 한다고 엑셀이 거꾸로 계산해 줍니다.' },
];

export function GoalSeekAnim() {
  const [slot, setSlot] = useState(0);
  const solved = slot >= 2;
  const dlg = slot >= 1;

  const Field = ({ label, val, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 92, fontSize: 12.5, color: C.textMuted, textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, background: '#0b1220', border: `1px solid ${color}`, borderRadius: 5, padding: '5px 9px', fontSize: 13, color, fontWeight: 700 }}>{val}</div>
    </div>
  );

  return (
    <Wrap>
      <Title>목표값 찾기 — 결과를 정해 놓고 입력을 거꾸로</Title>
      <Subtitle>수식 셀 · 찾는 값 · 값을 바꿀 셀 세 가지만 정확히 넣으면 됩니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        {STEPS[slot].desc}
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* 원본 표 (생산량 → 재고 비용) */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', minWidth: 200 }}>
          {[
            ['생산량 (B3)', solved ? '2,500' : '2,000', C.amber, solved],
            ['단가', '×  ...', C.textMuted, false],
            ['재고 비용 (B5)', solved ? '150,000' : '120,000', C.purpleLight, solved],
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
              <div style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, color: C.textMuted, background: '#0b1220' }}>{r[0]}</div>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: '8px 10px', fontSize: 13, textAlign: 'right', color: r[2], fontWeight: r[3] ? 800 : 600, transition: 'all .4s' }}>{r[1]}</div>
            </div>
          ))}
          <div style={{ padding: '6px 10px', fontSize: 11.5, color: C.textDim, background: C.bgDark }}>재고 비용 = 생산량 × 단가 (수식 셀)</div>
        </div>

        {/* 대화상자 */}
        <div style={{
          width: 260, background: '#0b1220', border: `1px solid ${dlg ? C.blueDim : C.border}`, borderRadius: 8,
          overflow: 'hidden', opacity: dlg ? 1 : 0.4, transition: 'all .4s',
        }}>
          <div style={{ background: C.blueBg, borderBottom: `1px solid ${C.blueDim}`, padding: '7px 12px', fontSize: 13, fontWeight: 800, color: C.blueLight }}>목표값 찾기</div>
          <div style={{ padding: '14px 14px 12px' }}>
            <Field label="수식 셀" val="B5 (재고 비용)" color={C.purpleLight} />
            <Field label="찾는 값" val="150000" color={C.green} />
            <Field label="값을 바꿀 셀" val="B3 (생산량)" color={C.amber} />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <span style={{ background: C.blueDim, color: '#fff', borderRadius: 5, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>확인</span>
            </div>
          </div>
        </div>
      </div>

      {solved && (
        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 14, color: C.green, fontWeight: 700, animation: 'gsFade .5s ease' }}>
          <style>{'@keyframes gsFade{from{opacity:0}to{opacity:1}}'}</style>
          ✓ 재고 비용 150,000 → 생산량 <b>2,500</b>
        </div>
      )}
    </Wrap>
  );
}

// ── 실전 문제: 프린터 판매 순이익 목표값 찾기 ──
export function GoalSeekExamProblem() {
  // before / after 두 상태를 토글로 비교
  const [after, setAfter] = useState(false);
  const rows = [
    ['프린터 판매 현황', '', '', ''],
    ['제품명', '단가', '판매량', '순이익'],
    ['레이저프린터', '250,000', after ? '40' : '32', after ? '1,800,000' : '1,440,000'],
  ];
  const style = (ri, ci) => {
    if (ri === 0) return { bg: '#0b1220', color: C.textDim, bold: true };
    if (ri === 1) return { bg: '#111c33', color: C.blueLight, bold: true, align: 'center' };
    if (ci === 2) return { bg: C.amberBg, color: C.amber, bold: true, align: 'center' };       // 판매량 = 값을 바꿀 셀
    if (ci === 3) return { bg: C.purpleBg, color: C.purpleLight, bold: true, align: 'center' }; // 순이익 = 수식 셀
    return { color: C.textMuted };
  };
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (목표값 찾기)</Title>
      <ProblemBox>
        레이저프린터의 <b style={{ color: C.purpleLight }}>순이익(I4)</b>이 <b style={{ color: C.green }}>1,800,000</b>이 되려면
        <b style={{ color: C.amber }}> 판매량(G4)</b>이 얼마가 되어야 하는지 목표값 찾기로 구하시오.
      </ProblemBox>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10 }}>
        {[['처음 상태', false], ['목표값 찾기 후', true]].map(([lab, v]) => (
          <button key={lab} onClick={() => setAfter(v)} style={{
            background: after === v ? C.blueDim : C.bgDark, border: `1px solid ${after === v ? C.blueDim : C.border}`,
            color: after === v ? '#fff' : C.textMuted, borderRadius: 999, padding: '6px 14px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{lab}</button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ExcelGrid data={rows} startRow={2} cellStyle={style} minColW={78} firstColW={104} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, maxWidth: 460, marginInline: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.amberLight }}>풀이 — [데이터]→[가상 분석]→[목표값 찾기]</div>
        {[
          ['수식 셀', '순이익 셀 (I4)', C.purpleLight],
          ['찾는 값', '1800000', C.green],
          ['값을 바꿀 셀', '판매량 셀 (G4)', C.amber],
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 96, fontSize: 12.5, color: C.textMuted, textAlign: 'right' }}>{r[0]}</div>
            <div style={{ flex: 1, background: '#0b1220', border: `1px solid ${r[2]}`, borderRadius: 5, padding: '5px 10px', fontSize: 13, color: r[2], fontWeight: 700 }}>{r[1]}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', fontSize: 14, color: C.green, fontWeight: 700, marginTop: 4 }}>→ 판매량이 <b>40</b>이 되면 순이익 1,800,000 달성 ✓</div>
      </div>
    </Wrap>
  );
}

// 수식 셀 / 찾는 값 / 값을 바꿀 셀 3요소 정의 + 예시 표
export function GoalSeekElementsDiagram() {
  const three = [
    { t: '수식 셀', d: '목표에 도달해야 할 셀. 항상 수식이 들어 있다.', color: C.purple, bg: C.purpleBg },
    { t: '찾는 값', d: '수식 셀이 되어야 할 목표 숫자(직접 입력).', color: C.green, bg: C.greenBg },
    { t: '값을 바꿀 셀', d: '목표를 맞추려고 엑셀이 바꿀 입력 셀.', color: C.amber, bg: C.amberBg },
  ];
  const ex = [
    ['재고 비용', '150,000', '생산량', '2,500'],
    ['순이익', '1,800,000', '판매량', '40'],
    ['평균', '60', '기말 국어', '50'],
  ];
  return (
    <Wrap>
      <Title>목표값 찾기 — 3요소</Title>
      <Subtitle>문제도 항상 '수식 셀 → 찾는 값 → 값을 바꿀 셀' 순서로 제시됩니다</Subtitle>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        {three.map((c, i) => (
          <div key={i} style={{ background: c.bg, border: `1.5px solid ${c.color}`, borderRadius: 10, padding: '12px 14px', width: 180 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: c.color, marginBottom: 5 }}>{i + 1}. {c.t}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>{c.d}</div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr', background: '#0b1220' }}>
          {['수식 셀', '찾는 값', '값을 바꿀 셀', '결과'].map((h) => (
            <div key={h} style={{ padding: '7px 10px', color: C.blueLight, fontWeight: 700, fontSize: 12.5, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>{h}</div>
          ))}
        </div>
        {ex.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr' }}>
            <div style={{ padding: '8px 10px', color: C.purpleLight, fontSize: 12.5, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>{r[0]}</div>
            <div style={{ padding: '8px 10px', color: C.green, fontSize: 12.5, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>{r[1]}</div>
            <div style={{ padding: '8px 10px', color: C.amber, fontSize: 12.5, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>{r[2]}</div>
            <div style={{ padding: '8px 10px', color: C.text, fontWeight: 700, fontSize: 12.5, borderBottom: `1px solid ${C.border}`, textAlign: 'center' }}>{r[3]}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13.5, color: C.amberLight }}>
        💡 '값을 바꿀 셀'은 <b>반드시 수식이 아닌 입력값 셀</b>이어야 합니다. 수식 셀을 지정하면 오류가 납니다.
      </div>
    </Wrap>
  );
}
