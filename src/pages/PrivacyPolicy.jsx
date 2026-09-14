import LegalPage from '../components/LegalPage.jsx'

// Template text - review with a lawyer before launch.
export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" kicker="Legal" updated="September 8, 2026">
      <p>
        Trader AI (“we”, “the desk”) operates the website at
        trader-ai.com. This policy explains what information we collect when you
        visit the site or contact us, and how it is used.
      </p>

      <h2>Information we collect</h2>
      <p>When you use our contact form, we collect the details you submit: your name, email address, phone number (if provided) and message. When you browse the site, standard technical data - such as IP address, browser type and pages visited - may be recorded in server logs.</p>

      <h2>How we use your information</h2>
      <ul>
        <li>To reply to enquiries sent through the contact form.</li>
        <li>To correct or update reviews based on reader feedback.</li>
        <li>To maintain site security and prevent misuse of the contact form.</li>
      </ul>

      <h2>Sharing and storage</h2>
      <p>
        We do not sell your personal information. Contact-form submissions are stored with
        the service that processes our mail actions and are retained only as long as needed
        to handle your enquiry.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        The site itself does not set advertising or tracking cookies. Third-party services
        (for example, payment or analytics providers reached through outbound links) have
        their own privacy policies, which we do not control.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request a copy of the information we hold about you, ask for corrections, or
        request deletion by writing to contact@trader-ai.com. We respond within a
        reasonable time.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        This policy may be updated from time to time. The date at the top of the page shows
        the latest revision.
      </p>
    </LegalPage>
  )
}
