import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { t, type Lang } from '../../i18n'
import { refreshScrollTriggers } from '../../motion/refreshScrollTriggers'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** Academic background — the same four degrees the flat grid carried. */
export const EDUCATION = ['phd', 'llm1', 'llm2', 'llb'] as const

/**
 * Codrops "3D Text Scroll", cylinder variant (legacy `.cylinder__*`):
 * degrees on a ring around the X axis, scrubbed so the wheel spins in from
 * below and out over the top while a 200vh track holds the sticky viewport.
 * Reduced motion / SSR render `.education-grid`.
 */
export function CylinderWheel({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const ring = ringRef.current
    if (reduced || !track || !ring) return

    const viewport = track.firstElementChild as HTMLElement
    const items = Array.from(ring.children) as HTMLElement[]
    const spacing = 180 / items.length

    // Same radius floor as the tube: four degrees 45° apart need the ring
    // wide enough that a phone doesn't stack them on top of each other.
    const place = () => {
      const itemHeight = items[0]?.offsetHeight ?? 0
      const radius = Math.max(Math.min(viewport.clientWidth, window.innerHeight) * 0.42, itemHeight * 1.6)
      items.forEach((item, i) => {
        const angle = (i * spacing * Math.PI) / 180
        const y = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        item.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${y}px, ${z}px) rotateX(${i * -spacing}deg)`
      })
    }
    place()

    // Same depth fade as the tube: under rotateX(θ) an item sitting at ring
    // angle `a` has depth ∝ cos(a − θ), so that cosine is exactly how much
    // it faces the camera.
    const fade = (rotation: number) => {
      items.forEach((item, i) => {
        const facing = Math.cos(((i * spacing - rotation) * Math.PI) / 180)
        item.style.opacity = String(0.05 + 0.95 * Math.max(0, facing) ** 3)
      })
    }

    // The four degrees occupy ring angles 0°–135° (spacing 180/4), and an
    // item faces the camera when the rotation reaches its angle. Sweeping
    // to the tutorial's 270° would spend the last third of the scroll on an
    // empty wheel, so the range stops just past the final degree, with a
    // matching lead-in before the first.
    const LEAD = 60
    const from = -LEAD
    const to = (items.length - 1) * spacing + LEAD
    const rotationAt = (progress: number) => from + progress * (to - from)

    // Settle the wheel at its start pose before the first scroll event, so
    // the section never paints one frame of an unrotated, fully-opaque stack.
    const settle = (progress: number) => {
      const rotation = rotationAt(progress)
      ring.style.transform = `rotateX(${rotation}deg)`
      fade(rotation)
    }
    settle(0)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => settle(self.progress),
    })

    // Same stale-measurement problem the tube documents, and the one that
    // bit hardest here: this track sits below the tube's, so it absorbs the
    // full height change of both swaps.
    const cancelRefresh = refreshScrollTriggers()

    window.addEventListener('resize', place)
    return () => {
      cancelRefresh()
      st.kill()
      window.removeEventListener('resize', place)
    }
  }, [reduced])

  if (reduced) {
    return (
      <div className="education-grid">
        {EDUCATION.map((key) => (
          <div key={key} className="education-card">
            <div className="education-card__degree">{t(lang, `profiles.mircea.education.${key}.degree`)}</div>
            <div className="education-card__field mono-label">{t(lang, `profiles.mircea.education.${key}.field`)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={trackRef} className="cylinder">
      <div className="cylinder__viewport">
        <ul ref={ringRef} className="cylinder__ring">
          {EDUCATION.map((key) => (
            <li key={key} className="cylinder__item">
              <span className="cylinder__degree">{t(lang, `profiles.mircea.education.${key}.degree`)}</span>
              <span className="cylinder__field mono-label">{t(lang, `profiles.mircea.education.${key}.field`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
