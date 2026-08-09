// Invariant checks for the built `dist/` output. Run after `vite-react-ssg
// build` + `gen-sitemap.mjs` as the last step of `npm run build`. Exits
// non-zero (and prints every violation, not just the first) if anything is
// off — this is the "test" half of Task 20's TDD pair with gen-sitemap.mjs.
import { readFileSync, existsSync } from 'node:fs'
import pages from '../src/site/pages.json' with { type: 'json' }

const SITE_ORIGIN = 'https://applexium.com'

const legalIds = new Set([
  'accessibility',
  'ai-ethics',
  'cookie-policy',
  'esg',
  'privacy-policy',
  'terms-and-conditions',
])

const fail = (msg) => {
  console.error(`verify-dist: ${msg}`)
  process.exitCode = 1
}

// Mirrors src/i18n/index.ts's localePath(). Duplicated (not imported)
// because this script runs under plain Node outside Vite's module graph —
// the source file imports react-router-dom and .json siblings without the
// `with { type: 'json' }` attribute Node requires outside a bundler.
function localePath(lang, slug) {
  const p = slug ? `/${slug}` : '/'
  return lang === 'en' ? `/en${p === '/' ? '' : p}` || '/en' : p
}

// vite.config.ts sets ssgOptions.dirStyle: 'flat', which puts every RO page
// at dist/<slug>.html and every EN page at dist/en/<slug>.html — EXCEPT the
// EN home page (slug === ''), which lands at dist/en.html. There is no
// dist/en/ path segment for an empty slug, so no dist/en/index.html comes
// out of the SSG step itself (gen-sitemap.mjs adds one — see the check
// further down).
function distFileFor(lang, slug) {
  if (lang === 'ro') return `dist/${slug === '' ? 'index' : slug}.html`
  return slug === '' ? 'dist/en.html' : `dist/en/${slug}.html`
}

// The SSR <head> is emitted as a single physical line, so line-oriented
// tools (`grep -c`) either match-or-don't per file rather than per
// occurrence. Count substring occurrences directly instead.
const countOf = (haystack, needle) => haystack.split(needle).length - 1

if (!Array.isArray(pages) || pages.length === 0) fail('src/site/pages.json has no pages')

for (const p of pages) {
  // Task 22: RO and EN of the same page must ship the same *number* of
  // <link rel="stylesheet"> (the live ones swapped in via the preload+onload
  // trick on the home page, or plain links everywhere else) — a mismatch
  // means the vite-react-ssg asymmetry that dropped Home.css's stylesheet
  // link from en.html (componentFor[id]'s shared React.lazy() instance only
  // re-triggers SSR-tracking for whichever language renders first) has
  // regressed. Compared once both languages of this page have been read.
  const stylesheetCountByLang = {}

  for (const lang of ['ro', 'en']) {
    const file = distFileFor(lang, p.slug)
    if (!existsSync(file)) {
      fail(`missing ${file}`)
      continue
    }
    const html = readFileSync(file, 'utf8')
    // Counts both plain `<link rel="stylesheet">` (every page — includes the
    // home page's own <noscript> fallback) and its preload-then-swap variant
    // (`rel="preload" ... as="style"`, home page only) — both are "this page
    // loads this CSS file" signals, just phrased differently depending on
    // whether inline-critical-css.mjs touched this file.
    const plainLinks = html.match(/<link rel="stylesheet"[^>]*>/g) ?? []
    const preloadStyleLinks = html.match(/<link rel="preload"[^>]*as="style"[^>]*>/g) ?? []
    stylesheetCountByLang[lang] = plainLinks.length + preloadStyleLinks.length

    // Anchored on "<html lang=" rather than the brief's bare `lang="${lang}"`:
    // the latter is a substring of `hreflang="ro"`/`hreflang="en"`, which
    // this same document always contains — so it can never actually fail.
    if (!html.includes(`<html lang="${lang}"`)) fail(`${file}: wrong <html lang>`)

    const hasRo = countOf(html, 'rel="alternate" hreflang="ro"') >= 1
    const hasEn = countOf(html, 'rel="alternate" hreflang="en"') >= 1
    const hasXDefault = countOf(html, 'rel="alternate" hreflang="x-default"') >= 1
    if (!hasRo || !hasEn || !hasXDefault) fail(`${file}: hreflang set incomplete`)

    if (countOf(html, 'application/ld+json') < 1) fail(`${file}: no JSON-LD`)
    if (countOf(html, 'rel="canonical"') < 1) fail(`${file}: no canonical`)

    // The Emmi live-widget FAB (#voiceagent-widget-root) is injected into
    // the DOM at runtime by the externally-hosted widget.js (see emmi.tsx) —
    // it never appears in SSR markup, on emmi.html or anywhere else.
    // Confirmed by inspection of the actual build output for all 32 pages.
    if (html.includes('voiceagent-widget-root'))
      fail(`${file}: unexpected "voiceagent-widget-root" in SSR output (widget only ever attaches client-side)`)

    // Task 22 regression guards for scripts/fix-preload.mjs, updated by
    // Task 16b when the three.js reinterpretations (SceneCanvasInner and
    // every *Scene.tsx it mounted — ConvergenceScene/BeamsScene/GalaxyScene)
    // were replaced by verbatim React Bits ports, each lazy-loaded through
    // its own *Canvas chunk (OGL: AuroraCanvas/ThreadsCanvas/GalaxyRBCanvas;
    // R3F: BeamsRBCanvas, which owns its own <Canvas> instead of going
    // through a shared SceneCanvasInner — see BeamsRBCanvas.tsx's own doc
    // comment). None of these must ever be modulepreloaded — each is
    // mounted lazily, well after LCP, by its own *Background wrapper's
    // IntersectionObserver, never during SSR. A modulepreload here means the
    // over-broad vite-react-ssg preload collection this script works around
    // (see its own header comment) has regressed.
    const preloadHrefs = [...html.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1])
    for (const heavy of ['AuroraCanvas-', 'ThreadsCanvas-', 'BeamsRBCanvas-', 'GalaxyRBCanvas-']) {
      if (preloadHrefs.some((h) => h.includes(`/${heavy}`)))
        fail(`${file}: modulepreloads a lazy scene chunk (${heavy}*) — should only load after intersection`)
    }

    if (legalIds.has(p.id)) {
      // Exactly this page's own content chunk, never a sibling id/language's.
      const contentPreloads = preloadHrefs.filter((h) => /\/(accessibility|ai-ethics|cookie-policy|esg|privacy-policy|terms-and-conditions)\.(ro|en)-/.test(h))
      const own = contentPreloads.filter((h) => h.includes(`/${p.id}.${lang}-`))
      if (own.length !== 1) fail(`${file}: expected exactly one modulepreload for ${p.id}.${lang}'s own content chunk, found ${own.length}`)
      if (contentPreloads.length !== own.length)
        fail(`${file}: modulepreloads ${contentPreloads.length - own.length} sibling legal content chunk(s) it doesn't need`)
      // The shared shell (LegalPage/RevealText) must be preloaded for BOTH
      // languages of every id — this is exactly the asymmetry T19 flagged.
      if (!preloadHrefs.some((h) => h.includes('/LegalPage-'))) fail(`${file}: missing LegalPage shell modulepreload`)
    }
  }

  if (stylesheetCountByLang.ro !== undefined && stylesheetCountByLang.en !== undefined) {
    if (stylesheetCountByLang.ro !== stylesheetCountByLang.en) {
      fail(
        `${p.id}: RO/EN stylesheet-link count mismatch (ro=${stylesheetCountByLang.ro}, en=${stylesheetCountByLang.en}) — ` +
          'one language is likely missing its own page CSS (the componentFor[id] shared-lazy-instance asymmetry, see fix-preload.mjs)',
      )
    }
  }
}

