export default function ProsCons({ pros, cons }) {
  return (
    <div className="proscons">
      <div className="proscons__col">
        <p className="proscons__title">
          <span className="proscons__icon" aria-hidden="true">✓</span>
          What we like
        </p>
        <ul className="proscons__list">
          {pros.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="proscons__col proscons__col--cons">
        <p className="proscons__title">
          <span className="proscons__icon" aria-hidden="true">✕</span>
          What to consider
        </p>
        <ul className="proscons__list">
          {cons.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
