import type { CanvasProps } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { graphicsTier, type GraphicsTier } from './graphicsTier'

// Dynamic import only: this is what keeps `three`/`@react-three/fiber`/
// `@react-three/drei` out of whatever chunk imports BeamsRBBackground —
// same split every other *Background/*Canvas pair in this directory uses.
const BeamsRBCanvas = lazy(() => import('./BeamsRBCanvas').then((m) => ({ default: m.BeamsRBCanvas })))

type BeamsRBBackgroundProps = {
  /** Forces a tier instead of auto-detecting via `graphicsTier()`. */
  tier?: GraphicsTier
  /** Always-available fallback: shown for the 'static' tier, before the
   * section nears the viewport, and while the BeamsRBCanvas chunk is
   * loading. */
  poster: ReactNode
  className?: string
  /** Overrides the tier's own default dpr (`[1, 1.75]` on `high`, flat `1`
   * otherwise — the same numbers the old `SceneCanvas` used). For a caller
   * that mounts more than one live scene at once on `high` —
   * `ProductShowcase` runs all three product backgrounds simultaneously so
   * they can cross-fade — trimming the *inactive* ones' dpr to `1` cuts
   * their fill-rate cost without pausing them (which would freeze the
   * cross-fade). */
  dpr?: CanvasProps['dpr']
}

/**
 * Lazily mounts the R3F `<Canvas>` `BeamsRBCanvas` owns once its section
 * nears the viewport, and shows a cheap `poster` everywhere a real 3D scene
 * would be wasted: SSR, `prefers-reduced-motion`, missing WebGL2, or simply
 * while far off-screen. Structurally this is `AuroraBackground`/
 * `ThreadsBackground`/`GalaxyRBBackground` re-derived for a scene that
 * mounts its own `<Canvas>` (React Bits' `Beams` ships on three.js/R3F, not
 * OGL — see `BeamsRBCanvas.tsx`'s own header) rather than owning a raw OGL
 * renderer: same tier resolution, same latching IntersectionObserver, same
 * poster-stays-mounted-underneath rule, same `load` + idle-callback gate
 * before the chunk import starts.
 *
 * `visible` maps to R3F's own `frameloop` prop instead of a manually-driven
 * rAF chain — Canvas already owns that loop internally, so toggling
 * `frameloop` between `'always'`/`'never'` is the R3F-native equivalent of
 * the OGL siblings' `paused` fix (this is exactly what `SceneCanvas` did
 * for the old three.js scenes, so nothing new was needed here).
 */
export function BeamsRBBackground({ tier, poster, className, dpr }: BeamsRBBackgroundProps) {
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
          setEntered(true) // latches — once mounted, BeamsRBCanvas stays mounted
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

  // 'lite' halves the beam count and drops dpr to 1 — both just parameterize
  // props/renderer options Beams already exposed, not shader changes.
  const lite = resolvedTier === 'lite'

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && canLoad && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <BeamsRBCanvas
              beamNumber={lite ? 4 : 8}
              dpr={dpr ?? (lite ? 1 : [1, 1.75])}
              paused={!visible}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
