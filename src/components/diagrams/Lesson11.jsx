// 11차시 — 조건부 서식 애니메이션.
// "수식을 사용하여 서식을 지정할 셀 결정" 규칙의 핵심을 보여준다:
//  · 선택 범위는 필드명(제목)을 제외한 데이터 부분만
//  · 조건식은 =$B2>=90 하나만 입력 (열은 $로 고정, 행 번호만 이동)
//  · 엑셀이 행마다 참조를 2→3→4… 로 옮겨 가며 참/거짓을 판정
//  · 조건이 참인 행에만 서식(채우기 등)이 적용된다
// 외부 라이브러리 없이 setInterval 로 한 행씩 판정하는 과정을 반복 재생.
import { useEffect, useRef, useState } from 'react';
import { Wrap, Title, Subtitle, C } from './shared.jsx';
import { cycleReference } from '../../utils/formulaUtils';

const FIX = C.greenLight; // 고정($ · 기준 열) 강조색
const CHG = C.amber;      // 바뀌는 부분(행 번호) 강조색
const THRESH = 90;

const DATA = [
  { rn: 2, name: '김우수', score: 95 },
  { rn: 3, name: '이보통', score: 80 },
  { rn: 4, name: '박최고', score: 92 },
  { rn: 5, name: '정평범', score: 70 },
  { rn: 6, name: '한성실', score: 88 },
];

const COLS = '32px 96px 74px minmax(210px, 1fr)';

// 규칙 수식 한 줄: =$B{rn}>=90  ($B 는 고정, 행 번호만 색으로 강조)
function RuleFormula({ rn, size = 15 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span style={{ color: C.text }}>=</span>
      <span style={{ color: FIX }}>$B</span>
      <span style={{ color: CHG }}>{rn}</span>
      <span style={{ color: C.text }}>{'>='}{THRESH}</span>
    </span>
  );
}

function HeadCell({ children, accent, style = {} }) {
  return (
    <div style={{
      background: '#0b1220', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
      padding: '8px 6px', textAlign: 'center', fontSize: 14, fontWeight: 700,
      color: accent ? C.blueLight : C.textMuted, ...style,
    }}>{children}</div>
  );
}

