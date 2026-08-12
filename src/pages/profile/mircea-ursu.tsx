import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { localePath, t, useLang } from '../../i18n'
import { personJsonLd } from '../../site/jsonld'
import { CylinderWheel, EDUCATION } from './CylinderWheel'
import { Profile } from './Profile'
import { EXPERIENCE, TubeCarousel } from './TubeCarousel'
import './mircea-ursu.css'

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
              <TubeCarousel lang={lang} />
            </Section>

            <Section
              index="03"
              label={t(lang, 'profiles.mircea.education.label')}
              title={t(lang, 'profiles.mircea.education.title')}
            >
              <CylinderWheel lang={lang} />
            </Section>
          </>
        }
      />
    </>
  )
}
