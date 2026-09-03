import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { graphicsTier, type GraphicsTier } from './graphicsTier'

// Dynamic import only: keeps `ogl` out of whatever chunk imports
// GalaxyRBBackground. Same split as AuroraCanvas/AuroraBackground and
// ThreadsCanvas/ThreadsBackground.
const GalaxyRBCanvas = lazy(() => import('./GalaxyRBCanvas').then((m) => ({ default: m.GalaxyRBCanvas })))

type GalaxyRBBackgroundProps = {
  /** Forces a tier instead of auto-detecting via `graphicsTier()`. */
  tier?: GraphicsTier
  /** Always-available fallback: shown for the 'static' tier, before the
   * section nears the viewport, and while the GalaxyRBCanvas chunk is
   * loading. */
  poster: ReactNode
  className?: string
  /** Overrides the tier's own dpr — see `ThreadsBackground`'s identical
   * prop for why (`ProductShowcase` trims inactive cross-faded slides). */
  dpr?: number
}

/**
 * Lazily mounts the OGL Galaxy canvas once its section nears the viewport,
 * and shows a cheap `poster` everywhere real WebGL would be wasted. Same
 * structure as `AuroraBackground`/`ThreadsBackground` — see either for the
 * full reasoning (tier resolution, latching IntersectionObserver, poster
 * mounted permanently underneath, the `load` + idle-callback gate before
 * the chunk import starts).
 */
export function GalaxyRBBackground({ tier, poster, className, dpr }: GalaxyRBBackgroundProps) {
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
          setEntered(true) // latches — once mounted, GalaxyRBCanvas stays mounted
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

    function scheduleIdle(timeout: number): () => void {
      if (typeof requestIdleCallback === 'function') {
        const idleId = requestIdleCallback(() => setCanLoad(true), { timeout })
        return () => cancelIdleCallback(idleId)
      }
      const timeoutId = window.setTimeout(() => setCanLoad(true), 200)
      return () => window.clearTimeout(timeoutId)
    }

    // Already past `load` (a client-side route change, or a showcase slide
    // just brought live mid-scroll): the critical path settled long ago, so
    // only a short idle wait is worth having. The 2s cap below is what made
    // a showcase hand-over sit on its poster for most of the cross-fade.
    if (document.readyState === 'complete') {
      return scheduleIdle(300)
    }

    let cancelIdle: (() => void) | undefined
    const onLoad = () => {
      cancelIdle = scheduleIdle(2000)
    }
    window.addEventListener('load', onLoad, { once: true })
    return () => {
      window.removeEventListener('load', onLoad)
      cancelIdle?.()
    }
  }, [resolvedTier])

  // 'lite' drops dpr to 1 and skips the mouse-repulsion interaction — both
  // just parameterize props/renderer options Galaxy already exposed, not
  // shader changes.
  const lite = resolvedTier === 'lite'

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && canLoad && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <GalaxyRBCanvas
              mouseInteraction={!lite}
              mouseRepulsion={!lite}
              dpr={dpr ?? (lite ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2))}
              paused={!visible}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
