// Renders the social preview images (public/og/*.png, 1200×630) and the PNG app icons
// (public/icons/*.png) with a headless Chromium. The output is committed, so this only
// needs to run when the artwork changes:
//
//   npx -p playwright@1 node scripts/render-brand-images.mjs
//
// Fonts come from Google Fonts. Where that is unreachable, point FONT_CSS at a stylesheet
// with @font-face rules for Figtree (800, 900) and DM Sans (500, 700), as data: URLs
// (the page is loaded from about:blank, which cannot read file:// fonts).
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const playwright = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const { chromium } = playwright.chromium ? playwright : playwright.default

const fontCss = process.env.FONT_CSS
  ? await fs.readFile(process.env.FONT_CSS, 'utf8')
  : "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Figtree:wght@800;900&display=block');"
const logo = await fs.readFile(path.join(root, 'public/favicon.svg'), 'utf8')

const COPY = {
  'pt-BR': {
    kicker: 'Jogo de cronologia · grátis',
    title: 'Você sabe quando aconteceu?',
    line: 'Coloque acontecimentos históricos na ordem certa.',
    cards: ['Revolução', 'Invenção', 'Descoberta', 'Espaço'],
    oldest: 'mais antigo',
    newest: 'mais recente',
  },
  en: {
    kicker: 'History timeline game · free',
    title: 'Do you know when it happened?',
    line: 'Put historical events in the right order.',
    cards: ['Revolution', 'Invention', 'Discovery', 'Space'],
    oldest: 'oldest',
    newest: 'newest',
  },
}

const CARD_COLORS = ['#9d5cff', '#10bfa5', '#ff5c7d', '#1aa8ff']

const socialHtml = (copy) => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: 'DM Sans', sans-serif; color: #201f1c;
  background: radial-gradient(circle at 12% 8%, #fff 0, transparent 34%),
    radial-gradient(circle at 88% 14%, rgba(255,217,90,.35), transparent 30%),
    linear-gradient(150deg, #faf6ed 0%, #efe8da 100%); }
.frame { position: absolute; inset: 28px; border: 3px solid #201f1c; border-radius: 34px; background: rgba(255,253,247,.55); }
.left { position: absolute; left: 80px; top: 92px; width: 570px; }
.brand { display: flex; align-items: center; gap: 18px; font-family: Figtree; font-weight: 900; font-size: 52px; letter-spacing: -0.04em; }
.brand svg { width: 86px; height: 86px; }
.kicker { margin-top: 38px; font-family: Figtree; font-weight: 800; font-size: 20px; letter-spacing: .14em; text-transform: uppercase; color: #8a8377; }
h1 { margin-top: 14px; font-family: Figtree; font-weight: 900; font-size: 68px; line-height: .98; letter-spacing: -0.05em; }
p { margin-top: 22px; font-size: 25px; font-weight: 500; color: #5f5a51; line-height: 1.35; }
.cards { position: absolute; right: 78px; top: 96px; width: 440px; height: 380px; }
.card { position: absolute; width: 190px; height: 150px; border: 3px solid #201f1c; border-radius: 22px; background: #fffdf7; box-shadow: 8px 9px 0 #201f1c; overflow: hidden; }
.card .art { height: 70px; border-bottom: 3px solid #201f1c; }
.card b { display: block; margin: 12px 16px 0; font-family: Figtree; font-weight: 900; font-size: 22px; }
.card i { display: inline-block; margin: 8px 16px; padding: 3px 12px; border: 2px solid #201f1c; border-radius: 999px; font-style: normal; font-family: Figtree; font-weight: 900; font-size: 18px; background: #ffd95a; }
.rail { position: absolute; left: 0; right: 0; bottom: -42px; display: flex; align-items: center; gap: 14px; font-family: Figtree; font-weight: 800; font-size: 17px; text-transform: uppercase; letter-spacing: .1em; color: #8a8377; }
.rail span.line { flex: 1; height: 4px; border-radius: 4px; background: repeating-linear-gradient(90deg, #201f1c 0 18px, transparent 18px 28px); }
</style></head><body>
<div class="frame"></div>
<div class="left">
  <div class="brand">${logo}<span>When?</span></div>
  <div class="kicker">${copy.kicker}</div>
  <h1>${copy.title}</h1>
  <p>${copy.line}</p>
</div>
<div class="cards">
  ${copy.cards
    .map((label, index) => {
      const left = [0, 240, 20, 250][index]
      const top = [0, 30, 170, 196][index]
      const turn = [-6, 4, 3, -4][index]
      return `<div class="card" style="left:${left}px;top:${top}px;transform:rotate(${turn}deg)"><div class="art" style="background:${CARD_COLORS[index]}"></div><b>${label}</b><i>????</i></div>`
    })
    .join('')}
  <div class="rail"><span>${copy.oldest}</span><span class="line"></span><span>${copy.newest}</span></div>
</div>
</body></html>`

// The logo on a solid square; "maskable" icons keep it inside the 80% safe zone.
const iconHtml = (size, maskable) => `<!doctype html><html><head><style>
* { margin: 0; } body { width: ${size}px; height: ${size}px; display: grid; place-items: center;
  background: ${maskable ? '#f4efe3' : 'transparent'}; }
svg { width: ${maskable ? size * 0.7 : size}px; height: ${maskable ? size * 0.7 : size}px; }
</style></head><body>${logo}</body></html>`

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
const page = await browser.newPage()

async function shoot(html, width, height, file, transparent = false) {
  await page.setViewportSize({ width, height })
  await page.setContent(html, { waitUntil: 'networkidle' })
  // Runs in the page, where `document` exists.
  await page.evaluate(() => globalThis.document.fonts.ready)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await page.screenshot({ path: file, omitBackground: transparent })
  console.log(path.relative(root, file))
}

for (const [language, copy] of Object.entries(COPY)) {
  await shoot(socialHtml(copy), 1200, 630, path.join(root, `public/og/when-${language}.png`))
}
for (const [name, size, maskable] of [
  ['favicon-32.png', 32, false],
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
]) {
  await shoot(
    iconHtml(size, maskable),
    size,
    size,
    path.join(root, 'public/icons', name),
    !maskable,
  )
}

await browser.close()
