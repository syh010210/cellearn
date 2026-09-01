import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, Card, ArrowDown, ArrowRight, C } from './shared.jsx';

export function ExcelBasicDiagram() {
  return (
    <Wrap>
      <Title>열(Column) · 행(Row) · 셀(Cell) 기본 구조</Title>
      <Subtitle>셀 주소 = 열(알파벳) + 행(숫자)  예) C3 = C열 3번째 행</Subtitle>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: spreadsheet grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '50px 100px 100px 100px 100px' }}>
            {/* Corner cell */}
            <Cell style={{ color: C.textSlate, fontSize: 14 }} />
            {/* Column headers A B C D */}
            {['A', 'B', 'C', 'D'].map(col => (
              <Cell key={col} bg="#1e3a8a" border="#3b82f6" bw={2}
                style={{ fontWeight: 700, fontSize: 18, color: '#93c5fd' }}>
                {col}
              </Cell>
            ))}
            {/* Rows 1, 2, 3 */}
            {[1, 2, 3].flatMap(row => [
              <Cell key={`rh${row}`} bg="#6b21a8" border="#a855f7" bw={2}
                style={{ fontWeight: 700, fontSize: 18, color: '#e9d5ff' }}>
                {row}
              </Cell>,
              ...['A', 'B', 'C', 'D'].map(col => {
                const isC3 = col === 'C' && row === 3;
                return (
                  <Cell key={`${col}${row}`}
                    bg={isC3 ? '#431407' : C.bgDark}
                    border={isC3 ? '#f59e0b' : C.border}
                    bw={isC3 ? 3 : 1}
                    style={{
                      fontWeight: isC3 ? 700 : 400,
                      fontSize: isC3 ? 18 : 16,
                      color: isC3 ? '#fbbf24' : C.textSlate,
                      flexDirection: 'column',
                    }}>
                    {isC3 ? (
                      <>
                        <span>C3</span>
                      </>
                    ) : (
                      <span style={{ color: C.textDim, fontSize: 14 }}>{col}{row}</span>
                    )}
                  </Cell>
                );
              })
            ])}
          </div>
          {/* Sheet tab */}
          <div style={{ marginTop: 6 }}>
            <span style={{
              background: '#1e3a8a', border: '1px solid #3b82f6', borderRadius: 4,
              padding: '3px 10px', color: '#93c5fd', fontSize: 13,
            }}>Sheet1</span>
          </div>
        </div>

        {/* Right: info cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Card 1: Column */}
          <Card bg="#0c2344" border="#3b82f6">
            <div style={{ fontWeight: 700, fontSize: 17, color: C.blue, marginBottom: 4 }}>
              열(Column) — 알파벳 주소
            </div>
            <div style={{ fontSize: 16, color: C.blueLight, marginBottom: 4 }}>
              A, B, C, D … 오른쪽으로 순서대로 증가
            </div>
            <div style={{ fontSize: 15, color: C.textDim }}>
              수직으로 같은 열에 속한 셀들의 집합
            </div>
          </Card>
          {/* Card 2: Row */}
          <Card bg="#1e0f47" border="#a855f7">
            <div style={{ fontWeight: 700, fontSize: 17, color: C.purpleLight, marginBottom: 4 }}>
              행(Row) — 숫자 주소
            </div>
            <div style={{ fontSize: 16, color: C.purple, marginBottom: 4 }}>
              1, 2, 3, 4 … 아래로 순서대로 증가
            </div>
            <div style={{ fontSize: 15, color: C.textDim }}>
              수평으로 같은 행에 속한 셀들의 집합
            </div>
          </Card>
          {/* Card 3: Cell */}
          <Card bg="#431407" border="#f59e0b">
            <div style={{ fontWeight: 700, fontSize: 17, color: C.amber, marginBottom: 4 }}>
              셀(Cell) — 데이터를 입력하는 칸
            </div>
            <div style={{ fontSize: 16, color: C.amberLight, marginBottom: 4 }}>
              셀 주소 = 열(알파벳) + 행(숫자)
            </div>
            <div style={{ fontSize: 15, color: C.orange, fontWeight: 700 }}>
              예: C3 = C열 3번째 행의 셀
            </div>
          </Card>
        </div>
      </div>

      <BottomBar>
        <BLine>셀 주소: 열(Column) 알파벳 + 행(Row) 숫자  →  A1, B3, D2 등으로 표기합니다</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function RelativeDownDiagram() {
  const tableHeaderStyle = { fontWeight: 700, fontSize: 16, color: C.blueLight };
  const cellData = [
    { name: '김철수', eng: 85, math: 90 },
    { name: '이영희', eng: 72, math: 68 },
    { name: '박민준', eng: 91, math: 78 },
  ];
  const formulas = ['=B2+C2', '=B3+C3', '=B4+C4'];

  return (
    <Wrap>
      <Title>상대 참조 — 아래로 자동 채우기: 행 번호 자동 증가</Title>
      <Subtitle>D2에 수식 입력 후 핸들을 아래로 드래그하면 행 번호가 1씩 늘어납니다</Subtitle>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: table */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 80px 80px 1fr' }}>
            {/* Header row */}
            {['이름', '영어', '수학', '합계(D)'].map((h, i) => (
              <Cell key={h} bg="#14532d" border="#22c55e" bw={2}
                style={{ ...tableHeaderStyle, color: i === 3 ? C.greenLight : C.blueLight }}>
                {h}
              </Cell>
            ))}
            {/* Data rows */}
            {cellData.map((row, idx) => {
              const rowNum = idx + 2;
              const isOrigin = idx === 0;
              return [
                <Cell key={`name${rowNum}`} bg={C.bgDark} border={C.border}
                  style={{ fontSize: 15, color: C.text }}>{row.name}</Cell>,
                <Cell key={`eng${rowNum}`} bg={C.bgDark} border={C.border}
                  style={{ fontSize: 15, color: C.textMuted }}>{row.eng}</Cell>,
                <Cell key={`math${rowNum}`} bg={C.bgDark} border={C.border}
                  style={{ fontSize: 15, color: C.textMuted }}>{row.math}</Cell>,
                <Cell key={`d${rowNum}`}
                  bg={isOrigin ? '#14532d' : '#172554'}
                  border={isOrigin ? '#22c55e' : '#3b82f6'}
                  bw={2}
                  style={{
                    flexDirection: 'column',
                    borderStyle: isOrigin ? 'solid' : 'dashed',
                  }}>
                  <span style={{ fontWeight: 700, fontSize: 17, color: isOrigin ? C.greenLight : C.blueLight }}>
                    {formulas[idx]}
                  </span>
                  {isOrigin && (
                    <span style={{ fontSize: 13, color: C.green, marginTop: 2 }}>▲ 원본 수식 입력</span>
                  )}
                </Cell>,
              ];
            })}
          </div>

          {/* Row change info */}
          <div style={{
            marginTop: 12, background: C.bgDark, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '10px 16px', textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.amber }}>행 번호 변화</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.amber, margin: '4px 0' }}>2 → 3 → 4</div>
            <div style={{ fontSize: 15, color: C.textDim }}>열(B, C)은 고정</div>
          </div>
        </div>

        {/* Right: formula cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 160, alignItems: 'center' }}>
          <Card bg="#14532d" border="#22c55e" style={{ width: '100%', padding: '10px 12px' }}>
            <div style={{ fontSize: 14, color: C.green, marginBottom: 4 }}>D2 (원본)</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.greenLight }}>{'=B2+C2'}</div>
          </Card>
          <ArrowDown color="#22c55e" size={28} />
          <Card bg="#172554" border="#3b82f6" style={{ width: '100%', padding: '10px 12px' }}>
            <div style={{ fontSize: 14, color: C.blue, marginBottom: 4 }}>D3 (자동 채우기)</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.blueLight }}>{'=B3+C3'}</div>
          </Card>
          <ArrowDown color="#3b82f6" size={28} />
          <Card bg="#172554" border="#3b82f6" style={{ width: '100%', padding: '10px 12px' }}>
            <div style={{ fontSize: 14, color: C.blue, marginBottom: 4 }}>D4 (자동 채우기)</div>
            <div style={{ fontWeight: 700, fontSize: 17, color: C.blueLight }}>{'=B4+C4'}</div>
          </Card>
        </div>
      </div>

      <BottomBar>
        <BLine>아래로 채우기: 열(B, C)은 고정, 행 번호만 1씩 증가</BLine>
        <BLine color={C.blue} bold>{'=B2+C2  →  =B3+C3  →  =B4+C4'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function RelativeRightDiagram() {
  return (
    <Wrap>
      <Title>상대 참조 — 오른쪽으로 자동 채우기: 열 문자 자동 이동</Title>
      <Subtitle>F2에 수식 입력 후 핸들을 오른쪽으로 드래그하면 열 문자가 한 칸씩 이동합니다</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top table: row 2 only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {/* B col header */}
          {['B(국어)', 'C(영어)', 'D(수학)', 'E(사회)'].map(h => (
            <Cell key={h} bg={C.bgDark} border={C.border} bw={1}
              style={{ minWidth: 90, fontSize: 15, color: C.textMuted }}>
              {h}
            </Cell>
          ))}
          {/* F col: origin */}
          <Cell bg="#14532d" border="#22c55e" bw={2}
            style={{ minWidth: 110, fontWeight: 700, fontSize: 17, color: C.greenLight }}>
            {'=B2+C2'}
          </Cell>
          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <ArrowRight color="#3b82f6" size={36} />
          </div>
          {/* G col: auto-filled */}
          <Cell bg="#172554" border="#3b82f6" bw={2}
            style={{ minWidth: 110, fontWeight: 700, fontSize: 17, color: C.blueLight, borderStyle: 'dashed' }}>
            {'=C2+D2'}
          </Cell>
        </div>

        {/* Change explanation box */}
        <div style={{
          background: C.bgDark, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '14px 20px', marginTop: 4,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.amber, textAlign: 'center', marginBottom: 12 }}>
            오른쪽으로 복사할 때 — 열 문자가 1칸씩 오른쪽으로 이동
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {/* F2 origin card */}
            <Card bg="#14532d" border="#22c55e" bw={2} style={{ padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: C.green, marginBottom: 4 }}>F2 원본</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.greenLight }}>{'=B2+C2'}</div>
            </Card>
            <ArrowRight color="#3b82f6" size={36} />
            {/* G2 auto-fill card */}
            <Card bg="#172554" border="#3b82f6" bw={2} style={{ padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: C.blue, marginBottom: 4 }}>G2 자동 채우기</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.blueLight }}>{'=C2+D2'}</div>
              <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>(B→C, C→D)</div>
            </Card>
            {/* Info */}
            <Card bg="#2e1065" border="#a855f7" bw={2} style={{ padding: '8px 14px', marginLeft: 8 }}>
              <div style={{ fontSize: 15, color: C.purpleLight, textAlign: 'center', lineHeight: 1.6 }}>
                열 변화 B→C→D<br />행(2)는 고정
              </div>
            </Card>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>오른쪽으로 채우기: 행 번호는 고정, 열 문자만 B→C→D 순으로 이동</BLine>
        <BLine color={C.blue} bold>{'=B2+C2  →  =C2+D2  →  =D2+E2'}</BLine>
        <BLine>{'※ 아래로 채우기 = 행 번호 증가  /  오른쪽으로 채우기 = 열 문자 이동'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function AbsoluteRefDiagram() {
  const tableHeaders = ['이름', '실기(B)', '봉사(C)', '가중합계(D)'];
  const rowData = [
    { name: '김철수', a: 80, b: 90 },
    { name: '이영희', a: 70, b: 85 },
  ];

  function MiniTable({ rows, isLeft }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 70px 1fr', marginTop: 8 }}>
        {tableHeaders.map(h => (
          <Cell key={h} bg="#0f172a" border={C.border}
            style={{ fontSize: 13, color: C.textMuted, fontWeight: 700 }}>
            {h}
          </Cell>
        ))}
        {rows.map((row, idx) => {
          const isOrigin = idx === 0;
          const formula1 = isLeft
            ? (isOrigin ? '=B2*B8' : '=B3*B9')
            : (isOrigin ? '=B2*$B$8' : '=B3*$B$8');
          const formula2 = isLeft
            ? (isOrigin ? '+C2*C8' : '+C3*C9  ✗')
            : (isOrigin ? '+C2*$C$8' : '+C3*$C$8  ✓');
          const dBg = isLeft
            ? (isOrigin ? '#14532d' : '#450a0a')
            : (isOrigin ? '#14532d' : '#052e16');
          const dBorder = isLeft
            ? (isOrigin ? '#22c55e' : '#ef4444')
            : (isOrigin ? '#22c55e' : '#22c55e');
          const dColor = isLeft
            ? (isOrigin ? C.greenLight : '#fca5a5')
            : (isOrigin ? C.greenLight : C.green);

          return [
            <Cell key={`name${idx}`} bg={C.bgDark} border={C.border}
              style={{ fontSize: 14, color: C.text }}>{row.name}</Cell>,
            <Cell key={`a${idx}`} bg={C.bgDark} border={C.border}
              style={{ fontSize: 14, color: C.textMuted }}>{row.a}</Cell>,
            <Cell key={`b${idx}`} bg={C.bgDark} border={C.border}
              style={{ fontSize: 14, color: C.textMuted }}>{row.b}</Cell>,
            <Cell key={`d${idx}`} bg={dBg} border={dBorder} bw={2}
              style={{ flexDirection: 'column', fontSize: 14, fontWeight: 700, color: dColor }}>
              <span>{formula1}</span>
              <span>{formula2}</span>
            </Cell>,
          ];
        })}
      </div>
    );
  }

  return (
    <Wrap>
      <Title>절대 참조: $ 기호로 셀 주소를 고정하는 방법</Title>
      <Subtitle>비율·단가처럼 항상 같은 셀을 참조해야 할 때 $ 기호를 붙여 고정합니다</Subtitle>

      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
        {/* Left panel: wrong */}
        <div style={{
          flex: 1, background: '#1a0b0b', border: '2px solid #ef4444',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.red, textAlign: 'center', marginBottom: 8 }}>
            ❌ 상대 참조 — 잘못된 결과
          </div>
          <div style={{ fontSize: 14, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>
            B8: 실기 비율 (0.7)  C8: 봉사 비율 (0.3)
          </div>
          <MiniTable rows={rowData} isLeft={true} />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
            <ArrowDown color="#ef4444" size={24} />
          </div>
          {/* Error box */}
          <div style={{
            background: '#450a0a', border: `1px solid #ef4444`,
            borderRadius: 8, padding: '10px 12px', marginTop: 4,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.redLight, marginBottom: 4 }}>
              문제: B8이 B9로 이동해버림!
            </div>
            <div style={{ fontSize: 14, color: C.textDim, marginBottom: 4 }}>
              비율 셀(B8, C8)이 아래 행으로 밀려남
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.red }}>
              B9, C9는 비어 있어 오류 발생!
            </div>
          </div>
        </div>

        {/* Center F4 badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
          <div style={{
            background: C.bgDark, border: '2px solid #f59e0b', borderRadius: 6,
            padding: '6px 12px', color: '#fbbf24', fontSize: 16, fontWeight: 700,
          }}>F4</div>
        </div>

        {/* Right panel: correct */}
        <div style={{
          flex: 1, background: '#071a0b', border: '2px solid #22c55e',
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.green, textAlign: 'center', marginBottom: 8 }}>
            ✅ 절대 참조 — 올바른 결과
          </div>
          <div style={{ fontSize: 14, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>
            $B$8: 실기 비율  $C$8: 봉사 비율 고정
          </div>
          <MiniTable rows={rowData} isLeft={false} />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
            <ArrowDown color="#22c55e" size={24} />
          </div>
          {/* Success box */}
          <div style={{
            background: '#052e16', border: `1px solid #22c55e`,
            borderRadius: 8, padding: '10px 12px', marginTop: 4,
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.greenLight, marginBottom: 4 }}>
              $B$8, $C$8 — 이동하지 않음!
            </div>
            <div style={{ fontSize: 14, color: C.textDim, marginBottom: 4 }}>
              행이 바뀌어도 항상 8행을 참조
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.green }}>
              F4 키 → $ 기호 자동 입력!
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine color={C.amber} bold>{'$ 기호 = 셀 고정 (F4 키를 누르면 자동 입력됩니다)'}</BLine>
        <BLine>{'$B$8 = B열 8행 완전 고정  /  B$8 = 8행만 고정  /  $B8 = B열만 고정'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function MixedRefDiagram() {
  // Grid data: rows $A2,$A3,$A4 × cols B$1,C$1,D$1
  const rowVals = [2, 3, 4]; // $A2, $A3, $A4
  const colVals = [2, 3, 4]; // B$1, C$1, D$1
  const colLabels = ['B$1\n(값=2)', 'C$1\n(값=3)', 'D$1\n(값=4)'];
  const rowLabels = ['$A2\n(값=2)', '$A3\n(값=3)', '$A4\n(값=4)'];
  const colNames = ['B', 'C', 'D'];
  const rowNums = [2, 3, 4];

  const formulaFor = (rIdx, cIdx) => `=$A${rowNums[rIdx]}*${colNames[cIdx]}$1`;
  const resultFor = (rIdx, cIdx) => rowVals[rIdx] * colVals[cIdx];

  return (
    <Wrap>
      <Title>혼합 참조: 행 또는 열 중 하나만 고정</Title>
      <Subtitle>{'$A2 = A열 고정, 행은 이동  /  B$1 = 1행 고정, 열은 이동'}</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Top formula box */}
        <div style={{
          background: '#1e3a8a', border: '2px solid #3b82f6', borderRadius: 10,
          padding: '14px 20px', maxWidth: 480, margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
            원본 수식 {'=$A2*B$1'}
          </div>
          <div style={{ color: C.blueLight, fontSize: 15 }}>
            B2 셀에 입력 후 오른쪽·아래 방향으로 자동 채우기
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, background: C.amber, borderRadius: 3 }} />
            <span style={{ color: C.amber, fontSize: 15 }}>$ 붙음  →  고정 (이동 안 함)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, background: C.green, borderRadius: 3 }} />
            <span style={{ color: C.greenLight, fontSize: 15 }}>$ 없음  →  상대 (이동함)</span>
          </div>
        </div>

        {/* Multiplication grid */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 120px 120px' }}>
            {/* Corner */}
            <Cell style={{ color: C.textSlate, fontSize: 18, fontWeight: 700 }}>×</Cell>
            {/* Col headers */}
            {colLabels.map((label, ci) => {
              const [title, sub] = label.split('\n');
              return (
                <Cell key={ci} bg="#1c1007" border="#f59e0b" bw={2}
                  style={{ flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.amber }}>{title}</span>
                  <span style={{ fontSize: 14, color: C.amberLight }}>{sub}</span>
                </Cell>
              );
            })}
            {/* Rows */}
            {rowLabels.map((label, ri) => {
              const [title] = label.split('\n');
              const sub = label.split('\n')[1];
              return [
                <Cell key={`rh${ri}`} bg="#1c1007" border="#f59e0b" bw={2}
                  style={{ flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.amber }}>{title}</span>
                  <span style={{ fontSize: 13, color: C.amberLight }}>{sub}</span>
                </Cell>,
                ...colVals.map((_, ci) => {
                  const isOrigin = ri === 0 && ci === 0;
                  return (
                    <Cell key={`d${ri}${ci}`}
                      bg={isOrigin ? '#0c2440' : '#172554'}
                      border="#3b82f6"
                      bw={isOrigin ? 3 : 1}
                      style={{
                        flexDirection: 'column',
                        borderStyle: isOrigin ? 'solid' : 'dashed',
                      }}>
                      <span style={{ fontSize: 14, color: C.blueLight }}>{formulaFor(ri, ci)}</span>
                      <span style={{ fontWeight: 700, fontSize: 18, color: C.blue }}>= {resultFor(ri, ci)}</span>
                    </Cell>
                  );
                }),
              ];
            })}
          </div>

          {/* Direction legend */}
          <div style={{
            background: '#1e0f47', border: '1px solid #a855f7',
            borderRadius: 8, padding: '12px 14px', alignSelf: 'center',
          }}>
            <div style={{ fontSize: 15, color: C.greenLight, lineHeight: 1.8 }}>
              → 오른쪽 이동: 열 B→C→D<br />
              ↓ 아래 이동: 행 2→3→4
            </div>
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>{'$A(A열 고정) + $1(1행 고정) → B, C, D열과 2, 3, 4행은 자동 이동'}</BLine>
        <BLine>{'B2 셀 하나에 =$A2*B$1 입력 → 오른쪽·아래 전체를 한 번에 채울 수 있습니다'}</BLine>
      </BottomBar>
    </Wrap>
  );
}
