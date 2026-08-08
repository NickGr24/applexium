import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lazy, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { MonoLabel } from '../../components/MonoLabel'
import { type Lang, localePath, t } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'
import { BEAMS_CAMERA } from '../../scenes/beamsCamera'
import { CONVERGENCE_CAMERA } from '../../scenes/convergenceCamera'
import { GALAXY_CAMERA } from '../../scenes/galaxyCamera'
import { graphicsTier, type GraphicsTier } from '../../scenes/graphicsTier'
import { SceneCanvas } from '../../scenes/SceneCanvas'

gsap.registerPlugin(ScrollTrigger)

const ConvergenceScene = lazy(() =>
  import('../../scenes/ConvergenceScene').then((m) => ({ default: m.ConvergenceScene })),
)
const BeamsScene = lazy(() => import('../../scenes/BeamsScene').then((m) => ({ default: m.BeamsScene })))
const GalaxyScene = lazy(() => import('../../scenes/GalaxyScene').then((m) => ({ default: m.GalaxyScene })))

type Showcase = {
  /** Doubles as the i18n key under `home.products.*` and the page slug. */
  id: 'emmi' | 'legalia' | 'precedentia'
  poster: string
  camera: typeof CONVERGENCE_CAMERA
  Scene: ComponentType
}

const SHOWCASES: Showcase[] = [
  { id: 'emmi', poster: 'convergence', camera: CONVERGENCE_CAMERA, Scene: ConvergenceScene },
  { id: 'legalia', poster: 'beams', camera: BEAMS_CAMERA, Scene: BeamsScene },
  { id: 'precedentia', poster: 'galaxy', camera: GALAXY_CAMERA, Scene: GalaxyScene },
]

/** Where each slide hands over to the next, as a fraction of the pinned
 * scroll. The windows are narrow and centred between the snap points (0, 0.5,
 * 1) so each product holds still for most of its third and the swap happens
 * while the reader is already moving. */
const HANDOVER = [
  { out: 0, in: 1, at: 0.22 },
  { out: 1, in: 2, at: 0.68 },
]
const FADE = 0.1

/**
 * The three product showcases: one 300vh track, a stage pinned across it, and
 * three full-screen slides that cross-fade at the thirds. Each slide is a
 * scene (the product's own background world) plus its panel of copy, so the
 * two always travel together.
 *
 * How much 3D actually mounts depends on the tier:
 * - `high` — all three scenes mounted at once, GSAP cross-fades between them,
 *   which is the only way the swap can be a dissolve rather than a cut.
 * - `lite` — only the active slide gets a live scene; the other two fall back
 *   to their poster. The tier is fed to `SceneCanvas` as a `key` as well as a
 *   prop, because `SceneCanvas` resolves its tier once in a `useState`
 *   initialiser: without the key the downgrade would never take effect, and
 *   with it the canvas is genuinely unmounted rather than merely hidden.
 * - `static` (SSR, no WebGL2, reduced motion) — posters only, no Canvas ever.
 *
 * The markup does not change between tiers, which is what lets the
 * pre-rendered HTML hydrate cleanly: `SceneCanvas` emits the same wrapper +
 * poster for every tier, and only mounts a Canvas later, from its own
 * IntersectionObserver.
 */
export function ProductShowcase({ lang }: { lang: Lang }) {
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Resolved once, like SceneCanvas does it, so the value can't change
  // mid-scroll and unmount a canvas under the visitor.
  const [tier] = useState<GraphicsTier>(() => graphicsTier())
  const [active, setActive] = useState(0)

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
          // The track already carries the 300vh; pinSpacing would add a
          // second copy of it and leave a blank screen after the last slide.
          pin: stage,
          pinSpacing: false,
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
            const index = self.progress < 0.27 ? 0 : self.progress < 0.73 ? 1 : 2
            setActive((current) => (current === index ? current : index))
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

        {SHOWCASES.map(({ id, poster, camera, Scene }, i) => {
          // On lite only the active slide gets a live canvas — see the note
          // above for why the tier is passed as a key as well as a prop.
          const slideTier: GraphicsTier = tier === 'lite' && i !== active ? 'static' : tier
          return (
            <div className="showcase__slide" key={id}>
              <div className="showcase__scene">
                <SceneCanvas
                  key={slideTier}
                  tier={slideTier}
                  className="scene-canvas"
                  poster={<div className={`scene-poster scene-poster--${poster}`} aria-hidden="true" />}
                  camera={camera}
                >
                  <Scene />
                </SceneCanvas>
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
