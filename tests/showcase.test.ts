import { describe, expect, it } from 'vitest'
import { FADE, HANDOVER, LEAD, liveSlides } from '../src/pages/home/showcaseLive'

describe('liveSlides', () => {
  it('holds a single live slide while a product is at rest', () => {
    expect(liveSlides(0)).toEqual({ active: 0, live: [0] })
    expect(liveSlides(0.5)).toEqual({ active: 1, live: [1] })
    expect(liveSlides(1)).toEqual({ active: 2, live: [2] })
  })

  it('keeps both slides of a hand-over live from just before the fade to its end', () => {
    const [first, second] = HANDOVER
    expect(liveSlides(first.at - LEAD / 2)).toEqual({ active: 0, live: [0, 1] })
    expect(liveSlides(first.at)).toEqual({ active: 0, live: [0, 1] })
    expect(liveSlides(first.at + FADE)).toEqual({ active: 1, live: [0, 1] })
    expect(liveSlides(second.at + FADE / 2)).toEqual({ active: 2, live: [1, 2] })
  })

  it('drops the outgoing slide once its fade has finished', () => {
    const [first] = HANDOVER
    expect(liveSlides(first.at + FADE + 0.01)).toEqual({ active: 1, live: [1] })
  })

  it('never has more than two live slides at any scroll position', () => {
    for (let p = 0; p <= 1; p += 0.005) {
      expect(liveSlides(p).live.length, `progress ${p}`).toBeLessThanOrEqual(2)
    }
  })
})
