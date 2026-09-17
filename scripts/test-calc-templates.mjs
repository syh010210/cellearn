// scripts/test-calc-templates.mjs  (test:calc 에 포함)
// 변형별 200시드: 자체검증·재시도율·기준답 만점·accept 만점·mutation 전부 잡힘(규칙 생존 제외)·결정성.
// + 1000시드 분포 + composeCalc 조합 만점.
import { makeRng, planItem, composeCalc, TEMPLATES, FILLER } from "../src/utils/calc/calcAssembler.js";
import { buildInstance } from "../src/utils/calc/buildInstance.js";
import { classifySurvivor } from "../src/utils/calc/survivorRules.js";
import { submit, mutate, cellsGetCell, validateText, significantCols, specDiscriminators, evalAt, COL, lettersCol } from "./_calcTestUtil.mjs";
import { TOPICS } from "../src/data/exam/calc/topics.js";
import { josaViolations } from "./_josaCheck.mjs";

let pass = 0, fail = 0;
const check = (name, cond, extra = "") => { if (cond) pass++; else { fail++; console.log(`✗ ${name}  ${extra}`); } };

// ── 단위: headerInAggregate 의 COUNTIF 조건 좁히기 (숫자비교 허용 / <>텍스트·와일드카드 비허용) ──
{
  const S = { result: { kind: "fillCol" } };
  const expand = (cond) => classifySurvivor(`=COUNTIF($A$3:$A$10,${cond})`, `=COUNTIF($A$2:$A$10,${cond})`, S);
  check("단위 COUNTIF 숫자비교(>=80) headerInAggregate 허용", expand('">=80"')?.name === "headerInAggregate", JSON.stringify(expand('">=80"')));
  check("단위 COUNTIF <>서울 규칙 비적용", expand('"<>서울"') === null, JSON.stringify(expand('"<>서울"')));
  check("단위 COUNTIF 와일드카드(*) 규칙 비적용", expand('"*"') === null, JSON.stringify(expand('"*"')));
}

// ── 단위: mutation 생성기가 MATCH 3번째 인수로 -1 을 만들지 않는다(엑셀 미정의 동작 회피) ──
{
  const has = (base) => mutate(base, ["INDEX", "MATCH", "MAX"]).some((m) => /MATCH\([^()]*\([^()]*\)[^()]*,\s*-1\s*\)/.test(m.formula) || /MATCH\([^()]*,\s*-1\s*\)/.test(m.formula));
  check("단위 mutate MATCH ,0 → -1 미생성", !has("=INDEX($A$3:$A$9,MATCH(MAX($C$3:$C$9),$C$3:$C$9,0))"));
  check("단위 mutate MATCH ,FALSE → -1 미생성", !has("=INDEX($A$3:$A$9,MATCH(MAX($C$3:$C$9),$C$3:$C$9,FALSE))"));
}

// ── 단위: extremeLookupShrink (최대 행 마지막 아님 → 허용 / 마지막 → 비허용 / 다른 함수 → 비허용) ──
{
  const S = { result: { kind: "single" } };
  const gc = (vals) => (addr) => { const m = /^C(\d+)$/.exec(addr); if (!m) return null; const v = vals[+m[1] - 3]; return v === undefined ? null : { v }; };
  const base = "=INDEX($A$3:$A$10,MATCH(MAX($C$3:$C$10),$C$3:$C$10,0))";
  const mutSh = "=INDEX($A$3:$A$9,MATCH(MAX($C$3:$C$10),$C$3:$C$10,0))";
  check("단위 extremeLookupShrink 최대 중간 → 허용", classifySurvivor(base, mutSh, S, gc([50, 60, 95, 40, 80, 30, 70, 20]))?.name === "extremeLookupShrink", JSON.stringify(classifySurvivor(base, mutSh, S, gc([50, 60, 95, 40, 80, 30, 70, 20]))));
  check("단위 extremeLookupShrink 최대 마지막 → 비허용", classifySurvivor(base, mutSh, S, gc([50, 60, 40, 80, 30, 70, 20, 95])) === null);
  check("단위 extremeLookupShrink 다른 함수 → 비허용", classifySurvivor("=SUM($C$3:$C$10)", "=SUM($C$3:$C$9)", S, gc([50, 60, 95, 40, 80, 30, 70, 20])) === null);
}

