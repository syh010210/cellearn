# 다이어그램 가로 정렬 통일 작업

## 원인

`VlookupDiagram`(3-3)의 가로 배치는 `justifyContent: 'center'`가 있지만, 문제된 `VlookupLimitDiagram`처럼 각 슬라이드가 flex 행을 직접 쓰고 있어서 슬라이드마다 정렬이 다르다. 오른쪽 열에 `maxWidth`를 걸어두고 행에 가운데 정렬이 없으면 오른쪽에 빈 공간이 남는다. 슬라이드 20개 파일 전부 같은 식으로 쓰고 있으므로 개별 수정이 아니라 공통 컴포넌트로 묶는다.

---

## A. shared.jsx에 추가할 컴포넌트

```jsx
// 가로 배치는 반드시 이 컴포넌트로만 한다.
// 자식은 Fixed(표처럼 크기가 정해진 것) 또는 Fill(카드·설명처럼 남는 폭을 채우는 것)만 넣는다.
export function Row({ children, gap = 20, align = 'flex-start', style = {} }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap',
      justifyContent: 'center', alignItems: align,
      gap, width: '100%', ...style,
    }}>
      {children}
    </div>
  );
}

// 크기가 내용으로 정해지는 블록 (ExcelGrid, 이미지 등)
export function Fixed({ children, style = {} }) {
  return <div style={{ flex: '0 0 auto', ...style }}>{children}</div>;
}

// 남는 폭을 채우는 블록. max는 필요할 때만 쓰고, Row가 가운데 정렬하므로 여백은 좌우 동일하게 남는다.
export function Fill({ children, min = 320, max, gap = 14, style = {} }) {
  return (
    <div style={{
      flex: `1 1 ${min}px`, minWidth: 0, maxWidth: max,
      display: 'flex', flexDirection: 'column', gap,
      ...style,
    }}>
      {children}
    </div>
  );
}
```

---

## B. CLAUDE.md 수정

### B-1. 삭제할 부분

- `## SVG 슬라이드 생성 규칙` 섹션 전체. 지금은 `public/images/*.svg`를 쓰지 않고 registry가 그 경로를 React 컴포넌트로 연결한다. 이 섹션이 남아 있으면 Claude Code가 좌표 계산 규칙을 React 슬라이드에 적용하려 든다.
- `## 지금 당장 할 작업` 섹션. App.jsx 분리는 끝난 작업이다.
- 기술 스택의 `Tailwind CSS (유틸리티 클래스만 사용)` 줄. 개발 규칙에서 Tailwind 혼용을 금지하고 있어 서로 충돌한다.

### B-2. 추가할 섹션 (SVG 규칙 자리에)

```markdown
## 다이어그램(슬라이드) 컴포넌트 규칙

모든 학습 다이어그램은 `src/components/diagrams/LessonN.jsx`의 React 컴포넌트이며
`registry.js`에 경로 → 컴포넌트로 등록한다. `public/images/*.svg`는 만들지 않는다.

### 구조
- 최상위는 항상 `<Wrap>`. 그 안에 `Title` → (`Subtitle`) → (`ProblemBox`) → 본문 → (`BottomBar`) 순서.
- 본문의 세로 배치는 Wrap 안에 그대로 나열한다. 블록 사이 간격은 `marginTop: 16` 하나로 통일.
- 가로 배치는 `Row`만 사용한다. `display: 'flex'` 행을 슬라이드 안에서 직접 만들지 않는다.
- `Row`의 자식은 `Fixed` 또는 `Fill`만 넣는다.
  - 표(ExcelGrid), 이미지, 크기가 고정된 박스 → `Fixed`
  - 카드, 설명, 버튼 묶음, 칠판 → `Fill`
- 슬라이드 안에서 `justifyContent`, `margin: '0 auto'`, `maxWidth`, `width: N`으로 위치를 잡지 않는다.
  폭 제한이 필요하면 `Fill`의 `max` prop만 쓴다.
- 가로 한 줄에 카드 여러 개를 나열할 때도 `Row` 안에 `Fill`을 여러 개 넣는다.

### 확인
- 브라우저 폭 1400px 이상에서 `Row`의 좌우 여백이 같아야 한다.
- 폭 900px에서 `Row`가 세로로 접히고 겹치는 요소가 없어야 한다.
- 새 슬라이드를 만들면 `registry.js`에 등록하고, 해당 lesson JSON의 contentBlocks에서 참조한다.

### 텍스트
- 모든 텍스트는 `FONT`, 색상은 `C` 객체만 사용. 슬라이드 안에 hex 값을 직접 쓰지 않는다.
- 본문 최소 15px, 보조 설명 14px 이상.
```

---

## C. Claude Code 실행 지시문

```
1. src/components/diagrams/shared.jsx에 Row, Fixed, Fill 컴포넌트를 추가해라. (코드는 DIAGRAM_LAYOUT_UPDATE.md A절)

2. CLAUDE.md를 DIAGRAM_LAYOUT_UPDATE.md B절대로 수정해라.

3. src/components/diagrams/Lesson1.jsx ~ Lesson20.jsx, RelativeFillAnim.jsx의 모든 컴포넌트에서
   - display: 'flex'로 가로 배치한 div를 Row로 바꿔라.
   - 그 자식 중 ExcelGrid·이미지·고정 크기 박스를 감싼 div는 Fixed로,
     flex: '1 1 ...'이 걸린 div는 Fill로 바꿔라. 기존 minWidth는 Fill의 min으로, maxWidth는 max로 옮겨라.
   - 슬라이드 안의 justifyContent, margin: '0 auto', width 고정값은 제거해라.
   - 세로 스택 안의 단일 박스(수식 박스, 결과 박스)에 maxWidth + margin auto가 있으면
     Row 안에 Fill max로 바꿔라.
   - 텍스트, 색상, 폰트 크기, 표 데이터, 상태 로직(useState/useEffect)은 바꾸지 마라.

4. 작업 후 다음 표를 출력해라.
   | 파일 | 컴포넌트 | 바꾼 내용 | 판단이 애매했던 곳 |
   애매했던 곳은 비워두지 말고 무엇을 어떻게 결정했는지 적어라.

5. npm run dev를 띄우고 /images/lookup-vlookup-limit.svg 슬라이드(4차시)가
   폭 1400px에서 좌우 여백이 같은지 확인해라.
```

---

## D. 이번 슬라이드(VlookupLimitDiagram) 적용 예

```jsx
<Wrap>
  <Title>VLOOKUP은 못 찾고, INDEX+MATCH는 찾는다</Title>
  <Subtitle>찾을 값(사번)이 표의 첫 열이 아니고, 가져올 값(부서)이 그 왼쪽에 있는 경우</Subtitle>
  <ProblemBox no={6}>…</ProblemBox>

  <Row style={{ marginTop: 16 }}>
    <Fixed>
      <TableCaption color={C.blueLight}>[표6] 사원 정보</TableCaption>
      <ExcelGrid … />
    </Fixed>
    <Fill min={480}>
      <Card border={C.red} …>VLOOKUP 못 찾음</Card>
      <Card border={C.green} …>INDEX+MATCH 찾음</Card>
    </Fill>
  </Row>
</Wrap>
```
