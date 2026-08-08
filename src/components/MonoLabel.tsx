import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

/**
 * Mono-font "01 / LABEL" tag. The final text is rendered up front (SSR-safe,
 * no layout shift), then once it enters the viewport it briefly scrambles
 * its own characters before resolving back to the same string — a glitch-in
 * rather than a reveal. Reduced-motion visitors just see the static text.
 */
export function MonoLabel({ index, children }: { index: string; children: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const text = `${index} / ${children}`

  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current

    const tween = gsap.to(el, {
      duration: 1,
      scrambleText: { text, chars: '01▮/', speed: 0.4 },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
    }
  }, [reduced, text])

  return (
    <span ref={ref} className="mono-label">
      {text}
    </span>
  )
}
