import { MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  type Group,
  type Material,
  type Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { HERO_CAMERA } from './heroCamera'
import { useSceneTier, type SceneTier } from './SceneCanvasInner'

/* The hero world: an arcade standing in still water, ported from the legacy
 * site's `_legacy/scene.js` (imperative three.js) to declarative R3F.
 *
 * Everything is primitives — an arch is a half-torus on two cylinders, the
 * water is one plane, the "planet" is a sphere. Nothing is downloaded beyond
 * the libraries, which is what lets the scene start the moment its chunk
 * lands. Geometry values, light positions and colours are the legacy ones;
 * the two deliberate departures are the fog colour (the rebrand moved the
 * page background from #071116 to #04060d, and fog has to match the backdrop
 * or the horizon shows a seam) and the camera, which no longer drifts in
 * place but dollies down the colonnade on scroll.
 */

/** Water level. Everything in the scene is placed relative to it. */
const WATER_Y = -2.6
/** Matches the page background — see the note above about the seam. */
const FOG_COLOR = '#04060d'

/** Camera dolly: from outside the colonnade to deep between the arch rows.
 * The near end has to agree with `HERO_CAMERA` — z here, and `WATER_Y +
 * CAMERA_Y_NEAR` for its y — or the first frame after the canvas mounts jumps
 * from the camera the caller set up to the one this rig wants. */
const CAMERA_Z_NEAR = HERO_CAMERA.position[2]
const CAMERA_Z_FAR = -18
/** Eye height *above the water*, not above the origin — 1.2 is the legacy
 * camera's 1.15, and it is what makes the arches tower over the frame the way
 * they do on the live site. Read as world Y the same numbers would sit almost
 * four units up, looking down on a colonnade instead of standing in it. */
const CAMERA_Y_NEAR = 1.2
const CAMERA_Y_FAR = 0.4
/** How far ahead of the camera the look-at target sits, and how far above it.
 * The lift is what keeps the horizon just below the middle of the frame. */
const LOOK_AHEAD = 21
const LOOK_LIFT = 0.7

/** The 9 arch pairs, straight out of the legacy loop: each step back is
 * wider apart, further away and slightly larger, which is what gives the
 * colonnade its false-perspective stretch. Module scope, not `useMemo` —
 * the values never depend on props, so once per module beats once per mount. */
const ARCH_PAIRS = Array.from({ length: 9 }, (_, k) => ({
  x: 7.4 + k * 0.5,
  z: -k * 4.6 - 2,
  scale: 1 + k * 0.05,
}))

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * One arch: a half-torus resting on two cylinders. The legacy version baked
 * `scale` into every radius; here the geometry is the unit arch and the group
 * carries the scale. `arcGeometry`/`legGeometry` are created once (see
 * `useArchGeometries` below) and passed down as props rather than declared
 * inline as JSX — an inline `<torusGeometry>`/`<cylinderGeometry>` makes R3F
 * construct a fresh instance per mesh, which would mean 54 geometries (18
 * arches × 3 meshes) instead of the 2 shared here. The two legs are mirror
 * images by *position*, not by shape, so they reuse the same cylinder
 * geometry too.
 */
type ArchProps = {
  x: number
  z: number
  scale: number
  material: Material
  arcGeometry: BufferGeometry
  legGeometry: BufferGeometry
}

function Arch({ x, z, scale, material, arcGeometry, legGeometry }: ArchProps) {
  return (
    <group position={[x, WATER_Y + 2.2 * scale, z]} scale={scale}>
      <mesh material={material} geometry={arcGeometry} position={[0, 2.2, 0]} />
      <mesh material={material} geometry={legGeometry} position={[-1.25, 0, 0]} />
      <mesh material={material} geometry={legGeometry} position={[1.25, 0, 0]} />
    </group>
  )
}

/** Both rows of the colonnade, mirrored across x. */
function Arcade({
  material,
  arcGeometry,
  legGeometry,
}: {
  material: Material
  arcGeometry: BufferGeometry
  legGeometry: BufferGeometry
}) {
  return (
    <group>
      {ARCH_PAIRS.map(({ x, z, scale }) => (
        <group key={z}>
          <Arch
            x={-x}
            z={z}
            scale={scale}
            material={material}
            arcGeometry={arcGeometry}
            legGeometry={legGeometry}
          />
          <Arch
            x={x}
            z={z}
            scale={scale}
            material={material}
            arcGeometry={arcGeometry}
            legGeometry={legGeometry}
          />
        </group>
      ))}
    </group>
  )
}

/** The two geometries every arch mesh draws from: one half-torus for the
 * curve, one cylinder for both legs. Built once per mount (`useMemo`, empty
 * deps — same reasoning as the `stone` material below) and disposed on
 * unmount, exactly like the module's other GPU resources. */
function useArchGeometries() {
  const geometries = useMemo(
    () => ({
      arc: new TorusGeometry(1.25, 0.22, 10, 26, Math.PI),
      leg: new CylinderGeometry(0.22, 0.22, 4.4, 12),
    }),
    [],
  )
  useEffect(
    () => () => {
      geometries.arc.dispose()
      geometries.leg.dispose()
    },
    [geometries],
  )
  return geometries
}

/** A soft round dot. Without it points are drawn as squares, which nobody
 * notices at 3px and everybody notices when the dolly brushes past a mote. */
function useDotTexture() {
  const texture = useMemo(() => {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/**
 * Dust motes hanging over the water. The legacy field was 30 deep because the
 * legacy camera never moved; this one is 56 deep so the camera still has
 * particles around it at the end of the dolly.
 */
function Motes({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = WATER_Y + Math.random() * 11
      positions[i * 3 + 2] = (Math.random() - 0.5) * 56 - 12
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    return geo
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  const dot = useDotTexture()

  return (
    <points geometry={geometry}>
      {/* depthWrite off: transparent points that write depth punch holes in
          whatever is drawn after them. */}
      <pointsMaterial
        map={dot}
        color="#bfe6ff"
        size={0.045}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/**
 * A soft warm gradient, painted once into a canvas: a bright narrow core with
 * a wide halo. Vertically it peaks at the water line and reaches much further
 * down (into the reflection) than up, which is the shape the light column has
 * on the live site.
 */
function useShaftTexture() {
  const texture = useMemo(() => {
    const w = 64
    const h = 256
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const image = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      // v = 0 at the bottom of the quad: plane UVs start bottom-left.
      const v = y / (h - 1)
      const above = v > 0.5
      const along = Math.exp(-(((v - 0.5) / (above ? 0.11 : 0.18)) ** 2))
      const taper = Math.max(0, 1 - Math.abs(2 * v - 1) ** 3)
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1) - 0.5
        const core = Math.exp(-((u / 0.035) ** 2))
        const halo = 0.3 * Math.exp(-((u / 0.2) ** 2))
        const i = (y * w + x) * 4
        image.data[i] = 255
        image.data[i + 1] = 217 + 38 * core // #ffd9a8 in the halo, white in the core
        image.data[i + 2] = 168 + 87 * core
        image.data[i + 3] = Math.min(0.72, (core + halo) * along * taper) * 255
      }
    }
    ctx.putImageData(image, 0, 0)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/** How far down the arcade the doorway stays, ahead of the camera. At rest
 * this puts the warm light on exactly the legacy z = -22. */
const DOORWAY_DISTANCE = 36
const SHAFT_HEIGHT = 16

/**
 * The far end of the arcade: the warm point light that turns a colonnade into
 * somewhere you could walk, and the column of light standing in the water
 * underneath it — the light's visible body, since a point light on its own
 * only lights stone.
 *
 * The column takes two liberties, both to land on the reference. It ignores
 * fog: it is the thing the camera travels towards, so the mist has to part
 * for it rather than swallow it. And it ignores the depth buffer, so the half
 * below the water line paints *over* the surface as the column's reflection —
 * at x = 0, with the camera never straying a unit off centre and the arches
 * seven units out, there is nothing it can wrongly cover.
 *
 * The whole doorway holds its distance from the camera instead of standing at
 * a fixed z. Parked, the dolly ends four units short of the light, which
 * floods the water with warm grey and blows a 64px-wide texture up across
 * half the frame. Travelling with the camera it stays the size and brightness
 * it has at rest: the light at the end you never quite reach, which is the
 * better story anyway.
 */
function Doorway() {
  const texture = useShaftTexture()
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (ref.current) ref.current.position.z = state.camera.position.z - DOORWAY_DISTANCE
  })

  return (
    <group ref={ref} position={[0, 0, -DOORWAY_DISTANCE]}>
      <pointLight color="#ffd9a8" intensity={300} distance={60} position={[0, 1.4, 0]} />
      {texture && (
        <mesh position={[0, WATER_Y, -4]}>
          <planeGeometry args={[3.6, SHAFT_HEIGHT]} />
          <meshBasicMaterial
            map={texture}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      )}
    </group>
  )
}

/** The glass planet hanging over the water, right of centre. */
function Orb({ tier }: { tier: SceneTier }) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    mesh.position.y = WATER_Y + 2.5 + Math.sin(t * 0.55) * 0.2
    mesh.rotation.y = t * 0.16
  })

  return (
    <mesh ref={ref} position={[3.1, WATER_Y + 2.5, -4.5]}>
      <sphereGeometry args={[1.15, tier === 'high' ? 48 : 24, tier === 'high' ? 48 : 24]} />
      {tier === 'high' ? (
        <meshPhysicalMaterial
          // Deeper and less transmissive than the legacy orb: bloom lifts
          // everything above 0.2 luminance, and the original values under it
          // read as a white bauble rather than a planet.
          color="#4d719f"
          roughness={0.06}
          metalness={0.1}
          transmission={0.22}
          thickness={2.2}
          ior={1.5}
          iridescence={0.5}
          iridescenceIOR={1.9}
          iridescenceThicknessRange={[120, 560]}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      ) : (
        // Transmission needs its own render pass per frame — far too much for
        // the tier that exists because the device is slow.
        <meshStandardMaterial color="#eaf6ff" roughness={0.14} metalness={0.2} />
      )}
    </mesh>
  )
}

/** Still water. `high` gets a real (blurred) reflection; `lite` gets the
 * legacy near-mirror metal, plus the dimmed upside-down arcade underneath. */
function Water({ tier }: { tier: SceneTier }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y}>
      <planeGeometry args={[120, 120]} />
      {tier === 'high' ? (
        <MeshReflectorMaterial
          resolution={512}
          blur={[300, 60]}
          mixBlur={1}
          mixStrength={4}
          mixContrast={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          // The reflection is injected as a multiplier on the base colour and
          // is lit like any other surface, so the albedo has to stay this
          // dark: raise it and the warm light at the end of the arcade turns
          // the whole surface into sand rather than water at night.
          color="#16202e"
          roughness={0.35}
          metalness={0.55}
        />
      ) : (
        // Slightly transparent, unlike the legacy original: the mirrored
        // arcade lives below this plane, and an opaque water surface hides it
        // completely — which is exactly what happened on the old site.
        <meshStandardMaterial
          color="#060b14"
          roughness={0.08}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      )}
    </mesh>
  )
}

/**
 * Drives the camera: a scroll dolly straight down the middle of the
 * colonnade, with cursor parallax layered on top. The world never moves —
 * rotating the scene instead would betray it as an object on a turntable.
 */
function CameraRig({
  progressRef,
  parallax,
}: {
  progressRef: MutableRefObject<number>
  parallax: boolean
}) {
  useFrame((state) => {
    const { camera, pointer, clock } = state
    const p = Math.min(1, Math.max(0, progressRef.current))

    const z = lerp(CAMERA_Z_NEAR, CAMERA_Z_FAR, p)
    // The idle bob is the legacy drift, kept so the scene breathes while the
    // page is not being scrolled.
    const y =
      WATER_Y + lerp(CAMERA_Y_NEAR, CAMERA_Y_FAR, p) + Math.sin(clock.elapsedTime * 0.28) * 0.08

    const targetX = parallax ? pointer.x * 0.8 : 0
    const targetY = parallax ? y + pointer.y * 0.4 : y

    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    // z follows the scroll one to one — smoothing it here would fight
    // whatever smoothing the scroll driver already applies.
    camera.position.z = z
    camera.lookAt(0, y + LOOK_LIFT, z - LOOK_AHEAD)
  })

  return null
}

export type HeroWorldProps = {
  /** Hero scroll progress, 0..1. A ref, not state: it is read every frame and
   * must never cost a React render. */
  progressRef: MutableRefObject<number>
}

/**
 * Renders inside a `<SceneCanvas>`, which owns the canvas, the DPR, the
 * frameloop and the poster behind it. Camera defaults belong to the caller
 * too — see `HERO_CAMERA` for the values this scene is composed for.
 */
export function HeroWorld({ progressRef }: HeroWorldProps) {
  const tier = useSceneTier()
  const high = tier === 'high'

  const archGeometries = useArchGeometries()
  const stone = useMemo(
    () => new MeshStandardMaterial({ color: '#141c2b', roughness: 0.82, metalness: 0.05 }),
    [],
  )
  const reflectedStone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#0e1626',
        roughness: 0.9,
        transparent: true,
        opacity: 0.34,
      }),
    [],
  )
  useEffect(
    () => () => {
      stone.dispose()
      reflectedStone.dispose()
    },
    [stone, reflectedStone],
  )

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.052]} />

      <ambientLight color="#1a2536" intensity={1} />
      <pointLight color="#1FCDFF" intensity={220} distance={70} position={[-9, 6, 6]} />
      <pointLight color="#245efe" intensity={160} distance={70} position={[9, 1, 4]} />
      <pointLight color="#8a6bff" intensity={120} distance={70} position={[0, 9, -10]} />
      {/* The fourth light — the warm one at the end of the arcade — belongs
          to <Doorway>, which carries it down the colonnade with the camera. */}

      <Arcade material={stone} arcGeometry={archGeometries.arc} legGeometry={archGeometries.leg} />
      {/* The cheap reflection: the arcade mirrored on Y and dimmed. `high`
          doesn't need it — its water reflects the real thing. It reuses the
          same geometries as the arcade above, just a different material. */}
      {!high && (
        <group scale={[1, -1, 1]} position={[0, WATER_Y * 2, 0]}>
          <Arcade
            material={reflectedStone}
            arcGeometry={archGeometries.arc}
            legGeometry={archGeometries.leg}
          />
        </group>
      )}

      <Water tier={tier} />
      <Orb tier={tier} />
      <Doorway />
      <Motes count={high ? 240 : 120} />

      <CameraRig progressRef={progressRef} parallax={high} />

      {high && (
        <EffectComposer>
          {/* mipmapBlur + a short radius on purpose: the default kernel is
              wide enough that the light column's glow covers the whole lower
              half of the frame and the water stops reading as water. */}
          <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur radius={0.35} />
        </EffectComposer>
      )}
    </>
  )
}
