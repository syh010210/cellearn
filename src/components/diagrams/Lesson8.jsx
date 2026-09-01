import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, ArrowDown, C } from './shared.jsx';

/* ──────────────────────────────────────────────
   IfDiagram
   IF 함수 — 조건에 따른 분기 처리
────────────────────────────────────────────── */
export function IfDiagram() {
  return (
    <Wrap>
      <Title>IF 함수 — 조건에 따른 분기 처리</Title>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left — formula anatomy */}
        <div style={{ flex: 1 }}>
          <div style={{ color: C.textMuted, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>수식 구조</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Full formula */}
            <div style={{
              background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: 14, fontFamily: 'monospace', textAlign: 'center', fontSize: 16, color: C.text,
            }}>
              =IF(B2&gt;=100, "우수유저", "")
            </div>

            {/* ① 조건식 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 6,
                padding: 8, minWidth: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: C.amber, fontSize: 15, fontWeight: 700, fontFamily: 'monospace' }}>
                  ① 조건식: B2&gt;=100
                </span>
              </div>
              <span style={{ color: C.textDim, fontSize: 14 }}>&gt;= 비교 연산자</span>
            </div>

            {/* ② 참 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: '#071a0b', border: `1px solid ${C.green}`, borderRadius: 6,
                padding: 8, minWidth: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: C.greenLight, fontSize: 15, fontWeight: 700, fontFamily: 'monospace' }}>
                  ② 참(TRUE): "우수유저"
                </span>
              </div>
              <span style={{ color: C.textDim, fontSize: 14 }}>문자열 → 쌍따옴표 필요</span>
            </div>

            {/* ③ 거짓 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 6,
                padding: 8, minWidth: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: C.redLight, fontSize: 15, fontWeight: 700, fontFamily: 'monospace' }}>
                  ③ 거짓(FALSE): ""
                </span>
              </div>
              <span style={{ color: C.textDim, fontSize: 14 }}>공백 → "" (빈 문자열)</span>
            </div>

            {/* Rules */}
            <div style={{
              background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: 10, marginTop: 2,
            }}>
              <div style={{ color: C.textMuted, fontSize: 14, textAlign: 'center' }}>
                문자열 → 쌍따옴표&nbsp;&nbsp;·&nbsp;&nbsp;공백 → ""&nbsp;&nbsp;·&nbsp;&nbsp;숫자 → 따옴표 없이
              </div>
              <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center', marginTop: 2 }}>
                비교 연산자: &gt;=&nbsp;&nbsp;&lt;=&nbsp;&nbsp;&gt;&nbsp;&nbsp;&lt;&nbsp;&nbsp;=&nbsp;&nbsp;&lt;&gt;
              </div>
            </div>
          </div>
        </div>

        {/* Right — flowchart */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ color: C.textMuted, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>결정 흐름</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Condition box */}
            <div style={{
              background: '#1e3a8a', border: `2px solid ${C.blue}`, borderRadius: 10,
              padding: 14, width: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.blueLight, fontSize: 16, fontWeight: 700 }}>B2 &gt;= 100 ?</span>
            </div>

            {/* Branches */}
            <div style={{ display: 'flex', marginTop: 12, gap: 16 }}>
              {/* TRUE branch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>TRUE ✓</span>
                <ArrowDown color={C.green} size={32} />
                <div style={{
                  background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 8,
                  padding: 10, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: C.greenLight, fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>
                    "우수유저"
                  </span>
                </div>
                <span style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>예: B2=120 → 조건 충족</span>
              </div>

              {/* FALSE branch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: C.red, fontSize: 14, fontWeight: 700 }}>FALSE ✗</span>
                <ArrowDown color={C.red} size={32} />
                <div style={{
                  background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 8,
                  padding: 10, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: C.redLight, fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>
                    ""
                  </span>
                </div>
                <span style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>예: B2=85 → 조건 미달</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=IF(조건식, 참일 때 값, 거짓일 때 값)&nbsp;&nbsp;— 세 인수 모두 필수</BLine>
        <BLine color={C.blue} bold>
          결과가 수식 또는 다른 함수일 때도 동일한 방식으로 중첩 사용 가능
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   IfAndDiagram
   IF + AND — 모든 조건을 동시에 만족해야 참
────────────────────────────────────────────── */
export function IfAndDiagram() {
  const hdr = (text) => (
    <Cell bg={C.blueCard} border={C.blueDim} bw={1} style={{ fontWeight: 700, fontSize: 14, color: C.blueLight }}>
      {text}
    </Cell>
  );

  const trueRow = (a, b) => (
    <>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14 }}>{a}</Cell>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14 }}>{b}</Cell>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>TRUE ✓</Cell>
    </>
  );

  const falseRow = (a, b) => (
    <>
      <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.red, fontSize: 14 }}>{a}</Cell>
      <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.red, fontSize: 14 }}>{b}</Cell>
      <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.redLight, fontSize: 14, fontWeight: 700 }}>FALSE ✗</Cell>
    </>
  );

  return (
    <Wrap>
      <Title>IF + AND — 모든 조건을 동시에 만족해야 참</Title>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left — AND truth table */}
        <div style={{ width: 220 }}>
          <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            AND 진리표
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('조건1')} {hdr('조건2')} {hdr('결과')}
            {trueRow('T', 'T')}
            {falseRow('T', 'F')}
            {falseRow('F', 'T')}
            {falseRow('F', 'F')}
          </div>
          <div style={{ color: C.amber, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            모두 TRUE일 때만 TRUE
          </div>
        </div>

        {/* Right — formula + examples */}
        <div style={{ flex: 1, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Formula */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: 12, fontFamily: 'monospace', textAlign: 'center', fontSize: 15, color: C.text,
          }}>
            =IF(AND(B2&gt;=80, C2&gt;=80), "통과", "")
          </div>

          {/* Condition cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 8,
              padding: 12, flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.amber, fontSize: 15 }}>알고리즘 점수 B2&gt;=80</span>
            </div>
            <div style={{
              background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 8,
              padding: 12, flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.amber, fontSize: 15 }}>SQL 점수 C2&gt;=80</span>
            </div>
          </div>

          <div style={{ color: C.amber, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
            ← 두 조건 모두 만족해야 참
          </div>

          {/* Result examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{
              background: '#071a0b', border: `1px solid ${C.green}`, borderRadius: 8, padding: 10,
              color: C.greenLight, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              B2=85, C2=90 → AND(T,T) = TRUE → "통과"
            </div>
            <div style={{
              background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 8, padding: 10,
              color: C.redLight, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              B2=75, C2=90 → AND(F,T) = FALSE → ""
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>키워드: "~이면서", "~이고", "모두 만족" → AND 함수 사용</BLine>
        <BLine color={C.blue} bold>
          =AND(조건1, 조건2, ...)&nbsp;&nbsp;·&nbsp;&nbsp;모든 조건이 참이면 TRUE, 하나라도 거짓이면 FALSE
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   IfOrDiagram
   IF + OR — 조건 중 하나라도 만족하면 참
────────────────────────────────────────────── */
export function IfOrDiagram() {
  const hdr = (text) => (
    <Cell bg={C.blueCard} border={C.blueDim} bw={1} style={{ fontWeight: 700, fontSize: 14, color: C.blueLight }}>
      {text}
    </Cell>
  );

  const trueRow = (a, b) => (
    <>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14 }}>{a}</Cell>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14 }}>{b}</Cell>
      <Cell bg='#071a0b' border={C.green} bw={1} style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>TRUE ✓</Cell>
    </>
  );

  return (
    <Wrap>
      <Title>IF + OR — 조건 중 하나라도 만족하면 참</Title>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left — OR truth table */}
        <div style={{ width: 220 }}>
          <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            OR 진리표
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('조건1')} {hdr('조건2')} {hdr('결과')}
            {trueRow('T', 'T')}
            {trueRow('T', 'F')}
            {trueRow('F', 'T')}
            {/* Only F/F is false */}
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.red, fontSize: 14 }}>F</Cell>
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.red, fontSize: 14 }}>F</Cell>
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ color: C.redLight, fontSize: 14, fontWeight: 700 }}>FALSE ✗</Cell>
          </div>
          <div style={{ color: C.blue, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            하나라도 TRUE면 TRUE
          </div>
        </div>

        {/* Right — formula + examples */}
        <div style={{ flex: 1, marginLeft: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Formula */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: 12, fontFamily: 'monospace', textAlign: 'center', fontSize: 15, color: C.text,
          }}>
            =IF(OR(B2&gt;=90, C2&gt;=90), "점검요망", "")
          </div>

          {/* Condition cards */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 8,
              padding: 12, flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.blueLight, fontSize: 15 }}>트래픽 B2&gt;=90</span>
            </div>
            <div style={{
              background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 8,
              padding: 12, flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.blueLight, fontSize: 15 }}>응답속도 C2&gt;=90</span>
            </div>
          </div>

          <div style={{ color: C.blue, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
            ← 둘 중 하나만 만족해도 참
          </div>

          {/* Result examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{
              background: '#071a0b', border: `1px solid ${C.green}`, borderRadius: 8, padding: 10,
              color: C.greenLight, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              B2=92, C2=60 → OR(T,F) = TRUE → "점검요망"
            </div>
            <div style={{
              background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 8, padding: 10,
              color: C.redLight, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              B2=40, C2=55 → OR(F,F) = FALSE → ""
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>키워드: "~이거나", "또는", "하나라도 만족" → OR 함수 사용</BLine>
        <BLine color={C.blue} bold>
          =OR(조건1, 조건2, ...)&nbsp;&nbsp;·&nbsp;&nbsp;하나라도 참이면 TRUE, 모두 거짓이면 FALSE
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   NestedIfDiagram
   중첩 IF — 3개 이상 결과를 단계별로 분기
────────────────────────────────────────────── */
export function NestedIfDiagram() {
  return (
    <Wrap>
      <Title>중첩 IF — 3개 이상 결과를 단계별로 분기</Title>

      {/* Top formula box */}
      <div style={{
        background: '#1e3a8a', border: `2px solid ${C.blue}`, borderRadius: 10,
        padding: 16, textAlign: 'center', marginBottom: 16,
      }}>
        <div style={{ color: C.blueLight, fontSize: 16, fontFamily: 'monospace', fontWeight: 700 }}>
          =IF(B2&gt;=90,"A등급",IF(B2&gt;=80,"B등급","C등급"))
        </div>
        <div style={{ color: C.blueLight, fontSize: 14, marginTop: 4 }}>
          90 이상→A등급 / 80~89→B등급 / 80 미만→C등급
        </div>
      </div>

      {/* Decision tree */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 32, width: '100%' }}>
          {/* Rules box */}
          <div style={{
            width: 220, background: C.bgDark, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ color: C.amber, fontSize: 14 }}>① 높은 기준부터 작성</div>
            <div style={{ color: C.amber, fontSize: 14 }}>② 앞 조건 통과한 경우 자동 배제</div>
            <div style={{ color: C.amber, fontSize: 14 }}>③ 닫는 괄호 수 = IF 개수</div>
          </div>

          {/* Tree */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* First IF */}
            <div style={{
              background: '#1e3a8a', border: `2px solid ${C.blue}`, borderRadius: 10,
              padding: 12, width: 180,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: C.blueLight, fontSize: 15, fontWeight: 700 }}>첫 번째 IF: B2&gt;=90?</span>
            </div>

            {/* Branches from first IF */}
            <div style={{ display: 'flex', marginTop: 10, gap: 20 }}>
              {/* TRUE branch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: C.orange, fontSize: 14, fontWeight: 700 }}>TRUE</span>
                <ArrowDown color={C.orange} size={32} />
                <div style={{
                  background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 8,
                  padding: 10, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: C.greenLight, fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>
                    "A등급"
                  </span>
                </div>
              </div>

              {/* FALSE branch */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: C.blue, fontSize: 14, fontWeight: 700 }}>FALSE</span>
                <ArrowDown color={C.blue} size={32} />
                {/* Second IF */}
                <div style={{
                  background: '#0c2440', border: `2px solid ${C.blue}`, borderRadius: 10,
                  padding: 12, textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: C.blueLight, fontSize: 14 }}>두 번째 IF: B2&gt;=80?</span>
                </div>

                {/* Second level branches */}
                <div style={{ display: 'flex', marginTop: 8, gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>TRUE</span>
                    <ArrowDown color={C.green} size={24} />
                    <div style={{
                      background: '#071a0b', border: `1px solid ${C.green}`, borderRadius: 6,
                      padding: 8, textAlign: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: C.greenLight, fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
                        "B등급"
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: C.red, fontSize: 13, fontWeight: 700 }}>FALSE</span>
                    <ArrowDown color={C.red} size={24} />
                    <div style={{
                      background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 6,
                      padding: 8, textAlign: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: C.redLight, fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
                        "C등급"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bracket visual */}
        <div style={{
          background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: 10, marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ color: C.text, fontSize: 14, fontFamily: 'monospace' }}>IF(B2&gt;=90, "A등급",</span>
          <span style={{ color: C.text, fontSize: 14, fontFamily: 'monospace' }}>IF(B2&gt;=80, "B등급", "C등급")</span>
          <span style={{ color: C.amber, fontSize: 16, fontWeight: 700 }}>)&nbsp;&nbsp;)</span>
          <span style={{ color: C.amber, fontSize: 14 }}>← 괄호 2개 닫음 (IF 2개)</span>
        </div>
      </div>

      <BottomBar>
        <BLine>IF가 2개 → 마지막에 )) 두 개로 닫음&nbsp;&nbsp;·&nbsp;&nbsp;IF가 N개 → 괄호도 N개</BLine>
        <BLine color={C.blue} bold>
          최대 64 중첩 가능&nbsp;&nbsp;·&nbsp;&nbsp;실기 시험에서는 보통 2~3 중첩
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   IfErrorDiagram
   IFERROR — 에러 발생 시 대체 출력값으로 방어
────────────────────────────────────────────── */
export function IfErrorDiagram() {
  const hdr = (text) => (
    <Cell bg={C.blueCard} border={C.blueDim} bw={1} style={{ fontWeight: 700, fontSize: 14, color: C.blueLight }}>
      {text}
    </Cell>
  );

  const darkCell = (text, color) => (
    <Cell bg={C.bgDark} border={C.border} bw={1} style={{ fontSize: 14, color: color || C.text }}>
      {text}
    </Cell>
  );

  return (
    <Wrap>
      <Title>IFERROR — 에러 발생 시 대체 출력값으로 방어</Title>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left panel — without IFERROR */}
        <div style={{
          flex: 1, background: C.redDark, border: `2px solid ${C.red}`, borderRadius: 10, padding: 16,
        }}>
          <div style={{ color: C.red, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ❌ IFERROR 없이
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('작업코드')} {hdr('처리시간')} {hdr('수량')} {hdr('단위당시간')}

            {/* Error row */}
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ fontSize: 14, color: C.redLight }}>T-10</Cell>
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ fontSize: 14, color: C.redLight }}>500</Cell>
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ fontSize: 14, color: C.redLight }}>0</Cell>
            <Cell bg={C.redBg} border={C.red} bw={1} style={{ fontSize: 14, color: C.redLight, fontWeight: 700 }}>#DIV/0! 에러!</Cell>

            {darkCell('T-20')} {darkCell('300')} {darkCell('10')} {darkCell('30')}
          </div>

          <div style={{
            background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 8, padding: 8, marginTop: 8,
          }}>
            <div style={{ color: C.redLight, fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>
              수식: =B2/C2
            </div>
            <div style={{ color: C.red, fontSize: 14, fontWeight: 700, textAlign: 'center', marginTop: 4 }}>
              C2=0이므로 0으로 나누기 → #DIV/0! 에러
            </div>
          </div>
        </div>

        {/* Right panel — with IFERROR */}
        <div style={{
          flex: 1, marginLeft: 12, background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 10, padding: 16,
        }}>
          <div style={{ color: C.green, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            ✅ IFERROR 사용
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('작업코드')} {hdr('처리시간')} {hdr('수량')} {hdr('단위당시간')}

            {/* Fixed row */}
            <Cell bg={C.greenBg} border={C.green} bw={1} style={{ fontSize: 14, color: C.greenLight }}>T-10</Cell>
            <Cell bg={C.greenBg} border={C.green} bw={1} style={{ fontSize: 14, color: C.greenLight }}>500</Cell>
            <Cell bg={C.greenBg} border={C.green} bw={1} style={{ fontSize: 14, color: C.greenLight }}>0</Cell>
            <Cell bg={C.greenBg} border={C.green} bw={1} style={{ fontSize: 14, color: C.greenLight, fontWeight: 700 }}>수량오류</Cell>

            {darkCell('T-20')} {darkCell('300')} {darkCell('10')} {darkCell('30')}
          </div>

          {/* Formula */}
          <div style={{
            background: C.greenBg, border: `1px solid ${C.green}`, borderRadius: 8,
            padding: 10, marginTop: 8, textAlign: 'center',
          }}>
            <span style={{ color: C.greenLight, fontSize: 15, fontFamily: 'monospace', fontWeight: 700 }}>
              =IFERROR(B2/C2, "수량오류")
            </span>
          </div>

          {/* Explanation */}
          <div style={{
            background: '#071a0b', border: `1px solid ${C.green}`, borderRadius: 8,
            padding: 8, marginTop: 8,
          }}>
            <div style={{ color: C.greenLight, fontSize: 14 }}>① 정상: B2/C2 계산</div>
            <div style={{ color: C.greenLight, fontSize: 14, marginTop: 2 }}>② 에러 발생 시: "수량오류" 대체 출력</div>
          </div>

          {/* Syntax */}
          <div style={{
            background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: 10, marginTop: 8, textAlign: 'center',
          }}>
            <span style={{ color: C.textMuted, fontSize: 14 }}>
              =IFERROR(정상 연산 수식, 에러 발생 시 대체 출력값)
            </span>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>처리 가능 에러: #DIV/0!, #N/A, #VALUE!, #REF!, #NAME?, #NULL!, #NUM!</BLine>
        <BLine color={C.blue} bold>
          모든 엑셀 에러를 방어할 수 있는 범용 방어 함수
        </BLine>
      </BottomBar>
    </Wrap>
  );
}
