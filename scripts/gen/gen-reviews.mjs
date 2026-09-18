// Generates src/data/reviews/manifest.json and src/data/reviews/generated/
// chunk-NNN.json from:
//   - the 31 handwritten reviews (src/data/reviews/index.js PAGINATED, verbatim)
//   - scripts/catalog.json (crawled bitcointechtalk listings), when present
//
// Fully deterministic: the same inputs always produce the same bytes, so the
// script is safe to re-run. `node scripts/gen-reviews.mjs --manifest-only`
// regenerates just the manifest (fast path after editing handwritten reviews).
// Validators fail loudly on any copy-rule or shape violation.
import { mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { hashString, rngFor } from './lib/rng.js'
import { buildArticle } from './lib/article.js'
import { ratingOf, isoDateOf, pathOf, excerptOf, ctaUrlOf } from './lib/compute.js'
import { POOLS } from './lib/pools.js'
import { render } from './lib/templates.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')
const REVIEWS_DIR = join(ROOT, 'src', 'data', 'reviews')
const CHUNK_DIR = join(REVIEWS_DIR, 'generated')
const MANIFEST_PATH = join(REVIEWS_DIR, 'manifest.json')
const CATALOG_PATH = join(ROOT, 'scripts', 'catalog.json')
const CATALOG2_PATH = join(ROOT, 'scripts', 'catalog-ai-trading-platform.json')
const OVERRIDES_PATH = join(__dirname, 'overrides.json')

// Per-article overrides (slug -> { ctaUrl?, headline?, seoTitle?,
// seoDescription?, deck?, name? }). A custom ctaUrl overrides the derived
// Austerio URL; the other fields override the generated copy for that review.
const overrides = existsSync(OVERRIDES_PATH) ? JSON.parse(readFileSync(OVERRIDES_PATH, 'utf8')) : {}
const OVERRIDE_FIELDS = ['name', 'headline', 'seoTitle', 'seoDescription', 'deck', 'ctaUrl']

function applyOverrides(review) {
  const patch = overrides[review.slug]
  if (!patch || typeof patch !== 'object') return review
  const next = { ...review }
  for (const field of OVERRIDE_FIELDS) {
    if (patch[field] !== undefined) next[field] = patch[field]
  }
  // A changed headline carries the SEO title with it unless one is given.
  if (patch.headline && patch.seoTitle === undefined && patch.headline !== review.headline) {
    next.seoTitle = patch.headline
  }
  return next
}

const DIM_KEYS = ['easeOfUse', 'features', 'transparency', 'security', 'support']
const BODY_FIELDS = [
  'tagline', 'seoTitle', 'seoDescription', 'deck', 'targetMarket',
  'depositMethods', 'support', 'intro', 'whatItClaims', 'whatWeChecked',
  'steps', 'pros', 'cons', 'redFlags', 'faqs', 'bottomLine', 'domain',
]
const CHUNK_SIZE = 10
const manifestOnly = process.argv.includes('--manifest-only')

// ---- inputs ---------------------------------------------------------------

const { PAGINATED } = await import(pathToFileURL(join(REVIEWS_DIR, 'index.js')).href)
const handwritten = PAGINATED

// Two content sources feed the archive: bitcointechtalk.com (catalog.json)
// and ai-trading-platform.com (catalog-ai-trading-platform.json). The second
// catalog holds only reviews missing from the first, and duplicates across
// catalogs are skipped at generation time.
const catalog = existsSync(CATALOG_PATH) ? JSON.parse(readFileSync(CATALOG_PATH, 'utf8')) : null
const catalog2 = existsSync(CATALOG2_PATH) ? JSON.parse(readFileSync(CATALOG2_PATH, 'utf8')) : null
const generatedSources = [catalog, catalog2].filter(Boolean)
if (!generatedSources.length) console.log('no catalogs found - generating fixture from the 31 handwritten reviews only')

// ---- build all articles ---------------------------------------------------

function manifestEntry(review, chunkId, customCtaUrl) {
  const entry = {
    s: review.slug,
    k: review.keyword ?? review.name,
    n: review.name,
    h: review.headline,
    b: review.byline,
    d: review.date,
    i: isoDateOf(review.date),
    t: review.readTime,
    r: review.rating,
    v: review.verdict,
    a: review.accent,
    p: pathOf(review.slug),
    // e = excerpt (cards/search); the full deck lives in the body chunk so
    // the manifest stays as small as possible.
    e: excerptOf(review.deck),
    m: review.minimumDeposit,
    c: DIM_KEYS.map((key) => review.scorecard[key]),
    g: chunkId,
  }
  if (customCtaUrl && customCtaUrl !== ctaUrlOf(review.name)) entry.u = customCtaUrl
  return entry
}

function bodyOf(review, customCtaUrl) {
  const body = {}
  for (const field of BODY_FIELDS) if (review[field] !== undefined) body[field] = review[field]
  if (customCtaUrl && customCtaUrl !== ctaUrlOf(review.name)) body.ctaUrl = customCtaUrl
  return body
}

