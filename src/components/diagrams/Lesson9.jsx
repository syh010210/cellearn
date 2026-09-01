// 9차시 — '선택하여 붙여넣기(연산)' 개념 애니메이션.
// PPT 캡처는 글씨가 작아 가독성이 나빠, 큰 글씨의 자체 다이어그램으로 대체한다.
// 값을 복사 → 대상 선택 → 연산(더하기) 선택 → 결과 반영 4단계를 반복 재생한다.
import { useEffect, useState } from 'react';
import { Wrap, Title, Subtitle, C, FONT } from './shared.jsx';

// 문제 1 — 열 머리글(A)·행 머리글(1)과 '열 너비 / 행 높이'를 실제 엑셀 격자 모양으로 설명.
// A열은 좁게(너비 2), 1행은 높게(높이 24) 그려 문제의 결과를 눈으로 바로 보이게 한다.
// 표 내용은 실습 파일(베이커리 재고)과 겹치지 않도록 다른 데이터로 채운다.
export function CellAnatomyDiagram() {
  const COL = C.blue, ROW = C.amber;
  const hdr = (bg, color) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 800, color, background: bg, border: `1px solid ${C.border}`,
    fontFamily: FONT,
  });
  const cell = (bg, mono = false) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, color: C.text, background: bg, border: `1px solid ${C.border}`,
    padding: '0 6px', textAlign: 'center', fontFamily: mono ? FONT : undefined,
  });
  const colHdrBg = '#0b2344', colHdrOn = '#123a6b';
  const rowHdrBg = '#1f2937', rowHdrOn = '#3a2b06';
  const colTint = 'rgba(96,165,250,0.10)';

  return (
    <Wrap>
      <Subtitle>세로줄은 '열(너비)', 가로줄은 '행(높이)'. 회색 머리글을 클릭하면 그 줄 전체가 선택됩니다</Subtitle>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 격자: 모서리 + A(좁게)·B·C 머리글, 1(높게)·2·3 머리글 + 데이터 (제목 없는 밋밋한 표) */}
        <div style={{ display: 'grid', gridTemplateColumns: '34px 46px 104px 104px', gridTemplateRows: '28px 56px 38px 38px', border: `2px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          {/* 머리글 행 */}
          <div style={hdr('#1f2937', C.textDim)} />
          <div style={hdr(colHdrOn, C.blueLight)}>A</div>
          <div style={hdr(colHdrBg, C.textMuted)}>B</div>
          <div style={hdr(colHdrBg, C.textMuted)}>C</div>
          {/* 1행 (높이 24 → 높게) */}
          <div style={hdr(rowHdrOn, C.amberLight)}>1</div>
          <div style={cell(colTint)} />
          <div style={cell('rgba(251,191,36,0.10)')}>과일</div>
          <div style={cell('rgba(251,191,36,0.10)')}>가격</div>
          {/* 2행 */}
          <div style={hdr(rowHdrBg, C.textMuted)}>2</div>
          <div style={cell(colTint)} />
          <div style={cell(C.bgDark)}>사과</div>
          <div style={cell(C.bgDark, true)}>1,500</div>
          {/* 3행 */}
          <div style={hdr(rowHdrBg, C.textMuted)}>3</div>
          <div style={cell(colTint)} />
          <div style={cell(C.bgDark)}>바나나</div>
          <div style={cell(C.bgDark, true)}>2,000</div>
        </div>

        {/* 설명 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 260 }}>
          <div style={{ background: 'rgba(96,165,250,0.10)', border: `2px solid ${COL}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.blueLight, marginBottom: 4 }}>세로줄 = 열(Column)</div>
            <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.6 }}>머리글 <b style={{ color: C.blueLight, fontFamily: FONT }}>A</b> 우클릭 → <b>[열 너비]</b> → <b style={{ color: C.blueLight, fontFamily: FONT }}>2</b> 입력</div>
          </div>
          <div style={{ background: 'rgba(251,191,36,0.10)', border: `2px solid ${ROW}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.amberLight, marginBottom: 4 }}>가로줄 = 행(Row)</div>
            <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.6 }}>머리글 <b style={{ color: C.amberLight, fontFamily: FONT }}>1</b> 우클릭 → <b>[행 높이]</b> → <b style={{ color: C.amberLight, fontFamily: FONT }}>24</b> 입력</div>
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// 문제 2 — 상품코드 'BR105'는 문자(BR)와 숫자(105)가 섞여 있지만 셀 값은 통째로 '문자(텍스트)'.
// 왜 문자로 취급되는지(문자가 섞이면 계산 불가 → 텍스트) 설명한다. 표기만 BR-105로 통일.
// 영문·숫자·기호는 전부 FONT 글꼴로 통일한다.
export function ProductCodeDiagram() {
  const chars = ['B', 'R', '1', '0', '5'];
  const isLetter = (i) => i <= 1;
  return (
    <Wrap>
      <Title>상품코드 — 왜 '문자(텍스트)'일까?</Title>
      <Subtitle>BR은 문자, 105는 숫자. 하지만 하나라도 문자가 섞이면 셀 값은 통째로 '문자'가 됩니다</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        {/* 글자 셀 한 줄 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {chars.map((ch, i) => {
            const letter = isLetter(i);
            const s = letter
              ? { bg: '#14532d', border: C.green, color: C.greenLight }
              : { bg: '#0b2344', border: C.blueDim, color: C.blueLight };
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 66, height: 66, background: s.bg, border: `2px solid ${s.border}`,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 30, color: s.color, fontFamily: FONT,
                }}>{ch}</div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: letter ? C.green : C.blue }}>
                  {letter ? '문자' : '숫자'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 구간 라벨 */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ background: '#14532d', border: `1px solid ${C.green}`, borderRadius: 6, padding: '6px 16px', fontSize: 15, fontWeight: 700, color: C.greenLight }}>
            <span style={{ fontFamily: FONT }}>BR</span> = 문자(영문)
          </div>
          <div style={{ background: '#0b2344', border: `1px solid ${C.blueDim}`, borderRadius: 6, padding: '6px 16px', fontSize: 15, fontWeight: 700, color: C.blueLight }}>
            <span style={{ fontFamily: FONT }}>105</span> = 숫자
          </div>
        </div>

        {/* 왜 문자인지 설명 */}
        <div style={{ background: 'rgba(168,85,247,0.12)', border: `2px solid ${C.purple}`, borderRadius: 10, padding: '13px 18px', maxWidth: 620 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.purpleLight, marginBottom: 6 }}>왜 셀 전체가 문자일까?</div>
          <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.7 }}>
            셀은 <b>숫자로만</b> 이루어져야 '숫자'로 계산됩니다. 문자 <span style={{ fontFamily: FONT, color: C.greenLight }}>BR</span> 이 섞이면
            더하기·곱하기를 할 수 없으니, 엑셀은 셀 값을 통째로 <b style={{ color: C.purpleLight }}>문자(텍스트)</b>로 저장합니다.
            그래서 이런 코드 셀은 <b>왼쪽 정렬</b>로 보입니다. (숫자는 오른쪽 정렬)
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// 문제 3 — '이름 정의'. 실제 엑셀의 '이름 상자(수식 입력줄 왼쪽 칸)' 위치를 그대로 재현해,
// 학습자가 "아 여기구나" 하고 이름 상자를 바로 찾을 수 있게 한다.
export function NameBoxDiagram() {
  return (
    <Wrap>
      <Title>이름 정의 — '이름 상자'는 여기입니다</Title>
      <Subtitle>범위를 선택한 뒤, 수식 입력줄 왼쪽 '이름 상자'에 이름을 입력하고 Enter</Subtitle>

      {/* 엑셀 상단 바 재현: [이름 상자] [fx] [수식 입력줄] */}
      <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto 30px' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
          {/* 이름 상자 (강조) */}
          <div style={{
            minWidth: 128, padding: '9px 12px', background: '#0b2344',
            border: `2px solid ${C.amber}`, boxShadow: `0 0 0 3px ${C.amber}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.amberLight }}>할인율</span>
            <span style={{ fontSize: 11, color: C.textDim }}>▼</span>
          </div>
          {/* fx */}
          <div style={{ padding: '9px 14px', background: C.bgDark, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', fontStyle: 'italic', fontFamily: FONT, fontSize: 15, color: C.textMuted }}>
            fx
          </div>
          {/* 수식 입력줄 */}
          <div style={{ flex: 1, padding: '9px 14px', background: C.bgDark, display: 'flex', alignItems: 'center', fontFamily: FONT, fontSize: 15, color: C.text }}>
            =AVERAGE(할인율)
          </div>
        </div>
        {/* 이름 상자 콜아웃 */}
        <div style={{ position: 'absolute', left: 20, top: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 2, height: 14, background: C.amber }} />
          <div style={{ background: C.amber, color: '#1e293b', fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            여기가 '이름 상자'
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// 문제 13 — 날짜 표시 형식 코드. 같은 날짜(2025-06-29)가 코드에 따라 어떻게 보이는지 정리.
export function DateCodeDiagram() {
  const groups = [
    { cat: '연도', items: [['yy', '25'], ['yyyy', '2025']] },
    { cat: '월', items: [['m', '6'], ['mm', '06']] },
    { cat: '일', items: [['d', '29'], ['dd', '29']] },
    { cat: '요일(영문)', items: [['ddd', 'Sun'], ['dddd', 'Sunday']] },
    { cat: '요일(한글)', items: [['aaa', '일'], ['aaaa', '일요일']] },
  ];
  return (
    <Wrap>
      <Title>날짜 표시 형식 코드 — 2025-06-29 예시</Title>
      <Subtitle>셀 값이 <span style={{ fontFamily: FONT, color: C.blueLight }}>2025-06-29</span>(일요일)일 때, 코드마다 이렇게 다르게 보입니다</Subtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {['구분', '코드', '표시 결과'].map((h) => (
          <div key={h} style={{ background: '#0b2344', color: C.blueLight, fontSize: 15, fontWeight: 800, padding: '9px 12px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</div>
        ))}
        {groups.flatMap((g) =>
          g.items.map(([code, out], j) => [
            j === 0
              ? <div key={`cat${g.cat}`} style={{ gridRow: 'span 2', background: C.bgDark, borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontSize: 14.5, fontWeight: 700, color: C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{g.cat}</div>
              : null,
            <div key={`code${g.cat}${j}`} style={{ background: '#0b1220', borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 800, color: C.blue }}>{code}</div>,
            <div key={`out${g.cat}${j}`} style={{ background: '#0b1a12', borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 800, color: C.greenLight }}>{out}</div>,
          ]).flat().filter(Boolean)
        )}
      </div>

      <div style={{ background: C.bgDark, borderRadius: 10, padding: '12px 16px', marginTop: 14, fontSize: 14.5, color: C.text, lineHeight: 1.75 }}>
        글자를 한 번 쓰면(<b style={{ fontFamily: FONT, color: C.blue }}>m·d</b>) 한 자리, 두 번 쓰면(<b style={{ fontFamily: FONT, color: C.blue }}>mm·dd</b>) 두 자리로 <b>0을 채워</b> 표시합니다.
        (예: 6월 → <span style={{ fontFamily: FONT }}>m</span>=6, <span style={{ fontFamily: FONT }}>mm</span>=06) · 고정 글자는 <b style={{ fontFamily: FONT }}>yyyy"년" mm"월" dd"일"</b> 처럼 " "로 감쌉니다.
      </div>
    </Wrap>
  );
}

// 사용자 지정 표시 형식: '형식 코드 → 입력값 → 표시 결과'를 큰 글씨 표로 정리.
export function NumberFormatDiagram() {
  const rows = [
    { code: '0"개"', input: '120', out: '120개', note: '숫자 뒤에 글자 "개" 붙이기' },
    { code: '#"개"', input: '120', out: '120개', note: '값이 있으면 0"개"와 결과 같음' },
    { code: '0"개"', input: '0', out: '0개', note: '0은 빈 자리도 채워 "0개"', hi: true },
    { code: '#"개"', input: '0', out: '개', note: '#은 빈 자리를 비워 "개"만', hi: true },
    { code: '#,##0', input: '1250000', out: '1,250,000', note: '천 단위 구분 기호' },
    { code: '0.00%', input: '0.1', out: '10.00%', note: '백분율 + 소수 둘째 자리' },
    { code: '@" 셰프"', input: '김도윤', out: '김도윤 셰프', note: '@ = 문자 자리' },
    { code: 'yyyy"년" mm"월" dd"일"', input: '2025-06-29', out: '2025년 06월 29일', note: '고정 글자는 " "로 감싸기' },
  ];
  return (
    <Wrap>
      <Title>사용자 지정 표시 형식 — 코드와 결과</Title>
      <Subtitle>셀에 저장된 값은 그대로, '보이는 모양'만 바뀝니다</Subtitle>

      {/* 가장 기본 — 숫자 자리 0 과 # (완전 초보용, 예시에 라벨) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: C.blueLight, marginBottom: 6 }}>가장 기본 — 숫자 자리 기호 0 과 #</div>
        <div style={{ fontSize: 13.5, color: C.textMuted, marginBottom: 10, lineHeight: 1.7 }}>
          표시 형식은 <b style={{ color: C.text }}>'형식 코드'</b> 라는 기호로 "이런 모양으로 보여줘" 하고 적는 거예요. 숫자 자리에 쓰는 기본 기호는 <b style={{ color: C.amberLight, fontFamily: FONT }}>0</b> 과 <b style={{ color: C.blueLight, fontFamily: FONT }}>#</b> 두 개뿐입니다.
          <br />먼저 알아둘 말 하나 — <b style={{ color: C.text }}>'표시하지 않는 0'</b>. 우리는 7을 그냥 <b>7</b> 이라 쓰지 <b>007</b> 이라 쓰지 않죠? <b>007</b> 의 앞 <b>00</b> 처럼 없어도 값이 똑같은, 원래 안 쓰는 0을 말해요. <b style={{ color: C.amberLight, fontFamily: FONT }}>0</b> 과 <b style={{ color: C.blueLight, fontFamily: FONT }}>#</b> 은 이 <b>표시하지 않는 0을 채우느냐(0) · 비우느냐(#)</b> 가 딱 하나 다릅니다.
          <br />아래에서 <b>셀에 든 값</b>에 <b>형식 코드</b>를 적용하면 <b>화면에 어떻게 보이는지</b> 따라가 보세요.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { sym: '0', color: C.amberLight, bg: 'rgba(251,191,36,0.10)', title: '표시하지 않는 0을 채움', code: '000', input: '7', out: '007',
              desc: '형식 코드 000은 "세 자리로 보여줘"라는 뜻이에요. 값이 7이면 앞 두 자리가 비죠(= 표시하지 않는 0). 0은 이 자리를 0으로 채워 007로 보여줍니다. (셀에 저장된 값은 여전히 7)' },
            { sym: '#', color: C.blueLight, bg: 'rgba(96,165,250,0.10)', title: '표시하지 않는 0은 비움', code: '###', input: '7', out: '7',
              desc: '###도 똑같이 "세 자리"라는 뜻이지만, #은 표시하지 않는 0을 채우지 않아요. 그래서 값 7은 그냥 7로 보이고, 값이 아예 0이면 아무것도 안 보입니다.' },
          ].map((k) => (
            <div key={k.sym} style={{ background: k.bg, border: `1px solid ${k.color}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: k.color, fontFamily: FONT }}>{k.sym}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: k.color }}>{k.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>셀에 든 값</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.textMuted, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 11px', fontFamily: FONT }}>{k.input}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>형식 코드 {k.code}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>→</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>화면에 보임</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.greenLight, background: '#0b1a12', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 11px', fontFamily: FONT }}>{k.out}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{k.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* # 과 0 — 자리 채우기 비교 (자리수만큼 0으로 채우는지 vs 남으면 비우는지) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: C.blueLight, marginBottom: 8 }}># 과 0 — 자리 채우기 (입력값이 그대로 있어도 코드에 따라 다르게 보임)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', fontFamily: FONT }}>
          {['입력값', '### (안 채움)', '000 (0으로 채움)'].map((h) => (
            <div key={h} style={{ background: '#0b2344', color: C.blueLight, fontSize: 14.5, fontWeight: 800, padding: '9px 12px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</div>
          ))}
          {[
            { in: '1234', sharp: '1234', zero: '1234' },
            { in: '123', sharp: '123', zero: '123' },
            { in: '1', sharp: '1', zero: '001', hi: true },
            { in: '0', sharp: '(빈칸)', zero: '000', hi: true },
          ].map((r, i) => [
            <div key={`np-in${i}`} style={{ background: C.bgDark, borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontSize: 17, fontWeight: 700, color: C.text }}>{r.in}</div>,
            <div key={`np-s${i}`} style={{ background: r.hi ? 'rgba(96,165,250,0.10)' : '#0b1220', borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontSize: 17, fontWeight: 800, color: r.sharp === '(빈칸)' ? C.textDim : C.blueLight }}>{r.sharp}</div>,
            <div key={`np-z${i}`} style={{ background: r.hi ? 'rgba(251,191,36,0.10)' : '#0b1a12', borderTop: `1px solid ${C.border}`, padding: '10px 12px', textAlign: 'center', fontSize: 17, fontWeight: 800, color: C.amberLight }}>{r.zero}</div>,
          ])}
        </div>
        <div style={{ background: C.bgDark, borderRadius: 10, padding: '12px 16px', marginTop: 10, fontSize: 14.5, color: C.text, lineHeight: 1.75 }}>
          위에서 배운 <b>'표시하지 않는 0'</b> 을 떠올려 보세요. 숫자가 자릿수를 다 채우면 <b>0</b> 이든 <b>#</b> 이든 똑같이 나오고, <b>자리가 남을 때만</b> 달라집니다 — <b style={{ color: C.amberLight, fontFamily: FONT }}>0</b> 은 그 자리를 <b>0으로 채우고</b>, <b style={{ color: C.blueLight, fontFamily: FONT }}>#</b> 은 <b>비웁니다</b>.
          <br />그래서 값이 0일 때 <b style={{ fontFamily: FONT }}>#,###</b> 은 (표시하지 않는 0을 다 비워) <b>빈칸</b>, <b style={{ fontFamily: FONT }}>#,##0</b> 은 (마지막 <b>0</b> 이 자리를 지켜) <b>0</b> 으로 보입니다.
        </div>
      </div>

      {/* 글자를 다룰 때 — @ 와 큰따옴표 (완전 초보용, 예시에 라벨) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: C.blueLight, marginBottom: 6 }}>글자를 다룰 때 — @ 와 큰따옴표 " "</div>
        <div style={{ fontSize: 13.5, color: C.textMuted, marginBottom: 10, lineHeight: 1.65 }}>
          숫자가 아니라 <b>글자</b>를 넣거나 붙일 때 쓰는 기호예요. <b style={{ color: C.purpleLight, fontFamily: FONT }}>@</b> 는 셀에 든 글자가 들어갈 자리, <b style={{ color: C.greenLight, fontFamily: FONT }}>" "</b> 는 내가 직접 넣고 싶은 글자를 감싸는 표시입니다.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { sym: '@', color: C.purpleLight, bg: 'rgba(168,85,247,0.12)', title: '셀의 글자가 들어갈 자리', code: '@"셰프"', input: '김도윤', out: '김도윤셰프',
              desc: '@ 는 "여기에 셀의 원래 글자를 넣어라"는 뜻이에요. @"셰프" 라고 적으면 @ 자리에 김도윤이 들어가고 뒤에 셰프가 붙어 김도윤셰프가 됩니다. (숫자엔 0·#, 글자엔 @)' },
            { sym: '" "', color: C.greenLight, bg: 'rgba(52,211,153,0.10)', title: '내가 넣고 싶은 글자', code: '0"개"', input: '120', out: '120개',
              desc: '형식 코드에 글자를 그대로 넣고 싶으면 반드시 큰따옴표로 감싸요. 0"개" 는 숫자(0) 뒤에 "개"를 붙이라는 뜻이라 120이 120개로 보입니다.' },
          ].map((k) => (
            <div key={k.sym} style={{ background: k.bg, border: `1px solid ${k.color}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: k.color, fontFamily: FONT }}>{k.sym}</span>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: k.color }}>{k.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>셀에 든 값</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.textMuted, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 11px', fontFamily: FONT }}>{k.input}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>형식 코드 {k.code}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>→</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>화면에 보임</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.greenLight, background: '#0b1a12', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 11px', fontFamily: FONT }}>{k.out}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{k.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 15.5, fontWeight: 800, color: C.blueLight, marginBottom: 8 }}>형식 코드 → 입력값 → 표시 결과 (전체 예시)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 1.1fr', border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {['형식 코드', '입력값', '표시 결과'].map((h) => (
          <div key={h} style={{ background: '#0b2344', color: C.blueLight, fontSize: 15, fontWeight: 800, padding: '10px 12px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>{h}</div>
        ))}
        {rows.map((r, i) => [
          <div key={`c${i}`} style={{ background: r.hi ? 'rgba(251,191,36,0.12)' : '#0b1220', borderTop: `1px solid ${C.border}`, padding: '11px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: r.hi ? C.amberLight : C.blue, fontFamily: FONT }}>{r.code}</div>
            <div style={{ fontSize: 12.5, color: r.hi ? C.amber : C.textDim, marginTop: 3 }}>{r.note}</div>
          </div>,
          <div key={`i${i}`} style={{ background: r.hi ? 'rgba(251,191,36,0.06)' : C.bgDark, borderTop: `1px solid ${C.border}`, padding: '11px 12px', textAlign: 'center', fontSize: 17, fontWeight: 700, color: C.textMuted, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.input}</div>,
          <div key={`o${i}`} style={{ background: r.hi ? 'rgba(251,191,36,0.06)' : '#0b1a12', borderTop: `1px solid ${C.border}`, padding: '11px 12px', textAlign: 'center', fontSize: 18, fontWeight: 800, color: r.hi ? C.amberLight : C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.out || ' '}</div>,
        ])}
      </div>

    </Wrap>
  );
}

const SRC = C.blueLight;   // 복사하는 값
const DST = C.amber;       // 붙여넣을 대상
const RES = C.greenLight;  // 결과

function useStep(n = 4, interval = 2400) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v + 1) % n), interval);
    return () => clearInterval(id);
  }, [n, interval]);
  return s;
}

// 세로 숫자 카드 한 줄
function NumCell({ children, color, glow, big }) {
  return (
    <div style={{
      minWidth: 78, padding: '12px 10px', borderRadius: 10, textAlign: 'center',
      fontSize: big ? 24 : 22, fontWeight: 800, color,
      background: '#0b1220', border: `2px solid ${glow ? color : C.border}`,
      boxShadow: glow ? `0 0 0 3px ${color}44` : 'none',
      transition: 'all .35s',
    }}>{children}</div>
  );
}

function ColumnCard({ label, color, values, glow }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 800, color, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {values.map((v, i) => (
          <NumCell key={i} color={color} glow={glow}>{v}</NumCell>
        ))}
      </div>
    </div>
  );
}

function StepBadge({ active, n, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999,
      background: active ? C.blueBg : '#0b1220',
      border: `2px solid ${active ? C.blueDim : C.border}`,
      opacity: active ? 1 : 0.5, transition: 'all .3s',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: active ? C.blueDim : C.border, color: '#fff',
        fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{n}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: active ? '#fff' : C.textMuted, whiteSpace: 'nowrap' }}>{children}</span>
    </div>
  );
}

// 큰 글씨 '선택하여 붙여넣기' 대화상자 목업 (연산 영역만)
function OpDialog({ active }) {
  const ops = ['없음', '더하기', '빼기', '곱하기', '나누기'];
  return (
    <div style={{
      border: `2px solid ${active ? DST : C.border}`, borderRadius: 12, overflow: 'hidden',
      width: 210, background: C.bgDark, boxShadow: active ? `0 0 0 3px ${DST}33` : 'none', transition: 'all .3s',
    }}>
      <div style={{ background: '#0b2344', color: C.blueLight, fontSize: 14, fontWeight: 800, padding: '9px 12px' }}>선택하여 붙여넣기</div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, marginBottom: 10 }}>연산</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ops.map((op) => {
            const on = op === '더하기';
            return (
              <div key={op} style={{
                display: 'flex', alignItems: 'center', gap: 9, fontSize: 16, fontWeight: on ? 800 : 500,
                color: on ? DST : C.textMuted,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${on ? DST : C.textDim}`,
                  background: on ? DST : 'transparent',
                }} />
                {op}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PasteSpecialAnim() {
  const step = useStep();
  const done = step >= 3;

  const jaego = [30, 15, 20];       // 재고 (대상)
  const last = [10, 8, 5];          // 전월재고 (복사)
  const result = [40, 23, 25];      // 더한 결과

  return (
    <Wrap>
      <Title>선택하여 붙여넣기 — 연산 '더하기'</Title>
      <Subtitle>복사한 값을 대상 칸에 '그냥' 붙이지 않고, 사칙연산과 함께 붙여넣습니다</Subtitle>

      {/* 단계 표시 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 42 }}>
        <StepBadge active={step === 0} n={1}>전월재고 복사 (Ctrl+C)</StepBadge>
        <StepBadge active={step === 1} n={2}>재고 범위 선택</StepBadge>
        <StepBadge active={step === 2} n={3}>연산 '더하기' 선택</StepBadge>
        <StepBadge active={done} n={4}>결과 반영</StepBadge>
      </div>

      {/* 본문: 재고 + 전월재고 = 결과 */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ColumnCard
          label="재고 (대상)"
          color={done ? RES : DST}
          values={done ? result : jaego}
          glow={step === 1 || done}
        />
        <div style={{ fontSize: 34, fontWeight: 800, color: C.textMuted }}>+</div>
        <div style={{ position: 'relative' }}>
          <ColumnCard label="전월재고 (복사)" color={SRC} values={last} glow={step === 0} />
          {(step === 0) && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              marginBottom: 8, background: SRC, color: '#0b1220', whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
            }}>Ctrl+C</div>
          )}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.textMuted }}>→</div>
        <OpDialog active={step === 2} />
      </div>

      {/* 요약 바 */}
      <div style={{ background: C.bgDark, borderRadius: 10, padding: '14px 18px', marginTop: 20, lineHeight: 1.8 }}>
        <div style={{ fontSize: 16, color: C.text }}>
          연산은 <b style={{ color: DST }}>더하기 · 빼기 · 곱하기 · 나누기</b> 4가지. 대상 칸의 값과 복사한 값을 <b style={{ color: RES }}>짝끼리 계산</b>합니다.
        </div>
        <div style={{ fontSize: 15, color: C.textMuted }}>
          붙여넣기 옵션은 <b style={{ color: C.text }}>'값'</b> 또는 <b style={{ color: C.text }}>'값 및 숫자 서식'</b> — '모두'를 고르면 서식까지 덮어써 표가 흐트러지니 주의!
        </div>
      </div>
    </Wrap>
  );
}

// 문제 4 — 메모(노트) 삽입 · 항상 표시 · 자동 크기. 실제 엑셀의 노란 메모 말풍선 목업.
export function CellCommentDiagram() {
  const steps = [
    ['삽입', '[I3] 선택 → Shift + F2 (또는 우클릭 → [메모 삽입])'],
    ['항상 표시', '메모 단 셀에서 우클릭 → [메모 표시/숨기기]'],
    ['자동 크기', '메모 테두리 클릭 → 우클릭 → [메모 서식] → [맞춤] 탭 → 자동 크기'],
  ];
  return (
    <Wrap>
      <Title>메모(노트) — 삽입 · 항상 표시 · 자동 크기</Title>
      <Subtitle>셀에 설명을 붙이고, 늘 보이게 하고, 내용에 맞게 크기를 맞춥니다</Subtitle>

      <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 셀 + 메모 목업 */}
        <div style={{ position: 'relative', width: 300, height: 120 }}>
          <div style={{ position: 'absolute', left: 0, top: 44, width: 96, height: 40, border: `1px solid ${C.border}`, background: C.bgDark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, fontSize: 14, fontWeight: 700 }}>
            I3
            {/* 메모가 달린 빨간 삼각 표식 */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: `9px solid ${C.red}`, borderLeft: '9px solid transparent' }} />
          </div>
          {/* 점선 연결 + 노란 메모 */}
          <svg width="70" height="60" style={{ position: 'absolute', left: 90, top: 10 }}>
            <line x1="66" y1="46" x2="8" y2="6" stroke={C.amber} strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          <div style={{ position: 'absolute', left: 150, top: 0, background: '#fef9c3', color: '#78350f', border: `1px solid ${C.amber}`, borderRadius: 2, padding: '8px 12px', fontSize: 14, fontWeight: 700, boxShadow: '2px 3px 8px rgba(0,0,0,0.35)' }}>
            행사 할인율
          </div>
        </div>

        {/* 단계 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, minWidth: 300 }}>
          {steps.map(([t, d], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: '50%', background: C.amber, color: '#1e293b', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.55 }}><b style={{ color: C.amberLight }}>{t}</b> — {d}</div>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

// 문제 5 — '병합하고 가운데 맞춤' vs '선택 영역의 가운데로'. 셀을 합치는지 여부가 핵심 차이.
export function MergeCenterDiagram() {
  const cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  return (
    <Wrap>
      <Title>병합하고 가운데 맞춤 vs 선택 영역의 가운데로</Title>
      <Subtitle>겉모습은 비슷하지만 '셀을 합치는지'가 다릅니다 — 시험에 자주 번갈아 출제</Subtitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ① 병합 */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.blueLight, marginBottom: 6 }}>① 병합하고 가운데 맞춤 — 여러 셀이 하나로 합쳐짐</div>
          <div style={{ height: 42, border: `2px solid ${C.blueDim}`, borderRadius: 6, background: 'rgba(59,130,246,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: C.text }}>
            해피 베이커리 現況
          </div>
          <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 4 }}>↑ [B1:I1]이 <b style={{ color: C.blueLight }}>한 개의 셀</b>로 합쳐짐 (내부 경계선 없음)</div>
        </div>
        {/* ② 선택 영역의 가운데로 */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.amberLight, marginBottom: 6 }}>② 선택 영역의 가운데로 — 셀은 그대로, 글자만 가운데</div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', border: `2px solid ${C.amber}`, borderRadius: 6, overflow: 'hidden', height: 42 }}>
            {cols.map((c, i) => (
              <div key={c} style={{ borderRight: i < 7 ? `1px solid ${C.border}` : 'none', background: 'rgba(251,191,36,0.06)' }} />
            ))}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: C.text, pointerEvents: 'none' }}>해피 베이커리 現況</div>
          </div>
          <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 4 }}>↑ 세로 경계선이 남아 있음 — <b style={{ color: C.amberLight }}>8개 셀 그대로</b> 유지</div>
        </div>
      </div>

      <div style={{ background: C.bgDark, borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 14.5, color: C.text, lineHeight: 1.7 }}>
        <b style={{ color: C.blueLight }}>병합</b>은 셀을 합쳐 참조·정렬·복사에 영향을 주고, <b style={{ color: C.amberLight }}>선택 영역의 가운데로</b>는 셀 구조를 그대로 두어 표가 안전합니다.
      </div>
    </Wrap>
  );
}

