// 10차시 — 필터(자동 필터 / 고급 필터) 학습용 다이어그램·애니메이션.
// 외부 라이브러리 없이 인라인 스타일 + flexbox/grid + setInterval 로 구동한다.
import { useEffect, useState, Fragment } from 'react';
import { Wrap, Title, Subtitle, C } from './shared.jsx';

const FONT = "'Noto Sans KR', sans-serif";

/* 공통: 굵은 강조 조각 */
function K({ children, color }) {
  return <b style={{ color: color || C.blueLight }}>{children}</b>;
}

/* 밝은 대화상자 안의 드롭다운(콤보) 상자 모형 */
function ComboBox({ children, w = 130, strong }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
      width: w, background: '#fff', border: '1px solid #94a3b8', borderRadius: 3,
      padding: '5px 6px 5px 9px', fontSize: 13, fontFamily: FONT,
      color: '#0f172a', fontWeight: strong ? 700 : 400,
    }}>
      <span>{children}</span>
      <span style={{
        marginLeft: 6, background: '#e2e8f0', borderLeft: '1px solid #94a3b8',
        alignSelf: 'stretch', display: 'inline-flex', alignItems: 'center',
        padding: '0 5px', fontSize: 9, color: '#334155',
      }}>▾</span>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
   1. 자동 필터 애니메이션 (/anim/auto-filter)
   ▼ 클릭 → [숫자 필터] → [사용자 지정 필터…] → 대화상자에서 조건 입력
   → 조건에 맞는 행만 남는 과정을 반복 재생. (값 체크 방식은 다루지 않음)
   ─────────────────────────────────────────────────────────── */
const AF_ROWS = [
  { name: '김철수', dept: '영업부', rank: '대리', region: '서울', sales: 120 },
  { name: '이영희', dept: '총무부', rank: '과장', region: '부산', sales: 90 },
  { name: '박민준', dept: '영업부', rank: '대리', region: '인천', sales: 150 },
  { name: '최수지', dept: '인사부', rank: '대리', region: '대구', sales: 95 },
  { name: '정하늘', dept: '영업부', rank: '과장', region: '서울', sales: 110 },
];

function useStep(count, interval) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);
  return step;
}

const afGrid = { display: 'grid', gridTemplateColumns: '70px 66px 52px 52px 58px' };

function AfHeadCell({ children, arrow, open, funnel }) {
  const active = open || funnel;
  return (
    <div style={{
      background: '#0b1220',
      border: `1px solid ${C.border}`, padding: '9px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: 14, fontWeight: 700, color: C.textMuted, gap: 6,
    }}>
      <span>{children}</span>
      {arrow && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 18, height: 18, borderRadius: 3,
          background: active ? C.blueDim : '#1e293b',
          border: `1px solid ${active ? C.blueDim : C.border}`,
        }}>
          {funnel ? (
            <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden="true">
              <polygon points="1,1.5 9,1.5 6,4.8 6,8.5 4,8.5 4,4.8" fill="#fff" />
            </svg>
          ) : (
            <span style={{ fontSize: 11, color: active ? '#fff' : C.textMuted }}>▼</span>
          )}
        </span>
      )}
    </div>
  );
}

function AfCell({ children, dim, hidden }) {
  return (
    <div style={{
      background: C.bgDark, border: `1px solid ${C.border}`,
      padding: '9px 8px', textAlign: 'center', fontSize: 14,
      color: dim ? C.textMuted : C.text,
      opacity: hidden ? 0.15 : 1,
      transition: 'opacity 0.4s',
    }}>{children}</div>
  );
}

// 사용자 지정 자동 필터(단일 조건) 대화상자 모형 — 열마다 하나씩 띄운다.
function AfCustomDialog({ field, op, val, visible, left }) {
  return (
    <div style={{
      position: 'absolute', left, top: 34, width: 250, zIndex: 30,
      background: '#f1f5f9', border: '1px solid #64748b', borderRadius: 8,
      boxShadow: '0 12px 32px rgba(0,0,0,0.55)', overflow: 'hidden',
      opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.94)',
      transition: 'opacity 0.3s, transform 0.3s', pointerEvents: 'none', transformOrigin: 'center top',
    }}>
      <div style={{
        background: 'linear-gradient(#3b82f6,#2563eb)', color: '#fff',
        padding: '7px 12px', fontSize: 13, fontWeight: 700,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>사용자 지정 자동 필터</span><span>✕</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 12, color: '#334155', marginBottom: 6 }}>다음 기준에 맞는 행 표시:</div>
        <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, marginBottom: 8 }}>{field}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ComboBox w={120} strong>{op}</ComboBox>
          <ComboBox w={84} strong>{val}</ComboBox>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ background: '#2563eb', color: '#fff', borderRadius: 4, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>확인</span>
          <span style={{ background: '#e2e8f0', color: '#334155', border: '1px solid #94a3b8', borderRadius: 4, padding: '4px 14px', fontSize: 12 }}>취소</span>
        </div>
      </div>
    </div>
  );
}

