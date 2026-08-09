import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  type InstancedMesh,
  type Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  QuadraticBezierCurve3,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
} from 'three'
import { CONVERGENCE_CAMERA } from './convergenceCamera'
import { frameLerp } from './frameLerp'
import { useSceneTier, type SceneTier } from './SceneCanvasInner'

/* Emmi's hero scene: five particle streams, one per channel, converging on
 * a single pulsing core. Ported from `_legacy/scene-convergence.js`, which
 * drew this with a plain 2D canvas (pre-rendered glow sprites, additive
 * blending, quadratic-bezier particle paths) rather than three.js — see
 * that file's own header comment for why (dropping a ~600KB CDN dependency
 * the old shared scene needed). The redesign already pays for three/R3F on
 * every scene page, so that trade no longer applies; this version keeps the
 * legacy's math (same bezier curves, same per-stream wobble/fade formulas,
 * same channel colours — dialer green, web-widget white, Instagram's pink
 * fading to violet, WhatsApp green, Telegram blue) and renders it with
 * camera-facing instanced sprites instead of canvas `drawImage` calls.
 *
 * This scene owns its whole timeline — no scroll progress comes in from the
 * page, it just runs. `<ConvergenceScene />` takes no props.
 */

/** Matches the page background — same FOG_COLOR every scene in this
 * directory shares (`BeamsScene.tsx`, `GalaxyScene.tsx`): the rebrand moved
 * the dark background from #071116 (still visible as
 * `--em-deeper` in the legacy Emmi page) to #04060d, and fog has to agree
 * with the canvas backdrop or the scene shows a seam against it. */
const FOG_COLOR = '#04060d'

/** The core's colour — legacy `scene-convergence.js`'s `coreSprite`, built
 * from `sprite([120, 225, 250])`. */
const CORE_COLOR = '#78e1fa'
// Small on purpose: the legacy core is a soft diffuse blur, not a solid
// disc. A big flat sphere reads as a "marble" no matter the opacity — it's
// `Bloom`'s blur radius on `high`, not the geometry, that has to do the
// spreading, the same way it does for every particle below.
const CORE_OUTER_RADIUS = 0.7
const CORE_INNER_RADIUS = 0.22

/**
 * The five channel streams, straight out of the legacy `STREAMS` array:
 * colour (and, for Instagram, the `halo` its glow sprite fades to at the
 * edge), the emitter position in viewport fractions, and `bend` — how hard
 * the stream's bezier control point is pushed off the straight chord to the
 * core, and which side. Converted to world space by `toWorld` below.
 */
type StreamDef = {
  color: [number, number, number]
  halo?: [number, number, number]
  from: [number, number]
  bend: number
}

const STREAMS: StreamDef[] = [
  { color: [52, 199, 89], from: [-0.08, 0.1], bend: -0.55 }, // phone dialer
  { color: [217, 228, 234], from: [0.5, -0.14], bend: 0.0 }, // web widget
  { color: [221, 42, 123], halo: [129, 52, 175], from: [-0.1, 0.62], bend: 0.5 }, // Instagram
  { color: [37, 211, 102], from: [1.1, 0.58], bend: -0.5 }, // WhatsApp
  { color: [42, 171, 238], from: [1.08, 0.08], bend: 0.55 }, // Telegram
]

/** Legacy `CORE = [0.5, 0.42]` — the point every stream converges on. It is
 * also the world origin here; every emitter is placed relative to it. */
const CORE_FRACTION: [number, number] = [0.5, 0.42]
/** How many world units a full viewport width/height fraction spans. Picked
 * so the streams' legacy off-canvas emitters (fractions below 0 or above 1,
 * e.g. WhatsApp's `from: [1.1, 0.58]`) still land just outside `CONVERGENCE_
 * CAMERA`'s frame — matching the original, where those streams visibly
 * enter from off-screen rather than from a visible edge. */
const WORLD_WIDTH = 11
const WORLD_HEIGHT = 6.4

const PARTICLES_HIGH = 110 // legacy PER_STREAM, unchanged
const PARTICLES_LITE = 55 // half, per the lite-tier particle budget

function toWorld([fx, fy]: [number, number]): Vector3 {
  // Screen fractions are y-down; world space is y-up, hence the flip.
  return new Vector3((fx - CORE_FRACTION[0]) * WORLD_WIDTH, -(fy - CORE_FRACTION[1]) * WORLD_HEIGHT, 0)
}

/**
 * One particle's simulation state — legacy `spawn()`. `zJitter` has no
 * legacy counterpart: the original streams are flat (a 2D canvas has no
 * choice), but this scene has real depth to spend, so each particle drifts
 * a little off the emitter/core plane and settles back to it by journey's
 * end (`* envelope` in the position update below), the same way the wobble
 * is pinned at both ends.
 */
