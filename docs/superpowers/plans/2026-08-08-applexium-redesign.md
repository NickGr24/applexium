# Applexium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полный редизайн applexium.com — миграция на React/Vite с пререндером, тёмный иммерсивный техно-мир с 3D-сценами, скролл-сторителлингом и новой типографикой (спека: `docs/superpowers/specs/2026-08-08-applexium-redesign-design.md`).

**Architecture:** Vite + React 19 + `vite-react-ssg` (все маршруты пререндерятся в статический HTML, `dirStyle: 'flat'` — старые URL вида `/emmi.html` продолжают работать). 3D — three.js через @react-three/fiber; скролл и анимации — GSAP (все плагины бесплатны с v3.13) + Lenis. Двуязычность — словари ro/en + зеркальные маршруты `/en/*`. Деплой — GitHub Actions → GitHub Pages.

**Tech Stack:** vite, react 19, react-router-dom, vite-react-ssg, three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, gsap (ScrollTrigger, SplitText, ScrambleTextPlugin), lenis, vitest, TypeScript.

## Global Constraints

- **Работа ведётся в ветке `redesign`** (создать worktree через superpowers:using-git-worktrees). `main` остаётся живым сайтом до задачи cutover. НЕ пушить в `main` до Task 24.
- RO — язык по умолчанию на `/`, EN — на `/en/*`. Каждая страница: свой `<title>`, description, OG, canonical, reciprocal hreflang (`ro`/`en`/`x-default`), JSON-LD с `inLanguage`.
- Палитра: фон `#04060D`, градиент света `#1C1890 → #245EFE → #1FCDFF`, текст `#EDEDF2`. Шрифты самохостятся: Clash Display (display), General Sans (текст), JetBrains Mono (лейблы).
- Каждое движение уважает `prefers-reduced-motion: reduce` (полное отключение анимаций/сцен).
- Виджет Emmi: `https://app.emmi-agent.com/widget.js?v=…` + `data-agent-id="06da5340-328a-4a41-a307-f52c3ce6c5de"` — не менять UUID.
- Контакт-форма: POST на `https://formspree.io/f/mkoqzdlo` — сохранить.
- `projects` исключён из sitemap.xml (намеренно осиротевшая страница).
- Тексты портируются из текущих HTML: RO из корневых `*.html`, EN из `en/*.html`. Контент не переписывается, только адаптируется под новые макеты.
- Мобильная планка: каждая страница презентабельна на iPhone-классе (390×844).
- Коммитить после каждой задачи. Сообщения коммитов — на английском, в стиле репо (см. `git log`).

## Верификация без юнит-тестов

Инфраструктура (i18n, meta, sitemap, dist) покрывается vitest/скриптами — это TDD-задачи. Визуальные компоненты и сцены юнит-тестами не покрываются: их шаг верификации — запуск `npm run dev` + скриншот через playwright/chrome-devtools MCP (в каждой задаче указано, что проверить глазами). Это осознанное решение, не пропуск.

## File Structure (итоговая)

```
package.json, vite.config.ts, tsconfig.json, index.html   # Vite-каркас
public/            # CNAME, robots.txt, favicon*, og-image, все *.webp/png/svg/mp4 ассеты
src/
  main.tsx         # ViteReactSSG entry (+ .html-strip до гидрации)
  routes.tsx       # генерация маршрутов из манифеста (RO + /en)
  site/pages.json  # манифест страниц: id, slug, inSitemap
  site/meta.ts     # title/description/OG per page per lang + JSON-LD
  i18n/ro.json, en.json, index.ts   # словари и useLang/t
  styles/tokens.css, fonts.css, global.css
  layouts/SiteLayout.tsx, LegalLayout.tsx
  components/      # Nav, Footer, Grain, Cursor, MagneticButton, SplitHeading,
                   # MonoLabel, RevealText, StatCount, SpotlightCard, DistortImage, Seo
  motion/LenisProvider.tsx, usePageTransition.ts
  scenes/graphicsTier.ts, SceneCanvas.tsx, HeroWorld.tsx, ConvergenceScene.tsx,
         BeamsScene.tsx, GalaxyScene.tsx
  pages/Home.tsx, product/{ProductPage.tsx,emmi.tsx,legalia.tsx,precedentia.tsx},
        Team.tsx, profile/{Profile.tsx + 3 данных}, Projects.tsx, Contacts.tsx,
        legal/{LegalPage.tsx + 6×2 контент-модулей}
scripts/gen-sitemap.mjs, verify-dist.mjs, fetch-fonts.sh
.github/workflows/deploy.yml
```

Старые файлы (`*.html` в корне, `style.css`, `script.js`, `i18n.js`, `liquid-ether.js`, `scene*.js`, `build-en.py`, `en/`, `en-meta.json`) живут рядом до Task 24 (cutover) — Vite-каркас использует собственный `index.html`, поэтому до cutover старый `index.html` временно переименовывается в `_legacy/index.html` вместе с остальными legacy-файлами (Task 1, только в ветке).

---

### Task 1: Каркас Vite + vite-react-ssg + Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/routes.tsx`, `src/site/pages.json`, `src/pages/Home.tsx`, `vitest.config.ts`
- Move: все legacy-файлы сайта → `_legacy/` (см. шаг 1)

**Interfaces:**
- Produces: `src/site/pages.json` — массив `{ "id": string, "slug": string, "inSitemap": boolean }`; `routes.tsx` экспортирует `routes: RouteRecord[]`; команды `npm run dev | build | test`.

- [ ] **Step 1: Переместить legacy-файлы**

```bash
mkdir -p _legacy
git mv index.html emmi.html legalia.html precedentia.html team.html projects.html contacts.html \
  mircea-ursu.html nichita-griu.html diana-tatar.html accessibility.html ai-ethics.html \
  cookie-policy.html esg.html privacy-policy.html terms-and-conditions.html \
  style.css projects.css script.js i18n.js liquid-ether.js scene.js scene-convergence.js \
  build-en.py en-meta.json en _legacy/
```

- [ ] **Step 2: Инициализировать package.json и поставить зависимости**

```bash
npm pkg set name=applexium-site private=true type=module
npm pkg set scripts.dev="vite" scripts.build="vite-react-ssg build && node scripts/gen-sitemap.mjs && node scripts/verify-dist.mjs" scripts.test="vitest run" scripts.preview="vite preview"
npm i react react-dom react-router-dom vite-react-ssg gsap lenis three @react-three/fiber @react-three/drei @react-three/postprocessing
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/three vitest
```

(`ogl` из старого package.json удалить: `npm rm ogl`.)

- [ ] **Step 3: Написать конфиги и entry**

`vite.config.ts`:
```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  ssgOptions: { dirStyle: 'flat' },
})
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "jsx": "react-jsx", "strict": true, "skipLibCheck": true,
    "resolveJsonModule": true, "types": ["vite/client"], "noEmit": true
  },
  "include": ["src"]
}
```

