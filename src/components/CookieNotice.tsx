import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { localePath, t, useLang } from '../i18n'
import { acknowledgeNotice, noticeAcknowledged } from '../site/consent'

/**
 * Cookie notice — informational, not a consent prompt (Law No. 195/2024).
 *
 * The site sets no cookies and loads no analytics or advertising trackers;
 * the only device storage is strictly functional (this notice's own
 * acknowledgement, and the Emmi widget's local "returning visitor" marker
 * used to time its greeting, which never leaves the browser). With nothing
 * optional to refuse, a "Refuse" button would be a fake choice, so the
 * notice only informs and offers "Got it". If an optional tracker is ever
 * added, this must become a real Accept/Refuse banner that loads the
 * tracker only after consent, plus a footer link to reopen it.
 *
 * Client-only (mounted after hydration, so no SSR markup and no hydration
 * mismatch) and `position: fixed` — it never shifts layout (CLS 0). Sits
 * left of the Emmi FAB in the bottom-right corner rather than on top of it.
 * Non-modal: it doesn't steal focus; Escape dismisses it like the button.
 */
export function CookieNotice() {
  const lang = useLang()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!noticeAcknowledged()) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function dismiss() {
    acknowledgeNotice()
    setOpen(false)
  }

  return (
    <div className="cookie-notice-region" aria-live="polite">
      {open && (
        <div
          className="cookie-notice"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-notice-title"
          aria-describedby="cookie-notice-text"
        >
          <p id="cookie-notice-title" className="cookie-notice__label mono-label">
            <span aria-hidden="true">{'// '}</span>
            {t(lang, 'cookieNotice.title')}
          </p>
          <p id="cookie-notice-text" className="cookie-notice__text">
            {t(lang, 'cookieNotice.text')}{' '}
            <Link to={localePath(lang, 'cookie-policy')}>{t(lang, 'cookieNotice.link')}</Link>
          </p>
          <button type="button" className="cookie-notice__ok" onClick={dismiss}>
            {t(lang, 'cookieNotice.ok')}
          </button>
        </div>
      )}
    </div>
  )
}
