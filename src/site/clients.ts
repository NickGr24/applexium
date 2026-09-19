/**
 * Client logos, shared by the home hero's "trusted by" strip and the
 * portfolio marquee. `plate` picks the chip colour underneath: most of these
 * are dark artwork that needs a light plate, but Penița Dreptului's mark is
 * white and vanishes on one. `tall` marks square artwork (CMDA's stacked
 * seal, Penița's feather, Enverde's flame over its wordmark): at wordmark
 * height it reads as a speck, so those chips render the image taller.
 */
export type ClientLogo = {
  /** Marquee variant (public/logos/marquee), resized to 2x the chip's
   * displayed size — 84px tall for wordmarks (capped at 480px wide), 128px
   * for `tall` marks. The 2026-09 weak-device pass found the marquee was
   * decoding the full-size originals (EnergiQ alone is 2425x737, ~7MB of
   * bitmap for a 42px chip; 11.6MB for the row) the moment the section
   * scrolled into view. The originals stay in public/ for /projects' cards. */
  src: string
  /** Intrinsic pixel size of `src`: with width/height on the <img> the chip
   * has its final width before the file arrives, so lazy loads can't resize
   * the track mid-animation (its -50% loop point depends on that width). */
  srcW: number
  srcH: number
  name: string
  plate: 'light' | 'dark'
  tall: boolean
  /** Shown in the hero strip (five at most; the marquee shows all). */
  hero: boolean
  /** Intrinsic pixel size, so the <img> can carry width/height attributes and
   * the browser reserves the right box before the file arrives (a hero logo
   * without them was the whole CLS score of the home page, 0.098). */
  /** Small variant for the hero strip (public/logos/hero, made with cwebp
   * -resize at ~2x the displayed size). */
  heroSrc?: string
  w?: number
  h?: number
}

export const CLIENTS: ClientLogo[] = [
  // Flagship Emmi client; logo taken from inj-new.cloud on 2026-09-04 (dark
  // artwork, square seal — light plate, tall chip).
  { src: '/logos/marquee/inj.webp', srcW: 130, srcH: 128, name: 'Institutul Național al Justiției', plate: 'light', tall: true, hero: true, heroSrc: '/logos/hero/inj.webp', w: 120, h: 120 },
  { src: '/logos/marquee/dare-eu.webp', srcW: 467, srcH: 84, name: 'DARE-EU', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/dare-eu.webp', w: 260, h: 47 },
  { src: '/logos/marquee/eurobridge.webp', srcW: 408, srcH: 84, name: 'EUROBRIDGE UA MD', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/eurobridge.webp', w: 260, h: 54 },
  { src: '/logos/marquee/energiq.webp', srcW: 276, srcH: 84, name: 'EnergiQ', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/energiq.webp', w: 260, h: 80 },
  { src: '/logos/marquee/cmda.webp', srcW: 128, srcH: 128, name: 'CMDA', plate: 'light', tall: true, hero: true, heroSrc: '/logos/hero/cmda.webp', w: 120, h: 120 },
  { src: '/logos/marquee/startitplanet.webp', srcW: 336, srcH: 84, name: 'StartIT Planet', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/startitplanet.webp', w: 260, h: 66 },
  { src: '/logos/marquee/penitadreptului.webp', srcW: 142, srcH: 128, name: 'Penița Dreptului', plate: 'dark', tall: true, hero: false },
  // enverde.md, live 2026-09-19. Artwork lifted off the owner's light avatar
  // plate (flame over the wordmark) onto a transparent ground.
  { src: '/logos/marquee/enverde.webp', srcW: 139, srcH: 128, name: 'Enverde', plate: 'light', tall: true, hero: false },
]
