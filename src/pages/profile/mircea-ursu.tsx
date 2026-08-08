import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { localePath, t, useLang } from '../../i18n'
import { personJsonLd } from '../../site/jsonld'
import { Profile } from './Profile'
import './mircea-ursu.css'

/** Professional path, ported from `_legacy/mircea-ursu.html`'s 3D
 * `.tube__text__item` carousel — same six stops, same order, flattened
 * into a plain list (no rotating-carousel primitive exists in this design
 * system, and none of Task 17's available primitives call for one).
 * `plain: true` mirrors the legacy `.exp-logo.no-bg` modifier: those three
 * logos (Applexium, Jurista, MAIB) already sit on their own light ground,
 * so the wrapper skips the translucent chip background the other three
 * (Government, Startup MD, Payall) get. */
const EXPERIENCE = [
  { key: 'applexium', logo: '/logos/applexium-logo.jpg', plain: true },
  { key: 'jurista', logo: '/logos/jurista-logo.jpg', plain: true },
  { key: 'government', logo: '/logos/government-logo.svg', plain: false },
  { key: 'startupmd', logo: '/logos/startup-md-logo.webp', plain: false },
  { key: 'banking', logo: '/logos/maib-bank-logo.svg', plain: true },
  { key: 'payall', logo: '/logos/payall-logo.svg', plain: false },
] as const

/** Academic background, ported from the legacy `.cylinder__text__item` list
 * (same four degrees, same order), flattened the same way as EXPERIENCE. */
const EDUCATION = ['phd', 'llm1', 'llm2', 'llb'] as const

export default function MirceaUrsu() {
  const lang = useLang()

  return (
    <>
      <Seo page="mircea-ursu" lang={lang} jsonLd={[personJsonLd('mircea-ursu', lang)]} />

      <Profile
        photo="/team/mirceaursu.webp"
        status={t(lang, 'profiles.mircea.hero.status')}
        name="Mircea Ursu"
        role={t(lang, 'profiles.mircea.hero.role')}
        location={t(lang, 'profiles.mircea.hero.location')}
        // No `.profile-bio` paragraph exists on the legacy page (only
        // Nichita's and Diana's do) — rather than invent prose, the two
        // facts below quantify the real content that replaces it: the
        // length of the two lists rendered below, in `sections`.
        facts={[
          { value: EXPERIENCE.length, label: t(lang, 'profiles.mircea.facts.roles') },
          { value: EDUCATION.length, label: t(lang, 'profiles.mircea.facts.degrees') },
        ]}
        links={[
          { label: t(lang, 'profile.linkedin'), href: 'https://www.linkedin.com/in/mirceaursu/', external: true },
          { label: t(lang, 'profile.telegram'), href: 'https://t.me/observance_of_legality', external: true },
          { label: t(lang, 'profile.facebook'), href: 'https://www.facebook.com/mircea.ursu.520', external: true },
          { label: t(lang, 'profile.phone'), href: 'tel:+37378768765' },
          { label: t(lang, 'profile.email'), href: 'mailto:mirceaursu@applexium.com' },
        ]}
        backHref={localePath(lang, 'team')}
        backLabel={t(lang, 'profile.back')}
        sections={
          <>
            <Section
              index="02"
              label={t(lang, 'profiles.mircea.experience.label')}
              title={t(lang, 'profiles.mircea.experience.title')}
            >
              <ol className="timeline">
                {EXPERIENCE.map(item => (
                  <li key={item.key} className="timeline-item">
                    <div className={`timeline-item__logo${item.plain ? ' timeline-item__logo--plain' : ''}`}>
                      <img src={item.logo} alt="" loading="lazy" decoding="async" />
                    </div>
                    <div>
                      <div className="timeline-item__org">
                        {t(lang, `profiles.mircea.experience.${item.key}.org`)}
                      </div>
                      <div className="timeline-item__role mono-label">
                        {t(lang, `profiles.mircea.experience.${item.key}.role`)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section
              index="03"
              label={t(lang, 'profiles.mircea.education.label')}
              title={t(lang, 'profiles.mircea.education.title')}
            >
              <div className="education-grid">
                {EDUCATION.map(key => (
                  <div key={key} className="education-card">
                    <div className="education-card__degree">
                      {t(lang, `profiles.mircea.education.${key}.degree`)}
                    </div>
                    <div className="education-card__field mono-label">
                      {t(lang, `profiles.mircea.education.${key}.field`)}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        }
      />
    </>
  )
}
