import { Link } from 'react-router-dom'
import Stars from './Stars.jsx'

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ReviewCard({ review }) {
  return (
    <article className="review-card" style={{ '--accent': review.accent }}>
      <div className="review-card__top">
        <span className="tile" aria-hidden="true">{initials(review.name)}</span>
        <div className="review-card__id">
          <span className="review-card__name">{review.name}</span>
          {review.domain && <span className="review-card__domain">{review.domain}</span>}
        </div>
        <div className="review-card__rating">
          <span className="review-card__rating-num">{review.rating.toFixed(1)}</span>
          <Stars value={review.rating} style={{ fontSize: 13 }} />
        </div>
      </div>

      <h3 className="review-card__title">
        <Link to={review.path}>{review.headline}</Link>
      </h3>
      <p className="review-card__deck">{review.deck}</p>

      <div className="review-card__foot">
        <span className="review-card__author">By {review.byline}</span>
        <span className="review-card__read">
          {review.readTime} · {review.date}
        </span>
      </div>
    </article>
  )
}
