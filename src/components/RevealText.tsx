import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wraps a block so it lifts + fades in (y: 32 -> 0, opacity 0 -> 1) once as
 * it enters the viewport. Content always renders — the tween only ever runs
 * client-side, so reduced-motion visitors and the pre-rendered HTML see the
 * final, settled state with nothing missing.
 */
export function RevealText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !ref.current) return

    const tween = gsap.from(ref.current, {
      y: 32,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
    }
  }, [reduced])

  return <div ref={ref}>{children}</div>
}
