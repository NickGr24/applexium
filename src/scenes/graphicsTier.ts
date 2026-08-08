export type GraphicsTier = 'high' | 'lite' | 'static'

/** Non-standard Device Memory API (Chromium only) — absent from lib.dom, and
 * absent at runtime everywhere else, so it's always read defensively. */
interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

// Probing WebGL2 support means creating a throwaway canvas + context, which
// isn't free. graphicsTier() can be called once per SceneCanvas instance, so
// the result is cached at module scope after the first real probe.
let webgl2Support: boolean | undefined

function supportsWebGL2(): boolean {
  if (webgl2Support !== undefined) return webgl2Support
  try {
    const canvas = document.createElement('canvas')
    webgl2Support = canvas.getContext('webgl2') !== null
  } catch {
    webgl2Support = false
  }
  return webgl2Support
}

/**
 * Picks how much 3D a visitor's device/preferences can afford. Not
 * reactive — callers that need a decision at mount time (SceneCanvas) read
 * it once; nothing here subscribes to changes.
 *
 * - `'static'`: SSR (no `window`), `prefers-reduced-motion: reduce`, or no
 *   WebGL2 — scenes must render their poster only, no Canvas ever mounts.
 * - `'lite'`: coarse pointer (touch), <=4 logical cores, or <=4GB RAM where
 *   `deviceMemory` is reported — Canvas mounts, but scenes should cut
 *   particle counts / skip postprocessing.
 * - `'high'`: everything else.
 */
export function graphicsTier(): GraphicsTier {
  if (typeof window === 'undefined') return 'static'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static'
  if (!supportsWebGL2()) return 'static'

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const fewCores = navigator.hardwareConcurrency <= 4
  const memory = (navigator as NavigatorWithMemory).deviceMemory
  const lowMemory = memory !== undefined && memory <= 4

  if (coarsePointer || fewCores || lowMemory) return 'lite'

  return 'high'
}
