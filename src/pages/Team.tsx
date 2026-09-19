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
  { slug: 'mircea-ursu', key: 'mircea', photo: '/team/mirceaursu.webp', w: 691, h: 1280 },
  { slug: 'nichita-griu', key: 'nichita', photo: '/team/nikitagriu.webp', w: 640, h: 640 },
  { slug: 'diana-tatar', key: 'diana', photo: '/team/dianatatar.webp', w: 467, h: 560 },
] as const

function TeamCard({ member, lang, first }: { member: (typeof MEMBERS)[number]; lang: Lang; first: boolean }) {
  const name = t(lang, `team.${member.key}.name`)
  return (
    <Link className="team-card" to={localePath(lang, member.slug)}>
      <div className="team-card__photo photo-hover">
        {/* alt="" — the name is already the card's own visible <h3>, right
            below; repeating it here would just double the Link's
            accessible name (same call as `home.css`'s `.case__media`). */}
        {/* The first card's photo is the LCP element on phones: lazy-loading
            it cost 1.08s of "resource load delay" in the 2026-09-19
            Lighthouse pass. The other two sit below the fold there. */}
        <img
          src={member.photo}
          alt=""
          width={member.w}
          height={member.h}
          loading={first ? 'eager' : 'lazy'}
          fetchPriority={first ? 'high' : 'auto'}
          decoding="async"
        />
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
          {MEMBERS.map((member, i) => (
            <TeamCard key={member.slug} member={member} lang={lang} first={i === 0} />
          ))}
        </div>
      </Section>
    </>
  )
}
