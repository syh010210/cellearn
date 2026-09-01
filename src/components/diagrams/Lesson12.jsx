// 12차시 — 정렬 애니메이션.
// 조건부 서식(Lesson11)과 같은 방식으로, 단계 버튼을 누르면 실제 작업 순서대로
// 표 선택 → [데이터] 정렬 및 필터 그룹 → [정렬] 대화상자 순으로 화면이 바뀐다.
// · SortBasicStepsAnim (개념1): 오름/내림차순 + 다중 기준(기준 추가) 기본 정렬 3단계
// · SortStepsAnim (개념2): 사용자 지정 목록 + 셀 색 정렬 5단계
// 리본/대화상자 모양은 lesson-12.png · lesson-12_1.png 를 그대로 본떴다.
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Wrap, Title, C } from './shared.jsx';

const LIGHT_BLUE = '#bfdbfe';  // 도서명 셀에 채우는 연한 파랑 (RGB 191,219,254) — 개념1·2 공용

// ─── 공통 UI ───────────────────────────────────────────────────────────────
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

function ExplainBox({ e }) {
  return (
    <div style={{
      animation: 'sortFade .45s ease',
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

// 드롭다운 셀 (열/정렬기준/순서). grow=true 면 칸을 가득 채운다.
function Drop({ value, w, grow, hi, swatch }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'space-between',
      border: `1px solid ${hi ? C.blueDim : C.border}`, borderRadius: 4,
      background: hi ? '#0e1a33' : '#0b1220', padding: '5px 7px',
      width: grow ? '100%' : w, flexShrink: 0, boxSizing: 'border-box',
      boxShadow: hi ? '0 0 0 2px rgba(59,130,246,0.35)' : 'none',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: hi || value ? C.text : C.textDim, fontWeight: hi ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {swatch && <span style={{ width: 20, height: 12, background: swatch, border: `1px solid ${C.border}`, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />}
        {value || ' '}
      </span>
      <span style={{ fontSize: 9, color: C.textDim }}>▼</span>
    </div>
  );
}

// [정렬] 대화상자 — lesson-12_1.png 구성 그대로.
// 상단 툴바(기준 추가/삭제/복사, ∧∨, 옵션, 머리글 표시) + 세로 막대형/정렬 기준/정렬 열 + 확인/취소.
function SortDialog({ criteria, hiLevel = -1, showAddHint = false }) {
  const TCOLS = '1fr 116px 176px';
  const tb = (label, hi) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      border: `1px solid ${hi ? C.blueDim : 'transparent'}`, borderRadius: 5,
      padding: '4px 8px', fontSize: 12, fontWeight: hi ? 800 : 600,
      color: hi ? '#fff' : C.textMuted, background: hi ? C.blueDim : 'transparent',
      boxShadow: hi ? '0 0 0 2px rgba(59,130,246,0.4)' : 'none', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
  const headCell = (t) => (
    <div style={{ padding: '6px 9px', fontSize: 12, fontWeight: 700, color: C.textMuted, borderRight: `1px solid ${C.border}` }}>{t}</div>
  );

  return (
    <div style={{
      width: 470, flexShrink: 0, background: '#0b1220', border: `1px solid ${C.blueDim}`, borderRadius: 8,
      overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
    }}>
      {/* 제목 표시줄 */}
      <div style={{ background: C.blueBg, borderBottom: `1px solid ${C.blueDim}`, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.blueLight, letterSpacing: 2 }}>정렬</span>
        <span style={{ fontSize: 12, color: C.textDim }}>?&nbsp;&nbsp;✕</span>
      </div>

      <div style={{ padding: '10px 12px 12px' }}>
        {/* 툴바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {tb('＋ 기준 추가(A)', showAddHint)}
          {tb('✕ 기준 삭제(D)')}
          {tb('⧉ 기준 복사(C)')}
          <span style={{ width: 1, height: 18, background: C.border, margin: '0 2px' }} />
          {tb('∧')}{tb('∨')}
          {tb('옵션(O)…')}
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 3, background: C.blueDim, color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>
            내 데이터에 머리글 표시(H)
          </span>
        </div>

        {/* 열 머리글 */}
        <div style={{ display: 'grid', gridTemplateColumns: TCOLS, background: '#111c33', border: `1px solid ${C.border}`, borderBottom: 'none' }}>
          {headCell('세로 막대형')}{headCell('정렬 기준')}
          <div style={{ padding: '6px 9px', fontSize: 12, fontWeight: 700, color: C.textMuted }}>정렬</div>
        </div>

        {/* 기준 행들 */}
        <div style={{ border: `1px solid ${C.border}` }}>
          {criteria.map((cr, i) => {
            const hi = i === hiLevel;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: TCOLS,
                borderTop: i === 0 ? 'none' : `1px solid ${C.border}`,
                background: hi ? 'rgba(59,130,246,0.10)' : 'transparent',
              }}>
                {/* 세로 막대형: '정렬 기준'/'다음 기준' 라벨 + 열 드롭다운 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRight: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.textDim, whiteSpace: 'nowrap', flexShrink: 0 }}>{i === 0 ? '정렬 기준' : '다음 기준'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><Drop value={cr.col} grow hi={hi && cr.hiCol} /></div>
                </div>
                <div style={{ padding: '7px 8px', borderRight: `1px solid ${C.border}` }}>
                  <Drop value={cr.sortOn} grow hi={hi && cr.hiSortOn} swatch={cr.sortOn === '셀 색' ? (cr.colorSwatch || LIGHT_BLUE) : undefined} />
                </div>
                <div style={{ padding: '7px 8px' }}>
                  {cr.sortOn === '셀 색' ? (
                    // 정렬 기준이 '셀 색'이면 정렬 칸이 [색 선택]+[위에/아래 표시] 두 칸으로 나뉜다 (lesson-12_2.png)
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ width: 66, flexShrink: 0 }}>
                        <Drop value={cr.colorSwatch ? '' : '셀 색 없음'} grow hi={hi && cr.hiOrder} swatch={cr.colorSwatch} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Drop value={cr.order} grow hi={hi && cr.hiOrder} />
                      </div>
                    </div>
                  ) : (
                    <Drop value={cr.order} grow hi={hi && cr.hiOrder} swatch={cr.orderSwatch} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 확인 / 취소 */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
          <span style={{ background: C.blueDim, color: '#fff', border: `1px solid ${C.blueDim}`, borderRadius: 6, padding: '6px 20px', fontSize: 13, fontWeight: 700, boxShadow: '0 0 0 2px rgba(59,130,246,0.4)' }}>확인</span>
          <span style={{ background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 20px', fontSize: 13, fontWeight: 700 }}>취소</span>
        </div>
      </div>
    </div>
  );
}

// [사용자 지정 목록] 대화상자
function CustomListDialog({ items = [] }) {
  const presets = ['새 목록', '일, 월, 화, 수, 목, 금, 토', 'Jan, Feb, Mar, Apr, …', '1월, 2월, 3월, …'];
  return (
    <div style={{ width: 360, background: '#0b1220', border: `1px solid ${C.blueDim}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,0,0,0.55)' }}>
      <div style={{ background: C.blueBg, borderBottom: `1px solid ${C.blueDim}`, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.blueLight }}>사용자 지정 목록</span>
        <span style={{ fontSize: 12, color: C.textDim }}>?&nbsp;&nbsp;✕</span>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 150, flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>사용자 지정 목록(L):</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, background: '#0b1220', height: 118, overflow: 'hidden' }}>
              {presets.map((p, i) => (
                <div key={i} style={{
                  padding: '4px 7px', fontSize: 11,
                  background: i === 0 ? C.blueDim : 'transparent',
                  color: i === 0 ? '#fff' : C.textMuted, fontWeight: i === 0 ? 700 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>목록 항목(E):</div>
            <div style={{
              border: `1px solid ${C.blueDim}`, borderRadius: 4, background: '#0e1a33',
              height: 118, padding: '7px 9px', fontSize: 13, color: '#fff', lineHeight: 1.9,
              boxShadow: '0 0 0 2px rgba(59,130,246,0.3)',
            }}>
              {items.map((p) => <div key={p}>{p}</div>)}
              <span style={{ display: 'inline-block', width: 1, height: 15, background: C.blueLight, verticalAlign: 'middle', animation: 'sortCaret 1s step-end infinite' }} />
            </div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 20 }}>
            <span style={{ background: C.blueDim, color: '#fff', border: `1px solid ${C.blueDim}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 800, textAlign: 'center', boxShadow: '0 0 0 2px rgba(59,130,246,0.4)' }}>추가(A)</span>
            <span style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', fontSize: 12, color: C.textMuted, textAlign: 'center' }}>삭제(D)</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.blueLight, margin: '10px 0 0', lineHeight: 1.5 }}>
          👉 원하는 순서대로 한 줄에 하나씩 입력하고 <b>[추가]</b> → 목록으로 등록됩니다. (데이터 값과 글자가 정확히 같아야 함)
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <span style={{ background: C.blueDim, color: '#fff', border: `1px solid ${C.blueDim}`, borderRadius: 6, padding: '5px 16px', fontSize: 13, fontWeight: 700, boxShadow: '0 0 0 2px rgba(59,130,246,0.4)' }}>확인</span>
          <span style={{ color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 16px', fontSize: 13, fontWeight: 700 }}>취소</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── [데이터] 탭 · 정렬 및 필터 그룹 리본 (lesson-12.png) ─────────────── */
// 왼쪽: 텍스트 오름/내림차순 빠른 버튼 + 큰 [정렬] · 구분선 · [필터] · 지우기/다시 적용/고급.
export function SortFilterRibbon({ hiSort = false, onSortClick }) {
  // 오름/내림차순 빠른 버튼 아이콘 (ㄱ/ㅎ 을 위아래로, 오른쪽에 아래 화살표)
  const QuickBtn = ({ top, bottom, hi }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: '2px 5px', borderRadius: 4,
      border: `1px solid ${hi ? C.blueDim : C.border}`, background: '#0e1a33',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontSize: 11, fontWeight: 800, color: C.blueLight }}>
        <span>{top}</span><span>{bottom}</span>
      </div>
      <span style={{ fontSize: 13, color: C.blueLight, fontWeight: 800 }}>↓</span>
    </div>
  );
  const BigBtn = ({ icon, label, hi, onClick }) => (
    <div onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 12px',
      borderRadius: 6, border: `1px solid ${hi ? C.blueDim : C.border}`,
      background: hi ? C.blueDim : '#0e1a33', boxShadow: hi ? '0 0 0 3px rgba(59,130,246,0.35)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <span style={{ fontSize: 18, color: hi ? '#fff' : C.blueLight, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: hi ? '#fff' : C.text }}>{label}</span>
    </div>
  );
  const SmallRow = ({ icon, label, dim }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px' }}>
      <span style={{ fontSize: 12, color: dim ? C.textDim : C.blueLight, width: 14, textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: 12, color: dim ? C.textDim : C.text, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'inline-block', background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px 4px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* 좌: 빠른 정렬 + 정렬 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <QuickBtn top="ㄱ" bottom="ㅎ" />
            <QuickBtn top="ㅎ" bottom="ㄱ" />
          </div>
          <BigBtn icon="⇅" label="정렬" hi={hiSort} onClick={onSortClick} />
        </div>
        <span style={{ width: 1, alignSelf: 'stretch', background: C.border }} />
        {/* 우: 필터 + 지우기/다시적용/고급 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BigBtn icon={
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke={C.blueLight} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
              <path d="M3 4 H17 L12 10 V16 L8 14 V10 Z" />
            </svg>
          } label="필터" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <SmallRow icon="✕" label="지우기" dim />
            <SmallRow icon="↻" label="다시 적용" dim />
            <SmallRow icon="⚙" label="고급" />
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 11, color: C.textDim, marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 3 }}>
        정렬 및 필터
      </div>
    </div>
  );
}

/* ─────────────── 기본 정렬(오름/내림 + 다중 기준) 3단계 · 개념1 ─────────────── */
// 문제: '분류'를 오름차순으로 정렬하고, 동일한 분류면 '가격'의 내림차순으로 정렬.
// 6개 열(도서명·분류·출판사·대출수·가격·재고량)을 가진 표. 열 문자·행 번호까지 그려
// '표 전체(제목 포함) 선택'이 곧 범위 선택이라는 점을 보여준다.
const BOOK_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BOOK_HEAD = ['도서명', '분류', '출판사', '대출수', '가격', '재고량'];
const BOOK_HEAD_RN = 2;                     // 제목 행의 엑셀 행 번호
const BOOK = [
  { rn: 3, v: ['파이썬입문', '과학', '한빛', 12, 22000, 8], blue: true },  // 도서명 셀 연한 파랑
  { rn: 4, v: ['은하수여행', '소설', '창비', 8, 15000, 5] },
  { rn: 5, v: ['상대성이론', '과학', '길벗', 15, 25000, 3] },
  { rn: 6, v: ['조선왕조실록', '역사', '창비', 5, 20000, 6] },
  { rn: 7, v: ['삼체', '소설', '한빛', 20, 18000, 10] },
  { rn: 8, v: ['로마제국사', '역사', '미진', 3, 28000, 2], blue: true },  // 도서명 셀 연한 파랑
];
const CAT_ORDER = ['과학', '소설', '역사'];   // 분류 오름차순(가나다)
const CAT_COLOR = { 과학: C.blue, 소설: C.green, 역사: C.amber };
const CAT_IDX = 1, PRICE_IDX = 4;            // 정렬 키 열 인덱스
// 1차: 분류 오름차순만 (같은 분류 안은 원래 순서 유지 — 안정 정렬)
const BOOK_SORT_CAT = [...BOOK].sort((a, b) => CAT_ORDER.indexOf(a.v[CAT_IDX]) - CAT_ORDER.indexOf(b.v[CAT_IDX]));
// 2차(최종): 분류 오름차순 → 동일 분류면 가격 내림차순
const BOOK_SORTED = [...BOOK].sort((a, b) => {
  const c = CAT_ORDER.indexOf(a.v[CAT_IDX]) - CAT_ORDER.indexOf(b.v[CAT_IDX]);
  if (c !== 0) return c;
  return b.v[PRICE_IDX] - a.v[PRICE_IDX];
});
const BOOK_GRID = '30px 96px 52px 62px 56px 70px 58px';
const RN_W = 30;                                        // 행번호 열 너비 (고정)
const DATA_GRID = '96px 52px 62px 56px 70px 58px';      // 행번호 제외한 데이터 6열
const won = (n) => (typeof n === 'number' ? n.toLocaleString('ko-KR') : n);

const BASIC_STEPS = [
  { n: '①', label: '범위 선택' },
  { n: '②', label: '정렬 실행' },
  { n: '③', label: '대화상자 값 넣기' },
];

const BASIC_EXPLAIN = [
  {
    title: '① 표 전체(제목 행 포함)를 드래그해 선택합니다.',
    lines: [
      <>범위 선택의 핵심은 <b style={{ color: C.blueLight }}>표의 전체를 선택</b>하는 것이며, <b style={{ color: C.blueLight }}>표의 제목(머리글) 행도 함께 포함</b>해야 합니다. (아래 표에서 <b>제목 행(2행)부터 마지막 데이터 행까지</b> 점선으로 선택된 모습)</>,
      <>표 안의 아무 셀이나 클릭한 뒤 정렬 버튼을 누르게 되면 엑셀이 <b>연속된 표 범위를 자동으로 인식</b>하기도 하지만, 시험에서는 <b style={{ color: C.blueLight }}>표 전체를 직접 드래그해 선택</b>하는 습관이 안전합니다.</>,
    ],
  },
  {
    title: '② [데이터] 탭 → [정렬 및 필터] 그룹 → [정렬] 을 누릅니다.',
    lines: [
      <>아래 리본의 <b style={{ color: C.blueLight }}>[정렬 및 필터]</b> 그룹에서 큰 <b>[정렬]</b> 버튼을 누르면 정렬 대화상자가 열립니다.</>,
      <>시험 문제는 대부분 <b style={{ color: C.blueLight }}>[정렬] 대화상자 안에서</b> 정렬 기준을 지정합니다.</>,
    ],
  },
  {
    title: '③ 문제를 읽고 정렬 대화상자의 값을 맞게 넣습니다.',
    lines: [
      <>정렬 기준이 <b>두 개</b>이므로 <b>[기준 추가]</b>로 기준을 쌓습니다. <b>첫째 기준</b> = 분류·셀 값·오름차순, <b>둘째 기준</b> = 가격·셀 값·내림차순.</>,
      <>
        <b style={{ color: C.amber }}>정렬 기준이 여러 개인 경우 — 같은 뜻, 다른 말투에 주의</b>
        <div style={{ margin: '7px 0 8px', padding: '9px 13px', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, lineHeight: 1.95, color: C.textMuted, fontSize: 14 }}>
          <div>· "분류를 오름차순으로 정렬하고 <b style={{ color: C.text }}>동일한 분류인 경우</b> 가격의 내림차순으로 정렬하시오"</div>
          <div>· "분류를 오름차순으로 정렬한 <b style={{ color: C.text }}>후</b> 가격을 기준으로 내림차순으로 정렬하시오"</div>
          <div>· "정렬의 <b style={{ color: C.text }}>첫째 기준</b>은 '분류'의 오름차순, <b style={{ color: C.text }}>둘째 기준</b>은 '가격'의 내림차순"</div>
        </div>
        표현이 달라도 결국 <b>기준 추가 기능을 써서 두 번 정렬</b>하라는 같은 말입니다. 첫째 기준으로 정렬한 뒤, 값이 같은(동일 분류) 묶음 안에서 한 번 더 둘째 기준으로 정렬되는 것임을 이해하세요.
      </>,
    ],
  },
];

function BookTable({ rows, sorted, selBright, hlCol = -1, emphIdx = PRICE_IDX, groupBox = false }) {
  const rowRefs = useRef({});     // 도서명 → 행 DOM
  const prevTops = useRef({});    // 도서명 → offsetTop (직전 배치)
  const [groupBoxes, setGroupBoxes] = useState([]); // 분류(1순위)별로 같은 값 행들을 하나로 묶는 네모
  const HL_BG = 'rgba(96,165,250,0.20)';  // 강조 열 배경

  // FLIP: 행 순서가 바뀌면 직전 위치에서 새 위치로 부드럽게 이동시킨다.
  useLayoutEffect(() => {
    const newTops = {};
    for (const [name, el] of Object.entries(rowRefs.current)) {
      if (el) newTops[name] = el.offsetTop;
    }
    for (const [name, el] of Object.entries(rowRefs.current)) {
      if (!el) continue;
      const prev = prevTops.current[name];
      const now = newTops[name];
      if (prev != null && now != null && prev !== now) {
        const dy = prev - now;
        el.style.transition = 'none';
        el.style.transform = `translateY(${dy}px)`;
        el.style.zIndex = '2';
        el.getBoundingClientRect(); // 강제 리플로우
        requestAnimationFrame(() => {
          el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
          el.style.transform = 'translateY(0)';
          setTimeout(() => { el.style.zIndex = ''; }, 620);
        });
      }
    }
    prevTops.current = newTops;
  }, [rows]);

  // 정렬된 뒤 같은 분류(1순위) 값을 가진 연속 행들을 하나의 네모로 묶기 위해,
  // 각 그룹의 첫 행~마지막 행 위치를 재서 오버레이 박스 좌표를 만든다.
  useLayoutEffect(() => {
    if (!groupBox || !sorted) { setGroupBoxes([]); return; }
    const out = [];
    for (let i = 0; i < rows.length;) {
      const cat = rows[i].v[CAT_IDX];
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].v[CAT_IDX] === cat) j++;
      const first = rowRefs.current[rows[i].v[0]];
      const last = rowRefs.current[rows[j].v[0]];
      if (first && last) {
        out.push({ top: first.offsetTop, height: last.offsetTop + last.offsetHeight - first.offsetTop, color: CAT_COLOR[cat] });
      }
      i = j + 1;
    }
    setGroupBoxes(out);
  }, [rows, groupBox, sorted]);

  const cellBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: 28, fontSize: 12, padding: '4px 4px', whiteSpace: 'nowrap',
  };
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      {/* 열 문자 머리글 (A~F) */}
      <div style={{ display: 'grid', gridTemplateColumns: BOOK_GRID }}>
        <div style={{ ...cellBase, background: '#0b1220', minHeight: 22 }} />
        {BOOK_COLS.map((L, i) => {
          const key = i === CAT_IDX || i === emphIdx;
          const hl = i === hlCol;
          return (
            <div key={L} style={{
              ...cellBase, minHeight: 22, fontWeight: 700,
              background: hl ? HL_BG : '#0b1220',
              color: hl ? '#fff' : sorted && key ? C.blueLight : C.textDim,
              borderRight: i === BOOK_COLS.length - 1 ? 'none' : `1px solid ${C.border}`,
            }}>{L}</div>
          );
        })}
      </div>

      {/* 본문: [고정 행번호 열] + [제목 + 데이터] — 정렬해도 행번호(2·3·4…8)는 제자리 */}
      <div style={{ display: 'flex' }}>
        {/* 고정 행번호 열 — FLIP 대상 아님. 정렬해도 항상 위→아래 2,3,4,5,6,7,8 순서 유지 */}
        <div style={{ width: RN_W, flexShrink: 0 }}>
          <div style={{ ...cellBase, background: '#0b1220', color: C.textMuted, fontWeight: 700 }}>{BOOK_HEAD_RN}</div>
          {rows.map((_, idx) => (
            <div key={idx} style={{
              ...cellBase, background: '#0b1220', fontWeight: 700, color: C.textMuted,
              borderTop: '2px solid transparent',   // 데이터 행과 높이 맞춤
            }}>{BOOK_HEAD_RN + 1 + idx}</div>
          ))}
        </div>

        {/* 제목 + 데이터 (여기 데이터 영역 전체가 선택 범위) */}
        <div style={{ position: 'relative', flex: 1 }}>
          {/* 제목 행 (엑셀 2행) */}
          <div style={{ display: 'grid', gridTemplateColumns: DATA_GRID }}>
            {BOOK_HEAD.map((h, i) => {
              const hl = i === hlCol;
              return (
                <div key={h} style={{
                  ...cellBase, fontWeight: 700,
                  background: hl ? C.blueDim : '#111c33', color: hl ? '#fff' : C.blueLight,
                  borderRight: i === BOOK_HEAD.length - 1 ? 'none' : `1px solid ${C.border}`,
                }}>{h}</div>
              );
            })}
          </div>

          {/* 데이터 행 (FLIP 이동) — 행번호 셀은 포함하지 않는다 */}
          {rows.map((r, idx) => {
            const cat = r.v[CAT_IDX];
            const groupTop = sorted && (idx === 0 || rows[idx - 1].v[CAT_IDX] !== cat);
            return (
              <div key={r.v[0]} ref={(el) => { rowRefs.current[r.v[0]] = el; }} style={{
                display: 'grid', gridTemplateColumns: DATA_GRID, position: 'relative',
                background: C.bgDark,
                // 경계선 자리를 항상 2px 확보(색만 바뀜) → 단계가 바뀌어도 표 높이가 변하지 않음
                // groupBox 모드에서는 위쪽 선 대신 그룹 전체를 감싸는 네모(오버레이)로 표시한다.
                borderTop: `2px solid ${!groupBox && groupTop ? CAT_COLOR[cat] : 'transparent'}`,
              }}>
                {r.v.map((val, i) => {
                  const isCat = i === CAT_IDX, isPrice = i === PRICE_IDX;
                  const nameBlue = i === 0 && r.blue;   // 도서명 셀 연한 파랑
                  const isEmph = i === emphIdx;
                  const hl = i === hlCol;
                  return (
                    <div key={i} style={{
                      ...cellBase,
                      borderRight: i === r.v.length - 1 ? 'none' : `1px solid ${C.border}`,
                      background: nameBlue ? LIGHT_BLUE : hl ? HL_BG : 'transparent',
                      // groupBox 모드에선 셀마다 네모를 그리지 않고 그룹 상자 하나로만 묶는다
                      boxShadow: hl && !groupBox ? `inset 0 0 0 2px ${C.blue}` : 'none',
                      color: nameBlue ? '#1e293b'
                        : sorted && isCat ? CAT_COLOR[cat]
                          : sorted && isEmph ? C.amber : C.text,
                      fontWeight: nameBlue ? 700 : sorted && (isCat || isEmph) ? 800 : 400,
                    }}>{isPrice ? won(val) : val}</div>
                  );
                })}
              </div>
            );
          })}

          {/* 분류(1순위) 그룹 네모 — 같은 분류의 두 행을 하나의 상자로 묶는다 (행번호 열은 제외, 그 안에서 2순위 가격 정렬) */}
          {groupBoxes.map((b, k) => (
            <div key={k} style={{
              position: 'absolute', left: 0, right: 0, top: b.top, height: b.height,
              border: `2px solid ${b.color}`, borderRadius: 6, pointerEvents: 'none', zIndex: 4,
              boxShadow: `inset 0 0 0 9999px ${b.color}14`,
            }} />
          ))}

          {/* 선택 범위 오버레이 — 데이터 영역(제목행부터 마지막 데이터행까지) */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none', zIndex: 3,
            border: `2px dashed ${C.blue}`, borderRadius: 4,
            opacity: selBright ? 1 : 0.4,
            boxShadow: selBright ? '0 0 0 3px rgba(96,165,250,0.15)' : 'none',
            transition: 'opacity .4s',
          }} />
        </div>
      </div>
    </div>
  );
}

export function SortBasicStepsAnim() {
  const [slot, setSlot] = useState(0);
  // step 0 정렬 전 · 1 분류 오름차순(분류 강조) · 2 가격 내림차순(가격 강조) · 3 완료(강조 해제)
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ribbonOpened, setRibbonOpened] = useState(false); // 정렬 실행 단계: [정렬] 클릭 → 대화상자
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  // from 단계 이후를 3초 간격으로 예약한다 — 정렬할 때마다 해당 열을 3초 동안 강조하고, 마지막에 해제.
  const runFrom = (from) => {
    clearTimers();
    if (from >= 3) { setStep(3); setPlaying(false); return; }
    setPlaying(true);
    const timers = [];
    for (let s = from + 1; s <= 3; s++) {
      const target = s;
      timers.push(setTimeout(() => {
        setStep(target);
        if (target === 3) setPlaying(false);
      }, 3000 * (s - from)));
    }
    timersRef.current = timers;
  };
  // [재생]: 멈춘 지점부터 이어서 (완료 상태면 처음부터)
  const play = () => { if (step >= 3) { setStep(0); runFrom(0); } else runFrom(step); };
  // [멈춤]: 예약된 전환을 취소하고 현재 상태에서 멈춘다.
  const stop = () => { clearTimers(); setPlaying(false); };
  // [다시 보기]: 항상 처음부터
  const replay = () => { setStep(0); runFrom(0); };

  // 단계가 바뀌면 초기화
  useEffect(() => { setRibbonOpened(false); setStep(0); setPlaying(false); clearTimers(); }, [slot]);
  useEffect(() => () => clearTimers(), []);

  const rows = step === 0 ? BOOK : step === 1 ? BOOK_SORT_CAT : BOOK_SORTED;
  const sorted = step >= 1;
  const hlCol = step === 1 ? CAT_IDX : step === 2 ? PRICE_IDX : -1; // 강조할 열(정렬 중일 때만)

  const phaseText = step === 1
    ? '① 분류를 오름차순으로 정렬'
    : step === 2
      ? '② 같은 분류 안에서 가격을 내림차순으로 정렬'
      : step >= 3
        ? '정렬 완료 ✓'
        : '정렬 전';

  return (
    <Wrap>
      <style>{'@keyframes sortFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes sortCaret{50%{opacity:0}}'}</style>
      <Title>기본 정렬 — 오름차순·내림차순</Title>

      {/* 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, fontSize: 17, color: C.text, lineHeight: 1.8 }}>
        <span style={{ color: C.amber, fontWeight: 800, marginRight: 8, fontSize: 15 }}>문제</span>
        <b>[정렬]</b> 기능을 이용하여 표에서 <b style={{ color: C.blueLight }}>분류</b>를 <b style={{ color: C.blueLight }}>오름차순</b>으로 정렬하고,
        동일한 분류인 경우 <b style={{ color: C.blueLight }}>가격</b>의 <b style={{ color: C.blueLight }}>내림차순</b>으로 정렬하시오.
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 아래 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {BASIC_STEPS.map((s, i) => (
          <StepChip key={i} n={s.n} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <ExplainBox e={BASIC_EXPLAIN[slot]} />

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {/* 왼쪽: 표 + (3단계일 때) 정렬 진행 상태 — 너비를 표에 고정해 단계가 바뀌어도 줄바꿈/이동이 없게 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 426, flexShrink: 0 }}>
          <BookTable rows={rows} sorted={sorted} selBright={slot === 0} hlCol={hlCol} groupBox />
          {slot === 2 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: step >= 3 ? C.green : C.blueLight }}>{phaseText}</span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={playing ? stop : play} style={{
                  background: playing ? C.amber : C.blueDim, color: playing ? '#1e293b' : '#fff',
                  border: `1px solid ${playing ? C.amber : C.blueDim}`,
                  borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>{playing ? '⏸ 멈춤' : '▶ 재생'}</button>
                <button onClick={replay} style={{
                  background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>↻ 다시 보기</button>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 단계별 리본/대화상자 */}
        <div key={`${slot}-${ribbonOpened}`} style={{ animation: 'sortFade .55s ease', flexShrink: 0 }}>
          {slot === 1 && (ribbonOpened ? (
            <SortDialog criteria={[{ col: '', sortOn: '셀 값', order: '오름차순' }]} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <SortFilterRibbon hiSort onSortClick={() => setRibbonOpened(true)} />
              <div style={{ marginTop: 8, fontSize: 12, color: C.blueLight }}>👆 <b>[정렬]</b> 버튼을 눌러 대화상자를 여세요</div>
            </div>
          ))}
          {slot === 2 && (
            <SortDialog hiLevel={1} showAddHint criteria={[
              { col: '분류', sortOn: '셀 값', order: '오름차순', hiCol: true, hiOrder: true },
              { col: '가격', sortOn: '셀 값', order: '내림차순', hiCol: true, hiSortOn: true, hiOrder: true },
            ]} />
          )}
        </div>
      </div>
    </Wrap>
  );
}

/* ─────────────── 사용자 지정 목록 + 셀 색 정렬 · 개념2 ─────────────── */
// 개념1과 같은 도서 표를 그대로 쓴다. 분류를 '과학-역사-소설'(사용자 지정 목록) 순으로,
// 같은 분류 안에서는 도서명 셀 색(연한 파랑)이 위에 오도록 정렬. 마지막 단계에서
// 개념1처럼 재생/멈춤으로 두 정렬을 3초 간격으로 보여준다.
const C2_ORDER = ['과학', '역사', '소설']; // 분류 사용자 지정 순서
const C2_S1 = [...BOOK].sort((a, b) => C2_ORDER.indexOf(a.v[CAT_IDX]) - C2_ORDER.indexOf(b.v[CAT_IDX]));
const C2_SORTED = [...BOOK].sort((a, b) => {
  const c = C2_ORDER.indexOf(a.v[CAT_IDX]) - C2_ORDER.indexOf(b.v[CAT_IDX]);
  if (c !== 0) return c;
  return (a.blue ? 0 : 1) - (b.blue ? 0 : 1); // 연한 파랑 도서명 먼저
});

const C2_STEPS = [
  { n: '①', label: '범위 선택' },
  { n: '②', label: '정렬 실행' },
  { n: '③', label: '사용자 지정 목록' },
  { n: '④', label: '기준 추가(셀 색)' },
  { n: '⑤', label: '확인 → 정렬' },
];

const C2_EXPLAIN = [
  {
    title: '① 표 전체(제목 행 포함)를 드래그해 선택합니다.',
    lines: [
      <>개념1과 <b>같은 도서 표</b>입니다. 정렬 전에 <b style={{ color: C.blueLight }}>표 전체(제목 포함)</b>를 선택합니다. 한 열만 선택하면 그 열만 움직여 같은 행 데이터가 어긋납니다.</>,
    ],
  },
  {
    title: '② [데이터] → [정렬 및 필터] → [정렬] 로 대화상자를 엽니다.',
    lines: [
      <>리본의 <b>[정렬]</b>을 눌러 대화상자를 열고, 첫 기준의 <b>열</b>을 <b style={{ color: C.blueLight }}>문제에서 요구한 기준 열</b>로 고릅니다.</>,
      <>원하는 순서가 <b>오름차순도 내림차순도 아닙니다</b>. 그래서 <b>정렬(순서)</b>을 <b style={{ color: C.blueLight }}>[사용자 지정 목록]</b>으로 선택합니다.</>,
    ],
  },
  {
    title: '③ 사용자 지정 목록에 원하는 순서를 등록합니다.',
    lines: [
      <><b>목록 항목</b> 칸에 <b style={{ color: C.blueLight }}>문제에 나온 항목</b>을 순서대로 한 줄에 하나씩 입력하고 <b>[추가]</b> → <b>[확인]</b>.</>,
      <><b>주의</b> — 글자·띄어쓰기가 <b style={{ color: C.redLight }}>데이터 값과 정확히 같아야</b> 그 순서를 찾습니다.</>,
    ],
  },
  {
    title: '④ [기준 추가]로 2순위 기준을 쌓습니다 — 셀 색.',
    lines: [
      <>1순위 값이 같은 행들의 순서는 <b style={{ color: C.blueLight }}>문제에서 지정한 2순위 기준</b>대로 정합니다. <b>[기준 추가]</b> → 다음 기준의 열을 문제가 정한 열(여기서는 <b>도서명</b>)로 고릅니다.</>,
      <><b>정렬 기준</b>을 <b>셀 값</b>이 아닌 <b style={{ color: C.blueLight }}>[셀 색]</b>으로 바꾸면 순서 칸이 <b>[위에 표시]/[아래에 표시]</b>로 바뀝니다. <span style={{ background: LIGHT_BLUE, color: '#1e293b', fontWeight: 700, borderRadius: 4, padding: '1px 6px' }}>연한 파랑</span>을 고르고 <b style={{ color: C.blueLight }}>[위에 표시]</b>.</>,
    ],
  },
  {
    title: '⑤ [확인]을 누르면 지정한 순서로 재배열됩니다.',
    lines: [
      <>1순위 <b style={{ color: C.blueLight }}>분류(과학→역사→소설)</b>로 묶고, 2순위로 같은 분류 안에서 <b>도서명이 연한 파랑</b>인 책을 위로 올립니다.</>,
      <>예) <b>역사</b> 분류에서 도서명이 연한 파랑인 <b style={{ color: C.blueLight }}>로마제국사</b>가 <b>조선왕조실록</b>보다 위로 올라옵니다.</>,
    ],
  },
];

export function SortStepsAnim() {
  const [slot, setSlot] = useState(0);
  const [ribbonOpened, setRibbonOpened] = useState(false); // 정렬 실행: [정렬] 클릭 → 대화상자
  const [step, setStep] = useState(0);   // 마지막 단계에서의 재생 단계 0~3
  const [playing, setPlaying] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };
  const runFrom = (from) => {
    clearTimers();
    if (from >= 3) { setStep(3); setPlaying(false); return; }
    setPlaying(true);
    const timers = [];
    for (let s = from + 1; s <= 3; s++) {
      const target = s;
      timers.push(setTimeout(() => { setStep(target); if (target === 3) setPlaying(false); }, 3000 * (s - from)));
    }
    timersRef.current = timers;
  };
  const play = () => { if (step >= 3) { setStep(0); runFrom(0); } else runFrom(step); };
  const stop = () => { clearTimers(); setPlaying(false); };
  const replay = () => { setStep(0); runFrom(0); };

  useEffect(() => { setRibbonOpened(false); setStep(0); setPlaying(false); clearTimers(); }, [slot]);
  useEffect(() => () => clearTimers(), []);

  const atFinal = slot === 4;
  const rows = !atFinal ? BOOK : step === 0 ? BOOK : step === 1 ? C2_S1 : C2_SORTED;
  const sorted = atFinal && step >= 1;
  const hlCol = atFinal ? (step === 1 ? CAT_IDX : step === 2 ? 0 : -1) : -1;

  const phaseText = step === 1
    ? '① 분류를 과학·역사·소설 순으로 정렬'
    : step === 2
      ? '② 같은 분류 안에서 도서명이 연한 파랑인 행을 위로'
      : step >= 3
        ? '정렬 완료 ✓'
        : '정렬 전';

  return (
    <Wrap>
      <style>{'@keyframes sortFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes sortCaret{50%{opacity:0}}'}</style>
      <Title>정렬 — 사용자 지정 목록</Title>

      {/* 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 18px', marginBottom: 16, fontSize: 17, color: C.text, lineHeight: 1.8 }}>
        <div>
          <span style={{ color: C.amber, fontWeight: 800, marginRight: 8, fontSize: 15 }}>문제</span>
          <b>[정렬]</b> 기능을 이용하여 표에서 <b style={{ color: C.blueLight }}>분류</b>를 <b style={{ color: C.blueLight }}>'과학-역사-소설'</b>순으로 정렬하고,
          동일한 분류인 경우 <b style={{ color: C.text }}>도서명</b>의 셀 색이
          <span style={{ color: C.text, fontWeight: 700, margin: '0 4px' }}>RGB(191,219,254)</span>
          인 값이 <b style={{ color: C.text }}>위에 표시</b>되도록 정렬하시오.
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 아래 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {C2_STEPS.map((s, i) => (
          <StepChip key={i} n={s.n} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      <ExplainBox e={C2_EXPLAIN[slot]} />

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {/* 왼쪽: 표 (+ 마지막 단계의 재생 컨트롤) — 너비를 표에 고정 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 426, flexShrink: 0 }}>
          <BookTable rows={rows} sorted={sorted} selBright={slot === 0} hlCol={hlCol} emphIdx={-1} />
          {atFinal && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: step >= 3 ? C.green : C.blueLight }}>{phaseText}</span>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={playing ? stop : play} style={{
                  background: playing ? C.amber : C.blueDim, color: playing ? '#1e293b' : '#fff',
                  border: `1px solid ${playing ? C.amber : C.blueDim}`,
                  borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>{playing ? '⏸ 멈춤' : '▶ 재생'}</button>
                <button onClick={replay} style={{
                  background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}>↻ 다시 보기</button>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 단계별 리본/대화상자 */}
        <div key={`${slot}-${ribbonOpened}`} style={{ animation: 'sortFade .55s ease', flexShrink: 0 }}>
          {slot === 1 && (ribbonOpened ? (
            <SortDialog hiLevel={0} criteria={[{ col: '분류', sortOn: '셀 값', order: '사용자 지정 목록…', hiCol: true, hiOrder: true }]} />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <SortFilterRibbon hiSort onSortClick={() => setRibbonOpened(true)} />
              <div style={{ marginTop: 8, fontSize: 12, color: C.blueLight }}>👆 <b>[정렬]</b> 버튼을 눌러 대화상자를 여세요</div>
            </div>
          ))}
          {slot === 2 && <CustomListDialog items={C2_ORDER} />}
          {slot === 3 && (
            <SortDialog hiLevel={1} showAddHint criteria={[
              { col: '분류', sortOn: '셀 값', order: '사용자 지정 목록' },
              { col: '도서명', sortOn: '셀 색', order: '위에 표시', colorSwatch: LIGHT_BLUE, hiCol: true, hiSortOn: true, hiOrder: true },
            ]} />
          )}
          {slot === 4 && (
            <SortDialog criteria={[
              { col: '분류', sortOn: '셀 값', order: '사용자 지정 목록' },
              { col: '도서명', sortOn: '셀 색', order: '위에 표시', colorSwatch: LIGHT_BLUE },
            ]} />
          )}
        </div>
      </div>
    </Wrap>
  );
}

/* ─────────────── 왼쪽에서 오른쪽으로 정렬 (행 방향) · 개념3 ─────────────── */
export function SortLeftRightDiagram() {
  const vCols = ['이름', '점수'];
  const vRows = [['김하나', '88'], ['이두리', '95'], ['박세찬', '72']];
  const hHead = ['순번', '성별', '주소', '이름'];
  const hRow2 = ['1', '남', '서울', '홍길동'];

  const box = { border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' };
  const cc = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 30, fontSize: 13, padding: '4px 8px', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
  };

  return (
    <Wrap>
      <Title>정렬 방향 — 위아래(행) vs 왼쪽→오른쪽(열)</Title>
      <p style={{ textAlign: 'center', color: C.textDim, fontSize: 16, margin: '0 0 18px' }}>
        같은 [정렬]이라도 <b style={{ color: C.blueLight }}>[옵션]</b>에서 방향을 바꾸면 <b>행이 아니라 열</b>의 순서를 정렬합니다
      </p>

      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: '1 1 260px', minWidth: 240 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: C.text, marginBottom: 8, fontSize: 15 }}>기본 — 위아래(행) 정렬</div>
          <div style={{ ...box, maxWidth: 220, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px' }}>
              {vCols.map((h, i) => (
                <div key={h} style={{ ...cc, background: '#111c33', color: C.blueLight, fontWeight: 700, borderRight: i === 1 ? 'none' : `1px solid ${C.border}` }}>{h}</div>
              ))}
              {vRows.map((r, ri) => r.map((v, ci) => (
                <div key={`${ri}-${ci}`} style={{ ...cc, borderRight: ci === 1 ? 'none' : `1px solid ${C.border}`, color: ci === 1 ? C.amber : C.text, fontWeight: ci === 1 ? 800 : 400 }}>{v}</div>
              )))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: C.textMuted }}>
            <b style={{ color: C.amber }}>점수 열</b>을 기준으로 <b>행이 위아래로</b> 재배열 ↕
          </div>
        </div>

        <div style={{ flex: '1 1 320px', minWidth: 300 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: C.text, marginBottom: 8, fontSize: 15 }}>[옵션] → 왼쪽에서 오른쪽으로 정렬</div>
          <div style={{ ...box }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${hHead.length}, 1fr)` }}>
              {hHead.map((h, i) => (
                <div key={h} style={{ ...cc, background: '#111c33', color: C.blueLight, fontWeight: 800, borderRight: i === hHead.length - 1 ? 'none' : `1px solid ${C.border}` }}>{h}</div>
              ))}
              {hRow2.map((v, i) => (
                <div key={i} style={{ ...cc, borderRight: i === hRow2.length - 1 ? 'none' : `1px solid ${C.border}`, borderBottom: 'none', color: C.text }}>{v}</div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: C.textMuted }}>
            <b style={{ color: C.blueLight }}>1행(제목)</b>을 기준으로 <b>열이 좌우로</b> 재배열 ↔<br />
            (순번·성별·주소·이름 순서는 <b>사용자 지정 목록</b>으로 지정)
          </div>
        </div>
      </div>

      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 18, fontSize: 15, color: C.text, lineHeight: 1.85 }}>
        <div>· 문제에 <b style={{ color: C.blueLight }}>'1행을 기준으로'</b>, <b style={{ color: C.blueLight }}>'왼쪽에서 오른쪽으로'</b>, <b>'열 순서를'</b> 같은 말이 나오면 → <b>[옵션]</b>에서 방향부터 바꿉니다.</div>
        <div>· 순서: 표 전체 선택 → [정렬] → <b style={{ color: C.blueLight }}>[옵션] → 왼쪽에서 오른쪽으로 정렬</b> → 기준 행 선택 → 순서(필요 시 사용자 지정 목록) → 확인.</div>
      </div>
    </Wrap>
  );
}
