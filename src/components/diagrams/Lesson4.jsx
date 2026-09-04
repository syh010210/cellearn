import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, ArrowDown, ArrowRight, ExcelGrid, TableCaption, C } from './shared.jsx';

// ──────────────────────────────────────────────
// VlookupDiagram
// ──────────────────────────────────────────────
// ① 두 개의 표(따로) — 세로 참조 범위를 VLOOKUP으로 검색 (대출금 내역 + 코드표)
export function VlookupDiagram() {
  const loan = [
    ['사원코드', '사원명', '판매액', '성과급률'],
    ['101-A-2201', '박서준', '24,000,000', '5.0%'],
    ['102-B-3302', '김민지', '9,800,000', '3.5%'],
    ['103-C-4503', '이도현', '13,500,000', '2.0%'],
  ];
  const loanSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ri === 1 && ci === 3) return { bold: true, color: C.greenLight, bg: C.greenBg };
    if (ri === 1 && ci === 0) return { bold: true, color: C.amberLight, bg: C.amberBg };
    return {};
  };
  const code = [
    ['등급', '직무', '성과급률'],
    ['A', '영업', '5.0%'],
    ['B', '관리', '3.5%'],
    ['C', '지원', '2.0%'],
  ];
  const codeSt = (ri) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ri === 1) return { bold: true, color: C.amberLight, bg: C.amberBg };
    return {};
  };
  return (
    <Wrap>
      <Title>① 세로 참조 범위 → VLOOKUP</Title>
      <Subtitle>실제 시험에서는 위 문제처럼 MID 등 다양한 함수를 이용해 찾을 값을 만들어 풀어야 합니다</Subtitle>

      {/* 실제 시험 형식 문제 — 상단 가로 전체 */}
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

      {/* 왼쪽: 표 2개 · 오른쪽: 풀이 박스 */}
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

        {/* VLOOKUP 풀이 박스 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
          <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 0)</div>
          <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
          <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
            =VLOOKUP(<span style={{ color: C.amberLight }}>MID(A3,5,1)</span>, <span style={{ color: C.blueLight }}>$A$12:$C$14</span>, <span style={{ color: C.greenLight }}>3</span>, 0)
            <span style={{ color: C.greenLight }}> → 5.0%</span>
          </div>
          {[
            { label: '찾을 값', code: 'MID(A3,5,1)', color: C.amberLight,
              desc: '코드 전체는 등급표에 없으므로, 사원코드에서 다섯 번째 글자(등급) 한 개만 뽑아와야 찾을 수 있습니다.' },
            { label: '참조 범위', code: '$A$12:$C$14', color: C.blueLight,
              desc: '값을 찾아오기 위해 선택하는 참조 범위입니다. \n첫 열(A·B·C)에 찾을 값이 있어야 제대로 찾습니다. \n만약 찾을 값이 사원코드의 다섯 번째 문자가 아니라 직무였다면, 첫 열에 직무가 오도록 B12:C14를 선택해야 합니다. \n제목행(등급·직무·성과급률)은 실제 데이터가 아니라 열 이름일 뿐이라 찾을 값 후보가 아니므로 범위에서 빼고 A12부터 선택합니다.' },
            { label: '열 번호', code: '3', color: C.greenLight,
              desc: '반환할 값이 성과급률이므로, 선택한 범위에서 성과급률이 있는 열 번호 3을 넣습니다.' },
          ].map((p) => (
            <div key={p.label} style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.label} {p.code}</span>
              <span style={{ color: C.text }}> — {p.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            <span style={{ color: C.blueLight, fontWeight: 700 }}>참조 범위는 왜 $로 고정?</span>
            <span style={{ color: C.text }}> — 수식을 복사(자동 채우기)할 때 범위가 밀리면 안 되기 때문입니다. 한 칸만 계산하는 문제라면 고정할 필요 없습니다.</span>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ② 두 개의 표(따로) — 가로 참조 범위를 HLOOKUP으로 검색 (판매현황 + 상품단가표)
export function HlookupTwoTableDiagram() {
  const sales = [
    ['지점명', '담당자', '도서코드', '판매부수', '매출액'],
    ['강남', '정우성', 22, 8, '144,000'],
    ['강남', '한소희', 44, 15, '142,500'],
    ['송파', '남주혁', 11, 6, '72,000'],
  ];
  const salesSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    if (ri === 1 && ci === 4) return { bold: true, color: C.greenLight, bg: C.greenBg };
    if (ri === 1 && ci === 2) return { bold: true, color: C.amberLight, bg: C.amberBg };
    return {};
  };
  const price = [
    ['도서코드', 11, 22, 33, 44],
    ['정가', '12,000', '18,000', '25,000', '9,500'],
    ['원가', '9,600', '14,400', '20,000', '7,600'],
  ];
  const priceSt = (ri, ci) => {
    if (ri === 0) return (ci === 2) ? { bold: true, color: C.amberLight, bg: C.amberBg } : { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    if (ri === 1 && ci === 2) return { bold: true, color: C.greenLight, bg: C.greenBg };
    return {};
  };
  return (
    <Wrap>
      <Title>② 가로 참조 범위 → HLOOKUP</Title>
      <Subtitle>참조 범위의 데이터가 가로로 나열돼 있으면, 첫 행에서 찾아 같은 열의 값을 가져옵니다</Subtitle>

      {/* 실제 시험 형식 문제 — 상단 가로 전체 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표2]에서 <b style={{ color: C.amberLight }}>도서코드[C3:C5]</b>와
          <b style={{ color: C.orangeLight }}> [B12:E14]</b> 영역의 표를 이용하여 각 지점의
          <b style={{ color: C.greenLight }}> 매출액[E3:E5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 매출액은 판매부수와 도서의 정가를 곱한 값임</div>
          <div>▶ HLOOKUP 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개 · 오른쪽: 풀이 박스 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.orangeLight}>[표2] 도서 판매현황 — 기준값이 있는 표</TableCaption>
            <ExcelGrid data={sales} startRow={2} cellStyle={salesSt} minColW={72} firstColW={78} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[도서 단가표] 가로 참조 범위</TableCaption>
            <ExcelGrid data={price} startRow={12} cellStyle={priceSt} minColW={80} firstColW={74} />
          </div>
        </div>

        {/* HLOOKUP 풀이 박스 */}
        <div style={{ flex: '1 1 360px', minWidth: 300, maxWidth: 500, background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
          <div style={{ color: C.orange, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =HLOOKUP(찾을 값, 참조 범위, 행 번호, 0)</div>
          <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 행에서 찾을 값을 가로로 찾아 같은 열의 지정 행 값을 반환</div>
          <div style={{ borderTop: `1px solid ${C.orange}`, margin: '8px 0 6px' }} />
          <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
            =D3*HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.orangeLight }}>$B$12:$E$14</span>, <span style={{ color: C.greenLight }}>2</span>, 0)
            <span style={{ color: C.greenLight }}> → 8 × 18,000 = 144,000</span>
          </div>
          {[
            { label: '찾을 값', code: 'C3', color: C.amberLight,
              desc: '도서코드(22)입니다. 단가표의 첫 행에서 이 코드를 가로로 찾습니다.' },
            { label: '참조 범위', code: '$B$12:$E$14', color: C.orangeLight,
              desc: '값을 찾아오기 위해 선택하는 참조 범위입니다. \n첫 행(도서코드 11·22·33·44)에 찾을 값이 있어야 제대로 찾습니다. \n왼쪽 이름 열(도서코드·정가·원가)은 실제 데이터가 아니라 행 이름일 뿐이라 찾을 값 후보가 아니므로 범위에서 빼고 B열부터 선택합니다.' },
            { label: '행 번호', code: '2', color: C.greenLight,
              desc: '반환할 값이 정가이므로, 선택한 범위에서 정가가 있는 행 번호 2를 넣습니다.' },
          ].map((p) => (
            <div key={p.label} style={{ fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              <span style={{ color: p.color, fontWeight: 700 }}>{p.label} {p.code}</span>
              <span style={{ color: C.text }}> — {p.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            <span style={{ color: C.orangeLight, fontWeight: 700 }}>참조 범위는 왜 $로 고정?</span>
            <span style={{ color: C.text }}> — 수식을 복사(자동 채우기)할 때 범위가 밀리면 안 되기 때문입니다. 한 칸만 계산하는 문제라면 고정할 필요 없습니다.</span>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// ③ 한 개의 표 — 기준값과 참조 범위가 같은 표에 있는 VLOOKUP (영어회화 평가)
export function VlookupOneTableDiagram() {
  const data = [
    ['[표4] 영어회화 평가 결과', '', ''],
    ['사원코드', '성적', '성명'],
    ['ds-043', 85, '정지호'],
    ['ds-078', 56, '방정수'],
    ['ds-053', 90, '도지영'],
    ['ds-068', 78, '박철환'],
  ];
  const st = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard, align: 'left' };
    if (ri === 1) return { bold: true, color: C.textMuted, bg: '#0b1220' };
    if (ri === 4 && ci === 0) return { bold: true, color: C.amberLight, bg: C.amberBg };   // 찾을 값 ds-053
    if (ri === 4 && ci === 2) return { bold: true, color: C.greenLight, bg: C.greenBg };   // 결과 도지영
    return {};
  };
  return (
    <Wrap>
      <Title>③ 한 표 안에서 VLOOKUP</Title>
      <Subtitle>기준값과 참조 범위가 같은 표에 있는 경우 — 참조 범위를 따로 두지 않습니다</Subtitle>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ExcelGrid data={data} cellStyle={st} minColW={92} firstColW={104} />
        <div style={{ flex: '1 1 250px', minWidth: 230, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.75 }}>
            사원코드 <b style={{ color: C.amberLight }}>ds-053</b>을 이 표의 첫 열에서 찾아 같은 행의
            <b style={{ color: C.greenLight }}> 성명 “도지영”</b>을 반환합니다. 따로 된 참조 범위 없이 <b>한 표</b> 안에서 끝납니다.
          </div>
          <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 13, color: C.text, lineHeight: 1.7 }}>
            =VLOOKUP(<span style={{ color: C.amberLight }}>&quot;ds-053&quot;</span>, <span style={{ color: C.blueLight }}>$A$3:$C$6</span>, 3, 0)
          </div>
          <div style={{ color: C.greenLight, fontSize: 16, fontWeight: 700 }}>→ 도지영</div>
          <div style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.6 }}>기준값(찾을 값)이 표의 첫 열에 있어야 VLOOKUP으로 찾을 수 있습니다.</div>
        </div>
      </div>
      <BottomBar>
        <BLine>기준값과 참조 범위가 <b style={{ color: C.blueLight }}>같은 표</b>에 있으면 따로 참조 범위를 두지 않고 바로 VLOOKUP</BLine>
      </BottomBar>
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
