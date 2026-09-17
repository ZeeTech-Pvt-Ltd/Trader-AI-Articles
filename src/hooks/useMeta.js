import { useEffect } from 'react'
import { SITE } from '../data/site.js'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Per-route SEO: title, description, canonical, Open Graph and Twitter tags.
// appendSite=false skips the "| Trader AI" suffix (used on review pages,
// where the platform name already carries the keyword). robots defaults to
// index, follow; pass "noindex, nofollow" for pages that must stay out of
// search results (legal pages).
export default function useMeta({ title, description, path, appendSite = true, author, robots = 'index, follow' }) {
  useEffect(() => {
    const fullTitle = title
      ? appendSite
        ? `${title} | ${SITE.name}`
        : title
      : `${SITE.name} - ${SITE.tagline}`
    document.title = fullTitle

    const desc = description || SITE.description
    const url = `${SITE.url}${(path || '').replace(/^\//, '')}`

    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', robots)
    if (author) upsertMeta('name', 'author', author)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE.name)
    upsertMeta('property', 'og:image', `${SITE.url}og-image.png`)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', `${SITE.url}og-image.png`)
    upsertMeta('name', 'twitter:image:alt', SITE.name)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description, path])
}
