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

// OT(학습 안내)를 끝까지 읽으면 day 0 클리어로 기록한다 → 1일차 잠금 해제 기준.
export function isOTDone(dayClears) {
  return !!dayClears?.[0];
}

// 일차가 열려 있는가: 직전 일차가 클리어되어야 열림.
// 1일차는 직전이 day 0(=OT)이므로, OT를 확인해야 열린다.
export function isDayUnlocked(day, dayClears) {
  return !!dayClears?.[day - 1];
}

// 특정 차시에 접근 가능한가 (그 차시가 속한 일차가 열려 있으면)
export function isLessonUnlocked(lessonId, dayClears) {
  const d = getDay(lessonId);
  return d ? isDayUnlocked(d.day, dayClears) : true;
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
