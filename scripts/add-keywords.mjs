// Adds ONLY the keywords the user provides - no automatic source mirroring.
// Usage:
//   node scripts/add-keywords.mjs --names "Zorqelix, Aura FX, Bitcode AI"
//   node scripts/add-keywords.mjs slug1 slug2 slug3
// For each keyword it fetches the ai-trading-platform.com article page to
// extract the real platform name + date, then merges into
// scripts/catalog-ai-trading-platform.json (merge-safe, never drops entries).
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const OUT = join(process.cwd(), 'scripts', 'catalog-ai-trading-platform.json')
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempt < 3) {
      await sleep(1200 * (attempt + 1))
      return fetchHtml(url, attempt + 1)
    }
    throw err
  }
}

// Parse argv: --names "A, B" or bare slug args.
let items = []
const namesIdx = process.argv.indexOf('--names')
if (namesIdx !== -1) {
  items = process.argv[namesIdx + 1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }))
} else {
  items = process.argv.slice(2).map((slug) => ({ name: null, slug }))
}
if (!items.length) {
  console.error('no keywords given - pass slugs or --names "A, B"')
  process.exit(1)
}

const catalog = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { entries: [] }
const bySlug = new Map(catalog.entries.map((e) => [e.slug, e]))

for (const item of items) {
  const existing = bySlug.get(item.slug)
  if (existing && item.name === null) {
    console.log(`skip ${item.slug} (already in catalog)`)
    continue
  }
  if (existing && item.name && existing.name === item.name) {
    console.log(`skip ${item.name} (already in catalog)`)
    continue
  }
  let name = item.name
  let sourceDate = null
  let sourceReadTime = null
  try {
    const html = await fetchHtml(`${BASE}/trading/${item.slug}-review`)
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
    const title = (h1 ? h1[1] : '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!name) {
      const m = title.match(/^(.*?)\s*Review/i)
      name = m ? m[1].trim() : item.slug
        .split('-')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ')
      // Strip "Is X Legit? Full 2026" style title fragments.
      const frag = name.match(/^Is (.+?) (?:Legit|Worth It)\? Full(?: 2026)?$/)
      if (frag) name = frag[1].trim()
    }
    sourceDate = html.match(/([A-Z][a-z]{2} \d{1,2}, 2026)/)?.[1] || null
    sourceReadTime = html.match(/(\d{1,2} min read)/)?.[1] || null
  } catch {
    console.log(`fetch failed for ${item.slug} - using the keyword as the name`)
    name = name || item.slug
      .split('-')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }
  bySlug.set(item.slug, {
    slug: item.slug,
    name,
    sourcePath: `/trading/${item.slug}-review`,
    sourceDate,
    sourceReadTime,
  })
  console.log(`added ${name} (${item.slug})${sourceDate ? ' ' + sourceDate : ''}`)
  await sleep(400)
}

catalog.entries = [...bySlug.values()]
catalog.fetched = new Date().toISOString()
catalog.source = BASE
writeFileSync(OUT, JSON.stringify(catalog, null, 2))
console.log(`wrote ${OUT} (${catalog.entries.length} entries)`)