export function CondFormatFormulaAnim() {
  const len = DATA.length;
  const total = len + 2; // 마지막 판정 후 2틱 동안 완성 상태 유지 → 순환
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % total), 1250);
    return () => clearInterval(id);
  }, [total]);

  const activeIdx = step < len ? step : -1;   // 지금 판정 중인 행
  const evaluated = Math.min(step, len);      // 판정이 끝난 행 개수

  return (
    <Wrap>
      <Title>수식 규칙 — 혼합 참조로 행마다 판정</Title>
      <Subtitle>{'조건식 =$B2>=90 하나만 입력하면, 엑셀이 행마다 참조를 옮겨 판정하고 참인 행에만 서식을 입힙니다'}</Subtitle>

      {/* 입력하는 수식 한 줄 배너 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10,
        padding: '10px 16px', marginBottom: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 14, color: C.textMuted }}>입력하는 수식은 딱 하나</span>
        <span style={{
          background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 8,
          padding: '6px 14px', fontSize: 18,
        }}>
          <RuleFormula rn={2} size={18} />
        </span>
        <span style={{ fontSize: 13, color: C.textDim }}>
          <span style={{ color: FIX, fontWeight: 700 }}>$B = 기준 열 고정</span>
          {' · '}
          <span style={{ color: CHG, fontWeight: 700 }}>행 번호는 이동</span>
        </span>
      </div>

      {/* 표 */}
      <div style={{
        border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden',
      }}>
        {/* 필드명(제목) 행 — 선택에서 제외 */}
        <div style={{ display: 'grid', gridTemplateColumns: COLS, position: 'relative' }}>
          <HeadCell />
          <HeadCell>A · 이름</HeadCell>
          <HeadCell>B · 점수</HeadCell>
          <div style={{
            background: '#2a0f10', borderBottom: `1px solid ${C.border}`,
            padding: '8px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.redLight,
          }}>
            필드명(제목) — 선택 제외 ✕
          </div>
        </div>

        {/* 데이터 행 — 여기만 선택 범위 */}
        {DATA.map((r, idx) => {
          const pass = r.score >= THRESH;
          const done = idx < evaluated;      // 판정 완료
          const active = idx === activeIdx;  // 판정 중
          const applied = done && pass;      // 서식 적용됨

          const rowBg = applied ? C.greenBg : active ? '#0e1a33' : C.bgDark;
          const leftBar = active ? C.blueDim : applied ? C.green : C.blueBg;

          return (
            <div key={r.rn} style={{
              display: 'grid', gridTemplateColumns: COLS,
              background: rowBg,
              borderLeft: `3px solid ${leftBar}`,
              boxShadow: active ? `0 0 0 2px ${C.blueDim} inset` : 'none',
              transition: 'background 0.35s, box-shadow 0.25s',
            }}>
              <HeadCell style={{ background: '#0b1220', color: applied ? FIX : C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.rn}</HeadCell>
              <div style={{
                borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                padding: '9px 8px', textAlign: 'center', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: applied ? '#fff' : C.text, fontWeight: applied ? 700 : 400,
              }}>{r.name}</div>
              <div style={{
                borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                padding: '9px 8px', textAlign: 'center', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: applied ? '#fff' : C.textMuted, fontWeight: applied ? 800 : 400,
              }}>{r.score}</div>

              {/* 판정 결과 열 */}
              <div style={{
                borderBottom: `1px solid ${C.border}`,
                padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 10,
                minHeight: 40, flexWrap: 'wrap',
              }}>
                {(active || done) ? (
                  <>
                    <RuleFormula rn={r.rn} size={14} />
                    <span style={{ color: C.textDim }}>→</span>
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      color: pass ? C.green : C.textDim,
                    }}>{pass ? 'TRUE' : 'FALSE'}</span>
                    {applied && (
                      <span style={{
                        background: C.green, color: '#052e16', fontWeight: 800, fontSize: 12,
                        borderRadius: 6, padding: '3px 8px',
                      }}>서식 적용 🎨</span>
                    )}
                    {active && !done && (
                      <span style={{ fontSize: 12, color: C.blueLight }}>판정 중…</span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 13, color: C.textSlate }}>대기</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 설명 (핵심만) */}
      <div style={{ background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 14, fontSize: 15, color: C.text, lineHeight: 1.85 }}>
        <div>· 열은 <b style={{ color: FIX }}>$B로 고정</b> → 어느 행이든 항상 점수(B열)를 봅니다.</div>
        <div>· 행 번호만 <b style={{ color: CHG }}>맨 윗행부터 2 → 3 → 4…</b> 아래로 이동합니다. (위로는 안 감 → <b style={{ color: C.redLight }}>=$B4</b>로 쓰면 통째로 밀려 어긋남)</div>
        <div>· 조건이 <b style={{ color: C.green }}>참인 행에만 서식</b>이 적용됩니다.</div>
      </div>
    </Wrap>
  );
}

/* ─────────────── 조건부 서식 4단계 진행 순서 애니메이션 ─────────────── */
// 실제 작업 순서(범위 지정 → 규칙 유형 → 수식 → 서식 적용)를 단계별 캡션·대화상자와 함께
// 보여준다. 자동 재생이 아니라 단계 버튼을 누르면 해당 단계로 바뀐다.
// 표는 사원 실적표를 본떠 만들고, '판매액이 2,000,000 이상인 행 전체를
// 연한 파랑 채우기·기울임꼴로 강조' 규칙을 =$F11>=2000000 으로 세우는 과정을 보여준다.
const EMP_LETTERS = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
const EMP_HEAD = ['사번', '성명', '부서', '직급', '판매액', '목표', '달성률'];
const EMP_ROWS = [
  { rn: 11, v: ['A-1024', '김도윤', '영업1팀', '대리', '2,450,000', '2,000,000', '123%'] },
  { rn: 12, v: ['A-2087', '이서준', '영업2팀', '사원', '1,780,000', '2,000,000', '89%'] },
  { rn: 13, v: ['A-3156', '박하은', '영업1팀', '과장', '3,120,000', '2,500,000', '125%'] },
  { rn: 14, v: ['A-4203', '김민서', '영업3팀', '사원', '1,340,000', '1,800,000', '74%'] },
  { rn: 15, v: ['A-5271', '김우진', '영업2팀', '대리', '2,050,000', '2,000,000', '103%'] },
  { rn: 16, v: ['A-6098', '강지아', '영업3팀', '과장', '1,650,000', '2,200,000', '75%'] },
  { rn: 17, v: ['A-7132', '윤하람', '영업1팀', '사원', '2,780,000', '2,500,000', '111%'] },
  { rn: 18, v: ['A-8045', '서지호', '영업2팀', '과장', '1,920,000', '2,000,000', '96%'] },
];
const COND_IDX = 4;          // 판매액(F) 열 — 조건을 확인하는 열
const COND_NUM = 2000000;    // 판매액 >= 2,000,000
const EMP_GRID = '28px 62px 56px 64px 46px 80px 80px 54px';
const FMT_FILL = '#bfdbfe';  // 채우기 '연한 파랑'
const FMT_TEXT = '#1e293b';  // 연한 파랑 채우기 위 글자색(가독용). 글꼴 색은 지정하지 않고 '기울임꼴'만 적용

const STEPS = [
  { n: '①', label: '범위 지정', caption: 'B11:H18 선택 — 제목행(10행)은 빼고 표 데이터 전체를' },
  { n: '②', label: '규칙 유형', caption: "[새 규칙]에서 '수식을 사용하여 서식을 지정할 셀 결정' 선택" },
  { n: '③', label: '수식 적기', caption: '=$F11>=2000000 입력 — $F로 판매액 열 고정, 맨 윗행(11) 번호' },
  { n: '④', label: '서식 적용', caption: "[셀 서식]에서 글꼴 스타일 '기울임꼴' + 채우기 '연한 파랑' → 확인" },
];

function StepChip({ n, label, active, done, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: active ? C.blueDim : C.bgDark,
      border: `1px solid ${active ? C.blueDim : C.border}`,
      color: active ? '#fff' : done ? C.green : C.textMuted,
      borderRadius: 999, padding: '7px 14px', fontSize: 14, fontWeight: 700,
      transition: 'all .25s', whiteSpace: 'nowrap', cursor: 'pointer',
      boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none',
      fontFamily: 'inherit',
    }}>
      <span>{done ? '✓' : n}</span><span>{label}</span>
    </button>
  );
}

// 조건 수식 =$F11>=2000000 ($F 고정=초록, 11 행번호=노랑)
function Fx({ size = 15 }) {
  return (
    <span style={{ fontSize: size, fontWeight: 800, whiteSpace: 'nowrap' }}>
      <span style={{ color: C.text }}>=</span>
      <span style={{ color: FIX }}>$F</span>
      <span style={{ color: CHG }}>11</span>
      <span style={{ color: C.text }}>{'>='}2000000</span>
    </span>
  );
}

// 대화상자 프레임 (제목 표시줄 + 본문)
function Dlg({ title, width = 300, children }) {
  return (
    <div style={{
      width, background: '#0b1220', border: `1px solid ${C.blueDim}`, borderRadius: 8,
      overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
    }}>
      <div style={{
        background: C.blueBg, borderBottom: `1px solid ${C.blueDim}`,
        padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.blueLight }}>{title}</span>
        <span style={{ fontSize: 11, color: C.textDim }}>─ ☐ ✕</span>
      </div>
      <div style={{ padding: '12px 14px' }}>{children}</div>
    </div>
  );
}

function DlgButtons({ primary }) {
  const btn = (label, on) => (
    <span style={{
      background: on ? C.blueDim : 'transparent', color: on ? '#fff' : C.textMuted,
      border: `1px solid ${on ? C.blueDim : C.border}`, borderRadius: 6,
      padding: '5px 16px', fontSize: 13, fontWeight: 700,
      boxShadow: on ? '0 0 0 2px rgba(59,130,246,0.4)' : 'none',
    }}>{label}</span>
  );
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
      {btn('확인', primary)}{btn('취소', false)}
    </div>
  );
}

