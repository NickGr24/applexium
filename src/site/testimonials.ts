/**
 * Named client testimonials for the home page (2026-09 audit, item 2).
 * Empty on purpose until real quotes exist: the section does not render
 * while this list is empty, and nothing here may be written on a client's
 * behalf. Each entry needs a person, a role and an organisation — anonymous
 * praise is discounted by the readers this section is for.
 */

export type Testimonial = {
  /** i18n key of the quote text (both dictionaries). */
  quote: string
  author: string
  role: string
  org: string
  /** Optional portrait under /public. */
  photo?: string
}

export const TESTIMONIALS: Testimonial[] = []
