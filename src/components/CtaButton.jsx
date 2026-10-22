import Icon from './Icon.jsx'

// The review page's action button. Points at the review's Vector AI 360
// campaign URL (derived in the archive layer) unless one is set, falling back
// to the site's own /go/<keyword> page. External links open in the same tab
// (no target="_blank") per the funnel flow.
export default function CtaButton({ label, to }) {
  const external = /^https?:/i.test(to)
  return (
    <a
      className="btn btn--green btn--cta"
      href={to}
      {...(external ? { rel: 'noopener noreferrer nofollow sponsored' } : {})}
    >
      {label}
      <Icon name="arrow-right" size={16} />
    </a>
  )
}
