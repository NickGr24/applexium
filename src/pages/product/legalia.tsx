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
import { BEAMS_CAMERA } from '../../scenes/beamsCamera'
import { softwareApplicationJsonLd } from '../../site/jsonld'
import { ProductPage } from './ProductPage'
import './legalia.css'

// Dynamic import only — see emmi.tsx for why (keeps three/R3F/postprocessing
// out of this page's own chunk; SceneCanvas already wraps whatever `scene`
// it's handed in its own Suspense boundary).
const BeamsScene = lazy(() => import('../../scenes/BeamsScene').then(m => ({ default: m.BeamsScene })))

// Legalia's own palette (`_legacy/legalia.html`'s `--lg-vivid`) — the page's
// single "local accent", per ProductPage's `accent` prop.
const ACCENT = '#591EF3'

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
 * `home/icons.tsx` and Emmi's own hero icons: Font Awesome (the legacy
 * site's icon source) isn't loaded in this build, so every module gets a
 * small hand-drawn stand-in instead. */
function RoadmapIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M4 19 9 8l3 5 3-7 5 13" />
      <circle cx="4" cy="19" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="20" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg {...ICON_BASE}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.5 16 12l-6 3.5Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg {...ICON_BASE}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.3 2.3L16 9.5" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M13 3 6 14h5l-1 7 8-11h-5l1-7Z" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z" />
      <path d="M7 5H4.5A2.5 2.5 0 0 0 4.5 10H7M17 5h2.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M12 12v3.5M9 19h6" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg {...ICON_BASE}>
      <path d="M4 20V10M10 20V4M16 20v-7M3 20h17" />
    </svg>
  )
}

const MODULE_KEYS = ['roadmap', 'multimedia', 'quizzes', 'gamification', 'leaderboard', 'progress'] as const
const MODULE_ICONS: Record<(typeof MODULE_KEYS)[number], ReactNode> = {
  roadmap: <RoadmapIcon />,
  multimedia: <PlayIcon />,
  quizzes: <CheckIcon />,
  gamification: <BoltIcon />,
  leaderboard: <TrophyIcon />,
  progress: <ChartIcon />,
}

const AUDIENCE_KEYS = ['item1', 'item2', 'item3', 'item4'] as const

function Modules({ lang }: { lang: Lang }) {
  return (
    <Section index="02" label={t(lang, 'legalia.modules.label')} title={t(lang, 'legalia.modules.title')}>
      <div className="spotlight-grid">
        {MODULE_KEYS.map(key => (
          <SpotlightCard
            key={key}
            icon={MODULE_ICONS[key]}
            title={t(lang, `legalia.modules.${key}.title`)}
            text={t(lang, `legalia.modules.${key}.text`)}
          />
        ))}
      </div>
    </Section>
  )
}

/** App preview — two real in-app screenshots (`public/legalia-app/*.jpg`),
 * wrapped in the shared `.photo-hover` (calm scale/brightness only, no
 * shader distortion — see `components.css` and this repo's own note on
 * dropping DistortImage from photography). `id="how"` is the hero's own
 * "See It in Action" CTA target, ported from the legacy page's `#how`
 * anchor. */
function Preview({ lang }: { lang: Lang }) {
  return (
    <Section id="how" index="03" label={t(lang, 'legalia.preview.label')} title={t(lang, 'legalia.preview.title')}>
      <div className="legalia-preview__grid">
        <div>
          <div className="legalia-preview__item photo-hover">
            <img src="/legalia-app/roadmap-disciplines.jpg" alt={t(lang, 'legalia.preview.roadmap')} loading="lazy" decoding="async" />
          </div>
          <p className="legalia-preview__caption">{t(lang, 'legalia.preview.roadmap')}</p>
        </div>
        <div>
          <div className="legalia-preview__item photo-hover">
            <img src="/legalia-app/quiz-feedback.jpg" alt={t(lang, 'legalia.preview.quiz')} loading="lazy" decoding="async" />
          </div>
          <p className="legalia-preview__caption">{t(lang, 'legalia.preview.quiz')}</p>
        </div>
      </div>
    </Section>
  )
}

function Audiences({ lang }: { lang: Lang }) {
  return (
    <Section index="04" label={t(lang, 'legalia.audiences.label')} title={t(lang, 'legalia.audiences.title')}>
      <RevealText>
        <ul className="legalia-audiences__list">
          {AUDIENCE_KEYS.map(key => (
            <li key={key}>{t(lang, `legalia.audiences.${key}`)}</li>
          ))}
        </ul>
      </RevealText>
    </Section>
  )
}

function Facts({ lang }: { lang: Lang }) {
  return (
    <Section index="05" label={t(lang, 'legalia.facts.label')} title={t(lang, 'legalia.facts.title')}>
      <div className="stat-grid">
        <StatCount value={4} label={t(lang, 'legalia.facts.programs.label')} />
        <StatCount value={105} label={t(lang, 'legalia.facts.disciplines.label')} />
        <StatCount value={924} label={t(lang, 'legalia.facts.topics.label')} />
        <StatCount
          value={11}
          suffix={t(lang, 'legalia.facts.questions.suffix')}
          label={t(lang, 'legalia.facts.questions.label')}
        />
      </div>
    </Section>
  )
}

function FinalCta({ lang }: { lang: Lang }) {
  return (
    <section className="product-final">
      <div className="product-final__inner container">
        <MonoLabel index="06">{t(lang, 'legalia.final.label')}</MonoLabel>
        <SplitHeading as="h2" className="product-final__title">
          {t(lang, 'legalia.final.title')}
        </SplitHeading>
        <RevealText>
          <p className="product-final__text">{t(lang, 'legalia.final.text')}</p>
        </RevealText>
        <div className="product-final__ctas">
          <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
            {t(lang, 'legalia.final.cta1')}
          </MagneticButton>
          <MagneticButton variant="ghost" href="#how">
            {t(lang, 'legalia.final.cta2')}
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

export default function Legalia() {
  const lang = useLang()

  return (
    <>
      <Seo page="legalia" lang={lang} jsonLd={[softwareApplicationJsonLd('legalia', lang)]} />

      <ProductPage
        scene={<BeamsScene />}
        poster={<div className="scene-poster scene-poster--beams" aria-hidden="true" />}
        camera={BEAMS_CAMERA}
        accent={ACCENT}
        hero={{
          logo: (
            <img
              src="/brand/legalia-horizontal.png"
              alt="Legalia"
              className="product-hero__logo legalia-hero-logo"
            />
          ),
          label: t(lang, 'legalia.hero.label'),
          title: t(lang, 'legalia.hero.title'),
          sub: t(lang, 'legalia.hero.sub'),
          ctas: (
            <>
              <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
                {t(lang, 'legalia.hero.cta1')}
              </MagneticButton>
              <MagneticButton variant="ghost" href="#how">
                {t(lang, 'legalia.hero.cta2')}
              </MagneticButton>
            </>
          ),
        }}
        chapters={
          <>
            <Modules lang={lang} />
            <Preview lang={lang} />
            <Audiences lang={lang} />
            <Facts lang={lang} />
            <FinalCta lang={lang} />
          </>
        }
      />
    </>
  )
}
