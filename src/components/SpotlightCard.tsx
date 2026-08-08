import { useRef } from 'react'
import { useSpotlightPointer } from '../motion/useSpotlightPointer'

type SpotlightCardProps = {
  icon?: React.ReactNode
  title: string
  text: string
}

/**
 * Bento-grid card with a radial spotlight that tracks the pointer. Position
 * tracking (the --mx/--my writer, gated to fine-pointer devices and
 * SSR-safe) lives in `useSpotlightPointer`, shared with any other element
 * that wants the same hover language — see Projects' case cards, which
 * need to stay an `<a>` and so apply the hook directly rather than
 * wrapping in this div-only component.
 */
export function SpotlightCard({ icon, title, text }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  useSpotlightPointer(ref)

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
