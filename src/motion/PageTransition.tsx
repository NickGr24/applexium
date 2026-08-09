import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { easeOut } from './ease'
import { useReducedMotion } from './useReducedMotion'

type Phase = 'idle' | 'cover' | 'reveal'

/**
 * Cancellation handle for one `scrollToRouteTarget` retry chain — created
 * fresh per effect run (one per navigation) in `PageTransition` below, and
 * torn down in that effect's own cleanup. Without this, a chain still
 * mid-retry when a *second* navigation starts before the first target ever
 * appears (e.g. two hash links clicked in quick succession, faster than the
 * ~1s retry budget) would keep polling with the *first* navigation's stale
 * hash and could scroll the second page out from under the visitor once its
 * own target finally mounts.
 */
type ScrollToken = { cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null }

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
function scrollToRouteTarget(hash: string, token: ScrollToken, attempt = 0) {
  if (token.cancelled) return
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
  // polling forever. The scheduled id is stashed on the token so the owning
  // effect's cleanup can clear it outright, not just rely on the
  // `cancelled` check above (which still stops it from *doing* anything,
  // but leaves a dead timer ticking otherwise).
  if (attempt < 20) {
    token.timeoutId = setTimeout(() => scrollToRouteTarget(hash, token, attempt + 1), 50)
  }
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

    // Fresh per navigation (per effect run) — see ScrollToken's own doc
    // comment for why a still-pending retry chain from a *previous*
    // navigation needs to be cancellable rather than left to run to
    // completion against a now-stale hash.
    const scrollToken: ScrollToken = { cancelled: false, timeoutId: null }
    const cancelScroll = () => {
      scrollToken.cancelled = true
      if (scrollToken.timeoutId !== null) clearTimeout(scrollToken.timeoutId)
    }

    if (reducedMotion) {
      scrollToRouteTarget(hash, scrollToken)
      return cancelScroll
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
        scrollToRouteTarget(hash, scrollToken)
        setPhase('reveal')
      })
      .set(overlay, { transformOrigin: 'top' })
      .to(overlay, { scaleY: 0, duration: 0.45, ease: easeOut })

    return () => {
      tl.kill()
      cancelScroll()
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
