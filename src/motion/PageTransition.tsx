import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { easeOut } from './ease'
import { useReducedMotion } from './useReducedMotion'

type Phase = 'idle' | 'cover' | 'reveal'

/**
 * Scrolls to the new location's #hash target once the shutter's midpoint
 * hides the viewport, or snaps to the top when there is no hash. A plain
 * full page load already lands on a #hash target for free (the browser's
 * own fragment navigation, against the SSR-rendered markup — every section
 * id is real, server-rendered HTML, never conditionally mounted), but a
 * client-side route change is React Router navigating in place: nothing
 * scrolls anywhere on its own, which is why e.g. a "#servicii" link in
 * Nav.tsx clicked from another page used to land at the top of the home
 * page instead of the services section. Retries briefly rather than once,
 * since the target section can still be behind a Suspense boundary for a
 * lazy route chunk that hasn't resolved yet the instant the shutter's
 * midpoint fires.
 */
function scrollToRouteTarget(hash: string, attempt = 0) {
  if (!hash) {
    window.scrollTo(0, 0)
    return
  }
  const id = decodeURIComponent(hash.slice(1))
  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
    return
  }
  // ~1s of retries (20 x 50ms) before giving up quietly — a stale/typo'd
  // hash just leaves scroll wherever the shutter left it, rather than
  // polling forever.
  if (attempt < 20) window.setTimeout(() => scrollToRouteTarget(hash, attempt + 1), 50)
}

/**
 * Full-viewport shutter that plays on every route change: closes (bottom to
 * top), snaps scroll to 0 (or to the new URL's #hash target, see
 * `scrollToRouteTarget` above), then opens (top to bottom). Children always
 * render — the SSG output never depends on the shutter's runtime state, only
 * its own CSS starting position (closed, scaleY 0) hides nothing at rest.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { key, hash } = useLocation()
  const overlayRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isFirstRender = useRef(true)
  const [phase, setPhase] = useState<Phase>('idle')

  useLayoutEffect(() => {
    // The shutter only plays between navigations, never on first paint.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (reducedMotion) {
      scrollToRouteTarget(hash)
      return
    }

    const overlay = overlayRef.current
    if (!overlay) return

    const tl = gsap.timeline({
      onStart: () => setPhase('cover'),
      onComplete: () => setPhase('idle'),
    })
    tl.set(overlay, { transformOrigin: 'bottom' })
      .to(overlay, { scaleY: 1, duration: 0.45, ease: easeOut })
      .call(() => {
        scrollToRouteTarget(hash)
        setPhase('reveal')
      })
      .set(overlay, { transformOrigin: 'top' })
      .to(overlay, { scaleY: 0, duration: 0.45, ease: easeOut })

    return () => {
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <>
      <div ref={overlayRef} className="page-transition" data-phase={phase} aria-hidden="true">
        <img src="/brand/applexium-symbol.png" alt="" className="page-transition__symbol" />
      </div>
      {children}
    </>
  )
}
