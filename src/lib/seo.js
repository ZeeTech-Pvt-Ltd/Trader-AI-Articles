// Server-side SEO builders: review JSON-LD (identical objects to the old
// ArticleJsonLd/BreadcrumbJsonLd effects) + safe serialization.
import { SITE } from '../data/site.js'

export const jsonld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c')

export function reviewJsonLd(review) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    headline: review.headline,
    description: review.seoDescription || review.deck,
    inLanguage: 'en',
    image: `${SITE.url}og-image.png`,
    mainEntityOfPage: `${SITE.url}${review.path.replace(/^\//, '')}`,
    itemReviewed: {
      '@type': 'Product',
      name: review.name,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: review.rating.toFixed(1),
        reviewCount: String(review.reviewCount ?? 1),
      },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
    },
    author: { '@type': 'Person', name: review.byline },
    publisher: { '@type': 'Organization', name: SITE.name },
    datePublished: `${review.isoDate}T00:00:00+00:00`,
    dateModified: `${review.isoDate}T00:00:00+00:00`,
  }
}

export function breadcrumbJsonLd(review) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Reviews', item: `${SITE.url}#reviews` },
      {
        '@type': 'ListItem',
        position: 3,
        name: review.name,
        item: `${SITE.url}${review.path.replace(/^\//, '')}`,
      },
    ],
  }
}
