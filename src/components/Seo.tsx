import { Head } from 'vite-react-ssg'
import { type Lang, localePath } from '../i18n'
import pages from '../site/pages.json'
import { pageMeta, SITE_ORIGIN } from '../site/meta'

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
