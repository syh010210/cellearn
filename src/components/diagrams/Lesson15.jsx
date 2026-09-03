// 15차시 — 데이터 표(What-if) 애니메이션.
// 핵심 3가지:
//  1) 결과 수식을 '제목 행 × 왼쪽 열'이 만나는 모서리에 연동한다.
//  2) [데이터] → [예측] → [가상 분석] → [데이터 표].
//  3) 행 입력 셀 = 가로(제목 행) 변수의 원본 셀, 열 입력 셀 = 세로(왼쪽 열) 변수의 원본 셀.
import { useState } from 'react';
import { Wrap, Title, Subtitle, C, ExcelGrid, ProblemBox, TableCaption } from './shared.jsx';

const PERIODS = ['1년', '2년', '3년'];      // 제목 행(가로) = 기간
const RATES = ['2%', '3%', '4%'];           // 왼쪽 열(세로) = 이율
// 만기액(만원) = 원금 100 × (1 + 이율×기간) 로 단순화
const RATE_NUM = [0.02, 0.03, 0.04];
const PERIOD_NUM = [1, 2, 3];
const maturity = (ri, ci) => Math.round(100 * (1 + RATE_NUM[ri] * PERIOD_NUM[ci]));

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
  { label: '① 결과 수식 연동', desc: "모서리(제목 행 × 왼쪽 열이 만나는 칸)에 만기액 결과 수식 '=B2'를 연동합니다." },
  { label: '② 범위 선택', desc: '결과 수식이 있는 모서리부터 표 전체(기간 · 이율 · 빈 칸)를 드래그해 선택합니다.' },
  { label: '③ 데이터 표 실행', desc: '[데이터] → [예측] → [가상 분석] → [데이터 표]를 엽니다.' },
  { label: '④ 입력 셀 지정', desc: '행 입력 셀 = 기간(가로) 원본, 열 입력 셀 = 이율(세로) 원본을 선택 → 확인.' },
];

