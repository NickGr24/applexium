import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Re-measures every ScrollTrigger on the page once the layout that the
 * caller just mounted has actually settled, and again after `load`.
 *
 * Why this is needed at all: a component that renders one thing on the
 * server and a much taller thing after `useReducedMotion()` re-syncs (the
 * profile page's 3D tracks are 2.5 and 2 viewports tall, replacing lists a
 * few hundred pixels tall) moves every later trigger's start/end by
 * thousands of pixels. Triggers created in that same commit cache positions
 * from a document that is about to change underneath them.
 *
 * A single `requestAnimationFrame` is not enough — measured on the Mircea
 * profile, the tube's trigger came out correct while the cylinder's stayed
 * ~1700px early, exactly the difference between the flat list it replaced
 * and the track that replaced it. The second frame is the one where the
 * swapped subtree has been laid out for real; `load` then covers images
 * above the tracks resizing the flow later.
 *
 * Returns a cleanup that cancels anything still pending.
 */
export function refreshScrollTriggers(): () => void {
  let inner = 0
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  const onLoad = () => ScrollTrigger.refresh()
  window.addEventListener('load', onLoad)

  return () => {
    cancelAnimationFrame(outer)
    cancelAnimationFrame(inner)
    window.removeEventListener('load', onLoad)
  }
}
