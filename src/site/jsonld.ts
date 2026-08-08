import { type Lang, localePath } from '../i18n'
import { SITE_ORIGIN } from './meta'

/**
 * JSON-LD factories, ported from the `<script type="application/ld+json">`
 * blocks in the corresponding `_legacy/*.html` pages. `url`/`@id` are always
 * localized per `lang`. `inLanguage` is localized only where the legacy
 * source itself varies it per page (`SoftwareApplication` for
 * legalia/precedentia, `ContactPage`) — `WebSite.inLanguage` is the fixed
 * `["ro", "en"]` in the legacy source on *both* the ro and en pages
 * (`_legacy/index.html:77` / `_legacy/en/index.html:77`), so it stays a
 * constant here too, not a per-`lang` value. All other fields — names,
 * descriptions, breadcrumb labels — are reproduced verbatim from the RO
 * legacy source, which is this repo's single source of truth (see
 * CLAUDE.md bilingual system).
 *
 * `logo`/`image` are kept pointing at the site root rather than mirroring the
 * legacy site's `/en/...` asset paths: this build serves one shared asset
 * tree (no per-locale asset copies), so a localized image path would 404.
 */

function siteUrl(lang: Lang, slug: string): string {
  return SITE_ORIGIN + localePath(lang, slug)
}

export function organizationJsonLd(lang: Lang) {
  const url = siteUrl(lang, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name: 'Applexium',
    legalName: 'SCALELAW SOLUTIONS SRL',
    url,
    logo: `${SITE_ORIGIN}/favicon-512x512.png`,
    image: `${SITE_ORIGIN}/og-image.png`,
    email: 'info@applexium.com',
    telephone: '+373 78 76 87 65',
    foundingDate: '2025-10-30',
    founder: { '@type': 'Person', name: 'Mircea Ursu' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Mihai Viteazul 2a',
      addressLocality: 'Chișinău',
      addressCountry: 'MD',
    },
    identifier: { '@type': 'PropertyValue', name: 'IDNO', value: '1025600064372' },
    areaServed: ['MD', 'EU'],
    knowsLanguage: ['ro', 'en', 'ru'],
  }
}

export function webSiteJsonLd(lang: Lang) {
  const url = siteUrl(lang, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}#website`,
    url,
    name: 'Applexium',
    inLanguage: ['ro', 'en'],
    publisher: { '@id': `${url}#organization` },
  }
}

type SoftwareAppId = 'emmi' | 'legalia' | 'precedentia'

const softwareApplicationSource: Record<
  SoftwareAppId,
  {
    name: string
    applicationCategory: string
    operatingSystem: string
    description: string
    /** 'page' = follows the visited page's language (matches legacy ro/en split); a fixed array = independent of page language (e.g. Emmi's spoken languages). */
    inLanguage: 'page' | string[]
  }
> = {
  emmi: {
    name: 'Emmi',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Telephony, Instagram, WhatsApp, Telegram',
    description:
      'Emmi este un AI conversațional multi-canal care răspunde la apeluri telefonice, chat web și mesaje pe Instagram, WhatsApp și Telegram în română și rusă, bazat pe propriile tale documente, disponibil 24/7.',
    inLanguage: ['ro', 'ru'],
  },
  legalia: {
    name: 'Legalia',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description:
      'O platformă de educație juridică creată pentru Moldova, care ajută utilizatorii să înțeleagă legislația prin cursuri structurate și teste interactive.',
    inLanguage: 'page',
  },
  precedentia: {
    name: 'Precedentia',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Motor de căutare juridică bazat pe AI pentru jurisprudența Moldovei și României — acoperind Curtea Supremă de Justiție, Curtea Constituțională, CEDO și ÎCCJ, cu căutare după cuvinte-cheie, căutare semantică, asistent juridic AI și API public.',
    inLanguage: 'page',
  },
}

export function softwareApplicationJsonLd(id: SoftwareAppId, lang: Lang) {
  const src = softwareApplicationSource[id]
  const url = siteUrl(lang, id)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: src.name,
    applicationCategory: src.applicationCategory,
    operatingSystem: src.operatingSystem,
    description: src.description,
    url,
    inLanguage: src.inLanguage === 'page' ? lang : src.inLanguage,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}

type PersonId = 'mircea-ursu' | 'nichita-griu' | 'diana-tatar'

const personSource: Record<
  PersonId,
  {
    name: string
    givenName: string
    familyName: string
    jobTitle: string
    image: string
    email?: string
    sameAs?: string[]
    address?: boolean
  }
