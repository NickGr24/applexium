import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'
import SiteLayout from './layouts/SiteLayout'
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
  // остальные страницы добавляются по мере задач; до тех пор — заглушка
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
