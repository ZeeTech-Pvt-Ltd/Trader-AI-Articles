// Fetches the site-trust.com review pages for the recent keyword batch and
// saves cleaned text extracts for content inspiration (never copied).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const slugs = [
  'adroite-capitorc','billz-edge','bistar-rastanstvo','bky-capital','bold-gainorelle',
  'capitalx-broking','carlos-capital','champlain-capital','cytcrop','davlat-dasturi',
  'drakmyelo-ixvaren','echo-intelligence','eisnouvo-ai','ewarookad','granite-equitorage',
  'gyors-piacitar','haveningry','heluxkiapp','inishvorn','krest-phuntgrowe',
  'lithvestor','lodeminting','loxaris','meer-dividbrook','metreturneth',
  'mexaro-dulin','nexus-trade-ai','renevex','calderive','exolventra',
  'fossentra','fxalchemist','monstead','pixum-ai','stone-credholm-platform','trilox-ai',
]
const OUT = join(process.cwd(), 'scripts', 'site-trust-extracts')
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchHtml(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    if (attempt < 3) { await sleep(1200 * (attempt + 1)); return fetchHtml(url, attempt + 1) }
    throw err
  }
}

let cursor = 0
const failures = []
async function worker() {
  while (cursor < slugs.length) {
    const slug = slugs[cursor++]
    try {
      const html = await fetchHtml(`https://site-trust.com/reviews/${slug}`)
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
      writeFileSync(join(OUT, `${slug}.txt`), text)
      process.stdout.write(`\r${cursor}/${slugs.length}: ${slug} (${text.length} chars)`)
    } catch (err) {
      failures.push(`${slug}: ${String(err.message || err)}`)
    }
    await sleep(500)
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
process.stdout.write('\n')
console.log('done', slugs.length - failures.length, 'fetched', failures.length, 'failed')
for (const f of failures) console.log(' FAIL:', f)
