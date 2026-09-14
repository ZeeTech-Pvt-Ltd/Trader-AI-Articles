// Five-star row with a precise fill for fractional ratings (e.g. 4.5).
export default function Stars({ value, className = '', style }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span
      className={`stars ${className}`}
      style={style}
      role="img"
      aria-label={`${value} out of 5`}
    >
      <span className="stars__base" aria-hidden="true">★★★★★</span>
      <span className="stars__fill" style={{ width: `${pct}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  )
}
