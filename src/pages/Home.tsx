import { Seo } from '../components/Seo'
import { useLang } from '../i18n'
import { organizationJsonLd, webSiteJsonLd } from '../site/jsonld'

export default function Home() {
  const lang = useLang()
  // Temporary inline style to verify tokens/fonts (Task 2). Removed in Task 14
  // once the real hero markup lands.
  return (
    <>
      <Seo page="home" lang={lang} jsonLd={[organizationJsonLd(lang), webSiteJsonLd(lang)]} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', padding: '2rem' }}>
        Applexium
      </h1>
    </>
  )
}
