// Lesson6.jsx — 수학 함수 (ABS·INT·MOD·POWER·VALUE, ROUND계열, SUMIF, SUMIFS) 다이어그램
// 2~5차시 형식을 따른다: 정적 카드는 3차시 FuncCard, 인터랙티브는 5차시 DbSumDiagram 구조.
import { useState } from 'react';
import {
  Wrap, Title, Subtitle, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem,
  ArgButtons, rangeSides, SyntaxLine, ExplainBoard, Cell, C,
} from './shared.jsx';

// 3차시 FuncCard와 같은 줄 순서·크기: 함수명(17) → SyntaxLine(12.5) → 설명(14) → 수식(14) → 값(16)
function MathCard({ c }) {
  return (
    <div style={{
      background: c.bg, border: `2px solid ${c.border}`, borderRadius: 10, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <div style={{ color: c.color, fontSize: 17, fontWeight: 700 }}>{c.name}</div>
      <SyntaxLine fn={c.name} color={c.color} size={12.5} />
      <div style={{ color: c.color, fontSize: 14, opacity: 0.85 }}>{c.desc}</div>
      <div style={{ color: c.color, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{c.formula}</div>
      <div style={{ color: c.valColor, fontSize: 16, fontWeight: 700 }}>{c.value}</div>
      {c.value2 && <div style={{ color: c.valColor, fontSize: 16, fontWeight: 700 }}>{c.value2}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// MathBasicDiagram — 개념1 (정적 카드형)
// ─────────────────────────────────────────────
export function MathBasicDiagram() {
  const cards = [
    { name: 'ABS', desc: '부호를 없앤 절댓값', formula: '=ABS(-3.7)', value: '= 3.7',
      bg: C.blueCard, border: C.blueDim, color: C.blue, valColor: C.blueLight },
    { name: 'INT', desc: '더 작은 정수로 내림', formula: '=INT(3.9)', value: '= 3', value2: '=INT(-3.1) → -4',
      bg: C.purpleCard, border: C.purple, color: C.purpleLight, valColor: C.red },
    { name: 'MOD', desc: '나눈 나머지', formula: '=MOD(17, 5)', value: '= 2',
      bg: C.greenDark, border: C.green, color: C.greenLight, valColor: C.greenLight },
    { name: 'POWER', desc: '거듭제곱', formula: '=POWER(2, 3)', value: '= 8',
      bg: C.orangeBg, border: C.orange, color: C.orange, valColor: C.orangeLight },
    { name: 'VALUE', desc: '텍스트 → 숫자', formula: '=VALUE("500")', value: '= 500',
      bg: C.amberBg, border: C.amber, color: C.amber, valColor: C.amberLight },
  ];

  return (
    <Wrap>
      <Title>기본 수학 함수: ABS · INT · MOD · POWER · VALUE</Title>

      <Row gap={12}>
        {cards.map((c) => (
          <Fill key={c.name} min={150}><MathCard c={c} /></Fill>
        ))}
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// MathRoundDiagram — 개념2 (정적 카드형)
// ─────────────────────────────────────────────
export function MathRoundDiagram() {
  const kHeads = ['K=-3', 'K=-2', 'K=-1', 'K=0', 'K=1', 'K=2', 'K=3'];
  const neg = [true, true, true, false, false, false, false]; // 음수 K = 정수 자리 강조 열
  const meaning = ['천의 자리', '백의 자리', '십의 자리', '일의 자리(정수)', '소수 첫째', '소수 둘째', '소수 셋째'];
  // 값은 3737.3737을 K별로 처리한 결과(직접 계산해 문자열로 고정). diff = ROUND와 다른 셀
  const funcRows = [
    { name: 'ROUND',     color: C.blue,       vals: ['4000', '3700', '3740', '3737', '3737.4', '3737.37', '3737.374'], diff: [false, false, false, false, false, false, false] },
    { name: 'ROUNDUP',   color: C.greenLight, vals: ['4000', '3800', '3740', '3738', '3737.4', '3737.38', '3737.374'], diff: [false, true,  false, true,  false, true,  false] },
    { name: 'ROUNDDOWN', color: C.redLight,   vals: ['3000', '3700', '3730', '3737', '3737.3', '3737.37', '3737.373'], diff: [true,  false, true,  false, true,  false, true ] },
  ];

  const headCell = (text, isNeg, key) => (
    <Cell key={key} bg={isNeg ? C.amberBg : C.blueCard} border={isNeg ? C.amber : C.blueDim}
      style={{ color: isNeg ? C.amber : C.blueLight, fontWeight: 700, fontSize: 15 }}>{text}</Cell>
  );

  const cards = [
    { name: 'ROUND', desc: '반올림 — 버릴 자리가 5 이상이면 올림', formula: '=ROUND(3737.3737, 2)', value: '= 3737.37',
      bg: C.blueCard, border: C.blueDim, color: C.blue, valColor: C.blueLight },
    { name: 'ROUNDUP', desc: '무조건 올림', formula: '=ROUNDUP(3737.3737, 2)', value: '= 3737.38',
      bg: C.greenDark, border: C.green, color: C.greenLight, valColor: C.greenLight },
    { name: 'ROUNDDOWN', desc: '무조건 내림(절삭)', formula: '=ROUNDDOWN(3737.3737, 2)', value: '= 3737.37',
      bg: C.redDark, border: C.red, color: C.redLight, valColor: C.redLight },
  ];

  return (
    <Wrap>
      <Title>자릿수 제어 함수: ROUND · ROUNDUP · ROUNDDOWN</Title>
      <Subtitle>예시 숫자 3737.3737 을 자릿수 K별로 처리한 결과</Subtitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', width: '100%', marginTop: 16 }}>
        {/* 머리글 행 */}
        {headCell('함수', false, 'h-fn')}
        {kHeads.map((k, i) => headCell(k, neg[i], 'h-' + i))}

        {/* 함수별 값 행 */}
        {funcRows.map((r) => [
          <Cell key={r.name + '-n'} bg={C.bgDark} border={C.border}
            style={{ color: r.color, fontWeight: 700, fontSize: 15 }}>{r.name}</Cell>,
          ...r.vals.map((v, i) => (
            <Cell key={r.name + '-' + i} bg={C.bgDark} border={C.border}
              style={{ color: r.diff[i] ? r.color : C.text, fontWeight: r.diff[i] ? 700 : 400, fontSize: 15 }}>{v}</Cell>
          )),
        ])}

        {/* 의미 행 */}
        <Cell key="m-fn" bg={C.bgDark} border={C.border}
          style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>자리</Cell>
        {meaning.map((m, i) => (
          <Cell key={'m-' + i} bg={neg[i] ? C.amberBg : C.bgDark} border={neg[i] ? C.amber : C.border}
            style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>{m}</Cell>
        ))}
      </div>

      <Row gap={12} style={{ marginTop: 16 }}>
        {cards.map((c) => (
          <Fill key={c.name} min={150}><MathCard c={c} /></Fill>
        ))}
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// SumifDiagram — 개념3 (인터랙티브, DbSumDiagram 구조)
// ─────────────────────────────────────────────
export function SumifDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['작물명', '분류', '수확량', '지정 분류'],
    ['상추', '채소', 35, '채소'],
    ['사과', '과일', 12, ''],
    ['깻잎', '채소', 20, ''],
    ['딸기', '과일', 18, ''],
  ];
  const LAST = data.length - 1; // 4

  const tabs = [
    { key: '범위', color: C.blueLight },
    { key: '조건', color: C.greenLight },
    { key: '합계 범위', color: C.amberLight },
  ];
  const explain = {
    '범위': '조건을 검사할 열입니다. 제목 행을 빼고 데이터 [B2:B5]만 잡습니다.',
    '조건': '찾을 값입니다. "채소"처럼 직접 따옴표로 쓰거나, 값이 들어 있는 셀 D2를 지정합니다.',
    '합계 범위': '조건에 맞는 행에서 실제로 더할 열입니다. 범위와 행 수가 같아야 합니다. 생략하면 범위 자체를 더합니다.',
  };

  // 채소 행 = ri1(상추), ri3(깻잎)
  const dataSt = (ri, ci) => {
    const boxes = active === '범위' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blueLight }]
      : active === '조건' ? [{ r1: 1, r2: 1, c1: 3, c2: 3, color: C.greenLight }]
      : active === '합계 범위' ? [{ r1: 1, r2: LAST, c1: 2, c2: 2, color: C.amberLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (active === '합계 범위' && ci === 2 && (ri === 1 || ri === 3)) s.bold = true;
    return s;
  };

  return (
    <Wrap>
      <Title>조건에 맞는 행만 더하기: SUMIF</Title>

      <ExamProblem notes={['SUMIF 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>분류[B2:B5]</b>가 &quot;채소&quot;인 작물의
        <b style={{ color: C.greenLight }}> 수확량[C2:C5]</b> 합계를 [E2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 수확 일지</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={78} firstColW={78}
              reserveLabelRow labelRow={active === '합계 범위' ? [null, null, { text: '합계', color: C.amberLight }, null] : [null, null, null, null]} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>SUMIF</div>
            <SyntaxLine fn="SUMIF" color={C.blue} colors={[C.blueLight, C.greenLight, C.amberLight]} />
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>범위에서 조건에 맞는 행을 찾아, 그 행의 합계 범위 값을 더합니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0', minHeight: 84, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>=SUM(C2:C5) → 85 (전체 합계)</div>
              <div>=SUMIF(<span style={{ color: C.blueLight }}>B2:B5</span>, <span style={{ color: C.greenLight }}>&quot;채소&quot;</span>, <span style={{ color: C.amberLight }}>C2:C5</span>) <span style={{ color: C.greenLight }}>→ 55</span></div>
              <div>=SUMIF(<span style={{ color: C.blueLight }}>$B$2:$B$5</span>, <span style={{ color: C.greenLight }}>D2</span>, <span style={{ color: C.amberLight }}>$C$2:$C$5</span>) <span style={{ color: C.greenLight }}>→ 55</span></div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 세 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
          <div style={{ color: C.amber, fontSize: 15, lineHeight: 1.6 }}>아래로 자동 채우기 할 때는 범위와 합계 범위를 F4로 $ 고정합니다. 조건(D2)만 상대 참조.</div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// SumifsDiagram — 개념4 (인터랙티브, DbSumDiagram 구조 · 와일드카드 없음)
// ─────────────────────────────────────────────
export function SumifsDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['작물명', '분류', '출하량', '출하금액', '조건1', '조건2'],
    ['블루베리', '과일', 20, '180,000', '과일', '>=15'],
    ['딸기', '과일', 30, '250,000', '', ''],
    ['라즈베리', '과일', 8, '90,000', '', ''],
    ['상추', '채소', 25, '60,000', '', ''],
  ];
  const LAST = data.length - 1; // 4

  const tabs = [
    { key: '합계 범위', color: C.blueLight },
    { key: '조건 범위1', color: C.greenLight },
    { key: '조건1', color: C.greenLight },
    { key: '조건 범위2', color: C.amberLight },
    { key: '조건2', color: C.amberLight },
  ];
  const explain = {
    '합계 범위': '더할 열이 첫 번째 인수입니다. SUMIF와 반대이니 시험에서 가장 많이 틀리는 자리입니다.',
    '조건 범위1': '첫 번째 조건을 검사할 열 [B2:B5].',
    '조건1': '첫 번째 조건 "과일". E2 셀을 지정했습니다.',
    '조건 범위2': '두 번째 조건을 검사할 열 [C2:C5].',
    '조건2': '두 번째 조건 ">=15". F2 셀을 지정했습니다. 조건은 전부 AND로 묶입니다.',
  };

  // 두 조건 모두 만족: 블루베리(ri1), 딸기(ri2)
  const dataSt = (ri, ci) => {
    const boxes = active === '합계 범위' ? [{ r1: 1, r2: LAST, c1: 3, c2: 3, color: C.blueLight }]
      : active === '조건 범위1' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.greenLight }]
      : active === '조건1' ? [{ r1: 1, r2: 1, c1: 4, c2: 4, color: C.greenLight }]
      : active === '조건 범위2' ? [{ r1: 1, r2: LAST, c1: 2, c2: 2, color: C.amberLight }]
      : active === '조건2' ? [{ r1: 1, r2: 1, c1: 5, c2: 5, color: C.amberLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 3 && (ri === 1 || ri === 2)) s.bold = true; // 두 조건 만족 행의 출하금액
    return s;
  };

  return (
    <Wrap>
      <Title>여러 조건을 모두 만족하는 행만 더하기: SUMIFS</Title>

      <ExamProblem notes={['SUMIFS 함수 사용', '조건은 [E2], [F2] 셀 참조']}>
        [표1]에서 <b style={{ color: C.greenLight }}>분류[B2:B5]</b>가 &quot;과일&quot;이면서
        <b style={{ color: C.amberLight }}> 출하량[C2:C5]</b>이 15 이상인 작물의
        <b style={{ color: C.blueLight }}> 출하금액[D2:D5]</b> 합계를 [G2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 출하 현황</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={68} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>SUMIFS</div>
            <SyntaxLine fn="SUMIFS" color={C.blue} colors={[C.blueLight, C.greenLight, C.greenLight, C.amberLight, C.amberLight]} />
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>합계 범위를 맨 앞에 쓰고, (조건 범위, 조건) 쌍을 필요한 만큼 이어 붙입니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 15.5, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0', minHeight: 62, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div>=SUMIFS(<span style={{ color: C.blueLight }}>D2:D5</span>, <span style={{ color: C.greenLight }}>B2:B5</span>, <span style={{ color: C.greenLight }}>E2</span>, <span style={{ color: C.amberLight }}>C2:C5</span>, <span style={{ color: C.amberLight }}>F2</span>) <span style={{ color: C.greenLight }}>→ 430,000</span></div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 다섯 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
          <div style={{ color: C.amber, fontSize: 15, lineHeight: 1.6 }}>{'함수를 조건으로 쓸 때는 ">="&AVERAGE(범위)처럼 비교 연산자만 따옴표로 감싸고 &로 잇습니다.'}</div>
        </Fill>
      </Row>
    </Wrap>
  );
}
