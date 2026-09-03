# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The marketing site for `applexium.com` — a Moldovan software company. It is a **static-generated React site**: Vite + React 19 + `vite-react-ssg` (route-level static rendering, no server at runtime), Vitest for tests, TypeScript throughout. No custom backend. Hosted on GitHub Pages, deployed via a GitHub Actions workflow (not a manual `git push`-and-wait like the old site).

- Repo: `github.com/NickGr24/applexium`
- Hosting: GitHub Pages with custom domain via `dist/CNAME` (copied from `public/CNAME` at build time) — `applexium.com`
- Deploy: `.github/workflows/deploy.yml` runs on every push to `main` — `npm ci && npm test && npm run build`, then uploads `dist/` as a Pages artifact. **GitHub → Settings → Pages → Source must be set to "GitHub Actions"**, not "Deploy from a branch" — the old static-site setup pointed at `main` directly, and that mode ignores this workflow entirely.
- **TEMPORARY (2026-08-09): Actions are locked by a GitHub billing issue**, so Pages currently deploys from the **`gh-pages` branch** (legacy mode), which holds a built `dist/` snapshot plus `.nojekyll`. Until billing is fixed: to deploy, run `npm run build`, copy `dist/` contents onto the `gh-pages` branch, commit, push. A push to `main` alone does NOT update the live site right now. Once billing is resolved: switch Pages → Source back to "GitHub Actions" and delete this paragraph and the `gh-pages` branch. Warning that caused an outage: in branch mode Pages needs `CNAME` at the published root — publishing raw `main` (where CNAME lives in `public/`) detached the applexium.com domain.
- This replaced an earlier plain-HTML/CSS/JS static site (Python-generated `/en/`, hand-written `style.css`/`script.js`). That version now lives only in git history (see the redesign's plan/spec under `docs/superpowers/`), not in this tree.

## Common workflows

```bash
npm install       # once, or after package.json changes
npm run dev        # Vite dev server with HMR
npm run build       # production build — see "What build does" below
npm test          # Vitest, single run (no watch)
npm run preview      # serve the built dist/ locally, close to production
```

There is no separate lint step; `tsc` type-checking happens implicitly through Vite/your editor, not as its own `npm` script — run `npx tsc --noEmit` by hand when you want a standalone check.

### What `npm run build` does

`vite-react-ssg build` is only the first of four steps chained in the `build` script:

```
vite-react-ssg build   →  scripts/fix-preload.mjs  →  scripts/gen-sitemap.mjs  →  scripts/verify-dist.mjs
```

1. **`vite-react-ssg build`** renders every route in `src/routes.tsx` to static HTML under `dist/`, using `ssgOptions.dirStyle: 'flat'` (`vite.config.ts`) — RO pages land at `dist/<slug>.html`, EN pages at `dist/en/<slug>.html` (EN home is the exception: `dist/en.html`, no `en/` segment for an empty slug).
2. **`scripts/fix-preload.mjs`** rewrites the `<link rel="modulepreload">` / `<link rel="stylesheet">` tags vite-react-ssg emits. Its own file header explains why: vite-react-ssg's asset collector walks Rollup's `dynamicImports` (every `import()` call *syntactically present*, not just the ones that actually run for a given page), which over-preloads legal-page content chunks and the entire `three`/R3F stack on pages that never touch it. Read that file before changing anything about `React.lazy()` boundaries — it silently stops working if a lazy import moves without this table being updated.
3. **`scripts/gen-sitemap.mjs`** writes `dist/sitemap.xml` from `src/site/pages.json` and copies `dist/en.html` → `dist/en/index.html` (GitHub Pages needs a real `index.html` for the `/en/` directory URL).
4. **`scripts/verify-dist.mjs`** is the guard: it asserts a list of invariants across all 32 rendered pages (hreflang completeness, JSON-LD present, canonical present, RO/EN stylesheet-link parity, no lazy scene chunk ever modulepreloaded, legal pages preload exactly their own content chunk, sitemap excludes `/projects`, `dist/en/index.html` byte-identical to `dist/en.html`, etc.) and **exits non-zero, printing every violation**, if any fail.

**If `verify-dist` fails the build, that is a real regression — do not weaken or delete its checks to make the build pass.** It exists specifically because these are the classes of bug that are invisible by eyeballing one page (an EN/RO asymmetry, a missing hreflang tag, an accidentally-eager 900KB three.js chunk) and only show up in production analytics or Lighthouse weeks later. If a check legitimately needs to change — a new page type, a new legal id — update the check's logic to match the new *intended* invariant, and say so in the commit; don't just remove the assertion.

CI (`.github/workflows/deploy.yml`) runs `npm test` before `npm run build`, so a broken test or a broken invariant both block deploy.

## Site structure (`src/`)

```
src/
  routes.tsx           Builds RouteRecord[] for vite-react-ssg from site/pages.json,
                        once per language prefix ('' for RO, 'en' for EN)
  main.tsx              Client entry (hydration)
  site/
    pages.json          The page manifest — id, slug, inSitemap. Single source of
                         truth for routing, sitemap generation, and verify-dist.
                         Add a page here first, then wire routes.tsx + pageMeta.
    meta.ts              Per-page <title>/<meta description>, both languages, keyed
                         by pages.json's `id`. tests/meta.test.ts enforces every
                         page has both languages and description length > 50 chars.
    jsonld.ts            JSON-LD factories (Organization, WebSite, SoftwareApplication,
                          Person, ContactPage, WebPage, BreadcrumbList, LegalPage's own type)
  i18n/
    index.ts             t(lang, key), useLang() (reads /en prefix from the route),
                          localePath(lang, slug). Duplicated (by necessity, see below)
                          in scripts/gen-sitemap.mjs and scripts/verify-dist.mjs.
    ro.json / en.json     Flat-nested string dictionaries. tests/i18n.test.ts enforces
                          identical key sets and no empty strings — CI fails otherwise.
  components/            Seo, Nav, Footer, Cursor, MagneticButton, Section,
                          SplitHeading, RevealText, MonoLabel, SpotlightCard, StatCount
  motion/                LenisProvider, PageTransition, ease.ts, useReducedMotion,
                          useSpotlightPointer
  scenes/                graphicsTier + four *Background/*Canvas pairs (3 OGL, 1 R3F)
  layouts/                SiteLayout (nav/footer/Lenis/transitions/cursor shell),
                          LegalLayout (legal-page chrome)
  pages/                  One file/folder per route: Home, Team, Projects, Contacts,
                          product/{emmi,legalia,precedentia}, profile/{...}, legal/
```

### Routing model — `pages.json` is the manifest, not `routes.tsx`

`src/site/pages.json` is the **single list of pages**: `{ id, slug, inSitemap }`. `routes.tsx`, `scripts/gen-sitemap.mjs`, and `scripts/verify-dist.mjs` all read it and derive their own view (route table, sitemap entries, per-page dist file paths) instead of hand-listing pages three times. **Adding a page means adding it to `pages.json` first**, then:
- a component in `componentFor` (routes.tsx) — or, for a legal page, adding the id to `LEGAL_IDS` and a `content/<id>.ro.tsx` / `content/<id>.en.tsx` pair
- an entry in `pageMeta` (`site/meta.ts`) for both languages (tests/meta.test.ts will fail otherwise)
- an `ENTRY_FOR_ID` mapping in `scripts/fix-preload.mjs` pointing at that page's route module

`localePath(lang, slug)` in `src/i18n/index.ts` is the canonical URL-shape function (`/`, `/en`, `/team`, `/en/team`, ...). It is **duplicated, not imported**, inside `scripts/gen-sitemap.mjs` and `scripts/verify-dist.mjs` — those run under plain Node outside Vite's module graph, so they can't import a `.ts` file that itself imports `react-router-dom`. If you ever change `localePath`'s logic, update all three copies; nothing enforces they stay in sync except discipline and `verify-dist`'s own end-to-end checks.

### i18n — Romanian and English, both hand-maintained

Unlike the old site (RO source + generated `/en/`), **both `src/i18n/ro.json` and `src/i18n/en.json` are hand-written dictionaries**, and every product/legal/profile page's copy comes from `t(lang, 'some.key')` calls, not from `data-en` attributes. **Adding any new user-facing string means adding it to both files** — `tests/i18n.test.ts` asserts the two files have identical (sorted) flattened key sets and fails the whole test suite (and therefore CI) if they diverge. There is no partial-translation fallback at runtime: `t()` throws if a key is missing for the requested language.

`useLang()` derives the active language purely from the URL (`/en` or `/en/...` prefix) — there is no `localStorage` toggle, no client-side re-render of Romanian into English. Switching language is a real navigation to a different route (see `Nav.tsx`'s language switcher), which is what lets `vite-react-ssg` pre-render each language's page independently at build time.

### SEO — one `<Seo>` per page

Every route component renders `<Seo page="<pages.json id>" lang={lang} jsonLd={[...]} />` near the top of its JSX. `Seo.tsx` looks up `pageMeta[page][lang]` and emits `<title>`, description, canonical, the full `ro`/`en`/`x-default` hreflang set, OG/Twitter tags, and the JSON-LD scripts passed in — via `vite-react-ssg`'s `<Head>`, which is what actually gets baked into the static HTML `<head>`. **A new page without a `<Seo>` call will still build, but `verify-dist` will fail it** (missing hreflang/canonical/JSON-LD checks run against every page in `pages.json`, regardless of whether the route renders `<Seo>`).

`projects` is intentionally excluded from `pages.json`'s `inSitemap` (orphaned placeholder content, no inbound links — same rule the old site had) — `gen-sitemap.mjs` filters on that flag, and `verify-dist.mjs` asserts `sitemap.xml` never contains `/projects`. Don't add it back without removing that assertion deliberately.

### 3D scenes — `*Background` + `*Canvas` pairs, `graphicsTier`, always with a poster

`src/scenes/graphicsTier.ts` picks `'static' | 'lite' | 'high'` once per mount, based on `prefers-reduced-motion`, WebGL2 support, pointer coarseness, core count, and `navigator.deviceMemory` where available. Each scene is a pair: a `*Background.tsx` wrapper (always statically imported by its page, SSR-safe) and a `*Canvas.tsx` that the wrapper `React.lazy()`-imports only once the `'static'` tier is ruled out, an `IntersectionObserver` says the section is near the viewport, **and** `window.load` plus an idle callback have fired. The wrapper always renders `poster` (a cheap CSS gradient — see `.scene-poster--*` in `components.css`) as a permanently-mounted base layer under the canvas. **Every scene call site must supply a `poster`** — it's the entire visual for SSR, reduced-motion visitors, no-WebGL2 devices, and the gap before the first WebGL frame. Every `*Canvas` root carries `.scene-canvas__layer`, which fades it in over the poster; keep that on any new scene.

Three scenes are OGL (`AuroraCanvas` hero, `ThreadsCanvas` Emmi, `GalaxyRBCanvas` Precedentia, ~5–8KB each); `BeamsRBCanvas` (Legalia) is the one three.js/R3F scene and costs ~870KB raw. Because of that, `BeamsRBBackground` treats the `'lite'` tier as `'static'` (poster only on phones and low-end machines) — pinned by `tests/scenes.test.tsx`; don't remove that without a cheaper Beams.

Two pitfalls the 2026-09 perf audit found, both still guarded:
- **OGL scene effect dependencies rebuild the WebGL context.** The `*Canvas` main effect (ported verbatim from React Bits) lists every prop, including `dpr`, as a dependency. A default array prop written inline (`focal = [0.5, 0.5]`) or a `dpr` that changes per render tears the context down on every re-render, including the `paused` toggles the wrapper sends on scroll. Defaults live in module constants; never vary a mounted canvas's props from a parent.
- **`ProductShowcase` only keeps the slide being looked at live** (plus the incoming one across a hand-over) on every tier, via the pure `liveSlides()` in `src/pages/home/showcaseLive.ts` (`tests/showcase.test.ts`). Mounting all three at once meant four simultaneous WebGL contexts; the cross-fade survives because canvases fade in over their posters.

### Legal pages — `docs/*.docx` is the source of truth, content is ported mechanically

`src/pages/legal/content/<id>.{ro,en}.tsx` (12 files, one per legal id × language) hold the actual legal text as JSX, ported **mechanically** from the old site's HTML (`class`→`className`, tags closed, inline `style` strings turned into objects) — the text itself is verbatim from the `docs/*.docx` files, not reworded. **Do not edit legal copy directly in the `.tsx` files.** To change legal content: edit the relevant `docs/*.docx`, then re-port the changed text into both the `.ro.tsx` and (translated) `.en.tsx` files by hand, keeping the same mechanical-conversion discipline. `LegalPage.tsx` is the one shared shell (hero, version stamp, icon) all six ids render through — see its own doc comment for why the content is resolved as a single route-level `React.lazy()` per `(id, lang)` (`routes.tsx`'s `legalComponent`) rather than a nested `Suspense` inside `LegalPage` itself: the nested version silently dropped legal text from the static, no-JS HTML output on 5 of 6 pages.

## Motion conventions

- **One easing curve everywhere.** `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` (`tokens.css`) for CSS transitions; `src/motion/ease.ts`'s `easeOut` is the same curve as a GSAP-compatible `(t) => number` function, sampled from the identical bezier control points. Every GSAP tween in this app should use it — don't hand-roll a different curve for a "just this once" animation.
- **No GSAP `pin` on full-viewport stages — use CSS `position: sticky`.** The hero and the product showcase are both sticky stages under a tall track, scrubbed by ScrollTrigger without `pin`. A GSAP pin toggles `position: fixed` at both ends of the track and Chrome's layout-instability API counts each toggle as a full-viewport shift: the 2026-09 audit measured CLS ≈ 2.0 on the home page from the showcase pin alone, invisible to Lighthouse (it never scrolls) but not to real visitors. Sticky is exempt from that accounting.
- **`prefers-reduced-motion` gates are mandatory, not a nice-to-have.** `src/motion/useReducedMotion.ts` (SSR-safe: defaults to `true` on the server and first client render, then re-syncs) backs every motion primitive — `MagneticButton`, `Section`'s reveal, `RevealText`, `SplitHeading`, the scenes via `graphicsTier()`. A new animated component must check `useReducedMotion()` (or `graphicsTier()` for anything WebGL) and fall back to the static/settled state, not just a shorter animation. This isn't a style preference — it's an accessibility requirement the existing components already all honor; don't add the one that doesn't.
- **No shader-based image distortion on photos.** This was tried during the redesign (a `DistortImage`-style WebGL warp effect) and deliberately dropped — an explicit owner decision, not an oversight. Don't reintroduce a distortion/liquid shader over photographic content without raising it first.
- **Motion vocabulary already in place**, reuse before inventing new: Lenis smooth-scroll (`motion/LenisProvider.tsx`, wraps the whole site in `SiteLayout`), route-level curtain transitions (`motion/PageTransition.tsx`), a custom cursor (`components/Cursor.tsx`), magnetic buttons (`components/MagneticButton.tsx`, pointer-attraction on fine-pointer devices only), split-character/word heading reveals (`components/SplitHeading.tsx`), scroll-triggered reveals (`components/RevealText.tsx`, `components/Section.tsx`'s header rule), and a scramble-text effect in `components/MonoLabel.tsx`.

## Emmi product page — live widget integration

`src/pages/product/emmi.tsx` is the only page that mounts the Emmi live demo widget, injected client-side (`useEffect`, not SSR) as a `<script>` tag:

```ts
const WIDGET_SRC = 'https://app.emmi-agent.com/widget.js?v=2026062301'
const WIDGET_AGENT_ID = '06da5340-328a-4a41-a307-f52c3ce6c5de'
```

- The widget script is hosted by the Emmi backend on `app.emmi-agent.com`, **not in this repo**. To change the loader's own behaviour, edit the `voiceagent_v2` repo and redeploy that frontend.
- **Bump the `?v=` query whenever the widget loader's behaviour changes** — phones cache `widget.js` aggressively otherwise, and there's no other cache-bust mechanism.
- The agent UUID `06da5340-…` is the `emmi-demo` agent in the Applexium organisation, production. Don't change it without coordinating with the Emmi backend.
- Because this is now an SPA (not one `<script>` tag per static HTML page), the widget's injection has a matching teardown: navigating away from `/emmi` unmounts the component, whose `useEffect` cleanup removes both the `<script>` tag and the `#voiceagent-widget-root` div the loader appends to `<body>` (closed shadow root, so nothing else needs cleaning up). Re-visiting `/emmi` re-injects fresh. If you touch this effect, keep the remove-on-unmount — without it, the FAB persists (and re-attaches) on every subsequent page after one visit to `/emmi`.
- The two CTAs ("Try Emmi Live"/hero, "Open the Live Widget"/final section) call `useEmmiWidgetTrigger`, which looks for `#voiceagent-widget-root`; if it's not there yet (widget still loading), it falls back to navigating to `/contacts` instead of scrolling to nothing.

## Brand assets — `public/brand/`

`public/brand/*.png` (applexium-{horizontal,vertical,short,symbol}, legalia-{horizontal,short,vertical}) are **monochrome black** PNGs. Dark-background placements (nav, footer, product hero wordmarks on dark heroes) apply `filter: invert(1)` in CSS rather than shipping a second white asset — see `layout.css` (Nav/Footer/PageTransition symbol) and `product/legalia.css`. If you add a new brand mark, follow the same pattern: one black PNG in `public/brand/`, `invert(1)` wherever it needs to render white, instead of exporting light/dark pairs.

## Constraints to keep in mind

- **No server, no API routes.** This is a static build; anything that needs a backend (form submission, the Emmi agent) calls an external service directly from the client.
- **`localePath`/page-manifest triplication is intentional, not an oversight** (see "Routing model" above) — `scripts/*.mjs` run outside Vite's module graph and can't import `.ts` sources that pull in `react-router-dom`. Keep the three copies in sync by hand.
- **Don't hand-edit `dist/`.** It's fully regenerated (and gitignored) by `npm run build`; anything that looks wrong there is a bug upstream in `src/` or `scripts/`.
- **`docs/*.docx` are the source of truth for legal content** (see above) — a PR that only changes `src/pages/legal/content/*.tsx` legal text without a matching docx change should be treated as suspicious.
- **Mobile-first sanity check.** Every page is expected to be presentable on iPhone-class viewports; `Nav.tsx` owns the mobile menu toggle.
- **Reduced-motion and low-tier device paths are real product surface, not edge cases** — a meaningful fraction of "does this work" review should be "does this still work with `prefers-reduced-motion` on, or WebGL2 unavailable," not just the default desktop-Chrome path.

## Common tasks for future Claude instances

- **Editing page copy** → find the `t(lang, '...')` key in the page component, edit the same key in **both** `src/i18n/ro.json` and `src/i18n/en.json`.
- **Editing legal-page copy** → update the source `docs/*.docx` first, then hand-port the changed section into `src/pages/legal/content/<id>.ro.tsx` and `<id>.en.tsx`.
- **Adding a new page** → `src/site/pages.json` entry, `routes.tsx` component wiring, `site/meta.ts` RO+EN entries, `scripts/fix-preload.mjs`'s `ENTRY_FOR_ID`, then `npm run build` (verify-dist will catch anything missed).
- **Bumping the Emmi widget cache-bust** → update the `?v=YYYYMMDDxx` query in `src/pages/product/emmi.tsx`'s `WIDGET_SRC` only. The script content lives in `voiceagent_v2`.
- **Refreshing the self-hosted fonts** → `scripts/fetch-fonts.sh` (needs `pip install fonttools brotli`); it re-downloads and then runs `scripts/subset-fonts.sh`, which cuts JetBrains Mono to Latin + Romanian. Only the Medium weight ships. `tests/fonts.test.ts` fails the suite if any woff2 exceeds 40KB or `fonts.css` and `public/fonts/` disagree — an unsubsetted 92KB re-download can't reach production by accident.
- **Publishing a change** → `git push origin main`; GitHub Actions runs tests + build and deploys automatically. There is no manual "wait 2 minutes" step to remember — check the Actions tab for the run instead.
- **A build fails on `verify-dist`** → read the printed violation(s) first; treat it as a real bug in the page/route/asset wiring, not a check to relax.
