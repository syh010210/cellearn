export const LESSONS = [
  {
    id: 1,
    title: "상대 참조와 절대 참조",
    concepts: [
      {
        heading: "엑셀 기본 구조",
        content: "엑셀은 열(A, B, C…), 행(1, 2, 3…), 셀(열+행 교차점)로 구성됩니다.\n셀 주소는 열+행 순서로 표현합니다. 예) A1, B3, C9",
        practice: {
          instruction: "C1 셀에 A1과 B1을 더하는 수식을 입력해보세요.",
          cols: ["A","B","C"],
          rows: [
            [{val:"10",editable:false},{val:"20",editable:false},{val:"",editable:true,answer:"=A1+B1",result:30}],
          ],
        },
      },
      {
        heading: "상대 참조의 원리",
        content: "수식을 자동 채우기하면 참조 셀이 방향에 따라 자동으로 이동합니다.\n예) =B3+C3 을 아래로 복사 → =B4+C4, =B5+C5…",
        practice: {
          instruction: "D2, D3 셀에 각 행의 영어+수학 합계 수식을 입력하세요.",
          cols: ["A","B","C","D"],
          rows: [
            [{val:"이름",editable:false},{val:"영어",editable:false},{val:"수학",editable:false},{val:"합계",editable:false}],
            [{val:"김철수",editable:false},{val:"85",editable:false},{val:"90",editable:false},{val:"",editable:true,answer:"=B2+C2",result:175}],
            [{val:"이영희",editable:false},{val:"72",editable:false},{val:"68",editable:false},{val:"",editable:true,answer:"=B3+C3",result:140}],
          ],
        },
      },
      {
        heading: "절대 참조의 필요성 및 사용법",
        content: "특정 셀을 고정할 때 F4 키로 $ 표시를 붙입니다.\n예) C9 → $C$9\n어느 방향으로 복사해도 항상 같은 셀을 참조합니다.",
        practice: {
          instruction: "D2 셀에 실기×$B$5 + 봉사×$C$5 수식을 입력하세요.",
          cols: ["A","B","C","D"],
          rows: [
            [{val:"이름",editable:false},{val:"실기",editable:false},{val:"봉사",editable:false},{val:"점수",editable:false}],
            [{val:"김철수",editable:false},{val:"80",editable:false},{val:"70",editable:false},{val:"",editable:true,answer:"=B2*$B$5+C2*$C$5",result:76}],
            [{val:"",editable:false},{val:"",editable:false},{val:"",editable:false},{val:"",editable:false}],
            [{val:"",editable:false},{val:"",editable:false},{val:"",editable:false},{val:"",editable:false}],
            [{val:"비율",editable:false},{val:"0.6",editable:false},{val:"0.4",editable:false},{val:"",editable:false}],
          ],
        },
      },
      {
        heading: "혼합 참조",
        content: "F4 키를 반복하면 고정 방식이 바뀝니다.\n• 1회: $C$9 (행+열 모두 고정)\n• 2회: C$9 (행만 고정)\n• 3회: $C9 (열만 고정)\n• 4회: C9 (해제)",
        practice: {
          instruction: "B2 셀에 구구단 혼합 참조 수식 =$A2*B$1 을 입력하세요.",
          cols: ["A","B","C"],
          rows: [
            [{val:"",editable:false},{val:"2",editable:false},{val:"3",editable:false}],
            [{val:"2",editable:false},{val:"",editable:true,answer:"=$A2*B$1",result:4},{val:"",editable:false}],
            [{val:"3",editable:false},{val:"",editable:false},{val:"",editable:false}],
          ],
        },
      },
    ],
    quiz: [
      {id:1,question:"엑셀에서 셀 주소 'C5'가 의미하는 것은?",options:["C행 5열","C열 5행","5번째 시트의 C셀","C번째 열 5번째 시트"],answer:1,explanation:"셀 주소는 '열+행' 순서입니다. C5는 C열 5행을 의미합니다."},
      {id:2,question:"수식 =B3+C3을 아래로 자동 채우기 하면 바로 아래 셀의 수식은?",options:["=B3+C3","=B4+C3","=B4+C4","=B3+C4"],answer:2,explanation:"상대 참조는 복사 방향에 따라 행 번호가 자동 증가합니다."},
      {id:3,question:"절대 참조를 설정하는 단축키는?",options:["F2","F3","F4","F5"],answer:2,explanation:"F4 키를 누르면 $C$9와 같이 절대 참조로 변환됩니다."},
      {id:4,question:"셀 주소 $C$9가 의미하는 것은?",options:["C열만 고정","9행만 고정","C열과 9행 모두 고정","고정 없음"],answer:2,explanation:"$C$9는 C열과 9행이 모두 고정된 절대 참조입니다."},
      {id:5,question:"아래로 자동 채우기 시 특정 셀을 고정하려면?",options:["상대 참조","절대 참조 또는 행 고정 혼합 참조","열 고정 혼합 참조만","참조 없이 직접 입력"],answer:1,explanation:"아래로 복사할 때 행이 바뀌지 않게 하려면 절대 참조나 행 고정 혼합 참조를 씁니다."},
      {id:6,question:"F4 키를 2번 눌렀을 때 C9는 어떻게 변하는가?",options:["$C$9","C$9","$C9","C9"],answer:1,explanation:"F4 1회: $C$9 / 2회: C$9(행 고정) / 3회: $C9(열 고정) / 4회: C9(해제)"},
      {id:7,question:"오른쪽으로 자동 채우기 시 행이 바뀌지 않게 하려면?",options:["$C9","C$9","$C$9","상대 참조"],answer:1,explanation:"오른쪽 복사는 열이 증가합니다. 행을 고정하려면 C$9처럼 행에 $를 붙입니다."},
      {id:8,question:"60%가 입력된 C9를 아래로 복사할 때 고정하려면?",options:["C9","$C9","C$9","$C$9"],answer:3,explanation:"아래로 복사 시 C9가 바뀌지 않아야 하므로 절대 참조 $C$9를 사용합니다."},
      {id:9,question:"구구단 표를 한 번의 자동 채우기로 완성하려면?",options:["상대 참조","절대 참조","혼합 참조","참조 불필요"],answer:2,explanation:"구구단은 행/열이 각각 고정되어야 하므로 혼합 참조가 필요합니다."},
      {id:10,question:"수식 =$B3*C$2를 오른쪽 아래로 복사하면?",options:["=$B3*C$2","=$B4*D$2","=$B3*D$2","=$B4*C$2"],answer:1,explanation:"$B3은 B열 고정(행 변화), C$2는 2행 고정(열 변화)이므로 =$B4*D$2가 됩니다."},
    ],
    practiceAnswers: [
      {sheet:"표1_상대참조",cell:"D3",formula:"=B3+C3"},
      {sheet:"표1_상대참조",cell:"D4",formula:"=B4+C4"},
      {sheet:"표1_상대참조",cell:"E3",formula:"=(B3+C3)/2"},
      {sheet:"표2_절대참조비율",cell:"D3",formula:"=B3*$B$8+C3*$B$9"},
      {sheet:"표3_환율변환",cell:"C5",formula:"=B5*$B$2"},
    ],
  },
];
