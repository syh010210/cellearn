// 자동 채우기 애니메이션 다이어그램 (아래로 / 오른쪽으로 / 절대참조).
// 실제 엑셀처럼 얇은 십자(+) 커서가 채우기 핸들을 따라 움직이며 셀이 하나씩
// 채워지는 과정을 반복 재생한다. 외부 라이브러리 없이 setInterval + DOM 측정으로 구동.
import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Wrap, Title, Subtitle, C } from './shared.jsx';

const CHG = C.amber;       // 바뀌는(증가하는) 부분 강조색
const FIX = C.greenLight;  // 고정되는 부분 강조색

// 0,1,2 (채우는 중) → 3 (완성 유지) → 다시 0 으로 순환
function useFillStep(interval = 1400) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 4), interval);
    return () => clearInterval(id);
  }, [interval]);
  return step;
}

// 현재 채워지는 셀의 오른쪽 아래 모서리(채우기 핸들 위치)로 십자 커서를 이동시킨다.
function useFillCursor(step, maxActive = 2) {
  const containerRef = useRef(null);
  const cellRefs = useRef({});
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false, animate: false });
  const setCellRef = (idx) => (el) => { if (el) cellRefs.current[idx] = el; };
  useLayoutEffect(() => {
    const idx = Math.min(step, maxActive);
    const el = cellRefs.current[idx];
    const cont = containerRef.current;
    if (el && cont) {
      const er = el.getBoundingClientRect();
      const cr = cont.getBoundingClientRect();
      setCursor({
        x: er.right - cr.left - 3,
        y: er.bottom - cr.top - 3,
        visible: step <= maxActive,
        animate: step !== 0, // 0으로 돌아올 때는 미끄러지지 않고 원본 셀로 스냅
      });
    }
  }, [step, maxActive]);
  return { containerRef, setCellRef, cursor };
}

// 실제 엑셀 채우기 커서 모양: 흰 테두리를 두른 얇은 검은 십자(+)
function FillCursor({ cursor }) {
  return (
    <svg width="26" height="26" style={{
      position: 'absolute', left: cursor.x, top: cursor.y,
      transform: 'translate(-50%,-50%)',
      transition: cursor.animate
        ? 'left 0.6s ease-in-out, top 0.6s ease-in-out, opacity 0.3s'
        : 'opacity 0.3s',
      opacity: cursor.visible ? 1 : 0, pointerEvents: 'none', zIndex: 30,
    }}>
      <line x1="13" y1="1" x2="13" y2="25" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <line x1="1" y1="13" x2="25" y2="13" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <line x1="13" y1="2" x2="13" y2="24" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="2" y1="13" x2="24" y2="13" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

// "왜 고정/증가 하는가" 설명 박스
function WhyBox({ title, lines }) {
  return (
    <div style={{ background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.blueLight, marginBottom: 8 }}>{title}</div>
      {lines.map((ln, i) => (
        <div key={i} style={{ fontSize: 16, color: C.text, lineHeight: 1.8 }}>{ln}</div>
      ))}
    </div>
  );
}

// 색으로 강조하는 수식 조각 렌더
function Formula({ parts, size = 15 }) {
  return (
    <span style={{ fontSize: size }}>
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.c || 'inherit', fontWeight: p.b ? 800 : 700 }}>{p.t}</span>
      ))}
    </span>
  );
}

const gridBase = {
  display: 'grid',
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  overflow: 'hidden',
};

function HeadCell({ children, accent }) {
  return (
    <div style={{
      background: '#0b1220', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: '7px 4px', textAlign: 'center', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
      color: accent ? FIX : C.textMuted,
    }}>{children}</div>
  );
}

function DataCell({ children, dim }) {
  return (
    <div style={{
      background: C.bgDark, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: '9px 4px', textAlign: 'center', fontSize: 15, color: dim ? C.textMuted : C.text,
    }}>{children}</div>
  );
}

