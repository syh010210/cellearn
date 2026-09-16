// src/data/exam/calc/templates/A-6.js
// DSUM 계열 (DSUM + ROUND/ROUNDUP/ROUNDDOWN). 변형 1개(후보형). 단일 셀 + 조건 범위.
import { NAMES, REGIONS } from "../pools.js";
import { geom, applyRound } from "./_util.js";

const distinctInts = (rng, n, lo, hi, unit = 1) => { const s = new Set(); const out = []; let g = 0; while (out.length < n && g++ < 900) { const v = (lo + rng.int(Math.floor((hi - lo) / unit) + 1)) * unit; if (!s.has(v)) { s.add(v); out.push(v); } } if (out.length < n) throw new Error("부족"); return out; };
const mod1000 = (x) => ((x % 1000) + 1000) % 1000;

// 1) a6-dsum-roundup [어려움] — ROUNDUP(DSUM(db,"매출액",조건),-3), 조건 정확 일치
function a6DsumRoundup(rng) {
  const N = 8 + rng.int(3);
  const headers = ["지점", "담당자", "매출액"];
  const region = rng.pick(REGIONS);                      // 조건값(시드마다 다름 → 고정 패턴 회피)
  const others = REGIONS.filter((r) => r !== region);
  // region 을 첫·중간·마지막 데이터 행에 배치(≥3). 마지막 행 매칭 → db 끝-1 축소가 합계를 바꿈.
  const jijeom = new Array(N).fill(null);
  jijeom[0] = region; jijeom[N - 1] = region;
  jijeom[1 + rng.int(N - 2)] = region;
  for (let i = 0; i < N; i++) if (!jijeom[i]) jijeom[i] = rng.pick(others);
  const 매출 = distinctInts(rng, N, 120, 990, 1).map((x) => x * 1000 + 1 + rng.int(998)); // 6자리·천 단위 아님
  const dsum = jijeom.reduce((s, j, i) => s + (j === region ? 매출[i] : 0), 0);
  const rem = mod1000(dsum);
  if (rem < 30 || rem > 470) throw new Error("천단위 나머지 부적합"); // ROUNDUP≠ROUND≠ROUNDDOWN 보장
  const up = applyRound("ROUNDUP", dsum, -3);
  // db 끝-1 축소(마지막 매칭 행 제거)가 반올림값을 바꿔야
  const lastMatch = 매출[N - 1];
  if (applyRound("ROUNDUP", dsum - lastMatch, -3) === up) throw new Error("db축소 무영향");
  // 조건 제거(전체 합) 시 값이 달라져야 (비매칭 행 존재 → 자동 성립 확인)
  const all = 매출.reduce((s, v) => s + v, 0);
  if (applyRound("ROUNDUP", all, -3) === up) throw new Error("조건축소 무영향");
  const names = rng.sample(NAMES, N);
  const rows = jijeom.map((j, i) => [j, names[i], 매출[i]]);
  // 표시 예: 결과 크기 근처, 백의 자리가 드러나는 값 → 천의 자리 올림 (시드마다 다름)
  const exIn = Math.floor(dsum / 1000) * 1000 + (100 + rng.int(899));
  const exOut = Math.ceil(exIn / 1000) * 1000;
  const exNote = `백의 자리에서 올림하여 천의 자리까지 표시 [표시 예 : ${exIn.toLocaleString("en-US")} → ${exOut.toLocaleString("en-US")}]`;
  const g = geom(headers, N), dbA = g.dbAllAbs(), db = g.dbAll(), crit = g.critRange(1);
  return {
    subtype: "A-6", colWidths: [8, 8, 10], headers, rows, colZ: { 2: "#,##0" },
    result: { kind: "single", label: `${region} 매출액 합계` },
    discriminators: [{ name: `지점=${region}`, test: (r) => r[0] === region, min: 3, max: N, allowFixed: "lastRow", reason: "조건 지점을 첫·중간·마지막에 배치(DSUM 범위 축소·조건 판별)" }],
    answer: `=ROUNDUP(DSUM(${dbA},"매출액",${crit}),-3)`,
    criteria: { headers: ["지점"], rows: [[region]], rowOffset: 0 },
    functions: { required: ["DSUM"], candidates: ["ROUND", "ROUNDUP", "ROUNDDOWN"] },
    text: `[{표}]에서 지점[{col:지점}]이 "${region}"인 매출액[{col:매출액}]의 합계를 [{R}] 셀에 계산하시오. (8점)`,
    notes: [exNote, "조건은 [{C}] 영역에 알맞게 입력", "DSUM, ROUND, ROUNDUP, ROUNDDOWN 함수 중 알맞은 함수들을 선택하여 사용"],
    accept: [
      `=ROUNDUP(DSUM(${dbA},${g.header("매출액")},${crit}),-3)`,   // 필드=머리글 셀
      `=ROUNDUP(DSUM(${dbA},3,${crit}),-3)`,                       // 필드=열 번호
      `=ROUNDUP(DSUM(${db},"매출액",${crit}),-3)`,                 // 표 범위 $ 없음
    ],
  };
}

export const TEMPLATE_A6 = {
  subtype: "A-6",
  variants: [
    { id: "a6-dsum-roundup", difficulty: "어려움", plan: a6DsumRoundup },
  ],
};
