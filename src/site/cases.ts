/**
 * The three client case studies (2026-09 audit, item 2). Copy lives in the
 * i18n dictionaries under `cases.<key>.*` so the parity test keeps RO and
 * EN in step; this module holds the locale-invariant facts and the parts
 * that must never be invented — numbers and quotes. `metrics` stays empty
 * and `testimonial` stays `null` until the client supplies real figures
 * and a signed-off quote; `CasePage` hides those sections while they are
 * empty, and tests/cases.test.ts enforces the shape.
 */

export type CaseKey = 'inj' | 'eurobridge' | 'cmda'

export type CaseMetric = {
  /** Display value exactly as it should read, e.g. "3 200" or "84%". */
  value: string
  /** i18n key of the label under the number, present in both dictionaries. */
  label: string
}

export type CaseTestimonial = {
  /** i18n key of the quote text. */
  quote: string
  author: string
  role: string
  /** Optional portrait under /public. */
  photo?: string
}

export type CaseStudy = {
  key: CaseKey
  /** Year the engagement went live. Confirm with the client before publishing. */
  year: string
  /** The client's own site. */
  href: string
  /** Logo under /public; when omitted the client's initials render instead. */
  logo?: string
  initials: string
  metrics: CaseMetric[]
  testimonial: CaseTestimonial | null
}

export const CASES: CaseStudy[] = [
  {
    key: 'inj',
    year: '2026',
    href: 'https://www.inj.md/',
    logo: '/inj.webp',
    initials: 'INJ',
    metrics: [],
    testimonial: null,
  },
  {
    key: 'eurobridge',
    year: '2026',
    href: 'https://eurobridge-uamd.org/',
    logo: '/eurobridge.webp',
    initials: 'EUB',
    metrics: [],
    testimonial: null,
  },
  {
    key: 'cmda',
    year: '2026',
    href: 'https://cmda.md/',
    logo: '/cmda.webp',
    initials: 'CMDA',
    metrics: [],
    testimonial: null,
  },
]

/** Route slug for a case (pages.json id is `case-<key>`). */
export function caseSlug(key: CaseKey): string {
  return `proiecte/${key}`
}

export function caseByKey(key: string): CaseStudy | undefined {
  return CASES.find((c) => c.key === key)
}
