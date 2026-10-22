// Shared template for legal pages (server component). NOTE: copy below is
// template text - have it reviewed by a lawyer before launch.
export default function LegalPage({ title, kicker, updated, children }) {
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
