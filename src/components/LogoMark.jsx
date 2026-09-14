import { useId } from 'react'

// Brand mark: gradient tile with three rising candlesticks and an up-trend
// line - trading movement, in the site's orange palette.
export default function LogoMark({ size = 40 }) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b84c0f" />
          <stop offset="1" stopColor="#ea6a1f" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      {/* rising trend line with arrowhead */}
      <path
        d="M11 35 L37 16"
        fill="none"
        stroke="#ffd3ad"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M37 16 L32.5 17.5 M37 16 L34.5 20.5"
        fill="none"
        stroke="#ffd3ad"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* three ascending candlesticks */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="32" x2="16" y2="17" />
        <line x1="24" y1="29" x2="24" y2="13" />
        <line x1="32" y1="26" x2="32" y2="10" />
      </g>
      <g fill="#ffffff">
        <rect x="13" y="21" width="6" height="7" rx="1.5" />
        <rect x="21" y="16" width="6" height="9" rx="1.5" />
        <rect x="29" y="12" width="6" height="10" rx="1.5" />
      </g>
    </svg>
  )
}
