// 사용자별 localStorage 스코프.
// 같은 브라우저에서 계정을 바꾸면 이전 계정의 학습 상태(개념 통과·튜토리얼·실전 응시)가 보이던 문제를 막는다.
// AuthContext 가 렌더 중 setUserScope(user.id) 로 현재 uid 를 갱신한다. 로그인 전(uid 없음)에는
// userKey 가 null 을 반환하고, 호출부는 그때 읽기/쓰기를 건너뛴다.

let currentUid = null;
export function setUserScope(uid) { currentUid = uid || null; }
export function currentUserScope() { return currentUid; }

// 로그인(uid) 있을 때만 사용자별 키를 만든다. 없으면 null.
export function userKey(name) { return currentUid ? `cellearn:${currentUid}:${name}` : null; }

// 구 형식(사용자 구분 없는) 학습 상태 키 — 앱 시작 시 1회 삭제. 마이그레이션 없이 버린다.
//  · lesson:{id}:flow  · tutorial:*  · exam:current / exam:attempt:* / exam:difficultyCursor / exam:tab
// cellearn:* 로 이미 스코프된 키(useLearningData·useExamAttempts·visitor 등)는 건드리지 않는다.
function isLegacyKey(k) {
  return (
    k === "exam:current" ||
    k.startsWith("exam:attempt:") ||
    k === "exam:difficultyCursor" ||
    k === "exam:tab" ||
    k.startsWith("tutorial:") ||
    /^lesson:\d+:flow$/.test(k) ||
    k === "cellearn_ot_checked"
  );
}
export function purgeLegacyLearningKeys() {
  if (typeof localStorage === "undefined") return;
  try {
    const kill = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isLegacyKey(k)) kill.push(k); }
    kill.forEach((k) => { try { localStorage.removeItem(k); } catch { /* 무시 */ } });
  } catch { /* 무시 */ }
}
