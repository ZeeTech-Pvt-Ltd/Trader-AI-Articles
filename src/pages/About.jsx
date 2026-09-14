import useMeta from '../hooks/useMeta.js'
import { RATING_DIMENSIONS, FAQ_GENERAL } from '../data/site.js'
import FaqList from '../components/FaqList.jsx'

export default function About() {
  useMeta({
    title: 'About the Desk',
    description:
      'Who writes for Trader AI, how a platform gets scored, and the rules the desk works by.',
    path: 'about',
  })

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <p className="kicker kicker--red">The masthead</p>
          <h1 className="page-head__title">About the desk</h1>
          <p className="page-head__deck">
            Trader AI exists because AI trading platforms publish a lot of words
            and very few numbers. We read the words and check the numbers so you can decide.
          </p>
        </div>

        <div className="prose">
          <h2>What we do</h2>
          <p>
            Every review on this site is a desk review: we go through each platform&rsquo;s
            public pages - the signup flow, the feature sections, the security claims, the
            testimonials, the FAQ and the fine print - and record what is published, what is
            promised, and what is missing. We then score the platform on five fixed
            dimensions and publish a verdict.
          </p>
          <p>
            We do not manage client funds, take deposits, or trade on any platform we
            review. When we cannot verify a claim from a platform&rsquo;s own material, we
            say so - that is what the red-flag sections are for.
          </p>

          <h2>How a platform is scored</h2>
          <p>
            Each review uses the same five dimensions, scored out of five. The overall
            rating is the plain average of those five scores, rounded to one decimal. No
            dimension is weighted, and no score is influenced by advertising or affiliate
            relationships.
          </p>
          <ul>
            {RATING_DIMENSIONS.map((dim) => (
              <li key={dim.key}>
                <strong>{dim.name}.</strong> {dim.text}
              </li>
            ))}
          </ul>

          <h2>Editorial rules</h2>
          <ul>
            <li>We only state what a platform publishes on its own site, or what is common public record.</li>
            <li>When a figure cannot be verified, the review says so instead of guessing.</li>
            <li>Verdicts are never sold, traded or requested. Affiliate links are labelled, and the scoring is fixed before any link is placed.</li>
            <li>Reviews carry a date and are re-checked when a platform changes its public pages.</li>
            <li>We are not financial advisers, and no verdict on this site is a recommendation to buy or sell anything.</li>
          </ul>

          <h2>The desk</h2>
          <p>
            Trader AI is written by a small editorial desk supported by a rotating team
            of reviewers. Each review carries its author&rsquo;s byline - one standard, one
            methodology, whoever signs it. Corrections are always welcome and usually fixed
            within two business days.
          </p>
        </div>

        <div className="prose" style={{ marginTop: 64 }}>
          <div className="section-head" style={{ marginBottom: 8 }}>
            <div>
              <p className="kicker kicker--red">Questions</p>
              <h2 className="section-head__title">About this site</h2>
            </div>
          </div>
          <FaqList items={FAQ_GENERAL} />
        </div>
      </div>
    </div>
  )
}
