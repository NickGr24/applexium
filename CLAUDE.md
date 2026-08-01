# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The marketing site for `applexium.com` — a Moldovan software company. It is a **static site**, no framework, no build step, no package manager, no tests. Files are served as-is by GitHub Pages.

- Repo: `github.com/NickGr24/applexium` (the `main` branch is what's live)
- Hosting: GitHub Pages with custom domain via `CNAME` (`applexium.com`)
- Deploy: every push to `main` is auto-published in 1–2 minutes
- External dependencies are loaded from CDNs (Google Fonts, Font Awesome 6.4.0, AOS 2.3.1) — there is no `node_modules`

## Common workflows

There is no build, lint, or test pipeline. The only commands you'll typically need:

```bash
# Live preview while editing
python3 -m http.server 8000   # open http://localhost:8000/<page>.html

# Publish a change
git add <files>
git commit -m "..."
git push origin main          # GitHub Pages picks it up
```

Most pages are also viewable directly via `file://` because all asset paths are relative.

## Site structure & page conventions

```
index.html               Landing page (hero, products carousel, services grid)
emmi.html                Emmi product page — embeds the live demo widget
legalia.html             Legalia product page
precedentia.html         Precedentia product page
team.html                Team listing
mircea-ursu.html         Per-person profile
projects.html            Client portfolio
contacts.html            Contact form
{accessibility,ai-ethics,cookie-policy,esg,privacy-policy,terms-and-conditions}.html
                         Legal pages (HTML rendition of /docs/*.docx — keep them in sync)

style.css                Shared layout: navbar, footer, global CSS variables, mobile menu
script.js                Shared JS: AOS.init(), mobile-menu toggle, hero canvas animations
projects.css             Extra styles for projects.html only
liquid-ether.js          Old WebGL fluid effect — currently NOT loaded; CSS gradient blobs
                         replaced it (commit d7df6b9). Don't reintroduce without reason.

docs/                    Source-of-truth DOCX for the six legal pages
```

### CSS namespacing per product page

Each product page sets a `<body class="<name>-page">` and uses a per-page CSS prefix to avoid colliding with sibling pages and `style.css`. The pattern is consistent — follow it for new product pages:

| Page          | Body class           | CSS-var prefix | Class prefix |
| ------------- | -------------------- | -------------- | ------------ |
| emmi          | `.emmi-page`         | `--em-*`       | `.em-*`      |
| legalia       | `.legalia-page`      | `--lg-*`       | `.lg-*`      |
| precedentia   | `.precedentia-page`  | `--pr-*`       | `.pr-*`      |

Page-specific styles live in an **inline `<style>` block inside the HTML head**, not in separate stylesheet files. This keeps each product page self-contained and lets one page's palette override `style.css` defaults without leaking.

### Global brand tokens (defined in `style.css`)

`--primary-teal: #1C1890` · `--accent-light: #1FCDFF` · `--neon-blue: #245EFE` · `--dark-bg: #071116`. Each product page redefines these inside its `<style>` to its own palette. The 2026 rebrand replaced an earlier teal/cyan palette — see commit `1b01bc5`.

### Animations

- **Scroll-triggered fade-ups** use AOS — sprinkle `data-aos="fade-up"` and `data-aos-delay="..."` on elements. `script.js` calls `AOS.init({...})` once at load. Every page that uses AOS imports `aos.css` and `aos.js` from unpkg.
- **Animated gradient backgrounds** are CSS-only (radial-gradients with `filter: blur()` and a slow `@keyframes` translate). The WebGL `liquid-ether.js` was retired for performance reasons; do not pull it back in without a discussion.

## Bilingual system (Romanian default / English alternative)

The site is **Romanian-first**: the pages in the repo root are Romanian and are
the single source of truth. English is **generated**, not hand-maintained, and
lives at its own URLs under `/en/`.

> **This replaces the earlier "no per-language URLs" decision.** English used to
> exist only as a client-side toggle on the same URL, which meant search engines
> never saw it — for a studio selling IT services, English indexing is lead flow.
> Generating `/en/` buys that back without reintroducing the thing that decision
> was protecting against: nobody edits two copies by hand.

How it works:
- **`build-en.py`** is the generator. Run it from the repo root after editing any
  Romanian page:
  ```
  python3 build-en.py
  ```
  It rewrites everything under `en/` from scratch. **Never hand-edit `en/`** —
  the next run overwrites it. It also updates the Romanian sources in place
  (hreflang links + switcher hrefs) and regenerates `sitemap.xml`.
- **Translations still live in `data-en`** on the Romanian pages: each
  translatable element carries `data-en="<English innerHTML>"`, plus the
  attribute variants `data-en-placeholder`, `data-en-aria-label` and
  `<title data-en="…">`. The generator bakes them into real markup.
- **`<meta>` tags have no attribute equivalent**, so their English text lives in
  **`en-meta.json`**, keyed by source filename then by meta `name`/`property`.
  The build **fails loudly** (non-zero exit) if a translatable meta field has no
  entry — that guard exists because Romanian descriptions in English search
  results are invisible until someone reports them.
- **Escaping** inside a `data-en` value (it is an HTML fragment):
  `&`→`&amp;`, `"`→`&quot;`, and `<`/`>`→`&lt;`/`&gt;` for inline tags.
  Put `data-en` on the element that owns the **whole sentence** — if a paragraph
  wraps a link, the attribute belongs on the `<p>`, not the `<a>`, or the
  surrounding words stay Romanian.
- **Switching is by URL, not JS.** The `.lang-switch` group holds two
  `<a class="lang-btn" data-lang-switch="ro|en">` links pointing at the two
  URLs. `i18n.js` is no longer loaded: on a static `/en/` page it would read
  `localStorage['applexium-lang']` and flip the text back to Romanian, out of
  sync with the URL. The file is kept in the repo for reference only.
- **Active state** is still pure CSS off `html[data-lang="…"]`, which the
  generator sets statically per page. `.lang-btn` needs `display: inline-block`
  and `text-decoration: none` now that it is an anchor — those rules live in both
  `style.css` and `projects.css` (**`projects.html` loads `projects.css`, not
  `style.css`**, so switcher rules are duplicated there).

Adding/changing content:
- **New translatable string** → write the Romanian as the element text, add
  `data-en="<English>"` (escaped), then rerun `build-en.py`.
- **New page** → copy `index.html` head/navbar/footer patterns: `<html lang="ro">`,
  the `.nav-actions`/`.lang-switch` block, Romanian `<title data-en>` + meta +
  `og:locale` `ro_RO` (+`en_US` alternate), and a JSON-LD block. Add its English
  meta to `en-meta.json`, add it to `sitemap.xml`, then rerun the generator.
- **Legal pages**: Romanian comes from `docs/*.docx` (source of truth), English
  goes in `data-en`. The old per-page `.legal-lang-toggle` + dual
  `#content-ro`/`#content-en` blocks were retired (the `.legal-lang-toggle` rules
  left in `style.css` are now dead).

SEO surface: every page has `<title>`/description/OG/Twitter in its own language,
JSON-LD structured data (Organization, WebSite, SoftwareApplication, Person,
ContactPage, WebPage, BreadcrumbList, CollectionPage) with `inLanguage` and URLs
localized per version, reciprocal `hreflang` (`ro` / `en` / `x-default`) in both
`<head>` and `sitemap.xml`, and canonical URLs pointing at each version itself.
`sitemap.xml` lists every real page in both languages. `projects.html` is
intentionally excluded from `sitemap.xml` — it is orphaned placeholder content
(no inbound links) — and the generator preserves that exclusion.

## Emmi product page — live widget integration

`emmi.html` is the only page that embeds the Emmi live demo widget. The `<script>` tag near the bottom:

```html
<script src="https://app.emmi-agent.com/widget.js?v=2026050202"
        data-agent-id="06da5340-328a-4a41-a307-f52c3ce6c5de"
        defer></script>
```

- The widget script is hosted by the Emmi backend on `app.emmi-agent.com`, NOT in this repo. To update the widget loader, change code in the `voiceagent_v2` repo and rebuild that frontend.
- **Bump the `?v=` query whenever the widget loader behaviour changes** — phones aggressively cache `widget.js` and the URL never changes otherwise.
- The agent UUID `06da5340-…` corresponds to the `emmi-demo` agent on the Applexium organisation in production. Don't change it without coordinating with the Emmi backend.
- Two CTAs (`Try Emmi Live` and `Open the Live Widget`) are wired via inline JS at the bottom of `emmi.html`. They look for `#voiceagent-widget-root`, scroll to it, and pulse-glow the FAB. If the widget hasn't loaded yet they fall back to the `contacts` page.

## Constraints to keep in mind

- **No bundler.** Don't introduce TypeScript, React, npm packages, or `import`/`export`. Inline scripts or vanilla `<script>` files only.
- **Relative asset paths.** GitHub Pages serves the repo root at `/`, so `href="emmi"` and `src="emmi.png"` work. Avoid absolute `https://applexium.com/...` references inside the site itself.
- **Legal pages must match `/docs/*.docx`.** When editing a legal HTML page, also update its DOCX (or vice-versa) — those `.docx` files are referenced as the source-of-truth in policies.
- **`style.css` is shared.** A change there hits every page. Page-specific overrides go in the inline `<style>` block of that page.
- **Mobile-first sanity check.** Every page is expected to be presentable on iPhone-class viewports. The shared navbar uses a hamburger toggle wired up by `script.js`.

## Common tasks for future Claude instances

- **Editing a product page text/section** → modify the relevant `*.html` directly; reuse existing `.<prefix>-*` classes.
- **Adding a new product page** → copy `emmi.html` or `legalia.html` as a template, choose a new 2-letter prefix and palette, set `<body class="<name>-page">`, link the same `style.css`, AOS, and Font Awesome.
- **Updating navbar / footer** → `style.css` (shared) — verify on at least 3 pages of different lengths.
- **Pushing a copy change to live** → `git push origin main`. Wait ~2 min, then hard-refresh the page on the device.
- **Bumping the Emmi widget cache-bust** → update `?v=YYYYMMDDxx` query in `emmi.html` only. The script content lives elsewhere.
