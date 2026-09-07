// Lesson5.jsx — 데이터베이스 함수 (DSUM, DAVERAGE, DCOUNT, DMAX) 다이어그램
// 4차시 VlookupDiagram 패턴(ExamProblem · Row/Fixed/Fill · ExcelGrid · ArgButtons · rangeSides · explain 칠판)을 공유 컴포넌트로 따른다.
import { useState } from 'react';
import { Wrap, Title, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem, ArgButtons, rangeSides, C } from './shared.jsx';

const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
const LIGHT_AMBER = 'rgba(251,191,36,0.18)';

// 오른쪽 칠판: 모든 설명을 한 칸에 겹쳐 두어 버튼을 눌러도 크기가 변하지 않는다.
function ExplainBoard({ tabs, active, explain }) {
  return (
    <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
      {tabs.map((t) => (
        <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          <span style={{ color: t.color, fontWeight: 700 }}>{t.key}</span>
          <span style={{ color: C.text }}> — {explain[t.key]}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// DbCommonIntroDiagram — 데이터베이스 함수 공통 형식 (개념1 맨 앞)
// ─────────────────────────────────────────────
export function DbCommonIntroDiagram() {
  const fns = [
    { name: 'DSUM', desc: '합계' },
    { name: 'DAVERAGE', desc: '평균' },
    { name: 'DCOUNT', desc: '숫자 셀 개수' },
    { name: 'DCOUNTA', desc: '비어 있지 않은 셀 개수' },
    { name: 'DMAX', desc: '최댓값' },
    { name: 'DMIN', desc: '최솟값' },
  ];
  return (
    <Wrap>
      <Title>데이터베이스 함수 — D로 시작하는 함수는 인수가 전부 같다</Title>

      {/* 4차시 VlookupHlookupIntro의 VLOOKUP 카드와 같은 구조 (Fill 하나, 폭은 Wrap 전체) */}
      <Row gap={16} style={{ marginBottom: 16 }}>
        <Fill min={300} gap={6} style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>데이터베이스 함수</div>
          <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>조건에 맞는 행만 골라 계산하는 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=DFUNCTION(<span style={{ color: C.blueLight }}>① 전체 표 범위</span>, <span style={{ color: C.greenLight }}>② 계산할 열 제목</span>, <span style={{ color: C.amberLight }}>③ 조건 범위</span>)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>조건 범위에 맞는 행을 전체 표에서 찾아, 그 행들의 지정한 열 값을 계산해 반환</div>
          <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '2px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 14.5, lineHeight: 1.7 }}>
            <div><b style={{ color: C.blueLight }}>① 전체 표 범위</b><span style={{ color: C.text }}>: 반드시 맨 위의 제목(필드명) 행을 포함하여 표의 전체를 드래그해야 합니다. 예) A1:D4</span></div>
            <div><b style={{ color: C.greenLight }}>② 계산할 열</b><span style={{ color: C.text }}>: 합계나 평균 등을 구할 열의 제목 셀을 클릭하여 셀 번호(혹은 셀 주소)를 넣거나, 첫 열부터 셀 때의 열 번호(숫자)를 입력합니다. 예) D1 또는 4</span></div>
            <div><b style={{ color: C.amberLight }}>③ 조건 범위</b><span style={{ color: C.text }}>: 반드시 &apos;조건 열 제목&apos;과 &apos;해당 조건값&apos;이 한 세트. 예) E1:E2</span></div>
          </div>
        </Fill>
      </Row>

      <Row gap={12}>
        {fns.map((f) => (
          <Fill key={f.name} min={140} gap={4} style={{ background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 8, padding: '12px 10px', alignItems: 'center' }}>
            <div style={{ color: C.blue, fontSize: 16, fontWeight: 700 }}>{f.name}</div>
            <div style={{ color: C.blueLight, fontSize: 13, textAlign: 'center' }}>{f.desc}</div>
          </Fill>
        ))}
      </Row>
    </Wrap>
  );
}

// 공통: 데이터 표 헤더 스타일
const headSt = { bold: true, color: C.blueLight, bg: C.blueCard };

// ─────────────────────────────────────────────
// DbSumDiagram — 단일 조건 (DSUM)
// ─────────────────────────────────────────────
export function DbSumDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['제품ID', '제품군', '단가', '판매량'],
    ['W-01', '세탁기', '1,200,000', 5],
    ['R-02', '냉장고', '2,500,000', 3],
    ['W-03', '세탁기', '1,500,000', 8],
  ];
  const cond = [['제품군'], ['세탁기']];

  const tabs = [
    { key: '전체 표 범위', color: C.blueLight },
    { key: '계산할 열', color: C.greenLight },
    { key: '조건 범위', color: C.amberLight },
  ];
  const explain = {
    '전체 표 범위': '열 제목이 있는 1행부터 표 끝까지 전부 선택합니다. VLOOKUP과 달리 제목 행을 빼지 않습니다.',
    '계산할 열': '합계를 구할 판매량은 표의 왼쪽부터 4번째 열입니다. 제목 셀 D1을 클릭해도 됩니다.',
    '조건 범위': '조건 열 제목 "제품군"과 조건값 "세탁기"를 위아래 두 칸으로 지정합니다. "세탁기" 한 칸만 지정하면 어느 열의 조건인지 알 수 없습니다.',
  };

  const dataSt = (ri, ci) => {
    const boxes = active === '전체 표 범위' ? [{ r1: 0, r2: 3, c1: 0, c2: 3, color: C.blueLight }]
      : active === '계산할 열' ? [{ r1: 0, r2: 3, c1: 3, c2: 3, color: C.greenLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) { s.bold = true; s.color = C.blueLight; s.bg = active === '전체 표 범위' ? LIGHT_BLUE : C.blueCard; return s; }
    if (active === '조건 범위') {
      if (ci === 1 && (ri === 1 || ri === 3)) return { bg: C.amberLight, color: '#0b1220', bold: true };
      if (ci === 3 && (ri === 1 || ri === 3)) return { color: C.greenLight, bold: true };
    }
    return s;
  };
  const condSt = (ri, ci) => {
    const s = active === '조건 범위' ? rangeSides(ri, ci, [{ r1: 0, r2: 1, c1: 0, c2: 0, color: C.amberLight }]) : {};
    if (ri === 0) return { ...s, bold: true, color: C.blueLight, bg: C.blueCard };
    return { ...s, color: C.amber, bold: true };
  };

  return (
    <Wrap>
      <Title>단일 조건 — 조건 범위는 제목과 값 두 칸</Title>

      <ExamProblem notes={['조건은 [F1:F2] 영역에 입력하시오', 'DSUM 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>제품군[B2:B4]</b>이 &quot;세탁기&quot;인 제품의
        <b style={{ color: C.greenLight }}> 판매량[D2:D4]</b> 합계를 [G2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 판매 현황</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={72} firstColW={72}
              labelRow={active === '계산할 열' ? [null, null, null, { text: '4번째', color: C.greenLight }] : null} />
          </div>
          <div>
            <TableCaption color={C.amberLight}>[조건 범위]</TableCaption>
            <ExcelGrid data={cond} startCol={5} startRow={1} cellStyle={condSt} minColW={90} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>DSUM</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =DSUM(전체 표 범위, 계산할 열, 조건 범위)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>조건을 만족하는 행에서 지정한 열의 합계를 구합니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=DSUM(<span style={{ color: C.blueLight }}>A1:D4</span>, <span style={{ color: C.greenLight }}>4</span>, <span style={{ color: C.amberLight }}>F1:F2</span>)</div>
              <div style={{ color: C.greenLight }}>→ 13</div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 세 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbAverageDiagram — AND 조건 (DAVERAGE)
// ─────────────────────────────────────────────
export function DbAverageDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['가전명', '제조사', '단가', '재고량'],
    ['에어컨', 'A사', '1,800,000', 25],
    ['청소기', 'B사', '600,000', 40],
    ['스타일러', 'A사', '2,000,000', 30],
  ];
  const cond = [['제조사', '재고량'], ['A사', '>=20']];

  const tabs = [
    { key: '전체 표 범위', color: C.blueLight },
    { key: '계산할 열', color: C.greenLight },
    { key: '조건 범위', color: C.amberLight },
  ];
  const explain = {
    '전체 표 범위': '열 제목이 있는 1행부터 표 끝까지 전부 선택합니다.',
    '계산할 열': '평균을 구할 단가는 표의 왼쪽부터 3번째 열입니다.',
    '조건 범위': '두 조건이 같은 행에 나란히 있으면 "둘 다 만족"(AND)입니다. 제목 2칸 + 값 2칸, 모두 4칸을 지정합니다.',
  };
  // 두 조건 모두 만족: 에어컨(ri1), 스타일러(ri3) / 청소기(ri2)는 B사라 제외
  const match = (ri) => ri === 1 || ri === 3;

  const dataSt = (ri, ci) => {
    const boxes = active === '전체 표 범위' ? [{ r1: 0, r2: 3, c1: 0, c2: 3, color: C.blueLight }]
      : active === '계산할 열' ? [{ r1: 0, r2: 3, c1: 2, c2: 2, color: C.greenLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) { s.bold = true; s.color = C.blueLight; s.bg = active === '전체 표 범위' ? LIGHT_BLUE : C.blueCard; return s; }
    if (active === '조건 범위') {
      if (ri === 2) return { color: C.textSlate };                       // 하나만 만족 → 회색
      if (match(ri)) { const b = { bg: LIGHT_AMBER }; if (ci === 2) { b.color = C.greenLight; b.bold = true; } return b; }
    }
    return s;
  };
  const condSt = (ri, ci) => {
    const s = active === '조건 범위' ? rangeSides(ri, ci, [{ r1: 0, r2: 1, c1: 0, c2: 1, color: C.amberLight }]) : {};
    if (ri === 0) return { ...s, bold: true, color: C.blueLight, bg: C.blueCard };
    return { ...s, color: C.amber, bold: true };
  };
  // 아래 안내: 같은 행 → AND / 다른 행 → OR
  const andC = [['제조사', '재고량'], ['A사', '>=20']];
  const orC = [['매장', '판매'], ['대구', ''], ['', '>=50']];
  const plainHead = (ri) => (ri === 0 ? { bold: true, color: C.blueLight, bg: C.blueCard } : { color: C.amber, bold: true });

  return (
    <Wrap>
      <Title>AND 조건 — 같은 행에 나란히</Title>

      <ExamProblem notes={['조건은 [F1:G2] 영역에 입력하시오', 'DAVERAGE 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>제조사</b>가 &quot;A사&quot;이면서 <b style={{ color: C.amberLight }}>재고량</b>이 20 이상인 가전의
        <b style={{ color: C.greenLight }}> 단가</b> 평균을 [H2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 가전 재고</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={70} firstColW={72}
              labelRow={active === '계산할 열' ? [null, null, { text: '3번째', color: C.greenLight }, null] : null} />
          </div>
          <div>
            <TableCaption color={C.amberLight}>[조건 범위] 같은 행 = AND</TableCaption>
            <ExcelGrid data={cond} startCol={5} startRow={1} cellStyle={condSt} minColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>DAVERAGE</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =DAVERAGE(전체 표 범위, 계산할 열, 조건 범위)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>조건을 만족하는 행에서 지정한 열의 평균을 구합니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=DAVERAGE(<span style={{ color: C.blueLight }}>A1:D4</span>, <span style={{ color: C.greenLight }}>3</span>, <span style={{ color: C.amberLight }}>F1:G2</span>)</div>
              <div style={{ color: C.greenLight }}>→ 1,900,000</div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 세 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />

          {/* 같은 행 → AND / 다른 행 → OR (OR은 다음 개념 예고라 흐리게) */}
          <Row gap={16}>
            <Fill min={130} gap={4} style={{ alignItems: 'center' }}>
              <div style={{ color: C.amber, fontSize: 13.5, fontWeight: 700 }}>같은 행 → AND</div>
              <ExcelGrid data={andC} startCol={5} startRow={1} cellStyle={(ri) => plainHead(ri)} minColW={62} />
            </Fill>
            <Fill min={130} gap={4} style={{ alignItems: 'center', opacity: 0.6 }}>
              <div style={{ color: C.textMuted, fontSize: 13.5, fontWeight: 700 }}>다른 행 → OR</div>
              <ExcelGrid data={orC} startCol={5} startRow={1} cellStyle={(ri) => plainHead(ri)} minColW={62} />
            </Fill>
          </Row>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbCountDiagram — OR 조건 + DCOUNT/DCOUNTA
// ─────────────────────────────────────────────
export function DbCountDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['지점코드', '매장위치', '판매량', '담당자'],
    ['S01', '서울점', 65, '최팀장'],
    ['D02', '대구점', 30, '이과장'],
    ['B03', '부산점', 20, '박대리'],
  ];
  const cond = [['매장위치', '판매량'], ['대구점', ''], ['', '>=50']];

  const tabs = [
    { key: '전체 표 범위', color: C.blueLight },
    { key: '계산할 열', color: C.greenLight },
    { key: '조건 범위', color: C.amberLight },
    { key: 'DCOUNTA와 비교', color: C.purpleLight },
  ];
  const explain = {
    '전체 표 범위': '열 제목이 있는 1행부터 표 끝까지 전부 선택합니다.',
    '계산할 열': '개수를 셀 판매량은 표의 왼쪽부터 3번째 열입니다.',
    '조건 범위': '조건값이 서로 다른 행에 있으면 "하나라도 만족"(OR)입니다. 빈칸까지 포함해 F1:G3 여섯 칸을 지정합니다.',
    'DCOUNTA와 비교': 'DCOUNT는 숫자·날짜·시간 셀만 셉니다. 담당자처럼 문자 열을 세려면 DCOUNTA를 씁니다.',
  };
  // 조건 중 하나라도 만족: 서울점(65>=50, ri1), 대구점(ri2) / 부산점(ri3) 제외
  const match = (ri) => ri === 1 || ri === 2;

  const dataSt = (ri, ci) => {
    const boxes = active === '전체 표 범위' ? [{ r1: 0, r2: 3, c1: 0, c2: 3, color: C.blueLight }]
      : (active === '계산할 열' ? [{ r1: 0, r2: 3, c1: 2, c2: 2, color: C.greenLight }]
      : active === 'DCOUNTA와 비교' ? [{ r1: 0, r2: 3, c1: 3, c2: 3, color: C.greenLight }] : []);
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) { s.bold = true; s.color = C.blueLight; s.bg = active === '전체 표 범위' ? LIGHT_BLUE : C.blueCard; return s; }
    if (active === '조건 범위') {
      if (ri === 3) return { color: C.textSlate };
      if (match(ri)) { const b = { bg: LIGHT_AMBER }; if (ci === 2) { b.color = C.greenLight; b.bold = true; } return b; }
    }
    return s;
  };
  const condSt = (ri, ci) => {
    const s = active === '조건 범위' ? rangeSides(ri, ci, [{ r1: 0, r2: 2, c1: 0, c2: 1, color: C.amberLight }]) : {};
    if (ri === 0) return { ...s, bold: true, color: C.blueLight, bg: C.blueCard };
    const v = cond[ri][ci];
    return { ...s, color: v ? C.amber : C.textDim, bold: !!v };
  };

  const compare = active === 'DCOUNTA와 비교';

  return (
    <Wrap>
      <Title>OR 조건 — 행을 바꿔 엇갈리게</Title>

      <ExamProblem notes={['조건은 [F1:G3] 영역에 입력하시오', 'DCOUNT 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>매장위치</b>가 &quot;대구점&quot;이거나 <b style={{ color: C.amberLight }}>판매량</b>이 50 이상인 지점 수를 [H2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 지점 판매</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={70} firstColW={74}
              labelRow={active === '계산할 열' ? [null, null, { text: '3번째', color: C.greenLight }, null]
                : compare ? [null, null, null, { text: '4번째(문자)', color: C.greenLight }] : null} />
          </div>
          <div>
            <TableCaption color={C.amberLight}>[조건 범위] 다른 행 = OR</TableCaption>
            <ExcelGrid data={cond} startCol={5} startRow={1} cellStyle={condSt} minColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>DCOUNT</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =DCOUNT(전체 표 범위, 계산할 열, 조건 범위)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>조건을 만족하는 행에서 지정한 열의 숫자 셀 개수를 셉니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: compare ? 16 : 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '4px 0' }}>
              {compare ? (
                <>
                  <div>=DCOUNT(A1:D4, <span style={{ color: C.greenLight }}>4</span>, F1:G3) <span style={{ color: C.redLight }}>→ 0</span></div>
                  <div style={{ marginTop: 4 }}>=DCOUNTA(A1:D4, <span style={{ color: C.greenLight }}>4</span>, F1:G3) <span style={{ color: C.greenLight }}>→ 2</span></div>
                </>
              ) : (
                <>
                  <div>=DCOUNT(<span style={{ color: C.blueLight }}>A1:D4</span>, <span style={{ color: C.greenLight }}>3</span>, <span style={{ color: C.amberLight }}>F1:G3</span>)</div>
                  <div style={{ color: C.greenLight }}>→ 2</div>
                </>
              )}
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 인수와 DCOUNTA 차이를 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DbMaxDiagram — 와일드카드 (DMAX)
// ─────────────────────────────────────────────
export function DbMaxDiagram() {
  const [active, setActive] = useState(null);   // 인수 버튼
  const [pat, setPat] = useState(null);         // 와일드카드 패턴

  const data = [
    ['식별번호', '모델명', '출시연도', '입고수량'],
    [101, 'OLED-TV', 2024, 15],
    [102, 'UHD-TV', 2023, 40],
    [103, 'OLED-Monitor', 2026, 8],
  ];
  const cond = [['모델명'], ['OLED*']];

  const tabs = [
    { key: '전체 표 범위', color: C.blueLight },
    { key: '계산할 열', color: C.greenLight },
    { key: '조건 범위', color: C.amberLight },
  ];
  const explain = {
    '전체 표 범위': '열 제목이 있는 1행부터 표 끝까지 전부 선택합니다.',
    '계산할 열': '최댓값을 구할 출시연도는 표의 왼쪽부터 3번째 열입니다.',
    '조건 범위': '"OLED*"는 OLED로 시작하고 뒤에 몇 글자가 오든 상관없다는 뜻입니다. OLED-TV, OLED-Monitor 두 행이 걸립니다.',
  };
  // OLED로 시작하는 행: OLED-TV(ri1), OLED-Monitor(ri3). 최댓값 2026(ri3)
  const match = (ri) => ri === 1 || ri === 3;

  const dataSt = (ri, ci) => {
    const boxes = active === '전체 표 범위' ? [{ r1: 0, r2: 3, c1: 0, c2: 3, color: C.blueLight }]
      : active === '계산할 열' ? [{ r1: 0, r2: 3, c1: 2, c2: 2, color: C.greenLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) { s.bold = true; s.color = C.blueLight; s.bg = active === '전체 표 범위' ? LIGHT_BLUE : C.blueCard; return s; }
    if (active === '조건 범위') {
      if (match(ri)) {
        if (ci === 1) return { bg: C.amberLight, color: '#0b1220', bold: true };
        if (ci === 2) return { color: C.greenLight, bold: true, content: ri === 3 ? '2026 ★' : data[ri][2] };
      }
    }
    return s;
  };
  const condSt = (ri, ci) => {
    const s = active === '조건 범위' ? rangeSides(ri, ci, [{ r1: 0, r2: 1, c1: 0, c2: 0, color: C.amberLight }]) : {};
    if (ri === 0) return { ...s, bold: true, color: C.blueLight, bg: C.blueCard };
    return { ...s, color: C.amber, bold: true };
  };

  // 와일드카드 패턴 표 — 클릭하면 예시 목록에서 매칭 단어만 형광
  const words = ['고구마', '고등어', '고', '망고', '참고서', '고기'];
  const patterns = [
    { key: '고*', mean: '고로 시작', test: (w) => w.startsWith('고') },
    { key: '*고', mean: '고로 끝남', test: (w) => w.endsWith('고') },
    { key: '*고*', mean: '고 포함', test: (w) => w.includes('고') },
    { key: '고??', mean: '고 + 정확히 2글자', test: (w) => w.startsWith('고') && w.length === 3 },
  ];
  const activeTest = (patterns.find((p) => p.key === pat) || {}).test;

  return (
    <Wrap>
      <Title>와일드카드 — * 는 여러 글자, ? 는 한 글자</Title>

      <ExamProblem notes={['조건은 [F1:F2] 영역에 입력하시오', 'DMAX 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>모델명</b>이 &quot;OLED&quot;로 시작하는 제품의
        <b style={{ color: C.greenLight }}> 출시연도</b> 중 가장 큰 값을 [G2] 셀에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 물류창고</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={78} firstColW={72}
              labelRow={active === '계산할 열' ? [null, null, { text: '3번째', color: C.greenLight }, null] : null} />
          </div>
          <div>
            <TableCaption color={C.amberLight}>[조건 범위]</TableCaption>
            <ExcelGrid data={cond} startCol={5} startRow={1} cellStyle={condSt} minColW={100} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>DMAX</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =DMAX(전체 표 범위, 계산할 열, 조건 범위)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>조건을 만족하는 행에서 지정한 열의 최댓값을 구합니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=DMAX(<span style={{ color: C.blueLight }}>A1:D4</span>, <span style={{ color: C.greenLight }}>3</span>, <span style={{ color: C.amberLight }}>F1:F2</span>)</div>
              <div style={{ color: C.greenLight }}>→ 2026</div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 세 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>

      {/* 와일드카드 패턴 4개 — 클릭하면 예시에서 매칭 단어만 형광 */}
      <div style={{ marginTop: 16 }}>
        <div style={{ color: C.textMuted, fontSize: 13.5, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>패턴을 눌러 매칭되는 예시를 확인하세요</div>
        <Row gap={12}>
          {patterns.map((p) => (
            <Fill key={p.key} min={130}>
              <div onClick={() => setPat(p.key)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: pat === p.key ? C.amberBg : C.bgDark, border: `1px solid ${pat === p.key ? C.amber : C.border}`, borderRadius: 8, padding: '10px 8px' }}>
                <div style={{ color: pat === p.key ? C.amber : C.text, fontSize: 18, fontWeight: 700 }}>{p.key}</div>
                <div style={{ color: C.textMuted, fontSize: 13 }}>{p.mean}</div>
              </div>
            </Fill>
          ))}
        </Row>
        <Row gap={8} style={{ marginTop: 10 }}>
          {words.map((w) => {
            const on = activeTest ? activeTest(w) : false;
            return (
              <Fixed key={w}>
                <span style={{
                  display: 'inline-block', fontSize: 15, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                  background: on ? C.amberLight : C.bgDark, color: on ? '#0b1220' : C.textMuted,
                  border: `1px solid ${on ? C.amber : C.border}`,
                }}>{w}</span>
              </Fixed>
            );
          })}
        </Row>
      </div>
    </Wrap>
  );
}