// 문제 8·9 — 맞춤(정렬). 가로 3종 × 세로 3종을 3×3 격자로 한눈에.
export function AlignGridDiagram() {
  const hAlign = ['왼쪽', '가운데', '오른쪽'];
  const vAlign = ['위', '가운데', '아래'];
  const jc = ['flex-start', 'center', 'flex-end'];
  const ai = ['flex-start', 'center', 'flex-end'];
  return (
    <Wrap>
      <Title>맞춤(정렬) — 가로 3종 × 세로 3종</Title>
      <Subtitle>가로 정렬: 왼쪽 · 가운데 · 오른쪽 / 세로 정렬: 위 · 가운데 · 아래</Subtitle>

      <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(3, 1fr)', gap: 6 }}>
        <div />
        {hAlign.map((h) => <div key={h} style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: C.blueLight }}>{h}</div>)}
        {vAlign.map((v, r) => [
          <div key={`v${r}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontSize: 14, fontWeight: 800, color: C.amberLight }}>{v}</div>,
          ...hAlign.map((h, c) => (
            <div key={`${r}-${c}`} style={{ height: 54, border: `1px solid ${C.border}`, borderRadius: 6, background: C.bgDark, display: 'flex', alignItems: ai[r], justifyContent: jc[c], padding: 6 }}>
              <span style={{ fontSize: 13, color: C.text, background: 'rgba(96,165,250,0.18)', padding: '2px 7px', borderRadius: 4 }}>ABC</span>
            </div>
          )),
        ])}
      </div>

      <div style={{ background: C.bgDark, borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 14.5, color: C.text, lineHeight: 1.7 }}>
        [홈] → [맞춤] 그룹의 가로 3버튼 · 세로 3버튼으로 지정합니다. (또는 [셀 서식] → [맞춤] 탭)
      </div>
    </Wrap>
  );
}

// 문제 15·16 — 테두리. 모든 테두리 → 굵은 바깥쪽 → 빈 칸 대각선(X) 3단계.
function BorderMiniGrid({ thickOuter, diagEmpty }) {
  const data = [['식빵', '30', '0.1'], ['케이크', '5', ''], ['음료', '20', '']];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 46px)', border: thickOuter ? `3px solid ${C.text}` : `1px solid ${C.textMuted}` }}>
      {data.flatMap((row, r) => row.map((v, c) => {
        const empty = v === '';
        return (
          <div key={`${r}-${c}`} style={{ position: 'relative', height: 30, border: `1px solid ${C.textMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, color: C.text, background: C.bgDark, overflow: 'hidden' }}>
            {empty && diagEmpty ? (
              <svg width="46" height="30" style={{ position: 'absolute', inset: 0 }}>
                <line x1="1" y1="1" x2="45" y2="29" stroke={C.amber} strokeWidth="1.4" />
                <line x1="45" y1="1" x2="1" y2="29" stroke={C.amber} strokeWidth="1.4" />
              </svg>
            ) : v}
          </div>
        );
      }))}
    </div>
  );
}

export function BordersDiagram() {
  const steps = [
    { t: '① 모든 테두리', color: C.blueLight, props: {} },
    { t: '② + 굵은 바깥쪽', color: C.blueLight, props: { thickOuter: true } },
    { t: '③ 빈 칸 대각선(X)', color: C.amberLight, props: { thickOuter: true, diagEmpty: true } },
  ];
  return (
    <Wrap>
      <Title>테두리 — 모든 테두리 → 굵은 바깥쪽 → 대각선(X)</Title>
      <Subtitle>빈 칸의 대각선(X)은 '해당 없음'을 나타냅니다</Subtitle>

      <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.t}</div>
            <BorderMiniGrid {...s.props} />
          </div>
        ))}
      </div>

      <div style={{ background: C.bgDark, borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 14.5, color: C.text, lineHeight: 1.7 }}>
        대각선 · 선 스타일 · 색은 리본이 아니라 <b>[셀 서식] → [테두리] 탭</b>에서만 지정합니다.
      </div>
    </Wrap>
  );
}
