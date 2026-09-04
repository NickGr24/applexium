import { Link } from 'react-router-dom'
import { localePath, t, useLang } from '../i18n'
import { LEGAL_ENTITY } from '../site/company'

// Locale-invariant facts (same in RO and EN), mirroring the constants already
// duplicated across src/site/jsonld.ts — not translation strings, so they
// live here rather than in the i18n dictionaries.
const CONTACT = {
  email: LEGAL_ENTITY.email,
  phone: LEGAL_ENTITY.phone,
  address: 'Mihai Viteazul 2a, Chișinău, Moldova',
}

const PRODUCTS = ['legalia', 'emmi', 'precedentia'] as const

export function Footer() {
  const lang = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link to={localePath(lang, '')} className="footer__logo" aria-label="Applexium">
            <img src="/brand/applexium-horizontal.png" alt="Applexium" />
          </Link>
          <p className="footer__copy mono-label">
            © {year} Applexium. {t(lang, 'footer.rights')}
          </p>
          {/* verify-dist asserts "IDNO <number>" on every page. */}
          <p className="footer__entity mono-label">
            {`${t(lang, 'footer.operatedBy')} ${LEGAL_ENTITY.name} · IDNO ${LEGAL_ENTITY.idno}`}
          </p>
        </div>

        <nav className="footer__col" aria-label={t(lang, 'nav.products')}>
          <span className="mono-label">{t(lang, 'nav.products')}</span>
          <ul>
            {PRODUCTS.map(id => (
              <li key={id}>
                <Link to={localePath(lang, id)}>{id[0].toUpperCase() + id.slice(1)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label={t(lang, 'footer.company')}>
          <span className="mono-label">{t(lang, 'footer.company')}</span>
          <ul>
            <li>
              <Link to={localePath(lang, 'team')}>{t(lang, 'nav.team')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'projects')}>{t(lang, 'nav.portfolio')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'contacts')}>{t(lang, 'nav.contact')}</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label={t(lang, 'footer.legal.heading')}>
          <span className="mono-label">{t(lang, 'footer.legal.heading')}</span>
          <ul>
            <li>
              <Link to={localePath(lang, 'incredere')}>{t(lang, 'footer.legal.trust')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'terms-and-conditions')}>{t(lang, 'footer.legal.terms')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'privacy-policy')}>{t(lang, 'footer.legal.privacy')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'cookie-policy')}>{t(lang, 'footer.legal.cookies')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'ai-ethics')}>{t(lang, 'footer.legal.aiEthics')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'accessibility')}>{t(lang, 'footer.legal.accessibility')}</Link>
            </li>
            <li>
              <Link to={localePath(lang, 'esg')}>{t(lang, 'footer.legal.esg')}</Link>
            </li>
          </ul>
        </nav>

        <div className="footer__col" aria-label={t(lang, 'nav.contact')}>
          <span className="mono-label">{t(lang, 'nav.contact')}</span>
          <ul>
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}>{CONTACT.phone}</a>
            </li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
