// Generates public/og-image.png (1200x630) from the live reviews data -
// the platform list is built dynamically, so new reviews appear automatically.
// Run: node scripts/rasterize-og.mjs
import { chromium } from 'file:///C:/Users/samee/node_modules/playwright/index.mjs'
import { readArchive } from './lib/archive-node.mjs'

const archive = readArchive()
const REVIEWS = archive.byRating

const W = 1200
const H = 630

const dateline = new Date()
  .toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  .toUpperCase()

// Platform list in up to 3 columns of 5 (supports 15); overflow gets a pointer line.
const COL_X = [150, 500, 850]
const rowsPerCol = 5
const SHOWN = 15
const shown = REVIEWS.slice(0, SHOWN)
const cols = []
for (let i = 0; i < shown.length; i += rowsPerCol) {
  cols.push(shown.slice(i, i + rowsPerCol))
}
let flatIndex = 0
const listSvg = cols
  .map((col, c) =>
    col
      .map((r) => {
        const i = flatIndex++
        const y = 400 + (i % rowsPerCol) * 34
        const num = String(i + 1).padStart(2, '0')
        const name = r.name.length > 20 ? `${r.name.slice(0, 19)}…` : r.name
        return (
          `<text x="${COL_X[c]}" y="${y}" font-family="'IBM Plex Mono', monospace" font-size="19" fill="#1a1712">` +
          `${num}  ${name} <tspan fill="#6b6455">${r.rating.toFixed(1)}</tspan></text>`
        )
      })
      .join(''),
  )
  .join('')

const overflow =
  REVIEWS.length > SHOWN
    ? `<text x="600" y="576" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-style="italic" fill="#3d382d">…and ${REVIEWS.length - SHOWN} more platforms reviewed at trader-ai.com</text>`
    : ''

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f7f5f2"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#ea6a1f"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#ea6a1f"/>

  <text x="600" y="96" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="22" letter-spacing="9" fill="#ea6a1f">TRADER AI - REVIEWS &amp; VERDICTS</text>

  <text x="600" y="196" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700" fill="#1a1712">Trader AI</text>
  <text x="600" y="238" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-style="italic" fill="#ea6a1f">Reviews &amp; Verdicts</text>

  <rect x="360" y="276" width="480" height="3" fill="#d8d0bd"/>
  <rect x="360" y="282" width="480" height="1" fill="#d8d0bd"/>

  <text x="600" y="338" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="27" font-style="italic" fill="#3d382d">We read the fine print on AI trading platforms so you don&apos;t have to.</text>

  ${listSvg}
  ${overflow}

  <text x="600" y="580" text-anchor="middle" font-family="'IBM Plex Mono', monospace" font-size="16" letter-spacing="4" fill="#6b6455">${dateline}</text>
</svg>`

const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await page.goto(dataUrl)
await page.waitForTimeout(500)
await page.screenshot({ path: 'public/og-image.png' })
await browser.close()
console.log(`wrote public/og-image.png (${archive.count} platforms listed)`)
