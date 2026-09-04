// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { EmmiWidget, WIDGET_AGENT_ID, WIDGET_SRC } from '../src/components/EmmiWidget'

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  document.querySelectorAll('script[src*="widget.js"], #voiceagent-widget-root').forEach((n) => n.remove())
})

const wait = (ms: number) => act(async () => new Promise((r) => setTimeout(r, ms)))
const scriptTag = () => document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`)

describe('EmmiWidget', () => {
  it('injects the loader once the page has loaded, not before', async () => {
    await act(async () => root.render(<EmmiWidget />))
    expect(scriptTag(), 'must not compete with the critical path').toBeNull()

    if (document.readyState !== 'complete') window.dispatchEvent(new Event('load'))
    await wait(400)
    const script = scriptTag()
    expect(script).not.toBeNull()
    expect(script!.dataset.agentId).toBe(WIDGET_AGENT_ID)
    expect(document.querySelectorAll(`script[src="${WIDGET_SRC}"]`).length).toBe(1)
  })

  it('removes the loader and the FAB root on unmount', async () => {
    await act(async () => root.render(<EmmiWidget />))
    if (document.readyState !== 'complete') window.dispatchEvent(new Event('load'))
    await wait(400)
    // Simulate what the hosted loader appends to <body>.
    const fab = document.createElement('div')
    fab.id = 'voiceagent-widget-root'
    document.body.append(fab)

    await act(async () => root.unmount())
    expect(scriptTag()).toBeNull()
    expect(document.getElementById('voiceagent-widget-root')).toBeNull()
    root = createRoot(host) // afterEach unmounts again; give it a fresh root
  })
})
