# LESSON5_COMPARE

## 1. lesson-4.json 전문

```json
{
  "id": 4,
  "title": "찾기 및 참조 함수 (VLOOKUP, INDEX · MATCH)",
  "shortTitle": "찾기/참조 함수",
  "concepts": [
    {
      "heading": "1. 방향에 따른 데이터 검색 (VLOOKUP, HLOOKUP)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "찾는 값을 참조 범위의 첫 열 또는 행에서 찾아, 지정한 위치의 값을 가져오는 함수입니다."
        },
        {
          "type": "image",
          "url": "/diagram/lookup-common",
          "alt": "VLOOKUP과 HLOOKUP의 공통 원리와 네 개의 인수(찾을 값·참조 범위·열/행 번호·마지막 인수) 설명"
        },
        {
          "type": "heading",
          "text": "① 참조 범위가 따로 있는 형태 (시험에 가장 많이 나오는 형태)"
        },
        {
          "type": "text",
          "text": "찾는 값이 있는 표와, 값을 찾아올 **참조 범위**가 따로 있습니다. 아래 두 개의 표를 확인해 보세요."
        },
        {
          "type": "image",
          "url": "/images/lookup-vlookup.svg",
          "alt": "사원 실적표와 세로 등급표를 이용해 사원코드의 등급을 VLOOKUP으로 찾아 성과급률을 채우는 예시"
        },
        {
          "type": "image",
          "url": "/diagram/lookup-hlookup-2table",
          "alt": "상품 판매현황 표와 가로 상품 단가표를 이용해 상품코드를 HLOOKUP으로 찾아 판매단가를 구하고 판매금액을 계산하는 예시"
        },
        {
          "type": "text",
          "text": "위 두 예시는 수식을 자동 채우기로 여러 셀에 복사하기 때문에, 참조 범위가 밀리지 않도록 $로 고정했습니다."
        },
        {
          "type": "heading",
          "text": "② 하나의 표 안에서 찾는 형태"
        },
        {
          "type": "image",
          "url": "/diagram/lookup-vlookup-1table",
          "alt": "상품 만족도 표 한 표 안에서 만족도가 가장 낮은 상품의 카테고리를 VLOOKUP과 MIN으로 찾는 예시"
        },
        {
          "type": "text",
          "text": "한 셀에만 수식을 입력하는 경우라 참조 범위를 $로 고정할 필요가 없습니다."
        },
        {
          "type": "heading",
          "text": "꼭 기억할 핵심 두 가지"
        },
        {
          "type": "numbered",
          "items": [
            "찾을 값이 **반드시 참조 범위의 첫 행 또는 첫 열**에 오도록 참조 범위를 잡습니다.",
            "찾을 값이 참조 범위의 첫 행이나 열에 순서와 상관없이 전부 들어 있으면 **FALSE(정확히 일치)**를 씁니다. **TRUE(유사 일치)**는 개념학습2로 넘어가서 직접 확인해 봅시다."
          ]
        }
      ],
      "practice": {
        "instruction": "[표1]에서 각 사원의 등급[C2:C3]과 [A6:C8] 영역의 [등급표]를 이용하여 상여금[D2:D3]을 구하시오. (VLOOKUP 함수 사용 · D2에 입력한 뒤 D3로 자동 채우기)",
        "requiredFunctions": ["VLOOKUP"],
        "cols": ["A", "B", "C", "D"],
        "rows": [
          [
            { "val": "사원명", "editable": false },
            { "val": "부서", "editable": false },
            { "val": "등급", "editable": false },
            { "val": "상여금", "editable": false }
          ],
          [
            { "val": "김유신", "editable": false },
            { "val": "영업1팀", "editable": false },
            { "val": "A", "editable": false },
            { "val": "", "editable": true, "answer": "=VLOOKUP(C2,$A$6:$C$8,3,0)", "result": 500000 }
          ],
          [
            { "val": "이순신", "editable": false },
            { "val": "관리팀", "editable": false },
            { "val": "C", "editable": false },
            { "val": "", "editable": true, "answer": "=VLOOKUP(C3,$A$6:$C$8,3,0)", "result": 200000, "fillFrom": "D2" }
          ],
          [
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "등급", "editable": false },
            { "val": "직무", "editable": false },
            { "val": "상여금", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "A", "editable": false },
            { "val": "영업", "editable": false },
            { "val": 500000, "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "B", "editable": false },
            { "val": "관리", "editable": false },
            { "val": 350000, "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "C", "editable": false },
            { "val": "지원", "editable": false },
            { "val": 200000, "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "2. 유사 일치 — 구간이나 범위로 값 찾기",
      "contentBlocks": [
        {
          "type": "text",
          "text": "찾을 값이 참조 범위의 첫 행이나 열에 순서와 상관없이 **전부 들어 있으면 FALSE(정확히 일치)**를 씁니다. 반대로 점수나 평균처럼 찾을 값이 참조 범위의 첫 행이나 열에 없고 특정 **구간이나 범위**에 속하는지 볼 때는 **TRUE(유사 일치)**를 씁니다."
        },
        {
          "type": "image",
          "url": "/diagram/lookup-vlookup-approx",
          "alt": "학생 성적표와 가로 기준표를 이용해 총점이 속한 구간의 등급을 HLOOKUP 유사 일치로 찾는 예시"
        }
      ],
      "practice": {
        "instruction": "[표1]에서 총점[B2:B3]과 [A5:F6] 영역의 가로 기준표를 이용하여 각 학생의 등급[C2:C3]을 구하시오. (HLOOKUP 유사 일치 · C2 입력 후 C3로 자동 채우기)",
        "cols": ["A", "B", "C", "D", "E", "F"],
        "rows": [
          [
            { "val": "이름", "editable": false },
            { "val": "총점", "editable": false },
            { "val": "등급", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "정지호", "editable": false },
            { "val": 88, "editable": false },
            { "val": "", "editable": true, "answer": "=HLOOKUP(B2,$B$5:$F$6,2,TRUE)", "result": "우" },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "방정수", "editable": false },
            { "val": 73, "editable": false },
            { "val": "", "editable": true, "answer": "=HLOOKUP(B3,$B$5:$F$6,2,TRUE)", "result": "미" },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "기준점수", "editable": false },
            { "val": 0, "editable": false },
            { "val": 60, "editable": false },
            { "val": 70, "editable": false },
            { "val": 80, "editable": false },
            { "val": 90, "editable": false }
          ],
          [
            { "val": "등급", "editable": false },
            { "val": "가", "editable": false },
            { "val": "양", "editable": false },
            { "val": "미", "editable": false },
            { "val": "우", "editable": false },
            { "val": "수", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "3. 데이터 추출과 위치 찾기 (INDEX, MATCH)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "지정한 행 · 열 번호의 값을 추출하거나 특정 데이터의 위치를 파악하는 함수입니다."
        },
        {
          "type": "image",
          "url": "/images/lookup-matchindex.svg",
          "alt": "MATCH로 위치 번호를 찾고 INDEX로 해당 위치의 값을 추출"
        }
      ],
      "practice": {
        "instruction": "사원 명단입니다. [C3] 셀에 MATCH 함수를 사용하여 '이영희' 사원이 이름 목록 [B2:B4]에서 몇 번째 위치에 있는지 구하세요.",
        "cols": ["A", "B", "C"],
        "rows": [
          [
            { "val": "사원번호", "editable": false },
            { "val": "이름", "editable": false },
            { "val": "결과항목", "editable": false }
          ],
          [
            { "val": "E001", "editable": false },
            { "val": "홍길동", "editable": false },
            { "val": "이영희의 위치", "editable": false }
          ],
          [
            { "val": "E002", "editable": false },
            { "val": "김철수", "editable": false },
            { "val": "", "editable": true, "answer": "=MATCH(\"이영희\",B2:B4,0)", "result": 3 }
          ],
          [
            { "val": "E003", "editable": false },
            { "val": "이영희", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "4. 실제 시험에서 INDEX + MATCH 조합은 이렇게 나온다",
      "contentBlocks": [
        {
          "type": "image",
          "url": "/images/lookup-indexmatch.svg",
          "alt": "매출액이 가장 높은 상품명을 INDEX·MATCH·MAX 조합으로 찾는 실제 출제 형식"
        },
        {
          "type": "heading",
          "text": "VLOOKUP과 HLOOKUP vs INDEX+MATCH 비교"
        },
        {
          "type": "bullets",
          "items": [
            "**VLOOKUP · HLOOKUP**: 찾을 값이 반드시 참조 범위의 **첫 번째 행이나 열**에 있어야 해서 아래 방향이나 오른쪽 방향으로만 찾을 수 있습니다. 찾을 값이 첫 행 · 열에 있지 않으면, 찾고자 하는 행이나 열이 참조 범위 안에 없어 찾지 못할 수 있습니다.",
            "**INDEX+MATCH**: 참조 범위를 **표 전체**로 넣고 행이나 열을 **양방향**으로 검색하기 때문에 어느 위치의 값이든 찾을 수 있습니다."
          ]
        },
        {
          "type": "image",
          "url": "/images/lookup-vlookup-limit.svg",
          "alt": "사번으로 왼쪽의 부서를 찾을 때 VLOOKUP은 못 찾고 INDEX+MATCH는 찾는 비교 예제"
        }
      ],
      "practice": {
        "instruction": "상품 판매 현황 표입니다. 매출액[D2:D5]이 가장 높은 상품의 상품명[A2:A5]을 찾아 [B7] 셀에 표시하세요. (INDEX, MATCH, MAX 함수 사용)",
        "cols": ["A", "B", "C", "D"],
        "rows": [
          [
            { "val": "상품명", "editable": false },
            { "val": "분류", "editable": false },
            { "val": "판매량", "editable": false },
            { "val": "매출액", "editable": false }
          ],
          [
            { "val": "노트북", "editable": false },
            { "val": "전자", "editable": false },
            { "val": 120, "editable": false },
            { "val": 3600, "editable": false }
          ],
          [
            { "val": "에어컨", "editable": false },
            { "val": "가전", "editable": false },
            { "val": 60, "editable": false },
            { "val": 4800, "editable": false }
          ],
          [
            { "val": "모니터", "editable": false },
            { "val": "전자", "editable": false },
            { "val": 140, "editable": false },
            { "val": 2100, "editable": false }
          ],
          [
            { "val": "냉장고", "editable": false },
            { "val": "가전", "editable": false },
            { "val": 45, "editable": false },
            { "val": 4050, "editable": false }
          ],
          [
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "매출액 최고 상품명", "editable": false },
            { "val": "", "editable": true, "answer": "=INDEX(A2:A5,MATCH(MAX(D2:D5),D2:D5,0))", "result": "에어컨" },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "5. 인덱스 번호로 값 선택하기 (CHOOSE)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "**구문**: =CHOOSE(숫자, 값1, 값2, 값3, ...)"
        },
        {
          "type": "bullets",
          "items": [
            "첫 번째 인수의 숫자가 1이면 값1을, 2면 값2를 반환합니다. 앞의 숫자로 뒤에 나열한 값 중 하나를 고르는 함수입니다.",
            "숫자는 1부터 시작합니다. 예를 들어, 숫자 자리에 1~4가 들어갈 수 있는데 값을 값1~값3까지만 적어두면 4에 해당하는 값이 없어 **#VALUE!** 오류가 납니다.",
            "**CHOOSE** 함수는 **RANK.EQ**나 **WEEKDAY**와 같은 함수와 자주 조합되어 시험에 출제됩니다."
          ]
        },
        {
          "type": "image",
          "url": "/diagram/lookup-choose-rank",
          "alt": "성적 순위를 RANK.EQ로 구하고 CHOOSE로 순위별 비고(최우수·우수·보통·노력)를 부여하는 실제 출제 형식"
        }
      ],
      "practice": {
        "instruction": "회원 관리 표입니다. 회원코드[B2:B4]의 마지막 한 자리를 기준으로 1이면 \"실버\", 2면 \"골드\", 3이면 \"VIP\"로 등급[C2:C4]에 표시하세요. (RIGHT, CHOOSE 함수 사용 · C2에 입력한 뒤 C4까지 자동 채우기)",
        "cols": ["A", "B", "C"],
        "rows": [
          [
            { "val": "회원명", "editable": false },
            { "val": "회원코드", "editable": false },
            { "val": "등급", "editable": false }
          ],
          [
            { "val": "김민준", "editable": false },
            { "val": "M2", "editable": false },
            { "val": "", "editable": true, "answer": "=CHOOSE(RIGHT(B2,1),\"실버\",\"골드\",\"VIP\")", "result": "골드" }
          ],
          [
            { "val": "이서연", "editable": false },
            { "val": "M1", "editable": false },
            { "val": "", "editable": true, "answer": "=CHOOSE(RIGHT(B3,1),\"실버\",\"골드\",\"VIP\")", "result": "실버" }
          ],
          [
            { "val": "박도윤", "editable": false },
            { "val": "M3", "editable": false },
            { "val": "", "editable": true, "answer": "=CHOOSE(RIGHT(B4,1),\"실버\",\"골드\",\"VIP\")", "result": "VIP" }
          ]
        ]
      }
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "VLOOKUP 함수와 비교했을 때 INDEX와 MATCH 함수를 조합하여 사용할 때의 가장 큰 장점은 무엇인가?",
      "options": [
        "수식의 길이가 짧아져 연산 속도가 무조건 빨라진다.",
        "기준이 되는 찾을값이 데이터 표의 첫 번째 열에 없어도, 왼쪽이나 오른쪽 어느 방향이든 자유롭게 데이터를 추출할 수 있다.",
        "오름차순 정렬이 되어 있지 않으면 절대로 값을 찾을 수 없는 제약이 사라진다.",
        "텍스트 데이터는 찾을 수 없고 오직 숫자 데이터만 찾을 수 있게 제약한다."
      ],
      "answer": 1,
      "explanation": "VLOOKUP은 찾고자 하는 기준 열의 반드시 '오른쪽' 데이터만 가져올 수 있는 반면, INDEX와 MATCH를 조합하면 찾을값의 왼쪽에 위치한 데이터 열도 제약 없이 조회할 수 있습니다."
    },
    {
      "id": 2,
      "question": "다음 중 CHOOSE 함수 수식 '=CHOOSE(3, \"사과\", \"배\", \"포도\", \"수박\")'의 실행 결과로 올바른 것은?",
      "options": [
        "사과",
        "배",
        "포도",
        "수박"
      ],
      "answer": 2,
      "explanation": "CHOOSE 함수의 첫 번째 인수가 '3'이므로 뒤에 나열된 값 중 3번째 항목인 '포도'를 선택하여 반환합니다. (숫자는 0이 아닌 1부터 시작합니다.)"
    },
    {
      "id": 3,
      "question": "VLOOKUP 함수에서 네 번째 인수(range_lookup)를 0으로 지정할 때의 의미는?",
      "options": [
        "찾을값보다 작거나 유사한 값을 찾는다.",
        "범위를 자동으로 오름차순 정렬한 후 검색한다.",
        "찾을값과 정확히 일치하는 값을 찾는다.",
        "범위 전체를 검색하지 않고 첫 번째 값만 확인한다."
      ],
      "answer": 2,
      "explanation": "VLOOKUP의 네 번째 인수가 0 또는 FALSE이면 정확히 일치하는 값만 찾습니다. 1 또는 생략하면 유사하게 일치하는 값을 찾으며 이때는 데이터가 반드시 오름차순으로 정렬되어 있어야 합니다."
    },
    {
      "id": 4,
      "question": "MATCH 함수가 반환하는 값은 무엇인가?",
      "options": [
        "찾을 값 자체 (예: '이영희')",
        "찾을 값이 있는 셀의 주소 (예: 'B4')",
        "범위 내에서 찾을 값의 위치 번호",
        "찾을 값의 개수"
      ],
      "answer": 2,
      "explanation": "MATCH 함수는 찾을값 자체나 셀 주소가 아닌, 지정한 범위에서 찾을값이 몇 번째에 있는지를 나타내는 위치 번호를 반환합니다. 이 위치 번호를 INDEX 함수의 행 번호로 활용합니다."
    },
    {
      "id": 5,
      "question": "다음 표가 [A1:C2] 영역에 있다. (1행: 사과, 배, 포도 / 2행: 감, 귤, 딸기) 수식 '=INDEX(A1:C2, 2, 3)'의 결과는?",
      "options": [
        "포도",
        "감",
        "귤",
        "딸기"
      ],
      "answer": 3,
      "explanation": "INDEX(범위, 행 번호, 열 번호)는 지정한 범위에서 행 번호와 열 번호가 만나는 칸의 값을 반환합니다. A1:C2 범위에서 2번째 행, 3번째 열이 만나는 칸은 C2(딸기)입니다."
    },
    {
      "id": 6,
      "question": "VLOOKUP 함수를 사용할 때 반드시 지켜야 하는 조건은?",
      "options": [
        "찾을값이 지정한 범위의 마지막 열에 있어야 한다.",
        "찾을값이 지정한 범위의 첫 번째 열에 있어야 한다.",
        "범위가 반드시 내림차순으로 정렬되어 있어야 한다.",
        "열번호는 항상 1이어야 한다."
      ],
      "answer": 1,
      "explanation": "VLOOKUP은 지정한 범위의 '첫 번째 열'에서 찾을값을 검색합니다. 찾을값이 첫 번째 열에 없으면 올바른 결과를 반환할 수 없습니다. 이것이 INDEX+MATCH 조합으로 대체하는 주된 이유입니다."
    },
    {
      "id": 7,
      "question": "HLOOKUP과 VLOOKUP의 차이점으로 올바른 것은?",
      "options": [
        "HLOOKUP은 범위의 첫 번째 열에서, VLOOKUP은 범위의 첫 번째 행에서 찾을값을 검색한다.",
        "HLOOKUP은 범위의 첫 번째 행에서 검색하고, VLOOKUP은 범위의 첫 번째 열에서 검색한다.",
        "HLOOKUP과 VLOOKUP은 기능이 완전히 동일하고 이름만 다르다.",
        "HLOOKUP은 숫자만, VLOOKUP은 텍스트만 검색할 수 있다."
      ],
      "answer": 1,
      "explanation": "VLOOKUP은 V(Vertical, 세로) 방향으로 표의 첫 번째 '열'에서 검색하고, HLOOKUP은 H(Horizontal, 가로) 방향으로 표의 첫 번째 '행'에서 검색합니다. 세로로 긴 표에는 VLOOKUP, 가로로 넓은 표에는 HLOOKUP을 사용합니다."
    },
    {
      "id": 8,
      "question": "다음 중 CHOOSE 함수에 대한 설명으로 올바른 것은?",
      "options": [
        "지정된 범위에서 조건에 맞는 값의 개수를 센다.",
        "첫 번째 인수인 숫자에 따라 나열된 값 목록에서 해당 순서의 값을 선택하여 반환한다.",
        "범위에서 가장 큰 값을 찾아 반환한다.",
        "텍스트 문자열에서 특정 위치의 문자를 추출한다."
      ],
      "answer": 1,
      "explanation": "CHOOSE 함수는 =CHOOSE(숫자, 값1, 값2, ...)의 형태로 사용하며, 첫 번째 인수의 숫자에 해당하는 위치의 값을 반환합니다. RANK.EQ나 WEEKDAY와 조합하여 순위나 요일에 따른 텍스트를 출력할 때 자주 사용됩니다."
    },
    {
      "id": 9,
      "question": "수식 '=INDEX(A2:D10, MATCH(\"홍길동\", A2:A10, 0), 3)'에서 MATCH 함수의 세 번째 인수 '0'의 역할로 올바른 것은?",
      "options": [
        "찾을 범위를 오름차순으로 자동 정렬한 뒤 검색한다.",
        "찾을값과 정확히 일치하는 데이터의 위치만 찾는다.",
        "찾을값보다 작거나 같은 가장 큰 값의 위치를 찾는다.",
        "검색 결과가 0인 경우에만 위치를 반환한다."
      ],
      "answer": 1,
      "explanation": "MATCH 함수의 세 번째 인수가 0이면 정확히 일치하는 값만 검색하여 위치를 반환합니다. 1이면 오름차순 정렬 기준 이하 값, -1이면 내림차순 정렬 기준 이상 값을 찾습니다. 실기 시험에서는 정확히 일치 검색을 위해 거의 항상 0을 사용합니다."
    },
    {
      "id": 10,
      "question": "수식 '=VLOOKUP(\"홍길동\", A1:D10, 3, 0)'에서 세 번째 인수 '3'이 의미하는 것은?",
      "options": [
        "A1:D10 범위의 세 번째 행에 있는 데이터를 반환한다.",
        "A1:D10 범위에서 왼쪽부터 세 번째 열(C열)의 데이터를 반환한다.",
        "홍길동과 일치하는 값 중 세 번째로 발견된 값을 반환한다.",
        "소수점 세 자리까지 반올림하여 반환한다."
      ],
      "answer": 1,
      "explanation": "VLOOKUP의 세 번째 인수(열번호)는 지정한 범위에서 왼쪽부터 몇 번째 열의 값을 가져올지 지정합니다. '3'이면 범위의 세 번째 열(C열)의 데이터를 반환합니다. 범위가 A~D이면 1=A열, 2=B열, 3=C열, 4=D열입니다."
    }
  ],
  "practiceAnswers": [
    { "sheet": "방향검색", "cell": "C2", "formula": "=VLOOKUP(\"B-102\",A2:B4,2,0)" },
    { "sheet": "위치찾기", "cell": "C3", "formula": "=MATCH(\"이영희\",B2:B4,0)" },
    { "sheet": "조합활용", "cell": "B7", "formula": "=INDEX(A2:A5,MATCH(MAX(D2:D5),D2:D5,0))" },
    { "sheet": "값선택", "cell": "C2", "formula": "=CHOOSE(RIGHT(B2,1),\"실버\",\"골드\",\"VIP\")" },
    { "sheet": "값선택", "cell": "C3", "formula": "=CHOOSE(RIGHT(B3,1),\"실버\",\"골드\",\"VIP\")" },
    { "sheet": "값선택", "cell": "C4", "formula": "=CHOOSE(RIGHT(B4,1),\"실버\",\"골드\",\"VIP\")" }
  ]
}

```

