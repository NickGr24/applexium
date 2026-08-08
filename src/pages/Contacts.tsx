import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useLayoutEffect, useRef, useState } from 'react'
import { MonoLabel } from '../components/MonoLabel'
import { RevealText } from '../components/RevealText'
import { Seo } from '../components/Seo'
import { SplitHeading } from '../components/SplitHeading'
import { t, useLang } from '../i18n'
import { useReducedMotion } from '../motion/useReducedMotion'
import { contactPageJsonLd } from '../site/jsonld'
import './contacts.css'

gsap.registerPlugin(DrawSVGPlugin)

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mkoqzdlo'

/** Locale-invariant facts — same convention as `Footer.tsx`'s own `CONTACT`
 * constant and the literals already duplicated in `site/jsonld.ts`: these
 * aren't translation strings, so they don't belong in the i18n dictionaries. */
const CONTACT = {
  email: 'info@applexium.com',
  phone: '+373 78 76 87 65',
  address: 'Mihai Viteazul 2a, Chișinău, Moldova',
}

const ICON = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function IconMail() {
  return (
    <svg {...ICON}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg {...ICON}>
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1.5 1.5 0 0 1 1.5-.35 9.6 9.6 0 0 0 3 .48 1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5h3.2A1.5 1.5 0 0 1 9.7 5a9.6 9.6 0 0 0 .48 3 1.5 1.5 0 0 1-.35 1.5Z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg {...ICON}>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  )
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Split layout: intro + contact facts on the left, the Formspree form on
 * the right. Field `name` attributes match `_legacy/contacts.html`'s
 * `<form>` exactly (`fullName`/`email`/`companyName`/`message`) — Formspree
 * routes on those, so they can't drift even by a character.
 *
 * Submission is intercepted so a successful post can render an inline
 * confirmation instead of leaving the SPA for Formspree's own thank-you
 * page. `action`/`method` stay on the `<form>` regardless, both because
 * that's what a `noscript`/JS-disabled visitor needs and as the literal
 * target the error-path fallback below re-uses.
 */
export default function Contacts() {
  const lang = useLang()
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<Status>('idle')
  const iconRef = useRef<SVGSVGElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const checkRef = useRef<SVGPathElement>(null)

  useLayoutEffect(() => {
    if (status !== 'success' || reduced) return
    if (!iconRef.current || !circleRef.current || !checkRef.current) return

    const tl = gsap.timeline()
    tl.fromTo(
      iconRef.current,
      { scale: 0.5, opacity: 0, transformOrigin: '50% 50%' },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.4)' },
    )
      .fromTo(circleRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'power2.out' }, '-=0.1')
      .fromTo(checkRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'power2.out' }, '-=0.15')

    return () => {
      tl.kill()
    }
  }, [status, reduced])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('submitting')

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`)
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
      // Belt-and-suspenders: if `fetch` itself is what's broken (an
      // ad-blocker or CORS quirk on a third-party host, not a real rejection
      // from Formspree), a plain <form> POST navigation still usually gets
      // through. `form.submit()` — not `.requestSubmit()` — bypasses the
      // `submit` event entirely, so this can't re-enter this handler.
      window.setTimeout(() => form.submit(), 1600)
    }
  }

  return (
    <>
      <Seo page="contacts" lang={lang} jsonLd={[contactPageJsonLd(lang)]} />

      <section className="contacts-page container">
        <div className="contacts-intro">
          <MonoLabel index="01">{t(lang, 'contacts.label')}</MonoLabel>
          <SplitHeading as="h1" className="contacts-intro__title">
            {t(lang, 'contacts.title')}
          </SplitHeading>
          <RevealText>
            <p className="contacts-intro__text">{t(lang, 'contacts.intro')}</p>
          </RevealText>

          <ul className="contacts-info">
            <li className="contacts-info__item">
              <span className="contacts-info__icon">
                <IconMail />
              </span>
              <div className="contacts-info__body">
                <a className="contacts-info__value" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
                <span className="contacts-info__label mono-label">{t(lang, 'contacts.info.emailLabel')}</span>
              </div>
            </li>
            <li className="contacts-info__item">
              <span className="contacts-info__icon">
                <IconPhone />
              </span>
              <div className="contacts-info__body">
                <a className="contacts-info__value" href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}>
                  {CONTACT.phone}
                </a>
                <span className="contacts-info__label mono-label">{t(lang, 'contacts.info.phoneLabel')}</span>
              </div>
            </li>
            <li className="contacts-info__item">
              <span className="contacts-info__icon">
                <IconPin />
              </span>
              <div className="contacts-info__body">
                <span className="contacts-info__value">{CONTACT.address}</span>
                <span className="contacts-info__label mono-label">{t(lang, 'contacts.info.addressLabel')}</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="contacts-panel">
          {status === 'success' ? (
            <div className="form-success" role="status">
              <svg
                ref={iconRef}
                className="form-success__icon"
                viewBox="0 0 64 64"
                width="56"
                height="56"
                aria-hidden="true"
              >
                <circle ref={circleRef} cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="3" />
                <path
                  ref={checkRef}
                  d="M20 33 L28 41 L45 23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="form-success__title">{t(lang, 'contacts.form.successTitle')}</h2>
              <p className="form-success__text">{t(lang, 'contacts.form.successText')}</p>
              <button type="button" className="form-success__reset" onClick={() => setStatus('idle')}>
                {t(lang, 'contacts.form.successReset')}
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              action={FORMSPREE_ENDPOINT}
              method="POST"
              aria-busy={status === 'submitting'}
              onSubmit={handleSubmit}
            >
              <h2 className="contact-form__heading">{t(lang, 'contacts.form.heading')}</h2>

              <div className="field-row">
                <div className="field">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t(lang, 'contacts.form.fullName.placeholder')}
                    autoComplete="name"
                    required
                  />
                  <label htmlFor="fullName">{t(lang, 'contacts.form.fullName.label')}</label>
                </div>
                <div className="field">
                  <input
                    id="workEmail"
                    name="email"
                    type="email"
                    placeholder={t(lang, 'contacts.form.email.placeholder')}
                    autoComplete="email"
                    required
                  />
                  <label htmlFor="workEmail">{t(lang, 'contacts.form.email.label')}</label>
                </div>
              </div>

              <div className="field">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder={t(lang, 'contacts.form.companyName.placeholder')}
                  autoComplete="organization"
                />
                <label htmlFor="companyName">
                  {t(lang, 'contacts.form.companyName.label')}{' '}
                  <span className="field__optional">{t(lang, 'contacts.form.companyName.optional')}</span>
                </label>
              </div>

              <div className="field">
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={t(lang, 'contacts.form.message.placeholder')}
                  required
                />
                <label htmlFor="message">{t(lang, 'contacts.form.message.label')}</label>
              </div>

              <button
                type="submit"
                className="magnetic-btn magnetic-btn--primary contact-form__submit"
                disabled={status === 'submitting'}
              >
                <span className="magnetic-btn__label">
                  {status === 'submitting' ? t(lang, 'contacts.form.sending') : t(lang, 'contacts.form.submit')}
                </span>
              </button>

              {status === 'error' && (
                <p className="contact-form__error" role="alert">
                  {t(lang, 'contacts.form.error')}
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  )
}
