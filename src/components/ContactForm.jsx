import { useEffect, useRef, useState } from 'react'
import intlTelInput from 'intl-tel-input'
import 'intl-tel-input/dist/css/intlTelInput.min.css'

const ENDPOINT = 'https://apexai-experts.com/homeMailAction.php'
const OFFER = 'AITradingPlatform-Site'

// Resolve the visitor's country for the phone input: ipwho.is first (works in dev),
// then ipapi.co, falling back to AU. Mirrors the pattern used on previous projects.
async function lookupCountry() {
  try {
    const res = await fetch('https://ipwho.is/')
    const data = await res.json()
    if (data && data.country_code) return data.country_code.toLowerCase()
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data && data.country_code) return data.country_code.toLowerCase()
  } catch {
    /* fall through */
  }
  return 'us'
}

export default function ContactForm() {
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '', website: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'sending' | 'ok' | 'err'
  const phoneRef = useRef(null)
  const itiRef = useRef(null)
  const utilsLoadedRef = useRef(false)
  const pendingUtilsRef = useRef(null)

  useEffect(() => {
    if (!phoneRef.current) return
    const input = phoneRef.current

    // intl-tel-input v29: attachUtils(loader) fires the loader immediately,
    // so utils are attached lazily - on first focus or after 4s idle.
    const attach = () => {
      if (utilsLoadedRef.current) return
      pendingUtilsRef.current = intlTelInput.attachUtils(() =>
        import('intl-tel-input/dist/js/utils.js'),
      )
    }

    const iti = intlTelInput(input, {
      initialCountry: 'us',
      utilsScript: null,
    })
    itiRef.current = iti

    // Keep the React state in sync with the ITI input.
    input.addEventListener('input', () => setValues((v) => ({ ...v, phone: input.value })))
    input.addEventListener('focus', attach, { once: true })
    const idleTimer = setTimeout(attach, 4000)

    lookupCountry().then((country) => {
      try {
        iti.setSelectedCountry(country)
      } catch {
        /* non-fatal: default remains AU */
      }
    })

    return () => {
      clearTimeout(idleTimer)
      input.removeEventListener('focus', attach)
      iti.destroy()
    }
  }, [])

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (values.firstName.trim().length < 2) next.firstName = 'Please enter your first name.'
    if (values.lastName.trim().length < 2) next.lastName = 'Please enter your last name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) next.email = 'Please enter a valid email address.'
    if (!consent) next.consent = 'Please accept the privacy policy to continue.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // isValidNumber() throws until utils are attached; race a deferred load
  // (≤3s), retry, then fall back to the raw digits. Same pattern as prior projects.
  const resolvePhone = async () => {
    const iti = itiRef.current
    if (!iti) return values.phone
    try {
      return iti.isValidNumber() ? iti.getNumber() : values.phone
    } catch {
      if (!utilsLoadedRef.current && pendingUtilsRef.current) {
        const loaded = await Promise.race([
          pendingUtilsRef.current.then(() => true),
          new Promise((res) => setTimeout(() => res(false), 3000)),
        ])
        if (loaded) {
          utilsLoadedRef.current = true
          try {
            return iti.isValidNumber() ? iti.getNumber() : values.phone
          } catch {
            return values.phone
          }
        }
      }
      return values.phone
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (values.website) return // honeypot: silently drop bots
    if (!validate()) return

    setStatus('sending')
    try {
      const phone = await resolvePhone()
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerName: OFFER,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone,
          message: values.message.trim(),
          consent: true,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('ok')
      setValues({ firstName: '', lastName: '', email: '', phone: '', message: '', website: '' })
      setConsent(false)
    } catch {
      setStatus('err')
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-card__title">Write to the desk</h2>
      <p className="form-card__sub">
        Corrections, questions about a review, or a platform you think we should cover.
      </p>

      {status === 'ok' && (
        <p className="form-status form-status--ok">
          Message received. The desk will reply within two business days.
        </p>
      )}
      {status === 'err' && (
        <p className="form-status form-status--err">
          Something went wrong sending your message. Please try again shortly.
        </p>
      )}
      {status === 'sending' && (
        <p className="form-status form-status--sending">Sending…</p>
      )}

      {/* Honeypot - real users never see this field */}
      <div className="form-honeypot" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set('website')}
          />
        </label>
      </div>

      <div className="form-row">
        <div className={`form-field ${errors.firstName ? 'has-error' : ''}`}>
          <label htmlFor="cf-first">First name</label>
          <input
            id="cf-first"
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            onChange={set('firstName')}
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div className={`form-field ${errors.lastName ? 'has-error' : ''}`}>
          <label htmlFor="cf-last">Last name</label>
          <input
            id="cf-last"
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            onChange={set('lastName')}
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="cf-phone">Phone (optional)</label>
        <input id="cf-phone" type="tel" autoComplete="tel" ref={phoneRef} />
      </div>

      <div className="form-field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows="4"
          value={values.message}
          onChange={set('message')}
          placeholder="Tell us what you'd like the desk to look into."
        />
      </div>

      <div className="form-consent">
        <input
          id="cf-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <label htmlFor="cf-consent">
          I agree to the <a href="/privacy-policy">Privacy Policy</a> and understand this
          site does not provide financial advice. {errors.consent && <span className="error">{errors.consent}</span>}
        </label>
      </div>

      <button type="submit" className="btn btn--green" disabled={status === 'sending'}>
        Send message
      </button>
    </form>
  )
}
