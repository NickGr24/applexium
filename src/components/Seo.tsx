import { Head } from 'vite-react-ssg'
import { type Lang, localePath } from '../i18n'
import pages from '../site/pages.json'
import { pageMeta, SITE_ORIGIN } from '../site/meta'

// No `<link rel="preload" as="font">` here, deliberately. This component used
// to preload Clash Display 500 (every page's H1) to start that fetch early.
// Chrome holds rendering for a short grace period while a preloaded font is
// in flight, and on this site that was enough to miss the first frame in
// Lighthouse/PSI's Chrome, which then paints a whole second later and
// charges every script to FCP and LCP — see scripts/inline-css.mjs for the
// A/B numbers (this preload alone was the difference between 88-98 and a
// steady 100). Nothing is lost in exchange: the stylesheet is inline in
// <head>, so the @font-face rules are known from the first byte of CSS and
// the font is requested at first layout anyway, and `font-display: swap`
// (fonts.css) keeps the text visible meanwhile. verify-dist fails the build
// if a font preload comes back.

export function Seo({ page, lang, jsonLd = [] }: { page: string; lang: Lang; jsonLd?: object[] }) {
  const slug = pages.find(p => p.id === page)!.slug
  const m = pageMeta[page][lang]
  const url = SITE_ORIGIN + localePath(lang, slug)
  return (
    <Head>
      <html lang={lang} />
      <title>{m.title}</title>
      <meta name="description" content={m.description} />
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
