interface Props {
  size?: number
  className?: string
}

export function LoginLogo({ size = 120, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="llbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9B5FF5" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="llshine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect x="4" y="4" width="112" height="112" rx="26" fill="url(#llbg)" />
      {/* Top shine */}
      <rect x="4" y="4" width="112" height="58" rx="26" fill="url(#llshine)" />

      {/* Fork — left half */}
      {/* 3 tines */}
      <rect x="21" y="24" width="5" height="20" rx="2.5" fill="white" />
      <rect x="30" y="24" width="5" height="20" rx="2.5" fill="white" />
      <rect x="39" y="24" width="5" height="20" rx="2.5" fill="white" />
      {/* Base connector between tines and handle */}
      <rect x="21" y="42" width="23" height="10" rx="3" fill="white" />
      {/* Handle */}
      <rect x="30" y="50" width="5" height="36" rx="2.5" fill="white" />

      {/* Subtle divider */}
      <rect x="58.5" y="20" width="1.5" height="80" rx="1" fill="white" fillOpacity="0.18" />

      {/* Bar chart — right half, 3 ascending bars */}
      <rect x="65" y="72" width="9" height="16" rx="3" fill="white" fillOpacity="0.6" />
      <rect x="78" y="56" width="9" height="32" rx="3" fill="white" fillOpacity="0.8" />
      <rect x="91" y="38" width="9" height="50" rx="3" fill="white" />

      {/* Trend line over bars */}
      <polyline
        points="69.5,72 82.5,56 95.5,38"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.45"
      />
      {/* Trend dot at peak */}
      <circle cx="95.5" cy="38" r="3.5" fill="white" fillOpacity="0.9" />
    </svg>
  )
}
