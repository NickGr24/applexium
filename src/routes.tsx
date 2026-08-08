import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'

export const routes: RouteRecord[] = [
  { path: '/', Component: React.lazy(() => import('./pages/Home')) },
]