// 제목(필드명) 셀 — 열 문자/행 번호 헤더와 구분되는 볼드 데이터 셀
function TitleCell({ children, accent }) {
  return (
    <div style={{
      background: '#101c30', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: '9px 4px', textAlign: 'center', fontSize: 15, fontWeight: 700,
      color: accent ? C.greenLight : C.text,
    }}>{children}</div>
  );
}

// 결과(수식) 셀 — 채워짐/비어있음 상태에 따라 스타일이 달라진다.
function ResultCell({ filled, justFilled, isOrigin, formulaNodes, value, innerRef, style = {} }) {
  return (
    <div ref={innerRef} style={{
      position: 'relative',
      background: filled ? (isOrigin ? '#14532d' : '#172554') : '#0e1a33',
      borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      borderLeft: filled ? `2px solid ${isOrigin ? '#22c55e' : '#3b82f6'}` : `2px dashed ${C.border}`,
      padding: '7px 8px', textAlign: 'center', height: 54,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.3s, border-color 0.3s',
      boxShadow: justFilled ? '0 0 0 2px #3b82f6 inset' : 'none',
      ...style,
    }}>
      {filled ? (
        <>
          <span style={{ fontWeight: 700, color: isOrigin ? C.greenLight : C.blueLight }}>
            {formulaNodes}
          </span>
          <span style={{ fontSize: 13, color: C.textDim }}>= {value}</span>
        </>
      ) : (
        <span style={{ fontSize: 13, color: C.textDim }}>&nbsp;</span>
      )}
    </div>
  );
}

// 일반 스텝 순환 훅 (count 단계를 interval 마다 순환)
function useStep(count, interval) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);
  return s;
}

