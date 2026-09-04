import { useEffect } from 'react'

// Values are load-bearing, not decorative: don't change `data-agent-id`
// without coordinating with the Emmi backend, and bump the `?v=` query
// whenever the widget loader's own behaviour changes (phones cache
// widget.js aggressively otherwise). The script itself lives in the
// `voiceagent_v2` repo and is served from app.emmi-agent.com, not here.
export const WIDGET_SRC = 'https://app.emmi-agent.com/widget.js?v=2026062301'
export const WIDGET_AGENT_ID = '06da5340-328a-4a41-a307-f52c3ce6c5de'

/** The loader appends exactly one of these to <body> (closed shadow root
 * inside), so it's the one handle the rest of the site needs. */
export const WIDGET_ROOT_ID = 'voiceagent-widget-root'

/**
 * Mounts the live Emmi widget on every page (2026-09 audit, item 9: the
 * product is the site's own receptionist, not a demo confined to /emmi).
 * Rendered once from SiteLayout, which persists across client-side route
 * changes, so the FAB survives navigation without re-injecting.
 *
 * Client-only and deliberately late: the loader is a third-party script,
 * so it is injected only after `window.load` plus a short idle wait, never
 * competing with the fonts, CSS and hydration the LCP depends on (the
 * 2026-09 speed audit measured that critical path at 1–3 s on a mid-range
 * phone; the widget added to it would push the first paint out further).
 *
 * What the loader does to the DOM (checked live): it appends one
 * `#voiceagent-widget-root` div to <body> — fixed-position, top of the
 * stacking context — and renders the FAB + chat UI into a closed shadow
 * root on it, so removing that div plus the <script> tag is a complete
 * teardown. The cleanup only ever runs if SiteLayout itself unmounts (it
 * doesn't in practice), but it keeps the component honest and testable.
 */
export function EmmiWidget() {
  useEffect(() => {
    let script: HTMLScriptElement | null = null
    let timeoutId: number | undefined
    let cancelled = false

    const inject = () => {
      if (cancelled) return
      script = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = WIDGET_SRC
        script.dataset.agentId = WIDGET_AGENT_ID
        script.defer = true
        document.body.appendChild(script)
      }
    }

    // ~300ms after `load`: enough for the browser to paint and settle
    // hydration work, short enough that a visitor scrolling straight to a
    // CTA finds the FAB already there.
    const scheduleInject = () => {
      timeoutId = window.setTimeout(inject, 300)
    }

    if (document.readyState === 'complete') scheduleInject()
    else window.addEventListener('load', scheduleInject, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', scheduleInject)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      script?.remove()
      document.getElementById(WIDGET_ROOT_ID)?.remove()
    }
  }, [])

  return null
}
