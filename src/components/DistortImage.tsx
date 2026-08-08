import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { graphicsTier } from '../scenes/graphicsTier'

// Dynamic import only: three/@react-three/fiber must never reach whatever
// page imports DistortImage — see DistortImageCanvas's own doc comment for
// why the split lives in its own module.
const DistortImageCanvas = lazy(() =>
  import('./DistortImageCanvas').then((m) => ({ default: m.DistortImageCanvas })),
)

type DistortImageProps = {
  src: string
  alt: string
  className?: string
}

/**
 * Image with a shader ripple that follows the pointer on hover. A plain
 * `<img src alt>` is *always* rendered first — SSR/SSG output, and every
 * visitor below the 'high' tier or without a fine pointer, never see
 * anything else. Everything past that is progressive enhancement layered
 * on top as an absolutely-positioned canvas:
 *
 * 1. `graphicsTier() === 'high'` AND `(pointer: fine)` — read once in a
 *    `useEffect` (never on the server, never re-checked), same gate
 *    MagneticButton/SpotlightCard use for their own pointer-only effects.
 * 2. The image has scrolled near the viewport — the same
 *    IntersectionObserver pattern `SceneCanvas` uses, latched once true so
 *    the canvas, once mounted, is never torn back down.
 *
 * `SceneCanvas` itself isn't reused here: it's built around one full-bleed
 * hero scene per page (tier-context provider, single poster/Canvas swap).
 * A page can drop a dozen `DistortImage`s into a grid, each needing its own
 * small canvas sized to its own `<img>` — cheaper and simpler as its own
 * self-contained mount than routed through machinery meant for one big
 * scene. The plain `<img>` doubles as that "poster" — it's what shows
 * through the canvas's transparent background until the shader plane's
 * texture has loaded and painted its first frame.
 *
 * Because both gates start closed and only ever open from a `useEffect`,
 * server render and first client (hydration) render agree exactly: `<img>`
 * only, canvas absent. Nothing here can trigger a hydration mismatch.
 *
 * The pointer itself is tracked here, on this `.distort-image` container,
 * with a plain `mousemove`/`mouseenter`/`mouseleave` DOM listener — never
 * by the canvas. The canvas is `pointer-events: none` (see components.css)
 * and its shader plane has no raycasting of its own (see
 * DistortImageCanvas's doc comment for why): Task 17/18 wrap this
 * component in an `<a>` for the team/portfolio cards, and a canvas that
 * intercepts pointer events would swallow that link's hover/click/focus.
 * Position is written straight into a ref (`pointer`) as a raw container-
 * relative fraction, coalesced to one write per native event — same
 * "mutate outside React state" idiom `SpotlightCard`'s `--mx`/`--my` CSS
 * vars use — and handed to the lazily-mounted canvas as a prop; nothing
 * about mouse movement ever triggers a React re-render here.
 */
export function DistortImage({ src, alt, className }: DistortImageProps) {
  const [enhanced, setEnhanced] = useState(false) // tier + pointer gate passed
  const [entered, setEntered] = useState(false) // IntersectionObserver gate passed
  const containerRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ u: 0.5, v: 0.5, active: false })

  useEffect(() => {
    if (graphicsTier() !== 'high') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnhanced(true)
  }, [])

  useEffect(() => {
    if (!enhanced) return
    const node = containerRef.current
    if (!node) return

    // No IntersectionObserver support: fail open rather than never render.
    if (typeof IntersectionObserver === 'undefined') {
      setEntered(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true) // latches — canvas, once mounted, stays mounted
          observer.disconnect()
        }
      },
      { rootMargin: '25%' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enhanced])

  const active = enhanced && entered

  useEffect(() => {
    if (!active) return
    const node = containerRef.current
    if (!node) return

    // Rect-math only — no cover-crop awareness here. The container fraction
    // this produces gets reconciled against the plane's own (possibly
    // larger, cropped) UV space inside DistortImageCanvas, where the image's
    // aspect ratio is actually known.
    const onMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect()
      pointer.current.u = (event.clientX - rect.left) / rect.width
      pointer.current.v = 1 - (event.clientY - rect.top) / rect.height // y-down screen -> y-up UV
      pointer.current.active = true
    }
    const onEnter = () => {
      pointer.current.active = true
    }
    const onLeave = () => {
      pointer.current.active = false
    }

    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseenter', onEnter)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseenter', onEnter)
      node.removeEventListener('mouseleave', onLeave)
    }
  }, [active])

  const classes = ['distort-image', active && 'distort-image--enhanced', className].filter(Boolean).join(' ')

  return (
    <div ref={containerRef} className={classes}>
      <img src={src} alt={alt} className="distort-image__img" loading="lazy" />
      {active && (
        <div className="distort-image__canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <DistortImageCanvas src={src} pointer={pointer} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
