// scripts/roundtrip-gen.mjs
// 기본작업-2(셀 서식) 왕복 실험용 xlsx 생성기.
//
// 목적: "서식이 전혀 없는 밋밋한 표 + 지시문"을 만들어 사람이 실제 엑셀에서
//       서식(①~⑤)을 적용·저장하게 하고, roundtrip-dump.mjs 로 다시 읽어
//       어떤 서식이 식별되는지 확인한다. (채점 로직·UI는 만들지 않는다.)
//
// 실행:  node scripts/roundtrip-gen.mjs
// 출력:  trial_test/roundtrip/원본.xlsx  (폴더 없으면 생성)
//
// 규칙: 표는 값만. 서식(글꼴·테두리·채우기·정렬·표시형식·병합)은 일절 넣지 않는다.
//       입고일만 "날짜 셀 타입"으로 넣는다(날짜여야 사람이 ③ 사용자 지정 형식을 적용할 수 있으므로).
//       열 너비(wch)만 지정한다. 데이터는 기출이 아닌 새 값.

import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import XLSX from "xlsx-js-style";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "trial_test", "roundtrip");
const OUT_FILE = join(OUT_DIR, "원본.xlsx");

const HEADERS = ["제품코드", "제품명", "분류", "단가", "입고일", "수량", "판매액", "담당자"];

// [제품코드, 제품명, 분류, 단가(4~7자리 정수), 입고일(Date), 수량, 담당자]  — 판매액은 =단가*수량 수식
const DATA = [
  ["HG-2201", "스마트워치", "전자", 128000, new Date(2026, 6, 5), 42, "강수빈"],
  ["HG-3310", "무선이어폰", "전자", 89000, new Date(2026, 6, 8), 66, "이준호"],
  ["KT-1105", "텀블러", "주방", 15400, new Date(2026, 6, 12), 120, "박서연"],
  ["KT-1802", "원목도마", "주방", 23800, new Date(2026, 6, 15), 54, "김도현"],
  ["OF-4409", "문서세단기", "사무", 156000, new Date(2026, 6, 19), 18, "정민아"],
  ["OF-5507", "라벨프린터", "사무", 242000, new Date(2026, 6, 23), 9, "최우진"],
  ["SP-6621", "캠핑의자", "레저", 47500, new Date(2026, 6, 27), 75, "한지우"],
];

// 실제 시험 문장 형식의 지시문 (J1~J6에 한 줄씩). 서식 없음.
const INSTRUCTIONS = [
  "'기본작업-2' 시트에 대하여 다음의 지시사항을 처리하시오. (각 2점)",
  "① [A1:H1] 영역은 '선택 영역의 가운데로', 글꼴 'HY헤드라인M', 크기 '16', 글꼴 스타일 '굵게', 밑줄 '이중 실선', 행 높이 '30'으로 지정하시오.",
  "② [A3:H3] 영역은 셀 스타일 '강조색 4', 가로 '가운데 맞춤'을 지정하시오.",
  "③ [D4:D10] 영역은 사용자 지정 표시 형식을 이용하여 천 단위 구분 기호와 숫자 뒤에 '원'을 표시하시오. [표시 예 : 12300 → 12,300원, 0 → 0원] / [E4:E10] 영역은 사용자 지정 표시 형식을 이용하여 날짜를 [표시 예 : 2026-05-15 → 05월 15일(금)]과 같이 표시하시오.",
  "④ [B4:B10] 영역은 세로 '가운데 맞춤'을 지정하고 '제품명'으로 이름을 정의하시오. [F4] 셀에 '판매1위'라는 메모를 삽입한 후 '자동 크기'로 지정하고 항상 표시되도록 하시오.",
  "⑤ [A3:H10] 영역에 '모든 테두리(⊞)'를 적용한 후 '굵은 바깥쪽 테두리(⊡)'를 적용하고, [A3:H3] 영역은 '아래쪽 이중 테두리(⊟)'를 적용하여 표시하시오.",
];

function build() {
  // 값만 담은 aoa. (판매액 자리는 뒤에서 수식 셀로 덮어쓴다.)
  const aoa = [
    ["상공물산 3분기 제품 판매 현황"], // A1
    [],                                 // 2행 빈 행
    HEADERS,                            // A3:H3
    ...DATA.map((r) => {
      const [code, name, cat, price, date, qty, mgr] = r;
      return [code, name, cat, price, date, qty, "", mgr]; // 판매액 자리는 빈칸(뒤에서 수식)
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true });

  // 입고일(E4:E10): 날짜 셀 타입(t:'d')으로만 지정. z(numFmt)를 주입하지 않는다 —
  // 표시 형식은 사람이 ③에서 직접 적용한다. (t:'d'면 쓰기 시 기본 날짜값으로 저장된다.)
  for (let i = 0; i < DATA.length; i++) {
    const r = 4 + i; // 엑셀 행 번호
    const addr = `E${r}`;
    ws[addr] = { t: "d", v: DATA[i][4] };
  }

  // 판매액(G4:G10) = 단가(D) * 수량(F) 수식. 캐시 값도 함께 넣어 파일이 깔끔히 열리게.
  for (let i = 0; i < DATA.length; i++) {
    const r = 4 + i;
    const price = DATA[i][3];
    const qty = DATA[i][5];
    ws[`G${r}`] = { t: "n", f: `D${r}*F${r}`, v: price * qty };
  }

  // 지시문 J1~J6 (서식 없음)
  INSTRUCTIONS.forEach((line, i) => {
    ws[`J${i + 1}`] = { t: "s", v: line };
  });

  // 참조 범위를 A1:J10 로 확장 (지시문 J열 + 데이터 10행 포함)
  ws["!ref"] = "A1:J10";

  // 열 너비만 지정 (서식 아님). J열은 지시문이라 넓게.
  ws["!cols"] = [
    { wch: 10 }, // A 제품코드
    { wch: 12 }, // B 제품명
    { wch: 8 },  // C 분류
    { wch: 10 }, // D 단가
    { wch: 12 }, // E 입고일
    { wch: 7 },  // F 수량
    { wch: 12 }, // G 판매액
    { wch: 10 }, // H 담당자
    { wch: 3 },  // I 여백
    { wch: 80 }, // J 지시문
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "기본작업-2");
  return wb;
}

mkdirSync(OUT_DIR, { recursive: true });
const wb = build();
XLSX.writeFile(wb, OUT_FILE, { cellDates: true });
console.log("생성 완료:", OUT_FILE);
console.log("시트: 기본작업-2 · 표 A1:H10 (서식 없음) · 지시문 J1:J6");
console.log("다음: 엑셀에서 ①~⑤를 적용해 정답A.xlsx / 정답B.xlsx 로 저장한 뒤 roundtrip-dump.mjs 실행");
