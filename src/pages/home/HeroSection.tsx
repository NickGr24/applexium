import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { type Lang, localePath, t } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'
import { AuroraBackground } from '../../scenes/AuroraBackground'
import { CLIENTS } from '../../site/clients'

const HERO_CLIENTS = CLIENTS.filter((c) => c.hero)

gsap.registerPlugin(ScrollTrigger)

/**
 * The hero: a 140vh-tall scroll track with a sticky 100vh stage. One scrubbed
 * ScrollTrigger drives two things at once — the aurora's swell (written
 * straight into `progressRef`, never into React state, since AuroraCanvas
 * reads it every frame — see its own prop doc) and the headline coming
 * apart, its three lines drifting in different directions as they fade.
 *
 * Unlike the old camera-driven HeroWorld, the aurora has no dolly to carry
 * the back half of the track — so the headline's dissolve is stretched
 * across nearly the whole timeline (see the `duration: 0.88` below) instead
 * of finishing at the halfway point. That keeps *something* legible on
 * screen until just before the stage hands off to the manifesto; a track
 * that finished fading by 50% left the last ~90vh of scroll as bare
 * gradient with nothing happening.
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
          // AuroraCanvas reads this every frame off the ref; a re-render per
          // scroll tick would be pure waste, so the progress never becomes
          // state.
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        },
      })

      // A scrub maps the scroll range onto the timeline's *duration*, and a
      // timeline is only as long as its last child — so this empty tween is
      // what makes the numbers below read as fractions of the whole track.
      // Without it the headline would still be dissolving at the very end of
      // the track instead of being long gone.
      tl.to({}, { duration: 1 }, 0)

      // Duration 0.88: at the 50–60% mark the headline is still partway
      // through dissolving (only ~55–68% through *its own* tween there), not
      // gone — it only fully clears in the last stretch before the track
      // ends, so the aurora never has to carry an empty screen on its own.
      // Held short of 1 (rather than running to the very end) so the fade
      // finishes a hair before the manifesto takes over, instead of cutting
      // off mid-tween at the handoff.
      //
      // All four groups below (lines 1–3, tail) share this one duration on
      // purpose: for a tween where opacity and a transform fade out
      // together over the *same* duration, the transform's value at any
      // given opacity is fixed — `magnitude * (1 - opacity)` — independent
      // of how long the fade takes. That's what makes the *magnitudes*
      // below (not the duration) the actual safety lever for line 3 and the
      // tail, which drift toward each other (line 3 down, tail up, in the
      // same ~1.7rem/1.4rem gap in the flex column) rather than away like
      // lines 1–2. yPercent 135 / y -32 — inherited unchanged from the
      // pre-Aurora hero — turned out to already close that gap while both
      // sides were still 60–80% opaque even under their *original*,
      // shorter, independently-matched durations (confirmed by measuring
      // real `getBoundingClientRect()`s against actual computed opacity at
      // ~90 scroll samples per viewport: this is a pre-existing collision in
      // the inherited numbers, not something either fix round introduced).
      // Shrunk to yPercent 10 / y -12 here — small enough that even at the
      // very last moment either side reads as more than a residual 5%
      // ghost, the combined closure stays comfortably under the measured
      // gap on both viewports (81.85px vs 32.93px line-height; 28px vs
      // 22.4px gap) — an earlier, less conservative pass (yPercent 15 / y
      // -16) left a ~1–2px technical overlap on mobile at ~5–13% opacity,
      // caught only by sweeping real measurements rather than trusting the
      // arithmetic, hence the wider margin here.
      tl.to(lines[0], { yPercent: -115, opacity: 0, ease: 'none', duration: 0.88 }, 0)
        .to(lines[1], { yPercent: -25, opacity: 0, ease: 'none', duration: 0.88 }, 0)
        .to(lines[2], { yPercent: 10, opacity: 0, ease: 'none', duration: 0.88 }, 0)
        .to(tail, { opacity: 0, y: -12, ease: 'none', duration: 0.88 }, 0)
        // The copy's backing leaves with the copy — over the same stretch of
        // the track as the headline, so nothing is left sitting on a dimmed
        // scene once there is no text to protect.
        .to(copyScrimRef.current, { opacity: 0, ease: 'none', duration: 0.88 }, 0)
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

          {/* "Trusted by" strip (2026-09 audit, item 1): the first proof on
              the page, right under the buttons. Part of `.hero__tail` so it
              dissolves with the rest of the copy on scroll. */}
          <div className="hero__trusted hero__tail">
            <span className="hero__trusted-label mono-label">{t(lang, 'home.hero.trusted')}</span>
            <ul className="hero__logos" aria-label={t(lang, 'home.hero.trusted')}>
              {HERO_CLIENTS.map((c) => (
                <li key={c.name} className={c.tall ? 'hero__logo hero__logo--tall' : 'hero__logo'}>
                  {/* width/height reserve the box (CLS); fetchPriority low keeps
                      five logos from competing with the LCP text's fonts. */}
                  <img src={c.heroSrc ?? c.src} alt={c.name} width={c.w} height={c.h} fetchPriority="low" decoding="async" />
                </li>
              ))}
            </ul>
          </div>

          <span className="hero__scroll mono-label hero__tail">{t(lang, 'home.hero.scroll')}</span>
        </div>
      </div>
    </section>
  )
}