type Particle = {
  t: number
  speed: number
  phase: number
  freq: number
  amp: number
  size: number
  zJitter: number
}

function spawnParticle(t: number): Particle {
  return {
    t,
    speed: 0.05 + Math.random() * 0.06,
    phase: Math.random() * Math.PI * 2,
    freq: 5 + Math.random() * 7,
    amp: 0.1 + Math.random() * 0.3,
    // Small: the legacy streams are fine twinkling dust, not glowing
    // marbles — `Bloom` (high tier) is what gives each one a soft point of
    // light, the same restraint as the core above.
    size: 0.045 + Math.random() * 0.09,
    zJitter: (Math.random() - 0.5) * 0.6,
  }
}

/**
 * The curve a stream's particles ride, plus the fixed normal their wobble
 * and bend both use — legacy computed `nx, ny` once per stream from the
 * emitter→core chord, not per-point from the curve's tangent, so a particle
 * wobbles side-to-side across the curve rather than corkscrewing along it.
 * Reproduced exactly here: `QuadraticBezierCurve3`'s `v1` is the same
 * chord-midpoint-plus-normal-times-bend control point the legacy code built
 * by hand.
 */
function buildStreamCurve(emitter: Vector3, core: Vector3, bend: number) {
  const chord = new Vector3().subVectors(core, emitter)
  const len = chord.length() || 1
  const normal = new Vector3(-chord.y, chord.x, 0).normalize()
  const control = new Vector3()
    .addVectors(emitter, core)
    .multiplyScalar(0.5)
    .addScaledVector(normal, bend * len * 0.28)
  return { curve: new QuadraticBezierCurve3(emitter.clone(), control, core.clone()), normal }
}

/** Builds one channel's glow sprite: white core, the stream's colour, then
 * its halo (or the same colour again, for streams without one — legacy
 * `var h = halo || rgb`), fading to transparent. Baking the two-tone
 * gradient into the texture, the way legacy `sprite()` did, is what lets
 * Instagram's pink-to-violet glow render without a per-particle shader —
 * the instance's own colour (see `Stream` below) only ever scales this
 * texture's brightness for the fade envelope, it never re-tints it. */
