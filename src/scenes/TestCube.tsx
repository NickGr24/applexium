import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

/**
 * Throwaway verification scene for Task 8 — proves SceneCanvas's lazy
 * mount, IntersectionObserver gating, and reduced-motion/static fallback
 * actually work end to end. Lives in its own module so the DEV SHOWCASE
 * can `React.lazy` it instead of importing `@react-three/fiber` eagerly
 * (same reasoning as SceneCanvasInner). Delete alongside the DEV SHOWCASE
 * in Task 14.
 */
export function TestCube() {
  const ref = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.4
    ref.current.rotation.y += delta * 0.6
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={40} color="#1fcdff" />
      <mesh ref={ref}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color="#245efe" />
      </mesh>
    </>
  )
}
