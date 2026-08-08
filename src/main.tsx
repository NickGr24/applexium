import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './styles/tokens.css'
import './styles/fonts.css'
import './styles/global.css'

export const createRoot = ViteReactSSG({ routes }, ({ isClient }) => {
  if (isClient && location.pathname.endsWith('.html')) {
    // dist собран flat (emmi.html), старые ссылки /emmi.html работают;
    // до создания роутера приводим pathname к чистому виду, чтобы он совпал с маршрутом
    const clean = location.pathname.replace(/(index)?\.html$/, '').replace(/\/$/, '') || '/'
    history.replaceState(null, '', clean + location.search + location.hash)
  }
})
