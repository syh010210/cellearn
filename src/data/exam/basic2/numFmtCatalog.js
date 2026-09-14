// 기본작업-2 ③ 표시 형식 카탈로그.
// 각 항목은 이 코드 하나만 정확히 렌더링한다(범용 서식 렌더러 아님).
// 표시 예 값은 조립기가 데이터에서 실제 값을 뽑아 render 로 만든다.

const WD1 = ["일", "월", "화", "수", "목", "금", "토"];
const pad2 = (n) => String(n).padStart(2, "0");
const parseISO = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); const wd = WD1[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; return { y, m, d, wd }; };
const comma = (n) => n.toLocaleString("ko-KR");

// 세트 baseFormat 으로 "앞쪽 값"을 렌더 (표시 예 왼쪽).
export function renderBase(iso, baseFormat) {
  const { y, m, d } = parseISO(iso);
  if (baseFormat === 'm"월" d"일"') return `${m}월 ${d}일`;
  return `${y}-${pad2(m)}-${pad2(d)}`; // 기본 yyyy-mm-dd
}

export const NUMFMT_CATALOG = [
  // ── 숫자류 ──
  { id: "seq-gp", kind: "number", target: ["seq"], code: '"GP-"000',
    phrase: "일련번호를 'GP-'로 시작하는 세 자리로 표시하시오.",
    render: (v) => "GP-" + String(v).padStart(3, "0") },
  { id: "count-star-gae", kind: "number", target: ["count"], code: '"*"0"개"', zeroExample: true,
    phrase: "숫자 앞에 '*'를 표시하고 숫자 뒤에 '개'를 표시 예와 같이 표시하시오.",
    render: (v) => "*" + v + "개" },
  { id: "count-myeong", kind: "number", target: ["count"], code: '0"명"',
    phrase: "숫자 뒤에 '명'을 표시하시오.",
    render: (v) => v + "명" },
  { id: "money-won", kind: "number", target: ["money"], code: '#,##0"원"',
    phrase: "천 단위 구분 기호와 숫자 뒤에 '원'을 표시하시오.",
    render: (v) => comma(v) + "원" },
  { id: "money-cheon", kind: "number", target: ["money"], code: '#,##0,"천원"', preferDivisor: 1000,
    phrase: "천 단위를 절삭하고 숫자 뒤에 '천원'을 표시하시오.",
    render: (v) => comma(Math.round(v / 1000)) + "천원" },
  { id: "money-baekman", kind: "number", target: ["money"], code: '0.00,,"백만"', requires7digit: true, preferDivisor: 1000000,
    phrase: "백만 단위를 절삭하고 숫자 뒤에 '백만'을 표시하시오.",
    render: (v) => (v / 1e6).toFixed(2) + "백만" },
  { id: "percent-literal", kind: "number", target: ["percentInt"], code: '0"%"',
    phrase: "숫자 뒤에 '%'를 표시하시오.",
    render: (v) => v + "%" },

  // ── 날짜류 (표시 예는 '날짜를 [ … ]과 같이 표시하시오.' 문형으로 조립) ──
  { id: "date-mmddaaa", kind: "date", target: ["date"], code: 'mm"월" dd"일"(aaa)',
    render: (iso) => { const { m, d, wd } = parseISO(iso); return `${pad2(m)}월 ${pad2(d)}일(${wd})`; } },
  { id: "date-mdaaa", kind: "date", target: ["date"], code: 'm/d(aaa)',
    render: (iso) => { const { m, d, wd } = parseISO(iso); return `${m}/${d}(${wd})`; } },
  { id: "date-yymmaaa", kind: "date", target: ["date"], code: 'yy/mm(aaa)',
    render: (iso) => { const { y, m, wd } = parseISO(iso); return `${String(y).slice(2)}/${pad2(m)}(${wd})`; } },

  // ── 내장 '간단한 날짜'(14). 코드를 쓰는 게 아니라 형식 선택. baseFormat 이 이미 yyyy-mm-dd 인 세트에선 미출제. ──
  { id: "date-simple", kind: "builtinDate", target: ["date"],
    codes: ["mm-dd-yy", "m/d/yy", "yyyy-mm-dd"],
    phrase: "'간단한 날짜' 형식으로 표시하시오." },
];

export const catalogById = Object.fromEntries(NUMFMT_CATALOG.map((c) => [c.id, c]));
