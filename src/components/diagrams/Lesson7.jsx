// Lesson7.jsx — 날짜 · 시간 함수 (TODAY·NOW·YEAR·MONTH·DAY, HOUR·MINUTE·SECOND·DATE·TIME, WEEKDAY, WORKDAY) 다이어그램
// 5·6차시 형식을 따른다: 정적 카드는 shared FuncCard, 인터랙티브(개념3·4)는 6차시 SumifDiagram 구조.
import {
  Wrap, Title, Subtitle, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem,
  rangeSides, SyntaxLine, Cell, FuncCard, C,
} from './shared.jsx';

// 표 머리글 행 공통 스타일
const headSt = (ri) => (ri === 0 ? { bold: true, color: C.blueLight, bg: C.blueCard } : {});

// ─────────────────────────────────────────────
// DatetimeBasicDiagram — 개념1 (정적 카드형)
// ─────────────────────────────────────────────
export function DatetimeBasicDiagram() {
  const data = [
    ['서버명', '배포일자'],
    ['메인 DB', '2026-06-27'],
  ];

  const cards = [
    { name: 'TODAY', desc: '오늘 날짜(인수 없음)', formula: '=TODAY()', value: '= 오늘 날짜',
      bg: C.amberBg, border: C.amber, color: C.amber, valColor: C.amberLight },
    { name: 'NOW', desc: '오늘 날짜와 현재 시각(인수 없음)', formula: '=NOW()', value: '= 오늘 날짜 + 시각',
      bg: C.orangeBg, border: C.orange, color: C.orange, valColor: C.orangeLight },
    { name: 'YEAR', desc: '연도만 추출', formula: '=YEAR(B2)', value: '= 2026',
      bg: C.blueCard, border: C.blueDim, color: C.blue, valColor: C.blueLight },
    { name: 'MONTH', desc: '월(1~12)만 추출', formula: '=MONTH(B2)', value: '= 6',
      bg: C.purpleCard, border: C.purple, color: C.purpleLight, valColor: C.purpleLight },
    { name: 'DAY', desc: '일(1~31)만 추출', formula: '=DAY(B2)', value: '= 27',
      bg: C.greenDark, border: C.green, color: C.greenLight, valColor: C.greenLight },
  ];

  return (
    <Wrap>
      <Title>현재 날짜와 날짜 단위 추출: TODAY · NOW · YEAR · MONTH · DAY</Title>

      <Row>
        <Fixed>
          <TableCaption color={C.blueLight}>[표1] 배포 일지</TableCaption>
          <ExcelGrid data={data} startRow={1} cellStyle={headSt} minColW={100} />
        </Fixed>
      </Row>

      <Row gap={12} style={{ marginTop: 16 }}>
        {cards.map((c) => (
          <Fill key={c.name} min={150}><FuncCard c={c} /></Fill>
        ))}
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// DatetimeComposeDiagram — 개념2 (정적 카드형)
// ─────────────────────────────────────────────
export function DatetimeComposeDiagram() {
  const data = [
    ['연도', '월', '일', '시', '분', '초', '기록시각'],
    [2026, 6, 15, 14, 35, 9, '14:35:09'],
  ];

  const cards = [
    { name: 'HOUR', desc: '시(0~23)만 추출', formula: '=HOUR(G2)', value: '= 14',
      bg: C.blueCard, border: C.blueDim, color: C.blue, valColor: C.blueLight },
    { name: 'MINUTE', desc: '분(0~59)만 추출', formula: '=MINUTE(G2)', value: '= 35',
      bg: C.purpleCard, border: C.purple, color: C.purpleLight, valColor: C.purpleLight },
    { name: 'SECOND', desc: '초(0~59)만 추출', formula: '=SECOND(G2)', value: '= 9',
      bg: C.greenDark, border: C.green, color: C.greenLight, valColor: C.greenLight },
    { name: 'DATE', desc: '연도·월·일 → 날짜', formula: '=DATE(A2, B2, C2)', value: '= 2026-06-15',
      bg: C.amberBg, border: C.amber, color: C.amber, valColor: C.amberLight },
    { name: 'TIME', desc: '시·분·초 → 시간', formula: '=TIME(D2, E2, F2)', value: '= 14:35:09',
      bg: C.orangeBg, border: C.orange, color: C.orange, valColor: C.orangeLight },
  ];

  return (
    <Wrap>
      <Title>시간 분해와 날짜 · 시간 조합: HOUR · MINUTE · SECOND · DATE · TIME</Title>
      <Subtitle>분해(HOUR · MINUTE · SECOND) ↔ 조합(DATE · TIME)</Subtitle>

      <Row>
        <Fixed>
          <TableCaption color={C.blueLight}>[표1] 로그온 기록</TableCaption>
          <ExcelGrid data={data} startRow={1} cellStyle={headSt} minColW={56} firstColW={60} />
        </Fixed>
      </Row>

      <Row gap={12} style={{ marginTop: 16 }}>
        {cards.map((c) => (
          <Fill key={c.name} min={150}><FuncCard c={c} /></Fill>
        ))}
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// WeekdayDiagram — 개념3 (인터랙티브, SumifDiagram 구조)
// ─────────────────────────────────────────────
export function WeekdayDiagram() {
  const data = [
    ['작업명', '마감일자', '요일번호', '요일'],
    ['UI 디자인', '2026-06-22', 1, '월'],
    ['API 연동', '2026-06-24', 3, '수'],
    ['QA 테스트', '2026-06-27', 6, '토'],
    ['배포', '2026-06-28', 7, '일'],
  ];
  const LAST = data.length - 1; // 4

  // 정적 강조: 마감일자(B2:B5) 파랑 테두리, 요일번호(C2:C5) 초록 테두리, 요일(D2:D5) 굵게
  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = rangeSides(ri, ci, [
      { r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blue },
      { r1: 1, r2: LAST, c1: 2, c2: 2, color: C.green },
    ]);
    if (ci === 3 && ri >= 1 && ri <= LAST) s.bold = true;
    return s;
  };

  // 단계 박스 스타일 (4차시 IndexMatchDiagram과 동일)
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>날짜의 요일 번호 구하기: WEEKDAY</Title>

      <ExamProblem notes={['WEEKDAY, CHOOSE 함수 사용', '월요일이 1이 되도록 반환 유형 지정']}>
        [표1]의 <b style={{ color: C.blueLight }}>마감일자[B2:B5]</b>로 요일번호[C2:C5]를 구하고,
        그 번호로 <b style={{ color: C.greenLight }}>요일[D2:D5]</b>을 &quot;월&quot;~&quot;일&quot;로 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 스프린트 마감일</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={74} firstColW={90} />
          </div>
        </Fixed>

        <Fill min={360} max={500} gap={12}>
          {/* 1단계 — WEEKDAY */}
          <div style={{ ...boxBase, background: C.blueCard, border: `2px solid ${C.blue}` }}>
            <div style={nameSt(C.blueLight)}>1단계 · WEEKDAY — 요일 번호</div>
            <SyntaxLine fn="WEEKDAY" color={C.blue} size={14} />
            <div style={{ ...descSt, whiteSpace: 'pre-line' }}>
              {'WEEKDAY 함수는 마감일자의 요일을 1부터 7까지의 숫자로 바꿉니다.\n문제에서 월요일이 1이 되도록 반환 유형을 지정하라고 했으므로 2를 씁니다.\n'}
              <span style={{ color: C.textMuted }}>1 — 숫자 1(일요일)에서 7(토요일)까지</span>
              {'\n'}
              <span style={{ color: C.blueLight, fontWeight: 700 }}>2 — 숫자 1(월요일)에서 7(일요일)까지</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>=WEEKDAY(B2, 2) = <span style={{ color: C.blueLight }}>1</span></div>
          </div>

          {/* 2단계 — CHOOSE */}
          <div style={{ ...boxBase, background: C.greenDark, border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>2단계 · CHOOSE — 요일 텍스트</div>
            <SyntaxLine fn="CHOOSE" color={C.greenLight} size={14} />
            <div style={descSt}>CHOOSE의 첫 인수 자리에 1단계 WEEKDAY 수식을 그대로 넣습니다. 숫자가 1이면 첫 번째 값 &quot;월&quot;, 3이면 세 번째 값 &quot;수&quot;가 나옵니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>=CHOOSE(<span style={{ color: C.blueLight }}>WEEKDAY(B2, 2)</span>, &quot;월&quot;,&quot;화&quot;,&quot;수&quot;,&quot;목&quot;,&quot;금&quot;,&quot;토&quot;,&quot;일&quot;) = <span style={{ color: C.greenLight }}>&quot;월&quot;</span></div>
          </div>
        </Fill>
      </Row>

      <Row gap={20} style={{ marginTop: 16 }}>
        <Fill min={260}>
          <TableCaption color={C.textMuted}>반환 유형 1</TableCaption>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%' }}>
            {['1', '2', '3', '4', '5', '6', '7'].map((v, i) => (
              <Cell key={'l-n' + i} bg={C.bgDark} border={C.border}
                style={{ color: C.textMuted, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {['일', '월', '화', '수', '목', '금', '토'].map((v, i) => (
              <Cell key={'l-d' + i} bg={C.bgDark} border={C.border}
                style={{ color: C.text, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>
        </Fill>
        <Fill min={260}>
          <TableCaption color={C.amber}>반환 유형 2 (문제에서 사용)</TableCaption>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%' }}>
            {['1', '2', '3', '4', '5', '6', '7'].map((v, i) => (
              <Cell key={'r-n' + i} bg={C.amberBg} border={C.amber}
                style={{ color: C.amber, fontWeight: 700, fontSize: 15 }}>{v}</Cell>
            ))}
            {['월', '화', '수', '목', '금', '토', '일'].map((v, i) => (
              <Cell key={'r-d' + i} bg={C.bgDark} border={C.amber}
                style={{ color: C.amber, fontSize: 15 }}>{v}</Cell>
            ))}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// WorkdayDiagram — 개념4 (인터랙티브, SumifDiagram 구조 · 공휴일 미포함)
// ─────────────────────────────────────────────
export function WorkdayDiagram() {
  const data = [
    ['프로젝트명', '개발시작일', '소요일수', '완료예정일'],
    ['API 연동', '2026-06-22', 5, '2026-06-29'],
    ['UI 디자인', '2026-06-23', 3, '2026-06-26'],
    ['QA 테스트', '2026-06-25', 2, '2026-06-29'],
  ];
  const LAST = data.length - 1; // 3

  // 정적 강조: 개발시작일(B2:B4) 파랑 테두리, 소요일수(C2:C4) 초록 테두리, 완료예정일(D2:D4) 굵게
  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = rangeSides(ri, ci, [
      { r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blue },
      { r1: 1, r2: LAST, c1: 2, c2: 2, color: C.green },
    ]);
    if (ci === 3 && ri >= 1 && ri <= LAST) s.bold = true;
    return s;
  };

  // 단계 박스 스타일 (개념3 단계 박스 / 4차시 IndexMatchDiagram과 동일)
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  // 2026년 6월 달력 (1일=월요일). 22 시작 → 근무일 23~26·29(주말 27·28 건너뜀) → 5일째 29 완료
  const dow = ['월', '화', '수', '목', '금', '토', '일'];
  const dayLabel = { 22: '시작', 23: '1일째', 24: '2일째', 25: '3일째', 26: '4일째', 27: '×', 28: '×', 29: '5일째' };
  const dayStyle = (d) => {
    if (d === 22) return { bg: C.blueCard, border: C.blue, color: C.blue, bold: true };
    if (d >= 23 && d <= 26) return { bg: C.greenDark, border: C.green, color: C.greenLight, bold: true };
    if (d === 27 || d === 28) return { bg: C.purpleCard, border: C.purple, color: C.purpleLight, bold: true };
    if (d === 29) return { bg: C.greenBg, border: C.greenLight, color: C.greenLight, bold: true };
    return { bg: C.bgDark, border: C.border, color: C.textDim, bold: false }; // 1~21, 30
  };

  return (
    <Wrap>
      <Title>주말을 빼고 날짜 더하기: WORKDAY</Title>

      <ExamProblem notes={['완료예정일 : 개발시작일에 주말(토 · 일)을 제외하고 소요일수를 더한 날짜', 'WORKDAY 함수 사용']}>
        [표1]의 <b style={{ color: C.blueLight }}>개발시작일[B2:B4]</b>과
        <b style={{ color: C.greenLight }}> 소요일수[C2:C4]</b>를 이용하여 완료예정일[D2:D4]을 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 외주 개발 일정</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={78} firstColW={88} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ ...boxBase, background: C.blueCard, border: `2px solid ${C.blue}` }}>
            <div style={nameSt(C.blueLight)}>WORKDAY</div>
            <SyntaxLine fn="WORKDAY" color={C.blue} colors={[C.blueLight, C.greenLight]} size={14} />
            <div style={descSt}>시작 날짜에서 주말(토 · 일)을 건너뛰고 일수만큼 지난 날짜를 돌려줍니다. 시작 날짜 자신은 세지 않습니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>=WORKDAY(<span style={{ color: C.blueLight }}>B2</span>, <span style={{ color: C.greenLight }}>C2</span>) <span style={{ color: C.greenLight }}>→ 2026-06-29</span></div>
          </div>
        </Fill>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Fill max={500}>
          <div style={{ textAlign: 'center' }}>
            <TableCaption color={C.textMuted}>=WORKDAY(B2, C2) 계산 과정 — 2026년 6월</TableCaption>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%' }}>
            {dow.map((h, i) => (
              <Cell key={'h' + i} bg={C.bgDark} border={C.border}
                style={{ color: C.textDim, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {Array.from({ length: 30 }, (_, k) => {
              const d = k + 1;
              const st = dayStyle(d);
              return (
                <Cell key={'d' + d} bg={st.bg} border={st.border} bw={2}
                  style={{ color: st.color, fontWeight: st.bold ? 700 : 400, fontSize: 15, padding: '6px 2px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div>{d}</div>
                    <div>{dayLabel[d] || ' '}</div>
                  </div>
                </Cell>
              );
            })}
            {Array.from({ length: 5 }, (_, k) => (
              <Cell key={'b' + k} bg="transparent" border="transparent" bw={2} style={{ fontSize: 15 }}>{''}</Cell>
            ))}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}
