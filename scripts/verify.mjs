// Sample-based smoke suite for the review archive.
// Run with the dev server up (`npm run dev` on port 5188), then:
//   node scripts/verify.mjs
// Data checks run first, then browser checks against the running app.
// Set VERIFY_BASE to point elsewhere (e.g. a preview deploy).
import { chromium } from 'file:///C:/Users/samee/node_modules/playwright/index.mjs'
import { readArchive, readChunk } from './lib/archive-node.mjs'
import { hashString, mulberry32 } from './gen/lib/rng.js'

const BASE = process.env.VERIFY_BASE || 'http://localhost:5188'

let passed = 0
const errors = []
const ok = (cond, label) => {
  if (cond) passed++
  else errors.push(label)
}

// Deterministic sample so failures reproduce across runs.
const seeded = mulberry32(hashString('verify'))
const sample = (arr, n) => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seeded() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

// ---- data checks ----------------------------------------------------------

const archive = readArchive()
const samples = sample(archive.articles, 15)

ok(archive.count >= 2450, `archive count ${archive.count} >= 2450`)
ok(archive.bySlug.size === archive.count, 'bySlug covers every entry')
ok(archive.featured.rating === Math.max(...archive.articles.map((r) => r.rating)), 'featured is the top-rated review')

for (const entry of samples) {
  const chunk = readChunk(entry.chunkId)
  const body = chunk[entry.slug]
  ok(!!body, `${entry.slug}: body present in chunk-${entry.chunkId}`)
  if (!body) continue
  ok(body.intro?.length === 3, `${entry.slug}: intro has 3 paragraphs`)
  ok(body.faqs?.length === 5, `${entry.slug}: 5 faqs`)
  ok(body.steps?.length === 3, `${entry.slug}: 3 steps`)
  ok(body.whatItClaims?.length >= 4, `${entry.slug}: 4+ claims`)
  ok(body.redFlags?.length >= 3, `${entry.slug}: 3+ red flags`)
  const mean = (Object.values(entry.scorecard).reduce((s, d) => s + d, 0) / 5).toFixed(1)
  ok(Number(mean) === entry.rating, `${entry.slug}: rating matches scorecard mean`)
  ok(entry.path === `/trading/${entry.slug}-review`, `${entry.slug}: canonical path shape`)
}

// ---- browser checks -------------------------------------------------------

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const consoleErrors = new Map()

async function newPage(width, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on('pageerror', (err) => consoleErrors.set(page, err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.set(page, msg.text())
  })
  return page
}

const totalPages = Math.ceil(archive.count / 9)

// Home at desktop: 9 cards, windowed pagination.
{
  const page = await newPage(1440)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  ok((await page.$$('.review-card:not(.review-card--skeleton)')).length === 9, 'home shows 9 cards at 1440px')
  const pager = await page.textContent('.pagination')
  ok(pager.includes('1') && pager.includes('2') && pager.includes('…') && pager.includes(String(totalPages)), 'pagination window shows 1, 2, ellipsis, last page')
  const stats = await page.textContent('.hero__stats')
  ok(stats.includes(String(archive.count)), 'hero stat shows the real review count')
  ok(!(await page.$('.hero__stats .skeleton')), 'no skeleton remains after load')
  await page.close()
}

// Deep page renders and out-of-range clamps.
{
  const page = await newPage(1440)
  await page.goto(`${BASE}/page/${totalPages}`, { waitUntil: 'networkidle' })
  ok((await page.$$('.review-card:not(.review-card--skeleton)')).length >= 1, `last page (${totalPages}) renders cards`)
  const active = await page.textContent('.pagination__num.is-active')
  ok(active.trim() === String(totalPages), 'last page number is active')
  await page.goto(`${BASE}/page/9999`, { waitUntil: 'networkidle' })
  const active2 = await page.textContent('.pagination__num.is-active')
  ok(active2.trim() === String(totalPages), 'page 9999 clamps to the last page')
  await page.close()
}

