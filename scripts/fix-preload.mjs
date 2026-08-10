// Postbuild step, run right after `vite-react-ssg build` (before
// gen-sitemap.mjs, so its dist/en.html -> dist/en/index.html copy picks up
// the fix too) and before verify-dist.mjs.
//
// Rewrites every dist/**/*.html's <link rel="modulepreload"> AND
// <link rel="stylesheet"> blocks to the *actually* correct set of assets
// that page needs, replacing vite-react-ssg's own computation
// (`collectAssets`/`collectModules` in its shared bundle), which is
// over-broad in a way that matters here — see Task 22's brief and
// docs/superpowers/plans/2026-08-08-applexium-redesign.md for the ledger
// entry this closes.
//
// # The bug this works around
//
// vite-react-ssg preloads every module reachable from a page's SSR-touched
// files, walking BOTH `.imports` *and* `.dynamicImports` in the client
// build's manifest (see `collectModules` in its `node.mjs`). `.dynamicImports`
// is populated by Rollup from every `import()` expression *syntactically
// present* in a module — regardless of whether that particular call site
// ever executes for a given page. Three places in this codebase hit this —
// two found in Task 22's main pass, a third (the CSS side) found afterward
// while wiring up a critical-CSS defer for the home page (see below):
//
//   - `src/pages/legal/LegalPage.tsx` has one `lazy(() => import(...))` per
//     (legal id x language) — 12 total — in its `CONTENT` lookup table, but
//     any single legal page only ever renders ONE of them. Once
//     `LegalPage.tsx` is marked SSR-touched (it is, for whichever language
//     of a given id renders first — the RO route and the `/en` route for
//     the same id literally share one `React.lazy()` instance in
//     `routes.tsx`, so only the first render's tracking mark fires), *all
//     twelve* content chunks get modulepreloaded — ~153KB raw for one
//     visible paragraph's worth of legal text.
//   - Each `src/scenes/*Background.tsx` wrapper (`AuroraBackground`,
//     `ThreadsBackground`, `BeamsRBBackground`, `GalaxyRBBackground` — see
//     Task 16b, which replaced the original example here,
//     `SceneCanvas.tsx`/`SceneCanvasInner.tsx`, with a verbatim React Bits
//     port per product) has one `lazy(() => import('./XCanvas'))` for its
//     actual WebGL mount, gated behind an IntersectionObserver that never
//     fires during SSR (so it never renders server-side on any page), but
//     the wrapper itself is always statically imported (and thus
//     SSR-touched) by every page that uses it, so its one dynamicImport
//     target — `ogl` or three/@react-three/* — got modulepreloaded
//     unconditionally.
//   - The *language that renders second* for a given route id gets the
//     opposite bug, on BOTH the JS and CSS side: since `componentFor[id]`
//     in `routes.tsx` is one shared `React.lazy()` instance reused for both
//     the RO and `/en` route of every id (not just the six legal ones —
//     this applies to every page, `home` included), only whichever
//     language renders first (RO, since `routes.tsx` lists RO paths before
//     EN paths) actually re-triggers that route module's SSR-tracking mark.
//     The second language's SSR pass never re-touches the route module, so
//     it loses *both* the JS preloads AND the `<link rel="stylesheet">` for
//     that page's own CSS (e.g. `en.html` shipped with no stylesheet link
//     for `Home-*.css` at all — confirmed via `dist/.vite/manifest.json`:
//     `Home.tsx`'s own `.css` field is real, and it's a dynamicImports
//     target of `index.html`). The page isn't actually broken — Vite's
//     runtime still injects that CSS via the async JS chunk once it loads,
//     the same way it would for any lazy-loaded route — but that happens
//     *after* hydration starts instead of before first paint, a brief
//     unstyled flash `<link rel="stylesheet">` in the SSR HTML would have
//     avoided.
//
// # The fix
//
// Recompute each page's asset set from the same `dist/.vite/manifest.json`,
// but only ever walk `.imports` (real, always-executed static edges) —
// never `.dynamicImports`. The few genuinely-needed dynamic edges (a page's
// own route chunk; a legal page's own one content chunk) are added
// explicitly, by name, once, instead of discovered by blindly recursing
// into a *possible*-imports list. This is naturally symmetric (RO and EN
// both get computed the same way, so the EN under-preload gap closes for
// both JS and CSS) and naturally excludes every lazy scene chunk from every
// page's preload list.
//
// CSS note: an earlier version of this script deliberately did *not* touch
// `<link rel="stylesheet">`, on the (incomplete) theory that no module in
// the over-broad dynamicImports walk carries its own `.css` — true for the
// legal content chunks and the scene chunks, but not for page-level route
// modules themselves (`Home.tsx`, `emmi.tsx`, ...), which is exactly the
// gap this version closes. That earlier version also existed to avoid
// fighting `beasties` (tried as a devDependency for critical-CSS inlining,
// then rejected — see vite.config.ts and Task 22's report). Since beasties
// isn't installed, there's nothing to conflict with here; if it's ever
// reintroduced, its own stylesheet rewriting and this script's would need
// reconciling again.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import pages from '../src/site/pages.json' with { type: 'json' }

