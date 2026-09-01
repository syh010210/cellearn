# 슬라이드 제작 규칙 (Claude Code 필독)

이 폴더는 수업자료 이미지를 **안 깨지게** 만드는 시스템이다.
핵심 원칙: **좌표를 사람이 계산하지 않는다. 브라우저 flexbox/grid에 크기 계산을 맡긴다.**
그러면 텍스트가 아무리 길어도 상자를 삐져나오지 않는다.

## 작업 방법
- 새 슬라이드는 `slides/이름.html` 파일 하나만 만든다 (본문 조각. `<html>`/`<style>` 불필요).
- `base.css`에 정의된 부품(클래스)만 조합한다.
- 렌더: `node render.js` → `out/이름.png` 생성.
- 검사: `node render.js --check` → 삐져나온 요소가 있으면 빨간 테두리로 표시됨.

## 절대 규칙 (어기면 깨진다)
1. ❌ `position: absolute` / `top` / `left` 좌표 지정 금지.
2. ❌ 박스에 고정 `height` 주고 형제끼리 높이 맞추기 금지 → 빈 카드 생김.
   - 높이는 내용이 정한다. 정렬이 필요하면 `align-items: flex-start` 사용.
3. ❌ 함수식에만 monospace 등 다른 폰트 쓰기 금지 → 폰트 섞임.
   - 함수식도 `.code` 클래스(같은 폰트 + 옅은 배경)로 표기한다.
4. ✅ 강조는 **폰트를 바꾸지 말고** `.b`(굵게) / `.u`(밑줄) / `.hl`(배경)로만.
5. ✅ 표는 반드시 `<table class="tbl">` 사용 (div로 표 흉내 금지). 셀 정렬이 자동으로 맞는다.
6. ✅ 모든 텍스트 박스는 `.box`(정중앙 정렬)를 기본으로 쓴다.

## 부품표 (base.css)
| 클래스 | 용도 |
|---|---|
| `.s-title` / `.s-subtitle` | 제목 / 부제 |
| `.s-body` | 본문 영역 |
| `.row` / `.col` | 가로 / 세로 배치 |
| `.grow` | 남는 공간 차지 (삐져나옴 방지 내장) |
| `.box` | 정중앙 정렬 박스 |
| `.card` | 여러 줄 카드 |
| `.box.blue/.green/.amber/.red` | 색상 변형 |
| `.tbl` (+ `tr.hit`, `.tag`) | 표 / 강조행 / 뱃지 |
| `.code` | 함수식 표기 |
| `.arrow-down` / `.arrow-right` | 화살표 |
| `.branch` | 트리 분기(라벨+화살표+박스 묶음) |
| `.bottom-bar` (+ `.note`) | 하단 요약 바 |
| `.steps` (+ `.item`, `.num`) | 번호 매긴 리스트 |
| 강조 | `.b` `.u` `.hl` |

## 슬라이드 표준 구조
```html
<div class="s-title">제목</div>
<div class="s-subtitle">부제(선택)</div>
<div class="s-body">
  <!-- 여기에 .row / .col / .box / .tbl / .code / .arrow-down 등을 조합 -->
</div>
<div class="bottom-bar">하단 요약 <span class="note">강조</span></div>
```

## 완성 전 체크리스트
- [ ] `node render.js --check` 에서 삐져나옴 0건인가?
- [ ] 텍스트를 일부러 길게 바꿔 렌더해도 안 깨지는가? (긴 제목/긴 셀로 테스트)
- [ ] 이미지 안에 폰트가 한 종류로만 보이는가?
- [ ] 형제 박스 높이를 억지로 맞춘 곳이 없는가? (빈 카드 없음)
