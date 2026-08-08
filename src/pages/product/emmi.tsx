import { lazy, useCallback, useEffect, type ReactNode } from 'react'
import { MagneticButton } from '../../components/MagneticButton'
import { MonoLabel } from '../../components/MonoLabel'
import { RevealText } from '../../components/RevealText'
import { Section } from '../../components/Section'
import { Seo } from '../../components/Seo'
import { SplitHeading } from '../../components/SplitHeading'
import { SpotlightCard } from '../../components/SpotlightCard'
import { localePath, t, useLang, type Lang } from '../../i18n'
import { CONVERGENCE_CAMERA } from '../../scenes/convergenceCamera'
import { softwareApplicationJsonLd } from '../../site/jsonld'
import { ProductPage } from './ProductPage'
import './emmi.css'

// Dynamic import only — keeps `three`/R3F/postprocessing out of this page's
// own chunk. See ProductShowcase.tsx (home page) for the same pattern, and
// SceneCanvasInner.tsx for why the Suspense boundary doesn't need to live
// here: SceneCanvas already wraps whatever `scene` it's handed.
const ConvergenceScene = lazy(() =>
  import('../../scenes/ConvergenceScene').then(m => ({ default: m.ConvergenceScene })),
)

// Emmi's own palette (`_legacy/emmi.html`'s `--em-vivid`) — the page's
// single "local accent", per ProductPage's `accent` prop.
const ACCENT = '#0891B2'

// Emmi live-demo widget — agent: emmi-demo on the Applexium organisation.
// Values are load-bearing, not decorative: don't change `data-agent-id`
// without coordinating with the Emmi backend, and bump the `?v=` query
// whenever the widget loader's own behaviour changes (phones cache
// widget.js aggressively otherwise). Ported verbatim from the loader tag
// already live on `_legacy/emmi.html`.
const WIDGET_SRC = 'https://app.emmi-agent.com/widget.js?v=2026062301'
const WIDGET_AGENT_ID = '06da5340-328a-4a41-a307-f52c3ce6c5de'

const ICON_BASE = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Generic outline glyphs, not brand marks — same rationale as
 * `home/icons.tsx`. The three messaging channels share one speech-bubble
 * shape, told apart by the same colours `ConvergenceScene`'s five streams
 * already use for them (phone dialer green, Instagram pink, WhatsApp green,
 * Telegram blue), so the row echoes the hero it sits under. */