`index.html` (Vite entry, минимальный — реальные meta придут из `Seo`):
```html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico" />
</head>
<body>
  <div id="root"><!--app-html--></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

`src/site/pages.json` (полный манифест сразу):
```json
[
  { "id": "home", "slug": "", "inSitemap": true },
  { "id": "emmi", "slug": "emmi", "inSitemap": true },
  { "id": "legalia", "slug": "legalia", "inSitemap": true },
  { "id": "precedentia", "slug": "precedentia", "inSitemap": true },
  { "id": "team", "slug": "team", "inSitemap": true },
  { "id": "mircea-ursu", "slug": "mircea-ursu", "inSitemap": true },
  { "id": "nichita-griu", "slug": "nichita-griu", "inSitemap": true },
  { "id": "diana-tatar", "slug": "diana-tatar", "inSitemap": true },
  { "id": "projects", "slug": "projects", "inSitemap": false },
  { "id": "contacts", "slug": "contacts", "inSitemap": true },
  { "id": "accessibility", "slug": "accessibility", "inSitemap": true },
  { "id": "ai-ethics", "slug": "ai-ethics", "inSitemap": true },
  { "id": "cookie-policy", "slug": "cookie-policy", "inSitemap": true },
  { "id": "esg", "slug": "esg", "inSitemap": true },
  { "id": "privacy-policy", "slug": "privacy-policy", "inSitemap": true },
  { "id": "terms-and-conditions", "slug": "terms-and-conditions", "inSitemap": true }
]
```

`src/main.tsx` — **здесь же .html-strip, критично для старых URL**:
```tsx
import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'

export const createRoot = ViteReactSSG({ routes }, ({ isClient }) => {
  if (isClient && location.pathname.endsWith('.html')) {
    // dist собран flat (emmi.html), старые ссылки /emmi.html работают;
    // до создания роутера приводим pathname к чистому виду, чтобы он совпал с маршрутом
    const clean = location.pathname.replace(/(index)?\.html$/, '').replace(/\/$/, '') || '/'
    history.replaceState(null, '', clean + location.search + location.hash)
  }
})
```

`src/routes.tsx` (пока только home, зеркала /en появятся в Task 3):
```tsx
import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'

