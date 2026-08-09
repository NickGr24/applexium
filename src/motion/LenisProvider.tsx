import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createContext, useContext, useEffect, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

// Exposes the live Lenis instance (or null: SSR, prefers-reduced-motion, or
// not yet mounted) to anything that needs to stop/start smooth-scroll
// itself — e.g. Nav's mobile menu overlay, which shouldn't let the page
// scroll underneath it while open. `null` is a legitimate, common value
// here, not just a loading state, so consumers must treat it as optional.
const LenisContext = createContext<Lenis | null>(null)

export function useLenis(): Lenis | null {
  return useContext(LenisContext)
}

// Smooth-scroll wiring for the whole site. Reads window/matchMedia only
// inside the effect, so it never runs during SSG. Skipped entirely under
// prefers-reduced-motion: native scrolling stays untouched, and useLenis()
// returns null throughout.
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({ lerp: 0.12 })
    instance.on('scroll', ScrollTrigger.update)
    setLenis(instance)

    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
