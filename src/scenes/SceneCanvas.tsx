import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import type { CanvasProps } from '@react-three/fiber'
import { graphicsTier, type GraphicsTier } from './graphicsTier'

// Dynamic import only: this is what keeps `three`/`@react-three/fiber` out
// of whatever chunk imports SceneCanvas. See SceneCanvasInner's own doc
// comment for why the Suspense boundary lives there instead of here.
const SceneCanvasInner = lazy(() =>
  import('./SceneCanvasInner').then((m) => ({ default: m.SceneCanvasInner })),
)

type SceneCanvasProps = {
  /** Forces a tier instead of auto-detecting via `graphicsTier()`. */
  tier?: GraphicsTier
  /** Always-available fallback: shown for the 'static' tier, before the
   * section nears the viewport, and while the Canvas chunk is loading. */
  poster: ReactNode
  className?: string
  camera?: CanvasProps['camera']
  /** Overrides the tier's own default device-pixel-ratio (`[1, 1.75]` on
   * `high`, flat `1` otherwise). For a caller that mounts more than one
   * live Canvas at once on `high` — ProductShowcase runs all three product
   * scenes simultaneously so they can cross-fade — trimming the *inactive*
   * ones down to `1` cuts their fill-rate cost without pausing their
   * frameloop (which would freeze the cross-fade itself). */
  dpr?: CanvasProps['dpr']
  children?: ReactNode
}

/**
 * Lazily mounts an R3F Canvas once its section nears the viewport, and
 * shows a cheap `poster` everywhere a real 3D scene would be wasted: SSR,
 * `prefers-reduced-motion`, missing WebGL2, or simply while far off-screen.
 *
 * Tier is resolved once, in a `useState` initializer, rather than re-read
 * on every render — the server render and the first client (hydration)
 * render both go through `graphicsTier()`'s own SSR branch (`'static'`),
 * so there is nothing here that can disagree with the pre-rendered HTML.
 * The visual output for the `'static'` tier and for a non-static tier that
 * simply hasn't entered the viewport yet is identical (poster only), so
 * even once the client resolves the *real* tier after mount there is
 * nothing to reconcile against what was hydrated — the swap to Canvas only
 * ever happens later, from the IntersectionObserver effect below.
 *
 * `poster` is always mounted, as an absolutely-positioned base layer —
 * never swapped out once Canvas exists. R3F's Canvas clears to a
 * transparent background by default, and there is a real, visible gap
 * between "the Canvas element exists in the DOM" and "the first WebGL
 * frame has actually painted" (chunk already loaded, but the renderer,
 * scene graph, and first `useFrame` tick still need to run). If poster
 * were removed the moment Canvas mounts — e.g. as a Suspense fallback,
 * which only covers the chunk-load wait, not that first-frame wait — that
 * gap shows whatever sits behind the transparent canvas (the page
 * background), not the poster. Keeping poster mounted underneath for
 * good means that gap is invisible: the poster is what shows through
 * until the scene paints over it, and it doubles as the scene's intended
 * backdrop for any part of the frame the scene itself leaves transparent.
 */
export function SceneCanvas({ tier, poster, className, camera, dpr, children }: SceneCanvasProps) {
  const [resolvedTier] = useState<GraphicsTier>(() => tier ?? graphicsTier())
  const [entered, setEntered] = useState(false)
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('never')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resolvedTier === 'static') return
    const node = containerRef.current
    if (!node) return

    // No IntersectionObserver support: fail open rather than never render.
    if (typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      setFrameloop('always')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true) // latches — Canvas, once mounted, stays mounted
          setFrameloop('always')
        } else {
          setFrameloop('never') // paused while merely off-screen, not unmounted
        }
      },
      { rootMargin: '25%' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [resolvedTier])

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{poster}</div>
      {resolvedTier !== 'static' && entered && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <SceneCanvasInner
              tier={resolvedTier}
              camera={camera}
              dpr={dpr ?? (resolvedTier === 'high' ? [1, 1.75] : 1)}
              frameloop={frameloop}
            >
              {children}
            </SceneCanvasInner>
          </Suspense>
        </div>
      )}
    </div>
  )
}
