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
// 함수 비교 카드 — 왼쪽 정렬 · 표준 순서(함수명→구문→설명→수식→값)
// 텍스트 크기는 2차시 FIND/SEARCH 카드와 맞춤(함수명 17 · 구문 12.5 · 설명 14 · 수식 14 · 값 16)
function FuncCard({ name, syntax, desc, formula, value, valueSize = 16, color, valColor, bg, border }) {
  return (
    <div style={{
      flex: 1, background: bg, border: `2px solid ${border}`, borderRadius: 10, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 5,
    }}>
      <div style={{ color, fontSize: 17, fontWeight: 700 }}>{name}</div>
      <div style={{ color, fontSize: 12.5, fontWeight: 700, opacity: 0.95 }}>{syntax}</div>
      <div style={{ color, fontSize: 14, opacity: 0.85 }}>{desc}</div>
      <div style={{ color, fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{formula}</div>
      <div style={{ color: valColor, fontSize: valueSize, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// 엑셀식 표 셀 — 열·행 머리(회색) / 데이터 셀(옵션)
const XL_HDR = {
  background: '#0b1220', color: C.textDim, fontWeight: 700, fontSize: 13,
  border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 4px',
};
const xlCell = (opts = {}) => ({
  background: opts.bg || C.bgDark, color: opts.color || C.text, fontWeight: opts.bold ? 700 : 400,
  fontSize: opts.size || 14.5, border: `1px solid ${opts.border || C.border}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 6px',
});

export function StatRankDiagram() {
  // 행 1 = 라벨, 행 2~5 = 데이터 (엑셀 A~D열, 1~5행)
  const grid = [
    ['이름', '점수', 'RANK.EQ', 'RANK.AVG'],
    ['김철수', 95, '1', '1'],
    ['홍길동', 85, '2', '2.5'],
    ['박지수', 78, '4', '4'],
    ['이영희', 85, '2', '2.5'],
  ];

  return (
    <Wrap>
      <Title>순위 함수: RANK.EQ · RANK.AVG</Title>

      {/* 순위 데이터 표 (엑셀 열·행 머리 포함, 홍길동·이영희 85 동점) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '36px 116px 78px 110px 110px' }}>
          <div style={XL_HDR} />
          {['A', 'B', 'C', 'D'].map(c => <div key={c} style={XL_HDR}>{c}</div>)}
          {grid.map((row, ri) => {
            const isLabel = ri === 0;
            const tie = !isLabel && (row[0] === '홍길동' || row[0] === '이영희');
            return [
              <div key={`rh${ri}`} style={XL_HDR}>{ri + 1}</div>,
              ...row.map((v, ci) => {
                let st;
                if (isLabel) st = xlCell({ bg: C.blueCard, color: C.blueLight, bold: true, border: C.blueDim });
                else if (ci === 2) st = xlCell({ color: C.amber, bold: true });
                else if (ci === 3) st = xlCell({ color: C.blue, bold: true });
                else st = tie ? xlCell({ bg: '#0a2e1c', color: C.greenLight, bold: true, border: C.green }) : xlCell();
                return <div key={`c${ri}-${ci}`} style={st}>{v}</div>;
              }),
            ];
          })}
        </div>
      </div>

      <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
        RANK.EQ vs RANK.AVG — 동점(85점) 처리 비교
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <FuncCard
          name="RANK.EQ" syntax="구문: =RANK.EQ(값, 범위, [정렬])"
          desc="동점이면 공동으로 순위 부여 (실생활에서 쓰는 방식)"
          formula="=RANK.EQ(B3, $B$2:$B$5, 0)" value="= 2"
          color={C.greenLight} valColor={C.greenLight} bg="#0a2e1c" border={C.green}
        />
        <FuncCard
          name="RANK.AVG" syntax="구문: =RANK.AVG(값, 범위, [정렬])"
          desc="동점이면 순위들의 평균 부여"
          formula="=RANK.AVG(B3, $B$2:$B$5, 0)" value="= (2+3)/2 = 2.5" valueSize={15}
          color={C.blueLight} valColor={C.blueLight} bg={C.blueCard} border={C.blueDim}
        />
      </div>

      {/* 정렬기준·절대참조 설명 */}
      <div style={{
        marginTop: 12, background: C.bgDark, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: '12px 14px', fontSize: 13.5, color: C.textMuted, lineHeight: 1.7,
      }}>
        <div style={{ color: C.amber, fontWeight: 700, marginBottom: 4 }}>정렬기준 (세 번째 인수)</div>
        <div><b style={{ color: C.greenLight }}>0 = 내림차순</b> — 큰 값이 1등. 예) 시험 점수가 높은 순으로 순위를 매길 때</div>
        <div style={{ marginBottom: 8 }}><b style={{ color: C.blueLight }}>1 = 오름차순</b> — 작은 값이 1등. 예) 달리기 기록이 빠른(=기록이 작은) 순으로 순위를 매길 때</div>
        <div style={{ color: C.amber, fontWeight: 700, marginBottom: 4 }}>참조범위를 절대참조($)로 고정하는 이유</div>
        <div>수식을 여러 셀에 <b style={{ color: C.text }}>자동 채우기</b>로 복사할 때, 순위를 비교하는 범위가 밀려버리면 안 되므로 <b style={{ color: C.text }}>$로 고정</b>합니다.</div>
        <div>자동 채우기·복사를 하지 않는다면 고정할 필요가 없습니다.</div>
      </div>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatLargeSmallDiagram — 특정 순위의 값 추출
// ──────────────────────────────────────────────
export function StatLargeSmallDiagram() {
  return (
    <Wrap>
      <Title>특정 순위의 값 추출: LARGE · SMALL</Title>

      {/* 가로 데이터 표 (B2:B5) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(4, 74px)' }}>
          <div style={XL_HDR} />
          {[2, 3, 4, 5].map(c => <div key={c} style={XL_HDR}>{c}</div>)}
          <div style={XL_HDR}>B</div>
          {[95, 85, 78, 85].map((v, i) => <div key={i} style={xlCell({ bold: true, size: 20 })}>{v}</div>)}
        </div>
      </div>

      {/* 아래: LARGE / SMALL 설명 */}
      <div style={{ display: 'flex', gap: 12, maxWidth: 620, margin: '0 auto' }}>
        <FuncCard
          name="LARGE" syntax="구문: =LARGE(범위, K)"
          desc="범위에서 K번째로 큰 값"
          formula="=LARGE(B2:B5, 2)" value="= 85 (2번째로 큰 값)" valueSize={15}
          color={C.orange} valColor={C.orange} bg="#251005" border={C.orange}
        />
        <FuncCard
          name="SMALL" syntax="구문: =SMALL(범위, K)"
          desc="범위에서 K번째로 작은 값"
          formula="=SMALL(B2:B5, 1)" value="= 78 (가장 작은 값)" valueSize={15}
          color={C.purpleLight} valColor={C.purpleLight} bg={C.purpleCard} border={C.purple}
        />
      </div>

      <BottomBar>
        <BLine color={C.blue} bold>K = 1이면 가장 큰/작은 값이므로 MAX · MIN과 같습니다</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatCountDiagram
// ──────────────────────────────────────────────
export function StatCountDiagram() {
  // 엑셀 A~D열, 1~5행 (1행 = 제목)
  const grid = [
    ['이름', '학년', '출석', '수강료'],
    ['김민준', '초등학교 5학년', '출석', '100,000'],
    ['이서연', '중학교 2학년', '', '150,000'],
    ['박도윤', '고등학교 1학년', '', '200,000'],
    ['최지우', '중학교 3학년', '출석', '200,000'],
  ];
  return (
    <Wrap>
      <Title>개수 세기 함수: COUNT · COUNTA · COUNTBLANK</Title>

      {/* 데이터 표 (A 이름 · B 학년 · C 출석 · D 수강료) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '34px 92px 132px 66px 100px' }}>
          <div style={XL_HDR} />
          {['A', 'B', 'C', 'D'].map(c => <div key={c} style={XL_HDR}>{c}</div>)}
          {grid.map((row, ri) => {
            const isLabel = ri === 0;
            return [
              <div key={`rh${ri}`} style={XL_HDR}>{ri + 1}</div>,
              ...row.map((v, ci) => {
                const st = isLabel
                  ? xlCell({ bg: C.blueCard, color: C.blueLight, bold: true, border: C.blueDim, size: 14 })
                  : xlCell({ size: 14, color: ci === 3 ? C.text : C.textMuted, bold: ci === 3 });
                return <div key={`c${ri}-${ci}`} style={st}>{v}</div>;
              }),
            ];
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* COUNT — B(텍스트)와 D(숫자) 비교: 숫자만 셀 수 있음 */}
        <div style={{ flex: 1, background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ color: C.blue, fontSize: 17, fontWeight: 700 }}>COUNT</div>
          <div style={{ color: C.blue, fontSize: 12.5, fontWeight: 700, opacity: 0.95 }}>구문: =COUNT(범위)</div>
          <div style={{ color: C.blue, fontSize: 14, opacity: 0.85 }}>숫자가 든 셀만 셉니다</div>
          <div style={{ marginTop: 2 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.blue }}>=COUNT(B2:B5) <span style={{ color: C.redLight }}>= 0</span></div>
            <div style={{ color: C.textDim, fontSize: 12.5, marginBottom: 6 }}>학년(B)은 텍스트 → 못 셈</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.blue }}>=COUNT(D2:D5) <span style={{ color: C.greenLight }}>= 4</span></div>
            <div style={{ color: C.textDim, fontSize: 12.5 }}>수강료(D)는 숫자 → 셈</div>
          </div>
        </div>

        <FuncCard
          name="COUNTA" syntax="구문: =COUNTA(범위)"
          desc="비어있지 않은 모든 셀만 셉니다"
          formula="=COUNTA(B2:B5)" value="= 4"
          color={C.greenLight} valColor={C.greenLight} bg="#0a2e1c" border={C.green}
        />
        <FuncCard
          name="COUNTBLANK" syntax="구문: =COUNTBLANK(범위)"
          desc="빈 셀만 셉니다"
          formula="=COUNTBLANK(C2:C5)" value="= 2"
          color={C.textMuted} valColor={C.text} bg={C.bg} border={C.textSlate}
        />
      </div>

      <BottomBar>
        <BLine color={C.blue} bold>셀에 숫자가 있어도 문자와 함께 있으면(예: 중학교 2학년) 문자 데이터로 취급되어 COUNT 함수로 셀 수 없습니다</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// StatCondCountDiagram
// ──────────────────────────────────────────────
export function StatCondCountDiagram() {
  // A 이름 · B 직급 · C 급여 · D 부서 · E 성과급 (2~5행)
  const grid = [
    ['이름', '직급', '급여', '부서', '성과급'],
    ['김대리', '대리', '3,500,000', '영업부', '500,000'],
    ['박과장', '과장', '4,000,000', '인사부', '900,000'],
    ['이대리', '대리', '2,800,000', '영업부', '300,000'],
    ['최대리', '대리', '3,000,000', '영업부', '400,000'],
  ];

  const Prob = ({ children }) => (
    <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.amber}`, borderRadius: 6, padding: '8px 12px', fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
      <span style={{ color: C.amber, fontWeight: 800, marginRight: 6, fontSize: 11.5 }}>문제</span>{children}
    </div>
  );

  return (
    <Wrap>
      <Title>조건부 집계: COUNTIF · COUNTIFS · AVERAGEIF · AVERAGEIFS</Title>

      {/* 데이터 표 (열 머리 A~E / 제목 행 분리) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 78px 62px 100px 70px 92px' }}>
          <div style={XL_HDR} />
          {['A', 'B', 'C', 'D', 'E'].map(c => <div key={c} style={XL_HDR}>{c}</div>)}
          {grid.map((row, ri) => {
            const isLabel = ri === 0;
            return [
              <div key={`rh${ri}`} style={XL_HDR}>{ri + 1}</div>,
              ...row.map((v, ci) => {
                const num = ci === 2 || ci === 4;
                const st = isLabel
                  ? xlCell({ bg: C.blueCard, color: C.blueLight, bold: true, border: C.blueDim, size: 13.5 })
                  : xlCell({ size: 13.5, color: num ? C.text : C.textMuted, bold: num });
                return <div key={`c${ri}-${ci}`} style={st}>{v}</div>;
              }),
            ];
          })}
        </div>
      </div>

      {/* B·C열 → COUNTIF / COUNTIFS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Prob>직급이 &quot;대리&quot;인 직원은 몇 명?</Prob>
          <FuncCard
            name="COUNTIF" syntax="구문: =COUNTIF(범위, 조건)"
            desc="조건에 맞는 셀 개수"
            formula={'=COUNTIF(B2:B5, "대리")'} value="= 3"
            color={C.purpleLight} valColor={C.purpleLight} bg={C.purpleCard} border={C.purple}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Prob>직급이 &quot;대리&quot;이고 급여가 3,000,000원 이상인 직원은 몇 명?</Prob>
          <FuncCard
            name="COUNTIFS" syntax="구문: =COUNTIFS(범위1, 조건1, 범위2, 조건2, …)"
            desc="COUNTIF + S(조건이 여러 개) — 여러 개의 조건을 동시에 만족하는 셀의 개수"
            formula={'=COUNTIFS(B2:B5, "대리", C2:C5, ">=3000000")'} value="= 2" valueSize={15}
            color={C.blueLight} valColor={C.blueLight} bg={C.blueCard} border={C.blueDim}
          />
        </div>
      </div>

      {/* D·E열 → AVERAGEIF / AVERAGEIFS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Prob>부서가 &quot;영업부&quot;인 직원의 평균 성과급은?</Prob>
          <FuncCard
            name="AVERAGEIF" syntax="구문: =AVERAGEIF(조건범위, 조건, [평균범위])"
            desc="조건에 맞는 행의 평균"
            formula={'=AVERAGEIF(D2:D5, "영업부", E2:E5)'} value="= 400,000" valueSize={15}
            color={C.orange} valColor={C.orange} bg="#251005" border={C.orange}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Prob>부서가 &quot;영업부&quot;이고 성과급이 350,000원 초과인 직원의 평균 성과급은?</Prob>
          <FuncCard
            name="AVERAGEIFS" syntax="구문: =AVERAGEIFS(평균범위, 조건범위1, 조건1, …)"
            desc={<>AVERAGEIF + S(조건이 여러 개) — 여러 개의 조건을 동시에 만족하는 셀의 평균<br />⚠️ 평균범위는 맨 앞으로!</>}
            formula={'=AVERAGEIFS(E2:E5, D2:D5, "영업부", E2:E5, ">350000")'} value="= 450,000" valueSize={15}
            color={C.greenLight} valColor={C.greenLight} bg="#0a2e1c" border={C.green}
          />
        </div>
      </div>

      {/* 조건 작성 규칙 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 13.5, color: C.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
        조건은 반드시 <b style={{ color: C.text }}>&quot;대리&quot;, &quot;&gt;80&quot;</b> 처럼 따옴표로 감쌉니다!
      </div>

      {/* 함수를 조건으로 쓰기 — 문제는 박스 밖, 설명은 박스 안 */}
      <Prob>직급이 &quot;대리&quot;이고, 급여가 <b style={{ color: C.text }}>급여 평균</b>보다 큰 직원은 몇 명?</Prob>
      <div style={{ background: '#0c2344', border: `1px solid ${C.blueDim}`, borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
        <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>
          =COUNTIFS(B2:B5, &quot;대리&quot;, C2:C5, &quot;&gt;&quot;&amp;AVERAGE(C2:C5))  <span style={{ color: C.greenLight }}>= 1</span>
        </div>
        <div style={{ marginTop: 8, color: C.textMuted, fontSize: 13, lineHeight: 1.75 }}>
          <b style={{ color: C.text }}>&quot;평균보다 큰&quot;</b>처럼 함수를 써서 조건을 넣어야 할 때, 조건을 <b style={{ color: C.amber }}>&quot;&gt;AVERAGE(C2:C5)&quot;</b>처럼 통째로 따옴표 안에 쓰면 엑셀이 함수를 계산하지 않고 <b>글자 그대로</b> 인식합니다. 그렇다고 <b style={{ color: C.amber }}>&quot;&gt;&quot;AVERAGE(C2:C5)</b>처럼 그냥 붙이면 하나의 조건으로 합쳐지지 않습니다. 그래서 비교연산자 <b style={{ color: C.amber }}>&quot;&gt;&quot;</b>(따옴표 텍스트)와 <b style={{ color: C.amber }}>AVERAGE(C2:C5)</b>(숫자)를 <b style={{ color: C.amber }}>&amp;</b>로 이어 붙여야 <b style={{ color: C.text }}>&quot;&gt;3325000&quot;</b> 같은 하나의 조건 문자열이 완성됩니다. (급여 평균 = 3,325,000)
        </div>
      </div>
    </Wrap>
  );
}