export const routes: RouteRecord[] = [
  { path: '/', Component: React.lazy(() => import('./pages/Home')) },
]
```

`src/pages/Home.tsx`:
```tsx
export default function Home() {
  return <h1>Applexium</h1>
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node' } })
```

- [ ] **Step 4: Проверить dev и build**

Run: `npm run dev &` → открыть `http://localhost:5173`, увидеть «Applexium». Затем временно упростить build-скрипт (скриптов sitemap/verify ещё нет): `npx vite-react-ssg build`.
Expected: в `dist/` лежит `index.html` с пререндеренным `<h1>Applexium</h1>` (проверить `grep -o "<h1>Applexium</h1>" dist/index.html`).

- [ ] **Step 5: Commit**

```bash
git checkout -b redesign  # если ветка ещё не создана worktree-скиллом
git add -A && git commit -m "Scaffold Vite + vite-react-ssg app; park legacy site in _legacy/"
```

---

### Task 2: Токены, шрифты, глобальные стили, зерно

**Files:**
- Create: `scripts/fetch-fonts.sh`, `public/fonts/*.woff2`, `src/styles/tokens.css`, `src/styles/fonts.css`, `src/styles/global.css`
- Modify: `src/main.tsx` (импорт стилей)

**Interfaces:**
- Produces: CSS-переменные `--bg`, `--ink`, `--brand-deep`, `--brand-blue`, `--brand-cyan`, `--font-display`, `--font-body`, `--font-mono`; классы `.container`, `.mono-label`; глобальный grain-оверлей (`body::after`).

- [ ] **Step 1: Скачать и самохостить шрифты**

`scripts/fetch-fonts.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
mkdir -p public/fonts
css=$(curl -s "https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=general-sans@400,500,600&display=swap")
echo "$css" | grep -o 'https://[^)]*\.woff2' | sort -u | while read -r url; do
  curl -s "$url" -o "public/fonts/$(basename "$url")"
done
# JetBrains Mono (Regular, Medium) из официального репозитория
for w in Regular Medium; do
  curl -sL "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-$w.woff2" \
    -o "public/fonts/JetBrainsMono-$w.woff2"
done
ls -la public/fonts
```
Run: `bash scripts/fetch-fonts.sh` — ожидать ≥7 файлов .woff2. `src/styles/fonts.css`: по одному `@font-face` на файл (family: `Clash Display` 500/600, `General Sans` 400/500/600, `JetBrains Mono` 400/500), все с `font-display: swap`, `src: url('/fonts/…') format('woff2')`. Имена файлов взять из фактического вывода скрипта.

- [ ] **Step 2: tokens.css и global.css**

`src/styles/tokens.css`:
```css
:root {
  --bg: #04060d;
  --bg-raise: #0a0f1d;
  --ink: #ededf2;
  --ink-dim: #8b93a7;
  --brand-deep: #1c1890;
  --brand-blue: #245efe;
  --brand-cyan: #1fcdff;
  --glow: linear-gradient(135deg, var(--brand-deep), var(--brand-blue) 55%, var(--brand-cyan));
  --font-display: 'Clash Display', system-ui, sans-serif;
  --font-body: 'General Sans', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --container: min(92vw, 1440px);
}
```

`src/styles/global.css` — reset (box-sizing, margin 0), `body { background: var(--bg); color: var(--ink); font-family: var(--font-body); }`, selection-цвет, `.container { width: var(--container); margin-inline: auto; }`, `.mono-label { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-dim); }`, и **зерно**:
```css
body::after {
  content: '';
  position: fixed; inset: -100%;
  pointer-events: none; z-index: 9999;
  background-image: url("data:image/png;base64,..."); /* 128×128 монохромный шум, сгенерировать: node -e "…canvas…" или взять tiny-noise PNG, см. шаг */
  opacity: 0.05;
  animation: grain 8s steps(10) infinite;
}
@keyframes grain {
  0%,100% { transform: translate(0,0) } 10% { transform: translate(-5%,-10%) }
  20% { transform: translate(-15%,5%) } 30% { transform: translate(7%,-25%) }
  40% { transform: translate(-5%,25%) } 50% { transform: translate(-15%,10%) }
  60% { transform: translate(15%,0%) } 70% { transform: translate(0%,15%) }
  80% { transform: translate(3%,35%) } 90% { transform: translate(-10%,10%) }
}
@media (prefers-reduced-motion: reduce) { body::after { animation: none } }
```
Шум сгенерировать один раз: `node scripts/gen-noise.mjs` (создать скрипт: 128×128 canvas-less PNG через `Buffer` — либо проще: сгенерировать SVG-шум `<feTurbulence>` как data-URI: `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E")` — этот вариант предпочтителен, нулевой вес).

- [ ] **Step 3: Подключить и проверить**

В `src/main.tsx` добавить импорты `./styles/tokens.css`, `./styles/fonts.css`, `./styles/global.css`. В `Home.tsx` временно вывести h1 с `font-family: var(--font-display)`. Run: `npm run dev`, скриншот через playwright MCP.
Expected: тёмный фон #04060D, заголовок в Clash Display, видимое живое зерно поверх.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Design tokens, self-hosted fonts, grain overlay"
```

---

### Task 3: i18n-ядро и двуязычные маршруты (TDD)

**Files:**
- Create: `src/i18n/ro.json`, `src/i18n/en.json`, `src/i18n/index.ts`, `tests/i18n.test.ts`
- Modify: `src/routes.tsx`

**Interfaces:**
- Produces: `type Lang = 'ro' | 'en'`; `useLang(): Lang` (из pathname); `t(lang, key)` — key вида `'home.hero.title'`, бросает ошибку на отсутствующий ключ; `localePath(lang, slug)` → `'/emmi'` | `'/en/emmi'`; маршруты-зеркала `/en/*` для всех страниц манифеста.

- [ ] **Step 1: Написать падающий тест паритета словарей**

`tests/i18n.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import en from '../src/i18n/en.json'
import ro from '../src/i18n/ro.json'

function flatKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('i18n parity', () => {
  it('ro and en have identical key sets', () => {
    expect(flatKeys(en).sort()).toEqual(flatKeys(ro).sort())
  })
  it('no empty strings', () => {
    for (const dict of [ro, en])
      for (const key of flatKeys(dict))
        expect(key.split('.').reduce((o: any, k) => o[k], dict)).not.toBe('')
  })
})
```

- [ ] **Step 2: Запустить тест — убедиться, что падает** (файлов ro.json/en.json нет)

Run: `npx vitest run tests/i18n.test.ts` → FAIL (cannot resolve import).

- [ ] **Step 3: Создать словари-скелеты и helpers**

`src/i18n/ro.json` / `en.json` — начать с общего блока (наполнение по страницам придёт в задачах страниц; тексты навигации взять из `_legacy/index.html` — RO в тексте элементов, EN в их `data-en`):
```json
{
  "nav": { "services": "Servicii", "products": "Produse", "portfolio": "Portofoliu", "team": "Echipă", "contact": "Contact" },
  "footer": { "rights": "Toate drepturile rezervate." },
  "cta": { "consult": "Programează o consultație", "explore": "Explorează serviciile" }
}
```

`src/i18n/index.ts`:
```ts
import { useLocation } from 'react-router-dom'
import en from './en.json'
import ro from './ro.json'

export type Lang = 'ro' | 'en'
const dicts = { ro, en } as const

export function t(lang: Lang, key: string): string {
  const val = key.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), dicts[lang])
  if (typeof val !== 'string') throw new Error(`i18n: missing key "${key}" for "${lang}"`)
  return val
}

export function useLang(): Lang {
  const { pathname } = useLocation()
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ro'
}

export function localePath(lang: Lang, slug: string): string {
  const p = slug ? `/${slug}` : '/'
  return lang === 'en' ? `/en${p === '/' ? '' : p}` || '/en' : p
}
```

- [ ] **Step 4: Тест зелёный**

Run: `npx vitest run tests/i18n.test.ts` → PASS.

- [ ] **Step 5: Двуязычные маршруты из манифеста**

`src/routes.tsx`:
```tsx
import type { RouteRecord } from 'vite-react-ssg'
import React from 'react'
import pages from './site/pages.json'

const componentFor: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  home: React.lazy(() => import('./pages/Home')),
  // страницы добавляются по мере задач; до тех пор — заглушка
}
const Placeholder = () => null

function pageRoutes(prefix: string): RouteRecord[] {
  return pages.map(p => ({
    path: p.slug === '' ? prefix || '/' : `${prefix}/${p.slug}`,
    Component: componentFor[p.id] ?? Placeholder,
  }))
}

export const routes: RouteRecord[] = [...pageRoutes(''), ...pageRoutes('/en')]
```
(В Task 5 маршруты обернутся в `SiteLayout` c `children`.)

- [ ] **Step 6: Проверить build — обе языковые версии в dist**

Run: `npx vite-react-ssg build && ls dist dist/en`
Expected: `dist/index.html`, `dist/emmi.html`, …, `dist/en/index.html`, `dist/en/emmi.html`, … (16×2 файлов).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "i18n core: ro/en dictionaries with parity test, mirrored /en routes"
```

---

### Task 4: SEO-компонент и карта метаданных (TDD)

**Files:**
- Create: `src/site/meta.ts`, `src/components/Seo.tsx`, `tests/meta.test.ts`

**Interfaces:**
- Consumes: `Lang`, `localePath`, `pages.json`.
- Produces: `pageMeta: Record<PageId, Record<Lang, { title: string; description: string }>>`; `<Seo page="emmi" lang={lang} jsonLd={[…]} />` — рендерит через `Head` из vite-react-ssg: title, description, OG (`og:title/description/image/locale/url`), Twitter, canonical (`https://applexium.com` + localePath), hreflang `ro`/`en`/`x-default`, `<html lang>`, JSON-LD.

- [ ] **Step 1: Падающий тест полноты меты**

`tests/meta.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import pages from '../src/site/pages.json'
import { pageMeta } from '../src/site/meta'

describe('page meta', () => {
  it('every page has ro+en title and description', () => {
    for (const p of pages) {
      for (const lang of ['ro', 'en'] as const) {
        const m = pageMeta[p.id]?.[lang]
        expect(m?.title, `${p.id}/${lang} title`).toBeTruthy()
        expect(m?.description, `${p.id}/${lang} description`).toBeTruthy()
        expect(m!.description.length).toBeGreaterThan(50)
      }
    }
  })
})
```
Run: `npx vitest run tests/meta.test.ts` → FAIL.

- [ ] **Step 2: Заполнить `src/site/meta.ts`**

Источник значений: `<title>`, `<title data-en>`, `<meta name="description">` из корневых `_legacy/*.html` (RO) и `_legacy/en/*.html` (EN). Экспортировать `pageMeta` и `SITE_ORIGIN = 'https://applexium.com'`. Run: тест → PASS.

- [ ] **Step 3: Написать `Seo.tsx`**

```tsx
import { Head } from 'vite-react-ssg'
import { type Lang, localePath } from '../i18n'
import pages from '../site/pages.json'
import { SITE_ORIGIN, pageMeta } from '../site/meta'

export function Seo({ page, lang, jsonLd = [] }: { page: string; lang: Lang; jsonLd?: object[] }) {
  const slug = pages.find(p => p.id === page)!.slug
  const m = pageMeta[page][lang]
  const url = SITE_ORIGIN + localePath(lang, slug)
  return (
    <Head>
      <html lang={lang} />
      <title>{m.title}</title>
      <meta name="description" content={m.description} />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ro" href={SITE_ORIGIN + localePath('ro', slug)} />
      <link rel="alternate" hrefLang="en" href={SITE_ORIGIN + localePath('en', slug)} />
      <link rel="alternate" hrefLang="x-default" href={SITE_ORIGIN + localePath('ro', slug)} />
      <meta property="og:title" content={m.title} />
      <meta property="og:description" content={m.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_ORIGIN}/og-image.png`} />
      <meta property="og:locale" content={lang === 'ro' ? 'ro_RO' : 'en_US'} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Head>
  )
}
```
JSON-LD-объекты (Organization, WebSite, SoftwareApplication, Person, ContactPage, BreadcrumbList) скопировать из соответствующих `_legacy/*.html` в `src/site/jsonld.ts` как функции `(lang) => object`, локализуя `url` и `inLanguage`.

- [ ] **Step 4: Smoke-проверка в build**

Подключить `<Seo page="home" lang={lang} />` в `Home.tsx`. Run: `npx vite-react-ssg build && grep -c 'hreflang' dist/index.html`
Expected: ≥3 (ro, en, x-default); `grep 'lang="en"' dist/en/index.html` находит.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Seo component: per-page meta, hreflang, OG, JSON-LD"
```

---

### Task 5: SiteLayout — навбар, футер, Lenis, переходы страниц, курсор

**Files:**
- Create: `src/layouts/SiteLayout.tsx`, `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/Cursor.tsx`, `src/motion/LenisProvider.tsx`, `src/motion/PageTransition.tsx`, `src/styles/layout.css`
- Modify: `src/routes.tsx` (обернуть все маршруты в layout-route)

**Interfaces:**
- Consumes: `useLang`, `t`, `localePath`.
- Produces: layout-роут с `<Outlet />`; `useReducedMotion(): boolean` (экспорт из `src/motion/useReducedMotion.ts`); CSS-класс `.page` (отступ под фикс-навбар не нужен — навбар поверх).

- [ ] **Step 1: LenisProvider и useReducedMotion**

```tsx
// src/motion/LenisProvider.tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.12 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])
  return <>{children}</>
}
```
`useReducedMotion` — `useSyncExternalStore` над `matchMedia('(prefers-reduced-motion: reduce)')`, SSR-снапшот `true` (на сервере движение не рендерим).

- [ ] **Step 2: Nav + Footer**

`Nav.tsx`: фиксированный, прозрачный поверх контента, blur-подложка после скролла (класс по `scrollY > 40`). Слева лого (`/applexium-logo-horizontal.png` → скопировать в `public/`), по центру/справа ссылки из `t(lang,'nav.*')` на `localePath(lang, slug)`, переключатель RO/EN — две ссылки на `localePath('ro'|'en', текущий slug)` (текущий slug вычислить из pathname). Мобильное меню — полноэкранный оверлей с крупными пунктами (Clash Display), открытие GSAP-таймлайном (пункты по очереди `y: 40→0, stagger 0.05`). `Footer.tsx`: тёмный блок — колонки (продукты, компания, юридические ссылки все 6), контакты, копирайт, mono-лейблы.

- [ ] **Step 3: PageTransition**

`src/motion/PageTransition.tsx`: фикс-оверлей `--bg-raise` с центрированным лого-символом (`/applexium-symbol.png`). На смену `location.key`: шторка закрывается (`scaleY 0→1`, transform-origin bottom, 0.45s var(--ease-out)), скролл в 0, шторка открывается (origin top). При reduced-motion — мгновенная смена. Реализация: локальный state `phase: 'idle'|'cover'|'reveal'`, GSAP-таймлайн в `useLayoutEffect` по `location.key`, дети рендерятся всегда (SSG-вывод не зависит от шторки).

- [ ] **Step 4: Cursor**

`Cursor.tsx`: два фикс-элемента — точка 6px (следует мгновенно) и кольцо 36px (lerp 0.15 через gsap.quickTo). На `mouseover` элементов с `[data-cursor]` или `a, button` кольцо масштабируется 1→1.6 и подсвечивается `--brand-cyan`. Скрыт при `(pointer: coarse)` и reduced-motion. `document.documentElement.classList.add('has-custom-cursor')` → в CSS `html.has-custom-cursor * { cursor: none }`.

- [ ] **Step 5: Собрать SiteLayout и включить в маршруты**

```tsx
// src/layouts/SiteLayout.tsx
import { Outlet } from 'react-router-dom'
import { Cursor } from '../components/Cursor'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { LenisProvider } from '../motion/LenisProvider'
import { PageTransition } from '../motion/PageTransition'

export default function SiteLayout() {
  return (
    <LenisProvider>
      <Nav />
      <PageTransition>
        <main><Outlet /></main>
      </PageTransition>
      <Footer />
      <Cursor />
    </LenisProvider>
  )
}
```
`routes.tsx`: единый корневой роут `{ path: '/', element: <SiteLayout />, entry: 'src/layouts/SiteLayout.tsx', children: [...pageRoutes(''), ...pageRoutes('en')] }` (пути детей относительные: `''`, `'emmi'`, `'en'`, `'en/emmi'`, …).

- [ ] **Step 6: Проверить визуально**

Run: `npm run dev`, playwright: скриншоты `/` и `/en` на 1440×900 и 390×844; кликнуть ссылку — увидеть шторку; открыть мобильное меню.
Expected: навбар/футер на обеих языках, переключатель RO/EN ведёт на зеркальный URL, переход со шторкой, меню анимируется.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Site layout: nav, footer, Lenis, page transitions, custom cursor"
```

---

### Task 6: Библиотека motion-примитивов

**Files:**
- Create: `src/components/SplitHeading.tsx`, `src/components/RevealText.tsx`, `src/components/MonoLabel.tsx`, `src/components/MagneticButton.tsx`, `src/components/StatCount.tsx`, `src/styles/components.css`

**Interfaces:**
- Produces (используется всеми страницами):
  - `<SplitHeading as="h2" className>{text}</SplitHeading>` — построчный reveal из-под маски при входе во вьюпорт (GSAP SplitText + ScrollTrigger).
  - `<RevealText>{children}</RevealText>` — плавный подъём/фейд блока (y: 32→0, opacity, 0.8s) при входе.
  - `<MonoLabel index="01">{children}</MonoLabel>` — моно-лейбл `01 / TEXT`, scramble-эффект при появлении (ScrambleTextPlugin).
  - `<MagneticButton as="a" href variant="primary"|"ghost">{label}</MagneticButton>` — магнит ±12px, glow-градиент `--glow` для primary.
  - `<StatCount value={12} suffix="+" label="proiecte" />` — счётчик от 0 при входе (gsap snap), моно-цифры 3rem+.

- [ ] **Step 1: Реализовать компоненты**

`SplitHeading` (образец паттерна — остальные по аналогии, все через `useReducedMotion` → без анимации просто рендер):
```tsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../motion/useReducedMotion'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function SplitHeading({ as: Tag = 'h2', children, className }: {
  as?: 'h1' | 'h2' | 'h3'; children: string; className?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const reduced = useReducedMotion()
  useLayoutEffect(() => {
    if (reduced || !ref.current) return
    const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines' })
    const tween = gsap.from(split.lines, {
      yPercent: 110, duration: 0.9, stagger: 0.08, ease: 'power4.out',
      scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
    })
    return () => { tween.scrollTrigger?.kill(); split.revert() }
  }, [reduced])
  return <Tag ref={ref} className={className}>{children}</Tag>
}
```
`MagneticButton`: `mousemove` по ссылке → `gsap.quickTo(x/y)` до 12px от центра, `mouseleave` → elastic назад; primary: `background: var(--glow)`, `box-shadow: 0 0 40px rgb(36 94 254 / .35)`; ghost: бордер 1px `--ink-dim`, hover заливка. `MonoLabel`: `gsap.to(el, { scrambleText: { text: original, chars: '01▮/', speed: 0.4 }, duration: 1 })` в ScrollTrigger once. `StatCount`: `gsap.from(obj, { val: 0, snap: 'val', duration: 1.4, onUpdate })`.

- [ ] **Step 2: Витрина для проверки**

Временно смонтировать все примитивы на `Home.tsx` (маркер `{/* DEV SHOWCASE — удалить в Task 14 */}`). Run: dev + playwright-скриншоты до/после скролла.
Expected: заголовки выезжают построчно, лейблы скремблятся, кнопка магнитится, счётчик считает. При эмуляции reduced-motion (`page.emulateMedia`) — всё статично и читаемо.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "Motion primitives: split headings, scramble labels, magnetic buttons, counters"
```

