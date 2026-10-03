/**
 * Consent bookkeeping for Law No. 195/2024 (RM), in force since 2026-08-23.
 *
 * `POLICY_VERSION` is the version of the privacy + cookie policies a visitor
 * agrees to. It travels with every contact-form submission (Formspree has no
 * server of ours in front of it, so the proof of consent — art. 7(1) — is the
 * submission itself: checkbox value + version + timestamp + the exact text
 * shown) and keys the cookie notice's acknowledgement. Bump it whenever the
 * privacy or cookie policy changes in substance; the notice then reappears.
 */
export const POLICY_VERSION = '2026-10'

/** localStorage key for the cookie notice acknowledgement. */
export const NOTICE_STORAGE_KEY = 'applexium:cookie-notice'

/** Acknowledgement lifetime: 12 months, the ceiling the brief allows. */
export const NOTICE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000

type NoticeRecord = { v: string; at: string }

/** True if the visitor already acknowledged the current notice version
 * less than 12 months ago. Any storage error counts as "not acknowledged". */
export function noticeAcknowledged(now = Date.now()): boolean {
  try {
    const raw = window.localStorage.getItem(NOTICE_STORAGE_KEY)
    if (!raw) return false
    const rec = JSON.parse(raw) as NoticeRecord
    if (rec.v !== POLICY_VERSION) return false
    const at = Date.parse(rec.at)
    return Number.isFinite(at) && now - at < NOTICE_MAX_AGE_MS
  } catch {
    return false
  }
}

export function acknowledgeNotice(now = new Date()): void {
  try {
    const rec: NoticeRecord = { v: POLICY_VERSION, at: now.toISOString() }
    window.localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(rec))
  } catch {
    /* private mode / storage disabled: the notice just shows again next visit */
  }
}