export function AutoFilterAnim() {
  // 서로 다른 두 열(직급·실적)에 각각 조건을 걸어 AND로 좁히는 과정.
  // 0: 직급 ▼ 준비  1: 직급 사용자 지정(=대리)  2: 직급 필터 적용
  // 3: 실적 사용자 지정(>=120)  4: 두 열 모두 적용(AND)
  const step = useStep(5, 1900);
  const rankMenu = step === 0 || step === 1;   // 직급 열이 대상
  const rankDlg = step === 1;
  const rankApplied = step >= 2;                // 직급 필터가 적용된 상태
  const salesDlg = step === 3;
  const bothApplied = step === 4;
  const captions = [
    '① 첫 번째 조건 — 직급 열 ▼ → [사용자 지정 필터]',
    '② 직급 = 대리 입력 후 [확인] (텍스트는 따옴표 없이)',
    '③ 직급이 대리인 행만 남습니다',
    '④ 두 번째 조건 — 다른 열(실적) ▼ → 실적 >= 120',
    '⑤ 두 열 조건을 모두 만족(AND) — 대리 이면서 실적 120 이상',
  ];

  return (
    <Wrap>
      <Title>자동 필터 — 서로 다른 두 열에 조건 걸기</Title>
      <Subtitle>한 열을 거른 뒤 다른 열을 또 거르면 두 조건이 그리고(AND)로 묶입니다</Subtitle>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', isolation: 'isolate' }}>
        <div style={{
          position: 'relative', minHeight: 252, width: 298,
          transform: (step === 0 || step === 4) ? 'translateX(0)' : 'translateX(-150px)',
          transition: 'transform 1.2s ease-in-out',
        }}>
          <div style={{ ...afGrid, borderRadius: 8, overflow: 'visible', width: 298 }}>
            <AfHeadCell arrow>이름</AfHeadCell>
            <AfHeadCell arrow>부서</AfHeadCell>
            <AfHeadCell arrow open={rankMenu} funnel={rankApplied}>직급</AfHeadCell>
            <AfHeadCell arrow>지역</AfHeadCell>
            <AfHeadCell arrow open={salesDlg} funnel={bothApplied}>실적</AfHeadCell>
            {AF_ROWS.map((r, i) => {
              const hidden = (rankApplied && r.rank !== '대리') || (bothApplied && r.sales < 120);
              return [
                <AfCell key={`n${i}`} hidden={hidden}>{r.name}</AfCell>,
                <AfCell key={`d${i}`} hidden={hidden} dim>{r.dept}</AfCell>,
                <AfCell key={`r${i}`} hidden={hidden}>{r.rank}</AfCell>,
                <AfCell key={`g${i}`} hidden={hidden} dim>{r.region}</AfCell>,
                <AfCell key={`s${i}`} hidden={hidden}>{r.sales}</AfCell>,
              ];
            })}
          </div>

          <AfCustomDialog field="직급" op="=" val="대리" visible={rankDlg} left={314} />
          <AfCustomDialog field="실적" op=">=" val="120" visible={salesDlg} left={326} />
        </div>
      </div>

      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '11px 16px', marginTop: 16,
        textAlign: 'center', fontSize: 15, color: C.text, lineHeight: 1.6, minHeight: 24,
      }}>
        {captions[step]}
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   2. AND/OR 조건 배치 (/diagram/filter-andor)
   같은 행 = AND, 다른 행 = OR 인 이유를 나란히 비교.
   ─────────────────────────────────────────────────────────── */
function CondTable({ headers, rows, highlight }) {
  const cols = headers.length;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
      border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden', minWidth: cols * 96,
    }}>
      {headers.map((h, i) => (
        <div key={`h${i}`} style={{
          background: '#0b1220', borderRight: i < cols - 1 ? `1px solid ${C.border}` : 'none',
          borderBottom: `1px solid ${C.border}`, padding: '8px 6px', textAlign: 'center',
          fontSize: 14, fontWeight: 700, color: C.textMuted,
        }}>{h}</div>
      ))}
      {rows.map((row, r) =>
        row.map((cell, cIdx) => (
          <div key={`c${r}-${cIdx}`} style={{
            background: highlight === 'row' ? '#1a2f1a'
              : highlight === 'col' ? '#2a1f0a'
              : highlight === 'cell' ? (cell ? '#2a1f0a' : C.bgDark)
              : C.bgDark,
            borderRight: cIdx < cols - 1 ? `1px solid ${C.border}` : 'none',
            borderBottom: r < rows.length - 1 ? `1px solid ${C.border}` : 'none',
            padding: '9px 6px', textAlign: 'center', fontSize: 15, fontWeight: 600,
            color: cell ? C.text : C.textDim,
          }}>{cell || ''}</div>
        ))
      )}
    </div>
  );
}

export function AndOrConditionDiagram() {
  return (
    <Wrap>
      <Title>AND는 같은 행 · OR는 다른 행</Title>
      <Subtitle>조건을 어디에 쓰느냐로 '모두 만족'과 '하나만 만족'이 갈립니다</Subtitle>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* AND */}
        <div style={{
          flex: '1 1 300px', background: '#0d1f14', border: `2px solid ${C.green}`,
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.greenLight, marginBottom: 4, textAlign: 'center' }}>
            AND (그리고) — 같은 행
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', marginBottom: 6 }}>
            "영업부 <b style={{ color: C.greenLight }}>이면서</b> 실적 100 이상"
          </div>
          <div style={{ fontSize: 13, color: C.greenLight, textAlign: 'center', marginBottom: 12 }}>
            신호어: <b>이면서 · 이고 · 쉼표(,)</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CondTable headers={['부서', '실적']} rows={[['영업부', '>=100']]} highlight="row" />
          </div>
          <div style={{ fontSize: 15, color: C.text, marginTop: 12, lineHeight: 1.7, textAlign: 'center' }}>
            두 조건이 <K color={C.greenLight}>같은 행</K>에 있다면, <b>두 조건이 모두 참</b>인지 확인합니다.
          </div>
        </div>

        {/* OR */}
        <div style={{
          flex: '1 1 300px', background: '#1f180a', border: `2px solid ${C.amber}`,
          borderRadius: 12, padding: 16,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.amberLight, marginBottom: 4, textAlign: 'center' }}>
            OR (또는) — 다른 행
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', marginBottom: 6 }}>
            "부서가 영업부<b style={{ color: C.amberLight }}>이거나</b> 실적이 150 이상"
          </div>
          <div style={{ fontSize: 13, color: C.amberLight, textAlign: 'center', marginBottom: 12 }}>
            신호어: <b>이거나</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CondTable headers={['부서', '실적']} rows={[['영업부', ''], ['', '>=150']]} highlight="cell" />
          </div>
          <div style={{ fontSize: 15, color: C.text, marginTop: 12, lineHeight: 1.7, textAlign: 'center' }}>
            조건이 <K color={C.amberLight}>다른 행</K>에 있다면, <b>한 줄이라도 참</b>이면 통과합니다.
          </div>
        </div>
      </div>

      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '11px 16px', marginTop: 16,
        fontSize: 13, color: C.textMuted, lineHeight: 1.7,
      }}>
        ※ 같은 항목의 OR(예: 과목이 워드<b>이거나</b> 파포)는 <b>한 열</b> 아래 값을 세로로 나열해도 되고,
        같은 <b>제목을 두 열에 반복</b>해 적고 값을 다른 행에 놓아도 됩니다 — 지정한 범위만 벗어나지 않으면 됩니다.
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   2-b. 복합 조건 — AND와 OR를 함께 쓰기 (/diagram/filter-compound)
   "부서가 영업부가 아니면서, 실적이 150 미만이거나 300 초과" 를 조건 표로.
   OR로 행을 나누면 AND 조건(<>영업부)은 두 줄 모두에 반복해 적는다는 점이 핵심.
   ─────────────────────────────────────────────────────────── */
