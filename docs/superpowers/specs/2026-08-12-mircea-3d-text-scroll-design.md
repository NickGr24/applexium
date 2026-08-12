# Mircea Ursu profile — 3D text scroll for experience & education

**Date:** 2026-08-12
**Source technique:** Codrops "3D Text Scroll" (https://tympanus.net/Tutorials/3DTextScroll/,
repo `davidfaure/3d-text-animation-codrops`) — the same tutorial the legacy
`_legacy/mircea-ursu.html` already used (`.tube__*` / `.cylinder__*`), flattened
into plain lists during the redesign. This restores the 3D presentation inside
the new design system.

## Goal

On `/mircea-ursu` (RO + EN), present the six professional stops as a horizontal
3D carousel (tube, rotateY) and the four degrees as a vertical 3D wheel
(cylinder, rotateX), both driven by scroll. The existing flat lists remain the
reduced-motion / SSR / no-JS representation.

## Scope

- Only the Mircea Ursu page. Diana's and Nichita's profiles are untouched.
- No new pages, no `pages.json` / `fix-preload.mjs` / i18n changes — all copy
  keys (`profiles.mircea.experience.*`, `profiles.mircea.education.*`) exist.

## Components

Two new colocated components, used only by `mircea-ursu.tsx`:

- `src/pages/profile/TubeCarousel.tsx` — experience. Renders the current
  `EXPERIENCE` data (logo chip + org + role per item). Items are positioned on
  a ring around the Y axis: `x = sin(angle)·r`, `z = cos(angle)·r`,
  `rotateY = index·(360/n)`, with `r = min(vw, vh) · 0.4`. A wrapper element
  rotates `rotateZ(15deg) rotateY(progress·360°)` as the section scrolls.
- `src/pages/profile/CylinderWheel.tsx` — education. Items on a ring around
  the X axis with `spacing = 180/n`, wheel scrubbed `rotateX` from −80° to
  270° over the section's scroll span.

Both live inside the existing `Section` chrome (index 02/03, label, title).
Styles go to `mircea-ursu.css` using site tokens (display font for org names,
`mono-label` for roles, existing light/dark logo-chip treatment so white SVGs
stay visible).

## Scroll wiring

- A tall "track" (`~250vh` tube, `~200vh` cylinder) with a `position: sticky;
  top: 0; height: 100svh` viewport inside — the legacy page's own approach.
  No GSAP pin, no ScrollSmoother (Lenis already drives ScrollTrigger via
  `LenisProvider`).
- One `ScrollTrigger.create({ trigger: track, start: 'top top', end:
  'bottom bottom', scrub, onUpdate })` per component maps `self.progress`
  onto the wrapper rotation while the sticky viewport is held. Position math
  recalculated on resize (same `resize()` contract as the tutorial classes).
- Easing: rotation maps linearly to scroll (scrub), matching the tutorial;
  no custom curve needed.

## Reduced motion / SSR / fallback

`useReducedMotion()` gates the whole thing, per the repo-wide rule:

- Server + first client render (`reduced === true`): the current flat
  `<ol class="timeline">` and `.education-grid` render — static HTML keeps the
  full semantic content for SEO and no-JS visitors (verify-dist unaffected).
- After hydration, when motion is allowed, the section swaps to the 3D markup
  (a state-driven swap, not a hydration mismatch).
- `prefers-reduced-motion` users keep the flat lists permanently.

## Mobile

The effect stays on (scrub works with touch scroll); radius already scales
with `min(vw, vh)`, type sizes clamp down, logo chips shrink. The sticky
viewport uses `100svh`.

## Accessibility

The 3D items are the real content (semantic `ul`/`li` with real text), so
screen readers read them regardless of transforms. No interactive elements
inside the rotated planes. Reduced-motion users never see moving content.

## Testing / verification

- `npm test` (i18n/meta invariants — untouched, must stay green).
- `npm run build` — verify-dist must stay green (static HTML still contains
  the flat lists' text).
- Browser pass (chrome-devtools MCP): desktop + 390px mobile, scroll through
  both sections; `prefers-reduced-motion` emulation shows flat lists; no
  horizontal overflow; no console errors.
