// @vitest-environment jsdom
import { existsSync, readFileSync, statSync } from 'node:fs'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientLogos } from '../src/pages/home/ClientLogos'
import { CLIENTS } from '../src/site/clients'

// 2x the chip's displayed size lands every logo well under this (the
// heaviest, INJ's line-art seal, is ~15 KB). The full-size originals the
// marquee used to decode ran up to 41 KB and 2425x737.
const BUDGET_BYTES = 20 * 1024

/** Pixel size from a WebP header: extended (VP8X), lossy (VP8) or lossless (VP8L). */
function webpSize(path: string): [number, number] {
  const b = readFileSync(path)
  const kind = b.toString('latin1', 12, 16)
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)]
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]
  if (kind === 'VP8L') {
    const bits = b.readUInt32LE(21)
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]
  }
  throw new Error(`${path}: not a WebP (${kind})`)
}

describe('client logos', () => {
  it('lists Enverde and no longer lists Jurista', () => {
    const names = CLIENTS.map((c) => c.name)
    expect(names).toContain('Enverde')
    expect(names).not.toContain('Jurista')
  })

  it('the marquee ships right-sized variants whose width/height attributes are true', () => {
    for (const c of CLIENTS) {
      expect(c.src, c.name).toMatch(/^\/logos\/marquee\/.+\.webp$/)
      const file = `public${c.src}`
      expect(existsSync(file), file).toBe(true)
      const size = statSync(file).size
      expect(size, `${file} is ${Math.round(size / 1024)} KB`).toBeLessThanOrEqual(BUDGET_BYTES)
      expect(webpSize(file), file).toEqual([c.srcW, c.srcH])
      // 2x the 64px `tall` chip is the tallest anything here is ever drawn.
      expect(c.srcH, file).toBeLessThanOrEqual(128)
    }
  })

  it('every hero-strip variant exists', () => {
    for (const c of CLIENTS.filter((c) => c.hero)) {
      expect(c.heroSrc, c.name).toBeDefined()
      expect(existsSync(`public${c.heroSrc}`), c.heroSrc).toBe(true)
    }
  })
})

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('ClientLogos marquee', () => {
  let host: HTMLDivElement
  let root: Root
  let notify: (isIntersecting: boolean) => void
  const disconnect = vi.fn()

  beforeEach(() => {
    disconnect.mockClear()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          notify = (isIntersecting) => cb([{ isIntersecting }])
        }
        observe() {}
        disconnect = disconnect
      },
    )
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  })

  afterEach(() => {
    act(() => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
  })

  const marquee = () => host.querySelector('.marquee') as HTMLElement

  it('scrolls by default, so the pre-hydration markup is never frozen', () => {
    act(() => root.render(<ClientLogos lang="ro" />))
    expect(marquee().classList.contains('marquee--offscreen')).toBe(false)
  })

  it('pauses the animation off screen and resumes it on the way back', () => {
    act(() => root.render(<ClientLogos lang="ro" />))
    act(() => notify(false))
    expect(marquee().classList.contains('marquee--offscreen')).toBe(true)
    act(() => notify(true))
    expect(marquee().classList.contains('marquee--offscreen')).toBe(false)
  })

  it('gives every logo its intrinsic size and hides the duplicate pass from assistive tech', () => {
    act(() => root.render(<ClientLogos lang="ro" />))
    const imgs = [...host.querySelectorAll('img')]
    expect(imgs).toHaveLength(CLIENTS.length * 2)
    for (const img of imgs) {
      expect(img.getAttribute('width')).toMatch(/^\d+$/)
      expect(img.getAttribute('height')).toMatch(/^\d+$/)
    }
    expect(imgs.filter((i) => i.getAttribute('alt') !== '')).toHaveLength(CLIENTS.length)
  })

  it('disconnects its observer on unmount', () => {
    act(() => root.render(<ClientLogos lang="ro" />))
    act(() => root.render(null))
    expect(disconnect).toHaveBeenCalled()
  })
})
