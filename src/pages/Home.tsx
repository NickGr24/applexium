import { CaseCard } from '../components/CaseCard'
import { Faq } from '../components/Faq'
import { MagneticButton } from '../components/MagneticButton'
import { MonoLabel } from '../components/MonoLabel'
import { RevealText } from '../components/RevealText'
import { Section } from '../components/Section'
import { Seo } from '../components/Seo'
import { SplitHeading } from '../components/SplitHeading'
import { SpotlightCard } from '../components/SpotlightCard'
import { StatCount } from '../components/StatCount'
import { localePath, t, useLang, type Lang } from '../i18n'
import { CASES } from '../site/cases'
import { CLIENTS } from '../site/clients'
import { faqItems } from '../site/faq'
import { faqPageJsonLd, organizationJsonLd, webSiteJsonLd } from '../site/jsonld'
import { TESTIMONIALS } from '../site/testimonials'
import './cases.css'
import './home.css'
import { HeroSection } from './home/HeroSection'
import { IconChart, IconChip, IconCloud, IconCode, IconCog, IconShield } from './home/icons'
import { Manifesto } from './home/Manifesto'
import { ProductShowcase } from './home/ProductShowcase'

/** The six services, in bento order. `key` indexes `home.services.*`; the
 * 1st and 6th cards are the wide ones (see `.bento` in home.css). */
const SERVICES = [
  { key: 'web', Icon: IconCode },
  { key: 'ai', Icon: IconChip },
  { key: 'saas', Icon: IconCloud },
  { key: 'compliance', Icon: IconShield },
  { key: 'integrations', Icon: IconCog },
  { key: 'advisory', Icon: IconChart },
] as const

function ClientLogos({ lang }: { lang: Lang }) {
  // Two identical passes of the list, the second hidden from assistive tech:
  // the CSS marquee translates the track by exactly -50%, so the seam lands
  // where the copy begins and the loop is invisible.
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {CLIENTS.map(({ src, name, plate, tall }) => (
        <li
          className={`marquee__item marquee__item--${plate}${tall ? ' marquee__item--tall' : ''}`}
          key={`${name}-${hidden}`}
        >
          <img src={src} alt={hidden ? '' : name} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="marquee" aria-label={t(lang, 'home.portfolio.clients')} role="group">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

export default function Home() {
  const lang = useLang()

  return (
    <>
      <Seo
        page="home"
        lang={lang}
        jsonLd={[organizationJsonLd(lang), webSiteJsonLd(lang), faqPageJsonLd(lang)]}
      />

      <HeroSection lang={lang} />

      <Manifesto lang={lang} />

      <ProductShowcase lang={lang} />

      <Section
        id="servicii"
        index="03"
        label={t(lang, 'home.services.label')}
        title={t(lang, 'home.services.title')}
      >
        <div className="bento">
          {SERVICES.map(({ key, Icon }) => (
            <SpotlightCard
              key={key}
              icon={<Icon />}
              title={t(lang, `home.services.${key}.title`)}
              text={t(lang, `home.services.${key}.text`)}
            />
          ))}
        </div>
      </Section>

      <Section
        id="portofoliu"
        index="04"
        label={t(lang, 'home.portfolio.label')}
        title={t(lang, 'home.portfolio.title')}
      >
        <ClientLogos lang={lang} />

        {/* The three case studies (2026-09 audit, item 2) replaced the old
            external-link cards: the same clients, but now each card opens a
            page with context, what was built, and — once the client supplies
            them — results and a quote. */}
        <div className="case-cards">
          {CASES.map((item) => (
            <CaseCard key={item.key} item={item} lang={lang} />
          ))}
        </div>

        <div className="cases__more">
          <MagneticButton variant="ghost" href={localePath(lang, 'projects')}>
            {t(lang, 'home.portfolio.all')}
          </MagneticButton>
        </div>
      </Section>

      {/* Named testimonials (2026-09 audit, item 2). Renders nothing until
          src/site/testimonials.ts has real, signed-off quotes; when it
          does, renumber the sections below (stats becomes 06, and so on). */}
      {TESTIMONIALS.length > 0 && (
        <Section id="referinte" index="05" label={t(lang, 'home.testimonials.label')} title={t(lang, 'home.testimonials.title')}>
          <div className="testimonials">
            {TESTIMONIALS.map((item) => (
              <blockquote className="testimonial" key={item.author}>
                <p>“{t(lang, item.quote)}”</p>
                <footer>
                  {item.photo && <img src={item.photo} alt="" loading="lazy" decoding="async" />}
                  <span>
                    <b>{item.author}</b>
                    {item.role}, {item.org}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      <section className="stats container">
        <MonoLabel index="05">{t(lang, 'home.stats.label')}</MonoLabel>
        <SplitHeading as="h2" className="stats__title">
          {t(lang, 'home.stats.title')}
        </SplitHeading>
        <div className="stats__row">
          <StatCount value={3} label={t(lang, 'home.stats.products.label')} />
          <StatCount
            value={7}
            suffix={t(lang, 'home.stats.platforms.suffix')}
            label={t(lang, 'home.stats.platforms.label')}
          />
          <StatCount
            value={275}
            suffix={t(lang, 'home.stats.decisions.suffix')}
            label={t(lang, 'home.stats.decisions.label')}
          />
          <StatCount
            value={11}
            suffix={t(lang, 'home.stats.questions.suffix')}
            label={t(lang, 'home.stats.questions.label')}
          />
        </div>
      </section>

      <Section
        id="intrebari"
        index="06"
        label={t(lang, 'home.faq.label')}
        title={t(lang, 'home.faq.title')}
      >
        <Faq items={faqItems(lang)} />
      </Section>

      <section className="final">
        <div className="final__inner container">
          <MonoLabel index="07">{t(lang, 'home.final.label')}</MonoLabel>
          <SplitHeading as="h2" className="final__title">
            {t(lang, 'home.final.title')}
          </SplitHeading>
          <RevealText>
            <p className="final__text">{t(lang, 'home.final.text')}</p>
          </RevealText>
          <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
            {t(lang, 'home.final.button')}
          </MagneticButton>
        </div>
      </section>
    </>
  )
}
