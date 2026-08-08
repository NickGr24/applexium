import { useEffect, type RefObject } from 'react'

/**
 * Writes the pointer's position relative to `ref`'s element into the
 * `--mx`/`--my` CSS custom properties, coalesced to one write per animation
 * frame via `el.style.setProperty` — no React re-render per pixel moved.
 * Pair with a `radial-gradient(... at var(--mx, 50%) var(--my, 50%) ...)`
 * background to get the site's spotlight-card hover language on any
 * element, not just `SpotlightCard` itself (e.g. Projects' case cards,
 * which need to stay an `<a>` rather than wrap in that div-only component).
 *
 * Only attaches on fine-pointer devices (there's nothing to track on touch,
 * same gate as `MagneticButton`) and only inside `useEffect`, so this is
 * SSR-safe: the server and the first client render both emit the static
 * element with the spotlight centered via the CSS `50%` default.
 */
export function useSpotlightPointer<T extends HTMLElement>(ref: RefObject<T | null>): void {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    if (!el) return

    let rafId: number | null = null
    let x = 0
    let y = 0

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      x = e.clientX - rect.left
      y = e.clientY - rect.top
      if (rafId != null) return
      rafId = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
        rafId = null
      })
    }

    el.addEventListener('mousemove', onMove)

    return () => {
      el.removeEventListener('mousemove', onMove)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [ref])
}
