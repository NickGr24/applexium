/**
 * Client logos, shared by the home hero's "trusted by" strip and the
 * portfolio marquee. `plate` picks the chip colour underneath: most of these
 * are dark artwork that needs a light plate, but Penița Dreptului's mark
 * and Jurista's wordmark are white and vanish on one. `tall` marks square
 * artwork (CMDA's stacked seal, Penița's feather): at wordmark height it
 * reads as a speck, so those chips render the image taller.
 */
export type ClientLogo = {
  src: string
  name: string
  plate: 'light' | 'dark'
  tall: boolean
  /** Shown in the hero strip (five at most; the marquee shows all). */
  hero: boolean
  /** Intrinsic pixel size, so the <img> can carry width/height attributes and
   * the browser reserves the right box before the file arrives (a hero logo
   * without them was the whole CLS score of the home page, 0.098). */
  /** Small variant for the hero strip (public/logos/hero, made with cwebp
   * -resize at ~2x the displayed size); the marquee keeps the full `src`. */
  heroSrc?: string
  w?: number
  h?: number
}

export const CLIENTS: ClientLogo[] = [
  { src: '/dare-eu.webp', name: 'DARE-EU', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/dare-eu.webp', w: 260, h: 47 },
  { src: '/eurobridge.webp', name: 'EUROBRIDGE UA MD', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/eurobridge.webp', w: 260, h: 54 },
  { src: '/energiq.webp', name: 'EnergiQ', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/energiq.webp', w: 260, h: 80 },
  { src: '/cmda.webp', name: 'CMDA', plate: 'light', tall: true, hero: true, heroSrc: '/logos/hero/cmda.webp', w: 120, h: 120 },
  { src: '/startitplanet.webp', name: 'StartIT Planet', plate: 'light', tall: false, hero: true, heroSrc: '/logos/hero/startitplanet.webp', w: 260, h: 66 },
  { src: '/penitadreptului.webp', name: 'Penița Dreptului', plate: 'dark', tall: true, hero: false },
  { src: '/jurista.webp', name: 'Jurista', plate: 'dark', tall: false, hero: false },
]