// Search works and caps.
{
  const page = await newPage(1440)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.fill('.searchbox input', 'aurora')
  await page.waitForTimeout(300)
  const cards = (await page.$$('.review-card:not(.review-card--skeleton)')).length
  ok(cards >= 1, `search "aurora" returns results (${cards})`)
  const aside = await page.textContent('.section-head')
  ok(aside.includes('result'), 'search aside shows result count')
  await page.fill('.searchbox input', 'a')
  await page.waitForTimeout(300)
  const capText = await page.textContent('.section-head')
  ok(capText.includes('Showing first 90'), 'broad search caps at 90 results')
  await page.fill('.searchbox input', '')
  await page.waitForTimeout(300)
  ok((await page.$$('.review-card:not(.review-card--skeleton)')).length === 9, 'clearing search restores the grid')
  await page.close()
}

// Sampled review pages render fully.
for (const entry of samples.slice(0, 8)) {
  const page = await newPage(1440)
  await page.goto(`${BASE}${entry.path}`, { waitUntil: 'networkidle' })
  const h1 = await page.textContent('.article-head__title')
  ok(h1.trim() === entry.headline, `${entry.slug}: headline renders`)
  const facts = (await page.$$('.facts__row')).length
  ok(facts >= 5, `${entry.slug}: facts table renders (${facts} rows)`)
  ok((await page.$$('.scorecard__row')).length === 5, `${entry.slug}: 5 scorecard rows`)
  ok((await page.$$('.faq__item')).length === 5, `${entry.slug}: 5 faqs`)
  ok(!!(await page.$('#review-jsonld')), `${entry.slug}: review JSON-LD injected`)
  const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
  ok(canonical === `https://traderai.ai/${entry.path.replace(/^\//, '')}`, `${entry.slug}: canonical URL correct`)
  ok(!consoleErrors.has(page), `${entry.slug}: no console errors`)
  await page.close()
}

// Legacy route redirects to the canonical path.
{
  const page = await newPage(1440)
  await page.goto(`${BASE}/review/${samples[0].slug}`, { waitUntil: 'networkidle' })
  ok(new URL(page.url()).pathname === samples[0].path, 'legacy /review/<slug> redirects to canonical path')
  await page.close()
}

// Offer pages render from the manifest alone.
for (const entry of samples.slice(0, 3)) {
  const page = await newPage(1440)
  await page.goto(`${BASE}/go/${encodeURIComponent(entry.keyword)}`, { waitUntil: 'networkidle' })
  const brand = await page.textContent('.funnel-hero__brand')
  ok(brand.trim() === entry.name, `${entry.slug}: offer page brand matches`)
  ok(!!(await page.$('.funnel-hero__formwrap input[type="email"], .funnel-hero__formwrap input[name="email"]')), `${entry.slug}: signup form present`)
  ok(!consoleErrors.has(page), `${entry.slug}: offer page no console errors`)
  await page.close()
}

// 404 page.
{
  const page = await newPage(1440)
  await page.goto(`${BASE}/nope-404`, { waitUntil: 'networkidle' })
  ok(!!(await page.$('.notfound')), 'unknown route shows the 404 page')
  await page.close()
}

// Responsive: no horizontal overflow, correct column counts.
for (const [width, cols, cards] of [[1024, 2, 10], [390, 1, 10]]) {
  const page = await newPage(width)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok(overflow <= 0, `no horizontal overflow at ${width}px`)
  ok((await page.$$('.review-card:not(.review-card--skeleton)')).length === cards, `${cards} cards at ${width}px`)
  await page.close()
}

await browser.close()

// ---- report ---------------------------------------------------------------

console.log(`\n${passed} passed, ${errors.length} failed`)
if (errors.length) {
  for (const err of errors) console.error('FAIL:', err)
  process.exit(1)
}
console.log('all checks passed')
