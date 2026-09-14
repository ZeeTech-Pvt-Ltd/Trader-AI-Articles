const LABELS = {
  easeOfUse: 'Ease of use',
  features: 'Features',
  transparency: 'Transparency',
  security: 'Security & regulation',
  support: 'Support',
}

// Horizontal-bar scorecard: each dimension shows its 0–5 score as a bar.
export default function Scorecard({ scorecard }) {
  return (
    <div className="scorecard">
      {Object.entries(scorecard).map(([key, value]) => (
        <div className="scorecard__row" key={key}>
          <span className="scorecard__dim">{LABELS[key]}</span>
          <div
            className="scorecard__bar"
            role="meter"
            aria-label={`${LABELS[key]}: ${value.toFixed(1)} out of 5`}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={5}
          >
            <div
              className={`scorecard__bar-fill ${value < 4 ? 'is-caution' : ''}`}
              style={{ width: `${(value / 5) * 100}%` }}
            />
          </div>
          <span className="scorecard__num">{value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}
