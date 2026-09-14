import LegalPage from '../components/LegalPage.jsx'

// Template text - review with a lawyer before launch.
export default function TermsOfUse() {
  return (
    <LegalPage title="Terms of Use" kicker="Legal" updated="September 8, 2026">
      <p>
        By accessing trader-ai.com (“the site”), you agree to these terms. If you
        do not agree, please do not use the site.
      </p>

      <h2>Nature of the content</h2>
      <p>
        All content on the site is editorial and general in nature. It is not personal
        financial advice, investment advice, legal advice or tax advice. Nothing on the
        site is an offer, solicitation or recommendation to buy or sell any financial
        product or to open an account with any reviewed platform.
      </p>

      <h2>Accuracy and updates</h2>
      <p>
        Reviews reflect the published material of the reviewed platforms at the date shown
        on each review. Platforms change their pages, fees and terms, and the desk may not
        immediately reflect those changes. You are responsible for verifying any current
        details with the platform itself before acting.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site links to third-party websites, including reviewed platforms. We do not
        control those sites and are not responsible for their content, terms or practices.
        Some outbound links are affiliate links, as described in our Advertising
        Disclosure.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The site’s text, layout and design are the property of Trader AI. You may
        quote short excerpts with attribution and a link. Commercial reuse requires written
        permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The site is provided “as is”. To the maximum extent permitted by law, Trader AI
        is not liable for any loss arising from your use of the site or from
        decisions made in reliance on its content. Trading and investing involve risk,
        including the possible loss of your capital.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the jurisdiction where the site operator is based.</p>
    </LegalPage>
  )
}
