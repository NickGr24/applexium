# Mircea Ursu 3D Text Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the legacy 3D scroll presentation on `/mircea-ursu`: experience as a rotateY tube carousel, education as a rotateX cylinder wheel, with the current flat lists as the SSR/reduced-motion representation.

**Architecture:** Two self-contained components in `src/pages/profile/` (`TubeCarousel`, `CylinderWheel`), each owning its data list and BOTH representations (flat fallback + 3D). Scroll driving via a tall track + `position: sticky` viewport + one `ScrollTrigger` scrub per component (no GSAP pin, no ScrollSmoother — Lenis already drives ScrollTrigger). Spec: `docs/superpowers/specs/2026-08-12-mircea-3d-text-scroll-design.md`.

**Tech Stack:** React 19, gsap/ScrollTrigger (already a dependency), vite-react-ssg, plain CSS in `mircea-ursu.css`.

## Global Constraints

- `useReducedMotion()` gates ALL motion; SSR/first render must emit the flat lists (it defaults to `true` on the server) — CLAUDE.md's mandatory reduced-motion rule.
- Every i18n string via `t(lang, key)`; NO new i18n keys (all `profiles.mircea.*` keys exist).
- No changes to `pages.json`, `scripts/fix-preload.mjs`, `src/site/meta.ts`.
- Follow `Section.tsx`'s GSAP pattern: `gsap.registerPlugin(ScrollTrigger)` at module top, `useLayoutEffect` gated on `reduced`, kill triggers in cleanup.
- One easing vocabulary: rotation maps linearly to scroll progress (scrub) — no custom curves.
- Verification commands: `npx tsc --noEmit`, `npm test`, `npm run build` (verify-dist must stay green).

---

### Task 1: TubeCarousel (experience)

**Files:**
- Create: `src/pages/profile/TubeCarousel.tsx`
- Modify: `src/pages/profile/mircea-ursu.tsx` (experience section + EXPERIENCE import)
- Modify: `src/pages/profile/mircea-ursu.css` (append tube styles)

**Interfaces:**
- Consumes: `t`, `Lang` from `../../i18n`; `useReducedMotion` from `../../motion/useReducedMotion`.
- Produces: `export function TubeCarousel({ lang }: { lang: Lang })` and `export const EXPERIENCE` (array of 6; `mircea-ursu.tsx` uses `EXPERIENCE.length` for the hero facts).

- [ ] **Step 1: Create the component**

`src/pages/profile/TubeCarousel.tsx`:

