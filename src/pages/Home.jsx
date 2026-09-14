import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import { REVIEWS, FEATURED, PAGINATED, PAGE_SIZE, TOTAL_PAGES } from '../data/reviews/index.js'
import { RATING_DIMENSIONS } from '../data/site.js'
import ReviewCard from '../components/ReviewCard.jsx'
import Stars from '../components/Stars.jsx'
import VerdictChip from '../components/VerdictChip.jsx'
import SectionHead from '../components/SectionHead.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'

function Pagination({ page, totalPages }) {
  return (
    <nav className="pagination" aria-label="Reviews pages">
      {page > 1 && (
        <Link className="pagination__link" to={page === 2 ? '/' : `/page/${page - 1}`}>
          ← Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          to={n === 1 ? '/' : `/page/${n}`}
          className={`pagination__num ${n === page ? 'is-active' : ''}`}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </Link>
      ))}
      {page < totalPages && (
        <Link className="pagination__link" to={`/page/${page + 1}`}>
          Next →
        </Link>
      )}
    </nav>
  )
}

export default function Home() {
  const { page: pageParam } = useParams()
  const page = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), TOTAL_PAGES)
  const isFirstPage = page === 1
  const pageReviews = PAGINATED.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Live search across the whole archive - not just the current page.
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const searching = q.length > 0
  const results = searching
    ? PAGINATED.filter((r) =>
        [r.name, r.headline, r.keyword, r.byline].some(
          (field) => field && String(field).toLowerCase().includes(q),
        ),
      )
    : pageReviews

  useMeta(
    isFirstPage
      ? { title: null, path: '' }
      : {
          title: `More Trader AI Reviews - Page ${page}`,
          description:
            'More reviews from the Trader AI archive - what each platform claims, what we verified, and our verdict.',
          path: `page/${page}`,
        },
  )

  const downgraded = REVIEWS.filter((r) => r.verdict.startsWith('CAUTION')).length
  const latest = REVIEWS.reduce((a, b) => (b.isoDate > a.isoDate ? b : a), REVIEWS[0])

  const HERO_STATS = [
    { value: REVIEWS.length, label: 'Platforms reviewed', note: 'pulled from the record count, never typed' },
    { value: 4, label: 'Checks on each platform', note: 'the four external verifications' },
    { value: downgraded, label: 'Verdicts downgraded', note: 'how many you have lowered after a re-check' },
    { value: latest.date, label: 'Last updated', note: 'the most recent check date across the index', date: true },
  ]

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
                {HERO_STATS.map((stat) => (
                  <div className={`hero__stat ${stat.date ? 'hero__stat--date' : ''}`} key={stat.label}>
                    <span className="hero__stat-num">
                      {stat.date ? stat.value : String(stat.value).padStart(2, '0')}
                    </span>
                    <span className="hero__stat-text">
                      <span className="hero__stat-label">{stat.label}</span>
                      <span className="hero__stat-note">{stat.note}</span>
                    </span>
                  </div>
                ))}
              </aside>
            </div>
          </section>

          {/* ---- lead review ---- */}
          <section className="featured">
            <div className="container">
              <Reveal className="featured__body">
                <span className="featured__chip">★ Lead review</span>
                <h2 className="featured__title">
                  <Link to={FEATURED.path} style={{ color: '#fff' }}>
                    {FEATURED.headline}
                  </Link>
                </h2>
                <p className="featured__deck">{FEATURED.deck}</p>
                <p className="featured__meta">
                  By {FEATURED.byline} &nbsp;·&nbsp; {FEATURED.date} &nbsp;·&nbsp; {FEATURED.readTime}
                </p>
                <div className="featured__actions">
                  <Link to={FEATURED.path} className="btn btn--white">
                    Read the review
                    <Icon name="arrow-right" size={15} />
                  </Link>
                </div>
              </Reveal>
              <Reveal className="featured__side" delay={120}>
                <span className="featured__side-label">Our score</span>
                <span className="featured__score-num">{FEATURED.rating.toFixed(1)}</span>
                <Stars value={FEATURED.rating} style={{ fontSize: 22 }} />
                <VerdictChip verdict={FEATURED.verdict} dark />
              </Reveal>
            </div>
          </section>
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
                ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query.trim()}”`
                : isFirstPage
                  ? 'New reviews added regularly'
                  : `Page ${page} of ${TOTAL_PAGES}`
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

          {searching && results.length === 0 ? (
            <div className="noresults">
              Nothing matched “{query.trim()}”. Try a platform name like BTC, or clear the
              search to see every review.
            </div>
          ) : (
            <>
              <div className="review-grid">
                {results.map((review) => (
                  <Reveal key={review.slug}>
                    <ReviewCard review={review} />
                  </Reveal>
                ))}
              </div>
              {!searching && <Pagination page={page} totalPages={TOTAL_PAGES} />}
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
