// Fetches poolbay.io review pages and extracts each page's meta title +
// meta description into scripts/poolbay-meta.json (research input for
// original 150-160 char descriptions - never copied).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'scripts', 'poolbay-meta.json')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const slugs = process.argv.slice(2)
if (!slugs.length) {
  console.error('no slugs given')
  process.exit(1)
}
const unique = [...new Set(slugs)]

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

const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

let cursor = 0
async function worker() {
  while (cursor < unique.length) {
    const slug = unique[cursor++]
    if (out[slug]) continue
    try {
      const html = await fetchHtml(`https://poolbay.io/trading/${slug}/`)
      const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || null
      const desc =
        (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] ||
        null
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)
      const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null
      out[slug] = { title, desc, h1 }
      writeFileSync(OUT, JSON.stringify(out, null, 2))
      process.stdout.write(`\r${Object.keys(out).length}/${unique.length}: ${slug}`)
    } catch (err) {
      out[slug] = { title: null, desc: null, h1: null, error: String(err.message || err) }
      writeFileSync(OUT, JSON.stringify(out, null, 2))
      process.stdout.write(`\r${Object.keys(out).length}/${unique.length}: ${slug} FAILED`)
    }
    await sleep(400)
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
process.stdout.write('\n')
console.log(`wrote ${OUT} (${Object.keys(out).length} slugs)`)
