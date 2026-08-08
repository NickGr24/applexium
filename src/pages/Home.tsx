import { lazy } from 'react'
import { MagneticButton } from '../components/MagneticButton'
import { MonoLabel } from '../components/MonoLabel'
import { RevealText } from '../components/RevealText'
import { Section } from '../components/Section'
import { Seo } from '../components/Seo'
import { SplitHeading } from '../components/SplitHeading'
import { SpotlightCard } from '../components/SpotlightCard'
import { StatCount } from '../components/StatCount'
import { useLang } from '../i18n'
import { SceneCanvas } from '../scenes/SceneCanvas'
import { organizationJsonLd, webSiteJsonLd } from '../site/jsonld'

// Dynamic import so `@react-three/fiber`/`three` never reach this page's own
// chunk — see TestCube.tsx and SceneCanvasInner.tsx for why.
const TestCube = lazy(() => import('../scenes/TestCube').then((m) => ({ default: m.TestCube })))

export default function Home() {
  const lang = useLang()
  return (
    <>
      <Seo page="home" lang={lang} jsonLd={[organizationJsonLd(lang), webSiteJsonLd(lang)]} />

      {/* DEV SHOWCASE — удалить в Task 14 */}
      <section
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4rem',
          paddingBlock: '10rem 6rem',
        }}
      >
        <MonoLabel index="01">MOTION PRIMITIVES</MonoLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'var(--font-display)' }}>
          <SplitHeading as="h1">Applexium construiește produse digitale</SplitHeading>
          <SplitHeading as="h2">care se mișcă altfel decât toate celelalte</SplitHeading>
        </div>

        <RevealText>
          <p style={{ maxWidth: '60ch', color: 'var(--ink-dim)', fontSize: '1.1rem' }}>
            Acest paragraf verifică RevealText independent de restul componentelor: intră cu un
            fade discret și o ușoară ridicare pe verticală atunci când ajunge în viewport.
          </p>
        </RevealText>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <MagneticButton variant="primary" href="#produse">
            Vezi proiectele
          </MagneticButton>
          <MagneticButton variant="ghost" href="#contacte">
            Contactează-ne
          </MagneticButton>
          <MagneticButton variant="ghost" as="button" onClick={() => console.log('magnetic button clicked')}>
            Buton nativ
          </MagneticButton>
        </div>

        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <StatCount value={12} suffix="+" label="proiecte livrate" />
          <StatCount value={8} label="ani experiență" />
          <StatCount value={97} suffix="%" label="clienți mulțumiți" />
        </div>
      </section>

      <Section label="SPOTLIGHT" index="02" title="Cărți care reacționează la cursor">
        <div className="spotlight-grid">
          <SpotlightCard
            icon={<span aria-hidden="true">◆</span>}
            title="Produse digitale"
            text="De la idee la lansare: cercetare, design de interacțiune și cod de producție sub același acoperiș."
          />
          <SpotlightCard
            icon={<span aria-hidden="true">▲</span>}
            title="Automatizări AI"
            text="Agenți vocali și fluxuri automatizate care preiau munca repetitivă din echipele noastre partenere."
          />
          <SpotlightCard
            icon={<span aria-hidden="true">●</span>}
            title="Platforme legale"
            text="Legalia și Precedentia digitalizează procese juridice complexe pentru piața din Moldova."
          />
          <SpotlightCard
            title="Fără icon"
            text="A patra carte verifică layout-ul grilei fără icon — titlul și textul rămân aliniate corect."
          />
        </div>
      </Section>

      <Section
        label="GRAPHICS TIER"
        index="03"
        title="Un cub care nu se montează decât atunci când ajunge la tine"
      >
        <SceneCanvas
          className="scene-canvas-demo"
          poster={<div className="scene-canvas-demo__poster" aria-hidden="true" />}
          camera={{ position: [0, 0, 4] }}
        >
          <TestCube />
        </SceneCanvas>
      </Section>
    </>
  )
}
