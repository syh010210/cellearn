// Lesson5.jsx — DB 함수 (DSUM, DAVERAGE, DCOUNT, DMAX) 다이어그램
import { C, Wrap, Title, BottomBar, BLine, Cell, Card } from './shared.jsx';

// ─────────────────────────────────────────────
// DbSumDiagram
// ─────────────────────────────────────────────
export function DbSumDiagram() {
  const gridBase = {
    display: 'grid',
    gap: 0,
  };

  return (
    <Wrap>
      <Title>DB 함수 공통 형식 &amp; DSUM — 단일 조건 합계</Title>

      {/* Three arg cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {/* Card 1 */}
        <div style={{
          flex: 1, background: C.amberBg, border: `1px solid ${C.amber}`,
          borderRadius: 8, padding: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: C.amber, fontWeight: 700, fontSize: 16, textAlign: 'center' }}>① 전체 표 범위</div>
          <div style={{ color: C.amber, fontSize: 15, textAlign: 'center' }}>A1:D4  (헤더 포함)</div>
        </div>
        {/* Card 2 */}
        <div style={{
          flex: 1, background: C.blueCard, border: `1px solid ${C.blueDim}`,
          borderRadius: 8, padding: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: C.blue, fontWeight: 700, fontSize: 16, textAlign: 'center' }}>② 계산할 열 제목</div>
          <div style={{ color: C.blueLight, fontSize: 15, textAlign: 'center' }}>열 번호 또는 제목 셀</div>
        </div>
        {/* Card 3 */}
        <div style={{
          flex: 1, background: C.greenDark, border: `1px solid ${C.green}`,
          borderRadius: 8, padding: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: C.green, fontWeight: 700, fontSize: 16, textAlign: 'center' }}>③ 조건 범위</div>
          <div style={{ color: C.greenLight, fontSize: 15, textAlign: 'center' }}>2행 이상 (헤더+조건)</div>
        </div>
      </div>

      {/* Data table + condition table */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Data table */}
        <div style={{ flex: 1.5, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
          <div style={{ color: C.textMuted, fontSize: 15, marginBottom: 8 }}>데이터 표 (A1:D4)</div>
          <div style={{ ...gridBase, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {/* Header */}
            {['제품ID', '제품군', '단가', '판매량'].map(h => (
              <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>
                {h}
              </Cell>
            ))}
            {/* Row 1 — highlighted */}
            {['W-01', '세탁기✓', '350,000', '5'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>
                {v}
              </Cell>
            ))}
            {/* Row 2 — not matched */}
            {['R-02', '냉장고', '500,000', '3'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textMuted, fontSize: 15 }}>
                {v}
              </Cell>
            ))}
            {/* Row 3 — highlighted */}
            {['W-03', '세탁기✓', '420,000', '8'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>
                {v}
              </Cell>
            ))}
          </div>
        </div>

        {/* Condition table */}
        <div style={{ width: 180, marginLeft: 12, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
          <div style={{ color: C.textMuted, fontSize: 15, marginBottom: 8 }}>조건 범위 (E1:E2)</div>
          <div style={{ ...gridBase, gridTemplateColumns: '1fr' }}>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>
              제품군
            </Cell>
            <Cell bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>
              세탁기
            </Cell>
          </div>
        </div>
      </div>

      {/* Formula and result */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <div style={{
          flex: 1, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.text, fontSize: 15, fontFamily: 'monospace' }}>=DSUM(A1:D4, 4, E1:E2)</span>
        </div>
        <div style={{
          flex: 1, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 8, padding: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.greenLight, fontSize: 20, fontWeight: 700 }}>결과: 5 + 8 = 13</span>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>
          =DSUM(범위, 필드, 조건 범위)  ·  필드는 열 번호(4) 또는 헤더 텍스트(&quot;판매량&quot;)
        </BLine>
        <BLine color={C.blue} bold>
          조건 범위 맨 위 행에 헤더, 아래 행에 조건값을 입력합니다
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbAverageDiagram
// ─────────────────────────────────────────────
export function DbAverageDiagram() {
  const gridBase = { display: 'grid', gap: 0 };

  return (
    <Wrap>
      <Title>DAVERAGE — AND 조건 (나란히 같은 행에 입력)</Title>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left: condition */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            AND 조건 입력
          </div>

          {/* Condition grid 2 cols */}
          <div style={{ ...gridBase, gridTemplateColumns: '1fr 1fr' }}>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>제조사</Cell>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>재고량</Cell>
            <Cell bg={C.amberBg} border={C.amber} style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>A사</Cell>
            <Cell bg={C.amberBg} border={C.amber} style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>{'>=20'}</Cell>
          </div>

          {/* AND explanation card */}
          <div style={{
            background: C.amberBg, border: `1px solid ${C.amber}`,
            borderRadius: 8, padding: 10, marginTop: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ color: C.amber, fontSize: 15, fontWeight: 700, textAlign: 'center' }}>AND = 조건값들을</div>
            <div style={{ color: C.amber, fontSize: 15, textAlign: 'center' }}>같은 행에 나란히 입력</div>
          </div>

          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
            → A사이면서 재고량 20 이상인 행만
          </div>
        </div>

        {/* Right: data */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ ...gridBase, gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {['가전명', '제조사', '단가', '재고량'].map(h => (
              <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {/* included */}
            {['에어컨', 'A사✓', '1,800,000', '25✓'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* excluded */}
            {['청소기', 'B사✗', '1,200,000', '15'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textSlate, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* included */}
            {['스타일러', 'A사✓', '2,000,000', '30✓'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>

          {/* Formula + result */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{
              flex: 1, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.text, fontSize: 14, fontFamily: 'monospace' }}>=DAVERAGE(A1:D4, 3, E1:F2)</span>
            </div>
            <div style={{
              flex: 1, background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 8, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.greenLight, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                결과: (1,800,000 + 2,000,000) ÷ 2 = 1,900,000
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>AND 조건 = 같은 행에 나란히  ·  OR 조건 = 서로 다른 행에 엇갈려 입력</BLine>
        <BLine color={C.blue} bold>DAVERAGE(범위, 필드, 조건범위) — 조건에 맞는 행의 지정 열 평균</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbCountDiagram
// ─────────────────────────────────────────────
export function DbCountDiagram() {
  const gridBase = { display: 'grid', gap: 0 };

  return (
    <Wrap>
      <Title>DCOUNT — OR 조건 (서로 다른 행에 계단식 입력)</Title>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left: condition */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            OR 조건 입력
          </div>

          {/* Condition grid 2 cols E1:F3 */}
          <div style={{ ...gridBase, gridTemplateColumns: '1fr 1fr' }}>
            {/* Headers */}
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>매장위치</Cell>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>판매량</Cell>
            {/* Row 1: 대구점 | empty */}
            <Cell bg={C.amberBg} border={C.amber} style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>대구점</Cell>
            <Cell bg={C.bgDark} border={C.border} style={{ color: C.textDim, fontSize: 15 }}>&nbsp;</Cell>
            {/* Row 2: empty | >=50 */}
            <Cell bg={C.bgDark} border={C.border} style={{ color: C.textDim, fontSize: 15 }}>&nbsp;</Cell>
            <Cell bg={C.amberBg} border={C.amber} style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>{'>=50'}</Cell>
          </div>

          {/* Stagger labels */}
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <div style={{ flex: 1, color: C.textDim, fontSize: 13, textAlign: 'center' }}>← &quot;대구점&quot; 행</div>
            <div style={{ flex: 1, color: C.textDim, fontSize: 13, textAlign: 'center' }}>&quot;&gt;=50&quot; 다른 행</div>
          </div>

          {/* OR card */}
          <div style={{
            background: C.amberBg, border: `1px solid ${C.amber}`,
            borderRadius: 8, padding: 10, marginTop: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{ color: C.amber, fontSize: 15, fontWeight: 700, textAlign: 'center' }}>OR = 조건을 서로 다른</div>
            <div style={{ color: C.amber, fontSize: 15, textAlign: 'center' }}>행에 계단식으로 입력</div>
          </div>

          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center', marginTop: 4 }}>
            → 대구점이거나 판매량 50 이상인 행
          </div>

          {/* DCOUNT warning */}
          <div style={{
            background: C.purpleCard, border: `1px solid ${C.purple}`,
            borderRadius: 8, padding: 8, marginTop: 8,
          }}>
            <div style={{ color: C.purpleLight, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>DCOUNT 주의</div>
            <div style={{ color: C.purpleLight, fontSize: 13, textAlign: 'center' }}>두 번째 인수 열에 숫자 필요</div>
            <div style={{ color: C.purple, fontSize: 13, textAlign: 'center' }}>텍스트 열이면 DCOUNTA 사용</div>
          </div>
        </div>

        {/* Right: data */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ ...gridBase, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['지점코드', '매장위치', '판매량'].map(h => (
              <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {/* S01 65>=50 — included */}
            {['S01', '서울점', '65'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* D02 대구점 — included */}
            {['D02', '대구점✓', '30'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* B03 excluded */}
            {['B03', '부산점', '20'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textSlate, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>

          {/* Formula + result */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{
              flex: 1, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.text, fontSize: 14, fontFamily: 'monospace' }}>=DCOUNT(A1:D4, 3, E1:F3)</span>
            </div>
            <div style={{
              flex: 1, background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 8, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.greenLight, fontSize: 20, fontWeight: 700 }}>결과 = 2</span>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>OR 조건 = 엇갈린 다른 행  ·  같은 행 = AND 조건  ·  숫자 열 지정 필수(DCOUNT)</BLine>
        <BLine color={C.blue} bold>텍스트 개수 세기: DCOUNT → DCOUNTA로 변경</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbMaxDiagram
// ─────────────────────────────────────────────
export function DbMaxDiagram() {
  const gridBase = { display: 'grid', gap: 0 };

  const patternCards = [
    { pattern: '고*', label: '시작 패턴', bg: C.blueCard, border: C.blueDim, color: C.blue },
    { pattern: '*고', label: '끝 패턴', bg: C.greenDark, border: C.green, color: C.green },
    { pattern: '*고*', label: '포함 패턴', bg: C.purpleCard, border: C.purple, color: C.purple },
    { pattern: '고??', label: '3글자 패턴', bg: C.amberBg, border: C.amber, color: C.amber },
  ];

  return (
    <Wrap>
      <Title>DMAX &amp; 와일드카드 — 만능문자로 텍스트 조건 설정</Title>
      <div style={{ textAlign: 'center', color: C.textDim, fontSize: 16, marginBottom: 16 }}>
        * (별표) = 글자수 무제한  |  ? (물음표) = 정확히 한 글자
      </div>

      {/* Wildcard pattern cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {patternCards.map(({ pattern, label, bg, border, color }) => (
          <div key={pattern} style={{
            flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ color, fontWeight: 700, fontSize: 18, textAlign: 'center' }}>{pattern}</div>
            <div style={{ color, fontSize: 13, textAlign: 'center', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Condition + Data */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Condition */}
        <div style={{ width: 180, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 4 }}>조건 범위 (E1:E2)</div>
          <div style={{ ...gridBase, gridTemplateColumns: '1fr' }}>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>모델명</Cell>
            <Cell bg={C.amberBg} border={C.amber} style={{ color: C.amber, fontWeight: 700, fontSize: 16 }}>OLED*</Cell>
          </div>
          <div style={{ color: C.textDim, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            OLED로 시작하는 모든 모델
          </div>
        </div>

        {/* Data table */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ ...gridBase, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['제품번호', '모델명', '연도'].map(h => (
              <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {/* OLED-TV 2024 — matched */}
            {['101', 'OLED-TV 2024✓', '2024'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* UHD-TV 2023 — not matched */}
            {['102', 'UHD-TV 2023✗', '2023'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textSlate, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* OLED-Monitor 2026 — matched, max */}
            {['103', 'OLED-Monitor 2026★', '2026'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} bw={i === 2 ? 2.5 : 1} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>
        </div>
      </div>

      {/* Formula + result */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <div style={{
          flex: 1, background: C.bgDark, borderRadius: 8, padding: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.text, fontSize: 15, fontFamily: 'monospace' }}>=DMAX(A1:D4, 3, E1:E2)</span>
        </div>
        <div style={{
          flex: 1, background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 8, padding: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: C.greenLight, fontSize: 22, fontWeight: 700 }}>결과 = 2026</span>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>*=글자수 무제한  ·  ?=정확히 한 글자  ·  조합: OLED*  /  *TV  /  *OLED*  /  OL??</BLine>
        <BLine color={C.blue} bold>DMAX(범위, 필드, 조건범위) — 조건에 맞는 행의 최댓값</BLine>
      </BottomBar>
    </Wrap>
  );
}
