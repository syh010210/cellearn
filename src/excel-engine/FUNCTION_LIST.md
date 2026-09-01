# 구현된 함수 목록 (컴활 1급/2급 실기 기준)

## 논리
IF, IFS, IFERROR, IFNA, AND, OR, NOT, CHOOSE

## 찾기/참조
VLOOKUP, HLOOKUP, INDEX, MATCH

## 수학/통계
SUM, SUMIF, SUMIFS, AVERAGE, AVERAGEIF, AVERAGEIFS,
COUNT, COUNTA, COUNTIF, COUNTIFS,
ROUND, ROUNDUP, ROUNDDOWN, TRUNC, ABS, MOD,
MAX, MIN, LARGE, SMALL, RANK.EQ(RANK), SUMPRODUCT

## 텍스트
LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER,
CONCATENATE, TEXT, VALUE, REPLACE, SUBSTITUTE, FIND

## 날짜/시간
TODAY, NOW, YEAR, MONTH, DAY, DATE, DATEDIF, WEEKDAY

## 데이터베이스
DSUM, DAVERAGE, DCOUNT, DMAX, DMIN

## 정보
ISBLANK, ISERROR, ISNA, ISNUMBER, ISTEXT, ISLOGICAL

---

## 연산자
`+ - * / ^`(거듭제곱), `&`(문자열 연결),
비교연산 `= <> < <= > >=`, 단항 `-`, `%`(퍼센트, 예: `50%`)

## 에러 코드
`#DIV/0!`, `#VALUE!`, `#REF!`, `#NAME?`, `#N/A`, `#NUM!`, `#NULL!`, `#CIRCULAR!`

## 추가 필요 함수가 있다면
`functions/` 아래 알맞은 카테고리 파일에 함수를 추가하고 `functions/index.js`의
`FUNCTIONS`(또는 조건부 평가가 필요하면 `LAZY_FUNCTIONS`)에 등록한 뒤,
`test.mjs`에 검증 케이스를 추가해서 `node test.mjs`로 확인하세요.
