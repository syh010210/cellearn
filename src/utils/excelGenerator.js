import * as XLSX from "xlsx";

export function generateExcel(lesson) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    ["표 1 - 합계와 평균 계산 (상대 참조)"],
    ["이름","영어","수학","합계","평균"],
    ["김철수",85,90,"",""],
    ["이영희",72,68,"",""],
    ["박민준",95,88,"",""],
    ["정수연",60,75,"",""],
    [],["※ D3:D6에 합계 수식, E3:E6에 평균 수식 입력 후 자동 채우기"],
  ]);
  ws1["!cols"] = [{wch:10},{wch:8},{wch:8},{wch:8},{wch:8}];
  XLSX.utils.book_append_sheet(wb, ws1, "표1_상대참조");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["표 2 - 절대 참조 (비율 적용)"],
    ["이름","실기 점수","봉사 점수","최종 점수"],
    ["김철수",80,70,""],["이영희",90,60,""],
    ["박민준",75,85,""],["정수연",88,92,""],
    [],["실기 비율",0.6],["봉사 비율",0.4],
    [],["※ D3: 실기×$B$8 + 봉사×$B$9, 절대 참조로 고정 후 자동 채우기"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, "표2_절대참조비율");

  const ws3 = XLSX.utils.aoa_to_sheet([
    ["표 3 - 환율 변환 (절대 참조)"],
    ["환율 (원/달러)",1320],[],
    ["품목","달러 지출","원화 지출"],
    ["항공권",850,""],["숙박",420,""],
    ["식비",200,""],["쇼핑",350,""],
    [],["※ C5: 달러지출 × $B$2, 절대 참조로 고정 후 자동 채우기"],
  ]);
  XLSX.utils.book_append_sheet(wb, ws3, "표3_환율변환");

  XLSX.writeFile(wb, `컴활2급_${lesson.id}차시_${lesson.title}_실습.xlsx`);
}