// [새 서식 규칙] 대화상자 — 규칙 유형 목록 + 수식 입력 + [서식…]
function NewRuleDialog({ formulaFilled }) {
  const types = [
    '셀 값을 기준으로 모든 셀의 서식 지정',
    '다음을 포함하는 셀만 서식 지정',
    '상위 또는 하위 값만 서식 지정',
    '평균보다 크거나 작은 값만 서식 지정',
    '고유 또는 중복 값만 서식 지정',
    '수식을 사용하여 서식을 지정할 셀 결정',
  ];
  return (
    <Dlg title="새 서식 규칙" width={306}>
      <div style={{ fontSize: 12, color: C.textDim, fontWeight: 700, marginBottom: 6 }}>규칙 유형 선택:</div>
      {types.map((t, i) => {
        const hi = i === types.length - 1;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: hi ? C.blueBg : 'transparent',
            border: `1px solid ${hi ? C.blueDim : 'transparent'}`,
            color: hi ? C.blueLight : C.textMuted, fontWeight: hi ? 700 : 400,
            borderRadius: 6, padding: '5px 8px', fontSize: 12, marginBottom: 3, lineHeight: 1.3,
          }}>{hi && <span>▶</span>}{t}{hi && <span> ✓</span>}</div>
        );
      })}
      <div style={{ fontSize: 12, color: C.textDim, fontWeight: 700, margin: '11px 0 5px' }}>규칙 설명 편집:</div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5 }}>다음 수식이 참인 값의 서식 지정:</div>
      <div style={{
        background: '#0e1a33', border: `1px solid ${C.blueDim}`, borderRadius: 6,
        padding: '9px 10px', minHeight: 18, textAlign: 'left',
      }}>
        {formulaFilled
          ? <Fx size={15} />
          : <span style={{ color: C.textDim, fontSize: 14 }}>입력하세요…</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <span style={{
          border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: C.text,
          boxShadow: formulaFilled ? '0 0 0 2px rgba(59,130,246,0.4)' : 'none',
        }}>서식…</span>
        <span style={{ fontSize: 11, color: C.textDim }}>미리 보기:</span>
        <span style={{
          background: C.bgDark, color: C.textDim, border: `1px solid ${C.border}`,
          borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 700,
        }}>가나다 AaBb</span>
      </div>
      <DlgButtons primary={false} />
    </Dlg>
  );
}

// 세로 목록 상자(글꼴 스타일/밑줄 등) — 위에 현재값 칸 + 아래 종류 목록.
function ListBox({ label, value, items, width }) {
  return (
    <div style={{ width, flexShrink: 0 }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{
        border: `1px solid ${C.border}`, borderRadius: 3, background: '#0e1a33',
        padding: '3px 7px', fontSize: 12, color: '#fff', fontWeight: 600, marginBottom: 3,
      }}>{value}</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 3, background: '#0b1220', height: 78, overflow: 'hidden' }}>
        {items.map((it) => {
          const on = it === value;
          return (
            <div key={it} style={{
              padding: '2px 7px', fontSize: 12,
              background: on ? C.blueDim : 'transparent',
              color: on ? '#fff' : C.textMuted, fontWeight: on ? 700 : 400,
            }}>{it}</div>
          );
        })}
      </div>
    </div>
  );
}

// 조건부 서식에서 비활성(회색)인 컨트롤(글꼴·크기) — 값만 흐리게, 목록은 펼치지 않는다.
function FieldDisabled({ label, value, width }) {
  return (
    <div style={{ width, flexShrink: 0 }}>
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>{label}</div>
      <div style={{
        border: `1px solid ${C.border}`, borderRadius: 3, background: '#0b1220',
        padding: '3px 7px', fontSize: 12, color: C.textDim, fontWeight: 400,
      }}>{value}</div>
    </div>
  );
}

// 라벨 + 드롭다운(밑줄·색). swatch 가 있으면 색 견본을 앞에 붙인다.
function DropRow({ label, value, swatch }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between',
        border: `1px solid ${C.border}`, borderRadius: 3, background: '#0e1a33', padding: '3px 7px',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.text }}>
          {swatch && <span style={{ width: 26, height: 12, background: swatch, border: `1px solid ${C.border}`, borderRadius: 2, display: 'inline-block' }} />}
          {value}
        </span>
        <span style={{ fontSize: 9, color: C.textDim }}>▼</span>
      </div>
    </div>
  );
}

