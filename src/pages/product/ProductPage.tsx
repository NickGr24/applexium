import type { CanvasProps } from '@react-three/fiber'
import type { CSSProperties, ReactNode } from 'react'
import { MonoLabel } from '../../components/MonoLabel'
import { SplitHeading } from '../../components/SplitHeading'
import { SceneCanvas } from '../../scenes/SceneCanvas'
import './product.css'

type ProductPageHero = {
  label: string
  title: string
  sub: string
  /** The CTA row — built by the page itself (Emmi's second CTA needs a
   * custom click handler for the live widget, not a plain href), so this
   * takes finished markup rather than a data shape. */
  ctas: ReactNode
}

type ProductPageProps = {
  /** The product's own hero scene, already behind `React.lazy` in the page
   * that owns it (see `emmi.tsx`, pattern borrowed from `ProductShowcase`).
   * Passed as an element rather than imported here, so `ProductPage` itself
   * never pulls `three`/R3F into a chunk shared by every product page. */
  scene: ReactNode
  /** Poster shown until the scene's first frame paints — SSR, reduced
   * motion, low-tier devices, or simply before `SceneCanvas` has mounted
   * Canvas. One of the `.scene-poster--*` variants in `components.css`. */
  poster: ReactNode
  /** Camera the scene is framed for, forwarded straight to `SceneCanvas`. */
  camera?: CanvasProps['camera']
  /** This product's own accent, as a hex colour (e.g. Emmi's `--em-vivid`).
   * Exposed to CSS as `--page-accent` (the colour) and `--page-accent-rgb`
   * (its "r g b" triple, for `rgb(var(--page-accent-rgb) / alpha)` — the
   * same modern-syntax pattern `components.css` already uses for the site's
   * global tokens) so the shared primitives below — SpotlightCard's hover
   * border, the closing CTA's glow — pick up the product's own palette
   * without each product page having to override their CSS module-by-module. */
  accent: string
  hero: ProductPageHero
  /** Everything below the hero — the product's own chapters. */
  chapters: ReactNode
}

/** "#rrggbb" -> "r g b", for the modern `rgb(var(--x) / alpha)` syntax.
 * Falls back to `--brand-cyan`'s own triple if `accent` isn't a 6-digit hex
 * (the only shape every product page currently passes). */
function hexToRgbTriple(hex: string): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return '31 205 255'
  return [m[1], m[2], m[3]].map(h => Number.parseInt(h, 16)).join(' ')
}

/**
 * Shared shell for every product page: a full-viewport hero (scene + mono
 * label + headline + subhead + CTAs) followed by whatever chapters the
 * product itself supplies. Mirrors the shape of the home page's own
 * `HeroSection`, minus its scroll-driven camera dolly — a product's hero
 * scene is self-contained (see `ConvergenceScene`'s own doc comment for why
 * Emmi's in particular has no scroll progress coming in), so this is one
 * static stage, not a pinned scroll track.
 */
export function ProductPage({ scene, poster, camera, accent, hero, chapters }: ProductPageProps) {
  const style = { '--page-accent': accent, '--page-accent-rgb': hexToRgbTriple(accent) } as CSSProperties

  return (
    <div className="product-page" style={style}>
      <section className="product-hero">
        <div className="product-hero__scene">
          <SceneCanvas className="scene-canvas" poster={poster} camera={camera}>
            {scene}
          </SceneCanvas>
        </div>

        <div className="product-hero__scrim" aria-hidden="true" />

        <div className="product-hero__copy container">
          <MonoLabel index="01">{hero.label}</MonoLabel>
          <SplitHeading as="h1" className="product-hero__title">
            {hero.title}
          </SplitHeading>
          <p className="product-hero__sub">{hero.sub}</p>
          <div className="product-hero__ctas">{hero.ctas}</div>
        </div>
      </section>

      {chapters}
    </div>
  )
}
