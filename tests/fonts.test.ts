import { readdirSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const DIR = 'public/fonts'
// Fontshare already ships Clash Display / General Sans subset to Latin
// (15–23 KB each); JetBrains Mono has to be subset by scripts/subset-fonts.sh
// to land under the same budget. A full-glyph JetBrains Mono is ~92 KB.
const BUDGET_BYTES = 40 * 1024

const woff2Files = () => readdirSync(DIR).filter((f) => f.endsWith('.woff2')).sort()

describe('self-hosted fonts', () => {
  it('every woff2 stays under the 40 KB budget (fonts must be subset)', () => {
    for (const f of woff2Files()) {
      const size = statSync(`${DIR}/${f}`).size
      expect(size, `${f} is ${Math.round(size / 1024)} KB`).toBeLessThanOrEqual(BUDGET_BYTES)
    }
  })

  it('fonts.css references exactly the files that ship in public/fonts', () => {
    const css = readFileSync('src/styles/fonts.css', 'utf8')
    const referenced = [...new Set([...css.matchAll(/\/fonts\/([^'")]+\.woff2)/g)].map((m) => m[1]))].sort()
    expect(referenced).toEqual(woff2Files())
  })
})