---

### Task 7: SpotlightCard / bento и секционный каркас

**Files:**
- Create: `src/components/SpotlightCard.tsx`, `src/components/Section.tsx`, дополнения в `src/styles/components.css`

**Interfaces:**
- Produces: `<Section id label="SERVICII" index="04" title={…}>{children}</Section>` — секция с mono-шапкой (`<MonoLabel>` + линия), `<SplitHeading>` и контентом; `<SpotlightCard icon title text />` — карточка с радиальным спотлайтом за курсором и 1px-градиентным бордером.

- [ ] **Step 1: SpotlightCard**

CSS-переменные `--mx/--my` обновляются на `mousemove` (без ре-рендера, через `el.style.setProperty`):
```css
.spotlight-card {
  position: relative; overflow: hidden; border-radius: 16px;
  background:
    radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgb(36 94 254 / 0.14), transparent 65%),
    var(--bg-raise);
  border: 1px solid rgb(139 147 167 / 0.15);
  transition: border-color 0.3s;
}
.spotlight-card:hover { border-color: rgb(31 205 255 / 0.4) }
```

- [ ] **Step 2: Section** — `<section id>` c `.container`, шапка: mono-лейбл + `flex`-линия (`border-top` растёт `scaleX 0→1` по ScrollTrigger), заголовок SplitHeading.

