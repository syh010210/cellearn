// src/lib/serverTime.js
// 날짜 기반 일차 잠금을 기기 시계 변조로 우회하지 못하게, 서버 시각과의 차이(offset)를 한 번 받아 보정한다.
//  · 방식: Supabase RPC server_now()(= select now()) 로 서버 시각을 받는다.
//    (HTTP Date 헤더는 CORS 안전목록이 아니라 교차출처에서 못 읽는 경우가 많아 RPC 를 택했다.)
//  · 못 받으면 offset=0(기기 시계) 로 두고 콘솔에 남긴다 — 학습이 막히면 안 되므로.
//  · days.js 가 now 기본값으로 serverNow() 를 쓴다(시간대 변환은 KST 로 days.js 에서).
let offsetMs = 0;      // 서버시각 - 기기시각
let synced = false;

export function serverNow() { return Date.now() + offsetMs; }
export function isServerSynced() { return synced; }

export async function initServerTime(supabase) {
  if (!supabase) { console.warn("[serverTime] supabase 없음 — 기기 시계 사용"); return false; }
  try {
    const { data, error } = await supabase.rpc("server_now");
    if (error || !data) throw error || new Error("빈 응답");
    const serverMs = Date.parse(data);
    if (Number.isNaN(serverMs)) throw new Error(`파싱 실패: ${data}`);
    offsetMs = serverMs - Date.now();
    synced = true;
    return true;
  } catch (e) {
    offsetMs = 0; synced = false;
    console.warn("[serverTime] 서버 시각 동기화 실패 — 기기 시계 사용:", e?.message || e);
    return false;
  }
}
