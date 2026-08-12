import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { t, type Lang } from '../../i18n'
import { refreshScrollTriggers } from '../../motion/refreshScrollTriggers'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Professional path — six stops, chronological.
 *
 * `plate` is what each mark needs to stay legible on this dark page, and it
 * deliberately does NOT follow the legacy `.exp-logo.no-bg` split (that one
 * described the old light layout and puts MAIB's navy wordmark on no ground
 * at all, where it disappears):
 *   'light' — dark artwork: Jurista, the Government seal, MAIB, Payall.
 *   'none'  — artwork carrying its own ground: Applexium's indigo app tile,
 *             and Startup MD's white-on-transparent wordmark, which reads
 *             directly on the page and would vanish on a light plate.
 *
 * `tall` marks near-square artwork (the Applexium tile, the Government
 * seal). Every other logo here is a wide wordmark — 3:1 to 4.5:1 — so a
 * shared square chip crops them; see the CSS, where plates are
 * fixed-height/variable-width and images are always `contain`.
 */
export const EXPERIENCE = [
  { key: 'applexium', logo: '/logos/applexium-logo.jpg', plate: 'none', tall: true },
  { key: 'jurista', logo: '/logos/jurista-logo.jpg', plate: 'light', tall: false },
  { key: 'government', logo: '/logos/government-logo.svg', plate: 'light', tall: true },
  { key: 'startupmd', logo: '/logos/startup-md-logo.webp', plate: 'none', tall: false },
  { key: 'banking', logo: '/logos/maib-bank-logo.svg', plate: 'light', tall: false },
  { key: 'payall', logo: '/logos/payall-logo.svg', plate: 'light', tall: false },
] as const

/** Shared by both representations: plate colour + square-artwork sizing. */
function logoClass(base: string, item: (typeof EXPERIENCE)[number]): string {
  return [base, `${base}--${item.plate}`, item.tall ? `${base}--tall` : ''].filter(Boolean).join(' ')
}

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
    //
    // The floor matters on phones: with six stops the neighbours sit 60°
    // apart, so their chord is exactly the radius — at 390px the viewport
    // term alone gave a 164px radius against 359px-wide items and three
    // stops overlapped into one unreadable pile.
    const place = () => {
      const itemWidth = items[0]?.offsetWidth ?? 0
      const radius = Math.max(Math.min(viewport.clientWidth, window.innerHeight) * 0.42, itemWidth * 0.82)
      items.forEach((item, i) => {
        const angle = (i * spacing * Math.PI) / 180
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${i * spacing}deg) translateY(-50%)`
      })
    }
    place()

    // Depth fade: an item's own ring angle plus the ring's rotation gives
    // how far it has turned away from the camera. Without it the five stops
    // that aren't in front read as skewed noise competing with the one that
    // is — six logos and twelve lines of text at once, all illegible.
    const fade = (progress: number) => {
      items.forEach((item, i) => {
        const facing = Math.cos(((i * spacing - progress * 360) * Math.PI) / 180)
        // Cubed, not squared: at 60° spacing a squared falloff still left
        // the two neighbours at ~31% — readable enough to compete with the
        // stop actually in front.
        item.style.opacity = String(0.05 + 0.95 * Math.max(0, facing) ** 3)
      })
    }

    // Start pose applied up front, so the ring never paints one unrotated,
    // fully-opaque frame before the first scroll event arrives.
    const settle = (progress: number) => {
      ring.style.transform = `rotateZ(12deg) rotateY(${-progress * 360}deg)`
      fade(progress)
    }
    settle(0)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => settle(self.progress),
    })

    // This track is 2.5 viewports tall and only exists after the
    // reduced-motion re-sync, which moves every trigger below it — see
    // refreshScrollTriggers for why one animation frame isn't enough.
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
      <ol className="timeline">
        {EXPERIENCE.map((item) => (
          <li key={item.key} className="timeline-item">
            <div className={logoClass('timeline-item__logo', item)}>
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
              <div className={logoClass('tube__logo', item)}>
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
