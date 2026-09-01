// 이 폴더(src/data/lessons/)의 모든 *.json 파일을 자동으로 로드합니다.
// 새 차시를 추가하려면 lesson-2.json, lesson-3.json 형식으로 파일만 넣으면 됩니다.
const modules = import.meta.glob('./lessons/lesson-*.json', { eager: true });

export const LESSONS = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.id - b.id);
