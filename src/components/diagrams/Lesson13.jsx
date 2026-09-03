// 13차시 — 부분합 다이어그램/애니메이션.
// 핵심: 부분합은 '정렬 먼저' 하고, 대화상자에서 딱 세 가지(그룹화할 항목·사용할 함수·
//       부분합 계산 항목)만 채우면 그룹마다 요약 행이 자동으로 삽입된다.
// · SubtotalFlowAnim   (개념1): 원본 → 정렬 → [부분합] → 3요소 → 요약 행 삽입 5단계
// · SubtotalDialogDiagram(개념1): 부분합 대화상자를 본떠 3요소 + '새로운 값으로 대치' 설명
// · SubtotalExamProblem (개념2): '사원 역량평가 결과' 문제를 힌트로 3요소 채우고 2번 실행
// 대화상자 모양은 lesson-13.png 를 그대로 본떴다.
import { useState } from 'react';
import { Wrap, Title, Subtitle, C, ProblemBox, TableCaption } from './shared.jsx';

/* ─────────────── 부분합 대화상자 (lesson-13.png 재현) ─────────────── */
function Field({ label, value, hi }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1px solid ${hi ? C.blueDim : C.border}`, borderRadius: 4,
        background: hi ? '#0e1a33' : '#0b1220', padding: '6px 9px',
        boxShadow: hi ? '0 0 0 2px rgba(59,130,246,0.35)' : 'none',
      }}>
        <span style={{ fontSize: 13, color: value ? C.text : C.textDim, fontWeight: hi ? 700 : 400 }}>{value || ' '}</span>
        <span style={{ fontSize: 9, color: C.textDim }}>▼</span>
      </div>
    </div>
  );
}

function CalcItems({ items, checked = [], hi }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>부분합 계산 항목(D):</div>
      <div style={{
        border: `1px solid ${hi ? C.blueDim : C.border}`, borderRadius: 4, background: '#0b1220',
        overflow: 'hidden', boxShadow: hi ? '0 0 0 2px rgba(59,130,246,0.35)' : 'none',
      }}>
        {items.map((it) => {
          const on = checked.includes(it);
          return (
            <div key={it} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 9px',
              background: on ? C.blueDim : 'transparent', color: on ? '#fff' : C.textMuted,
              fontWeight: on ? 700 : 400, fontSize: 12.5,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                border: `1px solid ${on ? '#fff' : C.textDim}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', fontWeight: 800,
              }}>{on ? '✓' : ''}</span>
              {it}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckOpt({ label, on, hi }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', borderRadius: 5, marginBottom: 2,
      border: `1px solid ${hi ? C.blueDim : 'transparent'}`,
      background: hi ? 'rgba(59,130,246,0.12)' : 'transparent',
      boxShadow: hi ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none',
    }}>
      <span style={{
        width: 15, height: 15, borderRadius: 3, flexShrink: 0,
        border: `1px solid ${on ? C.blueDim : C.textDim}`, background: on ? C.blueDim : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800,
      }}>{on ? '✓' : ''}</span>
      <span style={{ fontSize: 12.5, color: hi ? '#fff' : C.text, fontWeight: hi ? 700 : 400 }}>{label}</span>
    </div>
  );
}