// ── 변형 정적 메타(resultKind·usesD·core) 일치 (시드 20개) ──
{
  const DFN = new Set(["DAVERAGE", "DSUM", "DCOUNT", "DCOUNTA", "DMAX", "DMIN", "DGET", "DPRODUCT", "DVAR", "DVARP", "DSTDEV", "DSTDEVP"]);
  const fnsOf = (f) => { const s = new Set(); for (const m of String(f).matchAll(/([A-Z][A-Z0-9.]*)\s*\(/g)) s.add(m[1]); return s; };
  for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
    check(`${v.id} 메타 필드 존재`, v.resultKind && typeof v.usesD === "boolean" && Array.isArray(v.core) && v.core.length > 0);
    for (let s = 0; s < 20; s++) {
      let r; try { r = planItem(st, v.id, v.difficulty, makeRng(v.id + "#meta" + s)); } catch { continue; }
      check(`${v.id} resultKind 메타`, r.spec.result.kind === v.resultKind, `${r.spec.result.kind}≠${v.resultKind}`);
      const req = r.spec.functions?.required || [], cand = r.spec.functions?.candidates || [];
      check(`${v.id} usesD 메타`, [...req, ...cand].some((f) => DFN.has(f)) === v.usesD);
      const allow = new Set([...fnsOf(r.spec.answer), ...req, ...cand]);
      for (const c of v.core) if (!allow.has(c)) check(`${v.id} core⊆기준수식`, false, `${c} ∉ ${[...allow].join(",")}`);
    }
  }
}

// ── 주제 묶음 정합성(_topic): 열 이름·결과 열·결과 문자열·산식 용어가 한 묶음에서 나온다 + 변형별 묶음 ≥4 ──
{
  const bundleStrings = (b) => { const out = []; for (const [k, v] of Object.entries(b)) { if (k === "id") continue; if (typeof v === "string") out.push(v); else if (Array.isArray(v)) for (const x of v) if (typeof x === "string") out.push(x); } return out; };
  const specHay = (spec) => JSON.stringify([spec.headers, spec.answer, spec.accept, spec.result, spec.notes, spec.text, spec.refTable, spec.resultTable, (spec.discriminators || []).map((d) => d.name)]);
  const idsByVariant = {};                              // variantId → Set(묶음 id)
  for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
    for (let s = 0; s < 200; s++) {
      let spec; try { spec = planItem(st, v.id, v.difficulty, makeRng(`${v.id}#topic${s}`)).spec; } catch { continue; }
      const tp = spec._topic; if (!tp) continue;
      const pool = TOPICS[tp.pool];
      check(`${v.id} _topic 풀 존재(${tp.pool})`, Array.isArray(pool), tp.pool);
      if (!Array.isArray(pool)) continue;
      const B = pool.find((b) => (b.id || b.name) === tp.id);
      check(`${v.id} _topic 묶음 존재(${tp.id})`, !!B, tp.id);
      if (!B) continue;
      (idsByVariant[v.id] = idsByVariant[v.id] || new Set()).add(tp.id);
      const hay = specHay(spec);
      for (const val of bundleStrings(B)) if (!hay.includes(val)) check(`${v.id} 묶음 용어 스펙 반영`, false, `"${val}" ∉ 스펙 (묶음 ${tp.id})`);
    }
  }
  for (const [vid, ids] of Object.entries(idsByVariant)) check(`${vid} 서로 다른 주제 묶음 ≥4`, ids.size >= 4, `${ids.size}종: ${[...ids].join(",")}`);
}