const DIST = 'dist'
const MANIFEST_PATH = join(DIST, '.vite/manifest.json')

if (!existsSync(MANIFEST_PATH)) {
  console.error(`fix-preload: ${MANIFEST_PATH} not found — did vite-react-ssg build run first?`)
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))

function resolve(srcPath) {
  const entry = manifest[srcPath]
  if (!entry) throw new Error(`fix-preload: no manifest entry for "${srcPath}" — did a source file move?`)
  return entry
}

// Walks `.imports` only — real ES module static edges, always executed —
// collecting every reached chunk's own `.file` (JS) and `.css` list.
// Deliberately never touches `.dynamicImports`; see file header.
function staticClosure(srcPaths, jsFiles = new Set(), cssFiles = new Set(), seen = new Set()) {
  for (const srcPath of srcPaths) {
    if (seen.has(srcPath)) continue
    seen.add(srcPath)
    const entry = resolve(srcPath)
    jsFiles.add(entry.file)
    for (const css of entry.css ?? []) cssFiles.add(css)
    staticClosure(entry.imports ?? [], jsFiles, cssFiles, seen)
  }
  return { jsFiles, cssFiles }
}

// Every page shares this one bootstrap: `index.html`'s own static imports
// (react, the i18n `pages` helper, etc.) plus `react-dom/client` — the
// latter is itself only reachable from `index.html` via a dynamicImports
// edge (ViteReactSSG code-splits the hydration entry point), so it needs
// the same explicit, by-name treatment as the per-page edges below. It is
// genuinely needed immediately (hydration can't start without it), unlike
// the lazy scene/content chunks this script excludes — the rule is "walk
// only real edges", not "walk only static edges", and this one dynamic edge
// really does fire on every single page load.
const BOOTSTRAP = staticClosure(['index.html', 'node_modules/react-dom/client.js'])
// `index.html`'s own output (`app-*.js`) is already loaded via the real
// `<script type="module">` tag every page ships — modulepreloading it too
// would just be a harmless but pointless duplicate link for the same file.
BOOTSTRAP.jsFiles.delete(resolve('index.html').file)

// Mirrors `componentFor` in `src/routes.tsx`: the module each page id's
// route actually lazy-imports. Kept as a flat table (like gen-sitemap.mjs
// and verify-dist.mjs already duplicate `localePath`) rather than parsed
// out of routes.tsx, since `resolve()` throws loudly if an id here doesn't
// match a real manifest entry — drift is caught by `npm run build` failing,
// not silently.
const ENTRY_FOR_ID = {
  home: 'src/pages/Home.tsx',
  emmi: 'src/pages/product/emmi.tsx',
  legalia: 'src/pages/product/legalia.tsx',
  precedentia: 'src/pages/product/precedentia.tsx',
  team: 'src/pages/Team.tsx',
  'mircea-ursu': 'src/pages/profile/mircea-ursu.tsx',
  'nichita-griu': 'src/pages/profile/nichita-griu.tsx',
  'diana-tatar': 'src/pages/profile/diana-tatar.tsx',
  projects: 'src/pages/Projects.tsx',
  contacts: 'src/pages/Contacts.tsx',
  accessibility: 'src/pages/legal/LegalPage.tsx',
  'ai-ethics': 'src/pages/legal/LegalPage.tsx',
  'cookie-policy': 'src/pages/legal/LegalPage.tsx',
  esg: 'src/pages/legal/LegalPage.tsx',
  'privacy-policy': 'src/pages/legal/LegalPage.tsx',
  'terms-and-conditions': 'src/pages/legal/LegalPage.tsx',
}
const LEGAL_IDS = new Set([
  'accessibility',
  'ai-ethics',
  'cookie-policy',
  'esg',
  'privacy-policy',
  'terms-and-conditions',
])

