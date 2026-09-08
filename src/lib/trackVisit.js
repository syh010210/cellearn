import { supabase } from "./supabase";

// 방문자 접속 현황 기록.
// - 로그인 여부와 무관하게 방문자를 센다(익명 visitor_id 기준).
// - 하루 한 번만 기록(visitor_id + visit_date 유니크, ignoreDuplicates).
// - first touch(첫 유입 정보)는 최초 방문 때 localStorage 에 저장해 이후 재사용.
// - 관리자 계정과 Supabase 미설정 시에는 기록하지 않는다. 실패해도 앱에 영향 없음.

const LS_VISITOR = "cellearn:visitor_id";
const LS_FIRST = "cellearn:first_touch";

// KST(Asia/Seoul) 기준 yyyy-mm-dd 문자열 (en-CA 로케일이 ISO 형식으로 준다)
export function kstDateStr(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(LS_VISITOR);
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(LS_VISITOR, id);
    }
    return id;
  } catch { return null; }
}

// UA 를 라이브러리 없이 간단한 정규식으로 분류.
function parseUA(ua = "") {
  // 기기: 태블릿(iPad / Android without "Mobile") → tablet, 그 외 모바일 토큰 → mobile, 기본 desktop
  let device = "desktop";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) device = "tablet";
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile/i.test(ua)) device = "mobile";

  let os = "기타";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "Mac";

  // 브라우저: SamsungBrowser 는 UA 에 Chrome/Safari 토큰도 포함하므로 먼저 검사.
  let browser = "기타";
  if (/SamsungBrowser/i.test(ua)) browser = "Samsung";
  else if (/Chrome|CriOS|Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";

  return { device, os, browser };
}

// referrer 호스트 → 유입 source 로 정규화 (utm 이 없을 때 사용)
function sourceFromReferrer(host) {
  if (!host) return "direct";
  if (/(^|\.)google\./i.test(host)) return "google";
  if (/(^|\.)naver\./i.test(host)) return "naver";
  if (/(^|\.)(instagram|facebook|fb)\./i.test(host)) return "instagram";
  return "기타";
}

// 첫 방문 정보(first touch): 없으면 현재 URL/referrer 로 만들어 저장, 있으면 그대로 재사용.
function getFirstTouch() {
  try {
    const saved = localStorage.getItem(LS_FIRST);
    if (saved) return JSON.parse(saved);
  } catch { /* 파싱 실패 시 새로 계산 */ }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");
  const fbclid = params.get("fbclid");

  // referrer 도메인(호스트). 없으면 'direct'
  let referrer = "direct";
  try { if (document.referrer) referrer = new URL(document.referrer).host || "direct"; } catch { /* 무시 */ }

  let source = utmSource || null;
  let medium = utmMedium || null;
  // utm 이 없고 fbclid 만 있으면 인스타그램 유료 유입으로 본다
  if (!source && !medium && fbclid) { source = "instagram"; medium = "paid"; }
  // 그래도 source 가 없으면 referrer 도메인에서 유추(direct/google/naver/기타)
  if (!source) source = sourceFromReferrer(referrer === "direct" ? null : referrer);

  const ft = {
    source,
    medium: medium || null,
    campaign: utmCampaign || null,
    content: utmContent || null,
    referrer,
    landing_path: window.location.pathname || "/",
  };
  try { localStorage.setItem(LS_FIRST, JSON.stringify(ft)); } catch { /* 무시 */ }
  return ft;
}

// 앱 로드 시 하루 한 번 호출. 관리자·미설정·에러는 조용히 스킵.
export async function trackVisit({ userId = null, isAdmin = false } = {}) {
  try {
    if (!supabase || isAdmin) return;
    const visitorId = getVisitorId();
    if (!visitorId) return;
    const ft = getFirstTouch();
    const { device, os, browser } = parseUA(typeof navigator !== "undefined" ? navigator.userAgent : "");
    const row = {
      visitor_id: visitorId,
      user_id: userId || null,
      visit_date: kstDateStr(),
      device, os, browser,
      source: ft.source, medium: ft.medium, campaign: ft.campaign, content: ft.content,
      referrer: ft.referrer, landing_path: ft.landing_path,
    };
    await supabase.from("visits").upsert(row, { onConflict: "visitor_id,visit_date", ignoreDuplicates: true });
  } catch { /* 접속 기록 실패는 앱에 영향 주지 않는다 */ }
}
