import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { type Lang, localePath, t, useLang } from '../i18n'
import { useLenis } from '../motion/LenisProvider'
import { useReducedMotion } from '../motion/useReducedMotion'

// Viewport width minus the html element's own content width, i.e. the
// scrollbar's footprint — cached at module scope since it can't change
// during a session (it's a platform/browser-chrome constant, not something
// that varies per element) and every open of the mobile menu would
// otherwise force the same layout read again.
let cachedScrollbarWidth: number | null = null
function scrollbarWidth(): number {
  if (cachedScrollbarWidth === null) {
    cachedScrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  }
  return cachedScrollbarWidth
}

type NavLink =
  | { kind: 'anchor'; hash: string; label: string }
  | { kind: 'page'; slug: string; label: string }

function navLinks(lang: Lang): NavLink[] {
  return [
    { kind: 'anchor', hash: 'servicii', label: t(lang, 'nav.services') },
    { kind: 'anchor', hash: 'produse', label: t(lang, 'nav.products') },
    { kind: 'page', slug: 'projects', label: t(lang, 'nav.portfolio') },
    { kind: 'page', slug: 'team', label: t(lang, 'nav.team') },
    { kind: 'page', slug: 'contacts', label: t(lang, 'nav.contact') },
  ]
}

function hrefFor(lang: Lang, link: NavLink): string {
  return link.kind === 'anchor' ? `${localePath(lang, '')}#${link.hash}` : localePath(lang, link.slug)
}

// Derives the slug of the page currently being viewed from the pathname, so
// the RO/EN switcher can point at the mirror of *this* page rather than
// always going back home.
function currentSlug(lang: Lang, pathname: string): string {
  const stripped = lang === 'en' ? pathname.replace(/^\/en(?=\/|$)/, '') : pathname
  return stripped.replace(/^\//, '').replace(/\/$/, '')
}

export function Nav() {
  const lang = useLang()
  const location = useLocation()
  const reducedMotion = useReducedMotion()
  const lenis = useLenis()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Locks the page behind the mobile overlay: `overflow: hidden` (the
  // `.nav-menu-open` rule in layout.css) plus a right-padding compensation
  // for the scrollbar's width so content doesn't shift sideways the instant
  // it disappears, and Lenis paused so a trackpad/wheel scroll over the
  // overlay can't smooth-scroll the page underneath it (native `overflow:
  // hidden` alone stops the browser's own scroll, but Lenis intercepts wheel
  // events itself and would keep animating the page scroll position even
  // while the html element can't visibly move).
  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('nav-menu-open', menuOpen)
    if (menuOpen) {
      html.style.setProperty('--scrollbar-comp', `${scrollbarWidth()}px`)
      lenis?.stop()
    } else {
      lenis?.start()
    }
  }, [menuOpen, lenis])

  useEffect(() => {
    if (!menuOpen) return
    const items = itemRefs.current.filter((el): el is HTMLAnchorElement => el != null)
    if (items.length === 0) return

    if (reducedMotion) {
      gsap.set(items, { y: 0, opacity: 1 })
      return
    }

    gsap.set(items, { y: 40, opacity: 0 })
    gsap.to(items, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' })
  }, [menuOpen, reducedMotion])

  const links = navLinks(lang)
  const slug = currentSlug(lang, location.pathname)

  return (
    <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__bar container">
        <Link to={localePath(lang, '')} className="nav__logo" aria-label="Applexium">
          {/* Above-the-fold on every page, in the fixed nav that's visible
              from the very first frame — fetchPriority hints the browser to
              fetch it ahead of same-priority discovered-later resources
              instead of at the default priority an <img> otherwise gets. */}
          <img src="/brand/applexium-horizontal.png" alt="Applexium" fetchPriority="high" />
        </Link>

        <nav className="nav__links" aria-label={t(lang, 'nav.primary')}>
          {links.map(link => (
            <Link key={link.label} to={hrefFor(lang, link)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <div className="lang-switch" role="group" aria-label="RO/EN">
            {(['ro', 'en'] as const).map(l => (
              <Link
                key={l}
                to={localePath(l, slug)}
                hrefLang={l}
                aria-current={l === lang ? 'true' : undefined}
                className={`lang-btn${l === lang ? ' lang-btn--active' : ''}`}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className={`nav__toggle${menuOpen ? ' nav__toggle--open' : ''}`}
            aria-label={t(lang, menuOpen ? 'nav.menuClose' : 'nav.menuOpen')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav__overlay${menuOpen ? ' nav__overlay--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="nav__overlay-links" aria-label={t(lang, 'nav.primary')}>
          {links.map((link, i) => (
            <Link
              key={link.label}
              to={hrefFor(lang, link)}
              // The overlay is aria-hidden while closed, but aria-hidden
              // alone doesn't stop these from being reachable by keyboard —
              // pull them out of the tab order too so a closed menu can't
              // trap focus on invisible links.
              tabIndex={menuOpen ? 0 : -1}
              ref={el => {
                itemRefs.current[i] = el
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