// groupBy / func / items(체크리스트) / checked / replace(새로운 값으로 대치) / hi(강조 플래그)
function SubtotalDialog({ groupBy = '', func = '합계', items, checked = [], replace = true, hi = {}, caption }) {
  const btnGhost = { color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' };
  const btnPrimary = { background: C.blueDim, color: '#fff', border: `1px solid ${C.blueDim}`, borderRadius: 6, padding: '5px 16px', fontSize: 12.5, fontWeight: 700, boxShadow: '0 0 0 2px rgba(59,130,246,0.4)' };
  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      {caption && <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: caption.color || C.blueLight, marginBottom: 6 }}>{caption.text}</div>}
      <div style={{ background: '#0b1220', border: `1px solid ${C.blueDim}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,0.55)' }}>
        <div style={{ background: C.blueBg, borderBottom: `1px solid ${C.blueDim}`, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.blueLight }}>부분합</span>
          <span style={{ fontSize: 12, color: C.textDim }}>?&nbsp;&nbsp;✕</span>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <Field label="그룹화할 항목(A):" value={groupBy} hi={hi.group} />
          <Field label="사용할 함수(U):" value={func} hi={hi.func} />
          <CalcItems items={items} checked={checked} hi={hi.items} />
          <CheckOpt label="새로운 값으로 대치(C)" on={replace} hi={hi.replace} />
          <CheckOpt label="그룹 사이에서 페이지 나누기(P)" on={false} />
          <CheckOpt label="데이터 아래에 요약 표시(S)" on={true} hi={hi.summary} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 12 }}>
            <span style={btnGhost}>모두 제거(R)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={btnPrimary}>확인</span>
              <span style={btnGhost}>취소</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── 공통 UI ─────────────── */
function StepChip({ n, label, active, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: active ? C.blueDim : C.bgDark,
      border: `1px solid ${active ? C.blueDim : C.border}`,
      color: active ? '#fff' : done ? C.green : C.textMuted,
      borderRadius: 999, padding: '7px 13px', fontSize: 13, fontWeight: 700,
      transition: 'all .25s', whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit',
      boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none',
    }}>
      <span>{done ? '✓' : n}</span><span>{label}</span>
    </button>
  );
}

/* ─────────────── 개념1 — 정렬 → 부분합 흐름 애니메이션 ─────────────── */
// 실습 파일과 같은 '급여대장' 형식의 표(가상의 '한빛물산 급여대장'). 내용은 새로 구성했다.
// 부서명별로 '기본급'·'총급여'의 합계를 구하는 전형적인 부분합 문제.
const PAY_HEAD = ['부서명', '사원명', '직위', '기본급', '상여금', '세금', '총급여'];
const NUM_COLS = [3, 4, 5, 6];              // 우측 정렬할 숫자 열
const CALC_COLS = [3, 6];                    // 부분합 계산 항목: 기본급·총급여
// 시험지 원본 순서 — 부서명이 뒤섞여 있고, 같은 부서가 표 여기저기에 흩어져 있다.
const PAY_RAW = [
  ['총무부', '김서준', '부장', 4500000, 1800000, 990000, 5310000],
  ['총무부', '이하늘', '사원', 3200000, 1280000, 704000, 3776000],
  ['기획부', '박도윤', '과장', 4000000, 1600000, 880000, 4720000],
  ['전산부', '최민서', '대리', 3600000, 1440000, 792000, 4248000],
  ['전산부', '정예은', '사원', 3100000, 1240000, 682000, 3658000],
  ['총무부', '강지후', '대리', 3700000, 1480000, 814000, 4366000],
  ['기획부', '윤서아', '부장', 4600000, 1840000, 1012000, 5428000],
  ['기획부', '임재윤', '사원', 3300000, 1320000, 726000, 3894000],
  ['전산부', '한지우', '과장', 4100000, 1640000, 902000, 4838000],
];
// 부서명 오름차순 정렬(기획부 → 전산부 → 총무부). 그룹 안 순서는 원본 유지(안정 정렬)
const DEPT_ORDER = ['기획부', '전산부', '총무부'];
const PAY_SORTED = [...PAY_RAW].sort((a, b) => DEPT_ORDER.indexOf(a[0]) - DEPT_ORDER.indexOf(b[0]));

const won = (n) => (typeof n === 'number' ? n.toLocaleString('ko-KR') : n);

// 연속으로 같은 부서인 묶음마다 '요약' 행을 끼우고 맨 아래 '총합계'를 붙인다.
//  · rows 가 정렬돼 있으면 부서별로 한 번씩 → 올바른 결과
//  · rows 가 정렬 안 돼 있으면 같은 부서가 여러 묶음으로 쪼개져 → 요약이 중복(잘못된 결과)
function buildSubtotal(rows, broken) {
  const out = [];
  const seen = {};
  for (let i = 0; i < rows.length;) {
    const dept = rows[i][0];
    let j = i, base = 0, tot = 0;
    while (j < rows.length && rows[j][0] === dept) {
      out.push({ v: rows[j] });
      base += rows[j][3]; tot += rows[j][6];
      j++;
    }
    seen[dept] = (seen[dept] || 0) + 1;
    // broken 모드에서 같은 부서 요약이 두 번째 이상 나오면 '중복'으로 표시
    out.push({ v: [`${dept} 요약`, '', '', base, '', '', tot], sum: true, broken, dup: broken && seen[dept] > 1 });
    i = j;
  }
  const gBase = rows.reduce((s, r) => s + r[3], 0);
  const gTot = rows.reduce((s, r) => s + r[6], 0);
  out.push({ v: ['총합계', '', '', gBase, '', '', gTot], total: true });
  return out;
}
const PAY_RESULT = buildSubtotal(PAY_SORTED, false);   // 정렬 후 → 올바른 결과
const PAY_BROKEN = buildSubtotal(PAY_RAW, true);        // 정렬 전 → 요약이 중복되는 잘못된 결과

const PAY_GRID = '62px 56px 42px 78px 78px 64px 82px';

// 표의 각 행 높이(마커 gutter를 표 행과 정확히 맞추기 위한 값)
const ROW_MIN = 27, ROW_PAD_Y = 3, ROW_BORDER = 1; // minHeight + 상하 패딩(3+3) + 아래 테두리

function FlowTable({ rows, hiGroup = false, hiCalc = false, markers = false, width = 462 }) {
  const cell = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: ROW_MIN, fontSize: 11.5, padding: `${ROW_PAD_Y}px 6px`, whiteSpace: 'nowrap',
  };
  const table = (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', width }}>
      <div style={{ display: 'grid', gridTemplateColumns: PAY_GRID }}>
        {PAY_HEAD.map((h, i) => (
          <div key={h} style={{
            ...cell, background: '#0b1220', fontWeight: 700,
            color: (i === 0 && hiGroup) ? C.greenLight : C.blueLight,
            borderRight: i === PAY_HEAD.length - 1 ? 'none' : `1px solid ${C.border}`,
          }}>{h}</div>
        ))}
      </div>
      {rows.map((r, ri) => {
        const isSum = r.sum, isTotal = r.total, isBroken = r.broken;
        const sumColor = isBroken ? C.redLight : C.greenLight;
        const newGroup = hiGroup && !isSum && !isTotal && (ri === 0 || rows[ri - 1].v[0] !== r.v[0]);
        return (
          <div key={ri} style={{
            display: 'grid', gridTemplateColumns: PAY_GRID,
            background: isTotal ? '#111c33' : isSum ? (isBroken ? C.redDark : C.greenDark) : 'transparent',
          }}>
            {r.v.map((val, ci) => {
              const isCalc = CALC_COLS.includes(ci);
              return (
                <div key={ci} style={{
                  ...cell,
                  borderRight: ci === r.v.length - 1 ? 'none' : `1px solid ${C.border}`,
                  borderBottom: ri === rows.length - 1 ? 'none' : `1px solid ${C.border}`,
                  borderTop: newGroup ? `2px solid ${C.green}` : undefined,
                  justifyContent: NUM_COLS.includes(ci) ? 'flex-end' : 'center',
                  background: (hiCalc && isCalc && !isSum && !isTotal) ? 'rgba(96,165,250,0.12)' : undefined,
                  color: (isSum) ? sumColor : isTotal ? C.greenLight
                    : (ci === 0 && hiGroup) ? C.greenLight
                      : (hiCalc && isCalc) ? C.blueLight : C.text,
                  fontWeight: (isSum || isTotal || (ci === 0 && hiGroup) || (hiCalc && isCalc)) ? 700 : 400,
                }}>{won(val)}</div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  if (!markers) return table;

  // 표 오른쪽 바깥에 행과 높이를 맞춘 마커 열(gutter). 셀 값을 가리지 않는다.
  const rowBox = { minHeight: ROW_MIN, padding: `${ROW_PAD_Y}px 0`, borderBottom: `${ROW_BORDER}px solid transparent`, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {table}
      <div style={{ marginLeft: 8, paddingTop: 1 }}>
        {/* 머리글 높이만큼 빈 칸 */}
        <div style={{ ...rowBox }} />
        {rows.map((r, ri) => (
          <div key={ri} style={{ ...rowBox, borderBottom: `${ROW_BORDER}px solid transparent` }}>
            {r.dup && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: C.redLight, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                <span style={{ color: C.red }}>◀</span> 또 생김 ❌
              </span>
            )}
            {isFirstSummary(r) && (
              <span style={{ color: C.greenLight, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>◀ 부서 요약 ✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 올바른(정렬 후) 결과의 요약 행인지 — 초록 ✓ 마커용
function isFirstSummary(r) {
  return !!r.sum && !r.broken;
}

function SubtotalRibbon({ onClick }) {
  return (
    <div style={{ display: 'inline-block', background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px 4px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onClick} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 16px', borderRadius: 6,
          border: `1px solid ${C.blueDim}`, background: C.blueDim, boxShadow: '0 0 0 3px rgba(59,130,246,0.35)', cursor: onClick ? 'pointer' : 'default',
        }}>
          <span style={{ fontSize: 20, color: '#fff', lineHeight: 1 }}>≣</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>부분합</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['그룹', '그룹 해제', '데이터 통합'].map((t) => (
            <span key={t} style={{ fontSize: 12, color: C.textDim, whiteSpace: 'nowrap' }}>▸ {t}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: C.textDim, marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 3 }}>
        데이터 &gt; 개요
      </div>
    </div>
  );
}

const FLOW_STEPS = [
  { n: '①', label: '원본 데이터', desc: "'부서명'이 총무부 · 기획부 · 전산부 순서 없이 뒤섞여 있습니다. 이대로 부분합하면 같은 부서가 흩어져 부분합이 엉킵니다." },
  { n: '②', label: '부서명 기준 정렬', desc: '⚠️ 부분합보다 먼저! 그룹 열(부서명)로 정렬해 같은 부서끼리 연속으로 모읍니다.' },
  { n: '③', label: '[데이터]→[부분합]', desc: '표 안을 클릭하고 [데이터] 탭 → [개요] 그룹 → [부분합] 을 눌러 대화상자를 엽니다.' },
  { n: '④', label: '3요소 지정 → 확인', desc: "그룹화할 항목=부서명, 사용할 함수=합계, 부분합 계산 항목='기본급'·'총급여'만 체크하고 [확인]. 맨 아래 '데이터 아래에 요약 표시'는 기본으로 켜져 있으니 그대로 둡니다." },
];

export function SubtotalFlowAnim() {
  const [slot, setSlot] = useState(0);
  const [opened, setOpened] = useState(false);     // ③단계에서 [부분합] 클릭 → 대화상자
  const [showBroken, setShowBroken] = useState(false); // ①단계: 정렬 없이 부분합 실행해보기

  const pick = (i) => { setSlot(i); setOpened(false); setShowBroken(false); };

  const tableRows = slot === 0
    ? (showBroken ? PAY_BROKEN : PAY_RAW.map((v) => ({ v })))
    : slot === 3 ? PAY_RESULT : PAY_SORTED.map((v) => ({ v }));
  const PAY_ITEMS = PAY_HEAD;
  const PAY_CHECKED = ['기본급', '총급여'];

  return (
    <Wrap>
      <Title>부분합 진행 순서 — 정렬 먼저, 그다음 부분합</Title>

      <ProblemBox>
        <b>[부분합]</b> 기능을 이용하여 '급여대장' 표에서
        <b style={{ color: C.greenLight }}> 부서명별</b>로
        <b style={{ color: C.blueLight }}> '기본급'</b>과 <b style={{ color: C.blueLight }}>'총급여'</b>의 <b style={{ color: C.amberLight }}>합계</b>를 계산하시오.
      </ProblemBox>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {FLOW_STEPS.map((s, i) => (
          <StepChip key={i} n={s.n} label={s.label} active={i === slot} done={i < slot} onClick={() => pick(i)} />
        ))}
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderLeft: `4px solid ${slot === 1 ? C.amber : C.blueDim}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14.5, color: C.text, lineHeight: 1.7, textAlign: 'center' }}>
        {FLOW_STEPS[slot].desc}
      </div>

      {/* ① 정렬 없이 부분합 실행 후 → 잘못된 결과 vs 올바른 결과 나란히 비교 */}
      {slot === 0 && showBroken ? (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <TableCaption color={C.redLight}>▼ 정렬 없이 부분합 (❌ 잘못됨)</TableCaption>
              <FlowTable rows={PAY_BROKEN} markers />
            </div>
            <div>
              <TableCaption color={C.greenLight}>▼ 부서명 정렬 후 부분합 (✓ 올바름)</TableCaption>
              <FlowTable rows={PAY_RESULT} markers />
            </div>
          </div>
          <div style={{ maxWidth: 260 }}>
            <div style={{ background: C.redDark, border: `1px solid ${C.red}`, borderRadius: 10, padding: '13px 15px' }}>
              <div style={{ color: C.redLight, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>❌ 이래서 정렬이 먼저!</div>
              <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75 }}>
                부분합은 <b>부서명이 바뀌는 순간마다</b> 요약을 넣습니다. 정렬 전에는 같은 부서가 흩어져 있어 <b style={{ color: C.redLight }}>총무부 · 기획부 · 전산부 요약이 두 번씩</b> 쪼개져 만들어집니다. (총무부 요약이 7,700,000 · 3,700,000 으로 분리)
              </div>
            </div>
            <div style={{ background: C.greenDark, border: `1px solid ${C.green}`, borderRadius: 10, padding: '13px 15px', marginTop: 10 }}>
              <div style={{ color: C.greenLight, fontWeight: 800, fontSize: 14.5, marginBottom: 5 }}>✓ 정렬 후에는</div>
              <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75 }}>
                같은 부서가 붙어 있어 요약이 <b>부서마다 한 번씩</b>만 생깁니다. (총무부 기본급 11,400,000 처럼 <b>한 줄로 정확</b>)
              </div>
            </div>
            <button onClick={() => setShowBroken(false)} style={{
              marginTop: 12, width: '100%', background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '8px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>↩ 원본 표로 되돌리기</button>
            <div style={{ marginTop: 10, fontSize: 12.5, color: C.greenLight, textAlign: 'center' }}>👉 ②단계에서 <b>정렬</b>부터 진행해 보세요</div>
          </div>
        </div>
      ) : (
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* 왼쪽: 표 */}
        <div>
          <TableCaption color={slot === 3 ? C.green : slot >= 1 ? C.greenLight : C.textMuted}>
            {slot === 0 ? '▼ 원본 (부서명이 뒤섞임)'
              : slot === 3 ? '▼ 결과 (부서별 부분합 행 삽입됨)' : '▼ 부서명 기준 정렬됨'}
          </TableCaption>
          <FlowTable rows={tableRows} hiGroup={slot >= 1 && slot <= 3} hiCalc={slot === 3} />
        </div>

        {/* 오른쪽: 리본 / 대화상자 / 설명 */}
        <div style={{ minWidth: 220 }}>
          {slot === 0 && (
            <div style={{ background: C.bgDark, border: `1px dashed ${C.border}`, borderRadius: 10, padding: '14px 16px', maxWidth: 280, color: C.textMuted, fontSize: 13.5, lineHeight: 1.75 }}>
              같은 부서(총무부 · 기획부 · 전산부)가 표 <b>여기저기 흩어져</b> 있습니다. 정렬을 건너뛰고 바로 부분합하면 어떻게 될까요?
              <button onClick={() => setShowBroken(true)} style={{
                display: 'block', width: '100%', marginTop: 12,
                background: C.redDark, color: C.redLight, border: `1px solid ${C.red}`,
                borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}>⚠️ 정렬 없이 부분합 실행해보기 ▶</button>
            </div>
          )}
          {slot === 1 && (
            <div style={{ background: C.bgDark, border: `1px dashed ${C.border}`, borderRadius: 10, padding: '14px 16px', maxWidth: 280, color: C.textMuted, fontSize: 13.5, lineHeight: 1.75 }}>
              이제 같은 부서끼리 붙었습니다(<b style={{ color: C.greenLight }}>기획부 → 전산부 → 총무부</b>). 부분합이 부서가 바뀌는 지점을 <b>딱 한 번씩</b> 정확히 찾을 수 있습니다.
            </div>
          )}
          {slot === 2 && (opened ? (
            <SubtotalDialog groupBy="부서명" func="합계" items={PAY_ITEMS} checked={PAY_CHECKED} hi={{ group: true }} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <SubtotalRibbon onClick={() => setOpened(true)} />
              <div style={{ marginTop: 8, fontSize: 12, color: C.blueLight }}>👆 <b>[부분합]</b> 을 눌러 대화상자를 여세요</div>
            </div>
          ))}
          {slot === 3 && (
            <SubtotalDialog groupBy="부서명" func="합계" items={PAY_ITEMS} checked={PAY_CHECKED} hi={{ group: true, func: true, items: true, summary: true }} />
          )}
        </div>
      </div>
      )}
    </Wrap>
  );
}

