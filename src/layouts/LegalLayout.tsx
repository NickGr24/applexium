import type { ComponentType, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { RevealText } from '../components/RevealText'
import { useLang, t } from '../i18n'
import { useReducedMotion } from '../motion/useReducedMotion'
import './legal.css'

type TocItem = { id: string; text: string }

// Diacritic-safe slug for a heading's own anchor id — "Angajamentul nostru"
// -> "angajamentul-nostru". Romanian/English text only, so a plain NFD strip
// is enough; no transliteration table needed.
function slugify(text: string, index: number): string {
  const base = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `section-${index}`
}

type LegalLayoutProps = {
  /** Inline-SVG glyph component for this document's hero (see
   * `pages/legal/icons.tsx`) — the new stack doesn't load Font Awesome, so
   * this replaces the `fa-*` class the legacy `.legal-hero-icon` used. */
  icon: ComponentType
  title: string
  subtitle: string
  version: string
  /** The page's own content module (see `pages/legal/content/*`) — plain
   * `<h2>/<h3>/<p>/<ul>/<table>` markup, mechanically ported from
   * `_legacy/*.html`. The table of contents below is built from whichever
   * `<h2>`s actually show up in here, not a hand-maintained list, so it
   * can't drift out of sync with the ported text. */
  children: ReactNode
}

/**
 * Shared shell for the six legal pages: a quiet hero (icon, title, subtitle,
 * version — only the title gets `RevealText`, per the brief's "no heavy
 * animation" call) plus a narrow 65ch reading column with a sticky
 * desktop-only table of contents built from the content's own `<h2>`s after
 * mount. Deliberately has no scene canvas, no per-paragraph scroll reveals,
 * no WebGL — this is a typographic template, not another product hero.
 */
export function LegalLayout({ icon: Icon, title, subtitle, version, children }: LegalLayoutProps) {
  const lang = useLang()
  const reduced = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    const headings = Array.from(root.querySelectorAll('h2'))
    const items = headings.map((h, i) => {
      const text = h.textContent?.trim() ?? ''
      const id = slugify(text, i)
      h.id = id
      return { id, text }
    })
    setToc(items)
  }, [children])

  function goTo(e: React.MouseEvent, id: string) {
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    // Keep the URL shareable/back-button-friendly without a jump-scroll.
    window.history.pushState(null, '', `#${id}`)
  }

  return (
    <article className="legal-page">
      <header className="legal-hero container">
        <div className="legal-hero__icon" aria-hidden="true">
          <Icon />
        </div>
        <RevealText>
          <h1 className="legal-hero__title">{title}</h1>
        </RevealText>
        <p className="legal-hero__subtitle">{subtitle}</p>
        <p className="legal-hero__version mono-label">{version}</p>
      </header>

      <div className="legal-body container">
        {toc.length > 0 && (
          <nav className="legal-toc" aria-label={t(lang, 'legal.toc')}>
            <span className="legal-toc__label mono-label">{t(lang, 'legal.toc')}</span>
            <ol>
              {toc.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} onClick={e => goTo(e, item.id)}>
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="legal-content-column" ref={contentRef}>
          {children}
        </div>
      </div>
    </article>
  )
}
