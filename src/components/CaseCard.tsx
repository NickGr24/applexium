import { Link } from 'react-router-dom'
import { type Lang, localePath, t } from '../i18n'
import { type CaseStudy, caseSlug } from '../site/cases'

/**
 * One case-study teaser: client mark, sector, the study's title and a
 * "read" cue. Shared by Home's portfolio section and /projects so the two
 * never drift apart. Renders the client's initials when no logo file
 * exists in the repo yet (INJ, at the time of writing).
 */
export function CaseCard({ item, lang }: { item: CaseStudy; lang: Lang }) {
  const client = t(lang, `cases.${item.key}.client`)
  return (
    <Link className="case-card" to={localePath(lang, caseSlug(item.key))}>
      <div className="case-card__head">
        {item.logo ? (
          <span className="case-card__logo">
            {/* alt="" — the client's name is the visible text right beside it. */}
            <img src={item.logo} alt="" loading="lazy" decoding="async" />
          </span>
        ) : (
          <span className="case-card__logo case-card__logo--initials" aria-hidden="true">
            {item.initials}
          </span>
        )}
        <div>
          <div className="case-card__client">{client}</div>
          <span className="case-card__sector mono-label">{t(lang, `cases.${item.key}.sector`)}</span>
        </div>
      </div>
      <h3 className="case-card__title">{t(lang, `cases.${item.key}.title`)}</h3>
      <span className="case-card__cta" aria-hidden="true">
        {t(lang, 'home.portfolio.caseCta')} →
      </span>
    </Link>
  )
}
