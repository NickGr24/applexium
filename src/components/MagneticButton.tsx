import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

type MagneticButtonProps = {
  as?: 'a' | 'button'
  href?: string
  /** For an external destination (e.g. Precedentia's own live app) — passed
   * straight through to the anchor, same as plain HTML. Both undefined by
   * default, so existing same-site callers render exactly as before. */
  target?: string
  rel?: string
  variant: 'primary' | 'ghost'
  children: React.ReactNode
  onClick?: () => void
}

/**
 * Button/link that leans toward the pointer (up to 12px) and snaps back
 * elastically on leave. The magnet only attaches on fine-pointer devices —
 * touch visitors, and anyone with prefers-reduced-motion, get a plain
 * static button with no listeners attached.
 */
export function MagneticButton({ as = 'a', href, target, rel, variant, children, onClick }: MagneticButtonProps) {
  const nodeRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (!matchMedia('(pointer: fine)').matches) return
    // Widened to the common HTMLElement supertype: addEventListener's
    // overload resolution can't infer a concrete event map from a union of
    // two element types, so TS falls back to plain Event without this cast.
    const el = nodeRef.current as HTMLElement | null
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      xTo(gsap.utils.clamp(-12, 12, relX * 0.4))
      yTo(gsap.utils.clamp(-12, 12, relY * 0.4))
    }

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.set(el, { x: 0, y: 0 })
    }
  }, [reduced])

  const className = `magnetic-btn magnetic-btn--${variant}`
  const setRef = (node: HTMLAnchorElement | HTMLButtonElement | null) => {
    nodeRef.current = node
  }

  if (as === 'button') {
    return (
      <button ref={setRef} type="button" className={className} onClick={onClick}>
        <span className="magnetic-btn__label">{children}</span>
      </button>
    )
  }

  return (
    <a ref={setRef} href={href} target={target} rel={rel} className={className} onClick={onClick}>
      <span className="magnetic-btn__label">{children}</span>
    </a>
  )
}
