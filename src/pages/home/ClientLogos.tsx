import { useEffect, useRef, useState } from 'react'
import { t, type Lang } from '../../i18n'
import { CLIENTS } from '../../site/clients'

/**
 * The portfolio section's client marquee.
 *
 * The scroll animation only runs while the strip is on screen. It looks free
 * (a compositor transform), but ScrollTrigger keeps a rAF alive for the whole
 * visit, so the browser produces a main frame every vsync and re-ticks every
 * *running* CSS animation in each one — off-screen and inside a
 * content-visibility-skipped section included. The 2026-09 weak-device pass
 * measured that on a phone profile (CPU x6), idle, with this strip 1500px
 * away: 120 style recalcs/s and 13.6% of the main thread, against 0 and 6.4%
 * with the animation paused. `onScreen` starts `true` so the no-JS /
 * pre-hydration markup still scrolls. Pinned by tests/clients.test.tsx.
 */
export function ClientLogos({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      // Already moving by the time its first pixel scrolls in.
      rootMargin: '120px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Two identical passes of the list, the second hidden from assistive tech:
  // the CSS marquee translates the track by exactly -50%, so the seam lands
  // where the copy begins and the loop is invisible.
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {CLIENTS.map(({ src, srcW, srcH, name, plate, tall }) => (
        <li
          className={`marquee__item marquee__item--${plate}${tall ? ' marquee__item--tall' : ''}`}
          key={`${name}-${hidden}`}
        >
          {/* width/height give the chip its final width before the lazy file
              lands — see `srcW` in site/clients.ts. CSS still sets the size. */}
          <img src={src} alt={hidden ? '' : name} width={srcW} height={srcH} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={ref}
      className={onScreen ? 'marquee' : 'marquee marquee--offscreen'}
      aria-label={t(lang, 'home.portfolio.clients')}
      role="group"
    >
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
