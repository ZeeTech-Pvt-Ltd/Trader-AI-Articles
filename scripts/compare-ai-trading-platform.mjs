// Compares ai-trading-platform.com's review archive against the local
// archive. Crawls /reviews/page/N and /articles/page/N listings, then diffs
// the /trading/<slug> slugs. Read-only.
import { readArchive } from './lib/archive-node.mjs'

const BASE = 'https://ai-trading-platform.com'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchHtml(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(25000),
    })
    if (res.status === 403 || res.status === 429) {
      if (attempt < 1) {
        await sleep(15000)
        return fetchHtml(url, attempt + 1)
      }
      throw new Error(`HTTP ${res.status}`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempt < 3) {
      await sleep(1500 * (attempt + 1))
      return fetchHtml(url, attempt + 1)
    }
    throw err
  }
}

function cards(html) {
  const out = []
  for (const m of html.matchAll(/href="\/trading\/([a-z0-9-]+-review)"/g)) {
    const slug = m[1].replace(/-review$/, '')
    if (!out.includes(slug)) out.push(slug)
  }
  return out
}

function maxPage(html, prefix) {
  const pages = [...html.matchAll(new RegExp(`href="${prefix}/page/(\\d+)"`, 'g'))].map((m) => Number(m[1]))
  return pages.length ? Math.max(...pages) : 1
}

// Discover pagination totals from the first listing pages.
const reviewsHtml = await fetchHtml(`${BASE}/reviews`)
const articlesHtml = await fetchHtml(`${BASE}/articles`)
const reviewsPages = maxPage(reviewsHtml, '/reviews')
const articlesPages = maxPage(articlesHtml, '/articles')
console.log(`reviews pages: ${reviewsPages}, articles pages: ${articlesPages}`)

const slugs = new Map()
const queue = [
  ...Array.from({ length: reviewsPages }, (_, i) => `${BASE}/reviews${i === 0 ? '' : `/page/${i + 1}`}`),
  ...Array.from({ length: articlesPages }, (_, i) => `${BASE}/articles${i === 0 ? '' : `/page/${i + 1}`}`),
]
let cursor = 0
const failures = []
async function worker() {
  while (cursor < queue.length) {
    const url = queue[cursor++]
    try {
      const html = await fetchHtml(url)
      for (const slug of cards(html)) if (!slugs.has(slug)) slugs.set(slug, url)
      process.stdout.write(`\r${cursor}/${queue.length} (${slugs.size} unique slugs)`)
    } catch (err) {
      failures.push(url)
    }
    await sleep(600)
  }
}
await Promise.all(Array.from({ length: 3 }, worker))
process.stdout.write('\n')

const archive = readArchive()
const ours = new Set(archive.bySlug.keys())
const missing = [...slugs.keys()].filter((s) => !ours.has(s))
const extra = [...ours].filter((s) => !slugs.has(s))

console.log(`\nsource reviews: ${slugs.size}`)
console.log(`on Trader AI: ${archive.count}`)
console.log(`missing on our site: ${missing.length}`)
console.log(`on our site but not on this source: ${extra.length}`)
if (missing.length) {
  console.log('\n--- missing slugs ---')
  console.log(missing.join(', '))
}
if (failures.length) console.log(`failed pages: ${failures.length}`)
