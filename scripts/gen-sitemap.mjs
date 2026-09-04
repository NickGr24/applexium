// Postbuild step, run after `vite-react-ssg build` and before
// `verify-dist.mjs`: writes dist/sitemap.xml and fixes up one GitHub Pages
// routing gap the SSG step leaves behind for the EN home page.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import pages from '../src/site/pages.json' with { type: 'json' }

const SITE_ORIGIN = 'https://applexium.com'

// Mirrors src/i18n/index.ts's localePath() — see verify-dist.mjs for why
// this is duplicated rather than imported.
function localePath(lang, slug) {
  const p = slug ? `/${slug}` : '/'
  return lang === 'en' ? `/en${p === '/' ? '' : p}` || '/en' : p
}

const xmlEscape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// --- 1. dist/en/index.html -----------------------------------------------
// ssgOptions.dirStyle: 'flat' (vite.config.ts) writes the EN home page to
// dist/en.html, not dist/en/index.html — there's no dist/en/ segment for an
// empty slug. The site's own links only ever point at /en (no trailing
// slash), so that's harmless internally, but the old site had /en/ (with a
// trailing slash) indexed by search engines, and dist/en/ already exists as
// a directory (it holds every other EN page) with no index.html in it — on
// GitHub Pages that resolves to a 404, not a redirect. Ship a literal copy
// of the EN home page at dist/en/index.html so that URL keeps resolving.
// Its canonical/hreflang tags still say /en, which is intentional: a
// duplicate page at a non-canonical URL is safe, an outright 404 isn't.
const enHome = 'dist/en.html'
const enIndexCopy = 'dist/en/index.html'
if (!existsSync(enHome)) {
  console.error(`gen-sitemap: ${enHome} not found — did vite-react-ssg build run first?`)
  process.exit(1)
}
mkdirSync(dirname(enIndexCopy), { recursive: true })
copyFileSync(enHome, enIndexCopy)

// --- 2. dist/sitemap.xml ---------------------------------------------------
const lastmod = new Date(
  process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : Date.now(),
)
  .toISOString()
  .slice(0, 10)

const sitemapPages = pages.filter((p) => p.inSitemap)

const urlEntry = (lang, slug) => {
  const roUrl = SITE_ORIGIN + localePath('ro', slug)
  const enUrl = SITE_ORIGIN + localePath('en', slug)
  const loc = lang === 'ro' ? roUrl : enUrl
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <xhtml:link rel="alternate" hreflang="ro" href="${xmlEscape(roUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(enUrl)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(roUrl)}"/>`,
    '  </url>',
  ].join('\n')
}

// Two <url> entries per page (RO + EN), each carrying xhtml:link alternates
// to both language versions plus x-default — every page with
// `inSitemap: true`. Only the 404 page is excluded; `projects` rejoined the
// sitemap in the 2026-09 audit once it started listing the real case
// studies (it used to be an orphaned placeholder).
const body = sitemapPages.flatMap((p) => [urlEntry('ro', p.slug), urlEntry('en', p.slug)]).join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`

writeFileSync('dist/sitemap.xml', xml)
console.log(`gen-sitemap: wrote dist/sitemap.xml (${sitemapPages.length} pages x 2 languages)`)
console.log(`gen-sitemap: wrote ${enIndexCopy}`)