```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { t, type Lang } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** Professional path — the same six stops (and `plain` logo split) the flat
 * timeline carried, now owned by the component that renders both
 * representations. `plain: true` mirrors the legacy `.exp-logo.no-bg`:
 * those three logos already sit on their own light ground. */
export const EXPERIENCE = [
  { key: 'applexium', logo: '/logos/applexium-logo.jpg', plain: true },
  { key: 'jurista', logo: '/logos/jurista-logo.jpg', plain: true },
  { key: 'government', logo: '/logos/government-logo.svg', plain: false },
  { key: 'startupmd', logo: '/logos/startup-md-logo.webp', plain: false },
  { key: 'banking', logo: '/logos/maib-bank-logo.svg', plain: true },
  { key: 'payall', logo: '/logos/payall-logo.svg', plain: false },
] as const

/**
 * The legacy site's Codrops "3D Text Scroll" tube, rebuilt for the React
 * page (tutorial: tympanus.net/Tutorials/3DTextScroll/, `Tube` class).
 * Items sit on a ring around the Y axis; a 250vh track with a sticky
 * 100svh viewport scrubs the ring through a full -360° turn (negative so
 * the stops arrive in chronological order).
 *
 * Reduced motion / SSR / no-JS render the flat `.timeline` list instead —
 * the 3D markup only exists after hydration confirms motion is allowed.
 */
export function TubeCarousel({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const ring = ringRef.current
    if (reduced || !track || !ring) return

    const viewport = track.firstElementChild as HTMLElement
    const items = Array.from(ring.children) as HTMLElement[]
    const spacing = 360 / items.length

    // Radius from the sticky viewport's own width (not the window): the
    // ring lives inside `.container`, and a window-derived radius pushes
    // side items past the clipped edge on wide screens.
    const place = () => {
      const radius = Math.min(viewport.clientWidth, window.innerHeight) * 0.42
      items.forEach((item, i) => {
        const angle = (i * spacing * Math.PI) / 180
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        item.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${i * spacing}deg) translateY(-50%)`
      })
    }
    place()

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        ring.style.transform = `rotateZ(12deg) rotateY(${-self.progress * 360}deg)`
      },
    })

    window.addEventListener('resize', place)
    return () => {
      st.kill()
      window.removeEventListener('resize', place)
    }
  }, [reduced])

  if (reduced) {
    return (
      <ol className="timeline">
        {EXPERIENCE.map((item) => (
          <li key={item.key} className="timeline-item">
            <div className={`timeline-item__logo${item.plain ? ' timeline-item__logo--plain' : ''}`}>
              <img src={item.logo} alt="" loading="lazy" decoding="async" />
            </div>
            <div>
              <div className="timeline-item__org">{t(lang, `profiles.mircea.experience.${item.key}.org`)}</div>
              <div className="timeline-item__role mono-label">
                {t(lang, `profiles.mircea.experience.${item.key}.role`)}
              </div>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <div ref={trackRef} className="tube">
      <div className="tube__viewport">
        <ul ref={ringRef} className="tube__ring">
          {EXPERIENCE.map((item) => (
            <li key={item.key} className="tube__item">
              <div className={`tube__logo${item.plain ? ' tube__logo--plain' : ''}`}>
                <img src={item.logo} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="tube__org">{t(lang, `profiles.mircea.experience.${item.key}.org`)}</div>
              <div className="tube__role mono-label">{t(lang, `profiles.mircea.experience.${item.key}.role`)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Append tube styles to `mircea-ursu.css`**

```css
/* ---------- 3D tube carousel (experience) ----------
   Codrops 3D Text Scroll, tube variant — the legacy page's own effect.
   A 250vh track with a sticky viewport; item/ring transforms are written
   inline by TubeCarousel.tsx. Only rendered when motion is allowed —
   reduced-motion/SSR get `.timeline` above instead. */

.tube {
  height: 250vh;
}

.tube__viewport {
  position: sticky;
  top: 0;
  height: 100svh;
  perspective: 1000px;
  overflow: hidden;
}

.tube__ring {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  transform-style: preserve-3d;
  transform-origin: center center;
}

.tube__item {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  text-align: center;
  backface-visibility: hidden;
}

.tube__logo {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  overflow: hidden;
  background: rgb(255 255 255 / 0.06);
  border: 1px solid rgb(255 255 255 / 0.08);
}

.tube__logo img {
  max-width: 72%;
  max-height: 72%;
  object-fit: contain;
}

.tube__logo--plain {
  background: none;
  border: none;
}

.tube__logo--plain img {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.tube__org {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.5rem, 3.2vw, 2.4rem);
  color: var(--ink);
}

.tube__role {
  color: var(--brand-cyan);
}
```

- [ ] **Step 3: Wire into `mircea-ursu.tsx`**

Replace the experience `<Section>`'s `<ol className="timeline">…</ol>` content with `<TubeCarousel lang={lang} />`, delete the local `EXPERIENCE` array, and import it instead:

```tsx
import { EXPERIENCE, TubeCarousel } from './TubeCarousel'
```

The hero `facts` keep using `EXPERIENCE.length`. Also update the file-top doc comment: the list is no longer "flattened into a plain list" — it renders the tube again, with the flat list as the reduced-motion form.

- [ ] **Step 4: Type-check and test**

Run: `npx tsc --noEmit && npm test`
Expected: both clean (no new i18n/meta surface).

- [ ] **Step 5: Browser check (dev server)**

`npm run dev`, open `/mircea-ursu` via chrome-devtools MCP: scrolling through the experience section rotates the carousel through all six stops in order; with reduced-motion emulated (`emulate` → reduced motion or CDP media query) the flat timeline renders. No horizontal document overflow.

- [ ] **Step 6: Commit**

```bash
git add src/pages/profile/TubeCarousel.tsx src/pages/profile/mircea-ursu.tsx src/pages/profile/mircea-ursu.css
git commit -m "Mircea profile: restore 3D tube carousel for experience"
```

---

### Task 2: CylinderWheel (education)

**Files:**
- Create: `src/pages/profile/CylinderWheel.tsx`
- Modify: `src/pages/profile/mircea-ursu.tsx` (education section + EDUCATION import)
- Modify: `src/pages/profile/mircea-ursu.css` (append cylinder styles)

**Interfaces:**
- Consumes: same as Task 1.
- Produces: `export function CylinderWheel({ lang }: { lang: Lang })` and `export const EDUCATION` (array of 4 keys; `mircea-ursu.tsx` uses `EDUCATION.length`).

- [ ] **Step 1: Create the component**

`src/pages/profile/CylinderWheel.tsx`:

```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { t, type Lang } from '../../i18n'
import { useReducedMotion } from '../../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** Academic background — the same four degrees the flat grid carried. */
export const EDUCATION = ['phd', 'llm1', 'llm2', 'llb'] as const

/**
 * Codrops "3D Text Scroll", cylinder variant (legacy `.cylinder__*`):
 * degrees on a ring around the X axis, scrubbed from -80° to 270° so the
 * wheel spins in from below and out over the top while a 200vh track holds
 * the sticky viewport. Reduced motion / SSR render `.education-grid`.
 */
export function CylinderWheel({ lang }: { lang: Lang }) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const ring = ringRef.current
    if (reduced || !track || !ring) return

    const viewport = track.firstElementChild as HTMLElement
    const items = Array.from(ring.children) as HTMLElement[]
    const spacing = 180 / items.length

    const place = () => {
      const radius = Math.min(viewport.clientWidth, window.innerHeight) * 0.42
      items.forEach((item, i) => {
        const angle = (i * spacing * Math.PI) / 180
        const y = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius
        item.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${y}px, ${z}px) rotateX(${i * -spacing}deg)`
      })
    }
    place()

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        ring.style.transform = `rotateX(${-80 + self.progress * 350}deg)`
      },
    })

    window.addEventListener('resize', place)
    return () => {
      st.kill()
      window.removeEventListener('resize', place)
    }
  }, [reduced])

  if (reduced) {
    return (
      <div className="education-grid">
        {EDUCATION.map((key) => (
          <div key={key} className="education-card">
            <div className="education-card__degree">{t(lang, `profiles.mircea.education.${key}.degree`)}</div>
            <div className="education-card__field mono-label">{t(lang, `profiles.mircea.education.${key}.field`)}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={trackRef} className="cylinder">
      <div className="cylinder__viewport">
        <ul ref={ringRef} className="cylinder__ring">
          {EDUCATION.map((key) => (
            <li key={key} className="cylinder__item">
              <span className="cylinder__degree">{t(lang, `profiles.mircea.education.${key}.degree`)}</span>
              <span className="cylinder__field mono-label">{t(lang, `profiles.mircea.education.${key}.field`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Append cylinder styles to `mircea-ursu.css`**

```css
/* ---------- 3D cylinder wheel (education) ----------
   Same tutorial, cylinder variant: a vertical wheel around the X axis.
   Transforms written inline by CylinderWheel.tsx. */

.cylinder {
  height: 200vh;
}

.cylinder__viewport {
  position: sticky;
  top: 0;
  height: 100svh;
  perspective: 1000px;
  overflow: hidden;
}

.cylinder__ring {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  transform-style: preserve-3d;
  transform-origin: center center;
}

.cylinder__item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
  backface-visibility: hidden;
}

.cylinder__degree {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  color: var(--ink);
}

.cylinder__field {
  color: var(--brand-cyan);
}
```

- [ ] **Step 3: Wire into `mircea-ursu.tsx`**

Replace the education `<Section>`'s `.education-grid` content with `<CylinderWheel lang={lang} />`, delete the local `EDUCATION` const, import it from the component:

```tsx
import { CylinderWheel, EDUCATION } from './CylinderWheel'
```

- [ ] **Step 4: Type-check and test**

Run: `npx tsc --noEmit && npm test`
Expected: clean.

- [ ] **Step 5: Browser check**

Scroll `/mircea-ursu` to education: wheel spins through all four degrees; reduced-motion shows the grid. No overlap between the tube's last frame and the cylinder's first (each track is its own section).

- [ ] **Step 6: Commit**

```bash
git add src/pages/profile/CylinderWheel.tsx src/pages/profile/mircea-ursu.tsx src/pages/profile/mircea-ursu.css
git commit -m "Mircea profile: restore 3D cylinder wheel for education"
```

---

### Task 3: Integration verification

**Files:**
- No new files; fixes go to the Task 1/2 files if the checks find defects.

**Interfaces:**
- Consumes: the built page from Tasks 1–2.
- Produces: a verified `dist/` and green build.

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: verify-dist OK. Confirm the static HTML still carries the flat lists' text:

```bash
grep -c "timeline-item\|education-card" dist/mircea-ursu.html dist/en/mircea-ursu.html
```

Expected: non-zero for both files (SSR renders the reduced=true branch).

- [ ] **Step 2: Batched browser round (production preview)**

`npm run preview`; via chrome-devtools MCP inspect `/mircea-ursu` at 1440px and 390px: full scroll-through of both 3D sections, RO + EN, reduced-motion emulation pass, console clean, `document.documentElement.scrollWidth === clientWidth`. Fix everything found in ONE batch, re-verify once.

- [ ] **Step 3: Design detector**

Run: `node ~/.claude/skills/impeccable/scripts/detect.mjs --json src/pages/profile/TubeCarousel.tsx src/pages/profile/CylinderWheel.tsx src/pages/profile/mircea-ursu.css`
Expected: `[]` (or act on findings).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A src/pages/profile && git commit -m "Mircea profile: 3D scroll verification fixes"
```

(Skip if the round found nothing.)
