import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  ssgOptions: { dirStyle: 'flat' },
  // Two build-config changes were tried for Task 22's performance pass and
  // measured out, not just skipped — neither is applied:
  //
  // - Critical-CSS inlining via `beasties` (installed as a devDependency,
  //   auto-detected by vite-react-ssg's own `getBeastiesOrCritters` — no
  //   config needed beyond having the package present). It improved FCP
  //   (~3.3s -> ~2.6s on the home page, real-CSS-in-<head> instead of a
  //   render-blocking external stylesheet) but made LCP *worse* (~3.5s ->
  //   ~4.2s) with its default `preloadFonts: true` — 7 extra font preloads
  //   competing with the actual critical path under Lighthouse's simulated
  //   mobile throttling. Disabling `preloadFonts` (ssgOptions.beastiesOptions)
  //   erased the regression but also the FCP win, netting out within
  //   run-to-run noise (Performance 84 -> 82 -> 85 across three runs, no
  //   consistent direction) — not a clear win for the added dependency,
  //   larger per-page HTML (inlined CSS on all 32 pages), and the double
  //   `crossorigin` attribute bug it emits on its own body-end stylesheet
  //   swap. See Task 22's report for the full before/after numbers.
  // - manualChunks for `three`/`@react-three/*` and `gsap`/`lenis` (Plan's
  //   suggestion): grouping those packages into named vendor chunks by
  //   module path made rolldown (this project's build.rollupOptions runs
  //   through rolldown-vite, not classic Rollup — see the `rolldown-runtime`
  //   chunk in every build) fold the resulting `three` chunk into a *static*
  //   import of the main entry (`index.html`'s own manifest `.imports`) and
  //   even of the `react-dom/client` dynamic entry, on every single page —
  //   worse than the pre-fix state this task otherwise closes (T8/T19): a
  //   962KB chunk with zero relation to 3D scenes became unconditionally
  //   eager everywhere, instead of loading only for the four pages that
  //   actually mount a scene. Per-library grep on the unmodified build
  //   already showed no duplication to fix in the first place —
  //   `three`/R3F/postprocessing all live in one shared `SceneCanvasInner`
  //   chunk already (one dynamic import target, deduplicated by the bundler
  //   automatically), same for `gsap`+`lenis` inside the always-loaded
  //   bootstrap.
})
