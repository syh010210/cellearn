// Lesson8.jsx — 논리 함수 (IF, 중첩 IF, IF+AND, IF+OR, IFERROR) 다이어그램
// 유형: 개념1·5 = B.인수형(ArgButtons), 개념2·3·4 = C.단계형(StepBox). 박스 줄 구성은 공통.
import { useState } from 'react';
import {
  Wrap, Title, Row, Fixed, Fill, ExcelGrid, TableCaption, ExamProblem,
  ArgButtons, rangeSides, SyntaxLine, ExplainBoard, Cell, StepBox, C,
} from './shared.jsx';

// B.인수형 함수 박스 (6차시 SumifDiagram 형태)
function FnBox({ name, syntaxColors, desc, children }) {
  return (
    <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>{name}</div>
      <SyntaxLine fn={name} color={C.blue} colors={syntaxColors} size={14} />
      <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
      <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
      <div style={{ color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0', minHeight: 62, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
        {children}
      </div>
    </div>
  );
}

// 두 줄 가운데 정렬 칸 (판정 띠용)
function TwoLineCell({ top, bottom, bg, border, color }) {
  return (
    <Cell bg={bg} border={border} bw={2} style={{ color, fontWeight: 700, fontSize: 15 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>{top}</div>
        <div>{bottom}</div>
      </div>
    </Cell>
  );
}

// ─────────────────────────────────────────────
// IfDiagram — 개념1 (B. 인수형)
// ─────────────────────────────────────────────
export function IfDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['응시자', '응시일', '요일', '요일구분'],
    ['김민지', '2026-06-22', '월요일', '평일'],
    ['이도현', '2026-06-27', '토요일', '주말'],
    ['박서준', '2026-06-26', '금요일', '평일'],
    ['최유나', '2026-06-28', '일요일', '주말'],
  ];
  const LAST = data.length - 1; // 4

  const tabs = [
    { key: '논리 검사', color: C.amberLight },
    { key: '참일 때', color: C.greenLight },
    { key: '거짓일 때', color: C.redLight },
  ];
  const explain = {
    '논리 검사': 'WEEKDAY(B2, 2)로 요일 번호를 구해 5 이하인지 비교합니다. 월요일이 1이므로 금요일까지 TRUE, 토(6)·일(7)은 FALSE입니다.',
    '참일 때': '논리 검사가 TRUE인 행에 표시할 값입니다. 문자는 큰따옴표로 감쌉니다.',
    '거짓일 때': 'FALSE인 행에 표시할 값입니다. 공백을 표시하라는 문제면 큰따옴표 두 개 ""를 씁니다.',
  };

  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const boxes = active === '논리 검사' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.amberLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (ci === 2 && ri >= 1 && ri <= LAST) s.color = C.textMuted; // 요일 열 = 참고용
    if (active === '참일 때' && ci === 3 && (ri === 1 || ri === 3)) { s.bg = C.greenBg; s.color = C.greenLight; }
    if (active === '거짓일 때' && ci === 3 && (ri === 2 || ri === 4)) { s.bg = C.redBg; s.color = C.redLight; }
    if (ci === 3 && ri >= 1 && ri <= LAST) s.bold = true;
    return s;
  };

  return (
    <Wrap>
      <Title>조건에 따라 두 값 중 하나 표시하기: IF</Title>

      <ExamProblem notes={['요일 계산 시 월요일이 1인 유형으로 지정', 'IF, WEEKDAY 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>응시일[B2:B5]</b>이 월요일부터 금요일이면
        <b style={{ color: C.greenLight }}> &quot;평일&quot;</b>, 그 외에는 <b style={{ color: C.redLight }}>&quot;주말&quot;</b>을 요일구분[D2:D5]에 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 자격시험 응시 명단</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={84} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <FnBox name="IF" syntaxColors={[C.amberLight, C.greenLight, C.redLight]}
            desc="논리 검사가 TRUE면 참일 때 값을, FALSE면 거짓일 때 값을 표시합니다.">
            <div>{'=IF('}<span style={{ color: C.amberLight }}>{'WEEKDAY(B2, 2)<=5'}</span>{', '}<span style={{ color: C.greenLight }}>{'"평일"'}</span>{', '}<span style={{ color: C.redLight }}>{'"주말"'}</span>{') '}<span style={{ color: C.greenLight }}>→ 평일</span></div>
          </FnBox>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 세 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// NestedIfDiagram — 개념2 (C. 단계형)
// ─────────────────────────────────────────────
export function NestedIfDiagram() {
  const data = [
    ['회원명', '가입일', '등급', '', '기준일'],
    ['김민지', '2014-03-05', '★', '', '2026-09-10'],
    ['이도현', '2019-11-20', '☆', '', ''],
    ['박서준', '2023-06-01', '', '', ''],
    ['최유나', '2016-09-10', '★', '', ''],
    ['정하늘', '2021-01-15', '☆', '', ''],
  ];
  const LAST = data.length - 1; // 5

  const dataSt = (ri, ci) => {
    if (ri === 0) return (ci <= 2 || ci === 4) ? { bold: true, color: C.blueLight, bg: C.blueCard } : {};
    const s = rangeSides(ri, ci, [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.amber }]);
    if (ci === 4 && ri === 1) { s.bg = C.blueCard; s.bold = true; } // E2 기준일
    if (ci === 2 && ri >= 1 && ri <= LAST) {
      s.bold = true;
      const v = data[ri][2];
      if (v === '★') s.color = C.greenLight;
      else if (v === '☆') s.color = C.blueLight;
    }
    return s;
  };

  return (
    <Wrap>
      <Title>결과가 셋 이상일 때: 중첩 IF</Title>

      <ExamProblem notes={['가입기간 = 기준일의 연도 − 가입일의 연도', 'IF, YEAR 함수 사용']}>
        [표1]에서 기준일[E2]을 기준으로 <b style={{ color: C.amberLight }}>가입일[B2:B6]</b>의 가입기간이
        10년 이상이면 &quot;★&quot;, 10년 미만 5년 이상이면 &quot;☆&quot;, 5년 미만이면 공백을 등급[C2:C6]에 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 회원 가입 현황</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={96} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500} gap={12}>
          <StepBox title="1단계 · 첫 번째 IF — 가장 높은 기준" color={C.greenLight} bg={C.greenDark} border={C.green}
            fn="IF" syntaxColors={[C.amberLight, C.greenLight, C.redLight]}
            desc="높은 기준부터 검사합니다. 가입기간이 10 이상이면 여기서 ★로 끝나고, 아니면 거짓일 때 자리로 넘어갑니다.">
            <div>{'=IF('}<span style={{ color: C.amberLight }}>{'YEAR($E$2)-YEAR(B2)>=10'}</span>{', '}<span style={{ color: C.greenLight }}>{'"★"'}</span>{', '}<span style={{ color: C.redLight }}>거짓일 때</span>{')'}</div>
          </StepBox>
          <StepBox title="2단계 · 거짓일 때 자리에 두 번째 IF" color={C.blueLight} bg={C.blueCard} border={C.blue}
            fn="IF" syntaxColors={[C.amberLight, C.greenLight, C.redLight]}
            desc="첫 번째 IF의 거짓일 때 자리에 IF를 하나 더 넣습니다. 여기 온 값은 이미 10 미만이므로 5 이상인지만 검사하면 됩니다. 닫는 괄호는 IF 개수만큼 두 개입니다.">
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <div style={{ whiteSpace: 'nowrap' }}>{'=IF(YEAR($E$2)-YEAR(B2)>=10, "★",'}</div>
              <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.blueLight }}>{'IF(YEAR($E$2)-YEAR(B2)>=5, "☆", "")'}</span>{')'}</div>
            </div>
            <div><span style={{ color: C.greenLight }}>{'= "★"'}</span></div>
          </StepBox>
        </Fill>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Fill max={500}>
          <div style={{ textAlign: 'center' }}>
            <TableCaption color={C.textMuted}>가입기간에 따른 판정</TableCaption>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
            <TwoLineCell top="10년 이상" bottom="★" bg={C.greenDark} border={C.green} color={C.greenLight} />
            <TwoLineCell top="5년 이상 10년 미만" bottom="☆" bg={C.blueCard} border={C.blue} color={C.blueLight} />
            <TwoLineCell top="5년 미만" bottom="공백" bg={C.bgDark} border={C.border} color={C.textMuted} />
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// IfAndDiagram — 개념3 (C. 단계형)
// ─────────────────────────────────────────────
export function IfAndDiagram() {
  const data = [
    ['응시자', '1과목', '2과목', '합격여부'],
    ['김민지', 70, 80, '합격'],
    ['이도현', 35, 95, '불합격'],
    ['박서준', 55, 60, '불합격'],
    ['최유나', 40, 80, '합격'],
    ['정하늘', 90, 30, '불합격'],
  ];
  const LAST = data.length - 1; // 5

  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = rangeSides(ri, ci, [
      { r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blue },
      { r1: 1, r2: LAST, c1: 2, c2: 2, color: C.purple },
    ]);
    if (ci === 3 && ri >= 1 && ri <= LAST) {
      s.bold = true;
      s.color = data[ri][3] === '합격' ? C.greenLight : C.redLight;
    }
    return s;
  };

  const truth = [
    { a: 'TRUE', b: 'TRUE', r: 'TRUE', ok: true },
    { a: 'TRUE', b: 'FALSE', r: 'FALSE', ok: false },
    { a: 'FALSE', b: 'TRUE', r: 'FALSE', ok: false },
    { a: 'FALSE', b: 'FALSE', r: 'FALSE', ok: false },
  ];

  return (
    <Wrap>
      <Title>조건을 모두 만족할 때: IF + AND</Title>

      <ExamProblem notes={['IF, AVERAGE, AND 함수 사용']}>
        [표1]에서 <b style={{ color: C.blueLight }}>1과목[B2:B6]</b>, <b style={{ color: C.purpleLight }}>2과목[C2:C6]</b>이
        각각 40 이상이면서 <b style={{ color: C.orangeLight }}>평균</b>이 60 이상이면 &quot;합격&quot;을, 그 외에는 &quot;불합격&quot;을 합격여부[D2:D6]에 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 자격시험 결과</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={80} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500} gap={12}>
          <StepBox title="1단계 · AND — 모두 TRUE인지" color={C.blueLight} bg={C.blueCard} border={C.blue}
            fn="AND" syntaxColors={[C.blueLight, C.purpleLight, C.orangeLight]}
            desc="나열한 조건이 전부 TRUE일 때만 TRUE입니다. 하나라도 FALSE면 FALSE입니다. 조건은 셋 이상 넣을 수 있습니다.">
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <div style={{ whiteSpace: 'nowrap' }}>{'=AND('}<span style={{ color: C.blueLight }}>{'B2>=40'}</span>{', '}<span style={{ color: C.purpleLight }}>{'C2>=40'}</span>{','}</div>
              <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.orangeLight }}>{'AVERAGE(B2:C2)>=60'}</span>{')'}</div>
            </div>
            <div><span style={{ color: C.greenLight }}>= TRUE</span></div>
          </StepBox>
          <StepBox title="2단계 · IF — 결과 표시" color={C.greenLight} bg={C.greenDark} border={C.green}
            fn="IF" syntaxColors={[C.amberLight, C.greenLight, C.redLight]}
            desc="IF의 논리 검사 자리에 1단계 AND 수식을 그대로 넣습니다.">
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <div style={{ whiteSpace: 'nowrap' }}>{'=IF('}<span style={{ color: C.amberLight }}>{'AND(B2>=40, C2>=40, AVERAGE(B2:C2)>=60)'}</span>{','}</div>
              <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.greenLight }}>{'"합격"'}</span>{', '}<span style={{ color: C.redLight }}>{'"불합격"'}</span>{')'}</div>
            </div>
            <div><span style={{ color: C.greenLight }}>{'= "합격"'}</span></div>
          </StepBox>
        </Fill>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Fill max={500}>
          <div style={{ textAlign: 'center' }}>
            <TableCaption color={C.textMuted}>AND — 모두 TRUE일 때만 TRUE</TableCaption>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
            {['논리1', '논리2', 'AND 결과'].map((h, i) => (
              <Cell key={'h' + i} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {truth.map((t, i) => [
              <Cell key={'a' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15 }}>{t.a}</Cell>,
              <Cell key={'b' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15 }}>{t.b}</Cell>,
              <Cell key={'r' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15, fontWeight: 700 }}>{t.r}</Cell>,
            ])}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// IfOrDiagram — 개념4 (C. 단계형)
