// Postbuild step, run right after `vite-react-ssg build` (before
// gen-sitemap.mjs, so its dist/en.html -> dist/en/index.html copy picks up
// the fix too) and before verify-dist.mjs.
//
// Rewrites every dist/**/*.html's <link rel="modulepreload"> block to the
// *actually* minimal set of JS chunks that page needs, replacing
// vite-react-ssg's own computation (`collectAssets`/`collectModules` in its
// shared bundle), which is over-broad in a way that matters here — see
// Task 22's brief and docs/superpowers/plans/2026-08-08-applexium-redesign.md
// for the ledger entry this closes.
//
// JS only, deliberately: an earlier version of this script also recomputed
// `<link rel="stylesheet">` tags (the manifest's `collectManifestItemAssets`
// covers `.css` too, in principle the same over-broad walk could pull in
// extra stylesheets) — but no module in this codebase's dynamicImports graph
// actually carries its own `.css` (only page-level modules do, and those are
// always genuinely needed), so there was nothing to fix on the CSS side, and
// keeping that code only made this script fight `beasties` (Task 22 also
// added it as a devDependency, purely by being installed — vite-react-ssg
// auto-detects and runs it, see its own `getBeastiesOrCritters`): beasties
// turns each page's `<link rel="stylesheet">` into an inlined
// `<style>` plus a deferred `<link rel="preload" as="style">` swap, and this
// script blindly re-adding a plain synchronous stylesheet link for the same
// file undid that entirely (loading the CSS twice, once render-blocking).
//
// # The bug this works around
//
// vite-react-ssg preloads every module reachable from a page's SSR-touched
// files, walking BOTH `.imports` *and* `.dynamicImports` in the client
// build's manifest (see `collectModules` in its `node.mjs`). `.dynamicImports`
// is populated by Rollup from every `import()` expression *syntactically
// present* in a module — regardless of whether that particular call site
// ever executes for a given page. Two places in this codebase have a module
// whose SSR-touched file contains several `import()` calls where only one
// (or zero) actually fire per page:
//
//   - `src/pages/legal/LegalPage.tsx` has one `lazy(() => import(...))` per
//     (legal id x language) — 12 total — in its `CONTENT` lookup table, but
//     any single legal page only ever renders ONE of them. Once
//     `LegalPage.tsx` is marked SSR-touched (it is, for whichever language
//     of a given id renders first — the RO route and the `/en` route for
//     the same id literally share one `React.lazy()` instance in
//     `routes.tsx`, so only the first render's tracking mark fires), *all
//     twelve* content chunks get modulepreloaded — ~153KB raw for one
//     visible paragraph's worth of legal text. The language that renders
//     second for a given id gets the opposite bug: since its `LegalPage`
//     lazy component was already resolved by the first language's render,
//     its own SSR pass never re-touches `LegalPage.tsx`, so it *loses* the
//     preload for the shell it does genuinely need (`LegalPage`,
//     `RevealText`, `jsonld`) as well as its own content chunk.
//   - `src/scenes/SceneCanvas.tsx` has one `lazy(() => import('./SceneCanvasInner'))`
//     for the actual R3F `<Canvas>` mount, gated behind an
//     IntersectionObserver that never fires during SSR (see that file's own
//     doc comment) — so it never renders server-side on any page. But
//     `SceneCanvas.tsx` itself *is* statically imported (and thus
//     SSR-touched) by every page that uses it, so its one dynamicImport
//     target — `SceneCanvasInner.tsx`, which alone pulls in `three` +
//     `@react-three/fiber` + `@react-three/postprocessing`, ~880KB raw —
//     gets modulepreloaded unconditionally, and with it whichever specific
//     `*Scene.tsx` module the page's own dynamicImports chain also touches.
//     That's an 880KB parse/compile competing with the actual critical path
//     on every page with a scene, whether or not the scene is anywhere near
//     the fold.
//
// # The fix
//
// Recompute each page's preload set from the same `dist/.vite/manifest.json`,
// but only ever walk `.imports` (real, always-executed static edges) —
// never `.dynamicImports`. The few genuinely-needed dynamic edges (a page's
// own route chunk; a legal page's own one content chunk) are added
// explicitly, by name, once, instead of discovered by blindly recursing
// into a *possible*-imports list. This is naturally symmetric (RO and EN
// both get computed the same way, so the EN under-preload gap closes too)
// and naturally excludes every lazy scene chunk from every page's preload
// list (they were never in anyone's explicit "needed now" set to begin
// with), which is the fix for ledger items T19/T8 both — same root cause,
// per the brief's own hint.
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
// collecting every reached chunk's own `.file`. Deliberately never touches
// `.dynamicImports`; see file header. JS only — see file header for why
// `.css` isn't collected here.
function staticClosure(srcPaths, jsFiles = new Set(), seen = new Set()) {
  for (const srcPath of srcPaths) {
    if (seen.has(srcPath)) continue
    seen.add(srcPath)
    const entry = resolve(srcPath)
    jsFiles.add(entry.file)
    staticClosure(entry.imports ?? [], jsFiles, seen)
  }
  return jsFiles
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
BOOTSTRAP.delete(resolve('index.html').file)

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

function computePreloadSet(id, lang) {
  const entries = [ENTRY_FOR_ID[id]]
  if (LEGAL_IDS.has(id)) entries.push(`src/pages/legal/content/${id}.${lang}.tsx`)
  const jsFiles = new Set(BOOTSTRAP)
  staticClosure(entries, jsFiles)
  return jsFiles
}

function renderLinks(jsFiles) {
  return [...jsFiles].map((f) => `<link rel="modulepreload" crossorigin="" href="/${f}">`).join('')
}

// The entry script tag (`<script type="module" ... src="...">`) stays
// untouched — only the modulepreload links that follow it are replaced.
// CSS `<link>` tags (stylesheet, or beasties' preload-as-style swap) are
// never touched — see file header.
const MODULEPRELOAD_RE = /<link rel="modulepreload"[^>]*>/g
const ENTRY_SCRIPT_RE = /<script type="module"[^>]*><\/script>/

function fixHtml(html, id, lang) {
  const before = html
  html = html.replace(MODULEPRELOAD_RE, '')
  const links = renderLinks(computePreloadSet(id, lang))
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
console.log(`fix-preload: rewrote modulepreload links in ${filesFixed} file(s)`)