function PhoneIcon({ color }: { color?: string }) {
  return (
    <svg {...ICON_BASE} style={color ? { color } : undefined}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function WebIcon() {
  return (
    <svg {...ICON_BASE}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M3.5 9.2h17" />
      <circle cx="6.3" cy="7.1" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.4" cy="7.1" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BubbleIcon({ color }: { color: string }) {
  return (
    <svg {...ICON_BASE} style={{ color }}>
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A8 8 0 0 1 4 12Z" />
    </svg>
  )
}

type ChannelKey = 'phone' | 'web' | 'instagram' | 'whatsapp' | 'telegram'

// Colours match ConvergenceScene's STREAMS array exactly (see that file),
// so the row ties visually back to the hero's five converging streams.
const CHANNELS: { key: ChannelKey; icon: ReactNode }[] = [
  { key: 'phone', icon: <PhoneIcon color="#34c759" /> },
  { key: 'web', icon: <WebIcon /> },
  { key: 'instagram', icon: <BubbleIcon color="#dd2a7b" /> },
  { key: 'whatsapp', icon: <BubbleIcon color="#25d366" /> },
  { key: 'telegram', icon: <BubbleIcon color="#2aabee" /> },
]

const CAPABILITY_KEYS = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7'] as const

const GUARANTEE_KEYS = ['speed', 'voice', 'documents', 'connections', 'memory', 'hosting'] as const

function Channels({ lang }: { lang: Lang }) {
  return (
    <Section
      id="channels"
      index="02"
      label={t(lang, 'emmi.channels.label')}
      title={t(lang, 'emmi.channels.title')}
    >
      <p className="emmi-channels__intro">{t(lang, 'emmi.channels.intro')}</p>
      <div className="spotlight-grid">
        {CHANNELS.map(({ key, icon }) => (
          <SpotlightCard
            key={key}
            icon={icon}
            title={t(lang, `emmi.channels.${key}.title`)}
            text={t(lang, `emmi.channels.${key}.text`)}
          />
        ))}
      </div>
    </Section>
  )
}

function Capabilities({ lang }: { lang: Lang }) {
  return (
    <Section index="03" label={t(lang, 'emmi.capabilities.label')} title={t(lang, 'emmi.capabilities.title')}>
      <RevealText>
        <ul className="emmi-capabilities__list">
          {CAPABILITY_KEYS.map(key => (
            <li key={key}>{t(lang, `emmi.capabilities.${key}`)}</li>
          ))}
        </ul>
      </RevealText>
    </Section>
  )
}

function Guarantees({ lang }: { lang: Lang }) {
  return (
    <Section index="04" label={t(lang, 'emmi.guarantees.label')} title={t(lang, 'emmi.guarantees.title')}>
      <div className="spotlight-grid">
        {GUARANTEE_KEYS.map(key => (
          <SpotlightCard
            key={key}
            title={t(lang, `emmi.guarantees.${key}.title`)}
            text={t(lang, `emmi.guarantees.${key}.text`)}
          />
        ))}
      </div>
    </Section>
  )
}

function FinalCta({ lang, onTryWidget }: { lang: Lang; onTryWidget: () => void }) {
  return (
    <section className="product-final">
      <div className="product-final__inner container">
        <MonoLabel index="05">{t(lang, 'emmi.final.label')}</MonoLabel>
        <SplitHeading as="h2" className="product-final__title">
          {t(lang, 'emmi.final.title')}
        </SplitHeading>
        <RevealText>
          <p className="product-final__text">{t(lang, 'emmi.final.text')}</p>
        </RevealText>
        <div className="product-final__ctas">
          <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
            {t(lang, 'emmi.final.cta1')}
          </MagneticButton>
          <MagneticButton as="button" variant="ghost" onClick={onTryWidget}>
            {t(lang, 'emmi.final.cta2')}
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

/**
 * "Try Emmi Live" / "Open the Live Widget" — ported from the inline
 * `<script>` at the bottom of `_legacy/emmi.html`. If the widget has
 * finished loading (its FAB, `#voiceagent-widget-root`, exists), scroll to
 * it and pulse-glow it; otherwise fall back to the contacts page, since
 * there's nothing on this page yet worth scrolling to.
 */
function useEmmiWidgetTrigger(lang: Lang): () => void {
  return useCallback(() => {
    const root = document.getElementById('voiceagent-widget-root')
    if (!root) {
      window.location.href = localePath(lang, 'contacts')
      return
    }
    root.scrollIntoView({ behavior: 'smooth', block: 'end' })
    root.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease'
    root.style.transform = 'scale(1.18)'
    root.style.filter = 'drop-shadow(0 0 24px rgba(103, 232, 249, 0.9))'
    window.setTimeout(() => {
      root.style.transform = 'scale(1)'
      window.setTimeout(() => {
        root.style.filter = ''
      }, 600)
    }, 600)
  }, [lang])
}

export default function Emmi() {
  const lang = useLang()
  const openWidget = useEmmiWidgetTrigger(lang)

  // Client-only, and only on this page. Guards against double-injection on
  // repeat visits within the same SPA session (back/forward, or navigating
  // away and back never unmounts the <script> tag itself) by checking for
  // the loader's own src first.
  useEffect(() => {
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return
    const script = document.createElement('script')
    script.src = WIDGET_SRC
    script.dataset.agentId = WIDGET_AGENT_ID
    script.defer = true
    document.body.appendChild(script)
  }, [])

  return (
    <>
      <Seo page="emmi" lang={lang} jsonLd={[softwareApplicationJsonLd('emmi', lang)]} />

      <ProductPage
        scene={<ConvergenceScene />}
        poster={<div className="scene-poster scene-poster--convergence" aria-hidden="true" />}
        camera={CONVERGENCE_CAMERA}
        accent={ACCENT}
        hero={{
          label: t(lang, 'emmi.hero.label'),
          title: t(lang, 'emmi.hero.title'),
          sub: t(lang, 'emmi.hero.sub'),
          ctas: (
            <>
              <MagneticButton variant="primary" href={localePath(lang, 'contacts')}>
                {t(lang, 'emmi.hero.cta1')}
              </MagneticButton>
              <MagneticButton as="button" variant="ghost" onClick={openWidget}>
                {t(lang, 'emmi.hero.cta2')}
              </MagneticButton>
            </>
          ),
        }}
        chapters={
          <>
            <Channels lang={lang} />
            <Capabilities lang={lang} />
            <Guarantees lang={lang} />
            <FinalCta lang={lang} onTryWidget={openWidget} />
          </>
        }
      />
    </>
  )
}
