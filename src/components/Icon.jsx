const PATHS = {
  'arrow-right': 'M13 5l7 7-7 7M20 12H4',
  external: 'M14 5h5v5M19 5l-8 8M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  chevron: 'M9 6l6 6-6 6',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  'chevron-right': 'M9 6l6 6-6 6',
  search: 'M11 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM16.5 16.5L21 21',
  chart: 'M5 20V12M12 20V6M19 20V10M3 20h18',
  cpu: 'M9 9h6v6H9zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3',
  laptop: 'M4 5h16v11H4zM2 19h20',
}

export default function Icon({ name, size = 18, strokeWidth = 2, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
