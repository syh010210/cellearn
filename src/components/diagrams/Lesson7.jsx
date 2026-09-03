import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, Card, ArrowDown, C } from './shared.jsx';

/* ──────────────────────────────────────────────
   DatetimeBasicDiagram
   TODAY / NOW / YEAR / MONTH / DAY
────────────────────────────────────────────── */
export function DatetimeBasicDiagram() {
  const hdrCell = (text) => (
    <Cell bg={C.blueCard} border={C.blueDim} bw={1} style={{ fontWeight: 700, fontSize: 15, color: C.blueLight }}>
      {text}
    </Cell>
  );

  const darkCell = (text, color) => (
    <Cell bg={C.bgDark} border={C.border} bw={1} style={{ fontSize: 15, color: color || C.text }}>
      {text}
    </Cell>
  );

  return (
    <Wrap>
      <Title>날짜 · 시간 자동 입력 및 단위 추출 함수</Title>
      <Subtitle>TODAY / NOW / YEAR / MONTH / DAY</Subtitle>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left panel */}
        <div style={{ flex: 1, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: C.amber, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            실시간 날짜 · 시간 반환
          </div>

          {/* Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdrCell('함수')}
            {hdrCell('인수')}
            {hdrCell('반환값')}

            {darkCell('TODAY()')}
            {darkCell('없음()')}
            {darkCell('2026-06-27', C.amber)}

            {darkCell('NOW()')}
            {darkCell('없음()')}
            {darkCell('2026-06-27 14:30', C.amber)}
          </div>

          {/* Difference card */}
          <div style={{
            background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 8,
            padding: 10, marginTop: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: C.amber, fontSize: 15, fontWeight: 700 }}>
              TODAY = 날짜만&nbsp;&nbsp;·&nbsp;&nbsp;NOW = 날짜 + 시간 모두
            </span>
          </div>

          {/* Note */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            TODAY(), NOW()는 인수가 없어도 반드시 괄호 () 붙여야 합니다
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, marginLeft: 12, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: C.blue, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            날짜에서 단위 추출
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8, color: C.text }}>
            기준 날짜: B2 = 2026-06-27
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* YEAR */}
            <div style={{
              background: C.blueCard, border: `2px solid ${C.blue}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.blueLight, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=YEAR(B2)</span>
              <span style={{ color: C.blue, fontSize: 22, fontWeight: 700 }}>→ 2026</span>
            </div>

            {/* MONTH */}
            <div style={{
              background: C.purpleCard, border: `2px solid ${C.purple}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.purpleLight, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=MONTH(B2)</span>
              <span style={{ color: C.purpleLight, fontSize: 22, fontWeight: 700 }}>→ 6</span>
            </div>

            {/* DAY */}
            <div style={{
              background: C.amberBg, border: `2px solid ${C.amber}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.amber, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=DAY(B2)</span>
              <span style={{ color: C.amber, fontSize: 22, fontWeight: 700 }}>→ 27</span>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=TODAY()&nbsp;&nbsp;·&nbsp;&nbsp;=NOW()&nbsp;&nbsp;·&nbsp;&nbsp;=YEAR(날짜)&nbsp;&nbsp;·&nbsp;&nbsp;=MONTH(날짜)&nbsp;&nbsp;·&nbsp;&nbsp;=DAY(날짜)</BLine>
        <BLine color={C.blue} bold>
          날짜 구분자 하이픈(-) 또는 슬래시(/) 모두 인식&nbsp;&nbsp;·&nbsp;&nbsp;YEAR/MONTH/DAY 결과는 정수
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   DatetimeComposeDiagram
   HOUR / MINUTE / SECOND ←→ DATE / TIME
────────────────────────────────────────────── */
export function DatetimeComposeDiagram() {
  return (
    <Wrap>
      <Title>시간 분해 및 날짜 · 시간 조합 함수</Title>
      <Subtitle>HOUR / MINUTE / SECOND ←→ DATE / TIME</Subtitle>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left panel — decompose */}
        <div style={{ flex: 1, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: C.amber, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            시간 데이터 분해
          </div>
          <div style={{ color: C.textDim, fontSize: 15, textAlign: 'center', marginBottom: 10 }}>
            기준 시간: A2 = 14:35:09
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* HOUR */}
            <div style={{
              background: C.blueCard, border: `2px solid ${C.blue}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.blueLight, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=HOUR(A2)</span>
              <span style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>→ 14 (시: 0~23)</span>
            </div>

            {/* MINUTE */}
            <div style={{
              background: C.purpleCard, border: `2px solid ${C.purple}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.purpleLight, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=MINUTE(A2)</span>
              <span style={{ color: C.purpleLight, fontSize: 18, fontWeight: 700 }}>→ 35 (분: 0~59)</span>
            </div>

            {/* SECOND */}
            <div style={{
              background: C.amberBg, border: `2px solid ${C.amber}`, borderRadius: 8,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: C.amber, fontSize: 14, fontFamily: 'monospace', flex: 1 }}>=SECOND(A2)</span>
              <span style={{ color: C.amber, fontSize: 18, fontWeight: 700 }}>→ 09 (초: 0~59)</span>
            </div>
          </div>
        </div>

        {/* Right panel — compose */}
        <div style={{ flex: 1, marginLeft: 12, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: C.green, fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            흩어진 숫자 → 날짜 · 시간 조합
          </div>

          {/* DATE card */}
          <div style={{
            background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 8,
            padding: 14, marginBottom: 8,
          }}>
            <div style={{
              color: C.greenLight, fontSize: 15, fontFamily: 'monospace',
              textAlign: 'center', fontWeight: 700,
            }}>
              =DATE(A2, B2, C2)
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
              <span style={{ color: C.textMuted, fontSize: 13 }}>A2=2026</span>
              <span style={{ color: C.textMuted, fontSize: 13 }}>B2=6</span>
              <span style={{ color: C.textMuted, fontSize: 13 }}>C2=15</span>
            </div>
            <div style={{
              color: C.greenLight, fontSize: 20, fontWeight: 700,
              textAlign: 'center', marginTop: 4,
            }}>
              → 2026-06-15
            </div>
          </div>

          {/* TIME card */}
          <div style={{
            background: C.purpleCard, border: `2px solid ${C.purple}`, borderRadius: 8,
            padding: 14,
          }}>
            <div style={{
              color: C.purpleLight, fontSize: 15, fontFamily: 'monospace',
              textAlign: 'center', fontWeight: 700,
            }}>
              =TIME(D2, E2, F2)
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
              <span style={{ color: C.textMuted, fontSize: 13 }}>D2=14</span>
              <span style={{ color: C.textMuted, fontSize: 13 }}>E2=35</span>
              <span style={{ color: C.textMuted, fontSize: 13 }}>F2=9</span>
            </div>
            <div style={{
              color: C.purpleLight, fontSize: 20, fontWeight: 700,
              textAlign: 'center', marginTop: 4,
            }}>
              → 14:35:09
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>분해: HOUR(시)/MINUTE(분)/SECOND(초)&nbsp;&nbsp;←→&nbsp;&nbsp;조합: DATE(연월일)/TIME(시분초)</BLine>
        <BLine color={C.blue} bold>
          DATE/TIME은 각 숫자 인수를 엑셀 표준 날짜 · 시간 형식으로 조합합니다
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   WeekdayDiagram
   WEEKDAY — 요일 번호 반환 함수
────────────────────────────────────────────── */
export function WeekdayDiagram() {
  const hdr = (text) => (
    <Cell bg={C.blueCard} border={C.blueDim} bw={1} style={{ fontWeight: 700, fontSize: 14, color: C.blueLight }}>
      {text}
    </Cell>
  );

  const dark = (text, color) => (
    <Cell bg={C.bgDark} border={C.border} bw={1} style={{ fontSize: 14, color: color || C.text }}>
      {text}
    </Cell>
  );

  const highlight = (text, bg, border, color) => (
    <Cell bg={bg} border={border} bw={1} style={{ fontSize: 14, color: color, fontWeight: 700 }}>
      {text}
    </Cell>
  );

  return (
    <Wrap>
      <Title>WEEKDAY — 요일 번호 반환 함수</Title>
      <Subtitle>=WEEKDAY(날짜, 옵션) → 요일에 해당하는 정수 반환</Subtitle>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left table — option 1 */}
        <div style={{ flex: 1 }}>
          <div style={{ color: C.amber, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            옵션 1 (생략 가능: 일요일=1)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('요일')} {hdr('반환값')} {hdr('영문')} {hdr('비고')}

            {/* Sunday highlight */}
            {highlight('일', C.amberBg, C.amber, C.amber)}
            {highlight('1', C.amberBg, C.amber, C.amber)}
            {highlight('Sun', C.amberBg, C.amber, C.amber)}
            {highlight('★', C.amberBg, C.amber, C.amber)}

            {dark('월')} {dark('2')} {dark('Mon')} {dark('')}
            {dark('화')} {dark('3')} {dark('Tue')} {dark('')}
            {dark('수')} {dark('4')} {dark('Wed')} {dark('')}
            {dark('목')} {dark('5')} {dark('Thu')} {dark('')}
            {dark('금')} {dark('6')} {dark('Fri')} {dark('')}

            {/* Saturday */}
            {highlight('토', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('7', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('Sat', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('', C.purpleCard, C.purple, C.purpleLight)}
          </div>
        </div>

        {/* Right table — option 2 */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ color: C.blue, fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            옵션 2 (월요일=1: 업무일 기준)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
            {hdr('요일')} {hdr('반환값')} {hdr('영문')} {hdr('비고')}

            {/* Monday highlight */}
            {highlight('월', C.blueCard, C.blueDim, C.blue)}
            {highlight('1', C.blueCard, C.blueDim, C.blue)}
            {highlight('Mon', C.blueCard, C.blueDim, C.blue)}
            {highlight('★', C.blueCard, C.blueDim, C.blue)}

            {dark('화')} {dark('2')} {dark('Tue')} {dark('')}
            {dark('수')} {dark('3')} {dark('Wed')} {dark('')}
            {dark('목')} {dark('4')} {dark('Thu')} {dark('')}
            {dark('금')} {dark('5')} {dark('Fri')} {dark('')}

            {/* Saturday */}
            {highlight('토', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('6', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('Sat', C.purpleCard, C.purple, C.purpleLight)}
            {highlight('', C.purpleCard, C.purple, C.purpleLight)}

            {/* Sunday */}
            {highlight('일', C.amberBg, C.amber, C.amber)}
            {highlight('7', C.amberBg, C.amber, C.amber)}
            {highlight('Sun', C.amberBg, C.amber, C.amber)}
            {highlight('', C.amberBg, C.amber, C.amber)}
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>=WEEKDAY(날짜, 1) → 일요일=1&nbsp;&nbsp;·&nbsp;&nbsp;=WEEKDAY(날짜, 2) → 월요일=1</BLine>
        <BLine color={C.blue} bold>
          컴활 실기: 옵션2와 CHOOSE 함수 조합으로 요일명 텍스트 반환하는 문제 자주 출제
        </BLine>
      </BottomBar>
    </Wrap>
  );
}

/* ──────────────────────────────────────────────
   WorkdayDiagram
   WORKDAY — 주말·공휴일 제외 근무일 계산
────────────────────────────────────────────── */
export function WorkdayDiagram() {
  const calCellStyle = (bg, border, color, bold = false) => ({
    background: bg || C.bgDark,
    border: `1px solid ${border || C.border}`,
    borderRadius: 4,
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    gap: 2,
    color: color || C.text,
    fontWeight: bold ? 700 : 400,
    fontSize: 14,
  });

  return (
    <Wrap>
      <Title>WORKDAY — 주말 · 공휴일 제외 근무일 계산</Title>
      <Subtitle>=WORKDAY(시작일, 근무일수, [공휴일범위]) → 완료 예정일 반환</Subtitle>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left — arg cards */}
        <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* ① 시작일 */}
          <div style={{
            background: C.blueCard, border: `2px solid ${C.blue}`, borderRadius: 8, padding: 10,
          }}>
            <div style={{ color: C.blue, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>① 시작일</div>
            <div style={{ color: C.blueLight, fontSize: 14, fontFamily: 'monospace', textAlign: 'center' }}>"2026-06-22"</div>
          </div>

          {/* ② 근무일수 */}
          <div style={{
            background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 8, padding: 10,
          }}>
            <div style={{ color: C.green, fontWeight: 700, fontSize: 15, textAlign: 'center' }}>② 근무일수</div>
            <div style={{ color: C.greenLight, fontSize: 14, textAlign: 'center' }}>5 (5근무일)</div>
          </div>

          {/* ③ 공휴일 */}
          <div style={{
            background: '#251005', border: `1px solid ${C.orange}`, borderRadius: 8, padding: 10,
          }}>
            <div style={{ color: C.orange, fontWeight: 700, fontSize: 14, textAlign: 'center' }}>③ 공휴일 범위 [선택]</div>
            <div style={{ color: C.orange, fontSize: 13, textAlign: 'center' }}>E2:E5 등 셀 범위</div>
          </div>

          {/* Warning */}
          <div style={{
            background: C.redBg, border: `1px solid ${C.red}`, borderRadius: 8, padding: 10,
          }}>
            <div style={{ color: C.redLight, fontSize: 14, fontWeight: 700 }}>⚠ 결과가 일련번호로 보이면:</div>
            <div style={{ color: C.redLight, fontSize: 14 }}>셀 서식 → 간단한 날짜 선택</div>
          </div>

          {/* Result box */}
          <div style={{
            background: C.greenBg, border: `2px solid ${C.green}`, borderRadius: 8,
            padding: 12, marginTop: 4, textAlign: 'center',
          }}>
            <div style={{ color: C.greenLight, fontSize: 14, fontFamily: 'monospace' }}>
              =WORKDAY("2026-06-22", 5)
            </div>
            <div style={{ color: C.greenLight, fontSize: 18, fontWeight: 700, marginTop: 4 }}>
              → 2026-06-29 (월요일)
            </div>
          </div>
        </div>

        {/* Right — calendar */}
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={{ color: C.textMuted, fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            2026년 6월 캘린더
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {/* Header */}
            {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontWeight: 700, fontSize: 14,
                color: i === 5 ? C.purpleLight : i === 6 ? C.amber : C.textDim,
                padding: '4px 0',
              }}>
                {d}
              </div>
            ))}

            {/* Week row: 22~28 */}
            <div style={calCellStyle('#071a0b', C.green, C.greenLight, true)}>
              <span>22</span><span style={{ fontSize: 11 }}>▶1일</span>
            </div>
            <div style={calCellStyle('#071a0b', C.green, C.greenLight, true)}>
              <span>23</span><span style={{ fontSize: 11 }}>▶2</span>
            </div>
            <div style={calCellStyle('#071a0b', C.green, C.greenLight, true)}>
              <span>24</span><span style={{ fontSize: 11 }}>▶3</span>
            </div>
            <div style={calCellStyle('#071a0b', C.green, C.greenLight, true)}>
              <span>25</span><span style={{ fontSize: 11 }}>▶4</span>
            </div>
            <div style={calCellStyle('#071a0b', C.green, C.greenLight, true)}>
              <span>26</span><span style={{ fontSize: 11 }}>▶5일</span>
            </div>
            <div style={calCellStyle(C.purpleCard, C.purple, C.purpleLight)}>
              <span>27</span><span style={{ fontSize: 11 }}>토 SKIP</span>
            </div>
            <div style={calCellStyle(C.purpleCard, C.purple, C.purpleLight)}>
              <span>28</span><span style={{ fontSize: 11 }}>일 SKIP</span>
            </div>

            {/* Next row: 29 = completion */}
            <div style={calCellStyle(C.greenBg, C.green, C.greenLight, true)}>
              <span style={{ fontSize: 16 }}>29</span>
              <span style={{ fontSize: 12 }}>★완료일</span>
            </div>
            {[30, '', '', '', '', ''].map((d, i) => (
              <div key={i} style={calCellStyle()}>
                <span style={{ color: C.textDim }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.green }} />
              <span style={{ color: C.textMuted, fontSize: 13 }}>근무일</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.purple }} />
              <span style={{ color: C.textMuted, fontSize: 13 }}>토 · 일(주말)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.green, border: `2px solid ${C.greenLight}` }} />
              <span style={{ color: C.textMuted, fontSize: 13 }}>완료일</span>
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>WORKDAY 핵심 — 주말(토 · 일) 자동 제외&nbsp;&nbsp;·&nbsp;&nbsp;주중 공휴일은 세 번째 인수로 지정</BLine>
        <BLine color={C.blue} bold>
          결과가 일련번호로 보이면: Ctrl+1 → 표시 형식 → 날짜 선택
        </BLine>
      </BottomBar>
    </Wrap>
  );
}