// Mirrors verify-dist.mjs's distFileFor().
function distFileFor(lang, slug) {
  if (lang === 'ro') return join(DIST, slug === '' ? 'index.html' : `${slug}.html`)
  return slug === '' ? join(DIST, 'en.html') : join(DIST, 'en', `${slug}.html`)
}

function computeAssetSet(id, lang) {
  const entries = [ENTRY_FOR_ID[id]]
  if (LEGAL_IDS.has(id)) entries.push(`src/pages/legal/content/${id}.${lang}.tsx`)
  const jsFiles = new Set(BOOTSTRAP.jsFiles)
  const cssFiles = new Set(BOOTSTRAP.cssFiles)
  staticClosure(entries, jsFiles, cssFiles)
  return { jsFiles, cssFiles }
}

function renderLinks({ jsFiles, cssFiles }) {
  const js = [...jsFiles].map((f) => `<link rel="modulepreload" crossorigin="" href="/${f}">`)
  const css = [...cssFiles].map((f) => `<link rel="stylesheet" href="/${f}" crossorigin="">`)
  // Stylesheets first: they render-block first paint, while modulepreloads
  // only warm hydration. Listing ~20 JS preloads ahead of the CSS let them
  // win the connection race and measurably delayed FCP/LCP (a ~1.1s LCP hit
  // in a Slow-4G/HTTP1.1 trace; smaller but real over GitHub Pages' h2).
  return [...css, ...js].join('')
}

// The entry script tag (`<script type="module" ... src="...">`) stays
// untouched — only the modulepreload/stylesheet links that follow it are
// replaced.
const MODULEPRELOAD_RE = /<link rel="modulepreload"[^>]*>/g
const STYLESHEET_RE = /<link rel="stylesheet"[^>]*>/g
const ENTRY_SCRIPT_RE = /<script type="module"[^>]*><\/script>/
const CHARSET_RE = /<meta charset[^>]*>/i

function fixHtml(html, id, lang) {
  const before = html
  // vite-react-ssg prepends the whole Head-managed (data-rh) block to <head>,
  // pushing the template's own <meta charset> past the 1024-byte window
  // browsers scan before falling back to encoding sniffing — with Romanian
  // diacritics in the title/description that sit in front of it. Hoist it
  // back to the very first position in <head>.
  const charset = CHARSET_RE.exec(html)?.[0]
  if (charset) html = html.replace(CHARSET_RE, '').replace('<head>', `<head>${charset}`)
  html = html.replace(MODULEPRELOAD_RE, '')
  html = html.replace(STYLESHEET_RE, '')
  const links = renderLinks(computeAssetSet(id, lang))
  const match = ENTRY_SCRIPT_RE.exec(html)
  if (!match) throw new Error(`fix-preload: no entry <script type="module"> found for ${id}/${lang}`)
  const insertAt = match.index + match[0].length
  html = html.slice(0, insertAt) + links + html.slice(insertAt)
  return html === before ? null : html
}

let filesFixed = 0
for (const p of pages) {
  for (const lang of ['ro', 'en']) {
    const file = distFileFor(lang, p.slug)
    if (!existsSync(file)) {
      console.error(`fix-preload: missing ${file}`)
      process.exitCode = 1
      continue
    }
    const html = readFileSync(file, 'utf8')
    const fixed = fixHtml(html, p.id, lang)
    if (fixed) {
      writeFileSync(file, fixed)
      filesFixed++
    }
  }
}

if (process.exitCode) process.exit(1)
console.log(`fix-preload: rewrote modulepreload/stylesheet links in ${filesFixed} file(s)`)