// ── D함수 조건 형태 규칙 (규칙1 표 칸 / 규칙2·3 밖) + DCOUNTA 빈 칸·필드 불변 ──
{
  const DFN_ANS = /D(?:COUNTA|COUNT|SUM|AVERAGE|MAX|MIN|GET|PRODUCT|VARP|VAR|STDEVP|STDEV)\s*\(/;
  // D함수 3번째 인수(조건 범위) 추출: D…(db, field, crit)
  const critRe = /D(?:COUNTA|COUNT|SUM|AVERAGE|MAX|MIN|GET|PRODUCT|VARP|VAR|STDEVP|STDEV)\(\s*[^,]+,\s*(?:"[^"]*"|\d+|\$?[A-Z]+\$?\d+)\s*,\s*(\$?[A-Z]+)(\d+):(\$?[A-Z]+)(\d+)\s*\)/;
  // survivorRules.dExtremeRow 가 criteria null 이면 시트에서 조건값을 읽도록 확장됨(승인 완료) → 예외 없음.
  const CRIT_RULE1_EXEMPT = new Set();
  for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) {
    for (let s = 0; s < 200; s++) {
      let spec; try { spec = planItem(st, v.id, v.difficulty, makeRng(`${v.id}#dcond${s}`)).spec; } catch { continue; }
      const dfnInAns = DFN_ANS.test(spec.answer);
      if (spec.criteria) {
        // (규칙1 위반) 조건이 1개 열·1개 행·값 그대로 비교(연산자·와일드카드 없음)이면 표 칸이어야 한다.
        const cHead = spec.criteria.headers, condRows = spec.criteria.rows;
        const val = condRows.length === 1 ? String(condRows[0][0]) : "";
        const exact = cHead.length === 1 && condRows.length === 1 && !/[<>=*?]/.test(val);
        if (exact && !CRIT_RULE1_EXEMPT.has(v.id)) check(`${v.id} 규칙1: 단일 정확 조건은 표 칸(밖 금지)`, false, `${v.id}#${s} criteria="${val}"`);
      } else if (dfnInAns) {
        // (규칙1) criteria null D함수: 조건 범위 = 머리글 행(2)+첫 데이터 행(3), 그 칸 값 = 지시문 조건 값
        const m = critRe.exec(spec.answer);
        if (!m) { check(`${v.id} 규칙1: 조건 범위 파싱`, false, spec.answer); continue; }
        const col = m[1].replace("$", ""), r1 = +m[2], col2 = m[3].replace("$", ""), r2 = +m[4];
        check(`${v.id} 규칙1: 조건 범위=머리글+첫 데이터 행`, col === col2 && r1 === 2 && r2 === 3, `${v.id}#${s} ${m[0]}`);
        const ci = lettersCol(col), cv = spec.rows[0] ? spec.rows[0][ci] : undefined;
        check(`${v.id} 규칙1: 첫 데이터 행=조건 값(지시문 일치)`, ci >= 0 && ci < spec.headers.length && cv != null && cv !== "" && spec.text.includes(`"${cv}"`), `${v.id}#${s} [${col}3]=${cv}`);
        // "조건은 [{C}] 영역에" 안내·<조건> 밖 조건 칸이 없어야 한다.
        check(`${v.id} 규칙1: 밖 조건 안내 없음`, !(spec.notes || []).some((n) => n.includes("{C}")), `${v.id}#${s}`);
      }
      // (DCOUNTA) 데이터 영역 빈 칸 0
      if (/DCOUNTA\s*\(/.test(spec.answer)) {
        let empties = 0; spec.rows.forEach((row) => row.forEach((c) => { if (c === null || c === undefined || c === "") empties++; }));
        if (empties) check(`${v.id} DCOUNTA 데이터 빈 칸 0`, false, `${v.id}#${s} 빈칸 ${empties}`);
      }
    }
  }
}

const VARIANTS = [];
for (const [st, t] of Object.entries(TEMPLATES)) for (const v of t.variants) VARIANTS.push({ st, id: v.id, difficulty: v.difficulty });

const SEEDS = 200;
// 잡힘 범주: value > function > criteria > noFormula (여러 범주면 value 우선 + 전체 목록)
function caughtCat(it) {
  const cats = new Set(it.details.map((d) => d.cat));
  const pri = cats.has("value") || cats.has("parse") ? "value"
    : (cats.has("functionMissing") || cats.has("functionOutside")) ? "function"
      : cats.has("criteria") ? "criteria" : cats.has("noFormula") ? "noFormula" : "기타";
  return { pri, cats: [...cats] };
}
console.log("=== 변형별 (200시드) ===");
console.log("변형 | 난이도 | 재시도율 | accept | 생성/잡힘/규칙생존 | 잡힘범주(V/F/C) | 규칙");
const catRows = [];
for (const V of VARIANTS) {
  let retry = 0, accOk = 0, accN = 0, mutN = 0, caught = 0, ruled = 0;
  const bad = [];
  const catCnt = { value: 0, function: 0, criteria: 0, noFormula: 0, 기타: 0 };
  const ruleCnt = {};
  let shrinkCaught = 0, sawPaired = false, validated = 0;
  const badCandidate = [];
  const rowPos = {};                                   // 행 위치별(유의미 열만) 반복 횟수
  const discPos = {}, discTot = {}, discMeta = {};     // discriminator 별 위치 분포·총 판별행 수·메타(name/allowFixed)
  let nSum = 0;                                         // 전체 데이터 행 수 합(기대 확률용)
  const exSet = new Set();                             // 표시 예 다양성(모든 표시 예)
  const ansPos = {};                                  // single 텍스트 답이 위치한 표 행(편중 검사)
  for (let s = 0; s < SEEDS; s++) {
    const seed = `${V.id}#${s}`;
    const r = planItem(V.st, V.id, V.difficulty, makeRng(seed));
    if (!r) { check(`${V.id} 변형 존재`, false); break; }
    retry += r.retries;
    const inst = buildInstance({ id: "t", blocks: [r.spec, FILLER, FILLER] });
    const r2 = planItem(V.st, V.id, V.difficulty, makeRng(seed)); // 결정성
    if (JSON.stringify(r2.spec) !== JSON.stringify(r.spec)) check(`${V.id} 결정성`, false, seed);
    const it = inst.items.find((x) => x._blockIndex === 0);   // 테스트 블록(입력 0) — items 는 표번호(위치)순 정렬됨
    const sc = significantCols(r.spec);
    nSum += r.spec.rows.length;
    r.spec.rows.forEach((row, i) => { const k = JSON.stringify(sc.map((c) => row[c])); (rowPos[i] = rowPos[i] || new Map()).set(k, (rowPos[i].get(k) || 0) + 1); });
    specDiscriminators(r.spec).forEach((d, di) => { discMeta[di] = { name: d.name, allowFixed: d.allowFixed }; let mc = 0; r.spec.rows.forEach((row, i) => { if (d.test(row)) { (discPos[di] = discPos[di] || new Map()).set(i, (discPos[di].get(i) || 0) + 1); mc++; } }); discTot[di] = (discTot[di] || 0) + mc; });
    const exm = /표시\s*예\s*[:：]\s*([^\]]+?)(?:\]|$)/.exec((it.notes || []).join(" ")); if (exm) exSet.add(exm[1].trim());
    if (r.spec.result.kind === "single" && String(r.spec.answer).includes("$") && s === 0) check(`${V.id} single 기준수식 $ 없음`, false, r.spec.answer);
    // 결과 라벨(single·fillRow) 표시 폭 ≤ 20 (한글 1자=2). 병합 칸에 들어가므로 짧게.
    if ((r.spec.result.kind === "single" || r.spec.result.kind === "fillRow") && r.spec.result.label) {
      const lw = [...String(r.spec.result.label)].reduce((w, ch) => w + ((ch.codePointAt(0) >= 0x1100 && ch.codePointAt(0) <= 0x115F) || (ch.codePointAt(0) >= 0xAC00 && ch.codePointAt(0) <= 0xD7A3) ? 2 : 1), 0);
      if (lw > 20) check(`${V.id} 결과 라벨 폭 ≤20`, false, `${lw}: ${r.spec.result.label}`);
    }
    // fill 계열: 기준수식의 $ 는 채우기에서 실효해야 한다 → $ 전부 제거 시 확장 값이 최소 1칸 달라져야(장식용 $ 금지). s===0 1회.
    if (["fillCol", "fillRow", "table"].includes(r.spec.result.kind) && String(r.spec.answer).includes("$") && s === 0) {
      let instND = null; try { instND = buildInstance({ id: "t", blocks: [{ ...r.spec, answer: String(r.spec.answer).replace(/\$/g, "") }, FILLER, FILLER] }); } catch { /* 범위 이탈 예외 = 값 변화로 간주 */ }
      let changed = instND === null;
      if (instND) { const e0 = it.expected, eN = instND.items.find((x) => x._blockIndex === 0).expected; for (const k of Object.keys(e0)) if (JSON.stringify(e0[k]) !== JSON.stringify(eN[k])) { changed = true; break; } }
      check(`${V.id} fill 기준수식 $ 실효(제거 시 값 변화)`, changed, r.spec.answer);
    }
    if (r.spec.result.kind === "single") { const val = Object.values(it.expected)[0]; if (typeof val === "string" && val !== "") { const ri = r.spec.rows.findIndex((row) => row.some((c) => c === val)); if (ri >= 0) ansPos[ri] = (ansPos[ri] || 0) + 1; } }
    // D함수 single 결과: 조건 없는 같은 집계와 달라야(조건이 실제로 거른다)
    if (r.spec.result.kind === "single") {
      const DMAP = { DMAX: "MAX", DMIN: "MIN", DSUM: "SUM", DAVERAGE: "AVERAGE", DCOUNT: "COUNT", DCOUNTA: "COUNTA" };
      const dreG = /D(MAX|MIN|SUM|AVERAGE|COUNT|COUNTA)\(\s*(\$?[A-Z]+\$?\d+):(\$?[A-Z]+\$?\d+)\s*,\s*("[^"]*"|\$?[A-Z]+\$?\d+|\d+)\s*,\s*\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+\s*\)/g;
      let found = false;
      const noCond = it.answer.formula.replace(dreG, (_w, fn, dbS, _dbE, fld) => {
        found = true;
        const c1 = lettersCol(dbS.replace(/\$/g, "").match(/[A-Z]+/)[0]);
        const r1 = +dbS.replace(/\$/g, "").match(/\d+/)[0], r2 = +_dbE.replace(/\$/g, "").match(/\d+/)[0];
        let fcol; if (/^"/.test(fld)) fcol = c1 + r.spec.headers.indexOf(fld.replace(/"/g, "")); else if (/^\d+$/.test(fld)) fcol = c1 + (+fld - 1); else fcol = lettersCol(fld.replace(/\$/g, "").match(/[A-Z]+/)[0]);
        return `${DMAP[fn]}(${COL(fcol)}${r1 + 1}:${COL(fcol)}${r2})`;
      });
      if (found) { const nc = evalAt(inst, it, noCond), ev = Object.values(it.expected)[0]; const same = (a, b) => (typeof a === "number" && typeof b === "number") ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)) : String(a) === String(b); if (same(nc, ev)) check(`${V.id} D함수 조건 유효(무조건 집계와 다름)`, false, `${seed} 무조건=${nc} 기대=${ev}`); }
    }
    { const e = validateText(it, r.spec); validated++; if (e.length) check(`${V.id} 지시문 좌표 무결성`, false, `${seed} :: ${e.join(" / ")}`); }
    for (const line of [it.text, ...(it.notes || [])]) { const jv = josaViolations(line); if (jv.length) check(`${V.id} 조사 정합성`, false, `${seed} :: ${jv.map((x) => `${x.word}+${x.josa}→${x.expect}(«${x.ctx}»)`).join(" / ")}`); }
    const gc = cellsGetCell(inst.cells);
    const cand = it.functions?.candidates || null;
    const gradeIt = (r0) => r0.items.find((x) => x.no === it.no);
    const ref = gradeIt(submit(inst));
    if (!ref.ok) check(`${V.id} 기준답 만점`, false, `${seed} :: ${ref.reasons.join(" / ")}`);
    for (const a of r.spec.accept || []) { accN++; const rr = gradeIt(submit(inst, { [it.no]: { formula: a, rel: true } })); if (rr.ok) accOk++; else check(`${V.id} accept`, false, `${seed} :: ${a} :: ${rr.reasons.join("/")}`); }
    for (const m of mutate(it.answer.formula, r.spec.functions?.required || [])) {
      mutN++;
      const rr = gradeIt(submit(inst, { [it.no]: { formula: m.formula } }));
      if (rr.ok) {
        // withinListSurvive: 생존자는 함수 규칙으로 못 잡힌(허용 목록 안) 경우 → 반드시 생존 규칙에 해당해야
        const rule = classifySurvivor(it.answer.formula, m.formula, it, gc);
        if (rule) { ruled++; ruleCnt[rule.name] = (ruleCnt[rule.name] || 0) + 1; if (rule.name === "pairedRangeShrink") sawPaired = true; }
        else if (bad.length < 4) bad.push({ seed, op: m.op, mut: m.formula, ans: it.answer.formula });
      } else {
        caught++; const c = caughtCat(rr); catCnt[c.pri]++;
        if (m.op === "rangeShrink") shrinkCaught++;
        // 후보형: 후보 함수끼리 교체(roundSwap)는 반드시 값으로 잡혀야 한다
        if (cand && m.op === "roundSwap" && c.pri !== "value") badCandidate.push(`${seed}:${m.name}:${c.pri}`);
      }
    }
  }
  const survivedBad = mutN - caught - ruled;
  check(`${V.id} accept 전부 만점`, accOk === accN, `${accOk}/${accN}`);
  check(`${V.id} withinListSurvive(미규칙 생존) 0`, survivedBad === 0, bad.map((b) => `[${b.op}] ${b.mut} ⟵ ${b.ans} (${b.seed})`).join("  |  "));
  if (sawPaired) check(`${V.id} pairedRangeShrink: 같은 범위 축소 중 값으로 잡힌 것 있음`, shrinkCaught >= 1, `shrinkCaught=${shrinkCaught}`);
  // 고정 패턴: 한 위치에 같은 유의미-열 조합이 시드의 50% 이상 반복 = 사실상 고정(값 편중과 구분).
  if (Object.keys(rowPos).length && [...Object.values(rowPos)[0].keys()][0] !== "[]") { let maxRep = 0, at = ""; for (const [i, m] of Object.entries(rowPos)) for (const [k, c] of m) if (c > maxRep) { maxRep = c; at = `행${i} ${k}`; } check(`${V.id} 데이터 고정 패턴(유의미 열)`, maxRep < SEEDS * 0.5, `최대 ${maxRep}/${SEEDS} (${at})`); }
  // 판별행 위치: 기대 확률(판별행/전체행) 대비 1.6배 넘고 절대 50% 넘으면 고정 배치로 판정. allowFixed 는 면제.
  const nAvg = nSum / SEEDS;
  for (const [di, m] of Object.entries(discPos)) {
    if (discMeta[di]?.allowFixed) continue;             // 고정 허용(D함수 단일 조건 등) → 분산 검사 면제
    const exp = (discTot[di] / SEEDS) / nAvg; let mx = 0, pos = -1; for (const [p, c] of m) if (c > mx) { mx = c; pos = p; } const rate = mx / SEEDS;
    check(`${V.id} 판별행 위치 분산 (${discMeta[di]?.name})`, !(rate > exp * 1.6 && rate > 0.5), `위치${pos} ${(rate * 100).toFixed(0)}% (기대 ${(exp * 100).toFixed(0)}%)`);
  }
  if (exSet.size > 0) check(`${V.id} 표시 예 다양성 ≥3`, exSet.size >= 3, `${exSet.size}종: ${[...exSet].slice(0, 3).join(" | ")}`);
  { let mx = 0, pos = -1; for (const [p, c] of Object.entries(ansPos)) if (c > mx) { mx = c; pos = p; } if (mx > 0) check(`${V.id} 답 행 위치 편중 <30%`, mx < SEEDS * 0.3, `위치${pos} ${(mx / SEEDS * 100).toFixed(0)}%`); }
  check(`${V.id} 후보 교체는 값으로 잡힘`, badCandidate.length === 0, badCandidate.slice(0, 3).join(" "));
  console.log(`${V.id} | ${V.difficulty} | 검증${validated} | 재${(retry / SEEDS).toFixed(2)} | ${accOk}/${accN} | ${mutN}/${caught}/${survivedBad} | ${catCnt.value}/${catCnt.function}/${catCnt.criteria} | ${Object.entries(ruleCnt).map(([k, v]) => k + ":" + v).join(",")}`);
  catRows.push({ id: V.id, cat: catCnt, rule: ruleCnt });
}

