// Crawls the bitcointechtalk.com listing pages (root + /page/2../page/254)
// and writes scripts/catalog.json with the real platform name + slug per card.
// The site blocks bursty traffic - this runs gently (2 workers, ~1.3 req/s)
// and checkpoints every page into scripts/crawl-parts/ so re-runs only refetch
// missing pages. Delete scripts/crawl-parts/ to force a full refresh.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'https://bitcointechtalk.com'
const CONCURRENCY = 2
const PART_DIR = join(process.cwd(), 'scripts', 'crawl-parts')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(url, attempt = 0) {
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
      // Bot wall - wait it out once, then give up on this page.
      if (attempt < 1) {
        await sleep(20000)
        return fetchPage(url, attempt + 1)
      }
      throw new Error(`HTTP ${res.status} (bot wall)`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempt < 3) {
      await sleep(2000 * (attempt + 1))
      return fetchPage(url, attempt + 1)
    }
    throw err
  }
}

function parseCards(html) {
  // Cards are <article class="btt-card"> blocks; the title anchor points at
  // https://bitcointechtalk.com/trading/<slug>-review.
  const cards = []
  const blocks = html.split(/<article\s+class="btt-card/)
  for (const block of blocks.slice(1)) {
    const link = block.match(/href="[^"]*\/trading\/([a-z0-9-]+-review)"[^>]*>\s*([\s\S]*?)\s*<\/a>/)
    if (!link) continue
    const slug = link[1].replace(/-review$/, '')
    const rawTitle = link[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!rawTitle || cards.some((c) => c.slug === slug)) continue
    const nameMatch = rawTitle.match(/^(.*?)\s*Review:/)
    const name = nameMatch
      ? nameMatch[1].trim()
      : slug
          .split('-')
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
          .join(' ')
    const date = block.match(/([A-Z][a-z]{2} \d{1,2}, 2026)/)
    const read = block.match(/(\d{1,2} min read)/)
    cards.push({
      slug,
      name,
      sourcePath: `/trading/${slug}-review`,
      sourceDate: date ? date[1] : null,
      sourceReadTime: read ? read[1] : null,
    })
  }
  return cards
}

async function main() {
  mkdirSync(PART_DIR, { recursive: true })

  // The site keeps growing - read the current pagination total from page 1.
  const firstHtml = await fetchPage(BASE)
  const TOTAL_PAGES =
    Math.max(0, ...[...firstHtml.matchAll(/\/page\/(\d+)\//g)].map((m) => Number(m[1]))) ||
    Math.max(0, ...[...firstHtml.matchAll(/page\/(\d+)"/g)].map((m) => Number(m[1]))) ||
    254
  console.log(`pagination total: ${TOTAL_PAGES} pages`)

  const queue = []
  const urls = [BASE, ...Array.from({ length: TOTAL_PAGES - 1 }, (_, i) => `${BASE}/page/${i + 2}`)]
  const parts = []
  const failures = []

  for (let i = 0; i < urls.length; i++) {
    const partFile = join(PART_DIR, `page-${i + 1}.json`)
    if (existsSync(partFile)) {
      parts.push(JSON.parse(readFileSync(partFile, 'utf8')))
    } else {
      queue.push({ i, url: urls[i], partFile })
    }
  }

  let cursor = 0
  async function worker() {
    while (cursor < queue.length) {
      const { i, url, partFile } = queue[cursor++]
      try {
        const html = await fetchPage(url)
        const cards = parseCards(html)
        if (cards.length === 0) {
          // The last listing pages carry non-trading articles (Bitcoin Core
          // development posts) - legitimately out of scope, not a failure.
          const part = { page: i + 1, cards: [], nonTrading: true }
          writeFileSync(partFile, JSON.stringify(part))
          parts.push(part)
          process.stdout.write(`\rpage ${i + 1}/${TOTAL_PAGES} (non-trading)`)
        } else {
          const part = { page: i + 1, cards }
          writeFileSync(partFile, JSON.stringify(part))
          parts.push(part)
          process.stdout.write(`\rpage ${i + 1}/${TOTAL_PAGES} (+${cards.length} cards)`)
        }
      } catch (err) {
        failures.push({ page: i + 1, error: String(err.message || err) })
        process.stdout.write(`\rpage ${i + 1}/${TOTAL_PAGES} FAILED (${String(err.message || err).slice(0, 40)})`)
      }
      await sleep(1500)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write('\n')

  const catalog = []
  const bySlug = new Map()
  for (const part of parts) {
    for (const card of part.cards) {
      if (bySlug.has(card.slug)) continue
      bySlug.set(card.slug, card)
      catalog.push({ ...card })
    }
  }

  // The handwritten slugs (31) must not be regenerated - read them via the
  // index.js PAGINATED export.
  const { PAGINATED } = await import('../src/data/reviews/index.js')
  const handwritten = new Set(PAGINATED.map((r) => r.slug))
  const filtered = catalog.filter((c) => !handwritten.has(c.slug))
  const dropped = catalog.length - filtered.length

  const out = {
    fetched: new Date().toISOString(),
    source: BASE,
    totalPages: TOTAL_PAGES,
    failures,
    droppedHandwritten: dropped,
    entries: filtered,
  }
  writeFileSync(join(process.cwd(), 'scripts', 'catalog.json'), JSON.stringify(out, null, 2))

  const count = filtered.length
  console.log(`done: ${count} entries (${catalog.length} raw, ${dropped} dropped as handwritten), ${failures.length} failed pages`)
  if (count < 2450 || count > 2540) {
    console.error(`UNEXPECTED COUNT ${count} - expected 2450-2540`)
    process.exit(1)
  }
  if (failures.length) {
    console.error('failed pages:', failures.map((f) => f.page).join(', '))
    process.exit(1)
  }
}

main()
