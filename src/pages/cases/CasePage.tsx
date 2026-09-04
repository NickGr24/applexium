import { Link } from 'react-router-dom'
import { MagneticButton } from '../../components/MagneticButton'
import { MonoLabel } from '../../components/MonoLabel'
import { RevealText } from '../../components/RevealText'
import { Seo } from '../../components/Seo'
import { localePath, t, useLang } from '../../i18n'
import { type CaseKey, caseByKey } from '../../site/cases'
import { caseStudyJsonLd } from '../../site/jsonld'
import '../cases.css'

/**
 * One shared shell for the three case studies, parameterised by `id` the
 * same way `LegalPage` is: routes.tsx wraps it in a closure per case so
 * each route stays a single lazy import. Sections whose content nobody has
 * supplied yet (results, testimonial) are simply not rendered — see
 * src/site/cases.ts for why they start empty.
 */
export function CasePage({ id }: { id: CaseKey }) {
  const lang = useLang()
  const study = caseByKey(id)
  if (!study) throw new Error(`Unknown case study "${id}"`)
  const k = `cases.${id}`
  const built = ((): string[] => {
    const items: string[] = []
    for (let i = 0; i < 12; i++) {
      try {
        items.push(t(lang, `${k}.built.${i}`))
      } catch {
        break
      }
    }
    return items
  })()

  return (
    <>
      <Seo page={`case-${id}`} lang={lang} jsonLd={[caseStudyJsonLd(id, lang)]} />

      <section className="case-hero container">
        <Link className="case-hero__back" to={localePath(lang, 'projects')}>
          ← {t(lang, 'cases.common.back')}
        </Link>
        <MonoLabel index="01">{t(lang, 'cases.common.label')}</MonoLabel>
        <h1 className="case-hero__title">{t(lang, `${k}.title`)}</h1>
        <p className="case-hero__summary">{t(lang, `${k}.summary`)}</p>
        <ul className="case-hero__facts">
          <li>
            <span className="mono-label">{t(lang, 'cases.common.client')}</span>
            <span>{t(lang, `${k}.client`)}</span>
          </li>
          <li>
            <span className="mono-label">{t(lang, 'cases.common.sector')}</span>
            <span>{t(lang, `${k}.sector`)}</span>
          </li>
          <li>
            <span className="mono-label">{t(lang, 'cases.common.year')}</span>
            <span>{study.year}</span>
          </li>
          <li>
            <span className="mono-label">{t(lang, 'cases.common.visit')}</span>
            <a href={study.href} target="_blank" rel="noopener noreferrer">
              {study.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          </li>
        </ul>
      </section>

      <div className="case-body container">
        <RevealText>
          <section className="case-block">
            <h2 className="case-block__title">{t(lang, 'cases.common.context')}</h2>
            <p className="case-block__text">{t(lang, `${k}.context`)}</p>
          </section>
        </RevealText>

        <RevealText>
          <section className="case-block">
            <h2 className="case-block__title">{t(lang, 'cases.common.built')}</h2>
            <ul className="case-block__list">
              {built.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        </RevealText>

        {study.metrics.length > 0 && (
          <RevealText>
            <section className="case-block">
              <h2 className="case-block__title">{t(lang, 'cases.common.results')}</h2>
              <ul className="case-metrics">
                {study.metrics.map((m) => (
                  <li key={m.label}>
                    <span className="case-metrics__value">{m.value}</span>
                    <span className="case-metrics__label">{t(lang, m.label)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </RevealText>
        )}

        {study.testimonial && (
          <RevealText>
            <section className="case-block">
              <h2 className="case-block__title">{t(lang, 'cases.common.quote')}</h2>
              <blockquote className="case-quote">
                <p>“{t(lang, study.testimonial.quote)}”</p>
                <footer>
                  <b>{study.testimonial.author}</b>
                  <span>{study.testimonial.role}</span>
                </footer>
              </blockquote>
            </section>
          </RevealText>
        )}

        <div className="case-cta">
          <h2 className="case-cta__title">{t(lang, 'cases.common.ctaTitle')}</h2>
          <p className="case-cta__text">{t(lang, 'cases.common.ctaText')}</p>
          <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
            {t(lang, 'cta.consult')}
          </MagneticButton>
        </div>
      </div>
    </>
  )
}