// 커서 모양 3가지:
//  'select' 굵은 흰색 십자(셀 선택) / 'move' 사방 화살표 십자(셀 데이터 이동) / 'fill' 얇은 검은 십자 +(자동 채우기)
function MorphCursor({ x, y, mode, moving }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)',
      transition: moving ? 'left 0.5s ease-in-out, top 0.5s ease-in-out' : 'none',
      pointerEvents: 'none', zIndex: 30,
    }}>
      {mode === 'select' ? (
        <svg width="34" height="34">
          <line x1="17" y1="4" x2="17" y2="30" stroke="#0b1220" strokeWidth="9" strokeLinecap="round" />
          <line x1="4" y1="17" x2="30" y2="17" stroke="#0b1220" strokeWidth="9" strokeLinecap="round" />
          <line x1="17" y1="5" x2="17" y2="29" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="5" y1="17" x2="29" y2="17" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      ) : mode === 'move' ? (
        <svg width="36" height="36">
          {[6, 2.4].map((w, k) => (
            <g key={k} stroke={k === 0 ? '#fff' : '#111827'} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="5" x2="18" y2="31" />
              <line x1="5" y1="18" x2="31" y2="18" />
              <polyline points="13,10 18,5 23,10" />
              <polyline points="13,26 18,31 23,26" />
              <polyline points="10,13 5,18 10,23" />
              <polyline points="26,13 31,18 26,23" />
            </g>
          ))}
        </svg>
      ) : (
        <svg width="28" height="28">
          <line x1="14" y1="1" x2="14" y2="27" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <line x1="1" y1="14" x2="27" y2="14" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <line x1="14" y1="2" x2="14" y2="26" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="2" y1="14" x2="26" y2="14" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

function StateChip({ active, label }) {
  return (
    <div style={{
      fontSize: 13.5, fontWeight: 700, padding: '7px 14px', borderRadius: 999,
      border: `1px solid ${active ? '#3b82f6' : C.border}`,
      background: active ? '#172554' : '#0b1220',
      color: active ? C.blueLight : C.textDim, transition: 'all 0.3s',
    }}>{label}</div>
  );
}

/* ───────────── 채우기 핸들 커서 변신 (굵은 흰 십자 → 얇은 검은 +) ───────────── */
export function FillHandleCursorAnim() {
  const step = useStep(3, 1500); // 0: 셀 위 / 1: 핸들로 이동 / 2: 핸들에서 대기
  const atHandle = step >= 1;
  // 고정 좌표(스테이지 340×200): 셀 left70 top46 w170 h66 → 중앙(155,79), 오른쪽아래 핸들(240,112)
  const pos = atHandle ? { x: 240, y: 112 } : { x: 155, y: 79 };

  return (
    <Wrap>
      <Title>채우기 핸들 — 커서가 얇은 십자(+)로 바뀝니다</Title>
      <Subtitle>셀 오른쪽 아래 모서리(채우기 핸들)에 마우스를 올리면 커서 모양이 바뀝니다</Subtitle>

      <div style={{ position: 'relative', width: 340, height: 200, margin: '8px auto 0' }}>
        {/* 선택된 셀 D2 */}
        <div style={{
          position: 'absolute', left: 70, top: 46, width: 170, height: 66,
          background: '#14532d', border: '2px solid #22c55e', borderRadius: 6,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 12, color: C.green }}>D2 (선택된 셀)</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: C.greenLight }}>=B2+C2</span>
          {/* 채우기 핸들 — 오른쪽 아래 작은 사각형 */}
          <div style={{
            position: 'absolute', right: -5, bottom: -5, width: 10, height: 10,
            background: '#22c55e', border: '1.5px solid #0b1220',
            boxShadow: atHandle ? '0 0 0 4px rgba(34,197,94,0.35)' : 'none', transition: 'box-shadow 0.3s',
          }} />
        </div>
        <MorphCursor x={pos.x} y={pos.y} mode={atHandle ? 'fill' : 'select'} moving={step === 1} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <StateChip active={!atHandle} label="① 셀 위 — 굵은 흰색 십자" />
        <StateChip active={atHandle} label="② 채우기 핸들 — 얇은 검은 십자(+)" />
      </div>

      <WhyBox
        title="왜 커서 모양을 확인해야 하나요?"
        lines={[
          <>셀 위의 <b style={{ color: '#fff' }}>굵은 흰색 십자</b>는 &lsquo;셀 선택&rsquo; 커서예요.</>,
          <>오른쪽 아래 모서리로 가면 <b style={{ color: C.blueLight }}>얇은 검은 십자(+)</b>로 바뀝니다.</>,
          <><b style={{ color: C.blueLight }}>이 얇은 + 상태일 때만</b> 드래그해서 자동 채우기가 됩니다.</>,
        ]}
      />
    </Wrap>
  );
}

