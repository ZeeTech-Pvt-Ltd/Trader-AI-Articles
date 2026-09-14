export default function VerdictChip({ verdict, dark = false, className = '' }) {
  const caution = verdict.startsWith('CAUTION')
  let cls = caution ? 'chip--caution' : 'chip--safe'
  if (dark) cls = caution ? 'chip--dark-caution' : 'chip--dark'
  return <span className={`chip ${cls} ${className}`}>{verdict}</span>
}