// ─────────────────────────────────────────────
export function IfOrDiagram() {
  const data = [
    ['회원명', '구입횟수', '구입총액', '등급'],
    ['김민지', 160, '820,000', 'VIP'],
    ['이도현', 90, '1,250,000', 'VIP'],
    ['박서준', 40, '300,000', '일반'],
    ['최유나', 150, '500,000', 'VIP'],
    ['정하늘', 120, '700,000', '일반'],
  ];
  const LAST = data.length - 1; // 5

  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = rangeSides(ri, ci, [
      { r1: 1, r2: LAST, c1: 1, c2: 1, color: C.blue },
      { r1: 1, r2: LAST, c1: 2, c2: 2, color: C.purple },
    ]);
    if (ci === 3 && ri >= 1 && ri <= LAST) {
      s.bold = true;
      s.color = data[ri][3] === 'VIP' ? C.greenLight : C.textMuted;
    }
    return s;
  };

  const truth = [
    { a: 'TRUE', b: 'TRUE', r: 'TRUE', ok: true },
    { a: 'TRUE', b: 'FALSE', r: 'TRUE', ok: true },
    { a: 'FALSE', b: 'TRUE', r: 'TRUE', ok: true },
    { a: 'FALSE', b: 'FALSE', r: 'FALSE', ok: false },
  ];

  return (
    <Wrap>
      <Title>조건 중 하나만 만족해도: IF + OR</Title>

      <ExamProblem notes={['AVERAGE, IF, OR 함수 사용']}>
        [표1]에서 <b style={{ color: C.blueLight }}>구입횟수[B2:B6]</b>가 150 이상이거나
        <b style={{ color: C.purpleLight }}> 구입총액[C2:C6]</b>이 구입총액의 평균보다 크면 &quot;VIP&quot;, 그렇지 않으면 &quot;일반&quot;을 등급[D2:D6]에 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 회원 구매 현황</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={90} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500} gap={12}>
          <StepBox title="1단계 · OR — 하나라도 TRUE인지" color={C.blueLight} bg={C.blueCard} border={C.blue}
            fn="OR" syntaxColors={[C.blueLight, C.purpleLight]}
            desc="나열한 조건 중 하나라도 TRUE면 TRUE입니다. 전부 FALSE일 때만 FALSE입니다. 평균 범위는 아래로 채워도 고정되도록 $를 붙입니다.">
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <div style={{ whiteSpace: 'nowrap' }}>{'=OR('}<span style={{ color: C.blueLight }}>{'B2>=150'}</span>{','}</div>
              <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.purpleLight }}>{'C2>AVERAGE($C$2:$C$6)'}</span>{')'}</div>
            </div>
            <div><span style={{ color: C.greenLight }}>= TRUE</span></div>
          </StepBox>
          <StepBox title="2단계 · IF — 결과 표시" color={C.greenLight} bg={C.greenDark} border={C.green}
            fn="IF" syntaxColors={[C.amberLight, C.greenLight, C.redLight]}
            desc="IF의 논리 검사 자리에 1단계 OR 수식을 그대로 넣습니다.">
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
              <div style={{ whiteSpace: 'nowrap' }}>{'=IF('}<span style={{ color: C.amberLight }}>{'OR(B2>=150, C2>AVERAGE($C$2:$C$6))'}</span>{','}</div>
              <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: C.greenLight }}>{'"VIP"'}</span>{', '}<span style={{ color: C.redLight }}>{'"일반"'}</span>{')'}</div>
            </div>
            <div><span style={{ color: C.greenLight }}>{'= "VIP"'}</span></div>
          </StepBox>
        </Fill>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Fill max={500}>
          <div style={{ textAlign: 'center' }}>
            <TableCaption color={C.textMuted}>OR — 하나라도 TRUE면 TRUE</TableCaption>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%' }}>
            {['논리1', '논리2', 'OR 결과'].map((h, i) => (
              <Cell key={'h' + i} bg={C.blueCard} border={C.blueDim} style={{ color: C.blueLight, fontWeight: 700, fontSize: 15 }}>{h}</Cell>
            ))}
            {truth.map((t, i) => [
              <Cell key={'a' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15 }}>{t.a}</Cell>,
              <Cell key={'b' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15 }}>{t.b}</Cell>,
              <Cell key={'r' + i} bg={t.ok ? C.greenDark : C.redDark} border={t.ok ? C.green : C.red} style={{ color: t.ok ? C.greenLight : C.redLight, fontSize: 15, fontWeight: 700 }}>{t.r}</Cell>,
            ])}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ─────────────────────────────────────────────
