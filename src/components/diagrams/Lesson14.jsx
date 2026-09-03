// 14차시 — 피벗 테이블 애니메이션.
// 핵심: 원본 데이터의 '필드'를 필터 / 행 / 열 / 값 네 영역으로 끌어다 놓으면
//       수많은 데이터가 한 장의 요약 보고서로 압축된다는 것을 단계로 보여준다.
import { useState } from 'react';
import { Wrap, Title, Subtitle, C, ExcelGrid, ProblemBox, TableCaption, ArrowRight } from './shared.jsx';

// ── 원본 데이터(사원 급여) — 부서·직위별로 흩어져 있는 raw 데이터 ──
const RAW = [
  ['강호선', '기획부', '부장', '4,200', '3,780'],
  ['김성산', '기획부', '사원', '2,600', '2,340'],
  ['이한별', '생산부', '부장', '4,000', '3,600'],
  ['박도현', '생산부', '사원', '2,500', '2,250'],
  ['최유진', '기획부', '사원', '2,700', '2,430'],
];
const RAW_HEAD = ['성명', '부서명', '직위', '기본급', '실수령액'];

// 배치할 필드와, 각 필드가 들어갈 영역(0=필터,1=행,2=열,3=값)
const FIELDS = [
  { name: '성명', zone: 0 },
  { name: '부서명', zone: 1 },
  { name: '직위', zone: 2 },
  { name: '기본급', zone: 3 },
  { name: '실수령액', zone: 3 },
];

// 단계: 필드가 순서대로 영역으로 들어간다
const STEPS = [
  { label: '원본 데이터', desc: '부서 · 직위별로 흩어진 급여 데이터. 그대로는 한눈에 비교하기 어렵다.' },
  { label: '성명 → 필터', desc: "'성명'을 필터 영역에 놓으면 보고서 위쪽에서 특정 사람만 골라 볼 수 있다." },
  { label: '부서명 → 행', desc: "'부서명'을 행에 놓으면 각 부서가 한 가로줄을 차지한다. 그래서 기획부의 데이터는 가로로 읽는다." },
  { label: '직위 → 열', desc: "'직위'를 열에 놓으면 각 직위가 한 세로칸을 차지한다. 그래서 부장의 데이터는 세로로 읽는다." },
  { label: '기본급 · 실수령액 → 값', desc: "숫자 필드를 값 영역에 놓으면 교차 지점마다 '합계'가 자동 계산된다." },
];

const ZONE_META = [
  { key: '필터', color: C.amber, bg: C.amberBg },
  { key: '행', color: C.green, bg: C.greenBg },
  { key: '열', color: C.blue, bg: C.blueBg },
  { key: '값 (Σ)', color: C.purpleLight, bg: C.purpleBg },
];

function Chip({ children, color, bg, ghost }) {
  return (
    <span style={{
      display: 'inline-block', padding: '5px 11px', borderRadius: 6, fontSize: 13, fontWeight: 700,
      background: ghost ? 'transparent' : bg, color: ghost ? C.textDim : color,
      border: `1px solid ${ghost ? C.border : color}`, margin: 3, whiteSpace: 'nowrap',
      transition: 'all .3s',
    }}>{children}</span>
  );
}

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

