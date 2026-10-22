import HomeSections from '../components/HomeSections.jsx'
import { readArchive, getReviewFull } from '../lib/server-data.js'
import { PAGE_SIZE } from '../data/reviews/archive.js'

// No title: the root layout default ("Trader AI - Safe, Legit or a Scam?")
// applies automatically when a page omits title.
export const metadata = {
  alternates: { canonical: '/' },
  robots: 'index, follow',
}

function statsFor(archive) {
  return [
    { value: archive.count, label: 'Platforms reviewed', note: 'pulled from the record count, never typed' },
    { value: 4, label: 'Checks on each platform', note: 'the four external verifications' },
    { value: archive.cautionCount, label: 'Verdicts downgraded', note: 'how many you have lowered after a re-check' },
    { value: archive.latestDate, label: 'Last updated', note: 'the most recent check date across the index', date: true },
  ]
}

export default function HomePage() {
  const archive = readArchive()
  const totalPages = Math.max(1, Math.ceil(archive.count / PAGE_SIZE))
  const pageReviews = archive.articles.slice(0, PAGE_SIZE)
  const featuredReview = getReviewFull(archive.featured)

  return (
    <HomeSections
      page={1}
      pageReviews={pageReviews}
      totalPages={totalPages}
      featuredReview={featuredReview}
      stats={statsFor(archive)}
    />
  )
}
