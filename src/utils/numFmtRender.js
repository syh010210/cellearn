// 표시 형식 코드 → 렌더 함수. 카탈로그가 만드는 문법만 지원한다:
//   숫자: 0 # , (천 단위·절삭) . 소수 "리터럴" \리터럴 리터럴공백 %
//   날짜: yyyy yy mm m dd d aaa aaaa ddd dddd (그 외 / ( ) - 등은 리터럴)
//   텍스트: @ (+ "리터럴")
// 조건([Red] 등)·분수(?)·지수(E)·구역(;) 등은 미지원 → null 반환.
// 값: 숫자면 number, 날짜면 엑셀 serial(number), 텍스트(@)면 문자열/숫자 아무거나 받는다.

const WD1 = ["일", "월", "화", "수", "목", "금", "토"];
const WD_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_EN_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function tokenize(code) {
  const s = String(code ?? ""); const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '"') { i++; while (i < s.length && s[i] !== '"') { out.push({ t: "lit", v: s[i] }); i++; } i++; continue; }
    if (ch === "\\") { i++; if (i < s.length) { out.push({ t: "lit", v: s[i] }); i++; } continue; }
    if (/\s/.test(ch)) { out.push({ t: "lit", v: " " }); i++; continue; }
    out.push({ t: "fmt", v: ch }); i++;
  }
  return out;
}

// fmt 토큰에 날짜 문자(y/d/a)가 있으면 날짜 형식으로 본다. (m 은 단독으론 애매하므로 y/d/a 로 판별)
export function isDateCode(code) { return tokenize(code).some((tk) => tk.t === "fmt" && /[yda]/.test(tk.v)); }

function serialToYMD(serial) {
  const ms = Math.round((Number(serial) - 25569) * 86400000);
  const dt = new Date(ms);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), wd: WD1[dt.getUTCDay()], dow: dt.getUTCDay() };
}
const p2 = (n) => String(n).padStart(2, "0");
function dateToken(tok, { y, m, d, wd, dow }) {
  switch (tok) {
    case "yyyy": return String(y);
    case "yy": return String(y).slice(-2);
    case "mm": return p2(m);
    case "m": return String(m);
    case "dddd": return WD_EN_FULL[dow]; // 영문 요일 전체 (dd/d 보다 먼저 처리)
    case "ddd": return WD_EN[dow];       // 영문 요일 약어
    case "dd": return p2(d);
    case "d": return String(d);
    case "aaaa": return wd + "요일";
    case "aaa": return wd;
    default: return tok; // 알 수 없는 런은 리터럴 취급
  }
}
function renderDate(tokens, serial) {
  const ymd = serialToYMD(serial);
  let out = "", buf = "";
  const flush = () => { if (buf) { out += dateToken(buf, ymd); buf = ""; } };
  for (const tk of tokens) {
    if (tk.t === "fmt" && /[ymda]/.test(tk.v)) { if (buf && buf[0] !== tk.v) flush(); buf += tk.v; }
    else { flush(); out += tk.v; } // 리터럴 또는 날짜 아닌 fmt 문자(/ ( ) - …)
  }
  flush();
  return out;
}

function renderNumber(tokens, value) {
  let percent = false, phase = 0, before = "", after = "", pat = "";
  for (const tk of tokens) {
    if (tk.t === "fmt") {
      if (tk.v === "%") { percent = true; after += "%"; phase = phase === 0 ? phase : 2; continue; }
      if (/[#0,.]/.test(tk.v)) { if (phase === 2) return null; phase = 1; pat += tk.v; continue; }
      return null; // 미지원 fmt 문자
    }
    if (phase === 0) before += tk.v; else { phase = 2; after += tk.v; }
  }
  if (!pat) return before + after;

  let intPart = pat, decPart = "";
  const dot = pat.indexOf(".");
  if (dot >= 0) { intPart = pat.slice(0, dot); decPart = pat.slice(dot + 1); }
  let scale = 0;
  if (decPart) { const mm = decPart.match(/,+$/); if (mm) { scale = mm[0].length; decPart = decPart.slice(0, -scale); } }
  else { const mm = intPart.match(/,+$/); if (mm) { scale = mm[0].length; intPart = intPart.slice(0, -scale); } }
  const grouping = intPart.includes(",");
  const intDigits = intPart.replace(/,/g, "");
  const minInt = (intDigits.match(/0/g) || []).length;
  const decimals = decPart.replace(/[^#0]/g, "").length;

  let v = value * (percent ? 100 : 1) / Math.pow(1000, scale);
  const neg = v < 0; v = Math.abs(v);
  const numStr = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
  let ip = decimals > 0 ? numStr.slice(0, numStr.indexOf(".")) : numStr;
  const dp = decimals > 0 ? numStr.slice(numStr.indexOf(".") + 1) : "";
  if (minInt === 0 && Number(ip) === 0) ip = "";
  else while (ip.length < minInt) ip = "0" + ip;
  if (grouping && ip) ip = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const res = ip + (decimals > 0 ? "." + dp : "");
  return before + (neg ? "-" : "") + res + after;
}

// @ 텍스트 서식: @ 는 원래 값(문자열)으로, 나머지 리터럴은 그대로. 다른 fmt 문자가 섞이면 미지원.
function renderText(tokens, value) {
  let out = "";
  for (const tk of tokens) {
    if (tk.t === "fmt") { if (tk.v === "@") out += String(value); else return null; }
    else out += tk.v;
  }
  return out;
}

// 코드+값 → 표시 문자열. 미지원 문법이면 null.
export function renderNumFmt(code, value) {
  if (code == null) return null;
  const tokens = tokenize(code);
  if (tokens.some((tk) => tk.t === "fmt" && tk.v === "@")) return renderText(tokens, value);
  if (tokens.some((tk) => tk.t === "fmt" && /[?E;[\]]/i.test(tk.v))) return null;
  return isDateCode(code) ? renderDate(tokens, value) : renderNumber(tokens, value);
}

// 두 코드가 주어진 샘플들에서 결과가 같은지. true | false | null(미지원)
export function renderEqual(codeA, codeB, samples) {
  for (const s of samples) {
    const a = renderNumFmt(codeA, s), b = renderNumFmt(codeB, s);
    if (a === null || b === null) return null;
    if (a !== b) return false;
  }
  return true;
}
// 첫 번째로 다른 샘플과 두 렌더 결과. 같으면 null.
export function firstDiff(studentCode, expectedCode, samples) {
  for (const s of samples) {
    const st = renderNumFmt(studentCode, s), ex = renderNumFmt(expectedCode, s);
    if (st === null || ex === null) return null;
    if (st !== ex) return { value: s, student: st, expected: ex };
  }
  return null;
}
