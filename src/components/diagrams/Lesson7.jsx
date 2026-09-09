// Lesson7.jsx — 날짜 · 시간 함수 (TODAY·NOW·YEAR·MONTH·DAY, HOUR·MINUTE·SECOND·DATE·TIME, WEEKDAY, WORKDAY) 다이어그램
// 5·6차시 형식을 따른다: 정적 카드는 shared FuncCard, 인터랙티브(개념3·4)는 6차시 SumifDiagram 구조.
import { useState } from 'react';
import {
  Wrap, Title, Subtitle, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem,
  ArgButtons, rangeSides, SyntaxLine, ExplainBoard, Cell, FuncCard, C,
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
  const [active, setActive] = useState(null);

  const data = [
    ['작업명', '마감일자', '요일'],
    ['UI 디자인', '2026-06-22', '월'],
    ['API 연동', '2026-06-24', '수'],
    ['QA 테스트', '2026-06-27', '토'],
    ['배포', '2026-06-28', '일'],
  ];
  const LAST = data.length - 1; // 4

  const tabs = [
    { key: '날짜', color: C.blueLight },
    { key: '반환 유형', color: C.greenLight },
  ];
  const explain = {
    '날짜': '요일을 알고 싶은 날짜 셀입니다. [B2] 하나만 적고 아래로 채웁니다.',
    '반환 유형': '1 또는 생략 = 일요일부터 1, 2 = 월요일부터 1.\nCHOOSE에 "월"부터 나열하려면 2를 써야 숫자와 요일이 맞습니다.',
  };

  const dataSt = (ri, ci) => {
    const boxes = active === '날짜' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blueLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 2 && ri >= 1 && ri <= LAST) s.bold = true; // 요일 결과 열 강조
    return s;
  };

  // 반환 유형 비교표 (MathRoundDiagram 격자 방식)
  const cmpHead = ['반환 유형', '월', '화', '수', '목', '금', '토', '일'];
  const row1 = ['1 (생략)', '2', '3', '4', '5', '6', '7', '1'];
  const row2 = ['2', '1', '2', '3', '4', '5', '6', '7'];
  const active2 = active === '반환 유형';

  return (
    <Wrap>
      <Title>날짜의 요일 번호 구하기: WEEKDAY</Title>

      <ExamProblem notes={['WEEKDAY, CHOOSE 함수 사용', '월요일이 1이 되도록 반환 유형 지정']}>
        [표1]의 <b style={{ color: C.blueLight }}>마감일자[B2:B5]</b>의 요일을 [C2:C5] 영역에
        &quot;월&quot;~&quot;일&quot;로 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 스프린트 마감일</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={78} firstColW={90} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>WEEKDAY</div>
            <SyntaxLine fn="WEEKDAY" color={C.blue} colors={[C.blueLight, C.greenLight]} />
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>날짜의 요일을 1~7 숫자로 돌려줍니다. 반환 유형이 어느 요일을 1로 셀지 정합니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0', minHeight: 104, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>=WEEKDAY(B2, 2) → 1</div>
              <div style={{ display: 'inline-block', alignSelf: 'center', textAlign: 'left' }}>
                <div style={{ whiteSpace: 'nowrap' }}>=CHOOSE(<span style={{ color: C.blueLight }}>WEEKDAY(B2, 2)</span>,</div>
                <div style={{ whiteSpace: 'nowrap' }}>&quot;월&quot;,&quot;화&quot;,&quot;수&quot;,&quot;목&quot;,&quot;금&quot;,&quot;토&quot;,&quot;일&quot;)</div>
              </div>
              <div><span style={{ color: C.greenLight }}>→ 월</span></div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 두 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>

      <div style={{ marginTop: 16 }}>
        <TableCaption color={C.textMuted}>반환 유형별 요일 번호</TableCaption>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', width: '100%' }}>
          {cmpHead.map((h, i) => (
            <Cell key={'h' + i} bg={C.blueCard} border={C.blueDim}
              style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
          ))}
          {row1.map((v, i) => (
            <Cell key={'r1' + i} bg={C.bgDark} border={C.border}
              style={{ color: C.text, fontWeight: i === 0 ? 700 : 400, fontSize: 15 }}>{v}</Cell>
          ))}
          {row2.map((v, i) => (
            <Cell key={'r2' + i} bg={active2 ? C.amberBg : C.bgDark} border={active2 ? C.amber : C.border}
              style={{ color: active2 ? C.amber : C.text, fontWeight: (active2 || i === 0) ? 700 : 400, fontSize: 15 }}>{v}</Cell>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// WorkdayDiagram — 개념4 (인터랙티브, SumifDiagram 구조 · 공휴일 미포함)
// ─────────────────────────────────────────────
export function WorkdayDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['프로젝트명', '개발시작일', '소요일수', '완료예정일'],
    ['API 연동', '2026-06-22', 5, '2026-06-29'],
    ['UI 디자인', '2026-06-23', 3, '2026-06-26'],
    ['QA 테스트', '2026-06-25', 2, '2026-06-29'],
  ];
  const LAST = data.length - 1; // 3

  const tabs = [
    { key: '시작 날짜', color: C.blueLight },
    { key: '일수', color: C.greenLight },
  ];
  const explain = {
    '시작 날짜': '기준 날짜 [B2]. 이 날은 세지 않고 다음 날부터 1일째로 셉니다.',
    '일수': '건너뛸 근무일 수 [C2]. 주말은 자동으로 빠집니다. 셋째 인수 [휴일 범위]는 생략하면 되고 시험에는 거의 나오지 않습니다.',
  };

  const dataSt = (ri, ci) => {
    const boxes = active === '시작 날짜' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blueLight }]
      : active === '일수' ? [{ r1: 1, r2: LAST, c1: 2, c2: 2, color: C.greenLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 3 && ri >= 1 && ri <= LAST) s.bold = true; // 완료예정일 열 강조
    return s;
  };

  // 계산 과정 띠 (6/22 월 시작, 5근무일 → 6/29 월)
  const steps = [
    { t: '6/23 화\n1일째', bg: C.greenDark, border: C.green, color: C.greenLight },
    { t: '6/24 수\n2일째', bg: C.greenDark, border: C.green, color: C.greenLight },
    { t: '6/25 목\n3일째', bg: C.greenDark, border: C.green, color: C.greenLight },
    { t: '6/26 금\n4일째', bg: C.greenDark, border: C.green, color: C.greenLight },
    { t: '6/27 토\n주말', bg: C.purpleCard, border: C.purple, color: C.purpleLight },
    { t: '6/28 일\n주말', bg: C.purpleCard, border: C.purple, color: C.purpleLight },
    { t: '6/29 월\n5일째 ★', bg: C.greenBg, border: C.greenLight, color: C.greenLight },
  ];

  return (
    <Wrap>
      <Title>주말을 뺀 완료일 구하기: WORKDAY</Title>

      <ExamProblem notes={['WORKDAY 함수 사용', '주말(토 · 일)은 근무일에서 제외']}>
        [표1]의 <b style={{ color: C.blueLight }}>개발시작일[B2:B4]</b>에서
        <b style={{ color: C.greenLight }}> 소요일수[C2:C4]</b>만큼 지난 완료예정일을 [D2:D4] 영역에 계산하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 외주 개발 일정</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={78} firstColW={88} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>WORKDAY</div>
            <SyntaxLine fn="WORKDAY" color={C.blue} colors={[C.blueLight, C.greenLight]} />
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>시작 날짜에서 주말(토 · 일)을 건너뛰고 일수만큼 지난 날짜를 돌려줍니다. 시작 날짜 자신은 세지 않습니다.</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0', minHeight: 62, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
              <div>=WORKDAY(<span style={{ color: C.blueLight }}>B2</span>, <span style={{ color: C.greenLight }}>C2</span>) <span style={{ color: C.greenLight }}>→ 2026-06-29</span></div>
            </div>
          </div>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 두 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>

      <div style={{ marginTop: 16 }}>
        <TableCaption color={C.textMuted}>=WORKDAY(B2, C2) 계산 과정 — B2 = 6/22(월)</TableCaption>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', width: '100%' }}>
          {steps.map((s, i) => (
            <Cell key={i} bg={s.bg} border={s.border}
              style={{ color: s.color, fontWeight: 700, fontSize: 15, whiteSpace: 'pre-line' }}>{s.t}</Cell>
          ))}
        </div>
      </div>
    </Wrap>
  );
}
