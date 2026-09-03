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
  /** Overrides the default dpr (`[1, 1.75]`, the same numbers the old
   * `SceneCanvas` used). No caller sets it today: `ProductShowcase` used to
   * trim inactive cross-faded slides to `1`, but since the 2026-09 audit it
   * only ever mounts the slides being looked at. */
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
  // Unlike the three OGL scenes, this one costs the whole three.js/R3F stack
  // (~870 KB raw, ~230 KB gzipped) plus a synchronous init measured at
  // 0.5–2.5 s of main-thread time on a mid-range phone in the 2026-09
  // audit. On the 'lite' tier (touch, ≤4 cores, ≤4 GB) that is a worse
  // trade than the still poster, so 'lite' is treated as 'static' here —
  // the only *Background that does this. tests/scenes.test.tsx pins it.
  const [resolvedTier] = useState<GraphicsTier>(() => {
    const resolved = tier ?? graphicsTier()
    return resolved === 'lite' ? 'static' : resolved
  })
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

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && canLoad && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <BeamsRBCanvas beamNumber={8} dpr={dpr ?? [1, 1.75]} paused={!visible} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
