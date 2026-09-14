// Generates public/sitemap.xml from the live reviews data + static routes.
// Run after adding or removing a review: node scripts/gen-sitemap.mjs
import { writeFileSync } from 'node:fs'
import { REVIEWS, TOTAL_PAGES } from '../src/data/reviews/index.js'

const STATIC = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: '2026-09-08' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly', lastmod: '2026-09-08' },
  { loc: '/advertising-disclosure', priority: '0.3', changefreq: 'yearly', lastmod: '2026-09-08' },
  { loc: '/risk-disclosure', priority: '0.3', changefreq: 'yearly', lastmod: '2026-09-08' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly', lastmod: '2026-09-08' },
  { loc: '/terms-of-use', priority: '0.3', changefreq: 'yearly', lastmod: '2026-09-08' },
]

const url = (loc, lastmod, changefreq, priority) =>
  `  <url><loc>https://trader-ai.com${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`

// Archive pages beyond the homepage (/page/2, …)
const archivePages = Array.from({ length: Math.max(0, TOTAL_PAGES - 1) }, (_, i) =>
  url(`/page/${i + 2}`, '2026-09-09', 'monthly', '0.5'),
)

const entries = [
  ...STATIC.map((s) => url(s.loc, s.lastmod, s.changefreq, s.priority)),
  ...REVIEWS.map((r) => url(r.path, r.isoDate, 'monthly', '0.9')),
  ...archivePages,
]

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
)
console.log(`wrote public/sitemap.xml (${entries.length} URLs)`)
