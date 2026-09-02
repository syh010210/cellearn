#!/usr/bin/env node
/* render-og.cjs — 공유 미리보기(OG) 배너 public/og.png (1200×630)를 렌더한다.
 *
 * 사용법:  node scripts/render-og.cjs
 * 렌더 엔진: slidegen에 설치된 Puppeteer(Chromium) 재사용.
 *
 * 이 파일이 og.png의 "소스"다. 문구·디자인을 바꾸려면 아래 HTML만 고치고 다시 실행.
 * 우하단 워터마크 문구는 의도적으로 넣지 않는다(요청에 따라 제거).
 */
const path = require("path");
const puppeteer = require(path.join(__dirname, "..", "slidegen", "node_modules", "puppeteer"));

const OUT = path.join(__dirname, "..", "public", "og.png");
const W = 1200, H = 630;

// 스프레드시트 목업(오른쪽) — ConceptSlide 톤(파랑 열머리·보라 행머리·앰버 C3 강조)
function grid() {
  const cols = ["A", "B", "C"];
  const th = (t) => `<td class="colh">${t}</td>`;
  const rows = [1, 2, 3].map((r) => {
    const cells = cols.map((c) => {
      const hl = c === "C" && r === 3;
      return `<td class="cell${hl ? " hl" : ""}">${hl ? "C3" : c + r}</td>`;
    }).join("");
    return `<tr><td class="rowh">${r}</td>${cells}</tr>`;
  }).join("");
  return `<table><thead><tr><td class="corner"></td>${cols.map(th).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
}

const HTML = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Pretendard',sans-serif; }
  .og {
    position:relative; width:${W}px; height:${H}px; overflow:hidden;
    background:
      repeating-linear-gradient(0deg, rgba(255,255,255,.025) 0 1px, transparent 1px 48px),
      repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0 1px, transparent 1px 48px),
      linear-gradient(135deg, #123a33 0%, #0b241f 100%);
    color:#fff;
  }
  .pad { position:absolute; inset:56px 64px; }
  /* 로고 */
  .logo { display:inline-flex; align-items:flex-end; gap:1px; font-weight:800; font-size:38px; letter-spacing:-.03em; line-height:1; }
  .logo .bar { display:inline-block; width:6px; border-radius:4px; margin:0 1.2px 5px; background:#c8f26a; }
  /* 타이틀 */
  .title { position:absolute; left:64px; top:210px; font-weight:800; font-size:66px; line-height:1.18; letter-spacing:-.02em; }
  .title .g { color:#4bbf88; }
  .sub { position:absolute; left:64px; top:372px; font-size:23px; color:#a7bcb4; font-weight:500; }
  .chips { position:absolute; left:64px; top:420px; display:flex; gap:10px; }
  .chip { font-size:17px; font-weight:700; padding:8px 16px; border-radius:999px; }
  .chip.lime { background:#c8f26a; color:#123a33; }
  .chip.dark { background:transparent; border:1px solid #2c5049; color:#cfe0d9; }
  .url { position:absolute; left:64px; bottom:52px; font-size:22px; font-weight:700; color:#5ec596; }
  /* 스프레드시트 목업 */
  .mock { position:absolute; right:74px; top:196px; background:#ffffff; border-radius:16px; padding:18px; box-shadow:0 20px 50px rgba(0,0,0,.35); }
  table { border-collapse:collapse; table-layout:fixed; }
  td { text-align:center; font-size:20px; padding:11px 0; width:74px; font-family:'JetBrains Mono','Pretendard',monospace; }
  .corner { width:38px; background:#f2f4f2; border:1px solid #eaefec; }
  .colh { background:#e7edfb; border:1px solid #bcd0f5; color:#2563eb; font-weight:700; }
  .rowh { width:38px; background:#f0e9fb; border:1px solid #d8c4f0; color:#7c3aed; font-weight:700; }
  .cell { background:#fff; border:1px solid #eaefec; color:#8b988f; }
  .cell.hl { background:#fdf0d8; border:1px solid #eecf92; color:#b8791a; font-weight:800; }
</style></head>
<body>
  <div class="og">
    <div class="pad">
      <span class="logo"><span>ce</span><span class="bar" style="height:26px"></span><span class="bar" style="height:34px"></span><span>earn</span></span>
    </div>
    <div class="title">엑셀의 모든 것을<br><span class="g">한 곳에서.</span></div>
    <div class="sub">컴퓨터활용능력 · ITQ · 실무 엑셀 학습 플랫폼</div>
    <div class="chips">
      <span class="chip lime">컴퓨터활용능력</span>
      <span class="chip dark">ITQ 엑셀</span>
      <span class="chip dark">실무 엑셀</span>
    </div>
    <div class="url">cellearn.kr</div>
    <div class="mock">${grid()}</div>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.setContent(HTML, { waitUntil: "networkidle0" });
  const el = await page.$(".og");
  await el.screenshot({ path: OUT });
  await browser.close();
  console.log("완료 →", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
