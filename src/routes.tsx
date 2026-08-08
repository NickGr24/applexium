import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'
import pages from './site/pages.json'

const componentFor: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: React.lazy(() => import('./pages/Home')),
  // страницы добавляются по мере задач; до тех пор — заглушка
}
const Placeholder = () => null

function pageRoutes(prefix: string): RouteRecord[] {
  return pages.map(p => ({
    path: p.slug === '' ? prefix || '/' : `${prefix}/${p.slug}`,
    Component: componentFor[p.id] ?? Placeholder,
  }))
}

export const routes: RouteRecord[] = [...pageRoutes(''), ...pageRoutes('/en')]
