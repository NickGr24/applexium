// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom has no WebGL: OGL is replaced by a shape-compatible stub so the
// scene components can mount. What the tests assert on is *how often* the
// scene asks for a new renderer — i.e. whether a plain re-render tears the
// WebGL context down — not what OGL draws.
const { rendererCtor, beamsChunk } = vi.hoisted(() => ({
  rendererCtor: vi.fn(),
  beamsChunk: { imports: 0 },
}))

vi.mock('ogl', () => {
  const makeGl = () => ({
    canvas: document.createElement('canvas'),
    BLEND: 1,
    SRC_ALPHA: 2,
    ONE_MINUS_SRC_ALPHA: 3,
    ONE: 4,
    enable() {},
    blendFunc() {},
    clearColor() {},
    getExtension: () => null,
  })
  class Renderer {
    gl: ReturnType<typeof makeGl>
    constructor(opts: unknown) {
      rendererCtor(opts)
      this.gl = makeGl()
    }
    setSize() {}
    render() {}
  }
  class Program {
    uniforms: Record<string, { value: unknown }>
    constructor(_gl: unknown, opts: { uniforms: Record<string, { value: unknown }> }) {
      this.uniforms = opts.uniforms
    }
  }
  class Mesh {}
  class Triangle {
    attributes: Record<string, unknown> = { uv: {} }
  }
  class Color {
    r = 0
    g = 0
    b = 0
  }
  return { Renderer, Program, Mesh, Triangle, Color }
})

// The real chunk pulls in three.js; the stub only records that the lazy
// import was requested at all.
vi.mock('../src/scenes/BeamsRBCanvas', () => {
  beamsChunk.imports++
  return { BeamsRBCanvas: () => null }
})

import { BeamsRBBackground } from '../src/scenes/BeamsRBBackground'
import { GalaxyRBCanvas } from '../src/scenes/GalaxyRBCanvas'

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 16))
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

const render = (el: React.ReactElement) => act(async () => root.render(el))
const wait = (ms: number) => act(async () => new Promise((r) => setTimeout(r, ms)))

describe('GalaxyRBCanvas', () => {
  it('keeps one WebGL renderer across pause/resume re-renders', async () => {
    rendererCtor.mockClear()
    await render(<GalaxyRBCanvas paused={false} />)
    expect(rendererCtor).toHaveBeenCalledTimes(1)

    await render(<GalaxyRBCanvas paused={true} />)
    await render(<GalaxyRBCanvas paused={false} />)
    expect(rendererCtor, 'a paused toggle must not rebuild the WebGL context').toHaveBeenCalledTimes(1)
  })
})

describe('BeamsRBBackground', () => {
  // Order matters: the lazy chunk module is cached once imported, so the
  // 'lite' case has to run before anything legitimately imports it.
  it("never requests the three.js chunk on the 'lite' tier", async () => {
    await render(<BeamsRBBackground tier="lite" poster={<div data-poster />} />)
    if (document.readyState !== 'complete') window.dispatchEvent(new Event('load'))
    await wait(400) // past the 200ms no-requestIdleCallback fallback the gate uses
    expect(beamsChunk.imports).toBe(0)
    expect(host.querySelector('[data-poster]')).not.toBeNull()
  })

  it("still mounts the canvas on the 'high' tier", async () => {
    await render(<BeamsRBBackground tier="high" poster={<div data-poster />} />)
    if (document.readyState !== 'complete') window.dispatchEvent(new Event('load'))
    await wait(400)
    expect(beamsChunk.imports).toBe(1)
  })
})
