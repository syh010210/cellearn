import { Wrap, Title, Subtitle, BottomBar, BLine, Cell, Card, ArrowDown, ArrowRight, C } from './shared.jsx';

export function StringExtractDiagram() {
  const str = 'ABC456XYZ';
  const chars = str.split('');
  const positions = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];

  function charStyle(i) {
    if (i <= 2) return { bg: '#14532d', border: '#22c55e', color: '#86efac' };
    if (i === 3 || i === 4) return { bg: '#2e1065', border: '#a855f7', color: '#d8b4fe' };
    if (i === 5) return { bg: C.bgDark, border: C.border, color: C.textDim };
    return { bg: '#431407', border: '#f97316', color: '#fb923c' };
  }

  return (
    <Wrap>
      <Title>문자열 추출 함수: LEFT · RIGHT · MID</Title>
      <Subtitle>원본 문자열 "ABC456XYZ" — 각 문자의 위치 번호는 1번부터 시작합니다</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Character cells row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {chars.map((ch, i) => {
            const s = charStyle(i);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 72, minHeight: 64, background: s.bg, border: `2px solid ${s.border}`,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 28, color: s.color,
                }}>
                  {ch}
                </div>
                <span style={{ fontSize: 14, color: C.textSlate, textAlign: 'center' }}>{positions[i]}</span>
              </div>
            );
          })}
        </div>

        {/* Bracket annotations — 세 함수 동일 형식(설명 → 몇 번째 위치) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#14532d', border: '1px solid #22c55e',
            borderRadius: 6, padding: '8px 16px',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.greenLight }}>LEFT · 왼쪽 3글자</span>
            <span style={{ fontSize: 15, color: C.green }}>{'=LEFT("ABC456XYZ", 3)'}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#2e1065', border: '1px solid #a855f7',
            borderRadius: 6, padding: '8px 16px',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.purpleLight }}>MID · 4번째부터 2글자</span>
            <span style={{ fontSize: 15, color: C.purple }}>{'=MID("ABC456XYZ", 4, 2)'}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#431407', border: '1px solid #f97316',
            borderRadius: 6, padding: '8px 16px',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.orange }}>RIGHT · 오른쪽 3글자</span>
            <span style={{ fontSize: 15, color: C.orangeLight }}>{'=RIGHT("ABC456XYZ", 3)'}</span>
          </div>
        </div>

        {/* Three function cards */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Card bg="#14532d" border="#22c55e" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.greenLight, marginBottom: 6 }}>구문: =LEFT(텍스트, 개수)</div>
            <div style={{ fontSize: 14, color: C.green, lineHeight: 1.6, marginBottom: 10 }}>문자열의 가장 왼쪽(첫 번째)부터 지정한 개수만큼 문자를 반환합니다.</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 6 }}>왼쪽부터 3글자 추출</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight color="#22c55e" size={28} />
              <span style={{ fontWeight: 700, fontSize: 17, color: C.greenLight }}>"ABC"</span>
            </div>
          </Card>
          <Card bg="#2e1065" border="#a855f7" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.purpleLight, marginBottom: 6 }}>구문: =MID(텍스트, 시작위치, 개수)</div>
            <div style={{ fontSize: 14, color: C.purple, lineHeight: 1.6, marginBottom: 10 }}>시작위치는 1번부터 셉니다. 지정한 위치부터 지정한 개수만큼 반환합니다.</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 6 }}>4번째 위치에서 2글자 추출</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight color="#a855f7" size={28} />
              <span style={{ fontWeight: 700, fontSize: 17, color: C.purpleLight }}>"45"</span>
            </div>
          </Card>
          <Card bg="#431407" border="#f97316" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.orange, marginBottom: 6 }}>구문: =RIGHT(텍스트, 개수)</div>
            <div style={{ fontSize: 14, color: C.orange, lineHeight: 1.6, marginBottom: 10 }}>문자열의 가장 오른쪽(마지막)부터 지정한 개수만큼 문자를 반환합니다.</div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 6 }}>오른쪽부터 3글자 추출</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight color="#fb923c" size={28} />
              <span style={{ fontWeight: 700, fontSize: 17, color: C.orange }}>"XYZ"</span>
            </div>
          </Card>
        </div>
      </div>

      <BottomBar>
        <BLine>{'=LEFT(텍스트, 개수)  ·  =MID(텍스트, 시작위치, 개수)  ·  =RIGHT(텍스트, 개수)'}</BLine>
        <BLine color={C.blue} bold>{'※ MID 함수 시작 위치는 1번부터 셉니다 — MID("ABC", 2, 1) = "B"'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function StringLenCaseDiagram() {
  const rows = [
    {
      fn: 'LEN', fnBg: '#172554', fnBorder: '#3b82f6', fnColor: C.blueLight,
      formula: '=LEN("Excel Exam")',
      result: '10',
      resultSize: 24,
      desc: '공백 포함 / 전체 글자 수 반환',
    },
    {
      fn: 'UPPER', fnBg: '#14532d', fnBorder: '#22c55e', fnColor: C.greenLight,
      formula: '=UPPER("hello world")',
      result: 'HELLO WORLD',
      resultSize: 15,
      desc: '모두 대문자로 변환',
    },
    {
      fn: 'LOWER', fnBg: '#431407', fnBorder: '#f97316', fnColor: C.orange,
      formula: '=LOWER("EXCEL EXAM")',
      result: 'excel exam',
      resultSize: 15,
      desc: '모두 소문자로 변환',
    },
    {
      fn: 'PROPER', fnBg: '#2e1065', fnBorder: '#a855f7', fnColor: C.purpleLight,
      formula: '=PROPER("hello world")',
      result: 'Hello World',
      resultSize: 15,
      desc: '각 단어 첫 글자만 대문자',
    },
  ];

  return (
    <Wrap>
      <Title>문자열 길이 · 대소문자 변환 함수</Title>
      <Subtitle>LEN — 글자 수 반환 / UPPER — 대문자 / LOWER — 소문자 / PROPER — 단어 첫 글자 대문자</Subtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 140px 1fr' }}>
        {/* Header row */}
        {['함수', '입력 수식', '결과', '설명'].map(h => (
          <Cell key={h} bg="#0c2344" border="#3b82f6" bw={2}
            style={{ fontWeight: 700, fontSize: 16, color: '#93c5fd' }}>
            {h}
          </Cell>
        ))}
        {/* Data rows */}
        {rows.map(row => [
          <Cell key={`fn${row.fn}`} bg={row.fnBg} border={row.fnBorder} bw={2}
            style={{ fontWeight: 700, fontSize: 17, color: row.fnColor }}>
            {row.fn}
          </Cell>,
          <Cell key={`fml${row.fn}`} bg={C.bgDark} border={C.border}
            style={{ fontSize: 14, color: C.textMuted, fontFamily: 'monospace', justifyContent: 'flex-start', padding: '6px 10px' }}>
            {row.formula}
          </Cell>,
          <Cell key={`res${row.fn}`} bg={C.bgDark} border={C.border}
            style={{ fontWeight: 700, fontSize: row.resultSize, color: C.amber, fontFamily: 'monospace' }}>
            {row.result}
          </Cell>,
          <Cell key={`desc${row.fn}`} bg={C.bgDark} border={C.border}
            style={{ fontSize: 15, color: C.textMuted, justifyContent: 'flex-start', padding: '6px 10px' }}>
            {row.desc}
          </Cell>,
        ])}
      </div>

      <BottomBar>
        <BLine>{'※ UPPER, LOWER, PROPER는 영문에만 적용됩니다 — 한글 텍스트에는 변화가 없습니다'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function StringFindTrimDiagram() {
  const findStr = 'John_j';
  const chars = findStr.split('');
  const positions = ['①', '②', '③', '④', '⑤', '⑥'];

  return (
    <Wrap>
      <Title>FIND · SEARCH · TRIM 함수</Title>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left panel: FIND vs SEARCH */}
        <div style={{
          flex: 1, background: C.bgDark, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.amber, textAlign: 'center', marginBottom: 12 }}>
            FIND  vs  SEARCH  비교
          </div>

          {/* Two cards side by side */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Card bg="#14532d" border="#22c55e" bw={2} style={{ flex: 1, padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: C.greenLight, marginBottom: 4 }}>FIND</div>
              <div style={{ fontSize: 14, color: C.green, marginBottom: 8 }}>대소문자 구분 O</div>
              <div style={{ fontSize: 14, color: C.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                {'=FIND("j","John_j")'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.greenLight }}>
                → 6  (소문자 j)
              </div>
            </Card>
            <Card bg="#172554" border="#3b82f6" bw={2} style={{ flex: 1, padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: C.blueLight, marginBottom: 4 }}>SEARCH</div>
              <div style={{ fontSize: 14, color: C.blue, marginBottom: 8 }}>대소문자 구분 X</div>
              <div style={{ fontSize: 14, color: C.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                {'=SEARCH("J","John_j")'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.blueLight }}>
                → 1  (대소문자 무시)
              </div>
            </Card>
          </div>

          {/* Character cells for "John_j" */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            {chars.map((ch, i) => {
              const isJ = i === 0;  // capital J
              const isLowJ = i === 5; // lowercase j
              let bg = C.bgDark, border = C.border, color = C.textMuted;
              if (isJ) { bg = '#172554'; border = '#3b82f6'; color = C.blueLight; }
              if (isLowJ) { bg = '#14532d'; border = '#22c55e'; color = C.greenLight; }
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    width: 48, minHeight: 48, background: bg, border: `2px solid ${border}`,
                    borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18, color, fontFamily: 'monospace',
                  }}>
                    {ch}
                  </div>
                  <span style={{ fontSize: 12, color: C.textSlate }}>{positions[i]}</span>
                </div>
              );
            })}
          </div>

          {/* Explanations */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.amber, marginBottom: 4 }}>
              {'FIND("j") = 6  (소문자 j는 6번째)'}
            </div>
            <div style={{ fontSize: 15, color: C.blue, marginBottom: 4 }}>
              {'SEARCH("J") = 1  (대소문자 무시 → J와 j 같음)'}
            </div>
            <div style={{ fontSize: 14, color: C.textSlate }}>
              찾는 문자가 없으면  #VALUE!  오류 반환
            </div>
          </div>
        </div>

        {/* Right panel: TRIM */}
        <div style={{
          flex: 1, background: C.bgDark, border: `1px solid #a855f7`,
          borderRadius: 10, padding: '14px 16px',
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.purpleLight, textAlign: 'center', marginBottom: 12 }}>
            TRIM 함수 — 불필요한 공백 제거
          </div>

          <div style={{ fontSize: 14, color: C.textDim, marginBottom: 6 }}>입력 값 (A2)</div>
          <div style={{
            background: '#450a0a', border: `1px solid #ef4444`,
            borderRadius: 8, padding: '10px 12px', textAlign: 'center',
            fontFamily: 'monospace', fontSize: 16, color: C.redLight, fontStyle: 'italic',
          }}>
            {"  컴활  2급  "}
          </div>
          <div style={{ fontSize: 14, color: C.textDim, textAlign: 'center', marginTop: 8 }}>
            앞 공백 2칸 · 단어 사이 공백 2칸 · 뒤 공백 2칸
          </div>

          <div style={{
            background: '#1e0f47', border: `1px solid #a855f7`,
            borderRadius: 8, padding: '10px 12px', textAlign: 'center', marginTop: 10,
            fontFamily: 'monospace',
          }}>
            <span style={{ fontWeight: 700, fontSize: 17, color: C.purpleLight }}>{'=TRIM(A2)'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <ArrowDown color="#a855f7" size={28} />
          </div>

          <div style={{ fontSize: 14, color: C.textDim, marginBottom: 6 }}>결과 값</div>
          <div style={{
            background: '#052e16', border: `1px solid #22c55e`,
            borderRadius: 8, padding: '10px 12px', textAlign: 'center',
            fontFamily: 'monospace', fontSize: 16, color: C.greenLight,
          }}>
            {"컴활 2급"}
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 8 }}>
            앞뒤 공백 모두 제거 · 단어 사이 공백 1칸만 유지
          </div>
        </div>
      </div>

      <BottomBar>
        <BLine>{'=FIND(찾을텍스트, 문자열)  ·  =SEARCH(찾을텍스트, 문자열)  ·  =TRIM(텍스트)'}</BLine>
      </BottomBar>
    </Wrap>
  );
}

export function StringCombineDiagram() {
  const examples = [
    {
      label: '예제 1  (기본 & 연결)',
      formula: '="컴퓨터활용능력"  &  "-"  &  "2급"',
      result: '"컴퓨터활용능력-2급"',
    },
    {
      label: '예제 2  (함수 + & 조합)',
      formula: '=UPPER("excel")  &  "-"  &  "2급"',
      result: '"EXCEL-2급"',
    },
    {
      label: '예제 3  (셀 참조 + & 조합)',
      formula: '="("  &  LOWER("컴활")  &  ")"  &  " "  &  "2급"',
      result: '"(컴활) 2급"',
    },
  ];

  return (
    <Wrap>
      <Title>{'& 연산자 · CONCAT — 문자열 연결'}</Title>
      <Subtitle>
        {'& 연산자로 텍스트·셀·함수를 이어 붙일 수 있습니다. 텍스트는 반드시 큰따옴표(" ")로 감쌉니다'}
      </Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {examples.map((ex, i) => (
          <div key={i}>
            <div style={{ fontSize: 14, color: C.textDim, marginBottom: 6 }}>{ex.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                flex: 1, background: C.bgDark, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '10px 14px',
                fontFamily: 'monospace', fontSize: 15, color: C.text,
              }}>
                {ex.formula}
              </div>
              <span style={{ color: C.textDim, fontSize: 22, flexShrink: 0 }}>→</span>
              <div style={{
                background: '#14532d', border: `1px solid #22c55e`,
                borderRadius: 8, padding: '10px 14px',
                fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: C.greenLight,
                whiteSpace: 'nowrap',
              }}>
                {ex.result}
              </div>
            </div>
          </div>
        ))}

        {/* CONCAT info box */}
        <Card bg="#0c2344" border="#3b82f6" bw={2} style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.blue, textAlign: 'center', marginBottom: 8 }}>
            CONCAT 함수 — 셀 범위 전체를 한 번에 연결
          </div>
          <div style={{ fontSize: 15, color: C.blueLight, textAlign: 'center', marginBottom: 6 }}>
            {'=CONCAT(A1:A3)  →  A1, A2, A3의 내용을 차례로 이어 붙임'}
          </div>
          <div style={{ fontSize: 15, color: C.textDim, textAlign: 'center' }}>
            {'& 연산자는 셀/값 하나씩  /  CONCAT 함수는 셀 범위 전체를 한 번에 처리'}
          </div>
        </Card>
      </div>

      <BottomBar>
        <BLine>{'=LEFT(텍스트, 개수)  ·  =MID(텍스트, 시작위치, 개수)  ·  =RIGHT(텍스트, 개수)'}</BLine>
        <BLine>{'※ & 연산자로 텍스트를 이어 붙일 때, 숫자를 텍스트와 연결하면 자동으로 텍스트로 변환됩니다'}</BLine>
      </BottomBar>
    </Wrap>
  );
}
