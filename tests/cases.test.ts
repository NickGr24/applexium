import { describe, expect, it } from 'vitest'
import { t } from '../src/i18n'
import { CASES, caseSlug } from '../src/site/cases'
import pages from '../src/site/pages.json'

const LANGS = ['ro', 'en'] as const

describe('case studies', () => {
  it('ships exactly the three studies the 2026-09 audit asked for, each routed and in the sitemap', () => {
    expect(CASES.map((c) => c.key)).toEqual(['inj', 'eurobridge', 'cmda'])
    for (const c of CASES) {
      const page = pages.find((p) => p.id === `case-${c.key}`)
      expect(page, `pages.json entry for case-${c.key}`).toBeDefined()
      expect(page!.slug).toBe(caseSlug(c.key))
      expect(page!.inSitemap).toBe(true)
    }
  })

  it('has bilingual copy for every field the page renders', () => {
    for (const c of CASES) {
      for (const lang of LANGS) {
        for (const field of ['client', 'sector', 'title', 'summary', 'context', 'built.0', 'built.1']) {
          expect(() => t(lang, `cases.${c.key}.${field}`), `${c.key}/${lang}/${field}`).not.toThrow()
        }
        expect(t(lang, `cases.${c.key}.summary`).length).toBeGreaterThan(50)
      }
      expect(c.year).toMatch(/^\d{4}$/)
      expect(c.href).toMatch(/^https:\/\//)
      // A logo is optional (INJ has none in the repo yet); when absent the
      // card renders the client's initials instead of a broken image.
      if (c.logo) expect(c.logo).toMatch(/^\/.+\.(webp|png|svg)$/)
      expect(c.initials).toMatch(/^[A-ZĂÂÎȘȚ]{2,5}$/)
    }
  })

  it('never renders a number or a quote that nobody supplied', () => {
    // Results and testimonials are hidden until real client data exists;
    // the shape is enforced so a half-filled entry cannot slip through.
    for (const c of CASES) {
      expect(Array.isArray(c.metrics)).toBe(true)
      for (const m of c.metrics) {
        expect(m.value).toMatch(/\S/)
        for (const lang of LANGS) expect(() => t(lang, m.label)).not.toThrow()
      }
      if (c.testimonial) {
        expect(c.testimonial.author).toMatch(/\S/)
        expect(c.testimonial.role).toMatch(/\S/)
        for (const lang of LANGS) expect(() => t(lang, c.testimonial!.quote)).not.toThrow()
      }
    }
  })
})