export function CompoundConditionDiagram() {
  return (
    <Wrap>
      <Title>복합 조건 — AND와 OR를 함께 쓰기</Title>
      <Subtitle>"부서가 영업부가 아니면서, 실적이 150 미만이거나 300 초과"</Subtitle>

      {/* 문장 → 조건 분해 (AND 조각 / OR 조각) */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
        {/* AND 조각 */}
        <div style={{
          flex: '1 1 300px', background: '#0d1f14', border: `2px solid ${C.green}`,
          borderRadius: 12, padding: 14,
        }}>
          <div style={{ fontSize: 16, color: C.text, lineHeight: 1.7, marginBottom: 8, textAlign: 'center' }}>
            "부서가 영업부가 <K color={C.greenLight}>아니면서</K>"
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.8 }}>
            <b style={{ color: C.greenLight }}>아니면서</b> = <b>아니다(&lt;&gt;)</b> + <b>이면서(AND)</b><br />
            → 부서 조건은 <b style={{ color: C.greenLight }}>&lt;&gt;영업부</b>, 다른 조건과{' '}
            <b>AND(같은 행)</b> 로 묶습니다.
          </div>
        </div>

        {/* OR 조각 */}
        <div style={{
          flex: '1 1 300px', background: '#1f180a', border: `2px solid ${C.amber}`,
          borderRadius: 12, padding: 14,
        }}>
          <div style={{ fontSize: 16, color: C.text, lineHeight: 1.7, marginBottom: 8, textAlign: 'center' }}>
            "실적이 150 <K color={C.amberLight}>미만이거나</K> 300 <K color={C.amberLight}>초과</K>"
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.8 }}>
            <b style={{ color: C.amberLight }}>이거나</b> → OR. 미만은 <b>&lt;150</b>, 초과는 <b>&gt;300</b>.<br />
            → 실적 <b style={{ color: C.amberLight }}>&lt;150</b> <b>OR</b>{' '}
            <b style={{ color: C.amberLight }}>&gt;300</b> (행을 나눕니다).
          </div>
        </div>
      </div>

      {/* 합친 조건식 */}
      <div style={{ textAlign: 'center', fontSize: 16, color: C.text, marginBottom: 12, lineHeight: 1.7 }}>
        합치면 → <b style={{ color: C.greenLight }}>(부서 &lt;&gt;영업부)</b> 그리고{' '}
        <b style={{ color: C.amberLight }}>(실적 &lt;150 또는 &gt;300)</b>
      </div>

      {/* 최종 조건 표 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMuted, textAlign: 'center', marginBottom: 6 }}>조건 범위</div>
          <CondTable headers={['부서', '실적']} rows={[['<>영업부', '<150'], ['<>영업부', '>300']]} />
        </div>
      </div>

      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '12px 16px', marginTop: 8,
        fontSize: 15, color: C.text, lineHeight: 1.8,
      }}>
        핵심 — '부서가 영업부가 <b style={{ color: C.greenLight }}>아닌 채로</b>, 실적이{' '}
        <b style={{ color: C.amberLight }}>150 미만일 수도</b>, <b style={{ color: C.amberLight }}>300 초과일 수도</b> 있다'는 뜻입니다.
        실적이 <K color={C.amberLight}>OR('이거나')</K> 라서 <K color={C.amberLight}>행을 2줄로 나눠</K> 적는데,
        부서 조건 <b style={{ color: C.greenLight }}>&lt;&gt;영업부</b> 는 그 두 경우에 <b>모두 해당</b>하므로{' '}
        <K color={C.greenLight}>두 줄 모두에</K> 함께 적습니다.
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   3. 고급 필터 대화상자 (/diagram/advanced-filter-dialog)
   실제 대화상자 모양 + 각 항목에 무엇을 넣는지 번호로 설명.
   ─────────────────────────────────────────────────────────── */
function Badge({ n, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', background: color, color: '#fff',
      fontSize: 12, fontWeight: 800, flexShrink: 0,
    }}>{n}</span>
  );
}

