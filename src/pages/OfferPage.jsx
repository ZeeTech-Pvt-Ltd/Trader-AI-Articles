import { Link, useParams } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'
import useArchive from '../hooks/useArchive.js'
import Stars from '../components/Stars.jsx'
import VerdictChip from '../components/VerdictChip.jsx'
import OfferForm from '../components/OfferForm.jsx'
import Scorecard from '../components/Scorecard.jsx'
import Icon from '../components/Icon.jsx'
import NotFound from './NotFound.jsx'

// One static funnel page for every article. Unique angle: this is the only
// signup page that leads with the review desk's own verdict and scorecard.
// The keyword drives the offername, the copy and the SEO - nothing else changes.

const MARKETS = ['BTC', 'ETH', 'SOL', 'BNB', 'USDT', 'DOGE', 'LTC', 'BCH', 'XRP', 'ADA']

const FEATURES = [
  {
    icon: 'cpu',
    title: 'Comprehensive algorithm',
    text: 'Machine-learning models and trading algorithms watch the market around the clock and turn what they find into trade signals.',
  },
  {
    icon: 'chart',
    title: 'Real-time market analysis',
    text: 'Signals update as the market moves, and risk settings are adjustable before any trade goes live.',
  },
  {
    icon: 'laptop',
    title: 'Works with patterns',
    text: 'The system looks for repeating market patterns across ten major crypto assets - BTC, ETH, SOL, BNB and more.',
  },
]

// Placeholder community quotes - replace with real user copy before launch.
const TESTIMONIALS = [
  {
    name: 'Liam T.',
    place: 'Auckland, New Zealand',
    quote: 'The demo account let me learn without risking anything. I traded the practice balance for two weeks before I funded a cent.',
  },
  {
    name: 'Emma R.',
    place: 'Manchester, United Kingdom',
    quote: 'Setup was quick and the signals are easy to follow. I keep my risk settings low and check in once a day.',
  },
  {
    name: 'Noah B.',
    place: 'Toronto, Canada',
    quote: 'Switching between automatic and manual mode is what sold me. The practice account runs right next to the live one.',
  },
]

