// Crawls ai-trading-platform.com (second content source) and writes
// scripts/catalog-ai-trading-platform.json with only the reviews that are
// NOT yet in the local archive. For each missing slug it fetches the article
// page to extract the platform name, date and read time.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { readArchive } from './lib/archive-node.mjs'

const BASE = 'https://ai-trading-platform.com'
const OUT = join(process.cwd(), 'scripts', 'catalog-ai-trading-platform.json')
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

const listingCards = (html) => {
  const out = []
  for (const m of html.matchAll(/href="\/trading\/([a-z0-9-]+-review)"/g)) {
    const slug = m[1].replace(/-review$/, '')
    if (!out.includes(slug)) out.push(slug)
  }
  return out
}
const maxPage = (html, prefix) => {
  const pages = [...html.matchAll(new RegExp(`href="${prefix}/page/(\\d+)"`, 'g'))].map((m) => Number(m[1]))
  return pages.length ? Math.max(...pages) : 1
}

// ---- listing crawl --------------------------------------------------------
const reviewsHtml = await fetchHtml(`${BASE}/reviews`)
const articlesHtml = await fetchHtml(`${BASE}/articles`)
const reviewsPages = maxPage(reviewsHtml, '/reviews')
const articlesPages = maxPage(articlesHtml, '/articles')
console.log(`reviews pages: ${reviewsPages}, articles pages: ${articlesPages}`)

const slugs = new Set()
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
      for (const slug of listingCards(await fetchHtml(url))) slugs.add(slug)
      process.stdout.write(`\r${cursor}/${queue.length} (${slugs.size} unique)`)
    } catch (err) {
      failures.push(url)
    }
    await sleep(600)
  }
}
await Promise.all(Array.from({ length: 3 }, worker))
process.stdout.write('\n')

const archive = readArchive()
const missing = [...slugs].filter((s) => !archive.bySlug.has(s))
console.log(`source total: ${slugs.size}, missing on our site: ${missing.length}`)

// ---- article-page details for the missing slugs ---------------------------
const entries = []
for (let i = 0; i < missing.length; i++) {
  const slug = missing[i]
  try {
    const html = await fetchHtml(`${BASE}/trading/${slug}-review`)
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
    const title = (h1 ? h1[1] : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const nameMatch = title.match(/^(.*?)\s*Review/i)
    const name = nameMatch
      ? nameMatch[1].trim()
      : slug.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
    const date = html.match(/([A-Z][a-z]{2} \d{1,2}, 2026)/)?.[1] || null
    const read = html.match(/(\d{1,2} min read)/)?.[1] || null
    entries.push({ slug, name, sourcePath: `/trading/${slug}-review`, sourceDate: date, sourceReadTime: read })
    process.stdout.write(`\rarticle ${i + 1}/${missing.length}: ${name} (${date || 'no date'})`)
  } catch (err) {
    failures.push(`${BASE}/trading/${slug}-review`)
    process.stdout.write(`\rarticle ${i + 1}/${missing.length}: ${slug} FAILED`)
  }
  await sleep(600)
}
process.stdout.write('\n')

writeFileSync(
  OUT,
  JSON.stringify({ fetched: new Date().toISOString(), source: BASE, failures, entries }, null, 2),
)
console.log(`wrote ${OUT} (${entries.length} entries, ${failures.length} failures)`)