// 밝은 대화상자의 입력줄 — 애니메이션(값 표시/강조/비활성) 지원.
function AnimDialogRow({ label, value, badge, badgeColor, show, active, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <Badge n={badge} color={badgeColor} />
      <span style={{ fontSize: 13, color: '#1e293b', width: 78, flexShrink: 0 }}>{label}</span>
      <span style={{
        flex: 1, background: disabled ? '#e2e8f0' : '#fff',
        border: `1px solid ${active ? '#2563eb' : '#94a3b8'}`, borderRadius: 3,
        padding: '5px 8px', fontSize: 13, color: '#0f172a', fontFamily: FONT, minHeight: 15,
        boxShadow: active ? '0 0 0 3px rgba(37,99,235,0.35)' : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s, background 0.3s',
      }}>{show ? value : ''}</span>
      <span style={{
        background: '#e2e8f0', border: '1px solid #94a3b8', borderRadius: 3,
        padding: '5px 7px', fontSize: 11, color: '#334155',
      }}>▦</span>
    </div>
  );
}

const SHEET_TPL = '22px 50px 50px 50px 22px 52px 52px';

// 드래그로 잡는 '범위 선택' 사각형. 셀 하나하나가 아니라 블록 바깥 테두리만 그린다.
// dest(복사 위치)는 필드명을 모두 넣으므로 시작 셀 A10 한 칸만 선택한다.
const SHEET_SELECT = {
  list: { step: 2, color: '#3b82f6', bg: '#0c2344', r0: 1, r1: 6, c0: 0, c1: 2 },
  cond: { step: 3, color: '#a855f7', bg: '#1e0f47', r0: 1, r1: 2, c0: 4, c1: 5 },
  dest: { step: 4, color: '#22c55e', bg: '#0d1f14', r0: 10, r1: 10, c0: 0, c1: 0 },
};

// (행번호, 열인덱스)가 어느 선택 범위에 드는지 + 그 사각형의 어느 변에 닿는지.
function cellSelection(rowNum, col, step) {
  for (const k of ['list', 'cond', 'dest']) {
    const s = SHEET_SELECT[k];
    if (step >= s.step && rowNum >= s.r0 && rowNum <= s.r1 && col >= s.c0 && col <= s.c1) {
      return {
        s, active: step === s.step,
        top: rowNum === s.r0, bottom: rowNum === s.r1, left: col === s.c0, right: col === s.c1,
      };
    }
  }
  return null;
}

// 엑셀 머리글(모서리·열 문자·행 번호) 회색 칸
function HeadCell({ children, corner }) {
  return (
    <div style={{
      background: corner ? '#0b1220' : '#1e293b', border: `1px solid ${C.border}`,
      color: C.textMuted, fontSize: 11, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 2px', minHeight: 16,
    }}>{children}</div>
  );
}

// 데이터 칸 — 테두리는 늘 1px 격자선으로 두고, 선택 범위 '바깥 변'만 inset box-shadow로
// 그려서 셀 크기를 흐트러뜨리지 않고 하나의 범위처럼 보이게 한다. 결과 텍스트는 [확인] 후 등장.
function SheetCell({ cell, rowNum, col, step }) {
  const { t, h, res } = cell;
  const sel = cellSelection(rowNum, col, step);
  const resultOn = res && step >= 5;
  const shadows = [];
  if (sel) {
    const w = sel.active ? 2.5 : 2;
    if (sel.top) shadows.push(`inset 0 ${w}px 0 0 ${sel.s.color}`);
    if (sel.bottom) shadows.push(`inset 0 -${w}px 0 0 ${sel.s.color}`);
    if (sel.left) shadows.push(`inset ${w}px 0 0 0 ${sel.s.color}`);
    if (sel.right) shadows.push(`inset -${w}px 0 0 0 ${sel.s.color}`);
  }
  const textVisible = res ? step >= 5 : true;
  return (
    <div style={{
      background: sel ? sel.s.bg : (resultOn ? '#0d1f14' : C.bgDark),
      border: `1px solid ${C.border}`,
      boxShadow: shadows.join(', ') || 'none',
      color: C.text, fontWeight: h ? 700 : 400, fontSize: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6px 2px', textAlign: 'center', minHeight: 16, lineHeight: 1.2,
      transition: 'background 0.35s, box-shadow 0.3s',
    }}>
      <span style={{ opacity: textVisible ? 1 : 0, transition: 'opacity 0.4s' }}>{t}</span>
    </div>
  );
}

