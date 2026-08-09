import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'
import SiteLayout from './layouts/SiteLayout'
import type { LegalId } from './site/jsonld'
import pages from './site/pages.json'

const componentFor: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: React.lazy(() => import('./pages/Home')),
  emmi: React.lazy(() => import('./pages/product/emmi')),
  legalia: React.lazy(() => import('./pages/product/legalia')),
  precedentia: React.lazy(() => import('./pages/product/precedentia')),
  team: React.lazy(() => import('./pages/Team')),
  'mircea-ursu': React.lazy(() => import('./pages/profile/mircea-ursu')),
  'nichita-griu': React.lazy(() => import('./pages/profile/nichita-griu')),
  'diana-tatar': React.lazy(() => import('./pages/profile/diana-tatar')),
  projects: React.lazy(() => import('./pages/Projects')),
  contacts: React.lazy(() => import('./pages/Contacts')),
}

// The six legal pages (Task 19) all share one route component, `LegalPage`,
// parameterised by `id` — so each gets a closure around that id rather than
// its own file (unlike the product/profile pages, which each have a real
// per-page file because their content genuinely differs page to page, not
// just by which id string to look up).
const LEGAL_IDS: LegalId[] = [
  'accessibility',
  'ai-ethics',
  'cookie-policy',
  'esg',
  'privacy-policy',
  'terms-and-conditions',
]
const LEGAL_ID_SET = new Set<string>(LEGAL_IDS)

// One content-module importer per `id.lang` — kept here as raw `import()`
// factories, not wrapped in their own `React.lazy`, so `legalComponent`
// below can resolve a page's shell *and* its text as a single route-level
// lazy import (see that function's comment, and `LegalPage.tsx`'s, for why
// a second, nested `React.lazy`+`<Suspense>` around just the content broke
// the static build's no-JS output). Literal specifiers, not a templated
// path, so Rollup can still split each of the twelve ported texts into its
// own chunk.
const LEGAL_CONTENT: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'accessibility.ro': () => import('./pages/legal/content/accessibility.ro'),
  'accessibility.en': () => import('./pages/legal/content/accessibility.en'),
  'ai-ethics.ro': () => import('./pages/legal/content/ai-ethics.ro'),
  'ai-ethics.en': () => import('./pages/legal/content/ai-ethics.en'),
  'cookie-policy.ro': () => import('./pages/legal/content/cookie-policy.ro'),
  'cookie-policy.en': () => import('./pages/legal/content/cookie-policy.en'),
  'esg.ro': () => import('./pages/legal/content/esg.ro'),
  'esg.en': () => import('./pages/legal/content/esg.en'),
  'privacy-policy.ro': () => import('./pages/legal/content/privacy-policy.ro'),
  'privacy-policy.en': () => import('./pages/legal/content/privacy-policy.en'),
  'terms-and-conditions.ro': () => import('./pages/legal/content/terms-and-conditions.ro'),
  'terms-and-conditions.en': () => import('./pages/legal/content/terms-and-conditions.en'),
}

/**
 * One `React.lazy` per (id, lang) legal route — resolves the shared
 * `LegalPage` shell module *and* this page's specific content module
 * together, as one promise, before route matching hands off to rendering.
 * `vite-react-ssg` awaits route-level lazy components ahead of the render
 * pass (proven: none of the other 26 routes built via `componentFor` show
 * the streaming-placeholder problem), unlike a `React.lazy` mounted from
 * inside the render tree via `<Suspense>`, which is what `LegalPage` used
 * to do internally and which the static build couldn't reliably inline.
 */
function legalComponent(id: LegalId, lang: 'ro' | 'en') {
  return React.lazy(async () => {
    const [{ LegalPage }, contentModule] = await Promise.all([
      import('./pages/legal/LegalPage'),
      LEGAL_CONTENT[`${id}.${lang}`](),
    ])
    return { default: () => <LegalPage id={id} Content={contentModule.default} /> }
  })
}

/**
 * Builds the page routes for one language prefix ('' for RO at the root,
 * 'en' for the /en mirror), as *relative* children of the root '/' layout
 * route. The home page (slug '') becomes an index route when there's no
 * prefix, or a literal `prefix` segment route when there is one — `/en`
 * itself is a real page, not an index of anything.
 */
function pageRoutes(prefix: string): RouteRecord[] {
  const lang: 'ro' | 'en' = prefix === 'en' ? 'en' : 'ro'
  return pages.map((p): RouteRecord => {
    const Component = LEGAL_ID_SET.has(p.id) ? legalComponent(p.id as LegalId, lang) : componentFor[p.id]
    if (!prefix && p.slug === '') {
      return { index: true, Component }
    }
    const path = prefix ? (p.slug ? `${prefix}/${p.slug}` : prefix) : p.slug
    return { path, Component }
  })
}

export const routes: RouteRecord[] = [
  {
    path: '/',
    Component: SiteLayout,
    entry: 'src/layouts/SiteLayout.tsx',
    children: [...pageRoutes(''), ...pageRoutes('en')],
  },
]
