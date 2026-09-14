import LegalPage from '../components/LegalPage.jsx'

// Template text - review with a lawyer before launch.
export default function AdvertisingDisclosure() {
  return (
    <LegalPage title="Advertising Disclosure" kicker="Legal" updated="September 8, 2026">
      <p>
        Trader AI is reader-first, but it is not free to run. This page explains
        exactly how the site makes money and what that does - and does not - change about
        our reviews.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some outbound links on this site - including the “Visit” buttons on review pages -
        are affiliate links. If you click one and later open an account with the platform,
        we may receive a commission. There is no cost to you.
      </p>

      <h2>What affiliation does not change</h2>
      <ul>
        <li>Verdicts and scores are decided before any link is placed and are never sold, requested or negotiated.</li>
        <li>The five scoring dimensions are fixed and published on our About page.</li>
        <li>Red-flag sections and negative findings stay in the review regardless of any commercial relationship.</li>
        <li>Platforms cannot pay to be reviewed, to be rated higher, or to have findings removed.</li>
      </ul>

      <h2>Why we include affiliate links at all</h2>
      <p>
        The desk’s time and the site’s hosting have to be paid for. Affiliate commissions
        let the reviews stay free to read without the desk depending on any single platform
        - and no single platform accounts for a meaningful share of the site.
      </p>

      <h2>Our promise</h2>
      <p>
        If we ever change how this site earns money, this page changes first. The current
        arrangement is the one described above, in full.
      </p>
    </LegalPage>
  )
}