// 시트 데이터 — 원본 표(A1:C6) · 조건 표(E1:F2) · 결과(A10~). res: [확인] 후 채워지는 칸.
const SHEET_ROWS = [
  { num: 1, cells: [{ t: '이름', h: 1 }, { t: '부서', h: 1 }, { t: '실적', h: 1 }, { t: '' }, { t: '부서', h: 1 }, { t: '실적', h: 1 }] },
  { num: 2, cells: [{ t: '김철수' }, { t: '영업부' }, { t: '120' }, { t: '' }, { t: '영업부' }, { t: '>=100' }] },
  { num: 3, cells: [{ t: '이영희' }, { t: '총무부' }, { t: '90' }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 4, cells: [{ t: '박민준' }, { t: '영업부' }, { t: '150' }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 5, cells: [{ t: '최수지' }, { t: '인사부' }, { t: '95' }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 6, cells: [{ t: '정하늘' }, { t: '영업부' }, { t: '110' }, { t: '' }, { t: '' }, { t: '' }] },
];
const RESULT_ROWS = [
  { num: 10, cells: [{ t: '이름', h: 1, res: 1 }, { t: '부서', h: 1, res: 1 }, { t: '실적', h: 1, res: 1 }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 11, cells: [{ t: '김철수', res: 1 }, { t: '영업부', res: 1 }, { t: '120', res: 1 }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 12, cells: [{ t: '박민준', res: 1 }, { t: '영업부', res: 1 }, { t: '150', res: 1 }, { t: '' }, { t: '' }, { t: '' }] },
  { num: 13, cells: [{ t: '정하늘', res: 1 }, { t: '영업부', res: 1 }, { t: '110', res: 1 }, { t: '' }, { t: '' }, { t: '' }] },
];

function SheetBlock({ rows, band, step }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: SHEET_TPL }}>
      {band && (
        <Fragment>
          <HeadCell corner />
          {['A', 'B', 'C', 'D', 'E', 'F'].map((L) => <HeadCell key={L}>{L}</HeadCell>)}
        </Fragment>
      )}
      {rows.map((row) => (
        <Fragment key={row.num}>
          <HeadCell>{row.num}</HeadCell>
          {row.cells.map((c, i) => <SheetCell key={i} cell={c} rowNum={row.num} col={i} step={step} />)}
        </Fragment>
      ))}
    </div>
  );
}

export function AdvancedFilterDialog() {
  const CB = { copy: '#f59e0b', list: '#3b82f6', cond: '#a855f7', dest: '#22c55e' };
  // 0: 빈 폼  1: 결과=다른 장소에 복사  2: 목록 범위  3: 조건 범위  4: 복사 위치  5: 완료
  const step = useStep(6, 1800);
  const copyChosen = step >= 1;
  const done = step >= 5;

  const captions = [
    '표와 조건은 미리 시트에 만들어 둡니다 (원본 A1:C6 · 조건 E1:F2)',
    '① 결과 → [다른 장소에 복사] 선택',
    '② 목록 범위 = 원본 표 A1:C6 (제목 행까지 포함)',
    '③ 조건 범위 = 조건 표 E1:F2 (부서=영업부 그리고 실적 >=100)',
    '④ 복사 위치 = A10 (결과가 시작될 셀)',
    '[확인] → 조건에 맞는 행이 A10부터 복사됩니다',
  ];

  return (
    <Wrap>
      <Title>[고급 필터] — 어디에 무엇을 넣을까</Title>
      <Subtitle>왼쪽 시트의 범위가 대화상자 각 칸에 그대로 들어갑니다</Subtitle>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* 왼쪽: 실제 시트 (원본 표·조건 표·결과) */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>
            실제 시트 — <b style={{ color: C.blueLight }}>원본 A1:C6</b> ·{' '}
            <b style={{ color: C.purpleLight }}>조건 E1:F2</b> ·{' '}
            <b style={{ color: C.greenLight }}>결과 A10~</b>
          </div>
          <SheetBlock rows={SHEET_ROWS} band step={step} />
          <div style={{ textAlign: 'center', color: C.textDim, fontSize: 18, lineHeight: 1, margin: '3px 0' }}>⋮</div>
          <SheetBlock rows={RESULT_ROWS} step={step} />
        </div>

        {/* 오른쪽: 대화상자 모형 (밝은 창) */}
        <div style={{
          width: 340, background: '#f1f5f9', border: '1px solid #64748b', borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)', overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(#3b82f6,#2563eb)', color: '#fff',
            padding: '8px 12px', fontSize: 14, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>고급 필터</span><span>✕</span>
          </div>
          <div style={{ padding: 16 }}>
            {/* 결과 라디오 */}
            <div style={{ fontSize: 13, color: '#334155', fontWeight: 700, marginBottom: 6 }}>결과</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Badge n={1} color={CB.copy} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e293b' }}>
                <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #64748b', background: copyChosen ? '#fff' : 'radial-gradient(#64748b 40%, #fff 45%)', display: 'inline-block', transition: 'background 0.3s' }} />
                현재 위치에 필터
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              borderRadius: 6, padding: '2px 4px', transition: 'box-shadow 0.3s',
              boxShadow: step === 1 ? '0 0 0 3px rgba(245,158,11,0.5)' : 'none',
            }}>
              <span style={{ width: 20, flexShrink: 0 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e293b', fontWeight: copyChosen ? 700 : 400 }}>
                <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #f59e0b', background: copyChosen ? 'radial-gradient(#f59e0b 40%, #fff 45%)' : '#fff', display: 'inline-block', transition: 'background 0.3s' }} />
                다른 장소에 복사
              </span>
            </div>

            <AnimDialogRow badge={2} badgeColor={CB.list} label="목록 범위:" value="$A$1:$C$6" show={step >= 2} active={step === 2} />
            <AnimDialogRow badge={3} badgeColor={CB.cond} label="조건 범위:" value="$E$1:$F$2" show={step >= 3} active={step === 3} />
            <AnimDialogRow badge={4} badgeColor={CB.dest} label="복사 위치:" value="$A$10" show={step >= 4} active={step === 4} disabled={!copyChosen} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px' }}>
              <span style={{ width: 13, height: 13, border: '2px solid #64748b', borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontSize: 13, color: '#334155' }}>동일한 레코드는 하나만</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <span style={{
                background: '#2563eb', color: '#fff', borderRadius: 4, padding: '5px 16px', fontSize: 13, fontWeight: 700,
                transition: 'box-shadow 0.3s', boxShadow: done ? '0 0 0 3px rgba(37,99,235,0.5)' : 'none',
              }}>확인</span>
              <span style={{ background: '#e2e8f0', color: '#334155', border: '1px solid #94a3b8', borderRadius: 4, padding: '5px 16px', fontSize: 13 }}>취소</span>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 단계 한 줄 설명 */}
      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 16,
        textAlign: 'center', fontSize: 15, color: C.text, lineHeight: 1.6, minHeight: 22,
      }}>
        {captions[step]}
      </div>

      {/* 아래: 번호별 설명 (①②③④) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10, marginTop: 12 }}>
        {[
          { n: 1, c: CB.copy, t: '결과 위치 선택', d: <><b>현재 위치</b>는 원본 자리에서 바로 걸러 보여주고, <b>다른 장소에 복사</b>는 결과를 새 위치에 씁니다. 복사를 골라야 ④가 활성화됩니다.</> },
          { n: 2, c: CB.list, t: '목록 범위', d: <>필터할 <b>원본 표 전체(A1:C6)</b>를 <b>제목(머리글) 행까지 포함</b>해 지정합니다.</> },
          { n: 3, c: CB.cond, t: '조건 범위', d: <>미리 만들어 둔 <b>조건 표(E1:F2)</b> — 제목 + 조건 값 — 을 지정합니다.</> },
          { n: 4, c: CB.dest, t: '복사 위치', d: <>'다른 장소에 복사'일 때만 입력. 결과가 <b>시작될 셀(A10)</b>을 지정합니다.</> },
        ].map((it) => {
          const reached = step >= it.n;
          const active = step === it.n;
          return (
            <div key={it.n} style={{
              display: 'flex', gap: 10, background: active ? '#111a2e' : C.bgDark,
              border: `1px solid ${active ? it.c : C.border}`,
              borderLeft: `4px solid ${it.c}`, borderRadius: 8, padding: '10px 12px',
              opacity: reached ? 1 : 0.4, transition: 'opacity 0.4s, background 0.35s, border-color 0.35s',
              boxShadow: active ? `0 0 0 2px ${it.c}55` : 'none',
            }}>
              <Badge n={it.n} color={it.c} />
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                <b style={{ color: '#fff' }}>{it.t}</b> — {it.d}
              </div>
            </div>
          );
        })}
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   4. 자주 하는 실수 (/diagram/filter-mistakes)
   ─────────────────────────────────────────────────────────── */
export function FilterMistakesDiagram() {
  const items = [
    {
      wrong: "조건 필드명을 원본과 다르게 적음 — 글자가 다르거나 '부서' 뒤에 눈에 안 보이는 공백이 남은 경우",
      right: "조건 필드명을 원본과 글자·공백까지 똑같이 (원본에서 복사)",
      why: "필드명이 원본과 한 글자·공백이라도 다르면 짝을 못 찾아 필터가 동작하지 않습니다.",
    },
    {
      wrong: '조건 범위에 값 없는 빈 행·열까지 포함해 지정',
      right: '제목과 값이 있는 부분만 정확히 지정',
      why: "빈 행은 '조건 없음'으로 처리돼, 거를 기준이 없으니 표의 모든 데이터가 그대로 추출됩니다.",
    },
    {
      wrong: '목록 범위를 데이터만(제목 행 빼고) 지정',
      right: '목록 범위에 제목(머리글) 행까지 포함',
      why: '제목 행이 있어야 조건 제목과 짝지을 수 있습니다.',
    },
    {
      wrong: "AND인데 조건을 위·아래 다른 행에 입력",
      right: "모두 만족(AND)이면 같은 행에 나란히",
      why: '다른 행에 쓰면 OR(하나만 만족)로 처리됩니다.',
    },
    {
      wrong: "'다른 장소에 복사'인데 복사 위치를 비워 둠",
      right: '복사 위치에 결과 시작 셀을 지정',
      why: '복사 위치가 없으면 확인을 눌러도 진행되지 않습니다.',
    },
  ];
  return (
    <Wrap>
      <Title>고급 필터 — 자주 하는 실수</Title>
      <Subtitle>필드명·복사 위치·범위 지정에서 자주 틀립니다</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12,
          }}>
            <div style={{
              background: '#2a1315', border: `1px solid ${C.red}`, borderRadius: 8, padding: '9px 12px',
              fontSize: 14, color: C.redLight, lineHeight: 1.6,
            }}>
              <b>✗ 실수</b><br />{it.wrong}
            </div>
            <div style={{
              background: '#0d1f14', border: `1px solid ${C.green}`, borderRadius: 8, padding: '9px 12px',
              fontSize: 14, color: C.greenLight, lineHeight: 1.6,
            }}>
              <b>✓ 올바르게</b><br />{it.right}
            </div>
            <div style={{ gridColumn: '1 / 3', fontSize: 13, color: C.textMuted, paddingLeft: 4 }}>
              💡 {it.why}
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   6. 사용자 지정 자동 필터 여는 경로 (/diagram/custom-filter-menu)
   ▼ → [숫자 필터] → [사용자 지정 필터...] 로 들어가는 메뉴 흐름.
   ─────────────────────────────────────────────────────────── */
function MenuItem({ children, arrow, active, divider }) {
  if (divider) return <div style={{ height: 1, background: C.border, margin: '5px 6px' }} />;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px', fontSize: 13, borderRadius: 5, gap: 10,
      background: active ? C.blueDim : 'transparent',
      color: active ? '#fff' : C.text, fontWeight: active ? 700 : 400,
    }}>
      <span>{children}</span>
      {arrow && <span style={{ fontSize: 11, color: active ? '#fff' : C.textMuted }}>▶</span>}
    </div>
  );
}