// ── 1000시드 분포 ──
console.log("\n=== 1000시드 변형 분포 (난이도 풀) ===");
for (const [st, t] of Object.entries(TEMPLATES)) {
  for (const diff of ["기본", "어려움"]) {
    const pool = t.variants.filter((v) => v.difficulty === diff);
    if (!pool.length) continue;
    const cnt = {};
    for (let s = 0; s < 1000; s++) { const r = planItem(st, null, diff, makeRng(`${st}~${diff}~${s}`)); cnt[r.variantId] = (cnt[r.variantId] || 0) + 1; }
    console.log(`${st} ${diff} (${pool.length}종): ${Object.entries(cnt).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
}

// ── composeCalc 조합 만점 (layoutPage 는 3·5블록만 허용 → 4개 신규 유형은 5블록 조합으로) ──
for (const combo of [["A-2", "B-1", "C-1"], ["A-1", "A-3", "A-4", "C-2", "A-2"], ["B-2", "B-3", "D-1", "D-5", "A-1"], ["B-2", "B-3", "D-1", "C-2", "A-3"], ["A-1", "A-5", "B-4", "B-5", "D-1"], ["A-6", "A-3", "B-5", "C-2", "D-1"], ["B-6", "C-3", "A-6", "D-1", "A-3"], ["D-2", "D-3", "D-4", "C-3", "A-6"], ["D-2", "A-1", "B-4", "C-1", "A-2"]]) {
  console.log(`\n=== composeCalc [${combo.join(",")}] 200시드 만점 ===`);
  for (const diff of ["기본", "어려움"]) {
    if (!combo.every((st) => TEMPLATES[st].variants.some((v) => v.difficulty === diff))) { console.log(`${diff}: (일부 소유형에 해당 난이도 변형 없음 → 생략)`); continue; }
    let ok = 0, totRetry = 0;
    for (let s = 0; s < 200; s++) {
      const inst = composeCalc(`compose~${combo.join("")}~${diff}~${s}`, { subtypes: combo, difficulty: diff });
      totRetry += inst._meta.retries;
      const res = submit(inst);
      if (res.earned === res.total && inst.items.length === combo.length) ok++;
      else check(`compose [${combo.join(",")}] 만점`, false, `${diff}#${s} ${res.earned}/${res.total}`);
    }
    check(`compose [${combo.join(",")}] ${diff} 200시드 만점`, ok === 200, `${ok}/200`);
    console.log(`${diff}: ${ok}/200 만점, 총재시도 ${totRetry}`);
  }
}

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
if (fail) process.exit(1);
