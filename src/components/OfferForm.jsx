import { useEffect, useRef, useState } from 'react'
import intlTelInput from 'intl-tel-input'
import 'intl-tel-input/dist/css/intlTelInput.min.css'

const ENDPOINT = 'https://apexai-experts.com/homeMailAction.php'

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

// Registration form for the /go/<keyword> funnel page. Posts to the same
// endpoint as the site's contact form; offerName changes per article keyword.
export default function OfferForm({ offerName, platform }) {
  const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '', website: '' })
  const [consent, setConsent] = useState(true)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState(null) // 'sending' | 'ok' | 'err'
  const [dialCode, setDialCode] = useState(null)
  const phoneRef = useRef(null)
  const itiRef = useRef(null)
  const utilsLoadedRef = useRef(false)
  const pendingUtilsRef = useRef(null)

  useEffect(() => {
    if (!phoneRef.current) return
    const input = phoneRef.current

    // Mirror the selected country into the label (dial code). v29 has no
    // public "selected country data" getter, so the dial code is read from
    // the trigger element the library keeps up to date.
    const sync = () => {
      const codeEl = input.parentElement?.querySelector('.iti__selected-dial-code')
      if (codeEl) setDialCode(codeEl.textContent.trim().replace(/^\+/, ''))
    }

    // intl-tel-input v29: attachUtils(loader) fires the loader immediately,
    // so utils are attached lazily - on first focus or after 4s idle.
    const attach = () => {
      if (utilsLoadedRef.current) return
      pendingUtilsRef.current = intlTelInput
        .attachUtils(() => import('intl-tel-input/dist/js/utils.js'))
        .then(() => {
          utilsLoadedRef.current = true
          sync()
        })
    }

    const iti = intlTelInput(input, {
      initialCountry: 'us',
      // keep the placeholder as a live example number for the selected country
      placeholderNumberPolicy: 'AGGRESSIVE',
      utilsScript: null,
    })
    itiRef.current = iti

    // Keep the React state in sync with the ITI input. The native input event
    // also fires when the country changes, so the label re-syncs there too.
    input.addEventListener('input', () => {
      setValues((v) => ({ ...v, phone: input.value }))
      sync()
    })
    input.addEventListener('focus', attach, { once: true })
    const idleTimer = setTimeout(attach, 4000)

    sync()

    lookupCountry().then((country) => {
      try {
        iti.setSelectedCountry(country)
        sync()
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
    if (values.phone.trim().length < 6) next.phone = 'Please enter your phone number.'
    setErrors(next)
    return Object.keys(next).length === 0 && consent
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
          offerName,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone,
          consent: true,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('ok')
      setValues({ firstName: '', lastName: '', email: '', phone: '', website: '' })
      setConsent(true)
    } catch {
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <div className="form-card form-card--done">
        <h2 className="form-card__title">You're almost there</h2>
        <p className="form-card__sub">
          Check your inbox to confirm your email, then log in to {platform} and fund your
          account when you're ready.
        </p>
        <p className="form-card__sub">
          New to the platform? Start with the demo account - it works before you deposit
          anything.
        </p>
      </div>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-card__title">Create your free account</h2>
      <p className="form-card__sub">{platform} registration takes about two minutes.</p>

      {status === 'err' && (
        <p className="form-status form-status--err">
          Something went wrong sending your details. Please try again shortly.
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
          <label htmlFor="of-first">First name *</label>
          <input
            id="of-first"
            type="text"
            autoComplete="given-name"
            placeholder="John"
            value={values.firstName}
            onChange={set('firstName')}
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div className={`form-field ${errors.lastName ? 'has-error' : ''}`}>
          <label htmlFor="of-last">Last name *</label>
          <input
            id="of-last"
            type="text"
            autoComplete="family-name"
            placeholder="Doe"
            value={values.lastName}
            onChange={set('lastName')}
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="of-email">Email *</label>
        <input
          id="of-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={set('email')}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
        <label htmlFor="of-phone">
          Phone number{dialCode ? ` (+${dialCode})` : ''} *
        </label>
        <input
          id="of-phone"
          type="tel"
          autoComplete="tel"
          placeholder="0412 345 678"
          ref={phoneRef}
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div className="form-consent">
        <input
          id="of-consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <label htmlFor="of-consent">
          I have read and agree to the <a href="/privacy-policy">Privacy Policy</a> and{' '}
          <a href="/terms-of-use">Terms &amp; Conditions</a>.
        </label>
      </div>

      <button type="submit" className="btn btn--cta" disabled={status === 'sending'}>
        Open an account
      </button>
    </form>
  )
}