## 2. lesson-5.json 전문

```json
{
  "id": 5,
  "title": "데이터베이스 함수의 공통 공식과 조건 설정 마스터",
  "shortTitle": "데이터베이스 함수",
  "concepts": [
    {
      "heading": "1. 데이터베이스 함수의 공통 공식과 단일 조건 합계 (DSUM)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "엑셀의 모든 데이터베이스 함수(D로 시작하는 함수)는 인수의 위치와 사용 형식이 완전히 동일합니다."
        },
        {
          "type": "image",
          "url": "/images/db-dsum.svg",
          "alt": "데이터베이스 함수 공통 3인수 형식과 DSUM 단일 조건 합계 예시"
        },
        {
          "type": "heading",
          "text": "데이터베이스 함수 공통 형식 — 3가지 인수"
        },
        {
          "type": "bullets",
          "items": [
            "**공통 형식**: =DFUNCTION(**① 전체 표 범위**, **② 계산할 열 제목**, **③ 조건 범위**)",
            "**① 전체 표 범위**: 반드시 맨 위의 열 제목(필드명)을 포함하여 전체 데이터를 드래그해야 합니다. 예) A1:D4",
            "**② 계산할 열 제목**: 합계나 평균 등을 구할 열의 제목 셀을 클릭하거나, 첫 열부터 셀 때의 열 번호(숫자)를 입력합니다. 예) 4",
            "**③ 조건 범위**: 일반 함수와 달리 셀 하나만 지정할 수 없으며, 반드시 '조건 열 제목'과 '해당 조건값'이 포함된 범위를 지정합니다. 예) E1:E2"
          ]
        },
        {
          "type": "heading",
          "text": "③ 조건 범위 만드는 법 — 붙어 있으면 드래그, 떨어져 있으면 먼저 입력"
        },
        {
          "type": "bullets",
          "items": [
            "표 안에서 **조건 열 제목과 조건값이 위아래로 붙어 있으면**, 그 두 셀을 그대로 드래그해서 조건 범위로 쓰면 됩니다. 예) '제품군' 제목 바로 아래 칸에 '세탁기'가 있으면 그 두 칸을 드래그",
            "제목과 조건값이 **위아래로 붙어 있지 않으면** 드래그로 조건 범위를 만들 수 없습니다. 이때는 **문제에서 '조건을 적으라고 알려 주는 위치'**(예: [F1:F2], [B21:B22])가 주어지므로, **거기에 '조건 열 제목'과 '조건값'을 먼저 직접 입력**한 다음 그 범위를 조건 범위로 지정합니다.",
            "즉 조건 범위는 '표에서 바로 끌어오거나' '지정된 자리에 내가 만들어 넣거나' 둘 중 하나입니다. 어느 쪽이든 **제목 + 값**이 한 세트로 들어가야 한다는 점은 같습니다."
          ]
        },
        {
          "type": "heading",
          "text": "DSUM — 조건을 만족하는 행의 합계"
        },
        {
          "type": "bullets",
          "items": [
            "지정한 표 범위에서 조건을 만족하는 행들만 찾아 지정된 열의 **합계**를 구합니다.",
            "예) =DSUM(A1:D4, 4, E1:E2) → 제품군이 '세탁기'인 행의 판매량(4번째 열) 합계를 반환"
          ]
        }
      ],
      "practice": {
        "instruction": "스마트 가전 매장의 판매 현황 표입니다. [G2] 셀에 DSUM 함수를 사용하여 제품군이 '세탁기'인 제품들의 총 판매수량을 계산하세요. (조건 범위는 [F1:F2] 영역을 활용하세요.)",
        "requiredFunctions": ["DSUM"],
        "cols": ["A", "B", "C", "D", "E", "F", "G"],
        "rows": [
          [
            { "val": "제품ID", "editable": false },
            { "val": "제품군", "editable": false },
            { "val": "단가", "editable": false },
            { "val": "판매량", "editable": false },
            { "val": "", "editable": false },
            { "val": "제품군", "editable": false },
            { "val": "세탁기 총판매수량", "editable": false }
          ],
          [
            { "val": "W-01", "editable": false },
            { "val": "세탁기", "editable": false },
            { "val": 1200000, "editable": false },
            { "val": 5, "editable": false },
            { "val": "", "editable": false },
            { "val": "세탁기", "editable": false },
            { "val": "", "editable": true, "answer": "=DSUM(A1:D4,4,F1:F2)", "result": 13 }
          ],
          [
            { "val": "R-02", "editable": false },
            { "val": "냉장고", "editable": false },
            { "val": 2500000, "editable": false },
            { "val": 3, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "W-03", "editable": false },
            { "val": "세탁기", "editable": false },
            { "val": 1500000, "editable": false },
            { "val": 8, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "2. 나란히 작성하는 AND 조건 평균 (DAVERAGE)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "두 개 이상의 조건을 모두 만족해야 하는 경우(AND 조건, '~이면서', '~이고') 조건을 입력하는 규칙이 있습니다."
        },
        {
          "type": "image",
          "url": "/images/db-daverage.svg",
          "alt": "DAVERAGE AND 조건 — 조건을 같은 행에 나란히 입력하는 방법"
        },
        {
          "type": "heading",
          "text": "AND 조건 작성법 — 나란히 같은 행에"
        },
        {
          "type": "bullets",
          "items": [
            "각 조건의 **열 제목을 가로로 나열**하고, 만족해야 하는 조건값들을 **같은 행**에 나란히 입력합니다.",
            "예) 제조사=A사 이면서 재고량>=20: 제조사 | 재고량 → A사 | >=20 (같은 행에 입력)"
          ]
        },
        {
          "type": "heading",
          "text": "DAVERAGE — 조건을 만족하는 행의 평균"
        },
        {
          "type": "bullets",
          "items": [
            "다중 AND 조건을 모두 만족하는 데이터만 필터링하여 특정 열의 **평균값**을 반환합니다.",
            "예) =DAVERAGE(A1:D4, 3, E1:F2) → 제조사=A사 이면서 재고량>=20인 행의 단가(3번째 열) 평균"
          ]
        }
      ],
      "practice": {
        "instruction": "제조사와 재고량을 기준으로 평균 단가를 구하려고 합니다. [F1:G2]에 작성된 '제조사가 A사 이면서 재고량이 20대 이상'인 AND 조건을 이용하여 [H2] 셀에 해당하는 가전의 평균 단가를 구하세요.",
        "requiredFunctions": ["DAVERAGE"],
        "cols": ["A", "B", "C", "D", "E", "F", "G", "H"],
        "rows": [
          [
            { "val": "가전명", "editable": false },
            { "val": "제조사", "editable": false },
            { "val": "단가", "editable": false },
            { "val": "재고량", "editable": false },
            { "val": "", "editable": false },
            { "val": "제조사", "editable": false },
            { "val": "재고량", "editable": false },
            { "val": "조건 만족 평균단가", "editable": false }
          ],
          [
            { "val": "에어컨", "editable": false },
            { "val": "A사", "editable": false },
            { "val": 1800000, "editable": false },
            { "val": 25, "editable": false },
            { "val": "", "editable": false },
            { "val": "A사", "editable": false },
            { "val": ">=20", "editable": false },
            { "val": "", "editable": true, "answer": "=DAVERAGE(A1:D4,3,F1:G2)", "result": 1900000 }
          ],
          [
            { "val": "청소기", "editable": false },
            { "val": "B사", "editable": false },
            { "val": 600000, "editable": false },
            { "val": 40, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "스타일러", "editable": false },
            { "val": "A사", "editable": false },
            { "val": 2000000, "editable": false },
            { "val": 30, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "3. 어긋나게 행을 바꾸는 OR 조건 수량 카운트 (DCOUNT)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "여러 조건 중 하나라도 만족하면 포함시키는 경우(OR 조건, '~이거나')의 조건 입력 규칙입니다."
        },
        {
          "type": "image",
          "url": "/images/db-dcount.svg",
          "alt": "DCOUNT OR 조건 — 조건을 서로 다른 행에 계단식으로 입력하는 방법"
        },
        {
          "type": "heading",
          "text": "OR 조건 작성법 — 서로 다른 행에 계단식으로"
        },
        {
          "type": "bullets",
          "items": [
            "조건 열 제목들을 나열한 뒤, 조건값들을 동일한 행이 아닌 **서로 다른 행(엇갈린 행)**에 계단식으로 입력합니다.",
            "예) 매장=대구점 이거나 판매량>=50: 대구점을 E행에, >=50을 F행의 다음 줄에 입력"
          ]
        },
        {
          "type": "heading",
          "text": "DCOUNT 주의사항 — 숫자 데이터 열만 카운트"
        },
        {
          "type": "bullets",
          "items": [
            "DCOUNT는 조건에 맞는 행 중에서 지정한 열의 데이터가 **숫자, 날짜, 시간**인 셀만 카운트합니다.",
            "텍스트(문자)로 채워진 열을 지정하면 결과가 **0**이 됩니다.",
            "문자열 데이터까지 포함하여 셀 개수를 세려면 **DCOUNTA** 함수를 사용해야 합니다."
          ]
        }
      ],
      "practice": {
        "instruction": "[F1:G3] 영역에 '매장이 대구점 이거나 판매량이 50대 이상'인 OR 조건이 구성되어 있습니다. [H2] 셀에 DCOUNT 함수를 사용해 조건을 충족하는 매장 건수를 계산하세요.",
        "requiredFunctions": ["DCOUNT"],
        "cols": ["A", "B", "C", "D", "E", "F", "G", "H"],
        "rows": [
          [
            { "val": "지점코드", "editable": false },
            { "val": "매장위치", "editable": false },
            { "val": "판매량", "editable": false },
            { "val": "담당자", "editable": false },
            { "val": "", "editable": false },
            { "val": "매장위치", "editable": false },
            { "val": "판매량", "editable": false },
            { "val": "조건 부합 지점수", "editable": false }
          ],
          [
            { "val": "S01", "editable": false },
            { "val": "서울점", "editable": false },
            { "val": 65, "editable": false },
            { "val": "최팀장", "editable": false },
            { "val": "", "editable": false },
            { "val": "대구점", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": true, "answer": "=DCOUNT(A1:D4,3,F1:G3)", "result": 2 }
          ],
          [
            { "val": "D02", "editable": false },
            { "val": "대구점", "editable": false },
            { "val": 30, "editable": false },
            { "val": "이과장", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": ">=50", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": "B03", "editable": false },
            { "val": "부산점", "editable": false },
            { "val": 20, "editable": false },
            { "val": "박대리", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    },
    {
      "heading": "4. 와일드카드 만능문자를 조합한 최댓값 추출 (DMAX)",
      "contentBlocks": [
        {
          "type": "text",
          "text": "특정 키워드가 포함되거나 시작하는 텍스트 조건을 지정할 때는 만능문자(와일드카드)인 별표(*)와 물음표(?)를 활용합니다."
        },
        {
          "type": "image",
          "url": "/images/db-dmax.svg",
          "alt": "DMAX 와일드카드 — *, ? 만능문자 4가지 패턴과 최댓값 추출 예시"
        },
        {
          "type": "heading",
          "text": "와일드카드 패턴 4가지"
        },
        {
          "type": "bullets",
          "items": [
            "**고***: '고'로 시작하는 글자 수 제한 없는 모든 텍스트",
            "***고**: '고'로 끝나는 모든 텍스트",
            "***고***: '고'라는 글자가 어디에 있든 포함된 모든 텍스트",
            "**고??**: '고'로 시작하면서 반드시 전체가 3글자인 텍스트 (? 1개 = 임의의 1글자)"
          ]
        },
        {
          "type": "heading",
          "text": "DMAX — 조건을 만족하는 행의 최댓값"
        },
        {
          "type": "bullets",
          "items": [
            "와일드카드 조건 범위를 스캔하여 일치하는 데이터 그룹 내에서 **최댓값**을 찾아 반환합니다.",
            "예) =DMAX(A1:D4, 3, E1:E2) → 모델명이 'OLED'로 시작하는 제품 중 가장 큰 출시연도"
          ]
        }
      ],
      "practice": {
        "instruction": "물류창고 리스트입니다. [F1:F2] 영역에 모델명이 'OLED'로 시작하는 조건인 'OLED*'가 입력되어 있습니다. [G2] 셀에 DMAX 함수를 사용하여 OLED 모델 중 가장 큰 출시연도를 추출하세요.",
        "requiredFunctions": ["DMAX"],
        "cols": ["A", "B", "C", "D", "E", "F", "G"],
        "rows": [
          [
            { "val": "식별번호", "editable": false },
            { "val": "모델명", "editable": false },
            { "val": "출시연도", "editable": false },
            { "val": "입고수량", "editable": false },
            { "val": "", "editable": false },
            { "val": "모델명", "editable": false },
            { "val": "최신 출시연도", "editable": false }
          ],
          [
            { "val": 101, "editable": false },
            { "val": "OLED-TV", "editable": false },
            { "val": 2024, "editable": false },
            { "val": 15, "editable": false },
            { "val": "", "editable": false },
            { "val": "OLED*", "editable": false },
            { "val": "", "editable": true, "answer": "=DMAX(A1:D4,3,F1:F2)", "result": 2026 }
          ],
          [
            { "val": 102, "editable": false },
            { "val": "UHD-TV", "editable": false },
            { "val": 2023, "editable": false },
            { "val": 40, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ],
          [
            { "val": 103, "editable": false },
            { "val": "OLED-Monitor", "editable": false },
            { "val": 2026, "editable": false },
            { "val": 8, "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false },
            { "val": "", "editable": false }
          ]
        ]
      }
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "데이터베이스 함수인 DCOUNT 함수를 사용할 때, 두 번째 인수로 지정하는 '계산할 열 제목'으로 지정할 수 없는 셀은 무엇인가?",
      "options": [
        "숫자가 채워진 '단가' 열 제목",
        "날짜가 채워진 '입사일' 열 제목",
        "문자(텍스트)가 채워진 '사원명' 열 제목",
        "시간 데이터가 채워진 '출근시간' 열 제목"
      ],
      "answer": 2,
      "explanation": "DCOUNT 함수는 오직 숫자, 날짜, 시간 데이터가 들어있는 필드(열)의 개수만 카운트할 수 있으므로, 문자로 가득 찬 열의 제목을 선택하면 올바른 개수를 세지 못하고 0을 반환합니다."
    },
    {
      "id": 2,
      "question": "데이터베이스 함수의 조건 지정 범위에서 '제품명' 열 제목 아래에 '스마트??'라고 조건을 입력했을 때 검색 필터링 결과로 올바른 것은?",
      "options": [
        "제품명이 '스마트'로 시작하는 모든 글자 수의 제품 검색",
        "제품명이 '스마트폰'과 같이 '스마트'로 시작하면서 반드시 전체가 4글자인 제품 검색",
        "제품의 글자 수 상관없이 중간에 '스마트'가 들어간 모든 제품 검색",
        "제품명이 '스마트티비'와 같이 '스마트'로 시작하면서 뒤에 2글자가 더 붙어 총 5글자인 제품 검색"
      ],
      "answer": 3,
      "explanation": "물음표(?) 기호는 임의의 한 글자를 뜻하므로, '스마트' 3글자 뒤에 ??가 붙었으므로 반드시 '스마트'로 시작하는 총 5글자의 데이터를 매칭하게 됩니다."
    },
    {
      "id": 3,
      "question": "DSUM 함수에서 세 번째 인수(조건 범위)를 지정할 때 올바른 방법은?",
      "options": [
        "조건값이 입력된 셀 하나만 지정한다. 예) E2",
        "반드시 조건 열 제목과 조건값이 함께 포함된 범위를 지정한다. 예) E1:E2",
        "전체 데이터 범위와 동일하게 지정해야 한다.",
        "숫자로 된 열 번호만 입력하면 된다."
      ],
      "answer": 1,
      "explanation": "데이터베이스 함수의 조건 범위는 반드시 '조건 열 제목(헤더)'과 그 아래 '조건값'이 함께 포함되도록 지정해야 합니다. 셀 하나만 지정하면 열 제목이 없어 올바른 조건을 인식할 수 없습니다."
    },
    {
      "id": 4,
      "question": "DAVERAGE 함수를 사용할 때 '제조사가 A사 이면서 재고량이 50 이상'인 AND 조건을 조건 범위에 작성하는 올바른 방법은?",
      "options": [
        "제조사 열 제목 아래 A사를 입력하고, 그 다음 행에 재고량 열 제목과 >=50을 엇갈려 입력한다.",
        "같은 행에 제조사와 재고량 열 제목을 나란히 쓰고, 바로 아래 같은 행에 A사와 >=50을 나란히 입력한다.",
        "A사와 >=50을 한 셀에 같이 입력한다.",
        "조건 범위 없이 두 번째 인수에 조건식을 직접 작성한다."
      ],
      "answer": 1,
      "explanation": "AND 조건(~이면서)은 조건 열 제목들을 가로로 나열하고, 그 아래 같은 행에 조건값들을 나란히 입력합니다. 반면 OR 조건(~이거나)은 조건값들을 서로 다른 행(엇갈린 행)에 입력합니다."
    },
    {
      "id": 5,
      "question": "다음 중 데이터베이스 함수들의 공통된 특징으로 올바른 것은?",
      "options": [
        "함수마다 인수의 순서와 개수가 모두 다르다.",
        "두 번째 인수에 반드시 열 제목 문자열을 따옴표로 감싸서 입력해야 한다.",
        "모든 데이터베이스 함수는 (전체 표 범위, 계산할 열 제목, 조건 범위) 세 인수를 같은 순서로 사용한다.",
        "데이터베이스 함수는 조건 없이도 전체 데이터를 집계할 수 있다."
      ],
      "answer": 2,
      "explanation": "DSUM, DAVERAGE, DCOUNT, DMAX, DMIN 등 모든 데이터베이스 함수는 (전체 표 범위, 계산할 열 제목, 조건 범위) 세 인수를 동일한 순서로 사용합니다. 열 제목은 해당 셀을 클릭하거나 숫자 열 번호로 지정할 수 있습니다."
    },
    {
      "id": 6,
      "question": "데이터베이스 함수 중 DMIN 함수의 역할로 올바른 것은?",
      "options": [
        "조건을 만족하는 레코드 중 숫자 필드의 평균을 반환한다.",
        "조건을 만족하는 레코드 중 지정한 필드의 최솟값을 반환한다.",
        "조건을 만족하는 레코드의 개수를 반환한다.",
        "조건을 만족하는 레코드 중 지정한 필드의 합계를 반환한다."
      ],
      "answer": 1,
      "explanation": "DMIN은 조건을 만족하는 레코드들 중 지정한 필드(열)의 최솟값(minimum)을 반환합니다. DMAX는 최댓값, DSUM은 합계, DAVERAGE는 평균, DCOUNT/DCOUNTA는 개수를 구합니다."
    },
    {
      "id": 7,
      "question": "DCOUNT와 DCOUNTA의 차이점으로 올바른 것은?",
      "options": [
        "DCOUNT는 문자와 숫자 모두 세고, DCOUNTA는 숫자만 센다.",
        "DCOUNT는 숫자 데이터가 있는 셀만 세고, DCOUNTA는 비어있지 않은 모든 셀을 센다.",
        "DCOUNT는 조건이 필요 없고, DCOUNTA는 조건이 반드시 필요하다.",
        "DCOUNT와 DCOUNTA는 기능이 동일하고 이름만 다르다."
      ],
      "answer": 1,
      "explanation": "DCOUNT는 조건을 만족하는 레코드 중 숫자 데이터가 있는 셀만 카운트합니다. DCOUNTA는 숫자뿐 아니라 문자 · 날짜 등 비어있지 않은 모든 셀을 카운트합니다. 'A'는 'All(전체)'의 의미로 이해하면 됩니다."
    },
    {
      "id": 8,
      "question": "데이터베이스 함수에서 '서울 지점이거나 판매량이 100 이상'인 OR 조건을 조건 범위에 올바르게 작성하는 방법은?",
      "options": [
        "같은 행에 지점='서울'과 판매량='>=100' 조건을 나란히 입력한다.",
        "지점 조건값과 판매량 조건값을 서로 다른 행(엇갈리게)에 입력한다.",
        "조건을 하나의 셀에 '서울 OR >=100'으로 입력한다.",
        "두 번째 인수에 조건식을 직접 수식으로 연결한다."
      ],
      "answer": 1,
      "explanation": "OR 조건(~이거나)은 조건값들을 서로 다른 행에 엇갈려 입력해야 합니다. 같은 행에 나란히 입력하면 AND 조건(~이면서)이 됩니다. 조건 범위는 반드시 열 제목(헤더) 행을 포함해야 합니다."
    },
    {
      "id": 9,
      "question": "데이터베이스 함수의 두 번째 인수(field)를 지정하는 방법으로 올바르지 않은 것은?",
      "options": [
        "열 제목이 있는 셀을 클릭하여 셀 주소로 지정한다. (예: C1)",
        "열 제목 텍스트를 따옴표로 감싸서 직접 입력한다. (예: \"판매량\")",
        "왼쪽부터 센 열 번호를 숫자로 직접 입력한다. (예: 3)",
        "조건 범위에서 해당 열 제목이 위치한 행 번호를 입력한다."
      ],
      "answer": 3,
      "explanation": "데이터베이스 함수의 두 번째 인수는 ① 열 제목 셀 주소 클릭, ② 열 제목 문자열 직접 입력(따옴표 포함), ③ 왼쪽부터 센 열 번호(숫자) 세 가지 방법이 모두 유효합니다. 조건 범위의 행 번호를 입력하는 것은 올바른 방법이 아닙니다."
    },
    {
      "id": 10,
      "question": "DMAX 함수의 조건 범위에 '모델명' 열 제목 아래 'OLED*'를 입력했을 때 올바르게 매칭되는 데이터는?",
      "options": [
        "'OLED'와 정확히 일치하는 데이터만 매칭된다.",
        "'OLED'로 시작하는 글자 수에 상관없는 모든 데이터가 매칭된다.",
        "'OLED'가 중간이나 끝에 포함된 데이터만 매칭된다.",
        "와일드카드 * 기호는 데이터베이스 함수에서 사용할 수 없다."
      ],
      "answer": 1,
      "explanation": "별표(*) 와일드카드는 0개 이상의 임의 문자를 의미합니다. 'OLED*'는 'OLED'로 시작하는 'OLED-TV', 'OLED55' 등 뒤에 어떤 글자가 몇 개 오든 모두 매칭됩니다. 반면 '?'는 정확히 1글자만 대체합니다."
    }
  ],
  "practiceAnswers": [
    { "sheet": "단일조건합계", "cell": "G2", "formula": "=DSUM(A1:D4,4,F1:F2)" },
    { "sheet": "AND조건평균", "cell": "H2", "formula": "=DAVERAGE(A1:D4,3,F1:G2)" },
    { "sheet": "OR조건카운트", "cell": "H2", "formula": "=DCOUNT(A1:D4,3,F1:G3)" },
    { "sheet": "와일드카드최대", "cell": "G2", "formula": "=DMAX(A1:D4,3,F1:F2)" }
  ]
}

```

