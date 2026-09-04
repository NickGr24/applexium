import { Link } from 'react-router-dom'
import { MagneticButton } from '../components/MagneticButton'
import { MonoLabel } from '../components/MonoLabel'
import { RevealText } from '../components/RevealText'
import { Section } from '../components/Section'
import { Seo } from '../components/Seo'
import { localePath, t, useLang } from '../i18n'
import { LEGAL_ENTITY } from '../site/company'
import { webPageJsonLd } from '../site/jsonld'
import './trust.css'

const ITEMS = ['hosting', 'isolation', 'ownership', 'retention', 'guardrails', 'channels', 'access', 'dpa'] as const

const COMMITMENTS = [
  ['privacy-policy', 'footer.legal.privacy'],
  ['ai-ethics', 'footer.legal.aiEthics'],
  ['accessibility', 'footer.legal.accessibility'],
  ['esg', 'footer.legal.esg'],
  ['cookie-policy', 'footer.legal.cookies'],
  ['terms-and-conditions', 'footer.legal.terms'],
] as const

/**
 * "Încredere și date" — the security and data-handling page procurement
 * reads before a first call (2026-09 audit, item 7). Every statement here
 * is a property of the products as they ship (see PRODUCT.md's capability
 * list); the page deliberately never names the vendors behind the stack.
 */
export default function Trust() {
  const lang = useLang()

  return (
    <>
      <Seo page="trust" lang={lang} jsonLd={[webPageJsonLd('trust', lang)]} />

      <section className="trust-hero container">
        <MonoLabel index="01">{t(lang, 'trust.label')}</MonoLabel>
        <h1 className="trust-hero__title">{t(lang, 'trust.title')}</h1>
        <p className="trust-hero__intro">{t(lang, 'trust.intro')}</p>
      </section>

      <div className="container">
        <ul className="trust-items">
          {ITEMS.map((key) => (
            <li key={key}>
              <h3>{t(lang, `trust.items.${key}.title`)}</h3>
              <p>{t(lang, `trust.items.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </div>

      <Section id="conformitate" index="02" label={t(lang, 'trust.label')} title={t(lang, 'trust.compliance.title')}>
        <RevealText>
          <div className="trust-compliance">
            <p>{t(lang, 'trust.compliance.text')}</p>
            <ul>
              {COMMITMENTS.map(([slug, labelKey]) => (
                <li key={slug}>
                  <Link to={localePath(lang, slug)}>{t(lang, labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </RevealText>
      </Section>

      <Section id="entitate" index="03" label={t(lang, 'trust.label')} title={t(lang, 'trust.entity.title')}>
        <RevealText>
          <div className="trust-entity">
            <p>
              {t(lang, 'trust.entity.text')} <b>{LEGAL_ENTITY.name}</b>.
            </p>
            <p className="trust-entity__id">
              {`IDNO ${LEGAL_ENTITY.idno} · ${LEGAL_ENTITY.address}`}
            </p>
            <p>
              {t(lang, 'trust.entity.contact')} <a href={`mailto:${LEGAL_ENTITY.email}`}>{LEGAL_ENTITY.email}</a>
            </p>
          </div>
        </RevealText>
      </Section>

      <div className="trust-cta container">
        <h2 className="trust-cta__title">{t(lang, 'trust.cta.title')}</h2>
        <p className="trust-cta__text">{t(lang, 'trust.cta.text')}</p>
        <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
          {t(lang, 'trust.cta.button')}
        </MagneticButton>
      </div>
    </>
  )
}