- [ ] **Step 3: Проверка + Commit** — добавить в showcase, скриншот; `git add -A && git commit -m "Section chrome and spotlight cards"`

---

### Task 8: graphicsTier и SceneCanvas

**Files:**
- Create: `src/scenes/graphicsTier.ts`, `src/scenes/SceneCanvas.tsx`

**Interfaces:**
- Produces:
  - `graphicsTier(): 'high' | 'lite' | 'static'` — `'static'` при reduced-motion или отсутствии WebGL2; `'lite'` при `(pointer: coarse)` или `navigator.hardwareConcurrency ≤ 4` или `deviceMemory ≤ 4`; иначе `'high'`.
  - `<SceneCanvas tier poster className camera={{…}}>{children}</SceneCanvas>` — при `'static'` рендерит `poster` (CSS-градиент/картинка), иначе лениво (`React.lazy` + IntersectionObserver: маунт при приближении, `frameloop='never'` вне вьюпорта) монтирует R3F `<Canvas dpr={tier === 'high' ? [1, 1.75] : 1}>`. Только клиент: на SSR всегда poster (сцены не пререндерятся — `typeof window` guard).

- [ ] **Step 1: Реализовать оба файла.** `SceneCanvas` также прокидывает `tier` детям через React context (`useSceneTier()`).
- [ ] **Step 2: Проверка**: тестовая сцена (крутящийся куб) на showcase; убедиться, что при `page.emulateMedia({ reducedMotion: 'reduce' })` рендерится poster, и что канвас не монтируется, пока секция далеко за вьюпортом (проверить отсутствие `<canvas>` в DOM до скролла).
- [ ] **Step 3: Commit** — `git add -A && git commit -m "Graphics tiering and lazy scene canvas"`

---

### Task 9: HeroWorld — порт аркады на R3F + скролл-камера

**Files:**
- Create: `src/scenes/HeroWorld.tsx`
- Reference: `_legacy/scene.js` (вся геометрия, свет, значения — оттуда)

**Interfaces:**
- Consumes: `SceneCanvas`, `useSceneTier`.
- Produces: `<HeroWorld progressRef />` — сцена-мир; `progressRef: MutableRefObject<number>` (0..1) — прогресс скролла хиро, двигает камеру вглубь аркады.

- [ ] **Step 1: Портировать геометрию и свет из `_legacy/scene.js`**

Прочитать `_legacy/scene.js` целиком. Воспроизвести в R3F декларативно: fog `FogExp2(0x04060d, 0.052)`; 4 point-light (accent cyan, blue, тёплый «дверной» в глубине `#ffd9a8` z=-22, фиолетовый rim); 2×9 арок (`TorusGeometry(r, th, 10, 26, Math.PI)` + 2 цилиндра, материал `#141c2b` roughness 0.82) через `useMemo`-массив позиций из оригинала; водная гладь: tier `high` — `MeshReflectorMaterial` из drei (`blur={[300, 60]} mixStrength={4} resolution={512}`), tier `lite` — как в оригинале `meshStandardMaterial roughness 0.08 metalness 0.9`; звёзды — drei `<Stars>` или `<points>` из оригинала; сфера-планета и световой столб — по оригиналу. Postprocessing (только high): `<EffectComposer><Bloom intensity={0.6} luminanceThreshold={0.2} /></EffectComposer>`.

- [ ] **Step 2: Камера: параллакс + скролл-долли**

`useFrame`: базовая позиция `z = lerp(14, -18, progressRef.current)` (движение сквозь колоннаду к тёплому свету), `y = lerp(1.2, 0.4, progress)`; поверх — параллакс от курсора (`x += pointer.x * 0.8`, `y += pointer.y * 0.4`, lerp 0.05). На `lite` — без параллакса.

