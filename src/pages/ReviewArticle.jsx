import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import useArchive from '../hooks/useArchive.js'
import useReviewBody from '../hooks/useReviewBody.js'
import { SITE, RATING_DIMENSIONS } from '../data/site.js'
import VerdictChip from '../components/VerdictChip.jsx'
import Stars from '../components/Stars.jsx'
import Scorecard from '../components/Scorecard.jsx'
import ProsCons from '../components/ProsCons.jsx'
import FaqList from '../components/FaqList.jsx'
import ReviewCard from '../components/ReviewCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import NotFound from './NotFound.jsx'

function ArticleJsonLd({ review }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'review-jsonld'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Review',
      headline: review.headline,
      description: review.seoDescription || review.deck,
      inLanguage: 'en',
      image: `${SITE.url}og-image.png`,
      mainEntityOfPage: `${SITE.url}${review.path.replace(/^\//, '')}`,
      itemReviewed: {
        '@type': 'Product',
        name: review.name,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: { '@type': 'Person', name: review.byline },
      publisher: { '@type': 'Organization', name: SITE.name },
      datePublished: review.isoDate,
      dateModified: review.isoDate,
    })
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('review-jsonld')
      if (el) el.remove()
    }
  }, [review])
  return null
}

function BreadcrumbJsonLd({ review }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'breadcrumb-jsonld'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Reviews',
          item: `${SITE.url}#reviews`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: review.name,
          item: `${SITE.url}${review.path.replace(/^\//, '')}`,
        },
      ],
    })
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('breadcrumb-jsonld')
      if (el) el.remove()
    }
  }, [review])
  return null
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// The review page's action button. Points at the review's Austerio campaign
// URL (derived in the archive layer) unless one is set, falling back to the
// site's own /go/<keyword> page.
function CtaButton({ label, to }) {
  const external = /^https?:/i.test(to)
  return (
    <a
      className="btn btn--green btn--cta"
      href={to}
      {...(external
        ? { target: '_blank', rel: 'noopener noreferrer nofollow sponsored' }
        : {})}
    >
      {label}
      <Icon name="arrow-right" size={16} />
    </a>
  )
}

// Shown while the manifest resolves (first visit only).
function ArticleSkeleton() {
  return (
    <article className="article-head">
      <div className="container">
        <div className="skeleton skeleton--kicker" />
        <div className="skeleton skeleton--title" style={{ marginTop: 24 }} />
        <div className="skeleton skeleton--line" style={{ width: '70%', marginTop: 18 }} />
      </div>
    </article>
  )
}

// Placeholder blocks for the article body while its chunk loads.
function ArticleBodySkeleton() {
  return (
    <div className="article-body__main">
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line" style={{ width: '92%' }} />
      <div className="skeleton skeleton--line" style={{ width: '76%' }} />
      <div className="skeleton skeleton--card-top" style={{ marginTop: 28 }} />
      <div className="skeleton skeleton--line" style={{ width: '88%', marginTop: 28 }} />
      <div className="skeleton skeleton--card-top" style={{ marginTop: 28 }} />
      <div className="skeleton skeleton--line" style={{ width: '65%', marginTop: 28 }} />
    </div>
  )
}

