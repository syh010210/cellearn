#!/usr/bin/env node
/* render.js — slides/*.html(본문 조각)을 base.css로 감싸 PNG로 렌더한다.
 *
 * 사용법:
 *   node render.js              slides 폴더 전체 렌더
 *   node render.js vlookup      특정 슬라이드만 렌더
 *   node render.js --check      긴 더미 텍스트를 넣어 "삐져나옴"을 시각 검사
 *
 * 렌더 엔진: Puppeteer(설치된 Chrome/Chromium 사용). 로컬 개발 PC에 최적.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SLIDES = path.join(ROOT, "slides");
const OUT = path.join(ROOT, "out");
const CSS = fs.readFileSync(path.join(ROOT, "base.css"), "utf8");

const WIDTH = 1280; // .slide 폭과 동일 → 항상 같은 결과

fs.mkdirSync(OUT, { recursive: true });

// --check 모드: 자식이 부모 밖으로 나가면 빨간 테두리로 표시하는 검사용 스크립트
const PROBE = `
<script>
window.__overflow = [];
window.addEventListener('load', function () {
  document.querySelectorAll('.slide *').forEach(function (el) {
    var p = el.parentElement; if (!p) return;
    var er = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
    var over = er.right > pr.right + 2 || er.left < pr.left - 2 ||
               er.bottom > pr.bottom + 2 || er.top < pr.top - 2;
    var scroll = el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2;
    if (over || scroll) {
      el.style.outline = '3px solid red';
      window.__overflow.push((el.className || el.tagName));
    }
  });
});
</script>`;

function buildHtml(body, check) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<style>${CSS} body{display:inline-block;}</style></head>
<body><div class="slide">${body}</div>${check ? PROBE : ""}</body></html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const only = args.find((a) => !a.startsWith("--"));

  const names = only
    ? [only.replace(/\.html$/, "")]
    : fs.readdirSync(SLIDES).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (e) {
    console.error("puppeteer가 없습니다.  npm install puppeteer  후 다시 실행하세요.");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=2"], // 2배 스케일 → 선명한 PNG
  });

  console.log(`렌더 시작 (${names.length}개)${check ? " · 오버플로 검사 모드" : ""}`);

  for (const name of names) {
    const src = path.join(SLIDES, name + ".html");
    if (!fs.existsSync(src)) { console.error("  ✗ 없음:", name); continue; }

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: 720, deviceScaleFactor: 2 });
    await page.setContent(buildHtml(fs.readFileSync(src, "utf8"), check), { waitUntil: "networkidle0" });

    // .slide 요소만 정확히 캡처 (높이는 내용에 맞춰 자동)
    const el = await page.$(".slide");
    const suffix = check ? ".check" : "";
    const pngPath = path.join(OUT, name + suffix + ".png");
    await el.screenshot({ path: pngPath });

    if (check) {
      const bad = await page.evaluate(() => window.__overflow || []);
      if (bad.length) console.log(`  ⚠ ${name}: 삐져나옴 ${bad.length}건 → out/${name}.check.png 확인`);
      else console.log(`  ✓ ${name}: 삐져나옴 없음`);
    } else {
      console.log("  ✓", path.relative(ROOT, pngPath));
    }
    await page.close();
  }

  await browser.close();
  console.log("완료 → out/");
}

main().catch((e) => { console.error(e); process.exit(1); });
