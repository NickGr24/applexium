import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { MonoLabel } from '../../components/MonoLabel'
import { type Lang, localePath, t } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'
import { BeamsRBBackground } from '../../scenes/BeamsRBBackground'
import { GalaxyRBBackground } from '../../scenes/GalaxyRBBackground'
import { graphicsTier, type GraphicsTier } from '../../scenes/graphicsTier'
import { ThreadsBackground } from '../../scenes/ThreadsBackground'
import { FADE, HANDOVER, liveSlides } from './showcaseLive'

gsap.registerPlugin(ScrollTrigger)

/** The shape every `*Background` wrapper in `src/scenes/` shares
 * (`ThreadsBackground`/`BeamsRBBackground`/`GalaxyRBBackground`, and
 * `AuroraBackground` on the hero) — `tier` is what lets this file force a
 * slide down to a poster-only tier without each background needing a
 * bespoke prop shape. */
type BackgroundComponent = ComponentType<{
  tier?: GraphicsTier
  poster: ReactNode
  className?: string
}>

type Showcase = {
  /** Doubles as the i18n key under `home.products.*` and the page slug. */
  id: 'emmi' | 'legalia' | 'precedentia'
  poster: string
  Background: BackgroundComponent
}

const SHOWCASES: Showcase[] = [
  { id: 'emmi', poster: 'convergence', Background: ThreadsBackground },
  { id: 'legalia', poster: 'beams', Background: BeamsRBBackground },
  { id: 'precedentia', poster: 'galaxy', Background: GalaxyRBBackground },
]

const sameSlides = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])

/**
 * The three product showcases: one 300vh track, a sticky stage across it, and
 * three full-screen slides that cross-fade at the thirds (hand-over points
 * and fade length live in showcaseLive.ts, shared with the mounting logic).
 * Each slide is a scene (the product's own background world) plus its panel
 * of copy, so the two always travel together.
 *
 * How much 3D actually mounts is the same on every tier since the 2026-09
 * audit: only the slide the reader is on has a live canvas, plus the
 * incoming one from shortly before a hand-over until its fade ends
 * (`liveSlides()`, unit-tested). The other slides show their poster.
 * Mounting all three at once on `high` used to be what made the swap a
 * dissolve, but it meant four simultaneous WebGL contexts (with the hero)
 * and a three.js init mid-scroll on any machine with ≥5 cores and a mouse,
 * including slow ones. The dissolve survives because every `*Canvas` fades
 * in over its poster (`.scene-canvas__layer`), so a swap reads as
 * canvas → poster → canvas rather than a cut.
 *
 * The tier is fed to each `*Background` as a `key` as well as a prop,
 * because every one of them resolves its tier once in a `useState`
 * initialiser (same shape `AuroraBackground` uses on the hero): without the
 * key a downgrade would never take effect, and with it the canvas is
 * genuinely unmounted rather than merely hidden. `static` (SSR, no WebGL2,
 * reduced motion) never mounts a canvas at all.
 *
 * The markup does not change between tiers, which is what lets the
 * pre-rendered HTML hydrate cleanly: every `*Background` emits the same
 * wrapper + poster for every tier, and only mounts its real canvas later,
 * from its own IntersectionObserver.
 */
