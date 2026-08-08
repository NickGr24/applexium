import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

// No motion assumed until proven otherwise: the server can't know the
// visitor's OS preference, so it renders the reduced-motion output. The
// client re-subscribes on mount and re-renders once the real value is known,
// which never conflicts with hydration (server and first client render both
// see `true`).
function getServerSnapshot(): boolean {
  return true
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
