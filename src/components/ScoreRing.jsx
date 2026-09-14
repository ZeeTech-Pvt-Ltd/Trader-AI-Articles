// Circular score indicator: ring fills to value/5, number in the centre.
// Amber ring below 4.2, green at or above.
export default function ScoreRing({ value, size = 64, stroke = 6, light = false }) {
  const r = (size - stroke) / 2 - 2
  const c = 2 * Math.PI * r
  const caution = value < 4.2
  const offset = c * (1 - value / 5)

  return (
    <span
      className={`score-ring ${caution ? 'is-caution' : ''} ${light ? 'score-ring--light' : ''} ${
        size >= 84 ? 'score-ring--lg' : ''
      }`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Score ${value.toFixed(1)} out of 5`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="score-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="score-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="score-ring__num">{value.toFixed(1)}</span>
    </span>
  )
}
