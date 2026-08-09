/**
 * Six hero glyphs for the legal pages, one per document. The new stack
 * doesn't load Font Awesome (see `pages/home/icons.tsx` — same reasoning:
 * a webfont on the critical path for a handful of shapes isn't worth it),
 * so `LegalLayout`'s hero icon needs its own inline-SVG replacements for
 * the six `fa-*` classes `LegalPage.tsx` used to pass in. Same hand as
 * `pages/home/icons.tsx`: 24px, 1.5-stroke, round caps/joins, `currentColor`.
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

/** Figure inside a ring — accessibility (replaces `fa-universal-access`). */
export function IconAccessibility() {
  return (
    <svg {...BASE}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="8.3" r="1.4" />
      <path d="M8 11.3c1.3.5 2.7.8 4 .8s2.7-.3 4-.8" />
      <path d="M12 12.1v4.6" />
      <path d="m9.6 16.7 1.6-3.3M14.4 16.7l-1.6-3.3" />
    </svg>
  )
}

/** Two hemispheres with fold marks — AI ethics (replaces `fa-brain`). */
export function IconBrain() {
  return (
    <svg {...BASE}>
      <path d="M9.5 4.2a3 3 0 0 0-3 2.9 3.3 3.3 0 0 0-2.3 3.1c0 .9.4 1.7 1 2.3a3.3 3.3 0 0 0 2.3 5.6c.2 1.4 1.5 2.5 3 2.5" />
      <path d="M14.5 4.2a3 3 0 0 1 3 2.9 3.3 3.3 0 0 1 2.3 3.1c0 .9-.4 1.7-1 2.3a3.3 3.3 0 0 1-2.3 5.6c-.2 1.4-1.5 2.5-3 2.5" />
      <path d="M12 5v14" />
      <path d="M9.3 12.4c.9.4 1.8.4 2.7 0M14.7 12.4c-.9.4-1.8.4-2.7 0" />
    </svg>
  )
}

/** Bitten cookie with chip dots — cookie policy (replaces `fa-cookie-bite`). */
export function IconCookie() {
  return (
    <svg {...BASE}>
      <path d="M12 4c.3 1.7-1.1 3.1-2.8 2.8A3.4 3.4 0 0 1 5.6 10c-2 .8-3 3-2.4 5A8 8 0 1 0 20 11.6c-2.3.5-4.4-1.5-3.9-3.9A8 8 0 0 0 12 4Z" />
      <circle cx="9" cy="14" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Single leaf with a centre vein — ESG (replaces `fa-leaf`). */
export function IconLeaf() {
  return (
    <svg {...BASE}>
      <path d="M6 18C6 10 11 5 19 5c0 8-5 13-13 13Z" />
      <path d="M6 18c2-4 5.5-7.5 9.5-9.5" />
    </svg>
  )
}

/** Shield split down the middle — privacy (replaces `fa-shield-halved`). */
export function IconShieldHalf() {
  return (
    <svg {...BASE}>
      <path d="M12 3.2 5 6v5.2c0 4.5 2.9 7.7 7 9.6 4.1-1.9 7-5.1 7-9.6V6l-7-2.8Z" />
      <path d="M12 3.2v17.6" />
    </svg>
  )
}

/** Folded-corner document with a signed checkmark — terms (replaces `fa-file-contract`). */
export function IconFileContract() {
  return (
    <svg {...BASE}>
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v4h4" />
      <path d="M8.5 12.5h7M8.5 15h4.5" />
      <path d="m15 17.5 1.3 1.3L19 16" />
    </svg>
  )
}
