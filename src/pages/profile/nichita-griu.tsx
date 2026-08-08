import { Link } from 'react-router-dom'
import { RevealText } from '../../components/RevealText'
import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { localePath, t, useLang } from '../../i18n'
import { personJsonLd } from '../../site/jsonld'
import { Profile } from './Profile'
import './nichita-griu.css'

/** The two products, ported from `_legacy/nichita-griu.html`'s
 * `.np-product-card` pair. `iconPlate`: Legalia's mark sits on the white
 * chip the legacy `.np-product-ico.legalia` background gave it; Emmi's own
 * avatar crop (already used circular on `emmi.tsx`'s hero) needs no plate. */
const PRODUCTS = [
  { id: 'legalia', name: 'Legalia', icon: '/legalia-icon-v2.png', iconPlate: true },
  { id: 'emmi', name: 'Emmi', icon: '/emmi-avatar.webp', iconPlate: false },
] as const

/** Tech-stack groups, ported from the legacy `.np-stack-group` list — three
 * groups of 4 pills, one (Tools) of 3, same order and counts as the source. */
const STACK_GROUPS = [
  { key: 'mobile', items: 4 },
  { key: 'backend', items: 4 },
  { key: 'ai', items: 4 },
  { key: 'tools', items: 3 },
] as const

export default function NichitaGriu() {
  const lang = useLang()

  return (
    <>
      <Seo page="nichita-griu" lang={lang} jsonLd={[personJsonLd('nichita-griu', lang)]} />

      <Profile
        photo="/team/nikitagriu.webp"
        status={t(lang, 'profiles.nichita.hero.status')}
        name="Nichita Griu"
        role={t(lang, 'profiles.nichita.hero.role')}
        location={t(lang, 'profiles.nichita.hero.location')}
        facts={[
          { value: PRODUCTS.length, label: t(lang, 'profiles.nichita.facts.products') },
          { value: STACK_GROUPS.length, label: t(lang, 'profiles.nichita.facts.stack') },
        ]}
        bio={
          <>
            <RevealText>
              <p className="profile-bio">{t(lang, 'profiles.nichita.hero.bio.p1')}</p>
            </RevealText>
            <RevealText>
              <p className="profile-bio">{t(lang, 'profiles.nichita.hero.bio.p2')}</p>
            </RevealText>
          </>
        }
        links={[
          { label: t(lang, 'profile.email'), href: 'mailto:nichitagriu@applexium.com' },
        ]}
        backHref={localePath(lang, 'team')}
        backLabel={t(lang, 'profile.back')}
        sections={
          <>
            <Section
              index="02"
              label={t(lang, 'profiles.nichita.products.label')}
              title={t(lang, 'profiles.nichita.products.title')}
            >
              <div className="product-grid">
                {PRODUCTS.map(product => (
                  <Link key={product.id} to={localePath(lang, product.id)} className="product-card">
                    <div className="product-card__head">
                      <div className={`product-card__icon${product.iconPlate ? ' product-card__icon--plate' : ''}`}>
                        <img src={product.icon} alt="" loading="lazy" decoding="async" />
                      </div>
                      <div>
                        <div className="product-card__name">{product.name}</div>
                        <div className="product-card__kicker mono-label">
                          {t(lang, `profiles.nichita.products.${product.id}.kicker`)}
                        </div>
                      </div>
                    </div>
                    <p className="product-card__text">{t(lang, `profiles.nichita.products.${product.id}.text`)}</p>
                    <div className="chip-row">
                      {[1, 2, 3, 4].map(n => (
                        <span key={n} className="chip">
                          {t(lang, `profiles.nichita.products.${product.id}.tag${n}`)}
                        </span>
                      ))}
                    </div>
                    <span className="product-card__cta" aria-hidden="true">
                      {t(lang, 'profiles.nichita.products.cta')} →
                    </span>
                  </Link>
                ))}
              </div>
            </Section>

            <Section
              index="03"
              label={t(lang, 'profiles.nichita.stack.label')}
              title={t(lang, 'profiles.nichita.stack.title')}
            >
              <div className="stack-groups">
                {STACK_GROUPS.map(group => (
                  <div key={group.key} className="stack-group">
                    <h3 className="mono-label">{t(lang, `profiles.nichita.stack.${group.key}.heading`)}</h3>
                    <div className="chip-row">
                      {Array.from({ length: group.items }, (_, i) => i + 1).map(n => (
                        <span key={n} className="chip">
                          {t(lang, `profiles.nichita.stack.${group.key}.item${n}`)}
                        </span>
                      ))}
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
