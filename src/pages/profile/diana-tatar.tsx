import { RevealText } from '../../components/RevealText'
import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { SpotlightCard } from '../../components/SpotlightCard'
import { localePath, t, useLang } from '../../i18n'
import { personJsonLd } from '../../site/jsonld'
import { Profile } from './Profile'
import './diana-tatar.css'

/** Selected work, ported from `_legacy/diana-tatar.html`'s `.dt-work-card`
 * list — same five projects, same order. All five link out to Diana's own
 * portfolio site (`dianatatar.com`), unchanged from the legacy hrefs. */
const WORK = [
  { key: 'decoratii', href: 'https://dianatatar.com/proiect.html?slug=decoratii' },
  { key: 'ooNutrition', href: 'https://dianatatar.com/proiect.html?slug=oo-nutrition' },
  { key: 'centrulSportiv', href: 'https://dianatatar.com/proiect.html?slug=centrul-sportiv' },
  { key: 'bloomin', href: 'https://dianatatar.com/proiect.html?slug=campanie-vizuala' },
  { key: 'vectorAcademy', href: 'https://dianatatar.com/proiect.html?slug=vector-academy-ai' },
] as const

const SERVICES = ['branding', 'social', 'editorial', 'campaigns', 'aiContent'] as const

const BRAND_COUNT = 7

export default function DianaTatar() {
  const lang = useLang()

  return (
    <>
      <Seo page="diana-tatar" lang={lang} jsonLd={[personJsonLd('diana-tatar', lang)]} />

      <Profile
        photo="/team/dianatatar.webp"
        status={t(lang, 'profiles.diana.hero.status')}
        name="Diana Tatar"
        role={t(lang, 'profiles.diana.hero.role')}
        location={t(lang, 'profiles.diana.hero.location')}
        // The legacy stats band (6+ / 10+ / 200+) doubles as this page's
        // mono-facts row — no separate hero facts needed on top of it.
        facts={[
          { value: 6, suffix: '+', label: t(lang, 'profiles.diana.facts.experience') },
          { value: 10, suffix: '+', label: t(lang, 'profiles.diana.facts.brands') },
          { value: 200, suffix: '+', label: t(lang, 'profiles.diana.facts.clients') },
        ]}
        bio={
          <>
            <RevealText>
              <p className="profile-bio">{t(lang, 'profiles.diana.hero.bio.p1')}</p>
            </RevealText>
            <RevealText>
              <p className="profile-bio">{t(lang, 'profiles.diana.hero.bio.p2')}</p>
            </RevealText>
          </>
        }
        links={[
          { label: t(lang, 'profile.email'), href: 'mailto:designerdianatatar30@gmail.com' },
          { label: t(lang, 'profile.website'), href: 'https://dianatatar.com', external: true },
        ]}
        backHref={localePath(lang, 'team')}
        backLabel={t(lang, 'profile.back')}
        sections={
          <>
            <Section
              index="02"
              label={t(lang, 'profiles.diana.services.label')}
              title={t(lang, 'profiles.diana.services.title')}
            >
              <div className="spotlight-grid">
                {SERVICES.map(key => (
                  <SpotlightCard
                    key={key}
                    title={t(lang, `profiles.diana.services.${key}.title`)}
                    text={t(lang, `profiles.diana.services.${key}.text`)}
                  />
                ))}
              </div>
            </Section>

            <Section
              index="03"
              label={t(lang, 'profiles.diana.work.label')}
              title={t(lang, 'profiles.diana.work.title')}
            >
              <div className="work-list">
                {WORK.map((item, i) => (
                  <a key={item.key} className="work-item" href={item.href} target="_blank" rel="noopener noreferrer">
                    <span className="work-item__num mono-label">{String(i + 1).padStart(2, '0')}</span>
                    <span className="work-item__body">
                      <span className="work-item__title">{t(lang, `profiles.diana.work.${item.key}.title`)}</span>
                      <span className="work-item__cat mono-label">{t(lang, `profiles.diana.work.${item.key}.cat`)}</span>
                    </span>
                    <span className="work-item__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </Section>

            <Section
              index="04"
              label={t(lang, 'profiles.diana.brands.label')}
              title={t(lang, 'profiles.diana.brands.title')}
            >
              <div className="chip-row">
                {Array.from({ length: BRAND_COUNT }, (_, i) => i + 1).map(n => (
                  <span key={n} className="chip">
                    {t(lang, `profiles.diana.brands.item${n}`)}
                  </span>
                ))}
              </div>
            </Section>
          </>
        }
      />
    </>
  )
}
