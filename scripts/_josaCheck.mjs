// scripts/_josaCheck.mjs — 지시문·▶ 줄의 조사 정합성 검사 (테스트·dump 공용)
// (한글·숫자·영문 단어)(\[범위\])?("?)(이|가|을|를|은|는|과|와|으로|로)(경계) 를 찾아 받침 규칙과 대조.
// "로"는 ㄹ 받침 예외. 조사가 아닌 경우(단어 일부)는 뒤 경계(공백·,·.·)·]·"·끝)로 걸러낸다.

const DIGIT_BATCHIM = new Set(["0", "1", "3", "6", "7", "8"]);
const DIGIT_RIEUL = new Set(["1", "7", "8"]);
const ENG_BATCHIM = new Set(["L", "M", "N", "R"]);
const ENG_RIEUL = new Set(["L", "R"]);
function lastPhon(word) {
  const s = String(word), ch = s[s.length - 1], c = s.charCodeAt(s.length - 1);
  if (c >= 0xAC00 && c <= 0xD7A3) { const j = (c - 0xAC00) % 28; return { batchim: j !== 0, rieul: j === 8 }; }
  if (/[0-9]/.test(ch)) return { batchim: DIGIT_BATCHIM.has(ch), rieul: DIGIT_RIEUL.has(ch) };
  if (/[A-Za-z]/.test(ch)) { const U = ch.toUpperCase(); return { batchim: ENG_BATCHIM.has(U), rieul: ENG_RIEUL.has(U) }; }
  return { batchim: false, rieul: false };
}
// 조사 → 짝(받침형/비받침형)
const GROUP = { "이": "이/가", "가": "이/가", "을": "을/를", "를": "을/를", "은": "은/는", "는": "은/는", "과": "과/와", "와": "과/와", "으로": "으로/로", "로": "으로/로" };

// 검사에서 제외할(오탐) 문맥 목록: 조사가 아니라 단어의 일부인 경우.
export const JOSA_EXCEPTIONS = [
  { word: "있", josa: "는", reason: "'비어 있는' — 있다의 관형형('있+는'), 조사 아님" },
  { word: "나", josa: "이", reason: "'나이 = …' — 명사 '나이'의 일부, 조사 아님" },
  { word: "단", josa: "가", reason: "'수량 * 단가' — 명사 '단가'의 일부, 조사 아님" },
];

// 단어에 대해 기대되는 조사
function expected(word, josa) {
  const { batchim, rieul } = lastPhon(word);
  const [withB, without] = GROUP[josa].split("/");
  if (GROUP[josa] === "으로/로") return (rieul || !batchim) ? without : withB;
  return batchim ? withB : without;
}

// text 한 줄에서 위반 배열 반환. 각 위반: {word, josa, expect, ctx}
export function josaViolations(line) {
  const out = [];
  const re = /([가-힣A-Za-z0-9]+)(\[[^\]]*\])?("?)(으로|로|이|가|을|를|은|는|과|와)(?=[\s,.)\]"]|$)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const word = m[1], josa = m[4];
    const exp = expected(word, josa);
    if (exp === josa) continue;
    if (JOSA_EXCEPTIONS.some((e) => e.word === word && e.josa === josa)) continue;
    out.push({ word, josa, expect: exp, ctx: line.slice(Math.max(0, m.index - 4), m.index + m[0].length + 4) });
  }
  return out;
}