- [ ] **Step 3: Проверка**: страница-песочница на showcase с фейковым прогрессом (input range → progressRef). Скриншоты в трёх позициях прогресса.
Expected: узнаваемая аркада (сравнить с `_directions/LIVE-applexium.png`), отражения на high, движение камеры вглубь без клиппинга арок.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "HeroWorld: arcade scene on R3F with scroll dolly and reflections"`

---

### Task 10: ConvergenceScene (Emmi) — порт

**Files:**
- Create: `src/scenes/ConvergenceScene.tsx`
- Reference: `_legacy/scene-convergence.js`

**Interfaces:**
- Produces: `<ConvergenceScene />` — пять световых потоков (каналы Emmi), сходящихся в пульсирующее ядро; самодостаточная (своя внутренняя анимация, без скролл-прогресса).

- [ ] **Step 1:** Прочитать `_legacy/scene-convergence.js`, воспроизвести на R3F: кривые потоков (`CatmullRomCurve3` → `TubeGeometry` или line points из оригинала), цвета каналов из оригинала, ядро — сфера с эмиссией + Bloom на high. Параллакс курсора как в HeroWorld.
- [ ] **Step 2: Проверка**: showcase-рендер, скриншот, сравнить с текущим `emmi.html` вживую (`python3 -m http.server` в `_legacy`).
- [ ] **Step 3: Commit** — `git add -A && git commit -m "ConvergenceScene port for Emmi hero"`

---

### Task 11: BeamsScene (Legalia) и GalaxyScene (Precedentia)

**Files:**
- Create: `src/scenes/BeamsScene.tsx`, `src/scenes/GalaxyScene.tsx`

**Interfaces:**
- Produces: `<BeamsScene />` — вертикальные световые лучи (правосудие/колонны) в палитре Legalia (подтон из `_legacy/legalia.html` `--lg-*`); `<GalaxyScene />` — поле частиц-«прецедентов» с медленным вращением и глубиной (подтон `--pr-*`).

- [ ] **Step 1:** Получить исходники через reactbits MCP: `get_component Beams` и `get_component Galaxy` (+`get_component_demo` для параметров). Портировать в наши TSX: заменить палитру на токены, убрать пропсы-конфиг, не используемые нами (YAGNI), подключить `useSceneTier` (lite: вдвое меньше частиц/лучей, без постпроцессинга). Если MCP недоступен — реализовать самостоятельно: Beams = 12–20 вертикальных плоскостей с аддитивным градиентным материалом и синусоидальным дыханием яркости; Galaxy = `<points>` 6–15k частиц в спиральном распределении, size attenuation, вращение 0.02 rad/s.
- [ ] **Step 2: Проверка**: showcase, скриншоты обеих сцен на high и lite.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "Beams and Galaxy product scenes"`

---

### Task 12: DistortImage — шейдер-ховер для портфолио и команды

**Files:**
- Create: `src/components/DistortImage.tsx`

**Interfaces:**
- Produces: `<DistortImage src alt className />` — изображение, на ховер плавно искажаемое шейдером (ripple/UV-shift). Внутри — маленький R3F-канвас с планом и кастомным fragment-шейдером; на `(pointer: coarse)`/`static`-tier — обычный `<img>` с CSS scale-hover. Fallback всегда рендерит `<img>` для SSR/SEO (canvas накрывает поверх).

- [ ] **Step 1:** Получить через reactbits MCP `get_component GridDistortion`; адаптировать в одноэлементный вариант (текстура = src, мышь → uniform `uMouse`, интенсивность затухает lerp 0.08). Если MCP недоступен: план-B — plane 1×1, шейдер со смещением UV `uv += dir * strength * smoothstep(0.35, 0.0, dist(uv, uMouse))`.
- [ ] **Step 2: Проверка**: showcase с 2–3 фото команды (`/public/*.webp`), скриншот + ручной ховер.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "DistortImage shader hover"`

---

### Task 13: Ассеты в public/ и robots.txt

**Files:**
- Move/Copy: все изображения из корня (`*.webp`, `*.png`, `*.svg`, `background1.mp4`, favicon-набор, `site.webmanifest`, `og-image.png`, папка `logos/`) → `public/`; `robots.txt` → `public/robots.txt` (внутри обновить `Sitemap: https://applexium.com/sitemap.xml`); `CNAME` → `public/CNAME`.
- Note: скриншоты-артефакты прошлых сессий (`widget-*.jpeg`, `*-rebrand*.png`, `legalia-bugs.png`, `emmi-light.png`, `legalia-light.png`, `mcp-server*.log`, `ondimp.webp` если не используется в портфолио — проверить `grep ondimp _legacy/*.html`) в `public/` НЕ копировать — удалить в Task 24.

- [ ] **Step 1:** Переместить файлы (`git mv`), проверить `npm run dev` — лого в навбаре и фавиконка отдаются.
- [ ] **Step 2: Commit** — `git add -A && git commit -m "Move static assets to public/"`

---

### Task 14: Главная страница

**Files:**
- Rewrite: `src/pages/Home.tsx` (+`src/pages/home.css`)
- Modify: `src/i18n/ro.json`, `src/i18n/en.json` (блок `home.*`)

**Interfaces:**
- Consumes: всё из Task 5–12; тексты: RO из `_legacy/index.html`, EN из `_legacy/en/index.html`.

Структура (по спеке, сверху вниз):