/* ───────────── 마우스 위치별 커서 3종 (선택 · 이동 · 채우기) — 버튼으로 선택 ───────────── */
export function ExcelCursorsAnim() {
  const [sel, setSel] = useState(0); // 0 선택(가운데) / 1 이동(테두리) / 2 채우기(핸들)
  const mode = ['select', 'move', 'fill'][sel];
  const pos = [{ x: 155, y: 79 }, { x: 155, y: 46 }, { x: 240, y: 112 }][sel];
  const caption = [
    '셀 안에 두면 선택 커서 — 클릭하면 그 셀이 선택됩니다.',
    '셀 테두리에 올리면 이동 커서 — 드래그하면 데이터가 통째로 이동합니다.',
    '오른쪽 아래 핸들에 올리면 채우기 커서 — 드래그하면 수식·값이 복사됩니다.',
  ][sel];
  const chips = ['① 선택 — 굵은 흰 십자', '② 이동 — 사방 화살표', '③ 채우기 — 얇은 검은 십자'];
  const chipBtn = (active) => ({
    fontSize: 13.5, fontWeight: 700, padding: '8px 15px', borderRadius: 999,
    border: `1px solid ${active ? '#3b82f6' : C.border}`,
    background: active ? '#172554' : '#0b1220',
    color: active ? C.blueLight : C.textDim,
    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
  });

  return (
    <Wrap>
      <Title>마우스 위치에 따라 바뀌는 3가지 커서</Title>
      <Subtitle>아래 버튼을 눌러 마우스 위치별 커서 모양을 확인해 보세요</Subtitle>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {chips.map((label, i) => (
          <button key={i} type="button" onClick={() => setSel(i)} style={chipBtn(sel === i)}>{label}</button>
        ))}
      </div>

      <div style={{ position: 'relative', width: 340, height: 200, margin: '0 auto' }}>
        <div style={{
          position: 'absolute', left: 70, top: 46, width: 170, height: 66,
          background: '#14532d', border: `2px solid ${sel === 1 ? '#60a5fa' : '#22c55e'}`, borderRadius: 6,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: sel === 1 ? '0 0 0 3px rgba(96,165,250,0.35)' : 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}>
          <span style={{ fontSize: 12, color: C.green }}>D2 (선택된 셀)</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: C.greenLight }}>=B2+C2</span>
          {/* 채우기 핸들 */}
          <div style={{
            position: 'absolute', right: -5, bottom: -5, width: 10, height: 10,
            background: '#22c55e', border: '1.5px solid #0b1220',
            boxShadow: sel === 2 ? '0 0 0 4px rgba(34,197,94,0.35)' : 'none', transition: 'box-shadow 0.3s',
          }} />
        </div>
        <MorphCursor x={pos.x} y={pos.y} mode={mode} moving />
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 15, color: C.text, minHeight: 22 }}>{caption}</div>
    </Wrap>
  );
}

