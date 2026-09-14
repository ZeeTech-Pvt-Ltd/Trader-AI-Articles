import { Link } from 'react-router-dom'
import useMeta from '../hooks/useMeta.js'

export default function NotFound() {
  useMeta({ title: 'Page Not Found', description: 'This page does not exist.', path: window.location.pathname })
  return (
    <div className="notfound">
      <div className="container">
        <div className="notfound__num" aria-hidden="true">404</div>
        <h1 className="notfound__title">Spiked from the ledger</h1>
        <p>This page does not exist - or it has been pulled from the archive.</p>
        <Link to="/" className="btn btn--green">
          Back to the reviews
        </Link>
      </div>
    </div>
  )
}