// IfErrorDiagram — 개념5 (B. 인수형)
// ─────────────────────────────────────────────
export function IfErrorDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['선수명', '기록(초)', '순위'],
    ['김민지', 12.4, 2],
    ['이도현', '', '실격'],
    ['박서준', 11.9, 1],
    ['최유나', 13.1, 3],
    ['정하늘', 13.5, 4],
  ];
  const LAST = data.length - 1; // 5

  const tabs = [
    { key: '값', color: C.amberLight },
    { key: '오류일 때', color: C.redLight },
  ];
  const explain = {
    '값': '먼저 계산할 수식입니다. 기록이 가장 빠른 것이 1위이므로 RANK.EQ의 정렬 인수는 1(오름차순)입니다. 기록이 있는 행은 순위가 그대로 나옵니다.',
    '오류일 때': '이도현처럼 기록이 빈 셀이면 RANK.EQ가 오류를 내고, 그 자리에 "실격"이 대신 표시됩니다. #N/A, #DIV/0! 등 어떤 오류든 같습니다.',
  };

  const dataSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const boxes = active === '값' ? [{ r1: 1, r2: LAST, c1: 1, c2: 1, color: C.amberLight }] : [];
    const s = rangeSides(ri, ci, boxes);
    if (active === '오류일 때' && ri === 2 && (ci === 1 || ci === 2)) { s.bg = C.redBg; s.color = C.redLight; }
    if (ci === 2 && ri >= 1 && ri <= LAST) s.bold = true;
    return s;
  };

  return (
    <Wrap>
      <Title>오류가 나면 다른 값으로: IFERROR</Title>

      <ExamProblem notes={['순위는 기록이 가장 빠른 것이 1위', '기록이 비어 있는 경우 "실격"', 'IFERROR, RANK.EQ 함수 사용']}>
        [표1]에서 <b style={{ color: C.amberLight }}>기록[B2:B6]</b>에 대한 순위를 구하여 순위[C2:C6]에 표시하시오.
      </ExamProblem>

      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 100m 기록</TableCaption>
            <ExcelGrid data={data} startRow={1} cellStyle={dataSt} minColW={84} firstColW={72} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          <FnBox name="IFERROR" syntaxColors={[C.amberLight, C.redLight]}
            desc="값을 먼저 계산합니다. 오류가 아니면 그 결과를, 오류면 오류일 때 값을 표시합니다.">
            <div>{'=IFERROR('}<span style={{ color: C.amberLight }}>{'RANK.EQ(B2, $B$2:$B$6, 1)'}</span>{', '}<span style={{ color: C.redLight }}>{'"실격"'}</span>{') '}<span style={{ color: C.greenLight }}>→ 2</span></div>
            <div style={{ color: C.textMuted, fontWeight: 400, fontSize: 15 }}>{'빈 셀 B3에서 RANK.EQ만 쓰면 → #VALUE!'}</div>
          </FnBox>
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 두 개의 인수를 하나씩 확인하세요</div>
          <ArgButtons tabs={tabs} active={active} onSelect={setActive} />
          <ExplainBoard tabs={tabs} active={active} explain={explain} />
        </Fill>
      </Row>
    </Wrap>
  );
}
