import { useState } from 'react';
import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, ArrowDown, ArrowRight, ExcelGrid, TableCaption, C } from './shared.jsx';

// ──────────────────────────────────────────────
// VlookupHlookupIntroDiagram — 문제 유형 앞에 두는 두 함수 공통 설명
// ──────────────────────────────────────────────
export function VlookupHlookupIntroDiagram() {
  const args = [
    { label: '찾을 값', color: C.amberLight,
      desc: '참조 범위에서 찾을 기준값입니다.' },
    { label: '참조 범위', color: C.blueLight,
      desc: '찾을 값으로 반환할 값을 찾아오기 위해 선택하는 범위입니다. \n찾을 값이 참조 범위의 첫 행 또는 첫 열에 오도록 하여, 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다. \n수식을 자동 채우기로 복사할 때 범위가 밀리지 않도록 $로 고정합니다.' },
    { label: '행 · 열 번호', color: C.greenLight,
      desc: '반환할 값이 참조 범위에서 몇 번째 행 또는 열에 있는지를 숫자로 넣습니다.' },
    { label: '마지막 인수', color: C.text,
      desc: '찾을 값이 참조 범위의 첫 행·열에 하나하나 그대로 들어 있으면 FALSE(정확히 일치)를 씁니다. \n첫 행·열이 ‘이상·미만’과 같은 구간으로 잡혀 있으면 TRUE(유사 일치)를 쓰고, 이때는 오름차순으로 정렬돼 있어야 합니다. \nIFERROR와 함께 쓰는 경우에 예외가 발생하는데, 이는 나중에 설명합니다.' },
  ];
  return (
    <Wrap>
      <Title>VLOOKUP · HLOOKUP — 공통 원리</Title>

      {/* 핵심 원리 강조 배너 (별표 대신 색·굵기로 강조) */}
      <div style={{ background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 8, padding: '11px 16px', margin: '0 0 18px', textAlign: 'center', color: C.text, fontSize: 16.5, fontWeight: 700, lineHeight: 1.6 }}>
        찾을 값이 <span style={{ color: C.blueLight }}>반드시 참조 범위의 첫 행 또는 첫 열</span>에 오도록 참조 범위를 잡는 것이 핵심입니다.
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* VLOOKUP */}
        <div style={{ flex: '1 1 300px', minWidth: 280, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
          <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 세로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 열에서 세로 방향으로 찾아 같은 행의 지정한 열에 있는 값을 반환</div>
        </div>
        {/* HLOOKUP */}
        <div style={{ flex: '1 1 300px', minWidth: 280, background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
          <div style={{ color: C.orangeLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 가로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 행에서 가로 방향으로 찾아 같은 열의 지정한 행에 있는 값을 반환</div>
        </div>
      </div>

      {/* 공통 인수 설명 */}
      <div style={{ marginTop: 16, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>두 함수에서 공통되는 네 개의 인수</div>
        {args.map((p) => (
          <div key={p.label} style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            <span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span>
            <span style={{ color: C.text }}> — {p.desc}</span>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// VlookupDiagram
// ──────────────────────────────────────────────
// ① 세로 참조 범위 VLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function VlookupDiagram() {
  const [active, setActive] = useState('찾을 값');

  const loan = [
    ['사원코드', '사원명', '판매액', '성과급률'],
    ['101-A-2201', '박서준', '24,000,000', '5.0%'],
    ['102-B-3302', '김민지', '9,800,000', '3.5%'],
    ['103-C-4503', '이도현', '13,500,000', '2.0%'],
  ];
  const code = [
    ['등급', '직무', '성과급률'],
    ['A', '영업', '5.0%'],
    ['B', '관리', '3.5%'],
    ['C', '지원', '2.0%'],
  ];

  const WHITE = '#ffffff';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '열 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = tabs.find((t) => t.key === active).color;

  const explain = {
    '찾을 값': '사원코드의 다섯 번째 문자입니다.',
    '참조 범위': '찾을 값이 사원코드의 다섯 번째 문자이기 때문에 참조 범위의 첫 열로 오도록 하여, 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '열 번호': '각 사원의 성과급률을 계산하라고 했기 때문에, 반환할 값이 지정한 참조 범위의 세 번째 열에 있으니 3입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 열에 전부 있습니다. (정확히 일치 · FALSE)',
  };

  // 사원코드 문자열에서 다섯 번째 글자(A·B·C)에만 형광펜 배경
  const hi = (s) => {
    const str = String(s);
    return (
      <span>{str.slice(0, 4)}<span style={{ background: C.amberLight, color: '#0b1220', borderRadius: 3, padding: '1px 3px', fontWeight: 700 }}>{str.slice(4, 5)}</span>{str.slice(5)}</span>
    );
  };

  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';

  // 표1: 사원코드(A3:A5)의 다섯 번째 문자를 모든 탭에서 형광펜으로 표시
  const loanSt = (ri, ci, val) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 0) return { bold: true, content: hi(val) };
    return {};
  };

  // 범위 바깥쪽 변에만 테두리를 그려 '범위를 감싼 것'처럼 보이게 (ri·ci는 data 인덱스)
  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 등급표: 참조 범위=A12:C14(첫 열 연한 채우기), 열 번호=C12:C14(초록), 일치 옵션=A12:A14(흰) — 모두 바깥쪽 테두리만
  const codeSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    let boxes = [];
    let fillFirstCol = false;
    if (active === '참조 범위') { boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }]; fillFirstCol = true; }
    else if (active === '열 번호') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }, { r1: 1, r2: 3, c1: 2, c2: 2, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 0, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstCol && ci === 0 && ri >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>① 세로 참조 범위 → VLOOKUP</Title>
      <Subtitle>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</Subtitle>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>사원코드[A3:A5]</b>의 다섯 번째 문자와
          <b style={{ color: C.blueLight }}> [A11:C14]</b> 영역의 표를 이용하여 각 사원의
          <b style={{ color: C.greenLight }}> 성과급률[D3:D5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 사원코드의 앞에서 다섯 번째 문자가 “A”이면 성과급률은 5.0%, “B”이면 3.5%, “C”이면 2.0%임</div>
          <div>▶ VLOOKUP, MID 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 사원 실적표 — 기준값이 있는 표</TableCaption>
            <ExcelGrid data={loan} startRow={2} cellStyle={loanSt} minColW={78} firstColW={104} />
          </div>
          <div>
            <TableCaption color={C.blueLight}>[등급표] 세로 참조 범위</TableCaption>
            <ExcelGrid data={code} startRow={11} cellStyle={codeSt} minColW={82} firstColW={64} />
          </div>
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* VLOOKUP 박스 (구문 + 수식) */}
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MID(A3,5,1)</span>, <span style={{ color: C.blueLight }}>$A$12:$C$14</span>, <span style={{ color: C.greenLight }}>3</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 5.0%</div>
            </div>
          </div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 선택한 인수 설명 */}
          <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px', fontSize: 15, lineHeight: 1.7 }}>
            <span style={{ color: activeColor === WHITE ? C.text : activeColor, fontWeight: 700 }}>{active}</span>
            <span style={{ color: C.text }}> — {explain[active]}</span>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ② 가로 참조 범위 HLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function HlookupTwoTableDiagram() {
  const [active, setActive] = useState('찾을 값');

  const sales = [
    ['판매일', '판매사원', '상품코드', '판매수량', '판매금액'],
    ['3월 2일', '한지민', 'B', 12, '54,000'],
    ['3월 5일', '공유', 'D', 20, '30,000'],
    ['3월 9일', '수지', 'A', 7, '56,000'],
  ];
  const price = [
    ['상품코드', 'A', 'B', 'C', 'D'],
    ['판매단가', '8,000', '4,500', '6,000', '1,500'],
    ['매입단가', '5,600', '3,000', '4,200', '1,000'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_ORANGE = 'rgba(251,146,60,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.orangeLight },
    { key: '행 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = tabs.find((t) => t.key === active).color;

  const explain = {
    '찾을 값': '상품코드입니다. 단가표의 첫 행에서 이 코드를 가로로 찾습니다.',
    '참조 범위': '찾을 값이 상품코드이기 때문에 참조 범위의 첫 행으로 오도록 하여, 왼쪽 이름 열(상품코드·판매단가·매입단가)은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '행 번호': '판매금액은 판매단가와 판매수량을 곱한 값이므로, 반환할 판매단가가 참조 범위의 두 번째 행에 있으니 2입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 행에 전부 있습니다. (정확히 일치 · FALSE)',
  };

  // 표2: 상품코드 열(C3:C5)을 모든 탭에서 형광펜으로 표시
  const salesSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    if (ci === 2) return { bold: true, bg: C.amberLight, color: '#0b1220' };
    return {};
  };

  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 단가표: 이름 열(A)은 항상 라벨색. 참조 범위=B12:E14(첫 행 연한 채우기), 행 번호=B13:E13(초록), 일치 옵션=B12:E12(흰)
  const priceSt = (ri, ci) => {
    if (ci === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.orangeLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.orangeLight }, { r1: 1, r2: 1, c1: 1, c2: 4, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 4, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_ORANGE;
    return sides;
  };

  return (
    <Wrap>
      <Title>② 가로 참조 범위 → HLOOKUP</Title>
      <Subtitle>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</Subtitle>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표2]에서 <b style={{ color: C.amberLight }}>상품코드[C3:C5]</b>와
          <b style={{ color: C.orangeLight }}> [B12:E14]</b> 영역의 표를 이용하여 각 건의
          <b style={{ color: C.greenLight }}> 판매금액[E3:E5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 판매금액은 판매수량과 상품의 판매단가를 곱한 값임</div>
          <div>▶ HLOOKUP 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.orangeLight}>[표2] 상품 판매현황 — 기준값이 있는 표</TableCaption>
            <ExcelGrid data={sales} startRow={2} cellStyle={salesSt} minColW={72} firstColW={78} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[상품 단가표] 가로 참조 범위</TableCaption>
            <ExcelGrid data={price} startRow={12} cellStyle={priceSt} minColW={80} firstColW={74} />
          </div>
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* HLOOKUP 박스 (구문 + 수식) */}
          <div style={{ background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
            <div style={{ color: C.orange, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 행에서 찾을 값을 가로로 찾아 같은 열의 지정 행 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=D3*HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.orangeLight }}>$B$12:$E$14</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 12 × 4,500 = 54,000</div>
            </div>
          </div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 선택한 인수 설명 */}
          <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px', fontSize: 15, lineHeight: 1.7 }}>
            <span style={{ color: activeColor === WHITE ? C.text : activeColor, fontWeight: 700 }}>{active}</span>
            <span style={{ color: C.text }}> — {explain[active]}</span>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ③ 두 개의 표(따로) — 세로 참조 범위 + 유사 일치 (총점 구간 → 등급)
export function VlookupApproxDiagram() {
  const score = [
    ['학번', '이름', '총점', '등급'],
    ['S01', '김하늘', 92, '수'],
    ['S02', '이준호', 68, '양'],
    ['S03', '박서연', 85, '우'],
  ];
  const scoreSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ri === 1 && ci === 2) return { bold: true, color: C.amberLight, bg: C.amberBg };
    if (ri === 1 && ci === 3) return { bold: true, color: C.greenLight, bg: C.greenBg };
    return {};
  };
  const grade = [
    ['기준점수', '등급'],
    [0, '가'],
    [60, '양'],
    [70, '미'],
    [80, '우'],
    [90, '수'],
  ];
  const gradeSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ri === 5 && ci === 0) return { bold: true, color: C.amberLight, bg: C.amberBg };
    if (ri === 5 && ci === 1) return { bold: true, color: C.greenLight, bg: C.greenBg };
    return {};
  };
  return (
    <Wrap>
      <Title>세로 참조 범위 + 유사 일치 → VLOOKUP</Title>

      {/* 실제 시험 형식 문제 — 상단 가로 전체 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>총점[C3:C5]</b>과
          <b style={{ color: C.blueLight }}> [B12:C16]</b> 영역의 표를 이용하여 각 학생의
          <b style={{ color: C.greenLight }}> 등급[D3:D5]</b>을 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 등급은 총점이 속한 구간의 값임 (90 이상 ‘수’, 80~89 ‘우’, 70~79 ‘미’, 60~69 ‘양’, 그 미만 ‘가’)</div>
          <div>▶ VLOOKUP 함수 사용 (유사 일치)</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개 · 오른쪽: 풀이 박스 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 학생 성적표 — 기준값이 있는 표</TableCaption>
            <ExcelGrid data={score} startRow={2} cellStyle={scoreSt} minColW={70} firstColW={70} />
          </div>
          <div>
            <TableCaption color={C.blueLight}>[등급 기준표] 세로 참조 범위 (첫 열 오름차순)</TableCaption>
            <ExcelGrid data={grade} startRow={11} startCol={1} cellStyle={gradeSt} minColW={78} firstColW={92} />
          </div>
        </div>

        {/* VLOOKUP 풀이 박스 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP (유사 일치)</div>
          <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>마지막 인수를 TRUE(또는 생략)로 두면 유사 일치. 찾을 값보다 크지 않은 값 중 가장 큰 값을 찾아 그 구간을 매칭</div>
          <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
          <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
            =VLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight }}>$B$12:$C$16</span>, <span style={{ color: C.greenLight }}>2</span>, TRUE)
            <span style={{ color: C.greenLight }}> → 수</span>
          </div>
          {[
            { label: '찾을 값', code: 'C3', color: C.amberLight,
              desc: '총점(92)입니다. 등급표에서 이 점수가 어느 구간에 속하는지 찾습니다.' },
            { label: '참조 범위', code: '$B$12:$C$16', color: C.blueLight,
              desc: '등급 기준표입니다. \n유사 일치에서는 첫 열(기준점수)이 반드시 오름차순(0→60→70→80→90)으로 정렬돼 있어야 제대로 동작합니다. \n제목행(기준점수·등급)은 범위에서 빼고 B12부터 선택합니다.' },
            { label: '열 번호', code: '2', color: C.greenLight,
              desc: '반환할 값이 등급이므로, 선택한 범위에서 등급이 있는 열 번호 2를 넣습니다.' },
            { label: '마지막 인수', code: 'TRUE', color: C.text,
              desc: '유사 일치입니다. 92와 똑같은 값이 없어도, 92보다 크지 않은 값 중 가장 큰 90을 찾아 그 등급 ‘수’를 가져옵니다. 생략하거나 1을 써도 같습니다. (0·FALSE로 하면 정확히 일치라 92를 못 찾아 오류가 납니다.)' },
          ].map((p) => (
            <div key={p.label} style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.label} {p.code}</span>
              <span style={{ color: C.text }}> — {p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

// ④ 한 개의 표 — 기준값과 참조 범위가 같은 표에 있는 VLOOKUP + MIN (상품 만족도)
export function VlookupOneTableDiagram() {
  const data = [
    ['상품명', '만족도', '카테고리'],
    ['아메리카노', 4.5, '음료'],
    ['크로플', 3.2, '디저트'],
    ['카페라떼', 4.8, '음료'],
    ['머핀', 2.9, '디저트'],
  ];
  const st = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ri === 4 && ci === 1) return { bold: true, color: C.amberLight, bg: C.amberBg };   // 찾을 값 MIN=2.9
    if (ri === 4 && ci === 2) return { bold: true, color: C.greenLight, bg: C.greenBg };   // 결과 디저트
    return {};
  };
  return (
    <Wrap>
      <Title>③ 한 표 안에서 VLOOKUP</Title>

      {/* 실제 시험 형식 문제 — 상단 가로 전체 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표3]에서 <b style={{ color: C.amberLight }}>만족도[B3:B6]</b>가 가장 낮은 상품의
          <b style={{ color: C.greenLight }}> 카테고리[C9]</b>를 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ VLOOKUP, MIN 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 · 오른쪽: 풀이 박스 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <TableCaption color={C.blueLight}>[표3] 기준값과 참조 범위가 같은 표</TableCaption>
          <ExcelGrid data={data} startRow={2} cellStyle={st} minColW={92} firstColW={92} />
        </div>

        {/* VLOOKUP 풀이 박스 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP + MIN</div>
          <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>찾을 값 자리에 MIN을 중첩해 가장 낮은 만족도를 먼저 구한 뒤, 그 값을 참조 범위 첫 열에서 찾아 같은 행의 카테고리를 반환</div>
          <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
          <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
            <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MIN(B3:B6)</span>, <span style={{ color: C.blueLight }}>B3:C6</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
            <div style={{ color: C.greenLight }}>→ 디저트</div>
          </div>
          {[
            { label: '찾을 값', code: 'MIN(B3:B6)', color: C.amberLight,
              desc: '만족도 중 가장 낮은 값(2.9)을 MIN으로 먼저 구합니다. 이 값을 참조 범위의 첫 열(만족도)에서 세로로 찾습니다.' },
            { label: '참조 범위', code: 'B3:C6', color: C.blueLight,
              desc: 'VLOOKUP은 찾을 값이 참조 범위의 첫 열에 있어야 합니다. \n찾을 값이 만족도이므로, 만족도(B열)가 첫 열이 되도록 상품명(A열)은 빼고 B열부터 선택합니다. \n같은 표 안에 있어도 찾을 값 왼쪽 열(상품명)은 VLOOKUP으로 가져올 수 없습니다.' },
            { label: '열 번호', code: '2', color: C.greenLight,
              desc: '반환할 값이 카테고리이므로, 선택한 범위(B~C열)에서 카테고리가 있는 열 번호 2를 넣습니다.' },
          ].map((p) => (
            <div key={p.label} style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.label} {p.code}</span>
              <span style={{ color: C.text }}> — {p.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// MatchIndexDiagram
// ──────────────────────────────────────────────
export function MatchIndexDiagram() {
  const matchList = [
    { label: '홍길동 · 1번째', highlight: false },
    { label: '김철수 · 2번째', highlight: false },
    { label: '이영희 · 3번째 ★', highlight: true },
  ];
  const indexList = [
    { label: '88 · 1번째', highlight: false },
    { label: '72 · 2번째', highlight: false },
    { label: '95 · 3번째 ★', highlight: true },
  ];

  const listItemStyle = (highlight, activeBg, activeBorder, activeColor) => ({
    background: highlight ? activeBg : C.bgDark,
    border: `${highlight ? 2 : 1}px solid ${highlight ? activeBorder : C.border}`,
    borderRadius: 6, padding: 8, marginBottom: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16,
    color: highlight ? activeColor : C.textMuted,
    fontWeight: highlight ? 700 : 400,
  });

  return (
    <Wrap>
      <Title>위치 · 추출 함수: MATCH · INDEX</Title>
      <Subtitle>MATCH는 &apos;몇 번째?&apos;를 찾고 — INDEX는 &apos;그 번째 값&apos;을 꺼냅니다</Subtitle>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        {/* Left: MATCH panel */}
        <div style={{
          flex: 1, background: C.purpleCard, border: `2px solid ${C.purple}`,
          borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* 표준 순서: 함수명 → 구문 → 설명 → (아래 목록 시각화) → 수식 → 값 */}
          <div style={{ color: C.purpleLight, fontSize: 18, fontWeight: 700, marginBottom: 2 }}>① MATCH</div>
          <div style={{ color: C.purpleLight, fontSize: 12.5, fontWeight: 700, opacity: 0.95, marginBottom: 2 }}>구문: =MATCH(찾을 값, 범위, 0)</div>
          <div style={{ color: C.purpleLight, fontSize: 13.5, opacity: 0.85, marginBottom: 10 }}>값이 범위에서 몇 번째 위치인지 반환</div>
          {matchList.map((item, i) => (
            <div key={i} style={listItemStyle(item.highlight, C.purpleCard, C.purple, C.purpleLight)}>
              {item.label}
            </div>
          ))}
          <div style={{
            marginTop: 8, background: C.purpleBg, border: `1px solid ${C.purple}`,
            borderRadius: 6, padding: 8,
            color: C.purpleLight, fontSize: 14, fontFamily: 'monospace', textAlign: 'center',
          }}>
            =MATCH(&quot;이영희&quot;, B2:B4, 0)
          </div>
          <div style={{ color: C.purpleLight, fontSize: 20, fontWeight: 700, textAlign: 'center', marginTop: 4 }}>
            → 3
          </div>
        </div>

        {/* Center: arrow + number */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 8px', gap: 8,
        }}>
          <div style={{ color: C.amber, fontSize: 14, textAlign: 'center' }}>→ 3 전달</div>
          <ArrowRight color={C.amber} size={48} />
          <div style={{
            background: C.amberBg, border: `1px solid ${C.amber}`,
            borderRadius: 6, padding: 8,
            color: C.amber, fontSize: 28, fontWeight: 700, textAlign: 'center',
            minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>3</div>
        </div>

        {/* Right: INDEX panel */}
        <div style={{
          flex: 1, background: '#071a0b', border: `2px solid ${C.green}`,
          borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* 표준 순서: 함수명 → 구문 → 설명 → (아래 목록 시각화) → 수식 → 값 */}
          <div style={{ color: C.greenLight, fontSize: 18, fontWeight: 700, marginBottom: 2 }}>② INDEX</div>
          <div style={{ color: C.greenLight, fontSize: 12.5, fontWeight: 700, opacity: 0.95, marginBottom: 2 }}>구문: =INDEX(범위, 행 번호)</div>
          <div style={{ color: C.greenLight, fontSize: 13.5, opacity: 0.85, marginBottom: 10 }}>범위에서 지정한 위치(행 번호)의 값을 반환</div>
          {indexList.map((item, i) => (
            <div key={i} style={listItemStyle(item.highlight, '#14532d', C.green, C.greenLight)}>
              {item.label}
            </div>
          ))}
          <div style={{
            marginTop: 8, background: '#14532d', border: `1px solid ${C.green}`,
            borderRadius: 6, padding: 8,
            color: C.greenLight, fontSize: 14, fontFamily: 'monospace', textAlign: 'center',
          }}>
            =INDEX(C2:C4, 3)
          </div>
          <div style={{
            background: '#0a2e1c', border: `2px solid ${C.green}`,
            borderRadius: 6, padding: 12, marginTop: 4,
            color: C.greenLight, fontSize: 36, fontWeight: 700, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            = 95
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=MATCH(찾을 값, 범위, 0) → 위치 번호  ·  =INDEX(범위, 행 번호) → 해당 위치 값</BLine>
        <BLine color={C.blue} bold>※ MATCH 결과를 INDEX 행 번호로 바로 전달 가능</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// ChooseDiagram
// ──────────────────────────────────────────────
export function ChooseDiagram() {
  const options = [
    { num: 1, label: '번호 = 1',       value: '"최우수"', note: '(선택 안 됨)', active: false },
    { num: 2, label: '번호 = 2  ★ 선택됨', value: '"우수"',   note: '→ 이 값 반환', active: true  },
    { num: 3, label: '번호 = 3',       value: '"보통"',   note: '(선택 안 됨)', active: false },
  ];

  return (
    <Wrap>
      <Title>목록 선택 함수: CHOOSE</Title>
      <Subtitle>번호 인수에 따라 미리 지정된 값 목록에서 하나를 선택하여 반환합니다</Subtitle>

      {/* Formula box */}
      <div style={{
        background: '#1e3a8a', border: `2px solid ${C.blueDim}`,
        borderRadius: 10, padding: 16,
        maxWidth: 480, margin: '0 auto 16px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{
          color: C.blueLight, fontSize: 16, fontFamily: 'monospace',
          fontWeight: 700, textAlign: 'center',
        }}>
          =CHOOSE( 2 , &quot;최우수&quot; , &quot;우수&quot; , &quot;보통&quot; )
        </div>
        <div style={{
          color: C.textDim, fontSize: 14, fontFamily: 'monospace', textAlign: 'center',
        }}>
          &nbsp;&nbsp;&nbsp;&nbsp;① 번호&nbsp;&nbsp;&nbsp;② 값1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;③ 값2&nbsp;&nbsp;&nbsp;&nbsp;④ 값3
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ArrowDown color={C.blueDim} size={32} />
      </div>

      {/* Three option cards */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        {options.map((opt) => (
          <div key={opt.num} style={{
            flex: 1, borderRadius: 10, padding: 16,
            background: opt.active ? C.blueCard : C.bgDark,
            border: opt.active ? `3px solid ${C.blueDim}` : `1px solid ${C.border}`,
            opacity: opt.active ? 1 : 0.7,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              color: opt.active ? C.blue : C.textDim,
              fontSize: 15, fontWeight: opt.active ? 700 : 400, textAlign: 'center',
            }}>
              {opt.label}
            </div>
            <div style={{
              color: opt.active ? C.blue : C.textSlate,
              fontSize: opt.active ? 28 : 20,
              fontWeight: 700, textAlign: 'center',
            }}>
              {opt.value}
            </div>
            <div style={{
              color: opt.active ? C.blueLight : C.textSlate,
              fontSize: 15, textAlign: 'center',
            }}>
              {opt.note}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <ArrowDown color={C.green} size={32} />
      </div>

      {/* Result box */}
      <div style={{
        background: '#14532d', border: `2px solid ${C.green}`,
        borderRadius: 10, padding: 16, marginTop: 4,
        maxWidth: 300, margin: '4px auto 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: C.greenLight, fontSize: 24, fontWeight: 700 }}>
          결과: &quot;우수&quot;
        </div>
      </div>

      <BottomBar>
        <BLine>=CHOOSE(번호, 값1, 값2, 값3, ...)  ·  번호가 1이면 값1, 2면 값2, 3이면 값3을 반환</BLine>
        <BLine color={C.blue} bold>CHOOSE의 번호 인수에 WEEKDAY, MONTH 등 다른 함수를 중첩해서 활용</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// IndexMatchDiagram
// ──────────────────────────────────────────────
export function IndexMatchDiagram() {
  const headerStyle = {
    background: C.bgDark, border: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 8px', fontSize: 15, color: C.textMuted,
  };

  const dataCellStyle = {
    background: C.bgDark, border: `1px solid ${C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 8px', fontSize: 15, color: C.textMuted,
  };

  return (
    <Wrap>
      <Title>INDEX+MATCH 조합 — VLOOKUP의 한계를 넘는 방법</Title>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        {/* Left: VLOOKUP limitation */}
        <div style={{
          flex: 1, background: '#1a0b0b', border: `2px solid ${C.red}`,
          borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ color: C.red, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ❌ VLOOKUP 한계
          </div>

          {/* Data table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {['A열', 'B열', 'C열'].map(h => (
              <div key={h} style={headerStyle}>{h}</div>
            ))}
            {['도서코드', '출판사', '도서명'].map(h => (
              <div key={h} style={{ ...dataCellStyle, fontWeight: 700, color: C.textMuted }}>{h}</div>
            ))}
            {['A-101', '한빛', '파이썬기초'].map((v, i) => (
              <div key={i} style={dataCellStyle}>{v}</div>
            ))}
            {['B-102', '위키', '자바스크립트'].map((v, i) => (
              <div key={i} style={dataCellStyle}>{v}</div>
            ))}
          </div>

          {/* Problem box */}
          <div style={{
            background: C.redBg, border: `1px solid ${C.red}`,
            borderRadius: 6, padding: 10, marginTop: 8,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ color: C.redLight, fontSize: 15, textAlign: 'center' }}>
              도서명(C열)으로 도서코드(A열)를 찾고 싶다
            </div>
            <div style={{ color: C.red, fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
              → VLOOKUP은 첫 번째 열만 검색 가능!
            </div>
          </div>
        </div>

        {/* Center arrow */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '0 4px', gap: 4,
        }}>
          <div style={{ color: C.amber, fontSize: 13, textAlign: 'center', whiteSpace: 'nowrap' }}>
            INDEX+MATCH
          </div>
          <ArrowRight color={C.amber} size={36} />
        </div>

        {/* Right: INDEX+MATCH solution */}
        <div style={{
          flex: 1, background: '#071a0b', border: `2px solid ${C.green}`,
          borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ color: C.green, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ✅ INDEX+MATCH 조합
          </div>

          {/* Full formula */}
          <div style={{
            background: '#0c2440', border: `1px solid ${C.blueDim}`,
            borderRadius: 6, padding: 10, marginBottom: 12,
            fontFamily: 'monospace',
          }}>
            <div style={{ color: C.blueLight, fontSize: 14, textAlign: 'center' }}>
              =INDEX(A2:A3,
            </div>
            <div style={{ color: C.blueLight, fontSize: 14, textAlign: 'center' }}>
              MATCH(&quot;파이썬기초&quot;,C2:C3,0))
            </div>
          </div>

          {/* Step 1 */}
          <div style={{
            background: C.purpleCard, border: `1px solid ${C.purple}`,
            borderRadius: 6, padding: 8, marginBottom: 8,
          }}>
            <div style={{ color: C.purpleLight, fontSize: 13, fontWeight: 700 }}>STEP 1</div>
            <div style={{ color: C.purpleLight, fontSize: 14, fontFamily: 'monospace' }}>
              =MATCH(&quot;파이썬기초&quot;, C2:C3, 0) = 1
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            background: '#0c2440', border: `1px solid ${C.blueDim}`,
            borderRadius: 6, padding: 8, marginBottom: 8,
          }}>
            <div style={{ color: C.blueLight, fontSize: 13, fontWeight: 700 }}>STEP 2</div>
            <div style={{ color: C.blueLight, fontSize: 14, fontFamily: 'monospace' }}>
              =INDEX(A2:A3, 1) = &quot;A-101&quot;
            </div>
          </div>

          {/* Result */}
          <div style={{
            background: '#14532d', border: `2px solid ${C.green}`,
            borderRadius: 6, padding: 12,
            color: C.greenLight, fontSize: 24, fontWeight: 700, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            결과: &quot;A-101&quot;
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=INDEX(반환 범위, MATCH(찾을 값, 검색 범위, 0))</BLine>
        <BLine color={C.blue} bold>※ VLOOKUP: 첫 열만 검색 · INDEX+MATCH: 어느 열이든 자유롭게</BLine>
      </BottomBar>
    </Wrap>
  );
}
