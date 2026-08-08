import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

/**
 * Custom two-part cursor (dot + lagging ring). Rendering is gated on
 * useReducedMotion's SSR-safe snapshot (`true` until the client proves
 * otherwise), so the server and first client render both emit nothing —
 * no hydration mismatch. Coarse pointers (touch) are additionally filtered
 * in CSS via `@media (pointer: coarse)` and skipped here so no listeners are
 * attached on devices that will never fire mousemove.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    if (matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    document.documentElement.classList.add('has-custom-cursor')
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 })

    const ringX = gsap.quickTo(ring, 'x', { duration: 0.15, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.15, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY })
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && target.closest('a, button, [data-cursor]') != null

    // Colors are the resolved hex of --brand-cyan / --ink-dim (tokens.css):
    // GSAP's CSSPlugin animates borderColor by interpolating RGB channels,
    // which needs a concrete value up front rather than an unresolved var().
    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(ring, { scale: 1.6, borderColor: '#1fcdff', duration: 0.3, ease: 'power3.out' })
    }
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(ring, { scale: 1, borderColor: '#8b93a7', duration: 0.3, ease: 'power3.out' })
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
