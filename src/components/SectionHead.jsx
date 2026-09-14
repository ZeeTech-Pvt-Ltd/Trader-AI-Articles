export default function SectionHead({ kicker, title, aside }) {
  return (
    <div className="section-head">
      <div>
        {kicker && <p className="kicker">{kicker}</p>}
        <h2 className="section-head__title">{title}</h2>
      </div>
      {aside && <p className="section-head__aside">{aside}</p>}
    </div>
  )
}
