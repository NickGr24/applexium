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
  // остальные страницы добавляются по мере задач; до тех пор — заглушка
}

// The six legal pages (Task 19) all share one route component, `LegalPage`,
// parameterised by `id` — so each gets a closure around that id rather than
// its own file (unlike the product/profile pages, which each have a real
// per-page file because their content genuinely differs page to page, not
// just by which id string to look up). `LegalPage` itself lazy-loads the
// actual ported text per `id`+lang (see `pages/legal/LegalPage.tsx`), so
// this outer `React.lazy` only pulls in the shared layout/chrome.
const LEGAL_IDS: LegalId[] = [
  'accessibility',
  'ai-ethics',
  'cookie-policy',
  'esg',
  'privacy-policy',
  'terms-and-conditions',
]
for (const id of LEGAL_IDS) {
  componentFor[id] = React.lazy(() =>
    import('./pages/legal/LegalPage').then(({ LegalPage }) => ({ default: () => <LegalPage id={id} /> })),
  )
}

const Placeholder = () => null

/**
 * Builds the page routes for one language prefix ('' for RO at the root,
 * 'en' for the /en mirror), as *relative* children of the root '/' layout
 * route. The home page (slug '') becomes an index route when there's no
 * prefix, or a literal `prefix` segment route when there is one — `/en`
 * itself is a real page, not an index of anything.
 */
function pageRoutes(prefix: string): RouteRecord[] {
  return pages.map((p): RouteRecord => {
    const Component = componentFor[p.id] ?? Placeholder
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
