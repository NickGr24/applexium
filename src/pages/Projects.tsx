import { useRef } from 'react'
import { RevealText } from '../components/RevealText'
import { Section } from '../components/Section'
import { Seo } from '../components/Seo'
import { t, useLang, type Lang } from '../i18n'
import { useSpotlightPointer } from '../motion/useSpotlightPointer'
import { collectionPageJsonLd } from '../site/jsonld'
import './projects.css'

/**
 * Real client engagements, ported from `_legacy/index.html`'s
 * `.portfolio-grid` (the site's actual case studies) rather than
 * `_legacy/projects.html`'s own body copy — that page showcases three
 * fictional AI products ("QuantumLeap AI", "NexusFlow Suite", "FusionAuth")
 * that don't exist. Only `projects.html`'s `<title>`/meta and CollectionPage
 * JSON-LD are reused verbatim (via `Seo`/`collectionPageJsonLd`), since those
 * describe the page itself, not the fake products under it.
 *
 * `dareEu`/`eurobridge`/`energiq` mirror the copy already used for Home's 3
 * featured cases (`home.portfolio.*`); the rest completes the same six-card
 * set from the legacy homepage's portfolio grid. Jurista — present in Home's
 * client marquee — has no card here: legacy never gave it a project entry
 * (it's Mircea Ursu's own business-law practice, not an Applexium case
 * study; see his profile's `EXPERIENCE` list), so inventing a "project" for
 * it would misattribute whose work it is.
 *
 * `plate` picks the logo's chip colour, same split as Home's `CLIENTS`
 * marquee: Penița Dreptului's mark is white artwork that needs a dark chip
 * to stay legible, unlike the rest.
 *
 * Each card carries the site's spotlight-card hover language (radial
 * gradient tracking the pointer + a border that lights up on hover, see
 * `projects.css`'s `.project-card`) via `useSpotlightPointer` directly,
 * rather than wrapping in `SpotlightCard` itself — that component renders a
 * fixed icon/title/text `<div>`, but a whole project card has to stay an
 * `<a>` (it's the link target) and needs an image + tag pill + CTA arrow
 * `SpotlightCard` has no slots for.
 */
const CASES = [
  { key: 'dareEu', href: 'https://dare-eu.net/', src: '/dare-eu.webp', plate: 'light' },
  { key: 'eurobridge', href: 'https://eurobridge-uamd.org/', src: '/eurobridge.webp', plate: 'light' },
  { key: 'energiq', href: 'https://energiq.md/ro/', src: '/energiq.webp', plate: 'light' },
  { key: 'penitaDreptului', href: 'https://penitadreptului.md/', src: '/penitadreptului.webp', plate: 'dark' },
  { key: 'cmda', href: 'https://cmda.md/', src: '/cmda.webp', plate: 'light' },
  { key: 'startItPlanet', href: 'https://startitplanet.com/#ro', src: '/startitplanet.webp', plate: 'light' },
] as const

function ProjectCard({ item, lang }: { item: (typeof CASES)[number]; lang: Lang }) {
  const mediaClass =
    item.plate === 'dark' ? 'project-card__media photo-hover project-card__media--dark' : 'project-card__media photo-hover'
  const ref = useRef<HTMLAnchorElement>(null)
  useSpotlightPointer(ref)

  return (
    <a ref={ref} className="project-card" href={item.href} target="_blank" rel="noopener noreferrer">
      <div className={mediaClass}>
        {/* alt="" — the name is already the card's own visible <h3>, right
            below; repeating it here would double the link's accessible
            name (same call as `home.css`'s `.case__media`). */}
        <img src={item.src} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="project-card__body">
        <h3 className="project-card__name">{t(lang, `projects.cases.${item.key}.name`)}</h3>
        <p className="project-card__text">{t(lang, `projects.cases.${item.key}.text`)}</p>
        <span className="project-card__tag mono-label">{t(lang, `projects.cases.${item.key}.tag`)}</span>
      </div>
      <span className="project-card__cta" aria-hidden="true">
        {t(lang, 'projects.viewProject')} →
      </span>
    </a>
  )
}

export default function Projects() {
  const lang = useLang()

  return (
    <>
      <Seo page="projects" lang={lang} jsonLd={[collectionPageJsonLd(lang)]} />

      <Section id="projects" index="01" label={t(lang, 'projects.label')} title={t(lang, 'projects.title')}>
        <RevealText>
          <p className="projects-intro">{t(lang, 'projects.intro')}</p>
        </RevealText>

        <div className="projects-grid">
          {CASES.map(item => (
            <ProjectCard key={item.key} item={item} lang={lang} />
          ))}
        </div>
      </Section>
    </>
  )
}
