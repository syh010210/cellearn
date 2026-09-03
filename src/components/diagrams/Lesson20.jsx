// 20차시 — 차트 애니메이션.
// 핵심: 차트 구성 요소(제목·축·범례·데이터 레이블 등)의 이름과 위치를 익히고,
//       데이터 범위를 수정하는 세 가지 방법을 안다.
import { useState } from 'react';
import { Wrap, Title, Subtitle, C, ExcelGrid, ProblemBox, TableCaption } from './shared.jsx';

// 차트 각 요소를 번호로 짚어 주는 다이어그램 (막대 차트 목업)
export function ChartAnatomyDiagram() {
  const bars = [
    { label: '청바지', v: 80, color: C.blue },
    { label: '셔츠', v: 60, color: C.green },
    { label: '반바지', v: 95, color: C.amber },
    { label: '치마', v: 45, color: C.purple },
  ];
  const maxH = 120;
  const parts = [
    ['①', '차트 제목', '차트 맨 위 이름. =A1 로 셀과 연동 가능'],
    ['②', '세로(값) 축 · 축 제목', '값의 눈금과 축 이름. 텍스트 방향 세로 지정 가능'],
    ['③', '데이터 계열 / 요소', '같은 색 막대 묶음이 계열, 막대 하나가 요소'],
    ['④', '데이터 레이블', '막대에 표시하는 값 · 항목 이름'],
    ['⑤', '범례', '계열의 색과 이름 안내. 위치(아래 등) 지정'],
    ['⑥', '그림 영역 / 눈금선', '막대가 그려지는 안쪽 영역과 보조선'],
  ];
  return (
    <Wrap>
      <Title>차트의 구성 요소</Title>
      <Subtitle>이름과 위치를 알면 '무엇을 클릭해 서식을 줄지' 바로 찾을 수 있습니다</Subtitle>

      {/* 차트 목업 */}
      <div style={{ maxWidth: 460, margin: '0 auto 16px', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px 10px' }}>
        {/* ① 제목 */}
        <div style={{ textAlign: 'center', color: C.text, fontWeight: 800, fontSize: 15, marginBottom: 10 }}>
          <span style={{ color: C.blueLight }}>①</span> 의류 판매 현황
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* ② 세로축 제목 */}
          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: C.textMuted, fontSize: 12, fontWeight: 700, textAlign: 'center' }}>
            ② 판매량
          </div>
          {/* 그림 영역 + 막대 */}
          <div style={{ flex: 1, position: 'relative', borderLeft: `1px solid ${C.textSlate}`, borderBottom: `1px solid ${C.textSlate}`, paddingTop: 18 }}>
            {/* ⑥ 눈금선 */}
            {[0.33, 0.66, 1].map((g, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${g * maxH + 24}px`, borderTop: `1px dashed ${C.border}` }} />
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: maxH, position: 'relative' }}>
              {bars.map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                  {/* ④ 데이터 레이블 */}
                  <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 2 }}>{i === 0 ? '④ ' : ''}{b.v}</div>
                  <div style={{ width: 26, height: (b.v / 100) * maxH, background: b.color, borderRadius: '3px 3px 0 0' }} title={b.label} />
                </div>
              ))}
            </div>
            {/* x 항목 */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
              {bars.map((b, i) => <div key={i} style={{ width: '20%', textAlign: 'center', fontSize: 11, color: C.textMuted }}>{b.label}</div>)}
            </div>
            {/* ③ 계열 표시 */}
            <div style={{ position: 'absolute', top: 0, right: 2, fontSize: 11, color: C.greenLight }}>③ 계열</div>
            <div style={{ position: 'absolute', bottom: 40, right: 2, fontSize: 11, color: C.textDim }}>⑥ 그림 영역</div>
          </div>
        </div>
        {/* ⑤ 범례 */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10, fontSize: 11, color: C.textMuted, flexWrap: 'wrap' }}>
          <span style={{ color: C.blueLight, fontWeight: 700 }}>⑤ 범례:</span>
          {bars.map((b, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: b.color, borderRadius: 2, display: 'inline-block' }} />{b.label}
            </span>
          ))}
        </div>
      </div>

      {/* 요소 설명 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.blueLight }}>{p[0]} {p[1]}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.45 }}>{p[2]}</div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// ── 실전 문제: 의류 판매 현황 차트 ──
export function ChartExamProblem() {
  const src = [
    ['의류 판매 현황', '', ''],
    ['품목', '상반기', '하반기'],
    ['청바지', '80', '95'],
    ['셔츠', '60', '72'],
    ['반바지', '95', '88'],
    ['치마', '45', '60'],
  ];
  const style = (ri, ci) => {
    if (ri === 0) return { bg: '#0b1220', color: C.textDim, bold: true };
    if (ri === 1) return { bg: '#111c33', color: C.blueLight, bold: true, align: 'center' };
    if (ci === 0) return { color: C.textMuted };
    return { color: C.text, align: 'center' };
  };
  const tasks = [
    ['차트 제목', "셀과 연동 → 제목 선택 후 수식 입력줄에 =A1", C.blue],
    ['범례', '아래쪽으로 이동 ([차트 요소] → [범례] → 아래쪽)', C.green],
    ['데이터 레이블', "'상반기' 계열에 값 표시 (바깥쪽 끝)", C.amber],
    ['세로축 눈금', '기본 단위 20으로, 최댓값 100', C.purple],
    ['차트 영역', '둥근 모서리 + 그림자(바깥쪽 오프셋 가운데)', C.orange],
  ];
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (차트)</Title>
      <ProblemBox>
        아래 표로 만든 <b>묶은 세로 막대형</b> 차트를 다음 지시대로 수정하시오. (차트는 이미 삽입되어 있음)
      </ProblemBox>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <ExcelGrid data={src} startRow={1} cellStyle={style} minColW={64} firstColW={72} />
      </div>

      <TableCaption color={C.amber}>▼ 지시 사항과 푸는 위치 (하나씩 클릭해 서식 적용)</TableCaption>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.bgDark, border: `1px solid ${C.border}`, borderLeft: `4px solid ${t[2]}`, borderRadius: 8, padding: '9px 14px' }}>
            <div style={{ minWidth: 96, fontSize: 13.5, fontWeight: 800, color: t[2] }}>{t[0]}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{t[1]}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13, color: C.amberLight }}>
        💡 각 요소를 <b>정확히 클릭해 선택</b>한 뒤 오른쪽 클릭 → [○○ 서식]에서 지시대로 지정하는 것이 핵심입니다.
      </div>
    </Wrap>
  );
}

// 데이터 범위 수정 3가지 방법 (탭으로 전환)
const METHODS = [
  {
    tab: '① 드래그로 조정',
    desc: '차트를 클릭하면 원본에 색 테두리(항목=보라, 값=파랑)가 생깁니다. 파란 테두리 모서리에 마우스를 대면 ↕↔ 화살표가 되고, 이때 드래그해 포함할 범위를 늘리거나 줄입니다.',
    tip: '가장 빠르지만, 연속된 범위를 더하고 뺄 때 좋습니다.',
  },
  {
    tab: '② 데이터 선택 메뉴',
    desc: "차트 오른쪽 클릭 → [데이터 선택]. 계열/항목 목록에서 필요 없는 것을 골라 [제거]합니다. 가로 항목을 지우려면 '행/열 전환'을 쓰기도 합니다.",
    tip: '특정 계열 · 항목을 콕 집어 제거할 때 확실합니다.',
  },
  {
    tab: '③ 범위 직접 선택',
    desc: "[데이터 선택]에서 '차트 데이터 범위'를 지운 뒤, 제목과 함께 원하는 항목만 다시 드래그합니다. 떨어진 범위는 Ctrl을 누른 채 추가 선택합니다.",
    tip: '문제 그림과 똑같은 색 · 순서로 다시 만들 때 가장 정확합니다.',
  },
];

export function ChartDataRangeDiagram() {
  const [t, setT] = useState(0);
  return (
    <Wrap>
      <Title>데이터 범위 수정 — 3가지 방법</Title>
      <Subtitle>차트에 넣을 항목 · 계열을 더하거나 빼는 방법. 상황에 맞게 고르세요</Subtitle>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {METHODS.map((m, i) => (
          <button key={i} onClick={() => setT(i)} style={{
            background: t === i ? C.blueDim : C.bgDark, border: `1px solid ${t === i ? C.blueDim : C.border}`,
            color: t === i ? '#fff' : C.textMuted, borderRadius: 999, padding: '7px 14px', fontSize: 13,
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: t === i ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none',
          }}>{METHODS[i].tab}</button>
        ))}
      </div>
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', minHeight: 110 }}>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.7 }}>{METHODS[t].desc}</div>
        <div style={{ marginTop: 10, fontSize: 13, color: C.greenLight, fontWeight: 700 }}>👍 {METHODS[t].tip}</div>
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13, color: C.amberLight }}>
        💡 차트 제목 · 축 제목은 요소를 선택하고 <b>수식 입력줄에 =셀주소</b>(예: =A1)를 넣으면 셀과 연동됩니다.
      </div>
    </Wrap>
  );
}
