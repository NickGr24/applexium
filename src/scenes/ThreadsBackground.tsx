import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { graphicsTier, type GraphicsTier } from './graphicsTier'

// Dynamic import only: keeps `ogl` out of whatever chunk imports
// ThreadsBackground. Same split as AuroraCanvas/AuroraBackground.
const ThreadsCanvas = lazy(() => import('./ThreadsCanvas').then((m) => ({ default: m.ThreadsCanvas })))

type ThreadsBackgroundProps = {
  /** Forces a tier instead of auto-detecting via `graphicsTier()`. */
  tier?: GraphicsTier
  /** Always-available fallback: shown for the 'static' tier, before the
   * section nears the viewport, and while the ThreadsCanvas chunk is
   * loading. */
  poster: ReactNode
  className?: string
  /** Overrides the tier's own dpr. `ProductShowcase` trims the two inactive
   * cross-faded slides to `1` on the `high` tier while keeping their rAF
   * chain alive (same knob `SceneCanvas` used to expose for the old
   * three.js scenes) — see that file's own comment. */
  dpr?: number
}

/**
 * Lazily mounts the OGL Threads canvas once its section nears the viewport,
 * and shows a cheap `poster` everywhere real WebGL would be wasted: SSR,
 * `prefers-reduced-motion`, missing WebGL2, or simply while far off-screen.
 * Structurally this is `AuroraBackground` re-derived for a second OGL scene
 * — same tier resolution, same latching IntersectionObserver, same
 * poster-stays-mounted-underneath rule, same `load` + idle-callback gate on
 * top of intersection before the chunk import even starts (Emmi's product
 * hero is a full-viewport section too, so it's intersecting from the very
 * first layout — see `AuroraBackground`'s own doc comment for why that
 * alone isn't a safe trigger for starting the fetch). See that file for the
 * full reasoning; it applies unchanged here.
 */
export function ThreadsBackground({ tier, poster, className, dpr }: ThreadsBackgroundProps) {
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
          setEntered(true) // latches — once mounted, ThreadsCanvas stays mounted
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

  // 'lite' drops dpr to 1 and skips the cursor-parallax mouse interaction —
  // both just parameterize props/renderer options Threads already exposed,
  // not shader changes.
  const lite = resolvedTier === 'lite'

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && canLoad && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <ThreadsCanvas
              enableMouseInteraction={!lite}
              dpr={dpr ?? (lite ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2))}
              paused={!visible}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