export function PivotBuildAnim() {
  const [slot, setSlot] = useState(0);

  const cellBase = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
    minHeight: 26, fontSize: 12, padding: '3px 6px', whiteSpace: 'nowrap',
  };

  // 각 필드가 지금 단계에서 영역으로 이동했는지
  const placed = (f) => slot >= f.zone + 1;
  // 결과 피벗을 보여줄 단계(값까지 배치 완료)
  const showPivot = slot >= 4;

  // 부서×직위 합계(기본급) 계산 — 완성 피벗 미리보기용
  const depts = ['기획부', '생산부'];
  const poss = ['부장', '사원'];
  const sumBase = (d, p) =>
    RAW.filter(r => r[1] === d && r[2] === p)
      .reduce((a, r) => a + Number(r[3].replace(/,/g, '')), 0);

  return (
    <Wrap>
      <Title>피벗 테이블 — 필드를 4개 영역에 끌어다 놓기</Title>
      <Subtitle>원본의 '필드'를 필터 · 행 · 열 · 값 영역으로 옮기면 수많은 데이터가 요약표로 압축됩니다</Subtitle>

      <div style={{ textAlign: 'center', fontSize: 13, color: C.textDim, marginBottom: 8 }}>👇 단계를 눌러 진행해 보세요</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {STEPS.map((s, i) => (
          <StepChip key={i} n={i + 1} label={s.label} active={i === slot} done={i < slot} onClick={() => setSlot(i)} />
        ))}
      </div>

      {/* 현재 단계 설명 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.6, textAlign: 'center' }}>
        {STEPS[slot].desc}
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* 왼쪽: 원본 데이터 */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 6, textAlign: 'center' }}>원본 데이터</div>
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '58px 58px 46px 52px 56px' }}>
              {RAW_HEAD.map((h, i) => (
                <div key={h} style={{ ...cellBase, background: '#0b1220', fontWeight: 700, color: C.blueLight, borderRight: i === RAW_HEAD.length - 1 ? 'none' : `1px solid ${C.border}` }}>{h}</div>
              ))}
            </div>
            {RAW.map((r, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '58px 58px 46px 52px 56px' }}>
                {r.map((v, ci) => (
                  <div key={ci} style={{ ...cellBase, color: C.textMuted, borderRight: ci === r.length - 1 ? 'none' : `1px solid ${C.border}` }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 필드 목록 + 4개 영역 */}
        <div style={{ minWidth: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 6 }}>필드 목록 / 영역</div>
          {/* 아직 배치 안 된 필드 */}
          <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', marginBottom: 10, minHeight: 40 }}>
            {FIELDS.filter(f => !placed(f)).map((f) => (
              <Chip key={f.name} ghost>{f.name}</Chip>
            ))}
            {FIELDS.every(placed) && <span style={{ color: C.textDim, fontSize: 12, padding: 6 }}>모든 필드 배치 완료 ✓</span>}
          </div>
          {/* 4개 영역 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ZONE_META.map((z, zi) => (
              <div key={zi} style={{ background: C.bg, border: `1.5px solid ${z.color}`, borderRadius: 8, padding: '7px 9px', minHeight: 54 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: z.color, marginBottom: 3 }}>{z.key}</div>
                {FIELDS.filter(f => f.zone === zi && placed(f)).map(f => (
                  <Chip key={f.name} color={z.color} bg={z.bg}>{f.name}{zi === 3 ? ' 합계' : ''}</Chip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 완성 피벗 미리보기 */}
      {showPivot && (
        <div style={{ marginTop: 18, animation: 'pvFade .5s ease' }}>
          <style>{'@keyframes pvFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 6, textAlign: 'center' }}>▼ 완성된 피벗 테이블 (기본급 합계)</div>
          <div style={{ maxWidth: 380, margin: '0 auto', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            {/* 헤더: 빈칸 + 직위(열) */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr' }}>
              <div style={{ ...cellBase, background: '#0b1220', color: C.textDim }}>부서\직위</div>
              {poss.map(p => <div key={p} style={{ ...cellBase, background: C.blueBg, color: C.blueLight, fontWeight: 700 }}>{p}</div>)}
            </div>
            {depts.map(d => (
              <div key={d} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr' }}>
                <div style={{ ...cellBase, background: C.greenBg, color: C.greenLight, fontWeight: 700 }}>{d}</div>
                {poss.map(p => <div key={p} style={{ ...cellBase, color: C.text }}>{sumBase(d, p).toLocaleString()}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}
    </Wrap>
  );
}

// ── 실전 문제: 급여대장 피벗 테이블 (실제 시험 데이터) ──
const PAY_HEAD = ['직급', '지점명', '근무부서', '이름', '기본급', '상여금', '인센티브', '총지급액'];
const PAY_ROWS = [
  ['부장', '광화문', '관리팀', '최재석', '3,000,000', '1,500,000', '425,000', '4,925,000'],
  ['과장', '을지로', '영업팀', '김현태', '2,700,000', '1,305,000', '485,000', '4,490,000'],
  ['부장', '을지로', '영업팀', '박상준', '3,000,000', '1,500,000', '846,000', '5,346,000'],
  ['대리', '광화문', '관리팀', '이준성', '2,200,000', '980,000', '375,000', '3,555,000'],
  ['부장', '서대문', '연구팀', '김세환', '3,000,000', '1,500,000', '1,500,000', '6,000,000'],
  ['과장', '광화문', '연구팀', '김형섭', '2,700,000', '1,305,000', '626,000', '4,631,000'],
];
// 정답 피벗: 행=직급, 열=지점명, 값=인센티브 합계
const PIVOT_RESULT = [
  ['인센티브 합계', '지점명', '', ''],
  ['직급', '광화문', '을지로', '서대문', '총합계'],
  ['부장', '3,173,000', '846,000', '1,500,000', '5,519,000'],
  ['과장', '626,000', '1,835,000', '1,114,100', '3,575,100'],
  ['대리', '375,000', '739,000', '671,500', '1,785,500'],
  ['총합계', '4,174,000', '3,420,000', '3,285,600', '10,879,600'],
];

export function PivotExamProblem() {
  // 원본 데이터에서 '피벗에 쓰는 열'을 색으로 힌트: 직급(행)·지점명(열)·인센티브(값)
  const srcStyle = (ri, ci) => {
    if (ri === 0) {
      if (ci === 0) return { bg: C.greenBg, color: C.greenLight, bold: true, align: 'center' };
      if (ci === 1) return { bg: C.blueBg, color: C.blueLight, bold: true, align: 'center' };
      if (ci === 6) return { bg: C.purpleBg, color: C.purpleLight, bold: true, align: 'center' };
      return { bg: '#0b1220', color: C.textDim, bold: true, align: 'center' };
    }
    if (ci === 0) return { color: C.greenLight };
    if (ci === 1) return { color: C.blueLight };
    if (ci === 6) return { color: C.purpleLight, bold: true };
    return { dim: true };
  };
  const resStyle = (ri, ci, val) => {
    if (ri === 0) return ci === 0 ? { bg: C.purpleBg, color: C.purpleLight, bold: true } : { bg: '#0b1220' };
    if (ri === 1) return { bg: ci === 0 ? C.greenBg : C.blueBg, color: ci === 0 ? C.greenLight : C.blueLight, bold: true, align: 'center' };
    if (ci === 0) return { bg: C.greenBg, color: C.greenLight, bold: true };
    if (val === '' ) return {};
    if (ri === 5 || ci === 4) return { bg: '#111c33', color: C.text, bold: true };
    return { color: C.text };
  };

  return (
    <Wrap>
      <Title>실전 문제 — 이렇게 풉니다 (피벗 테이블)</Title>
      <ProblemBox>
        아래 [표]의 <b>급여대장</b>을 이용하여 <b style={{ color: C.greenLight }}>직급</b>은 '행', <b style={{ color: C.blueLight }}>지점명</b>은 '열',
        <b style={{ color: C.purpleLight }}> 인센티브의 합계</b>는 'Σ 값'으로 하는 피벗 테이블을 작성하시오. (<b>열의 총합계만</b> 표시)
      </ProblemBox>

      <TableCaption>▼ 원본 데이터 (A2:H16 · 색칠한 열이 피벗에 쓰는 필드)</TableCaption>
      <ExcelGrid data={[PAY_HEAD, ...PAY_ROWS]} startRow={2} cellStyle={srcStyle} minColW={62} />
      <div style={{ fontSize: 12, color: C.textDim, margin: '4px 0 14px' }}>⋮ 이하 생략 (전체 15행)</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.amberLight }}>풀이</span>
        <span style={{ fontSize: 13, color: C.textMuted }}>
          범위 선택 → [삽입]→[피벗 테이블] → 직급을 <b style={{ color: C.greenLight }}>행</b>, 지점명을 <b style={{ color: C.blueLight }}>열</b>, 인센티브를 <b style={{ color: C.purpleLight }}>값</b>으로 드래그 → [디자인]→[총합계]→'열의 총합계만'
        </span>
      </div>

      <TableCaption color={C.green}>▼ 완성 결과 (피벗 테이블)</TableCaption>
      <ExcelGrid data={PIVOT_RESULT} startRow={1} startCol={0} cellStyle={resStyle} minColW={78} firstColW={92} />
    </Wrap>
  );
}

// ── 개념 파트 문제: '가전제품 판매현황' 피벗 (진행 순서 배우기 전 감 잡기) ──
const SALES_HEAD = ['판매일자', '지점', '담당자', '제품분류', '판매수량', '판매금액'];
const SALES_ROWS = [
  ['2024-01-05', '강남점', '김민준', '냉장고', '3', '4,500,000'],
  ['2024-01-12', '홍대점', '이서연', '세탁기', '5', '3,250,000'],
  ['2024-01-20', '잠실점', '박지호', 'TV', '4', '5,600,000'],
  ['2024-02-03', '강남점', '이서연', '에어컨', '2', '2,400,000'],
  ['2024-02-11', '홍대점', '김민준', '냉장고', '6', '9,000,000'],
  ['2024-02-18', '잠실점', '최유나', '세탁기', '3', '1,950,000'],
  ['2024-02-25', '강남점', '박지호', 'TV', '5', '7,000,000'],
  ['2024-03-04', '홍대점', '최유나', '에어컨', '4', '4,800,000'],
  ['2024-03-15', '잠실점', '김민준', '냉장고', '2', '3,000,000'],
  ['2024-03-22', '강남점', '이서연', '세탁기', '7', '4,550,000'],
];

// 완성 피벗 데이터 (필터=담당자, 행=판매일자 월, 열=지점, 값=판매수량 평균·판매금액 합계)
// PivotIntroProblem(비교)과 PivotAreaMap(영역 표시)이 공유한다.
const P_SITES = ['강남점', '홍대점', '잠실점'];
const PIVOT = [
  { m: '1월', avg: ['3', '5', '4'], sum: ['4,500,000', '3,250,000', '5,600,000'] },
  { m: '2월', avg: ['3.5', '6', '3'], sum: ['9,400,000', '9,000,000', '1,950,000'] },
  { m: '3월', avg: ['7', '4', '2'], sum: ['4,550,000', '4,800,000', '3,000,000'] },
];
// '피벗 스타일 보통 3' 계열 색 (실제 엑셀 자주색 톤)
const PV = { head: '#8c4a49', group: '#d8a9a7', groupTx: '#4a1f1e', line: '#d9cccb' };

export function PivotIntroProblem() {
  // 원본에서 피벗에 쓰는 열을 영역 색으로 힌트: 판매일자(행·green)·지점(열·blue)·
  // 담당자(필터·amber)·판매수량/판매금액(값·purple). 제품분류는 피벗 미사용.
  const srcStyle = (ri, ci) => {
    if (ri === 0) {
      if (ci === 0) return { bg: C.greenBg, color: C.greenLight, bold: true, align: 'center' };
      if (ci === 1) return { bg: C.blueBg, color: C.blueLight, bold: true, align: 'center' };
      if (ci === 2) return { bg: C.amberBg, color: C.amberLight, bold: true, align: 'center' };
      if (ci === 4 || ci === 5) return { bg: C.purpleBg, color: C.purpleLight, bold: true, align: 'center' };
      return { bg: '#0b1220', color: C.textDim, bold: true, align: 'center' };
    }
    if (ci === 0) return { color: C.greenLight };
    if (ci === 1) return { color: C.blueLight };
    if (ci === 2) return { color: C.amberLight };
    if (ci === 4 || ci === 5) return { color: C.purpleLight, bold: ci === 5 };
    return { dim: true };
  };

  const cond = [
    "피벗 테이블 보고서는 동일 시트의 [H3] 셀에서 시작하시오.",
    "피벗 테이블 보고서는 행/열의 총합계를 해제하시오.",
    "보고서 레이아웃은 '개요 형식'으로 지정하시오.",
    "'∑' 기호를 '행' 영역으로 이동하시오.",
    "'판매일자' 필드는 '월' 단위로 그룹을 지정하시오.",
    "값 영역의 '판매금액의 합계'는 '셀 서식' 대화상자에서 표시 형식을 '숫자' 범주의 천 단위 구분 기호로 지정하시오.",
    "빈 셀은 '*' 기호로 표시하고 '레이블이 있는 셀 병합 및 가운데 맞춤'을 설정하시오.",
    "피벗 테이블 스타일은 '피벗 스타일 보통 3'으로 설정하시오.",
  ];

  // 완성 피벗 표시(조건 반영: 개요 형식 · 행/열 총합계 해제 · 천 단위 구분 · 피벗 스타일 보통 3)
  const gcols = '84px 120px 94px 94px 94px';
  const lc = {
    display: 'flex', alignItems: 'center', minHeight: 28, fontSize: 12.5,
    padding: '4px 9px', whiteSpace: 'nowrap', color: '#1a1a1a', background: '#fff',
    borderRight: `1px solid ${PV.line}`, borderBottom: `1px solid ${PV.line}`,
  };
  const Dd = () => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 15, height: 14, marginLeft: 6, background: '#efefef', border: '1px solid #b0b0b0',
      borderRadius: 2, fontSize: 8, color: '#555', flexShrink: 0,
    }}>▼</span>
  );

  return (
    <Wrap>

      <ProblemBox>
        [피벗 테이블] 기능을 이용하여 '가전제품 판매현황' 표의
        <b style={{ color: C.amberLight }}> 담당자</b>는 '필터',
        <b style={{ color: C.greenLight }}> 판매일자</b>는 '행',
        <b style={{ color: C.blueLight }}> 지점</b>은 '열'로 처리하고
        '값'에 <b style={{ color: C.purpleLight }}>판매수량의 평균</b>과 <b style={{ color: C.purpleLight }}>판매금액의 합계</b>를 계산하시오.
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, fontSize: 13.5, lineHeight: 1.95 }}>
          {cond.map((t, i) => (
            <div key={i} style={{ color: C.textMuted }}>• {t}</div>
          ))}
        </div>
      </ProblemBox>

      {/* 왼쪽: 원본 데이터 → 오른쪽: 완성 피벗 테이블 (좌우 나란히 비교, 가로 스크롤 없이 한 화면에) */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'nowrap', justifyContent: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <TableCaption>▼ 원본 데이터 '가전제품 판매현황' (색칠한 열이 피벗에 쓰는 필드)</TableCaption>
          <ExcelGrid data={[SALES_HEAD, ...SALES_ROWS]} startRow={3} cellStyle={srcStyle} minColW={52} firstColW={74} />
        </div>

        <div style={{ alignSelf: 'center', flexShrink: 0 }}>
          <ArrowRight color={C.textMuted} size={28} />
        </div>

        <div style={{ flexShrink: 0 }}>
          <TableCaption color={C.green}>▼ 완성된 피벗 테이블 (개요 형식 · 피벗 스타일 보통 3)</TableCaption>
          <div style={{ display: 'inline-block', background: '#fff', border: `1px solid ${PV.line}`, borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.35)' }}>
            {/* 필터 영역: 담당자 (모두)▼ */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...lc, fontWeight: 700, borderRight: 'none' }}>담당자</div>
              <div style={{ ...lc, justifyContent: 'space-between', borderRight: 'none' }}>(모두)<Dd /></div>
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
            </div>
            {/* 빈 행 */}
            <div style={{ height: 7 }} />
            {/* 열 필드 헤더: 지점 ▼ 은 첫 데이터 열(강남점) 위에 왼쪽 정렬로 표시 */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center', borderRight: 'none' }}>지점<Dd /></div>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, borderRight: 'none' }} />
            </div>
            {/* 행/값 헤더: 판매일자▼ | 값 | 지점들 */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'space-between' }}>판매일자<Dd /></div>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center' }}>값</div>
              {P_SITES.map((s, i) => (
                <div key={s} style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center', borderRight: i === P_SITES.length - 1 ? 'none' : `1px solid ${PV.head}` }}>{s}</div>
              ))}
            </div>
            {PIVOT.map((row) => (
              <div key={row.m}>
                {/* 월 그룹 헤더(행) — 개요 형식이라 한 줄 전체가 그룹 밴드 */}
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc, background: PV.group, borderColor: PV.group, color: PV.groupTx, fontWeight: 700 }}>{row.m}</div>
                  <div style={{ ...lc, gridColumn: 'span 4', background: PV.group, borderColor: PV.group, borderRight: 'none' }} />
                </div>
                {/* 값1: 평균 : 판매수량 */}
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc }} />
                  <div style={{ ...lc, paddingLeft: 14 }}>평균 : 판매수량</div>
                  {row.avg.map((v, i) => (
                    <div key={i} style={{ ...lc, justifyContent: 'flex-end', borderRight: i === row.avg.length - 1 ? 'none' : `1px solid ${PV.line}` }}>{v}</div>
                  ))}
                </div>
                {/* 값2: 합계 : 판매금액 (천 단위 구분) */}
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc }} />
                  <div style={{ ...lc, paddingLeft: 14 }}>합계 : 판매금액</div>
                  {row.sum.map((v, i) => (
                    <div key={i} style={{ ...lc, justifyContent: 'flex-end', borderRight: i === row.sum.length - 1 ? 'none' : `1px solid ${PV.line}` }}>{v}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrap>
  );
}

// 엑셀 '피벗 테이블 필드' 창을 재현 — 필드 목록 + 네 영역(필터·열·행·값)에 실제 필드를 배치한 모습.
// (lesson-14.png 의 빈 창에 이번 문제의 필드를 실제로 끌어다 놓은 상태)
function PivotFieldPane() {
  const FIELDS = [
    { n: '판매일자', on: true },
    { n: '지점', on: true },
    { n: '담당자', on: true },
    { n: '제품분류', on: false },
    { n: '판매수량', on: true },
    { n: '판매금액', on: true },
  ];
  // 2×2 배치: [필터 | 열] / [행 | 값] — 상자 색은 왼쪽 피벗의 영역색과 동일
  const ZONES = [
    { key: '필터', icon: '▽', c: C.amber,       fill: '#fdf0d5', chips: ['담당자'] },
    { key: '열',   icon: '▤', c: C.blue,        fill: '#e2edff', chips: ['지점'] },
    { key: '행',   icon: '≣', c: C.green,       fill: '#dcf5e4', chips: ['판매일자', '∑ 값'] },
    { key: 'Σ 값', icon: 'Σ', c: C.purpleLight, fill: '#efe4fb', chips: ['평균 : 판매수량', '합계 : 판매금액'] },
  ];
  const box = { background: '#fbfbfb', border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, minHeight: 66 };

  return (
    <div style={{ width: 292, background: '#f3f3f3', border: '1px solid #cfcfcf', borderRadius: 6, padding: 12, boxShadow: '0 1px 6px rgba(0,0,0,.35)', fontSize: 12.5, color: '#333' }}>
      {/* 제목 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#217346', fontWeight: 800, fontSize: 14 }}>피벗 테이블 필드</span>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: 12 }}>▾ ✕</span>
      </div>
      <div style={{ color: '#555', fontSize: 11.5, marginBottom: 6 }}>보고서에 추가할 필드 선택:</div>
      {/* 검색창 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #cfcfcf', borderRadius: 3, padding: '4px 8px', color: '#999', marginBottom: 8 }}>
        <span>검색</span><span>🔍</span>
      </div>
      {/* 필드 목록 (체크박스) */}
      <div style={{ background: '#fff', border: '1px solid #d9d9d9', borderRadius: 3, padding: '6px 8px', marginBottom: 10 }}>
        {FIELDS.map((f) => (
          <div key={f.n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <span style={{
              width: 14, height: 14, borderRadius: 2, border: `1px solid ${f.on ? '#217346' : '#b0b0b0'}`,
              background: f.on ? '#217346' : '#fff', color: '#fff', fontSize: 10, fontWeight: 900,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{f.on ? '✓' : ''}</span>
            <span style={{ color: f.on ? '#222' : '#999', fontWeight: f.on ? 600 : 400 }}>{f.n}</span>
          </div>
        ))}
      </div>
      <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>아래 영역 사이에 필드를 끌어 놓으십시오.</div>
      {/* 네 영역 드롭 존 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {ZONES.map((z) => (
          <div key={z.key} style={box}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 15, height: 15, borderRadius: 3, background: z.c, color: '#0b1220', fontSize: 10, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{z.icon}</span>
              <span style={{ color: '#444', fontWeight: 700 }}>{z.key}</span>
            </div>
            {z.chips.map((ch) => (
              <div key={ch} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: z.fill, border: `2px solid ${z.c}`, borderRadius: 4, padding: '3px 7px',
                fontSize: 11.5, fontWeight: 700, color: '#1a1a1a', marginTop: 4, whiteSpace: 'nowrap',
              }}>{ch}<span style={{ color: '#888', fontSize: 9, marginLeft: 6 }}>▾</span></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 완성된 피벗 테이블 위에 네 영역(필터·행·열·값)이 어디에 자리 잡는지 네모 상자로 표시
export function PivotAreaMap() {
  // 고정 기하: 열 너비 / 행 높이를 상수로 잡아 오버레이 상자 좌표를 정확히 계산
  const W = [84, 120, 94, 94, 94];
  const xs = [0]; W.forEach((w) => xs.push(xs[xs.length - 1] + w)); // [0,84,204,298,392,486]
  const TW = xs[5];        // 표 전체 너비 486
  const H = 28, BLANK = 8; // 행 높이 / 필터 아래 빈 행
  const gcols = W.map((w) => `${w}px`).join(' ');
  // 표 시작 오프셋(라벨을 둘 여백)
  const OX = 54, OY = 40, RP = 58, BP = 20;

  const lc = {
    display: 'flex', alignItems: 'center', height: H, fontSize: 12.5, padding: '0 9px',
    whiteSpace: 'nowrap', color: '#1a1a1a', background: '#fff', boxSizing: 'border-box',
    borderRight: `1px solid ${PV.line}`, borderBottom: `1px solid ${PV.line}`,
  };
  const Dd = () => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 15, height: 14, marginLeft: 6, background: '#efefef', border: '1px solid #b0b0b0',
      borderRadius: 2, fontSize: 8, color: '#555', flexShrink: 0,
    }}>▼</span>
  );

  // 행 y 좌표(표 기준). filter→blank→열필드→헤더→(그룹+값2)×3
  const yFilter = 0;
  const yColField = yFilter + H + BLANK;   // 36
  const yHead = yColField + H;             // 64
  const yBody = yHead + H;                 // 92
  const TH = yBody + H * 9;                // 344

  // 네 영역 상자 정의 (표 좌표계). 색은 학습 자료 영역색과 통일.
  const ZONES = [
    { key: '① 필터', c: C.amber,       x: 0,      y: yFilter,   w: xs[2],       h: H,            pos: 'top',   role: '보고서 맨 위 · 특정 항목만 골라 보기' },
    { key: '③ 열',   c: C.blue,        x: xs[2],  y: yColField, w: TW - xs[2],  h: H * 2,        pos: 'top',   role: '데이터를 세로로 읽는 칸 (강남점 → 세로 한 칸)' },
    { key: '② 행',   c: C.green,       x: 0,      y: yHead,     w: xs[1],       h: TH - yHead,   pos: 'left',  role: '데이터를 가로로 읽는 줄 (1월 → 가로 한 줄)' },
    { key: '④ 값',   c: C.purpleLight, x: xs[1],  y: yBody,     w: TW - xs[1],  h: TH - yBody,   pos: 'right', role: '교차 지점마다 계산되는 숫자' },
  ];

  const Tag = ({ left, top, c, children }) => (
    <div style={{
      position: 'absolute', left, top, background: c, color: '#0b1220', fontWeight: 800,
      fontSize: 12.5, padding: '3px 9px', borderRadius: 6, whiteSpace: 'nowrap',
      boxShadow: '0 1px 5px rgba(0,0,0,.45)',
    }}>{children}</div>
  );

  // 태그 위치 계산(상자 바깥, 여백 쪽)
  const tagFor = (z) => {
    if (z.pos === 'top')   return { left: OX + z.x + z.w / 2 - 26, top: OY + z.y - 26 };
    if (z.pos === 'left')  return { left: 6,                       top: OY + z.y + z.h / 2 - 13 };
    return { left: OX + z.x + z.w + 10, top: OY + z.y + z.h / 2 - 13 }; // right
  };

  const filterCell = { ...lc };

  return (
    <Wrap>
      <Title>완성된 피벗 테이블 ↔ 필드 배치</Title>
      <Subtitle>왼쪽은 결과 표에서의 자리, 오른쪽은 필드 창에서의 배치. 같은 색이 같은 영역입니다</Subtitle>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'nowrap' }}>
        {/* 왼쪽: 완성 피벗 테이블 + 영역 상자 */}
        <div style={{ position: 'relative', padding: `${OY}px ${RP}px ${BP}px ${OX}px`, flexShrink: 0 }}>
          {/* 실제 완성 피벗 테이블 (고정 높이) */}
          <div style={{ background: '#fff', border: `1px solid ${PV.line}`, borderRadius: 4, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.35)' }}>
            {/* 필터: 담당자 (모두)▼ */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...filterCell, fontWeight: 700, borderRight: 'none' }}>담당자</div>
              <div style={{ ...filterCell, justifyContent: 'space-between', borderRight: 'none' }}>(모두)<Dd /></div>
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
              <div style={{ ...lc, background: 'transparent', border: 'none' }} />
            </div>
            {/* 빈 행 */}
            <div style={{ height: BLANK }} />
            {/* 열 필드: 지점 ▼ (강남점 위, 가운데 정렬, 오른쪽 선 제거) */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center', borderRight: 'none' }}>지점<Dd /></div>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head }} />
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, borderRight: 'none' }} />
            </div>
            {/* 헤더: 판매일자▼ | 값 | 지점들 */}
            <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'space-between' }}>판매일자<Dd /></div>
              <div style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center' }}>값</div>
              {P_SITES.map((s, i) => (
                <div key={s} style={{ ...lc, background: PV.head, borderColor: PV.head, color: '#fff', fontWeight: 700, justifyContent: 'center', borderRight: i === P_SITES.length - 1 ? 'none' : `1px solid ${PV.head}` }}>{s}</div>
              ))}
            </div>
            {PIVOT.map((row) => (
              <div key={row.m}>
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc, background: PV.group, borderColor: PV.group, color: PV.groupTx, fontWeight: 700 }}>{row.m}</div>
                  <div style={{ ...lc, gridColumn: 'span 4', background: PV.group, borderColor: PV.group, borderRight: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc }} />
                  <div style={{ ...lc, paddingLeft: 14 }}>평균 : 판매수량</div>
                  {row.avg.map((v, i) => (
                    <div key={i} style={{ ...lc, justifyContent: 'flex-end', borderRight: i === row.avg.length - 1 ? 'none' : `1px solid ${PV.line}` }}>{v}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: gcols }}>
                  <div style={{ ...lc }} />
                  <div style={{ ...lc, paddingLeft: 14 }}>합계 : 판매금액</div>
                  {row.sum.map((v, i) => (
                    <div key={i} style={{ ...lc, justifyContent: 'flex-end', borderRight: i === row.sum.length - 1 ? 'none' : `1px solid ${PV.line}` }}>{v}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 네 영역 오버레이 상자 + 라벨 */}
          {ZONES.map((z) => (
            <div key={z.key} style={{
              position: 'absolute', left: OX + z.x - 3, top: OY + z.y - 3,
              width: z.w + 6, height: z.h + 6, border: `2.5px solid ${z.c}`, borderRadius: 5,
              boxShadow: `0 0 0 2px ${z.c}22`, pointerEvents: 'none',
            }} />
          ))}
          {ZONES.map((z) => {
            const t = tagFor(z);
            return <Tag key={z.key} left={t.left} top={t.top} c={z.c}>{z.key}</Tag>;
          })}
        </div>

        {/* 오른쪽: 피벗 테이블 필드 창 (같은 필드를 네 영역에 배치) */}
        <div style={{ flexShrink: 0, paddingTop: OY - 6 }}>
          <PivotFieldPane />
        </div>
      </div>

      {/* 영역별 역할 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
        {ZONES.map((z) => (
          <div key={z.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bgDark, border: `1px solid ${C.border}`, borderLeft: `4px solid ${z.c}`, borderRadius: 8, padding: '8px 12px' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: z.c, whiteSpace: 'nowrap' }}>{z.key}</span>
            <span style={{ fontSize: 13, color: C.textMuted }}>{z.role}</span>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// 피벗 테이블 만드는 4단계 흐름(개념 요약) — 정적 다이어그램
export function PivotStepsDiagram() {
  const steps = [
    { n: '①', t: '원본 데이터 선택', d: '제목행 포함 표 전체. (A열 클릭 후 Ctrl+Shift+↓→)' },
    { n: '②', t: '[삽입] → [피벗 테이블]', d: '보고서 위치를 새 워크시트 / 기존 워크시트 중 선택' },
    { n: '③', t: '필드를 영역으로 드래그', d: '필터 · 행 · 열 · 값 4영역에 필드를 끌어다 놓기' },
    { n: '④', t: '옵션 · 서식 다듬기', d: '총합계 · 빈 셀 표시 · 표시 형식 · 스타일 지정' },
  ];
  return (
    <Wrap>
      <Title>피벗 테이블 만들기 — 4단계</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', background: C.blueBg, border: `1px solid ${C.blueDim}`, color: C.blueLight, fontWeight: 800, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{s.t}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
}
