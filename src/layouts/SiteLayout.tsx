import { Outlet } from 'react-router-dom'
import { Cursor } from '../components/Cursor'
import { EmmiWidget } from '../components/EmmiWidget'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { LenisProvider } from '../motion/LenisProvider'
import { PageTransition } from '../motion/PageTransition'
import '../styles/layout.css'

export default function SiteLayout() {
  return (
    <LenisProvider>
      <Nav />
      <PageTransition>
        <main>
          <Outlet />
        </main>
      </PageTransition>
      <Footer />
      <Cursor />
      {/* The live Emmi agent on every page, injected after `load` — see the
          component for the timing and teardown rules. */}
      <EmmiWidget />
    </LenisProvider>
  )
}
