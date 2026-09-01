// 17차시 — 데이터 통합(Consolidate) 애니메이션.
// 핵심: 여러 표에 흩어진 데이터를 하나의 표로 모아 합계/평균/최대/최소를 계산.
//  · 결과 표의 '제목 행 + 왼쪽 열'을 선택하고 [데이터] → [통합].
//  · 참조 영역을 추가하고 '첫 행', '왼쪽 열'을 반드시 체크한다(항목 이름으로 매칭).
//  · 통합은 중복을 제외한 '고유값'을 알아서 찾아 계산한다.
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

const SRC = [
  { name: '표1 (서울)', rows: [['사과', 10], ['배', 5]] },
  { name: '표2 (부산)', rows: [['사과', 8], ['배', 7]] },
  { name: '표3 (대구)', rows: [['사과', 6], ['배', 9]] },
];
const RESULT = [['사과', 24], ['배', 21]];

const STEPS = [
  { label: '결과 영역 선택', desc: "결과가 나올 표의 '제목 행 + 왼쪽 열'을 함께 드래그해 선택합니다." },
  { label: '통합 열기·함수', desc: '[데이터] → [데이터 도구] → [통합]. 사용할 함수(여기서는 합계)를 고릅니다.' },
  { label: '참조 영역 추가', desc: '표1·표2·표3의 데이터를 제목과 함께 드래그해 [추가]로 하나씩 넣습니다.' },
  { label: "'첫 행'·'왼쪽 열' 체크", desc: "두 옵션을 반드시 체크 → [확인]. 항목 이름을 기준으로 고유값끼리 합쳐집니다." },
];

function MiniTable({ name, rows, dim }) {
  const cell = {
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    padding: '4px 8px', fontSize: 12, textAlign: 'center', minWidth: 40,
  };
  return (
    <div style={{ opacity: dim ? 0.4 : 1, transition: 'opacity .4s' }}>
      <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 3, textAlign: 'center' }}>{name}</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 46px' }}>
          <div style={{ ...cell, background: '#0b1220', color: C.blueLight, fontWeight: 700 }}>품목</div>
          <div style={{ ...cell, background: '#0b1220', color: C.blueLight, fontWeight: 700, borderRight: 'none' }}>수량</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 46px' }}>
            <div style={{ ...cell, color: C.textMuted }}>{r[0]}</div>
            <div style={{ ...cell, color: C.text, borderRight: 'none' }}>{r[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConsolidateAnim() {
  const [slot, setSlot] = useState(0);
  const refAdded = slot >= 2;
  const done = slot >= 3;

  return (
    <Wrap>
      <Title>데이터 통합 — 여러 표를 하나로</Title>
      <Subtitle>흩어진 표들을 항목 이름 기준으로 모아 합계·평균·최대·최소를 한 표에 계산합니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        {STEPS[slot].desc}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* 원본 3표 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SRC.map((t, i) => <MiniTable key={i} name={t.name} rows={t.rows} dim={slot < 2} />)}
        </div>

        <span style={{ color: C.textDim, fontSize: 24 }}>→</span>

        {/* 결과 표 */}
        <div>
          <div style={{ fontSize: 11.5, color: done ? C.green : C.textMuted, marginBottom: 3, textAlign: 'center', fontWeight: 700 }}>통합 결과 (합계)</div>
          <div style={{ border: `2px solid ${done ? C.green : C.blue}`, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '52px 46px' }}>
              <div style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '4px 8px', fontSize: 12, textAlign: 'center', background: C.greenBg, color: C.greenLight, fontWeight: 700 }}>품목</div>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: '4px 8px', fontSize: 12, textAlign: 'center', background: C.greenBg, color: C.greenLight, fontWeight: 700 }}>수량</div>
            </div>
            {RESULT.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 46px' }}>
                <div style={{ borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '4px 8px', fontSize: 12, textAlign: 'center', color: C.textMuted }}>{done ? r[0] : ''}</div>
                <div style={{ borderBottom: `1px solid ${C.border}`, padding: '4px 8px', fontSize: 12, textAlign: 'center', color: C.text, fontWeight: 700 }}>{done ? r[1] : '·'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 옵션 체크 표시 */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
        {['첫 행', '왼쪽 열'].map((o) => (
          <div key={o} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
            padding: '6px 14px', borderRadius: 8,
            background: refAdded ? C.greenBg : C.bgDark,
            border: `1px solid ${refAdded ? C.green : C.border}`,
            color: refAdded ? C.greenLight : C.textDim, transition: 'all .3s',
          }}>
            <span>{refAdded && slot >= 3 ? '☑' : '☐'}</span>{o}
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// ── 실전 문제: 수도권 판매량 합계 통합 (실제 시험 데이터) ──
const REG_HEAD = ['제품', '1분기', '2분기', '3분기', '4분기'];
const GYEONGGI = [['침대', '1,053', '967', '1,201', '1,138'], ['소파', '842', '935', '1,153', '1,219'], ['식탁', '1,168', '1,023', '934', '1,086'], ['책상', '1,325', '1,423', '1,254', '1,195']];
const INCHEON = [['침대', '984', '862', '1,082', '1,125'], ['소파', '673', '721', '621', '593'], ['식탁', '596', '676', '738', '862'], ['책상', '1,045', '1,254', '905', '1,079']];
const CONSOL_RESULT = [['침대', '3,287', '2,985', '3,657', '3,545'], ['소파', '2,472', '2,863', '2,771', '2,835'], ['식탁', '2,823', '2,953', '3,026', '3,220'], ['책상', '3,795', '4,315', '3,737', '3,913']];

export function ConsolidateExamProblem() {
  const headStyle = (ri, ci) => ri === 0
    ? { bg: ci === 0 ? '#0b1220' : C.blueBg, color: ci === 0 ? C.textDim : C.blueLight, bold: true, align: 'center' }
    : (ci === 0 ? { bg: C.greenBg, color: C.greenLight, bold: true } : { dim: true });
  const resStyle = (ri, ci) => ri === 0
    ? { bg: ci === 0 ? '#0b1220' : C.blueBg, color: ci === 0 ? C.textDim : C.blueLight, bold: true, align: 'center' }
    : (ci === 0 ? { bg: C.greenBg, color: C.greenLight, bold: true } : { color: C.text, bold: true });
  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (데이터 통합)</Title>
      <ProblemBox>
        [표1]경기 · [표2]인천 · [표3]서울의 분기별 판매량을 이용하여, 제품별 분기별
        <b style={{ color: C.purpleLight }}> 판매량 합계</b>를 [표4] <b>수도권 판매량 합계</b>에 통합하시오.
      </ProblemBox>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <TableCaption>▼ [표1] 경기지역</TableCaption>
          <ExcelGrid data={[REG_HEAD, ...GYEONGGI]} startRow={2} cellStyle={headStyle} minColW={48} firstColW={46} />
        </div>
        <div>
          <TableCaption>▼ [표2] 인천지역</TableCaption>
          <ExcelGrid data={[REG_HEAD, ...INCHEON]} startRow={2} startCol={6} cellStyle={headStyle} minColW={48} firstColW={46} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.textDim, margin: '4px 0 14px' }}>+ [표3] 서울지역 (같은 형식)</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.amberLight }}>풀이</span>
        <span style={{ fontSize: 13, color: C.textMuted }}>
          [표4] 제목행+왼쪽열 선택 → [데이터]→[통합] → 함수 <b>합계</b> → 표1·표2·표3을 제목까지 [추가] → <b>'첫 행'·'왼쪽 열' 체크</b> → 확인
        </span>
      </div>

      <TableCaption color={C.green}>▼ [표4] 완성 결과 (수도권 판매량 합계 = 경기+인천+서울)</TableCaption>
      <ExcelGrid data={[REG_HEAD, ...CONSOL_RESULT]} startRow={8} cellStyle={resStyle} minColW={52} firstColW={46} />
    </Wrap>
  );
}

