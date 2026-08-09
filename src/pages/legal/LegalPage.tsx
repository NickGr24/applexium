import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { LegalLayout } from '../../layouts/LegalLayout'
import { Seo } from '../../components/Seo'
import { type Lang, useLang } from '../../i18n'
import { legalPageJsonLd, type LegalId } from '../../site/jsonld'

export type { LegalId }

/** Hero copy per page/language — bare `<h1>` text and subtitle, ported
 * verbatim from each `_legacy/{id}.html`'s (and its `en/` mirror's)
 * `.legal-hero` block. Not the same string as `pageMeta`'s `<title>` (that
 * one carries the " | Applexium" SEO suffix); kept as its own small table
 * since it's markup the hero renders directly, not metadata. */
const LEGAL: Record<LegalId, { icon: string; ro: { title: string; subtitle: string }; en: { title: string; subtitle: string } }> = {
  accessibility: {
    icon: 'fa-universal-access',
    ro: { title: 'Declarație de Accesibilitate', subtitle: 'Declarație de Accesibilitate' },
    en: { title: 'Accessibility Statement', subtitle: 'Accessibility Statement' },
  },
  'ai-ethics': {
    icon: 'fa-brain',
    ro: {
      title: 'Declarație de etică AI',
      subtitle: 'Declarație privind principiile etice și utilizarea responsabilă a IA',
    },
    en: {
      title: 'AI Ethics Statement',
      subtitle: 'Statement on Ethical Principles and the Responsible Use of AI',
    },
  },
  'cookie-policy': {
    icon: 'fa-cookie-bite',
    ro: { title: 'Politica de Cookie-uri', subtitle: 'Politica de Cookie-uri · Informații privind utilizarea cookie-urilor' },
    en: { title: 'Cookie Policy', subtitle: 'Cookie Policy · Information on the use of cookies' },
  },
  esg: {
    icon: 'fa-leaf',
    ro: { title: 'Declarație ESG', subtitle: 'Mediu · Social · Guvernanță' },
    en: { title: 'ESG Statement', subtitle: 'Environmental · Social · Governance' },
  },
  'privacy-policy': {
    icon: 'fa-shield-halved',
    ro: { title: 'Politica de confidențialitate', subtitle: 'Politica de Confidențialitate · Protecția datelor cu caracter personal' },
    en: { title: 'Privacy Policy', subtitle: 'Privacy Policy · Personal Data Protection' },
  },
  'terms-and-conditions': {
    icon: 'fa-file-contract',
    ro: { title: 'Termeni și condiții', subtitle: 'Termeni și Condiții de Utilizare' },
    en: { title: 'Terms & Conditions', subtitle: 'Terms and Conditions of Use' },
  },
}

// Identical on all six legacy pages (`.legal-version`), both languages.
const VERSION: Record<Lang, string> = {
  ro: 'Versiunea 1.0 • Aprilie 2026',
  en: 'Version 1.0 • April 2026',
}

// One `React.lazy` per content module, created once at module scope (not
// inside the component — a fresh `lazy()` on every render would remount and
// re-suspend the content on every re-render) so each of the twelve ported
// texts ships as its own chunk instead of riding along in LegalPage's own
// chunk or each other's. See the brief: "юридический текст не должен
// попадать в общий чанк".
const CONTENT: Record<string, LazyExoticComponent<ComponentType>> = {
  'accessibility.ro': lazy(() => import('./content/accessibility.ro')),
  'accessibility.en': lazy(() => import('./content/accessibility.en')),
  'ai-ethics.ro': lazy(() => import('./content/ai-ethics.ro')),
  'ai-ethics.en': lazy(() => import('./content/ai-ethics.en')),
  'cookie-policy.ro': lazy(() => import('./content/cookie-policy.ro')),
  'cookie-policy.en': lazy(() => import('./content/cookie-policy.en')),
  'esg.ro': lazy(() => import('./content/esg.ro')),
  'esg.en': lazy(() => import('./content/esg.en')),
  'privacy-policy.ro': lazy(() => import('./content/privacy-policy.ro')),
  'privacy-policy.en': lazy(() => import('./content/privacy-policy.en')),
  'terms-and-conditions.ro': lazy(() => import('./content/terms-and-conditions.ro')),
  'terms-and-conditions.en': lazy(() => import('./content/terms-and-conditions.en')),
}

/**
 * Shared route component for all six legal pages — picks its content module
 * by `id` + the current URL's language (see `useLang`), so the same
 * component instance serves both the RO and `/en/` route for a given `id`
 * (mirrors every other page in this codebase, e.g. `mircea-ursu.tsx`).
 * Wired into `componentFor` in `routes.tsx` via one closure per id, since a
 * route `Component` takes no props of its own.
 */
export function LegalPage({ id }: { id: LegalId }) {
  const lang = useLang()
  const meta = LEGAL[id]
  const Content = CONTENT[`${id}.${lang}`]

  return (
    <>
      <Seo page={id} lang={lang} jsonLd={[legalPageJsonLd(id, lang)]} />

      <LegalLayout icon={meta.icon} title={meta[lang].title} subtitle={meta[lang].subtitle} version={VERSION[lang]}>
        <Suspense fallback={null}>
          <Content />
        </Suspense>
      </LegalLayout>
    </>
  )
}