export function ProductShowcase({ lang }: { lang: Lang }) {
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Resolved once, like every `*Background` does it, so the value can't
  // change mid-scroll and unmount a canvas under the visitor.
  const [tier] = useState<GraphicsTier>(() => graphicsTier())
  // Indices of the slides that currently get a live canvas — see
  // `liveSlides()`. Starts as the first slide alone.
  const [live, setLive] = useState<number[]>([0])

  useLayoutEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>('.showcase__slide', stage)
      const panels = gsap.utils.toArray<HTMLElement>('.showcase__panel', stage)
      if (slides.length < SHOWCASES.length) return

      gsap.set(slides.slice(1), { opacity: 0 })
      gsap.set(panels.slice(1), { y: 56, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          // No `pin`: the stage is `position: sticky` in CSS (home.css),
          // exactly like the hero's. GSAP's pin toggles `position: fixed`
          // at both ends of the track, and Chrome's layout-instability API
          // reports each toggle as a full-viewport shift — the 2026-09
          // audit measured CLS ≈ 2.0 on this page from those two moments
          // alone, invisible to Lighthouse (which never scrolls) but not to
          // real visitors. Sticky is excluded from that accounting.
          scrub: 0.4,
          snap: {
            snapTo: [0, 0.5, 1],
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
            ease: 'power2.inOut',
            // Nearest third, not the one momentum was heading for: with
            // inertia on, a fast flick projects past the slide the reader
            // stopped on and skips it entirely.
            inertia: false,
          },
          onUpdate: (self) => {
            const next = liveSlides(self.progress).live
            setLive((current) => (sameSlides(current, next) ? current : next))
          },
        },
      })

      // The scrub maps the scroll onto the timeline's duration, and a
      // timeline ends with its last child — without this filler the last
      // hand-over (at 0.68 + 0.1) would define the end and every position
      // below would silently stretch, pulling the cross-fades away from the
      // thirds the snap points sit on.
      tl.to({}, { duration: 1 }, 0)

      for (const { out, in: next, at } of HANDOVER) {
        // Backgrounds dissolve into each other across the whole window…
        tl.to(slides[out], { opacity: 0, ease: 'none', duration: FADE }, at).to(
          slides[next],
          { opacity: 1, ease: 'none', duration: FADE },
          at,
        )
        // …but the copy hands over rather than dissolving: two paragraphs of
        // half-transparent text stacked on each other is unreadable mush, so
        // the outgoing panel clears out in the first half of the window and
        // the incoming one only arrives in the second.
        tl.to(panels[out], { opacity: 0, y: -56, ease: 'none', duration: FADE * 0.5 }, at).to(
          panels[next],
          { opacity: 1, y: 0, ease: 'none', duration: FADE * 0.5 },
          at + FADE * 0.5,
        )
      }
    }, track)

    return () => ctx.revert()
  }, [reduced])

  return (
    <section className="showcase" id="produse" ref={trackRef}>
      <div className="showcase__stage" ref={stageRef}>
        <div className="showcase__index container">
          <MonoLabel index="02">{t(lang, 'home.products.label')}</MonoLabel>
        </div>

        {SHOWCASES.map(({ id, poster, Background }, i) => {
          // Only live slides get a canvas — see the note above for why the
          // tier is passed as a key as well as a prop. Nothing else about a
          // mounted canvas is ever changed from here: the OGL scenes rebuild
          // their WebGL context when `dpr` (or any other effect dependency)
          // changes, so the old "trim inactive slides to dpr 1" trick cost a
          // full context rebuild on every hand-over.
          const slideTier: GraphicsTier = live.includes(i) ? tier : 'static'
          return (
            <div className="showcase__slide" key={id}>
              <div className="showcase__scene">
                <Background
                  key={slideTier}
                  tier={slideTier}
                  className="scene-canvas"
                  poster={<div className={`scene-poster scene-poster--${poster}`} aria-hidden="true" />}
                />
              </div>

              <div className="showcase__scrim" aria-hidden="true" />

              <div className="showcase__panel container">
                <span className="showcase__label mono-label">{t(lang, `home.products.${id}.label`)}</span>
                <h2 className="showcase__name">{t(lang, `home.products.${id}.name`)}</h2>
                <ul className="showcase__facts">
                  <li>{t(lang, `home.products.${id}.fact1`)}</li>
                  <li>{t(lang, `home.products.${id}.fact2`)}</li>
                  <li>{t(lang, `home.products.${id}.fact3`)}</li>
                </ul>
                <MagneticButton variant="ghost" href={localePath(lang, id)}>
                  {t(lang, 'home.products.cta')}
                </MagneticButton>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
