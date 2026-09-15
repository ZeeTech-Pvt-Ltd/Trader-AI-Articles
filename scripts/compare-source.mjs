// Fresh comparison: crawls every bitcointechtalk.com listing page right now
// and diffs the review slugs against the local archive. Read-only - it never
// writes catalog.json or any generated data.
// Run: node scripts/compare-source.mjs
import { readArchive } from './lib/archive-node.mjs'

const BASE = 'https://bitcointechtalk.com'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchHtml(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(25000),
    })
    if (res.status === 403 || res.status === 429) {
      if (attempt < 1) {
        await sleep(20000)
        return fetchHtml(url, attempt + 1)
      }
      throw new Error(`HTTP ${res.status} (bot wall)`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempt < 3) {
      await sleep(2000 * (attempt + 1))
      return fetchHtml(url, attempt + 1)
    }
    throw err
  }
}

function parseCards(html) {
  const cards = []
  const blocks = html.split(/<article\s+class="btt-card/)
  for (const block of blocks.slice(1)) {
    const link = block.match(/href="[^"]*\/trading\/([a-z0-9-]+-review)"[^>]*>\s*([\s\S]*?)\s*<\/a>/)
    if (!link) continue
    const slug = link[1].replace(/-review$/, '')
    const rawTitle = link[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!rawTitle || cards.some((c) => c.slug === slug)) continue
    cards.push({ slug, title: rawTitle })
  }
  return cards
}

// Page 1 also reveals the current pagination total (the site keeps growing).
const firstHtml = await fetchHtml(BASE)
const firstCards = parseCards(firstHtml)
const maxPage =
  Math.max(0, ...[...firstHtml.matchAll(/\/page\/(\d+)\//g)].map((m) => Number(m[1]))) ||
  Math.max(0, ...[...firstHtml.matchAll(/page\/(\d+)"/g)].map((m) => Number(m[1]))) ||
  254
console.log(`source pagination total: ${maxPage} pages`)

const sourceSlugs = new Map()
for (const card of firstCards) sourceSlugs.set(card.slug, card.title)

const queue = Array.from({ length: maxPage - 1 }, (_, i) => i + 2)
let cursor = 0
const failures = []
async function worker() {
  while (cursor < queue.length) {
    const n = queue[cursor++]
    try {
      const html = await fetchHtml(`${BASE}/page/${n}`)
      const cards = parseCards(html)
      for (const card of cards) if (!sourceSlugs.has(card.slug)) sourceSlugs.set(card.slug, card.title)
      if (cards.length === 0) failures.push(n)
      process.stdout.write(`\rpage ${n}/${maxPage} (${sourceSlugs.size} unique slugs)`)
    } catch (err) {
      failures.push(n)
    }
    await sleep(1500)
  }
}
await Promise.all(Array.from({ length: 2 }, worker))
process.stdout.write('\n')

// ---- diff -----------------------------------------------------------------

const archive = readArchive()
const ours = new Set(archive.bySlug.keys())

const missing = [...sourceSlugs.entries()].filter(([slug]) => !ours.has(slug))
const extra = [...ours].filter((slug) => !sourceSlugs.has(slug))

console.log(`\nsource reviews found: ${sourceSlugs.size}`)
console.log(`reviews on Trader AI: ${archive.count}`)
console.log(`on the source but MISSING on our site: ${missing.length}`)
console.log(`on our site but not on the source (removed there?): ${extra.length}`)

if (missing.length) {
  console.log('\n--- missing on our site (slug | title) ---')
  for (const [slug, title] of missing.slice(0, 200)) console.log(`${slug} | ${title}`)
  if (missing.length > 200) console.log(`...and ${missing.length - 200} more`)
}
if (extra.length) {
  console.log('\n--- extras on our site (not on source now) ---')
  for (const slug of extra.slice(0, 100)) console.log(slug)
  if (extra.length > 100) console.log(`...and ${extra.length - 100} more`)
}
if (failures.length) console.log(`\nfailed pages: ${failures.join(', ')}`)
console.log(`\n${missing.length === 0 ? 'COMPLETE: every source review is on our site' : `INCOMPLETE: ${missing.length} source reviews missing`}`)
