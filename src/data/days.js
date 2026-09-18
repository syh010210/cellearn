// 일차(日次) 커리큘럼 구성 및 게이팅 로직.
// 하루치 진도(=일차)를 100% 끝내고, 마무리 시험(오답 재시험 + 누적 복습 엑셀 채점)을
// 통과해야 다음 일차가 열린다.
import { LESSONS } from "./lessons";

export const DAYS = [
  { day: 1, lessons: [1, 2, 3] },
  { day: 2, lessons: [4, 5, 6] },
  { day: 3, lessons: [7, 8] },
  { day: 4, lessons: [9, 10, 11] },
  { day: 5, lessons: [12, 13, 14, 15] },
  { day: 6, lessons: [16, 17, 18] },
  { day: 7, lessons: [19, 20] },
];

// 누적 복습 엑셀에 넣을 수 있는 차시 = 실습 생성기와 채점 정답이 모두 갖춰진 차시.
// (현재 1~4차시. 5차시 이후 실습 파일이 완비되면 여기에 추가하면 자동 반영된다.)
export const REVIEW_ENABLED = [1, 2, 3, 4];

export function getDay(lessonId) {
  return DAYS.find((d) => d.lessons.includes(lessonId)) || null;
}

// 일차의 모든 차시가 done(퀴즈 완료)인가 → 하루치 진도 100%
export function isDayComplete(day, progress) {
  const d = DAYS.find((x) => x.day === day);
  return d ? d.lessons.every((id) => progress[id]?.done) : false;
}

// 일차 마무리 시험까지 통과(클리어)했는가
export function isDayCleared(day, dayClears) {
  return !!dayClears?.[day];
}

// ── 날짜(KST) 기반 잠금 ──
// dayClears[day] 값: cleared_at ISO 문자열(신형) 또는 true(구형, 날짜 없음). 시간대는 KST 고정.
const KST_OFFSET = 9 * 60 * 60 * 1000;
export function kstDayStr(x) {
  const ms = typeof x === "number" ? x : Date.parse(x);
  if (Number.isNaN(ms)) return null;
  return new Date(ms + KST_OFFSET).toISOString().slice(0, 10); // KST 기준 "YYYY-MM-DD"
}
// 일차 잠금 상세: { locked, kind: "prev"(직전 미클리어) | "date"(당일 클리어, 내일 열림) | null, opensOn: "YYYY-MM-DD"|null }
export function dayGateInfo(day, dayClears, now = Date.now()) {
  const prev = day - 1;
  const v = dayClears?.[prev];
  if (!v) return { locked: true, kind: "prev", opensOn: null };
  if (prev === 0 || v === true) return { locked: false, kind: null, opensOn: null }; // OT 예외(당일 시작)·구형식(무제한)
  const cd = kstDayStr(v), td = kstDayStr(now);
  if (cd && td && cd < td) return { locked: false, kind: null, opensOn: null };       // 클리어 다음 날 이후 → 열림
  const opensOn = cd ? kstDayStr(Date.parse(cd + "T00:00:00+09:00") + 24 * 3600 * 1000) : null; // 클리어일 + 1일(KST)
  return { locked: true, kind: "date", opensOn };
}

// OT(학습 안내)를 끝까지 읽으면 day 0 클리어로 기록한다 → 1일차 잠금 해제 기준.
export function isOTDone(dayClears) {
  return !!dayClears?.[0];
}

// 일차가 열려 있는가: 직전 일차가 클리어되고, 그 클리어 다음 날(KST)이 되어야 열린다.
// 1일차는 직전이 day 0(=OT) → OT 통과 당일에 바로 열린다(예외). 구형식(true)은 날짜 제한 없이 열린다.
export function isDayUnlocked(day, dayClears, now = Date.now()) {
  return !dayGateInfo(day, dayClears, now).locked;
}

// 특정 차시에 접근 가능한가 (그 차시가 속한 일차가 열려 있으면)
export function isLessonUnlocked(lessonId, dayClears) {
  const d = getDay(lessonId);
  return d ? isDayUnlocked(d.day, dayClears) : true;
}

// 차시 순서 잠금: 일차가 열려 있고, 그 일차에서 앞 차시가 모두 완료(progress.done)여야 열린다.
// 일차의 첫 차시는 일차가 열리면 바로 열린다. 판정은 progress.done(DB)만 사용.
export function isLessonAccessible(lessonId, dayClears, progress = {}) {
  const d = getDay(lessonId);
  if (!d) return true;                                    // 커리큘럼 밖(방어) → 접근 허용
  if (!isDayUnlocked(d.day, dayClears)) return false;     // 일차 잠금이 우선
  const pos = d.lessons.indexOf(lessonId);
  if (pos <= 0) return true;                              // 일차 첫 차시(또는 목록 밖) → 일차 열리면 바로
  return d.lessons.slice(0, pos).every((id) => progress[id]?.done); // 앞 차시 전부 완료
}

// 잠금 사유 판별(화면 안내용): "day"=일차 잠김, "lesson"=일차는 열렸으나 앞 차시 미완료, null=열림
export function lessonLockReason(lessonId, dayClears, progress = {}) {
  const d = getDay(lessonId);
  if (!d) return null;
  if (!isDayUnlocked(d.day, dayClears)) return "day";
  return isLessonAccessible(lessonId, dayClears, progress) ? null : "lesson";
}

// 1차시 ~ 해당 일차 마지막 차시까지 누적 차시 id
export function cumulativeLessonIds(day) {
  const ids = [];
  for (const d of DAYS) if (d.day <= day) ids.push(...d.lessons);
  return ids;
}

// 누적 복습 엑셀 대상 차시(채점 가능한 것만)
export function reviewLessonIds(day) {
  return cumulativeLessonIds(day).filter((id) => REVIEW_ENABLED.includes(id));
}

// 누적 복습 엑셀 채점용 정답 목록(각 차시 practiceAnswers 이어붙임)
export function reviewAnswers(day) {
  return reviewLessonIds(day).flatMap(
    (id) => LESSONS.find((l) => l.id === id)?.practiceAnswers ?? []
  );
}

// 다음에 진행해야 할 일차(열려 있고 아직 클리어 안 된 첫 일차)
export function currentDay(dayClears) {
  for (const d of DAYS) if (!isDayCleared(d.day, dayClears)) return d.day;
  return DAYS[DAYS.length - 1].day;
}

// 전 일차 클리어 여부 — 실전 모드 잠금 해제 조건
export function allDaysCleared(dayClears) {
  return DAYS.every((d) => isDayCleared(d.day, dayClears));
}