const all = []
for (const rawReview of handwritten) {
  all.push({ review: applyOverrides(rawReview), generated: false })
}
{
  const seen = new Set(handwritten.map((r) => r.slug))
  let index = handwritten.length
  for (const cat of generatedSources) {
    for (const entry of cat.entries) {
      if (seen.has(entry.slug)) continue
      seen.add(entry.slug)
      const built = buildArticle(entry, index, rngFor(entry.slug))
      all.push({ review: applyOverrides(built), generated: true })
      index++
    }
  }
}

// The listing shows newest first (same sort as archive.js), so dedupe decks in
// that display order - Sep 15, then Sep 14, and so on. Stable within a date.
all.sort((a, b) => (isoDateOf(a.review.date) < isoDateOf(b.review.date) ? 1 : isoDateOf(a.review.date) > isoDateOf(b.review.date) ? -1 : 0))

// Adjacent duplicate decks read badly in a grid. Rendered decks embed the
// platform name, so collisions are rare - but a placeholder-less pattern can
// repeat when two neighbours share a deposit amount. Step such decks forward
// through the pool until they differ from the previous article (deterministic).
{
  let prevDeck = null
  for (let i = 0; i < all.length; i++) {
    let { deck } = all[i].review
    if (deck === prevDeck) {
      const { name, minimumDeposit, assets, rating } = all[i].review
      const ctx = { name, min: minimumDeposit, assets: String(assets ?? 10), rating: rating.toFixed(1) }
      const rendered = POOLS.deck.map((t) => render(t, ctx))
      let idx = rendered.indexOf(deck)
      for (let steps = 0; steps < POOLS.deck.length && rendered[(idx + 1) % POOLS.deck.length] === prevDeck; steps++) {
        idx = (idx + 1) % POOLS.deck.length
      }
      deck = rendered[(idx + 1) % POOLS.deck.length]
      all[i].review = { ...all[i].review, deck, excerpt: excerptOf(deck) }
    }
    prevDeck = deck
  }
}

// ---- validators -----------------------------------------------------------

const errors = []
const check = (condition, message) => {
  if (!condition) errors.push(message)
}

const seenSlugs = new Set()
const seenPaths = new Set()
const seenSignatures = new Set()
let prevDeck = null
let prevHeadline = null
let cautionCount = 0
const bylineCounts = new Map()
let generatedCount = 0

for (const { review, generated } of all) {
  const { slug, headline, deck } = review
  check(!seenSlugs.has(slug), `duplicate slug: ${slug}`)
  seenSlugs.add(slug)
  const path = pathOf(slug)
  check(!seenPaths.has(path), `duplicate path: ${path}`)
  seenPaths.add(path)

  // Shape
  for (const field of ['slug', 'keyword', 'name', 'tagline', 'headline', 'seoTitle', 'seoDescription', 'deck', 'date', 'readTime', 'byline', 'accent', 'verdict', 'targetMarket', 'minimumDeposit', 'depositMethods', 'support', 'scorecard', 'intro', 'whatItClaims', 'whatWeChecked', 'steps', 'pros', 'cons', 'redFlags', 'faqs', 'bottomLine']) {
    check(review[field] !== undefined, `${slug}: missing field ${field}`)
  }
  check(Array.isArray(review.faqs) && review.faqs.length === 5, `${slug}: faqs must be exactly 5`)
  check(review.steps.length === 3, `${slug}: steps must be exactly 3`)
  check(review.intro.length === 3, `${slug}: intro must be exactly 3 paragraphs`)
  for (const key of DIM_KEYS) {
    check(typeof review.scorecard?.[key] === 'number', `${slug}: scorecard missing ${key}`)
  }

  // Computed-field consistency
  check(review.rating === ratingOf(review.scorecard), `${slug}: rating ${review.rating} != mean(scorecard) ${ratingOf(review.scorecard)}`)

  // Copy rules (all user-visible strings)
  const strings = [
    review.headline, review.seoTitle, review.seoDescription, review.deck,
    review.tagline, review.targetMarket, review.minimumDeposit,
    review.depositMethods, review.support, review.verdict,
    ...review.intro, ...review.whatItClaims, ...review.whatWeChecked,
    ...review.steps.map((s) => `${s.title} ${s.text}`),
    ...review.pros, ...review.cons, ...review.redFlags, ...review.bottomLine,
    ...review.faqs.flatMap((f) => [f.q, f.a]),
  ]
  for (const text of strings) {
    check(!text.includes('—') && !text.includes('–'), `${slug}: em/en dash in copy`)
    check(!text.includes('AU$') && !/\+61\s/.test(text), `${slug}: Australia-specific wording`)
    check(!/\{(name|min|assets|rating)\}/.test(text), `${slug}: unrendered placeholder`)
  }

  // Uniqueness
  if (generated) {
    const signature = hashString(
      [...review.whatItClaims, ...review.whatWeChecked, ...review.cons, ...review.redFlags, ...review.faqs.map((f) => f.q)].join('|'),
    )
    check(!seenSignatures.has(signature), `${slug}: duplicate article signature`)
    seenSignatures.add(signature)
    if (review.verdict.startsWith('CAUTION')) cautionCount++
    bylineCounts.set(review.byline, (bylineCounts.get(review.byline) || 0) + 1)
    generatedCount++
  }
  check(deck !== prevDeck, `${slug}: deck identical to previous article`)
  check(headline !== prevHeadline, `${slug}: headline identical to previous article`)
  prevDeck = deck
  prevHeadline = headline
}