## 3. lesson-2 / lesson-3 의 lesson-4 대비 구조 차이

### lesson-2.json
- practiceKeys: lesson-2=["cols","instruction","rows"] / lesson-4=["cols","instruction","requiredFunctions","rows"]
- cellKeys: lesson-2=["answer","editable","result","val"] / lesson-4=["answer","editable","fillFrom","result","val"]
- blockTypes: lesson-2=["image","text"] / lesson-4=["bullets","heading","image","numbered","text"]
- imageUrlStyles: lesson-2=["/images/*.svg"] / lesson-4=["/diagram/*","/images/*.svg"]

### lesson-3.json
- practiceKeys: lesson-3=["cols","instruction","rows"] / lesson-4=["cols","instruction","requiredFunctions","rows"]
- cellKeys: lesson-3=["answer","editable","result","val"] / lesson-4=["answer","editable","fillFrom","result","val"]
- blockTypes: lesson-3=["image","text"] / lesson-4=["bullets","heading","image","numbered","text"]
- imageUrlStyles: lesson-3=["/images/*.svg"] / lesson-4=["/diagram/*","/images/*.svg"]

## 4. src/components/diagrams/Lesson4.jsx 전문

```jsx
import { useState, useEffect } from 'react';
import { Wrap, Title, Subtitle, BottomBar, BLine, ArrowDown, ExcelGrid, TableCaption, Row, Fixed, Fill, C } from './shared.jsx';

// ──────────────────────────────────────────────
// VlookupHlookupIntroDiagram — 문제 유형 앞에 두는 두 함수 공통 설명
// ──────────────────────────────────────────────
export function VlookupHlookupIntroDiagram() {
  return (
    <Wrap>
      <Title>VLOOKUP · HLOOKUP</Title>

      {/* 두 함수 설명 카드 */}
      <Row gap={16}>
        <Fill min={300} gap={6} style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
          <div style={{ color: C.blueLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 세로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 열에서 세로 방향으로 찾아 같은 행의 지정한 열에 있는 값을 반환</div>
        </Fill>
        <Fill min={300} gap={6} style={{ background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
          <div style={{ color: C.orangeLight, fontSize: 14, fontWeight: 700 }}>참조 범위의 데이터가 가로 방향으로 나열된 형태</div>
          <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>=HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
          <div style={{ color: C.textMuted, fontSize: 13.5, lineHeight: 1.6 }}>첫 행에서 가로 방향으로 찾아 같은 열의 지정한 행에 있는 값을 반환</div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// VlookupDiagram
// ──────────────────────────────────────────────
// ① 세로 참조 범위 VLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function VlookupDiagram() {
  const [active, setActive] = useState(null);

  // 일치 옵션을 누르면 성과급률 3개가 2초 간격으로 하나씩 채워짐
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['2.0%', '5.0%', '3.5%']; // 박서준(C)·김민지(A)·이도현(B)

  const loan = [
    ['사원코드', '사원명', '판매액', '성과급률'],
    ['103-C-2201', '박서준', '24,000,000', ''],
    ['101-A-4503', '김민지', '9,800,000', ''],
    ['102-B-3302', '이도현', '13,500,000', ''],
  ];
  const code = [
    ['등급', '직무', '성과급률'],
    ['A', '영업', '5.0%'],
    ['B', '관리', '3.5%'],
    ['C', '지원', '2.0%'],
  ];

  const WHITE = '#ffffff';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '열 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '사원코드의 다섯 번째 문자입니다.',
    '참조 범위': '찾을 값이 사원코드의 다섯 번째 문자(등급)이기 때문에 참조 범위의 첫 열로 오도록 하여, 위의 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '열 번호': '각 사원의 성과급률을 계산하라고 했기 때문에, 반환할 값이 지정한 참조 범위의 세 번째 열에 있으니 3입니다.',
    '일치 옵션': '찾을 값(C,A,B)이 참조 범위의 첫 열에 전부 있습니다. \n(정확히 일치 · FALSE)',
  };

  // 사원코드 문자열에서 다섯 번째 글자(A·B·C)에만 형광펜 배경
  const hi = (s) => {
    const str = String(s);
    return (
      <span>{str.slice(0, 4)}<span style={{ background: C.amberLight, color: '#0b1220', borderRadius: 3, padding: '1px 3px', fontWeight: 700 }}>{str.slice(4, 5)}</span>{str.slice(5)}</span>
    );
  };

  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';

  // 표1: 사원코드(A3:A5)의 다섯 번째 문자를 형광펜으로 표시 (열 번호 탭에서는 숨김)
  const loanSt = (ri, ci, val) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 0 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, content: hi(val) };
    if (ci === 3 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
    return {};
  };

  // 범위 바깥쪽 변에만 테두리를 그려 '범위를 감싼 것'처럼 보이게 (ri·ci는 data 인덱스)
  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 등급표: 참조 범위=A12:C14(첫 열 연한 채우기), 열 번호=C12:C14(초록), 일치 옵션=A12:A14(흰) — 모두 바깥쪽 테두리만
  const codeSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    let boxes = [];
    let fillFirstCol = false;
    if (active === '참조 범위') { boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }]; fillFirstCol = true; }
    else if (active === '열 번호') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 2, color: C.blueLight }, { r1: 1, r2: 3, c1: 2, c2: 2, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 1, r2: 3, c1: 0, c2: 0, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstCol && ci === 0 && ri >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>참조 범위에서 나열된 데이터의 방향이 세로이면 VLOOKUP</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>사원코드[A3:A5]</b>의 다섯 번째 문자와
          <b style={{ color: C.blueLight }}> [A11:C14]</b> 영역의 표를 이용하여 각 사원의
          <b style={{ color: C.greenLight }}> 성과급률[D3:D5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 사원코드의 앞에서 다섯 번째 문자가 “A”이면 성과급률은 5.0%, “B”이면 3.5%, “C”이면 2.0%임</div>
          <div>▶ VLOOKUP, MID 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 사원 실적표 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={loan} startRow={2} cellStyle={loanSt} minColW={78} firstColW={104} />
          </div>
          <div>
            <TableCaption color={C.blueLight}>[등급표] 세로 참조 범위</TableCaption>
            <ExcelGrid data={code} startRow={11} cellStyle={codeSt} minColW={82} firstColW={64}
              labelRow={[
                active === '참조 범위' ? { text: '첫 열', color: C.blueLight } : null,
                null,
                active === '열 번호' ? { text: '3번째', color: C.greenLight } : null,
              ]} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          {/* VLOOKUP 박스 (구문 + 수식) */}
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MID(A3,5,1)</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$A$12:$C$14</span>, <span style={{ color: C.greenLight }}>3</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 2.0%</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ② 가로 참조 범위 HLOOKUP — 왼쪽 표 2개 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function HlookupTwoTableDiagram() {
  const [active, setActive] = useState(null);

  // 일치 옵션을 누르면 판매금액 3개가 2초 간격으로 하나씩 채워짐
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['54,000', '30,000', '56,000']; // 한지민(B×12)·공유(D×20)·수지(A×7)

  const sales = [
    ['판매일', '판매사원', '상품코드', '판매수량', '판매금액'],
    ['3월 2일', '한지민', 'B', 12, ''],
    ['3월 5일', '공유', 'D', 20, ''],
    ['3월 9일', '수지', 'A', 7, ''],
  ];
  const price = [
    ['상품코드', 'A', 'B', 'C', 'D'],
    ['판매단가', '8,000', '4,500', '6,000', '1,500'],
    ['매입단가', '5,600', '3,000', '4,200', '1,000'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '행 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '상품코드입니다.',
    '참조 범위': '찾을 값이 상품코드이기 때문에 참조 범위의 첫 행으로 오도록 하여, 왼쪽 표의 제목 열은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '행 번호': '각 건의 판매금액을 계산하라고 했기 때문에, 반환할 판매단가가 지정한 참조 범위의 두 번째 행에 있으니 2입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 행에 전부 있습니다. \n(정확히 일치 · FALSE)',
  };

  // 표2: 상품코드 열(C3:C5)을 형광펜으로 표시 (행 번호 탭에서는 숨김)
  const salesSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    if (ci === 2 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, bg: C.amberLight, color: '#0b1220' };
    if (ci === 4 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
    return {};
  };

  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 단가표: 이름 열(A)은 항상 라벨색. 참조 범위=B12:E14(첫 행 연한 채우기), 행 번호=B13:E13(초록), 일치 옵션=B12:E12(흰)
  const priceSt = (ri, ci) => {
    if (ci === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 2, c1: 1, c2: 4, color: C.blueLight }, { r1: 1, r2: 1, c1: 1, c2: 4, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 4, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>참조 범위에서 나열된 데이터의 방향이 가로이면 HLOOKUP</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표2]에서 <b style={{ color: C.amberLight }}>상품코드[C3:C5]</b>와
          <b style={{ color: C.blueLight }}> [A12:E14]</b> 영역의 표를 이용하여 각 건의
          <b style={{ color: C.greenLight }}> 판매금액[E3:E5]</b>을 계산하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ 판매금액은 판매수량과 상품의 판매단가를 곱한 값임</div>
          <div>▶ HLOOKUP 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표 2개(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.orangeLight}>[표2] 상품 판매현황 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={sales} startRow={2} cellStyle={salesSt} minColW={72} firstColW={78} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[상품 단가표] 가로 참조 범위</TableCaption>
            <ExcelGrid data={price} startRow={12} cellStyle={priceSt} minColW={80} firstColW={74} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          {/* HLOOKUP 박스 (구문 + 수식) */}
          <div style={{ background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
            <div style={{ color: C.orange, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 행에서 찾을 값을 가로로 찾아 같은 열의 지정 행 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=D3*HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$12:$E$14</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 12 × 4,500 = 54,000</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// (개념학습2) 유사 일치 이해하기 — 두 가지 가로 기준표(구간 형태·시작값 형태) + HLOOKUP
export function VlookupApproxDiagram() {
  const [active, setActive] = useState(null);

  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (active !== '일치 옵션') { setRevealed(0); return; }
    setRevealed(0);
    const id = setInterval(() => setRevealed((n) => (n >= 3 ? n : n + 1)), 2000);
    return () => clearInterval(id);
  }, [active]);
  const ANS = ['수', '양', '우']; // 김하늘 92→수, 이준호 68→양, 박서연 85→우

  const score = [
    ['학번', '이름', '총점', '등급'],
    ['S01', '김하늘', 92, ''],
    ['S02', '이준호', 68, ''],
    ['S03', '박서연', 85, ''],
  ];
  // 표① 시험지 형태: 기준점수(A8:A9 병합) + 이상(8행) + 미만(9행), 등급(10행)
  const base1 = [
    ['기준점수', '0 이상', '60 이상', '70 이상', '80 이상', '90 이상'],
    ['', '60 미만', '70 미만', '80 미만', '90 미만', '100 이하'],
    ['등급', '가', '양', '미', '우', '수'],
  ];
  // 표② 시작값 형태: 기준점수(8행 숫자) + 등급(9행)
  const base2 = [
    ['기준점수', 0, 60, 70, 80, 90],
    ['등급', '가', '양', '미', '우', '수'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '행 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];

  const explain = {
    '찾을 값': '총점입니다.',
    '참조 범위': '찾을 값이 총점이기 때문에 참조 범위의 첫 행에 오도록 하여, 첫 행은 반드시 오름차순으로 정렬돼 있어야 합니다. \n왼쪽 표의 제목 열은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다.',
    '행 번호': '각 학생의 등급을 계산하라고 했기 때문에, 반환할 값이 표2에서는 지정한 참조 범위의 세 번째 행에 있으니 3이고, 표3에서는 두 번째 행에 있으니 2입니다.',
    '일치 옵션': '찾을 값과 똑같은 값이 없어도, 찾을 값보다 작은 값 중 가장 큰 값을 찾아 그 구간의 등급을 가져옵니다. \n(유사 일치 · TRUE)',
  };

  const scoreSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    if (ci === 2 && (active === '찾을 값' || active === '참조 범위' || active === '일치 옵션')) return { bold: true, bg: C.amberLight, color: '#0b1220' };
    if (ci === 3 && active === '일치 옵션' && ri >= 1 && revealed >= ri) return { bold: true, color: C.greenLight, content: ANS[ri - 1] };
    return {};
  };

  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };

  // 표① (인덱스 0·1·2): 등급 행 = 인덱스 2. 참조 범위=B8:F10, 행 번호(등급)=인덱스2, 일치 옵션=첫 행(인덱스0)
  const base1St = (ri, ci) => {
    if (ci === 0) return ri === 0 ? { rowSpan: 2, bold: true, color: C.orangeLight, bg: '#3a1c08' } : { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 2, c1: 1, c2: 5, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 2, c1: 1, c2: 5, color: C.blueLight }, { r1: 2, r2: 2, c1: 1, c2: 5, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 5, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  // 표② (인덱스 0·1): 등급 행 = 인덱스 1. 참조 범위=B12:F13, 행 번호(등급)=인덱스1, 일치 옵션=첫 행(인덱스0)
  const base2St = (ri, ci) => {
    if (ci === 0) return { bold: true, color: C.orangeLight, bg: '#3a1c08' };
    let boxes = [];
    let fillFirstRow = false;
    if (active === '참조 범위') { boxes = [{ r1: 0, r2: 1, c1: 1, c2: 5, color: C.blueLight }]; fillFirstRow = true; }
    else if (active === '행 번호') boxes = [{ r1: 0, r2: 1, c1: 1, c2: 5, color: C.blueLight }, { r1: 1, r2: 1, c1: 1, c2: 5, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 0, r2: 0, c1: 1, c2: 5, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    if (fillFirstRow && ri === 0 && ci >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>유사 일치 이해하기</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>총점[C3:C5]</b>과 아래 기준표를 이용하여 각 학생의
          <b style={{ color: C.greenLight }}> 등급[D3:D5]</b>을 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ HLOOKUP 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 성적표 + 두 기준표 · 오른쪽: 박스 + 버튼 + 칠판 */}
      <Row gap={20}>
        <Fixed style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <TableCaption color={C.blueLight}>[표1] 학생 성적표 — 찾는 값이 있는 표</TableCaption>
            <ExcelGrid data={score} startRow={2} cellStyle={scoreSt} minColW={64} firstColW={72} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[표2] 가로 기준표 — 시험지 형태(구간 표시)</TableCaption>
            <ExcelGrid data={base1} startRow={8} cellStyle={base1St} minColW={62} firstColW={70} />
          </div>
          <div>
            <TableCaption color={C.orangeLight}>[표3] 같은 기준표 — 시작값만 (HLOOKUP이 쓰는 형태)</TableCaption>
            <ExcelGrid data={base2} startRow={12} cellStyle={base2St} minColW={62} firstColW={70} />
          </div>
        </Fixed>

        <Fill min={360} max={500}>
          {/* HLOOKUP 박스 — 두 표의 정답 */}
          <div style={{ background: '#2a1608', border: `2px solid ${C.orange}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.orange, fontSize: 18, fontWeight: 700 }}>HLOOKUP</div>
            <div style={{ color: C.orange, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =HLOOKUP(찾을 값, 참조 범위, 행 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>기준표 첫 행에서 총점이 속한 구간을 찾아 같은 열의 등급을 반환</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em', padding: '2px 0' }}>
              <div style={{ color: C.orangeLight, fontSize: 13, marginBottom: 2 }}>표2 (등급이 3번째 행)</div>
              <div>=HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$8:$F$10</span>, <span style={{ color: C.greenLight }}>3</span>, TRUE)<span style={{ color: C.greenLight }}> → 수</span></div>
              <div style={{ color: C.orangeLight, fontSize: 13, margin: '8px 0 2px' }}>표3 (등급이 2번째 행)</div>
              <div>=HLOOKUP(<span style={{ color: C.amberLight }}>C3</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>$B$12:$F$13</span>, <span style={{ color: C.greenLight }}>2</span>, TRUE)<span style={{ color: C.greenLight }}> → 수</span></div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요 (두 표에 동시 표시)</div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 칠판 — 가장 긴 설명 크기로 고정 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>

          {/* 참조 범위 보충 설명 — 자리는 항상 차지하고(크기 고정) 참조 범위일 때만 보이게 */}
          <div style={{ visibility: active === '참조 범위' ? 'visible' : 'hidden', background: C.bgDark, border: `1px solid ${C.blueDim}`, borderRadius: 10, padding: '11px 14px', color: C.textMuted, fontSize: 13, lineHeight: 1.65 }}>
            표2에서 HLOOKUP은 참조 범위 첫 행(8행)의 <b style={{ color: C.text }}>0 이상~90 이상</b>에서 구간의 시작값 <b style={{ color: C.text }}>0·60·70·80·90</b>만 보고 총점을 찾습니다. 아래 행(9행)은 사람이 구간을 읽기 쉽게 적어둔 것일 뿐 검색에는 쓰이지 않습니다.
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ③ 한 표 안에서 VLOOKUP + MIN — 왼쪽 표 고정, 오른쪽 박스+버튼으로 인수별 강조가 바뀜
export function VlookupOneTableDiagram() {
  const [active, setActive] = useState(null);

  const data = [
    ['상품명', '만족도', '카테고리'],
    ['아메리카노', 4.5, '음료'],
    ['크로플', 3.2, '디저트'],
    ['카페라떼', 4.8, '음료'],
    ['머핀', 2.9, '디저트'],
  ];

  const WHITE = '#ffffff';
  const LIGHT_BLUE = 'rgba(96,165,250,0.22)';
  const tabs = [
    { key: '찾을 값', color: C.amberLight },
    { key: '참조 범위', color: C.blueLight },
    { key: '열 번호', color: C.greenLight },
    { key: '일치 옵션', color: WHITE },
  ];
  const activeColor = (tabs.find((t) => t.key === active) || {}).color;

  const explain = {
    '찾을 값': '만족도 중 가장 낮은 값입니다.',
    '참조 범위': '찾을 값이 만족도이기 때문에 참조 범위의 첫 열로 오도록 하여, 위의 표의 제목행은 실제 데이터가 아니므로 빼고 남은 표의 끝까지 선택합니다. 상품명 열은 만족도 열이 참조 범위의 첫 열이므로 지정할 수 없습니다.',
    '열 번호': '가장 낮은 만족도의 카테고리를 구하라고 했기 때문에, 반환할 카테고리가 지정한 참조 범위의 두 번째 열에 있으니 2입니다.',
    '일치 옵션': '찾을 값이 참조 범위의 첫 열에 있습니다. \n(정확히 일치 · FALSE)',
  };

  const rangeSides = (ri, ci, boxes) => {
    const s = {};
    for (const b of boxes) {
      if (ri < b.r1 || ri > b.r2 || ci < b.c1 || ci > b.c2) continue;
      if (ri === b.r1) s.bt = b.color;
      if (ri === b.r2) s.bb = b.color;
      if (ci === b.c1) s.bl = b.color;
      if (ci === b.c2) s.br = b.color;
    }
    return s;
  };
  // 한 표: 만족도(B3:B6)=찾을 값 재료, 참조 범위=B3:C6(첫 열 연한 채우기), 열 번호=C3:C6(초록), 일치 옵션=B3:B6(흰)
  const st = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    let boxes = [];
    let fillFirstCol = false;
    if (active === '참조 범위') { boxes = [{ r1: 1, r2: 4, c1: 1, c2: 2, color: C.blueLight }]; fillFirstCol = true; }
    else if (active === '열 번호') boxes = [{ r1: 1, r2: 4, c1: 1, c2: 2, color: C.blueLight }, { r1: 1, r2: 4, c1: 2, c2: 2, color: C.greenLight }];
    else if (active === '일치 옵션') boxes = [{ r1: 1, r2: 4, c1: 1, c2: 1, color: WHITE }];
    const sides = rangeSides(ri, ci, boxes);
    // 찾을 값·일치 옵션 탭: 만족도 열(B3:B6) 형광펜 / 참조 범위 탭: 첫 열 연한 채우기
    if ((active === '찾을 값' || active === '일치 옵션') && ci === 1 && ri >= 1) { sides.bg = C.amberLight; sides.color = '#0b1220'; sides.bold = true; }
    else if (fillFirstCol && ci === 1 && ri >= 1) sides.bg = LIGHT_BLUE;
    return sides;
  };

  return (
    <Wrap>
      <Title>하나의 표에서</Title>

      {/* 실제 시험 형식 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표3]에서 <b style={{ color: C.amberLight }}>만족도[B3:B6]</b>가 가장 낮은 상품의
          <b style={{ color: C.greenLight }}> 카테고리[C9]</b>를 구하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.85, marginTop: 8 }}>
          <div>▶ VLOOKUP, MIN 함수 사용</div>
        </div>
      </div>

      {/* 왼쪽: 표(항상 표시) · 오른쪽: 박스 + 버튼 + 설명 */}
      <Row gap={32}>
        <Fixed>
          <TableCaption color={C.blueLight}>[표3] 찾는 값과 참조 범위가 같은 표</TableCaption>
          <ExcelGrid data={data} startRow={2} cellStyle={st} minColW={92} firstColW={92} />
        </Fixed>

        <Fill min={360} max={500}>
          {/* VLOOKUP + MIN 박스 */}
          <div style={{ background: C.blueCard, border: `2px solid ${C.blueDim}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.blue, fontSize: 18, fontWeight: 700 }}>VLOOKUP</div>
            <div style={{ color: C.blue, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>구문: =VLOOKUP(찾을 값, 참조 범위, 열 번호, 일치 옵션)</div>
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>참조 범위의 첫 열에서 찾을 값을 세로로 찾아 같은 행의 지정 열 값을 반환</div>
            <div style={{ borderTop: `1px solid ${C.blueDim}`, margin: '8px 0 6px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', letterSpacing: '-0.01em', padding: '6px 0' }}>
              <div>=VLOOKUP(<span style={{ color: C.amberLight }}>MIN(B3:B6)</span>, <span style={{ color: C.blueLight, textDecoration: 'underline' }}>B3:C6</span>, <span style={{ color: C.greenLight }}>2</span>, FALSE)</div>
              <div style={{ color: C.greenLight }}>→ 디저트</div>
            </div>
          </div>

          {/* 안내 문구 — 박스 아래, 버튼 위 */}
          <div style={{ color: C.textDim, fontSize: 14, textAlign: 'center' }}>버튼을 눌러 네 개의 인수를 하나씩 확인하세요</div>

          {/* 인수 버튼 4개 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActive(t.key)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                  border: `2px solid ${t.color}`,
                  background: active === t.key ? t.color : 'transparent',
                  color: active === t.key ? '#0b1220' : t.color,
                }}>
                {t.key}
              </button>
            ))}
          </div>

          {/* 칠판 — 가장 긴 설명 크기로 고정, 버튼을 눌러도 크기 불변 */}
          <div style={{ display: 'grid', background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px' }}>
            {tabs.map((t) => (
              <div key={t.key} style={{ gridColumn: 1, gridRow: 1, visibility: active === t.key ? 'visible' : 'hidden', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                <span style={{ color: t.color === WHITE ? C.text : t.color, fontWeight: 700 }}>{t.key}</span>
                <span style={{ color: C.text }}> — {explain[t.key]}</span>
              </div>
            ))}
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// MatchIndexDiagram
// ──────────────────────────────────────────────
export function MatchIndexDiagram() {
  // 사원 명단 — 전체 범위 A1:D6. 범위 시작행이 1행이라 범위 안 행·열 번호가 시트 좌표와 그대로 일치.
  const emp = [
    ['사원명', '부서', '직급', '급여'],
    ['김철수', '영업부', '대리', 3200],
    ['이영희', '인사부', '과장', 3800],
    ['박민수', '총무부', '사원', 2700],
    ['최지훈', '영업부', '부장', 4500],
    ['정수연', '인사부', '대리', 3100],
  ];

  // 범위 A1:D6=파란 바깥 테두리 / 행 번호 A4:D4=노란 바깥 테두리 / 열 번호 C1:C6=초록 바깥 테두리 / 사원 C4=옅은 빨강 채우기
  const empSt = (ri, ci) => {
    const isHeader = ri === 0;
    const s = isHeader ? { bold: true, color: C.blueLight, bg: C.blueCard } : {};
    // 범위(파랑) — A1:D6 바깥 테두리
    if (ri === 0) s.bt = C.blue;
    if (ri === 5) s.bb = C.blue;
    if (ci === 0) s.bl = C.blue;
    if (ci === 3) s.br = C.blue;
    // 행 번호(노랑) — A4:D4 바깥 테두리 (행/열 강조가 범위보다 우선)
    if (ri === 3) { s.bt = C.amber; s.bb = C.amber; if (ci === 0) s.bl = C.amber; if (ci === 3) s.br = C.amber; }
    // 열 번호(초록) — C1:C6 바깥 테두리
    if (ci === 2) { s.bl = C.green; s.br = C.green; if (ri === 0) s.bt = C.green; if (ri === 5) s.bb = C.green; }
    // 사원 셀(C4) — 옅은 빨강 채우기
    if (ri === 3 && ci === 2) { s.bg = 'rgba(239,68,68,0.30)'; s.bold = true; }
    return s;
  };

  // MATCH 표: 첫 열 A1:A6=노란 바깥 테두리(박민수 검색) / 첫 행 A1:D1=초록 바깥 테두리(직급 검색) / 박민수(A4)·직급(C1) 채우기
  const matchSt = (ri, ci) => {
    const isHeader = ri === 0;
    const s = isHeader ? { bold: true, color: C.blueLight, bg: C.blueCard } : {};
    if (ci === 0) { s.bl = C.amber; s.br = C.amber; if (ri === 0) s.bt = C.amber; if (ri === 5) s.bb = C.amber; }
    if (ri === 0) { s.bt = C.green; s.bb = C.green; if (ci === 0) s.bl = C.green; if (ci === 3) s.br = C.green; }
    if (ri === 3 && ci === 0) { s.bg = 'rgba(251,191,36,0.28)'; s.bold = true; }
    if (ri === 0 && ci === 2) { s.bg = 'rgba(34,197,94,0.28)'; s.bold = true; }
    return s;
  };

  // 공통 스타일
  const para = { color: C.text, fontSize: 15, lineHeight: 1.8, margin: '6px 0' };

  return (
    <Wrap>
      <Title>위치 · 추출 함수: INDEX · MATCH</Title>
      <Subtitle>INDEX는 &apos;그 자리의 값&apos;을 꺼내고, MATCH는 &apos;몇 번째인지&apos;를 셉니다.</Subtitle>

      {/* 문제 박스 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.greenLight }}>&apos;박민수&apos;의 직급</b>을 구하시오.
        </div>
      </div>

      <Row gap={18}>
        {/* Left: 사원 표 (범위·행·열 바깥 테두리 + C4 채우기 강조) */}
        <Fixed>
          <TableCaption color={C.blueLight}>[표1] 사원 명단</TableCaption>
          <ExcelGrid data={emp} startRow={1} cellStyle={empSt} minColW={72} firstColW={80}
            labelRow={[null, null, { text: '3번째 열', color: C.greenLight }, null]}
            rowLabels={{ 3: { text: '4번째 행', color: C.amber } }} />
        </Fixed>

        {/* Right: INDEX 박스(함수명 → 구문 → 설명 → 수식 → 값) + 박스 아래 보충 설명 */}
        <Fill min={360} max={540} gap={0}>
          <div style={{ background: '#071a0b', border: `2px solid ${C.green}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.greenLight, fontSize: 18, fontWeight: 700 }}>INDEX</div>
            <div style={{ color: C.greenLight, fontSize: 14, fontWeight: 700, opacity: 0.95 }}>구문: =INDEX(범위, 행 번호, 열 번호)</div>
            <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>지정한 범위 안에서 행 번호와 열 번호가 만나는 칸의 값을 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, textAlign: 'center', padding: '4px 0 2px' }}>
              =INDEX(<span style={{ color: C.blueLight }}>A1:D6</span>, <span style={{ color: C.amberLight }}>4</span>, <span style={{ color: C.greenLight }}>3</span>)
            </div>
          </div>
          <div style={{ ...para, marginTop: 12 }}>행 번호·열 번호는 시트의 행·열이 아니라 <b style={{ color: C.blueLight }}>지정한 범위</b> 안에서 몇 번째인지입니다. 지금은 범위가 1행부터 시작해서 시트 번호와 같아 보이지만, 범위가 A2:D6이면 박민수는 3번째 행이 됩니다.</div>
        </Fill>
      </Row>

      {/* MATCH — INDEX와 같은 방식. 위치 번호를 구하는 문제 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', margin: '24px 0 16px' }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표1]에서 <b style={{ color: C.amberLight }}>&apos;박민수&apos;가 몇 번째 행</b>인지, <b style={{ color: C.greenLight }}>&apos;직급&apos;이 몇 번째 열</b>인지 구하시오.
        </div>
      </div>
      <Row gap={18}>
        {/* Left: 사원 표 (첫 열·첫 행 바깥 테두리 + 박민수·직급 채우기) */}
        <Fixed>
          <TableCaption color={C.blueLight}>[표1] 사원 명단</TableCaption>
          <ExcelGrid data={emp} startRow={1} cellStyle={matchSt} minColW={72} firstColW={80}
            labelRow={[{ text: '4번째', color: C.amber }, null, null, null]}
            rowLabels={{ 0: { text: '3번째', color: C.green } }} />
        </Fixed>

        {/* Right: MATCH 박스(함수명 → 구문 → 설명 → 수식) + 박스 아래 보충 설명 */}
        <Fill min={360} max={540} gap={0}>
          <div style={{ background: C.purpleCard, border: `2px solid ${C.purple}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ color: C.purpleLight, fontSize: 18, fontWeight: 700 }}>MATCH</div>
            <div style={{ color: C.purpleLight, fontSize: 14, fontWeight: 700, opacity: 0.95 }}>구문: =MATCH(찾을 값, 범위, [옵션])</div>
            <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.6 }}>찾을 값이 지정한 범위 안에서 몇 번째에 있는지 위치 번호를 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={{ color: C.text, fontSize: 17, fontWeight: 700, textAlign: 'center', padding: '4px 0 2px', lineHeight: 2 }}>
              <div>=MATCH(<span style={{ color: C.amberLight }}>&quot;박민수&quot;</span>, <span style={{ color: C.amberLight }}>A1:A6</span>, 0)</div>
              <div>=MATCH(<span style={{ color: C.greenLight }}>&quot;직급&quot;</span>, <span style={{ color: C.greenLight }}>A1:D1</span>, 0)</div>
            </div>
          </div>
          <div style={{ ...para, marginTop: 12 }}>
            <div>MATCH는 값이 아니라 위치 번호를 돌려줍니다. 박민수는 첫 열에서 4번째, 직급은 첫 행에서 3번째.</div>
            <div style={{ marginTop: 6 }}>옵션은 0이면 찾을 값과 똑같은 값을 찾고, 1이면 찾을 값보다 작거나 같은 값 중 가장 큰 값(범위가 작은 값→큰 값 순으로 정렬되어 있을 때), -1이면 찾을 값보다 크거나 같은 값 중 가장 작은 값(범위가 큰 값→작은 값 순으로 정렬되어 있을 때)을 찾습니다. 여기서는 똑같은 값을 찾으므로 0을 씁니다.</div>
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// ChooseDiagram
// ──────────────────────────────────────────────
export function ChooseDiagram() {
  const options = [
    { num: 1, label: '번호 = 1',       value: '"최우수"', note: '(선택 안 됨)', active: false },
    { num: 2, label: '번호 = 2  ★ 선택됨', value: '"우수"',   note: '→ 이 값 반환', active: true  },
    { num: 3, label: '번호 = 3',       value: '"보통"',   note: '(선택 안 됨)', active: false },
  ];

  return (
    <Wrap>
      <Title>목록 선택 함수: CHOOSE</Title>
      <Subtitle>번호 인수에 따라 미리 지정된 값 목록에서 하나를 선택하여 반환합니다</Subtitle>

      {/* Formula box */}
      <Row style={{ marginBottom: 16 }}>
        <Fill max={480} gap={4} style={{
          background: '#1e3a8a', border: `2px solid ${C.blueDim}`,
          borderRadius: 10, padding: 16,
        }}>
          <div style={{
            color: C.blueLight, fontSize: 16, fontFamily: 'monospace',
            fontWeight: 700, textAlign: 'center',
          }}>
            =CHOOSE( 2 , &quot;최우수&quot; , &quot;우수&quot; , &quot;보통&quot; )
          </div>
          <div style={{
            color: C.textDim, fontSize: 14, fontFamily: 'monospace', textAlign: 'center',
          }}>
            &nbsp;&nbsp;&nbsp;&nbsp;① 번호&nbsp;&nbsp;&nbsp;② 값1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;③ 값2&nbsp;&nbsp;&nbsp;&nbsp;④ 값3
          </div>
        </Fill>
      </Row>

      <Row><Fixed><ArrowDown color={C.blueDim} size={32} /></Fixed></Row>

      {/* Three option cards */}
      <Row gap={16} style={{ marginTop: 16 }}>
        {options.map((opt) => (
          <Fill key={opt.num} min={0} gap={8} style={{
            borderRadius: 10, padding: 16,
            background: opt.active ? C.blueCard : C.bgDark,
            border: opt.active ? `3px solid ${C.blueDim}` : `1px solid ${C.border}`,
            opacity: opt.active ? 1 : 0.7,
            alignItems: 'center',
          }}>
            <div style={{
              color: opt.active ? C.blue : C.textDim,
              fontSize: 15, fontWeight: opt.active ? 700 : 400, textAlign: 'center',
            }}>
              {opt.label}
            </div>
            <div style={{
              color: opt.active ? C.blue : C.textSlate,
              fontSize: opt.active ? 28 : 20,
              fontWeight: 700, textAlign: 'center',
            }}>
              {opt.value}
            </div>
            <div style={{
              color: opt.active ? C.blueLight : C.textSlate,
              fontSize: 15, textAlign: 'center',
            }}>
              {opt.note}
            </div>
          </Fill>
        ))}
      </Row>

      <Row style={{ marginTop: 16 }}><Fixed><ArrowDown color={C.green} size={32} /></Fixed></Row>

      {/* Result box */}
      <Row style={{ marginTop: 4 }}>
        <Fill max={300} style={{
          background: '#14532d', border: `2px solid ${C.green}`,
          borderRadius: 10, padding: 16,
          alignItems: 'center',
        }}>
          <div style={{ color: C.greenLight, fontSize: 24, fontWeight: 700 }}>
            결과: &quot;우수&quot;
          </div>
        </Fill>
      </Row>

      <BottomBar>
        <BLine>=CHOOSE(번호, 값1, 값2, 값3, ...)  ·  번호가 1이면 값1, 2면 값2, 3이면 값3을 반환</BLine>
        <BLine color={C.blue} bold>CHOOSE의 번호 인수에 WEEKDAY, MONTH 등 다른 함수를 중첩해서 활용</BLine>
      </BottomBar>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// IndexMatchDiagram
// ──────────────────────────────────────────────
export function IndexMatchDiagram() {
  // [표5] 상품 판매 현황 — F26:I32. 데이터 행은 27~32(6행). 상품명(F)·분류(G)·판매량(H)·매출액(I, 만원).
  const prod = [
    ['상품명', '분류', '판매량', '매출액'],   // 26행 머리글
    ['노트북', '전자', 120, '3,600'],         // 27
    ['청소기', '가전', 85, '1,700'],          // 28
    ['에어컨', '가전', 60, '4,800'],          // 29 ← 매출액 최고
    ['모니터', '전자', 140, '2,100'],         // 30
    ['냉장고', '가전', 45, '4,050'],          // 31
    ['키보드', '전자', 300, '900'],           // 32
  ];
  // INDEX 범위=표 전체 F27:I32(제목행 26 제외)=초록 바깥 테두리 / 매출액(I27:I32)=옅은 노랑 채우기(MAX·MATCH 대상)
  // 최고 매출액(4,800, 29행)=진한 노랑 채우기 / 결과 상품명(에어컨, 29행)=초록 채우기
  const prodSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = {};
    // INDEX 범위(초록) — 표 전체 F27:I32 바깥 테두리
    if (ri === 1) s.bt = C.green;
    if (ri === 6) s.bb = C.green;
    if (ci === 0) s.bl = C.green;
    if (ci === 3) s.br = C.green;
    // 최고 매출액(4,800, 29행=데이터 3행) — 주황 채우기
    if (ri === 3 && ci === 3) { s.bg = 'rgba(251,146,60,0.45)'; s.bold = true; }
    // 결과 상품명(에어컨, 29행) — 초록 채우기
    if (ri === 3 && ci === 0) { s.bg = 'rgba(34,197,94,0.30)'; s.bold = true; }
    return s;
  };

  // 단계 박스 공통
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const synSt = (c) => ({ color: c, fontSize: 14, fontWeight: 700, opacity: 0.95 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>MAX로 최고값을 구하고, MATCH로 그 위치를 찾아, INDEX로 그 자리의 값을 꺼냅니다.</Title>

      {/* 문제 박스 (실기 기출 형식: [표5] 상품 판매 현황) */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표5]에서 <b style={{ color: C.amberLight }}>매출액[I27:I32]</b>이 <b style={{ color: C.amberLight }}>가장 높은</b> 상품의 <b style={{ color: C.greenLight }}>상품명[F27:F32]</b>을 찾아 [J32] 셀에 표시하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, marginTop: 6 }}>▶ INDEX, MATCH, MAX 함수 사용</div>
      </div>

      <Row gap={18}>
        {/* Left: 상품 판매 현황 표 */}
        <Fixed>
          <TableCaption color={C.blueLight}>[표5] 상품 판매 현황 (매출액 단위: 만원)</TableCaption>
          <ExcelGrid data={prod} startCol={5} startRow={26} cellStyle={prodSt} minColW={58} firstColW={78}
            rowLabels={{ 3: { text: '← 3번째', color: C.purpleLight } }}
            labelRow={[{ text: '1번째', color: C.greenLight }, null, null, null]} />
        </Fixed>

        {/* Right: 3단계 풀이 박스 (MAX → MATCH → INDEX) */}
        <Fill min={360} max={560} gap={12}>
          {/* STEP 1 — MAX */}
          <div style={{ ...boxBase, background: '#2a1206', border: `2px solid ${C.orange}` }}>
            <div style={nameSt(C.orangeLight)}>1단계 · MAX — 최고값</div>
            <div style={synSt(C.orangeLight)}>구문: =MAX(범위)</div>
            <div style={descSt}>매출액 범위에서 가장 큰 값을 반환합니다.</div>
            <div style={{ borderTop: `1px solid ${C.orange}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =MAX(<span style={{ color: C.text }}>I27:I32</span>) = <span style={{ color: C.amberLight }}>4,800</span>
            </div>
          </div>

          {/* STEP 2 — MATCH */}
          <div style={{ ...boxBase, background: C.purpleCard, border: `2px solid ${C.purple}` }}>
            <div style={nameSt(C.purpleLight)}>2단계 · MATCH — 위치 번호</div>
            <div style={synSt(C.purpleLight)}>구문: =MATCH(찾을 값, 범위, [옵션])</div>
            <div style={descSt}>MAX로 구한 최고 매출액을 매출액 범위에서 몇 번째에 있는지 위치 번호를 반환합니다.<br />MAX로 가장 큰 값을 찾은 곳이 I27:I32이므로, MATCH의 범위도 제목 셀인 I26을 뺀 I27:I32로 지정합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =MATCH(<span style={{ color: C.amberLight }}>MAX(I27:I32)</span>, <span style={{ color: C.text }}>I27:I32</span>, 0) = <span style={{ color: C.purpleLight }}>3</span>
            </div>
          </div>

          {/* STEP 3 — INDEX */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>3단계 · INDEX — 값 추출</div>
            <div style={synSt(C.greenLight)}>구문: =INDEX(범위, 행 번호, 열 번호)</div>
            <div style={descSt}>범위를 표 전체로 잡고, 앞 단계 MATCH가 제목 셀(I26)을 뺀 매출액 범위를 지정했으므로 INDEX 범위도 표 전체를 선택하되 제목 행은 빼고 F27:I32로 지정합니다.<br />행 번호에는 MAX로 구한 최고 매출액이 MATCH가 찾은 매출액 범위에서 몇 번째인지, 그 위치 번호를 넣습니다.<br />열 번호에는 지정한 범위에서 꺼내려는 값이 있는 열 번호를 넣습니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =INDEX(<span style={{ color: C.greenLight }}>F27:I32</span>, <span style={{ color: C.purpleLight }}>MATCH(</span><span style={{ color: C.amberLight }}>MAX(I27:I32)</span><span style={{ color: C.purpleLight }}>, I27:I32, 0)</span>, <span style={{ color: C.greenLight }}>1</span>) = <span style={{ color: C.greenLight }}>&quot;에어컨&quot;</span>
            </div>
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// VlookupLimitDiagram — VLOOKUP은 못 찾고 INDEX+MATCH는 찾는 사례
// ──────────────────────────────────────────────
export function VlookupLimitDiagram() {
  // [표6] 사원 정보 — F26:H30. 데이터 27~30. 부서(F)·이름(G)·사번(H).
  // 찾을 값(사번)이 첫 열이 아니고, 가져올 값(부서)이 그 왼쪽에 있어 VLOOKUP 불가.
  const emp = [
    ['부서', '이름', '사번'],       // 26행 머리글
    ['영업부', '김영호', 'A101'],   // 27
    ['인사부', '이수진', 'A102'],   // 28
    ['총무부', '박민수', 'A103'],   // 29 ← 찾는 사번
    ['개발부', '최지훈', 'A104'],   // 30
  ];
  // 표5(개념4)와 동일 형식: INDEX 범위=표 전체 F27:H30 초록 바깥 테두리
  // MATCH가 찾은 사번(A103, 29행)=주황 채우기 / INDEX 결과 부서(총무부, 29행)=초록 채우기
  const empSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    const s = {};
    // INDEX 범위(초록) — 표 전체 F27:H30 바깥 테두리
    if (ri === 1) s.bt = C.green;
    if (ri === 4) s.bb = C.green;
    if (ci === 0) s.bl = C.green;
    if (ci === 2) s.br = C.green;
    // MATCH가 찾은 사번(A103, 29행=데이터 3행) — 주황 채우기
    if (ri === 3 && ci === 2) { s.bg = 'rgba(251,146,60,0.45)'; s.bold = true; }
    // INDEX 결과 부서(총무부, 29행) — 초록 채우기
    if (ri === 3 && ci === 0) { s.bg = 'rgba(34,197,94,0.30)'; s.bold = true; }
    return s;
  };

  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 15.5, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>VLOOKUP은 못 찾고, INDEX+MATCH는 찾는다</Title>
      <Subtitle>찾을 값(사번)이 표의 첫 열이 아니고, 가져올 값(부서)이 그 왼쪽에 있는 경우</Subtitle>

      {/* 문제 박스 */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표6]에서 <b style={{ color: C.amberLight }}>사번[H27:H30]</b>이 <b style={{ color: C.amberLight }}>&quot;A103&quot;</b>인 사원의 <b style={{ color: C.greenLight }}>부서[F27:F30]</b>를 찾아 [J30] 셀에 표시하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, marginTop: 6 }}>▶ INDEX, MATCH 함수 사용</div>
      </div>

      <Row gap={18}>
        {/* Left: 사원 정보 표 */}
        <Fixed>
          <TableCaption color={C.blueLight}>[표6] 사원 정보</TableCaption>
          <ExcelGrid data={emp} startCol={5} startRow={26} cellStyle={empSt} minColW={66} firstColW={72} />
        </Fixed>

        {/* Right: VLOOKUP ❌ vs INDEX+MATCH ✅ */}
        <Fill min={360} max={560} gap={12}>
          {/* VLOOKUP ❌ */}
          <div style={{ ...boxBase, background: C.redDark, border: `2px solid ${C.red}` }}>
            <div style={nameSt(C.redLight)}>❌ VLOOKUP — 못 찾음</div>
            <div style={descSt}>VLOOKUP은 <b style={{ color: C.redLight }}>참조 범위의 첫 열</b>에서만 찾을 값을 찾고, 결과도 <b style={{ color: C.redLight }}>오른쪽 열</b>에서만 가져옵니다. 사번은 첫 열이 아니라 세 번째 열에 있어 첫 열(부서)에서 &quot;A103&quot;을 찾지 못하고, 부서는 사번의 왼쪽이라 애초에 가져올 수 없습니다.</div>
            <div style={{ borderTop: `1px solid ${C.red}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =VLOOKUP(<span style={{ color: C.amberLight }}>&quot;A103&quot;</span>, F27:H30, 1, 0) = <span style={{ color: C.redLight }}>#N/A</span>
            </div>
          </div>

          {/* INDEX+MATCH ✅ */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>✅ INDEX + MATCH — 찾음</div>
            <div style={descSt}>참조 범위를 표 전체(F27:H30)로 넣고, MATCH가 <b style={{ color: C.amberLight }}>&quot;A103&quot;</b>을 사번 범위에서 <b style={{ color: C.amberLight }}>세로로</b> 찾아 위치(3)를 구한 뒤, INDEX가 그 위치의 <b style={{ color: C.greenLight }}>부서(1열)</b>를 가져옵니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={{ ...formulaSt, fontSize: 14 }}>
              =INDEX(<span style={{ color: C.greenLight }}>F27:H30</span>, <span style={{ color: C.purpleLight }}>MATCH(</span><span style={{ color: C.amberLight }}>&quot;A103&quot;</span><span style={{ color: C.purpleLight }}>, H27:H30, 0)</span>, <span style={{ color: C.greenLight }}>1</span>) = <span style={{ color: C.greenLight }}>&quot;총무부&quot;</span>
            </div>
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

// ──────────────────────────────────────────────
// ChooseRankDiagram — RANK.EQ + CHOOSE 조합 (개념학습5, 실제 시험 형식)
// MAX→MATCH→INDEX 단계 박스(개념4)와 같은 형식으로, 순위→값 선택을 두 단계로 보여준다.
// ──────────────────────────────────────────────
export function ChooseRankDiagram() {
  // [표7] 학생 성적표 — F26:H31. 데이터 27~31. 이름(F)·성적(G)·비고(H).
  const prod = [
    ['이름', '성적', '비고'],   // 26행 머리글
    ['김하늘', 88, '우수'],     // 27 (2위)
    ['이준호', 95, '최우수'],   // 28 (1위)
    ['박서연', 72, '노력'],     // 29 (4위)
    ['정민수', 80, '보통'],     // 30 (3위)
    ['최유진', 65, '노력'],     // 31 (5위)
  ];
  // 표 안 테두리·채우기 없음. 비고 열(H27:H31) 값만 초록색 글자, 순위는 표 밖 라벨(보라)로 표시.
  const prodSt = (ri, ci) => {
    if (ri === 0) return { bold: true, color: C.blueLight, bg: C.blueCard };
    // 비고 열(H27:H31) 값 — 초록색 글자
    if (ci === 2) return { color: C.greenLight, bold: true };
    return {};
  };

  // 단계 박스 공통 (개념4와 동일)
  const boxBase = { borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 };
  const nameSt = (c) => ({ color: c, fontSize: 17, fontWeight: 700 });
  const synSt = (c) => ({ color: c, fontSize: 14, fontWeight: 700, opacity: 0.95 });
  const descSt = { color: C.text, fontSize: 14, lineHeight: 1.6 };
  const formulaSt = { color: C.text, fontSize: 16, fontWeight: 700, textAlign: 'center', padding: '2px 0' };

  return (
    <Wrap>
      <Title>RANK.EQ로 순위를 구하고, CHOOSE로 그 순위에 놓인 값을 선택합니다.</Title>

      {/* 문제 박스 (실기 기출 형식: [표7] 학생 성적표) */}
      <div style={{ background: C.bgDark, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ color: C.text, fontSize: 15.5, lineHeight: 1.8 }}>
          [표7]에서 <b style={{ color: C.amberLight }}>성적[G27:G31]</b>을 기준으로 순위를 구하여 1위는 &quot;최우수&quot;, 2위는 &quot;우수&quot;, 3위는 &quot;보통&quot;, 나머지는 &quot;노력&quot;으로 <b style={{ color: C.greenLight }}>비고[H27:H31]</b>에 표시하시오.
        </div>
        <div style={{ color: C.textMuted, fontSize: 14.5, lineHeight: 1.85, marginTop: 6 }}>
          <div>▶ 순위는 성적이 가장 높은 학생이 1위</div>
          <div>▶ CHOOSE, RANK.EQ 함수 사용</div>
        </div>
      </div>

      <Row gap={18}>
        {/* Left: 사원 판매 실적 표 */}
        <Fixed>
          <TableCaption color={C.blueLight}>[표7] 학생 성적표</TableCaption>
          <ExcelGrid data={prod} startCol={5} startRow={26} cellStyle={prodSt} minColW={72} firstColW={78}
            rowLabels={{
              1: { text: '← 2위', color: C.purpleLight },
              2: { text: '← 1위', color: C.purpleLight },
              3: { text: '← 4위', color: C.purpleLight },
              4: { text: '← 3위', color: C.purpleLight },
              5: { text: '← 5위', color: C.purpleLight },
            }} />
        </Fixed>

        {/* Right: 2단계 풀이 박스 (RANK.EQ → CHOOSE) */}
        <Fill min={460} max={720} gap={12}>
          {/* STEP 1 — RANK.EQ */}
          <div style={{ ...boxBase, background: C.purpleCard, border: `2px solid ${C.purple}` }}>
            <div style={nameSt(C.purpleLight)}>1단계 · RANK.EQ — 순위 구하기</div>
            <div style={synSt(C.purpleLight)}>구문: =RANK.EQ(값, 범위, [정렬])</div>
            <div style={descSt}>성적이 참조 범위에서 몇 위인지 순위를 반환합니다. 자동 채우기로 복사하므로 참조 범위는 $로 고정합니다.</div>
            <div style={{ borderTop: `1px solid ${C.purple}`, margin: '4px 0 2px' }} />
            <div style={formulaSt}>
              =RANK.EQ(G27, $G$27:$G$31, 0)
            </div>
          </div>

          {/* STEP 2 — CHOOSE */}
          <div style={{ ...boxBase, background: '#071a0b', border: `2px solid ${C.green}` }}>
            <div style={nameSt(C.greenLight)}>2단계 · CHOOSE — 순위로 값 선택</div>
            <div style={synSt(C.greenLight)}>구문: =CHOOSE(순번, 값1, 값2, 값3, ...)</div>
            <div style={descSt}>1단계에서 구한 순위를 숫자 자리에 넣으면, 순위가 1이면 값1, 2면 값2가 반환됩니다.<br />그래서 값1부터 &quot;최우수&quot;, &quot;우수&quot;, &quot;보통&quot;을 적으면 1~3위에 맞게 나오고, 4위부터는 모두 &quot;노력&quot;이 나오도록 나머지 값을 &quot;노력&quot;으로 채웁니다.</div>
            <div style={{ borderTop: `1px solid ${C.green}`, margin: '4px 0 2px' }} />
            <div style={{ ...formulaSt, fontSize: 13, whiteSpace: 'nowrap' }}>
              =CHOOSE(<span style={{ color: C.purpleLight }}>RANK.EQ(G27,$G$27:$G$31)</span>, &quot;최우수&quot;, &quot;우수&quot;, &quot;보통&quot;, &quot;노력&quot;, &quot;노력&quot;)
            </div>
          </div>
        </Fill>
      </Row>
    </Wrap>
  );
}

```

## 5. registry.js — lesson-4 / lesson-5 관련 등록 줄

```js
import { VlookupHlookupIntroDiagram, VlookupDiagram, HlookupTwoTableDiagram, VlookupApproxDiagram, VlookupOneTableDiagram, MatchIndexDiagram, ChooseDiagram, ChooseRankDiagram, IndexMatchDiagram, VlookupLimitDiagram } from './Lesson4.jsx';
import { DbSumDiagram, DbAverageDiagram, DbCountDiagram, DbMaxDiagram } from './Lesson5.jsx';
  '/diagram/lookup-common':            VlookupHlookupIntroDiagram,
  '/images/lookup-vlookup.svg':        VlookupDiagram,
  '/diagram/lookup-hlookup-2table':    HlookupTwoTableDiagram,
  '/diagram/lookup-vlookup-approx':    VlookupApproxDiagram,
  '/diagram/lookup-vlookup-1table':    VlookupOneTableDiagram,
  '/images/lookup-matchindex.svg':     MatchIndexDiagram,
  '/images/lookup-indexmatch.svg':     IndexMatchDiagram,
  '/images/lookup-vlookup-limit.svg':  VlookupLimitDiagram,
  '/images/lookup-choose.svg':         ChooseDiagram,
  '/diagram/lookup-choose-rank':       ChooseRankDiagram,
  '/images/db-dsum.svg':               DbSumDiagram,
  '/images/db-daverage.svg':           DbAverageDiagram,
  '/images/db-dcount.svg':             DbCountDiagram,
  '/images/db-dmax.svg':               DbMaxDiagram,
```

## 6. lesson-5.json 참조 이미지/SVG 경로 · 존재 여부 · SVG 텍스트

- /images/db-dsum.svg
    실제 파일(public/images/db-dsum.svg) 존재: false
    registry.js 등록: true
- /images/db-daverage.svg
    실제 파일(public/images/db-daverage.svg) 존재: false
    registry.js 등록: true
- /images/db-dcount.svg
    실제 파일(public/images/db-dcount.svg) 존재: false
    registry.js 등록: true
- /images/db-dmax.svg
    실제 파일(public/images/db-dmax.svg) 존재: false
    registry.js 등록: true

## 7. lesson-5 실습 정답 수식 엔진 계산 결과 vs JSON result

| 개념 | 셀 | 정답 수식 | 엔진 계산값 | JSON result | 비교 |
|------|----|-----------|-------------|-------------|------|
| 1 | G2 | `=DSUM(A1:D4,4,F1:F2)` | 13 | 13 | 일치 |
| 2 | H2 | `=DAVERAGE(A1:D4,3,F1:G2)` | 1900000 | 1900000 | 일치 |
| 3 | H2 | `=DCOUNT(A1:D4,3,F1:G3)` | 2 | 2 | 일치 |
| 4 | G2 | `=DMAX(A1:D4,3,F1:F2)` | 2026 | 2026 | 일치 |
