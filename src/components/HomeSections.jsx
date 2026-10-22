import Link from 'next/link'
import { RATING_DIMENSIONS } from '../data/site.js'
import ReviewCard from './ReviewCard.jsx'
import Stars from './Stars.jsx'
import VerdictChip from './VerdictChip.jsx'
import SectionHead from './SectionHead.jsx'
import Reveal from './Reveal.jsx'
import Icon from './Icon.jsx'
import SearchGrid from './SearchGrid.jsx'

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function HomeSections({ page, pageReviews, totalPages, featuredReview, stats }) {
  const isFirstPage = page === 1

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
                  few publish a licence number. We read every page they publish, check the
                  age and ownership of their domain, and look for any independent trace.
                  Then we publish a verdict and the evidence.
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
                {stats.map((stat) => (
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
                <div className="featured__top">
                  <span className="featured__chip">★ Lead review</span>
                  <div className="featured__platform">
                    <span
                      className="tile"
                      style={{ background: featuredReview.accent }}
                      aria-hidden="true"
                    >
                      {initials(featuredReview.name)}
                    </span>
                    <span className="featured__platform-name">{featuredReview.name}</span>
                  </div>
                </div>
                <h2 className="featured__title">
                  <Link href={featuredReview.path}>{featuredReview.headline}</Link>
                </h2>
                <p className="featured__deck">{featuredReview.deck}</p>
                <p className="featured__meta">
                  By {featuredReview.byline} &nbsp;·&nbsp; {featuredReview.date} &nbsp;·&nbsp;{' '}
                  {featuredReview.readTime}
                </p>
                <div className="featured__actions">
                  <Link href={featuredReview.path} className="btn btn--green">
                    Read the review
                    <Icon name="arrow-right" size={15} />
                  </Link>
                </div>
              </Reveal>
              <Reveal className="featured__side" delay={120}>
                <span className="featured__side-label">Our score</span>
                <span className="featured__score-num">{featuredReview.rating.toFixed(1)}</span>
                <Stars value={featuredReview.rating} style={{ fontSize: 22 }} />
                <VerdictChip verdict={featuredReview.verdict} />
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* ---- review grid (paginated + search) ---- */}
      <section className="section" id="reviews">
        <div className="container">
          <SearchGrid page={page} totalPages={totalPages} initialReviews={pageReviews} />
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
                <Link href="/advertising-disclosure">advertising disclosure</Link> and{' '}
                <Link href="/risk-disclosure">risk disclosure</Link>.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
