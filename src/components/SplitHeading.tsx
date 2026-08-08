import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Heading that reveals line-by-line from under a mask as it enters the
 * viewport. The split only happens client-side inside useLayoutEffect —
 * SSG/SSR always renders the plain heading text, so pre-rendered HTML keeps
 * the full string intact for crawlers and there is nothing to hydrate away.
 * Reduced-motion visitors (and the server) get the static heading, no split.
 */
export function SplitHeading({
  as: Tag = 'h2',
  children,
  className,
}: {
  as?: 'h1' | 'h2' | 'h3'
  children: string
  className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !ref.current) return

    const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines' })
    const tween = gsap.from(split.lines, {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power4.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    })

    return () => {
      tween.scrollTrigger?.kill()
      split.revert()
    }
  }, [reduced])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
