import useMeta from '../hooks/useMeta.js'

// Shared template for legal pages. NOTE: copy below is template text -
// have it reviewed by a lawyer before launch.
export default function LegalPage({ title, kicker, updated, children }) {
  useMeta({ title, description: `${title} - ${updated}.`, path: window.location.pathname })
  return (
    <div className="section">
      <div className="container">
        <div className="page-head">
          <p className="kicker kicker--red">{kicker}</p>
          <h1 className="page-head__title">{title}</h1>
        </div>
        <div className="prose">
          {children}
          <p className="legal-updated">Last updated: {updated}</p>
        </div>
      </div>
    </div>
  )
}
