import { Canvas, type CanvasProps } from '@react-three/fiber'
import { createContext, Suspense, useContext, type ReactNode } from 'react'
import type { GraphicsTier } from './graphicsTier'

export type SceneTier = Exclude<GraphicsTier, 'static'>

const SceneTierContext = createContext<SceneTier>('lite')

/**
 * Reads the resolved tier ('high' | 'lite') from inside a scene. Only ever
 * has a real value inside a `<SceneCanvas>`'s children — the provider lives
 * inside the Canvas this module mounts, since `SceneCanvas` never renders
 * this module at all for the 'static' tier.
 */
export function useSceneTier(): SceneTier {
  return useContext(SceneTierContext)
}

type SceneCanvasInnerProps = {
  tier: SceneTier
  camera?: CanvasProps['camera']
  dpr: CanvasProps['dpr']
  frameloop: CanvasProps['frameloop']
  children?: ReactNode
}

/**
 * The actual R3F Canvas mount point, deliberately split into its own
 * module (and therefore its own build chunk): `SceneCanvas` only ever
 * reaches this file through `React.lazy`, never a static import, so
 * `three`/`@react-three/fiber` are downloaded lazily, on demand — the main
 * bundle never pays for them.
 *
 * The Suspense boundary belongs here, not in `SceneCanvas`: it sits inside
 * Canvas's own React root, so it can catch suspensions thrown by
 * `children` (a lazily-imported scene component, `useLoader` texture/model
 * loads, etc.). A boundary placed outside Canvas, wrapping this component,
 * cannot catch those — Canvas reconciles its subtree through its own root,
 * separate from the DOM tree's.
 */
export function SceneCanvasInner({ tier, camera, dpr, frameloop, children }: SceneCanvasInnerProps) {
  return (
    <Canvas camera={camera} dpr={dpr} frameloop={frameloop}>
      <SceneTierContext.Provider value={tier}>
        <Suspense fallback={null}>{children}</Suspense>
      </SceneTierContext.Provider>
    </Canvas>
  )
}
