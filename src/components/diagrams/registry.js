import { ExcelBasicDiagram, RelativeDownDiagram, RelativeRightDiagram, AbsoluteRefDiagram, MixedRefDiagram } from './Lesson1.jsx';
import { StringExtractDiagram, StringLenCaseDiagram, StringFindTrimDiagram, StringCombineDiagram } from './Lesson2.jsx';
import { StatBasicDiagram, StatRankDiagram, StatLargeSmallDiagram, StatCountDiagram, StatCondCountDiagram } from './Lesson3.jsx';
import { VlookupDiagram, HlookupTwoTableDiagram, VlookupOneTableDiagram, MatchIndexDiagram, ChooseDiagram, IndexMatchDiagram } from './Lesson4.jsx';
import { DbSumDiagram, DbAverageDiagram, DbCountDiagram, DbMaxDiagram } from './Lesson5.jsx';
import { MathBasicDiagram, MathRoundDiagram, SumifDiagram, SumifsDiagram } from './Lesson6.jsx';
import { DatetimeBasicDiagram, DatetimeComposeDiagram, WeekdayDiagram, WorkdayDiagram } from './Lesson7.jsx';
import { IfDiagram, IfAndDiagram, IfOrDiagram, NestedIfDiagram, IfErrorDiagram } from './Lesson8.jsx';
import { PasteSpecialAnim, NumberFormatDiagram, CellAnatomyDiagram, ProductCodeDiagram, NameBoxDiagram, DateCodeDiagram, CellCommentDiagram, MergeCenterDiagram, AlignGridDiagram, BordersDiagram } from './Lesson9.jsx';
import { RelativeFillDownAnim, RelativeFillRightAnim, AbsoluteFillDownAnim, FillHandleCursorAnim, ExcelCursorsAnim } from './RelativeFillAnim.jsx';
import { AutoFilterAnim, CustomFilterMenu, CustomAutoFilterDialog, AndOrConditionDiagram, CompoundConditionDiagram, ComparisonOperatorDiagram, AdvancedFilterDialog, FilterMistakesDiagram } from './Lesson10.jsx';
import { CondFormatFormulaAnim, CondFormatStepsAnim, CondFormatPracticeAnim } from './Lesson11.jsx';
import { SortStepsAnim, SortLeftRightDiagram, SortBasicStepsAnim, SortFilterRibbon } from './Lesson12.jsx';
import { SubtotalFlowAnim, SubtotalDialogDiagram, SubtotalExamProblem } from './Lesson13.jsx';
import { PivotBuildAnim, PivotIntroProblem, PivotAreaMap, PivotStepsDiagram, PivotExamProblem } from './Lesson14.jsx';
import { DataTableTwoVarAnim, DataTablePlacementDiagram, DataTableExamProblem } from './Lesson15.jsx';
import { ScenarioFlowAnim, WhatIfCompareDiagram, ScenarioExamProblem } from './Lesson16.jsx';
import { ConsolidateAnim, ConsolidateWildcardDiagram, ConsolidateExamProblem } from './Lesson17.jsx';
import { GoalSeekAnim, GoalSeekElementsDiagram, GoalSeekExamProblem } from './Lesson18.jsx';
import { MacroRecordAnim, MacroConnectDiagram, MacroExamProblem } from './Lesson19.jsx';
import { ChartAnatomyDiagram, ChartDataRangeDiagram, ChartExamProblem } from './Lesson20.jsx';

