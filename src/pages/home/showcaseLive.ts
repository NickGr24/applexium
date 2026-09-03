/**
 * Which product-showcase slides need a live WebGL canvas at a given scroll
 * progress. Pure so it can be unit-tested (tests/showcase.test.ts) and so
 * the numbers the GSAP timeline in ProductShowcase.tsx is built from and
 * the numbers that decide mounting are literally the same constants.
 */

/** Where each slide hands over to the next, as a fraction of the pinned
 * scroll. The windows are narrow and centred between the snap points (0,
 * 0.5, 1) so each product holds still for most of its third and the swap
 * happens while the reader is already moving. */
export const HANDOVER = [
  { out: 0, in: 1, at: 0.22 },
  { out: 1, in: 2, at: 0.68 },
] as const

/** Length of each cross-fade, in progress units. */
export const FADE = 0.1

/** How far ahead of a fade the incoming slide's canvas starts mounting.
 * Mounting is gated behind an idle callback and a chunk load, so without a
 * head start the incoming slide would still be its poster when the fade
 * begins; 0.06 of a 300vh track is ~18vh of scroll, a few hundred ms at
 * reading speed. */
export const LEAD = 0.06

export type LiveSlides = {
  /** The slide the reader is looking at (drives copy/CTA state). */
  active: number
  /** Slides that should have a live canvas, ascending. Never more than two:
   * the resting slide, plus the incoming one during a hand-over. */
  live: number[]
}

export function liveSlides(progress: number): LiveSlides {
  let active = 0
  for (const h of HANDOVER) if (progress >= h.at + FADE / 2) active = h.in

  for (const h of HANDOVER) {
    if (progress >= h.at - LEAD && progress <= h.at + FADE) {
      return { active, live: [h.out, h.in] }
    }
  }
  return { active, live: [active] }
}