export default function OfferPage() {
  const { keyword } = useParams()
  const archive = useArchive()
  // The manifest carries every field this page renders (name, minimumDeposit,
  // scorecard, rating, verdict, keyword, path) - no body chunk is needed.
  const review = archive ? (archive.bySlug.get(keyword) ?? archive.byKeyword.get(keyword)) : null

  useMeta({
    title: review ? `Open a Free ${review.name} Account` : 'Sign up',
    description: review
      ? `Register for ${review.name}: ${review.minimumDeposit} minimum deposit, practice account included. Start in minutes.`
      : null,
    path: review ? `go/${review.keyword || review.slug}` : 'go',
  })

  if (!archive) {
    return (
      <section className="funnel-hero">
        <div className="container funnel-hero__grid">
          <div className="funnel-hero__main">
            <div className="skeleton skeleton--title" style={{ marginTop: 24 }} />
            <div className="skeleton skeleton--line" style={{ width: '70%', marginTop: 20 }} />
          </div>
        </div>
      </section>
    )
  }
  if (!review) return <NotFound />

  const steps = [
    {
      title: 'Register',
      text: 'Fill in the form and wait for the confirmation email. Registration is free and takes about two minutes.',
    },
    {
      title: 'Fund',
      text: `Make your first deposit of ${review.minimumDeposit} to activate the account. It stays in your balance - it is not a fee.`,
    },
    {
      title: 'Start',
      text: 'Set your risk preferences, choose automatic or manual mode, and keep the demo account alongside while you learn.',
    },
  ]

  const checklist = [
    'Practice account included',
    `Start at ${review.minimumDeposit}`,
    'No registration charge',
  ]

  return (
    <>
      {/* ---- hero: verdict-led, split with the form ---- */}
      <section className="funnel-hero">
        <div className="container funnel-hero__grid">
          <div className="funnel-hero__main">
            <span className="kicker funnel-hero__kicker">Trader AI verified</span>
            <h1 className="funnel-hero__brand">{review.name}</h1>
            <p className="funnel-hero__tagline">
              Don't miss your chance to put {review.name}'s market analysis to work - and
              start building your trading setup today.
            </p>
            <div className="funnel-hero__rating">
              <Stars value={review.rating} style={{ fontSize: 16 }} />
              <span>Rated {review.rating.toFixed(1)}/5 by our desk</span>
              <VerdictChip verdict={review.verdict} dark />
            </div>
            <ul className="funnel-hero__checklist">
              {checklist.map((item) => (
                <li key={item}>
                  <Icon name="check" size={13} strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="funnel-hero__reviewlink">
              <Link to={review.path}>
                Read the full review
                <Icon name="arrow-right" size={14} />
              </Link>
            </p>
          </div>

          <div className="funnel-hero__formwrap" id="signup">
            <p className="funnel-hero__sub">Sign up and get instant access</p>
            <OfferForm offerName={review.keyword || review.slug} platform={review.name} />
          </div>
        </div>
      </section>

      {/* ---- the desk's verdict with the real scorecard ---- */}
      <section className="funnel-verdict">
        <div className="container funnel-verdict__grid">
          <div className="funnel-verdict__main">
            <span className="kicker">The desk's verdict</span>
            <h2 className="funnel-verdict__title">How our desk scored {review.name}</h2>
            <p className="funnel-verdict__text">
              Every platform on Trader AI is scored on five fixed dimensions - ease of
              use, features, transparency, security and support. {review.name} landed at{' '}
              {review.rating.toFixed(1)} out of 5.
            </p>
            <Link to={review.path} className="funnel-verdict__link">
              Read the full review
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <Scorecard scorecard={review.scorecard} />
        </div>
      </section>

      {/* ---- three steps ---- */}
      <section className="funnel">
        <div className="container funnel__inner">
          <span className="kicker">How it works</span>
          <h2 className="funnel__head">How to start in three steps</h2>
          <div className="funnel__steps">
            {steps.map((step, i) => (
              <div className="funnel__step" key={step.title}>
                <span className="funnel__keycap">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="funnel__step-title">{step.title}</h3>
                <p className="funnel__step-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- why successful: numbered feature rows ---- */}
      <section className="funnel funnel--alt">
        <div className="container funnel__inner">
          <span className="kicker">The edge</span>
          <h2 className="funnel__head">Why is {review.name} so successful?</h2>
          <div className="funnel__features">
            {FEATURES.map((feature, i) => (
              <div className="funnel__feature" key={feature.title}>
                <span className="funnel__feature-icon">
                  <Icon name={feature.icon} size={24} />
                </span>
                <div className="funnel__feature-body">
                  <h3 className="funnel__feature-title">{feature.title}</h3>
                  <p className="funnel__feature-text">{feature.text}</p>
                </div>
                <span className="funnel__feature-idx">{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- devices ---- */}
      <section className="funnel">
        <div className="container funnel__inner funnel__devices">
          <span className="kicker">Compatibility</span>
          <h2 className="funnel__head">Works on all devices and operating systems</h2>
          <p className="funnel__deck">
            {review.name} runs in the browser - no download, no installation. Open it on a
            laptop, tablet or phone and your account follows you.
          </p>
          <div className="funnel__browser" aria-hidden="true">
            <div className="funnel__browser-bar">
              <span />
              <span />
              <span />
            </div>
            <svg className="funnel__browser-chart" viewBox="0 0 560 220" role="presentation">
              <defs>
                <linearGradient id="fb-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ea6a1f" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#ea6a1f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="#eef1f5" strokeWidth="1">
                <line x1="0" y1="55" x2="560" y2="55" />
                <line x1="0" y1="110" x2="560" y2="110" />
                <line x1="0" y1="165" x2="560" y2="165" />
              </g>
              <path
                d="M20 160 L90 130 L160 145 L230 105 L300 120 L370 85 L440 100 L540 50 L540 200 L20 200 Z"
                fill="url(#fb-fill)"
              />
              <path
                d="M20 160 L90 130 L160 145 L230 105 L300 120 L370 85 L440 100 L540 50"
                fill="none"
                stroke="#ea6a1f"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="funnel__browser-chips">
              {MARKETS.map((symbol) => (
                <span key={symbol}>{symbol}</span>
              ))}
            </div>
          </div>
          <a href="#signup" className="btn btn--cta">
            Start now
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </section>

      {/* ---- testimonials ---- */}
      <section className="funnel funnel--alt">
        <div className="container funnel__inner">
          <span className="kicker">User experiences</span>
          <h2 className="funnel__head">What our users experienced with {review.name}</h2>
          <div className="funnel__testimonials">
            {TESTIMONIALS.map((t) => (
              <figure className="funnel__testimonial" key={t.name}>
                <blockquote className="funnel__testimonial-quote">{t.quote}</blockquote>
                <div className="funnel__testimonial-foot">
                  <span className="funnel__avatar" aria-hidden="true">
                    {t.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                  <figcaption className="funnel__testimonial-who">
                    <strong>{t.name}</strong>
                    <span>{t.place}</span>
                  </figcaption>
                  <span className="funnel__shield" aria-hidden="true">
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---- final CTA ---- */}
      <section className="funnel-cta">
        <div className="container funnel-cta__inner">
          <h2 className="funnel-cta__title">Sign up to build better trading habits</h2>
          <p className="funnel-cta__deck">
            The form takes two minutes, the demo is free, and the minimum deposit is{' '}
            {review.minimumDeposit}.
          </p>
          <a href="#signup" className="btn btn--cta">
            Start now
            <Icon name="arrow-right" size={16} />
          </a>
          <p className="funnel-cta__note">You must be 18 or older to register.</p>
        </div>
      </section>
    </>
  )
}