// GitHub Pages resolves a trailing-slash URL (the previously-indexed /en/)
// by looking for en/index.html. dirStyle:'flat' never produces one for the
// empty EN slug, so gen-sitemap.mjs copies dist/en.html there as a postbuild
// step. Its own canonical still points at /en (not /en/) — an intentional,
// harmless duplicate, per the coordinator's note.
const enHomeFile = 'dist/en.html'
const enIndexCopy = 'dist/en/index.html'
if (!existsSync(enIndexCopy)) {
  fail(`missing ${enIndexCopy} (GitHub Pages needs a directory index for /en/)`)
} else if (existsSync(enHomeFile) && readFileSync(enIndexCopy, 'utf8') !== readFileSync(enHomeFile, 'utf8')) {
  fail(`${enIndexCopy} must be byte-identical to ${enHomeFile}`)
}

if (!existsSync('dist/CNAME')) fail('missing CNAME')

if (!existsSync('dist/robots.txt')) {
  fail('missing dist/robots.txt')
} else {
  const robots = readFileSync('dist/robots.txt', 'utf8')
  if (!/^Sitemap:/m.test(robots)) fail('dist/robots.txt has no "Sitemap:" line')
}

if (!existsSync('dist/sitemap.xml')) {
  fail('missing sitemap.xml')
} else {
  const sm = readFileSync('dist/sitemap.xml', 'utf8')

  if (sm.includes('/projects')) fail('sitemap must not contain projects')

  if (!sm.trimStart().startsWith('<?xml')) fail('sitemap: missing XML declaration')
  if (countOf(sm, '<urlset') !== 1 || countOf(sm, '</urlset>') !== 1)
    fail('sitemap: missing or duplicate <urlset> root element')

  const openUrls = countOf(sm, '<url>')
  const closeUrls = countOf(sm, '</url>')
  if (openUrls === 0) fail('sitemap: no <url> entries')
  if (openUrls !== closeUrls) fail(`sitemap: unbalanced XML — ${openUrls} <url> vs ${closeUrls} </url>`)

  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (locs.length === 0) fail('sitemap: no <loc> entries')
  for (const loc of locs) if (loc.endsWith('.html')) fail(`sitemap: URL is not a clean path: ${loc}`)

  for (const p of pages.filter((p) => p.inSitemap)) {
    const roUrl = SITE_ORIGIN + localePath('ro', p.slug)
    const enUrl = SITE_ORIGIN + localePath('en', p.slug)
    if (!sm.includes(`<loc>${roUrl}</loc>`)) fail(`sitemap missing RO ${p.slug || '/'}`)
    if (!sm.includes(`<loc>${enUrl}</loc>`)) fail(`sitemap missing EN ${p.slug || '/'}`)
  }
}

if (process.exitCode) process.exit(1)
console.log('verify-dist: OK')
