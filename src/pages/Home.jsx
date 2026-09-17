import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import useArchive from '../hooks/useArchive.js'
import { PAGE_SIZE, readStaticHomeData } from '../data/reviews/archive.js'
import { RATING_DIMENSIONS } from '../data/site.js'
import ReviewCard from '../components/ReviewCard.jsx'
import Stars from '../components/Stars.jsx'
import VerdictChip from '../components/VerdictChip.jsx'
import SectionHead from '../components/SectionHead.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'

// With hundreds of pages, the pager shows a window: always the first and last
// page, the current page, and one neighbour each side. Gaps render as dots.
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
        <Link className="pagination__link" to={page === 2 ? '/' : `/page/${page - 1}`}>
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
            to={item.n === 1 ? '/' : `/page/${item.n}`}
            className={`pagination__num ${item.n === page ? 'is-active' : ''}`}
            aria-current={item.n === page ? 'page' : undefined}
          >
            {item.n}
          </Link>
        ),
      )}
      {page < totalPages && (
        <Link className="pagination__link" to={`/page/${page + 1}`}>
          Next →
        </Link>
      )}
    </nav>
  )
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// Shimmer cards shown while the review manifest loads (first visit only).
function GridSkeleton() {
  return (
    <div className="review-grid">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div className="review-card review-card--skeleton" key={i}>
          <div className="skeleton skeleton--card-top" />
          <div className="skeleton skeleton--card-title" />
          <div className="skeleton skeleton--line" style={{ width: '90%' }} />
          <div className="skeleton skeleton--line" style={{ width: '70%' }} />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { page: pageParam } = useParams()
  const archive = useArchive()

  // Tablet and mobile run a 2-column (1-column on phones) grid, so they get
  // 10 reviews per page; desktop shows 9 in its 3-column grid.
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const onChange = () => setCompact(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const pageSize = compact ? 10 : PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil((archive?.count ?? 0) / pageSize))

  const page = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages)
  const isFirstPage = page === 1
  const pageReviews = archive ? archive.articles.slice((page - 1) * pageSize, page * pageSize) : []

  // Live search across the whole archive - not just the current page.
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const results = useMemo(() => {
    if (!archive || !searching) return []
    return archive.articles.filter((r) =>
      [r.name, r.headline, r.keyword, r.byline].some(
        (field) => field && String(field).toLowerCase().includes(q),
      ),
    )
  }, [archive, searching, q])
  // A one-character query can match thousands of cards - render a capped
  // window and ask the user to refine.
  const resultCap = 90
  const shownResults = results.slice(0, resultCap)

  useMeta(
    isFirstPage
      ? { title: null, path: '' }
      : {
          title: `More Trader AI Reviews - Page ${page}`,
          description:
            'More reviews from the Trader AI archive - what each platform claims, what we verified, and our verdict.',
          path: `page/${page}`,
          // Pagination pages stay out of search results; the links on them are
          // still followed so crawlers reach every review article.
          robots: 'noindex, follow',
        },
  )

  // The hero is static copy - it renders immediately, before the manifest
  // arrives. The lead review and the stat counts come from a tiny inline
  // snippet baked into index.html at build time, so they paint on the first
  // frame too; the grid is the only part that waits for the full manifest.
  const staticHome = readStaticHomeData()
  // The inline home-stats snippet carries the featured review's full deck;
  // the manifest only carries excerpts, so prefer the snippet for display.
  const featured = staticHome?.featured ?? archive?.featured ?? null
  const statSource = archive ?? staticHome
  const HERO_STATS = statSource
    ? [
        { value: statSource.count, label: 'Platforms reviewed', note: 'pulled from the record count, never typed' },
        { value: 4, label: 'Checks on each platform', note: 'the four external verifications' },
        { value: statSource.cautionCount, label: 'Verdicts downgraded', note: 'how many you have lowered after a re-check' },
        { value: statSource.latestDate, label: 'Last updated', note: 'the most recent check date across the index', date: true },
      ]
    : []

  return (
    <>
      {isFirstPage && (
        <>
          {/* ---- hero ---- */}
          <section className="hero">
            <div className="container">
              <div className="hero__main">
                <span className="kicker">2026 Review Roundup</span>
                <h1 className="hero__title">
                  Trader AI reviews that read the fine print{' '}
                  <em>so you don&rsquo;t have to.</em>
                </h1>
                <p className="hero__deck">
                  Every AI trading platform promises automation, accuracy and security. Very
                  few publish a licence number. This site reviews those platforms one at a
                  time - we read every page they publish, check the age and ownership of
                  their domain, and look for any independent trace of them existing. Then we
                  publish a verdict and the evidence behind it.
                </p>
                <div className="hero__actions">
                  <a className="btn btn--green" href="#reviews">
                    Browse all reviews
                    <Icon name="chevron" size={15} />
                  </a>
                  <a className="btn btn--outline" href="#method">
                    How we rate
                  </a>
                </div>
              </div>

              <aside className="hero__stats" aria-label="By the numbers">
                <div className="hero__stats-head">
                  <span className="hero__stats-title">By the numbers</span>
                  <span className="hero__stats-live" aria-hidden="true" />
                </div>
                {HERO_STATS.length ? (
                  HERO_STATS.map((stat) => (
                    <div className={`hero__stat ${stat.date ? 'hero__stat--date' : ''}`} key={stat.label}>
                      <span className="hero__stat-num">
                        {stat.date ? stat.value : String(stat.value).padStart(2, '0')}
                      </span>
                      <span className="hero__stat-text">
                        <span className="hero__stat-label">{stat.label}</span>
                        <span className="hero__stat-note">{stat.note}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }, (_, i) => (
                    <div className="hero__stat" key={i}>
                      <div className="skeleton skeleton--line" style={{ width: '60%' }} />
                    </div>
                  ))
                )}
              </aside>
            </div>
          </section>

          {/* ---- lead review ---- */}
          {featured ? (
            <section className="featured">
              <div className="container">
                <Reveal className="featured__body">
                  <div className="featured__top">
                    <span className="featured__chip">★ Lead review</span>
                    <div className="featured__platform">
                      <span
                        className="tile"
                        style={{ background: featured.accent }}
                        aria-hidden="true"
                      >
                        {initials(featured.name)}
                      </span>
                      <span className="featured__platform-name">{featured.name}</span>
                    </div>
                  </div>
                  <h2 className="featured__title">
                    <Link to={featured.path}>{featured.headline}</Link>
                  </h2>
                  <p className="featured__deck">{featured.deck}</p>
                  <p className="featured__meta">
                    By {featured.byline} &nbsp;·&nbsp; {featured.date} &nbsp;·&nbsp;{' '}
                    {featured.readTime}
                  </p>
                  <div className="featured__actions">
                    <Link to={featured.path} className="btn btn--green">
                      Read the review
                      <Icon name="arrow-right" size={15} />
                    </Link>
                  </div>
                </Reveal>
                <Reveal className="featured__side" delay={120}>
                  <span className="featured__side-label">Our score</span>
                  <span className="featured__score-num">{featured.rating.toFixed(1)}</span>
                  <Stars value={featured.rating} style={{ fontSize: 22 }} />
                  <VerdictChip verdict={featured.verdict} />
                </Reveal>
              </div>
            </section>
          ) : (
            <section className="featured">
              <div className="container">
                <div className="featured__body">
                  <div className="skeleton skeleton--kicker" />
                  <div className="skeleton skeleton--title" style={{ marginTop: 16 }} />
                  <div className="skeleton skeleton--line" style={{ width: '80%' }} />
                </div>
                <div className="featured__side">
                  <div className="skeleton skeleton--stats" style={{ height: 150 }} />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ---- review grid (paginated) ---- */}
      <section className="section" id="reviews">
        <div className="container">
          <SectionHead
            kicker={isFirstPage ? 'Latest reviews' : ''}
            title={isFirstPage ? 'Every platform we’ve reviewed' : 'More platform reviews'}
            aside={
              searching
                ? results.length > resultCap
                  ? `Showing first ${resultCap} of ${results.length} results for “${query.trim()}” - refine your search`
                  : `${results.length} result${results.length === 1 ? '' : 's'} for “${query.trim()}”`
                : isFirstPage
                  ? 'New reviews added regularly'
                  : archive
                    ? `Page ${page} of ${totalPages}`
                    : ''
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

          {!archive ? (
            <GridSkeleton />
          ) : searching && results.length === 0 ? (
            <div className="noresults">
              Nothing matched “{query.trim()}”. Try a platform name like BTC, or clear the
              search to see every review.
            </div>
          ) : (
            <>
              <div className="review-grid">
                {(searching ? shownResults : pageReviews).map((review) => (
                  <Reveal key={review.slug}>
                    <ReviewCard review={review} />
                  </Reveal>
                ))}
              </div>
              {!searching && <Pagination page={page} totalPages={totalPages} />}
            </>
          )}
        </div>
      </section>

      {isFirstPage && (
        /* ---- how we rate ---- */
        <section className="section section--deep" id="method">
          <div className="container">
            <SectionHead
              kicker="Methodology"
              title="How we rate"
              aside="Five criteria, one average"
            />
            <div className="how-rate__grid">
              {RATING_DIMENSIONS.map((dim, i) => (
                <Reveal className="how-rate__cell" key={dim.key} delay={i * 50}>
                  <div className="how-rate__num">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="how-rate__name">{dim.name}</h3>
                  <p className="how-rate__text">{dim.text}</p>
                </Reveal>
              ))}
            </div>

            <div className="disclosure">
              <span className="disclosure__label">Disclosure</span>
              <p>
                Reviews are editorial and reflect each platform&rsquo;s own published material
                at the time of writing. Some outbound links are affiliate links - that never
                changes a score or a verdict. Nothing on this site is financial advice, and
                trading involves risk. See our{' '}
                <Link to="/advertising-disclosure">advertising disclosure</Link> and{' '}
                <Link to="/risk-disclosure">risk disclosure</Link>.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
