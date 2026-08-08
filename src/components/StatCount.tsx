import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Big mono digit that counts up from 0 to `value` once it enters the
 * viewport. The final number is rendered up front so SSG output and
 * reduced-motion visitors both see the settled value with no animation.
 */
export function StatCount({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !numRef.current) return
    const el = numRef.current
    const obj = { val: value }

    const tween = gsap.from(obj, {
      val: 0,
      snap: 'val',
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val)}${suffix}`
      },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
    }
  }, [reduced, value, suffix])

  return (
    <div className="stat-count">
      <span ref={numRef} className="stat-count__value">
        {value}
        {suffix}
      </span>
      <span className="stat-count__label mono-label">{label}</span>
    </div>
  )
}