export default function ReviewArticle() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const archive = useArchive()

  // Match by exact path first (paths can carry a suffix like -review that
  // differs from the slug); fall back to the slug for legacy /review/ URLs.
  const entry = archive ? (archive.byPath.get(pathname) || archive.bySlug.get(slug)) : null

  const { status, body } = useReviewBody(entry)
  const ready = status === 'ready' && !!body
  const review = ready ? { ...entry, ...body } : entry

  useMeta({
    title: entry ? entry.headline : 'Review not found',
    description: body ? body.seoDescription || entry.deck : entry ? entry.deck : null,
    path: entry ? entry.path : pathname,
    appendSite: false,
    author: entry ? entry.byline : null,
  })

  if (!archive) return <ArticleSkeleton />
  if (!entry) return <NotFound />
  // Canonical URL: legacy routes (e.g. /review/<slug> or an old path) redirect
  // to the review's own path.
  if (pathname !== entry.path) return <Navigate to={entry.path} replace />

  const facts = ready
    ? [
        ['Platform', review.name],
        ...(review.domain ? [['Domain', review.domain]] : []),
        ['Target market', review.targetMarket],
        ['Minimum deposit', review.minimumDeposit],
        ['Deposit methods', review.depositMethods],
        ['Support', review.support],
      ]
    : [
        ['Platform', entry.name],
        ['Minimum deposit', entry.minimumDeposit],
      ]

  const asideFacts = ready
    ? facts.filter(([k]) => !['Platform', 'Domain', 'Target market'].includes(k))
    : [['Minimum deposit', entry.minimumDeposit]]

  const related = archive.byRating.filter((r) => r.slug !== entry.slug).slice(0, 2)
  const notPublished = /none published|not published|not applicable/i
  const ctaUrl = review.ctaUrl || `/go/${review.keyword || review.slug}`
  const subScores = RATING_DIMENSIONS.map((d) => [d.name, entry.scorecard[d.key]])

  return (
    <>
      {ready && (
        <>
          <ArticleJsonLd review={review} />
          <BreadcrumbJsonLd review={review} />
        </>
      )}

      <article className="article-head">
        <div className="container">
          <div className="article-head__crumb">
            <span>
              <Link to="/">Home</Link> → <Link to="/#reviews">Reviews</Link> → {entry.name}
            </span>
          </div>

          <div className="article-head__platform">
            <span className="tile tile--lg" style={{ background: entry.accent }} aria-hidden="true">
              {initials(entry.name)}
            </span>
            <div className="article-head__platform-id">
              <span className="article-head__platform-name">{entry.name}</span>
              {review.domain && (
                <span className="article-head__platform-domain">{review.domain}</span>
              )}
            </div>
            <div className="article-head__chips">
              <VerdictChip verdict={entry.verdict} />
              <span className="pill">Updated {entry.date}</span>
            </div>
          </div>

          <h1 className="article-head__title">{entry.headline}</h1>
          <p className="article-head__deck">{entry.deck}</p>

          <div className="article-head__meta">
            <span className="article-head__byline">
              By {entry.byline}
              <span>
                {entry.date} · {entry.readTime}
              </span>
            </span>
            <div className="article-head__score">
              <span className="article-head__score-label">Our score</span>
              <span className="article-head__score-num">{entry.rating.toFixed(1)}</span>
              <Stars value={entry.rating} style={{ fontSize: 14 }} />
            </div>
          </div>
        </div>
      </article>

      <div className="article-body">
        <div className="container article-body__layout">
          <div className="article-body__main">
            {ready ? (
              <>
                {review.intro.map((para, i) => (
                  <p key={i} className={i === 0 ? 'lead' : ''}>
                    {para}
                  </p>
                ))}

                <div className="article-cta-inline">
                  <CtaButton label={`Open Your Free ${review.name} Account`} to={ctaUrl} />
                </div>

                {/* the facts */}
                <div className="facts">
                  <div className="facts__head">The facts</div>
                  <div className="facts__grid">
                    {facts.map(([k, v]) => (
                      <div className="facts__row" key={k}>
                        <span className="facts__key">{k}</span>
                        <span className={`facts__value ${notPublished.test(v) ? 'facts__value--na' : ''}`}>
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="callout">
                  <div className="callout__main">
                    <p className="callout__line">Minimum deposit: {review.minimumDeposit}</p>
                    <p className="callout__sub">No registration charge · Practice account included</p>
                  </div>
                  <CtaButton label="Start Free Today" to={ctaUrl} />
                </div>

                <h2>What the platform claims</h2>
                <div className="list-card">
                  <ul>
                    {review.whatItClaims.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <h2>What we checked</h2>
                <div className="list-card">
                  <ul>
                    {review.whatWeChecked.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {review.steps && (
                  <>
                    <h2>How to start in three steps</h2>
                    <div className="steps">
                      {review.steps.map((step, i) => (
                        <div className="steps__item" key={step.title}>
                          <span className="steps__num">{String(i + 1).padStart(2, '0')}</span>
                          <h3 className="steps__title">{step.title}</h3>
                          <p className="steps__text">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h2>The scorecard</h2>
                <Scorecard scorecard={review.scorecard} />

                <ProsCons pros={review.pros} cons={review.cons} />

                <div className="redflags">
                  <p className="redflags__title">⚠ Red flags - what gave us pause</p>
                  <ul>
                    {review.redFlags.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bottomline">
                  <div className="bottomline__head">
                    <h2 className="bottomline__title" style={{ margin: 0 }}>
                      The bottom line
                    </h2>
                    <VerdictChip verdict={review.verdict} />
                  </div>
                  {review.bottomLine.map((para, i) => (
                    <p key={i} style={{ marginBottom: i === review.bottomLine.length - 1 ? 0 : '1em' }}>
                      {para}
                    </p>
                  ))}
                </div>

                <div className="final-card">
                  <span className="final-card__num">{review.rating.toFixed(1)}</span>
                  <Stars value={review.rating} style={{ fontSize: 18 }} />
                  <VerdictChip verdict={review.verdict} />
                  <p className="final-card__title">Ready to get started?</p>
                  <p className="final-card__text">
                    Opening an account is free, the demo works before you fund anything, and the
                    minimum deposit is {review.minimumDeposit}.
                  </p>
                  <CtaButton label="Open Your Free Account" to={ctaUrl} />
                </div>

                <h2>Frequently asked questions</h2>
                <FaqList items={review.faqs} />
              </>
            ) : status === 'error' ? (
              <div className="noresults">
                This review could not be loaded.{' '}
                <a href={entry.path} style={{ color: 'var(--primary-deep)' }}>
                  Reload the page
                </a>{' '}
                to try again.
              </div>
            ) : (
              <ArticleBodySkeleton />
            )}
          </div>

          <aside className="article-body__aside">
            <div className="aside-card">
              <p className="aside-card__title">Overall rating</p>
              <div className="aside-rating">
                <span className="aside-rating__num">{entry.rating.toFixed(1)} / 5</span>
                <Stars value={entry.rating} style={{ fontSize: 15 }} />
                <VerdictChip verdict={entry.verdict} />
              </div>
              {subScores.map(([name, val]) => (
                <div className="aside-subs__row" key={name}>
                  <span className="aside-subs__name">{name}</span>
                  <span className="aside-subs__value">{val.toFixed(1)} / 5</span>
                </div>
              ))}
            </div>

            <div className="aside-card">
              <p className="aside-card__title">Key facts</p>
              {asideFacts.map(([k, v]) => (
                <div className="aside-card__row" key={k}>
                  <span className="aside-card__key">{k}</span>
                  <span className={`aside-card__value ${notPublished.test(v) ? 'aside-card__value--na' : ''}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="aside-card aside-card--cta">
              <p className="aside-card__title">Ready to start?</p>
              <p className="aside-card__text">
                Registration is free and takes minutes. The demo account lets you learn before
                you fund anything.
              </p>
              <CtaButton label="Start Free Today" to={ctaUrl} />
            </div>
          </aside>
        </div>

        {/* related reviews */}
        <div className="container">
          <div className="section-head" style={{ marginTop: 56 }}>
            <div>
              <span className="kicker">Keep reading</span>
              <h2 className="section-head__title">Related reviews</h2>
            </div>
          </div>
          <div className="related-grid">
            {related.map((r) => (
              <Reveal key={r.slug}>
                <ReviewCard review={r} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