// 엑셀 배경색 팔레트(대표 색 8×5). 연한 파랑 셀 하나에 선택 테두리를 준다.
const PALETTE = [
  ['#ffffff', '#000000', '#e7e6e6', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47'],
  ['#f2f2f2', '#808080', '#ddd9c3', '#d6dce5', '#dae3f3', '#fbe5d6', '#ededed', '#fff2cc', '#deebf7', '#e2efda'],
  ['#d9d9d9', '#595959', '#c4bd97', '#adb9ca', '#bfdbfe', '#f8cbad', '#dbdbdb', '#ffe699', '#bdd7ee', '#c6e0b4'],
  ['#bfbfbf', '#404040', '#948a54', '#8496b0', '#9dc3e6', '#f4b183', '#c9c9c9', '#ffd966', '#9dc3e6', '#a9d08e'],
  ['#a6a6a6', '#262626', '#494429', '#333f50', '#2e75b6', '#c55a11', '#7b7b7b', '#bf9000', '#1f4e79', '#548235'],
];
const FILL_SELECTED = '#bfdbfe'; // 연한 파랑

// [셀 서식] 대화상자 — 실제 엑셀과 비슷한 구성. 글꼴/채우기 탭을 눌러 볼 수 있다.
// [서식]을 누르면 기본으로 '글꼴' 탭이 열리고, 채우기 색은 [채우기] 탭에서 지정한다.
function CellFormatDialog() {
  const [tab, setTab] = useState('글꼴');
  const TABS = ['표시 형식', '맞춤', '글꼴', '테두리', '채우기', '보호'];
  const clickable = { 글꼴: true, 채우기: true };

  return (
    <Dlg title="셀 서식" width={364}>
      {/* 탭 줄 — 글꼴/채우기만 클릭 가능 */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 12, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const on = t === tab;
          const can = clickable[t];
          return (
            <span key={t} onClick={can ? () => setTab(t) : undefined} style={{
              padding: '5px 8px', fontSize: 12, fontWeight: on ? 800 : 400,
              color: on ? C.blueLight : can ? C.textMuted : C.textDim,
              borderBottom: on ? `2px solid ${C.blueDim}` : '2px solid transparent',
              cursor: can ? 'pointer' : 'default',
            }}>{t}</span>
          );
        })}
      </div>

      {/* 탭이 눌러진다는 안내 */}
      <div style={{ fontSize: 11, color: C.blueLight, marginBottom: 10, textAlign: 'center' }}>
        👆 <b>글꼴</b> · <b>채우기</b> 탭을 눌러 각각 확인해 보세요
      </div>

      {tab === '글꼴' ? (
        <>
          {/* 글꼴·크기는 조건부 서식에서 비활성(회색) → 목록 펼치지 않음.
              글꼴 스타일·밑줄만 종류 목록을 보이고, 색은 드롭다운. */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
            <FieldDisabled label="글꼴(F)" value="맑은 고딕" width={112} />
            <ListBox label="글꼴 스타일(O)" value="기울임꼴" width={100}
              items={['보통', '기울임꼴', '굵게', '굵은 기울임꼴']} />
            <FieldDisabled label="크기(S)" value="11" width={48} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
            <ListBox label="밑줄(U)" value="없음" width={112}
              items={['없음', '실선', '이중 실선', '회계용 실선', '회계용 이중']} />
            <DropRow label="색(C)" value="자동" swatch="#000000" />
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, lineHeight: 1.5 }}>
            ※ 회색으로 표시된 <b>글꼴 · 크기</b>는 조건부 서식에서 바꿀 수 없고, <b>글꼴 스타일 · 밑줄 · 색</b>만 지정합니다.
          </div>
        </>
      ) : (
        <>
          {/* 채우기 탭 — 배경색 팔레트 */}
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>배경색(C):</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: 8, background: '#0b1220', marginBottom: 8 }}>
            {PALETTE.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: ri === PALETTE.length - 1 ? 0 : 4 }}>
                {row.map((col, ci) => {
                  const sel = col === FILL_SELECTED;
                  return (
                    <span key={ci} style={{
                      width: 22, height: 16, background: col, borderRadius: 2, display: 'inline-block',
                      border: sel ? `2px solid ${C.blueLight}` : '1px solid rgba(255,255,255,0.15)',
                      boxShadow: sel ? '0 0 0 2px rgba(147,197,253,0.5)' : 'none',
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <DropRow label="무늬 색(A)" value="자동" swatch="#000000" />
            <DropRow label="무늬 스타일(P)" value="—" />
          </div>
          <div style={{ fontSize: 11, color: C.blueLight, marginBottom: 8 }}>
            선택한 색: <b>연한 파랑</b> <span style={{ background: FILL_SELECTED, borderRadius: 2, padding: '0 10px' }} />
          </div>
        </>
      )}

      {/* 미리 보기 — 현재 탭의 서식이 반영됨 */}
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>미리 보기</div>
      <div style={{
        background: tab === '채우기' ? FMT_FILL : '#0b1220',
        color: tab === '채우기' ? FMT_TEXT : C.text,
        fontWeight: 600, fontStyle: tab === '글꼴' ? 'italic' : 'normal', textAlign: 'center',
        border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 0', fontSize: 15,
      }}>가나다 AaBbCc</div>

      <DlgButtons primary={true} />
    </Dlg>
  );
}

// 단계별 상세 설명 — 버튼을 누르면 그 단계 설명으로 바뀐다.
const EXPLAIN = [
  {
    title: '① 서식을 적용할 영역 전체를 먼저 드래그해 선택합니다.',
    lines: [
      <><b style={{ color: C.blueLight }}>[B11:H18]</b> 범위를 선택합니다. 범위가 문제에 주어지지 않을 수도 있어 <b>'행 전체에 서식을 지정'</b> 이라는 말에서 유추합니다. 조건을 확인하는 곳은 <b>판매액 열</b>이지만, 서식을 적용하는 <b>'행 전체'</b>는 결국 데이터가 있는 <b>표의 전체 범위</b>입니다. 그래서 <b style={{ color: C.redLight }}>표의 제목(필드명) 행은 제외</b>하고 데이터 부분만 선택합니다. (제목은 조건을 확인하거나 서식을 입힐 대상이 아니기 때문)</>,
      <>다음은 <b>[홈] 탭 → [스타일] 그룹 → [조건부 서식]</b> 으로 들어갑니다.</>,
      <>범위를 잘못 잡으면 엉뚱한 셀에 서식이 들어갑니다.</>,
    ],
  },
  {
    title: '② 규칙 유형 선택',
    lines: [
      <><b>[새 규칙]</b> 에서 <b style={{ color: C.blueLight }}>'수식을 사용하여 서식을 지정할 셀 결정'</b> 을 고릅니다.</>,
      <><b>'셀 강조 규칙'</b>, <b>'상위/하위 규칙'</b> 도 있지만 실기 시험은 <b>거의 이 수식 유형</b>으로 출제됩니다.</>,
    ],
  },
  {
    title: '③ 수식 적기 — 먼저 "조건을 읽는 방법"부터 이해하기 (핵심)',
    lines: [
      <><b>수식을 쓰기 전에, 조건부 서식이 조건을 어떻게 읽는지부터 봅니다.</b> 엑셀은 <b>선택한 범위의 첫 번째 셀</b>부터 <b style={{ color: CHG }}>{'B11 → C11 → … → H11 → B12 → … → H18'}</b> 순서로, <b>자동으로 복사하듯 행과 열을 옮겨 가며</b> 조건을 판정합니다.</>,
      <>이 문제의 조건은 "<b>판매액이 2,000,000 이상</b>"이고, 판매액은 <b>F열</b>에 들어 있습니다. 그래서 조건이 참인지 거짓인지 실제로 읽어 보는 칸은 <b style={{ color: CHG }}>{'F11 → F12 → … → F18'}</b>, 즉 <b>F열의 11행부터 18행까지</b>입니다. 그리고 <b>행 전체</b>에 서식을 지정해야 하므로, 조건이 참이면 서식이 입혀지는 범위는 <b style={{ color: CHG }}>11행부터 18행까지</b>입니다. <b>이 범위를 먼저 머릿속에 그리는 게 시작</b>입니다.</>,
      <><b>바뀌면 안 되는 것은 고정($), 바뀌어야 하는 것은 그대로 둡니다.</b> 위에서 봤듯 <b>F열은 바뀌면 안 되므로 <span style={{ color: FIX }}>$를 붙여 고정($F)</span></b> 하고, <b>행 번호(11~18)는 바뀌어야 하므로 <span style={{ color: CHG }}>$를 붙이지 않습니다</span></b>. 이렇게 <b>맨 윗행(11) 기준</b>으로 한 줄만 쓰면 <b>{'=$F11>=2000000'}</b> — "F열은 그대로 두고 행만 바꿔 가며 2,000,000 이상인지 물어봐" 라는 뜻이 됩니다. (문자 비교면 <b>{'=$F11="합격"'}</b> 처럼 큰따옴표)</>,
      <><b>왜 이렇게 읽어야 하나 — 거꾸로 하면?</b> F에 $를 안 붙이면 <b>엑셀이 오른쪽으로 옮겨가며 조건을 확인하기 때문에</b> 참조가 <b style={{ color: C.redLight }}>G · H…로 밀려</b> 판매액이 아닌 엉뚱한 열을 읽고, 행까지 고정하면(<b style={{ color: C.redLight }}>{'$F$11'}</b>) 모든 행이 <b>11행 하나만</b> 읽어 결과가 전부 같아집니다. 그래서 <b>열만 고정($F11)</b> 이어야 합니다.</>,
      <>참조 종류 — <b>$F11</b>(열만 고정) · <b>$F$11</b>(완전 고정) · <b>F$11</b>(행만 고정). 입력 중 <b>F4</b> 로 순환합니다.</>,
    ],
  },
  {
    title: '④ 서식 적용',
    lines: [
      <><b>[서식]</b> 을 누르면 <b>[셀 서식]</b> 대화상자가 뜨고, 기본으로 <b>글꼴 탭</b>이 열립니다. 글꼴 탭에서 지정할 수 있는 서식은 <b>글꼴 스타일</b>(굵게 · 기울임꼴 등) · <b>밑줄</b> · <b>글꼴 색</b> 입니다.</>,
      <>단, 조건을 만족하는 <b>행 전체에 색을 채우는 것(채우기 색)</b>은 글꼴 탭에 없습니다. 채우기 색을 지정하려면 <b>[채우기] 탭</b>으로 옮겨 지정할 색상을 선택해야 합니다.</>,
      <><b>[확인]</b> 을 누르면 조건이 <b>참인 행 전체</b>에 지정한 서식이 적용됩니다.</>,
    ],
  },
];

function ExplainPanel({ slot }) {
  const e = EXPLAIN[slot];
  return (
    <div key={slot} style={{
      animation: 'cfFade .45s ease',
      background: C.blueCard, border: `1px solid ${C.blueDim}`, borderRadius: 10,
      padding: '14px 18px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.blueLight, marginBottom: 8, lineHeight: 1.5 }}>{e.title}</div>
      <ul style={{ margin: 0, paddingLeft: 20, color: C.text, fontSize: 15, lineHeight: 1.85 }}>
        {e.lines.map((ln, i) => <li key={i} style={{ marginBottom: 6 }}>{ln}</li>)}
      </ul>
    </div>
  );
}

// 오른쪽 무대: 단계별로 뜨는 대화상자
function StepStage({ slot }) {
  const info = { width: 300, background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' };
  const ttl = { fontSize: 12, color: C.textDim, fontWeight: 700, marginBottom: 8 };

  if (slot === 0) return null; // 범위 지정: 대화상자 없음 (표의 선택 범위로 표현)
  if (slot === 1) return <NewRuleDialog formulaFilled={false} />;
  if (slot === 2) return <NewRuleDialog formulaFilled={true} />;
  if (slot === 3) return <CellFormatDialog />;
  return (
    <div style={info}>
      <div style={{ ...ttl, color: C.green }}>완료 ✓</div>
      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
        판매액이 <b style={{ color: C.blueLight }}>2,000,000 이상</b>인 행이
        <span style={{ background: FMT_FILL, color: FMT_TEXT, fontWeight: 700, fontStyle: 'italic', borderRadius: 4, padding: '1px 6px', margin: '0 3px' }}>기울임꼴 · 연한 파랑 채우기</span>
        로 강조되었습니다.
      </div>
    </div>
  );
}

export function CondFormatStepsAnim() {
  // 자동 재생 없이, 단계 버튼을 눌러 해당 단계로 이동한다.
  const [slot, setSlot] = useState(0);

  const selBright = slot === 0;
  const applyFmt = slot >= 3;      // 서식 적용 단계 (기울임꼴 + 연한 파랑 채우기)
  const showCondCol = slot >= 2;   // 판매액(F) 열을 조건 확인 열로 강조

  const cellBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: 30, fontSize: 12, padding: '4px 4px', whiteSpace: 'nowrap',
  };

  return (
    <Wrap>
      {/* 단계 전환 페이드 */}
      <style>{'@keyframes cfFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>

      <Title>조건부 서식 — 4단계로 실제 문제 풀기</Title>

      {/* 문제 (여기 한 번만 표시) — 실제 컴활 실기 문제 형식 */}
      <div style={{
        background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8,
        padding: '14px 18px', marginBottom: 16, fontSize: 17, color: C.text, lineHeight: 1.8,
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: C.amber, fontWeight: 800, marginRight: 8, fontSize: 15 }}>문제</span>
          <b style={{ color: C.blueLight }}>[B11:H18]</b>에서 판매액[<b style={{ color: C.blueLight }}>F11:F18</b>]이
          <b style={{ color: C.blueLight }}> 2,000,000 이상</b>인 행 전체에 대하여
          글꼴 스타일 <b style={{ fontStyle: 'italic' }}>'기울임꼴'</b>,
          채우기 색 <b style={{ color: C.blueLight }}>'연한 파랑'</b>을 적용하는
          <b> 조건부 서식</b>을 작성하시오.
        </div>
        <div style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7 }}>
          <div>▶ 규칙 유형은 <b style={{ color: C.text }}>'수식을 사용하여 서식을 지정할 셀 결정'</b>을 사용하시오.</div>
          <div>▶ 하나의 규칙으로만 작성하시오.</div>
        </div>
      </div>

      {/* 단계 버튼 — 눌러서 이동 */}
      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 아래 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={s.n} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      {/* 현재 단계 상세 설명 (버튼 클릭 시 바뀜) */}
      <ExplainPanel slot={slot} />

      {/* 무대: 표 + 대화상자 */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 사원 실적표 */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {/* 열 문자 머리글 (B~H) */}
          <div style={{ display: 'grid', gridTemplateColumns: EMP_GRID }}>
            <div style={{ ...cellBase, background: '#0b1220', minHeight: 22 }} />
            {EMP_LETTERS.map((L, i) => (
              <div key={L} style={{
                ...cellBase, minHeight: 22, background: '#0b1220', fontWeight: 700,
                color: i === COND_IDX ? C.blueLight : C.textDim,
                borderRight: i === EMP_LETTERS.length - 1 ? 'none' : `1px solid ${C.border}`,
              }}>{L}</div>
            ))}
          </div>

          {/* 필드명(제목) 행 = 10행 — 선택 제외 */}
          <div style={{ display: 'grid', gridTemplateColumns: EMP_GRID }}>
            <div style={{ ...cellBase, background: '#0b1220', color: C.redLight, fontWeight: 700 }}>10</div>
            {EMP_HEAD.map((h, i) => (
              <div key={h} style={{
                ...cellBase, background: '#2a0f10', color: C.redLight, fontWeight: 700,
                borderRight: i === EMP_HEAD.length - 1 ? 'none' : `1px solid ${C.border}`,
              }}>{h}</div>
            ))}
          </div>

          {/* 데이터 영역 (선택 범위 = B11:H18) */}
          <div style={{ position: 'relative' }}>
            {EMP_ROWS.map((r) => {
              const pass = Number(String(r.v[COND_IDX]).replace(/,/g, '')) >= COND_NUM;
              const applied = applyFmt && pass;  // 행 전체 기울임꼴 + 연한 파랑 채우기
              return (
                <div key={r.rn} style={{ display: 'grid', gridTemplateColumns: EMP_GRID }}>
                  <div style={{ ...cellBase, background: '#0b1220', fontWeight: 700, color: applied ? C.blueLight : C.textMuted }}>{r.rn}</div>
                  {r.v.map((val, i) => {
                    const isCond = i === COND_IDX;
                    const markCond = isCond && showCondCol && !applied;
                    return (
                      <div key={i} style={{
                        ...cellBase,
                        borderRight: i === r.v.length - 1 ? 'none' : `1px solid ${C.border}`,
                        // 서식 적용: 연한 파랑 채우기 + 기울임꼴
                        background: applied ? FMT_FILL : markCond ? '#0e1a33' : 'transparent',
                        color: applied ? FMT_TEXT : isCond ? C.text : C.textMuted,
                        fontWeight: applied ? 600 : isCond ? 700 : 400,
                        fontStyle: applied ? 'italic' : 'normal',
                        boxShadow: markCond ? `inset 0 0 0 1px ${C.blueDim}` : 'none',
                        transition: 'all .45s',
                      }}>{val}</div>
                    );
                  })}
                </div>
              );
            })}

            {/* 선택 범위 오버레이 — 행 번호 열(28px)은 제외하고 B11:H18(데이터 열)만 */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, left: 28, pointerEvents: 'none',
              border: `2px dashed ${C.blue}`, borderRadius: 4,
              opacity: selBright ? 1 : slot < STEPS.length ? 0.4 : 0,
              boxShadow: selBright ? '0 0 0 3px rgba(96,165,250,0.15)' : 'none',
              transition: 'opacity .4s',
            }} />
          </div>

        </div>

        {/* 단계별 대화상자 (전환 시 부드럽게 페이드) */}
        <div key={slot} style={{ animation: 'cfFade .55s ease' }}>
          <StepStage slot={slot} />
        </div>
      </div>
    </Wrap>
  );
}

/* ─────────────── 조건식 만들기 연습 (개념학습 2) ─────────────── */
// 개념학습 1과 '똑같은' 사원별 판매 현황 표(B~H열, 11~18행)를 그대로 쓴다.
// 표는 클릭하면 셀이 선택되고, 입력창이 열려 있으면 그 셀 주소가 입력창에 삽입된다.
// 입력창에서 F4를 누르면 커서 위치의 참조가 순환(A1→$A$1→A$1→$A1)된다.
// 각 문제는 조건만 다르며, 채점은 문자열 비교로 하고 오답 시 정답은 보여주지 않는다.

// 입력 정규화: 공백 제거 · 굽은 따옴표 → 곧은 따옴표 · 대문자화. (앞의 = 는 유지)
function normCF(s) {
  return String(s).replace(/\s+/g, '').replace(/[“”]/g, '"').toUpperCase();
}

const CF_PROBLEMS = [
  {
    cond: <>직급[<b>E11:E18</b>]이 <b>'과장'</b>인</>,
    note: null,
    answers: ['=$E11="과장"'],
  },
  {
    cond: <>달성률[<b>H11:H18</b>]이 <b>100% 미만</b>인</>,
    note: null,
    answers: ['=$H11<100%', '=$H11<1'],
  },
  {
    cond: <>성명[<b>C11:C18</b>]의 성(첫 글자)이 <b>'김'</b>인</>,
    note: '(LEFT 함수 사용)',
    answers: ['=LEFT($C11,1)="김"'],
  },
  {
    cond: <>직급[<b>E11:E18</b>]이 <b>'과장'</b>이면서 판매액[<b>F11:F18</b>]이 목표[<b>G11:G18</b>]보다 <b>큰</b></>,
    note: '(AND 함수 사용)',
    answers: ['=AND($E11="과장",$F11>$G11)', '=AND($F11>$G11,$E11="과장")'],
  },
  {
    cond: <>판매액[<b>F11:F18</b>]이 <b>판매액의 평균 이상</b>인</>,
    note: '(AVERAGE 함수 사용)',
    answers: ['=$F11>=AVERAGE($F$11:$F$18)'],
  },
];

// 개념학습 1과 동일한 표 — 클릭하면 셀 주소, 드래그하면 범위(F11:F18)가 삽입된다.
function EmpClickTable({ selected, rangeBox, onCellMouseDown }) {
  const cellBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: 28, fontSize: 12, padding: '4px 4px', whiteSpace: 'nowrap',
  };
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', margin: '0 auto 18px', width: 'fit-content', maxWidth: '100%' }}>
      {/* 열 문자 머리글 B~H */}
      <div style={{ display: 'grid', gridTemplateColumns: EMP_GRID, minWidth: 470 }}>
        <div style={{ ...cellBase, background: '#0b1220', minHeight: 22 }} />
        {EMP_LETTERS.map((L, i) => (
          <div key={L} style={{
            ...cellBase, minHeight: 22, background: '#0b1220', fontWeight: 700, color: C.textDim,
            borderRight: i === EMP_LETTERS.length - 1 ? 'none' : `1px solid ${C.border}`,
          }}>{L}</div>
        ))}
      </div>
      {/* 필드명(제목) 행 = 10행 */}
      <div style={{ display: 'grid', gridTemplateColumns: EMP_GRID, minWidth: 470 }}>
        <div style={{ ...cellBase, background: '#0b1220', color: C.textMuted, fontWeight: 700 }}>10</div>
        {EMP_HEAD.map((h, i) => (
          <div key={h} style={{
            ...cellBase, background: '#111c33', color: C.blueLight, fontWeight: 700,
            borderRight: i === EMP_HEAD.length - 1 ? 'none' : `1px solid ${C.border}`,
          }}>{h}</div>
        ))}
      </div>
      {/* 데이터 11~18행 — 클릭 가능 */}
      {EMP_ROWS.map((r) => (
        <div key={r.rn} style={{ display: 'grid', gridTemplateColumns: EMP_GRID, minWidth: 470 }}>
          <div style={{ ...cellBase, background: '#0b1220', fontWeight: 700, color: C.textMuted }}>{r.rn}</div>
          {r.v.map((val, i) => {
            const sel = selected && selected.rn === r.rn && selected.ci === i;
            const inRange = rangeBox
              && r.rn >= rangeBox.minRn && r.rn <= rangeBox.maxRn
              && i >= rangeBox.minCi && i <= rangeBox.maxCi;
            const hi = sel || inRange;
            return (
              <div key={i}
                data-emp-rn={r.rn}
                data-emp-ci={i}
                onMouseDown={(e) => onCellMouseDown(e, i, r.rn)}
                style={{
                  ...cellBase, cursor: 'cell', color: C.text,
                  background: hi ? '#0e2a4a' : 'transparent',
                  boxShadow: hi ? `inset 0 0 0 2px ${C.blue}` : 'none',
                  borderRight: i === r.v.length - 1 ? 'none' : `1px solid ${C.border}`,
                }}>{val}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CFProblem({ n, cond, note, answers, registerActive }) {
  const [val, setVal] = useState('');
  const [res, setRes] = useState(null); // null|'empty'|'ok'|'near'|'no'
  const inputRef = useRef(null);
  const valRef = useRef('');
  valRef.current = val;
  const pendingCursor = useRef(null);
  const apiRef = useRef(null);
  // 직전에 '셀 클릭'으로 넣은 주소 구간 {start,end,addr}. 사이에 입력 없이 또 클릭하면 교체.
  const lastInsertRef = useRef(null);

  // 커서 위치 복원 (셀 삽입 · F4 후)
  useEffect(() => {
    if (pendingCursor.current != null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
  }, [val]);

  if (!apiRef.current) {
    apiRef.current = {
      // 범위 드래그 시작 시점의 커서 위치를 기억해 두기 위한 조회
      getCursor: () => inputRef.current?.selectionStart ?? valRef.current.length,
      // 셀을 드래그해 선택한 '범위 주소'(F11:F18)를 지정 위치에 그대로 삽입
      insertRange: (addr, atPos) => {
        const inp = inputRef.current;
        let cur = valRef.current;
        let pos = atPos != null ? atPos : (inp?.selectionStart ?? cur.length);
        if (cur === '') { cur = '='; pos = 1; }   // 비어 있으면 = 로 시작
        else if (pos < 1) pos = 1;                 // = 앞에는 넣지 않음
        const nv = cur.slice(0, pos) + addr + cur.slice(pos);
        lastInsertRef.current = null;              // 범위 삽입 후에는 교체 대상 없음
        pendingCursor.current = pos + addr.length;
        setVal(nv);
        setRes(null);
        setTimeout(() => inp?.focus(), 0);
      },
      // 표의 셀을 클릭했을 때 이 입력창에 주소 삽입
      insert: (addr) => {
        const inp = inputRef.current;
        let cur = valRef.current;
        let pos = inp?.selectionStart ?? cur.length;
        const li = lastInsertRef.current;
        // 직전 삽입 직후(커서가 그 끝, 구간이 그대로)면 반복 삽입 대신 '교체'
        if (li && pos === li.end && cur.slice(li.start, li.end) === li.addr) {
          const nv = cur.slice(0, li.start) + addr + cur.slice(li.end);
          const end = li.start + addr.length;
          lastInsertRef.current = { start: li.start, end, addr };
          pendingCursor.current = end;
          setVal(nv);
          setRes(null);
          setTimeout(() => inp?.focus(), 0);
          return;
        }
        if (cur === '') { cur = '='; pos = 1; }      // 비어 있으면 = 로 시작
        const start = pos;
        const nv = cur.slice(0, pos) + addr + cur.slice(pos);
        const end = pos + addr.length;
        lastInsertRef.current = { start, end, addr };
        pendingCursor.current = end;
        setVal(nv);
        setRes(null);
        setTimeout(() => inp?.focus(), 0);
      },
    };
  }

  const onKey = (e) => {
    if (e.key === 'F4') {
      e.preventDefault();
      const cur = valRef.current;
      if (!cur.startsWith('=')) return;
      lastInsertRef.current = null; // F4로 참조가 바뀌면 교체 대상 무효화
      const pos = inputRef.current?.selectionStart ?? cur.length;
      const { formula, cursorPos } = cycleReference(cur, pos);
      pendingCursor.current = cursorPos;
      setVal(formula);
      setRes(null);
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); check(); }
  };

  const check = () => {
    const inN = normCF(valRef.current);
    if (!inN || inN === '=') { setRes('empty'); return; }
    if (answers.some((a) => normCF(a) === inN)) { setRes('ok'); return; }
    // $(열 고정)만 빠진 경우의 안내는 1번 문제에서만 준다.
    const near = n === 1 && answers.some((a) => normCF(a).replace(/\$/g, '') === inN.replace(/\$/g, ''));
    setRes(near ? 'near' : 'no');
  };

  const resView = () => {
    if (!res || res === 'empty') {
      return res === 'empty'
        ? <span style={{ color: C.amber, fontSize: 13 }}>조건식을 입력한 뒤 [답 확인]을 누르세요.</span>
        : null;
    }
    const map = {
      ok: { color: C.green, icon: '✓', msg: '정답입니다!' },
      near: { color: C.amber, icon: '≈', msg: '조건은 맞지만, 행 전체 서식에는 기준 열을 $로 고정해야 합니다.' },
      no: { color: C.redLight, icon: '✗', msg: '다시 확인해 보세요.' },
    }[res];
    return <span style={{ color: map.color, fontWeight: 800, fontSize: 13 }}>{map.icon} {map.msg}</span>;
  };

  const border = res === 'ok' ? C.green : res === 'no' ? C.red : res === 'near' ? C.amber : C.border;

  return (
    <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 15, color: C.text, lineHeight: 1.7, marginBottom: 4 }}>
        <span style={{ color: C.amber, fontWeight: 800, marginRight: 8, fontSize: 13 }}>문제 {n}</span>
        <b style={{ color: C.blueLight }}>[B11:H18]</b>에서 {cond} 행 전체에 <b style={{ fontStyle: 'italic' }}>기울임꼴</b> · <b style={{ color: C.blueLight }}>연한 파랑</b> 서식을 지정하는 조건식을 작성하시오.
        {note && <span style={{ color: C.textMuted }}> {note}</span>}
      </div>
      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 10 }}>
        ▶ 규칙 유형은 <b style={{ color: C.text }}>'수식을 사용하여 서식을 지정할 셀 결정'</b>을 사용하시오.
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          value={val}
          onChange={(e) => { lastInsertRef.current = null; setVal(e.target.value); setRes(null); }}
          onKeyDown={onKey}
          onFocus={() => registerActive(apiRef.current)}
          onBlur={() => registerActive(apiRef.current, true)}
          placeholder="예) =$F11>=2000000  (표의 셀을 클릭해 넣고 F4로 $ 고정)"
          spellCheck={false}
          style={{
            flex: 1, minWidth: 220, background: '#0b1220', color: '#fff',
            border: `1px solid ${border}`, borderRadius: 8, padding: '9px 12px',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={check} style={{
          background: C.blueDim, color: '#fff', border: 'none', borderRadius: 8,
          padding: '9px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>답 확인</button>
      </div>
      <div style={{ marginTop: 8, minHeight: 20 }}>{resView()}</div>
    </div>
  );
}

export function CondFormatPracticeAnim() {
  const [selected, setSelected] = useState(null);   // {rn, ci}
  const [dragStart, setDragStart] = useState(null); // 범위 드래그 시작 셀 {rn, ci}
  const [hoverCell, setHoverCell] = useState(null); // 범위 드래그 중 현재 셀 {rn, ci}
  const activeRef = useRef(null); // 현재 포커스된 입력창의 api
  const dragRef = useRef(null);   // { startRn, startCi, cursor } — 드래그 진행 상태
  const hoverRef = useRef(null);

  const registerActive = (api, isBlur = false) => {
    if (isBlur) { if (activeRef.current === api) activeRef.current = null; }
    else activeRef.current = api;
  };

  // 셀 드래그로 범위(F11:F18)를 선택 → mouseup 시 입력창에 삽입.
  // MiniExcel과 동일하게 mousedown~mouseup 동안 hover 셀을 추적한다.
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest?.('[data-emp-rn]');
      if (!cell) return;
      const rn = parseInt(cell.dataset.empRn, 10);
      const ci = parseInt(cell.dataset.empCi, 10);
      if (isNaN(rn) || isNaN(ci)) return;
      if (hoverRef.current?.rn === rn && hoverRef.current?.ci === ci) return;
      hoverRef.current = { rn, ci };
      setHoverCell({ rn, ci });
    }
    function onUp() {
      const d = dragRef.current;
      if (!d) return;
      const tgt = hoverRef.current || { rn: d.startRn, ci: d.startCi };
      const api = activeRef.current;
      if (api) {
        const r1 = Math.min(d.startRn, tgt.rn), r2 = Math.max(d.startRn, tgt.rn);
        const c1 = Math.min(d.startCi, tgt.ci), c2 = Math.max(d.startCi, tgt.ci);
        const a1 = `${EMP_LETTERS[c1]}${r1}`;
        if (r1 === r2 && c1 === c2) api.insert(a1);                 // 단일 셀 클릭
        else api.insertRange(`${a1}:${EMP_LETTERS[c2]}${r2}`, d.cursor); // 범위
      }
      dragRef.current = null;
      hoverRef.current = null;
      setDragStart(null);
      setHoverCell(null);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleCellMouseDown = (e, ci, rn) => {
    setSelected({ rn, ci });
    const api = activeRef.current;
    if (api) {
      e.preventDefault(); // 입력창 포커스(및 커서 위치) 유지
      dragRef.current = { startRn: rn, startCi: ci, cursor: api.getCursor() };
      hoverRef.current = { rn, ci };
      setDragStart({ rn, ci });
      setHoverCell({ rn, ci });
    }
  };

  const rangeBox = dragStart && hoverCell ? {
    minRn: Math.min(dragStart.rn, hoverCell.rn),
    maxRn: Math.max(dragStart.rn, hoverCell.rn),
    minCi: Math.min(dragStart.ci, hoverCell.ci),
    maxCi: Math.max(dragStart.ci, hoverCell.ci),
  } : null;

  return (
    <Wrap>
      <Title>조건식 만들기 연습</Title>
      <Subtitle>표의 셀을 클릭하면 주소가, 여러 셀을 드래그하면 범위(F11:F18)가 입력창에 들어갑니다. F4로 $ 고정을 순환하고, 조건식을 만들어 [답 확인]하세요</Subtitle>
      <EmpClickTable selected={selected} rangeBox={rangeBox} onCellMouseDown={handleCellMouseDown} />
      {CF_PROBLEMS.map((p, i) => (
        <CFProblem key={i} n={i + 1} registerActive={registerActive} {...p} />
      ))}
    </Wrap>
  );
}
