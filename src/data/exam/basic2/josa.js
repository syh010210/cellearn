// 한글 조사 자동 선택 (조립기 지시문용). basic2Grader.js 의 규칙과 동일한 받침 판정.
export function hasBatchim(word) {
  const s = String(word ?? "");
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i];
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
    if (/[0-9]/.test(ch)) return [0, 1, 3, 6, 7, 8].includes(Number(ch));
    if (/[A-Za-z]/.test(ch)) return !"aeiouyAEIOUY".includes(ch);
  }
  return false;
}
// pair 예: "을/를", "이/가", "은/는", "으로/로"
export function josa(word, pair) { const [withB, without] = pair.split("/"); return hasBatchim(word) ? withB : without; }

// "…으로/로 지정하시오"의 조사: 받침 없음 또는 ㄹ 받침 → "로", 그 외 → "으로".
export function euroRo(word) {
  const s = String(word ?? "");
  for (let i = s.length - 1; i >= 0; i--) {
    const ch = s[i]; const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) { const j = (code - 0xac00) % 28; return (j === 0 || j === 8) ? "로" : "으로"; }
    if (/[0-9]/.test(ch)) return [0, 1, 3, 6, 7, 8].includes(Number(ch)) ? "으로" : "로";
    if (/[A-Za-z]/.test(ch)) return "aeiouyAEIOUY".includes(ch) ? "로" : "으로";
  }
  return "로";
}