> = {
  'mircea-ursu': {
    name: 'Mircea Ursu',
    givenName: 'Mircea',
    familyName: 'Ursu',
    jobTitle: 'Co-fondator și CEO',
    image: `${SITE_ORIGIN}/team/mirceaursu.webp`,
    sameAs: [
      'https://www.linkedin.com/in/mirceaursu/',
      'https://t.me/observance_of_legality',
      'https://www.facebook.com/mircea.ursu.520',
    ],
    address: true,
  },
  'nichita-griu': {
    name: 'Nichita Griu',
    givenName: 'Nichita',
    familyName: 'Griu',
    jobTitle: 'Co-fondator și CTO',
    image: `${SITE_ORIGIN}/team/nikitagriu.webp`,
    email: 'nichitagriu@applexium.com',
  },
  'diana-tatar': {
    name: 'Diana Tatar',
    givenName: 'Diana',
    familyName: 'Tatar',
    jobTitle: 'Chief Marketing Officer',
    image: `${SITE_ORIGIN}/team/dianatatar.webp`,
    email: 'designerdianatatar30@gmail.com',
  },
}

const breadcrumbLabel = { home: 'Acasă', team: 'Echipă' }

export function personJsonLd(id: PersonId, lang: Lang) {
  const src = personSource[id]
  const url = siteUrl(lang, id)
  const orgUrl = siteUrl(lang, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: src.name,
        givenName: src.givenName,
        familyName: src.familyName,
        jobTitle: src.jobTitle,
        image: src.image,
        url,
        ...(src.email ? { email: src.email } : {}),
        worksFor: {
          '@type': 'Organization',
          name: 'Applexium',
          legalName: 'SCALELAW SOLUTIONS SRL',
          url: orgUrl,
        },
        ...(src.address
          ? { address: { '@type': 'PostalAddress', addressLocality: 'Chișinău', addressCountry: 'MD' } }
          : {}),
        ...(src.sameAs ? { sameAs: src.sameAs } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: breadcrumbLabel.home, item: siteUrl(lang, '') },
          { '@type': 'ListItem', position: 2, name: breadcrumbLabel.team, item: siteUrl(lang, 'team') },
          { '@type': 'ListItem', position: 3, name: src.name, item: url },
        ],
      },
    ],
  }
}

/**
 * Team listing page. Legacy (`_legacy/team.html` and its `en/` mirror) ships
 * this as a flat `AboutPage` object, not a `@graph` — and, like the other
 * factories above, `name`/`description` stay the RO legacy text on *both*
 * language versions (`_legacy/en/team.html`'s own JSON-LD block still reads
 * "Echipa noastră" verbatim); only `url`/`@id`/`inLanguage`/`publisher.url`
 * vary with `lang`.
 */
export function aboutPageJsonLd(lang: Lang) {
  const url = siteUrl(lang, 'team')
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': url,
    url,
    name: 'Echipa noastră - Applexium',
    description:
      'Cunoaște echipa Applexium — minți pasionate dedicate construirii de soluții digitale inovatoare, conduse de CEO Mircea Ursu și CTO Nichita Griu.',
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}

/**
 * Projects (portfolio) listing page. Flat `CollectionPage` object, matching
 * `_legacy/projects.html`'s own JSON-LD block — like `aboutPageJsonLd`,
 * `name`/`description` stay the RO legacy text on *both* language versions
 * (`_legacy/en/projects.html`'s own block still reads "Inovațiile noastre
 * interne" verbatim); only `url`/`@id`/`inLanguage`/`publisher.url` vary
 * with `lang`. This page is intentionally excluded from `sitemap.xml` (see
 * `pages.json`), but it still ships full SEO metadata and structured data
 * like every other page.
 */
export function collectionPageJsonLd(lang: Lang) {
  const url = siteUrl(lang, 'projects')
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collectionpage`,
    url,
    name: 'Inovațiile noastre interne',
    description:
      'Un portofoliu de produse digitale și proiecte pentru clienți dezvoltate de Applexium pentru întreprinderea modernă.',
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}

export function contactPageJsonLd(lang: Lang) {
  const url = siteUrl(lang, 'contacts')
  const orgUrl = siteUrl(lang, '')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${url}#contactpage`,
        url,
        name: 'Contactează-ne - Applexium',
        description: 'Contactează echipa Applexium pentru solicitări de proiecte, parteneriate sau suport.',
        inLanguage: lang,
        isPartOf: { '@id': `${orgUrl}#website` },
        about: { '@id': `${orgUrl}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${orgUrl}#organization`,
        name: 'Applexium',
        legalName: 'SCALELAW SOLUTIONS SRL',
        url: orgUrl,
        logo: `${SITE_ORIGIN}/favicon-512x512.png`,
        image: `${SITE_ORIGIN}/og-image.png`,
        email: 'info@applexium.com',
        telephone: '+373 78 76 87 65',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Mihai Viteazul 2a',
          addressLocality: 'Chișinău',
          addressCountry: 'MD',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+373 78 76 87 65',
          email: 'info@applexium.com',
          contactType: 'customer support',
          availableLanguage: ['ro', 'en', 'ru'],
        },
        areaServed: ['MD', 'EU'],
        knowsLanguage: ['ro', 'en', 'ru'],
      },
    ],
  }
}
