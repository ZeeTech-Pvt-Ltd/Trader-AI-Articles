'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SectionHead from './SectionHead.jsx'
import ReviewCard from './ReviewCard.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import { loadManifest } from '../lib/client-data.js'

// Windowed pager: always the first and last page, the current page, and one
// neighbour each side. Gaps render as dots.
function pageWindow(page, totalPages) {
  const wanted = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b)
  const items = []
  for (let i = 0; i < wanted.length; i++) {
    if (i > 0 && wanted[i] - wanted[i - 1] > 1) items.push({ gap: true })
    items.push({ n: wanted[i] })
  }
  return items
}

function Pagination({ page, totalPages }) {
  return (
    <nav className="pagination" aria-label="Reviews pages">
      {page > 1 && (
        <Link className="pagination__link" href={page === 2 ? '/' : `/page/${page - 1}`}>
          ← Previous
        </Link>
      )}
      {pageWindow(page, totalPages).map((item, i) =>
        item.gap ? (
          <span className="pagination__gap" aria-hidden="true" key={`gap-${i}`}>
            …
          </span>
        ) : (
          <Link
            key={item.n}
            href={item.n === 1 ? '/' : `/page/${item.n}`}
            className={`pagination__num ${item.n === page ? 'is-active' : ''}`}
            aria-current={item.n === page ? 'page' : undefined}
          >
            {item.n}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link className="pagination__link" href={`/page/${page + 1}`}>
          Next →
        </Link>
      )}
    </nav>
  )
}

const resultCap = 90

// The search island: server-rendered cards hydrate as-is; on mobile the grid
// re-slices to 10-per-page (matching the old 9/10 breakpoint behavior).
export default function SearchGrid({ page, totalPages, initialReviews }) {
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(initialReviews)
  const [archive, setArchive] = useState(null)
  const [compact, setCompact] = useState(false)

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  // Mobile: 10 per page (server pre-built 9).
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const apply = () => setCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Load the full manifest lazily. Search needs it immediately on first
  // input; the mobile 10-per-page re-slice is a progressive enhancement that
  // waits a few seconds so it never competes with first paint.
  useEffect(() => {
    if (!compact && !searching) return
    if (searching) {
      loadManifest().then(setArchive).catch(() => {})
      return
    }
    const id = setTimeout(() => {
      loadManifest().then(setArchive).catch(() => {})
    }, 3000)
    return () => clearTimeout(id)
  }, [compact, searching])

  // Recompute the displayed cards whenever query / breakpoint / archive change.
  useEffect(() => {
    if (searching && archive) {
      const results = archive.articles.filter((r) =>
        [r.name, r.headline, r.keyword, r.byline].some(
          (field) => field && String(field).toLowerCase().includes(q),
        ),
      )
      setShown(results.slice(0, resultCap))
      return
    }
    if (!searching && compact && archive) {
      const pageSize = 10
      const slice = archive.articles.slice((page - 1) * pageSize, page * pageSize)
      setShown(slice.length ? slice : initialReviews)
      return
    }
    setShown(initialReviews)
  }, [q, searching, compact, archive, page, initialReviews])

  const resultCount = useMemo(() => {
    if (!searching || !archive) return 0
    return archive.articles.filter((r) =>
      [r.name, r.headline, r.keyword, r.byline].some(
        (field) => field && String(field).toLowerCase().includes(q),
      ),
    ).length
  }, [archive, searching, q])

  return (
    <>
      <SectionHead
        kicker={page === 1 ? 'Latest reviews' : ''}
        title={page === 1 ? 'Every platform we’ve reviewed' : 'More platform reviews'}
        aside={
          searching
            ? resultCount > resultCap
              ? `Showing first ${resultCap} of ${resultCount} results for “${query.trim()}” - refine your search`
              : `${resultCount} result${resultCount === 1 ? '' : 's'} for “${query.trim()}”`
            : page === 1
              ? 'New reviews added regularly'
              : `Page ${page} of ${totalPages}`
        }
      />

      <div className="searchbox">
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Search reviews by platform, keyword or author…"
          aria-label="Search reviews"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="searchbox__clear"
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>

      {searching && resultCount === 0 ? (
        <div className="noresults">
          Nothing matched “{query.trim()}”. Try a platform name like BTC, or clear the
          search to see every review.
        </div>
      ) : (
        <>
          <div className="review-grid">
            {shown.map((review) => (
              <Reveal key={review.slug}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </div>
          {!searching && <Pagination page={page} totalPages={totalPages} />}
        </>
      )}
    </>
  )
}
