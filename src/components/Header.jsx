import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../data/site.js'
import LogoMark from './LogoMark.jsx'

// Manual active state: NavLink treats /#reviews as "/", which would highlight
// the Reviews link on every page. Reviews is active only when the visitor is
// looking at the reviews section or a review article.
function isReviewsActive(pathname, hash) {
  if (pathname === '/' && hash === '#reviews') return true
  return (
    pathname.startsWith('/review/') ||
    pathname.startsWith('/trading/') ||
    pathname.startsWith('/page/')
  )
}

export default function Header() {
  const { pathname, hash } = useLocation()

  const linkActive = (link) => {
    if (link.to === '/') return pathname === '/' && hash !== '#reviews'
    if (link.to === '/about') return pathname === '/about'
    if (link.to === '/#reviews') return isReviewsActive(pathname, hash)
    return false
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="header__brand">
          <LogoMark size={40} />
          <span className="header__name">
            Trader AI
            <span className="header__sub">Reviews &amp; verdicts</span>
          </span>
        </Link>

        <nav aria-label="Primary">
          <ul className="header__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className={linkActive(link) ? 'active' : ''}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link to="/#reviews" className="btn btn--green btn--sm header__cta">
          All reviews
        </Link>
      </div>
    </header>
  )
}
