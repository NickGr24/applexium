import { Head } from 'vite-react-ssg'
import { type Lang, localePath } from '../i18n'
import pages from '../site/pages.json'
import { pageMeta, SITE_ORIGIN } from '../site/meta'

// Clash Display 500 — every page's own H1 (hero title, legal-hero__title,
// product-hero__title, ...) sets `font-family: var(--font-display)` at this
// weight (tokens.css/home.css et al.), and that H1 is the LCP candidate on
// most of this site's pages. `<Seo>` renders on every page (see its own
// call sites), so preloading here — rather than duplicating this link once
// per page — reaches all of them uniformly. `font-display: swap` in
// fonts.css already prevents an invisible-text flash while it loads; this
// preload is purely about getting the fetch started as early as possible
// instead of only after the CSSOM discovers the @font-face rule.
const DISPLAY_FONT_WOFF2 = '/fonts/JTSL5QESUXATU47LCPUNHZQBDDIWDOSW.woff2'

export function Seo({ page, lang, jsonLd = [] }: { page: string; lang: Lang; jsonLd?: object[] }) {
  const slug = pages.find(p => p.id === page)!.slug
  const m = pageMeta[page][lang]
  const url = SITE_ORIGIN + localePath(lang, slug)
  return (
    <Head>
      <html lang={lang} />
      <title>{m.title}</title>
      <meta name="description" content={m.description} />
      <link rel="preload" as="font" type="font/woff2" href={DISPLAY_FONT_WOFF2} crossOrigin="anonymous" />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ro" href={SITE_ORIGIN + localePath('ro', slug)} />
      <link rel="alternate" hrefLang="en" href={SITE_ORIGIN + localePath('en', slug)} />
      <link rel="alternate" hrefLang="x-default" href={SITE_ORIGIN + localePath('ro', slug)} />
      <meta property="og:title" content={m.title} />
      <meta property="og:description" content={m.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_ORIGIN}/og-image.png`} />
      <meta property="og:locale" content={lang === 'ro' ? 'ro_RO' : 'en_US'} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Head>
  )
}
