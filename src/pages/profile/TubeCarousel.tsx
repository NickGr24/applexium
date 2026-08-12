import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { t, type Lang } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** Professional path — the same six stops (and `plain` logo split) the flat
 * timeline carried, now owned by the component that renders both
 * representations. `plain: true` mirrors the legacy `.exp-logo.no-bg`:
 * those three logos already sit on their own light ground. */
export const EXPERIENCE = [
  { key: 'applexium', logo: '/logos/applexium-logo.jpg', plain: true },
  { key: 'jurista', logo: '/logos/jurista-logo.jpg', plain: true },
  { key: 'government', logo: '/logos/government-logo.svg', plain: false },
  { key: 'startupmd', logo: '/logos/startup-md-logo.webp', plain: false },
  { key: 'banking', logo: '/logos/maib-bank-logo.svg', plain: true },
  { key: 'payall', logo: '/logos/payall-logo.svg', plain: false },
] as const

/**
 * The legacy site's Codrops "3D Text Scroll" tube, rebuilt for the React
 * page (tutorial: tympanus.net/Tutorials/3DTextScroll/, `Tube` class).
 * Items sit on a ring around the Y axis; a 250vh track with a sticky
 * 100svh viewport scrubs the ring through a full -360° turn (negative so
 * the stops arrive in chronological order).
 *
 * Reduced motion / SSR / no-JS render the flat `.timeline` list instead —
 * the 3D markup only exists after hydration confirms motion is allowed.
 */
export function TubeCarousel({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const ring = ringRef.current
    if (reduced || !track || !ring) return

    const viewport = track.firstElementChild as HTMLElement
    const items = Array.from(ring.children) as HTMLElement[]
    const spacing = 360 / items.length

    // Radius from the sticky viewport's own width (not the window): the
    // ring lives inside `.container`, and a window-derived radius pushes
    // side items past the clipped edge on wide screens.
    const place = () => {
      const radius = Math.min(viewport.clientWidth, window.innerHeight) * 0.42
      items.forEach((item, i) => {
        const angle = (i * spacing * Math.PI) / 180
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${i * spacing}deg) translateY(-50%)`
      })
    }
    place()

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        ring.style.transform = `rotateZ(12deg) rotateY(${-self.progress * 360}deg)`
      },
    })

    window.addEventListener('resize', place)
    return () => {
      st.kill()
      window.removeEventListener('resize', place)
    }
  }, [reduced])

  if (reduced) {
    return (
      <ol className="timeline">
        {EXPERIENCE.map((item) => (
          <li key={item.key} className="timeline-item">
            <div className={`timeline-item__logo${item.plain ? ' timeline-item__logo--plain' : ''}`}>
              <img src={item.logo} alt="" loading="lazy" decoding="async" />
            </div>
            <div>
              <div className="timeline-item__org">{t(lang, `profiles.mircea.experience.${item.key}.org`)}</div>
              <div className="timeline-item__role mono-label">
                {t(lang, `profiles.mircea.experience.${item.key}.role`)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div ref={trackRef} className="tube">
      <div className="tube__viewport">
        <ul ref={ringRef} className="tube__ring">
          {EXPERIENCE.map((item) => (
            <li key={item.key} className="tube__item">
              <div className={`tube__logo${item.plain ? ' tube__logo--plain' : ''}`}>
                <img src={item.logo} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="tube__org">{t(lang, `profiles.mircea.experience.${item.key}.org`)}</div>
              <div className="tube__role mono-label">{t(lang, `profiles.mircea.experience.${item.key}.role`)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
