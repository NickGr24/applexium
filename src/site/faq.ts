import { type Lang, t } from '../i18n'

/** Number of entries under `home.faq.items` in both dictionaries. */
const FAQ_COUNT = 6

/**
 * The home page's questions and answers, read from the translation dictionaries.
 *
 * Both the visible accordion and the FAQPage structured data are built from this
 * one function, so the markup always restates text that is actually on the page —
 * which is what schema.org requires — and a copy edit cannot leave the two out of
 * step. `t` throws on a missing key, so a partial translation fails the build
 * rather than shipping an empty answer.
 */
export function faqItems(lang: Lang): { q: string; a: string }[] {
  return Array.from({ length: FAQ_COUNT }, (_, i) => ({
    q: t(lang, `home.faq.items.${i}.q`),
    a: t(lang, `home.faq.items.${i}.a`),
  }))
}
