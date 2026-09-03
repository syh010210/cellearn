// 19차시 — 매크로 애니메이션.
// 핵심: 매크로는 '기록 시작 → 작업 수행 → 기록 중지'의 3단계.
//  · 기록한 매크로를 도형이나 양식 단추에 연결해 클릭으로 실행한다.
//  · 저장 위치는 '현재 통합 문서', 기록 전 표 밖 셀에서 시작.
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
  { icon: '⏺', label: '① 매크로 기록', color: C.red,
    desc: "[개발 도구] → [코드] → [매크로 기록]. 이름을 정하고 저장 위치를 '현재 통합 문서'로 → [확인]." },
  { icon: '⌨', label: '② 작업 수행', color: C.amber,
    desc: '문제에서 시킨 작업(수식 입력 후 자동 채우기, 서식 적용 등)을 한 번에 정확히 수행합니다.' },
  { icon: '⏹', label: '③ 기록 중지', color: C.green,
    desc: '[기록 중지]를 눌러 끝냅니다. 이제 이 매크로를 도형 · 단추에 연결하면 클릭으로 실행됩니다.' },
];

export function MacroRecordAnim() {
  const [slot, setSlot] = useState(0);
  return (
    <Wrap>
      <Title>매크로 — 기록 시작 · 작업 · 중지 3단계</Title>
      <Subtitle>작업 과정을 그대로 녹화해 두고, 필요할 때 클릭 한 번으로 다시 실행합니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label.replace(/^[①②③]\s/, '')} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      {/* 3단계 원형 흐름 */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: i === slot ? s.color : C.bgDark,
              border: `2px solid ${i <= slot ? s.color : C.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transition: 'all .35s', boxShadow: i === slot ? `0 0 0 5px ${s.color}22` : 'none',
            }}>
              <div style={{ fontSize: 26, color: i === slot ? '#fff' : s.color }}>{s.icon}</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: i === slot ? '#fff' : C.textMuted, marginTop: 2 }}>{s.label.replace(/^[①②③]\s/, '')}</div>
            </div>
            {i < STEPS.length - 1 && <span style={{ color: C.textDim, fontSize: 24 }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${STEPS[slot].color}`, borderRadius: 8, padding: '12px 16px', fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        <b style={{ color: STEPS[slot].color }}>{STEPS[slot].label}</b> — {STEPS[slot].desc}
      </div>
    </Wrap>
  );
}

// ── 실전 문제: 승점 계산 매크로 + 서식 매크로 ──
export function MacroExamProblem() {
  const src = [
    ['K리그 순위표', '', '', '', ''],
    ['팀명', '승', '무', '패', '승점'],
    ['FC서울', '12', '5', '3', '41'],
    ['수원', '10', '7', '3', '37'],
    ['전북', '9', '6', '5', '33'],
  ];
  const style = (ri, ci) => {
    if (ri === 0) return { bg: '#0b1220', color: C.textDim, bold: true };
    if (ri === 1) return { bg: '#111c33', color: C.blueLight, bold: true, align: 'center' };
    if (ci === 4) return { bg: C.greenBg, color: C.greenLight, bold: true, align: 'center' };
    if (ci === 0) return { color: C.textMuted };
    return { color: C.text, align: 'center' };
  };
  const macros = [
    { name: "'승점' 매크로", task: '[F3:F11]에 =승×3+무 입력 후 자동 채우기', shape: '십자형 도형에 연결', color: C.blue },
    { name: "'서식' 매크로", task: '[A2:E2]에 글꼴색 파랑 · 채우기 노랑 적용', shape: '둥근 모서리 사각형에 연결', color: C.purple },
  ];
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (매크로)</Title>
      <ProblemBox>
        아래 순위표에 <b style={{ color: C.blueLight }}>①승점 계산</b>과 <b style={{ color: C.purpleLight }}>②서식 적용</b> 두 매크로를 만들고,
        각각 <b>도형</b>에 연결하시오.
      </ProblemBox>

      <TableCaption>▼ 원본 데이터 (승점 F열 = 승×3 + 무)</TableCaption>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <ExcelGrid data={src} startRow={1} cellStyle={style} minColW={50} firstColW={72} />
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14, textAlign: 'center' }}>⋮ 이하 생략</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {macros.map((m, i) => (
          <div key={i} style={{ background: C.bgDark, border: `1.5px solid ${m.color}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.color, marginBottom: 6 }}>{i + 1}. {m.name}</div>
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.55 }}>
              <div>⏺ 기록 → <b>{m.task}</b> → ⏹ 중지</div>
              <div style={{ marginTop: 4, color: C.textMuted }}>🔗 {m.shape}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13, color: C.amberLight }}>
        💡 기록 시작 전 <b>표 밖 셀</b> 선택 · 저장 위치 <b>'현재 통합 문서'</b> · 도형은 <b>Alt 드래그</b>로 셀에 맞춤 → 오른쪽 클릭 [매크로 지정]
      </div>
    </Wrap>
  );
}

// 매크로 주의사항 + 도형/단추 연결
export function MacroConnectDiagram() {
  const cautions = [
    ['저장 위치는 ‘현재 통합 문서’', '개인용 매크로 통합 문서로 저장하면 채점이 안 됩니다.'],
    ['기록 전 표 밖 셀 선택', '표 안에서 시작하면 그 클릭까지 기록돼 결과가 어긋날 수 있습니다.'],
    ['불필요한 클릭 금지', '화면 이동 · 헛클릭도 모두 녹화되니 필요한 작업만 한 번에.'],
    ['실수하면 삭제 후 재기록', '[매크로] 목록에서 잘못된 매크로를 삭제하고 다시 기록합니다.'],
  ];
  return (
    <Wrap>
      <Title>매크로 주의사항 · 도형/단추 연결</Title>

      {/* 주의사항 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {cautions.map((c, i) => (
          <div key={i} style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 9, padding: '11px 13px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.amberLight, marginBottom: 3 }}>⚠ {c[0]}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>{c[1]}</div>
          </div>
        ))}
      </div>

      {/* 연결 흐름 */}
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.blueLight, marginBottom: 8, textAlign: 'center' }}>매크로를 실행 버튼에 연결하기</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          ['도형 또는 단추 삽입', 'Alt 드래그로 셀에 딱 맞춤', C.blue],
          ['오른쪽 → 매크로 지정', '(단추는 삽입 즉시 대화상자)', C.purple],
          ['만든 매크로 선택', '클릭하면 매크로 실행', C.green],
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: C.bg, border: `1.5px solid ${s[2]}`, borderRadius: 9, padding: '10px 12px', width: 150, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: s[2] }}>{s[0]}</div>
              <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 3 }}>{s[1]}</div>
            </div>
            {i < 2 && <span style={{ color: C.textDim, fontSize: 20 }}>→</span>}
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 16, textAlign: 'center', fontSize: 13, color: C.textMuted }}>
        도형은 <b style={{ color: C.text }}>[삽입] → [도형]</b>, 양식 단추는 <b style={{ color: C.text }}>[개발 도구] → [삽입] → [양식 컨트롤]</b>. <b style={{ color: C.amberLight }}>Alt를 누른 채 드래그</b>하면 셀 눈금에 착 달라붙습니다.
      </div>
    </Wrap>
  );
}
