/**
 * The six service glyphs, drawn here rather than pulled from an icon font.
 * The legacy site leaned on Font Awesome, which meant a webfont on the
 * critical path for six shapes; these are 24px, 1.5-stroke, `currentColor`
 * outlines in one consistent hand, so they inherit the card's colour and cost
 * nothing beyond the markup they already sit in.
 */

const BASE = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Angle brackets — code. */
export function IconCode() {
  return (
    <svg {...BASE}>
      <path d="m8.5 8.5-4 3.5 4 3.5" />
      <path d="m15.5 8.5 4 3.5-4 3.5" />
      <path d="m13.5 5-3 14" />
    </svg>
  )
}

/** Chip with pins — AI / automation. */
export function IconChip() {
  return (
    <svg {...BASE}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.5" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3" />
      <path d="M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
    </svg>
  )
}

/** Cloud — SaaS / hosted platforms. */
export function IconCloud() {
  return (
    <svg {...BASE}>
      <path d="M17.2 18.5H7.3a4.3 4.3 0 0 1-.5-8.5 5.6 5.6 0 0 1 10.7 1.6 3.5 3.5 0 0 1-.3 6.9Z" />
    </svg>
  )
}

/** Shield with a check — compliance. */
export function IconShield() {
  return (
    <svg {...BASE}>
      <path d="M12 3.2 5 6v5.2c0 4.5 2.9 7.7 7 9.6 4.1-1.9 7-5.1 7-9.6V6l-7-2.8Z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </svg>
  )
}

/** Cog — integrations / maintenance. */
export function IconCog() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="6.4" />
      {/* Teeth: blunt-ended and thicker than the outline, so they read as
          cut into the rim rather than as rays coming off it. */}
      <path
        strokeWidth={2}
        strokeLinecap="butt"
        d="M12 4.1v2.1M12 17.8v2.1M19.9 12h-2.1M6.2 12H4.1M17.6 6.4l-1.5 1.5M7.9 16.1l-1.5 1.5M17.6 17.6l-1.5-1.5M7.9 7.9 6.4 6.4"
      />
    </svg>
  )
}

/** Axes with a trend line — advisory / reporting. */
export function IconChart() {
  return (
    <svg {...BASE}>
      <path d="M4.5 4.5v15h15" />
      <path d="m8 14.5 3.2-3.8 2.8 2.3 4.2-5.6" />
      <path d="M18.2 7.4h-2.8M18.2 7.4v2.8" />
    </svg>
  )
}
