import type { CSSProperties, ReactNode } from 'react'
import { MonoLabel } from '../../components/MonoLabel'
import { SplitHeading } from '../../components/SplitHeading'
import './product.css'

type ProductPageHero = {
  label: string
  title: string
  sub: string
  /** The CTA row — built by the page itself (Emmi's second CTA needs a
   * custom click handler for the live widget, not a plain href), so this
   * takes finished markup rather than a data shape. */
  ctas: ReactNode
  /** Optional product wordmark, shown above the mono label. Finished markup
   * (an `<img>`, typically) rather than a `src`/`alt` pair — `SplitHeading`
   * only accepts a plain string `children`, so a logo can't live inside the
   * heading itself; this slot is the alternative the brief asks for
   * ("above the mono label or next to the title"). Give the `<img>` the
   * `.product-hero__logo` class to pick up the shared ~40–56px sizing, and
   * add `.product-hero__logo--avatar` on top for a circular avatar crop
   * (ring + glow in `--page-accent`) instead of the default rounded-rect
   * wordmark chip — see Emmi's own hero for the avatar variant in use. */
  logo?: ReactNode
}

type ProductPageProps = {
  /** The product's own hero background — a finished `*Background` element
   * (`ThreadsBackground` for Emmi, `BeamsRBBackground` for Legalia,
   * `GalaxyRBBackground` for Precedentia), already carrying its own
   * `poster`/`className`. Built by the page that owns it (see `emmi.tsx`),
   * not imported here, so `ProductPage` itself never pulls `ogl`/`three`/R3F
   * into a chunk shared by every product page — each `*Background` wrapper
   * lazy-loads its own heavy chunk internally. */
  background: ReactNode
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
 * Shared shell for every product page: a full-viewport hero (background +
 * mono label + headline + subhead + CTAs) followed by whatever chapters the
 * product itself supplies. Mirrors the shape of the home page's own
 * `HeroSection` (which builds its own `AuroraBackground` the same way each
 * product page builds its own `*Background`), minus its scroll-driven
 * amplitude swell — a product's hero background is self-contained, so this
 * is one static stage, not a pinned scroll track.
 */
export function ProductPage({ background, accent, hero, chapters }: ProductPageProps) {
  const style = { '--page-accent': accent, '--page-accent-rgb': hexToRgbTriple(accent) } as CSSProperties

  return (
    <div className="product-page" style={style}>
      <section className="product-hero">
        <div className="product-hero__scene">{background}</div>

        <div className="product-hero__scrim" aria-hidden="true" />

        <div className="product-hero__copy container">
          {hero.logo}
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
