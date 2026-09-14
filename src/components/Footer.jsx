import { Link } from 'react-router-dom'
import { SITE } from '../data/site.js'
import LogoMark from './LogoMark.jsx'

const SITE_LINKS = [
  { label: 'All reviews', to: '/#reviews' },
  { label: 'How we rate', to: '/#method' },
  { label: 'About the desk', to: '/about' },
]

const LEGAL_LINKS = [
  { label: 'Advertising disclosure', to: '/advertising-disclosure' },
  { label: 'Risk disclosure', to: '/risk-disclosure' },
  { label: 'Privacy policy', to: '/privacy-policy' },
  { label: 'Terms of use', to: '/terms-of-use' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link to="/" className="footer__brand">
              <LogoMark size={40} />
              <span className="footer__brand-name">
                Trader AI
                <span className="footer__brand-sub">Reviews &amp; verdicts</span>
              </span>
            </Link>
            <p className="footer__brand-deck">
              Editorial reviews of AI-powered trading platforms. We read what each platform
              publishes, flag what it doesn&rsquo;t, and hand down a verdict.
            </p>
          </div>

          <nav aria-label="Site">
            <h2 className="footer__title">Site</h2>
            <ul className="footer__list">
              {SITE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="footer__title">Legal</h2>
            <ul className="footer__list">
              {LEGAL_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>© 2026 {SITE.name}. All rights reserved.</span>
          <span>Some outbound links are affiliate links. Nothing on this site is financial advice.</span>
        </div>
      </div>
    </footer>
  )
}
