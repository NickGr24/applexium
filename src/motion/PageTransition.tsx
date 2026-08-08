import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { easeOut } from './ease'
import { useReducedMotion } from './useReducedMotion'

type Phase = 'idle' | 'cover' | 'reveal'

/**
 * Full-viewport shutter that plays on every route change: closes (bottom to
 * top), snaps scroll to 0, then opens (top to bottom). Children always
 * render — the SSG output never depends on the shutter's runtime state, only
 * its own CSS starting position (closed, scaleY 0) hides nothing at rest.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { key } = useLocation()
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
      window.scrollTo(0, 0)
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
        window.scrollTo(0, 0)
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
        <img src="/applexium-symbol.png" alt="" className="page-transition__symbol" />
      </div>
      {children}
    </>
  )
}