/* ─────────────── 개념1 — 부분합 대화상자 3요소 다이어그램 ─────────────── */
function ElementCard({ n, color, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: C.bgDark, border: `1px solid ${color}`, borderRadius: 10, padding: '11px 14px' }}>
      <div style={{ flexShrink: 0, color, fontWeight: 800, fontSize: 28, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color }}>{title}</div>
        <div style={{ fontSize: 13.5, color: C.text, marginTop: 3, lineHeight: 1.65 }}>{body}</div>
      </div>
    </div>
  );
}

export function SubtotalDialogDiagram() {
  const green = { color: C.greenLight, bg: C.greenBg };
  const amber = { color: C.amberLight, bg: C.amberBg };
  const blue = { color: C.blueLight, bg: C.blueBg };
  return (
    <Wrap>
      <Title>부분합 문제는 늘 「○○별 · △△의 · □□ 계산」꼴. 세 조각을 대화상자의 세 칸에 매칭하면 끝!</Title>

      <ProblemBox>
        [부분합] 기능을 이용하여 '급여대장' 표에서 <Tag {...green}>부서명별</Tag>로 <Tag {...blue}>'기본급'과 '총급여'</Tag>의 <Tag {...amber}>합계</Tag>를 계산하시오.
      </ProblemBox>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        <SubtotalDialog groupBy="부서명" func="합계" items={PAY_HEAD} checked={['기본급', '총급여']} hi={{ group: true, func: true, items: true }} />

        <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <ElementCard n="①" color={C.green} title="그룹화할 항목 ← '○○별'의 '별'" body={
            <>문제의 <Tag {...green}>부서명별</Tag>에서 <b>'별'</b>을 찾으세요. <b>"학년별 반장 앞으로 모이세요"</b> 하면 학년끼리 모이듯, <b>'별'은 같은 값끼리 묶으라는 신호(그룹)</b>입니다. → 그룹화할 항목 = <b style={{ color: C.greenLight }}>부서명</b></>
          } />
          <ElementCard n="②" color={C.amber} title="사용할 함수 ← 계산 방법" body={
            <>어떻게 계산하라고 했나요? <Tag {...amber}>합계</Tag> · 평균 · 최댓값 · 최솟값 · 개수 중 문제가 시킨 것을 그대로 고릅니다. → 사용할 함수 = <b style={{ color: C.amberLight }}>합계</b></>
          } />
          <ElementCard n="③" color={C.blue} title="부분합 계산 항목 ← '무엇의?'" body={
            <><b>'무엇의' 합계인가?</b> 를 물으면 답이 보입니다. <Tag {...blue}>'기본급'과 '총급여'의</Tag> 합계이므로 그 <b>두 열만 체크</b>. → 계산 항목 = <b style={{ color: C.blueLight }}>기본급 · 총급여</b></>
          } />

          <div style={{ background: C.amberBg, border: `1px solid ${C.amber}`, borderRadius: 10, padding: '11px 14px' }}>
            <div style={{ color: C.amberLight, fontWeight: 800, fontSize: 14.5, marginBottom: 5 }}>⭐ 한 가지 더</div>
            <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.75 }}>
              대화상자 아래쪽 <b>[새로운 값으로 대치]</b> 는 처음 열면 <b>체크되어 있습니다</b>. 부분합을 <b style={{ color: C.amberLight }}>여러 번</b> 할 때 첫 번째는 그대로 두고, <b>두 번째부터는 이 체크를 해제</b>해야 앞에서 만든 부분합이 사라지지 않습니다.
              <div style={{ marginTop: 6 }}>이 옵션이 켜져 있으면 <b>기존 부분합을 지우고 새 것으로 덮어쓰기</b> 때문입니다.</div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.amber}` }}>부분합을 잘못 넣었거나 원래 표로 되돌리려면 <b>[부분합] 대화상자 → [모두 제거]</b> 를 누릅니다. 삽입된 요약 행이 모두 사라지고 <b>원본 데이터만</b> 남습니다.</div>
            </div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

/* ─────────────── 개념2 — 실전 풀이: 힌트로 3요소 채우고 두 번 실행 ─────────────── */
// 문장 조각 강조용 색 배지
function Tag({ children, color, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 5, fontSize: 'inherit', fontWeight: 800, color, background: bg, margin: '0 2px' }}>{children}</span>
  );
}

export function SubtotalExamProblem() {
  return (
    <Wrap>
      {/* 핵심 원리 — 없는 건 앞에서 쓴 것을 그대로 ('heading' 블록과 동일 서식) */}
      <div style={{ margin: '4px 0 12px', lineHeight: 2.15 }}>
        <span style={{
          fontSize: 17, fontWeight: 800, color: '#ffffff',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          padding: '5px 13px', borderRadius: 7,
          WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone',
          boxShadow: '0 2px 10px rgba(79, 70, 229, 0.35)',
        }}>
          부분합의 3요소 중 없는 건 앞에서 쓴 것을 그대로
        </span>
      </div>

      <ProblemBox>
        <b>[부분합]</b> 기능을 이용하여 '사원 역량평가 결과' 표에서
        <Tag color={C.greenLight} bg={C.greenBg}>부서별</Tag>
        <Tag color={C.blueLight} bg={C.blueBg}>'총점'</Tag>의
        <Tag color={C.amberLight} bg={C.amberBg}>최댓값</Tag>을 계산한 후,
        <Tag color={C.blueLight} bg={C.blueBg}>'기획력', '실행력', '협업'</Tag>의
        <Tag color={C.amberLight} bg={C.amberBg}>평균</Tag>을 계산하시오.
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, lineHeight: 1.9 }}>
          <div>• 정렬은 <b style={{ color: C.greenLight }}>'부서'</b>를 기준으로 오름차순으로 처리하시오.</div>
          <div>• 최댓값과 평균을 위에 명시된 순서대로 처리하시오.</div>
          <div>• 부분합에 <b style={{ color: C.blueLight }}>'파랑, 표 스타일 보통 6'</b> 서식을 적용하시오.</div>
          <div>• 개요를 지우시오.</div>
        </div>
      </ProblemBox>

      <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginTop: 14 }}>
        <b>"부서별 '총점'의 최댓값을 계산한 후"</b>에는 그룹화할 항목 · 사용할 함수 · 부분합 계산 항목이 모두 짝지어져 있습니다. 반면 <b>"'기획력', '실행력', '협업'의 평균을 계산"</b>에는 <b style={{ color: C.greenLight }}>그룹화할 항목이 없습니다</b>. 이처럼 문장에 없는 요소는 <b>앞(1차)에서 사용한 것을 그대로</b> 쓰면 됩니다. 즉 2차의 그룹화할 항목도 <b style={{ color: C.greenLight }}>부서</b>입니다.
      </div>

      {/* 3요소를 문제에서 뽑아내는 표 */}
      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: '16px 0 8px' }}>🔎 문제 속 힌트로 3요소 채우기</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          {
            title: '1차 부분합', tint: C.amber,
            phrase: <>부서별 <b style={{ color: C.blueLight }}>'총점'</b>의 <b style={{ color: C.amberLight }}>최댓값</b>을 계산</>,
            rows: [
              ['그룹화할 항목', '부서', C.greenLight, "'부서별'의 '별'"],
              ['사용할 함수', '최댓값', C.amberLight, "'최댓값'을 계산"],
              ['부분합 계산 항목', '총점', C.blueLight, '무엇의 최댓값? → 총점'],
            ],
          },
          {
            title: '2차 부분합', tint: C.blue,
            phrase: <><b style={{ color: C.blueLight }}>'기획력 · 실행력 · 협업'</b>의 <b style={{ color: C.amberLight }}>평균</b>을 계산</>,
            rows: [
              ['그룹화할 항목', '부서 (앞과 동일)', C.greenLight, '문장에 없음 → 앞의 것 그대로'],
              ['사용할 함수', '평균', C.amberLight, "'평균'을 계산"],
              ['부분합 계산 항목', '기획력 · 실행력 · 협업', C.blueLight, '무엇의 평균? → 세 항목'],
            ],
          },
        ].map((card) => (
          <div key={card.title} style={{ background: C.bgDark, border: `1px solid ${card.tint}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: card.tint, marginBottom: 6 }}>{card.title}</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10, lineHeight: 1.6 }}>{card.phrase}</div>
            {card.rows.map((r) => (
              <div key={r[0]} style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: C.textDim, width: 96, flexShrink: 0 }}>{r[0]}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: r[2], flex: 1 }}>
                  {r[1]}
                  <span style={{ display: 'block', fontSize: 11.5, fontWeight: 400, color: C.textDim, marginTop: 1 }}>← {r[3]}</span>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 1차·2차 대화상자 */}
      <TableCaption>▼ 부분합을 두 번 실행 — 2차에서는 '새로운 값으로 대치' 체크 해제</TableCaption>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        <SubtotalDialog
          caption={{ text: '1차 — 부서별 총점의 최댓값', color: C.amberLight }}
          groupBy="부서" func="최댓값" items={['기획력', '실행력', '협업', '총점']} checked={['총점']}
          replace={true} hi={{ group: true, func: true, items: true }}
        />
        <SubtotalDialog
          caption={{ text: '2차 — 세 항목의 평균 (대치 해제!)', color: C.blueLight }}
          groupBy="부서" func="평균" items={['기획력', '실행력', '협업', '총점']} checked={['기획력', '실행력', '협업']}
          replace={false} hi={{ func: true, items: true, replace: true }}
        />
      </div>

      {/* 부분합과 함께 자주 출제되는 마무리 작업 — 개요 지우기 · 표 서식 (위 '사원 역량평가 결과' 문제 기준) */}
      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: '22px 0 8px' }}>
        ➕ 부분합과 함께 나오는 마무리 작업 2가지
        <span style={{ fontWeight: 400, fontSize: 12.5, color: C.textDim }}> — 위 '사원 역량평가 결과' 문제의 두 조건</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* 개요 지우기 */}
        <div style={{ background: C.bgDark, border: `1px solid ${C.orange}`, borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.orangeLight, marginBottom: 6 }}>① 개요 지우기</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10, lineHeight: 1.65 }}>
            <b>문제</b> — 개요를 지우시오.
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>
            <b style={{ color: C.orangeLight }}>경로</b> — [데이터] 탭 → [개요] 그룹 → <b>[그룹 해제 ▾] → [개요 지우기]</b>
            <div style={{ marginTop: 6, color: C.textMuted }}>✔ <b>요약(부분합) 행은 그대로</b> 남고 왼쪽 윤곽 기호만 사라집니다.</div>
          </div>
        </div>
        {/* 표 서식 */}
        <div style={{ background: C.bgDark, border: `1px solid ${C.blueDim}`, borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.blueLight, marginBottom: 6 }}>② 표 서식(표 스타일) 지정</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10, lineHeight: 1.65 }}>
            <b>문제</b> — 부분합에 <Tag color={C.blueLight} bg={C.blueBg}>'파랑, 표 스타일 보통 6'</Tag> 서식을 적용하시오.
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>
            <b style={{ color: C.blueLight }}>경로</b> — 범위 선택 → [홈] 탭 → [스타일] 그룹 → <b>[표 서식]</b> → 스타일 클릭
            <div style={{ marginTop: 6, color: C.textMuted }}>✔ 첫 행(부서 · 사원명…)이 <b>머리글</b>이 되도록 대화상자에서 <b>'머리글 포함'</b> 체크를 확인합니다.</div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}