if (generatedCount > 0) {
  const share = cautionCount / generatedCount
  check(share >= 0.015 && share <= 0.05, `CAUTION share ${(share * 100).toFixed(1)}% outside 1.5-5%`)
  const expected = generatedCount / 9
  for (const [byline, count] of bylineCounts) {
    check(Math.abs(count - expected) / expected < 0.1, `byline ${byline} at ${count}, expected ~${Math.round(expected)}`)
  }
}

if (generatedSources.length) {
  // Assert exactness against the catalogs (duplicates across sources are
  // deduped at build time); the range is a sanity net for crawl corruption.
  const expected =
    handwritten.length + generatedSources.reduce((sum, c) => sum + c.entries.length, 0)
  check(all.length === expected, `total articles ${all.length} != expected ${expected}`)
  check(all.length >= 2450 && all.length <= 3200, `total articles ${all.length} outside 2450-3200`)
}

// ---- write manifest + chunks ----------------------------------------------

const entries = []
const chunkBodies = new Map()
all.forEach(({ review }, index) => {
  const chunkId = Math.floor(index / CHUNK_SIZE)
  const customCtaUrl = review.ctaUrl || null
  entries.push(manifestEntry(review, chunkId, customCtaUrl))
  if (!chunkBodies.has(chunkId)) chunkBodies.set(chunkId, {})
  chunkBodies.get(chunkId)[review.slug] = bodyOf(review, customCtaUrl)
})

// Every entry's chunk must contain its slug.
for (const entry of entries) {
  check(
    chunkBodies.get(entry.g)?.[entry.s],
    `manifest entry ${entry.s} missing from chunk-${String(entry.g).padStart(3, '0')}`,
  )
}

if (errors.length) {
  console.error(`\n${errors.length} VALIDATION ERROR(S):`)
  for (const err of errors.slice(0, 40)) console.error(' -', err)
  if (errors.length > 40) console.error(` ...and ${errors.length - 40} more`)
  process.exit(1)
}

mkdirSync(CHUNK_DIR, { recursive: true })

// Stable key order -> byte-identical re-runs.
const manifest = { v: 1, count: entries.length, articles: entries }
const manifestJson = JSON.stringify(manifest)
writeFileSync(MANIFEST_PATH, manifestJson)
// A plain copy in public/ is what the browser fetches at runtime (see
// archive.js) - index.html preloads it so the download starts with the HTML.
writeFileSync(join(ROOT, 'public', 'manifest.json'), manifestJson)

// Tiny inline home stats (featured review + counts) written into index.html
// so the hero stats and the lead-review card paint on the very first React
// frame, before the big manifest resolves.
{
  const byRating = [...all].sort((a, b) => b.review.rating - a.review.rating)
  const featured = byRating[0].review
  const caution = all.filter((x) => x.review.verdict.startsWith('CAUTION')).length
  const latest = all.reduce((best, x) => (isoDateOf(x.review.date) > isoDateOf(best.review.date) ? x : best), all[0])
  const homeStats = JSON.stringify({
    featured: {
      name: featured.name,
      rating: featured.rating,
      verdict: featured.verdict,
      accent: featured.accent,
      path: pathOf(featured.slug),
      headline: featured.headline,
      deck: featured.deck,
      byline: featured.byline,
      date: featured.date,
      readTime: featured.readTime,
    },
    count: entries.length,
    cautionCount: caution,
    latestDate: latest.review.date,
  })
  const htmlPath = join(ROOT, 'index.html')
  const html = readFileSync(htmlPath, 'utf8')
  writeFileSync(
    htmlPath,
    html.replace(
      /<!-- home-stats:start -->[\s\S]*?<!-- home-stats:end -->/,
      `<!-- home-stats:start -->\n    <script type="application/json" id="home-stats">${homeStats}</script>\n    <!-- home-stats:end -->`,
    ),
  )
}

if (!manifestOnly) {
  const keep = new Set()
  for (const [chunkId, body] of chunkBodies) {
    const file = join(CHUNK_DIR, `chunk-${String(chunkId).padStart(3, '0')}.json`)
    writeFileSync(file, JSON.stringify(body))
    keep.add(`chunk-${String(chunkId).padStart(3, '0')}.json`)
  }
  // Remove chunks that no longer exist (e.g. after catalog shrinks).
  for (const file of readdirSync(CHUNK_DIR)) {
    if (!keep.has(file)) unlinkSync(join(CHUNK_DIR, file))
  }
}

console.log(
  `wrote manifest (${entries.length} entries)${manifestOnly ? ' - manifest only' : ` + ${chunkBodies.size} chunks`}` +
    (generatedCount ? ` - ${generatedCount} generated, ${cautionCount} CAUTION` : ''),
)