export function DataTableTwoVarAnim() {
  const [slot, setSlot] = useState(0);
  const cell = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: 34, fontSize: 13, padding: '4px 6px', whiteSpace: 'nowrap',
  };
  const filled = slot >= 4;   // 결과가 채워지는 단계
  const cornerLit = slot >= 1;
  const rangeLit = slot >= 2;

  return (
    <Wrap>
      <Title>데이터 표 — 두 변수(기간 × 이율)로 만기액 예측</Title>
      <Subtitle>결과 수식을 모서리에 연동하고, 행 · 열 입력 셀만 지정하면 표 전체가 자동으로 채워집니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label.replace(/^[①②③④]\s/, '')} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        {STEPS[slot].desc}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          {/* 헤더행: 모서리(결과수식) + 기간 */}
          <div style={{ display: 'grid', gridTemplateColumns: '82px 66px 66px 66px' }}>
            <div style={{
              ...cell,
              background: cornerLit ? C.purpleBg : '#0b1220',
              color: C.purpleLight, fontWeight: 800,
              boxShadow: cornerLit ? `inset 0 0 0 2px ${C.purple}` : 'none',
            }}>
              {cornerLit ? '=B2' : '결과'}
            </div>
            {PERIODS.map((p) => (
              <div key={p} style={{ ...cell, background: C.blueBg, color: C.blueLight, fontWeight: 700 }}>{p}</div>
            ))}
          </div>
          {/* 이율(세로) × 결과 */}
          {RATES.map((r, ri) => (
            <div key={r} style={{ display: 'grid', gridTemplateColumns: '82px 66px 66px 66px' }}>
              <div style={{ ...cell, background: C.greenBg, color: C.greenLight, fontWeight: 700 }}>{r}</div>
              {PERIODS.map((p, ci) => (
                <div key={ci} style={{ ...cell, color: filled ? C.text : C.textDim, fontWeight: filled ? 700 : 400, transition: 'all .4s' }}>
                  {filled ? maturity(ri, ci) : '·'}
                </div>
              ))}
            </div>
          ))}

          {/* 범위 선택 오버레이 */}
          {rangeLit && !filled && (
            <div style={{ position: 'absolute', inset: 0, border: `2px dashed ${C.blue}`, borderRadius: 6, pointerEvents: 'none' }} />
          )}
        </div>
      </div>

      {/* 입력 셀 설명 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <div style={{ background: C.blueBg, border: `1px solid ${C.blueDim}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: C.blueLight, fontWeight: 700 }}>
          행 입력 셀 = 기간(가로) 원본 셀
        </div>
        <div style={{ background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, color: C.greenLight, fontWeight: 700 }}>
          열 입력 셀 = 이율(세로) 원본 셀
        </div>
      </div>
    </Wrap>
  );
}

// ── 실전 문제: 셔틀콕 매출액 데이터 표 (실제 시험 데이터) ──
// 매출액 = 판매가격(15000) × 판매수량 × (1 - 할인율)
const DT_QTYS = ['5', '6', '7', '8', '9', '10'];
const DT_RATES = ['0.5%', '1%', '1.5%', '2%', '2.5%', '3%', '3.5%', '4%'];
const DT_GRID = [
  ['74,625', '89,550', '104,475', '119,400', '134,325', '149,250'],
  ['74,250', '89,100', '103,950', '118,800', '133,650', '148,500'],
  ['73,875', '88,650', '103,425', '118,200', '132,975', '147,750'],
  ['73,500', '88,200', '102,900', '117,600', '132,300', '147,000'],
  ['73,125', '87,750', '102,375', '117,000', '131,625', '146,250'],
  ['72,750', '87,300', '101,850', '116,400', '130,950', '145,500'],
  ['72,375', '86,850', '101,325', '115,800', '130,275', '144,750'],
  ['72,000', '86,400', '100,800', '115,200', '129,600', '144,000'],
];

export function DataTableExamProblem() {
  // 표 구성: E3 모서리(=매출액 연동), F3:K3 = 판매수량(가로), E4:E11 = 할인율(세로)
  const head = ['=B5', ...DT_QTYS];           // 모서리 + 판매수량
  const body = DT_RATES.map((r, i) => [r, ...DT_GRID[i]]);
  const data = [head, ...body];
  const style = (ri, ci) => {
    if (ri === 0 && ci === 0) return { bg: C.purpleBg, color: C.purpleLight, bold: true, align: 'center' };
    if (ri === 0) return { bg: C.blueBg, color: C.blueLight, bold: true, align: 'center' };  // 판매수량(가로)
    if (ci === 0) return { bg: C.greenBg, color: C.greenLight, bold: true, align: 'center' }; // 할인율(세로)
    return { color: C.text };
  };
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (데이터 표)</Title>
      <ProblemBox>
        판매가격 15,000원, 매출액 <b>=판매가격×판매수량×(1−할인율)</b>일 때,
        <b style={{ color: C.blueLight }}> 판매수량(5~10)</b>과 <b style={{ color: C.greenLight }}>할인율(0.5%~4%)</b> 변화에 따른
        <b style={{ color: C.purpleLight }}> 매출액</b>을 데이터 표로 계산하시오.
      </ProblemBox>

      <TableCaption>▼ 원본 입력값</TableCaption>
      <ExcelGrid
        data={[['셔틀콕 매출액', ''], ['판매가격', '15,000'], ['판매수량', '6'], ['할인율', '2.5%'], ['매출액', '87,750']]}
        startRow={1} cellStyle={(ri, ci) => ci === 0 ? { color: C.textMuted, bold: ri === 0 } : { color: ri === 4 ? C.purpleLight : C.text, bold: ri === 4 }}
        minColW={70} firstColW={82}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '14px 0 8px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.amberLight }}>풀이</span>
        <span style={{ fontSize: 13, color: C.textMuted }}>
          모서리 <b style={{ color: C.purpleLight }}>E3</b>에 <b>=B5</b> 연동 → E3:K11 전체 선택 → [데이터]→[가상 분석]→[데이터 표] →
          <b> 행 입력 셀=판매수량(B3)</b>, <b>열 입력 셀=할인율(B4)</b>
        </span>
      </div>

      <TableCaption color={C.green}>▼ 완성 결과 (E3 모서리 · 파랑=판매수량 · 초록=할인율)</TableCaption>
      <ExcelGrid data={data} startRow={3} startCol={4} cellStyle={style} minColW={66} firstColW={56} />
    </Wrap>
  );
}

// 결과 수식을 '어디에' 연동하는지 3가지 경우로 정리한 다이어그램
export function DataTablePlacementDiagram() {
  const cases = [
    {
      title: '두 변수 (행 × 열)',
      rule: '제목 행과 왼쪽 열이 만나는 모서리(왼쪽 위)에 연동',
      color: C.purple, colorBg: C.purpleBg,
      grid: [['★', '가로', '가로'], ['세로', '', ''], ['세로', '', '']],
    },
    {
      title: '한 변수 — 세로(왼쪽 열)만',
      rule: '변수 열의 오른쪽 한 칸 위에 결과를 연동. 열 입력 셀만 지정',
      color: C.green, colorBg: C.greenBg,
      grid: [['', '★'], ['세로', ''], ['세로', '']],
    },
    {
      title: '한 변수 — 가로(제목 행)만',
      rule: '변수 행의 왼쪽 아래 한 칸에 결과를 연동. 행 입력 셀만 지정',
      color: C.blue, colorBg: C.blueBg,
      grid: [['', '가로', '가로'], ['★', '', '']],
    },
  ];
  const cell = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `1px solid ${C.border}`, minHeight: 26, minWidth: 40, fontSize: 12,
  };
  return (
    <Wrap>
      <Title>결과 수식을 '어디에' 연동하나</Title>
      <Subtitle>★ = 결과 수식 위치. 변수 값들과 만나는 자리에 결과를 붙입니다</Subtitle>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {cases.map((c, i) => (
          <div key={i} style={{ background: C.bgDark, border: `1.5px solid ${c.color}`, borderRadius: 10, padding: '12px 14px', width: 250 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: c.color, marginBottom: 8 }}>{c.title}</div>
            <div style={{ display: 'inline-block', marginBottom: 8 }}>
              {c.grid.map((row, ri) => (
                <div key={ri} style={{ display: 'flex' }}>
                  {row.map((v, ci) => (
                    <div key={ci} style={{
                      ...cell,
                      background: v === '★' ? c.colorBg : v ? C.bg : 'transparent',
                      color: v === '★' ? c.color : C.textMuted,
                      fontWeight: v === '★' ? 800 : 400,
                      borderColor: v === '★' ? c.color : C.border,
                    }}>{v === '★' ? '★' : v}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.55 }}>{c.rule}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 16, textAlign: 'center', fontSize: 13.5, color: C.amberLight }}>
        💡 데이터 표는 배열로 만들어져 <b>일부만 지울 수 없습니다</b>. 지우려면 결과 영역 전체를 드래그해 <b>Delete</b>.
      </div>
    </Wrap>
  );
}
