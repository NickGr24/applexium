import { Link } from 'react-router-dom'
import { RevealText } from '../components/RevealText'
import { Section } from '../components/Section'
import { Seo } from '../components/Seo'
import { localePath, t, useLang, type Lang } from '../i18n'
import { aboutPageJsonLd } from '../site/jsonld'
import './team.css'

/** The three profiles, in the same order as `_legacy/team.html`. `slug`
 * doubles as the route id (`componentFor`/`pages.json`) and the i18n key
 * under `team.*`; `photo` matches `personSource` in `site/jsonld.ts`. */
const MEMBERS = [
  { slug: 'mircea-ursu', key: 'mircea', photo: '/team/mirceaursu.webp' },
  { slug: 'nichita-griu', key: 'nichita', photo: '/team/nikitagriu.webp' },
  { slug: 'diana-tatar', key: 'diana', photo: '/team/dianatatar.webp' },
] as const

function TeamCard({ member, lang }: { member: (typeof MEMBERS)[number]; lang: Lang }) {
  const name = t(lang, `team.${member.key}.name`)
  return (
    <Link className="team-card" to={localePath(lang, member.slug)}>
      <div className="team-card__photo photo-hover">
        {/* alt="" — the name is already the card's own visible <h3>, right
            below; repeating it here would just double the Link's
            accessible name (same call as `home.css`'s `.case__media`). */}
        <img src={member.photo} alt="" loading="lazy" decoding="async" />
      </div>
      <h3 className="team-card__name">{name}</h3>
      <span className="team-card__role mono-label">{t(lang, `team.${member.key}.role`)}</span>
      <p className="team-card__text">{t(lang, `team.${member.key}.text`)}</p>
      <span className="team-card__cta" aria-hidden="true">
        {t(lang, 'team.viewProfile')} →
      </span>
    </Link>
  )
}

export default function Team() {
  const lang = useLang()

  return (
    <>
      <Seo page="team" lang={lang} jsonLd={[aboutPageJsonLd(lang)]} />

      <Section id="team" index="01" label={t(lang, 'team.label')} title={t(lang, 'team.title')}>
        <RevealText>
          <p className="team-intro">{t(lang, 'team.intro')}</p>
        </RevealText>

        <div className="team-grid">
          {MEMBERS.map(member => (
            <TeamCard key={member.slug} member={member} lang={lang} />
          ))}
        </div>
      </Section>
    </>
  )
}
