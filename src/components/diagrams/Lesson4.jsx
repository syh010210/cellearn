import { useState, useEffect } from 'react';
import { Wrap, Title, Subtitle, BottomBar, BLine, ArrowDown, ExcelGrid, TableCaption, C } from './shared.jsx';

// ──────────────────────────────────────────────
// VlookupHlookupIntroDiagram — 문제 유형 앞에 두는 두 함수 공통 설명
// ──────────────────────────────────────────────
export function VlookupHlookupIntroDiagram() {
  return (
    <Wrap>
      <Title>VLOOKUP · HLOOKUP</Title>

      {/* 두 함수 설명 카드 */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', minWidth: 280, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
          <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 세로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 열에서 세로 방향으로 찾아 같은 행의 지정한 열에 있는 값을 반환</div>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 280, background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
          <div style={{ color: C.orangeLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 가로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 행에서 가로 방향으로 찾아 같은 열의 지정한 행에 있는 값을 반환</div>
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// VlookupDiagram
// ──────────────────────────────────────────────
// ① 세로 참조 범위 VLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function VlookupDiagram() {
  const [active, setActive] = useState(null);

  // 일치 옵션을 누르면 성과급률 3개가 2초 간격으로 하나씩 채워짐
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['2.0%', '5.0%', '3.5%']; // 박서준(C)·김민지(A)·이도현(B)

  const loan = [
    ['사원코드', '사원명', '판매액', '성과급률'],
    ['103-C-2201', '박서준', '24,000,000', ''],
    ['101-A-4503', '김민지', '9,800,000', ''],
    ['102-B-3302', '이도현', '13,500,000', ''],
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
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '사원코드의 다섯 번째 문자입니다.',
    '참조 범위': '찾을 값이 사원코드의 다섯 번째 문자(등급)이기 때문에 참조 범위의 첫 열로 오도록 하여, 위의 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '열 번호': '각 사원의 성과급률을 계산하라고 했기 때문에, 반환할 값이 지정한 참조 범위의 세 번째 열에 있으니 3입니다.',
    '일치 옵션': '찾을 값(C,A,B)이 참조 범위의 첫 열에 전부 있습니다. \n(정확히 일치 · FALSE)',
  };

  // 사원코드 문자열에서 다섯 번째 글자(A·B·C)에만 형광펜 배경
  const hi = (s) => {
    const str = String(s);
    return (
      <span>{str.slice(0, 4)}<span style={{ background: C.amberLight, color: '#0b1220', borderRadius: 3, padding: '1px 3px', fontWeight: 700 }}>{str.slice(4, 5)}</span>{str.slice(5)}</span>
    );
  };

  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';

  // 표1: 사원코드(A3:A5)의 다섯 번째 문자를 형광펜으로 표시 (열 번호 탭에서는 숨김)
  const loanSt = (ri, ci, val) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 0 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, content: hi(val) };
    if (ci === 3 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
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
      <Title>참조 범위에서 나열된 데이터의 방향이 세로이면 VLOOKUP</Title>

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
            <TableCaption color={C.blueLight}>[표1] 사원 실적표 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={loan} startRow={2} cellStyle={loanSt} minColW={78} firstColW={104} />
          </div>
          <div>
            <TableCaption color={C.blueLight}>[등급표] 세로 참조 범위</TableCaption>
            <ExcelGrid data={code} startRow={11} cellStyle={codeSt} minColW={82} firstColW={64}
              labelRow={[
                active === '참조 범위' ? { text: '첫 열', color: C.blueLight } : null,
                null,
                active === '열 번호' ? { text: '3번째', color: C.greenLight } : null,
              ]} />
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
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MID(A3,5,1)</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$A$12:$C$14</span>, <span style={{ color: C.greenLight }}>3</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 2.0%</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

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

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ② 가로 참조 범위 HLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function HlookupTwoTableDiagram() {
  const [active, setActive] = useState(null);

  // 일치 옵션을 누르면 판매금액 3개가 2초 간격으로 하나씩 채워짐
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['54,000', '30,000', '56,000']; // 한지민(B×12)·공유(D×20)·수지(A×7)

  const sales = [
    ['판매일', '판매사원', '상품코드', '판매수량', '판매금액'],
    ['3월 2일', '한지민', 'B', 12, ''],
    ['3월 5일', '공유', 'D', 20, ''],
    ['3월 9일', '수지', 'A', 7, ''],
  ];
  const price = [
    ['상품코드', 'A', 'B', 'C', 'D'],
    ['판매단가', '8,000', '4,500', '6,000', '1,500'],
    ['매입단가', '5,600', '3,000', '4,200', '1,000'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '행 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '상품코드입니다.',
    '참조 범위': '찾을 값이 상품코드이기 때문에 참조 범위의 첫 행으로 오도록 하여, 왼쪽 표의 제목 열은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '행 번호': '각 건의 판매금액을 계산하라고 했기 때문에, 반환할 판매단가가 지정한 참조 범위의 두 번째 행에 있으니 2입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 행에 전부 있습니다. \n(정확히 일치 · FALSE)',
  };

  // 표2: 상품코드 열(C3:C5)을 형광펜으로 표시 (행 번호 탭에서는 숨김)
  const salesSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    if (ci === 2 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, bg: C.amberLight, color: '#0b1220' };
    if (ci === 4 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
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
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.blueLight }, { r1: 1, r2: 1, c1: 1, c2: 4, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 4, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>참조 범위에서 나열된 데이터의 방향이 가로이면 HLOOKUP</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표2]에서 <b style={{ color: C.amberLight }}>상품코드[C3:C5]</b>와
          <b style={{ color: C.blueLight }}> [A12:E14]</b> 영역의 표를 이용하여 각 건의
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
            <TableCaption color={C.orangeLight}>[표2] 상품 판매현황 — 찾는 값이 있는 표</TableCaption>
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
              <div>=D3*HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$12:$E$14</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 12 × 4,500 = 54,000</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

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

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// (개념학습2) 유사 일치 이해하기 — 두 가지 가로 기준표(구간 형태·시작값 형태) + HLOOKUP
export function VlookupApproxDiagram() {
  const [active, setActive] = useState(null);

  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['수', '양', '우']; // 김하늘 92→수, 이준호 68→양, 박서연 85→우

  const score = [
    ['학번', '이름', '총점', '등급'],
    ['S01', '김하늘', 92, ''],
    ['S02', '이준호', 68, ''],
    ['S03', '박서연', 85, ''],
  ];
  // 표① 시험지 형태: 기준점수(A8:A9 병합) + 이상(8행) + 미만(9행), 등급(10행)
  const base1 = [
    ['기준점수', '0 이상', '60 이상', '70 이상', '80 이상', '90 이상'],
    ['', '60 미만', '70 미만', '80 미만', '90 미만', '100 이하'],
    ['등급', '가', '양', '미', '우', '수'],
  ];
  // 표② 시작값 형태: 기준점수(8행 숫자) + 등급(9행)
  const base2 = [
    ['기준점수', 0, 60, 70, 80, 90],
    ['등급', '가', '양', '미', '우', '수'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '행 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];

  const explain = {
    '찾을 값': '총점입니다.',
    '참조 범위': '찾을 값이 총점이기 때문에 참조 범위의 첫 행에 오도록 하여, 첫 행은 반드시 오름차순으로 정렬돼 있어야 합니다. \n왼쪽 표의 제목 열은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '행 번호': '각 학생의 등급을 계산하라고 했기 때문에, 반환할 값이 표2에서는 지정한 참조 범위의 세 번째 행에 있으니 3이고, 표3에서는 두 번째 행에 있으니 2입니다.',
    '일치 옵션': '찾을 값과 똑같은 값이 없어도, 찾을 값보다 작은 값 중 가장 큰 값을 찾아 그 구간의 등급을 가져옵니다. \n(유사 일치 · TRUE)',
  };

  const scoreSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 2 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, bg: C.amberLight, color: '#0b1220' };
    if (ci === 3 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
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

  // 표① (인덱스 0·1·2): 등급 행 = 인덱스 2. 참조 범위=B8:F10, 행 번호(등급)=인덱스2, 일치 옵션=첫 행(인덱스0)
  const base1St = (ri, ci) => {
    if (ci === 0) return ri === 0 ? { rowSpan: 2, bold: true, color: C.orangeLight, bg: '#3a1c08' } : { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 2, c1: 1, c2: 5, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 2, c1: 1, c2: 5, color: C.blueLight }, { r1: 2, r2: 2, c1: 1, c2: 5, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 5, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  // 표② (인덱스 0·1): 등급 행 = 인덱스 1. 참조 범위=B12:F13, 행 번호(등급)=인덱스1, 일치 옵션=첫 행(인덱스0)
  const base2St = (ri, ci) => {
    if (ci === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 1, c1: 1, c2: 5, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 1, c1: 1, c2: 5, color: C.blueLight }, { r1: 1, r2: 1, c1: 1, c2: 5, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 5, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>유사 일치 이해하기</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>총점[C3:C5]</b>과 아래 기준표를 이용하여 각 학생의
          <b style={{ color: C.greenLight }}> 등급[D3:D5]</b>을 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ HLOOKUP 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 성적표 + 두 기준표 · 오른쪽: 박스 + 버튼 + 칠판 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 학생 성적표 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={score} startRow={2} cellStyle={scoreSt} minColW={64} firstColW={72} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[표2] 가로 기준표 — 시험지 형태(구간 표시)</TableCaption>
            <ExcelGrid data={base1} startRow={8} cellStyle={base1St} minColW={62} firstColW={70} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[표3] 같은 기준표 — 시작값만 (HLOOKUP이 쓰는 형태)</TableCaption>
            <ExcelGrid data={base2} startRow={12} cellStyle={base2St} minColW={62} firstColW={70} />
          </div>
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* HLOOKUP 박스 — 두 표의 정답 */}
          <div style={{ background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
            <div style={{ color: C.orange, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>기준표 첫 행에서 총점이 속한 구간을 찾아 같은 열의 등급을 반환</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em', padding: '2px 0' }}>
              <div style={{ color: C.orangeLight, fontSize: 13, marginBottom: 2 }}>표2 (등급이 3번째 행)</div>
              <div>=HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$8:$F$10</span>, <span style={{ color: C.greenLight }}>3</span>, TRUE)<span style={{ color: C.greenLight }}> → 수</span></div>
              <div style={{ color: C.orangeLight, fontSize: 13, margin: '8px 0 2px' }}>표3 (등급이 2번째 행)</div>
              <div>=HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$12:$F$13</span>, <span style={{ color: C.greenLight }}>2</span>, TRUE)<span style={{ color: C.greenLight }}> → 수</span></div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요 (두 표에 동시 표시)</div>

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

          {/* 칠판 — 가장 긴 설명 크기로 고정 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>

          {/* 참조 범위 보충 설명 — 자리는 항상 차지하고(크기 고정) 참조 범위일 때만 보이게 */}
          <div style={{ visibility: active === '참조 범위' ? 'visible' : 'hidden', background: C.bgDark, border: `1px solid ${C.blueDim}`, borderRadius: 10, padding: '11px 14px', color: C.textMuted, fontSize: 13, lineHeight: 1.65 }}>
            표2에서 HLOOKUP은 참조 범위 첫 행(8행)의 <b style={{ color: C.text }}>0 이상~90 이상</b>에서 구간의 시작값 <b style={{ color: C.text }}>0·60·70·80·90</b>만 보고 총점을 찾습니다. 아래 행(9행)은 사람이 구간을 읽기 쉽게 적어둔 것일 뿐 검색에는 쓰이지 않습니다.
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ③ 한 표 안에서 VLOOKUP + MIN — 왼쪽 표 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function VlookupOneTableDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['상품명', '만족도', '카테고리'],
    ['아메리카노', 4.5, '음료'],
    ['크로플', 3.2, '디저트'],
    ['카페라떼', 4.8, '음료'],
    ['머핀', 2.9, '디저트'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '열 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '만족도 중 가장 낮은 값입니다.',
    '참조 범위': '찾을 값이 만족도이기 때문에 참조 범위의 첫 열로 오도록 하여, 위의 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다. 상품명 열은 만족도 열이 참조 범위의 첫 열이므로 지정할 수 없습니다.',
    '열 번호': '가장 낮은 만족도의 카테고리를 구하라고 했기 때문에, 반환할 카테고리가 지정한 참조 범위의 두 번째 열에 있으니 2입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 열에 있습니다. \n(정확히 일치 · FALSE)',
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
  // 한 표: 만족도(B3:B6)=찾을 값 재료, 참조 범위=B3:C6(첫 열 연한 채우기), 열 번호=C3:C6(초록), 일치 옵션=B3:B6(흰)
  const st = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    let boxes = [];
    let fillFirstCol = false;
    if (active === '참조 범위') { boxes = [{ r1: 1, r2: 4, c1: 1, c2: 2, color: C.blueLight }]; fillFirstCol = true; }
    else if (active === '열 번호') boxes = [{ r1: 1, r2: 4, c1: 1, c2: 2, color: C.blueLight }, { r1: 1, r2: 4, c1: 2, c2: 2, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 1, r2: 4, c1: 1, c2: 1, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    // 찾을 값·일치 옵션 탭: 만족도 열(B3:B6) 형광펜 / 참조 범위 탭: 첫 열 연한 채우기
    if ((active === '찾을 값' || active === '일치 옵션') && ci === 1 && ri >= 1) { sides.bg = C.amberLight; sides.color = '#0b1220'; sides.bold = true; }
    else if (fillFirstCol && ci === 1 && ri >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>하나의 표에서</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표3]에서 <b style={{ color: C.amberLight }}>만족도[B3:B6]</b>가 가장 낮은 상품의
          <b style={{ color: C.greenLight }}> 카테고리[C9]</b>를 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ VLOOKUP, MIN 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div>
          <TableCaption color={C.blueLight}>[표3] 찾는 값과 참조 범위가 같은 표</TableCaption>
          <ExcelGrid data={data} startRow={2} cellStyle={st} minColW={92} firstColW={92} />
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* VLOOKUP + MIN 박스 */}
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MIN(B3:B6)</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>B3:C6</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 디저트</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

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

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// MatchIndexDiagram
// ──────────────────────────────────────────────
export function MatchIndexDiagram() {
  // 사원 명단 — 전체 범위 A1:D6. 범위 시작행이 1행이라 범위 안 행·열 번호가 시트 좌표와 그대로 일치.
  const emp = [
    ['사원명', '부서', '직급', '급여'],
    ['김철수', '영업부', '대리', 3200],
    ['이영희', '인사부', '과장', 3800],
    ['박민수', '총무부', '사원', 2700],
    ['최지훈', '영업부', '부장', 4500],
    ['정수연', '인사부', '대리', 3100],
  ];

  // 범위 A1:D6=파란 바깥 테두리 / 행 번호 A4:D4=노란 바깥 테두리 / 열 번호 C1:C6=초록 바깥 테두리 / 사원 C4=옅은 빨강 채우기
  const empSt = (ri, ci) => {
    const isHeader = ri === 0;
    const s = isHeader ? { bold: true, color: C.blueLight, bg: C.blueCard } : {};
    // 범위(파랑) — A1:D6 바깥 테두리
    if (ri === 0) s.bt = C.blue;
    if (ri === 5) s.bb = C.blue;
    if (ci === 0) s.bl = C.blue;
    if (ci === 3) s.br = C.blue;
    // 행 번호(노랑) — A4:D4 바깥 테두리 (행/열 강조가 범위보다 우선)
    if (ri === 3) { s.bt = C.amber; s.bb = C.amber; if (ci === 0) s.bl = C.amber; if (ci === 3) s.br = C.amber; }
    // 열 번호(초록) — C1:C6 바깥 테두리
    if (ci === 2) { s.bl = C.green; s.br = C.green; if (ri === 0) s.bt = C.green; if (ri === 5) s.bb = C.green; }
    // 사원 셀(C4) — 옅은 빨강 채우기
    if (ri === 3 && ci === 2) { s.bg = 'rgba(239,68,68,0.30)'; s.bold = true; }
    return s;
  };

  // MATCH 표: 첫 열 A1:A6=노란 바깥 테두리(박민수 검색) / 첫 행 A1:D1=초록 바깥 테두리(직급 검색) / 박민수(A4)·직급(C1) 채우기
  const matchSt = (ri, ci) => {
    const isHeader = ri === 0;
    const s = isHeader ? { bold: true, color: C.blueLight, bg: C.blueCard } : {};
    if (ci === 0) { s.bl = C.amber; s.br = C.amber; if (ri === 0) s.bt = C.amber; if (ri === 5) s.bb = C.amber; }
    if (ri === 0) { s.bt = C.green; s.bb = C.green; if (ci === 0) s.bl = C.green; if (ci === 3) s.br = C.green; }
    if (ri === 3 && ci === 0) { s.bg = 'rgba(251,191,36,0.28)'; s.bold = true; }
    if (ri === 0 && ci === 2) { s.bg = 'rgba(34,197,94,0.28)'; s.bold = true; }
    return s;
  };

  // 공통 스타일
  const para = { color: C.text, fontSize: 15, lineHeight: 1.8, margin: '6px 0' };

  return (
    <Wrap>
      <Title>위치 · 추출 함수: INDEX · MATCH</Title>
      <Subtitle>INDEX는 &apos;그 자리의 값&apos;을 꺼내고, MATCH는 &apos;몇 번째인지&apos;를 셉니다.</Subtitle>

      {/* 문제 박스 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.greenLight }}>&apos;박민수&apos;의 직급</b>을 구하시오.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 사원 표 (범위·행·열 바깥 테두리 + C4 채우기 강조) */}
        <div>
          <TableCaption color={C.blueLight}>[표1] 사원 명단</TableCaption>
          <ExcelGrid data={emp} startRow={1} cellStyle={empSt} minColW={72} firstColW={80}
            labelRow={[null, null, { text: '3번째 열', color: C.greenLight }, null]}
            rowLabels={{ 3: { text: '4번째 행', color: C.amber } }} />
        </div>

        {/* Right: INDEX 박스(함수명 → 구문 → 설명 → 수식 → 값) + 박스 아래 보충 설명 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 540 }}>
          <div style={{ background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.greenLight, fontSize: 18, fontWeight: 700 }}>INDEX</div>
            <div style={{ color: C.greenLight, fontSize: 14, fontWeight: 700, opacity: 0.95 }}>구문: =INDEX(범위, 행 번호, 열 번호)</div>
            <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>지정한 범위 안에서 행 번호와 열 번호가 만나는 칸의 값을 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', padding: '4px 0 2px' }}>
              =INDEX(<span style={{ color: C.blueLight }}>A1:D6</span>, <span style={{ color: C.amberLight }}>4</span>, <span style={{ color: C.greenLight }}>3</span>)
            </div>
          </div>
          <div style={{ ...para, marginTop: 12 }}>행 번호·열 번호는 시트의 행·열이 아니라 <b style={{ color: C.blueLight }}>지정한 범위</b> 안에서 몇 번째인지입니다. 지금은 범위가 1행부터 시작해서 시트 번호와 같아 보이지만, 범위가 A2:D6이면 박민수는 3번째 행이 됩니다.</div>
        </div>
      </div>

      {/* MATCH — INDEX와 같은 방식. 위치 번호를 구하는 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', margin: '24px 0 16px' }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>&apos;박민수&apos;가 몇 번째 행</b>인지, <b style={{ color: C.greenLight }}>&apos;직급&apos;이 몇 번째 열</b>인지 구하시오.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 사원 표 (첫 열·첫 행 바깥 테두리 + 박민수·직급 채우기) */}
        <div>
          <TableCaption color={C.blueLight}>[표1] 사원 명단</TableCaption>
          <ExcelGrid data={emp} startRow={1} cellStyle={matchSt} minColW={72} firstColW={80}
            labelRow={[{ text: '4번째', color: C.amber }, null, null, null]}
            rowLabels={{ 0: { text: '3번째', color: C.green } }} />
        </div>

        {/* Right: MATCH 박스(함수명 → 구문 → 설명 → 수식) + 박스 아래 보충 설명 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 540 }}>
          <div style={{ background: C.purpleCard, border: `2px solid ${C.purple}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.purpleLight, fontSize: 18, fontWeight: 700 }}>MATCH</div>
            <div style={{ color: C.purpleLight, fontSize: 14, fontWeight: 700, opacity: 0.95 }}>구문: =MATCH(찾을 값, 범위, [옵션])</div>
            <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>찾을 값이 지정한 범위 안에서 몇 번째에 있는지 위치 번호를 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={{ color: C.text, fontSize: 17, fontWeight: 700, textAlign: 'center', padding: '4px 0 2px', lineHeight: 2 }}>
              <div>=MATCH(<span style={{ color: C.amberLight }}>&quot;박민수&quot;</span>, <span style={{ color: C.amberLight }}>A1:A6</span>, 0)</div>
              <div>=MATCH(<span style={{ color: C.greenLight }}>&quot;직급&quot;</span>, <span style={{ color: C.greenLight }}>A1:D1</span>, 0)</div>
            </div>
          </div>
          <div style={{ ...para, marginTop: 12 }}>
            <div>MATCH는 값이 아니라 위치 번호를 돌려줍니다. 박민수는 첫 열에서 4번째, 직급은 첫 행에서 3번째.</div>
            <div style={{ marginTop: 6 }}>옵션은 0이면 찾을 값과 똑같은 값을 찾고, 1이면 찾을 값보다 작거나 같은 값 중 가장 큰 값(범위가 작은 값→큰 값 순으로 정렬되어 있을 때), -1이면 찾을 값보다 크거나 같은 값 중 가장 작은 값(범위가 큰 값→작은 값 순으로 정렬되어 있을 때)을 찾습니다. 여기서는 똑같은 값을 찾으므로 0을 씁니다.</div>
          </div>
        </div>
      </div>
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
// ChooseIntroDiagram — CHOOSE 간단 소개 카드 (개념5, 개념1 인트로 카드 형식)
// ──────────────────────────────────────────────
export function ChooseIntroDiagram() {
  return (
    <Wrap>
      <Title>CHOOSE</Title>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 460px', maxWidth: 600, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>CHOOSE</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>구문: =CHOOSE(순번, 값1, 값2, 값3, ...)</div>
          <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6 }}>앞의 숫자(순번)로 뒤에 나열한 값 중 하나를 골라 반환합니다. 순번이 1이면 값1, 2이면 값2, 3이면 값3 … 순번은 1부터 시작합니다.</div>
          <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '6px 0 2px' }} />
          <div style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' }}>
            =CHOOSE(<span style={{ color: C.amberLight }}>2</span>, &quot;대상&quot;, <span style={{ color: C.greenLight }}>&quot;금상&quot;</span>, &quot;은상&quot;) = <span style={{ color: C.greenLight }}>&quot;금상&quot;</span>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// IndexMatchDiagram
// ──────────────────────────────────────────────
export function IndexMatchDiagram() {
  // [표5] 상품 판매 현황 — F26:I32. 데이터 행은 27~32(6행). 상품명(F)·분류(G)·판매량(H)·매출액(I, 만원).
  const prod = [
    ['상품명', '분류', '판매량', '매출액'],   // 26행 머리글
    ['노트북', '전자', 120, '3,600'],         // 27
    ['청소기', '가전', 85, '1,700'],          // 28
    ['에어컨', '가전', 60, '4,800'],          // 29 ← 매출액 최고
    ['모니터', '전자', 140, '2,100'],         // 30
    ['냉장고', '가전', 45, '4,050'],          // 31
    ['키보드', '전자', 300, '900'],           // 32
  ];
  // INDEX 범위=표 전체 F27:I32(제목행 26 제외)=초록 바깥 테두리 / 매출액(I27:I32)=옅은 노랑 채우기(MAX·MATCH 대상)
  // 최고 매출액(4,800, 29행)=진한 노랑 채우기 / 결과 상품명(에어컨, 29행)=초록 채우기
  const prodSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = {};
    // INDEX 범위(초록) — 표 전체 F27:I32 바깥 테두리
    if (ri === 1) s.bt = C.green;
    if (ri === 6) s.bb = C.green;
    if (ci === 0) s.bl = C.green;
    if (ci === 3) s.br = C.green;
    // 최고 매출액(4,800, 29행=데이터 3행) — 주황 채우기
    if (ri === 3 && ci === 3) { s.bg = 'rgba(251,146,60,0.45)'; s.bold = true; }
    // 결과 상품명(에어컨, 29행) — 초록 채우기
    if (ri === 3 && ci === 0) { s.bg = 'rgba(34,197,94,0.30)'; s.bold = true; }
    return s;
  };

  // 단계 박스 공통
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const synSt = (c) => ({ color: c, fontSize: 14, fontWeight: 700, opacity: 0.95 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>MAX로 최고값을 구하고, MATCH로 그 위치를 찾아, INDEX로 그 자리의 값을 꺼냅니다.</Title>

      {/* 문제 박스 (실기 기출 형식: [표5] 상품 판매 현황) */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표5]에서 <b style={{ color: C.amberLight }}>매출액[I27:I32]</b>이 <b style={{ color: C.amberLight }}>가장 높은</b> 상품의 <b style={{ color: C.greenLight }}>상품명[F27:F32]</b>을 찾아 [J32] 셀에 표시하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, marginTop: 6 }}>▶ INDEX, MATCH, MAX 함수 사용</div>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 상품 판매 현황 표 */}
        <div>
          <TableCaption color={C.blueLight}>[표5] 상품 판매 현황 (매출액 단위: 만원)</TableCaption>
          <ExcelGrid data={prod} startCol={5} startRow={26} cellStyle={prodSt} minColW={58} firstColW={78}
            rowLabels={{ 3: { text: '← 3번째', color: C.purpleLight } }}
            labelRow={[{ text: '1번째', color: C.greenLight }, null, null, null]} />
        </div>

        {/* Right: 3단계 풀이 박스 (MAX → MATCH → INDEX) */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* STEP 1 — MAX */}
          <div style={{ ...boxBase, background: '#2a1206', border: `2px solid ${C.orange}` }}>
            <div style={nameSt(C.orangeLight)}>1단계 · MAX — 최고값</div>
            <div style={synSt(C.orangeLight)}>구문: =MAX(범위)</div>
            <div style={descSt}>매출액 범위에서 가장 큰 값을 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =MAX(<span style={{ color: C.text }}>I27:I32</span>) = <span style={{ color: C.amberLight }}>4,800</span>
            </div>
          </div>

          {/* STEP 2 — MATCH */}
          <div style={{ ...boxBase, background: C.purpleCard, border: `2px solid ${C.purple}` }}>
            <div style={nameSt(C.purpleLight)}>2단계 · MATCH — 위치 번호</div>
            <div style={synSt(C.purpleLight)}>구문: =MATCH(찾을 값, 범위, [옵션])</div>
            <div style={descSt}>MAX로 구한 최고 매출액을 매출액 범위에서 몇 번째에 있는지 위치 번호를 반환합니다.<br />MAX로 가장 큰 값을 찾은 곳이 I27:I32이므로, MATCH의 범위도 제목 셀인 I26을 뺀 I27:I32로 지정합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =MATCH(<span style={{ color: C.amberLight }}>MAX(I27:I32)</span>, <span style={{ color: C.text }}>I27:I32</span>, 0) = <span style={{ color: C.purpleLight }}>3</span>
            </div>
          </div>

          {/* STEP 3 — INDEX */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>3단계 · INDEX — 값 추출</div>
            <div style={synSt(C.greenLight)}>구문: =INDEX(범위, 행 번호, 열 번호)</div>
            <div style={descSt}>범위를 표 전체로 잡고, 앞 단계 MATCH가 제목 셀(I26)을 뺀 매출액 범위를 지정했으므로 INDEX 범위도 표 전체를 선택하되 제목 행은 빼고 F27:I32로 지정합니다.<br />행 번호에는 MAX로 구한 최고 매출액이 MATCH가 찾은 매출액 범위에서 몇 번째인지, 그 위치 번호를 넣습니다.<br />열 번호에는 지정한 범위에서 꺼내려는 값이 있는 열 번호를 넣습니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =INDEX(<span style={{ color: C.greenLight }}>F27:I32</span>, <span style={{ color: C.purpleLight }}>MATCH(</span><span style={{ color: C.amberLight }}>MAX(I27:I32)</span><span style={{ color: C.purpleLight }}>, I27:I32, 0)</span>, <span style={{ color: C.greenLight }}>1</span>) = <span style={{ color: C.greenLight }}>&quot;에어컨&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// VlookupLimitDiagram — VLOOKUP은 못 찾고 INDEX+MATCH는 찾는 사례
// ──────────────────────────────────────────────
export function VlookupLimitDiagram() {
  // [표6] 사원 정보 — F26:H30. 데이터 27~30. 부서(F)·이름(G)·사번(H).
  // 찾을 값(사번)이 첫 열이 아니고, 가져올 값(부서)이 그 왼쪽에 있어 VLOOKUP 불가.
  const emp = [
    ['부서', '이름', '사번'],       // 26행 머리글
    ['영업부', '김영호', 'A101'],   // 27
    ['인사부', '이수진', 'A102'],   // 28
    ['총무부', '박민수', 'A103'],   // 29 ← 찾는 사번
    ['개발부', '최지훈', 'A104'],   // 30
  ];
  // 표5(개념4)와 동일 형식: INDEX 범위=표 전체 F27:H30 초록 바깥 테두리
  // MATCH가 찾은 사번(A103, 29행)=주황 채우기 / INDEX 결과 부서(총무부, 29행)=초록 채우기
  const empSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = {};
    // INDEX 범위(초록) — 표 전체 F27:H30 바깥 테두리
    if (ri === 1) s.bt = C.green;
    if (ri === 4) s.bb = C.green;
    if (ci === 0) s.bl = C.green;
    if (ci === 2) s.br = C.green;
    // MATCH가 찾은 사번(A103, 29행=데이터 3행) — 주황 채우기
    if (ri === 3 && ci === 2) { s.bg = 'rgba(251,146,60,0.45)'; s.bold = true; }
    // INDEX 결과 부서(총무부, 29행) — 초록 채우기
    if (ri === 3 && ci === 0) { s.bg = 'rgba(34,197,94,0.30)'; s.bold = true; }
    return s;
  };

  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 15.5, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>VLOOKUP은 못 찾고, INDEX+MATCH는 찾는다</Title>
      <Subtitle>찾을 값(사번)이 표의 첫 열이 아니고, 가져올 값(부서)이 그 왼쪽에 있는 경우</Subtitle>

      {/* 문제 박스 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표6]에서 <b style={{ color: C.amberLight }}>사번[H27:H30]</b>이 <b style={{ color: C.amberLight }}>&quot;A103&quot;</b>인 사원의 <b style={{ color: C.greenLight }}>부서[F27:F30]</b>를 찾아 [J30] 셀에 표시하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, marginTop: 6 }}>▶ INDEX, MATCH 함수 사용</div>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 사원 정보 표 */}
        <div>
          <TableCaption color={C.blueLight}>[표6] 사원 정보</TableCaption>
          <ExcelGrid data={emp} startCol={5} startRow={26} cellStyle={empSt} minColW={66} firstColW={72} />
        </div>

        {/* Right: VLOOKUP ❌ vs INDEX+MATCH ✅ */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* VLOOKUP ❌ */}
          <div style={{ ...boxBase, background: C.redDark, border: `2px solid ${C.red}` }}>
            <div style={nameSt(C.redLight)}>❌ VLOOKUP — 못 찾음</div>
            <div style={descSt}>VLOOKUP은 <b style={{ color: C.redLight }}>참조 범위의 첫 열</b>에서만 찾을 값을 찾고, 결과도 <b style={{ color: C.redLight }}>오른쪽 열</b>에서만 가져옵니다. 사번은 첫 열이 아니라 세 번째 열에 있어 첫 열(부서)에서 &quot;A103&quot;을 찾지 못하고, 부서는 사번의 왼쪽이라 애초에 가져올 수 없습니다.</div>
            <div style={{ borderTop: `1px solid ${C.red}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =VLOOKUP(<span style={{ color: C.amberLight }}>&quot;A103&quot;</span>, F27:H30, 1, 0) = <span style={{ color: C.redLight }}>#N/A</span>
            </div>
          </div>

          {/* INDEX+MATCH ✅ */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>✅ INDEX + MATCH — 찾음</div>
            <div style={descSt}>참조 범위를 표 전체(F27:H30)로 넣고, MATCH가 <b style={{ color: C.amberLight }}>&quot;A103&quot;</b>을 사번 범위에서 <b style={{ color: C.amberLight }}>세로로</b> 찾아 위치(3)를 구한 뒤, INDEX가 그 위치의 <b style={{ color: C.greenLight }}>부서(1열)</b>를 가져옵니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =INDEX(<span style={{ color: C.greenLight }}>F27:H30</span>, <span style={{ color: C.purpleLight }}>MATCH(</span><span style={{ color: C.amberLight }}>&quot;A103&quot;</span><span style={{ color: C.purpleLight }}>, H27:H30, 0)</span>, <span style={{ color: C.greenLight }}>1</span>) = <span style={{ color: C.greenLight }}>&quot;총무부&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// ChooseRankDiagram — RANK.EQ + CHOOSE 조합 (개념학습5, 실제 시험 형식)
// MAX→MATCH→INDEX 단계 박스(개념4)와 같은 형식으로, 순위→값 선택을 두 단계로 보여준다.
// ──────────────────────────────────────────────
export function ChooseRankDiagram() {
  // [표7] 사원 판매 실적 — F26:H30. 데이터 27~30. 사원명(F)·판매액(G, 만원)·포상(H).
  const prod = [
    ['사원명', '판매액', '포상'],   // 26행 머리글
    ['김하늘', '4,500', '금상'],    // 27 ← 예시(2위)
    ['이준호', '5,200', ''],        // 28 (1위)
    ['박서연', '3,100', ''],        // 29 (4위)
    ['정민수', '3,800', ''],        // 30 (3위)
  ];
  // 판매액(G27:G30)=RANK.EQ 참조 범위: 옅은 노랑 채우기 + 주황 바깥 테두리
  // 예시 행(김하늘, 27행=데이터 1행): 판매액 → 진한 주황 / 포상 → 초록("금상")
  const prodSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = {};
    // 판매액 열(G27:G30) — RANK.EQ 참조 범위
    if (ci === 1) {
      s.bg = 'rgba(251,191,36,0.14)';
      s.bl = C.orange; s.br = C.orange;
      if (ri === 1) s.bt = C.orange;
      if (ri === 4) s.bb = C.orange;
    }
    // 예시 판매액(4,500, 27행) — 진한 주황 채우기 (RANK.EQ 대상 값)
    if (ri === 1 && ci === 1) { s.bg = 'rgba(251,146,60,0.45)'; s.bold = true; }
    // 예시 포상(금상, 27행) — 초록 채우기 (CHOOSE 결과)
    if (ri === 1 && ci === 2) { s.bg = 'rgba(34,197,94,0.30)'; s.bold = true; s.color = C.greenLight; }
    return s;
  };

  // 단계 박스 공통 (개념4와 동일)
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const synSt = (c) => ({ color: c, fontSize: 14, fontWeight: 700, opacity: 0.95 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>조합 함수: RANK.EQ + CHOOSE</Title>
      <Subtitle>RANK.EQ로 순위를 구하고, CHOOSE로 그 순위에 놓인 값을 선택합니다.</Subtitle>

      {/* 문제 박스 (실기 기출 형식: [표7] 사원 판매 실적) */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표7]에서 <b style={{ color: C.amberLight }}>판매액[G27:G30]</b>이 높은 순으로 순위를 매겨, 각 사원의 <b style={{ color: C.greenLight }}>포상[H27:H30]</b>을 구하시오. (8점)
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, lineHeight: 1.85, marginTop: 6 }}>
          <div>▶ 1위는 &quot;대상&quot;, 2위는 &quot;금상&quot;, 3위는 &quot;은상&quot;, 4위는 &quot;장려상&quot;으로 표시함</div>
          <div>▶ RANK.EQ, CHOOSE 함수 사용</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: 사원 판매 실적 표 */}
        <div>
          <TableCaption color={C.blueLight}>[표7] 사원 판매 실적 (판매액 단위: 만원)</TableCaption>
          <ExcelGrid data={prod} startCol={5} startRow={26} cellStyle={prodSt} minColW={72} firstColW={78}
            rowLabels={{ 1: { text: '← 2위', color: C.purpleLight } }} />
        </div>

        {/* Right: 2단계 풀이 박스 (RANK.EQ → CHOOSE) */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* STEP 1 — RANK.EQ */}
          <div style={{ ...boxBase, background: C.purpleCard, border: `2px solid ${C.purple}` }}>
            <div style={nameSt(C.purpleLight)}>1단계 · RANK.EQ — 순위 구하기</div>
            <div style={synSt(C.purpleLight)}>구문: =RANK.EQ(수, 참조 범위, [옵션])</div>
            <div style={descSt}>판매액이 참조 범위에서 몇 위인지 순위를 반환합니다. 옵션을 생략하거나 0이면 큰 값이 1위인 내림차순입니다. 자동 채우기로 복사하므로 참조 범위는 $로 고정합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =RANK.EQ(<span style={{ color: C.amberLight }}>G27</span>, <span style={{ color: C.text }}>$G$27:$G$30</span>) = <span style={{ color: C.purpleLight }}>2</span>
            </div>
          </div>

          {/* STEP 2 — CHOOSE */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>2단계 · CHOOSE — 순위로 값 선택</div>
            <div style={synSt(C.greenLight)}>구문: =CHOOSE(순번, 값1, 값2, 값3, ...)</div>
            <div style={descSt}>1단계에서 구한 순위를 순번으로 넣으면, 그 순서에 놓인 포상을 선택해 반환합니다. 김하늘은 2위이므로 두 번째 값 &quot;금상&quot;이 나옵니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={{ ...formulaSt, fontSize: 15 }}>
              =CHOOSE(<span style={{ color: C.purpleLight }}>RANK.EQ(G27,$G$27:$G$30)</span>, &quot;대상&quot;, <span style={{ color: C.greenLight }}>&quot;금상&quot;</span>, &quot;은상&quot;, &quot;장려상&quot;) = <span style={{ color: C.greenLight }}>&quot;금상&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}
