import { Outlet } from 'react-router-dom'
import { Cursor } from '../components/Cursor'
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
    </LenisProvider>
  )
}
