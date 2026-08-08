import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { type Lang, localePath, t } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'
import { AuroraBackground } from '../../scenes/AuroraBackground'

gsap.registerPlugin(ScrollTrigger)

/**
 * The hero: a 260vh-tall scroll track with a sticky 100vh stage. One scrubbed
 * ScrollTrigger drives two things at once — the aurora's swell (written
 * straight into `progressRef`, never into React state, since AuroraCanvas
 * reads it every frame — see its own prop doc) and the headline coming
 * apart, its three lines drifting in different directions as they fade.
 *
 * Under `prefers-reduced-motion` nothing here runs: `progressRef` stays 0, so
 * the scene — which `graphicsTier()` has already downgraded to `'static'` for
 * the same reason — shows its poster as a single still frame, the headline
 * holds its place, and CSS collapses the track to one screen so there is no
 * dead scrolling to sit through. The markup is identical either way, so the
 * pre-rendered HTML hydrates cleanly.
 */
export function HeroSection({ lang }: { lang: Lang }) {
  const trackRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const copyScrimRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const copy = copyRef.current
    if (!track || !copy) return

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('.hero__line', copy)
      const tail = gsap.utils.toArray<HTMLElement>('.hero__tail', copy)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          // The camera reads this every frame; a re-render per scroll tick
          // would be pure waste, so the progress never becomes state.
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // A scrub maps the scroll range onto the timeline's *duration*, and a
      // timeline is only as long as its last child — so this empty tween is
      // what makes the numbers below read as fractions of the whole track.
      // Without it the headline would still be dissolving at the very end of
      // the flight instead of being long gone.
      tl.to({}, { duration: 1 }, 0)

      // Duration 0.5: the headline is gone by the halfway point, and the
      // second half of the track is the camera alone, deep in the colonnade
      // with nothing on top of it.
      tl.to(lines[0], { yPercent: -115, opacity: 0, ease: 'none', duration: 0.5 }, 0)
        .to(lines[1], { yPercent: -25, opacity: 0, ease: 'none', duration: 0.5 }, 0)
        .to(lines[2], { yPercent: 135, opacity: 0, ease: 'none', duration: 0.5 }, 0)
        .to(tail, { opacity: 0, y: -32, ease: 'none', duration: 0.3 }, 0)
        // The copy's backing leaves with the copy — over the same half of the
        // track as the headline, so nothing is left sitting on a dimmed scene
        // once there is no text to protect.
        .to(copyScrimRef.current, { opacity: 0, ease: 'none', duration: 0.5 }, 0)
    }, track)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="hero" ref={trackRef}>
      <div className="hero__stage">
        <div className="hero__scene">
          <AuroraBackground
            className="scene-canvas"
            poster={<div className="scene-poster scene-poster--hero" aria-hidden="true" />}
            progressRef={progressRef}
          />
        </div>

        <div className="hero__scrim" aria-hidden="true" />
        <div className="hero__scrim hero__scrim--copy" aria-hidden="true" ref={copyScrimRef} />

        <div className="hero__copy container" ref={copyRef}>
          <h1 className="hero__title">
            <span className="hero__line">{t(lang, 'home.hero.line1')}</span>
            <span className="hero__line">{t(lang, 'home.hero.line2')}</span>
            <span className="hero__line">{t(lang, 'home.hero.line3')}</span>
          </h1>

          <p className="hero__sub hero__tail">{t(lang, 'home.hero.sub')}</p>

          <div className="hero__actions hero__tail">
            <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
              {t(lang, 'home.hero.primary')}
            </MagneticButton>
            <MagneticButton variant="ghost" href="#servicii">
              {t(lang, 'home.hero.ghost')}
            </MagneticButton>
          </div>

          <span className="hero__scroll mono-label hero__tail">{t(lang, 'home.hero.scroll')}</span>
        </div>
      </div>
    </section>
  )
}