function buildSpriteTexture(color: [number, number, number], halo: [number, number, number]) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const rgba = (rgb: [number, number, number], a: number) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
  gradient.addColorStop(0.25, rgba(color, 0.75))
  gradient.addColorStop(0.6, rgba(halo, 0.35))
  gradient.addColorStop(1, rgba(halo, 0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

type StreamProps = {
  def: StreamDef
  count: number
  geometry: PlaneGeometry
}

/**
 * One channel: a bezier-curved run of camera-facing instanced sprites. A
 * single `InstancedMesh` per stream (not per particle — the whole point of
 * instancing) whose per-instance matrix and colour are rewritten every
 * frame from the particle sim, mirroring legacy `draw()`'s per-particle
 * loop almost line for line.
 */
function Stream({ def, count, geometry }: StreamProps) {
  const emitter = useMemo(() => toWorld(def.from), [def])
  const { curve, normal } = useMemo(
    () => buildStreamCurve(emitter, new Vector3(0, 0, 0), def.bend),
    [emitter, def.bend],
  )

  const texture = useMemo(() => buildSpriteTexture(def.color, def.halo ?? def.color), [def])
  useEffect(() => () => texture?.dispose(), [texture])

  const material = useMemo(() => {
    if (!texture) return null
    return new MeshBasicMaterial({
      map: texture,
      // Per-instance colour (via `mesh.setColorAt`, below) carries the fade
      // envelope. Deliberately *not* `vertexColors: true` — that also flips
      // on `USE_COLOR` in the *vertex* shader, which multiplies vColor by a
      // per-vertex `color` attribute our geometry doesn't have; an unbound
      // attribute reads as (0,0,0) in WebGL and zeroes every particle out
      // before the instance-colour multiply ever runs. Leaving this false
      // still lights up `USE_INSTANCING_COLOR` from `instanceColor` alone.
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false, // additive glow, not a lit surface — stays punchy
      fog: false, // a screen-space glow in the legacy original; fog would just dim it inconsistently by depth
    })
  }, [texture])
  useEffect(() => () => material?.dispose(), [material])

  const meshRef = useRef<InstancedMesh>(null)
  const dummy = useRef(new Object3D()).current
  const point = useRef(new Vector3()).current
  const scratchColor = useRef(new Color()).current
  const particlesRef = useRef<Particle[] | null>(null)
  if (!particlesRef.current || particlesRef.current.length !== count) {
    particlesRef.current = Array.from({ length: count }, () => spawnParticle(Math.random()))
  }

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const particles = particlesRef.current
    if (!particles) return
    const elapsed = state.clock.elapsedTime
    dummy.quaternion.copy(state.camera.quaternion) // billboard: every sprite faces the camera the same way

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i]
      p.t += p.speed * delta
      if (p.t >= 1) {
        p = spawnParticle(0)
        particles[i] = p
      }
      const t = p.t

      curve.getPoint(t, point)
      // Wobble pinned at both ends (`envelope`), so streams leave the
      // emitter and arrive at the core cleanly — legacy's own comment.
      const envelope = Math.sin(Math.PI * t)
      const wobble = Math.sin(p.phase + t * p.freq + elapsed * 1.6) * p.amp * envelope

      dummy.position.set(point.x + normal.x * wobble, point.y + normal.y * wobble, point.z + p.zJitter * envelope)
      const scale = p.size * (1 - t * 0.35)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      const fade = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 0.55 + t * 0.45
      scratchColor.setScalar(fade * 0.9) // grayscale: only dims the baked-in sprite colour
      mesh.setColorAt(i, scratchColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  if (!material) return null

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
}

/**
 * The core every stream dies into — legacy drew two overlapping copies of
 * its glow sprite (a wide dim one, a small brighter one). Reproduced as two
 * nested spheres so `high` gets to wrap the whole thing in `Bloom`; `lite`
 * skips the post-processing pass but still reads as a glow from the two
 * layers alone, just a flatter one.
 */
function Core({ tier }: { tier: SceneTier }) {
  const outerRef = useRef<Mesh>(null)
  const innerRef = useRef<Mesh>(null)

  useFrame((state) => {
    // Legacy `breath = 1 + 0.1 * Math.sin(time * 0.9)`.
    const breath = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 0.9)
    outerRef.current?.scale.setScalar(breath)
    innerRef.current?.scale.setScalar(breath)
  })

  const segments = tier === 'high' ? 32 : 16
  const geometries = useMemo(
    () => ({
      outer: new SphereGeometry(CORE_OUTER_RADIUS, segments, segments),
      inner: new SphereGeometry(CORE_INNER_RADIUS, segments, segments),
    }),
    [segments],
  )
  useEffect(
    () => () => {
      geometries.outer.dispose()
      geometries.inner.dispose()
    },
    [geometries],
  )
  const materials = useMemo(
    () => ({
      outer: new MeshBasicMaterial({
        color: CORE_COLOR,
        transparent: true,
        opacity: 0.13,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
      }),
      inner: new MeshBasicMaterial({
        color: CORE_COLOR,
        transparent: true,
        opacity: 0.85,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
      }),
    }),
    [],
  )
  useEffect(
    () => () => {
      materials.outer.dispose()
      materials.inner.dispose()
    },
    [materials],
  )

  return (
    <group>
      <mesh ref={outerRef} geometry={geometries.outer} material={materials.outer} />
      <mesh ref={innerRef} geometry={geometries.inner} material={materials.inner} />
    </group>
  )
}

/**
 * Cursor parallax, `high` tier only — same shape as `BeamsScene`'s and
 * `GalaxyScene`'s own `CameraRig`. The camera always settles back on
 * `CONVERGENCE_CAMERA.position`, looking at the core at the origin.
 */
function CameraRig({ parallax }: { parallax: boolean }) {
  useFrame((state, delta) => {
    const { camera, pointer } = state
    const [x0, y0, z0] = CONVERGENCE_CAMERA.position
    const targetX = parallax ? x0 + pointer.x * 0.6 : x0
    const targetY = parallax ? y0 + pointer.y * 0.35 : y0

    const k = frameLerp(0.05, delta)
    camera.position.x += (targetX - camera.position.x) * k
    camera.position.y += (targetY - camera.position.y) * k
    camera.position.z = z0
    camera.lookAt(0, 0, 0)
  })

  return null
}

/**
 * Renders inside a `<SceneCanvas camera={CONVERGENCE_CAMERA}>`. Takes no
 * props — the whole scene is driven by its own clock.
 */
export function ConvergenceScene() {
  const tier = useSceneTier()
  const high = tier === 'high'
  const count = high ? PARTICLES_HIGH : PARTICLES_LITE

  // One quad, shared by every stream's InstancedMesh — five streams would
  // otherwise mean five separate 4-vertex geometries for no reason.
  const spriteQuad = useMemo(() => new PlaneGeometry(1, 1), [])
  useEffect(() => () => spriteQuad.dispose(), [spriteQuad])

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.035]} />

      {/* Every material in this scene is an unlit, additive MeshBasicMaterial
          — glow shapes standing in for the legacy canvas's alpha sprites —
          so there is nothing here for a light to illuminate. */}

      {STREAMS.map((def, index) => (
        <Stream key={index} def={def} count={count} geometry={spriteQuad} />
      ))}
      <Core tier={tier} />

      <CameraRig parallax={high} />

      {high && (
        <EffectComposer>
          <Bloom intensity={1.4} luminanceThreshold={0.1} mipmapBlur radius={0.6} />
        </EffectComposer>
      )}
    </>
  )
}
