import { notFound, permanentRedirect } from 'next/navigation'
import HomeSections from '../../../components/HomeSections.jsx'
import { readArchive, getReviewFull } from '../../../lib/server-data.js'
import { PAGE_SIZE } from '../../../data/reviews/archive.js'

export const dynamicParams = true

export function generateStaticParams() {
  const archive = readArchive()
  const totalPages = Math.max(1, Math.ceil(archive.count / PAGE_SIZE))
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }))
}

export async function generateMetadata({ params }) {
  const { page } = await params
  return {
    title: `More Trader AI Reviews - Page ${page}`,
    description:
      'More reviews from the Trader AI archive - what each platform claims, what we verified, and our verdict.',
    alternates: { canonical: `/page/${page}` },
    robots: { index: false, follow: true },
  }
}

function statsFor(archive) {
  return [
    { value: archive.count, label: 'Platforms reviewed', note: 'pulled from the record count, never typed' },
    { value: 4, label: 'Checks on each platform', note: 'the four external verifications' },
    { value: archive.cautionCount, label: 'Verdicts downgraded', note: 'how many you have lowered after a re-check' },
    { value: archive.latestDate, label: 'Last updated', note: 'the most recent check date across the index', date: true },
  ]
}

export default async function PageNumber({ params }) {
  const { page: pageParam } = await params
  const archive = readArchive()
  const totalPages = Math.max(1, Math.ceil(archive.count / PAGE_SIZE))
  const n = Number(pageParam)
  if (!Number.isInteger(n) || n < 2) permanentRedirect('/')
  if (n > totalPages) permanentRedirect(`/page/${totalPages}`)

  const pageReviews = archive.articles.slice((n - 1) * PAGE_SIZE, n * PAGE_SIZE)
  const featuredReview = getReviewFull(archive.featured)

  return (
    <HomeSections
      page={n}
      pageReviews={pageReviews}
      totalPages={totalPages}
      featuredReview={featuredReview}
      stats={statsFor(archive)}
    />
  )
}
