import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, Card, ArrowDown, C } from './shared.jsx';

// ──────────────────────────────────────────────
// StatBasicDiagram
// ──────────────────────────────────────────────
export function StatBasicDiagram() {
  const data = [80, 95, 70, 85, 75];
  const cards = [
    { fn: 'AVERAGE', syntax: '구문: =AVERAGE(범위)', desc: '범위 안의 숫자들의 평균', example: '=AVERAGE(B2:B6)', result: '= 81', bg: C.blueCard,   border: C.blueDim,  color: C.blue,        resColor: C.blue        },
    { fn: 'MEDIAN',  syntax: '구문: =MEDIAN(범위)',  desc: '범위를 정렬한 가운데 값', example: '=MEDIAN(B2:B6)',  result: '= 80', bg: C.purpleCard, border: C.purple,   color: C.purpleLight, resColor: C.purpleLight  },
    { fn: 'MAX',     syntax: '구문: =MAX(범위)',     desc: '범위 안의 가장 큰 값',   example: '=MAX(B2:B6)',     result: '= 95', bg: '#0a2e1c',    border: C.green,    color: C.greenLight,  resColor: C.greenLight   },
    { fn: 'MIN',     syntax: '구문: =MIN(범위)',     desc: '범위 안의 가장 작은 값', example: '=MIN(B2:B6)',     result: '= 70', bg: '#300a0a',    border: C.red,      color: C.redLight,    resColor: C.redLight     },
  ];

  const hdrCell = {
    background: '#0b1220', color: C.textDim, fontWeight: 700, fontSize: 14,
    border: `1px solid ${C.border}`, textAlign: 'center', padding: '6px 8px',
  };
  const valCell = {
    background: C.bgDark, color: C.text, fontWeight: 700, fontSize: 22,
    border: `1px solid ${C.border}`, textAlign: 'center', padding: '8px',
  };

  return (
    <Wrap>
      <Title>기본 통계 함수: AVERAGE · MEDIAN · MAX · MIN</Title>
      <Subtitle>예시 데이터</Subtitle>

      {/* Data as a real Excel-like table — 열 머리 2~6, 행 머리 B */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ ...hdrCell, width: 42 }} />
              {[2, 3, 4, 5, 6].map(r => (
                <td key={r} style={{ ...hdrCell, width: 66 }}>{r}</td>
              ))}
            </tr>
            <tr>
              <td style={hdrCell}>B</td>
              {data.map((v, i) => (
                <td key={i} style={valCell}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Four result cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {cards.map(card => (
          <div key={card.fn} style={{
            flex: 1, background: card.bg, border: `2px solid ${card.border}`,
            borderRadius: 10, padding: '12px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 5,
          }}>
            <div style={{ color: card.color, fontSize: 17, fontWeight: 700 }}>{card.fn}</div>
            <div style={{ color: card.color, fontSize: 12.5, fontWeight: 700, opacity: 0.95 }}>{card.syntax}</div>
            <div style={{ color: card.color, fontSize: 14, opacity: 0.85 }}>{card.desc}</div>
            <div style={{ color: card.color, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{card.example}</div>
            <div style={{ color: card.resColor, fontSize: 15, fontWeight: 700 }}>{card.result}</div>
          </div>
        ))}
      </div>

      <BottomBar>
        <BLine>=AVERAGE(범위)  ·  =MEDIAN(범위)  ·  =MAX(범위)  ·  =MIN(범위)</BLine>
        <BLine color={C.blue} bold>모두 숫자 범위 하나(예: B2:B6)를 인수로 받습니다</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatRankDiagram
// ──────────────────────────────────────────────
export function StatRankDiagram() {
  const rankRows = [
    { name: '김철수', score: 95, eq: '1', avg: '1',   hl: false },
    { name: '홍길동', score: 85, eq: '2', avg: '2.5', hl: true  },
    { name: '박지수', score: 78, eq: '4', avg: '4',   hl: false },
    { name: '이영희', score: 85, eq: '2', avg: '2.5', hl: true  },
  ];

  const th = {
    background: C.blueCard, color: C.blueLight, border: `1px solid ${C.blueDim}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 6px', fontSize: 15, fontWeight: 700,
  };
  const td = (hl, extra = {}) => ({
    background: hl ? '#0a2e1c' : C.bgDark, border: `1px solid ${hl ? C.green : C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '7px 6px', fontSize: 15,
    color: hl ? C.greenLight : C.text, fontWeight: hl ? 700 : 400, ...extra,
  });

  // 함수 비교 카드 — 표준 순서: 함수명 → 구문 → 설명 → 수식 → 값
  const FuncCard = ({ name, syntax, desc, formula, value, color, valColor, bg, border }) => (
    <div style={{
      flex: 1, background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: 12,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center',
    }}>
      <div style={{ color, fontSize: 16, fontWeight: 700 }}>{name}</div>
      <div style={{ color, fontSize: 12, fontWeight: 700, opacity: 0.95 }}>{syntax}</div>
      <div style={{ color, fontSize: 12.5, opacity: 0.82, lineHeight: 1.5 }}>{desc}</div>
      <div style={{ color, fontSize: 12, fontWeight: 700, opacity: 0.9 }}>{formula}</div>
      <div style={{ color: valColor, fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );

  return (
    <Wrap>
      <Title>순위·위치 함수: RANK.EQ · RANK.AVG · LARGE · SMALL</Title>

      {/* 순위 데이터 표 — 동점(홍길동·이영희 85점) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 80px 100px 100px' }}>
          {['이름', '점수', 'RANK.EQ', 'RANK.AVG'].map(h => <div key={h} style={th}>{h}</div>)}
          {rankRows.map(r => ([
            <div key={`n${r.name}`} style={td(r.hl)}>{r.name}</div>,
            <div key={`s${r.name}`} style={td(r.hl)}>{r.score}</div>,
            <div key={`e${r.name}`} style={td(false, { color: C.amber, fontWeight: 700 })}>{r.eq}</div>,
            <div key={`a${r.name}`} style={td(false, { color: C.blue, fontWeight: 700 })}>{r.avg}</div>,
          ]))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* 좌(넓게): RANK.EQ vs RANK.AVG */}
        <div style={{ flex: 1.85 }}>
          <div style={{ color: C.amber, fontSize: 15.5, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            RANK.EQ vs RANK.AVG — 동점(85점) 처리 비교
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <FuncCard
              name="RANK.EQ" syntax="구문: =RANK.EQ(값, 범위, [정렬])"
              desc="동점이면 최상위 순위 부여 (다음 순위 건너뜀)"
              formula="=RANK.EQ(B3, $B$2:$B$5, 0)" value="= 2"
              color={C.greenLight} valColor={C.greenLight} bg="#0a2e1c" border={C.green}
            />
            <FuncCard
              name="RANK.AVG" syntax="구문: =RANK.AVG(값, 범위, [정렬])"
              desc="동점이면 순위들의 평균 부여"
              formula="=RANK.AVG(B3, $B$2:$B$5, 0)" value="= 2.5"
              color={C.blueLight} valColor={C.blueLight} bg={C.blueCard} border={C.blueDim}
            />
          </div>
        </div>

        {/* 우(좁게): LARGE vs SMALL */}
        <div style={{ flex: 1 }}>
          <div style={{ color: C.purpleLight, fontSize: 15.5, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            LARGE vs SMALL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FuncCard
              name="LARGE" syntax="=LARGE(범위, K)" desc="K번째로 큰 값"
              formula="=LARGE(B2:B5, 2)" value="= 85"
              color={C.orange} valColor={C.orange} bg="#251005" border={C.orange}
            />
            <FuncCard
              name="SMALL" syntax="=SMALL(범위, K)" desc="K번째로 작은 값"
              formula="=SMALL(B2:B5, 1)" value="= 78"
              color={C.purpleLight} valColor={C.purpleLight} bg={C.purpleCard} border={C.purple}
            />
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.blue} bold>정렬기준 0 = 내림차순(높을수록 1등) · 참조범위는 절대참조($)로 고정</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatCountDiagram
// ──────────────────────────────────────────────
export function StatCountDiagram() {
  const rowStyle = (active, activeBg, activeBorder) => ({
    background: active ? activeBg : C.bgDark,
    border: `1.5px solid ${active ? activeBorder : C.border}`,
    borderRadius: 6, padding: '6px 8px', marginBottom: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15,
    color: active ? undefined : C.textSlate,
  });

  return (
    <Wrap>
      <Title>개수 세기 함수: COUNT · COUNTA · COUNTBLANK</Title>
      <Subtitle>같은 범위(B2:B4)도 함수에 따라 세는 기준이 다릅니다</Subtitle>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left: data column */}
        <div style={{ width: 180, flexShrink: 0 }}>
          {/* Header */}
          <div style={{
            background: C.blueCard, border: `1px solid ${C.blueDim}`,
            borderRadius: 6, padding: 12, textAlign: 'center',
            color: C.blueLight, fontSize: 16, fontWeight: 700, marginBottom: 4,
          }}>
            데이터 / 시험점수 (B열)
          </div>
          {/* B2 */}
          <div style={{
            background: C.blueCard, border: `2.5px solid ${C.blueDim}`,
            borderRadius: 6, padding: 10, textAlign: 'center', marginBottom: 4,
          }}>
            <div style={{ color: C.blue, fontSize: 22, fontWeight: 700 }}>90</div>
            <div style={{ color: C.blueLight, fontSize: 14 }}>숫자 (Number)</div>
          </div>
          {/* B3 */}
          <div style={{
            background: '#251005', border: `2.5px solid ${C.orange}`,
            borderRadius: 6, padding: 10, textAlign: 'center', marginBottom: 4,
          }}>
            <div style={{ color: C.orange, fontSize: 22, fontWeight: 700 }}>결시</div>
            <div style={{ color: C.orangeLight, fontSize: 14 }}>텍스트 (Text)</div>
          </div>
          {/* B4 */}
          <div style={{
            background: C.bgDark, border: `1.5px dashed ${C.textSlate}`,
            borderStyle: 'dashed',
            borderRadius: 6, padding: 10, textAlign: 'center',
          }}>
            <div style={{ color: C.textSlate, fontSize: 17, fontStyle: 'italic' }}>(빈 칸)</div>
            <div style={{
              display: 'inline-block',
              border: `1px solid ${C.textSlate}`,
              borderRadius: 4, padding: '1px 6px',
              color: C.textSlate, fontSize: 14, marginTop: 2,
            }}>Empty</div>
          </div>
        </div>

        {/* Right: three cards */}
        <div style={{ flex: 1, display: 'flex', gap: 12 }}>
          {/* COUNT */}
          <div style={{
            flex: 1, background: C.blueCard, border: `2px solid ${C.blueDim}`,
            borderRadius: 10, padding: 12,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 3 }}>COUNT</div>
            <div style={{ color: C.blue, fontSize: 12.5, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>=COUNT(범위)</div>
            <div style={{ color: C.blueLight, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>숫자 셀만 셉니다</div>
            <div style={{ ...rowStyle(true, '#1e3a5f', C.blueDim), color: C.blue, fontWeight: 700 }}>90  ✓ 카운트</div>
            <div style={rowStyle(false)}>결시  ✗ 제외</div>
            <div style={rowStyle(false)}>(빈칸)  ✗ 제외</div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
            <div style={{
              background: '#1e3a5f', border: `2px solid ${C.blueDim}`,
              borderRadius: 6, padding: 8, textAlign: 'center',
              color: C.blue, fontSize: 22, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>결과 = 1</div>
          </div>

          {/* COUNTA */}
          <div style={{
            flex: 1, background: '#0a2e1c', border: `2px solid ${C.green}`,
            borderRadius: 10, padding: 12,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ color: C.greenLight, fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 3 }}>COUNTA</div>
            <div style={{ color: C.greenLight, fontSize: 12.5, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>=COUNTA(범위)</div>
            <div style={{ color: C.green, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>비어있지 않은 셀</div>
            <div style={{ ...rowStyle(true, '#14532d', C.green), color: C.greenLight, fontWeight: 700 }}>90  ✓ 카운트</div>
            <div style={{ ...rowStyle(true, '#14532d', C.green), color: C.greenLight, fontWeight: 700 }}>결시  ✓ 카운트</div>
            <div style={rowStyle(false)}>(빈칸)  ✗ 제외</div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
            <div style={{
              background: '#14532d', border: `2px solid ${C.green}`,
              borderRadius: 6, padding: 8, textAlign: 'center',
              color: C.greenLight, fontSize: 22, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>결과 = 2</div>
          </div>

          {/* COUNTBLANK */}
          <div style={{
            flex: 1, background: C.bg, border: `2px solid ${C.textSlate}`,
            borderRadius: 10, padding: 12,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ color: C.textMuted, fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 3 }}>COUNTBLANK</div>
            <div style={{ color: C.textMuted, fontSize: 12.5, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>=COUNTBLANK(범위)</div>
            <div style={{ color: C.textDim, fontSize: 15, textAlign: 'center', marginBottom: 8 }}>빈 셀만 셉니다</div>
            <div style={rowStyle(false)}>90  ✗ 제외</div>
            <div style={rowStyle(false)}>결시  ✗ 제외</div>
            <div style={{ ...rowStyle(true, C.bg, C.textSlate), color: C.textMuted, fontWeight: 700, border: `2.5px solid ${C.textSlate}` }}>(빈칸)  ✓ 카운트</div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: '8px 0' }} />
            <div style={{
              background: C.bg, border: `2px solid ${C.textSlate}`,
              borderRadius: 6, padding: 8, textAlign: 'center',
              color: C.textMuted, fontSize: 22, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>결과 = 1</div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=COUNT(범위)  ·  =COUNTA(범위)  ·  =COUNTBLANK(범위)</BLine>
        <BLine color={C.blue} bold>COUNT: 숫자만  ·  COUNTA: 숫자+텍스트 모두  ·  COUNTBLANK: 빈 셀만</BLine>
        <BLine>※ 셋 다 인수는 범위 하나: =COUNT(B2:B10)</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatCondCountDiagram
// ──────────────────────────────────────────────
export function StatCondCountDiagram() {
  const tableRows = [
    { title: '과장', salary: '4,000,000', highlight: false },
    { title: '대리 ←', salary: '3,000,000', highlight: true },
    { title: '대리 ←', salary: '2,600,000', highlight: true },
  ];

  const headerCellStyle = {
    background: C.blueCard, color: C.blueLight,
    border: `1px solid ${C.blueDim}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 8px', fontSize: 17, fontWeight: 700,
  };

  const dataCellStyle = (highlight) => ({
    background: highlight ? C.purpleCard : C.bgDark,
    border: `${highlight ? 2.5 : 1}px solid ${highlight ? C.purple : C.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 10px', fontSize: 16,
    color: highlight ? C.purpleLight : C.textMuted,
    fontWeight: highlight ? 700 : 400,
  });

  return (
    <Wrap>
      <Title>조건부 집계 함수: COUNTIF · COUNTIFS · AVERAGEIF · AVERAGEIFS</Title>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left: data table */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 180px' }}>
            <div style={headerCellStyle}>직급</div>
            <div style={headerCellStyle}>급여</div>
            {tableRows.map((row, i) => ([
              <div key={`t${i}`} style={dataCellStyle(row.highlight)}>{row.title}</div>,
              <div key={`s${i}`} style={dataCellStyle(row.highlight)}>{row.salary}</div>,
            ]))}
          </div>

          {/* Condition box */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.textSlate}`,
            borderRadius: 6, padding: 8, marginTop: 8,
            color: C.purple, fontWeight: 700, fontSize: 15, textAlign: 'center',
          }}>
            조건: 직급 = &quot;대리&quot; 인 행만
          </div>
        </div>

        {/* Right: result cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* COUNTIF */}
          <div style={{
            background: C.purpleCard, border: `2px solid ${C.purple}`,
            borderRadius: 10, padding: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ color: C.purpleLight, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>COUNTIF</div>
            <div style={{ color: C.purpleLight, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>구문: =COUNTIF(범위, 조건)</div>
            <div style={{ color: C.purple, fontSize: 15, marginBottom: 6 }}>조건에 맞는 셀 개수</div>
            <div style={{ color: C.purple, fontSize: 13, marginBottom: 6 }}>
              예) =COUNTIF(B2:B4, &quot;대리&quot;)
            </div>
            <div style={{ color: C.purpleLight, fontSize: 40, fontWeight: 700 }}>= 2</div>
          </div>

          {/* AVERAGEIF */}
          <div style={{
            background: '#251005', border: `2px solid ${C.orange}`,
            borderRadius: 10, padding: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>AVERAGEIF</div>
            <div style={{ color: C.orange, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>구문: =AVERAGEIF(조건범위, 조건, [평균범위])</div>
            <div style={{ color: C.orange, fontSize: 15, marginBottom: 6 }}>조건에 맞는 행의 평균</div>
            <div style={{ color: C.orange, fontSize: 12.5, marginBottom: 6 }}>
              예) =AVERAGEIF(B2:B4, &quot;대리&quot;, C2:C4)
            </div>
            <div style={{ color: C.orange, fontSize: 26, fontWeight: 700 }}>= 2,800,000</div>
          </div>
        </div>
      </div>

      {/* COUNTIFS/AVERAGEIFS box */}
      <div style={{
        background: C.bgDark, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: 12, marginTop: 12,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ color: C.textMuted, fontSize: 17, fontWeight: 700, textAlign: 'center' }}>
          COUNTIFS · AVERAGEIFS — 복수 조건
        </div>
        <div style={{ color: C.textDim, fontSize: 15, textAlign: 'center' }}>
          =COUNTIFS(직급범위, &quot;대리&quot;,  급여범위, &quot;&gt;2700000&quot;)
        </div>
        <div style={{ color: C.textDim, fontSize: 15, textAlign: 'center' }}>
          S가 붙으면 조건 쌍을 여러 개 지정할 수 있습니다
        </div>
      </div>

      <BottomBar>
        <BLine>=COUNTIF(조건범위, 조건)  ·  =AVERAGEIF(조건범위, 조건, 평균범위)</BLine>
        <BLine>=COUNTIFS(범위1, 조건1, 범위2, 조건2, ...)  ·  =AVERAGEIFS(평균범위, 범위1, 조건1, ...)</BLine>
        <BLine color={C.blue} bold>※ 조건은 &quot;대리&quot;  &quot;&gt;80&quot; 처럼 따옴표로 감싸서 작성합니다</BLine>
        <BLine>AVERAGEIFS는 평균범위가 맨 앞에 옵니다 (AVERAGEIF와 순서 다름 주의!)</BLine>
      </BottomBar>
    </Wrap>
  );
}
