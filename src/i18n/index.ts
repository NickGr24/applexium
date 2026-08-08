import { useLocation } from 'react-router-dom'
import en from './en.json'
import ro from './ro.json'

export type Lang = 'ro' | 'en'
const dicts = { ro, en } as const

export function t(lang: Lang, key: string): string {
  const val = key.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), dicts[lang])
  if (typeof val !== 'string') throw new Error(`i18n: missing key "${key}" for "${lang}"`)
  return val
}

export function useLang(): Lang {
  const { pathname } = useLocation()
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ro'
}

export function localePath(lang: Lang, slug: string): string {
  const p = slug ? `/${slug}` : '/'
  return lang === 'en' ? `/en${p === '/' ? '' : p}` || '/en' : p
}
