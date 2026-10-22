import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RATING_DIMENSIONS, SITE } from '../../../data/site.js'
import { readArchive, getReviewByPath, getReviewBySlug, getReviewFull } from '../../../lib/server-data.js'
import { jsonld, reviewJsonLd, breadcrumbJsonLd } from '../../../lib/seo.js'
import CtaButton from '../../../components/CtaButton.jsx'
import VerdictChip from '../../../components/VerdictChip.jsx'
import Stars from '../../../components/Stars.jsx'
import Scorecard from '../../../components/Scorecard.jsx'
import ProsCons from '../../../components/ProsCons.jsx'
import FaqList from '../../../components/FaqList.jsx'
import ReviewCard from '../../../components/ReviewCard.jsx'
import Reveal from '../../../components/Reveal.jsx'

export const dynamicParams = false

export function generateStaticParams() {
  const archive = readArchive()
  return archive.articles.map((r) => ({ slug: r.path.replace(/^\/trading\//, '') }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const entry =
    getReviewByPath(`/trading/${slug}`) ??
    getReviewBySlug(slug.replace(/-review$/, ''))
  if (!entry) return {}
  const body = getReviewFull(entry)
  const title = body.seoTitle || entry.headline
  const description = body.seoDescription || body.deck
  return {
    title: { absolute: title },
    description,
    authors: [{ name: entry.byline }],
    alternates: { canonical: entry.path },
    robots: 'index, follow',
    openGraph: { title, description, url: `${SITE.url}${entry.path.replace(/^\//, '')}` },
    twitter: { title, description, images: [`${SITE.url}og-image.png`] },
  }
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default async function ReviewArticlePage({ params }) {
  const { slug } = await params
  const archive = readArchive()
  const entry =
    getReviewByPath(`/trading/${slug}`) ??
    getReviewBySlug(slug.replace(/-review$/, ''))
  if (!entry) notFound()

  const review = getReviewFull(entry)

  const facts = [
    ['Platform', review.name],
    ...(review.domain ? [['Domain', review.domain]] : []),
    ['Target market', review.targetMarket],
    ['Minimum deposit', review.minimumDeposit],
    ['Deposit methods', review.depositMethods],
    ['Support', review.support],
  ]

  const asideFacts = facts.filter(([k]) => !['Platform', 'Domain', 'Target market'].includes(k))

  const related = archive.byRating.filter((r) => r.slug !== entry.slug).slice(0, 2)
  const notPublished = /none published|not published|not applicable/i
  const ctaUrl = review.ctaUrl || `/go/${review.keyword || review.slug}`
  const subScores = RATING_DIMENSIONS.map((d) => [d.name, entry.scorecard[d.key]])

  return (
    <>
      <script type="application/ld+json" id="review-jsonld" dangerouslySetInnerHTML={{ __html: jsonld(reviewJsonLd(review)) }} />
      <script type="application/ld+json" id="breadcrumb-jsonld" dangerouslySetInnerHTML={{ __html: jsonld(breadcrumbJsonLd(review)) }} />

      <article className="article-head">
        <div className="container">
          <div className="article-head__crumb">
            <span>
              <Link href="/">Home</Link> → <Link href="/#reviews">Reviews</Link> → {entry.name}
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
          <p className="article-head__deck">{review.deck}</p>

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
