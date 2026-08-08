import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { MonoLabel } from '../../components/MonoLabel'
import { type Lang, t } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * One sentence, word by word: each word starts dim and lights up as the
 * sentence scrolls through the middle of the screen, so reading it and
 * scrolling it are the same gesture.
 *
 * The dim state is applied from JS, never from CSS — that way the server's
 * HTML, a visitor with JS disabled, and anyone with `prefers-reduced-motion`
 * all get the finished, fully-legible paragraph instead of a wall of 22%
 * grey waiting for an animation that will never run.
 */
export function Manifesto({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const text = t(lang, 'home.manifesto.text')

  useLayoutEffect(() => {
    if (reduced) return
    const root = ref.current
    if (!root) return

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('.manifesto__word', root)
      gsap.fromTo(
        words,
        { opacity: 0.22 },
        {
          opacity: 1,
          ease: 'none',
          duration: 0.4,
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: 'top 78%', end: 'bottom 58%', scrub: true },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [reduced, text])

  const words = text.split(' ')

  return (
    <section className="manifesto container" ref={ref}>
      <MonoLabel index="01">{t(lang, 'home.manifesto.label')}</MonoLabel>
      <p className="manifesto__text">
        {words.map((word, i) => (
          <span className="manifesto__word" key={`${word}-${i}`}>
            {i < words.length - 1 ? `${word} ` : word}
          </span>
        ))}
      </p>
    </section>
  )
}
