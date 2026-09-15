// 기본작업-2 조립기용 데이터 세트 — 풀 기반(시드마다 새 표). 전부 새로 만든 가상 데이터.
//
// column params:
//  text   : { pool } (중복 없이 추출; 같은 pool 을 쓰는 다른 열과도 겹치지 않음) 또는 groupable { groups } 또는 { pool, repeatable:true }
//  code   : { prefixes, digits }   seq: (1부터)
//  money  : { min, max, unit }  |  rangeByGroup:{group:{min,max,unit}}  |  perNightByGroup:{group:rate}, times:"열"
//           |  scaleFrom:{ col, minPct, maxPct, unit }  (지정 열 × 60~130% 등, 열 간 비율 종속)
//  count  : { min, max, unit }  |  rangeByGroup:{group:{min,max}}  |  maxOfColumn:"열"(지정 열 값 이하) , unit 은 접미 형식(개·명·권…)
//  percentInt: { min, max }  |  derivedFrom:(row)=>값  (다른 열에서 계산)
//  date   : { from, to, weekdayOf? }
//  formula: { formula }  (항상 정수로 떨어지게 값 범위 구성)
//
// 열 간 종속 관계 (buildContext 가 생성 순서를 맞춰 지킴):
//  · maxOfColumn : show-ticket 예매수 ≤ 좌석수, course-enroll 수강인원 ≤ 정원
//  · rangeByGroup: member 포인트·방문/등급, staff 기본급/부서, car 일요금/등급, gym 이용료·출석일수/이용권
//  · scaleFrom   : branch-sales 매출액 = 목표액 × 60~130%
//  · derivedFrom : branch-sales 달성률 = round(매출액/목표액×100)
//  · perNight×열 : reserve 요금 = 1박 요금 × 숙박일수
//  · formula     : 판매액=단가×수량, 지급액=기본급×(1+상여율/100), 대여료=일요금×대여일수, 총점=국+영+수
//  (대기시간·중량·연체료·상여율·점수·진료비·배송비 등은 독립값이라 종속 제약 없음)

const NAMES = [
  "강수빈", "이준호", "박서연", "김도현", "정민아", "최우진", "한지우", "오세영", "윤도경", "배건우",
  "신유나", "박지훈", "문가은", "배준서", "한도윤", "서예린", "오하준", "김서아", "이도현", "정하율",
  "최민서", "윤지우", "장예준", "임수아", "권시윤", "조은우", "조현우", "김세라", "이건희", "박소윤",
  "정민규", "한지아", "오승현", "윤채린", "배도현", "신예서", "강준영", "문하윤", "류지완", "임서연",
  "강태오", "오하은", "박시현", "정유주", "한지원", "윤가람", "배서준", "신도아", "강민찬", "문예린",
  "홍서준", "남지호", "구예은", "표승우", "석다인", "제갈민", "선우아", "황보람", "탁준서", "방소율",
];
const PRODUCTS = ["노트북", "태블릿", "스마트워치", "무선이어폰", "블루투스스피커", "모니터", "키보드", "마우스", "웹캠", "공유기", "원목도마", "텀블러", "프라이팬", "전기포트", "커피머신", "문서세단기", "라벨프린터", "복사용지", "데스크램프", "파일정리함", "캠핑의자", "텐트", "랜턴", "코펠", "등산스틱", "요가매트"];
const BOOKS = ["별빛 아래에서", "긴 겨울의 끝", "파도의 기억", "도시의 밤", "용사 일지", "학원 스토리", "판타지아", "개그 대작전", "요리의 정석", "코딩 첫걸음", "마음의 지도", "바다의 노래", "숲의 비밀", "시간 여행자", "작은 습관", "하루 명상", "그림의 기초", "사진 잘 찍는 법", "정원 가꾸기", "세계 여행기", "별자리 안내", "느린 산책"];
const COURSES = ["기초 회화", "엑셀 실무", "전문가 과정", "드로잉 입문", "비즈니스 영어", "데이터 분석", "요가 클래스", "사진 기초", "제빵 실습", "코딩 캠프", "보컬 트레이닝", "캘리그라피", "커피 바리스타", "손뜨개 입문", "우쿨렐레", "수채화 교실", "중국어 회화", "글쓰기 교실", "재테크 기초", "홈트레이닝", "플라워 아트", "목공 DIY"];
const CARS = ["아반떼", "소나타", "그랜저", "케이오", "스포티지", "쏘렌토", "투싼", "싼타페", "카니발", "모닝", "레이", "셀토스", "코나", "티볼리", "팰리세이드", "엑스투", "지에스", "아이오닉", "니로", "캐스퍼", "베뉴", "무쏘"];
const PLAYS = ["봄날의 왈츠", "별 헤는 밤", "라스트 댄스", "청춘 예찬", "겨울 나그네", "도시의 불빛", "초원의 노래", "미드나잇 재즈", "은하수 여행", "첫사랑", "파랑새", "달빛 소나타", "검은 고양이", "붉은 노을", "하얀 겨울", "여름 이야기", "가을 편지", "바다의 왕자", "숲속 음악회", "꿈꾸는 다락방", "시간의 문", "마지막 인사"];
const BRANCHES = ["강남지점", "홍대지점", "잠실지점", "판교지점", "부산지점", "대구지점", "광주지점", "대전지점", "인천지점", "수원지점", "일산지점", "청주지점"];

