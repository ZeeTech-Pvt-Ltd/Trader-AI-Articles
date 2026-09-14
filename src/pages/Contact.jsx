import useMeta from '../hooks/useMeta.js'
import { SITE } from '../data/site.js'
import ContactForm from '../components/ContactForm.jsx'

export default function Contact() {
  useMeta({
    title: 'Contact the Desk',
    description:
      'Corrections, questions about a review, or a platform you think the desk should cover.',
    path: 'contact',
  })

  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <p className="kicker kicker--red">Letters</p>
          <h1 className="page-head__title">Contact the desk</h1>
          <p className="page-head__deck">
            Corrections are welcome and fixed quickly. Questions about a verdict are answered
            with the evidence we filed it on.
          </p>
        </div>

        <div className="contact-grid">
          <div>
            <div className="contact-info__item">
              <span className="contact-info__icon">@</span>
              <div>
                <p className="contact-info__label">Email</p>
                <a className="contact-info__value" href={`mailto:${SITE.contactEmail}`}>
                  {SITE.contactEmail}
                </a>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">⏱</span>
              <div>
                <p className="contact-info__label">Response time</p>
                <p className="contact-info__value">Within two business days</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">◈</span>
              <div>
                <p className="contact-info__label">Editorial desk</p>
                <p className="contact-info__value">Working across time zones</p>
              </div>
            </div>
            <div className="contact-info__item">
              <span className="contact-info__icon">✎</span>
              <div>
                <p className="contact-info__label">Have a platform reviewed?</p>
                <p className="contact-info__value">
                  The desk covers AI trading and investing platforms marketed worldwide.
                  Tell us the domain and why it matters.
                </p>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}
