import { Link } from 'react-router-dom'
import { MonoLabel } from '../components/MonoLabel'
import { Seo } from '../components/Seo'
import { localePath, t, useLang } from '../i18n'
import { webPageJsonLd } from '../site/jsonld'
import './trust.css'

/**
 * Rendered to dist/404.html (RO) and dist/en/404.html (EN). GitHub Pages
 * and Cloudflare Pages both serve the root 404.html with a real 404 status
 * for unknown paths, so this replaces the hosts' generic error page with
 * the site's own chrome and a way back (2026-09 audit, item 10).
 */
export default function NotFound() {
  const lang = useLang()
  const other = lang === 'ro' ? 'en' : 'ro'
  return (
    <>
      <Seo page="not-found" lang={lang} jsonLd={[webPageJsonLd('not-found', lang)]} />
      <section className="not-found container">
        <MonoLabel index={t(lang, 'notFound.label')}>{t(lang, 'notFound.title')}</MonoLabel>
        <h1 className="not-found__title">{t(lang, 'notFound.title')}</h1>
        <p className="not-found__text">{t(lang, 'notFound.text')}</p>
        <ul className="not-found__links">
          <li>
            <Link className="magnetic-btn magnetic-btn--primary" to={localePath(lang, '')}>
              {t(lang, 'notFound.home')}
            </Link>
          </li>
          <li>
            <Link className="magnetic-btn magnetic-btn--ghost" to={localePath(lang, 'emmi')}>
              {t(lang, 'notFound.products')}
            </Link>
          </li>
          <li>
            <Link className="magnetic-btn magnetic-btn--ghost" to={localePath(lang, 'contacts')}>
              {t(lang, 'notFound.contact')}
            </Link>
          </li>
          <li>
            <a className="magnetic-btn magnetic-btn--ghost" href={localePath(other, '')} hrefLang={other}>
              {t(lang, 'notFound.otherLang')}
            </a>
          </li>
        </ul>
      </section>
    </>
  )
}