// 통합에서 쓰는 와일드카드(*, ?) 정리
export function ConsolidateWildcardDiagram() {
  const rows = [
    ['*교육과', "'교육과'로 끝나는 모든 값", '과학교육과, 체육교육과 …'],
    ['교육과*', "'교육과'로 시작하는 모든 값", '교육과1반, 교육과심화 …'],
    ['*교육과*', "'교육과'를 포함하는 모든 값", '앞·뒤·가운데 어디든'],
    ['??교육과', "'교육과'로 끝나며 정확히 5글자", '체육교육과(O), 과학교육과(X)'],
  ];
  return (
    <Wrap>
      <Title>조건부 통합 — 와일드카드 (*, ?)</Title>
      <Subtitle>왼쪽 열 항목에 * 와 ? 를 써서 원하는 항목만 골라 통합합니다</Subtitle>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.6fr', background: '#0b1220' }}>
          {['입력', '뜻', '예'].map((h) => (
            <div key={h} style={{ padding: '8px 12px', color: C.blueLight, fontWeight: 700, fontSize: 13, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{h}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.6fr' }}>
            <div style={{ padding: '9px 12px', color: C.amber, fontWeight: 800, fontSize: 14, fontFamily: 'monospace', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{r[0]}</div>
            <div style={{ padding: '9px 12px', color: C.text, fontSize: 13, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>{r[1]}</div>
            <div style={{ padding: '9px 12px', color: C.textMuted, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>{r[2]}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 14, textAlign: 'center', fontSize: 13.5, color: C.amberLight }}>
        💡 <b>*</b> = 글자 수 상관없음, <b>?</b> = 정확히 한 글자. 참조 영역은 <b>왼쪽 열 항목부터</b> 시작해 드래그하세요.
      </div>
    </Wrap>
  );
}
