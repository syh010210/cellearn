// Lesson6.jsx — 수학 함수 (ABS·INT·MOD·POWER·VALUE, ROUND계열, SUMIF, SUMIFS) 다이어그램
import { C, Wrap, Title, BottomBar, BLine, Cell } from './shared.jsx';

// ─────────────────────────────────────────────
// MathBasicDiagram
// ─────────────────────────────────────────────
export function MathBasicDiagram() {
  const fnCards = [
    {
      name: 'ABS', desc: '절댓값',
      formula: 'ABS(-3.7)', result: '→ 3.7',
      bg: C.blueCard, border: C.blueDim, color: C.blue, descColor: C.blueLight,
      resultColor: C.blue, resultNote: null,
    },
    {
      name: 'INT', desc: '바닥 방향 내림',
      formula: 'INT(3.9) → 3', result: 'INT(-3.1) → -4',
      bg: C.purpleCard, border: C.purple, color: C.purpleLight, descColor: C.purple,
      resultColor: C.red, resultNote: '(음수 주의!)',
    },
    {
      name: 'MOD', desc: '나머지',
      formula: 'MOD(17, 5)', result: '→ 2',
      bg: C.greenDark, border: C.green, color: C.greenLight, descColor: C.green,
      resultColor: C.greenLight, resultNote: null,
    },
    {
      name: 'POWER', desc: '거듭제곱',
      formula: 'POWER(2, 3)', result: '→ 8',
      bg: '#251005', border: C.orange, color: C.orange, descColor: C.orange,
      resultColor: C.orange, resultNote: null,
    },
    {
      name: 'VALUE', desc: '텍스트 → 숫자',
      formula: 'VALUE("500")', result: '→ 500',
      bg: C.amberBg, border: C.amber, color: C.amber, descColor: C.amberLight,
      resultColor: C.amber, resultNote: null,
    },
  ];

  return (
    <Wrap>
      <Title>기본 수학 함수: ABS · INT · MOD · POWER · VALUE</Title>

      {/* Five function cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {fnCards.map(fc => (
          <div key={fc.name} style={{
            flex: 1, minWidth: 140, background: fc.bg, border: `2px solid ${fc.border}`,
            borderRadius: 8, padding: 12,
          }}>
            <div style={{ color: fc.color, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{fc.name}</div>
            <div style={{ color: fc.descColor, fontSize: 14, textAlign: 'center' }}>{fc.desc}</div>
            <div style={{ color: C.text, fontSize: 14, fontFamily: 'monospace', textAlign: 'center', marginTop: 6 }}>{fc.formula}</div>
            <div style={{ color: fc.resultColor, fontSize: fc.resultNote ? 14 : 20, fontWeight: 700, textAlign: 'center' }}>
              {fc.result}
            </div>
            {fc.resultNote && (
              <div style={{ color: fc.resultColor, fontSize: 12, textAlign: 'center' }}>{fc.resultNote}</div>
            )}
          </div>
        ))}
      </div>

      {/* INT warning */}
      <div style={{
        background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 8, padding: 12, marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ color: C.red, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>⚠ INT 음수 주의</span>
        <span style={{ color: C.redLight, fontSize: 15 }}>
          INT(-3.1) = -4  (0방향이 아닌 더 작은 정수쪽으로)
        </span>
      </div>

      {/* VALUE use case */}
      <div style={{
        background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 8, padding: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: C.blueLight, fontSize: 15, textAlign: 'center' }}>
          VALUE 사용 이유: 엑셀에서 텍스트처럼 저장된 숫자를 실제 계산에 사용할 때
        </span>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>ABS(절댓값)  ·  INT(내림)  ·  MOD(나머지)  ·  POWER(거듭제곱)  ·  VALUE(텍스트→숫자)</BLine>
        <BLine color={C.blue} bold>
          ※ INT와 TRUNC의 차이: INT는 음수에서 더 작은 정수, TRUNC는 항상 0방향 절삭
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// MathRoundDiagram
// ─────────────────────────────────────────────
export function MathRoundDiagram() {
  const kRows = [
    { k: 'K=2',  label: '소수 둘째 자리', highlight: false },
    { k: 'K=1',  label: '소수 첫째 자리', highlight: false },
    { k: 'K=0',  label: '정수',           highlight: false },
    { k: 'K=-1', label: '십의 자리',      highlight: true },
    { k: 'K=-2', label: '백의 자리',      highlight: true },
  ];

  const roundCards = [
    { name: 'ROUND',     desc: '반올림 · 8이므로 올림', result: '= 3.99', color: C.blue,     bg: C.blueCard,  border: C.blueDim },
    { name: 'ROUNDUP',   desc: '무조건 올림',            result: '= 3.99', color: C.greenLight, bg: C.greenDark, border: C.green },
    { name: 'ROUNDDOWN', desc: '무조건 내림',            result: '= 3.98', color: C.redLight,  bg: '#300a0a',   border: C.red },
  ];

  return (
    <Wrap>
      <Title>자릿수 제어 함수: ROUND · ROUNDUP · ROUNDDOWN</Title>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left: K-value table */}
        <div style={{ width: 220 }}>
          <div style={{ color: C.textMuted, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>K값 규칙</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>K값</Cell>
            <Cell bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>의미</Cell>
            {kRows.map(r => (
              <>
                <Cell
                  key={r.k + '-k'}
                  bg={r.highlight ? C.amberBg : C.bgDark}
                  border={r.highlight ? C.amber : C.border}
                  style={{ color: r.highlight ? C.amber : C.text, fontSize: 15 }}
                >
                  {r.k}
                </Cell>
                <Cell
                  key={r.k + '-label'}
                  bg={r.highlight ? C.amberBg : C.bgDark}
                  border={r.highlight ? C.amber : C.border}
                  style={{ color: r.highlight ? C.amber : C.text, fontSize: 15 }}
                >
                  {r.label}
                </Cell>
              </>
            ))}
          </div>
        </div>

        {/* Right: comparison cards */}
        <div style={{ flex: 1, marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: C.textDim, fontSize: 15, marginBottom: 8 }}>예시: 3.987을 K=2로 처리</div>
          {roundCards.map(rc => (
            <div key={rc.name} style={{
              background: rc.bg, border: `2px solid ${rc.border}`, borderRadius: 8, padding: 12,
              display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center',
            }}>
              <div style={{ color: rc.color, fontSize: 17, fontWeight: 700, width: 110, flexShrink: 0 }}>{rc.name}</div>
              <div style={{ color: C.textMuted, fontSize: 15, flex: 1 }}>{rc.desc}</div>
              <div style={{ color: rc.color, fontSize: 22, fontWeight: 700, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                {rc.result}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>=ROUND(숫자, K)  ·  =ROUNDUP(숫자, K)  ·  =ROUNDDOWN(숫자, K)</BLine>
        <BLine color={C.blue} bold>K양수 = 소수 자리 제어  /  K음수 = 정수 자리 제어  (K=0 이면 정수로 반올림)</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// SumifDiagram
// ─────────────────────────────────────────────
export function SumifDiagram() {
  const gridBase = { display: 'grid', gap: 0 };

  return (
    <Wrap>
      <Title>조건부 합계 함수: SUM · SUMIF</Title>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left: data table */}
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 6 }}>예시 데이터</div>
          <div style={{ ...gridBase, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['작물명', '분류', '수확량'].map(h => (
              <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {/* 상추 — included */}
            {['상추', '채소✓', '35'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* 사과 — excluded */}
            {['사과', '과일', '12'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textSlate, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* 깻잎 — included */}
            {['깻잎', '채소✓', '20'].map((v, i) => (
              <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {/* 딸기 — excluded */}
            {['딸기', '과일', '18'].map((v, i) => (
              <Cell key={i} bg={C.bgDark} border={C.border} style={{ color: C.textSlate, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>

          <div style={{ color: C.amber, fontSize: 15, fontWeight: 700, textAlign: 'center', marginTop: 8 }}>
            조건: 분류 = &quot;채소&quot;
          </div>
        </div>

        {/* Right: comparison cards */}
        <div style={{ flex: 1.2, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* SUM card */}
          <div style={{
            background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 8, padding: 14,
          }}>
            <div style={{ color: C.blue, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>SUM — 전체 합계</div>
            <div style={{ color: C.text, fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>=SUM(C2:C5)</div>
            <div style={{ color: C.textMuted, fontSize: 15, textAlign: 'center' }}>35 + 12 + 20 + 18 = 85</div>
            <div style={{ color: C.blue, fontSize: 28, fontWeight: 700, textAlign: 'center', marginTop: 4 }}>= 85</div>
          </div>

          {/* SUMIF card */}
          <div style={{
            background: C.greenDark, border: `2px solid ${C.green}`, borderRadius: 8, padding: 14,
          }}>
            <div style={{ color: C.green, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>SUMIF — 조건 합계</div>
            <div style={{ color: C.text, fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>
              =SUMIF(B2:B5, &quot;채소&quot;, C2:C5)
            </div>
            <div style={{ color: C.textMuted, fontSize: 15, textAlign: 'center' }}>35 + 20 = 55</div>
            <div style={{ color: C.greenLight, fontSize: 28, fontWeight: 700, textAlign: 'center', marginTop: 4 }}>= 55</div>
          </div>

          {/* Syntax box */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10,
          }}>
            <div style={{ color: C.textMuted, fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
              SUMIF(조건범위, 조건, 합계범위)
            </div>
            <div style={{ color: C.amber, fontSize: 14, textAlign: 'center' }}>
              자동채우기 시 범위에 $ 절대참조 적용 필수
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>=SUMIF(조건 범위, 조건, 합계 범위)  — 조건에 맞는 행의 합계</BLine>
        <BLine color={C.blue} bold>합계 범위 생략 시 조건 범위가 합계 범위로 사용됩니다  ·  F4 → $ 절대참조</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// SumifsDiagram
// ─────────────────────────────────────────────
export function SumifsDiagram() {
  const gridBase = { display: 'grid', gap: 0 };

  return (
    <Wrap>
      <Title>다중 조건 합계: SUMIFS · 와일드카드(*) 활용</Title>

      {/* Data table 6 cols */}
      <div style={{ ...gridBase, gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 16 }}>
        {['작물명', '출하량', '출하금액', '조건1결과', '조건2결과', 'SUMIFS포함여부'].map(h => (
          <Cell key={h} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
        ))}
        {/* 블루베리 — both conditions met */}
        {['블루베리', '20', '180,000', '*베리*✓', '20>=15✓', '포함✓'].map((v, i) => (
          <Cell key={i} bg={C.greenDark} border={C.green} style={{ color: C.greenLight, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
        ))}
        {/* 딸기 — condition1 fails */}
        {['딸기', '30', '250,000', '*베리*✗', '제외✗', '제외✗'].map((v, i) => (
          <Cell key={i} bg='#300a0a' border={C.red} style={{ color: C.redLight, fontSize: 15 }}>{v}</Cell>
        ))}
        {/* 라즈베리 — condition2 fails */}
        {['라즈베리', '8', '90,000', '*베리*✓', '8<15✗', '제외✗'].map((v, i) => (
          <Cell key={i} bg='#300a0a' border={C.red} style={{ color: C.redLight, fontSize: 15 }}>{v}</Cell>
        ))}
      </div>

      {/* SUMIFS panel + wildcard box */}
      <div style={{ display: 'flex', gap: 0 }}>
        {/* SUMIFS panel */}
        <div style={{
          flex: 1, background: '#251005', border: `2px solid ${C.orange}`, borderRadius: 8, padding: 12,
        }}>
          <div style={{ color: C.orange, fontSize: 14, fontFamily: 'monospace', textAlign: 'center', fontWeight: 700 }}>
            =SUMIFS(합계범위, 조건범위1, 조건1, 조건범위2, 조건2)
          </div>
          <div style={{ color: C.orange, fontSize: 14, fontFamily: 'monospace', textAlign: 'center', marginTop: 4 }}>
            =SUMIFS(C2:C4, A2:A4, &quot;*베리*&quot;, B2:B4, &quot;&gt;=15&quot;)
          </div>
          <div style={{ color: C.red, fontWeight: 700, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            합계범위가 항상 첫 번째!
          </div>
          <div style={{ color: C.orangeLight, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>
            = 180,000 (블루베리만 포함)
          </div>
        </div>

        {/* Wildcard box */}
        <div style={{
          flex: 1, marginLeft: 12, background: C.blueCard, border: `1.5px solid ${C.blueDim}`, borderRadius: 8, padding: 12,
        }}>
          <div style={{ color: C.blue, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            와일드카드(*) 사용법
          </div>
          <div style={{ color: C.blueLight, fontSize: 14, marginBottom: 4 }}>*베리* = 베리가 포함된 모든 텍스트</div>
          <div style={{ color: C.blueLight, fontSize: 14, marginBottom: 4 }}>베리* = 베리로 시작</div>
          <div style={{ color: C.blueLight, fontSize: 14 }}>*베리 = 베리로 끝남</div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.textMuted}>=SUMIFS(합계범위, 조건범위1, 조건1, ...) — 합계범위가 항상 첫 번째!</BLine>
        <BLine color={C.blue} bold>SUMIF vs SUMIFS: SUMIF는 조건 1개, SUMIFS는 여러 조건 지원</BLine>
      </BottomBar>
    </Wrap>
  );
}
