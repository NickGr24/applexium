import { useEffect, useRef } from 'react'

type SpotlightCardProps = {
  icon?: React.ReactNode
  title: string
  text: string
}

/**
 * Bento-grid card with a radial spotlight that tracks the pointer. Position
 * is written straight to CSS custom properties (--mx/--my) via
 * el.style.setProperty on mousemove, coalesced to one write per animation
 * frame — no React re-render per pixel moved.
 *
 * The listener only attaches on fine-pointer devices (there's nothing to
 * track on touch, same gate as MagneticButton) and only inside useEffect,
 * so this is SSR-safe: the server and the first client render both emit the
 * static card with the spotlight centered via the CSS `50%` default, and
 * the effect + its listener are torn down on unmount.
 */
export function SpotlightCard({ icon, title, text }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

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
  }, [])

  return (
    <div ref={ref} className="spotlight-card">
      {icon && (
        <div className="spotlight-card__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="spotlight-card__title">{title}</h3>
      <p className="spotlight-card__text">{text}</p>
    </div>
  )
}
