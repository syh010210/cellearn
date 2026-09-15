// 실전 응시(phase=running) 중 앱 안에서 다른 화면으로 이동하려 할 때 종료 확인을 강제한다.
// 라우터가 없어 blocker 를 쓸 수 없으므로, ExamPanel 이 응시 중일 때 여기에 "종료 정리" 콜백을
// 등록(arm)하고, App 의 네비게이션 핸들러가 이동 직전에 isExamGuarded() 로 확인한다.
// 사용자가 [종료]를 누르면 endExamAttempt() 로 응시 로컬 스냅샷을 지운 뒤 이동한다.

let cleanup = null; // 종료 확정 시 실행할 정리(응시 스냅샷 삭제 등)

export function armExamGuard(fn) { cleanup = fn; }
export function disarmExamGuard() { cleanup = null; }
export function isExamGuarded() { return typeof cleanup === "function"; }
export function endExamAttempt() { try { cleanup?.(); } catch { /* 무시 */ } cleanup = null; }
