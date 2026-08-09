import { lazy, Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { graphicsTier, type GraphicsTier } from './graphicsTier'

// Dynamic import only: keeps `ogl` out of whatever chunk imports
// AuroraBackground. Same split every `*Background`/`*Canvas` pair in this
// directory uses (`ThreadsBackground`/`ThreadsCanvas`,
// `GalaxyRBBackground`/`GalaxyRBCanvas`, `BeamsRBBackground`/
// `BeamsRBCanvas`) — see AuroraCanvas.tsx's own doc comment for why this
// scene in particular is a straight OGL port instead of a three.js
// reinterpretation.
const AuroraCanvas = lazy(() => import('./AuroraCanvas').then((m) => ({ default: m.AuroraCanvas })))

type AuroraBackgroundProps = {
  /** Forces a tier instead of auto-detecting via `graphicsTier()`. */
  tier?: GraphicsTier
  /** Always-available fallback: shown for the 'static' tier, before the
   * section nears the viewport, and while the AuroraCanvas chunk is
   * loading. */
  poster: ReactNode
  className?: string
  /** 0..1 scroll-through-hero progress, forwarded to AuroraCanvas untouched
   * — see its own prop doc. */
  progressRef?: RefObject<number>
}

/**
 * Lazily mounts the OGL Aurora canvas once its section nears the viewport,
 * and shows a cheap `poster` everywhere real WebGL would be wasted: SSR,
 * `prefers-reduced-motion`, missing WebGL2, or simply while far off-screen.
 * Same tier resolution, same latching IntersectionObserver, same "poster
 * stays mounted underneath forever" rule that kills the black-flash gap
 * between "chunk loaded" and "first frame painted" every sibling
 * `*Background` in this directory shares (the reasoning used to live on
 * `SceneCanvas`, the R3F equivalent this migration deleted once nothing
 * used it — see `ThreadsBackground.tsx`/`GalaxyRBBackground.tsx` for the
 * two other OGL scenes built the same way, or `BeamsRBBackground.tsx` for
 * the one that stayed on R3F).
 *
 * The one addition: `visible` doesn't gate mounting (only `entered` does,
 * and it latches) — it's forwarded as `paused` to AuroraCanvas instead, so
 * OGL's manual rAF loop stops drawing while the hero scrolls out of view
 * without tearing down and rebuilding the WebGL context, the OGL analogue
 * of R3F's `frameloop: 'never'` (what `BeamsRBBackground` uses instead,
 * since it mounts a real `<Canvas>`).
 *
 * `entered` alone used to be enough to start the `AuroraCanvas` dynamic
 * import (see `canLoad` below for why that's no longer sufficient on its
 * own): the hero is full-viewport, so its container is intersecting from
 * the very first layout — `rootMargin: '25%'` fired essentially immediately
 * on mount, meaning the ~50KB `ogl` chunk started fetching and parsing
 * *during* the same window as the critical CSS/font/JS the LCP text itself
 * depends on (measured: this was part of what held home's mobile LCP at
 * ~3.5s despite the three.js-chunk preload fix in Task 22's main pass — see
 * that task's report for the before number). `canLoad` adds a second gate,
 * independent of intersection: don't even attempt the import until
 * `window`'s `load` event has fired (or immediately, if it already has by
 * the time this effect runs — true for every client-side route change,
 * since `load` only ever fires once per real navigation) and, past that, an
 * idle callback — so the fetch/parse genuinely happens after the critical
 * path is already settled, not merely "soon". The poster underneath covers
 * the entire wait either way, same as it always covered the Suspense/first-
 * frame gap.
 */
export function AuroraBackground({ tier, poster, className, progressRef }: AuroraBackgroundProps) {
  const [resolvedTier] = useState<GraphicsTier>(() => tier ?? graphicsTier())
  const [entered, setEntered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [canLoad, setCanLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resolvedTier === 'static') return
    const node = containerRef.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true) // latches — once mounted, AuroraCanvas stays mounted
          setVisible(true)
        } else {
          setVisible(false) // paused while merely off-screen, not unmounted
        }
      },
      { rootMargin: '25%' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [resolvedTier])

  useEffect(() => {
    if (resolvedTier === 'static') return

    // Schedules the actual `setCanLoad(true)` for whenever the browser next
    // has spare cycles, capped at 2s so a permanently-busy main thread can't
    // delay the aurora forever. `requestIdleCallback` isn't in Safari; a
    // short flat delay stands in there — still well after `load`, which is
    // the gate that actually matters.
    function scheduleIdle(): () => void {
      if (typeof requestIdleCallback === 'function') {
        const idleId = requestIdleCallback(() => setCanLoad(true), { timeout: 2000 })
        return () => cancelIdleCallback(idleId)
      }
      const timeoutId = window.setTimeout(() => setCanLoad(true), 200)
      return () => window.clearTimeout(timeoutId)
    }

    if (document.readyState === 'complete') {
      return scheduleIdle()
    }

    let cancelIdle: (() => void) | undefined
    const onLoad = () => {
      cancelIdle = scheduleIdle()
    }
    window.addEventListener('load', onLoad, { once: true })
    return () => {
      window.removeEventListener('load', onLoad)
      cancelIdle?.()
    }
  }, [resolvedTier])

  // 'lite' trims amplitude/speed (less GPU work per pixel isn't really the
  // cost here — the win is a calmer noise field, cheaper to eyeball as
  // "stable" — and drops dpr to 1) instead of the retina-clamped dpr 'high'
  // gets; both just parameterize uniforms/renderer options Aurora already
  // exposed, not shader changes.
  const lite = resolvedTier === 'lite'

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && canLoad && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <AuroraCanvas
              amplitude={lite ? 0.8 : 1.05}
              speed={lite ? 0.7 : 1.0}
              blend={0.55}
              dpr={lite ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)}
              progressRef={progressRef}
              paused={!visible}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
