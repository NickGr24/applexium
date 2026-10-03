// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  NOTICE_MAX_AGE_MS,
  NOTICE_STORAGE_KEY,
  POLICY_VERSION,
  acknowledgeNotice,
  noticeAcknowledged,
} from '../src/site/consent'

// A plain in-memory Storage: under recent Node versions jsdom's own
// `localStorage` can be shadowed by Node's built-in (undefined without
// --localstorage-file), so the test supplies its own.
function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    get length() { return m.size },
    clear: () => m.clear(),
    getItem: k => (m.has(k) ? m.get(k)! : null),
    key: i => [...m.keys()][i] ?? null,
    removeItem: k => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  }
}

describe('cookie notice acknowledgement', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true })
  })

  it('is not acknowledged on a first visit', () => {
    expect(noticeAcknowledged()).toBe(false)
  })

  it('stores version + date and is then acknowledged', () => {
    acknowledgeNotice(new Date('2026-10-03T12:00:00Z'))
    const rec = JSON.parse(window.localStorage.getItem(NOTICE_STORAGE_KEY)!)
    expect(rec).toEqual({ v: POLICY_VERSION, at: '2026-10-03T12:00:00.000Z' })
    expect(noticeAcknowledged(Date.parse('2026-10-04T00:00:00Z'))).toBe(true)
  })

  it('expires after 12 months', () => {
    const at = new Date('2026-10-03T12:00:00Z')
    acknowledgeNotice(at)
    expect(noticeAcknowledged(at.getTime() + NOTICE_MAX_AGE_MS + 1)).toBe(false)
  })

  it('reappears when the policy version changes', () => {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify({ v: '2000-01', at: new Date().toISOString() }))
    expect(noticeAcknowledged()).toBe(false)
  })

  it('treats garbage as not acknowledged', () => {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, '{nope')
    expect(noticeAcknowledged()).toBe(false)
  })
})
