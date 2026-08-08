import { lazy, type ReactNode } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { MonoLabel } from '../../components/MonoLabel'
import { RevealText } from '../../components/RevealText'
import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { SplitHeading } from '../../components/SplitHeading'
import { SpotlightCard } from '../../components/SpotlightCard'
import { StatCount } from '../../components/StatCount'
import { localePath, t, useLang, type Lang } from '../../i18n'
import { GALAXY_CAMERA } from '../../scenes/galaxyCamera'
import { softwareApplicationJsonLd } from '../../site/jsonld'
import { ProductPage } from './ProductPage'
import './precedentia.css'

// Dynamic import only — see emmi.tsx for why (keeps three/R3F/postprocessing
// out of this page's own chunk; SceneCanvas already wraps whatever `scene`
// it's handed in its own Suspense boundary).
const GalaxyScene = lazy(() => import('../../scenes/GalaxyScene').then(m => ({ default: m.GalaxyScene })))

// Precedentia's own palette (`_legacy/precedentia.html`'s `--pr-brand`) —
// the page's single "local accent", per ProductPage's `accent` prop.
const ACCENT = '#09E1AC'

// Precedentia's own live search app — a separate deployment, not part of
// this repo, so its CTA opens in a new tab rather than navigating away from
// the marketing site (ported verbatim from `_legacy/precedentia.html`).
const APP_URL = 'https://precedentia.md'

const ICON_BASE = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Generic outline glyphs, not brand marks — same rationale as
 * `home/icons.tsx` and Legalia's own module icons: Font Awesome (the legacy
 * site's icon source) isn't loaded in this build. */
function SearchIcon() {
  return (
    <svg {...ICON_BASE}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  )
}

function BubbleIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A8 8 0 0 1 4 12Z" />
    </svg>
  )
}

function RobotIcon() {
  return (
    <svg {...ICON_BASE}>
      <rect x="5" y="8" width="14" height="10" rx="3" />
      <circle cx="9.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 8V5M9 5h6" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M4 5h16l-6 7.5V18l-4 2v-7.5Z" />
    </svg>
  )
}

function SyncIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
      <path d="M4 20v-4h4" />
    </svg>
  )
}

function AttachIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M8 12.5V7a4 4 0 0 1 8 0v9a2.5 2.5 0 0 1-5 0V8.5" />
    </svg>
  )
}

const FEATURE_KEYS = ['keyword', 'semantic', 'assistant', 'filters', 'sync', 'attach'] as const
const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], ReactNode> = {
  keyword: <SearchIcon />,
  semantic: <BubbleIcon />,
  assistant: <RobotIcon />,
  filters: <FilterIcon />,
  sync: <SyncIcon />,
  attach: <AttachIcon />,
}

/** "Concept & mission" — what the product actually does, ported from the
 * legacy `.pr-about` section's three paragraphs. */
function About({ lang }: { lang: Lang }) {
  return (
    <Section index="02" label={t(lang, 'precedentia.about.label')} title={t(lang, 'precedentia.about.title')}>
      <RevealText>
        <div className="precedentia-about__text">
          <p>{t(lang, 'precedentia.about.text1')}</p>
          <p>{t(lang, 'precedentia.about.text2')}</p>
          <p>{t(lang, 'precedentia.about.text3')}</p>
        </div>
      </RevealText>
    </Section>
  )
}

function Facts({ lang }: { lang: Lang }) {
  return (
    <Section index="03" label={t(lang, 'precedentia.facts.label')} title={t(lang, 'precedentia.facts.title')}>
      <div className="stat-grid">
        <StatCount
          value={275}
          suffix={t(lang, 'precedentia.facts.decisions.suffix')}
          label={t(lang, 'precedentia.facts.decisions.label')}
        />
        <StatCount value={4} label={t(lang, 'precedentia.facts.sources.label')} />
        <StatCount value={3} label={t(lang, 'precedentia.facts.modes.label')} />
      </div>
    </Section>
  )
}

function Features({ lang }: { lang: Lang }) {
  return (
    <Section
      id="features"
      index="04"
      label={t(lang, 'precedentia.features.label')}
      title={t(lang, 'precedentia.features.title')}
    >
      <div className="spotlight-grid">
        {FEATURE_KEYS.map(key => (
          <SpotlightCard
            key={key}
            icon={FEATURE_ICONS[key]}
            title={t(lang, `precedentia.features.${key}.title`)}
            text={t(lang, `precedentia.features.${key}.text`)}
          />
        ))}
      </div>
    </Section>
  )
}

function FinalCta({ lang }: { lang: Lang }) {
  return (
    <section className="product-final">
      <div className="product-final__inner container">
        <MonoLabel index="05">{t(lang, 'precedentia.final.label')}</MonoLabel>
        <SplitHeading as="h2" className="product-final__title">
          {t(lang, 'precedentia.final.title')}
        </SplitHeading>
        <RevealText>
          <p className="product-final__text">{t(lang, 'precedentia.final.text')}</p>
        </RevealText>
        <div className="product-final__ctas">
          <MagneticButton variant="primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
            {t(lang, 'precedentia.final.cta1')}
          </MagneticButton>
          <MagneticButton variant="ghost" href={localePath(lang, 'contacts')}>
            {t(lang, 'precedentia.final.cta2')}
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

export default function Precedentia() {
  const lang = useLang()

  return (
    <>
      <Seo page="precedentia" lang={lang} jsonLd={[softwareApplicationJsonLd('precedentia', lang)]} />

      <ProductPage
        scene={<GalaxyScene />}
        poster={<div className="scene-poster scene-poster--galaxy" aria-hidden="true" />}
        camera={GALAXY_CAMERA}
        accent={ACCENT}
        hero={{
          logo: (
            <img
              src="/precedentia-icon.svg"
              alt="Precedentia"
              className="product-hero__logo precedentia-hero-logo"
            />
          ),
          label: t(lang, 'precedentia.hero.label'),
          title: t(lang, 'precedentia.hero.title'),
          sub: t(lang, 'precedentia.hero.sub'),
          ctas: (
            <>
              <MagneticButton variant="primary" href={APP_URL} target="_blank" rel="noopener noreferrer">
                {t(lang, 'precedentia.hero.cta1')}
              </MagneticButton>
              <MagneticButton variant="ghost" href="#features">
                {t(lang, 'precedentia.hero.cta2')}
              </MagneticButton>
            </>
          ),
        }}
        chapters={
          <>
            <About lang={lang} />
            <Facts lang={lang} />
            <Features lang={lang} />
            <FinalCta lang={lang} />
          </>
        }
      />
    </>
  )
}