1. **Хиро** — `position: sticky`-обёртка высотой `260vh`: `<SceneCanvas>` c `<HeroWorld progressRef>` на фоне; ScrollTrigger (scrub) пишет прогресс в `progressRef` и параллельно разводит заголовок (три строки `yPercent` в разные стороны + fade). Заголовок: текущий H1 из `_legacy/index.html` («Produse digitale, servicii IT și consultanță…»), Clash Display `clamp(3rem, 9vw, 8.5rem)`, подзаголовок, две CTA (`MagneticButton` primary → contacts, ghost → #servicii), строка клиентов «ÎN UZ LA INJ CMDA …» mono.
2. **Манифест** — `Section` без заголовка: один `<p>` `clamp(1.6rem, 3.4vw, 3rem)`, слова обёрнуты в спаны, opacity 0.25→1 по scrub (текст манифеста: взять вводный абзац секции сервисов из `_legacy/index.html`).
3. **Продукты** — три экрана с pin: контейнер `300vh`, ScrollTrigger pin + snap по третям; фон кроссфейдится между `ConvergenceScene`/`BeamsScene`/`GalaxyScene` (все три смонтированы, opacity через GSAP; на lite — только активная, на static — постеры-градиенты); контент: mono-лейбл (`AGENT AI MULTICANAL` / `PLATFORMĂ JURIDICĂ` / `CĂUTARE PRECEDENTE` — из соответствующих `_legacy/*.html`), имя продукта `clamp(3rem, 8vw, 7rem)`, 2–3 факта, `MagneticButton ghost` → страница продукта.
4. **Сервисы** — `Section index="04" label="SERVICII"`: bento-сетка `SpotlightCard` (2-1-1-2) из карточек текущей секции services (`_legacy/index.html` — заголовки, описания, иконки Font Awesome заменить на инлайн-SVG lucide-стиля или юникод-глифы mono).
5. **Портфолио** — `Section`: горизонтальная лента логотипов клиентов (`public/*.webp`: cmda, dare-eu, energiq, eurobridge, jurista, penitadreptului, startitplanet + ondimp если используется) с бесконечным CSS-marquee (пауза на hover); для крупных кейсов — спокойный CSS-ховер (scale ≤1.06 + brightness), БЕЗ шейдер-искажений (решение пользователя: DistortImage на фото запрещён); ссылка на `/projects`.
6. **Цифры** — ряд `StatCount` (значения из `_legacy/index.html`, секция stats).
7. **CTA-финал** — полноэкранная секция: фон — нижняя часть градиента хиро (`radial-gradient` + зерно), `SplitHeading` с CTA-фразой из футера текущего сайта, `MagneticButton` primary → contacts.

- [ ] **Step 1:** Заполнить `home.*` в обоих словарях (тест паритета не даст разъехаться). Run: `npm run test` → PASS.
- [ ] **Step 2:** Собрать секции 1–2 (хиро + манифест), проверить скролл-хореографию скриншотами в 4 точках скролла (0%, 30%, 60%, 100% хиро).
- [ ] **Step 3:** Собрать секции 3–7. Удалить DEV SHOWCASE.
- [ ] **Step 4: Проверка целиком**: desktop 1440 и mobile 390 скриншоты каждой секции; `npm run build` (без sitemap/verify пока) — `dist/index.html` содержит текст хиро и всех секций (SSR-контент на месте, сцены нет — только постеры). Проверить `/en` версию.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "Home page: hero world, pinned product showcases, bento services, portfolio, stats"`

---

### Task 15: Шаблон продукта + страница Emmi

**Files:**
- Create: `src/pages/product/ProductPage.tsx`, `src/pages/product/emmi.tsx` (+css)
- Modify: словари (`emmi.*`), `src/routes.tsx` (`componentFor`)

**Interfaces:**
- Produces: `<ProductPage scene={<ConvergenceScene/>} accent="#--em" hero={{label, title, sub, ctas}} chapters={ReactNode}>` — общий каркас: полноэкранный хиро со сценой + главы ниже.
- Consumes: контент `_legacy/emmi.html` / `_legacy/en/emmi.html` (структура: hero, каналы, capabilities, guarantees, widget CTA).

- [ ] **Step 1:** `ProductPage` — хиро (сцена фоном, mono-лейбл, `SplitHeading` h1, подзаголовок, CTA-ряд), ниже `{chapters}`.
- [ ] **Step 2:** Emmi: главы из `_legacy/emmi.html` — «пять каналов» (SpotlightCard-ряд с иконками каналов), возможности (Section + RevealText-список), гарантии, финальный CTA-блок виджета. Внизу страницы — embed виджета **точно как в `_legacy/emmi.html`**: `<script src="https://app.emmi-agent.com/widget.js?v=2026050202" data-agent-id="06da5340-328a-4a41-a307-f52c3ce6c5de" defer>` (вставить через `useEffect`-инжект тега, только клиент), CTA-кнопки «Try Emmi Live»: скролл к `#voiceagent-widget-root`, pulse FAB, фолбэк contacts — логика из инлайн-скрипта `_legacy/emmi.html` переносится в компонент.
- [ ] **Step 3: Проверка**: dev-скриншоты desktop/mobile; виджет загрузился (FAB виден), клик CTA скроллит и пульсирует; словари → `npm run test` PASS; `/en/emmi` рендерится.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "Product template and Emmi page with live widget"`

---

### Task 16: Страницы Legalia и Precedentia

**Files:**
- Create: `src/pages/product/legalia.tsx`, `src/pages/product/precedentia.tsx`
- Modify: словари, `componentFor`

- [ ] **Step 1:** Legalia на `ProductPage` со сценой `BeamsScene`: главы из `_legacy/legalia.html` (модули платформы, аудитории, факты) — SpotlightCard/RevealText/StatCount.
- [ ] **Step 2:** Precedentia со сценой `GalaxyScene`: главы из `_legacy/precedentia.html`.
- [ ] **Step 3: Проверка** (скриншоты обе, оба языка, mobile) **+ Commit** — `git add -A && git commit -m "Legalia and Precedentia product pages"`

---

### Task 17: Команда и три профиля

**Files:**
- Create: `src/pages/Team.tsx`, `src/pages/profile/Profile.tsx`, `src/pages/profile/{mircea,nichita,diana}.tsx`
- Modify: словари, `componentFor`

- [ ] **Step 1:** Team: заголовок-Section, сетка карточек с фото (`public/team/*.webp`) со спокойным CSS-ховером (scale ≤1.06 + brightness/оверлей, БЕЗ шейдер-искажений — решение пользователя), имя Clash Display + роль mono; данные из `_legacy/team.html`.
- [ ] **Step 2:** `Profile.tsx` — редакционный шаблон: крупное имя, роль, mono-факты (опыт, специализация), био-абзацы `RevealText`, ссылки (LinkedIn и пр.); три файла данных из `_legacy/{mircea-ursu,nichita-griu,diana-tatar}.html`.
- [ ] **Step 3: Проверка + Commit** — `git add -A && git commit -m "Team grid and profile pages"`

---

### Task 18: Портфолио и Контакты

**Files:**
- Create: `src/pages/Projects.tsx`, `src/pages/Contacts.tsx`
- Modify: словари, `componentFor`

- [ ] **Step 1:** Projects: сетка кейсов из `_legacy/projects.html` (лого + описание), SpotlightCard + спокойный CSS-ховер на изображениях (БЕЗ шейдер-искажений — решение пользователя), без сцены. Страница остаётся вне sitemap (уже так в манифесте).
- [ ] **Step 2:** Contacts: split-макет — слева крупный заголовок + контакты (из `_legacy/contacts.html`), справа форма `action="https://formspree.io/f/mkoqzdlo" method="POST"` с теми же полями/`name`-атрибутами, что в `_legacy/contacts.html`; поля с плавающими лейблами, фокус — подчёркивание `--glow`; состояние отправки: перехват submit → `fetch` на Formspree → инлайн «мультяшное» подтверждение (галочка-анимация GSAP) / ошибка с фолбэком на обычный submit.
- [ ] **Step 3: Проверка** (обе страницы, оба языка, mobile; отправка формы с тестовыми данными НЕ выполняется — только валидация разметки `action`/`name`) **+ Commit** — `git add -A && git commit -m "Projects and contacts pages"`

---

### Task 19: Юридические страницы (6)

**Files:**
- Create: `src/layouts/LegalLayout.tsx`, `src/pages/legal/LegalPage.tsx`, `src/pages/legal/content/{accessibility,ai-ethics,cookie-policy,esg,privacy-policy,terms-and-conditions}.{ro,en}.tsx`
- Modify: `componentFor`

**Interfaces:**
- Produces: `LegalPage({ id })` выбирает контент-модуль по `id` и `lang`. Контент-модули экспортируют `default: () => JSX` (чистые `<h2>/<p>/<ul>`).

- [ ] **Step 1:** LegalLayout: узкая колонка `65ch`, типографика (заголовки Clash Display 500, списки, таблицы), стики-оглавление из `<h2>` слева на desktop. Без WebGL и тяжёлых анимаций (только RevealText на заголовке).
- [ ] **Step 2:** Портировать контент: RO из корневых `_legacy/*.html` (это рендер `docs/*.docx` — не редактировать текст!), EN из `_legacy/en/*.html`. Механически: скопировать innerHTML контентной области, конвертировать в JSX (`class`→`className`).
- [ ] **Step 3: Проверка**: все 6×2 страниц открываются, оглавление работает; `npm run build` — тексты в HTML. **+ Commit** — `git add -A && git commit -m "Legal pages on typographic layout"`

---

### Task 20: Sitemap и verify-dist (TDD через сборку)

**Files:**
- Create: `scripts/gen-sitemap.mjs`, `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: `src/site/pages.json`, `dist/`.
- Produces: `dist/sitemap.xml` (обе языковые версии, hreflang `xhtml:link`, без `projects`); `verify-dist.mjs` — падает с non-zero при нарушении инвариантов.

- [ ] **Step 1: verify-dist.mjs (сначала — это «тест»)**

```js
import { readFileSync, existsSync } from 'node:fs'
import pages from '../src/site/pages.json' with { type: 'json' }

const fail = (msg) => { console.error(`verify-dist: ${msg}`); process.exitCode = 1 }

for (const p of pages) {
  for (const [prefix, lang] of [['', 'ro'], ['en/', 'en']]) {
    const file = `dist/${prefix}${p.slug === '' ? 'index' : p.slug}.html`
    if (!existsSync(file)) { fail(`missing ${file}`); continue }
    const html = readFileSync(file, 'utf8')
    if (!html.includes(`lang="${lang}"`)) fail(`${file}: wrong <html lang>`)
    if (!html.includes('hreflang="ro"') || !html.includes('hreflang="en"') || !html.includes('hreflang="x-default"'))
      fail(`${file}: hreflang set incomplete`)
    if (!html.includes('application/ld+json')) fail(`${file}: no JSON-LD`)
    if (!html.includes('rel="canonical"')) fail(`${file}: no canonical`)
  }
}
if (!existsSync('dist/CNAME')) fail('missing CNAME')
if (!existsSync('dist/sitemap.xml')) fail('missing sitemap.xml')
else {
  const sm = readFileSync('dist/sitemap.xml', 'utf8')
  if (sm.includes('/projects')) fail('sitemap must not contain projects')
  for (const p of pages.filter(p => p.inSitemap))
    if (!sm.includes(`https://applexium.com/${p.slug}`)) fail(`sitemap missing ${p.slug || '/'}`)
}
if (process.exitCode) process.exit(1)
console.log('verify-dist: OK')
```

- [ ] **Step 2:** Запустить `npm run build` → verify падает (нет sitemap). Написать `gen-sitemap.mjs`: для каждого `inSitemap`-page — два `<url>` (RO и EN) с `<xhtml:link rel="alternate" hreflang>` на обе версии + x-default, `lastmod` = дата сборки из `process.env.SOURCE_DATE_EPOCH` или `new Date()`.
- [ ] **Step 3:** `npm run build` целиком → `verify-dist: OK`. Если JSON-LD/canonical где-то отсутствуют — чинить страницы (у каждой должен быть `<Seo>`), не ослаблять проверку.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "Sitemap generation and dist invariant checks"`

---

### Task 21: GitHub Actions деплой

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1:**

```yaml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2:** Commit — `git add -A && git commit -m "GitHub Actions: build, test, deploy to Pages"`. **Не мержить**: workflow сработает после мержа в main (Task 24). Отметить в PR/заметке: в настройках репо Pages → Source переключить на «GitHub Actions» в момент cutover.

---

### Task 22: Перфоманс-проход

**Files:** по результатам аудита (chunk-splitting в `vite.config.ts`, `manualChunks: { three: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'], gsap: ['gsap', 'lenis'] }`)

- [ ] **Step 1:** `npm run build && npx vite preview` → lighthouse-аудит главной и Emmi через chrome-devtools MCP (`lighthouse_audit`), mobile-эмуляция.
- [ ] **Step 2:** Целевые пороги из спеки: главная mobile Perf ≥ 70, юридические ≥ 90, LCP хиро ≤ 2.5s. Типовые фиксы: убедиться, что three-чанк грузится только после LCP (сцены и так lazy), `fetchpriority=high` на лого, `preload` woff2 display-шрифта, `content-visibility: auto` для нижних секций.
- [ ] **Step 3:** Прогнать все страницы на 390×844 (playwright скриншоты) — ничего не разъезжается, нет горизонтального скролла (`document.documentElement.scrollWidth === window.innerWidth`).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "Performance pass: chunking, preloads, mobile fixes"`

---

### Task 23: Полная сверка со спекой + финальное ревью

- [ ] **Step 1:** Пройти чеклист спеки: критерии успеха 1–5, раздел «Что остаётся» (hreflang, JSON-LD, DOCX-синхрон не нарушен, виджет живой, cache-bust политика задокументирована в новом CLAUDE.md — Task 24).
- [ ] **Step 2:** REQUIRED SUB-SKILL: `superpowers:requesting-code-review` — ревью диффа ветки `redesign` целиком. Исправить материальные замечания.
- [ ] **Step 3: Commit** фиксов.

---

### Task 24: Cutover

**Files:**
- Delete: `_legacy/` целиком; артефакты из корня: `widget-*.jpeg`, `*-rebrand*.png`, `legalia-bugs.png`, `emmi-light.png`, `legalia-light.png`, `mcp-server*.log`, `liquid-ether.js` (уже в _legacy), `node_modules` от старого package.json пересоздан.
- Rewrite: `CLAUDE.md`
- Keep: `docs/` (DOCX), `_directions/` (референсы дизайна), `sitemap.xml`/`robots.txt` в корне удалить (теперь генерируются/в public).

- [ ] **Step 1:** Новый `CLAUDE.md`: что это за репо, стек (Vite+React+vite-react-ssg), команды (`npm run dev/build/test`), структура src/, конвенции (словари i18n + тест паритета, Seo на каждой странице, сцены через SceneCanvas + tier, MagneticButton/Section/SplitHeading), деплой (Actions, Pages source = GitHub Actions), правила виджета Emmi (UUID, cache-bust `?v=`), юридические страницы ↔ `docs/*.docx`, `projects` вне sitemap.
- [ ] **Step 2:** Удалить `_legacy/` и мусор, `npm run build` + `npm test` — зелёные.
- [ ] **Step 3:** Merge в `main` (REQUIRED SUB-SKILL: `superpowers:finishing-a-development-branch`). Напомнить пользователю переключить Pages → Source: GitHub Actions.
- [ ] **Step 4:** После деплоя: проверить живой сайт (обе языки, `/emmi.html` старый URL, виджет, sitemap.xml), отчитаться со скриншотами.

---

## Self-Review (выполнено)

- **Spec coverage:** стек/SSG → T1; типографика+палитра+зерно → T2; i18n/URL → T3; SEO → T4, T20; язык движения (Lenis, шторки, курсор, магниты, сплиты, scramble) → T5–T6; карта эффектов (bento/spotlight → T7, distort → T12, сцены → T9–T11); главная 7 секций → T14; продуктовые → T15–T16; команда/профили → T17; портфолио/контакты → T18; юридические → T19; перфоманс/tier/reduced-motion → T8, T22; деплой → T21; CLAUDE.md → T24; критерии успеха → T22–T24.
- **Placeholder scan:** кодовые шаги содержат конкретный код или точный источник (файл в `_legacy/`, компонент reactbits MCP с планом-Б); «по аналогии» используется только внутри одной задачи с полным образцом паттерна.
- **Type consistency:** `Lang`, `t`, `useLang`, `localePath`, `pageMeta`, `Seo`, `SceneCanvas`/`useSceneTier`, `progressRef`, имена компонентов сверены между задачами.
