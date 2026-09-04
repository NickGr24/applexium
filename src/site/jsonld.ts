import { type Lang, localePath, t } from '../i18n'
import { type CaseKey, caseByKey } from './cases'
import { faqItems } from './faq'
import { pageMeta, SITE_ORIGIN } from './meta'
import pages from './pages.json'

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
    // Precedentia publishes this exact @id on its own domain, so the two
    // properties resolve to one node in an entity graph rather than to two
    // unrelated companies that happen to share a legal name.
    subOrganization: [
      {
        '@type': 'Organization',
        '@id': 'https://precedentia.md/#organization',
        name: 'Precedentia',
        url: 'https://precedentia.md/',
      },
    ],
  }
}

export function faqPageJsonLd(lang: Lang) {
  const url = siteUrl(lang, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    inLanguage: lang,
    isPartOf: { '@id': `${url}#website` },
    about: { '@id': `${url}#organization` },
    mainEntity: faqItems(lang).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
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
    /**
     * Capabilities an answer engine can quote, each one stated verbatim on the
     * product page itself — structured data may only restate visible content.
     */
    featureList: string[]
    /** The product's own domain, where it has one distinct from this site. */
    sameAs?: string[]
  }
> = {
  emmi: {
    name: 'Emmi',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Telephony, Instagram, WhatsApp, Telegram',
    description:
      'Emmi este un AI conversațional multi-canal care răspunde la apeluri telefonice, chat web și mesaje pe Instagram, WhatsApp și Telegram în română și rusă, bazat pe propriile tale documente, disponibil 24/7.',
    inLanguage: ['ro', 'ru'],
    featureList: [
      'Cinci canale: telefon, widget web, Instagram, WhatsApp și Telegram',
      'Timp de răspuns la voce sub o secundă',
      'Română și rusă la voce; engleză și ucraineană în chat',
      'Răspunde pe baza documentelor încărcate de client',
      'Disponibil 24/7',
    ],
  },
  legalia: {
    name: 'Legalia',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description:
      'O platformă de educație juridică creată pentru Moldova, care ajută utilizatorii să înțeleagă legislația prin cursuri structurate și teste interactive.',
    inLanguage: 'page',
    featureList: [
      '105 discipline juridice',
      '924 de subiecte de studiu',
      'Traseu ghidat pas cu pas pe fiecare disciplină',
      'Podcast, lecție video și hartă mentală pentru aproape fiecare subiect',
      'Teste interactive cu feedback care explică răspunsul corect',
    ],
  },
  precedentia: {
    name: 'Precedentia',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Motor de căutare juridică bazat pe AI pentru jurisprudența Moldovei și României — acoperind Curtea Supremă de Justiție, Curtea Constituțională, CEDO și ÎCCJ, cu căutare după cuvinte-cheie, căutare semantică, asistent juridic AI și API public.',
    inLanguage: 'page',
    featureList: [
      'Peste 275.000 de hotărâri din Moldova și România',
      'Patru instanțe: CSJ, Curtea Constituțională, CEDO și ÎCCJ',
      'Căutare full-text după cuvinte-cheie',
      'Căutare semantică în limbaj natural',
      'Asistent juridic AI',
    ],
    sameAs: ['https://precedentia.md/'],
  },
}

export function softwareApplicationJsonLd(id: SoftwareAppId, lang: Lang) {
  const src = softwareApplicationSource[id]
  const url = siteUrl(lang, id)
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: src.name,
    applicationCategory: src.applicationCategory,
    operatingSystem: src.operatingSystem,
    description: src.description,
    url,
    inLanguage: src.inLanguage === 'page' ? lang : src.inLanguage,
    featureList: src.featureList,
    ...(src.sameAs ? { sameAs: src.sameAs } : {}),
    provider: { '@id': `${siteUrl(lang, '')}#organization` },
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
  const m = pageMeta.projects[lang]
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collectionpage`,
    url,
    name: m.title.replace(/ \| Applexium$/, ''),
    description: m.description,
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}

/**
 * Plain `WebPage` for pages whose structured data has nothing more specific
 * to say (trust page, 404): name/description come from the page's own
 * meta, so the two can never disagree.
 */
export function webPageJsonLd(id: string, lang: Lang) {
  const slug = pages.find((p) => p.id === id)!.slug
  const url = siteUrl(lang, slug)
  const m = pageMeta[id][lang]
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: m.title.replace(/ \| Applexium$/, ''),
    description: m.description,
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}

/** A case study is a `WebPage` about the client organisation it describes. */
export function caseStudyJsonLd(key: CaseKey, lang: Lang) {
  const study = caseByKey(key)!
  return {
    ...webPageJsonLd(`case-${key}`, lang),
    about: { '@type': 'Organization', name: t(lang, `cases.${key}.client`), url: study.href },
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

export type LegalId =
  | 'accessibility'
  | 'ai-ethics'
  | 'cookie-policy'
  | 'esg'
  | 'privacy-policy'
  | 'terms-and-conditions'

/**
 * The six legal pages (Task 19), each a flat `WebPage` object — matching the
 * shape most of `_legacy/*.html`'s own JSON-LD blocks use (a couple carry
 * stray inconsistencies, e.g. `ai-ethics.html`'s `name` keeping the " |
 * Applexium" suffix that the others drop, or missing/present `@id` — not
 * worth reproducing here). Like `aboutPageJsonLd`/`collectionPageJsonLd`,
 * `name`/`description` stay the RO legacy text on *both* language versions;
 * only `url`/`@id`/`inLanguage`/`publisher.url` vary with `lang`. `name` is
 * derived from `pageMeta`'s own RO `<title>` by dropping the site-name
 * suffix every one of the six follows exactly ("X | Applexium"), and
 * `description` reuses `pageMeta`'s RO description outright — the same text
 * already verified against `_legacy/*.html`'s own `<meta name="description">`
 * (see `site/meta.ts`'s doc comment for the two pages expanded there).
 */
export function legalPageJsonLd(id: LegalId, lang: Lang) {
  const url = siteUrl(lang, id)
  const ro = pageMeta[id].ro
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: ro.title.replace(/ \| Applexium$/, ''),
    description: ro.description,
    url,
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: 'Applexium', url: siteUrl(lang, '') },
  }
}