export const DIAGRAM_REGISTRY = {
  // 자동 채우기 애니메이션 (개념 학습용)
  '/anim/paste-special':               PasteSpecialAnim,
  '/diagram/number-format':            NumberFormatDiagram,
  '/diagram/cell-anatomy':             CellAnatomyDiagram,
  '/diagram/product-code':             ProductCodeDiagram,
  '/diagram/name-box':                 NameBoxDiagram,
  '/diagram/date-code':                DateCodeDiagram,
  '/diagram/cell-comment':             CellCommentDiagram,
  '/diagram/merge-center':             MergeCenterDiagram,
  '/diagram/align-grid':               AlignGridDiagram,
  '/diagram/borders':                  BordersDiagram,
  '/anim/excel-cursors':               ExcelCursorsAnim,
  '/anim/fill-handle-cursor':          FillHandleCursorAnim,
  '/anim/relative-fill-down':          RelativeFillDownAnim,
  '/anim/relative-fill-right':         RelativeFillRightAnim,
  '/anim/absolute-fill-down':          AbsoluteFillDownAnim,

  // 10차시 — 필터
  '/anim/auto-filter':                 AutoFilterAnim,
  '/diagram/custom-filter-menu':       CustomFilterMenu,
  '/diagram/custom-filter-dialog':     CustomAutoFilterDialog,
  '/diagram/filter-andor':             AndOrConditionDiagram,
  '/diagram/filter-compound':          CompoundConditionDiagram,
  '/diagram/filter-comparison':        ComparisonOperatorDiagram,
  '/diagram/advanced-filter-dialog':   AdvancedFilterDialog,
  '/diagram/filter-mistakes':          FilterMistakesDiagram,

  // 11차시 — 조건부 서식
  '/anim/cond-format-steps':           CondFormatStepsAnim,
  '/anim/cond-format-formula':         CondFormatFormulaAnim,
  '/anim/cond-format-practice':        CondFormatPracticeAnim,

  // 12차시 — 정렬
  '/anim/sort-basic-steps':            SortBasicStepsAnim,
  '/diagram/sort-filter-ribbon':       SortFilterRibbon,
  '/anim/sort-steps':                  SortStepsAnim,
  '/diagram/sort-left-right':          SortLeftRightDiagram,

  // 13차시 — 부분합
  '/anim/subtotal-flow':               SubtotalFlowAnim,
  '/diagram/subtotal-dialog':          SubtotalDialogDiagram,
  '/problem/subtotal':                 SubtotalExamProblem,

  // 14차시 — 피벗 테이블
  '/anim/pivot-build':                 PivotBuildAnim,
  '/problem/pivot-intro':              PivotIntroProblem,
  '/diagram/pivot-area-map':           PivotAreaMap,
  '/diagram/pivot-steps':              PivotStepsDiagram,
  '/problem/pivot':                    PivotExamProblem,

  // 15차시 — 데이터 표
  '/anim/datatable-2var':              DataTableTwoVarAnim,
  '/diagram/datatable-placement':      DataTablePlacementDiagram,
  '/problem/datatable':                DataTableExamProblem,

  // 16차시 — 시나리오 관리자
  '/anim/scenario-flow':               ScenarioFlowAnim,
  '/diagram/whatif-compare':           WhatIfCompareDiagram,
  '/problem/scenario':                 ScenarioExamProblem,

  // 17차시 — 데이터 통합
  '/anim/consolidate':                 ConsolidateAnim,
  '/diagram/consolidate-wildcard':     ConsolidateWildcardDiagram,
  '/problem/consolidate':              ConsolidateExamProblem,

  // 18차시 — 목표값 찾기
  '/anim/goalseek':                    GoalSeekAnim,
  '/diagram/goalseek-elements':        GoalSeekElementsDiagram,
  '/problem/goalseek':                 GoalSeekExamProblem,

  // 19차시 — 매크로
  '/anim/macro-record':                MacroRecordAnim,
  '/diagram/macro-connect':            MacroConnectDiagram,
  '/problem/macro':                    MacroExamProblem,

  // 20차시 — 차트
  '/diagram/chart-anatomy':            ChartAnatomyDiagram,
  '/diagram/chart-datarange':          ChartDataRangeDiagram,
  '/problem/chart':                    ChartExamProblem,

  '/images/excel-basic.svg':           ExcelBasicDiagram,
  '/images/relative-down.svg':         RelativeDownDiagram,
  '/images/relative-right.svg':        RelativeRightDiagram,
  '/images/absolute-ref.svg':          AbsoluteRefDiagram,
  '/images/mixed-ref.svg':             MixedRefDiagram,

  '/images/string-extract.svg':        StringExtractDiagram,
  '/images/string-len-case.svg':       StringLenCaseDiagram,
  '/images/string-find-trim.svg':      StringFindTrimDiagram,
  '/images/string-combine.svg':        StringCombineDiagram,

  '/images/stat-basic.svg':            StatBasicDiagram,
  '/images/stat-rank.svg':             StatRankDiagram,
  '/images/stat-largesmall.svg':       StatLargeSmallDiagram,
  '/images/stat-count.svg':            StatCountDiagram,
  '/images/stat-condcount.svg':        StatCondCountDiagram,

  '/images/lookup-vlookup.svg':        VlookupDiagram,
  '/diagram/lookup-hlookup-2table':    HlookupTwoTableDiagram,
  '/diagram/lookup-vlookup-1table':    VlookupOneTableDiagram,
  '/images/lookup-matchindex.svg':     MatchIndexDiagram,
  '/images/lookup-indexmatch.svg':     IndexMatchDiagram,
  '/images/lookup-choose.svg':         ChooseDiagram,

  '/images/db-dsum.svg':               DbSumDiagram,
  '/images/db-daverage.svg':           DbAverageDiagram,
  '/images/db-dcount.svg':             DbCountDiagram,
  '/images/db-dmax.svg':               DbMaxDiagram,

  '/images/math-abs-int-mod-power.svg': MathBasicDiagram,
  '/images/math-round.svg':            MathRoundDiagram,
  '/images/math-sumif.svg':            SumifDiagram,
  '/images/math-sumifs.svg':           SumifsDiagram,

  '/images/datetime-basic.svg':        DatetimeBasicDiagram,
  '/images/datetime-compose.svg':      DatetimeComposeDiagram,
  '/images/weekday-func.svg':          WeekdayDiagram,
  '/images/workday-func.svg':          WorkdayDiagram,

  '/images/logic-if.svg':              IfDiagram,
  '/images/logic-if-and.svg':          IfAndDiagram,
  '/images/logic-if-or.svg':           IfOrDiagram,
  '/images/logic-nested-if.svg':       NestedIfDiagram,
  '/images/logic-iferror.svg':         IfErrorDiagram,
};
