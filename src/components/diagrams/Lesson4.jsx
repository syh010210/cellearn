import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, ArrowDown, ArrowRight, C } from './shared.jsx';

// ──────────────────────────────────────────────
// VlookupDiagram
// ──────────────────────────────────────────────
export function VlookupDiagram() {
  const tableRows = [
    { code: 'A-101', title: '파이썬 기초',           highlight: false },
    { code: 'B-102', title: '자바스크립트 완전정복', highlight: true  },
    { code: 'C-103', title: '리액트 실무',            highlight: false },
  ];

  const cellBase = (highlight) => ({
    background: highlight ? '#14532d' : C.bgDark,
    border: `1px solid ${highlight ? C.green : C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '9px 12px', fontSize: 15,
    color: highlight ? C.greenLight : C.textMuted,
    fontWeight: highlight ? 700 : 400,
  });

  return (
    <Wrap>
      <Title>데이터 검색 함수: VLOOKUP · HLOOKUP</Title>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left: example */}
        <div style={{ flex: 1.2 }}>
          {/* Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
            {[['도서코드', '도서명']].map(([h1, h2]) => ([
              <div key="h1" style={{ ...cellBase(false), background: C.blueCard, color: C.blueLight, fontWeight: 700, fontSize: 15, border: `1px solid ${C.blueDim}` }}>{h1}</div>,
              <div key="h2" style={{ ...cellBase(false), background: C.blueCard, color: C.blueLight, fontWeight: 700, fontSize: 15, border: `1px solid ${C.blueDim}` }}>{h2}</div>,
            ]))}
            {tableRows.map((row, i) => ([
              <div key={`c${i}`} style={cellBase(row.highlight)}>{row.code}</div>,
              <div key={`t${i}`} style={{
                ...cellBase(row.highlight),
                justifyContent: 'space-between', gap: 8,
              }}>
                <span>{row.title}</span>
                {row.highlight && (
                  <span style={{
                    background: C.green, color: '#0a2e1c',
                    fontSize: 12, fontWeight: 700,
                    borderRadius: 4, padding: '2px 6px',
                  }}>★ 검색결과</span>
                )}
              </div>,
            ]))}
          </div>

          {/* Flow description */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div style={{
              background: C.amberBg, border: `1px solid ${C.amber}`,
              borderRadius: 6, padding: 8, color: C.amberLight, fontSize: 15, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>①&nbsp;&nbsp;A열에서 &#39;B-102&#39; 검색</div>
            <div style={{ alignSelf: 'center' }}>
              <ArrowDown color={C.amber} size={32} />
            </div>
            <div style={{
              background: C.amberBg, border: `1px solid ${C.amber}`,
              borderRadius: 6, padding: 8, color: C.amberLight, fontSize: 15, width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>②&nbsp;&nbsp;해당 행 2번째 열 반환</div>
          </div>

          {/* Formula */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.border}`,
            borderRadius: 6, padding: 10, marginTop: 8,
            color: C.textMuted, fontSize: 15, fontFamily: 'monospace', textAlign: 'center',
          }}>
            =VLOOKUP(&quot;B-102&quot;, A2:B4, 2, 0)
          </div>

          {/* Result */}
          <div style={{
            background: '#14532d', border: `1px solid ${C.green}`,
            borderRadius: 6, padding: 10, marginTop: 4,
            color: C.greenLight, fontSize: 16, fontWeight: 700, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            &quot;자바스크립트 완전정복&quot;
          </div>
        </div>

        {/* Right: comparison cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* VLOOKUP */}
          <div style={{
            background: C.blueCard, border: `2px solid ${C.blueDim}`,
            borderRadius: 10, padding: 16,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>VLOOKUP</div>
            <div style={{ color: C.blueLight, fontSize: 16, textAlign: 'center' }}>첫 번째 열 ↓ 검색</div>
            <div style={{ color: C.textMuted, fontSize: 15, textAlign: 'center' }}>같은 행의 지정 열 번호 반환</div>
          </div>

          {/* HLOOKUP */}
          <div style={{
            background: '#251005', border: `2px solid ${C.orange}`,
            borderRadius: 10, padding: 16,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>HLOOKUP</div>
            <div style={{ color: C.orangeLight, fontSize: 16, textAlign: 'center' }}>첫 번째 행 → 검색</div>
            <div style={{ color: C.textMuted, fontSize: 15, textAlign: 'center' }}>같은 열의 지정 행 번호 반환</div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=VLOOKUP(찾을 값, 범위, 열 번호, 0)  ·  =HLOOKUP(찾을 값, 범위, 행 번호, 0)</BLine>
        <BLine color={C.blue} bold>※ 마지막 인수 0 = 정확히 일치</BLine>
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
      <Title>위치·추출 함수: MATCH · INDEX</Title>
      <Subtitle>MATCH는 &apos;몇 번째?&apos;를 찾고 — INDEX는 &apos;그 번째 값&apos;을 꺼냅니다</Subtitle>

      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        {/* Left: MATCH panel */}
        <div style={{
          flex: 1, background: C.purpleCard, border: `2px solid ${C.purple}`,
          borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ color: C.purpleLight, fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ① MATCH
          </div>
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
          <div style={{ color: C.greenLight, fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ② INDEX
          </div>
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
        <BLine color={C.blue} bold>※ VLOOKUP: 첫 열만 검색  ·  INDEX+MATCH: 어느 열이든 자유롭게</BLine>
      </BottomBar>
    </Wrap>
  );
}
