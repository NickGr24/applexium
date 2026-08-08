import { describe, expect, it } from 'vitest'
import pages from '../src/site/pages.json'
import { pageMeta } from '../src/site/meta'

describe('page meta', () => {
  it('every page has ro+en title and description', () => {
    for (const p of pages) {
      for (const lang of ['ro', 'en'] as const) {
        const m = pageMeta[p.id]?.[lang]
        expect(m?.title, `${p.id}/${lang} title`).toBeTruthy()
        expect(m?.description, `${p.id}/${lang} description`).toBeTruthy()
        expect(m!.description.length).toBeGreaterThan(50)
      }
    }
  })
})
