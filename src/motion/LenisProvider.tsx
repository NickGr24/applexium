import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

// Smooth-scroll wiring for the whole site. Reads window/matchMedia only
// inside the effect, so it never runs during SSG. Skipped entirely under
// prefers-reduced-motion: native scrolling stays untouched.
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.12 })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
