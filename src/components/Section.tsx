import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'
import { MonoLabel } from './MonoLabel'
import { SplitHeading } from './SplitHeading'

gsap.registerPlugin(ScrollTrigger)

type SectionProps = {
  id?: string
  label: string
  index: string
  title: string
  children?: React.ReactNode
}

/**
 * Standard section chrome shared by every content section: a mono-label +
 * rule header, a SplitHeading title, then arbitrary content — all inside
 * `.container`. The header rule grows in from the left (scaleX 0 -> 1,
 * transform-origin left) once it enters the viewport.
 *
 * The tween is gated on useReducedMotion, same pattern as the other motion
 * primitives: when skipped, the rule simply keeps its untransformed CSS
 * state (full width), so the server and reduced-motion visitors never see
 * a collapsed line waiting to animate.
 */
export function Section({ id, label, index, title, children }: SectionProps) {
  const lineRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !lineRef.current) return

    const tween = gsap.from(lineRef.current, {
      scaleX: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: lineRef.current, start: 'top 90%', once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
    }
  }, [reduced])

  return (
    <section id={id} className="section container">
      <header className="section__header">
        <MonoLabel index={index}>{label}</MonoLabel>
        <div ref={lineRef} className="section__line" aria-hidden="true" />
      </header>
      <SplitHeading as="h2" className="section__title">
        {title}
      </SplitHeading>
      <div className="section__content">{children}</div>
    </section>
  )
}
