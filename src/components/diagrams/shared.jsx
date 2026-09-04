// Shared utilities for all diagram components. Inline styles only — no Tailwind.

// 다이어그램의 모든 텍스트(한글·영문·숫자·수식)는 페이지 기본 글꼴로 통일한다.
export const FONT = "'Noto Sans KR', sans-serif";

export const C = {
  bg: '#1e293b',
  bgDark: '#0f172a',
  blue: '#60a5fa', blueLight: '#93c5fd', blueDim: '#3b82f6', blueBg: '#172554', blueCard: '#0c2344',
  green: '#22c55e', greenLight: '#86efac', greenBg: '#14532d', greenDark: '#052e16',
  red: '#ef4444', redLight: '#fca5a5', redBg: '#450a0a', redDark: '#1a0b0b',
  amber: '#fbbf24', amberLight: '#fcd34d', amberBg: '#431407',
  purple: '#a855f7', purpleLight: '#d8b4fe', purpleBg: '#2e1065', purpleCard: '#1e0f47',
  orange: '#fb923c', orangeBg: '#431407', orangeLight: '#fdba74',
  text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#64748b', textSlate: '#475569',
  border: '#334155',
};

export function Wrap({ children }) {
  return (
    <div style={{
      // 밝은 개념 페이지 위에서 브랜드 톤(딥그린) 피규어 카드로 보이게 한다.
      background: '#123a33', border: '1px solid #1f4f45', borderRadius: 16, padding: 20,
      margin: '10px 0 14px',
      // 다이어그램 안의 모든 텍스트를 페이지 기본 글꼴(문제 텍스트와 동일)로 통일한다.
      fontFamily: FONT, color: C.text,
    }}>
      {children}
    </div>
  );
}

export function Title({ children }) {
  return (
    <h3 style={{ textAlign: 'center', color: C.blue, fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
      {children}
    </h3>
  );
}

export function Subtitle({ children }) {
  return (
    <p style={{ textAlign: 'center', color: C.textDim, fontSize: 16, margin: '0 0 18px' }}>
      {children}
    </p>
  );
}

export function BottomBar({ children }) {
  return (
    <div style={{ background: C.bgDark, borderRadius: 8, padding: '10px 16px', marginTop: 18, textAlign: 'center' }}>
      {children}
    </div>
  );
}

export function BLine({ children, color, bold = false, size = 15 }) {
  return (
    <div style={{ color: color || C.textMuted, fontSize: size, fontWeight: bold ? 700 : 400, lineHeight: 1.7 }}>
      {children}
    </div>
  );
}

// A single grid/table cell with flexbox vertical centering
export function Cell({ children, bg, border, bw = 1, style = {} }) {
  return (
    <div style={{
      background: bg || C.bgDark,
      border: `${bw}px solid ${border || C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 44, padding: '6px 8px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// Card container
export function Card({ children, bg, border, bw = 2, style = {} }) {
  return (
    <div style={{
      background: bg, border: `${bw}px solid ${border}`, borderRadius: 10,
      padding: '12px 16px', ...style,
    }}>
      {children}
    </div>
  );
}

export function ArrowDown({ color = '#3b82f6', size = 36 }) {
  return (
    <svg width="20" height={size} style={{ display: 'block', margin: '2px auto' }}>
      <line x1="10" y1="0" x2="10" y2={size - 12} stroke={color} strokeWidth="2.5" />
      <polygon points={`3,${size - 14} 17,${size - 14} 10,${size}`} fill={color} />
    </svg>
  );
}

export function ArrowRight({ color = '#3b82f6', size = 40 }) {
  return (
    <svg width={size} height="20" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <line x1="0" y1="10" x2={size - 12} y2="10" stroke={color} strokeWidth="2.5" />
      <polygon points={`${size - 14},3 ${size - 14},17 ${size},10`} fill={color} />
    </svg>
  );
}

// 열 인덱스(0-based) → 엑셀 열 문자 (0→A, 26→AA)
export function colLetter(i) {
  let s = ''; i += 1;
  while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
  return s;
}

// 실제 시험지처럼 보이는 엑셀 표. 열 문자(A,B…)·행 번호가 실제 셀 주소와 맞는다.
//  data      : 2차원 배열(문자/숫자). 빈 칸은 '' 또는 null.
//  startCol  : 첫 열 인덱스(0=A). startRow: 첫 행 번호(1=1행).
//  cellStyle : (ri, ci, val) => ({ bg, color, bold, align, dim }) 로 개별 셀 강조.
export function ExcelGrid({ data, startCol = 0, startRow = 1, cellStyle, minColW = 56, firstColW }) {
  const nCols = Math.max(...data.map((r) => r.length));
  const th = {
    background: '#0b1220', color: C.textDim, fontWeight: 700, fontSize: 13,
    border: `1px solid ${C.border}`, padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap',
  };
  return (
    <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 6, display: 'inline-block', maxWidth: '100%' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: FONT }}>
        <thead>
          <tr>
            <th style={{ ...th, minWidth: 26, position: 'sticky', left: 0 }} />
            {Array.from({ length: nCols }, (_, ci) => (
              <th key={ci} style={{ ...th, minWidth: ci === 0 ? (firstColW || minColW) : minColW }}>{colLetter(startCol + ci)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              <td style={{ ...th, minWidth: 26 }}>{startRow + ri}</td>
              {Array.from({ length: nCols }, (_, ci) => {
                const val = row[ci] ?? '';
                const st = cellStyle ? (cellStyle(ri, ci, val) || {}) : {};
                return (
                  <td key={ci} style={{
                    border: `1px solid ${C.border}`, padding: '7px 6px', fontSize: 14.5,
                    background: st.bg || C.bgDark,
                    color: st.color || (st.dim ? C.textDim : C.text),
                    fontWeight: st.bold ? 700 : 400,
                    textAlign: st.align || 'center',
                    whiteSpace: 'nowrap',
                  }}>{val === null ? '' : val}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 시험 문제 지시문 박스
export function ProblemBox({ no, children, tag = '문제' }) {
  return (
    <div style={{
      background: C.bgDark, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.amber}`,
      borderRadius: 8, padding: '11px 15px', marginBottom: 14, fontSize: 14.5, color: C.text, lineHeight: 1.7,
    }}>
      <span style={{ color: C.amber, fontWeight: 800, marginRight: 8, fontSize: 13 }}>{tag}{no ? ` ${no}` : ''}</span>
      {children}
    </div>
  );
}

// 작은 회색 캡션 라벨 (예: '원본 데이터', '완성 결과')
export function TableCaption({ children, color }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 700, color: color || C.textMuted, margin: '4px 0 6px' }}>{children}</div>
  );
}
