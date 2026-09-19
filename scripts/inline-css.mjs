// Postbuild step, run right after fix-preload.mjs (which decides WHICH
// stylesheets each page needs) and before gen-sitemap.mjs (so its
// dist/en.html -> dist/en/index.html copy picks this up too).
//
// Inlines every page's stylesheets into one <style> in <head>, so that
// nothing blocks the first paint once the HTML itself has arrived. Together
// with NOT preloading a font (see Seo.tsx), this is what moved mobile
// Lighthouse from 88-92 to 99-100 on every page in the 2026-09-19 pass.
//
// # Why this matters far more than the ~8KB of CSS suggests
//
// Lighthouse (and PageSpeed Insights) load the page unthrottled, record when
// the first paint was *observed*, and then simulate a slow phone from the
// dependency graph: every script that had been downloaded and evaluated
// before that observed paint counts as something FCP and LCP had to wait
// for. On this site the observed first paint landed at DCL + 1s or + 2s
// (1342 / 1910 / 2302ms against a DCL of ~400ms, quantised to whole seconds)
// — by which time all 27 JS chunks and the hydration task were done, so the
// simulation charged all of it to FCP (2.2s) and LCP (3.1s). Same page with
// the site's JS blocked: identical late paint, score 100.
//
// The late paint is a missed first frame. If the document cannot render the
// moment its HTML arrives — an external stylesheet is still one round trip
// away, or a <link rel="preload" as="font"> is holding rendering for its
// short grace period — that first frame is skipped and the next one comes a
// full second later in Lighthouse's Chrome. Measured on a local HTTP/2
// server with production latency (230ms HTML, 45ms assets), 3-4 runs each:
//   A  linked CSS + font preload (what shipped)   88-91, late paint 4/4
//   B  inlined CSS, font preload kept              88-98, late paint 3/4
//   D  linked CSS, no font preload                 88-98, late paint 2/3
//   C  inlined CSS, no font preload               100,    late paint 0/4
// Both halves are required. vite.config.ts records an earlier beasties
// experiment that "netted out within noise": it kept a font preload (and
// added seven more), so it was measuring variant B.
//
// # What it leaves behind
//
// The .css files stay in dist/assets: client-side navigation to another
// route still loads that route's stylesheet through Vite's preload helper.
// That helper skips a stylesheet when the document already has a
// <link rel="stylesheet"> with the same href — so without a marker,
// hydrating the page would download, a second time, the CSS that is already
// inline. The markers are `disabled` links, and they are created by a
// one-line script at the end of <body> rather than written as markup: a
// disabled link in the HTML is still fetched (the preload scanner does not
// look at `disabled`; measured, ~8KB per page for nothing), while one created
// with `disabled` set before `href` never is. The script is synchronous and
// sits before the deferred module entry, so the markers exist by the time
// the helper looks. If a Content-Security-Policy is ever added
// (public/_headers has none today) this script needs a hash in script-src.
// `data-inlined` on the <style> lists the files, in order, for verify-dist's
// RO/EN parity check.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const STYLESHEET_RE = /<link rel="stylesheet" href="(\/assets\/[^"]+\.css)"[^>]*>/g

const htmlFiles = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.html')) htmlFiles.push(p)
  }
}
walk(DIST)

const cssCache = new Map()
const readCss = (href) => {
  if (!cssCache.has(href)) {
    const css = readFileSync(join(DIST, href), 'utf8')
    // Inline CSS resolves url() against the page, not against /assets/, and
    // a literal "</style" would end the element early. Neither occurs today
    // (fonts are root-absolute, the noise texture is a data: URI); fail the
    // build rather than ship a silently broken page if that ever changes.
    // data: URIs are cut out first: the noise texture's SVG carries its own
    // `filter='url(%23n)'`, a fragment inside the image, not a path.
    const withoutDataUris = css.replace(/url\((["'])data:.*?\1\)/gs, '').replace(/url\(data:[^)]*\)/g, '')
    const relative = [...withoutDataUris.matchAll(/url\(\s*['"]?(?!\/|https?:|#)([^'")]+)/g)].map((m) => m[1])
    if (relative.length) throw new Error(`inline-css: ${href} has relative url(${relative[0]}) — it would break once inlined`)
    if (/<\/style/i.test(css)) throw new Error(`inline-css: ${href} contains "</style"`)
    cssCache.set(href, css)
  }
  return cssCache.get(href)
}

let pages = 0
let bytes = 0
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  const hrefs = [...html.matchAll(STYLESHEET_RE)].map((m) => m[1])
  if (hrefs.length === 0) continue

  const css = hrefs.map(readCss).join('')
  const names = hrefs.map((h) => h.split('/').pop()).join(' ')
  const markers =
    `<script data-css-markers>for(const h of ${JSON.stringify(hrefs)}){const l=document.createElement("link");` +
    `l.rel="stylesheet";l.disabled=true;l.href=h;document.head.appendChild(l)}</script>`

  let first = true
  let out = html.replace(STYLESHEET_RE, () => {
    if (!first) return ''
    first = false
    return `<style data-inlined="${names}">${css}</style>`
  })
  if (!out.includes('</body>')) throw new Error(`inline-css: ${file} has no </body>`)
  out = out.replace('</body>', `${markers}</body>`)

  writeFileSync(file, out)
  pages++
  bytes += Buffer.byteLength(css)
}

console.log(`inline-css: inlined stylesheets into ${pages} file(s), ~${Math.round(bytes / pages / 1024)}KB of CSS per page`)