export const DATASETS = [
  {
    id: "sales-quarter",
    groupName: "판매정보",
    titlePool: { org: ["상공물산", "한빛유통", "대양상사", "가람트레이딩", "동방물산", "세종상회", "미래유통", "한결상사"], tail: ["3분기 제품 판매 현황", "상반기 판매 실적 현황", "2분기 제품 매출 현황", "하반기 판매 집계 현황", "4분기 제품 판매 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "제품코드", type: "code", prefixes: ["HG", "KT", "OF", "SP", "DA"], digits: 4 },
      { key: "제품명", type: "text", pool: PRODUCTS, nameable: true },
      { key: "분류", type: "text", groupable: true, groups: ["전자", "주방", "사무", "레저", "생활"] },
      { key: "단가", type: "money", min: 8000, max: 2500000, unit: 100 },
      { key: "입고일", type: "date", from: "2026-03-01", to: "2026-06-30", baseFormat: "yyyy-mm-dd" },
      { key: "수량", type: "count", min: 0, max: 200, unit: "개" },
      { key: "판매액", type: "formula", formula: "=D{r}*F{r}" },
      { key: "담당자", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
      { key: "할인율", type: "percentInt", min: 0, max: 30 },
    ],
    colWidths: [10, 12, 8, 12, 14, 8, 12, 10, 8],
  },
  {
    id: "member-grade",
    groupName: "회원정보",
    titlePool: { org: ["그린라이프", "블루멤버스", "한사랑클럽", "별빛클럽", "우리동네", "해피포인트"], tail: ["멤버십 회원 관리 현황", "회원 등급 현황", "멤버십 포인트 현황", "회원 관리 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "회원코드", type: "code", prefixes: ["M"], digits: 4 },
      { key: "회원명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "등급", type: "text", groupable: true, groups: ["VIP", "골드", "실버"] },
      { key: "가입일", type: "date", from: "2026-01-01", to: "2026-03-31", baseFormat: "yyyy-mm-dd" },
      { key: "포인트", type: "money", rangeByGroup: { VIP: { min: 900000, max: 1500000, unit: 1000 }, 골드: { min: 400000, max: 800000, unit: 1000 }, 실버: { min: 50000, max: 150000, unit: 1000 } } },
      { key: "방문횟수", type: "count", unit: "회", rangeByGroup: { VIP: { min: 25, max: 60 }, 골드: { min: 10, max: 30 }, 실버: { min: 0, max: 15 } } },
      { key: "담당자", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
      { key: "할인율", type: "percentInt", min: 0, max: 30 },
    ],
    colWidths: [10, 12, 8, 14, 12, 10, 10, 8],
  },
  {
    id: "book-instock",
    groupName: "도서정보",
    titlePool: { org: ["달빛서림", "한울출판", "책마루", "지식나무", "동네책방", "글벗서점"], tail: ["상반기 도서 입고 현황", "신간 입고 현황", "도서 재고 현황", "분기 입고 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "도서코드", type: "seq" },
      { key: "도서명", type: "text", pool: BOOKS, nameable: true },
      { key: "분야", type: "text", groupable: true, groups: ["소설", "만화", "실용", "시집", "에세이"] },
      { key: "저자", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
      { key: "정가", type: "money", min: 7800, max: 48000, unit: 100 },
      { key: "입고일", type: "date", from: "2026-05-01", to: "2026-07-31", baseFormat: 'm"월" d"일"' },
      { key: "입고량", type: "count", min: 0, max: 600, unit: "권" },
    ],
    colWidths: [8, 16, 8, 10, 12, 14, 8],
  },
  {
    id: "reserve-room",
    groupName: "예약정보",
    titlePool: { org: ["호수뷰 리조트", "바다마루 호텔", "숲속휴양림", "강변호텔", "별밤펜션", "산들리조트"], tail: ["여름 예약 현황", "성수기 예약 현황", "주말 예약 현황", "예약 접수 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "예약번호", type: "seq" },
      { key: "고객명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "객실", type: "text", groupable: true, groups: ["스탠다드", "디럭스", "스위트"] },
      { key: "예약일", type: "date", from: "2026-07-01", to: "2026-08-31", baseFormat: 'm"월" d"일"' },
      { key: "숙박일수", type: "count", min: 1, max: 6, unit: "박" },
      { key: "요금", type: "money", perNightByGroup: { 스탠다드: 90000, 디럭스: 180000, 스위트: 400000 }, times: "숙박일수" },
      { key: "결제", type: "text", pool: ["카드", "현금", "계좌이체"], repeatable: true },
    ],
    colWidths: [8, 10, 10, 14, 10, 12, 8],
  },
  {
    id: "staff-salary",
    groupName: "급여정보",
    titlePool: { org: ["한빛테크", "미래산업", "대성전자", "세움기업", "도담물산", "가온소프트"], tail: ["상반기 사원 급여 현황", "급여 지급 현황", "부서별 급여 현황", "월 급여 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "사번", type: "code", prefixes: ["E"], digits: 4 },
      { key: "성명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "부서", type: "text", groupable: true, groups: ["영업부", "관리부", "개발부"] },
      { key: "기본급", type: "money", rangeByGroup: { 개발부: { min: 3600000, max: 4800000, unit: 10000 }, 영업부: { min: 2600000, max: 3600000, unit: 10000 }, 관리부: { min: 2700000, max: 3400000, unit: 10000 } } },
      { key: "상여율", type: "percentInt", min: 0, max: 30 },
      { key: "지급액", type: "formula", formula: "=D{r}*(1+E{r}/100)" },
    ],
    colWidths: [10, 10, 8, 12, 8, 12],
  },
  {
    id: "course-enroll",
    groupName: "강좌정보",
    titlePool: { org: ["새봄문화센터", "한강문화원", "동그라미평생학습관", "달빛배움터", "푸른교육원", "이룸아카데미"], tail: ["가을학기 강좌 수강 현황", "봄학기 강좌 개설 현황", "여름 특강 수강 현황", "분기 강좌 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "강좌코드", type: "code", prefixes: ["C"], digits: 3 },
      { key: "강좌명", type: "text", pool: COURSES, nameable: true },
      { key: "요일", type: "text", groupable: true, groups: ["월요일", "수요일", "금요일", "화요일", "목요일"] },
      { key: "개강일", type: "date", from: "2026-09-01", to: "2026-11-30", baseFormat: "yyyy-mm-dd", weekdayOf: "요일" },
      { key: "수강료", type: "money", min: 90000, max: 1500000, unit: 1000 },
      { key: "정원", type: "count", min: 8, max: 30, unit: "명" },
      { key: "수강인원", type: "count", min: 0, unit: "명", maxOfColumn: "정원" },
      { key: "담당강사", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
      { key: "출석률", type: "percentInt", min: 60, max: 100 },
    ],
    colWidths: [10, 14, 8, 14, 12, 8, 10, 10, 8],
  },

  // ── 추가 8세트 ──
  {
    id: "car-rental",
    groupName: "대여정보",
    titlePool: { org: ["가온렌트카", "달리자렌트", "스마일카", "한빛렌트", "제로카", "오케이렌트"], tail: ["차량 대여 현황", "렌트 예약 현황", "월 대여 실적 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "대여번호", type: "seq" },
      { key: "차량번호", type: "code", prefixes: ["소", "중", "대", "가", "나"], digits: 4 },
      { key: "차종", type: "text", pool: CARS, nameable: true },
      { key: "등급", type: "text", groupable: true, groups: ["소형", "중형", "대형"] },
      { key: "대여일", type: "date", from: "2026-06-01", to: "2026-08-31", baseFormat: "yyyy-mm-dd" },
      { key: "대여일수", type: "count", min: 1, max: 10, unit: "일" },
      { key: "일요금", type: "money", rangeByGroup: { 소형: { min: 40000, max: 70000, unit: 1000 }, 중형: { min: 70000, max: 110000, unit: 1000 }, 대형: { min: 110000, max: 180000, unit: 1000 } } },
      { key: "대여료", type: "formula", formula: "=G{r}*F{r}" },
      { key: "담당자", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
    ],
    colWidths: [8, 10, 10, 8, 14, 10, 12, 12, 10],
  },
  {
    id: "hospital-visit",
    groupName: "진료정보",
    titlePool: { org: ["연세늘봄의원", "새봄병원", "한마음의원", "우리가정의학과", "밝은미소병원", "튼튼정형외과"], tail: ["일일 진료 현황", "외래 진료 현황", "진료 접수 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "환자번호", type: "seq" },
      { key: "환자명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "진료과", type: "text", groupable: true, groups: ["내과", "외과", "정형외과", "소아과", "피부과"] },
      { key: "진료일", type: "date", from: "2026-09-01", to: "2026-09-30", baseFormat: 'm"월" d"일"' },
      { key: "진료비", type: "money", min: 12000, max: 350000, unit: 100 },
      { key: "대기시간", type: "count", min: 0, max: 90, unit: "분" },
      { key: "만족도", type: "decimal", min: 3.5, max: 5.0, decimals: 1, unit: "점" },
      { key: "담당의", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
    ],
    colWidths: [8, 10, 10, 14, 12, 10, 8, 10],
  },
  {
    id: "book-loan",
    groupName: "대출정보",
    titlePool: { org: ["시립도서관", "구름도서관", "햇살작은도서관", "별빛도서관", "숲속도서관", "나무그늘문고"], tail: ["도서 대출 현황", "주간 대출 현황", "대출 관리 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "대출번호", type: "seq" },
      { key: "도서명", type: "text", pool: BOOKS, nameable: true },
      { key: "대출자", type: "text", pool: NAMES, textSuffix: ["님"] },
      { key: "대출일", type: "date", from: "2026-08-01", to: "2026-09-15", baseFormat: "yyyy-mm-dd" },
      { key: "대출일수", type: "count", min: 1, max: 21, unit: "일" },
      { key: "연체료", type: "money", min: 0, max: 12000, unit: 100 },
      { key: "상태", type: "text", pool: ["대출중", "반납완료", "연체"], repeatable: true },
    ],
    colWidths: [8, 16, 10, 14, 10, 10, 8],
  },
  {
    id: "show-ticket",
    groupName: "공연정보",
    titlePool: { org: ["아름아트홀", "한빛극장", "달빛공연장", "노을아트센터", "푸른소극장", "별마루홀"], tail: ["공연 예매 현황", "티켓 판매 현황", "이번 달 공연 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "공연코드", type: "code", prefixes: ["MU", "PL", "CO", "CL"], digits: 3 },
      { key: "공연명", type: "text", pool: PLAYS, nameable: true },
      { key: "장르", type: "text", groupable: true, groups: ["뮤지컬", "연극", "콘서트", "클래식"] },
      { key: "공연일", type: "date", from: "2026-10-01", to: "2026-12-20", baseFormat: "yyyy-mm-dd" },
      { key: "좌석수", type: "count", min: 100, max: 900, unit: "석" },
      { key: "예매수", type: "count", min: 0, unit: "매", maxOfColumn: "좌석수" },
      { key: "티켓가", type: "money", min: 20000, max: 180000, unit: 1000 },
      { key: "담당자", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
      { key: "예매율", type: "percentInt", min: 50, max: 100 },
    ],
    colWidths: [10, 14, 8, 14, 8, 8, 10, 10, 8],
  },
  {
    id: "branch-sales",
    groupName: "매출정보",
    titlePool: { org: ["누리마트", "행복유통", "한빛마트", "green마켓", "샛별상사", "온누리유통"], tail: ["지점 매출 현황", "분기 매출 실적", "지점별 실적 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "지점코드", type: "code", prefixes: ["B"], digits: 3 },
      { key: "지점명", type: "text", pool: BRANCHES, nameable: true },
      { key: "지역", type: "text", groupable: true, groups: ["서울", "경기", "영남", "호남", "충청"] },
      { key: "매출액", type: "money", scaleFrom: { col: "목표액", minPct: 60, maxPct: 130, unit: 100000 } },
      { key: "목표액", type: "money", min: 20000000, max: 90000000, unit: 100000 },
      { key: "달성률", type: "percentInt", derivedFrom: (row) => Math.round((row["매출액"] / row["목표액"]) * 100) },
      { key: "점장", type: "text", pool: NAMES, textSuffix: ["님"] },
    ],
    colWidths: [8, 12, 8, 14, 14, 10, 10],
  },
  {
    id: "student-score",
    groupName: "성적정보",
    titlePool: { org: ["새싹중학교", "푸른중학교", "한빛고등학교", "밝은미래학원", "으뜸교습소", "청람학원"], tail: ["중간고사 성적 현황", "기말고사 성적 현황", "모의고사 성적 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "학번", type: "code", prefixes: ["S"], digits: 4 },
      { key: "성명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "반", type: "text", groupable: true, groups: ["1반", "2반", "3반", "4반"] },
      { key: "국어", type: "count", min: 40, max: 100, unit: "점" },
      { key: "영어", type: "count", min: 40, max: 100, unit: "점" },
      { key: "수학", type: "count", min: 40, max: 100, unit: "점" },
      { key: "총점", type: "formula", formula: "=D{r}+E{r}+F{r}" },
      { key: "등급구간", type: "text", repeatable: true, atPercent: true, pool: ["90~100", "80~89", "70~79", "60~69"] },
    ],
    colWidths: [10, 10, 8, 8, 8, 8, 10, 10],
  },
  {
    id: "delivery-status",
    groupName: "배송정보",
    titlePool: { org: ["빠른택배", "한결로지스", "가온택배", "달림배송", "믿음택배", "샛별로지스"], tail: ["배송 현황", "당일 배송 현황", "택배 접수 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "송장번호", type: "seq" },
      { key: "수취인", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "지역", type: "text", groupable: true, groups: ["서울", "경기", "영남", "호남", "충청"] },
      { key: "우편번호", type: "digits", digits: 5 },
      { key: "발송일", type: "date", from: "2026-09-01", to: "2026-09-20", baseFormat: 'm"월" d"일"' },
      { key: "중량", type: "count", min: 1, max: 30, unit: "kg" },
      { key: "배송비", type: "money", min: 3000, max: 45000, unit: 100 },
      { key: "배송상태", type: "text", pool: ["접수", "배송중", "배송완료"], repeatable: true },
    ],
    colWidths: [8, 10, 8, 10, 14, 8, 10, 10],
  },
  {
    id: "gym-member",
    groupName: "회원정보",
    titlePool: { org: ["튼튼짐", "한빛휘트니스", "코어짐", "바른체육관", "으뜸헬스", "굿바디짐"], tail: ["회원 등록 현황", "이용 회원 현황", "월 등록 현황"] },
    rowCount: [6, 10],
    columns: [
      { key: "등록번호", type: "seq" },
      { key: "회원번호", type: "code", prefixes: ["G"], digits: 4 },
      { key: "회원명", type: "text", pool: NAMES, nameable: true, textSuffix: ["님"] },
      { key: "이용권", type: "text", groupable: true, groups: ["1개월", "3개월", "6개월"] },
      { key: "등록일", type: "date", from: "2026-07-01", to: "2026-09-15", baseFormat: "yyyy-mm-dd" },
      { key: "이용료", type: "money", rangeByGroup: { "1개월": { min: 60000, max: 90000, unit: 1000 }, "3개월": { min: 160000, max: 240000, unit: 1000 }, "6개월": { min: 300000, max: 450000, unit: 1000 } } },
      { key: "출석일수", type: "count", unit: "일", rangeByGroup: { "1개월": { min: 0, max: 30 }, "3개월": { min: 0, max: 90 }, "6개월": { min: 0, max: 180 } } },
      { key: "평점", type: "decimal", min: 3.5, max: 5.0, decimals: 1, unit: "점" },
      { key: "담당트레이너", type: "text", pool: NAMES, textSuffix: ["점장", "선생님", "담당"] },
    ],
    colWidths: [8, 10, 10, 8, 14, 12, 10, 8, 12],
  },
];
