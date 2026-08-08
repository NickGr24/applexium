import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './styles/tokens.css'
import './styles/fonts.css'
import './styles/global.css'
import './styles/components.css'

// dist собран flat (emmi.html, en.html, ...), так что старые проиндексированные
// ссылки вроде /projects.html продолжают работать — GitHub Pages отдаёт их из
// тех же файлов, что и чистые /projects.
//
// Это ДОЛЖНО выполняться здесь, на верхнем уровне модуля, до вызова
// ViteReactSSG(...) ниже — не внутри её setup-колбэка. ViteReactSSG создаёт
// браузерный роутер (createBrowserRouter) синхронно внутри своего
// createRoot(), ДО того как await-ит колбэк: роутер читает window.location
// в момент создания и запоминает результат матчинга на весь свой жизненный
// цикл. history.replaceState() не эмитит popstate, поэтому уже созданный
// роутер никогда не узнаёт, что URL поменялся — если снимать .html внутри
// колбэка, роутер успевает зафиксировать несовпадающий путь (/projects.html
// не матчит ни один маршрут) и потом гидратируется в это несовпадение,
// давая mismatch и фактический 404 поверх корректно отрендеренного SSR.
// Снимая .html до вызова ViteReactSSG, мы гарантируем, что и предварительный
// matchRoutes(), и сам createBrowserRouter() увидят уже чистый путь.
if (typeof window !== 'undefined' && location.pathname.endsWith('.html')) {
  const clean = location.pathname.replace(/(index)?\.html$/, '').replace(/\/$/, '') || '/'
  history.replaceState(null, '', clean + location.search + location.hash)
}

export const createRoot = ViteReactSSG({ routes })
