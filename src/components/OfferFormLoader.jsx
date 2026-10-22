'use client'

// Client wrapper that loads OfferForm without SSR: intl-tel-input touches the
// DOM at import time, so it must never run during server prerendering.
import dynamic from 'next/dynamic'

const OfferForm = dynamic(() => import('./OfferForm.jsx'), {
  ssr: false,
  loading: () => (
    <div className="skeleton skeleton--stats" style={{ height: 480 }} aria-hidden="true" />
  ),
})

export default function OfferFormLoader({ offerName, platform }) {
  return <OfferForm offerName={offerName} platform={platform} />
}
