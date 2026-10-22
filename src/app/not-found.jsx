import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="container">
        <div className="notfound__num" aria-hidden="true">
          404
        </div>
        <h1 className="notfound__title">Spiked from the ledger</h1>
        <p>This page does not exist - or it has been pulled from the archive.</p>
        <Link href="/" className="btn btn--green">
          Back to the reviews
        </Link>
      </div>
    </div>
  )
}
