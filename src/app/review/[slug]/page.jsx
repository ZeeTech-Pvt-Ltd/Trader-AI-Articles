import { notFound, permanentRedirect } from 'next/navigation'
import { getReviewBySlug } from '../../../lib/server-data.js'

// Legacy /review/<slug> URLs (pre-archive paths) redirect permanently to the
// canonical /trading/<slug>-review page.
export default async function LegacyReviewPage({ params }) {
  const { slug } = await params
  const entry = getReviewBySlug(slug)
  if (!entry) notFound()
  permanentRedirect(entry.path)
}
