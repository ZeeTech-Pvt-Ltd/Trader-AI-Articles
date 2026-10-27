// Generates public/sitemap.xml from the generated review archive + static routes.
// Run after regenerating reviews: node scripts/gen-sitemap.mjs
import { writeFileSync } from 'node:fs'
import { readdirSync, existsSync, statSync } from 'node:fs'
import { readArchive } from './lib/archive-node.mjs'

// Legal pages are noindexed - they stay out of the sitemap too.
const STATIC = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: '2026-09-08' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly', lastmod: '2026-09-08' },
]

const archive = readArchive()

const url = (loc, lastmod, changefreq, priority) =>
  `  <url><loc>https://traderai.ai${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`

// Pagination pages (/page/2, …) are noindexed - they stay out of the sitemap
// too. Review articles are still reachable through the pagination links.
// Drop-folder posts (content/posts/<type>/<slug>.json) served under /articles/.
const DROP = 'content/posts'
const dropEntries = existsSync(DROP)
  ? readdirSync(DROP, { withFileTypes: true }).filter((d) => d.isDirectory()).flatMap((d) =>
      readdirSync(`${DROP}/${d.name}`).filter((f) => f.endsWith('.json')).map((f) =>
        url(`/articles/${d.name}/${f.slice(0, -5)}`, statSync(`${DROP}/${d.name}/${f}`).mtime.toISOString().slice(0, 10), 'monthly', '0.8')))
  : []

const entries = [
  ...STATIC.map((s) => url(s.loc, s.lastmod, s.changefreq, s.priority)),
  ...archive.articles.map((r) => url(r.path, r.isoDate, 'monthly', '0.9')),
  ...dropEntries,
]

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
)
console.log(`wrote public/sitemap.xml (${entries.length} URLs: ${archive.count} reviews + ${STATIC.length} static) - pagination and legal pages are noindexed`)
