import type { ComponentType } from 'react'
import { LegalLayout } from '../../layouts/LegalLayout'
import { Seo } from '../../components/Seo'
import { type Lang, useLang } from '../../i18n'
import { legalPageJsonLd, type LegalId } from '../../site/jsonld'
import {
  IconAccessibility,
  IconBrain,
  IconCookie,
  IconLeaf,
  IconShieldHalf,
  IconFileContract,
} from './icons'

export type { LegalId }

/** Hero copy per page/language — bare `<h1>` text and subtitle, ported
 * verbatim from each `_legacy/{id}.html`'s (and its `en/` mirror's)
 * `.legal-hero` block. Not the same string as `pageMeta`'s `<title>` (that
 * one carries the " | Applexium" SEO suffix); kept as its own small table
 * since it's markup the hero renders directly, not metadata. */
const LEGAL: Record<LegalId, { icon: ComponentType; ro: { title: string; subtitle: string }; en: { title: string; subtitle: string } }> = {
  accessibility: {
    icon: IconAccessibility,
    ro: { title: 'Declarație de Accesibilitate', subtitle: 'Declarație de Accesibilitate' },
    en: { title: 'Accessibility Statement', subtitle: 'Accessibility Statement' },
  },
  'ai-ethics': {
    icon: IconBrain,
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
    icon: IconCookie,
    ro: { title: 'Politica de Cookie-uri', subtitle: 'Politica de Cookie-uri · Informații privind utilizarea cookie-urilor' },
    en: { title: 'Cookie Policy', subtitle: 'Cookie Policy · Information on the use of cookies' },
  },
  esg: {
    icon: IconLeaf,
    ro: { title: 'Declarație ESG', subtitle: 'Mediu · Social · Guvernanță' },
    en: { title: 'ESG Statement', subtitle: 'Environmental · Social · Governance' },
  },
  'privacy-policy': {
    icon: IconShieldHalf,
    ro: { title: 'Politica de confidențialitate', subtitle: 'Politica de Confidențialitate · Protecția datelor cu caracter personal' },
    en: { title: 'Privacy Policy', subtitle: 'Privacy Policy · Personal Data Protection' },
  },
  'terms-and-conditions': {
    icon: IconFileContract,
    ro: { title: 'Termeni și condiții', subtitle: 'Termeni și Condiții de Utilizare' },
    en: { title: 'Terms & Conditions', subtitle: 'Terms and Conditions of Use' },
  },
}

// Identical on all six legacy pages (`.legal-version`), both languages.
const VERSION: Record<Lang, string> = {
  ro: 'Versiunea 1.0 • Aprilie 2026',
  en: 'Version 1.0 • April 2026',
}

/**
 * Shared route component for all six legal pages. `Content` (one of the
 * twelve modules under `./content/`) is resolved by `routes.tsx` *before*
 * this component is ever rendered — not looked up here behind its own
 * `React.lazy`+`<Suspense>`, which is what this used to do. That nested
 * runtime Suspense looked equivalent but wasn't: `vite-react-ssg`'s static
 * build renders each page with `renderToPipeableStream`, and a component
 * that genuinely suspends mid-render doesn't come back as inlined HTML —
 * React commits to its streaming "swap" format (a `<template id="B:0">`
 * placeholder plus a `$RC` script that moves the real markup over), which
 * only ever runs once client JS hydrates. Prerendered output that depends
 * on that script had the actual legal text missing entirely with JS off —
 * confirmed on 5 of the 6 legal pages in this build, reproducibly. The
 * *route-level* `React.lazy` in `routes.tsx` (the same mechanism every
 * other page already uses) doesn't have this problem: `vite-react-ssg`
 * resolves route modules during route matching, before rendering starts,
 * so nothing suspends inside the render tree at all. See `legalComponent`
 * in `routes.tsx`.
 */
export function LegalPage({ id, Content }: { id: LegalId; Content: ComponentType }) {
  const lang = useLang()
  const meta = LEGAL[id]

  return (
    <>
      <Seo page={id} lang={lang} jsonLd={[legalPageJsonLd(id, lang)]} />

      <LegalLayout icon={meta.icon} title={meta[lang].title} subtitle={meta[lang].subtitle} version={VERSION[lang]}>
        <Content />
      </LegalLayout>
    </>
  )
}