export function CustomFilterMenu() {
  return (
    <Wrap>
      <Title>사용자 지정 자동 필터로 들어가는 길</Title>
      <Subtitle>제목 ▼ → [숫자·텍스트·날짜 필터] → [사용자 지정 필터…]</Subtitle>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* 1차 드롭다운 */}
        <div style={{
          width: 210, background: '#0f172a', border: `1px solid ${C.border}`,
          borderRadius: 8, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 12, color: C.textDim, padding: '2px 10px 6px' }}>실적 ▼</div>
          <MenuItem>숫자 오름차순 정렬</MenuItem>
          <MenuItem>숫자 내림차순 정렬</MenuItem>
          <MenuItem divider />
          <MenuItem arrow active>숫자 필터</MenuItem>
          <MenuItem divider />
          <div style={{
            background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 5,
            margin: '2px 4px', padding: '6px 8px', fontSize: 13, color: C.textMuted,
          }}>
            <div style={{ marginBottom: 5 }}>🔍 <span style={{ color: C.textDim }}>검색</span></div>
            <div>☑ (모두 선택)</div>
            <div>☑ 80</div>
            <div>☑ 90 …</div>
          </div>
        </div>

        {/* 화살표 */}
        <div style={{ alignSelf: 'center', fontSize: 22, color: C.blue }}>→</div>

        {/* 하위 메뉴 */}
        <div style={{
          width: 190, background: '#0f172a', border: `1px solid ${C.blueDim}`,
          borderRadius: 8, padding: 6, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <MenuItem>같음…</MenuItem>
          <MenuItem>같지 않음…</MenuItem>
          <MenuItem>보다 큼…</MenuItem>
          <MenuItem>크거나 같음…</MenuItem>
          <MenuItem>보다 작음…</MenuItem>
          <MenuItem>상위 10…</MenuItem>
          <MenuItem divider />
          <MenuItem active>사용자 지정 필터…</MenuItem>
        </div>
      </div>

      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '11px 16px', marginTop: 16,
        textAlign: 'center', fontSize: 15, color: C.text, lineHeight: 1.6,
      }}>
        열 종류에 따라 <K>숫자 필터 · 텍스트 필터 · 날짜 필터</K>로 이름만 바뀝니다.
        맨 아래 <K color={C.amberLight}>[사용자 지정 필터…]</K>를 누르면 조건 대화상자가 열립니다.
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   7. 사용자 지정 자동 필터 (/diagram/custom-filter-dialog)
   대화상자 모형(정적) + ① 연산자 · ② 값 · ③ 그리고/또는 설명 3개.
   ─────────────────────────────────────────────────────────── */
export function CustomAutoFilterDialog() {
  const CB = { op: '#3b82f6', val: '#a855f7', join: '#f59e0b' };
  const cards = [
    { n: 1, c: CB.op, t: '연산자 선택', d: <>비교 기호를 고릅니다 — <b>=</b> 같음 · <b>&lt;&gt;</b> 같지 않음 · <b>&gt;</b> 초과 · <b>&gt;=</b> 이상 · <b>&lt;</b> 미만 · <b>&lt;=</b> 이하.</> },
    { n: 2, c: CB.val, t: '기준 값 입력', d: <>비교할 값을 넣습니다. 숫자는 그대로, <b>텍스트는 큰따옴표 없이 값만</b> — <b>부장</b> ⭕ / <b>"부장"</b> ❌.</> },
    { n: 3, c: CB.join, t: '그리고 / 또는', d: <><b>그리고(AND)</b>=두 조건 모두, <b>또는(OR)</b>=둘 중 하나만. 범위(이상~이하)는 <b>그리고</b>.</> },
  ];
  return (
    <Wrap>
      <Title>[사용자 지정 자동 필터]</Title>
      <Subtitle>예) 실적이 100 이상 150 이하 → &gt;=100 그리고 &lt;=150</Subtitle>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>
        {/* 대화상자 모형 (밝은 창) */}
        <div style={{
          width: 340, background: '#f1f5f9', border: '1px solid #64748b', borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)', overflow: 'hidden', alignSelf: 'flex-start',
        }}>
          <div style={{
            background: 'linear-gradient(#3b82f6,#2563eb)', color: '#fff',
            padding: '8px 12px', fontSize: 14, fontWeight: 700,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>사용자 지정 자동 필터</span><span>✕</span>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: '#334155', marginBottom: 10 }}>다음 기준에 맞는 행 표시:</div>
            <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, marginBottom: 8 }}>실적</div>

            {/* 조건 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge n={1} color={CB.op} />
              <ComboBox w={150} strong>&gt;=</ComboBox>
              <Badge n={2} color={CB.val} />
              <ComboBox w={90} strong>100</ComboBox>
            </div>

            {/* AND/OR 라디오 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, margin: '4px 0 4px 28px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1e293b', fontWeight: 700 }}>
                <Badge n={3} color={CB.join} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #f59e0b', background: 'radial-gradient(#f59e0b 40%, #fff 45%)', display: 'inline-block' }} />
                그리고(A)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />
                또는(O)
              </span>
            </div>

            {/* 조건 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
              <span style={{ width: 20, flexShrink: 0 }} />
              <ComboBox w={150} strong>&lt;=</ComboBox>
              <span style={{ width: 20, flexShrink: 0 }} />
              <ComboBox w={90} strong>150</ComboBox>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <span style={{ background: '#2563eb', color: '#fff', borderRadius: 4, padding: '5px 16px', fontSize: 13, fontWeight: 700 }}>확인</span>
              <span style={{ background: '#e2e8f0', color: '#334155', border: '1px solid #94a3b8', borderRadius: 4, padding: '5px 16px', fontSize: 13 }}>취소</span>
            </div>
          </div>
        </div>

        {/* ①②③ 설명 — 대화상자와 같은 높이로 균등 분배 */}
        <div style={{ flex: '1 1 260px', minWidth: 240, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((it) => (
            <div key={it.n} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: C.bgDark, border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${it.c}`, borderRadius: 8, padding: '10px 14px',
            }}>
              <Badge n={it.n} color={it.c} />
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                <b style={{ color: '#fff' }}>{it.t}</b> — {it.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: C.bgDark, borderRadius: 8, padding: '11px 16px', marginTop: 14,
        fontSize: 14, color: C.text, lineHeight: 1.7,
      }}>
        ※ <b style={{ color: C.blueLight }}>서로 다른 열</b>에 각각 조건을 걸면 열끼리는 <b>자동으로 그리고(AND)</b>로 묶입니다. (위 애니메이션 참고)
      </div>
    </Wrap>
  );
}

/* ───────────────────────────────────────────────────────────
   8. 비교 연산자 읽는 법 (/diagram/filter-comparison)
   조건 범위 = 위 칸 '제목', 아래 칸 '비교식'.  나이 30 이상 → >=30 인 이유.
   ─────────────────────────────────────────────────────────── */
export function ComparisonOperatorDiagram() {
  const F = { field: '#3b82f6', op: '#f59e0b', val: '#a855f7' };
  const samples = [
    { age: 28, pass: false }, { age: 29, pass: false },
    { age: 30, pass: true }, { age: 31, pass: true }, { age: 45, pass: true },
  ];
  const ops = [
    { op: '>=', mean: '이상 (크거나 같음)', ex: '>=30', inc: '30 포함 ⭕' },
    { op: '>', mean: '초과 (보다 큼)', ex: '>30', inc: '30 제외 ❌' },
    { op: '<=', mean: '이하 (작거나 같음)', ex: '<=30', inc: '30 포함 ⭕' },
    { op: '<', mean: '미만 (보다 작음)', ex: '<30', inc: '30 제외 ❌' },
    { op: '<>', mean: '같지 않음', ex: '<>합격', inc: "'합격'만 빼고" },
  ];
  return (
    <Wrap>
      <Title>비교 연산자 — 무엇을 기준으로, 왜 &gt;=30 인가</Title>
      <Subtitle>조건 범위는 '위 칸=제목(어느 열), 아래 칸=비교식'</Subtitle>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* 조건 범위 모형 + 분해 */}
        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>
            "나이가 30 이상" → 조건 범위
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div style={{ width: 150 }}>
              <div style={{
                background: '#0b1220', border: `2px solid ${F.field}`, borderBottom: 'none',
                borderRadius: '8px 8px 0 0', padding: '9px 6px', textAlign: 'center',
                fontSize: 16, fontWeight: 800, color: C.blueLight,
              }}>나이</div>
              <div style={{
                background: C.bgDark, border: `2px solid ${C.border}`,
                borderRadius: '0 0 8px 8px', padding: '11px 6px', textAlign: 'center',
                fontSize: 20, fontWeight: 800, letterSpacing: 1,
              }}>
                <span style={{ color: F.op }}>&gt;=</span>
                <span style={{ color: F.val }}>30</span>
              </div>
            </div>
          </div>

          {/* 분해 설명 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            {[
              { c: F.field, t: '제목 「나이」', d: '어느 열의 값을 검사할지 정합니다. 원본 제목과 똑같이.' },
              { c: F.op, t: '연산자 「>=」', d: '그 값을 어떻게 비교할지. >= 는 "크거나 같다 = 이상".' },
              { c: F.val, t: '기준값 「30」', d: '비교의 기준이 되는 값. 30을 기준으로 나눕니다.' },
            ].map((it, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, background: C.bgDark, border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${it.c}`, borderRadius: 8, padding: '9px 12px',
              }}>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                  <b style={{ color: it.c }}>{it.t}</b> — {it.d}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#0b1220', border: `1px solid ${C.amber}`, borderRadius: 8,
            padding: '11px 14px', marginTop: 12, fontSize: 14, color: C.text, lineHeight: 1.7,
          }}>
            읽는 법 — <b style={{ color: C.amberLight }}>"각 행의 '나이' 값이 30보다 크거나 같은가?"</b><br />
            '이상'은 <b style={{ color: C.amberLight }}>30을 포함</b>하므로 등호가 붙은 <b style={{ color: C.amberLight }}>&gt;=</b>.
            만약 '30 초과(30 제외)'라면 <b>&gt;30</b> 으로 씁니다.
          </div>
        </div>

        {/* 통과/탈락 예시 + 연산자 표 */}
        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>
            &gt;=30 에 걸리는 나이
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {samples.map((s) => (
              <div key={s.age} style={{
                width: 52, padding: '8px 0', textAlign: 'center', borderRadius: 8,
                border: `1px solid ${s.pass ? C.green : C.red}`,
                background: s.pass ? '#0d1f14' : '#2a1315',
                color: s.pass ? C.greenLight : C.redLight, fontWeight: 700,
              }}>
                {s.age}<div style={{ fontSize: 12, marginTop: 2 }}>{s.pass ? '⭕' : '❌'}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 6 }}>
            30은 <b style={{ color: C.greenLight }}>포함(통과)</b> — 등호(=)가 있기 때문
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '54px 1.4fr 70px 1fr',
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', marginTop: 16,
          }}>
            {['연산자', '뜻', '예', '기준값'].map((h, i) => (
              <div key={i} style={{
                background: '#0b1220', borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
                borderBottom: `1px solid ${C.border}`, padding: '7px 8px',
                fontSize: 13, fontWeight: 700, color: C.textMuted, textAlign: 'center',
              }}>{h}</div>
            ))}
            {ops.map((o, ri) => [
              <div key={`o${ri}`} style={{
                borderRight: `1px solid ${C.border}`, borderBottom: ri < ops.length - 1 ? `1px solid ${C.border}` : 'none',
                padding: '8px', textAlign: 'center', fontSize: 15, fontWeight: 800, color: C.amberLight,
              }}>{o.op}</div>,
              <div key={`m${ri}`} style={{
                borderRight: `1px solid ${C.border}`, borderBottom: ri < ops.length - 1 ? `1px solid ${C.border}` : 'none',
                padding: '8px', fontSize: 13, color: C.text,
              }}>{o.mean}</div>,
              <div key={`e${ri}`} style={{
                borderRight: `1px solid ${C.border}`, borderBottom: ri < ops.length - 1 ? `1px solid ${C.border}` : 'none',
                padding: '8px', textAlign: 'center', fontSize: 14, color: C.blueLight, fontWeight: 700,
              }}>{o.ex}</div>,
              <div key={`i${ri}`} style={{
                borderBottom: ri < ops.length - 1 ? `1px solid ${C.border}` : 'none',
                padding: '8px', fontSize: 13, color: C.textMuted, textAlign: 'center',
              }}>{o.inc}</div>,
            ])}
          </div>
        </div>
      </div>
    </Wrap>
  );
}