/* ─────────────────────────── 아래로 자동 채우기 ─────────────────────────── */
export function RelativeFillDownAnim() {
  const step = useFillStep();
  const filledCount = Math.min(step, 2) + 1;
  const { containerRef, setCellRef, cursor } = useFillCursor(step);

  const rows = [
    { rn: 2, name: '김철수', b: 85, c: 90, sum: 175 },
    { rn: 3, name: '이영희', b: 72, c: 68, sum: 140 },
    { rn: 4, name: '박민준', b: 91, c: 78, sum: 169 },
  ];

  return (
    <Wrap>
      <Title>상대 참조 — 아래로 자동 채우기</Title>
      <Subtitle>D2 수식을 아래로 끌면 행 번호만 2 → 3 → 4 로 따라 내려갑니다</Subtitle>

      <div ref={containerRef} style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ ...gridBase, gridTemplateColumns: '34px 84px 66px 66px 150px' }}>
          {/* 열 문자 행 */}
          <HeadCell />
          <HeadCell>A</HeadCell>
          <HeadCell>B</HeadCell>
          <HeadCell>C</HeadCell>
          <HeadCell accent>D</HeadCell>
          {/* 제목 행 (엑셀 1행) */}
          <HeadCell>1</HeadCell>
          <TitleCell>이름</TitleCell>
          <TitleCell>영어</TitleCell>
          <TitleCell>수학</TitleCell>
          <TitleCell accent>합계</TitleCell>
          {rows.map((r, idx) => {
            const filled = idx < filledCount;
            const justFilled = idx === Math.min(step, 2) && step <= 2;
            const isOrigin = idx === 0;
            return [
              <HeadCell key={`rn${r.rn}`}>{r.rn}</HeadCell>,
              <DataCell key={`n${r.rn}`}>{r.name}</DataCell>,
              <DataCell key={`b${r.rn}`} dim>{r.b}</DataCell>,
              <DataCell key={`c${r.rn}`} dim>{r.c}</DataCell>,
              <ResultCell
                key={`d${r.rn}`}
                innerRef={setCellRef(idx)}
                filled={filled}
                justFilled={justFilled && !isOrigin}
                isOrigin={isOrigin}
                value={r.sum}
                formulaNodes={
                  <Formula parts={[
                    { t: '=B', c: FIX }, { t: r.rn, c: CHG, b: true },
                    { t: '+C', c: FIX }, { t: r.rn, c: CHG, b: true },
                  ]} />
                }
              />,
            ];
          })}
        </div>

        {/* 오른쪽 수식 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
          {[2, 3, 4].map((rn, idx) => {
            const active = idx < filledCount;
            const origin = idx === 0;
            return (
              <div key={rn} style={{
                background: active ? (origin ? '#14532d' : '#172554') : '#0e1a33',
                border: `1px solid ${active ? (origin ? '#22c55e' : '#3b82f6') : C.border}`,
                borderRadius: 8, padding: '7px 12px', opacity: active ? 1 : 0.4, transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: 12, color: C.textDim }}>D{rn}{origin ? ' (원본)' : ''}</span>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  =<span style={{ color: FIX }}>B</span><span style={{ color: CHG }}>{rn}</span>
                  +<span style={{ color: FIX }}>C</span><span style={{ color: CHG }}>{rn}</span>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 2, lineHeight: 1.7 }}>
            <span style={{ color: FIX }}>초록 = 고정</span> · <span style={{ color: CHG }}>노랑 = 증가</span>
          </div>
        </div>

        <FillCursor cursor={cursor} />
      </div>

      <WhyBox
        title="아래로 자동 채우기를 할 때 D2 수식을 아래로 드래그하면 왜 B·C 열은 고정이고, 행 번호만 커질까?"
        lines={[
          <>아래로 복사하면 <b style={{ color: FIX }}>세로줄(열)은 변하지 않습니다.</b></>,
          <>그래서 <b style={{ color: FIX }}>B·C 열은 그대로 고정</b>돼요.</>,
          <>대신 아래로 내려가며 가로줄(행)이 바뀌므로 <b style={{ color: CHG }}>행 번호만 2 → 3 → 4 로 증가</b>합니다.</>,
        ]}
      />
    </Wrap>
  );
}

/* ─────────────────────────── 오른쪽으로 자동 채우기 ─────────────────────────── */
export function RelativeFillRightAnim() {
  const step = useFillStep();
  const filledCount = Math.min(step, 2) + 1;
  const { containerRef, setCellRef, cursor } = useFillCursor(step);

  // 3행(상반기)·4행(하반기)을 열 B·C·D 에 두고, B5=B3+B4 를 오른쪽으로 채움
  const cols = ['B', 'C', 'D'];
  const row3 = [10, 20, 30]; // 상반기 (3행)
  const row4 = [40, 50, 60]; // 하반기 (4행)
  const results = cols.map((col, i) => ({ col, sum: row3[i] + row4[i] })); // 50, 70, 90

  return (
    <Wrap>
      <Title>상대 참조 — 오른쪽으로 자동 채우기</Title>
      <Subtitle>B5 수식을 오른쪽으로 끌면 열 문자만 B → C → D 로 따라 이동합니다</Subtitle>

      <div ref={containerRef} style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 한 표 안에서 5행(합계)을 오른쪽으로 자동 채우기 */}
        <div style={{ ...gridBase, gridTemplateColumns: '40px 84px 92px 92px 92px' }}>
          {/* 열 문자 행 */}
          <HeadCell />
          <HeadCell>A</HeadCell>
          <HeadCell>B</HeadCell>
          <HeadCell>C</HeadCell>
          <HeadCell>D</HeadCell>
          {/* 3행 상반기 */}
          <HeadCell accent>3</HeadCell>
          <TitleCell>상반기</TitleCell>
          {row3.map((v, i) => <DataCell key={i} dim>{v}</DataCell>)}
          {/* 4행 하반기 */}
          <HeadCell accent>4</HeadCell>
          <TitleCell>하반기</TitleCell>
          {row4.map((v, i) => <DataCell key={i} dim>{v}</DataCell>)}
          {/* 5행 합계 — 오른쪽으로 채워짐 */}
          <HeadCell>5</HeadCell>
          <TitleCell accent>합계</TitleCell>
          {results.map((r, idx) => {
            const filled = idx < filledCount;
            const justFilled = idx === Math.min(step, 2) && step <= 2;
            const origin = idx === 0;
            return (
              <ResultCell
                key={idx}
                innerRef={setCellRef(idx)}
                filled={filled}
                justFilled={justFilled && !origin}
                isOrigin={origin}
                value={r.sum}
                formulaNodes={
                  <Formula size={13} parts={[
                    { t: '=' },
                    { t: r.col, c: CHG, b: true }, { t: '3', c: FIX },
                    { t: '+' },
                    { t: r.col, c: CHG, b: true }, { t: '4', c: FIX },
                  ]} />
                }
              />
            );
          })}
        </div>

        {/* 오른쪽 수식 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
          {cols.map((col, idx) => {
            const active = idx < filledCount;
            const origin = idx === 0;
            return (
              <div key={col} style={{
                background: active ? (origin ? '#14532d' : '#172554') : '#0e1a33',
                border: `1px solid ${active ? (origin ? '#22c55e' : '#3b82f6') : C.border}`,
                borderRadius: 8, padding: '7px 12px', opacity: active ? 1 : 0.4, transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: 12, color: C.textDim }}>{col}5{origin ? ' (원본)' : ''}</span>
                <div style={{ fontSize: 17, fontWeight: 700 }}>
                  =<span style={{ color: CHG }}>{col}</span><span style={{ color: FIX }}>3</span>
                  +<span style={{ color: CHG }}>{col}</span><span style={{ color: FIX }}>4</span>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 2, lineHeight: 1.7 }}>
            <span style={{ color: FIX }}>초록 = 고정(행)</span> · <span style={{ color: CHG }}>노랑 = 이동(열)</span>
          </div>
        </div>

        <FillCursor cursor={cursor} />
      </div>

      <WhyBox
        title="오른쪽으로 자동 채우기를 할 때 B5 수식을 오른쪽으로 드래그하면 왜 3·4행은 고정이고, 열 문자만 바뀔까?"
        lines={[
          <>오른쪽으로 복사하면 <b style={{ color: FIX }}>가로줄(행)은 변하지 않습니다.</b></>,
          <>그래서 <b style={{ color: FIX }}>3행·4행은 그대로 고정</b>돼요.</>,
          <>대신 오른쪽으로 가며 세로줄(열)이 바뀌므로 <b style={{ color: CHG }}>열 문자만 B → C → D 로 이동</b>합니다.</>,
        ]}
      />
    </Wrap>
  );
}

/* ─────────────────────────── 절대 참조 아래로 채우기 ─────────────────────────── */
export function AbsoluteFillDownAnim() {
  const step = useFillStep();
  const filledCount = Math.min(step, 2) + 1;
  const { containerRef, setCellRef, cursor } = useFillCursor(step);

  const rows = [
    { rn: 2, name: '김철수', b: 80, c: 70, sum: 76 },
    { rn: 3, name: '이영희', b: 90, c: 60, sum: 78 },
    { rn: 4, name: '박민준', b: 70, c: 95, sum: 80 },
  ];

  return (
    <Wrap>
      <Title>절대 참조 — 아래로 채워도 $ 셀은 고정</Title>
      <Subtitle>{'$B$5·$C$5(비율)는 항상 5행을 참조 · B·C의 행 번호만 2 → 3 → 4 로 변합니다'}</Subtitle>

      <div ref={containerRef} style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ ...gridBase, gridTemplateColumns: '34px 84px 60px 60px 176px' }}>
          <HeadCell />
          <HeadCell>A 이름</HeadCell>
          <HeadCell>B 실기</HeadCell>
          <HeadCell>C 봉사</HeadCell>
          <HeadCell accent>D 점수</HeadCell>
          {rows.map((r, idx) => {
            const filled = idx < filledCount;
            const justFilled = idx === Math.min(step, 2) && step <= 2;
            const isOrigin = idx === 0;
            return [
              <HeadCell key={`rn${r.rn}`}>{r.rn}</HeadCell>,
              <DataCell key={`n${r.rn}`}>{r.name}</DataCell>,
              <DataCell key={`b${r.rn}`} dim>{r.b}</DataCell>,
              <DataCell key={`c${r.rn}`} dim>{r.c}</DataCell>,
              <ResultCell
                key={`d${r.rn}`}
                innerRef={setCellRef(idx)}
                filled={filled}
                justFilled={justFilled && !isOrigin}
                isOrigin={isOrigin}
                value={r.sum}
                formulaNodes={
                  <Formula size={12} parts={[
                    { t: '=' }, { t: 'B', c: FIX }, { t: r.rn, c: CHG, b: true },
                    { t: '*' }, { t: '$B$5', c: FIX, b: true },
                    { t: '+' }, { t: 'C', c: FIX }, { t: r.rn, c: CHG, b: true },
                    { t: '*' }, { t: '$C$5', c: FIX, b: true },
                  ]} />
                }
              />,
            ];
          })}
          {/* 비율(고정) 행 — 자동 채우기 내내 값·색이 변하지 않는 고정 기준 셀 */}
          <HeadCell>5</HeadCell>
          <DataCell>비율</DataCell>
          <div className="cl-lock-pulse" style={{
            background: '#0b2a17', borderBottom: `1px solid ${C.border}`,
            border: `2px solid ${FIX}`, padding: '9px 4px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: FIX,
          }}>🔒 $B$5<br /><span style={{ fontSize: 13 }}>0.6</span></div>
          <div className="cl-lock-pulse" style={{
            background: '#0b2a17', borderBottom: `1px solid ${C.border}`,
            border: `2px solid ${FIX}`, padding: '9px 4px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: FIX,
          }}>🔒 $C$5<br /><span style={{ fontSize: 13 }}>0.4</span></div>
          <DataCell dim>고정 기준값</DataCell>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 210 }}>
          {rows.map((r, idx) => {
            const active = idx < filledCount;
            const origin = idx === 0;
            return (
              <div key={r.rn} style={{
                background: active ? (origin ? '#14532d' : '#172554') : '#0e1a33',
                border: `1px solid ${active ? (origin ? '#22c55e' : '#3b82f6') : C.border}`,
                borderRadius: 8, padding: '7px 12px', opacity: active ? 1 : 0.4, transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: 12, color: C.textDim }}>D{r.rn}{origin ? ' (원본)' : ''}</span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  =B<span style={{ color: CHG }}>{r.rn}</span>*<span style={{ color: FIX }}>$B$5</span>
                  +C<span style={{ color: CHG }}>{r.rn}</span>*<span style={{ color: FIX }}>$C$5</span>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 13, textAlign: 'center', marginTop: 2, lineHeight: 1.7 }}>
            <span style={{ color: FIX }}>초록 = 고정($·열)</span> ·{' '}
            <span style={{ color: CHG }}>노랑 = 증가(행 번호)</span>
          </div>
        </div>

        <FillCursor cursor={cursor} />
      </div>

      <WhyBox
        title="🔒 표시된 비율 셀($B$5·$C$5)을 보세요 — 끝까지 그대로입니다"
        lines={[
          <>D 열은 <b style={{ color: '#3b82f6' }}>2 → 3 → 4</b> 로 한 칸씩 채워지지만,</>,
          <><b style={{ color: FIX }}>🔒 비율 셀(0.6·0.4)은 위치도 값도 색도 전혀 바뀌지 않습니다.</b></>,
          <>$로 고정했기 때문에, 모든 행이 <b style={{ color: FIX }}>항상 같은 $B$5·$C$5</b>를 곱해 계산합니다.</>,
        ]}
      />
    </Wrap>
  );
}
